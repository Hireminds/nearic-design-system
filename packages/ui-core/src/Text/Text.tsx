import * as React from 'react';
import { classNames } from '../classNames.js';
import styles from './Text.module.css';

export type TextVariant = 'body' | 'heading' | 'title' | 'label' | 'control';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TextVariant;
  muted?: boolean;
}
export const Text = React.forwardRef<HTMLSpanElement, TextProps>(function Text(
  {variant='body', muted=false, className, ...props}, ref
) {
  return <span {...props} ref={ref} className={classNames('nr-text', styles.root, className)} data-variant={variant}
    data-muted={muted ? '' : undefined}/>;
});
