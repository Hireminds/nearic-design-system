import { useState } from 'react';
import { IconButton } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  const [level, setLevel] = useState(60);
  return (
    <div data-family="box" data-platform="box">
      <IconButton name="plus" label="Увеличить" variant="secondary"
        disabled={level >= 100} onClick={() => setLevel(Math.min(level + 10, 100))} />
      <output>{level}%</output>
    </div>
  );
}
