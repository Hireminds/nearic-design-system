import assert from 'node:assert/strict';
import test from 'node:test';
import { Row } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('keeps sibling order and lets consumers label a horizontal group', () => {
  const html = render(Row, { role: 'group', 'aria-label': 'Actions' }, 'Back', 'Next');
  assert.match(html, /<div [^>]*role="group"/);
  assert.match(html, /aria-label="Actions"/);
  assert.match(html, />BackNext<\/div>/);
});
