'use client'

import { useHeroText } from '@/contexts/HeroTextContext'
import { ControlButton } from './ControlButton'

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

	const handleOnClick = () => {
		setHeroTextVisible(true)
	}

	const handleOffClick = () => {
		setHeroTextVisible(false)
	}

	return (
		<ControlButton className={`gap-0 ${className}`}>
			<button
				onClick={handleOnClick}
				disabled={disabled}
				className={`font-exo2 rounded-l-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					heroTextVisible
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Show hero text"
				title="Hero Text On"
			>
				HT
			</button>
			<div className="h-4 w-px bg-cyan-400/30" />
			<button
				onClick={handleOffClick}
				disabled={disabled}
				className={`font-exo2 rounded-r-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					!heroTextVisible
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Hide hero text"
				title="Hero Text Off"
			>
				--
			</button>
		</ControlButton>
	)
}
