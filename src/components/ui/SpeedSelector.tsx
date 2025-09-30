import { Rocket, Sailboat } from 'lucide-react'
import { ControlButton } from './ControlButton'

interface SpeedSelectorProps {
	darkMode?: boolean
	onToggle?: () => void
	className?: string
}

export const SpeedSelector = ({
	darkMode = true,
	onToggle,
	className = '',
}: SpeedSelectorProps) => {
	return (
		<ControlButton
			onClick={onToggle}
			className={`border-white/10 p-3 hover:bg-black/30 ${className}`}
		>
			{darkMode ? <Rocket size={20} /> : <Sailboat size={20} />}
		</ControlButton>
	)
}
