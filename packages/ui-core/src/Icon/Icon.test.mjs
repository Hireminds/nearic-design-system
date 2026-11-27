import assert from 'node:assert/strict';
import test from 'node:test';
import { Icon } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('named icons are images and decorative icons are hidden', () => {
  const named = render(Icon, { name: 'wifi', label: 'Network' });
  assert.match(named, /role="img"/);
  assert.match(named, /aria-label="Network"/);
  assert.doesNotMatch(named, /aria-hidden="true"/);
  assert.match(render(Icon, { name: 'wifi' }), /aria-hidden="true"/);
});
