'use client'

import { FileText } from 'lucide-react'
import { ControlButton } from './ControlButton'
import { LanguageSelector } from './LanguageSelector'
import { SpeedSelector } from './SpeedSelector'

interface ControlsCornerProps {
	cvUrl?: string
	darkMode: boolean
	onToggleSpeed?: () => void
	disabled?: boolean
	fadeStyle?: React.CSSProperties
	className?: string
}

/**
 * Groups the top-right controls: Language selector, CV button, and Speed selector
 */
export function ControlsCorner({
	cvUrl,
	darkMode,
	onToggleSpeed,
	disabled = false,
	fadeStyle = {},
	className = '',
}: ControlsCornerProps) {
	return (
		<div
			className={`absolute top-8 right-8 z-50 flex items-center gap-3 ${className}`}
			style={fadeStyle}
		>
			<LanguageSelector disabled={disabled} />
			{cvUrl && (
				<ControlButton
					href={cvUrl}
					target="_blank"
					rel="noopener noreferrer"
					ariaLabel="Download CV (PDF)"
					className="font-exo2 gap-2 px-3 py-3 text-sm font-medium text-cyan-300"
				>
					<FileText size={16} />
					<span>CV</span>
				</ControlButton>
			)}
			<SpeedSelector darkMode={darkMode} onToggle={onToggleSpeed} />
		</div>
	)
}
