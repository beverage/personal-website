interface BrandPanelProps {
  brandName?: string;
  className?: string;
}

export const BrandPanel = ({ 
  brandName = "beverage.me", 
  className = "" 
}: BrandPanelProps) => {
  return (
    <div className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 ${className}`}>
      <div className="font-bold text-white">{brandName}</div>
    </div>
  );
}; 