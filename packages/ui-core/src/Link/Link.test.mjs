import assert from 'node:assert/strict';
import test from 'node:test';
import { Link } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('uses a native anchor with its href, accessible name and attributes', () => {
  const html = render(Link, { href: '#details', 'aria-current': 'page' }, 'Details');
  assert.match(html, /<a [^>]*href="#details"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, />Details<\/a>/);
});
