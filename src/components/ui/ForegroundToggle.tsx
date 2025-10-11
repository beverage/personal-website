'use client'

import { useForegroundToggle } from '@/contexts/ForegroundToggleContext'
import { Star } from 'lucide-react'

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

	const handleToggle = () => {
		setForegroundEnabled(!foregroundEnabled)
	}

	return (
		<button
			onClick={handleToggle}
			disabled={disabled}
			className={`font-exo2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 ${
				foregroundEnabled
					? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:border-cyan-600 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/60'
					: 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
			} ${className}`}
			aria-label={`Toggle foreground starfield (${foregroundEnabled ? 'on' : 'off'})`}
			title={`Foreground ${foregroundEnabled ? 'On' : 'Off'}`}
		>
			<Star size={16} fill="currentColor" />
		</button>
	)
}
