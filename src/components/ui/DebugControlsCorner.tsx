'use client'

import { ForegroundToggle } from './ForegroundToggle'
import { RenderModeSelector } from './RenderModeSelector'

interface DebugControlsCornerProps {
	disabled?: boolean
	fadeStyle?: React.CSSProperties
	className?: string
}

/**
 * Debug controls positioned in lower-right corner (dev mode only)
 * Groups GL/2D render mode selector and FG/-- foreground toggle
 */
export function DebugControlsCorner({
	disabled = false,
	fadeStyle = {},
	className = '',
}: DebugControlsCornerProps) {
	// Only render in development
	if (process.env.NODE_ENV !== 'development') {
		return null
	}

	return (
		<div
			className={`absolute right-8 bottom-8 z-50 flex items-center gap-3 ${className}`}
			style={fadeStyle}
		>
			<RenderModeSelector disabled={disabled} />
			<ForegroundToggle disabled={disabled} />
		</div>
	)
}
