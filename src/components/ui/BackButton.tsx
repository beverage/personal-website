import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BackButtonProps {
	direction: 'left' | 'right'
	onClick: () => void
	className?: string
	'aria-label'?: string
}

export const BackButton = ({
	direction,
	onClick,
	className = '',
	'aria-label': ariaLabel,
}: BackButtonProps) => {
	const Icon = direction === 'left' ? ChevronLeft : ChevronRight
	const defaultAriaLabel = direction === 'left' ? 'Go back' : 'Go back'

	return (
		<button
			onClick={onClick}
			className={`inline-flex items-center gap-2 rounded-full border border-cyan-400/70 bg-black/40 px-3 py-2 text-cyan-300 backdrop-blur-sm transition-all duration-700 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40 ${className}`}
			aria-label={ariaLabel || defaultAriaLabel}
		>
			<Icon size={16} />
		</button>
	)
}
