import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusIndicator } from '@nearic/ui-box';
import { children, className, docs, statusTone } from './props';

const meta = {
  title: 'BOX/StatusIndicator', component: StatusIndicator,
  parameters: docs('Метка состояния объединяет цветовой маркер и подпись. Подпись сообщает значение независимо от различимости цвета.'),
  args: { children: 'На связи', tone: 'success' },
  argTypes: { children, tone: statusTone, className },
} satisfies Meta<typeof StatusIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Online: Story = {};
export const Offline: Story = { args: { children: 'Вне сети', tone: 'neutral' } };
