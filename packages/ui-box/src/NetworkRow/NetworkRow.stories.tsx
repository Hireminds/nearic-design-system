import entry from './component.json';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NetworkRow } from '@nearic/ui-box';
import { bool, className, docs, stringProp } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/NetworkRow', component: NetworkRow,
  parameters: docs(entry.usage),
  args: { value: 'Домашняя', online: true },
  argTypes: { value: stringProp('Отображаемое имя сети.', true), online: bool('Подключение к сети установлено.', undefined, true), className },
} satisfies Meta<typeof NetworkRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Online: Story = { name: 'На связи' };
export const LongName: Story = { name: 'Длинное имя сети', args: { value: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW' } };
export const Offline: Story = { name: 'Вне сети', args: { online: false } };
