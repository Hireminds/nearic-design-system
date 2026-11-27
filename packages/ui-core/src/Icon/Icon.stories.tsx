import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, Row, Text, iconNames } from '@nearic/ui-box';
import { className, docs, size, stringProp, symbol, tone } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Icon', component: Icon,
  parameters: docs(usage),
  args: { name: 'wifi', tone: 'network', size: 'regular' },
  argTypes: { name: symbol, size, tone, label: stringProp('Смысловое название. При отсутствии имени декоративный SVG скрыт от программы чтения с экрана.'), className },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Network: Story = { name: 'Обычная' };
export const Named: Story = { name: 'С доступным именем', args: { name: 'warning', tone: 'warning', label: 'Внимание', size: 'large' } };
export const Small: Story = { name: 'Маленькая', args: { size: 'small' } };
export const Large: Story = { name: 'Крупная', args: { size: 'large' } };
export const Caption: Story = { name: 'С подписью', render: args => <Row><Icon {...args} /><Text>Wi-Fi</Text></Row> };
export const AllIcons: Story = {
  name: 'Все пиктограммы',
  render: args => <div style={{display: 'grid', gap: 'var(--space-gap)', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))'}}>
    {iconNames.map(name => <Row key={name}><Icon {...args} name={name} /><Text variant="label">{name}</Text></Row>)}
  </div>,
};
