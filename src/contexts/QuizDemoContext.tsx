'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface QuizDemoContextType {
	quizDemoEnabled: boolean
	setQuizDemoEnabled: (enabled: boolean) => void
}

const QuizDemoContext = createContext<QuizDemoContextType | undefined>(
	undefined,
)

export function QuizDemoProvider({ children }: { children: React.ReactNode }) {
	// Default to disabled (off by default)
	const [quizDemoEnabled, setQuizDemoEnabledState] = useState(false)

	// Load from localStorage after mounting (client-side only)
	useEffect(() => {
		const stored = localStorage.getItem('dev:quizDemoEnabled')
		if (stored !== null) {
			setQuizDemoEnabledState(stored === 'true')
		}
	}, [])

	const setQuizDemoEnabled = (enabled: boolean) => {
		setQuizDemoEnabledState(enabled)
		localStorage.setItem('dev:quizDemoEnabled', String(enabled))
	}

	return (
		<QuizDemoContext.Provider value={{ quizDemoEnabled, setQuizDemoEnabled }}>
			{children}
		</QuizDemoContext.Provider>
	)
}

export function useQuizDemo() {
	const context = useContext(QuizDemoContext)
	if (context === undefined) {
		throw new Error('useQuizDemo must be used within a QuizDemoProvider')
	}
	return context
}
