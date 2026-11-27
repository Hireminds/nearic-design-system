import * as React from 'react';
import { classNames } from '../classNames.js';
import type { LabeledInputProps } from '../input.js';
import styles from './Switch.module.css';

export type SwitchProps = Omit<LabeledInputProps, 'checked' | 'defaultChecked' | 'min' | 'max' | 'step'> & (
  | { checked?: boolean; defaultChecked?: never }
  | { checked?: never; defaultChecked?: boolean }
);
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {label, className, ...props}, ref
) {
  return <input {...props} ref={ref} type="checkbox" role="switch" aria-label={label} className={classNames('nr-switch', styles.root, className)}/>;
});
