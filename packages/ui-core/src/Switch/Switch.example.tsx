import { useState } from 'react';
import { Switch } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div data-family="box" data-platform="box">
      <Switch label="Уведомления" checked={enabled}
        onChange={event => setEnabled(event.currentTarget.checked)} />
    </div>
  );
}
