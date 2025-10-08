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
	// Default to 'auto' - automatically choose best renderer based on WebGL support
	const [renderMode, setRenderMode] = useState<RenderMode>('auto')

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
