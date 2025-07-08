import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { PageLayout } from '@/components/ui/PageLayout';

const meta: Meta<typeof PageLayout> = {
  title: 'UI/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    showStarField: {
      control: 'boolean',
      description: 'Whether to show the animated star field background',
    },
    brandName: {
      control: 'text',
      description: 'Brand name in top-left corner',
    },
    heroTitle: {
      control: 'text',
      description: 'Main hero title',
    },
    heroDescription: {
      control: 'text',
      description: 'Hero description text',
    },
    onPrimaryClick: {
      description: 'Callback for hero primary button',
    },
    onSecondaryClick: {
      description: 'Callback for hero secondary button',
    },
    children: {
      description: 'Custom content to replace default hero section',
    },
  },
  args: {
    onPrimaryClick: fn(),
    onSecondaryClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showStarField: true,
    brandName: 'beverage.me',
    heroTitle: 'Coming Soon',
    heroDescription: 'Finally.',
  },
};

export const Portfolio: Story = {
  args: {
    showStarField: true,
    brandName: 'Alex Beverage',
    heroTitle: 'Full-Stack Developer',
    heroDescription: 'Building beautiful, performant web applications with modern technologies.',
  },
};

export const NoStarField: Story = {
  args: {
    showStarField: false,
    brandName: 'beverage.me',
    heroTitle: 'Clean Layout',
    heroDescription: 'Same layout without the animated background.',
  },
};

export const CustomContent: Story = {
  args: {
    showStarField: true,
    brandName: 'Custom Brand',
  },
  render: (args) => (
    <PageLayout {...args}>
      <div className="text-center max-w-3xl">
        <h2 className="text-4xl font-bold mb-4 text-cyan-400">Custom Content</h2>
        <p className="text-lg text-white/80 mb-8">
          You can replace the default hero section with any custom content by passing children to PageLayout.
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
          <p className="text-white">This could be a form, image gallery, or any other content!</p>
        </div>
      </div>
    </PageLayout>
  ),
}; 