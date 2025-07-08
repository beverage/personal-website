'use client';

import React from 'react';
import { PageLayout } from '@/components';

export default function Home() {
  const handlePrimaryClick = () => {
    console.log('Get In Touch clicked');
    // Add your contact logic here
  };

  const handleSecondaryClick = () => {
    console.log('Explore Projects clicked');
    // Add your projects navigation logic here
  };

  return (
    <PageLayout
      brandName="beverage.me"
      heroTitle="Coming Soon"
      heroDescription="Finally."
      onPrimaryClick={handlePrimaryClick}
      onSecondaryClick={handleSecondaryClick}
    />
  );
} 