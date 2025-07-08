import React, { useState, useEffect } from 'react';
import { BrandPanel } from './BrandPanel';
import { ControlPanel } from './ControlPanel';
import { HeroSection } from './HeroSection';
import { FooterPanel } from './FooterPanel';
import { HomepageStarField } from '../starfield/StarField';

interface PageLayoutProps {
  children?: React.ReactNode;
  showStarField?: boolean;
  brandName?: string;
  heroTitle?: string;
  heroDescription?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const PageLayout = ({
  children,
  showStarField = true,
  brandName,
  heroTitle,
  heroDescription,
  onPrimaryClick,
  onSecondaryClick
}: PageLayoutProps) => {
  const [darkMode, setDarkMode] = useState(true);
  
  useEffect(() => { 
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode); 
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Star Field Background */}
      {showStarField && <HomepageStarField />}
      
      {/* LCARS-style branding panel */}
      <div className="absolute top-8 left-8 z-50">
        <BrandPanel brandName={brandName} />
      </div>
      
      {/* LCARS-style control panel */}
      <div className="absolute top-8 right-8 z-50">
        <ControlPanel 
          darkMode={darkMode}
          onToggle={() => setDarkMode(!darkMode)}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        {children || (
          <HeroSection 
            title={heroTitle}
            description={heroDescription}
            onPrimaryClick={onPrimaryClick}
            onSecondaryClick={onSecondaryClick}
          />
        )}
      </div>

      {/* LCARS-style footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <FooterPanel />
      </div>
    </div>
  );
}; 