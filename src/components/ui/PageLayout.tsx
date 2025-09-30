'use client'

import { getTranslatedPortfolioData } from '@/data/portfolioTranslations'
import { useContentState } from '@/hooks/useContentState'
import { useStarFieldTransition } from '@/hooks/useStarFieldTransition'
import { useTranslation } from '@/hooks/useTranslation'
import {
	AnimationState,
	useAnimationStateMachine,
} from '@/lib/animation/AnimationStateMachine'
import {
	COURSE_CHANGE_PRESETS,
	LANGUAGE_TRANSITION_CONFIG,
} from '@/types/transitions'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PortfolioScroll } from '../portfolio/PortfolioScroll'
import { HomepageLayeredStarField } from '../starfield/LayeredStarField'
import { BackButton } from './BackButton'
import { BrandPanel } from './BrandPanel'
import { ControlButton } from './ControlButton'
import { FooterPanel } from './FooterPanel'
import { HeroSection } from './HeroSection'
import { LanguageSelector } from './LanguageSelector'
import { SpeedSelector } from './SpeedSelector'

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

interface StartupSequenceConfig {
	/** Enable the startup animation sequence */
	enabled?: boolean
	/** Delay before auto-toggle from sailboat to rocket mode (ms) */
	autoToggleDelay?: number
	/** Delay before hero text starts fading in (ms) */
	heroFadeDelay?: number
	/** Duration of hero text fade-in animation (ms) */
	heroFadeDuration?: number
	/** Delay before UI controls start fading in (ms) */
	controlsFadeDelay?: number
	/** Duration of UI controls fade-in animation (ms) */
	controlsFadeDuration?: number
	/** Delay before hero buttons start fading in (ms) */
	buttonFadeDelay?: number
	/** Duration of hero buttons fade-in animation (ms) */
	buttonFadeDuration?: number
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
	// Startup sequence configuration
	startupSequence?: StartupSequenceConfig
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
	startupSequence = {
		enabled: true,
		autoToggleDelay: 3000,
		heroFadeDelay: 1000,
		heroFadeDuration: 3000,
		controlsFadeDelay: 3000,
		controlsFadeDuration: 2000,
		buttonFadeDelay: 2000, // Start slightly before hero text completes (3800ms)
		buttonFadeDuration: 2500,
	},
}: PageLayoutProps) => {
	// Get translations
	const { t, language } = useTranslation()
	const portfolioData = getTranslatedPortfolioData(language)

	// Startup sequence: Start in sailboat mode, then auto-toggle to rocket mode
	const [clusterVisible, setClusterVisible] = useState(
		startupSequence?.enabled ? false : showStarField,
	)
	// Track star-field forward speed (1200 when cluster ON, 400 when OFF)
	const [starSpeed, setStarSpeed] = useState(
		startupSequence?.enabled ? 400 : clusterVisible ? 1200 : 400,
	)

	// Startup sequence states
	const [heroVisible, setHeroVisible] = useState(!startupSequence?.enabled)
	const [uiControlsVisible, setUiControlsVisible] = useState(
		!startupSequence?.enabled,
	)
	const [heroButtonsVisible, setHeroButtonsVisible] = useState(
		!startupSequence?.enabled,
	)
	const [startupComplete, setStartupComplete] = useState(
		!startupSequence?.enabled,
	)

	// Track timeouts for cleanup
	const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

	// Helper to create tracked timeouts that get cleaned up on unmount
	const createTrackedTimeout = useCallback(
		(callback: () => void, delay: number) => {
			const timeoutId = setTimeout(() => {
				timeoutsRef.current.delete(timeoutId)
				callback()
			}, delay)
			timeoutsRef.current.add(timeoutId)
			return timeoutId
		},
		[],
	)

	// Cleanup all timeouts on unmount
	useEffect(() => {
		const timeouts = timeoutsRef.current
		return () => {
			timeouts.forEach(timeoutId => clearTimeout(timeoutId))
			timeouts.clear()
		}
	}, [])

	// Startup sequence orchestration
	useEffect(() => {
		if (!startupSequence?.enabled || startupComplete) return

		const {
			autoToggleDelay = 500,
			heroFadeDelay = 800,
			controlsFadeDelay = 2000,
			buttonFadeDelay = 3500,
		} = startupSequence

		// Phase 1: Auto-toggle from sailboat to rocket mode
		createTrackedTimeout(() => {
			setClusterVisible(true) // This triggers existing starfield animation
		}, autoToggleDelay)

		// Phase 2: Hero text fade-in
		createTrackedTimeout(() => {
			setHeroVisible(true)
		}, heroFadeDelay)

		// Phase 3: UI controls fade-in
		createTrackedTimeout(() => {
			setUiControlsVisible(true)
		}, controlsFadeDelay)

		// Phase 3.5: Hero buttons fade-in (smooth transition)
		createTrackedTimeout(() => {
			setHeroButtonsVisible(true)
		}, buttonFadeDelay)

		// Phase 4: Mark startup complete
		createTrackedTimeout(
			() => {
				setStartupComplete(true)
			},
			controlsFadeDelay + (startupSequence.controlsFadeDuration || 400),
		)

		return () => {
			// Cleanup handled by createTrackedTimeout
		}
	}, [startupSequence, startupComplete, createTrackedTimeout])

	// Content state management
	const {
		contentState,
		navigateToProjects,
		navigateToContact,
		navigateToHero,
		setIsTransitioning: setContentTransitioning,
	} = useContentState()

	// Animation state machine for coordinating transitions
	const {
		currentState: animationState,
		requestTransition,
		canTransitionTo,
	} = useAnimationStateMachine()

	// Debug animation state in development
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('🎯 Animation State:', animationState)
		}
	}, [animationState])

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
			// Return animation state to idle
			requestTransition(AnimationState.IDLE)
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

	// Language transition state
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

	// Shared styles for UI controls fade-in - only apply during startup sequence
	const controlFadeStyle =
		startupSequence?.enabled && !startupComplete
			? {
					opacity: uiControlsVisible ? 1 : 0,
					transition: `opacity ${startupSequence?.controlsFadeDuration || 400}ms ease-in-out`,
				}
			: {}

	// Hero fade style - only apply during startup sequence
	const heroFadeStyle =
		startupSequence?.enabled && !startupComplete
			? {
					transition: `opacity ${startupSequence?.heroFadeDuration || 1200}ms ease-in-out`,
				}
			: {}

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
		// Check if we can transition using the state machine
		if (!enableTransitions || !canTransitionTo(AnimationState.COURSE_CHANGE)) {
			return
		}

		// Request course change state transition
		const success = requestTransition(AnimationState.COURSE_CHANGE)
		if (!success) return

		setContentTransitioning(true)
		setFromContentState(contentState)
		setToContentState('projects')
		startTransition('left')
		// Brief delay to prevent race condition between transition start and content change
		createTrackedTimeout(() => {
			navigateToProjects()
			// Transition to portfolio scroll state after navigation completes
			createTrackedTimeout(() => {
				requestTransition(AnimationState.PORTFOLIO_SCROLL)
			}, 100)
		}, 50)
	}

	const handleGetInTouchClick = () => {
		// Check if we can transition using the state machine
		if (!enableTransitions || !canTransitionTo(AnimationState.COURSE_CHANGE)) {
			return
		}

		// Request course change state transition
		const success = requestTransition(AnimationState.COURSE_CHANGE)
		if (!success) return

		setContentTransitioning(true)
		setFromContentState(contentState)
		setToContentState('contact')
		startTransition('right')
		createTrackedTimeout(() => navigateToContact(), 50)
	}

	const handleBackClick = () => {
		// Check if we can transition using the state machine
		if (!canTransitionTo(AnimationState.COURSE_CHANGE)) {
			return
		}

		// Request course change state transition
		const success = requestTransition(AnimationState.COURSE_CHANGE)
		if (!success) return

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
			<div
				className="absolute top-8 left-8 z-50 flex items-center gap-3"
				style={controlFadeStyle}
			>
				<BrandPanel brandName={brandName} />
			</div>

			{/* Back button for Contact page - Vertically centered, aligned with brand */}
			{contentState === 'contact' && (
				<motion.div
					className="absolute top-1/2 left-8 z-50 -translate-y-1/2"
					initial={{ opacity: 0, x: -20 }}
					animate={{
						opacity:
							startupSequence?.enabled && !startupComplete
								? uiControlsVisible
									? 1
									: 0
								: 1,
						x:
							startupSequence?.enabled && !startupComplete
								? uiControlsVisible
									? 0
									: -20
								: 0,
					}}
					transition={{
						duration:
							startupSequence?.enabled && !startupComplete
								? (startupSequence.controlsFadeDuration || 400) / 1000
								: 0.6,
						delay:
							startupSequence?.enabled && !startupComplete
								? 0
								: (transitionConfig.duration +
										(transitionConfig.settlingDuration || 0)) /
									1000,
					}}
				>
					<BackButton
						direction="left"
						onClick={handleBackClick}
						aria-label="Back to home"
					/>
				</motion.div>
			)}

			{/* Back button for Projects page - Vertically centered, aligned with rocket */}
			{contentState === 'projects' && (
				<motion.div
					className="absolute top-1/2 right-8 z-50 -translate-y-1/2"
					initial={{ opacity: 0, x: 20 }}
					animate={{
						opacity:
							startupSequence?.enabled && !startupComplete
								? uiControlsVisible
									? 1
									: 0
								: 1,
						x:
							startupSequence?.enabled && !startupComplete
								? uiControlsVisible
									? 0
									: 20
								: 0,
					}}
					transition={{
						duration:
							startupSequence?.enabled && !startupComplete
								? (startupSequence.controlsFadeDuration || 400) / 1000
								: 0.6,
						delay:
							startupSequence?.enabled && !startupComplete
								? 0
								: (transitionConfig.duration +
										(transitionConfig.settlingDuration || 0)) /
									1000,
					}}
				>
					<BackButton
						direction="right"
						onClick={handleBackClick}
						aria-label="Back to home"
					/>
				</motion.div>
			)}

			{/* LCARS-style control panel */}
			<div
				className="absolute top-8 right-8 z-50 flex items-center gap-3"
				style={controlFadeStyle}
			>
				<LanguageSelector
					disabled={isTransitioning || isLanguageTransitioning}
				/>
				{clientConfig?.cvUrl && (
					<ControlButton
						href={clientConfig.cvUrl}
						target="_blank"
						rel="noopener noreferrer"
						ariaLabel="Download CV (PDF)"
						className="font-exo2 gap-2 px-3 py-3 text-sm font-medium text-cyan-300"
						// className="p-3 text-cyan-300 hover:text-cyan-200 text-sm font-medium leading-none"
					>
						<FileText size={16} />
						<span>CV</span>
					</ControlButton>
				)}
				<SpeedSelector
					darkMode={clusterVisible}
					onToggle={
						startupComplete
							? () => setClusterVisible(!clusterVisible)
							: undefined
					}
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
											...heroFadeStyle,
											opacity:
												startupSequence?.enabled && !startupComplete
													? heroVisible
														? getContentOpacity('hero')
														: 0
													: getContentOpacity('hero'),
											pointerEvents: (
												startupSequence?.enabled && !startupComplete
													? heroVisible && getContentOpacity('hero') !== 0
													: getContentOpacity('hero') !== 0
											)
												? 'auto'
												: 'none',
										}}
									>
										<HeroSection
											title={heroTitle}
											description={heroDescription}
											onPrimaryClick={onPrimaryClick || handleGetInTouchClick}
											onSecondaryClick={
												onSecondaryClick || handleExploreProjectsClick
											}
											transitionState={
												startupSequence?.enabled && !startupComplete
													? 'fading'
													: isTransitioning
														? 'fading'
														: 'visible'
											}
											buttonsEnabled={
												startupSequence?.enabled && !startupComplete
													? heroButtonsVisible
													: !isTransitioning
											}
											buttonFadeDuration={
												startupSequence?.buttonFadeDuration || 500
											}
										/>
									</div>
								)}

								{/* Projects Section */}
								{shouldRenderContent('projects') && (
									<div
										className={`${
											isTransitioning ? 'absolute inset-0' : 'fixed inset-0'
										}`}
										style={{
											opacity: getContentOpacity('projects'),
											pointerEvents:
												getContentOpacity('projects') === 0 ? 'none' : 'auto',
										}}
									>
										<PortfolioScroll
											projects={portfolioData.projects}
											className="h-full w-full"
										/>
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
										<div className="max-w-7xl text-center">
											<AnimatePresence mode="wait">
												<motion.div
													key={`contact-text-${language}`}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{
														duration:
															LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
														ease: 'easeInOut',
													}}
												>
													<h1 className="font-exo2 mb-8 text-6xl tracking-wider sm:text-8xl">
														<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
															{t.contact.title}
														</span>
													</h1>
													<p className="font-exo2 mx-auto mb-8 max-w-5xl text-xl leading-relaxed text-white/90 sm:text-2xl">
														{t.contact.description}
													</p>
												</motion.div>
											</AnimatePresence>
										</div>
									</div>
								)}
							</>
						)
					})()}
			</div>

			{/* LCARS-style footer */}
			<div
				className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 transform"
				style={controlFadeStyle}
			>
				<FooterPanel
					year={clientConfig?.copyrightYear}
					socialLinks={clientConfig?.socialLinks}
				/>
			</div>
		</div>
	)
}
