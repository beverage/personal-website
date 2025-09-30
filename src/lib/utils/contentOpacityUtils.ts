import { type ContentState } from '@/types/transitions'

/**
 * Calculate the appropriate opacity for content during transitions
 */
export function getContentOpacity(
	contentType: ContentState,
	isTransitioning: boolean,
	fromContentState: ContentState,
	toContentState: ContentState,
	currentContentOpacity: number,
	newContentOpacity: number,
): number {
	if (!isTransitioning) return 1 // Normal state: content fully visible

	// During transitions: assign opacity based on content role
	if (contentType === fromContentState) {
		return currentContentOpacity // Content fading OUT
	} else if (contentType === toContentState) {
		return newContentOpacity // Content fading IN
	} else {
		return 0 // Content not involved in current transition
	}
}

/**
 * Determine which content should be rendered during transitions
 */
export function shouldRenderContent(
	contentType: ContentState,
	contentState: ContentState,
	isTransitioning: boolean,
	fromContentState: ContentState,
	toContentState: ContentState,
): boolean {
	return !isTransitioning
		? contentState === contentType // Normal state: only current content
		: contentType === fromContentState || contentType === toContentState // Transition: FROM and TO
}
