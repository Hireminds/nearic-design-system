import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const json = async file => JSON.parse(await readFile(file, 'utf8'));
const downloads = path.resolve('dist/downloads');
const {version, packages} = await json(path.join(downloads, 'package.json'));
const names = ['tokens','ui-core','ui-box'];
assert.deepEqual(Object.keys(packages), names.map(name => '@nearic/' + name));
const catalogData = JSON.parse((await readFile('dist/data.js', 'utf8')).trim().slice('window.catalogData = '.length, -1));
const catalogIds = [...catalogData.atoms, ...catalogData.components].map(item => item.id);
const files = [
  '.nojekyll','catalog.css','catalog.js','data.js','downloads','downloads/package.json',
  'navigation.js','samples.js',...catalogIds.flatMap(id => [id + '.html', id + '.en.html']),
  'index.html','runtime.js','styles.css','tokens.css',...names.map(name=>'downloads/' + packages['@nearic/'+name].filename),
];
const output = await readdir('dist', { recursive: true });
const liveFiles = output.filter(name => name.startsWith('live/'));
assert(liveFiles.length, 'Live assets must ship alongside the static component pages');
for (const id of catalogIds) {
  const page = await readFile('dist/' + id + '.html', 'utf8');
  assert(page.includes('data-component-page="' + id + '"') && page.includes('data-nearic-live'), id);
  assert(!page.includes('<iframe'), 'Component HTML must stand alone: ' + id);
  const runtime = page.match(/data-runtime="([^"]+)"/)?.[1];
  assert(runtime && liveFiles.includes(path.posix.normalize(runtime)), 'Missing live module for ' + id);
  assert([...page.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].some(match => liveFiles.includes(path.posix.normalize(match[1]))),
    'Missing live stylesheet for ' + id);
}
const catalogFiles = output.filter(name => !['storybook','live'].includes(name.split('/')[0]));
assert.deepEqual(catalogFiles.sort(), files.sort());
for (const name of ['index.html', 'iframe.html', 'index.json']) {
  assert(output.includes('storybook/' + name), 'The build must ship the Storybook catalog depends on: ' + name);
}

// Only package entry points, component declarations and exact bundled siblings ship.
const coreComponents = [
  'Icon', 'Text', 'Button', 'IconButton', 'Switch', 'Slider', 'Progress', 'StatusIndicator',
  'Link', 'Row', 'Stack', 'Card',
];
const boxComponents = ['NetworkRow', 'VolumeControl', 'DecisionActions'];
const declarationFiles = names => names.flatMap(name => [
  'dist/src/' + name + '/index.d.ts', 'dist/src/' + name + '/' + name + '.d.ts',
]);

const allowed = {
  tokens: ['dist/tokens.css','dist/tokens.json'],
  'ui-core': [
    'dist/index.js','dist/index.d.ts','dist/styles.css',
    'dist/src/classNames.d.ts','dist/src/input.d.ts','dist/src/layout.d.ts',...declarationFiles(coreComponents),
  ],
  'ui-box': ['dist/index.js','dist/index.d.ts','dist/styles.css','dist/overrides.css','dist/overrides.json',
    'dist/patterns.css','dist/tokens.css','dist/tokens.json',...declarationFiles(boxComponents)],
};
const archives = {};
for (const name of names) {
  const packageName = '@nearic/' + name;
  const artifact = packages[packageName];
  const manifest = await json('packages/' + name + '/package.json');
  assert.equal(manifest.name,packageName);
  assert.equal(artifact.version,version);
  assert.equal(artifact.version,manifest.version);
  assert.equal(artifact.filename,`nearic-${name}-${version}.tgz`);
  const archive = path.join(downloads,artifact.filename);
  archives[name] = archive;
  const digest = createHash('sha512').update(await readFile(archive)).digest('base64');
  assert.equal(artifact.integrity, 'sha512-' + digest);
  allowed[name].push('package.json');
  for (const dependency of manifest.bundleDependencies ?? []) {
    assert.equal(manifest.dependencies[dependency],version);
    const short = dependency.split('/')[1];
    allowed[name].push(...allowed[short].map(item => 'node_modules/' + dependency + '/' + item));
  }
  const actual = execFileSync('tar',['tzf',archive],{encoding:'utf8'}).trim().split('\n');
  assert.deepEqual(actual.sort(),allowed[name].map(file=>'package/' + file).sort());
}

const base = await json('packages/tokens/tokens.json');
const patch = await json('packages/ui-box/overrides.json');
const resolved = await json('packages/ui-box/dist/tokens.json');
assert.equal(base.size.touch,'44px');
assert.equal(base.size.thumb,'19px');
assert.equal(patch.size.thumb,'20px');
for (const group of Object.keys(resolved)) {
  assert.deepEqual(resolved[group],{...base[group], ...patch[group]});
}
const coreExports = [...coreComponents, 'iconNames'];
const boxExports = [...coreExports, ...boxComponents];
const typescript = path.resolve('node_modules/.bin/tsc');

async function consumer(name, selected, reactArchive) {
  const cwd = await mkdtemp(path.join(tmpdir(), 'nearic-consumer-'));
  try {
    await writeFile(path.join(cwd,'package.json'),'{"type":"module","private":true}');
    const reactApp = selected.some(id=>id.startsWith('ui-'));
    const dependencies = selected.map(id=>archives[id]);
    if (reactApp) dependencies.push(reactArchive);
    execFileSync('npm',['install','--offline','--ignore-scripts','--no-fund','--no-audit',...dependencies],{cwd,stdio:'pipe'});
    const baseExample = `
      import { readFileSync } from 'node:fs';
      const read = request => JSON.parse(readFileSync(new URL(import.meta.resolve(request)), 'utf8'));
    `;
    let runtime = baseExample;
    if (selected.includes('tokens')) {
      runtime += `
        assert.equal(read('@nearic/tokens/tokens.json').size.thumb, '19px');
        assert.ok(readFileSync(new URL(import.meta.resolve('@nearic/tokens/tokens.css')), 'utf8').includes(':root'));
      `;
    }
    if (reactApp) {
      const modules = path.join(cwd,'node_modules');
      // Compile with the same development-only React declarations as the workspace.
      await mkdir(path.join(modules,'@types'),{recursive:true});
      await symlink(path.resolve('node_modules/@types/react'),path.join(modules,'@types/react'),'dir');
      const isBox = selected.includes('ui-box');
      const entry = isBox ? '@nearic/ui-box' : '@nearic/ui-core';
      const example = isBox
        ? "import { VolumeControl, Stack } from '@nearic/ui-box'; export const e=<Stack data-family='box'><VolumeControl value={60} onChange={v=>v.toFixed()}/></Stack>;"
        : "import { Switch, Icon } from '@nearic/ui-core'; export const e=<><Switch label='Sound' defaultChecked/><Icon name='wifi'/></>;";
      const inputContract = `
        import { Slider, Switch as Toggle } from '${entry}';
        <Toggle label="Notifications" name="notifications" value="on" defaultChecked />;
        <Toggle label="Notifications" checked={true} onChange={event => event.currentTarget.checked} />;
        <Slider label="Volume" min={0} max={100} step="any" defaultValue={50} />;
        <Slider label="Volume" value="60" onChange={event => event.currentTarget.valueAsNumber} />;
        // @ts-expect-error Switch has no numeric range.
        <Toggle label="Notifications" min={0} />;
        // @ts-expect-error Switch has no numeric range.
        <Toggle label="Notifications" max={100} />;
        // @ts-expect-error Switch has no numeric step.
        <Toggle label="Notifications" step={5} />;
        // @ts-expect-error Choose either controlled or uncontrolled state.
        <Toggle label="Notifications" checked={true} defaultChecked={false} />;
        // @ts-expect-error Slider has no checkbox state.
        <Slider label="Volume" checked={true} />;
        // @ts-expect-error Slider has no initial checkbox state.
        <Slider label="Volume" defaultChecked={false} />;
        // @ts-expect-error Slider takes a single scalar value.
        <Slider label="Volume" value={['10', '20']} />;
        // @ts-expect-error Choose either controlled or uncontrolled value.
        <Slider label="Volume" value={60} defaultValue={30} />;
      `;
      await writeFile(path.join(cwd,'example.tsx'),example + inputContract);
      execFileSync(typescript,['--noEmit','--strict','--jsx','react-jsx','--module','NodeNext','--target','es2022','example.tsx'],{cwd,stdio:'inherit'});
      runtime += `
        const api=await import('${entry}');
        assert.deepEqual(Object.keys(api).sort(), ${JSON.stringify((isBox?boxExports:coreExports).toSorted())});
        assert.ok(readFileSync(new URL(import.meta.resolve('${entry}/styles.css')), 'utf8').length>0);
      `;
      if (isBox) runtime += `
        assert.equal(read('@nearic/ui-box/overrides.json').size.thumb,'20px');
        assert.equal(read('@nearic/ui-box/tokens.json').size.touch,'44px');
        for (const file of ['overrides.css','patterns.css','tokens.css']) {
          assert.ok(readFileSync(new URL(import.meta.resolve('@nearic/ui-box/' + file)), 'utf8').length>0);
        }
      `;
    }
    execFileSync(process.execPath,['--input-type=module','-e',"import assert from 'node:assert/strict';\n"+runtime],{cwd,stdio:'inherit'});
    console.log(name + ': isolated npm install passed.');
  } finally {
    await rm(cwd,{recursive:true,force:true});
  }
}
// Pack the lockfile-installed React peer to make a real npm install possible even in offline CI.
const peers = await mkdtemp(path.join(tmpdir(), 'nearic-peer-'));
try {
  const [reactPackage] = JSON.parse(execFileSync('npm', [
    'pack',path.resolve('node_modules/react'),'--pack-destination',peers,'--json'
  ],{encoding:'utf8'}));
  const reactArchive = path.join(peers,reactPackage.filename);
  for (const name of names) await consumer(name,[name],reactArchive);
  await consumer('mixed',names,reactArchive);
} finally {
  await rm(peers,{recursive:true,force:true});
}

const componentTests = [
  ...coreComponents.map(name => 'packages/ui-core/src/' + name + '/' + name + '.test.mjs'),
  ...boxComponents.map(name => 'packages/ui-box/src/' + name + '/' + name + '.test.mjs'),
];
execFileSync(process.execPath, ['--test', ...componentTests], { stdio: 'inherit' });
