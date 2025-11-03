import { Plus } from 'lucide-react'
import { ControlButton } from './ControlButton'

interface DebugExpandButtonProps {
	onClick?: () => void
	className?: string
}

/**
 * Debug expand button - triggers debug panel expansion
 * Styled to match the SpeedSelector in the upper right corner
 */
export const DebugExpandButton = ({
	onClick,
	className = '',
}: DebugExpandButtonProps) => {
	return (
		<ControlButton
			onClick={onClick}
			className={`border-white/10 p-3 hover:bg-black/30 ${className}`}
			ariaLabel="Expand debug controls"
		>
			<Plus size={20} />
		</ControlButton>
	)
}
