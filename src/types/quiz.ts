/**
 * Type definitions for Language Quiz Service API responses
 */

/**
 * A single statement/answer option in a quiz problem
 */
export interface ProblemStatementResponse {
	content: string
	is_correct: boolean
	translation: string
	explanation: string
}

/**
 * Complete problem response from the quiz service
 */
export interface ProblemResponse {
	id: string
	title: string
	instructions: string
	statements: ProblemStatementResponse[]
	correct_answer_index: number
	target_language_code: string
	topic_tags: string[]
	created_at: string
	updated_at: string
}
