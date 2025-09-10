import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useContentState } from '../useContentState'

describe('useContentState', () => {
	it('initializes with hero state', () => {
		const { result } = renderHook(() => useContentState())

		expect(result.current.contentState).toBe('hero')
		expect(result.current.isTransitioning).toBe(false)
	})

	it('navigates to projects state', () => {
		const { result } = renderHook(() => useContentState())

		act(() => {
			result.current.navigateToProjects()
		})

		expect(result.current.contentState).toBe('projects')
	})

	it('navigates to contact state', () => {
		const { result } = renderHook(() => useContentState())

		act(() => {
			result.current.navigateToContact()
		})

		expect(result.current.contentState).toBe('contact')
	})

	it('navigates back to hero state', () => {
		const { result } = renderHook(() => useContentState())

		// Navigate away from hero
		act(() => {
			result.current.navigateToProjects()
		})
		expect(result.current.contentState).toBe('projects')

		// Navigate back to hero
		act(() => {
			result.current.navigateToHero()
		})
		expect(result.current.contentState).toBe('hero')
	})

	it('manages transitioning state correctly', () => {
		const { result } = renderHook(() => useContentState())

		// Start transitioning
		act(() => {
			result.current.setIsTransitioning(true)
		})
		expect(result.current.isTransitioning).toBe(true)

		// Complete transition
		act(() => {
			result.current.setIsTransitioning(false)
		})
		expect(result.current.isTransitioning).toBe(false)
	})

	it('handles rapid navigation calls', () => {
		const { result } = renderHook(() => useContentState())

		// Rapidly call navigation functions
		act(() => {
			result.current.navigateToProjects()
			result.current.navigateToContact()
			result.current.navigateToHero()
		})

		// Should end up in the last state called
		expect(result.current.contentState).toBe('hero')
	})

	it('maintains state independence', () => {
		const { result: result1 } = renderHook(() => useContentState())
		const { result: result2 } = renderHook(() => useContentState())

		// Change first instance
		act(() => {
			result1.current.navigateToProjects()
		})

		// Should not affect second instance
		expect(result1.current.contentState).toBe('projects')
		expect(result2.current.contentState).toBe('hero')
	})
})
