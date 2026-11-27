import entry from './component.json';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '@nearic/ui-box';
import { bool, children, className, docs, textVariant } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Text', component: Text,
  parameters: docs(entry.usage),
  args: { children: 'Настройки', variant: 'body', muted: false },
  argTypes: { children, variant: textVariant, muted: bool('Использовать цвет вторичного текста.', 'false'), className },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Body: Story = { name: 'Основной' };
export const Title: Story = { name: 'Заголовок', args: { variant: 'title' } };
export const Caption: Story = { name: 'Подпись', args: { variant: 'label', muted: true, children: 'Сеть изменена' } };
