import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ControlPanel } from '@/components/ui/ControlPanel';

const meta: Meta<typeof ControlPanel> = {
  title: 'UI/ControlPanel',
  component: ControlPanel,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    darkMode: {
      control: 'boolean',
      description: 'Whether dark mode is active (affects icon)',
    },
    onToggle: {
      description: 'Callback when toggle is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    onToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkMode: Story = {
  args: {
    darkMode: true,
  },
};

export const LightMode: Story = {
  args: {
    darkMode: false,
  },
}; 