import { useTranslation } from '@/hooks/useTranslation'
import { LANGUAGE_TRANSITION_CONFIG } from '@/types/transitions'
import { AnimatePresence, motion } from 'framer-motion'

interface HeroSectionProps {
	title?: string
	description?: string
	primaryButtonText?: string
	secondaryButtonText?: string
	onPrimaryClick?: () => void
	onSecondaryClick?: () => void
	className?: string
	// Transition props
	transitionState?: 'visible' | 'fading' | 'hidden'
	opacity?: number
	onTransitionComplete?: () => void
	fadeConfig?: {
		duration: number
		delay: number
		transform?: boolean
	}
	// Button fade props
	buttonsEnabled?: boolean
	buttonFadeDuration?: number
}

export const HeroSection = ({
	title = 'Coming Soon',
	description = 'Finally.',
	primaryButtonText,
	secondaryButtonText,
	onPrimaryClick,
	onSecondaryClick,
	className = '',
	transitionState = 'visible',
	opacity = 1,
	onTransitionComplete,
	fadeConfig = {
		duration: 500,
		delay: 0,
		transform: true,
	},
	buttonsEnabled = true,
	buttonFadeDuration = 500,
}: HeroSectionProps) => {
	const { t, language } = useTranslation()

	// Use translations as defaults if props not provided
	const primaryText = primaryButtonText ?? t.hero.getInTouch
	const secondaryText = secondaryButtonText ?? t.hero.exploreProjects

	// Calculate dynamic styles based on transition state
	const containerStyle: React.CSSProperties = {
		opacity: opacity,
		// No transform - just clean opacity fade for course changes
		transition: `opacity ${fadeConfig.duration}ms ease-in-out${fadeConfig.delay > 0 ? ` ${fadeConfig.delay}ms` : ''}`,
		pointerEvents: transitionState === 'hidden' ? 'none' : 'auto',
	}

	// Button styles for smooth fade-in transitions
	const buttonStyle: React.CSSProperties = {
		opacity: buttonsEnabled ? 1 : 0,
		transition: `opacity ${buttonFadeDuration}ms ease-in-out`,
		pointerEvents: buttonsEnabled ? 'auto' : 'none',
	}

	return (
		<div
			className={`max-w-5xl text-center ${className}`}
			style={containerStyle}
			onTransitionEnd={onTransitionComplete}
		>
			<div className="mb-8 p-12">
				<AnimatePresence mode="wait">
					<motion.div
						key={`hero-text-${language}`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
							ease: 'easeInOut',
						}}
					>
						<h1 className="font-exo2 mb-6 text-6xl tracking-wider sm:text-8xl">
							<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
								{title}
							</span>
						</h1>
						<p className="font-exo2 mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-white/90 sm:text-2xl">
							{description}
						</p>
					</motion.div>
				</AnimatePresence>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<AnimatePresence mode="wait">
						<motion.button
							key={`secondary-button-${language}`}
							onClick={onSecondaryClick}
							className="font-exo2 rounded-lg border border-cyan-400 px-8 py-4 text-cyan-300 transition-all hover:bg-cyan-400/10"
							style={buttonStyle}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{
								duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
							}}
							disabled={transitionState !== 'visible' || !buttonsEnabled}
						>
							{secondaryText}
						</motion.button>
					</AnimatePresence>
					<AnimatePresence mode="wait">
						<motion.button
							key={`primary-button-${language}`}
							onClick={onPrimaryClick}
							className="font-exo2 rounded-lg bg-cyan-500 px-8 py-4 text-white shadow-lg shadow-cyan-500/40 transition-all hover:bg-cyan-600 hover:shadow-cyan-400/50"
							style={buttonStyle}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{
								duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
							}}
							disabled={transitionState !== 'visible' || !buttonsEnabled}
						>
							{primaryText}
						</motion.button>
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}
