'use client'

import { useGlow } from '@/contexts/GlowContext'
import { ControlButton } from './ControlButton'

interface GlowToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control for dev mode - toggle point cloud nebula effect
 * Only visible in development mode
 */
export const GlowToggle = ({
	className = '',
	disabled = false,
}: GlowToggleProps) => {
	const { glowEnabled, setGlowEnabled } = useGlow()

	// Only show in development
	if (process.env.NODE_ENV !== 'development') {
		return null
	}

	const handleOnClick = () => {
		setGlowEnabled(true)
	}

	const handleOffClick = () => {
		setGlowEnabled(false)
	}

	return (
		<ControlButton className={`gap-0 ${className}`}>
			<button
				onClick={handleOnClick}
				disabled={disabled}
				className={`font-exo2 rounded-l-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					glowEnabled
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Enable nebula"
				title="Nebula On"
			>
				NB
			</button>
			<div className="h-4 w-px bg-cyan-400/30" />
			<button
				onClick={handleOffClick}
				disabled={disabled}
				className={`font-exo2 rounded-r-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					!glowEnabled
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Disable nebula"
				title="Nebula Off"
			>
				--
			</button>
		</ControlButton>
	)
}
