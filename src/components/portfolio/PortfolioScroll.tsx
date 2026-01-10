'use client'

import { useHeroText } from '@/contexts/HeroTextContext'
import { useTranslation } from '@/hooks/useTranslation'
import type { Project } from '@/types/portfolio'
import { LANGUAGE_TRANSITION_CONFIG } from '@/types/transitions'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Github, Images } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavigationArrow } from './NavigationArrows'

interface PortfolioScrollProps {
	projects: Project[]
	className?: string
	onNavigateToQuiz?: () => void
	onBack?: () => void
	initialScrollIndex?: number
}

interface ProjectCardProps {
	project: Project
	index: number
	onNavigateToQuiz?: () => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({
	project,
	index,
	onNavigateToQuiz,
}) => {
	const { language } = useTranslation()
	const isDevelopment = process.env.NODE_ENV === 'development'
	const isQuizProject = project.id === 'language-quiz-service'

	const cardVariants = {
		hidden: {
			opacity: 0,
			y: 60,
			scale: 0.92,
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 4.0, // Slower, smoother animation
				ease: [0.25, 0.1, 0.25, 1] as const, // Custom bezier for smoother feel
				delay: index * 0.05, // Reduced stagger delay
			},
		},
	} as const

	const getLinkIcon = (type: string) => {
		switch (type) {
			case 'github':
				return <Github size={16} />
			case 'gallery':
				return <Images size={16} />
			default:
				return <ExternalLink size={16} />
		}
	}

	const getLinkColor = (type: string) => {
		switch (type) {
			case 'github':
			case 'gallery':
				return 'border-purple-400 text-purple-300 transition-all duration-700 hover:bg-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/40'
			case 'demo':
				return 'border-green-400 text-green-300 transition-all duration-700 hover:bg-green-500 hover:text-white hover:shadow-lg hover:shadow-green-500/40'
			case 'api':
				return 'border-blue-400 text-blue-300 transition-all duration-700 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/40'
			default:
				return 'border-cyan-400 text-cyan-300 transition-all duration-700 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40'
		}
	}

	// Helper to render a single link (used in both desktop and mobile sections)
	const renderLink = (link: (typeof project.links)[0], linkIndex: number) => {
		// Hide quiz demo link entirely in production
		const isQuizDemoLink = isQuizProject && link.type === 'demo'
		if (isQuizDemoLink && !isDevelopment) {
			return null
		}

		// In dev mode, quiz demo link triggers internal navigation
		if (isQuizDemoLink && isDevelopment) {
			return (
				<motion.button
					key={link.url}
					onClick={e => {
						e.preventDefault()
						onNavigateToQuiz?.()
					}}
					className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${getLinkColor(link.type)}`}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{
						duration: 0.6,
						delay: 1.2 + linkIndex * 0.1,
						ease: 'easeOut',
					}}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					{getLinkIcon(link.type)}
					{link.label}
				</motion.button>
			)
		}

		return (
			<motion.a
				key={link.url}
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${getLinkColor(link.type)}`}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{
					duration: 0.6,
					delay: 1.2 + linkIndex * 0.1,
					ease: 'easeOut',
				}}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				{getLinkIcon(link.type)}
				{link.label}
			</motion.a>
		)
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={`project-card-${project.id}-${language}`}
				variants={cardVariants}
				initial="hidden"
				animate="visible"
				exit={{
					opacity: 0,
					transition: {
						duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
					},
				}}
				className="mx-auto max-h-[70vh] max-w-4xl overflow-y-auto rounded-xl border border-cyan-400/30 bg-black/40 p-4 backdrop-blur-sm sm:max-h-none sm:overflow-visible sm:p-8"
			>
				<div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
					{/* Left Column: Image, Technologies, Links (on desktop only) */}
					<div className="hidden flex-col gap-4 sm:gap-6 lg:flex">
						{/* Project Image */}
						<div className="relative overflow-hidden rounded-lg">
							<motion.img
								src={project.imageUrl}
								alt={project.title}
								className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105"
								whileHover={{ scale: 1.05 }}
								transition={{ duration: 0.3 }}
								onError={e => {
									// Fallback to CSS placeholder if image fails to load
									const target = e.target as HTMLImageElement
									target.style.display = 'none'
									const parent = target.parentElement
									if (
										parent &&
										!parent.querySelector('.fallback-placeholder')
									) {
										const fallback = document.createElement('div')
										fallback.className =
											'fallback-placeholder h-64 w-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center'
										fallback.innerHTML = `<span class="text-cyan-300 text-lg font-semibold">${project.title}</span>`
										parent.appendChild(fallback)
									}
								}}
							/>
							{project.status === 'in-progress' && (
								<div className="absolute top-4 right-4 rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-300 backdrop-blur-sm">
									In Progress
								</div>
							)}
							{project.featured && (
								<div className="absolute top-4 left-4 rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300 backdrop-blur-sm">
									Featured
								</div>
							)}
						</div>

						{/* Technologies */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							<h4 className="mb-2 text-xs font-semibold tracking-wider text-cyan-300 uppercase sm:text-sm">
								Technologies
							</h4>
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								{project.technologies.map((tech, techIndex) => (
									<motion.span
										key={tech}
										className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80 sm:px-3 sm:py-1 sm:text-sm"
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{
											duration: 0.5,
											delay: 0.8 + techIndex * 0.05,
											ease: 'easeOut',
										}}
									>
										{tech}
									</motion.span>
								))}
							</div>
						</motion.div>

						{/* Project Links */}
						<motion.div
							className="flex flex-wrap gap-2 sm:gap-3"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 1.0 }}
						>
							{project.links.map((link, linkIndex) =>
								renderLink(link, linkIndex),
							)}
						</motion.div>
					</div>

					{/* Right Column: Title and Description */}
					<div>
						{/* Title - linked to website if available */}
						{(() => {
							const websiteLink = project.links.find(l => l.type === 'website')
							const titleContent = (
								<motion.h3
									className="font-exo2 mb-2 text-xl font-bold text-white sm:mb-4 sm:text-3xl"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.2 }}
								>
									{websiteLink ? (
										<a
											href={websiteLink.url}
											target="_blank"
											rel="noopener noreferrer"
											className="transition-colors hover:text-cyan-300"
										>
											{project.title}
										</a>
									) : (
										project.title
									)}
								</motion.h3>
							)
							return titleContent
						})()}
						<motion.p
							className="text-sm leading-relaxed whitespace-pre-line text-white/90 sm:text-lg"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							{project.longDescription}
						</motion.p>
					</div>
				</div>

				{/* Mobile/Medium: Technologies and Links (hidden on desktop, shown on mobile/medium) */}
				<div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:gap-6 lg:hidden">
					{/* Technologies */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						<h4 className="mb-2 text-xs font-semibold tracking-wider text-cyan-300 uppercase sm:text-sm">
							Technologies
						</h4>
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							{project.technologies.map((tech, techIndex) => (
								<motion.span
									key={tech}
									className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80 sm:px-3 sm:py-1 sm:text-sm"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{
										duration: 0.5,
										delay: 0.8 + techIndex * 0.05,
										ease: 'easeOut',
									}}
								>
									{tech}
								</motion.span>
							))}
						</div>
					</motion.div>

					{/* Project Links */}
					<motion.div
						className="flex flex-wrap gap-2 sm:gap-3"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 1.0 }}
					>
						{project.links.map((link, linkIndex) =>
							renderLink(link, linkIndex),
						)}
					</motion.div>
				</div>
			</motion.div>
		</AnimatePresence>
	)
}

export const PortfolioScroll: React.FC<PortfolioScrollProps> = ({
	projects,
	className = '',
	onNavigateToQuiz,
	onBack,
	initialScrollIndex = 0,
}) => {
	const { t, language } = useTranslation()
	const { heroTextVisible } = useHeroText()
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const [currentScrollIndex, setCurrentScrollIndex] =
		useState(initialScrollIndex)
	const isTransitioningRef = useRef(false)
	const totalItems = projects.length + 1 // +1 for hero

	// Update scroll index when initialScrollIndex changes
	useEffect(() => {
		setCurrentScrollIndex(initialScrollIndex)
	}, [initialScrollIndex])

	const handleNavigate = useCallback(
		(direction: 'up' | 'down') => {
			if (isTransitioningRef.current) return // Prevent navigation during transitions

			const newIndex =
				direction === 'down'
					? Math.min(currentScrollIndex + 1, totalItems - 1)
					: Math.max(currentScrollIndex - 1, 0)

			if (newIndex === currentScrollIndex) return // No change needed

			isTransitioningRef.current = true
			setCurrentScrollIndex(newIndex)

			// Reset transition flag after animation completes
			setTimeout(() => {
				isTransitioningRef.current = false
			}, 2000) // Match slide duration
		},
		[currentScrollIndex, totalItems],
	)

	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			if (isTransitioningRef.current) return // Block wheel events during transitions

			e.preventDefault()

			const delta = e.deltaY > 0 ? 1 : -1
			const direction = delta > 0 ? 'down' : 'up'

			handleNavigate(direction)
		}

		window.addEventListener('wheel', handleWheel, { passive: false })
		return () => window.removeEventListener('wheel', handleWheel)
	}, [currentScrollIndex, totalItems, handleNavigate])

	return (
		<div className={`relative h-screen w-screen ${className}`}>
			{/* Scrollable Container - Full screen with hidden scrollbar */}
			<div
				ref={scrollContainerRef}
				className="scrollbar-hide portfolio-scroll h-full w-full overflow-hidden"
				style={{
					scrollbarWidth: 'none', // Firefox
					msOverflowStyle: 'none', // IE/Edge
				}}
			>
				{/* Hero Card */}
				<motion.div
					className="absolute inset-0 flex items-center justify-center px-6"
					initial={false}
					animate={{
						y: `${currentScrollIndex * -100}%`,
					}}
					transition={{
						duration: 2.0, // 2s for slow card sliding
						ease: [0.25, 0.1, 0.25, 1],
					}}
				>
					<div className="relative">
						<motion.div
							className="mx-auto max-w-5xl p-8 text-center"
							initial={{ opacity: 0, y: 60, scale: 0.92 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							viewport={{ once: false }}
							transition={{
								duration: 1.0, // Match project card timing
								ease: [0.25, 0.1, 0.25, 1], // Same smooth curve
							}}
						>
							<AnimatePresence mode="wait">
								<motion.div
									key={`projects-hero-${language}`}
									initial={{ opacity: 0 }}
									animate={{ opacity: heroTextVisible ? 1 : 0 }}
									exit={{ opacity: 0 }}
									transition={{
										duration: LANGUAGE_TRANSITION_CONFIG.textDuration / 1000,
										ease: 'easeInOut',
									}}
									style={{
										pointerEvents: heroTextVisible ? 'auto' : 'none',
									}}
								>
									<motion.h1
										className="font-exo2 mb-4 text-6xl tracking-wider sm:text-8xl"
										initial={{ opacity: 0, y: -20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: false }}
										transition={{ duration: 0.8, delay: 0.2 }}
									>
										<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
											{t.projectsPage.title}
										</span>
									</motion.h1>
									<motion.p
										className="font-exo2 mx-auto max-w-2xl text-xl leading-relaxed text-white/90 sm:text-2xl"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: false }}
										transition={{ duration: 0.8, delay: 0.4 }}
									>
										{t.projectsPage.description}
									</motion.p>
								</motion.div>
							</AnimatePresence>
						</motion.div>

						{/* Down Arrow and Back Button - Just below hero content container */}
						<AnimatePresence>
							{currentScrollIndex === 0 && projects.length > 0 && (
								<motion.div
									key="hero-down-arrow"
									className="pointer-events-auto absolute top-full left-1/2 mt-4 -translate-x-1/2"
									initial={{ opacity: 0, y: 10 }}
									animate={{
										opacity: 1,
										y: 0,
										transition: { duration: 0.8, delay: 0.8 }, // Slow fade-in with delay
									}}
									exit={{
										opacity: 0,
										y: -10,
										transition: { duration: 0.15 }, // Rapid fade-out
									}}
								>
									{/* Down button centered, gallery left (disabled), back right */}
									<div className="relative">
										{/* Gallery button - mobile/medium only, absolutely positioned to the left (disabled) */}
										<div className="absolute top-0 right-full mr-3 lg:hidden">
											<NavigationArrow
												direction="left"
												disabled
												aria-label="View gallery (coming soon)"
											/>
										</div>
										<NavigationArrow
											direction="down"
											onClick={() => handleNavigate('down')}
											aria-label="View projects"
										/>
										{/* Back button - mobile/medium only, absolutely positioned to the right */}
										{onBack && (
											<div className="absolute top-0 left-full ml-3 lg:hidden">
												<NavigationArrow
													direction="right"
													onClick={onBack}
													aria-label="Back to home"
												/>
											</div>
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>

				{/* Project Cards */}
				{projects.map((project, index) => (
					<motion.div
						key={project.id}
						className="absolute inset-0 flex items-center justify-center px-6 py-12"
						initial={false}
						animate={{
							y: `${(index + 1 - currentScrollIndex) * 100}%`,
						}}
						transition={{
							duration: 2.0, // 2s for slow card sliding
							ease: [0.25, 0.1, 0.25, 1],
						}}
					>
						<div className="relative">
							{/* Up Arrow - Above project card content */}
							<AnimatePresence>
								{currentScrollIndex === index + 1 && currentScrollIndex > 0 && (
									<motion.div
										key={`up-arrow-${index}`}
										className="pointer-events-auto absolute -top-16 left-1/2 -translate-x-1/2"
										initial={{ opacity: 0, y: -10 }}
										animate={{
											opacity: 1,
											y: 0,
											transition: { duration: 0.8, delay: 0.2 }, // Slow fade-in
										}}
										exit={{
											opacity: 0,
											y: 10,
											transition: { duration: 0.15 }, // Rapid fade-out
										}}
									>
										<NavigationArrow
											direction="up"
											onClick={() => handleNavigate('up')}
											aria-label="Previous project"
										/>
									</motion.div>
								)}
							</AnimatePresence>

							<ProjectCard
								project={project}
								index={index}
								onNavigateToQuiz={onNavigateToQuiz}
							/>

							{/* Down Arrow and Back Button - Below project card content */}
							<AnimatePresence>
								{currentScrollIndex === index + 1 && (
									<motion.div
										key={`down-arrow-${index}`}
										className="pointer-events-auto absolute -bottom-16 left-1/2 -translate-x-1/2"
										initial={{ opacity: 0, y: 10 }}
										animate={{
											opacity: 1,
											y: 0,
											transition: { duration: 0.8, delay: 1.2 }, // Slow fade-in, late
										}}
										exit={{
											opacity: 0,
											y: -10,
											transition: { duration: 0.15 }, // Rapid fade-out
										}}
									>
										{/* Down button centered, gallery left (disabled), back right */}
										<div className="relative flex items-center justify-center">
											{/* Gallery button - mobile/medium only, absolutely positioned to the left (disabled) */}
											<div className="absolute top-0 right-full mr-3 lg:hidden">
												<NavigationArrow
													direction="left"
													disabled
													aria-label="View gallery (coming soon)"
												/>
											</div>
											{currentScrollIndex < totalItems - 1 && (
												<NavigationArrow
													direction="down"
													onClick={() => handleNavigate('down')}
													aria-label="Next project"
												/>
											)}
											{/* Back button - mobile/medium only, absolutely positioned to the right */}
											{onBack && (
												<div className="absolute top-0 left-full ml-3 lg:hidden">
													<NavigationArrow
														direction="right"
														onClick={onBack}
														aria-label="Back to home"
													/>
												</div>
											)}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	)
}
