'use client'

import { useContentState } from '@/hooks/useContentState'
import { useStarFieldTransition } from '@/hooks/useStarFieldTransition'
import { COURSE_CHANGE_PRESETS } from '@/types/transitions'
import { FileText } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { HomepageLayeredStarField } from '../starfield/LayeredStarField'
import { BackButton } from './BackButton'
import { BrandPanel } from './BrandPanel'
import { ControlPanel } from './ControlPanel'
import { FooterPanel } from './FooterPanel'
import { HeroSection } from './HeroSection'

interface SocialLink {
	icon: 'github' | 'linkedin' | 'instagram' | 'mail'
	href: string
	label: string
}

interface ClientConfig {
	socialLinks: SocialLink[]
	copyrightYear: number
	cvUrl?: string
}

interface PageLayoutProps {
	children?: React.ReactNode
	showStarField?: boolean
	/** Optional override for starfield forward speed */
	speed?: number
	/** Fade-in duration for cluster layer, in milliseconds */
	fadeInDuration?: number
	/** Fade-out duration for cluster layer, in milliseconds */
	fadeOutDuration?: number
	brandName?: string
	heroTitle?: string
	heroDescription?: string
	onPrimaryClick?: () => void
	onSecondaryClick?: () => void
	clientConfig?: ClientConfig
	// Course change transition props
	enableTransitions?: boolean
	courseChangeVariant?: keyof typeof COURSE_CHANGE_PRESETS
}

export const PageLayout = ({
	children,
	showStarField = true,
	speed,
	fadeInDuration = 3000,
	fadeOutDuration = 3000,
	brandName,
	heroTitle,
	heroDescription,
	onPrimaryClick,
	onSecondaryClick,
	clientConfig,
	enableTransitions = true,
	courseChangeVariant = 'banking-turn',
}: PageLayoutProps) => {
	const [clusterVisible, setClusterVisible] = useState(showStarField)
	// Track star-field forward speed (1200 when cluster ON, 600 when OFF)
	const [starSpeed, setStarSpeed] = useState(clusterVisible ? 1200 : 400)

	// Track timeouts for cleanup
	const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

	// Helper to create tracked timeouts that get cleaned up on unmount
	const createTrackedTimeout = (callback: () => void, delay: number) => {
		const timeoutId = setTimeout(() => {
			timeoutsRef.current.delete(timeoutId)
			callback()
		}, delay)
		timeoutsRef.current.add(timeoutId)
		return timeoutId
	}

	// Cleanup all timeouts on unmount
	useEffect(() => {
		const timeouts = timeoutsRef.current
		return () => {
			timeouts.forEach(timeoutId => clearTimeout(timeoutId))
			timeouts.clear()
		}
	}, [])

	// Content state management
	const {
		contentState,
		navigateToProjects,
		navigateToContact,
		navigateToHero,
		isTransitioning: contentTransitioning,
		setIsTransitioning: setContentTransitioning,
	} = useContentState()

	// Transition system
	const transitionConfig = COURSE_CHANGE_PRESETS[courseChangeVariant]

	const {
		motionVectors,
		bankingRoll,
		startTransition,
		currentContentOpacity,
		newContentOpacity,
		isTransitioning,
	} = useStarFieldTransition({
		config: transitionConfig,
		baseForwardSpeed: speed ?? starSpeed,
		onTransitionComplete: () => {
			setContentTransitioning(false)
			// Reset transition tracking when complete
			setFromContentState(contentState)
			setToContentState(contentState)
		},
		onContentFadeComplete: () => {
			// Content fade transition is complete
		},
	})

	// Track what content we're transitioning FROM and TO
	const [fromContentState, setFromContentState] = useState<
		'hero' | 'projects' | 'contact'
	>('hero')
	const [toContentState, setToContentState] = useState<
		'hero' | 'projects' | 'contact'
	>('hero')

	// Calculate the appropriate opacity for each content type during transitions
	const getContentOpacity = useCallback(
		(contentType: 'hero' | 'projects' | 'contact') => {
			if (!isTransitioning) return 1 // Normal state: content fully visible

			// During transitions: assign opacity based on content role
			if (contentType === fromContentState) {
				return currentContentOpacity // Content fading OUT
			} else if (contentType === toContentState) {
				return newContentOpacity // Content fading IN
			} else {
				return 0 // Content not involved in current transition
			}
		},
		[
			isTransitioning,
			fromContentState,
			toContentState,
			currentContentOpacity,
			newContentOpacity,
		],
	)

	// Navigation handlers with course change transitions
	const handleExploreProjectsClick = () => {
		if (!enableTransitions || isTransitioning || contentTransitioning) return

		setContentTransitioning(true)
		setFromContentState(contentState)
		setToContentState('projects')
		startTransition('left')
		// Brief delay to prevent race condition between transition start and content change
		createTrackedTimeout(() => navigateToProjects(), 50)
	}

	const handleGetInTouchClick = () => {
		if (!enableTransitions || isTransitioning || contentTransitioning) return

		setContentTransitioning(true)
		setFromContentState(contentState)
		setToContentState('contact')
		startTransition('right')
		createTrackedTimeout(() => navigateToContact(), 50)
	}

	const handleBackClick = () => {
		if (isTransitioning || contentTransitioning) return

		const direction = contentState === 'projects' ? 'right' : 'left'
		setContentTransitioning(true)
		setFromContentState(contentState)
		setToContentState('hero')
		startTransition(direction)
		createTrackedTimeout(() => navigateToHero(), 50)
	}
	// Smoothly animate starfield speed based on cluster visibility
	useEffect(() => {
		let frameId: number
		let isActive = true
		let lastTime = performance.now()
		const accelUp = 1000 // Acceleration when cluster appears
		const accelDown = 2000 // Faster deceleration when cluster disappears

		const step = (now: number) => {
			if (!isActive) return // Stop if component unmounted

			const dt = (now - lastTime) / 1000
			lastTime = now

			setStarSpeed(prev => {
				const target = clusterVisible ? 1200 : 400
				const diff = target - prev
				if (Math.abs(diff) < 1) return target

				const rate = clusterVisible ? accelUp : accelDown
				const maxDelta = rate * dt
				return prev + Math.sign(diff) * Math.min(Math.abs(diff), maxDelta)
			})

			if (isActive) {
				frameId = requestAnimationFrame(step)
			}
		}

		frameId = requestAnimationFrame(step)
		return () => {
			isActive = false
			cancelAnimationFrame(frameId)
		}
	}, [clusterVisible])

	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			{/* Star Field Background */}
			<HomepageLayeredStarField
				showCluster={clusterVisible}
				// allow story control override; otherwise use animated starSpeed
				speed={speed ?? starSpeed}
				fadeInDuration={fadeInDuration}
				fadeOutDuration={fadeOutDuration}
				foregroundMotionVector={motionVectors.foreground}
				backgroundMotionVector={motionVectors.background}
				bankingRoll={bankingRoll}
			/>

			{/* LCARS-style branding panel */}
			<div className="absolute top-8 left-8 z-50 flex items-center gap-3">
				<BrandPanel brandName={brandName} />
				{/* Back button for Contact page (right of brand panel) */}
				{contentState === 'contact' && (
					<BackButton
						direction="left"
						onClick={handleBackClick}
						aria-label="Back to home"
					/>
				)}
			</div>

			{/* LCARS-style control panel */}
			<div className="absolute top-8 right-8 z-50 flex items-center gap-3">
				{/* Back button for Projects page (left of CV button) */}
				{contentState === 'projects' && (
					<BackButton
						direction="right"
						onClick={handleBackClick}
						aria-label="Back to home"
					/>
				)}
				{clientConfig?.cvUrl && (
					<a
						href={clientConfig.cvUrl}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Download CV (PDF)"
						className="inline-flex items-center gap-2 rounded-full border border-cyan-400/70 bg-black/40 px-3 py-2 text-cyan-300 hover:text-cyan-200"
					>
						<FileText size={16} />
						<span>CV</span>
					</a>
				)}
				<ControlPanel
					darkMode={clusterVisible}
					onToggle={() => setClusterVisible(!clusterVisible)}
				/>
			</div>

			{/* Main content */}
			<div className="relative z-10 min-h-screen">
				{children ||
					(() => {
						// Determine which content should be rendered during transitions
						const shouldRenderContent = (
							contentType: 'hero' | 'projects' | 'contact',
						) => {
							return !isTransitioning
								? contentState === contentType // Normal state: only current content
								: contentType === fromContentState ||
										contentType === toContentState // Transition: FROM and TO
						}

						return (
							<>
								{/* Hero Section */}
								{shouldRenderContent('hero') && (
									<div
										className={`${
											isTransitioning
												? 'absolute inset-0 flex items-center justify-center px-6'
												: 'flex min-h-screen items-center justify-center px-6'
										}`}
										style={{
											opacity: getContentOpacity('hero'),
											pointerEvents:
												getContentOpacity('hero') === 0 ? 'none' : 'auto',
										}}
									>
										<HeroSection
											title={heroTitle}
											description={heroDescription}
											onPrimaryClick={onPrimaryClick || handleGetInTouchClick}
											onSecondaryClick={
												onSecondaryClick || handleExploreProjectsClick
											}
										/>
									</div>
								)}

								{/* Projects Section */}
								{shouldRenderContent('projects') && (
									<div
										className={`${
											isTransitioning
												? 'absolute inset-0 flex items-center justify-center px-6'
												: 'flex min-h-screen items-center justify-center px-6'
										}`}
										style={{
											opacity: getContentOpacity('projects'),
											pointerEvents:
												getContentOpacity('projects') === 0 ? 'none' : 'auto',
										}}
									>
										<div className="max-w-5xl text-center">
											<h1 className="font-exo2 mb-8 text-6xl tracking-wider sm:text-8xl">
												<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
													Projects
												</span>
											</h1>
											<p className="font-exo2 mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-white/90 sm:text-2xl">
												Explore my work and projects.
											</p>
										</div>
									</div>
								)}

								{/* Contact Section */}
								{shouldRenderContent('contact') && (
									<div
										className={`${
											isTransitioning
												? 'absolute inset-0 flex items-center justify-center px-6'
												: 'flex min-h-screen items-center justify-center px-6'
										}`}
										style={{
											opacity: getContentOpacity('contact'),
											pointerEvents:
												getContentOpacity('contact') === 0 ? 'none' : 'auto',
										}}
									>
										<div className="max-w-5xl text-center">
											<h1 className="font-exo2 mb-8 text-6xl tracking-wider sm:text-8xl">
												<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
													Get In Touch
												</span>
											</h1>
											<p className="font-exo2 mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-white/90 sm:text-2xl">
												Let&apos;s connect and build something amazing together.
											</p>
										</div>
									</div>
								)}
							</>
						)
					})()}
			</div>

			{/* LCARS-style footer */}
			<div className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 transform">
				<FooterPanel
					year={clientConfig?.copyrightYear}
					socialLinks={clientConfig?.socialLinks}
				/>
			</div>
		</div>
	)
}
