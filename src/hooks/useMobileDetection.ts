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
 * Detect Safari desktop browser
 * Safari has significantly slower Canvas 2D performance than Chrome/Firefox
 */
export const useIsSafari = (): boolean => {
	const [isSafari, setIsSafari] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const ua = navigator.userAgent
		// Detect Safari but exclude Chrome and Android (which also match 'safari' in UA)
		const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua)
		// Only desktop Safari, not mobile Safari (which is already handled by isMobile)
		const isDesktop = !window.matchMedia('(hover: none) and (pointer: coarse)')
			.matches

		setIsSafari(isSafariBrowser && isDesktop)
	}, [])

	return isSafari
}

/**
 * Hook for performance-based star count optimization
 * Reduces star count on mobile devices and Safari desktop
 *
 * Note: Safari desktop needs reduced stars AND disabled cluster layer
 * The cluster's gradient-heavy halo effects are the primary bottleneck,
 * but Safari's Canvas 2D performance also struggles with high star counts
 */
export const useOptimalStarCount = (baseStarCount: number = 4000): number => {
	const isMobile = useIsMobile()
	const isSafari = useIsSafari()

	// Reduce by 50% on mobile devices OR Safari desktop
	// Safari's CPU-bound Canvas 2D cannot handle full complexity
	return isMobile || isSafari ? Math.floor(baseStarCount * 0.5) : baseStarCount
}
