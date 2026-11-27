import { showFocus } from '../../../../storybook/stories/showFocus';
import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Slider } from '@nearic/ui-box';
import { changeInput, className, docs, label, numeric } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Slider', component: Slider,
  parameters: docs(usage),
  args: { label: 'Яркость', min: 0, max: 100, step: 5, value: 60, disabled: false, onChange: fn() },
  argTypes: {
    label, min: numeric('Нижняя граница.', { initial: '0', type: 'number | string' }),
    max: numeric('Верхняя граница.', { initial: '100', type: 'number | string' }),
    step: numeric('Шаг между значениями.', { initial: '1', type: 'number | string' }),
    value: numeric('Значение в управляемом режиме. Передавайте без defaultValue.', { type: 'number | string' }),
    defaultValue: numeric('Начальное значение. Передавайте без value. По умолчанию браузер берёт середину диапазона.', { type: 'number | string' }),
    onChange: changeInput, className,
  },
  render: function Preview(args) {
    const [, updateArgs] = useArgs();
    if (args.value === undefined) return <Slider key={String(args.defaultValue)} {...args} />;
    const { defaultValue, ...controlled } = args;
    return <Slider {...controlled} onChange={event => {
      const value = event.currentTarget.valueAsNumber;
      args.onChange?.(event);
      updateArgs({ value });
    }} />;
  },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Level: Story = { name: 'Промежуточное' };
export const Disabled: Story = { name: 'Недоступен', args: { disabled: true } };
export const Uncontrolled: Story = { name: 'Начальное значение', args: { value: undefined, defaultValue: 30 } };
export const Minimum: Story = { name: 'Минимум', args: { value: 0 } };
export const Maximum: Story = { name: 'Максимум', args: { value: 100 } };
export const Focus: Story = { name: 'Фокус', decorators: [showFocus] };
