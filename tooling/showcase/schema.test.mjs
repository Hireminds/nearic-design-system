import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { componentProps, readLocales } from './generate.mjs';

test('inferred controls, component-specific labels and required translations', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nearic-doc-props-'));
  try {
    const component = path.join(dir, 'Example');
    mkdirSync(component);
    const example = path.join(component, 'Example.tsx');
    const source = `interface Props {
      /** @labelKey props.volumeControl.value */
      value: number;
      variant?: 'short' | 'long';
      disabled?: boolean;
    }
    export function Example(props: Props) { return props.value; }`;
    writeFileSync(example, source);
    const locales = readLocales();
    const { Example } = componentProps([dir], locales);
    assert.equal(Example.value.labelKey, 'props.volumeControl.value');
    assert.equal(Example.value.required, true);
    assert.equal(Example.disabled.kind, 'boolean');
    assert.equal(Example.disabled.required, false);
    assert.deepEqual(Example.variant.options.toSorted(), ['long', 'short']);
    writeFileSync(example, source.replace('props.volumeControl.value', 'missing.key'));
    assert.throws(() => componentProps([dir], locales), /missing.key/);
    writeFileSync(path.join(dir, 'ru.json'), '{"test.label":"Значение"}');
    writeFileSync(path.join(dir, 'en.json'), '{}');
    assert.throws(() => readLocales([dir]), /Missing en translation for test.label/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
