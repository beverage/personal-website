'use client'

import { useVideoCarousel } from '@/hooks/useVideoCarousel'
import { ChevronLeft, ChevronRight, Expand, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ExpandedGalleryModal } from './ExpandedGalleryModal'

interface MediaCarouselProps {
	/** Array of video URLs to display in preview */
	videos: string[]
	/** Optional array of higher resolution videos for expanded modal */
	expandedVideos?: string[]
	/** Optional CSS class name */
	className?: string
	/** Alt text for accessibility */
	alt?: string
	/** Controlled modal open state */
	isModalOpen?: boolean
	/** Callback when modal open state changes */
	onModalOpenChange?: (open: boolean) => void
	/** Whether this carousel is currently focused/visible */
	isFocused?: boolean
}

/**
 * Media carousel component for displaying video previews with navigation arrows.
 * Uses Embla Carousel for smooth swiping and navigation.
 * Includes an expand button to open a larger modal view with optional higher resolution videos.
 * Supports controlled mode via isModalOpen and onModalOpenChange props.
 */
export function MediaCarousel({
	videos,
	expandedVideos,
	className = '',
	alt = 'Preview video',
	isModalOpen: controlledIsOpen,
	onModalOpenChange,
	isFocused = false,
}: MediaCarouselProps) {
	const [internalIsOpen, setInternalIsOpen] = useState(false)

	// Support both controlled and uncontrolled modes
	const isModalOpen = controlledIsOpen ?? internalIsOpen
	const setIsModalOpen = onModalOpenChange ?? setInternalIsOpen

	const {
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
	} = useVideoCarousel({
		initialIndex: 0,
		isActive: isFocused,
		resetOnActivate: true,
	})

	// Reset lazy loading state when focus is lost for fresh load on next focus
	useEffect(() => {
		if (!isFocused) {
			resetState()
		}
	}, [isFocused, resetState])

	const handleOpenModal = useCallback(() => {
		setIsModalOpen(true)
	}, [setIsModalOpen])

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false)
	}, [setIsModalOpen])

	const showArrows = videos.length > 1

	return (
		<>
			<div
				className={`relative overflow-hidden rounded-lg border border-cyan-400/30 ${className}`}
			>
				{/* Embla viewport */}
				<div ref={emblaRef} className="overflow-hidden">
					<div className="flex">
						{videos.map((videoUrl, index) => (
							<div key={videoUrl} className="relative min-w-0 flex-[0_0_100%]">
								{/* Loading spinner - shows during initial load and stalls */}
								{loadingVideos.has(index) && (
									<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/50">
										<Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
									</div>
								)}
								{/* Only render video if slide has been visited */}
								{visitedSlides.has(index) && (
									<video
										ref={el => {
											videoRefs.current[index] = el
										}}
										src={videoUrl}
										autoPlay
										muted
										loop
										playsInline
										className="h-64 w-full object-contain"
										aria-label={`${alt} ${index + 1}`}
										onPlaying={() => handleVideoPlaying(index)}
										onWaiting={() => handleVideoWaiting(index)}
									/>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Expand button - bottom right, horizontally aligned with right arrow */}
				<button
					onClick={handleOpenModal}
					className="absolute right-2 bottom-2 z-10 p-1.5 text-cyan-300 transition-all hover:text-white"
					aria-label="Expand gallery"
				>
					<Expand size={20} />
				</button>

				{/* Navigation arrows and page indicator - only show if multiple items */}
				{showArrows && (
					<>
						{/* Page indicator - upper right, centered over next button */}
						<div
							className="absolute top-2 right-2 z-10 flex w-9 justify-center text-sm font-medium text-cyan-300"
							aria-label={`Slide ${currentIndex + 1} of ${videos.length}`}
						>
							{currentIndex + 1} / {videos.length}
						</div>

						{/* Previous button */}
						<button
							onClick={scrollPrev}
							disabled={!canScrollPrev}
							className="absolute top-1/2 left-2 z-10 -translate-y-1/2 p-1.5 text-cyan-300 transition-all hover:text-white disabled:cursor-not-allowed disabled:text-white/40"
							aria-label="Previous slide"
						>
							<ChevronLeft size={24} />
						</button>

						{/* Next button */}
						<button
							onClick={scrollNext}
							disabled={!canScrollNext}
							className="absolute top-1/2 right-2 z-10 -translate-y-1/2 p-1.5 text-cyan-300 transition-all hover:text-white disabled:cursor-not-allowed disabled:text-white/40"
							aria-label="Next slide"
						>
							<ChevronRight size={24} />
						</button>
					</>
				)}
			</div>

			{/* Expanded gallery modal - uses higher res videos if available */}
			<ExpandedGalleryModal
				videos={expandedVideos ?? videos}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				initialIndex={currentIndex}
				alt={alt}
			/>
		</>
	)
}
