'use client'

import { type Project } from '@/types/portfolio'
import {
	LANGUAGE_TRANSITION_CONFIG,
	type ContentState,
} from '@/types/transitions'
import { AnimatePresence, motion } from 'framer-motion'
import { PortfolioScroll } from '../portfolio/PortfolioScroll'
import { HeroSection } from './HeroSection'

interface HeroProps {
	title?: string
	description?: string
	onPrimaryClick?: () => void
	onSecondaryClick?: () => void
	transitionState?: 'visible' | 'fading' | 'hidden'
	buttonsEnabled?: boolean
	buttonFadeDuration?: number
}

interface ContactProps {
	title: string
	description: string
	language: string
}

interface ContentSectionProps {
	isTransitioning: boolean
	getContentOpacity: (contentType: ContentState) => number
	shouldRenderContent: (contentType: ContentState) => boolean
	heroProps: HeroProps
	heroVisible?: boolean
	heroFadeStyle?: React.CSSProperties
	projects: Project[]
	contactProps: ContactProps
}

/**
 * Handles conditional rendering of hero, projects, and contact content
 * Manages opacity and pointer events during transitions
 */
export function ContentSection({
	isTransitioning,
	getContentOpacity,
	shouldRenderContent,
	heroProps,
	heroVisible = true,
	heroFadeStyle = {},
	projects,
	contactProps,
}: ContentSectionProps) {
	return (
		<div className="relative z-10 min-h-screen">
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
						opacity: heroVisible ? getContentOpacity('hero') : 0,
						pointerEvents:
							heroVisible && getContentOpacity('hero') !== 0 ? 'auto' : 'none',
					}}
				>
					<HeroSection {...heroProps} />
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
					<PortfolioScroll projects={projects} className="h-full w-full" />
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
						pointerEvents: getContentOpacity('contact') === 0 ? 'none' : 'auto',
					}}
				>
					<div className="max-w-7xl text-center">
						<AnimatePresence mode="wait">
							<motion.div
								key={`contact-text-${contactProps.language}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
									ease: 'easeInOut',
								}}
							>
								<h1 className="font-exo2 mb-8 text-6xl tracking-wider sm:text-8xl">
									<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
										{contactProps.title}
									</span>
								</h1>
								<p className="font-exo2 mx-auto mb-8 max-w-5xl text-xl leading-relaxed text-white/90 sm:text-2xl">
									{contactProps.description}
								</p>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			)}
		</div>
	)
}
