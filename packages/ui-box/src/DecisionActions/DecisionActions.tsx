import { Button, Row, type ButtonVariant } from '@nearic/ui-core';
import styles from './DecisionActions.module.css';

export interface DecisionActionsProps {
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryVariant?: ButtonVariant;
  secondaryVariant?: ButtonVariant;
  onDecision: (choice: 'primary' | 'secondary') => void;
  disabled?: boolean;
  className?: string;
}
export function DecisionActions({
  primaryLabel='Запустить', secondaryLabel='Позже', primaryVariant='primary', secondaryVariant='secondary',
  onDecision, disabled=false, className=''
}: DecisionActionsProps) {
  return <Row className={['nr-decision', styles.root, className].join(' ')}>
    <Button variant={secondaryVariant} disabled={disabled} data-answer="Отложено" onClick={()=>onDecision('secondary')}>{secondaryLabel}</Button>
    <Button variant={primaryVariant} disabled={disabled} data-answer={primaryLabel} onClick={()=>onDecision('primary')}>{primaryLabel}</Button>
  </Row>;
}
