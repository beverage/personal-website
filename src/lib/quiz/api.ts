import type { ProblemResponse } from '@/types/quiz'

/**
 * Fetches a random quiz problem from the API
 * @returns Promise resolving to a ProblemResponse or throwing an error
 */
export async function fetchRandomQuiz(): Promise<ProblemResponse> {
	const url = `/api/quiz/random`

	console.log('🌐 [fetchRandomQuiz] Starting request')
	console.log('  URL:', url)
	console.log('  Method: GET')
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
		console.error('❌ [fetchRandomQuiz] Request failed:', errorMessage)
		throw new Error(errorMessage)
	}

	const data = await response.json()
	console.log('✅ [fetchRandomQuiz] Data received:', data)
	return data
}
