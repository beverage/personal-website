'use client'

import { useEffect, useState } from 'react'

/**
 * Smoothly animates starfield speed based on cluster visibility
 * Accelerates to 1200 when cluster appears, decelerates to 400 when hidden
 */
export function useStarSpeedAnimation(
	clusterVisible: boolean,
	initialSpeed = 400,
): number {
	const [starSpeed, setStarSpeed] = useState(initialSpeed)

	useEffect(() => {
		let frameId: number
		let isActive = true
		let lastTime = performance.now()
		const accelUp = 1000 // Acceleration when cluster appears
		const accelDown = 2000 // Faster deceleration when cluster disappears

		const step = (now: number) => {
			if (!isActive) return // Stop if component unmounted

			const dt = (now - lastTime) / 1000
			lastTime = now

			setStarSpeed(prev => {
				const target = clusterVisible ? 1200 : 400
				const diff = target - prev
				if (Math.abs(diff) < 1) return target

				const rate = clusterVisible ? accelUp : accelDown
				const maxDelta = rate * dt
				return prev + Math.sign(diff) * Math.min(Math.abs(diff), maxDelta)
			})

			if (isActive) {
				frameId = requestAnimationFrame(step)
			}
		}

		frameId = requestAnimationFrame(step)
		return () => {
			isActive = false
			cancelAnimationFrame(frameId)
		}
	}, [clusterVisible])

	return starSpeed
}
