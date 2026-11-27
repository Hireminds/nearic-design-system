import assert from 'node:assert/strict';
import test from 'node:test';
import { NetworkRow } from '@nearic/ui-box';
import { render } from '../../../../scripts/render-component.mjs';

test('preserves the full network name online and removes it offline', () => {
  const name = 'A'.repeat(32);
  const online = render(NetworkRow, { online: true, value: name });
  assert.ok(online.includes('title="' + name + '"'));
  assert.ok(online.includes('>' + name + '</span>'));
  const offline = render(NetworkRow, { online: false, value: name });
  assert.ok(offline.includes('Вне сети'));
  assert.ok(!offline.includes(name));
});
