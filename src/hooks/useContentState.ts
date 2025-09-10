'use client'

import { type ContentState } from '@/types/transitions'
import { useCallback, useState } from 'react'

interface UseContentStateReturn {
	contentState: ContentState
	setContentState: (state: ContentState) => void
	navigateToProjects: () => void
	navigateToContact: () => void
	navigateToHero: () => void
	isTransitioning: boolean
	setIsTransitioning: (transitioning: boolean) => void
}

export const useContentState = (): UseContentStateReturn => {
	const [contentState, setContentState] = useState<ContentState>('hero')
	const [isTransitioning, setIsTransitioning] = useState(false)

	const navigateToProjects = useCallback(() => {
		if (isTransitioning) return
		setContentState('projects')
	}, [isTransitioning])

	const navigateToContact = useCallback(() => {
		if (isTransitioning) return
		setContentState('contact')
	}, [isTransitioning])

	const navigateToHero = useCallback(() => {
		if (isTransitioning) return
		setContentState('hero')
	}, [isTransitioning])

	return {
		contentState,
		setContentState,
		navigateToProjects,
		navigateToContact,
		navigateToHero,
		isTransitioning,
		setIsTransitioning,
	}
}
