import * as React from 'react';
import { classNames } from '../classNames.js';
import { Button, type ButtonProps } from '../Button/index.js';
import { Icon, type IconName } from '../Icon/index.js';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonProps, 'name' | 'children'> {
  name: IconName;
  label: string;
}
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {name, label, variant='secondary', className, ...props}, ref
) {
  return <Button {...props} ref={ref} className={classNames('nr-icon-button', styles.root, className)} aria-label={label}
    variant={variant}><Icon name={name}/></Button>;
});
