import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useIsMobile } from '../useMobileDetection'

describe('useIsMobile', () => {
	it('detects non-mobile by default in jsdom', () => {
		const { result } = renderHook(() => useIsMobile())
		// jsdom has no navigator.userAgent matching mobile by default
		expect(result.current).toBe(false)
	})
})
