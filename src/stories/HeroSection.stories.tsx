import { HeroSection } from '@/components/ui/HeroSection'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

const meta: Meta<typeof HeroSection> = {
	title: 'UI/HeroSection',
	component: HeroSection,
	parameters: {
		layout: 'fullscreen',
		backgrounds: {
			default: 'dark',
			values: [
				{ name: 'dark', value: '#000000' },
				{ name: 'light', value: '#ffffff' },
			],
		},
	},
	decorators: [
		Story => (
			<div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
				<Story />
			</div>
		),
	],
	tags: ['autodocs'],
	argTypes: {
		title: {
			control: 'text',
			description: 'Main heading text',
		},
		description: {
			control: 'text',
			description: 'Description text below title',
		},
		primaryButtonText: {
			control: 'text',
			description: 'Text for the primary (filled) button',
		},
		secondaryButtonText: {
			control: 'text',
			description: 'Text for the secondary (outline) button',
		},
		onPrimaryClick: {
			description: 'Callback for primary button click',
		},
		onSecondaryClick: {
			description: 'Callback for secondary button click',
		},
	},
	args: {
		onPrimaryClick: fn(),
		onSecondaryClick: fn(),
	},
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		title: 'Coming Soon',
		description: 'Finally.',
		primaryButtonText: 'Get In Touch',
		secondaryButtonText: 'Explore Projects',
	},
}

export const Portfolio: Story = {
	args: {
		title: 'Alex Beverage',
		description:
			'Full-stack developer, designer, and digital creator building the future one project at a time.',
		primaryButtonText: 'Hire Me',
		secondaryButtonText: 'View Portfolio',
	},
}

export const Product: Story = {
	args: {
		title: 'Revolutionary App',
		description:
			'Transform the way you work with our cutting-edge productivity platform.',
		primaryButtonText: 'Start Free Trial',
		secondaryButtonText: 'Learn More',
	},
}
