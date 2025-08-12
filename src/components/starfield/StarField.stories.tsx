import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ClusterStarField } from './ClusterStarField'
import { LayeredStarField } from './LayeredStarField'
import { StarField } from './StarField'

const meta: Meta<typeof StarField> = {
	title: 'StarField',
	component: StarField,
	parameters: {
		layout: 'fullscreen',
		backgrounds: { default: 'dark' },
	},
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['twinkle', 'twinkle-compact', 'twinkle-minimal'],
		},
		opacity: {
			control: { type: 'range', min: 0, max: 1, step: 0.1 },
		},
	},
}

export default meta
type Story = StoryObj<typeof StarField>

// Twinkle variants
export const TwinkleClassic: Story = {
	args: {
		variant: 'twinkle',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<StarField {...args} />
		</div>
	),
}

export const TwinkleCompact: Story = {
	args: {
		variant: 'twinkle-compact',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<StarField {...args} />
		</div>
	),
}

export const TwinkleMinimal: Story = {
	args: {
		variant: 'twinkle-minimal',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<StarField {...args} />
		</div>
	),
}

// Cluster variants
type ClusterStory = StoryObj<typeof ClusterStarField>

export const ClusterOriginal: ClusterStory = {
	args: {
		variant: 'cluster-ellipse-4x',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<ClusterStarField {...args} />
		</div>
	),
}

export const ClusterCenterBright1: ClusterStory = {
	args: {
		variant: 'cluster-ellipse-4x-center-bright-1',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<ClusterStarField {...args} />
		</div>
	),
}

export const ClusterCenterBright2: ClusterStory = {
	args: {
		variant: 'cluster-ellipse-4x-center-bright-2',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<ClusterStarField {...args} />
		</div>
	),
}

export const ClusterCenterClose1: ClusterStory = {
	args: {
		variant: 'cluster-ellipse-4x-center-close-1',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<ClusterStarField {...args} />
		</div>
	),
}

export const ClusterCenterClose2: ClusterStory = {
	args: {
		variant: 'cluster-ellipse-4x-center-close-2',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<ClusterStarField {...args} />
		</div>
	),
}

// Layered variants
type LayeredStory = StoryObj<typeof LayeredStarField>

export const LayeredOriginal: LayeredStory = {
	args: {
		clusterVariant: 'cluster-ellipse-4x',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<LayeredStarField {...args} />
		</div>
	),
}

export const LayeredCenterBright1: LayeredStory = {
	args: {
		clusterVariant: 'cluster-ellipse-4x-center-bright-1',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<LayeredStarField {...args} />
		</div>
	),
}

export const LayeredCenterBright2: LayeredStory = {
	args: {
		clusterVariant: 'cluster-ellipse-4x-center-bright-2',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<LayeredStarField {...args} />
		</div>
	),
}

export const LayeredCenterClose1: LayeredStory = {
	args: {
		clusterVariant: 'cluster-ellipse-4x-center-close-1',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<LayeredStarField {...args} />
		</div>
	),
}

export const LayeredCenterClose2: LayeredStory = {
	args: {
		clusterVariant: 'cluster-ellipse-4x-center-close-2',
		opacity: 1.0,
	},
	render: args => (
		<div style={{ height: '100vh', background: '#000' }}>
			<LayeredStarField {...args} />
		</div>
	),
}

// Comparison story showing all variants
export const AllVariantsComparison: Story = {
	parameters: {
		layout: 'fullscreen',
		backgrounds: { default: 'dark' },
	},
	render: () => (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
				gap: '20px',
				padding: '20px',
				background: '#000',
				minHeight: '100vh',
			}}
		>
			<div
				style={{
					border: '1px solid #333',
					position: 'relative',
					height: '300px',
				}}
			>
				<h3
					style={{
						color: 'white',
						position: 'absolute',
						top: '10px',
						left: '10px',
						zIndex: 10,
					}}
				>
					Original
				</h3>
				<LayeredStarField clusterVariant="cluster-ellipse-4x" opacity={1.0} />
			</div>

			<div
				style={{
					border: '1px solid #333',
					position: 'relative',
					height: '300px',
				}}
			>
				<h3
					style={{
						color: 'white',
						position: 'absolute',
						top: '10px',
						left: '10px',
						zIndex: 10,
					}}
				>
					Bright Center 1
				</h3>
				<LayeredStarField
					clusterVariant="cluster-ellipse-4x-center-bright-1"
					opacity={1.0}
				/>
			</div>

			<div
				style={{
					border: '1px solid #333',
					position: 'relative',
					height: '300px',
				}}
			>
				<h3
					style={{
						color: 'white',
						position: 'absolute',
						top: '10px',
						left: '10px',
						zIndex: 10,
					}}
				>
					Bright Center 2
				</h3>
				<LayeredStarField
					clusterVariant="cluster-ellipse-4x-center-bright-2"
					opacity={1.0}
				/>
			</div>

			<div
				style={{
					border: '1px solid #333',
					position: 'relative',
					height: '300px',
				}}
			>
				<h3
					style={{
						color: 'white',
						position: 'absolute',
						top: '10px',
						left: '10px',
						zIndex: 10,
					}}
				>
					Close Center 1
				</h3>
				<LayeredStarField
					clusterVariant="cluster-ellipse-4x-center-close-1"
					opacity={1.0}
				/>
			</div>

			<div
				style={{
					border: '1px solid #333',
					position: 'relative',
					height: '300px',
				}}
			>
				<h3
					style={{
						color: 'white',
						position: 'absolute',
						top: '10px',
						left: '10px',
						zIndex: 10,
					}}
				>
					Close Center 2
				</h3>
				<LayeredStarField
					clusterVariant="cluster-ellipse-4x-center-close-2"
					opacity={1.0}
				/>
			</div>
		</div>
	),
}
