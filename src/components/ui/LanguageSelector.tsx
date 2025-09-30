'use client'

import { useLanguage, type Language } from '@/contexts/LanguageContext'
import { ControlButton } from './ControlButton'

interface LanguageSelectorProps {
	className?: string
	disabled?: boolean
}

export const LanguageSelector = ({
	className = '',
	disabled = false,
}: LanguageSelectorProps) => {
	const { language, setLanguage } = useLanguage()

	const handleLanguageChange = (lang: Language) => {
		if (disabled) return
		setLanguage(lang)
	}

	return (
		<ControlButton
			className={`gap-0 ${className} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
		>
			<button
				onClick={() => handleLanguageChange('en')}
				disabled={disabled}
				className={`font-exo2 px-3 py-3 text-sm font-medium transition-all ${
					language === 'en'
						? 'text-cyan-400'
						: 'text-white/40 hover:text-white/60'
				} ${disabled ? 'cursor-not-allowed' : ''}`}
				aria-label="Switch to English"
			>
				EN
			</button>
			<div className="h-4 w-px bg-cyan-400/30" />
			<button
				onClick={() => handleLanguageChange('fr')}
				disabled={disabled}
				className={`font-exo2 px-3 py-3 text-sm font-medium transition-all ${
					language === 'fr'
						? 'text-cyan-400'
						: 'text-white/40 hover:text-white/60'
				} ${disabled ? 'cursor-not-allowed' : ''}`}
				aria-label="Switch to French"
			>
				FR
			</button>
		</ControlButton>
	)
}
