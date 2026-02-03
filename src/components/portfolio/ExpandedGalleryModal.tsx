'use client'

import { GALLERY_MODAL_ANIMATION_CONFIG } from '@/lib/animation/GalleryModalAnimationConfig'
import useEmblaCarousel from 'embla-carousel-react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ExpandedGalleryModalProps {
	/** Array of video URLs to display */
	videos: string[]
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback when modal should close */
	onClose: () => void
	/** Initial slide index to start on */
	initialIndex?: number
	/** Alt text for accessibility */
	alt?: string
}

type AnimationStage =
	| 'closed'
	| 'opening-backdrop'
	| 'opening-height'
	| 'opening-width'
	| 'opening-content'
	| 'open'
	| 'closing-content'
	| 'closing-width'
	| 'closing-height'
	| 'closing-backdrop'

/**
 * Expanded gallery modal for viewing videos at a larger size.
 * Features multi-stage animation, keyboard navigation, and lazy loading.
 */
export function ExpandedGalleryModal({
	videos,
	isOpen,
	onClose,
	initialIndex = 0,
	alt = 'Preview video',
}: ExpandedGalleryModalProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: true,
		startIndex: initialIndex,
	})
	const [canScrollPrev, setCanScrollPrev] = useState(false)
	const [canScrollNext, setCanScrollNext] = useState(false)
	const [mounted, setMounted] = useState(false)
	const [stage, setStage] = useState<AnimationStage>('closed')

	// Track which slides have been visited (to keep them loaded)
	const [visitedSlides, setVisitedSlides] = useState<Set<number>>(
		() => new Set([initialIndex]),
	)
	// Track which videos are still loading
	const [loadingVideos, setLoadingVideos] = useState<Set<number>>(
		() => new Set([initialIndex]),
	)

	// Handle client-side mounting for portal
	useEffect(() => {
		setMounted(true)
	}, [])

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

	// Handle opening animation sequence
	useEffect(() => {
		if (!isOpen || stage !== 'closed') return

		// Start opening sequence
		setStage('opening-backdrop')

		const config = GALLERY_MODAL_ANIMATION_CONFIG.open
		const timers: NodeJS.Timeout[] = []

		timers.push(
			setTimeout(() => {
				setStage('opening-height')
			}, config.backdropFadeIn.duration * 1000),
		)

		timers.push(
			setTimeout(
				() => {
					setStage('opening-width')
				},
				config.heightGrow.delay * 1000 + config.heightGrow.duration * 1000,
			),
		)

		timers.push(
			setTimeout(
				() => {
					setStage('opening-content')
				},
				config.widthExpand.delay * 1000 + config.widthExpand.duration * 1000,
			),
		)

		timers.push(
			setTimeout(
				() => {
					setStage('open')
				},
				config.contentFadeIn.delay * 1000 +
					config.contentFadeIn.duration * 1000,
			),
		)

		return () => {
			timers.forEach(clearTimeout)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen])

	// Handle closing animation sequence
	const handleClose = useCallback(() => {
		// Allow closing from any stage except already closed or already closing
		if (stage === 'closed' || stage.startsWith('closing')) {
			return
		}

		setStage('closing-content')

		const config = GALLERY_MODAL_ANIMATION_CONFIG.close
		const timers: NodeJS.Timeout[] = []

		timers.push(
			setTimeout(() => {
				setStage('closing-width')
			}, config.contentFadeOut.duration * 1000),
		)

		timers.push(
			setTimeout(
				() => {
					setStage('closing-height')
				},
				config.widthContract.delay * 1000 +
					config.widthContract.duration * 1000,
			),
		)

		timers.push(
			setTimeout(
				() => {
					setStage('closing-backdrop')
				},
				config.heightShrink.delay * 1000 + config.heightShrink.duration * 1000,
			),
		)

		timers.push(
			setTimeout(
				() => {
					setStage('closed')
					onClose()
				},
				config.backdropFadeOut.delay * 1000 +
					config.backdropFadeOut.duration * 1000,
			),
		)
	}, [stage, onClose])

	// Keyboard navigation
	useEffect(() => {
		if (stage === 'closed') return

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'Escape':
					handleClose()
					break
				case 'ArrowLeft':
					if (stage === 'open') scrollPrev()
					break
				case 'ArrowRight':
					if (stage === 'open') scrollNext()
					break
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [stage, handleClose, scrollPrev, scrollNext])

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (stage !== 'closed') {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [stage])

	// Reset lazy loading state when modal closes for fresh load on next open
	useEffect(() => {
		if (stage === 'closed') {
			setVisitedSlides(new Set([initialIndex]))
			setLoadingVideos(new Set([initialIndex]))
		}
	}, [stage, initialIndex])

	if (!mounted || stage === 'closed') return null

	const showArrows = videos.length > 1
	const config = GALLERY_MODAL_ANIMATION_CONFIG

	// Calculate visibility states (stage is never 'closed' here due to early return above)
	const backdropVisible = stage !== 'closing-backdrop'
	const cardVisible =
		stage !== 'opening-backdrop' && stage !== 'closing-backdrop'
	const contentVisible =
		stage === 'opening-content' ||
		stage === 'open' ||
		stage === 'closing-content'

	// Calculate card dimensions based on stage
	// Opening: point → height grows → width expands
	// Closing: width contracts → height shrinks → point
	const getCardWidth = () => {
		switch (stage) {
			case 'opening-backdrop':
				return config.card.initialWidth
			case 'opening-height':
				return config.card.barWidth
			case 'opening-width':
			case 'opening-content':
			case 'open':
			case 'closing-content':
				return config.card.fullWidth
			case 'closing-width':
				return config.card.barWidth
			case 'closing-height':
				return config.card.barWidth
			case 'closing-backdrop':
				return config.card.initialWidth
			default:
				return config.card.fullWidth
		}
	}

	const getCardHeight = () => {
		switch (stage) {
			case 'opening-backdrop':
				return config.card.initialHeight
			case 'opening-height':
			case 'opening-width':
			case 'opening-content':
			case 'open':
			case 'closing-content':
			case 'closing-width':
				return config.card.barHeight
			case 'closing-height':
				return config.card.initialHeight
			case 'closing-backdrop':
				return config.card.initialHeight
			default:
				return config.card.barHeight
		}
	}

	const modalContent = (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			role="dialog"
			aria-modal="true"
			aria-label="Expanded gallery"
		>
			{/* Backdrop */}
			<AnimatePresence>
				{backdropVisible && (
					<motion.div
						className="absolute inset-0 bg-black/70 backdrop-blur-md"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							duration: stage.startsWith('opening')
								? config.open.backdropFadeIn.duration
								: config.close.backdropFadeOut.duration,
						}}
						onClick={handleClose}
					/>
				)}
			</AnimatePresence>

			{/* Animated card */}
			<AnimatePresence>
				{cardVisible && (
					<motion.div
						className="relative mx-4 rounded-xl border border-cyan-400/30 bg-black/90"
						initial={{
							width: config.card.initialWidth,
							height: config.card.initialHeight,
						}}
						animate={{
							width: getCardWidth(),
							height: getCardHeight(),
						}}
						exit={{
							width: config.card.initialWidth,
							height: config.card.initialHeight,
						}}
						transition={{
							width: {
								duration:
									stage === 'opening-width'
										? config.open.widthExpand.duration
										: stage === 'closing-width'
											? config.close.widthContract.duration
											: 0.05,
								ease:
									stage === 'opening-width' || stage === 'closing-width'
										? [0.25, 0.1, 0.25, 1]
										: 'linear',
							},
							height: {
								duration:
									stage === 'opening-height'
										? config.open.heightGrow.duration
										: stage === 'closing-height'
											? config.close.heightShrink.duration
											: 0.05,
								ease:
									stage === 'opening-height' || stage === 'closing-height'
										? [0.25, 0.1, 0.25, 1]
										: 'linear',
							},
						}}
						style={{
							transformOrigin: 'center',
							maxWidth: '64rem', // max-w-5xl
							overflow: 'hidden',
						}}
						onClick={e => e.stopPropagation()}
					>
						{/* Content container - fades in last */}
						<motion.div
							className="h-full w-full p-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: contentVisible ? 1 : 0 }}
							transition={{
								duration:
									stage === 'opening-content'
										? config.open.contentFadeIn.duration
										: config.close.contentFadeOut.duration,
							}}
						>
							{/* Close button - horizontally aligned with next arrow */}
							<button
								onClick={handleClose}
								className="absolute top-6 right-6 z-10 rounded-full border border-cyan-400/70 bg-black/60 p-2 text-cyan-300 backdrop-blur-sm transition-all hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40"
								aria-label="Close gallery"
							>
								<X size={20} />
							</button>

							{/* Embla viewport */}
							<div ref={emblaRef} className="h-full overflow-hidden rounded-lg">
								<div className="flex h-full">
									{videos.map((videoUrl, index) => (
										<div
											key={videoUrl}
											className="relative h-full min-w-0 flex-[0_0_100%]"
										>
											{/* Loading spinner - shows during initial load and stalls */}
											{loadingVideos.has(index) && (
												<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/50">
													<Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
												</div>
											)}
											{/* Only render video if slide has been visited */}
											{visitedSlides.has(index) && (
												<video
													src={videoUrl}
													autoPlay
													muted
													loop
													playsInline
													className="h-full w-full object-contain"
													aria-label={`${alt} ${index + 1}`}
													onPlaying={() => {
														// Hide spinner when video starts/resumes playing
														setLoadingVideos(prev => {
															const next = new Set(prev)
															next.delete(index)
															return next
														})
													}}
													onWaiting={() => {
														// Show spinner when video stalls (buffering)
														setLoadingVideos(prev => new Set(prev).add(index))
													}}
												/>
											)}
										</div>
									))}
								</div>
							</div>

							{/* Navigation arrows - only show if multiple items */}
							{showArrows && (
								<>
									{/* Previous button */}
									<button
										onClick={scrollPrev}
										disabled={!canScrollPrev}
										className="absolute top-1/2 left-6 z-10 -translate-y-1/2 rounded-full border border-cyan-400/70 bg-black/60 p-2 text-cyan-300 backdrop-blur-sm transition-all hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/40 disabled:hover:bg-black/60 disabled:hover:shadow-none"
										aria-label="Previous slide"
									>
										<ChevronLeft size={20} />
									</button>

									{/* Next button */}
									<button
										onClick={scrollNext}
										disabled={!canScrollNext}
										className="absolute top-1/2 right-6 z-10 -translate-y-1/2 rounded-full border border-cyan-400/70 bg-black/60 p-2 text-cyan-300 backdrop-blur-sm transition-all hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/40 disabled:hover:bg-black/60 disabled:hover:shadow-none"
										aria-label="Next slide"
									>
										<ChevronRight size={20} />
									</button>
								</>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)

	return createPortal(modalContent, document.body)
}
