'use client'

import { useForegroundToggle } from '@/contexts/ForegroundToggleContext'
import { ControlButton } from './ControlButton'

interface ForegroundToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control for dev mode - toggle foreground starfield on/off
 * Only visible in development mode
 */
export const ForegroundToggle = ({
	className = '',
	disabled = false,
}: ForegroundToggleProps) => {
	const { foregroundEnabled, setForegroundEnabled } = useForegroundToggle()

	// Only show in development
	if (process.env.NODE_ENV !== 'development') {
		return null
	}

	const handleOnClick = () => {
		setForegroundEnabled(true)
	}

	const handleOffClick = () => {
		setForegroundEnabled(false)
	}

	return (
		<ControlButton className={`gap-0 ${className}`}>
			<button
				onClick={handleOnClick}
				disabled={disabled}
				className={`font-exo2 rounded-l-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					foregroundEnabled
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Enable foreground starfield"
				title="Foreground On"
			>
				FG
			</button>
			<div className="h-4 w-px bg-cyan-400/30" />
			<button
				onClick={handleOffClick}
				disabled={disabled}
				className={`font-exo2 rounded-r-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					!foregroundEnabled
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Disable foreground starfield"
				title="Foreground Off"
			>
				--
			</button>
		</ControlButton>
	)
}
