import { Rocket, Sailboat } from 'lucide-react'

interface ControlPanelProps {
	darkMode?: boolean
	onToggle?: () => void
	className?: string
}

export const ControlPanel = ({
	darkMode = true,
	onToggle,
	className = '',
}: ControlPanelProps) => {
	return (
		<button
			onClick={onToggle}
			className={`rounded-full border border-white/10 bg-black/20 p-3 backdrop-blur-sm transition-all hover:bg-black/30 ${className}`}
		>
			{darkMode ? <Rocket size={20} /> : <Sailboat size={20} />}
		</button>
	)
}
