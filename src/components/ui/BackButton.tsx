import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BackButtonProps {
	direction: 'left' | 'right'
	onClick?: () => void
	className?: string
	'aria-label'?: string
	disabled?: boolean
}

export const BackButton = ({
	direction,
	onClick,
	className = '',
	'aria-label': ariaLabel,
	disabled = false,
}: BackButtonProps) => {
	const Icon = direction === 'left' ? ChevronLeft : ChevronRight
	const defaultAriaLabel = direction === 'left' ? 'Go back' : 'Go back'

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
