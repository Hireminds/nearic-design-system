import assert from 'node:assert/strict';
import test from 'node:test';
import { StatusIndicator } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('conveys status with text and hides the decorative marker', () => {
  const html = render(StatusIndicator, { tone: 'error' }, 'Disconnected');
  assert.match(html, /data-tone="error"/);
  assert.match(html, /<i[^>]*aria-hidden="true"/);
  assert.match(html, />Disconnected<\/span>/);
});
