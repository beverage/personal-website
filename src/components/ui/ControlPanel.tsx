import { Sun, Moon } from 'lucide-react';

interface ControlPanelProps {
  darkMode?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const ControlPanel = ({ 
  darkMode = true, 
  onToggle,
  className = "" 
}: ControlPanelProps) => {
  return (
    <button 
      onClick={onToggle}
      className={`p-3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full hover:bg-black/30 transition-all ${className}`}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}; 