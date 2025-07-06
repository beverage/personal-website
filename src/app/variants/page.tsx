'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Grid, Eye, Code } from 'lucide-react';

// Example: 3 different hero section variants
const HeroVariant1 = () => (
  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 py-20 px-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-6xl font-bold mb-6 text-gray-900 dark:text-white">
        Minimalist Approach
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Clean, simple, focused on content
      </p>
      <button className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded">
        Get Started
      </button>
    </div>
  </div>
);

const HeroVariant2 = () => (
  <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-20 px-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-6xl font-bold mb-6 text-white animate-pulse">
        Bold & Colorful
      </h1>
      <p className="text-xl text-purple-100 mb-8">
        Eye-catching gradients and animations
      </p>
      <button className="px-8 py-3 bg-white text-purple-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        Explore Now
      </button>
    </div>
  </div>
);

const HeroVariant3 = () => (
  <div className="bg-black py-20 px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20"></div>
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <h1 className="text-6xl font-bold mb-6 text-green-400 font-mono">
        $ ./developer.sh
      </h1>
      <p className="text-xl text-green-300 mb-8 font-mono">
        &gt; Terminal-inspired dark theme
      </p>
      <button className="px-8 py-3 border border-green-400 text-green-400 rounded hover:bg-green-400 hover:text-black transition-colors">
        [ENTER]
      </button>
    </div>
  </div>
);

// Main Variants Viewer Component
const VariantsViewer = () => {
  const [currentVariant, setCurrentVariant] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  // Define your component variants here
  const variants = [
    { name: 'Minimalist', component: HeroVariant1 },
    { name: 'Bold & Colorful', component: HeroVariant2 },
    { name: 'Terminal Dark', component: HeroVariant3 },
  ];

  const nextVariant = () => {
    setCurrentVariant((prev) => (prev + 1) % variants.length);
  };

  const prevVariant = () => {
    setCurrentVariant((prev) => (prev - 1 + variants.length) % variants.length);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Design Variants Preview
          </h1>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'single' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Eye size={20} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Grid size={20} />
              </button>
            </div>

            {/* Single View Controls */}
            {viewMode === 'single' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevVariant}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium">
                  {variants[currentVariant].name} ({currentVariant + 1}/{variants.length})
                </span>
                
                <button
                  onClick={nextVariant}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variants Display */}
      <div className="p-4">
        {viewMode === 'single' ? (
          // Single View - Show one variant at a time
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {React.createElement(variants[currentVariant].component)}
            </div>
          </div>
        ) : (
          // Grid View - Show all variants side by side
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {variants.map((variant, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white">{variant.name}</h3>
                  </div>
                  <div className="transform scale-75 origin-top-left w-[133%] h-0 pb-[100%] relative">
                    <div className="absolute inset-0">
                      {React.createElement(variant.component)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantsViewer;