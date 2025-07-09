'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Star } from 'lucide-react';
import Link from 'next/link';
import { StarField } from '@/components';
import { getVariantInfo, type TwinkleVariant, type ClusterVariant, type StarFieldVariant, type TwinkleConfig, type ClusterConfig } from '@/lib/starfield';

const TWINKLE_VARIANTS: TwinkleVariant[] = [
  'twinkle',
  'twinkle-compact',
  'twinkle-minimal'
];

const CLUSTER_VARIANTS: ClusterVariant[] = [
  'cluster-ellipse-4x'
];

const ALL_VARIANTS: StarFieldVariant[] = [...TWINKLE_VARIANTS, ...CLUSTER_VARIANTS];

const StarFieldDemo: React.FC<{ variant: StarFieldVariant }> = ({ variant }) => {
  const info = getVariantInfo(variant);
  const isTwinkle = variant.startsWith('twinkle');
  
  return (
    <div className="h-full w-full bg-black relative overflow-hidden rounded-lg border border-gray-800">
      <StarField variant={variant} opacity={1.0} />
      
      {/* Overlay with variant info */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <Star className="h-4 w-4 text-blue-400" />
          <h3 className="font-semibold text-white">{info.title}</h3>
          {info.isWinner && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
              WINNER
            </span>
          )}
        </div>
        <p className="text-sm text-gray-300">{info.description}</p>
        
        <div className="mt-2 text-xs text-gray-400">
          {isTwinkle ? (
            <>
              <div>Size: {Math.round((info.config as TwinkleConfig).sizeMultiplier * 100)}%</div>
              <div>Glow: {(info.config as TwinkleConfig).glowMultiplier}x</div>
              {(info.config as TwinkleConfig).isPulsing && <div className="text-purple-400">• Pulsing</div>}
            </>
          ) : (
            <>
              <div>Foreground: {(info.config as ClusterConfig).foregroundStars} stars</div>
              <div>Cluster: {(info.config as ClusterConfig).clusterStars} stars</div>
              <div>Speed: {(info.config as ClusterConfig).approachSpeed}</div>
              {(info.config as ClusterConfig).clusterSizeMultiplier && (
                <div className="text-blue-400">Size: {(info.config as ClusterConfig).clusterSizeMultiplier}x</div>
              )}
              {(info.config as ClusterConfig).clusterIntensityMultiplier && (
                <div className="text-blue-400">Intensity: {(info.config as ClusterConfig).clusterIntensityMultiplier}x</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function VariantsPage() {
  const [selectedVariant, setSelectedVariant] = useState<StarFieldVariant>('twinkle-compact');
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  
  const selectedInfo = getVariantInfo(selectedVariant);
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Star Field Variants</h1>
              <p className="text-gray-400">Explore twinkle effects and cluster approaches</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-4 py-2 transition-colors ${
                    viewMode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
              
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative">
        {viewMode === 'single' ? (
          <SingleVariantView 
            selectedVariant={selectedVariant} 
            onVariantChange={setSelectedVariant} 
            selectedInfo={selectedInfo}
          />
        ) : (
          <GridVariantView onVariantSelect={setSelectedVariant} />
        )}
      </div>
    </div>
  );
}

const SingleVariantView: React.FC<{
  selectedVariant: StarFieldVariant;
  onVariantChange: (variant: StarFieldVariant) => void;
  selectedInfo: ReturnType<typeof getVariantInfo>;
}> = ({ selectedVariant, onVariantChange, selectedInfo }) => {
  const currentIndex = ALL_VARIANTS.indexOf(selectedVariant);
  
  const nextVariant = () => {
    const nextIndex = (currentIndex + 1) % ALL_VARIANTS.length;
    onVariantChange(ALL_VARIANTS[nextIndex]);
  };
  
  const prevVariant = () => {
    const prevIndex = (currentIndex - 1 + ALL_VARIANTS.length) % ALL_VARIANTS.length;
    onVariantChange(ALL_VARIANTS[prevIndex]);
  };
  
  return (
    <div className="h-[calc(100vh-120px)] relative">
      <StarField variant={selectedVariant} opacity={1.0} />
      
      {/* Navigation Controls */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
        <button
          onClick={prevVariant}
          className="p-3 bg-black/60 backdrop-blur-sm border border-gray-700 rounded-full hover:bg-black/80 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
      
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
        <button
          onClick={nextVariant}
          className="p-3 bg-black/60 backdrop-blur-sm border border-gray-700 rounded-full hover:bg-black/80 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      {/* Variant Info Panel */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <Star className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-bold">{selectedInfo.title}</h2>
            {selectedInfo.isWinner && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                WINNER
              </span>
            )}
          </div>
          
          <p className="text-gray-300 mb-4">{selectedInfo.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            {selectedVariant.startsWith('twinkle') ? (
              <>
                <div>
                  <div className="text-gray-400">Size Multiplier</div>
                  <div className="font-medium">{Math.round((selectedInfo.config as TwinkleConfig).sizeMultiplier * 100)}%</div>
                </div>
                <div>
                  <div className="text-gray-400">Glow Multiplier</div>
                  <div className="font-medium">{(selectedInfo.config as TwinkleConfig).glowMultiplier}x</div>
                </div>
                <div>
                  <div className="text-gray-400">Gradient Stops</div>
                  <div className="font-medium">{(selectedInfo.config as TwinkleConfig).gradientStops.length}</div>
                </div>
                <div>
                  <div className="text-gray-400">Animation</div>
                  <div className="font-medium">{(selectedInfo.config as TwinkleConfig).isPulsing ? 'Pulsing' : 'Twinkle'}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-gray-400">Foreground Stars</div>
                  <div className="font-medium">{(selectedInfo.config as ClusterConfig).foregroundStars}</div>
                </div>
                <div>
                  <div className="text-gray-400">Cluster Stars</div>
                  <div className="font-medium">{(selectedInfo.config as ClusterConfig).clusterStars}</div>
                </div>
                <div>
                  <div className="text-gray-400">Approach Speed</div>
                  <div className="font-medium">{(selectedInfo.config as ClusterConfig).approachSpeed}</div>
                </div>
                <div>
                  <div className="text-gray-400">Semi-Major Axis</div>
                  <div className="font-medium">{(selectedInfo.config as ClusterConfig).clusterSemiMajorAxis}</div>
                </div>
                {(selectedInfo.config as ClusterConfig).clusterSizeMultiplier && (
                  <div>
                    <div className="text-gray-400">Size Boost</div>
                    <div className="font-medium">{(selectedInfo.config as ClusterConfig).clusterSizeMultiplier}x</div>
                  </div>
                )}
                {(selectedInfo.config as ClusterConfig).clusterIntensityMultiplier && (
                  <div>
                    <div className="text-gray-400">Intensity Boost</div>
                    <div className="font-medium">{(selectedInfo.config as ClusterConfig).clusterIntensityMultiplier}x</div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            {currentIndex + 1} of {ALL_VARIANTS.length}
          </div>
        </div>
      </div>
    </div>
  );
};

const GridVariantView: React.FC<{
  onVariantSelect: (variant: StarFieldVariant) => void;
}> = ({ onVariantSelect }) => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {ALL_VARIANTS.map((variant) => (
            <div
              key={variant}
              className="aspect-video cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => onVariantSelect(variant)}
            >
              <StarFieldDemo variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};