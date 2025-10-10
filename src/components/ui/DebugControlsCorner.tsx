'use client'

import { ForegroundToggle } from './ForegroundToggle'
import { GlowToggle } from './GlowToggle'
import { HeroTextToggle } from './HeroTextToggle'
import { RenderModeSelector } from './RenderModeSelector'
import { TwinkleToggle } from './TwinkleToggle'

interface DebugControlsCornerProps {
	disabled?: boolean
	fadeStyle?: React.CSSProperties
	className?: string
}

/**
 * Debug controls positioned in lower-right corner (dev mode only)
 * Groups: GL/2D render mode selector, FG foreground toggle, HT hero text toggle, GW glow toggle, TW twinkle toggle
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
			<HeroTextToggle disabled={disabled} />
			<GlowToggle disabled={disabled} />
			<TwinkleToggle disabled={disabled} />
		</div>
	)
}
