import type { ProblemResponse } from '@/types/quiz'
import { NextResponse } from 'next/server'

/**
 * GET handler for fetching a random quiz problem
 * Proxies requests to the language-quiz-service backend
 * This keeps the API key secure on the server side
 */
export async function GET(request: Request) {
	try {
		const serviceUrl = process.env.LQS_SERVICE_URL || 'http://localhost:8000'
		const apiKey = process.env.LQS_SERVICE_API_KEY || ''

		// Parse query parameters
		const { searchParams } = new URL(request.url)
		const grammaticalFocus = searchParams.getAll('grammatical_focus')
		const tensesUsed = searchParams.getAll('tenses_used')

		// Build query string
		const queryParams = new URLSearchParams()
		if (grammaticalFocus.length > 0) {
			grammaticalFocus.forEach(focus =>
				queryParams.append('grammatical_focus', focus),
			)
		}
		if (tensesUsed.length > 0) {
			tensesUsed.forEach(tense => queryParams.append('tenses_used', tense))
		}

		const queryString = queryParams.toString()
		const url = `${serviceUrl}/api/v1/problems/grammar/random${queryString ? `?${queryString}` : ''}`

		// Build headers
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		}

		// Add API key if configured
		if (apiKey) {
			headers['Authorization'] = `Bearer ${apiKey}`
		}

		// Call the language-quiz-service
		const response = await fetch(url, {
			method: 'GET',
			headers,
		})

		if (!response.ok) {
			let errorDetail: string
			try {
				const errorData = await response.json()
				// Extract error message, ensuring it's a string
				const detail = errorData.detail
				const error = errorData.error

				if (typeof detail === 'string' && detail.trim() !== '') {
					errorDetail = detail
				} else if (typeof error === 'string' && error.trim() !== '') {
					errorDetail = error
				} else {
					errorDetail = 'Failed to fetch problem from the service'
				}
			} catch {
				const errorText = await response.text()
				errorDetail =
					typeof errorText === 'string' && errorText.trim() !== ''
						? errorText
						: 'Failed to fetch problem from the service'
			}
			console.error('Quiz service error:', errorDetail)
			return NextResponse.json(
				{
					error: errorDetail,
					status: response.status,
				},
				{ status: response.status },
			)
		}

		const data: ProblemResponse = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error fetching quiz:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
