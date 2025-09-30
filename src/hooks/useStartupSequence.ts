'use client'

import {
	DEFAULT_STARTUP_CONFIG,
	type StartupSequenceConfig,
} from '@/lib/utils/startupConfig'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseStartupSequenceReturn {
	clusterVisible: boolean
	setClusterVisible: (visible: boolean) => void
	heroVisible: boolean
	uiControlsVisible: boolean
	heroButtonsVisible: boolean
	startupComplete: boolean
	controlFadeStyle: React.CSSProperties
	heroFadeStyle: React.CSSProperties
}

/**
 * Manages the startup animation sequence
 * Orchestrates the fade-in of different UI elements on initial load
 */
export function useStartupSequence(
	config: StartupSequenceConfig = DEFAULT_STARTUP_CONFIG,
	showStarField = true,
): UseStartupSequenceReturn {
	// Merge config with defaults
	const fullConfig = useMemo(
		() => ({ ...DEFAULT_STARTUP_CONFIG, ...config }),
		[config],
	)

	// Startup sequence: Start in sailboat mode, then auto-toggle to rocket mode
	const [clusterVisible, setClusterVisible] = useState(
		fullConfig.enabled ? false : showStarField,
	)

	// Startup sequence states
	const [heroVisible, setHeroVisible] = useState(!fullConfig.enabled)
	const [uiControlsVisible, setUiControlsVisible] = useState(
		!fullConfig.enabled,
	)
	const [heroButtonsVisible, setHeroButtonsVisible] = useState(
		!fullConfig.enabled,
	)
	const [startupComplete, setStartupComplete] = useState(!fullConfig.enabled)

	// Track timeouts for cleanup
	const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

	// Helper to create tracked timeouts that get cleaned up on unmount
	const createTrackedTimeout = useCallback(
		(callback: () => void, delay: number) => {
			const timeoutId = setTimeout(() => {
				timeoutsRef.current.delete(timeoutId)
				callback()
			}, delay)
			timeoutsRef.current.add(timeoutId)
			return timeoutId
		},
		[],
	)

	// Cleanup all timeouts on unmount
	useEffect(() => {
		const timeouts = timeoutsRef.current
		return () => {
			timeouts.forEach(timeoutId => clearTimeout(timeoutId))
			timeouts.clear()
		}
	}, [])

	// Startup sequence orchestration
	useEffect(() => {
		if (!fullConfig.enabled || startupComplete) return

		const {
			autoToggleDelay,
			heroFadeDelay,
			controlsFadeDelay,
			buttonFadeDelay,
			controlsFadeDuration,
		} = fullConfig

		// Phase 1: Auto-toggle from sailboat to rocket mode
		createTrackedTimeout(() => {
			setClusterVisible(true)
		}, autoToggleDelay)

		// Phase 2: Hero text fade-in
		createTrackedTimeout(() => {
			setHeroVisible(true)
		}, heroFadeDelay)

		// Phase 3: UI controls fade-in
		createTrackedTimeout(() => {
			setUiControlsVisible(true)
		}, controlsFadeDelay)

		// Phase 3.5: Hero buttons fade-in (smooth transition)
		createTrackedTimeout(() => {
			setHeroButtonsVisible(true)
		}, buttonFadeDelay)

		// Phase 4: Mark startup complete
		createTrackedTimeout(() => {
			setStartupComplete(true)
		}, controlsFadeDelay + controlsFadeDuration)

		return () => {
			// Cleanup handled by createTrackedTimeout
		}
	}, [fullConfig, startupComplete, createTrackedTimeout])

	// Shared styles for UI controls fade-in - only apply during startup sequence
	const controlFadeStyle =
		fullConfig.enabled && !startupComplete
			? {
					opacity: uiControlsVisible ? 1 : 0,
					transition: `opacity ${fullConfig.controlsFadeDuration}ms ease-in-out`,
				}
			: {}

	// Hero fade style - only apply during startup sequence
	const heroFadeStyle =
		fullConfig.enabled && !startupComplete
			? {
					transition: `opacity ${fullConfig.heroFadeDuration}ms ease-in-out`,
				}
			: {}

	return {
		clusterVisible,
		setClusterVisible,
		heroVisible,
		uiControlsVisible,
		heroButtonsVisible,
		startupComplete,
		controlFadeStyle,
		heroFadeStyle,
	}
}
