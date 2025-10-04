import { useRenderMode } from '@/contexts/RenderModeContext'
import { useClusterStarField } from '@/hooks/useClusterStarField'
import { useWebGLClusterStarField } from '@/hooks/useWebGLClusterStarField'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
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

	// Check for WebGL support and render mode override (dev only)
	const supportsWebGL = useWebGLSupport()
	const { renderMode } = useRenderMode()

	// Determine actual render mode
	const useWebGL =
		renderMode === 'webgl'
			? true
			: renderMode === 'canvas2d'
				? false
				: supportsWebGL // 'auto' mode

	// Use WebGL or Canvas2D based on support/override
	// Key forces remount when switching modes
	if (useWebGL) {
		return (
			<WebGLClusterRenderer
				key="cluster-webgl"
				opacity={opacity}
				className={className}
				style={style}
				motionVector={motionVector}
			/>
		)
	}

	// Fall back to Canvas2D renderer
	return (
		<Canvas2DClusterRenderer
			key="cluster-canvas2d"
			variant={variant}
			stardustVariant={stardustVariant}
			opacity={opacity}
			className={className}
			style={style}
			motionVector={motionVector}
		/>
	)
}

// WebGL cluster renderer component
const WebGLClusterRenderer: React.FC<{
	opacity: number
	className: string
	style?: React.CSSProperties
	motionVector?: MotionVector
}> = ({ opacity, className, style, motionVector }) => {
	const canvasRef = useWebGLClusterStarField({
		opacity,
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

// Canvas2D cluster renderer component
const Canvas2DClusterRenderer: React.FC<{
	variant: ClusterVariant
	stardustVariant: 'halo' | 'sparkle' | 'bloom' | 'nebula'
	opacity: number
	className: string
	style?: React.CSSProperties
	motionVector?: MotionVector
}> = ({
	variant,
	stardustVariant,
	opacity,
	className,
	style,
	motionVector,
}) => {
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
