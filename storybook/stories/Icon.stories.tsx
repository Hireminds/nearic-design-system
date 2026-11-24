import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@nearic/ui-box';
import { className, docs, size, stringProp, symbol, tone } from './props';

const meta = {
  title: 'BOX/Icon', component: Icon,
  parameters: docs('Пиктограмма передаёт функцию или состояние. Задайте label самостоятельному знаку. Пиктограмма рядом с текстом может быть декоративной.'),
  args: { name: 'wifi', tone: 'network', size: 'regular' },
  argTypes: { name: symbol, size, tone, label: stringProp('Смысловое название. При отсутствии имени декоративный SVG скрыт от программы чтения с экрана.'), className },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Network: Story = {};
export const Named: Story = { args: { name: 'warning', tone: 'warning', label: 'Внимание', size: 'large' } };
