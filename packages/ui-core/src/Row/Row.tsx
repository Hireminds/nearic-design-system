import * as React from 'react';
import { classNames } from '../classNames.js';
import type { LayoutProps } from '../layout.js';
import styles from './Row.module.css';

export const Row = React.forwardRef<HTMLDivElement, LayoutProps>(function Row({className, ...props}, ref) {
  return <div {...props} ref={ref} className={classNames('nr-row', styles.root, className)}/>;
});
