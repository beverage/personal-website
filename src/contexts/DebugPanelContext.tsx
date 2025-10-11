'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface DebugPanelContextType {
	isExpanded: boolean
	setIsExpanded: (expanded: boolean) => void
	toggleExpanded: () => void
	initialLoadComplete: boolean
}

const DebugPanelContext = createContext<DebugPanelContextType | undefined>(
	undefined,
)

const DEBUG_PANEL_STORAGE_KEY = 'debug-panel-expanded'

export function DebugPanelProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [isExpanded, setIsExpandedState] = useState(false)
	const [initialLoadComplete, setInitialLoadComplete] = useState(false)
	const [hasHydrated, setHasHydrated] = useState(false)

	// Read from localStorage immediately on client mount (before initial load complete)
	useEffect(() => {
		const stored = localStorage.getItem(DEBUG_PANEL_STORAGE_KEY)
		if (stored === 'true') {
			setIsExpandedState(true)
		}
		setHasHydrated(true)
	}, [])

	// Signal initial load complete after controls have faded in
	// This matches the startup sequence timing: controlsFadeDelay (3000ms) + controlsFadeDuration (2000ms) = 5000ms
	// Only start timer after we've hydrated the state from localStorage
	useEffect(() => {
		if (!hasHydrated) return

		const timer = setTimeout(() => {
			setInitialLoadComplete(true)
		}, 5000)

		return () => clearTimeout(timer)
	}, [hasHydrated, isExpanded])

	// Save to localStorage when state changes
	const setIsExpanded = (expanded: boolean) => {
		setIsExpandedState(expanded)
		localStorage.setItem(DEBUG_PANEL_STORAGE_KEY, String(expanded))
	}

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded)
	}

	return (
		<DebugPanelContext.Provider
			value={{ isExpanded, setIsExpanded, toggleExpanded, initialLoadComplete }}
		>
			{children}
		</DebugPanelContext.Provider>
	)
}

export function useDebugPanel() {
	const context = useContext(DebugPanelContext)
	if (context === undefined) {
		throw new Error('useDebugPanel must be used within a DebugPanelProvider')
	}
	return context
}
