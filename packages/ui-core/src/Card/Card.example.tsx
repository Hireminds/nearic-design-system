import { Card, Stack, Text } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  return <Card data-family="box">
    <Stack><Text variant="heading">Звук</Text><Text>Громкость устройства</Text></Stack>
  </Card>;
}
