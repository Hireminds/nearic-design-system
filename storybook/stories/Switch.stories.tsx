import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Switch } from '@nearic/ui-box';
import { bool, changeInput, className, disabled, docs, label, stringProp } from './props';

const meta = {
  title: 'BOX/Switch', component: Switch,
  parameters: docs('Двоичный переключатель с круглым бегунком и доступной областью касания. Укажите checked и onChange для управляемого режима или задайте только defaultChecked для начального положения. Tab переводит фокус, пробел меняет состояние.'),
  args: { label: 'Уведомления', checked: false, disabled: false, onChange: fn() },
  argTypes: {
    label, checked: bool('Управляемое состояние. Передавайте без defaultChecked. Изменения передаются через onChange.'),
    defaultChecked: bool('Начальное состояние неуправляемого переключателя. Передавайте без checked.', 'false'),
    disabled, onChange: changeInput, name: stringProp('Имя поля при отправке формы.'), className,
  },
  render: function Preview(args) {
    const [, updateArgs] = useArgs();
    if (args.checked === undefined) {
      return <Switch key={String(args.defaultChecked)} {...args} />;
    }
    const { defaultChecked, ...controlled } = args;
    return <Switch {...controlled} onChange={event => {
      const next = event.currentTarget.checked;
      args.onChange?.(event);
      updateArgs({ checked: next });
    }} />;
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { checked: true, disabled: true } };
export const Uncontrolled: Story = {
  args: { checked: undefined, defaultChecked: true },
  parameters: { controls: { exclude: ['checked'] } },
};
