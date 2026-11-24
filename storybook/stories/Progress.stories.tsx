import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '@nearic/ui-box';
import { className, docs, label, numeric } from './props';

const meta = {
  title: 'BOX/Progress', component: Progress,
  parameters: docs('Индикатор показывает долю от max. Если значение value отсутствует, браузер показывает неопределённый прогресс.'),
  args: { label: 'Загрузка', max: 100, value: 60 },
  argTypes: { label, value: numeric('Текущий объём выполнения. Без значения длительность неизвестна.', { type: 'number | string | readonly string[]' }), max: numeric('Верхняя граница шкалы.', { initial: '100', type: 'number | string' }), className },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Determinate: Story = {};
export const Indeterminate: Story = { args: { value: undefined } };
