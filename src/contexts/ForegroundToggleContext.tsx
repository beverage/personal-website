'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ForegroundToggleContextType {
	foregroundEnabled: boolean
	setForegroundEnabled: (enabled: boolean) => void
}

const ForegroundToggleContext = createContext<
	ForegroundToggleContextType | undefined
>(undefined)

export function ForegroundToggleProvider({
	children,
}: {
	children: React.ReactNode
}) {
	// Default to enabled (can be toggled in dev mode via ForegroundToggle control)
	const [foregroundEnabled, setForegroundEnabledState] = useState(true)

	// Load from localStorage after mounting (client-side only)
	useEffect(() => {
		const stored = localStorage.getItem('dev:foregroundEnabled')
		if (stored !== null) {
			setForegroundEnabledState(stored === 'true')
		}
	}, [])

	const setForegroundEnabled = (enabled: boolean) => {
		setForegroundEnabledState(enabled)
		localStorage.setItem('dev:foregroundEnabled', String(enabled))
	}

	return (
		<ForegroundToggleContext.Provider
			value={{ foregroundEnabled, setForegroundEnabled }}
		>
			{children}
		</ForegroundToggleContext.Provider>
	)
}

export function useForegroundToggle() {
	const context = useContext(ForegroundToggleContext)
	if (context === undefined) {
		throw new Error(
			'useForegroundToggle must be used within a ForegroundToggleProvider',
		)
	}
	return context
}
