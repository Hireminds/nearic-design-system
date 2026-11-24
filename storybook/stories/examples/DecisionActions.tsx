import { useState } from 'react';
import { DecisionActions } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export default function Example() {
  const [choice, setChoice] = useState<'primary' | 'secondary' | null>(null);
  return (
    <div data-family="box" data-platform="box">
      <DecisionActions primaryLabel="Запустить" secondaryLabel="Позже"
        disabled={choice !== null} onDecision={setChoice} />
      <output>{choice === null ? '' : choice === 'primary' ? 'Запущено' : 'Отложено'}</output>
    </div>
  );
}
