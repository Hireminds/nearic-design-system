import assert from 'node:assert/strict';
import test from 'node:test';
import { Stack } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('keeps stacked content in reading order and forwards container attributes', () => {
  const html = render(Stack, { id: 'settings', lang: 'en' }, 'Volume', 'Sound');
  assert.match(html, /id="settings"/);
  assert.match(html, /lang="en"/);
  assert.match(html, />VolumeSound<\/div>/);
});
