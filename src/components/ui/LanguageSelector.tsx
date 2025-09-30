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
		<ControlButton className={`gap-0 ${className}`}>
			<button
				onClick={() => handleLanguageChange('en')}
				disabled={disabled}
				className={`font-exo2 rounded-l-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					language === 'en'
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Switch to English"
			>
				EN
			</button>
			<div className="h-4 w-px bg-cyan-400/30" />
			<button
				onClick={() => handleLanguageChange('fr')}
				disabled={disabled}
				className={`font-exo2 rounded-r-full px-3 py-3 text-sm font-medium transition-all duration-1000 ${
					language === 'fr'
						? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
						: 'text-white/40 hover:text-cyan-300'
				}`}
				aria-label="Switch to French"
			>
				FR
			</button>
		</ControlButton>
	)
}
