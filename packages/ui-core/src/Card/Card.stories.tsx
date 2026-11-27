import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@nearic/ui-box';
import { children, className, docs } from '../../../../storybook/stories/props';
import entry from './component.json';

const meta = {
  title: 'BOX/Card', component: Card,
  parameters: docs(entry.usage),
  args: { children: 'Настройки звука' },
  argTypes: { children, className },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Surface: Story = { name: 'Содержимое' };
