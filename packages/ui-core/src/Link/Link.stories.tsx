import { showFocus } from '../../../../storybook/stories/showFocus';
import usage from './docs.md?raw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from '@nearic/ui-box';
import { callback, children, className, docs, stringProp } from '../../../../storybook/stories/props';

const meta = {
  title: 'BOX/Link', component: Link,
  parameters: docs(usage),
  args: { href: '#connection', children: 'К состоянию сети' },
  argTypes: {
    href: stringProp('Адрес назначения или якорь.', true), children,
    target: stringProp('Контекст открытия, например _self или _blank.', false, '_self'), rel: stringProp('Отношение к целевому документу.'),
    onClick: callback('Получает событие перед переходом.', 'MouseEventHandler<HTMLAnchorElement>'), className,
  },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Navigation: Story = { name: 'Обычная' };
export const Focus: Story = { name: 'Фокус', decorators: [showFocus] };
