'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface DprGradientContextType {
	dprGradientEnabled: boolean
	setDprGradientEnabled: (enabled: boolean) => void
}

const DprGradientContext = createContext<DprGradientContextType | undefined>(
	undefined,
)

/**
 * Context for toggling DPR-adaptive gradient rendering
 * When enabled, uses gradient parameters optimized for the current DPR
 * When disabled, uses the baseline retina gradient for all displays
 */
export function DprGradientProvider({
	children,
}: {
	children: React.ReactNode
}) {
	// Default to disabled (use baseline gradient) for A/B testing
	const [dprGradientEnabled, setDprGradientEnabledState] = useState(false)

	// Load from localStorage after mounting (client-side only)
	useEffect(() => {
		const stored = localStorage.getItem('dev:dprGradientEnabled')
		if (stored !== null) {
			setDprGradientEnabledState(stored === 'true')
		}
	}, [])

	const setDprGradientEnabled = (enabled: boolean) => {
		setDprGradientEnabledState(enabled)
		localStorage.setItem('dev:dprGradientEnabled', String(enabled))
	}

	return (
		<DprGradientContext.Provider
			value={{ dprGradientEnabled, setDprGradientEnabled }}
		>
			{children}
		</DprGradientContext.Provider>
	)
}

export function useDprGradient() {
	const context = useContext(DprGradientContext)
	if (context === undefined) {
		throw new Error('useDprGradient must be used within a DprGradientProvider')
	}
	return context
}
