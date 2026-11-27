import assert from 'node:assert/strict';
import test from 'node:test';
import { Progress } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('omits value for an unknown total and preserves a known zero', () => {
  assert.doesNotMatch(render(Progress, { label: 'Download' }), /value=/);
  const known = render(Progress, { label: 'Download', value: 0 });
  assert.match(known, /<progress/);
  assert.match(known, /value="0"/);
  assert.match(known, /max="100"/);
  assert.match(known, /aria-label="Download"/);
});
