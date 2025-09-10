import { useClusterStarField } from '@/hooks/useClusterStarField'
import { ClusterVariant } from '@/types/starfield'
import { MotionVector } from '@/types/transitions'
import React from 'react'

interface ClusterStarFieldProps {
	variant?: ClusterVariant
	stardustVariant?: 'halo' | 'sparkle' | 'bloom' | 'nebula'
	opacity?: number
	className?: string
	style?: React.CSSProperties
	motionVector?: MotionVector
}

export const ClusterStarField: React.FC<ClusterStarFieldProps> = ({
	variant = 'cluster-ellipse-4x',
	stardustVariant = 'halo',
	opacity = 1.0,
	className = '',
	style,
	motionVector,
}: ClusterStarFieldProps) => {
	// Debug: motion vector received (disabled for cleaner output)
	// console.log('🌌 ClusterStarField motion:', motionVector?.lateral)

	const canvasRef = useClusterStarField({
		variant,
		opacity,
		stardustVariant,
		motionVector,
	})

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

// Convenience component for the lenticular star cluster effect
export const StarTrekClusterField: React.FC<{
	opacity?: number
	className?: string
}> = ({ opacity = 1.0, className }) => (
	<ClusterStarField
		variant="cluster-ellipse-4x"
		opacity={opacity}
		className={className}
	/>
)
