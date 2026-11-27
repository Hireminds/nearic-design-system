import * as React from 'react';
import { classNames } from '../classNames.js';
import { Text } from '../Text/index.js';
import styles from './StatusIndicator.module.css';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
}
export const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(function StatusIndicator(
  {tone='neutral', children, className, ...props}, ref
) {
  return <span {...props} ref={ref} className={classNames('nr-status', styles.root, className)} data-tone={tone}>
    <i aria-hidden="true" className={classNames('nr-status-mark', styles.mark)}/><Text variant="label">{children}</Text>
  </span>;
});
