import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { StarField } from './StarField';

const meta: Meta<typeof StarField> = {
  title: 'Starfield/StarField',
  component: StarField,
  decorators: [
    (Story) => (
      <div 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: '#000000',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'light', value: '#f0f0f0' },
      ],
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['twinkle', 'twinkle-small', 'twinkle-compact', 'twinkle-minimal', 'twinkle-pulse'],
    },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
    starCount: {
      control: { type: 'range', min: 100, max: 8000, step: 100 },
    },
    speed: {
      control: { type: 'range', min: 10, max: 2000, step: 10 },
    },
    rollSpeed: {
      control: { type: 'range', min: -5, max: 5, step: 0.1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'twinkle-compact',
    opacity: 1.0,
  },
};

export const TwinkleClassic: Story = {
  args: {
    variant: 'twinkle',
    opacity: 1.0,
  },
};

export const TwinkleSmall: Story = {
  args: {
    variant: 'twinkle-small',
    opacity: 1.0,
  },
};

export const TwinkleCompact: Story = {
  args: {
    variant: 'twinkle-compact',
    opacity: 1.0,
  },
};

export const TwinkleMinimal: Story = {
  args: {
    variant: 'twinkle-minimal',
    opacity: 1.0,
  },
};

export const TwinklePulse: Story = {
  args: {
    variant: 'twinkle-pulse',
    opacity: 1.0,
    starCount: 5000,
    speed: 1000,
    rollSpeed: -2
  },
};

export const BackgroundStars: Story = {
  args: {
    variant: 'twinkle-minimal',
    opacity: 0.3,
    starCount: 2000,
  },
};

export const FastMovement: Story = {
  args: {
    variant: 'twinkle-compact',
    speed: 100,
    rollSpeed: 1.0,
    starCount: 1000,
  },
};

export const SlowDrift: Story = {
  args: {
    variant: 'twinkle',
    speed: 1500,
    rollSpeed: -0.5,
    starCount: 5000,
  },
}; 