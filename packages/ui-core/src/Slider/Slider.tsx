import * as React from 'react';
import { classNames } from '../classNames.js';
import type { LabeledInputProps } from '../input.js';
import styles from './Slider.module.css';

export type SliderProps = Omit<LabeledInputProps, 'checked' | 'defaultChecked' | 'value' | 'defaultValue'> & (
  | { value?: number | string; defaultValue?: never }
  | { value?: never; defaultValue?: number | string }
);
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {label, className, ...props}, ref
) {
  return <input {...props} ref={ref} type="range" aria-label={label} className={classNames('nr-slider', styles.root, className)}/>;
});
