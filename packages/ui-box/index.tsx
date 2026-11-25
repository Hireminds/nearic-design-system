export * from '@nearic/ui-core';
import { Button, Icon, IconButton, Progress, Row, Stack, Text, type ButtonVariant } from '@nearic/ui-core';

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
  return <Row className={'nr-decision '+className}>
    <Button variant={secondaryVariant} disabled={disabled} data-answer="Отложено" onClick={()=>onDecision('secondary')}>{secondaryLabel}</Button>
    <Button variant={primaryVariant} disabled={disabled} data-answer={primaryLabel} onClick={()=>onDecision('primary')}>{primaryLabel}</Button>
  </Row>;
}

export interface NetworkRowProps {
  value: string;
  online: boolean;
  className?: string;
}
export function NetworkRow({value, online, className=''}: NetworkRowProps) {
  return <Row className={'nr-network '+className} data-network={online?'online':'offline'}>
    <Icon name="wifi" tone={online?'network':'inherit'}/><Text>Wi-Fi</Text>
    <Text variant="label" className="nr-trailing" muted data-field="connection" title={online ? value : undefined}>
      {online ? value : 'Вне сети'}
    </Text>
  </Row>;
}

export interface VolumeControlProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
  disabled?: boolean;
  className?: string;
}
export function VolumeControl({value, onChange, label='Громкость', step=10, disabled=false, className=''}: VolumeControlProps) {
  const level = Math.max(0, Math.min(value, 100));
  return <Stack className={'nr-volume box-volume '+className}>
    <Row className="nr-volume-title"><Icon name="volume" tone="sound"/><Text variant="heading">{label}</Text>
      <output className="nr-trailing" aria-live="polite">{level}%</output></Row>
    <Row className="nr-volume-rail">
      <IconButton name="minus" label="Убавить громкость" data-step={-step} disabled={disabled || level<=0} onClick={()=>onChange(Math.max(0,level-step))}/>
      <Progress label={label} value={level}/>
      <IconButton name="plus" label="Прибавить громкость" data-step={step} disabled={disabled || level>=100} onClick={()=>onChange(Math.min(100,level+step))}/>
    </Row>
  </Stack>;
}
