import assert from 'node:assert/strict';
import test from 'node:test';
import { DecisionActions } from '@nearic/ui-box';
import { render } from '../../../../scripts/render-component.mjs';

test('renders both decisions in order with consumer labels and shared disabled state', () => {
  const html = render(DecisionActions, {
    primaryLabel: 'Start', secondaryLabel: 'Later', disabled: true, onDecision() {},
  });
  const buttons = [...html.matchAll(/<button([^>]*)>(.*?)<\/button>/g)];
  assert.deepEqual(buttons.map(match => match[2]), ['Later', 'Start']);
  assert.ok(buttons.every(match => match[1].includes('disabled=""')));
});
