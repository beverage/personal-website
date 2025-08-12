interface HeroSectionProps {
	title?: string
	description?: string
	primaryButtonText?: string
	secondaryButtonText?: string
	onPrimaryClick?: () => void
	onSecondaryClick?: () => void
	className?: string
}

export const HeroSection = ({
	title = 'Coming Soon',
	description = 'Finally.',
	primaryButtonText = 'Get In Touch',
	secondaryButtonText = 'Explore Projects',
	onPrimaryClick,
	onSecondaryClick,
	className = '',
}: HeroSectionProps) => {
	return (
		<div className={`max-w-5xl text-center ${className}`}>
			<div className="mb-8 p-12">
				<h1 className="font-exo2 mb-6 text-6xl tracking-wider sm:text-8xl">
					<span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
						{title}
					</span>
				</h1>
				<p className="font-exo2 mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-white/90 sm:text-2xl">
					{description}
				</p>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<button
						onClick={onSecondaryClick}
						className="font-exo2 rounded-lg border border-cyan-400 px-8 py-4 text-cyan-300 transition-all hover:bg-cyan-400/10"
					>
						{secondaryButtonText}
					</button>
					<button
						onClick={onPrimaryClick}
						className="font-exo2 rounded-lg bg-cyan-500 px-8 py-4 text-white shadow-lg shadow-cyan-500/40 transition-all hover:bg-cyan-600 hover:shadow-cyan-400/50"
					>
						{primaryButtonText}
					</button>
				</div>
			</div>
		</div>
	)
}
