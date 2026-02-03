'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
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
}: MediaCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
	const [canScrollPrev, setCanScrollPrev] = useState(false)
	const [canScrollNext, setCanScrollNext] = useState(false)
	const [internalIsOpen, setInternalIsOpen] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)

	// Support both controlled and uncontrolled modes
	const isModalOpen = controlledIsOpen ?? internalIsOpen
	const setIsModalOpen = onModalOpenChange ?? setInternalIsOpen

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev()
	}, [emblaApi])

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext()
	}, [emblaApi])

	const onSelect = useCallback(() => {
		if (!emblaApi) return
		setCanScrollPrev(emblaApi.canScrollPrev())
		setCanScrollNext(emblaApi.canScrollNext())
		setCurrentIndex(emblaApi.selectedScrollSnap())
	}, [emblaApi])

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
							<div key={videoUrl} className="min-w-0 flex-[0_0_100%]">
								<video
									src={videoUrl}
									autoPlay
									muted
									loop
									playsInline
									className="h-64 w-full object-contain"
									aria-label={`${alt} ${index + 1}`}
								/>
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

				{/* Navigation arrows - only show if multiple items */}
				{showArrows && (
					<>
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
