import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, Stack, Text } from '@nearic/ui-box';
import { children, className, docs } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Stack', component: Stack,
  parameters: docs(usage),
  args: { children: 'Настройки' },
  argTypes: {
    children, className,
    style: { description: 'Стандартные CSS-свойства React для контейнера, например gap.', control: 'object', table: { type: { summary: 'CSSProperties' } } },
  },
  render: ({ children, ...args }) => <Stack {...args}><Icon name="settings" /><Text>{children}</Text></Stack>,
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Layout: Story = { name: 'Несколько элементов' };
export const Single: Story = { name: 'Один элемент', render: args => <Stack {...args}><Text>{args.children}</Text></Stack> };
