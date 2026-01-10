import type { ProblemResponse } from '@/types/quiz'
import { NextResponse } from 'next/server'

/**
 * GET handler for fetching a random quiz problem
 * Proxies requests to the language-quiz-service backend
 * This keeps the API key secure on the server side
 */
export async function GET() {
	try {
		const serviceUrl = process.env.LQS_SERVICE_URL || 'http://localhost:8000'
		const apiKey = process.env.LQS_SERVICE_API_KEY || ''

		// Build headers
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		}

		// Add API key if configured
		if (apiKey) {
			headers['Authorization'] = `Bearer ${apiKey}`
		}

		// Call the language-quiz-service
		const response = await fetch(`${serviceUrl}/api/v1/problems/random`, {
			method: 'GET',
			headers,
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Quiz service error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to fetch quiz from service' },
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
