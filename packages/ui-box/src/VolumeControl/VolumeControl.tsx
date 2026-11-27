import { Card, Icon, IconButton, Progress, Row, Stack, Text } from '@nearic/ui-core';
import styles from './VolumeControl.module.css';

export interface VolumeControlProps {
  /** @labelKey props.volumeControl.value */
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
  disabled?: boolean;
  className?: string;
}
export function VolumeControl({value, onChange, label='Громкость', step=10, disabled=false, className=''}: VolumeControlProps) {
  const level = Math.max(0, Math.min(value, 100));
  return <Card className={['nr-volume', 'box-volume', styles.root, className].join(' ')}>
    <Stack className={styles.content}>
      <Row className={'nr-volume-title ' + styles.title}><Icon name="volume" tone="sound"/><Text variant="heading">{label}</Text>
        <output className={'nr-trailing ' + styles.value} aria-live="polite">{level}%</output></Row>
      <Row className={'nr-volume-rail ' + styles.rail}>
        <IconButton name="minus" label="Убавить громкость" data-step={-step} disabled={disabled || level<=0} onClick={()=>onChange(Math.max(0,level-step))}/>
        <Progress label={label} value={level}/>
        <IconButton name="plus" label="Прибавить громкость" data-step={step} disabled={disabled || level>=100} onClick={()=>onChange(Math.min(100,level+step))}/>
      </Row>
    </Stack>
  </Card>;
}
