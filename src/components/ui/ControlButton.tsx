import React from 'react'

interface ControlButtonProps {
	children: React.ReactNode
	className?: string
	onClick?: () => void
	href?: string
	target?: string
	rel?: string
	ariaLabel?: string
}

/**
 * Base control button component for top-right UI controls
 * Provides consistent sizing, border, and background styling
 * Content is fully customizable via children
 */
export const ControlButton = ({
	children,
	className = '',
	onClick,
	href,
	target,
	rel,
	ariaLabel,
}: ControlButtonProps) => {
	// Base styles that all control buttons share
	const baseStyles =
		'inline-flex items-center rounded-full border border-cyan-400/70 bg-black/40 backdrop-blur-sm transition-all'

	// If href is provided, render as link
	if (href) {
		return (
			<a
				href={href}
				target={target}
				rel={rel}
				aria-label={ariaLabel}
				className={`${baseStyles} ${className}`}
			>
				{children}
			</a>
		)
	}

	// If onClick is provided, render as button
	if (onClick) {
		return (
			<button
				onClick={onClick}
				aria-label={ariaLabel}
				className={`${baseStyles} ${className}`}
			>
				{children}
			</button>
		)
	}

	// Otherwise, render as div (for containers like LanguageSelector)
	return (
		<div aria-label={ariaLabel} className={`${baseStyles} ${className}`}>
			{children}
		</div>
	)
}
