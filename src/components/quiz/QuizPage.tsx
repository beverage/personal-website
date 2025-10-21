'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface QuizPageProps {
	onBack: () => void
}

/**
 * Quiz page component
 * Displays a card with quiz content and a back arrow to return to projects
 */
export function QuizPage({ onBack }: QuizPageProps) {
	return (
		<div className="relative flex h-screen w-screen items-center justify-center">
			{/* Quiz Card - styled like a project card */}
			<div className="relative w-full max-w-6xl px-6">
				<motion.div
					className="relative mx-auto rounded-xl border border-cyan-400/30 bg-black/40 p-8 backdrop-blur-sm"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex min-h-[400px] items-center justify-center">
						<h2 className="font-exo2 text-4xl font-bold text-cyan-300">Quiz</h2>
					</div>
				</motion.div>

				{/* Left Variant Navigation Button */}
				<motion.button
					onClick={() => {
						// Non-functional for now
					}}
					className="absolute top-1/2 left-0 z-40 inline-flex -translate-x-12 -translate-y-1/2 items-center gap-2 rounded-full border border-cyan-400/70 bg-black/40 px-3 py-2 text-cyan-300 backdrop-blur-sm transition-all duration-700 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40"
					aria-label="Previous variant"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<ChevronLeft size={16} />
				</motion.button>

				{/* Right Variant Navigation Button */}
				<motion.button
					onClick={() => {
						// Non-functional for now
					}}
					className="absolute top-1/2 right-0 z-40 inline-flex translate-x-12 -translate-y-1/2 items-center gap-2 rounded-full border border-cyan-400/70 bg-black/40 px-3 py-2 text-cyan-300 backdrop-blur-sm transition-all duration-700 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40"
					aria-label="Next variant"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<ChevronRight size={16} />
				</motion.button>
			</div>

			{/* Back Arrow - same style as Projects page back button */}
			<motion.button
				onClick={onBack}
				className="fixed top-1/2 right-8 z-50 inline-flex -translate-y-1/2 items-center gap-2 rounded-full border border-cyan-400/70 bg-black/40 px-3 py-2 text-cyan-300 backdrop-blur-sm transition-all duration-700 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40"
				aria-label="Back to projects"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: 20 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<ChevronRight size={16} />
			</motion.button>
		</div>
	)
}
