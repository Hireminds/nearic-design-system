import { Icon, Row, Text } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  return (
    <div data-family="box" data-platform="box">
      <Row><Icon name="wifi" tone="network" /><Text>Домашняя</Text></Row>
    </div>
  );
}
