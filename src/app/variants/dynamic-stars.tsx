'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Grid, Eye } from 'lucide-react';

// 3D Star class for deep space distances
class Star3D {
  canvasWidth: number;
  canvasHeight: number;
  x: number;
  y: number;
  z: number;
  intensity: number;

  constructor(canvasWidth: number = 1920, canvasHeight: number = 1080) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.intensity = Math.random() * 0.7 + 0.3;
    this.reset();
  }

  updateCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  reset() {
    const maxDimension = Math.max(this.canvasWidth, this.canvasHeight);
    const scaleFactor = maxDimension / 800;
    
    this.x = (Math.random() - 0.5) * 120000 * scaleFactor;
    this.y = (Math.random() - 0.5) * 120000 * scaleFactor;  
    this.z = 10000 + Math.random() * 40000;
  }

  update(forwardSpeed: number, rollSpeed: number, deltaTime: number) {
    this.z -= forwardSpeed * deltaTime;
    
    const wrapThreshold = 50;
    if (this.z <= wrapThreshold) {
      const overshoot = wrapThreshold - this.z;
      this.z = 50000 + overshoot;
      const maxDimension = Math.max(this.canvasWidth, this.canvasHeight);
      const scaleFactor = maxDimension / 800;
      this.x = (Math.random() - 0.5) * 120000 * scaleFactor;
      this.y = (Math.random() - 0.5) * 120000 * scaleFactor;
    }

    const rollAngle = rollSpeed * deltaTime * Math.PI / 180;
    const cos = Math.cos(rollAngle);
    const sin = Math.sin(rollAngle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
  }

  project(screenWidth: number, screenHeight: number, focalLength = 200) {
    const screenX = screenWidth / 2 + (this.x / this.z) * focalLength;
    const screenY = screenHeight / 2 + (this.y / this.z) * focalLength;
    
    const size = Math.max(0.5, Math.min(2, (20000 / this.z) * 1.5));
    const opacity = this.intensity * Math.min(1, (50000 / this.z));
    
    return {
      x: screenX,
      y: screenY,
      size,
      opacity: Math.max(0.1, Math.min(1, opacity)),
      visible: screenX >= -10 && screenX <= screenWidth + 10 && 
               screenY >= -10 && screenY <= screenHeight + 10 &&
               this.z > 0
    };
  }
}

// Starfield Hook with Custom Rendering
const useStarField = (
  starCount: number, 
  speed: number, 
  rollSpeed: number, 
  opacity: number = 1,
  renderStyle: 'twinkle-small' | 'twinkle-compact' | 'twinkle-minimal' | 'twinkle-pulse' = 'twinkle-compact'
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const width = window?.innerWidth || 1920;
    const height = window?.innerHeight || 1080;
    starsRef.current = Array.from({ length: starCount }, () => new Star3D(width, height));

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        star.update(speed, rollSpeed, deltaTime);
        
        const projected = star.project(canvas.width, canvas.height);
        if (projected.visible) {
          renderStar(ctx, projected.x, projected.y, projected.size, projected.opacity * opacity, renderStyle, currentTime);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        
        starsRef.current.forEach(star => {
          star.updateCanvasSize(canvasRef.current!.width, canvasRef.current!.height);
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starCount, speed, rollSpeed, opacity, renderStyle]);

  return canvasRef;
};

// Custom star rendering function
const renderStar = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number, 
  opacity: number, 
  style: 'twinkle-small' | 'twinkle-compact' | 'twinkle-minimal' | 'twinkle-pulse',
  time: number
) => {
  switch (style) {
    case 'twinkle-small':
      // Small stars - reduce overall size
      const twinkleSmall = Math.sin(time * 0.003 + x * 0.01 + y * 0.01) * 0.3 + 0.7;
      const colorShiftSmall = Math.sin(time * 0.002 + x * 0.005) * 0.2 + 0.8;
      const smallSize = size * 0.6; // Reduce base size
      
      const tsGradient = ctx.createRadialGradient(x, y, 0, x, y, smallSize * 2);
      tsGradient.addColorStop(0, `rgba(255, ${255 * colorShiftSmall}, ${255 * colorShiftSmall}, ${opacity * twinkleSmall})`);
      tsGradient.addColorStop(0.3, `rgba(${255 * colorShiftSmall}, ${255 * colorShiftSmall}, 255, ${opacity * twinkleSmall * 0.6})`);
      tsGradient.addColorStop(0.6, `rgba(${200 * colorShiftSmall}, ${220 * colorShiftSmall}, 255, ${opacity * twinkleSmall * 0.3})`);
      tsGradient.addColorStop(1, `rgba(150, 180, 255, 0)`);
      
      ctx.fillStyle = tsGradient;
      ctx.beginPath();
      ctx.arc(x, y, smallSize * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'twinkle-compact':
      // Compact glow - smaller glow radius
      const twinkleCompact = Math.sin(time * 0.003 + x * 0.01 + y * 0.01) * 0.3 + 0.7;
      const colorShiftCompact = Math.sin(time * 0.002 + x * 0.005) * 0.2 + 0.8;
      
      const tcGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
      tcGradient.addColorStop(0, `rgba(255, ${255 * colorShiftCompact}, ${255 * colorShiftCompact}, ${opacity * twinkleCompact})`);
      tcGradient.addColorStop(0.4, `rgba(${255 * colorShiftCompact}, ${255 * colorShiftCompact}, 255, ${opacity * twinkleCompact * 0.7})`);
      tcGradient.addColorStop(0.8, `rgba(${200 * colorShiftCompact}, ${220 * colorShiftCompact}, 255, ${opacity * twinkleCompact * 0.2})`);
      tcGradient.addColorStop(1, `rgba(150, 180, 255, 0)`);
      
      ctx.fillStyle = tcGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'twinkle-minimal':
      // Minimal stars - very small
      const twinkleMinimal = Math.sin(time * 0.003 + x * 0.01 + y * 0.01) * 0.3 + 0.7;
      const colorShiftMinimal = Math.sin(time * 0.002 + x * 0.005) * 0.2 + 0.8;
      const minimalSize = size * 0.4;
      
      const tmGradient = ctx.createRadialGradient(x, y, 0, x, y, minimalSize * 1.2);
      tmGradient.addColorStop(0, `rgba(255, ${255 * colorShiftMinimal}, ${255 * colorShiftMinimal}, ${opacity * twinkleMinimal})`);
      tmGradient.addColorStop(0.5, `rgba(${255 * colorShiftMinimal}, ${255 * colorShiftMinimal}, 255, ${opacity * twinkleMinimal * 0.5})`);
      tmGradient.addColorStop(1, `rgba(${200 * colorShiftMinimal}, ${220 * colorShiftMinimal}, 255, 0)`);
      
      ctx.fillStyle = tmGradient;
      ctx.beginPath();
      ctx.arc(x, y, minimalSize * 1.2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'twinkle-pulse':
      // Size-pulsing stars
      const twinklePulse = Math.sin(time * 0.003 + x * 0.01 + y * 0.01) * 0.3 + 0.7;
      const colorShiftPulse = Math.sin(time * 0.002 + x * 0.005) * 0.2 + 0.8;
      const pulseSize = size * (0.5 + twinklePulse * 0.3); // Size varies with twinkle
      
      const tpGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 2);
      tpGradient.addColorStop(0, `rgba(255, ${255 * colorShiftPulse}, ${255 * colorShiftPulse}, ${opacity * twinklePulse})`);
      tpGradient.addColorStop(0.3, `rgba(${255 * colorShiftPulse}, ${255 * colorShiftPulse}, 255, ${opacity * twinklePulse * 0.6})`);
      tpGradient.addColorStop(0.6, `rgba(${200 * colorShiftPulse}, ${220 * colorShiftPulse}, 255, ${opacity * twinklePulse * 0.3})`);
      tpGradient.addColorStop(1, `rgba(150, 180, 255, 0)`);
      
      ctx.fillStyle = tpGradient;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
};

// Small Stars (60% base size, 2x glow)
const SmallStars = () => {
  const canvasRef = useStarField(4000, 1000, -1.5, 0.9, 'twinkle-small');

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="absolute top-6 left-6 text-white">
          <div className="text-2xl font-bold">SMALL STARS</div>
          <div className="text-sm text-gray-400">60% base size • 2x glow radius</div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-white px-8">
          <div className="text-center max-w-4xl">
            <h1 className="text-8xl font-bold mb-8 tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-300">
                REFINED
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Smaller twinkling stars with reduced base size and tighter glow radius. 
              Perfect for subtle background effects without overwhelming content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact Glow (normal size, 1.5x glow) - THE WINNER
const CompactGlow = () => {
  const canvasRef = useStarField(4000, 1000, -1.5, 0.9, 'twinkle-compact');

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="absolute top-6 left-6 text-white">
          <div className="text-2xl font-bold">COMPACT GLOW ⭐</div>
          <div className="text-sm text-gray-400">Normal size • 1.5x glow radius • WINNER</div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-white px-8">
          <div className="text-center max-w-4xl">
            <h1 className="text-8xl font-bold mb-8 tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-300">
                FOCUSED
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Twinkling stars with normal size but compact glow radius. 
              Maintains star visibility while reducing bloom effect. <strong>SELECTED FOR MAIN PAGE</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Minimal Stars (40% base size, 1.2x glow)
const MinimalStars = () => {
  const canvasRef = useStarField(4000, 1000, -1.5, 0.9, 'twinkle-minimal');

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="absolute top-6 left-6 text-white">
          <div className="text-2xl font-bold">MINIMAL STARS</div>
          <div className="text-sm text-gray-400">40% base size • 1.2x glow radius</div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-white px-8">
          <div className="text-center max-w-4xl">
            <h1 className="text-8xl font-bold mb-8 tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-300">
                DISTANT
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Very small twinkling stars that appear distant and subtle. 
              Perfect for backgrounds where stars should be barely noticeable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Size-Pulsing Stars (variable size)
const SizePulsingStars = () => {
  const canvasRef = useStarField(4000, 1000, -1.5, 0.9, 'twinkle-pulse');

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="absolute top-6 left-6 text-white">
          <div className="text-2xl font-bold">SIZE-PULSING</div>
          <div className="text-sm text-gray-400">Variable size • 2x glow radius</div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-white px-8">
          <div className="text-center max-w-4xl">
            <h1 className="text-8xl font-bold mb-8 tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-300">
                BREATHING
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Stars that pulse in size with their brightness variation. 
              Creates a breathing, living starfield with organic movement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Viewer Component
const DynamicStarsViewer = () => {
  const [currentVariant, setCurrentVariant] = useState(1); // Start with winner (Compact Glow)
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  const variants = [
    { name: 'Small Stars', component: SmallStars, description: '60% base size • Subtle twinkling background' },
    { name: 'Compact Glow ⭐', component: CompactGlow, description: 'Normal size • Tight glow • WINNER' },
    { name: 'Minimal Stars', component: MinimalStars, description: '40% base size • Ultra-subtle distant' },
    { name: 'Size-Pulsing', component: SizePulsingStars, description: 'Variable size • Breathing movement' },
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🌟 Dynamic Star Variations (Archived)
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              4 twinkling star variations • Compact Glow selected for main page
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`p-2 rounded ${viewMode === 'single' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
              >
                <Grid size={16} />
              </button>
            </div>

            {viewMode === 'single' && (
              <>
                <button
                  onClick={prevVariant}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
                  <div className="font-medium">
                    {variants[currentVariant].name} ({currentVariant + 1}/{variants.length})
                  </div>
                  <div className="text-xs">
                    {variants[currentVariant].description}
                  </div>
                </div>
                
                <button
                  onClick={nextVariant}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Variants Display */}
      {viewMode === 'single' ? (
        // Single View - Full screen
        <div className="h-screen">
          {React.createElement(variants[currentVariant].component)}
        </div>
      ) : (
        // Grid View - Show all variants in smaller panels
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4" style={{ height: 'calc(100vh - 120px)' }}>
            {variants.map((variant, index) => (
              <div key={index} className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700">
                <div className="p-3 bg-gray-800 border-b border-gray-700">
                  <h3 className="font-medium text-white">{variant.name}</h3>
                  <p className="text-sm text-gray-300">{variant.description}</p>
                </div>
                <div className="h-80 relative overflow-hidden">
                  <div className="transform scale-75 origin-top-left w-[133%] h-[133%]">
                    {React.createElement(variant.component)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicStarsViewer; 