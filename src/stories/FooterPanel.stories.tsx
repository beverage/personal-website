import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FooterPanel } from '@/components/ui/FooterPanel';

const meta: Meta<typeof FooterPanel> = {
  title: 'UI/FooterPanel',
  component: FooterPanel,
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
    year: {
      control: 'number',
      description: 'Copyright year',
    },
    socialLinks: {
      control: 'object',
      description: 'Array of social media links',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    year: 2025,
    socialLinks: [
      { icon: 'github', href: '#', label: 'GitHub' },
      { icon: 'linkedin', href: '#', label: 'LinkedIn' },
      { icon: 'mail', href: '#', label: 'Email' },
    ],
  },
};

export const CustomYear: Story = {
  args: {
    year: 2024,
    socialLinks: [
      { icon: 'github', href: 'https://github.com/username', label: 'GitHub' },
      { icon: 'linkedin', href: 'https://linkedin.com/in/username', label: 'LinkedIn' },
      { icon: 'mail', href: 'mailto:hello@example.com', label: 'Email' },
    ],
  },
};

export const MinimalSocial: Story = {
  args: {
    year: 2025,
    socialLinks: [
      { icon: 'github', href: '#', label: 'GitHub' },
      { icon: 'mail', href: '#', label: 'Email' },
    ],
  },
}; 