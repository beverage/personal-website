'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'fr'

interface LanguageContextType {
	language: Language
	setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [language, setLanguageState] = useState<Language>('en')
	const [isClient, setIsClient] = useState(false)

	// Initialize from localStorage after mount
	useEffect(() => {
		setIsClient(true)
		const stored = localStorage.getItem('language') as Language | null
		if (stored && (stored === 'en' || stored === 'fr')) {
			setLanguageState(stored)
		}
	}, [])

	const setLanguage = (lang: Language) => {
		setLanguageState(lang)
		if (isClient) {
			localStorage.setItem('language', lang)
		}
	}

	return (
		<LanguageContext.Provider value={{ language, setLanguage }}>
			{children}
		</LanguageContext.Provider>
	)
}

export const useLanguage = () => {
	const context = useContext(LanguageContext)
	if (context === undefined) {
		throw new Error('useLanguage must be used within a LanguageProvider')
	}
	return context
}
