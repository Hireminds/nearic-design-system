import type { Meta, StoryObj } from '@storybook/react-vite';
import { NetworkRow } from '@nearic/ui-box';
import { bool, className, docs, stringProp } from './props';

const meta = {
  title: 'BOX/NetworkRow', component: NetworkRow,
  parameters: docs('Строка Wi-Fi показывает имя подключённой сети. Длинное имя визуально сокращается, в тексте и подсказке остаётся полное значение. При online=false строка выводит «Вне сети».'),
  args: { value: 'Домашняя', online: true },
  argTypes: { value: stringProp('Отображаемое имя сети.', true), online: bool('Подключение к сети установлено.', undefined, true), className },
} satisfies Meta<typeof NetworkRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Online: Story = {};
export const LongName: Story = { args: { value: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW' } };
export const Offline: Story = { args: { online: false } };
