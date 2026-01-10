'use client'

import { fetchRandomQuiz } from '@/lib/quiz/api'
import type { ProblemResponse } from '@/types/quiz'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface QuizPageProps {
	onBack: () => void
}

/**
 * Quiz page component
 * Displays an interactive quiz card where users can select answers,
 * see results, and navigate through their session history.
 */
export function QuizPage({ onBack }: QuizPageProps) {
	// Session state - tracks all problems seen this session
	const [problems, setProblems] = useState<ProblemResponse[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	// Tracks which statements have been selected per slot (index -> Set of statement indices)
	// Keyed by index so each position in the session is independent
	const [selectedStatements, setSelectedStatements] = useState<
		Map<number, Set<number>>
	>(new Map())

	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const hasFetchedRef = useRef(false)

	// Current problem being displayed
	const currentProblem = problems[currentIndex] ?? null
	const currentSelections =
		selectedStatements.get(currentIndex) ?? new Set<number>()
	// Problem is completed when user has found the correct answer
	const isCompleted = currentProblem
		? currentSelections.has(currentProblem.correct_answer_index)
		: false
	const isAtStart = currentIndex === 0
	const isAtEnd = currentIndex === problems.length - 1

	// Fetch a new random problem and add it to the session
	const fetchNewProblem = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await fetchRandomQuiz()
			setProblems(prev => [...prev, data])
			setCurrentIndex(prev => prev + 1)
		} catch (err) {
			console.error('❌ [QuizPage] Fetch error:', err)
			setError(err instanceof Error ? err.message : 'Failed to load quiz')
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Initial fetch on mount
	useEffect(() => {
		if (hasFetchedRef.current) {
			return
		}

		async function loadInitialQuiz() {
			try {
				hasFetchedRef.current = true
				setIsLoading(true)
				setError(null)
				const data = await fetchRandomQuiz()
				setProblems([data])
				setCurrentIndex(0)
			} catch (err) {
				console.error('❌ [QuizPage] Fetch error:', err)
				setError(err instanceof Error ? err.message : 'Failed to load quiz')
			} finally {
				setIsLoading(false)
			}
		}

		loadInitialQuiz()
	}, [])

	// Handle selecting a statement
	const handleSelectStatement = useCallback(
		(statementIndex: number) => {
			if (!currentProblem || isCompleted) return

			setSelectedStatements(prev => {
				const newMap = new Map(prev)
				const currentSet = newMap.get(currentIndex) ?? new Set<number>()
				const newSet = new Set(currentSet)
				newSet.add(statementIndex)
				newMap.set(currentIndex, newSet)
				return newMap
			})
		},
		[currentProblem, currentIndex, isCompleted],
	)

	// Navigation handlers
	const handleBack = useCallback(() => {
		if (!isAtStart) {
			setCurrentIndex(prev => prev - 1)
		}
	}, [isAtStart])

	const handleNext = useCallback(() => {
		if (isAtEnd) {
			// Fetch new problem when at the end of session
			fetchNewProblem()
		} else {
			// Navigate to next problem in session
			setCurrentIndex(prev => prev + 1)
		}
	}, [isAtEnd, fetchNewProblem])

	// Refresh: fetch a completely new problem (replaces current position)
	const handleRefresh = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await fetchRandomQuiz()

			// Replace current problem with new one
			setProblems(prev => {
				const newProblems = [...prev]
				newProblems[currentIndex] = data
				return newProblems
			})

			// Clear selections for this slot
			setSelectedStatements(prev => {
				const newMap = new Map(prev)
				newMap.delete(currentIndex)
				return newMap
			})
		} catch (err) {
			console.error('❌ [QuizPage] Refresh error:', err)
			setError(err instanceof Error ? err.message : 'Failed to load quiz')
		} finally {
			setIsLoading(false)
		}
	}, [currentIndex])

	return (
		<div className="relative flex h-screen w-screen items-center justify-center px-28 py-16">
			{/* Quiz Card - styled like a project card */}
			<div className="relative w-full max-w-5xl">
				<motion.div
					className="relative mx-auto rounded-xl border border-cyan-400/30 bg-black/40 p-8 backdrop-blur-sm"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.5 }}
				>
					{/* Loading State - only show on initial load when no data exists */}
					{isLoading && !currentProblem && (
						<div className="flex min-h-[400px] items-center justify-center">
							<div className="flex flex-col items-center gap-4">
								<Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
								<p className="font-exo2 text-lg text-cyan-300">
									Loading quiz...
								</p>
							</div>
						</div>
					)}

					{/* Error State */}
					{error && !isLoading && (
						<div className="flex min-h-[400px] items-center justify-center">
							<div className="flex flex-col items-center gap-4 text-center">
								<p className="font-exo2 text-xl font-bold text-red-400">
									Error Loading Quiz
								</p>
								<p className="max-w-md text-sm text-red-300/80">{error}</p>
								<button
									onClick={handleRefresh}
									className="mt-2 rounded-lg border border-cyan-400/70 bg-black/40 px-4 py-2 text-cyan-300 transition-all hover:bg-cyan-500 hover:text-white"
								>
									Retry
								</button>
							</div>
						</div>
					)}

					{/* Quiz Data Display */}
					{currentProblem && !error && (
						<div className="min-h-[400px] space-y-6">
							{/* Instructions with Refresh Button - stays fixed */}
							<div className="relative border-b border-cyan-400/20 pb-6">
								<p className="font-exo2 text-xl text-cyan-200/90">
									{currentProblem.instructions}
								</p>
								<button
									onClick={handleRefresh}
									disabled={isLoading}
									className="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/70 bg-black/40 text-cyan-300 backdrop-blur-sm transition-all duration-700 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
									aria-label="Refresh quiz"
								>
									<RefreshCw
										size={16}
										className={isLoading ? 'animate-spin' : ''}
									/>
								</button>
							</div>

							{/* Answer Options - animate on content change */}
							<AnimatePresence mode="wait">
								<motion.div
									key={currentProblem.id}
									className="space-y-4"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 20 }}
									transition={{ duration: 0.5 }}
								>
									{currentProblem.statements.map((statement, index) => {
										const isSelected = currentSelections.has(index)
										// Show result if this statement was selected, or if completed (show all)
										const showResult = isSelected || isCompleted
										const isClickable = !isCompleted && !isSelected

										return (
											<div
												key={index}
												onClick={() =>
													isClickable && handleSelectStatement(index)
												}
												className={`space-y-2 rounded-lg border p-4 transition-all duration-300 ${
													showResult
														? statement.is_correct
															? 'border-green-400/50 bg-green-500/10'
															: 'border-red-400/50 bg-red-500/10'
														: 'cursor-pointer border-cyan-400/30 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10'
												}`}
												role={isClickable ? 'button' : undefined}
												tabIndex={isClickable ? 0 : undefined}
												onKeyDown={
													isClickable
														? e => {
																if (e.key === 'Enter' || e.key === ' ') {
																	e.preventDefault()
																	handleSelectStatement(index)
																}
															}
														: undefined
												}
											>
												<div className="flex items-start gap-3">
													<span
														className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
															showResult
																? statement.is_correct
																	? 'bg-green-500/30 text-green-300'
																	: 'bg-red-500/30 text-red-300'
																: 'bg-cyan-500/20 text-cyan-300'
														}`}
													>
														{index + 1}
													</span>
													<div className="flex-1 space-y-1">
														<p
															className={`text-base font-semibold transition-all duration-300 ${
																showResult
																	? statement.is_correct
																		? 'text-green-200'
																		: 'text-red-100'
																	: 'text-cyan-100'
															}`}
														>
															{statement.content}
														</p>
														{/* Only show translation/explanation when result is shown */}
														{showResult && (
															<motion.p
																initial={{ opacity: 0, height: 0 }}
																animate={{ opacity: 1, height: 'auto' }}
																transition={{ duration: 0.3 }}
																className={`text-sm ${
																	statement.is_correct
																		? 'text-cyan-200/70'
																		: 'text-red-200/70'
																}`}
															>
																<span className="italic">
																	{statement.is_correct
																		? 'Translation: '
																		: 'Explanation: '}
																</span>
																{statement.is_correct
																	? statement.translation
																	: statement.explanation}
															</motion.p>
														)}
													</div>
												</div>
											</div>
										)
									})}
								</motion.div>
							</AnimatePresence>

							{/* Navigation Buttons */}
							<div className="flex items-center justify-between border-t border-cyan-400/20 pt-6">
								{/* Back Button */}
								<button
									onClick={handleBack}
									disabled={isAtStart}
									className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-black/40 px-4 py-2 text-cyan-300 backdrop-blur-sm transition-all duration-300 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-cyan-300 disabled:hover:shadow-none"
									aria-label="Previous question"
								>
									<ChevronLeft size={16} />
									<span className="font-exo2 text-sm">Back</span>
								</button>

								{/* Question Counter */}
								<span className="font-exo2 text-sm text-cyan-300/60">
									{currentIndex + 1} / {problems.length}
								</span>

								{/* Next Button */}
								<button
									onClick={handleNext}
									disabled={isLoading}
									className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-black/40 px-4 py-2 text-cyan-300 backdrop-blur-sm transition-all duration-300 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
									aria-label={isAtEnd ? 'Next question' : 'Go to next question'}
								>
									<span className="font-exo2 text-sm">
										{isAtEnd ? 'Next' : 'Next'}
									</span>
									{isLoading && isAtEnd ? (
										<Loader2 size={16} className="animate-spin" />
									) : (
										<ChevronRight size={16} />
									)}
								</button>
							</div>
						</div>
					)}
				</motion.div>
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
