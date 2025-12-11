import { useHeroText } from '@/contexts/HeroTextContext'
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
	description,
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
	const { heroTextVisible } = useHeroText()

	// Use translations as defaults if props not provided
	// Full text for desktop, short text for mobile
	const primaryText = primaryButtonText ?? t.hero.getInTouch
	const primaryTextShort = t.hero.getInTouchShort ?? 'Contact'
	const secondaryText = secondaryButtonText ?? t.hero.exploreProjects
	const secondaryTextShort = t.hero.exploreProjectsShort ?? 'Projects'
	const heroDescription = description ?? t.hero.description

	// Calculate dynamic styles based on transition state
	const containerStyle: React.CSSProperties = {
		opacity: heroTextVisible ? opacity : 0,
		// No transform - just clean opacity fade for course changes
		transition: `opacity ${fadeConfig.duration}ms ease-in-out${fadeConfig.delay > 0 ? ` ${fadeConfig.delay}ms` : ''}`,
		pointerEvents:
			transitionState === 'hidden' || !heroTextVisible ? 'none' : 'auto',
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
						<h1 className="font-exo2 mb-6 text-5xl tracking-wider whitespace-nowrap sm:text-6xl md:text-7xl lg:text-8xl">
							<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
								{title}
							</span>
						</h1>
						<p className="font-exo2 mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl md:text-2xl lg:text-3xl">
							{heroDescription}
						</p>
					</motion.div>
				</AnimatePresence>
				{/* Buttons: side-by-side on all screen sizes, shorter text on mobile */}
				<div className="flex flex-row justify-center gap-3 sm:gap-4">
					<AnimatePresence mode="wait">
						<motion.button
							key={`secondary-button-${language}`}
							onClick={onSecondaryClick}
							className="font-exo2 rounded-lg border border-cyan-400 px-4 py-3 text-cyan-300 transition-all hover:bg-cyan-400/10 sm:px-8 sm:py-4"
							style={buttonStyle}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{
								duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
							}}
							disabled={transitionState !== 'visible' || !buttonsEnabled}
						>
							{/* Short text on mobile, full text on tablet+ */}
							<span className="sm:hidden">{secondaryTextShort}</span>
							<span className="hidden sm:inline">{secondaryText}</span>
						</motion.button>
					</AnimatePresence>
					<AnimatePresence mode="wait">
						<motion.button
							key={`primary-button-${language}`}
							onClick={onPrimaryClick}
							className="font-exo2 rounded-lg bg-cyan-500 px-4 py-3 text-white shadow-lg shadow-cyan-500/40 transition-all hover:bg-cyan-600 hover:shadow-cyan-400/50 sm:px-8 sm:py-4"
							style={buttonStyle}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{
								duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
							}}
							disabled={transitionState !== 'visible' || !buttonsEnabled}
						>
							{/* Short text on mobile, full text on tablet+ */}
							<span className="sm:hidden">{primaryTextShort}</span>
							<span className="hidden sm:inline">{primaryText}</span>
						</motion.button>
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}
