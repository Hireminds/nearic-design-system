import { Link } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  return (
    <div data-family="box" data-platform="box">
      <Link href="#network">К состоянию сети</Link>
      <p id="network">Wi-Fi подключён</p>
    </div>
  );
}
