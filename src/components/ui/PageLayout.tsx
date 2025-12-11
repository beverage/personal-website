'use client'

import { useHeroText } from '@/contexts/HeroTextContext'
import { getTranslatedPortfolioData } from '@/data/portfolioTranslations'
import {
	useContentState,
	useLanguageTransition,
	useStarSpeedAnimation,
	useStartupSequence,
	useTranslation,
} from '@/hooks'
import { useStarFieldTransition } from '@/hooks/useStarFieldTransition'
import {
	AnimationState,
	useAnimationStateMachine,
} from '@/lib/animation/AnimationStateMachine'
import {
	getContentOpacity,
	shouldRenderContent,
} from '@/lib/utils/contentOpacityUtils'
import { type StartupSequenceConfig } from '@/lib/utils/startupConfig'
import {
	COURSE_CHANGE_PRESETS,
	type CourseChangeConfig,
} from '@/types/transitions'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useRef } from 'react'
import { LazyStarField } from '../starfield/LazyStarField'
import { BackButton } from './BackButton'
import { BrandPanel } from './BrandPanel'
import { ContentSection } from './ContentSection'
import { ControlsCorner } from './ControlsCorner'
import { DebugControlsCorner } from './DebugControlsCorner'
import { FooterPanel } from './FooterPanel'
import { LanguageSelector } from './LanguageSelector'

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
	startupSequence,
}: PageLayoutProps) => {
	// Get translations
	const { t, language } = useTranslation()
	const portfolioData = getTranslatedPortfolioData(language)

	// Find the index of the quiz project for navigation
	const quizProjectIndex =
		portfolioData.projects.findIndex(p => p.id === 'language-quiz-service') + 1 // +1 for hero offset

	// Track initial scroll index for projects page
	const [projectsScrollIndex, setProjectsScrollIndex] = React.useState(0)

	// Hero text visibility (for dev mode navigation arrows)
	const { heroTextVisible } = useHeroText()

	// Track when starfield has loaded
	const [starFieldLoaded, setStarFieldLoaded] = React.useState(false)

	// Startup sequence hook - wait for starfield to load before starting animations
	const startup = useStartupSequence(
		startupSequence,
		showStarField,
		starFieldLoaded,
	)

	// Star speed animation hook
	const starSpeed = useStarSpeedAnimation(startup.clusterVisible, 400)

	// Language transition tracking
	const isLanguageTransitioning = useLanguageTransition(language)

	// Content state management with transition tracking
	const contentState = useContentState()

	// Animation state machine for coordinating transitions
	const { requestTransition, canTransitionTo } = useAnimationStateMachine()

	// Animation state tracking
	// (debug logging removed)

	// Transition system configuration
	const transitionConfig: CourseChangeConfig =
		COURSE_CHANGE_PRESETS[courseChangeVariant]

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
			contentState.setIsTransitioning(false)
			// Reset transition tracking when complete
			contentState.setFromContentState(contentState.contentState)
			contentState.setToContentState(contentState.contentState)
			// Return animation state to idle
			requestTransition(AnimationState.IDLE)
		},
		onContentFadeComplete: () => {
			// Content fade transition is complete
		},
	})

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

	// Navigation handlers with course change transitions
	const handleExploreProjectsClick = () => {
		// Check if we can transition using the state machine
		if (!enableTransitions || !canTransitionTo(AnimationState.COURSE_CHANGE)) {
			return
		}

		// Request course change state transition
		const success = requestTransition(AnimationState.COURSE_CHANGE)
		if (!success) return

		contentState.setIsTransitioning(true)
		contentState.setFromContentState(contentState.contentState)
		contentState.setToContentState('projects')
		startTransition('left')
		// Brief delay to prevent race condition between transition start and content change
		createTrackedTimeout(() => {
			contentState.navigateToProjects()
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

		contentState.setIsTransitioning(true)
		contentState.setFromContentState(contentState.contentState)
		contentState.setToContentState('contact')
		startTransition('right')
		createTrackedTimeout(() => contentState.navigateToContact(), 50)
	}

	const handleBackClick = () => {
		// Check if we can transition using the state machine
		if (!canTransitionTo(AnimationState.COURSE_CHANGE)) {
			return
		}

		// Request course change state transition
		const success = requestTransition(AnimationState.COURSE_CHANGE)
		if (!success) return

		const direction =
			contentState.contentState === 'projects'
				? 'right'
				: contentState.contentState === 'quiz'
					? 'right'
					: 'left'
		contentState.setIsTransitioning(true)
		contentState.setFromContentState(contentState.contentState)
		contentState.setToContentState('hero')
		startTransition(direction)
		createTrackedTimeout(() => contentState.navigateToHero(), 50)
	}

	const handleNavigateToQuiz = () => {
		// Check if we can transition using the state machine
		if (!enableTransitions || !canTransitionTo(AnimationState.COURSE_CHANGE)) {
			return
		}

		// Request course change state transition
		const success = requestTransition(AnimationState.COURSE_CHANGE)
		if (!success) return

		// Set the scroll index to the quiz project so we return to it
		setProjectsScrollIndex(quizProjectIndex)

		contentState.setIsTransitioning(true)
		contentState.setFromContentState(contentState.contentState)
		contentState.setToContentState('quiz')
		startTransition('left') // Drift left like Hero -> Projects
		createTrackedTimeout(() => {
			contentState.navigateToQuiz()
		}, 50)
	}

	const handleBackFromQuiz = () => {
		// Check if we can transition using the state machine
		if (!canTransitionTo(AnimationState.COURSE_CHANGE)) {
			return
		}

		// Request course change state transition
		const success = requestTransition(AnimationState.COURSE_CHANGE)
		if (!success) return

		contentState.setIsTransitioning(true)
		contentState.setFromContentState(contentState.contentState)
		contentState.setToContentState('projects')
		startTransition('right') // Drift right back to Projects
		createTrackedTimeout(() => {
			contentState.navigateToProjects()
			// Transition to portfolio scroll state after navigation completes
			createTrackedTimeout(() => {
				requestTransition(AnimationState.PORTFOLIO_SCROLL)
			}, 100)
		}, 50)
	}

	// Wrapper for getContentOpacity utility
	const getOpacity = useCallback(
		(contentType: 'hero' | 'projects' | 'contact' | 'quiz') => {
			return getContentOpacity(
				contentType,
				isTransitioning,
				contentState.fromContentState,
				contentState.toContentState,
				currentContentOpacity,
				newContentOpacity,
			)
		},
		[
			isTransitioning,
			contentState.fromContentState,
			contentState.toContentState,
			currentContentOpacity,
			newContentOpacity,
		],
	)

	// Wrapper for shouldRenderContent utility
	const shouldRender = useCallback(
		(contentType: 'hero' | 'projects' | 'contact' | 'quiz') => {
			return shouldRenderContent(
				contentType,
				contentState.contentState,
				isTransitioning,
				contentState.fromContentState,
				contentState.toContentState,
			)
		},
		[
			contentState.contentState,
			isTransitioning,
			contentState.fromContentState,
			contentState.toContentState,
		],
	)

	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			{/* Star Field Background */}
			<LazyStarField
				showCluster={startup.clusterVisible}
				speed={speed ?? starSpeed}
				fadeInDuration={fadeInDuration}
				fadeOutDuration={fadeOutDuration}
				foregroundMotionVector={motionVectors.foreground}
				backgroundMotionVector={motionVectors.background}
				bankingRoll={bankingRoll}
				depthParallaxFactor={transitionConfig.parallaxIntensity}
				onLoaded={() => setStarFieldLoaded(true)}
				fadeInDurationMs={400} // Smooth fade-in from black when starfield loads
			/>

			{/* Brand Panel - Top Left (hidden on mobile) */}
			<div
				className="absolute top-8 left-8 z-50 hidden items-center gap-3 md:flex"
				style={startup.controlFadeStyle}
			>
				<BrandPanel brandName={brandName} />
			</div>

			{/* Language Selector - Top Left on mobile only */}
			<div
				className="absolute top-8 left-8 z-50 flex items-center gap-3 md:hidden"
				style={startup.controlFadeStyle}
			>
				<LanguageSelector
					disabled={isTransitioning || isLanguageTransitioning}
				/>
			</div>

			{/* Controls - Top Right */}
			<ControlsCorner
				cvUrl={clientConfig?.cvUrl}
				darkMode={startup.clusterVisible}
				onToggleSpeed={
					startup.startupComplete
						? () => startup.setClusterVisible(!startup.clusterVisible)
						: undefined
				}
				disabled={isTransitioning || isLanguageTransitioning}
				fadeStyle={startup.controlFadeStyle}
			/>

			{/* Debug Controls - Bottom Right (dev mode only) */}
			<DebugControlsCorner
				disabled={isTransitioning || isLanguageTransitioning}
				fadeStyle={startup.controlFadeStyle}
			/>

			{/* Back button for Contact page - Vertically centered, aligned with brand */}
			{contentState.contentState === 'contact' && (
				<motion.div
					className="absolute top-1/2 left-8 z-50 -translate-y-1/2"
					initial={{ opacity: 0, x: -20 }}
					animate={{
						opacity:
							startupSequence?.enabled && !startup.startupComplete
								? startup.uiControlsVisible
									? 1
									: 0
								: 1,
						x:
							startupSequence?.enabled && !startup.startupComplete
								? startup.uiControlsVisible
									? 0
									: -20
								: 0,
					}}
					transition={{
						duration:
							startupSequence?.enabled && !startup.startupComplete
								? (startupSequence.controlsFadeDuration || 400) / 1000
								: 0.6,
						delay:
							startupSequence?.enabled && !startup.startupComplete
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
			{contentState.contentState === 'projects' && (
				<motion.div
					className="absolute top-1/2 right-8 z-50 -translate-y-1/2"
					initial={{ opacity: 0, x: 20 }}
					animate={{
						opacity:
							startupSequence?.enabled && !startup.startupComplete
								? startup.uiControlsVisible
									? 1
									: 0
								: 1,
						x:
							startupSequence?.enabled && !startup.startupComplete
								? startup.uiControlsVisible
									? 0
									: 20
								: 0,
					}}
					transition={{
						duration:
							startupSequence?.enabled && !startup.startupComplete
								? (startupSequence.controlsFadeDuration || 400) / 1000
								: 0.6,
						delay:
							startupSequence?.enabled && !startup.startupComplete
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

			{/* Navigation arrows for hero screen (dev mode only, when hero text is hidden) */}
			{process.env.NODE_ENV === 'development' &&
				contentState.contentState === 'hero' &&
				!heroTextVisible && (
					<>
						{/* Left arrow - Navigate to Projects */}
						<motion.div
							className="absolute top-1/2 left-8 z-50 -translate-y-1/2"
							initial={{ opacity: 0, x: -20 }}
							animate={{
								opacity:
									startupSequence?.enabled && !startup.startupComplete
										? startup.uiControlsVisible
											? 1
											: 0
										: 1,
								x:
									startupSequence?.enabled && !startup.startupComplete
										? startup.uiControlsVisible
											? 0
											: -20
										: 0,
							}}
							exit={{ opacity: 0, x: -20 }}
							transition={{
								duration:
									startupSequence?.enabled && !startup.startupComplete
										? (startupSequence.controlsFadeDuration || 400) / 1000
										: 0.6,
								delay:
									startupSequence?.enabled && !startup.startupComplete ? 0 : 0,
							}}
						>
							<BackButton
								direction="left"
								onClick={handleExploreProjectsClick}
								aria-label="Navigate to Projects"
							/>
						</motion.div>

						{/* Right arrow - Navigate to Contact */}
						<motion.div
							className="absolute top-1/2 right-8 z-50 -translate-y-1/2"
							initial={{ opacity: 0, x: 20 }}
							animate={{
								opacity:
									startupSequence?.enabled && !startup.startupComplete
										? startup.uiControlsVisible
											? 1
											: 0
										: 1,
								x:
									startupSequence?.enabled && !startup.startupComplete
										? startup.uiControlsVisible
											? 0
											: 20
										: 0,
							}}
							exit={{ opacity: 0, x: 20 }}
							transition={{
								duration:
									startupSequence?.enabled && !startup.startupComplete
										? (startupSequence.controlsFadeDuration || 400) / 1000
										: 0.6,
								delay:
									startupSequence?.enabled && !startup.startupComplete ? 0 : 0,
							}}
						>
							<BackButton
								direction="right"
								onClick={handleGetInTouchClick}
								aria-label="Navigate to Contact"
							/>
						</motion.div>
					</>
				)}

			{/* Main content */}
			{children || (
				<ContentSection
					isTransitioning={isTransitioning}
					getContentOpacity={getOpacity}
					shouldRenderContent={shouldRender}
					heroProps={{
						title: heroTitle,
						description: heroDescription,
						onPrimaryClick: onPrimaryClick || handleGetInTouchClick,
						onSecondaryClick: onSecondaryClick || handleExploreProjectsClick,
						transitionState:
							startupSequence?.enabled && !startup.startupComplete
								? 'fading'
								: isTransitioning
									? 'fading'
									: 'visible',
						buttonsEnabled:
							startupSequence?.enabled && !startup.startupComplete
								? startup.heroButtonsVisible
								: !isTransitioning,
						buttonFadeDuration: startupSequence?.buttonFadeDuration || 500,
					}}
					heroVisible={startup.heroVisible}
					heroFadeStyle={startup.heroFadeStyle}
					projects={portfolioData.projects}
					contactProps={{
						title: t.contact.title,
						description: t.contact.description,
						language: language,
					}}
					onNavigateToQuiz={handleNavigateToQuiz}
					onBackFromQuiz={handleBackFromQuiz}
					projectsInitialScrollIndex={projectsScrollIndex}
				/>
			)}

			{/* Footer */}
			<div
				className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 transform"
				style={{
					...startup.controlFadeStyle,
					opacity:
						contentState.contentState === 'quiz' ? 0 : getOpacity('projects'),
					pointerEvents: contentState.contentState === 'quiz' ? 'none' : 'auto',
					transition: 'opacity 0.5s ease-in-out',
				}}
			>
				<FooterPanel
					year={clientConfig?.copyrightYear}
					socialLinks={clientConfig?.socialLinks}
				/>
			</div>
		</div>
	)
}
