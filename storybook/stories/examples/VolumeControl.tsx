import { useState } from 'react';
import { VolumeControl } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  const [volume, setVolume] = useState(60);
  return (
    <div data-family="box" data-platform="box">
      <VolumeControl value={volume} step={10} onChange={setVolume} />
    </div>
  );
}
