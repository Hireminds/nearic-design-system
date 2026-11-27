import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { VolumeControl } from '@nearic/ui-box';
import { callback, className, docs, numeric, stringProp } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/VolumeControl', component: VolumeControl,
  parameters: docs(usage),
  args: { value: 60, step: 10, label: 'Громкость', disabled: false, onChange: fn() },
  argTypes: {
    value: numeric('Текущий уровень в процентах.', { required: true }),
    onChange: callback('Сообщает новый уровень в диапазоне 0–100.', '(value: number) => void', true),
    step: numeric('Шаг нажатия кнопки.', { initial: '10' }), label: stringProp('Видимый заголовок и имя индикатора.', false, 'Громкость'), className,
  },
  render: function Preview(args) {
    const [, updateArgs] = useArgs();
    return <VolumeControl {...args} onChange={value => { args.onChange(value); updateArgs({ value }); }} />;
  },
} satisfies Meta<typeof VolumeControl>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Adjust: Story = { name: '60%' };
export const Minimum: Story = { name: '0%', args: { value: 0 } };
export const Maximum: Story = { name: '100%', args: { value: 100 } };
export const Disabled: Story = { name: 'Недоступен', args: { disabled: true } };
