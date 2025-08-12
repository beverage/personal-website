import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useClusterStarField } from '../useClusterStarField'

describe('useClusterStarField', () => {
	it('returns a canvas ref', () => {
		const { result } = renderHook(() =>
			useClusterStarField({ variant: 'cluster-ellipse-4x', opacity: 1 }),
		)
		expect(result.current.current).toBeNull() // not mounted to a DOM node in renderHook
	})
})
