import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, Row, Text } from '@nearic/ui-box';
import { children, className, docs } from './props';

const meta = {
  title: 'BOX/Row', component: Row,
  parameters: docs('Горизонтальная компоновка дочерних элементов с переносом при нехватке места. Корневой div принимает стандартные HTML-свойства.'),
  args: { children: 'Настройки' },
  argTypes: {
    children, className,
    style: { description: 'Стандартные CSS-свойства React для контейнера, например gap.', control: 'object', table: { type: { summary: 'CSSProperties' } } },
  },
  render: ({ children, ...args }) => <Row {...args}><Icon name="settings" /><Text>{children}</Text></Row>,
} satisfies Meta<typeof Row>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Layout: Story = {};
