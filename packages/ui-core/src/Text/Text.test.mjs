import assert from 'node:assert/strict';
import test from 'node:test';
import { Text } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('preserves text content and exposes its chosen type and muted state', () => {
  const html = render(Text, { variant: 'heading', muted: true }, 'Volume');
  assert.match(html, /data-variant="heading"/);
  assert.match(html, /data-muted=""/);
  assert.match(html, />Volume<\/span>/);
  assert.doesNotMatch(render(Text, {}, 'Volume'), /data-muted/);
});
