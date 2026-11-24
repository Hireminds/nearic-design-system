import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { VolumeControl } from '@nearic/ui-box';
import { callback, className, disabled, docs, numeric, stringProp } from './props';

const meta = {
  title: 'BOX/VolumeControl', component: VolumeControl,
  parameters: docs('Кнопки регулируют уровень от 0 до 100. Потребитель передаёт числовое значение в value и применяет новое значение из onChange. На границе диапазона соответствующая кнопка блокируется.'),
  args: { value: 60, step: 10, label: 'Громкость', disabled: false, onChange: fn() },
  argTypes: {
    value: numeric('Текущий уровень в процентах.', { required: true }),
    onChange: callback('Сообщает новый уровень в диапазоне 0–100.', '(value: number) => void', true),
    step: numeric('Шаг нажатия кнопки.', { initial: '10' }), label: stringProp('Видимый заголовок и имя индикатора.', false, 'Громкость'), disabled, className,
  },
  render: function Preview(args) {
    const [, updateArgs] = useArgs();
    return <VolumeControl {...args} onChange={value => { args.onChange(value); updateArgs({ value }); }} />;
  },
} satisfies Meta<typeof VolumeControl>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Adjust: Story = {};
export const Minimum: Story = { args: { value: 0 } };
export const Maximum: Story = { args: { value: 100 } };
export const Disabled: Story = { args: { disabled: true } };
