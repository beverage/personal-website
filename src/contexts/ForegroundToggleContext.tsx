'use client'

import React, { createContext, useContext, useState } from 'react'

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
	const [foregroundEnabled, setForegroundEnabled] = useState(true)

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
