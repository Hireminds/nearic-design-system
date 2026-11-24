import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as ui from '@nearic/ui-box';

const json = async filename => JSON.parse(await readFile(filename, 'utf8'));
const pkg = await json('library/package.json');
const manifest = await json('dist/downloads/package.json');
assert.equal(manifest.name, '@nearic/ui-box');
assert.equal(manifest.version, pkg.version);
assert.equal(manifest.filename, `nearic-ui-box-${pkg.version}.tgz`);
const archive = path.resolve('dist/downloads', manifest.filename);
const hash = createHash('sha512').update(await readFile(archive)).digest('base64');
assert.equal(manifest.integrity, 'sha512-' + hash);

const catalogFiles = [
  '.nojekyll', 'catalog.css', 'catalog.js', 'data.js', 'downloads', 'downloads/package.json',
  'downloads/' + manifest.filename, 'index.html', 'runtime.js', 'styles.css', 'tokens.css',
];
assert.deepEqual((await readdir('dist', { recursive: true })).sort(), catalogFiles.sort());

const archiveFiles = [
  'package.json', 'dist/index.js', 'dist/index.d.ts', 'dist/patterns.d.ts',
  'dist/primitives.d.ts', 'dist/styles.css', 'dist/tokens.css', 'dist/tokens.json',
];
const entries = execFileSync('tar', ['tzf', archive], { encoding: 'utf8' }).trim().split('\n');
assert.deepEqual(entries.sort(), archiveFiles.map(name => 'package/' + name).sort());
const packedTokens = JSON.parse(execFileSync('tar', ['xOzf', archive, 'package/dist/tokens.json'], {encoding:'utf8'}));
assert.deepEqual(Object.keys(packedTokens), ['box']);
assert.deepEqual(packedTokens, await json('tokens/tokens.json'));

const exports = [
  'Icon', 'Text', 'Button', 'IconButton', 'Switch', 'Slider', 'Progress', 'StatusIndicator',
  'Link', 'Row', 'Stack', 'VolumeControl', 'NetworkRow', 'DecisionActions', 'iconNames',
];
assert.deepEqual(Object.keys(ui).sort(), exports.sort());
assert.match(renderToStaticMarkup(createElement(ui.IconButton, { name:'plus', label:'Прибавить громкость' })),
  /aria-label="Прибавить громкость"/);

const consumer = await mkdtemp(path.join(tmpdir(), 'nearic-box-consumer-'));
try {
  await writeFile(path.join(consumer, 'package.json'), '{"private":true,"type":"module"}');
  execFileSync('npm', ['install', '--offline', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund', archive], {cwd:consumer});
  const modules = path.join(consumer, 'node_modules');
  // Resolve the consumer's React peer and types with the versions pinned by this checkout.
  await symlink(path.resolve('node_modules/react'), path.join(modules, 'react'), 'dir');
  await mkdir(path.join(modules, '@types'), {recursive:true});
  await symlink(path.resolve('node_modules/@types/react'), path.join(modules, '@types/react'), 'dir');
  await writeFile(path.join(consumer, 'example.tsx'), `
    import { VolumeControl, NetworkRow, DecisionActions, Stack, Icon } from '@nearic/ui-box';
    export const example = <Stack data-family="box">
      <Icon name="wifi" /><NetworkRow online value="Home" />
      <VolumeControl value={60} onChange={value => value.toFixed()} />
      <DecisionActions onDecision={choice => choice.toUpperCase()} />
    </Stack>;
  `);
  execFileSync(path.resolve('node_modules/.bin/tsc'), [
    '--noEmit', '--strict', '--jsx', 'react-jsx', '--module', 'NodeNext', '--target', 'es2022', 'example.tsx'
  ], { cwd:consumer, stdio:'inherit' });
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import * as box from '@nearic/ui-box';
    assert.deepEqual(Object.keys(box).sort(), ${JSON.stringify(exports)});
    for (const entry of ['styles.css','tokens.css','tokens.json']) import.meta.resolve('@nearic/ui-box/' + entry);
  `], { cwd:consumer, stdio:'inherit' });
} finally {
  await rm(consumer, {recursive:true, force:true});
}
console.log('BOX catalog, archive contents, checksum and standalone TypeScript consumer verified.');
