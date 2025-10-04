import { useEffect, useState } from 'react'

/**
 * Detects if WebGL is supported and reliable on the current device
 * @returns boolean - true if WebGL should be used, false to fall back to Canvas2D
 */
export function useWebGLSupport(): boolean {
	const [supportsWebGL, setSupportsWebGL] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const canUseWebGL = detectWebGLSupport()
		setSupportsWebGL(canUseWebGL)
	}, [])

	return supportsWebGL
}

/**
 * Detects WebGL support and checks for known buggy implementations
 */
function detectWebGLSupport(): boolean {
	try {
		const canvas = document.createElement('canvas')
		const gl =
			canvas.getContext('webgl2') ||
			canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl')

		if (!gl) return false

		// Check for known buggy implementations
		if (hasBuggyWebGL(gl as WebGLRenderingContext)) return false

		return true
	} catch {
		return false
	}
}

/**
 * Checks if the GPU has known buggy WebGL implementations
 */
function hasBuggyWebGL(gl: WebGLRenderingContext): boolean {
	try {
		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
		if (!debugInfo) return false

		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
		if (typeof renderer !== 'string') return false

		// Blacklist known problematic GPUs (5+ years old)
		const buggyPatterns = [
			/Mali-[4][0-5]0/, // Mali 400-450 series
			/Intel.*HD Graphics [34]000/, // Intel HD 3000/4000
			/PowerVR SGX/, // Old iOS devices
		]

		return buggyPatterns.some(pattern => pattern.test(renderer))
	} catch {
		// If we can't get GPU info, assume it's safe to try WebGL
		return false
	}
}
