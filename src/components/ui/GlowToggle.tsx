'use client'

import { useGlow } from '@/contexts/GlowContext'
import { Cloud } from 'lucide-react'

interface GlowToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control - toggle point cloud nebula effect
 */
export const GlowToggle = ({
	className = '',
	disabled = false,
}: GlowToggleProps) => {
	const { glowEnabled, setGlowEnabled } = useGlow()

	const handleToggle = () => {
		setGlowEnabled(!glowEnabled)
	}

	return (
		<button
			onClick={handleToggle}
			disabled={disabled}
			className={`font-exo2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 ${
				glowEnabled
					? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:border-cyan-600 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/60'
					: 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
			} ${className}`}
			aria-label={`Toggle nebula (${glowEnabled ? 'on' : 'off'})`}
			title={`Nebula ${glowEnabled ? 'On' : 'Off'}`}
		>
			<Cloud size={16} />
		</button>
	)
}
