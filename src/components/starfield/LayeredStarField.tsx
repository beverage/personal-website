import { ClusterVariant } from '@/types/starfield'
import React from 'react'
import { ClusterStarField } from './ClusterStarField'
import { StarField } from './StarField'

interface LayeredStarFieldProps {
	clusterVariant: ClusterVariant
	stardustVariant?: 'halo' | 'sparkle' | 'bloom' | 'nebula'
	opacity?: number
	showCluster?: boolean
	speed?: number
	// Fade durations in milliseconds
	fadeInDuration?: number
	fadeOutDuration?: number
	className?: string
	style?: React.CSSProperties
}

export const LayeredStarField: React.FC<LayeredStarFieldProps> = ({
	clusterVariant,
	stardustVariant,
	opacity = 1.0,
	showCluster = true,
	speed = 1000,
	fadeInDuration = 3000,
	fadeOutDuration = 1000,
	className = '',
	style,
}) => {
	return (
		<div
			className={`absolute inset-0 h-full w-full ${className}`}
			style={{
				width: '100%',
				height: '100%',
				zIndex: 0,
				...style,
			}}
		>
			{/* Background layer: Cluster starfield (transparent canvas) */}
			<ClusterStarField
				variant={clusterVariant}
				stardustVariant={stardustVariant}
				opacity={opacity}
				className={`absolute inset-0 ${className}`}
				style={{
					zIndex: 1,
					transition: `opacity ${showCluster ? fadeInDuration : fadeOutDuration}ms ease-in-out`,
					opacity: showCluster ? 1.0 : 0,
				}}
			/>

			{/* Foreground layer: Twinkle starfield (transparent canvas) */}
			<StarField
				variant="twinkle-compact"
				opacity={opacity}
				speed={speed}
				className="absolute inset-0"
			/>
		</div>
	)
}

// Convenience component for homepage
export interface HomepageLayeredStarFieldProps {
	opacity?: number
	className?: string
	showCluster?: boolean
	speed?: number
	fadeInDuration?: number
	fadeOutDuration?: number
}
export const HomepageLayeredStarField: React.FC<
	HomepageLayeredStarFieldProps
> = ({
	opacity = 1.0,
	className,
	showCluster = true,
	speed,
	fadeInDuration = 3000,
	fadeOutDuration = 1000,
}) => (
	<LayeredStarField
		clusterVariant="cluster-ellipse-4x-center-close-1"
		opacity={opacity}
		showCluster={showCluster}
		speed={speed}
		fadeInDuration={fadeInDuration}
		fadeOutDuration={fadeOutDuration}
		className={className}
	/>
)
