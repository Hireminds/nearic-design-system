import entry from './component.json';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, Row, Text } from '@nearic/ui-box';
import { children, className, docs } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Row', component: Row,
  parameters: docs(entry.usage),
  args: { children: 'Настройки' },
  argTypes: {
    children, className,
    style: { description: 'Стандартные CSS-свойства React для контейнера, например gap.', control: 'object', table: { type: { summary: 'CSSProperties' } } },
  },
  render: ({ children, ...args }) => <Row {...args}><Icon name="settings" /><Text>{children}</Text></Row>,
} satisfies Meta<typeof Row>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Layout: Story = { name: 'В одну строку' };
export const Wrapped: Story = {
  name: 'С переносом',
  render: args => <Row {...args} style={{ maxWidth: '7em', flexWrap: 'wrap' }}><Text>Устройство</Text><Text>подключено</Text></Row>,
};
