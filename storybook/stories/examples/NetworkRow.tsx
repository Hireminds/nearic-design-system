import { NetworkRow } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  return (
    <div data-family="box" data-platform="box">
      <NetworkRow value="Домашняя" online />
    </div>
  );
}
