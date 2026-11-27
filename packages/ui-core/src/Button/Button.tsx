import * as React from 'react';
import { classNames } from '../classNames.js';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {variant='primary', type='button', className, ...props}, ref
) {
  return <button {...props} ref={ref} className={classNames('nr-button', styles.root, className)} type={type} data-variant={variant}/>;
});
