// Extract the public props of exported React components at documentation build time.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import ts from 'typescript';

const read = filename => JSON.parse(readFileSync(filename, 'utf8'));
const builtInLocales = fileURLToPath(new URL('./locales', import.meta.url));

export function readLocales(overlays = []) {
  const result = { ru: {}, en: {} };
  for (const directory of [builtInLocales, ...overlays]) {
    const ru = read(path.join(directory, 'ru.json'));
    const en = read(path.join(directory, 'en.json'));
    for (const key of new Set([...Object.keys(ru), ...Object.keys(en)])) {
      for (const [locale, messages] of Object.entries({ ru, en })) {
        if (typeof messages[key] !== 'string' || !messages[key].trim())
          throw new Error(`Missing ${locale} translation for ${key} in ${directory}`);
        result[locale][key] = messages[key];
      }
    }
  }
  return result;
}

function shape(checker, type) {
  const value = checker.getNonNullableType(type);
  if (value.flags & ts.TypeFlags.BooleanLike) return { kind: 'boolean' };
  const parts = value.isUnion() ? value.types : [value];
  if (parts.every(part => part.isStringLiteral() || part.isNumberLiteral()))
    return { kind: 'select', options: parts.map(part => part.value) };
  if (parts.every(part => part.flags & ts.TypeFlags.NumberLike)) return { kind: 'number' };
  if (parts.every(part => part.flags & ts.TypeFlags.StringLike)) return { kind: 'text' };
  if (value.getCallSignatures().length) return { kind: 'function' };
  return { kind: 'other' };
}

export function componentProps(directories, locales) {
  const sources = directories.flatMap(directory => readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^[A-Z]/.test(entry.name))
    .map(({ name }) => ({ name, file: path.resolve(directory, name, name + '.tsx') })));
  if (!sources.length) throw new Error('No component folders found');
  const program = ts.createProgram(sources.map(entry => entry.file), {
    target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true, skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const result = {};
  for (const { name, file } of sources) {
    const source = program.getSourceFile(file);
    const module = source && checker.getSymbolAtLocation(source);
    const exported = module && checker.getExportsOfModule(module).find(symbol => symbol.name === name);
    const declaration = exported?.valueDeclaration;
    const signature = declaration && checker.getTypeOfSymbolAtLocation(exported, declaration).getCallSignatures()[0];
    const props = signature?.getParameters()[0];
    if (!props || !declaration) throw new Error(`Cannot resolve props of ${name} in ${file}`);
    if (Object.hasOwn(result, name)) throw new Error(`Duplicate component ${name}`);
    const properties = checker.getTypeOfSymbolAtLocation(props, declaration).getProperties();
    if (properties.length === 0) throw new Error(`Empty prop type for ${name}, check its TypeScript dependencies`);
    const model = {};
    for (const prop of properties) {
      const propName = prop.getName();
      if (['key','ref'].includes(propName)) continue;
      const tags = prop.getJsDocTags(checker).filter(tag => tag.name === 'labelKey');
      const keys = [...new Set(tags.map(tag => ts.displayPartsToString(tag.text).trim()))];
      if (keys.length > 1) throw new Error(`Conflicting @labelKey for ${name}.${propName}`);
      const labelKey = keys[0] ?? 'props.common.' + propName;
      const owned = prop.getDeclarations()?.some(node => !node.getSourceFile().isDeclarationFile);
      if (!Object.hasOwn(locales.ru, labelKey)) {
        if (keys.length || owned) throw new Error(`Missing translation ${labelKey} for ${name}.${propName}`);
        continue;
      }
      const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
      model[propName] = {
        ...shape(checker, propType),
        type: checker.typeToString(checker.getNonNullableType(propType)),

        required: !(prop.flags & ts.SymbolFlags.Optional), labelKey, owned: Boolean(owned),
      };
    }
    result[name] = model;
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: {
    components: { type: 'string', multiple: true }, locales: { type: 'string', multiple: true },
    out: { type: 'string' },
  } });
  if (!values.components?.length || !values.out) throw new Error('Expected --components <directory> and --out <file>');
  const locales = readLocales(values.locales);
  const components = componentProps(values.components, locales);
  mkdirSync(path.dirname(values.out), { recursive: true });
  writeFileSync(values.out, JSON.stringify({ components, locales }, null, 2) + '\n');
}
