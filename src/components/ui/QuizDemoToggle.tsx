'use client'

import { useQuizDemo } from '@/contexts/QuizDemoContext'
import { CircleQuestionMark } from 'lucide-react'

interface QuizDemoToggleProps {
	className?: string
	disabled?: boolean
}

/**
 * Debug control - toggle quiz demo visibility
 */
export const QuizDemoToggle = ({
	className = '',
	disabled = false,
}: QuizDemoToggleProps) => {
	const { quizDemoEnabled, setQuizDemoEnabled } = useQuizDemo()

	const handleToggle = () => {
		setQuizDemoEnabled(!quizDemoEnabled)
	}

	return (
		<button
			onClick={handleToggle}
			disabled={disabled}
			className={`font-exo2 rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 ${
				quizDemoEnabled
					? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:border-cyan-600 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/60'
					: 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
			} ${className}`}
			aria-label={`Toggle quiz demo (${quizDemoEnabled ? 'on' : 'off'})`}
			title={`Quiz Demo ${quizDemoEnabled ? 'On' : 'Off'}`}
		>
			<CircleQuestionMark size={16} />
		</button>
	)
}
