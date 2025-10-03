'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import type { HomepageLayeredStarFieldProps } from './LayeredStarField'

// Simulate slow loading (development only)
// Set to 0 to disable, or e.g. 5000 for 5 second delay
const DEV_DELAY_MS = process.env.NODE_ENV === 'development' ? 2000 : 0

// Fade-in duration when starfield loads (milliseconds)
// Adjust this to control how quickly the starfield fades in from black
const FADE_IN_DURATION_MS = 2000

// Threshold for "slow load" detection (milliseconds)
// If starfield loads faster than this, skip the fade-in animation
const SLOW_LOAD_THRESHOLD_MS = 1000

// Dynamically import the starfield with no SSR
// This prevents the large canvas animation code from blocking initial load
const LayeredStarField = dynamic(
	() =>
		import('./LayeredStarField').then(async mod => {
			// Artificial delay for testing (dev mode only)
			if (DEV_DELAY_MS > 0) {
				await new Promise(resolve => setTimeout(resolve, DEV_DELAY_MS))
			}
			return {
				default: mod.HomepageLayeredStarField,
			}
		}),
	{
		ssr: false,
		loading: () => <div className="absolute inset-0 bg-black" />,
	},
)

interface LazyStarFieldProps extends HomepageLayeredStarFieldProps {
	onLoaded?: () => void
	fadeInDurationMs?: number
}

export function LazyStarField({
	onLoaded,
	fadeInDurationMs = FADE_IN_DURATION_MS,
	...props
}: LazyStarFieldProps) {
	const [isLoaded, setIsLoaded] = useState(false)
	const [isVisible, setIsVisible] = useState(false)
	const [loadStartTime] = useState(() => Date.now())

	useEffect(() => {
		if (isLoaded) {
			const loadTime = Date.now() - loadStartTime
			const isSlowLoad = loadTime >= SLOW_LOAD_THRESHOLD_MS

			if (isSlowLoad) {
				// Slow load: apply fade-in animation
				setIsVisible(true)

				// Notify parent after fade-in completes
				if (onLoaded) {
					const timeout = setTimeout(() => {
						onLoaded()
					}, fadeInDurationMs)

					return () => clearTimeout(timeout)
				}
			} else {
				// Fast load: appear instantly, no fade-in
				setIsVisible(true)

				// Notify parent immediately
				if (onLoaded) {
					onLoaded()
				}
			}
		}
	}, [isLoaded, onLoaded, fadeInDurationMs, loadStartTime])

	return (
		<Suspense fallback={<div className="absolute inset-0 bg-black" />}>
			<div
				className="absolute inset-0"
				style={{
					opacity: isVisible ? 1 : 0,
					// Only apply transition if this was a slow load
					transition:
						Date.now() - loadStartTime >= SLOW_LOAD_THRESHOLD_MS
							? `opacity ${fadeInDurationMs}ms ease-in-out`
							: 'none',
				}}
			>
				<LayeredStarField
					{...props}
					onRender={() => {
						// Notify that starfield has rendered
						if (!isLoaded) {
							setIsLoaded(true)
						}
					}}
				/>
			</div>
		</Suspense>
	)
}
