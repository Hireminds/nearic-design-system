import { useState } from 'react';
import { Slider } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  const [value, setValue] = useState(60);
  return (
    <div data-family="box" data-platform="box">
      <Slider label="Яркость" min={0} max={100} step={5} value={value}
        onChange={event => setValue(event.currentTarget.valueAsNumber)} />
    </div>
  );
}
