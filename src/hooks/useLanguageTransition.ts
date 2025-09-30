'use client'

import { LANGUAGE_TRANSITION_CONFIG } from '@/types/transitions'
import { useEffect, useRef, useState } from 'react'

/**
 * Tracks language changes and manages transition state
 */
export function useLanguageTransition(language: string): boolean {
	const [isLanguageTransitioning, setIsLanguageTransitioning] = useState(false)
	const prevLanguageRef = useRef<string>(language)

	// Track language changes and set transitioning state
	useEffect(() => {
		if (prevLanguageRef.current !== language) {
			setIsLanguageTransitioning(true)
			// All elements use textDuration for crossfade (buttons animate same as text)
			const timeout = setTimeout(() => {
				setIsLanguageTransitioning(false)
			}, LANGUAGE_TRANSITION_CONFIG.textDuration * 2) // *2 for exit + enter
			prevLanguageRef.current = language
			return () => clearTimeout(timeout)
		}
	}, [language])

	return isLanguageTransitioning
}
