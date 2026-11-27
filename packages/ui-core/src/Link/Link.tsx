import * as React from 'react';
import { classNames } from '../classNames.js';
import styles from './Link.module.css';

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {href: string};
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link({className, ...props}, ref) {
  return <a {...props} ref={ref} className={classNames('nr-link', styles.root, className)}/>;
});
