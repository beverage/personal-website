'use client'

import React, { createContext, useContext, useState } from 'react'

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
	// Default to 'webgl' in development for easier debugging
	const defaultMode: RenderMode =
		process.env.NODE_ENV === 'development' ? 'webgl' : 'auto'

	const [renderMode, setRenderMode] = useState<RenderMode>(defaultMode)

	const handleSetRenderMode = (mode: RenderMode) => {
		setRenderMode(mode)
	}

	return (
		<RenderModeContext.Provider
			value={{ renderMode, setRenderMode: handleSetRenderMode }}
		>
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
