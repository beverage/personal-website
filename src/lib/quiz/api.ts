import type { ProblemResponse } from '@/types/quiz'

export interface QuizFilters {
	grammaticalFocus?: string[]
	tensesUsed?: string[]
}

/**
 * Fetches a random quiz problem from the API
 * @param filters Optional filters for grammatical focus and tenses
 * @returns Promise resolving to a ProblemResponse or throwing an error
 */
export async function fetchRandomQuiz(
	filters?: QuizFilters,
): Promise<ProblemResponse> {
	const queryParams = new URLSearchParams()
	if (filters?.grammaticalFocus && filters.grammaticalFocus.length > 0) {
		filters.grammaticalFocus.forEach(focus =>
			queryParams.append('grammatical_focus', focus),
		)
	}
	if (filters?.tensesUsed && filters.tensesUsed.length > 0) {
		filters.tensesUsed.forEach(tense =>
			queryParams.append('tenses_used', tense),
		)
	}

	const queryString = queryParams.toString()
	const url = `/api/quiz/random${queryString ? `?${queryString}` : ''}`

	console.log('🌐 [fetchRandomQuiz] Starting request')
	console.log('  URL:', url)
	console.log('  Method: GET')
	console.log('  Filters:', filters)
	console.log(
		'  Base URL:',
		typeof window !== 'undefined' ? window.location.origin : 'server-side',
	)

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	console.log('📡 [fetchRandomQuiz] Response received')
	console.log('  Status:', response.status)
	console.log('  Status Text:', response.statusText)
	console.log('  OK:', response.ok)
	console.log('  Full URL:', response.url)

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}))
		const errorMessage =
			errorData.error ||
			`Failed to fetch quiz (${response.status}: ${response.statusText})`
		const statusCode = errorData.status || response.status
		console.error(
			'❌ [fetchRandomQuiz] Request failed:',
			errorMessage,
			'Status:',
			statusCode,
		)

		// Create error with status code attached
		const error = new Error(errorMessage) as Error & { statusCode?: number }
		error.statusCode = statusCode
		throw error
	}

	const data = await response.json()
	console.log('✅ [fetchRandomQuiz] Data received:', data)
	return data
}
