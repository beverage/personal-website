import { useEffect, useState } from 'react'

export const useIsMobile = (): boolean => {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkMobile = () => {
			if (typeof window === 'undefined') return false

			// Use CSS media query - most reliable and respects user preferences
			return window.matchMedia('(hover: none) and (pointer: coarse)').matches
		}

		setIsMobile(checkMobile())

		// Update on orientation change
		const handleOrientationChange = () => {
			// Small delay to allow for layout changes
			setTimeout(() => setIsMobile(checkMobile()), 100)
		}

		window.addEventListener('orientationchange', handleOrientationChange)
		return () =>
			window.removeEventListener('orientationchange', handleOrientationChange)
	}, [])

	return isMobile
}

/**
 * Hook for performance-based star count optimization
 * Reduces star count on mobile devices for battery conservation
 *
 * Note: WebGL handles all desktop browsers efficiently (including Safari)
 * Only mobile devices need reduced complexity for battery life
 */
export const useOptimalStarCount = (baseStarCount: number = 4000): number => {
	const isMobile = useIsMobile()

	// Reduce by 50% on mobile devices for battery conservation
	return isMobile ? Math.floor(baseStarCount * 0.5) : baseStarCount
}
