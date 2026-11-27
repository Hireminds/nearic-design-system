import { showFocus } from '../../../../storybook/stories/showFocus';
import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Switch } from '@nearic/ui-box';
import { bool, changeInput, className, docs, label, stringProp } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Switch', component: Switch,
  parameters: docs(usage),
  args: { label: 'Уведомления', checked: false, disabled: false, onChange: fn() },
  argTypes: {
    label, checked: bool('Управляемое состояние. Передавайте без defaultChecked. Изменения передаются через onChange.'),
    defaultChecked: bool('Начальное состояние неуправляемого переключателя. Передавайте без checked.', 'false'),
    onChange: changeInput, name: stringProp('Имя поля при отправке формы.'), className,
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

export const Off: Story = { name: 'Выключен' };
export const On: Story = { name: 'Включён', args: { checked: true } };
export const Disabled: Story = { name: 'Недоступен', args: { checked: true, disabled: true } };
export const Uncontrolled: Story = {
  name: 'Начальное состояние',
  args: { checked: undefined, defaultChecked: true },
  parameters: { controls: { exclude: ['checked'] } },
};
export const Focus: Story = { name: 'Фокус', decorators: [showFocus] };
