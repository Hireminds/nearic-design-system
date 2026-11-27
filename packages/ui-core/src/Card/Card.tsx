import * as React from 'react';
import { classNames } from '../classNames.js';
import styles from './Card.module.css';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card({className, ...props}, ref) {
  return <div {...props} ref={ref} className={classNames('nr-card', styles.root, className)}/>;
});
