'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface TwinkleContextType {
	twinkleEnabled: boolean
	setTwinkleEnabled: (enabled: boolean) => void
}

const TwinkleContext = createContext<TwinkleContextType | undefined>(undefined)

export function TwinkleProvider({ children }: { children: React.ReactNode }) {
	// Default to enabled (as requested)
	const [twinkleEnabled, setTwinkleEnabledState] = useState(true)

	// Load from localStorage after mounting (client-side only)
	useEffect(() => {
		const stored = localStorage.getItem('dev:twinkleEnabled')
		if (stored !== null) {
			setTwinkleEnabledState(stored === 'true')
		}
	}, [])

	const setTwinkleEnabled = (enabled: boolean) => {
		setTwinkleEnabledState(enabled)
		localStorage.setItem('dev:twinkleEnabled', String(enabled))
	}

	return (
		<TwinkleContext.Provider value={{ twinkleEnabled, setTwinkleEnabled }}>
			{children}
		</TwinkleContext.Provider>
	)
}

export function useTwinkle() {
	const context = useContext(TwinkleContext)
	if (context === undefined) {
		throw new Error('useTwinkle must be used within a TwinkleProvider')
	}
	return context
}
