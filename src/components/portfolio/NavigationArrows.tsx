import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'

interface NavigationArrowProps {
	direction: 'up' | 'down' | 'left' | 'right'
	onClick?: () => void
	className?: string
	'aria-label'?: string
	visible?: boolean
	disabled?: boolean
}

const getIcon = (direction: 'up' | 'down' | 'left' | 'right') => {
	switch (direction) {
		case 'up':
			return ChevronUp
		case 'down':
			return ChevronDown
		case 'left':
			return ChevronLeft
		case 'right':
			return ChevronRight
	}
}

const getDefaultAriaLabel = (direction: 'up' | 'down' | 'left' | 'right') => {
	switch (direction) {
		case 'up':
			return 'Scroll up'
		case 'down':
			return 'Scroll down'
		case 'left':
			return 'Previous'
		case 'right':
			return 'Go back'
	}
}

export const NavigationArrow = ({
	direction,
	onClick,
	className = '',
	'aria-label': ariaLabel,
	visible = true,
	disabled = false,
}: NavigationArrowProps) => {
	const Icon = getIcon(direction)
	const defaultAriaLabel = getDefaultAriaLabel(direction)

	if (!visible) return null

	// Disabled styling matches the rocket/sailboat icon gray
	const disabledStyles =
		'border-white/20 text-white/40 cursor-not-allowed hover:bg-black/40 hover:text-white/40 hover:shadow-none'
	const enabledStyles =
		'border-cyan-400/70 text-cyan-300 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40'

	return (
		<button
			onClick={disabled ? undefined : onClick}
			disabled={disabled}
			className={`inline-flex items-center gap-2 rounded-full border bg-black/40 px-3 py-2 backdrop-blur-sm transition-all duration-700 ${
				disabled ? disabledStyles : enabledStyles
			} ${className}`}
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
	onBack?: () => void
	className?: string
}

export const PortfolioNavigation = ({
	currentIndex,
	totalItems,
	onNavigate,
	onBack,
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

			{/* Down Arrow and Back Button - Horizontally centered */}
			<div
				className={`pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-3 ${
					isHeroCard
						? 'bottom-1/3' // Under 'Explore my work and projects' on hero
						: 'bottom-4' // Just below project card
				}`}
			>
				{canScrollDown && (
					<NavigationArrow
						direction="down"
						onClick={() => onNavigate('down')}
						visible={canScrollDown}
						aria-label="Next project"
					/>
				)}
				{/* Back button - mobile only */}
				{onBack && (
					<div className="md:hidden">
						<NavigationArrow
							direction="right"
							onClick={onBack}
							aria-label="Back to home"
						/>
					</div>
				)}
			</div>
		</div>
	)
}
