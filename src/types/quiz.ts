/**
 * Type definitions for Language Quiz Service API responses
 */

/**
 * Problem type categories
 */
export type ProblemType = 'grammar' | 'functional' | 'vocabulary'

/**
 * A single statement/answer option in a quiz problem
 */
export interface ProblemStatementResponse {
	content: string
	is_correct: boolean
	translation: string | null
	explanation: string | null
}

/**
 * Complete problem response from the quiz service
 */
export interface ProblemResponse {
	id: string
	problem_type: ProblemType
	title: string | null
	instructions: string
	statements: ProblemStatementResponse[]
	correct_answer_index: number
	target_language_code: string
	topic_tags: string[]
	created_at: string
	updated_at: string
}
