'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface HeroTextContextType {
	heroTextVisible: boolean
	setHeroTextVisible: (visible: boolean) => void
}

const HeroTextContext = createContext<HeroTextContextType | undefined>(
	undefined,
)

export function HeroTextProvider({ children }: { children: React.ReactNode }) {
	// Default to visible
	const [heroTextVisible, setHeroTextVisibleState] = useState(true)

	// Load from localStorage after mounting (client-side only)
	useEffect(() => {
		const stored = localStorage.getItem('dev:heroTextVisible')
		if (stored !== null) {
			setHeroTextVisibleState(stored === 'true')
		}
	}, [])

	const setHeroTextVisible = (visible: boolean) => {
		setHeroTextVisibleState(visible)
		localStorage.setItem('dev:heroTextVisible', String(visible))
	}

	return (
		<HeroTextContext.Provider value={{ heroTextVisible, setHeroTextVisible }}>
			{children}
		</HeroTextContext.Provider>
	)
}

export function useHeroText() {
	const context = useContext(HeroTextContext)
	if (context === undefined) {
		throw new Error('useHeroText must be used within a HeroTextProvider')
	}
	return context
}
