'use client'

import { fetchRandomQuiz, type QuizFilters } from '@/lib/quiz/api'
import type { ProblemResponse } from '@/types/quiz'
import { AnimatePresence, motion } from 'framer-motion'
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	RefreshCw,
	SlidersHorizontal,
	X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Available tenses for filtering (constant, defined outside component)
 */
const AVAILABLE_TENSES = [
	'present',
	'imparfait',
	'passe_compose',
	'future_simple', // Note: typo in backend
	'conditionnel',
	'subjonctif',
	'plus_que_parfait',
] as const

/**
 * Available grammatical focuses for filtering (constant, defined outside component)
 */
const AVAILABLE_FOCUSES = ['conjugation', 'pronouns'] as const

/**
 * Display names for tenses with proper French accents
 * Note: 'future_simple' is a typo in the backend, displayed as 'Futur Simple'
 */
const tenseDisplayNames: Record<string, string> = {
	present: 'Présent',
	imparfait: 'Imparfait',
	passe_compose: 'Passé Composé',
	future_simple: 'Futur Simple',
	conditionnel: 'Conditionnel',
	subjonctif: 'Subjonctif',
	plus_que_parfait: 'Plus-que-parfait',
}

/**
 * Display names for grammatical focuses
 */
const focusDisplayNames: Record<string, string> = {
	conjugation: 'Conjugation',
	pronouns: 'Pronouns',
}

interface FilterColumnProps {
	title: string
	items: readonly string[]
	selected: Set<string>
	onToggle: (item: string) => void
	onToggleAll: (selectAll: boolean) => void
	formatName: (item: string) => string
	isEmpty: boolean
}

/**
 * Reusable filter column component for the dropdown
 */
function FilterColumn({
	title,
	items,
	selected,
	onToggle,
	onToggleAll,
	formatName,
	isEmpty,
}: FilterColumnProps) {
	return (
		<div className="flex flex-1 flex-col gap-2">
			<div className="flex items-center justify-between">
				<span
					className={`font-exo2 text-sm font-medium ${isEmpty ? 'text-yellow-400' : 'text-cyan-400'}`}
				>
					{title}
				</span>
				<div className="flex gap-1">
					<button
						type="button"
						onClick={() => onToggleAll(true)}
						className={`rounded px-2 py-0.5 text-xs transition-colors ${
							isEmpty
								? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-white'
								: 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white'
						}`}
					>
						All
					</button>
					<button
						type="button"
						onClick={() => onToggleAll(false)}
						className={`rounded bg-black/40 px-2 py-0.5 text-xs transition-colors ${
							isEmpty
								? 'text-yellow-400/70 hover:bg-yellow-500/20 hover:text-yellow-300'
								: 'text-cyan-400/70 hover:bg-cyan-500/20 hover:text-cyan-300'
						}`}
					>
						None
					</button>
				</div>
			</div>
			<div className="flex flex-col gap-1.5">
				{items.map(item => {
					const isSelected = selected.has(item)
					return (
						<label
							key={item}
							className="flex cursor-pointer items-center gap-2"
						>
							<div className="relative">
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => onToggle(item)}
									className={`h-4 w-4 cursor-pointer appearance-none rounded-md border bg-black/40 transition-all focus:ring-2 focus:outline-none ${
										isEmpty
											? 'border-yellow-400/50 checked:border-yellow-400 checked:bg-yellow-500 hover:border-yellow-400 focus:ring-yellow-400/50'
											: 'border-cyan-400/50 checked:border-cyan-400 checked:bg-cyan-500 hover:border-cyan-400 focus:ring-cyan-400/50'
									}`}
									style={{
										backgroundImage: isSelected
											? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\")"
											: 'none',
										backgroundSize: 'contain',
										backgroundPosition: 'center',
										backgroundRepeat: 'no-repeat',
									}}
								/>
							</div>
							<span className="text-sm text-cyan-100">{formatName(item)}</span>
						</label>
					)
				})}
			</div>
		</div>
	)
}

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
	const [errorStatus, setErrorStatus] = useState<number | null>(null)
	const [errorConfigDescription, setErrorConfigDescription] = useState<
		string | null
	>(null)
	const hasFetchedRef = useRef(false)

	// Check if error is a "no results" error (404) vs other errors
	const isNoResultsError = errorStatus === 404
	const isCriticalError = error && !isNoResultsError

	// Dropdown state
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	// Filter state - using module-level constants
	const [selectedTenses, setSelectedTenses] = useState<Set<string>>(
		() => new Set(AVAILABLE_TENSES),
	) // All selected by default
	const [selectedFocuses, setSelectedFocuses] = useState<Set<string>>(
		() => new Set(AVAILABLE_FOCUSES),
	) // All selected by default

	// Current problem being displayed (undefined if we're past the stack, i.e., on an error card)
	const currentProblem = problems[currentIndex]
	const currentSelections =
		selectedStatements.get(currentIndex) ?? new Set<number>()
	// Problem is completed when user has found the correct answer
	const isCompleted = currentProblem
		? currentSelections.has(currentProblem.correct_answer_index)
		: false
	const isAtStart = currentIndex === 0
	// We're on an error card if we're past the problems array and have an error
	const isOnErrorCard =
		currentIndex >= problems.length && error !== null && !isLoading
	// Total cards = problems in stack + 1 if we're on an error/loading card past the stack
	const totalCards = Math.max(problems.length, currentIndex + 1)
	// Configuration is invalid if no tenses OR no focuses are selected
	const isInvalidConfig =
		selectedTenses.size === 0 || selectedFocuses.size === 0

	// Get current filters based on selections
	const getCurrentFilters = useCallback((): QuizFilters => {
		const filters: QuizFilters = {}
		if (
			selectedTenses.size > 0 &&
			selectedTenses.size < AVAILABLE_TENSES.length
		) {
			filters.tensesUsed = Array.from(selectedTenses)
		}
		if (
			selectedFocuses.size > 0 &&
			selectedFocuses.size < AVAILABLE_FOCUSES.length
		) {
			filters.grammaticalFocus = Array.from(selectedFocuses)
		}
		return filters
	}, [selectedTenses, selectedFocuses])

	// Format tense name for display using the mapping
	const formatTenseName = (tense: string) => {
		return tenseDisplayNames[tense] ?? tense
	}

	// Format focus name for display using the mapping
	const formatFocusName = (focus: string) => {
		return focusDisplayNames[focus] ?? focus
	}

	// Calculate total selected filters for badge display
	const totalFilters = AVAILABLE_TENSES.length + AVAILABLE_FOCUSES.length
	const selectedFilters = selectedTenses.size + selectedFocuses.size
	const allFiltersSelected = selectedFilters === totalFilters

	// Build configuration description for error messages
	// Format: "(focus) with the (tense)"
	const getConfigurationDescription = useCallback(() => {
		let focusPart: string
		if (selectedFocuses.size === 0) {
			focusPart = 'no focuses'
		} else if (selectedFocuses.size === AVAILABLE_FOCUSES.length) {
			focusPart = 'all focuses'
		} else {
			focusPart = Array.from(selectedFocuses).map(formatFocusName).join(', ')
		}

		let tensePart: string
		if (selectedTenses.size === 0) {
			tensePart = 'no tenses'
		} else if (selectedTenses.size === AVAILABLE_TENSES.length) {
			tensePart = 'all tenses'
		} else {
			tensePart = Array.from(selectedTenses).map(formatTenseName).join(', ')
		}

		return `${focusPart} with the ${tensePart}`
	}, [selectedTenses, selectedFocuses])

	// Initial fetch on mount
	useEffect(() => {
		if (hasFetchedRef.current) {
			return
		}

		async function loadInitialQuiz() {
			hasFetchedRef.current = true
			setIsLoading(true)
			setError(null)
			setErrorStatus(null)
			setErrorConfigDescription(null)

			try {
				const filters = getCurrentFilters()
				const data = await fetchRandomQuiz(filters)
				setProblems([data])
			} catch (err) {
				console.error('❌ [QuizPage] Fetch error:', err)
				const errorMessage =
					err instanceof Error ? err.message : 'Failed to load quiz'
				const statusCode = (err as Error & { statusCode?: number })?.statusCode
				setError(errorMessage)
				setErrorStatus(statusCode ?? null)
				setErrorConfigDescription(getConfigurationDescription())
				// Keep problems empty, we're on card 0 with an error
			} finally {
				setIsLoading(false)
			}
		}

		loadInitialQuiz()
	}, [getCurrentFilters, getConfigurationDescription])

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
	// Back: Just decrement index. If leaving error card, clear error state.
	const handleBack = useCallback(() => {
		if (currentIndex > 0) {
			setCurrentIndex(prev => prev - 1)
			// Clear error state - we're moving to a valid card in the stack
			setError(null)
			setErrorStatus(null)
			setErrorConfigDescription(null)
		}
	}, [currentIndex])

	// Unified fetch handler - used by both Next and Refresh
	// Stack model:
	// - If on valid card: increment index to new position, then fetch
	// - If on error card: stay at current index, fetch to fill the card
	const handleFetchProblem = useCallback(async () => {
		const isOnValidCard = !!currentProblem
		const targetIndex = isOnValidCard ? currentIndex + 1 : currentIndex

		// Set loading and clear error state first
		setIsLoading(true)
		setError(null)
		setErrorStatus(null)
		setErrorConfigDescription(null)

		// If on valid card, move to new position
		if (isOnValidCard) {
			setCurrentIndex(targetIndex)
		}

		try {
			const filters = getCurrentFilters()
			const data = await fetchRandomQuiz(filters)

			// Success - add problem to stack at target position
			setProblems(prev => {
				const newProblems = [...prev]
				newProblems[targetIndex] = data
				return newProblems
			})
			// Clear selections for new card
			setSelectedStatements(prev => {
				const newMap = new Map(prev)
				newMap.delete(targetIndex)
				return newMap
			})
		} catch (err) {
			console.error('❌ [QuizPage] Fetch error:', err)
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to load quiz'
			const statusCode = (err as Error & { statusCode?: number })?.statusCode
			setError(errorMessage)
			setErrorStatus(statusCode ?? null)
			setErrorConfigDescription(getConfigurationDescription())
			// Error card: we're now at targetIndex with no problem in the stack
		} finally {
			setIsLoading(false)
		}
	}, [
		currentProblem,
		currentIndex,
		getCurrentFilters,
		getConfigurationDescription,
	])

	// Next: Navigate to existing card OR fetch new problem
	const handleNext = useCallback(() => {
		// If there's a problem at the next index, just navigate to it
		if (problems[currentIndex + 1]) {
			setCurrentIndex(prev => prev + 1)
			return
		}
		// Otherwise fetch a new problem (this also handles error cards)
		handleFetchProblem()
	}, [currentIndex, problems, handleFetchProblem])

	// Refresh: Same as fetching a new problem
	const handleRefresh = handleFetchProblem

	// Dropdown handlers
	const toggleDropdown = useCallback(() => {
		setIsDropdownOpen(prev => !prev)
	}, [])

	const closeDropdown = useCallback(() => {
		setIsDropdownOpen(false)
	}, [])

	// Click outside handler
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				closeDropdown()
			}
		}

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isDropdownOpen, closeDropdown])

	// Toggle handlers for filters
	const toggleTense = useCallback((tense: string) => {
		setSelectedTenses(prev => {
			const newSet = new Set(prev)
			if (newSet.has(tense)) {
				newSet.delete(tense)
			} else {
				newSet.add(tense)
			}
			return newSet
		})
	}, [])

	const toggleFocus = useCallback((focus: string) => {
		setSelectedFocuses(prev => {
			const newSet = new Set(prev)
			if (newSet.has(focus)) {
				newSet.delete(focus)
			} else {
				newSet.add(focus)
			}
			return newSet
		})
	}, [])

	const toggleAllTenses = useCallback((selectAll: boolean) => {
		setSelectedTenses(selectAll ? new Set(AVAILABLE_TENSES) : new Set())
	}, [])

	const toggleAllFocuses = useCallback((selectAll: boolean) => {
		setSelectedFocuses(selectAll ? new Set(AVAILABLE_FOCUSES) : new Set())
	}, [])

	// Format instructions to ensure it ends with a colon
	const formatInstructions = (instructions: string) => {
		if (instructions.trim().endsWith('.')) {
			return instructions.trim().slice(0, -1) + ':'
		}
		return instructions
	}

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
					{/* Critical Error State - full card replacement for 500s, auth errors, etc. */}
					{isCriticalError ? (
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
					) : (
						/* Normal card layout - handles loading, problems, and 404 errors */
						<div className="flex min-h-[500px] flex-col">
							{/* Top Section - Instructions with Controls (pinned) */}
							<div className="flex flex-col gap-4 border-b border-cyan-400/20 pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
								{/* Instructions text - takes available space, allows buttons to wrap below on mobile */}
								<div className="flex-1">
									{currentProblem ? (
										<p className="font-exo2 text-xl text-cyan-200/90">
											{formatInstructions(currentProblem.instructions)}
										</p>
									) : (
										<p className="font-exo2 text-xl text-cyan-200/90">
											Choose the correctly formed French sentence:
										</p>
									)}
								</div>
								{/* Controls - stack on mobile, inline on desktop */}
								<div className="flex shrink-0 gap-2 self-end sm:self-start">
									<div className="relative">
										<button
											ref={buttonRef}
											onClick={toggleDropdown}
											className={`inline-flex items-center gap-2 rounded-lg border bg-black/40 px-3 py-2 backdrop-blur-sm transition-all duration-300 ${
												isInvalidConfig
													? 'border-yellow-400 text-yellow-300 shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 hover:text-white'
													: isDropdownOpen
														? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
														: 'border-cyan-400/70 text-cyan-300 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40'
											}`}
											aria-label="Filter settings"
										>
											<SlidersHorizontal size={16} />
											<span className="font-exo2 text-sm">Filters</span>
											{!allFiltersSelected && (
												<span
													className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
														isInvalidConfig
															? 'bg-yellow-500/30 text-yellow-300'
															: 'bg-cyan-500/30 text-cyan-200'
													}`}
												>
													{selectedFilters}/{totalFilters}
												</span>
											)}
										</button>

										{/* Dropdown Menu */}
										<AnimatePresence>
											{isDropdownOpen && (
												<motion.div
													ref={dropdownRef}
													initial={{ opacity: 0, y: -10, height: 'auto' }}
													animate={{
														opacity: 1,
														y: 0,
														height: 'auto',
													}}
													exit={{ opacity: 0, y: -10 }}
													transition={{ duration: 0.15 }}
													className="absolute top-full right-0 z-50 mt-2 w-[280px] rounded-lg border border-cyan-400/30 bg-black/90 p-4 shadow-xl backdrop-blur-sm sm:w-[460px]"
												>
													{/* Header */}
													<div className="mb-3 flex items-center justify-between">
														<h3 className="font-exo2 text-base font-semibold text-cyan-300">
															Problem Filters
														</h3>
														<button
															onClick={closeDropdown}
															className="rounded p-1 text-cyan-400/70 transition-colors hover:bg-cyan-500/20 hover:text-cyan-300"
															aria-label="Close dropdown"
														>
															<X size={16} />
														</button>
													</div>

													{/* Two Column Layout (desktop) / Single Column (mobile) */}
													<div className="flex flex-col gap-4 sm:flex-row">
														{/* Tenses Column */}
														<FilterColumn
															title="Tenses"
															items={AVAILABLE_TENSES}
															selected={selectedTenses}
															onToggle={toggleTense}
															onToggleAll={toggleAllTenses}
															formatName={formatTenseName}
															isEmpty={selectedTenses.size === 0}
														/>

														{/* Vertical Separator (hidden on mobile) */}
														<div className="hidden items-stretch py-2 sm:flex">
															<div
																className={`w-px ${isInvalidConfig ? 'bg-yellow-400/30' : 'bg-cyan-400/20'}`}
															/>
														</div>

														{/* Horizontal Separator (visible on mobile only) */}
														<div
															className={`h-px sm:hidden ${isInvalidConfig ? 'bg-yellow-400/30' : 'bg-cyan-400/20'}`}
														/>

														{/* Focuses Column */}
														<FilterColumn
															title="Focuses"
															items={AVAILABLE_FOCUSES}
															selected={selectedFocuses}
															onToggle={toggleFocus}
															onToggleAll={toggleAllFocuses}
															formatName={formatFocusName}
															isEmpty={selectedFocuses.size === 0}
														/>
													</div>

													{/* Invalid Configuration Warning */}
													<AnimatePresence>
														{isInvalidConfig && (
															<motion.div
																initial={{ opacity: 0, height: 0 }}
																animate={{ opacity: 1, height: 'auto' }}
																exit={{ opacity: 0, height: 0 }}
																transition={{ duration: 0.2 }}
																className="overflow-hidden"
															>
																<div className="mt-4 rounded-lg border border-yellow-400/30 bg-yellow-500/10 p-3 text-center text-sm text-yellow-300">
																	{selectedTenses.size === 0 &&
																	selectedFocuses.size === 0
																		? 'Select at least one tense and one focus to continue'
																		: selectedTenses.size === 0
																			? 'Select at least one tense to continue'
																			: 'Select at least one focus to continue'}
																</div>
															</motion.div>
														)}
													</AnimatePresence>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
									<button
										onClick={handleRefresh}
										disabled={isLoading || isInvalidConfig}
										className={`inline-flex aspect-square items-center justify-center rounded-lg border p-2 backdrop-blur-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
											isOnErrorCard && !isInvalidConfig
												? 'border-yellow-400 bg-black/40 text-yellow-300 shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 hover:text-white'
												: 'border-cyan-400/70 bg-black/40 text-cyan-300 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40'
										}`}
										aria-label="Refresh quiz"
									>
										<RefreshCw
											size={16}
											className={isLoading ? 'animate-spin' : ''}
										/>
									</button>
								</div>
							</div>

							{/* Middle Section - Content Area (flexible) */}
							<div className="flex flex-1 items-center py-6">
								<AnimatePresence mode="wait">
									{/* Key changes when: index changes, loading state changes, or content type changes */}
									{/* This ensures animations happen for: card navigation, loading→content, error→problem */}
									{isLoading ? (
										<motion.div
											key={`loading-${currentIndex}`}
											className="flex w-full items-center justify-center py-8"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.2 }}
										>
											<Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
										</motion.div>
									) : isNoResultsError ? (
										<motion.div
											key={`error-${currentIndex}`}
											className="w-full px-8"
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -20 }}
											transition={{ duration: 0.3 }}
										>
											<div className="mx-auto rounded-lg border border-yellow-400/50 bg-yellow-500/10 px-24 py-6">
												<div className="space-y-3 text-center">
													<p className="font-exo2 text-base font-medium text-yellow-300">
														No problems available for {errorConfigDescription}
													</p>
													<p className="text-sm text-yellow-200/70">
														Try adjusting your filters or click refresh to try
														again.
													</p>
												</div>
											</div>
										</motion.div>
									) : currentProblem ? (
										<motion.div
											key={`problem-${currentProblem.id}`}
											className="w-full space-y-4"
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -20 }}
											transition={{ duration: 0.3 }}
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
																{/* Only show translation/explanation when result is shown and content exists */}
																{showResult &&
																	((statement.is_correct &&
																		statement.translation) ||
																		(!statement.is_correct &&
																			statement.explanation)) && (
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
																			{statement.is_correct ? (
																				<>
																					<span className="italic">
																						Translation:{' '}
																					</span>
																					{statement.translation}
																				</>
																			) : (
																				<>
																					<span className="italic">
																						Explanation:{' '}
																					</span>
																					{statement.explanation}
																				</>
																			)}
																		</motion.p>
																	)}
															</div>
														</div>
													</div>
												)
											})}
										</motion.div>
									) : null}
								</AnimatePresence>
							</div>

							{/* Bottom Section - Navigation Buttons (pinned) */}
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
									{currentIndex + 1} / {totalCards}
								</span>

								{/* Next Button */}
								<button
									onClick={handleNext}
									disabled={isLoading || isOnErrorCard || isInvalidConfig}
									className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-black/40 px-4 py-2 text-cyan-300 backdrop-blur-sm transition-all duration-300 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
									aria-label="Next question"
								>
									<span className="font-exo2 text-sm">Next</span>
									{isLoading ? (
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
