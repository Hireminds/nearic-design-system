import { useState } from 'react';
import { Button } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  const [done, setDone] = useState(false);
  return (
    <div data-family="box" data-platform="box">
      <Button disabled={done} onClick={() => setDone(true)}>
        {done ? 'Готово' : 'Подтвердить'}
      </Button>
    </div>
  );
}
