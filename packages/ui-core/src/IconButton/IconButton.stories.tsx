import { showFocus } from '../../../../storybook/stories/showFocus';
import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { IconButton, Row, Stack, Text } from '@nearic/ui-box';
import { buttonType, className, docs, label, onClick, symbol, variantOptions, variantProp } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/IconButton', component: IconButton,
  parameters: docs(usage),
  args: { name: 'plus', label: 'Увеличить', variant: 'secondary', disabled: false, onClick: fn() },
  argTypes: { name: symbol, label, variant: variantProp('secondary'), onClick, type: buttonType, className },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Первая кнопка связана с Controls. Ниже можно сравнить варианты на одном фоне. */
export const Variants: Story = {
  name: 'Варианты оформления',
  render: args => <Stack>
    <IconButton {...args} />
    <Text variant="label" muted>Варианты оформления</Text>
    <Row>{variantOptions.map(variant =>
      <IconButton key={variant} name={args.name} label={args.label + ' · ' + variant}
        variant={variant} disabled={args.disabled} onClick={args.onClick} />)}
    </Row>
  </Stack>,
};
export const Disabled: Story = { name: 'Недоступна', args: { disabled: true } };
export const Keyboard: Story = {
  name: 'Фокус',
  args: { name: 'back', label: 'Назад' },
  decorators: [showFocus],
  parameters: { docs: { description: { story: 'Перейдите к кнопке по Tab. На границе области касания появится контур.' } } },
};
export const Primary: Story = { name: 'Основная', args: { variant: 'primary' } };
export const Secondary: Story = { name: 'Вторичная', args: { variant: 'secondary' } };
