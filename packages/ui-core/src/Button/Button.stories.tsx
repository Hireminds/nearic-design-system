import { showFocus } from '../../../../storybook/stories/showFocus';
import entry from './component.json';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '@nearic/ui-box';
import { buttonType, children, className, docs, onClick, variantProp } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Button', component: Button,
  parameters: docs(entry.usage),
  args: { children: 'Подтвердить', variant: 'primary', disabled: false, onClick: fn() },
  argTypes: { children, variant: variantProp('primary'), type: buttonType, onClick, className },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = { name: 'Основная' };
export const Secondary: Story = { name: 'Вторичная', args: { children: 'Позже', variant: 'secondary' } };
export const Quiet: Story = { name: 'Текстовая', args: { children: 'Отмена', variant: 'quiet' } };
export const Destructive: Story = { name: 'Опасное действие', args: { children: 'Удалить', variant: 'destructive' } };
export const Disabled: Story = { name: 'Недоступна', args: { disabled: true } };
export const Focus: Story = { name: 'Фокус', decorators: [showFocus] };
