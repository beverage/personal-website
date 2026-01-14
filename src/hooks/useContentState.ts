'use client'

import { type ContentState } from '@/types/transitions'
import { useCallback, useEffect, useState } from 'react'

interface UseContentStateReturn {
	contentState: ContentState
	setContentState: (state: ContentState) => void
	navigateToProjects: () => void
	navigateToContact: () => void
	navigateToHero: () => void
	navigateToQuiz: () => void
	isTransitioning: boolean
	setIsTransitioning: (transitioning: boolean) => void
	fromContentState: ContentState
	toContentState: ContentState
	setFromContentState: (state: ContentState) => void
	setToContentState: (state: ContentState) => void
}

const CONTENT_STATE_KEY = 'contentState'

export const useContentState = (): UseContentStateReturn => {
	// Always start with 'hero' to avoid hydration mismatch
	const [contentState, setContentStateInternal] = useState<ContentState>('hero')
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [hasHydrated, setHasHydrated] = useState(false)

	// Track what content we're transitioning FROM and TO
	const [fromContentState, setFromContentState] = useState<ContentState>('hero')
	const [toContentState, setToContentState] = useState<ContentState>('hero')

	// Restore from sessionStorage after hydration (client-side only)
	useEffect(() => {
		try {
			const stored = sessionStorage.getItem(CONTENT_STATE_KEY)
			if (stored && ['hero', 'projects', 'contact', 'quiz'].includes(stored)) {
				const restoredState = stored as ContentState
				setContentStateInternal(restoredState)
				setFromContentState(restoredState)
				setToContentState(restoredState)
			}
		} catch (error) {
			console.error('Failed to read content state from sessionStorage:', error)
		}
		setHasHydrated(true)
	}, [])

	// Persist content state to sessionStorage whenever it changes (after hydration)
	useEffect(() => {
		if (!hasHydrated) return
		try {
			sessionStorage.setItem(CONTENT_STATE_KEY, contentState)
		} catch (error) {
			console.error('Failed to save content state to sessionStorage:', error)
		}
	}, [contentState, hasHydrated])

	// Wrapper to persist state when setting
	const setContentState = useCallback((state: ContentState) => {
		setContentStateInternal(state)
	}, [])

	const navigateToProjects = useCallback(() => {
		if (isTransitioning) return
		setContentStateInternal('projects')
	}, [isTransitioning])

	const navigateToContact = useCallback(() => {
		if (isTransitioning) return
		setContentStateInternal('contact')
	}, [isTransitioning])

	const navigateToHero = useCallback(() => {
		if (isTransitioning) return
		setContentStateInternal('hero')
	}, [isTransitioning])

	const navigateToQuiz = useCallback(() => {
		if (isTransitioning) return
		setContentStateInternal('quiz')
	}, [isTransitioning])

	return {
		contentState,
		setContentState,
		navigateToProjects,
		navigateToContact,
		navigateToHero,
		navigateToQuiz,
		isTransitioning,
		setIsTransitioning,
		fromContentState,
		toContentState,
		setFromContentState,
		setToContentState,
	}
}
