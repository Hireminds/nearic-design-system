import * as React from 'react';
import { classNames } from '../classNames.js';
import styles from './Progress.module.css';

export interface ProgressProps extends React.ProgressHTMLAttributes<HTMLProgressElement> {
  label: string;
}
export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(function Progress(
  {label, max=100, className, ...props}, ref
) {
  return <progress {...props} ref={ref} max={max} aria-label={label} className={classNames('nr-progress', styles.root, className)}/>;
});
