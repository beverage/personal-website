'use client'

import { useRenderMode } from '@/contexts/RenderModeContext'
import { Cuboid } from 'lucide-react'

interface RenderModeSelectorProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control - toggle between WebGL and Canvas2D rendering
 */
export const RenderModeSelector = ({
	className = '',
	disabled = false,
}: RenderModeSelectorProps) => {
	const { renderMode, setRenderMode } = useRenderMode()

	const isWebGL = renderMode === 'webgl' || renderMode === 'auto'

	const handleToggle = () => {
		setRenderMode(isWebGL ? 'canvas2d' : 'webgl')
	}

	return (
		<button
			onClick={handleToggle}
			disabled={disabled}
			className={`font-exo2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 ${
				isWebGL
					? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:border-cyan-600 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/60'
					: 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
			} ${className}`}
			aria-label={`Toggle render mode (currently ${isWebGL ? 'WebGL' : 'Canvas2D'})`}
			title={isWebGL ? 'WebGL' : 'Canvas2D'}
		>
			<Cuboid size={16} />
		</button>
	)
}
