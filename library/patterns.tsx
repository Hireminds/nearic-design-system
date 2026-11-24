import * as React from 'react';
import { Button, Icon, IconButton, Progress, Row, Stack, StatusIndicator, Switch, Text, type ButtonVariant } from './primitives.js';

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
    <Text variant="label" className="nr-trailing" muted data-field="connection">{online?value:'Вне сети'}</Text>
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

export interface SettingRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  className?: string;
}
export function SettingRow({label, description, checked, onChange, disabled=false, className=''}: SettingRowProps) {
  const descriptionId=React.useId();
  return <label className={'nr-setting '+className}>
    <Stack><Text>{label}</Text>{description && <Text variant="label" muted id={descriptionId} data-field="switch-status">{description}</Text>}</Stack>
    <Switch label={label} checked={checked} disabled={disabled} onChange={onChange} aria-describedby={description?descriptionId:undefined}/>
  </label>;
}

export interface DeviceCardProps {
  name: string;
  conversation?: string;
  online: boolean;
  imageSrc?: string;
  children?: React.ReactNode;
  className?: string;
}
export function DeviceCard({name, conversation, online, imageSrc, children, className=''}:DeviceCardProps) {
  return <article className={'nr-device-card device-card '+className} data-network={online?'online':'offline'}>
    <Stack className="nr-device-copy">
      <StatusIndicator tone={online?'success':'neutral'} data-field="connection">{online?'На связи':'Вне сети'}</StatusIndicator>
      <Text variant="title">{name}</Text>
      {conversation && <Row><Icon name="message" size="small"/><Text variant="label">{conversation}</Text></Row>}
      {children}
    </Stack>
    {imageSrc && <svg className="nr-device-portrait" aria-hidden="true" viewBox="0 0 258 280">
      <image href={imageSrc} width="258" height="280"/>
      <path d="M91 77 170 57.9 198.1 132 119.5 159Z" fill="var(--colors-canvas)"/>
      {online && <g transform="matrix(.90,-.25,.32,.86,125,105)" fill="none" stroke="var(--colors-accent)" strokeLinecap="round" strokeWidth="3.9"><path d="M0 0v4m6-11v18m6-24v31m6-26v21m6-19v14m6-10v6"/></g>}
    </svg>}
  </article>;
}
