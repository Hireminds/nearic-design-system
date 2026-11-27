import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@nearic/ui-box';
import { children, className, docs } from '../../../../storybook/stories/props';
import usage from './docs.md?raw';

const meta = {
  title: 'BOX/Card', component: Card,
  parameters: docs(usage),
  args: { children: 'Настройки звука' },
  argTypes: { children, className },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Surface: Story = { name: 'Содержимое' };
