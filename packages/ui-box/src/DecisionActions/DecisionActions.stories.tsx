import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useLayoutEffect, useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import { Button, DecisionActions, Stack, type DecisionActionsProps } from '@nearic/ui-box';
import { callback, className, docs, stringProp, variantProp } from '../../../../storybook/stories/props';

type Answer = 'primary' | 'secondary';

function DecisionSample({initial, setDisabled, ...props}: DecisionActionsProps & {
  initial?: Answer;
  setDisabled: (disabled: boolean) => void;
}) {
  const [answer, setAnswer] = useState(initial);
  const choices = useRef<HTMLDivElement>(null);
  const reset = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);

  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    const next = answer ? reset.current : choices.current?.querySelector<HTMLButtonElement>('button:enabled');
    if (next) {
      next.focus();
      moveFocus.current = false;
    }
  }, [answer, props.disabled]);

  return <Stack>
    <div ref={choices}><DecisionActions {...props} onDecision={choice => {
      moveFocus.current = true;
      setAnswer(choice);
      setDisabled(true);
      props.onDecision(choice);
    }} /></div>
    <output data-feedback aria-live="polite">{answer === 'primary' ? 'Подтверждено' : answer === 'secondary' ? 'Отложено' : 'Ожидается ответ'}</output>
    <Button ref={reset} variant="quiet" disabled={!answer} onClick={() => {
      moveFocus.current = true;
      setAnswer(undefined);
      setDisabled(false);
    }}>Сбросить</Button>
  </Stack>;
}

const meta = {
  title: 'BOX/DecisionActions', component: DecisionActions,
  parameters: docs(usage),
  args: { onDecision: fn(), primaryLabel: 'Запустить', secondaryLabel: 'Позже', primaryVariant: 'primary', secondaryVariant: 'secondary', disabled: false },
  render: function Preview(args, {parameters}) {
    const [, updateArgs] = useArgs();
    return <DecisionSample {...args} initial={parameters.answer} setDisabled={disabled => updateArgs({disabled})} />;
  },
  argTypes: {
    primaryLabel: stringProp('Подпись основного действия.', false, 'Запустить'),
    secondaryLabel: stringProp('Подпись дополнительного действия.', false, 'Позже'),
    primaryVariant: variantProp('primary'), secondaryVariant: variantProp('secondary'),
    onDecision: callback('Получает роль выбранного действия.', "(choice: 'primary' | 'secondary') => void", true),
    className,
  },
} satisfies Meta<typeof DecisionActions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Choose: Story = { name: 'Ожидание' };
export const Disabled: Story = { name: 'Недоступны', args: { disabled: true } };
export const Accepted: Story = {
  name: 'Подтверждено', args: { disabled: true },
  parameters: { answer: 'primary' },
};
export const Deferred: Story = {
  name: 'Отложено', args: { disabled: true },
  parameters: { answer: 'secondary' },
};
