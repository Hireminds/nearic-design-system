import assert from 'node:assert/strict';
import test from 'node:test';
import { Switch } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('renders a labelled native checkbox with its initial form state', () => {
  const html = render(Switch, { label: 'Alerts', defaultChecked: true, disabled: true, name: 'alerts' });
  assert.match(html, /role="switch"/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /aria-label="Alerts"/);
  assert.match(html, /checked=""/);
  assert.match(html, /disabled=""/);
  assert.match(html, /name="alerts"/);
  assert.doesNotMatch(render(Switch, { label: 'Alerts' }), /checked=/);
});
