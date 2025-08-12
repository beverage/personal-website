import { LayeredStarField } from '@/components/starfield/LayeredStarField'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LayeredStarField> = {
	title: 'Starfield/StardustVariants',
	component: LayeredStarField,
	parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
	argTypes: {
		clusterVariant: {
			control: 'select',
			options: [
				'cluster-ellipse-4x',
				'cluster-ellipse-4x-center-bright-1',
				'cluster-ellipse-4x-center-bright-2',
				'cluster-ellipse-4x-center-close-1',
				'cluster-ellipse-4x-center-close-2',
			],
		},
		stardustVariant: {
			control: 'select',
			options: ['halo', 'sparkle', 'bloom', 'nebula'],
		},
		opacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
		fadeInDuration: {
			control: { type: 'number', min: 0, max: 10000, step: 100 },
		},
		fadeOutDuration: {
			control: { type: 'number', min: 0, max: 10000, step: 100 },
		},
	},
	args: { opacity: 1, fadeInDuration: 3000, fadeOutDuration: 3000 },
}
export default meta
type Story = StoryObj<typeof meta>

export const Halo: Story = {
	args: { clusterVariant: 'cluster-ellipse-4x', stardustVariant: 'halo' },
}
export const Sparkle: Story = {
	args: { clusterVariant: 'cluster-ellipse-4x', stardustVariant: 'sparkle' },
}
export const Bloom: Story = {
	args: { clusterVariant: 'cluster-ellipse-4x', stardustVariant: 'bloom' },
}
export const Nebula: Story = {
	args: { clusterVariant: 'cluster-ellipse-4x', stardustVariant: 'nebula' },
}
