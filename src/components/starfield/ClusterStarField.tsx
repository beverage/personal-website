import { useClusterStarField } from '@/hooks/useClusterStarField'
import { ClusterVariant } from '@/types/starfield'
import React from 'react'

interface ClusterStarFieldProps {
	variant?: ClusterVariant
	stardustVariant?: 'halo' | 'sparkle' | 'bloom' | 'nebula'
	opacity?: number
	className?: string
	style?: React.CSSProperties
}

export const ClusterStarField: React.FC<ClusterStarFieldProps> = ({
	variant = 'cluster-ellipse-4x',
	stardustVariant = 'halo',
	opacity = 1.0,
	className = '',
	style,
}: ClusterStarFieldProps) => {
	const canvasRef = useClusterStarField({ variant, opacity, stardustVariant })

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
