import { useStarField } from '@/hooks'
import { useOptimalStarCount } from '@/hooks/useMobileDetection'
import {
	ClusterVariant,
	StarFieldVariant,
	TwinkleVariant,
} from '@/types/starfield'
import { MotionVector } from '@/types/transitions'
import React from 'react'
import { ClusterStarField } from './ClusterStarField'

interface StarFieldProps {
	variant?: StarFieldVariant
	opacity?: number
	className?: string
	style?: React.CSSProperties
	// Advanced configuration (optional)
	starCount?: number
	speed?: number
	rollSpeed?: number
	// Course change transition support
	motionVector?: MotionVector
}

export const StarField: React.FC<StarFieldProps> = ({
	variant = 'twinkle-compact',
	opacity = 1.0,
	className = '',
	style,
	starCount,
	speed = 1000,
	rollSpeed = -1.5,
	motionVector,
}) => {
	// Debug: motion vector received (disabled for cleaner output)
	// console.log('⭐ StarField motion:', motionVector?.lateral)

	// Check if this is a cluster variant
	const isClusterVariant = variant.startsWith('cluster-')

	// Robust mobile/low-power detection with automatic star count optimization
	// Only apply if starCount wasn't explicitly provided (and for twinkle variants only)
	const optimalStarCount = useOptimalStarCount(4000)
	const effectiveStarCount = starCount ?? optimalStarCount

	// Always call the twinkle hook, but only use it if needed
	const canvasRef = useStarField({
		starCount: effectiveStarCount,
		speed,
		rollSpeed,
		opacity,
		variant: isClusterVariant ? 'twinkle-compact' : (variant as TwinkleVariant),
		motionVector,
	})

	if (isClusterVariant) {
		// Render cluster star field for cluster variants
		return (
			<ClusterStarField
				variant={variant as ClusterVariant}
				opacity={opacity}
				className={className}
				style={style}
				motionVector={motionVector}
			/>
		)
	}

	// Render twinkle star field for twinkle variants
	return (
		<canvas
			ref={canvasRef}
			className={`absolute inset-0 h-full w-full ${className}`}
			style={{
				width: '100%',
				height: '100%',
				zIndex: 0,
				...style,
			}}
		/>
	)
}

// Convenience components for common use cases
export const HomepageStarField: React.FC<{
	opacity?: number
	className?: string
}> = ({ opacity = 1.0, className }) => (
	<StarField
		variant="twinkle-compact"
		opacity={opacity}
		className={className}
	/>
)

export const BackgroundStarField: React.FC<{
	opacity?: number
	className?: string
}> = ({ opacity = 0.3, className }) => (
	<StarField
		variant="twinkle-minimal"
		opacity={opacity}
		className={className}
	/>
)
