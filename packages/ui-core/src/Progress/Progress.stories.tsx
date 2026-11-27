import entry from './component.json';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '@nearic/ui-box';
import { className, docs, label, numeric } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Progress', component: Progress,
  parameters: docs(entry.usage),
  args: { label: 'Загрузка', max: 100, value: 60 },
  argTypes: { label, value: numeric('Текущий объём выполнения. Без значения длительность неизвестна.', { type: 'number | string | readonly string[]' }), max: numeric('Верхняя граница шкалы.', { initial: '100', type: 'number | string' }), className },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Determinate: Story = { name: 'Частично заполнена' };
export const Indeterminate: Story = { name: 'Неопределённая', args: { value: undefined } };
export const Empty: Story = { name: 'Пустая', args: { value: 0 } };
export const Complete: Story = { name: 'Заполнена', args: { value: 100 } };
