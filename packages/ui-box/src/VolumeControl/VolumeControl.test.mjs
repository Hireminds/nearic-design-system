import assert from 'node:assert/strict';
import test from 'node:test';
import { VolumeControl } from '@nearic/ui-box';
import { render } from '../../../../scripts/render-component.mjs';

test('uses the same clamped level for output, progress and native button boundaries', () => {
  for (const [value, level, disabledButton] of [[-1, 0, 0], [60, 60, -1], [101, 100, 1]]) {
    const html = render(VolumeControl, { value, onChange() {} });
    const buttons = html.match(/<button\b[^>]*>/g);
    assert.equal(buttons.length, 2);
    assert.equal(buttons[0].includes('disabled='), disabledButton === 0);
    assert.equal(buttons[1].includes('disabled='), disabledButton === 1);
    assert.match(html, new RegExp('<progress[^>]*value="' + level + '"'));
    assert.match(html, new RegExp('>' + level + '%</output>'));
    assert.match(html, /class="[^"]*\bnr-card\b/);
  }
  const allDisabled = render(VolumeControl, { value: 50, disabled: true, onChange() {} });
  assert.equal(allDisabled.match(/<button\b[^>]*disabled=""/g).length, 2);
});
