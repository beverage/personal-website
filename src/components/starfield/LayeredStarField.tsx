import { ClusterVariant } from '@/types/starfield'
import { BankingRoll, MotionVector } from '@/types/transitions'
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
	// Course change transition support
	foregroundMotionVector?: MotionVector
	backgroundMotionVector?: MotionVector
	bankingRoll?: BankingRoll
	// Depth-based parallax for continuous depth perception during transitions
	depthParallaxFactor?: number
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
	foregroundMotionVector,
	backgroundMotionVector,
	bankingRoll,
	depthParallaxFactor = 0,
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
				motionVector={backgroundMotionVector}
			/>

			{/* Foreground layer: Twinkle starfield (transparent canvas) */}
			<StarField
				variant="twinkle-compact"
				opacity={opacity}
				speed={speed}
				rollSpeed={bankingRoll?.foregroundRollSpeed}
				className="absolute inset-0"
				motionVector={foregroundMotionVector}
				depthParallaxFactor={depthParallaxFactor}
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
	// Course change transition support
	foregroundMotionVector?: MotionVector
	backgroundMotionVector?: MotionVector
	bankingRoll?: BankingRoll
	// Depth-based parallax for continuous depth perception during transitions
	depthParallaxFactor?: number
	// Callback when starfield has rendered
	onRender?: () => void
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
	foregroundMotionVector,
	backgroundMotionVector,
	bankingRoll,
	depthParallaxFactor = 0,
	onRender,
}) => {
	// Call onRender when component mounts
	React.useEffect(() => {
		if (onRender) {
			onRender()
		}
	}, [onRender])

	return (
		<LayeredStarField
			clusterVariant="cluster-ellipse-4x-center-close-1"
			opacity={opacity}
			showCluster={showCluster}
			speed={speed}
			fadeInDuration={fadeInDuration}
			fadeOutDuration={fadeOutDuration}
			className={className}
			foregroundMotionVector={foregroundMotionVector}
			backgroundMotionVector={backgroundMotionVector}
			bankingRoll={bankingRoll}
			depthParallaxFactor={depthParallaxFactor}
		/>
	)
}
