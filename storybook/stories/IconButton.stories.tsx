import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { IconButton, Row, Stack, Text } from '@nearic/ui-box';
import { buttonType, className, disabled, docs, label, onClick, symbol, variantOptions, variantProp } from './props';

const meta = {
  title: 'BOX/IconButton', component: IconButton,
  parameters: docs('Круглая кнопка для одного действия. Свойство name выбирает знак, а обязательный label называет действие. Tab показывает контур фокуса. Enter или пробел активируют кнопку.'),
  args: { name: 'plus', label: 'Увеличить', variant: 'secondary', disabled: false, onClick: fn() },
  argTypes: { name: symbol, label, variant: variantProp('secondary'), disabled, onClick, type: buttonType, className },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Первая кнопка связана с Controls. Ниже можно сравнить варианты на одном фоне. */
export const Variants: Story = {
  render: args => <Stack>
    <IconButton {...args} />
    <Text variant="label" muted>Варианты оформления</Text>
    <Row>{variantOptions.map(variant =>
      <IconButton key={variant} name={args.name} label={args.label + ' · ' + variant}
        variant={variant} disabled={args.disabled} onClick={args.onClick} />)}
    </Row>
  </Stack>,
};
export const Disabled: Story = { args: { disabled: true } };
export const Keyboard: Story = {
  args: { name: 'back', label: 'Назад' },
  parameters: { docs: { description: { story: 'Перейдите к кнопке по Tab. На границе области касания появится контур.' } } },
};
