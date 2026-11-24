import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as ui from '@nearic/ui';
const json = async (p) => JSON.parse(await readFile(p, 'utf8'));
for (const file of [
  'dist/index.html',
  'dist/catalog.js',
  'dist/runtime.js',
  'dist/tokens.css',
  'dist/mockups/index.html',
  'dist/mockups/app.js',
  'dist/mockups/app.css',
  'dist/mockups/assets/box/explorer.webp',
  'library/dist/index.d.ts',
])
  await access(file);
for (const component of [
  'Icon',
  'Text',
  'Button',
  'IconButton',
  'Switch',
  'Slider',
  'Progress',
  'StatusIndicator',
  'TextField',
  'Link',
  'Row',
  'Stack',
  'VolumeControl',
  'NetworkRow',
  'DecisionActions',
  'SettingRow',
  'DeviceCard',
])
  assert.ok(ui[component], component);
assert.match(
  renderToStaticMarkup(
    createElement(ui.IconButton, { name: 'plus', label: 'Прибавить громкость' }),
  ),
  /aria-label="Прибавить громкость"/,
);
const artifact = await json('dist/downloads/package.json');
const pkg = await json('library/package.json');
assert.equal(artifact.name, pkg.name);
assert.equal(artifact.version, pkg.version);
await access('dist/downloads/' + artifact.filename);
console.log('Public package exports, artifact and both application entry points verified.');
