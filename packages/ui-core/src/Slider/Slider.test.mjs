import assert from 'node:assert/strict';
import test from 'node:test';
import { Slider } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('passes the accessible name, range bounds, step and initial value to the input', () => {
  const html = render(Slider, { label: 'Volume', min: 10, max: 70, step: 5, defaultValue: 40 });
  assert.match(html, /type="range"/);
  assert.match(html, /aria-label="Volume"/);
  assert.match(html, /min="10"/);
  assert.match(html, /max="70"/);
  assert.match(html, /step="5"/);
  assert.match(html, /value="40"/);
});
