import { BrandPanel } from '@/components/ui/BrandPanel'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof BrandPanel> = {
	title: 'UI/BrandPanel',
	component: BrandPanel,
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
		brandName: {
			control: 'text',
			description: 'The brand name to display',
		},
		className: {
			control: 'text',
			description: 'Additional CSS classes',
		},
	},
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		brandName: 'beverage.me',
	},
}

export const CustomBrand: Story = {
	args: {
		brandName: 'your-brand.com',
	},
}

export const LongBrandName: Story = {
	args: {
		brandName: 'really-long-brand-name.co.uk',
	},
}
