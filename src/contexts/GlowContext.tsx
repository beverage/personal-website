'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface GlowContextType {
	glowEnabled: boolean
	setGlowEnabled: (enabled: boolean) => void
}

const GlowContext = createContext<GlowContextType | undefined>(undefined)

export function GlowProvider({ children }: { children: React.ReactNode }) {
	// Default to enabled
	const [glowEnabled, setGlowEnabledState] = useState(true)

	// Load from localStorage after mounting (client-side only)
	useEffect(() => {
		const stored = localStorage.getItem('dev:glowEnabled')
		if (stored !== null) {
			setGlowEnabledState(stored === 'true')
		}
	}, [])

	const setGlowEnabled = (enabled: boolean) => {
		setGlowEnabledState(enabled)
		localStorage.setItem('dev:glowEnabled', String(enabled))
	}

	return (
		<GlowContext.Provider value={{ glowEnabled, setGlowEnabled }}>
			{children}
		</GlowContext.Provider>
	)
}

export function useGlow() {
	const context = useContext(GlowContext)
	if (context === undefined) {
		throw new Error('useGlow must be used within a GlowProvider')
	}
	return context
}
