import assert from 'node:assert/strict';
import test from 'node:test';
import { Card } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('groups arbitrary children and forwards the supplied container semantics', () => {
  const html = render(Card, { role: 'region', 'aria-label': 'Settings', className: 'custom' }, 'Sound');
  assert.match(html, /<div[^>]*role="region"/);
  assert.match(html, /aria-label="Settings"/);
  assert.match(html, /class="[^"]*\bcustom\b/);
  assert.match(html, />Sound<\/div>/);
});
