import { Progress } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  return (
    <div data-family="box" data-platform="box">
      <Progress label="Загрузка" value={60} max={100} />
    </div>
  );
}
