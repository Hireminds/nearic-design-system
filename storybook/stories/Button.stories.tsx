import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '@nearic/ui-box';
import { buttonType, children, className, disabled, docs, onClick, variantProp } from './props';

const meta = {
  title: 'BOX/Button', component: Button,
  parameters: docs('Текстовое действие BOX. Выберите приоритет, измените подпись и нажмите кнопку, чтобы увидеть событие в Actions.'),
  args: { children: 'Подтвердить', variant: 'primary', disabled: false, onClick: fn() },
  argTypes: { children, variant: variantProp('primary'), disabled, type: buttonType, onClick, className },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {};
export const Destructive: Story = { args: { children: 'Удалить', variant: 'destructive' } };
export const Disabled: Story = { args: { disabled: true } };
