'use client'

import { useDebugPanel } from '@/contexts/DebugPanelContext'
import { DEBUG_PANEL_ANIMATION_CONFIG } from '@/lib/animation/DebugPanelAnimationConfig'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DebugExpandButton } from './DebugExpandButton'
import { ForegroundToggle } from './ForegroundToggle'
import { GlowToggle } from './GlowToggle'
import { HeroTextToggle } from './HeroTextToggle'
import { RenderModeSelector } from './RenderModeSelector'
import { TwinkleToggle } from './TwinkleToggle'

interface DebugControlsCornerProps {
	disabled?: boolean
	fadeStyle?: React.CSSProperties
	className?: string
}

type AnimationStage =
	| 'collapsed'
	| 'expanding-plus-out'
	| 'expanding-bar-in'
	| 'expanding-box'
	| 'expanding-buttons-in'
	| 'expanded'
	| 'collapsing-buttons-out'
	| 'collapsing-box'
	| 'collapsing-bar-out'
	| 'collapsing-plus-in'

/**
 * Debug controls positioned in lower-right corner
 * Features animated expand/collapse with multi-stage transitions
 */
export function DebugControlsCorner({
	disabled = false,
	fadeStyle = {},
	className = '',
}: DebugControlsCornerProps) {
	const { isExpanded, setIsExpanded, initialLoadComplete } = useDebugPanel()
	const [stage, setStage] = useState<AnimationStage>('collapsed')
	const [hasHandledInitialLoad, setHasHandledInitialLoad] = useState(false)
	const [initialAnimationStarted, setInitialAnimationStarted] = useState(false)

	// Handle initial load animation if panel was open
	useEffect(() => {
		// Early return if already handled - don't run the effect logic again
		if (hasHandledInitialLoad) return

		// Wait until initial load is complete
		if (!initialLoadComplete) return

		setHasHandledInitialLoad(true)

		if (isExpanded) {
			// Mark that initial animation is starting
			setInitialAnimationStarted(true)

			// Small buffer after controls are visible before starting expansion
			const timers: NodeJS.Timeout[] = []

			const initialDelay = setTimeout(() => {
				setStage('expanding-plus-out')

				// Start the full animation sequence
				timers.push(
					setTimeout(() => {
						setStage('expanding-bar-in')
					}, DEBUG_PANEL_ANIMATION_CONFIG.open.plusFadeOut.duration * 1000),
				)

				timers.push(
					setTimeout(
						() => {
							setStage('expanding-box')
						},
						DEBUG_PANEL_ANIMATION_CONFIG.open.barFadeIn.delay * 1000 +
							DEBUG_PANEL_ANIMATION_CONFIG.open.barFadeIn.duration * 1000,
					),
				)

				timers.push(
					setTimeout(
						() => {
							setStage('expanding-buttons-in')
						},
						DEBUG_PANEL_ANIMATION_CONFIG.open.boxExpand.delay * 1000 +
							DEBUG_PANEL_ANIMATION_CONFIG.open.boxExpand.duration * 1000,
					),
				)

				timers.push(
					setTimeout(
						() => {
							setStage('expanded')
							// Animation complete, allow manual interactions
							setInitialAnimationStarted(false)
						},
						DEBUG_PANEL_ANIMATION_CONFIG.open.buttonsFadeIn.delay * 1000 +
							DEBUG_PANEL_ANIMATION_CONFIG.open.buttonsFadeIn.duration * 1000,
					),
				)
			}, 200) // Small buffer after controls are visible

			return () => {
				clearTimeout(initialDelay)
				timers.forEach(clearTimeout)
				setInitialAnimationStarted(false)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialLoadComplete, isExpanded])

	// Handle animation sequences - separate effect to avoid dependency issues
	useEffect(() => {
		// Don't trigger animations until initial load is handled
		if (!hasHandledInitialLoad) {
			return
		}

		// Don't trigger if initial animation is already running
		if (initialAnimationStarted) {
			return
		}

		if (isExpanded && stage === 'collapsed') {
			// Opening sequence
			setStage('expanding-plus-out')

			const plusOutTimer = setTimeout(() => {
				setStage('expanding-bar-in')
			}, DEBUG_PANEL_ANIMATION_CONFIG.open.plusFadeOut.duration * 1000)

			const barInTimer = setTimeout(
				() => {
					setStage('expanding-box')
				},
				DEBUG_PANEL_ANIMATION_CONFIG.open.barFadeIn.delay * 1000 +
					DEBUG_PANEL_ANIMATION_CONFIG.open.barFadeIn.duration * 1000,
			)

			const boxExpandTimer = setTimeout(
				() => {
					setStage('expanding-buttons-in')
				},
				DEBUG_PANEL_ANIMATION_CONFIG.open.boxExpand.delay * 1000 +
					DEBUG_PANEL_ANIMATION_CONFIG.open.boxExpand.duration * 1000,
			)

			const buttonsInTimer = setTimeout(
				() => {
					setStage('expanded')
				},
				DEBUG_PANEL_ANIMATION_CONFIG.open.buttonsFadeIn.delay * 1000 +
					DEBUG_PANEL_ANIMATION_CONFIG.open.buttonsFadeIn.duration * 1000,
			)

			return () => {
				clearTimeout(plusOutTimer)
				clearTimeout(barInTimer)
				clearTimeout(boxExpandTimer)
				clearTimeout(buttonsInTimer)
			}
		} else if (!isExpanded && stage === 'expanded') {
			// Closing sequence
			setStage('collapsing-buttons-out')

			const buttonsOutTimer = setTimeout(() => {
				setStage('collapsing-box')
			}, DEBUG_PANEL_ANIMATION_CONFIG.close.buttonsFadeOut.duration * 1000)

			const boxContractTimer = setTimeout(
				() => {
					setStage('collapsing-bar-out')
				},
				DEBUG_PANEL_ANIMATION_CONFIG.close.boxContract.delay * 1000 +
					DEBUG_PANEL_ANIMATION_CONFIG.close.boxContract.duration * 1000,
			)

			const barOutTimer = setTimeout(
				() => {
					setStage('collapsing-plus-in')
				},
				DEBUG_PANEL_ANIMATION_CONFIG.close.barFadeOut.delay * 1000 +
					DEBUG_PANEL_ANIMATION_CONFIG.close.barFadeOut.duration * 1000,
			)

			const plusInTimer = setTimeout(
				() => {
					setStage('collapsed')
				},
				DEBUG_PANEL_ANIMATION_CONFIG.close.plusFadeIn.delay * 1000 +
					DEBUG_PANEL_ANIMATION_CONFIG.close.plusFadeIn.duration * 1000,
			)

			return () => {
				clearTimeout(buttonsOutTimer)
				clearTimeout(boxContractTimer)
				clearTimeout(barOutTimer)
				clearTimeout(plusInTimer)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isExpanded])

	const handleExpand = () => {
		setIsExpanded(true)
	}

	const handleCollapse = () => {
		setIsExpanded(false)
	}

	// Calculate button interaction state
	const buttonsEnabled =
		!disabled && (stage === 'expanded' || stage === 'expanding-buttons-in')
	const buttonsVisible =
		stage === 'expanded' ||
		stage === 'expanding-buttons-in' ||
		stage === 'collapsing-buttons-out'

	// Calculate panel dimensions
	const buttonHeight = 44 // px-3 py-3 + content
	const panelPadding = 12
	const panelHeight = buttonHeight + panelPadding * 2

	return (
		<div
			className={`absolute right-8 bottom-8 z-[60] ${className}`}
			style={fadeStyle}
		>
			{/* Plus button - visible when collapsed */}
			<AnimatePresence>
				{(stage === 'collapsed' || stage === 'collapsing-plus-in') && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							duration:
								stage === 'collapsed'
									? DEBUG_PANEL_ANIMATION_CONFIG.close.plusFadeIn.duration
									: DEBUG_PANEL_ANIMATION_CONFIG.open.plusFadeOut.duration,
						}}
					>
						<DebugExpandButton onClick={handleExpand} />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Combined bar/box - > button IS the bar */}
			<AnimatePresence>
				{(stage === 'expanding-bar-in' ||
					stage === 'expanding-box' ||
					stage === 'expanding-buttons-in' ||
					stage === 'expanded' ||
					stage === 'collapsing-buttons-out' ||
					stage === 'collapsing-box' ||
					stage === 'collapsing-bar-out') && (
					<motion.div
						className="absolute right-0 bottom-0 flex items-center border border-cyan-400/70"
						initial={{
							width: DEBUG_PANEL_ANIMATION_CONFIG.bar.thickness,
							scaleY: 0,
						}}
						animate={{
							width:
								stage === 'expanding-bar-in' || stage === 'collapsing-bar-out'
									? DEBUG_PANEL_ANIMATION_CONFIG.bar.thickness
									: stage === 'collapsing-box'
										? DEBUG_PANEL_ANIMATION_CONFIG.bar.thickness
										: 'auto',
							scaleY:
								stage === 'expanding-bar-in'
									? 1
									: stage === 'collapsing-bar-out'
										? 0
										: 1,
						}}
						transition={{
							width: {
								duration:
									stage === 'expanding-box'
										? DEBUG_PANEL_ANIMATION_CONFIG.open.boxExpand.duration
										: stage === 'collapsing-box'
											? DEBUG_PANEL_ANIMATION_CONFIG.close.boxContract.duration
											: 0,
								ease:
									stage === 'expanding-box'
										? DEBUG_PANEL_ANIMATION_CONFIG.open.boxExpand.ease
										: DEBUG_PANEL_ANIMATION_CONFIG.close.boxContract.ease,
							},
							scaleY: {
								duration:
									stage === 'expanding-bar-in'
										? DEBUG_PANEL_ANIMATION_CONFIG.open.barFadeIn.duration
										: stage === 'collapsing-bar-out'
											? DEBUG_PANEL_ANIMATION_CONFIG.close.barFadeOut.duration
											: 0,
								ease: 'easeInOut',
							},
						}}
						style={{
							height: `${panelHeight}px`,
							borderRadius: '0.5rem',
							overflow: 'hidden',
							transformOrigin: 'center',
						}}
					>
						<div className="flex h-full items-center">
							{/* Close button (>) - this IS the vertical bar */}
							<motion.button
								onClick={handleCollapse}
								disabled={disabled}
								className="flex h-full items-center justify-center bg-cyan-500 text-white transition-all duration-300 hover:bg-cyan-600"
								aria-label="Collapse debug panel"
								title="Close"
								initial={{ opacity: 0 }}
								animate={{
									opacity: stage === 'expanding-bar-in' ? 1 : 1,
								}}
								transition={{
									duration:
										stage === 'expanding-bar-in'
											? DEBUG_PANEL_ANIMATION_CONFIG.open.barFadeIn.duration
											: 0,
								}}
								style={{
									width: `${DEBUG_PANEL_ANIMATION_CONFIG.bar.thickness}px`,
									minWidth: `${DEBUG_PANEL_ANIMATION_CONFIG.bar.thickness}px`,
									borderRight: '1px solid rgba(34, 211, 238, 0.7)',
								}}
							>
								<ChevronRight size={16} />
							</motion.button>

							{/* Debug toggle buttons - fade in after box expands */}
							<motion.div
								className="flex items-center gap-3 px-3"
								initial={{ opacity: 0 }}
								animate={{ opacity: buttonsVisible ? 1 : 0 }}
								transition={{
									duration:
										stage === 'expanding-buttons-in'
											? DEBUG_PANEL_ANIMATION_CONFIG.open.buttonsFadeIn.duration
											: DEBUG_PANEL_ANIMATION_CONFIG.close.buttonsFadeOut
													.duration,
								}}
							>
								<RenderModeSelector disabled={!buttonsEnabled} />
								<ForegroundToggle disabled={!buttonsEnabled} />
								<HeroTextToggle disabled={!buttonsEnabled} />
								<GlowToggle disabled={!buttonsEnabled} />
								<TwinkleToggle disabled={!buttonsEnabled} />
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
