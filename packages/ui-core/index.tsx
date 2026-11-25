import * as React from 'react';

const paths = {
  wifi: 'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01',
  volume: 'M4 9h3l5-4v14l-5-4H4zm12-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  minus: 'M5 12h14',
  plus: 'M5 12h14m-7-7v14',
  message: 'M20.5 11.5c0 4.4-3.7 8-8.5 8-1.3 0-2.5-.2-3.7-.7L3 20.5l1.5-5c-.8-1.2-1.1-2.5-1.1-4 0-4.4 3.8-8 8.6-8s8.5 3.6 8.5 8Z',
  box: 'M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 17h8m-4-3v3',
  device: 'M5 3.4h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Zm.6 2h11.8a.9.9 0 0 1 .9.9v6.3a.9.9 0 0 1-.9.9H5.6a.9.9 0 0 1-.9-.9V6.3a.9.9 0 0 1 .9-.9ZM5 16.4l-2 2v2h18v-2l-2-2M3 18.4h18',
  next: 'm9 6 6 6-6 6',
  wave: 'M2 11v2m4-6v10m4-15v20m4-16v13m4-11v9m4-6v2',
  back: 'm10 5-7 7 7 7M3 12h18',
  settings: 'M3 7h5m5 0h8M3 17h9m5 0h4M13 7a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0Zm4 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0Z',
  warning: 'm10.4 4.6-8 14A1.6 1.6 0 0 0 3.8 21h16.4a1.6 1.6 0 0 0 1.4-2.4l-8-14a1.8 1.8 0 0 0-3.2 0ZM12 9v5m0 3h.01',
  check: 'm4 12 5 5L20 6',
  close: 'm6 6 12 12m0-12L6 18',
  bell: 'M5 16c2-2 2-4 2-6a5 5 0 0 1 10 0c0 2 0 4 2 6l1 2H4Zm5 5a3 3 0 0 0 4 0',
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6m0-10h.01'
} as const;
export type IconName = keyof typeof paths;
export const iconNames = Object.freeze(Object.keys(paths) as IconName[]);
export type Tone = 'inherit' | 'neutral' | 'network' | 'sound' | 'info' | 'success' | 'warning' | 'error';
export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
export type TextVariant = 'body' | 'heading' | 'title' | 'label' | 'control';

const cls = (base: string, custom?: string) => custom ? base + ' ' + custom : base;

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'children'> {
  name: IconName;
  label?: string;
  tone?: Tone;
  size?: 'small' | 'regular' | 'large';
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  {name, label, tone='inherit', size='regular', className, ...props}, ref
) {
  const accessibleLabel = label || props['aria-label'];
  const labeled = !!(accessibleLabel || props['aria-labelledby']);
  return <svg {...props} ref={ref} className={cls('nr-icon', className)} viewBox="0 0 24 24"
    data-size={size} data-tone={tone} focusable="false" aria-hidden={labeled ? undefined : true}
    role={labeled ? 'img' : undefined} aria-label={accessibleLabel}><path d={paths[name]}/></svg>;
});

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TextVariant;
  muted?: boolean;
}
export const Text = React.forwardRef<HTMLSpanElement, TextProps>(function Text(
  {variant='body', muted=false, className, ...props}, ref
) {
  return <span {...props} ref={ref} className={cls('nr-text', className)} data-variant={variant}
    data-muted={muted ? '' : undefined}/>;
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {variant='primary', type='button', className, ...props}, ref
) {
  return <button {...props} ref={ref} className={cls('nr-button', className)} type={type} data-variant={variant}/>;
});

export interface IconButtonProps extends Omit<ButtonProps, 'name' | 'children'> {
  name: IconName;
  label: string;
}
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {name, label, variant='secondary', className, ...props}, ref
) {
  return <Button {...props} ref={ref} className={cls('nr-icon-button', className)} aria-label={label}
    variant={variant}><Icon name={name}/></Button>;
});

type LabeledInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {label: string};
export type SwitchProps = Omit<LabeledInputProps, 'checked' | 'defaultChecked' | 'min' | 'max' | 'step'> & (
  | { checked?: boolean; defaultChecked?: never }
  | { checked?: never; defaultChecked?: boolean }
);
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {label, className, ...props}, ref
) {
  return <input {...props} ref={ref} type="checkbox" role="switch" aria-label={label} className={cls('nr-switch', className)}/>;
});

export type SliderProps = Omit<LabeledInputProps, 'checked' | 'defaultChecked' | 'value' | 'defaultValue'> & (
  | { value?: number | string; defaultValue?: never }
  | { value?: never; defaultValue?: number | string }
);
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {label, className, ...props}, ref
) {
  return <input {...props} ref={ref} type="range" aria-label={label} className={cls('nr-slider', className)}/>;
});

export interface ProgressProps extends React.ProgressHTMLAttributes<HTMLProgressElement> {
  label: string;
}
export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(function Progress(
  {label, max=100, className, ...props}, ref
) {
  return <progress {...props} ref={ref} max={max} aria-label={label} className={cls('nr-progress', className)}/>;
});

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
}
export const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(function StatusIndicator(
  {tone='neutral', children, className, ...props}, ref
) {
  return <span {...props} ref={ref} className={cls('nr-status', className)} data-tone={tone}>
    <i aria-hidden="true" className="nr-status-mark"/><Text variant="label">{children}</Text>
  </span>;
});

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {href: string};
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link({className, ...props}, ref) {
  return <a {...props} ref={ref} className={cls('nr-link', className)}/>;
});

export type LayoutProps = React.HTMLAttributes<HTMLDivElement>;
export const Row = React.forwardRef<HTMLDivElement, LayoutProps>(function Row({className, ...props}, ref) {
  return <div {...props} ref={ref} className={cls('nr-row', className)}/>;
});
export const Stack = React.forwardRef<HTMLDivElement, LayoutProps>(function Stack({className, ...props}, ref) {
  return <div {...props} ref={ref} className={cls('nr-stack', className)}/>;
});
