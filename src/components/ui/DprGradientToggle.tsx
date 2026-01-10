'use client'

import { useDprGradient } from '@/contexts/DprGradientContext'
import { FlaskConical } from 'lucide-react'

interface DprGradientToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control - toggle DPR-adaptive gradient rendering
 * Uses a flask/beaker icon to represent A/B testing / experimentation
 *
 * When enabled: Uses gradient parameters optimized for current DPR
 * When disabled: Uses baseline retina gradient for all displays
 */
export const DprGradientToggle = ({
	className = '',
	disabled = false,
}: DprGradientToggleProps) => {
	const { dprGradientEnabled, setDprGradientEnabled } = useDprGradient()

	const handleToggle = () => {
		setDprGradientEnabled(!dprGradientEnabled)
	}

	return (
		<button
			onClick={handleToggle}
			disabled={disabled}
			className={`font-exo2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 ${
				dprGradientEnabled
					? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:border-cyan-600 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/60'
					: 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
			} ${className}`}
			aria-label={`Toggle DPR gradient (${dprGradientEnabled ? 'on' : 'off'})`}
			title={`DPR Gradient ${dprGradientEnabled ? 'On' : 'Off'} (A/B Test)`}
		>
			<FlaskConical size={16} />
		</button>
	)
}
