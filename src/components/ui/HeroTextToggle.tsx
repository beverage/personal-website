'use client'

import { useHeroText } from '@/contexts/HeroTextContext'
import { Text } from 'lucide-react'

interface HeroTextToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control for dev mode - toggle hero text visibility
 * Only visible in development mode
 */
export const HeroTextToggle = ({
	className = '',
	disabled = false,
}: HeroTextToggleProps) => {
	const { heroTextVisible, setHeroTextVisible } = useHeroText()

	// Only show in development
	if (process.env.NODE_ENV !== 'development') {
		return null
	}

	const handleToggle = () => {
		setHeroTextVisible(!heroTextVisible)
	}

	return (
		<button
			onClick={handleToggle}
			disabled={disabled}
			className={`font-exo2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 ${
				heroTextVisible
					? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:border-cyan-600 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/60'
					: 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
			} ${className}`}
			aria-label={`Toggle hero text (${heroTextVisible ? 'visible' : 'hidden'})`}
			title={`Hero Text ${heroTextVisible ? 'On' : 'Off'}`}
		>
			<Text size={16} />
		</button>
	)
}
