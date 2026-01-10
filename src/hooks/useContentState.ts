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

/**
 * Get the initial content state from sessionStorage or default to 'hero'
 */
function getInitialContentState(): ContentState {
	if (typeof window === 'undefined') return 'hero'

	try {
		const stored = sessionStorage.getItem(CONTENT_STATE_KEY)
		if (stored && ['hero', 'projects', 'contact', 'quiz'].includes(stored)) {
			return stored as ContentState
		}
	} catch (error) {
		console.error('Failed to read content state from sessionStorage:', error)
	}

	return 'hero'
}

export const useContentState = (): UseContentStateReturn => {
	const [contentState, setContentStateInternal] = useState<ContentState>(
		getInitialContentState,
	)
	const [isTransitioning, setIsTransitioning] = useState(false)

	// Track what content we're transitioning FROM and TO
	const [fromContentState, setFromContentState] = useState<ContentState>(
		getInitialContentState,
	)
	const [toContentState, setToContentState] = useState<ContentState>(
		getInitialContentState,
	)

	// Persist content state to sessionStorage whenever it changes
	useEffect(() => {
		try {
			sessionStorage.setItem(CONTENT_STATE_KEY, contentState)
		} catch (error) {
			console.error('Failed to save content state to sessionStorage:', error)
		}
	}, [contentState])

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
