'use client'

import { useRenderMode } from '@/contexts/RenderModeContext'
import { ControlButton } from './ControlButton'

interface RenderModeSelectorProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control for dev mode - toggle between WebGL and Canvas2D rendering
 * Only visible in development mode
 */
export const RenderModeSelector = ({
	className = '',
	disabled = false,
}: RenderModeSelectorProps) => {
	const { renderMode, setRenderMode } = useRenderMode()

	// Only show in development
	if (process.env.NODE_ENV !== 'development') {
		return null
	}

	const handleWebGLClick = () => {
		setRenderMode('webgl')
	}

	const handleCanvas2DClick = () => {
		setRenderMode('canvas2d')
	}

	return (
		<ControlButton className={`gap-0 ${className}`}>
			<button
				onClick={handleWebGLClick}
				disabled={disabled}
				className={`font-exo2 rounded-l-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					renderMode === 'webgl'
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Force WebGL rendering"
				title="WebGL"
			>
				GL
			</button>
			<div className="h-4 w-px bg-cyan-400/30" />
			<button
				onClick={handleCanvas2DClick}
				disabled={disabled}
				className={`font-exo2 rounded-r-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					renderMode === 'canvas2d'
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Force Canvas2D rendering"
				title="Canvas2D"
			>
				2D
			</button>
		</ControlButton>
	)
}
