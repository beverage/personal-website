'use client'

import { useContentElementAnimation } from '@/hooks/usePortfolioAnimations'
import { motion } from 'framer-motion'

export const AnimatedProjectTitle: React.FC<{ title: string }> = ({
	title,
}) => {
	const animation = useContentElementAnimation('title')

	return (
		<motion.h3
			className="font-exo2 mb-4 text-3xl font-bold text-white"
			{...animation}
		>
			{title}
		</motion.h3>
	)
}

export const AnimatedProjectDescription: React.FC<{ description: string }> = ({
	description,
}) => {
	const animation = useContentElementAnimation('description')

	return (
		<motion.p
			className="mb-4 text-lg leading-relaxed text-white/90"
			{...animation}
		>
			{description}
		</motion.p>
	)
}

export const AnimatedTechnologies: React.FC<{ technologies: string[] }> = ({
	technologies,
}) => {
	const sectionAnimation = useContentElementAnimation('technologies')
	const tagAnimation = useContentElementAnimation('techTags')

	return (
		<motion.div className="mb-6" {...sectionAnimation}>
			<h4 className="mb-2 text-sm font-semibold tracking-wider text-cyan-300 uppercase">
				Technologies
			</h4>
			<div className="flex flex-wrap gap-2">
				{technologies.map((tech, techIndex) => (
					<motion.span
						key={tech}
						className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80"
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: false }}
						transition={{
							duration: tagAnimation.transition.duration,
							delay: tagAnimation.transition.delay + techIndex * 0.1,
							ease: 'easeOut',
						}}
					>
						{tech}
					</motion.span>
				))}
			</div>
		</motion.div>
	)
}
