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

// Default story uses environment variables
export const Default: Story = {
  args: {},
};

// Custom configuration example
export const CustomConfiguration: Story = {
  args: {
    year: 2024,
    socialLinks: [
      { icon: 'github', href: 'https://github.com/example', label: 'GitHub' },
      { icon: 'linkedin', href: 'https://linkedin.com/in/example', label: 'LinkedIn' },
      { icon: 'instagram', href: 'https://instagram.com/example', label: 'Instagram' },
      { icon: 'mail', href: 'mailto:hello@example.com', label: 'Email' },
    ],
  },
};

// Minimal social links
export const MinimalSocial: Story = {
  args: {
    year: 2025,
    socialLinks: [
      { icon: 'github', href: 'https://github.com/example', label: 'GitHub' },
      { icon: 'mail', href: 'mailto:hello@example.com', label: 'Email' },
    ],
  },
};

// Professional setup
export const Professional: Story = {
  args: {
    socialLinks: [
      { icon: 'linkedin', href: 'https://linkedin.com/in/example', label: 'LinkedIn' },
      { icon: 'github', href: 'https://github.com/example', label: 'GitHub' },
      { icon: 'mail', href: 'mailto:contact@example.com', label: 'Email' },
    ],
  },
};

// Social media focused
export const SocialMediaFocused: Story = {
  args: {
    socialLinks: [
      { icon: 'instagram', href: 'https://instagram.com/example', label: 'Instagram' },
      { icon: 'github', href: 'https://github.com/example', label: 'GitHub' },
      { icon: 'linkedin', href: 'https://linkedin.com/in/example', label: 'LinkedIn' },
      { icon: 'mail', href: 'mailto:hello@example.com', label: 'Email' },
    ],
  },
}; 