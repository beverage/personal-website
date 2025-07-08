interface HeroSectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

export const HeroSection = ({
  title = "Coming Soon",
  description = "Finally.",
  primaryButtonText = "Get In Touch",
  secondaryButtonText = "Explore Projects",
  onPrimaryClick,
  onSecondaryClick,
  className = ""
}: HeroSectionProps) => {
  return (
    <div className={`text-center max-w-5xl ${className}`}>
      <div className="p-12 mb-8">
        <h1 className="text-6xl sm:text-8xl font-bold mb-6 tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            {title}
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onSecondaryClick}
            className="px-8 py-4 border border-cyan-400 text-cyan-300 rounded-lg transition-all font-medium hover:bg-cyan-400/10"
          >
            {secondaryButtonText}
          </button>
          <button 
            onClick={onPrimaryClick}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/50"
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}; 