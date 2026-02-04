'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseVideoCarouselOptions {
	/** Initial slide index */
	initialIndex?: number
	/** Whether the carousel should loop */
	loop?: boolean
	/** Whether the carousel is currently active/visible (controls playback) */
	isActive?: boolean
	/** Whether to reset videos to beginning when becoming active */
	resetOnActivate?: boolean
}

interface UseVideoCarouselReturn {
	/** Ref to attach to the Embla viewport element */
	emblaRef: ReturnType<typeof useEmblaCarousel>[0]
	/** Current slide index */
	currentIndex: number
	/** Whether previous navigation is available */
	canScrollPrev: boolean
	/** Whether next navigation is available */
	canScrollNext: boolean
	/** Navigate to previous slide */
	scrollPrev: () => void
	/** Navigate to next slide */
	scrollNext: () => void
	/** Set of slide indices that have been visited (for lazy loading) */
	visitedSlides: Set<number>
	/** Set of slide indices currently loading/buffering */
	loadingVideos: Set<number>
	/** Ref array for video elements */
	videoRefs: React.MutableRefObject<(HTMLVideoElement | null)[]>
	/** Handler for video onPlaying event */
	handleVideoPlaying: (index: number) => void
	/** Handler for video onWaiting event */
	handleVideoWaiting: (index: number) => void
	/** Reset carousel state (visited slides, loading, current index) */
	resetState: () => void
}

/**
 * Custom hook for video carousel logic shared between MediaCarousel and ExpandedGalleryModal.
 * Handles Embla carousel setup, video state management, lazy loading, and playback control.
 */
export function useVideoCarousel({
	initialIndex = 0,
	loop = true,
	isActive = true,
	resetOnActivate = false,
}: UseVideoCarouselOptions): UseVideoCarouselReturn {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop,
		startIndex: initialIndex,
	})
	const [canScrollPrev, setCanScrollPrev] = useState(false)
	const [canScrollNext, setCanScrollNext] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

	// Track which slides have been visited (for lazy loading)
	const [visitedSlides, setVisitedSlides] = useState<Set<number>>(
		() => new Set([initialIndex]),
	)
	// Track which videos are still loading/buffering
	const [loadingVideos, setLoadingVideos] = useState<Set<number>>(
		() => new Set([initialIndex]),
	)

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev()
	}, [emblaApi])

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext()
	}, [emblaApi])

	const onSelect = useCallback(() => {
		if (!emblaApi) return
		const index = emblaApi.selectedScrollSnap()
		// Only add to loading if this is a newly visited slide
		setVisitedSlides(prev => {
			if (!prev.has(index)) {
				setLoadingVideos(loading => new Set(loading).add(index))
			}
			return new Set(prev).add(index)
		})
		setCanScrollPrev(emblaApi.canScrollPrev())
		setCanScrollNext(emblaApi.canScrollNext())
		setCurrentIndex(index)
	}, [emblaApi])

	// Register Embla event listeners
	useEffect(() => {
		if (!emblaApi) return
		onSelect()
		emblaApi.on('select', onSelect)
		emblaApi.on('reInit', onSelect)
		return () => {
			emblaApi.off('select', onSelect)
			emblaApi.off('reInit', onSelect)
		}
	}, [emblaApi, onSelect])

	// Reset videos to beginning when becoming active (if enabled)
	useEffect(() => {
		if (resetOnActivate && isActive) {
			videoRefs.current.forEach(video => {
				if (video) {
					video.currentTime = 0
				}
			})
		}
		// Only run when isActive changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive])

	// Control video playback based on active state and current slide
	useEffect(() => {
		videoRefs.current.forEach((video, index) => {
			if (!video) return

			if (isActive && index === currentIndex) {
				// Play only the current slide when active
				video.play().catch(() => {
					// Ignore autoplay errors (browser policy)
				})
			} else {
				// Pause non-current slides and all slides when not active
				video.pause()
			}
		})
	}, [isActive, currentIndex])

	// Handler for video onPlaying event
	const handleVideoPlaying = useCallback((index: number) => {
		setLoadingVideos(prev => {
			const next = new Set(prev)
			next.delete(index)
			return next
		})
	}, [])

	// Handler for video onWaiting event
	const handleVideoWaiting = useCallback((index: number) => {
		setLoadingVideos(prev => new Set(prev).add(index))
	}, [])

	// Reset carousel state
	const resetState = useCallback(() => {
		setVisitedSlides(new Set([initialIndex]))
		setLoadingVideos(new Set([initialIndex]))
		setCurrentIndex(initialIndex)
	}, [initialIndex])

	return {
		emblaRef,
		currentIndex,
		canScrollPrev,
		canScrollNext,
		scrollPrev,
		scrollNext,
		visitedSlides,
		loadingVideos,
		videoRefs,
		handleVideoPlaying,
		handleVideoWaiting,
		resetState,
	}
}
