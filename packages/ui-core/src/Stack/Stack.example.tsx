import { Stack, Text } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  return (
    <div data-family="box" data-platform="box">
      <Stack>
        <Text variant="heading">Звук</Text>
        <Text variant="label" muted>Громкость 60%</Text>
      </Stack>
    </div>
  );
}
