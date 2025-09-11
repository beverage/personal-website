import { ChevronDown, ChevronUp } from 'lucide-react'

interface NavigationArrowProps {
	direction: 'up' | 'down'
	onClick: () => void
	className?: string
	'aria-label'?: string
	visible?: boolean
}

export const NavigationArrow = ({
	direction,
	onClick,
	className = '',
	'aria-label': ariaLabel,
	visible = true,
}: NavigationArrowProps) => {
	const Icon = direction === 'up' ? ChevronUp : ChevronDown
	const defaultAriaLabel = direction === 'up' ? 'Scroll up' : 'Scroll down'

	if (!visible) return null

	return (
		<button
			onClick={onClick}
			className={`inline-flex items-center gap-2 rounded-full border border-cyan-400/70 bg-black/40 px-3 py-2 text-cyan-300 backdrop-blur-sm transition-all hover:text-cyan-200 ${className}`}
			aria-label={ariaLabel || defaultAriaLabel}
		>
			<Icon size={16} />
		</button>
	)
}

interface PortfolioNavigationProps {
	currentIndex: number
	totalItems: number
	onNavigate: (direction: 'up' | 'down') => void
	className?: string
}

export const PortfolioNavigation = ({
	currentIndex,
	totalItems,
	onNavigate,
	className = '',
}: PortfolioNavigationProps) => {
	const canScrollUp = currentIndex > 0
	const canScrollDown = currentIndex < totalItems - 1
	const isHeroCard = currentIndex === 0

	return (
		<div className={`pointer-events-none absolute inset-0 ${className}`}>
			{/* Up Arrow - Horizontally centered */}
			{canScrollUp && (
				<div
					className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 ${
						isHeroCard
							? 'top-8' // Top of screen on hero
							: 'top-4' // Just above project card
					}`}
				>
					<NavigationArrow
						direction="up"
						onClick={() => onNavigate('up')}
						visible={canScrollUp}
						aria-label="Previous project"
					/>
				</div>
			)}

			{/* Down Arrow - Horizontally centered */}
			{canScrollDown && (
				<div
					className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 ${
						isHeroCard
							? 'bottom-1/3' // Under 'Explore my work and projects' on hero
							: 'bottom-4' // Just below project card
					}`}
				>
					<NavigationArrow
						direction="down"
						onClick={() => onNavigate('down')}
						visible={canScrollDown}
						aria-label="Next project"
					/>
				</div>
			)}
		</div>
	)
}
