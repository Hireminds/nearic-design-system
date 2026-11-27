import assert from 'node:assert/strict';
import test from 'node:test';
import { Button } from '@nearic/ui-core';
import { render } from '../../../../scripts/render-component.mjs';

test('defaults to a non-submitting button and forwards the disabled state', () => {
  const ordinary = render(Button, {}, 'Save');
  assert.match(ordinary, /type="button"/);
  assert.match(ordinary, /data-variant="primary"/);
  assert.match(ordinary, />Save<\/button>/);
  const submit = render(Button, { type: 'submit', disabled: true, variant: 'secondary' }, 'Save');
  assert.match(submit, /type="submit"/);
  assert.match(submit, /disabled=""/);
  assert.match(submit, /data-variant="secondary"/);
});
