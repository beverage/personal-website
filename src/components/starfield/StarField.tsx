import { useForegroundToggle } from '@/contexts/ForegroundToggleContext'
import { useRenderMode } from '@/contexts/RenderModeContext'
import { useStarField, useWebGLStarField, useWebGLSupport } from '@/hooks'
import { useOptimalStarCount } from '@/hooks/useMobileDetection'
import { WEBGL_STARFIELD_CONFIG } from '@/lib/starfield'
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

	if (isClusterVariant) {
		// Render cluster star field for cluster variants
		return (
			<ClusterStarField
				key={`cluster-${renderMode}`}
				variant={variant as ClusterVariant}
				opacity={opacity}
				className={className}
				style={style}
				motionVector={motionVector}
			/>
		)
	}

	// Use WebGL or Canvas2D based on support/override
	// Key forces remount when switching modes
	if (useWebGL) {
		return (
			<WebGLStarFieldRenderer
				key="webgl"
				starCount={starCount}
				speed={speed}
				rollSpeed={rollSpeed}
				className={className}
				style={style}
				motionVector={motionVector}
			/>
		)
	}

	// Fall back to Canvas2D renderer
	return (
		<Canvas2DStarFieldRenderer
			key="canvas2d"
			starCount={starCount}
			speed={speed}
			rollSpeed={rollSpeed}
			opacity={opacity}
			variant={variant as TwinkleVariant}
			className={className}
			style={style}
			motionVector={motionVector}
		/>
	)
}

// WebGL renderer component
const WebGLStarFieldRenderer: React.FC<{
	starCount?: number
	speed: number
	rollSpeed: number
	className: string
	style?: React.CSSProperties
	motionVector?: MotionVector
}> = ({ starCount, speed, rollSpeed, className, style, motionVector }) => {
	const { foregroundEnabled } = useForegroundToggle()

	// WebGL can handle full star count - no need for Safari/mobile reduction
	// Use foreground toggle to control visibility in dev mode
	const baseStarCount =
		starCount ?? WEBGL_STARFIELD_CONFIG.starCounts.foreground
	const effectiveStarCount = foregroundEnabled ? baseStarCount : 0

	const canvasRef = useWebGLStarField({
		starCount: effectiveStarCount,
		speed,
		rollSpeed,
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

// Canvas2D renderer component
const Canvas2DStarFieldRenderer: React.FC<{
	starCount?: number
	speed: number
	rollSpeed: number
	opacity: number
	variant: TwinkleVariant
	className: string
	style?: React.CSSProperties
	motionVector?: MotionVector
}> = ({
	starCount,
	speed,
	rollSpeed,
	opacity,
	variant,
	className,
	style,
	motionVector,
}) => {
	const { foregroundEnabled } = useForegroundToggle()

	const optimalStarCount = useOptimalStarCount(
		WEBGL_STARFIELD_CONFIG.starCounts.foreground,
	)
	const baseStarCount = starCount ?? optimalStarCount
	const effectiveStarCount = foregroundEnabled ? baseStarCount : 0

	const canvasRef = useStarField({
		starCount: effectiveStarCount,
		speed,
		rollSpeed,
		opacity,
		variant,
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
