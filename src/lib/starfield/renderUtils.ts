/**
 * Utility functions for WebGL starfield rendering
 */

/**
 * Check if a projected star is within rendering bounds
 * Used by both foreground and cluster renderers to determine if a star should be rendered
 *
 * @param x - Projected x coordinate in pixels
 * @param y - Projected y coordinate in pixels
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param margin - Extra margin around canvas edges (in pixels)
 * @returns true if star is within bounds, false otherwise
 */
export function isWithinRenderBounds(
	x: number,
	y: number,
	canvasWidth: number,
	canvasHeight: number,
	margin: number,
): boolean {
	return (
		x >= -margin &&
		x <= canvasWidth + margin &&
		y >= -margin &&
		y <= canvasHeight + margin
	)
}
