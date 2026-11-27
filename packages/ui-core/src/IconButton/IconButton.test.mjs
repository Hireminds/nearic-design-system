import assert from 'node:assert/strict';
import test from 'node:test';
import { IconButton } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('the button owns the accessible name and the glyph is decorative', () => {
  const html = render(IconButton, { name: 'plus', label: 'Increase' });
  assert.match(html, /<button[^>]*aria-label="Increase"/);
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.match(html, /data-variant="secondary"/);
});
