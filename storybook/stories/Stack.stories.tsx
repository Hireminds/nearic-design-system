import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, Stack, Text } from '@nearic/ui-box';
import { children, className, docs } from './props';

const meta = {
  title: 'BOX/Stack', component: Stack,
  parameters: docs('Вертикальная компоновка: элементы идут один под другим с отступом из темы. Корневой div принимает стандартные HTML-свойства.'),
  args: { children: 'Настройки' },
  argTypes: {
    children, className,
    style: { description: 'Стандартные CSS-свойства React для контейнера, например gap.', control: 'object', table: { type: { summary: 'CSSProperties' } } },
  },
  render: ({ children, ...args }) => <Stack {...args}><Icon name="settings" /><Text>{children}</Text></Stack>,
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Layout: Story = {};
