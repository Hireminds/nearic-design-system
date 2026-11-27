import { Card, Icon, Row, Text } from '@nearic/ui-core';
import styles from './NetworkRow.module.css';

export interface NetworkRowProps {
  value: string;
  online: boolean;
  className?: string;
}
export function NetworkRow({value, online, className=''}: NetworkRowProps) {
  return <Card className={['nr-network', styles.root, className].join(' ')} data-network={online?'online':'offline'}>
    <Row className={styles.content}>
      <Icon name="wifi" tone={online?'network':'inherit'}/><Text>Wi-Fi</Text>
      <Text variant="label" className={'nr-trailing ' + styles.value} muted data-field="connection" title={online ? value : undefined}>
        {online ? value : 'Вне сети'}
      </Text>
    </Row>
  </Card>;
}
