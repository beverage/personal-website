'use client'

import { useTwinkle } from '@/contexts/TwinkleContext'
import { ControlButton } from './ControlButton'

interface TwinkleToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control for dev mode - toggle star twinkling effect
 * Only visible in development mode
 */
export const TwinkleToggle = ({
	className = '',
	disabled = false,
}: TwinkleToggleProps) => {
	const { twinkleEnabled, setTwinkleEnabled } = useTwinkle()

	// Only show in development
	if (process.env.NODE_ENV !== 'development') {
		return null
	}

	const handleOnClick = () => {
		setTwinkleEnabled(true)
	}

	const handleOffClick = () => {
		setTwinkleEnabled(false)
	}

	return (
		<ControlButton className={`gap-0 ${className}`}>
			<button
				onClick={handleOnClick}
				disabled={disabled}
				className={`font-exo2 rounded-l-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					twinkleEnabled
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Enable star twinkling"
				title="Twinkle On"
			>
				TW
			</button>
			<div className="h-4 w-px bg-cyan-400/30" />
			<button
				onClick={handleOffClick}
				disabled={disabled}
				className={`font-exo2 rounded-r-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					!twinkleEnabled
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Disable star twinkling"
				title="Twinkle Off"
			>
				--
			</button>
		</ControlButton>
	)
}
