import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusIndicator } from '@nearic/ui-box';
import { children, className, docs, statusTone } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/StatusIndicator', component: StatusIndicator,
  parameters: docs(usage),
  args: { children: 'На связи', tone: 'success' },
  argTypes: { children, tone: statusTone, className },
} satisfies Meta<typeof StatusIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Online: Story = { name: 'Успех' };
export const Offline: Story = { name: 'Нейтральный', args: { children: 'Вне сети', tone: 'neutral' } };
export const Warning: Story = { name: 'Предупреждение', args: { tone: 'warning', children: 'Нужен ответ' } };
export const Error: Story = { name: 'Ошибка', args: { tone: 'error', children: 'Ошибка' } };
