'use client';

import React, { useState } from 'react';
import { BrandPanel } from './BrandPanel';
import { ControlPanel } from './ControlPanel';
import { HeroSection } from './HeroSection';
import { FooterPanel } from './FooterPanel';
import { HomepageLayeredStarField } from '../starfield/LayeredStarField';

interface SocialLink {
  icon: 'github' | 'linkedin' | 'instagram' | 'mail';
  href: string;
  label: string;
}

interface ClientConfig {
  socialLinks: SocialLink[];
  copyrightYear: number;
}

interface PageLayoutProps {
  children?: React.ReactNode;
  showStarField?: boolean;
  brandName?: string;
  heroTitle?: string;
  heroDescription?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  clientConfig?: ClientConfig;
}

export const PageLayout = ({
  children,
  showStarField = true,
  brandName,
  heroTitle,
  heroDescription,
  onPrimaryClick,
  onSecondaryClick,
  clientConfig
}: PageLayoutProps) => {
  const [clusterVisible, setClusterVisible] = useState(showStarField);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Star Field Background */}
      <HomepageLayeredStarField showCluster={clusterVisible} />
      
      {/* LCARS-style branding panel */}
      <div className="absolute top-8 left-8 z-50">
        <BrandPanel brandName={brandName} />
      </div>
      
      {/* LCARS-style control panel */}
      <div className="absolute top-8 right-8 z-50">
        <ControlPanel 
          darkMode={clusterVisible}
          onToggle={() => setClusterVisible(!clusterVisible)}
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
        <FooterPanel 
          year={clientConfig?.copyrightYear}
          socialLinks={clientConfig?.socialLinks}
        />
      </div>
    </div>
  );
}; 