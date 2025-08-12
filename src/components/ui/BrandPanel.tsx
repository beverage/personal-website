interface BrandPanelProps {
	brandName?: string
	className?: string
}

export const BrandPanel = ({
	brandName = 'beverage.me',
	className = '',
}: BrandPanelProps) => {
	return (
		<div
			className={`rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm ${className}`}
		>
			<div className="font-exo2 text-white">{brandName}</div>
		</div>
	)
}
