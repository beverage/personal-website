'use client'

import { useTwinkle } from '@/contexts/TwinkleContext'
import { Sparkle } from 'lucide-react'

interface TwinkleToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control - toggle star twinkling effect
 */
export const TwinkleToggle = ({
	className = '',
	disabled = false,
}: TwinkleToggleProps) => {
	const { twinkleEnabled, setTwinkleEnabled } = useTwinkle()

	const handleToggle = () => {
		setTwinkleEnabled(!twinkleEnabled)
	}

	return (
		<button
			onClick={handleToggle}
			disabled={disabled}
			className={`font-exo2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 ${
				twinkleEnabled
					? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:border-cyan-600 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/60'
					: 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
			} ${className}`}
			aria-label={`Toggle star twinkling (${twinkleEnabled ? 'on' : 'off'})`}
			title={`Twinkle ${twinkleEnabled ? 'On' : 'Off'}`}
		>
			<Sparkle size={16} />
		</button>
	)
}
