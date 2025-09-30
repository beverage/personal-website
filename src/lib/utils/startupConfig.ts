export interface StartupSequenceConfig {
	/** Enable the startup animation sequence */
	enabled?: boolean
	/** Delay before auto-toggle from sailboat to rocket mode (ms) */
	autoToggleDelay?: number
	/** Delay before hero text starts fading in (ms) */
	heroFadeDelay?: number
	/** Duration of hero text fade-in animation (ms) */
	heroFadeDuration?: number
	/** Delay before UI controls start fading in (ms) */
	controlsFadeDelay?: number
	/** Duration of UI controls fade-in animation (ms) */
	controlsFadeDuration?: number
	/** Delay before hero buttons start fading in (ms) */
	buttonFadeDelay?: number
	/** Duration of hero buttons fade-in animation (ms) */
	buttonFadeDuration?: number
}

export const DEFAULT_STARTUP_CONFIG: Required<StartupSequenceConfig> = {
	enabled: true,
	autoToggleDelay: 3000,
	heroFadeDelay: 1000,
	heroFadeDuration: 3000,
	controlsFadeDelay: 3000,
	controlsFadeDuration: 2000,
	buttonFadeDelay: 2000,
	buttonFadeDuration: 2500,
}
