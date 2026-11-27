import * as React from 'react';
import { classNames } from '../classNames.js';
import type { LayoutProps } from '../layout.js';
import styles from './Stack.module.css';

export const Stack = React.forwardRef<HTMLDivElement, LayoutProps>(function Stack({className, ...props}, ref) {
  return <div {...props} ref={ref} className={classNames('nr-stack', styles.root, className)}/>;
});
