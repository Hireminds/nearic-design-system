import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DecisionActions } from '@nearic/ui-box';
import { callback, className, disabled, docs, stringProp, variantProp } from './props';

const meta = {
  title: 'BOX/DecisionActions', component: DecisionActions,
  parameters: docs('Пара действий для короткого вопроса. Оба выбора вызывают один обработчик с именем действия. В панели Actions виден его аргумент.'),
  args: { onDecision: fn(), primaryLabel: 'Запустить', secondaryLabel: 'Позже', primaryVariant: 'primary', secondaryVariant: 'secondary', disabled: false },
  argTypes: {
    primaryLabel: stringProp('Подпись основного действия.', false, 'Запустить'),
    secondaryLabel: stringProp('Подпись дополнительного действия.', false, 'Позже'),
    primaryVariant: variantProp('primary'), secondaryVariant: variantProp('secondary'),
    onDecision: callback('Получает роль выбранного действия.', "(choice: 'primary' | 'secondary') => void", true),
    disabled, className,
  },
} satisfies Meta<typeof DecisionActions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Choose: Story = {};
export const Disabled: Story = { args: { disabled: true } };
