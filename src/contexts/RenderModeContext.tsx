'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type RenderMode = 'auto' | 'webgl' | 'canvas2d'

interface RenderModeContextType {
	renderMode: RenderMode
	setRenderMode: (mode: RenderMode) => void
}

const RenderModeContext = createContext<RenderModeContextType | undefined>(
	undefined,
)

export function RenderModeProvider({
	children,
}: {
	children: React.ReactNode
}) {
	// Default to 'auto' - automatically choose best renderer based on WebGL support
	const [renderMode, setRenderModeState] = useState<RenderMode>('auto')

	// Load from localStorage after mounting (client-side only)
	useEffect(() => {
		const stored = localStorage.getItem('dev:renderMode')
		if (stored) {
			setRenderModeState(stored as RenderMode)
		}
	}, [])

	const setRenderMode = (mode: RenderMode) => {
		setRenderModeState(mode)
		localStorage.setItem('dev:renderMode', mode)
	}

	return (
		<RenderModeContext.Provider value={{ renderMode, setRenderMode }}>
			{children}
		</RenderModeContext.Provider>
	)
}

export function useRenderMode() {
	const context = useContext(RenderModeContext)
	if (context === undefined) {
		throw new Error('useRenderMode must be used within a RenderModeProvider')
	}
	return context
}
