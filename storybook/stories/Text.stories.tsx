import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '@nearic/ui-box';
import { bool, children, className, docs, textVariant } from './props';

const meta = {
  title: 'BOX/Text', component: Text,
  parameters: docs('Текст использует типографическую роль и оттенок из темы BOX. В DOM компонент выводит span.'),
  args: { children: 'Настройки', variant: 'body', muted: false },
  argTypes: { children, variant: textVariant, muted: bool('Использовать цвет вторичного текста.', 'false'), className },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Body: Story = {};
export const Title: Story = { args: { variant: 'title' } };
export const Caption: Story = { args: { variant: 'label', muted: true, children: 'Сеть изменена' } };
