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

  constructor(canvasWidth = 1920, canvasHeight = 1080) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.intensity = Math.random() * 0.7 + 0.3; // Random brightness 0.3-1.0
    this.reset();
  }

  updateCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  reset() {
    // Use max dimension to avoid black triangles during rotation
    const maxDimension = Math.max(this.canvasWidth, this.canvasHeight);
    const scaleFactor = maxDimension / 800; // Scale based on view size
    
    // Distribute stars widely enough for edge-to-edge coverage
    this.x = (Math.random() - 0.5) * 120000 * scaleFactor;
    this.y = (Math.random() - 0.5) * 120000 * scaleFactor;  
    
    // UNIFORM distribution along z-axis - this is key!
    this.z = Math.random() * 50000; // Uniform from 10000 to 50000
  }

  update(forwardSpeed: number, rollSpeed: number, deltaTime: number) {
    // Move forward through deep space
    this.z -= forwardSpeed * deltaTime;
    
    // Wrap when star passes close enough to go off-screen
    // Use threshold less than one frame of movement to ensure smooth cycling
    if (this.z <= 0) {
      this.z = 50000;
      const maxDimension = Math.max(this.canvasWidth, this.canvasHeight);
      const scaleFactor = maxDimension / 800;
      this.x = (Math.random() - 0.5) * 120000 * scaleFactor;
      this.y = (Math.random() - 0.5) * 120000 * scaleFactor;
    }

    // Apply gentle roll rotation around z-axis
    const rollAngle = rollSpeed * deltaTime * Math.PI / 180;
    const cos = Math.cos(rollAngle);
    const sin = Math.sin(rollAngle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
  }

  project(screenWidth: number, screenHeight: number, focalLength = 100) {
    // Perspective projection for distant stars
    const screenX = screenWidth / 2 + (this.x / this.z) * focalLength;
    const screenY = screenHeight / 2 + (this.y / this.z) * focalLength;
    
    // Stars remain small pinpoints - very subtle size variation
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

// Variant 1: Slow Cruise
const StarField3D1 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initialize stars
    starsRef.current = Array.from({ length: 2000 }, () => new Star3D());

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate delta time
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      // Clear canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and render stars
      starsRef.current.forEach(star => {
        star.update(1000, 1.5, deltaTime); // Very slow: 10 units/sec forward, 0.1°/sec roll
        
        const projected = star.project(canvas.width, canvas.height);
        if (projected.visible) {
          ctx.fillStyle = `rgba(255, 255, 255, ${projected.opacity})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
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
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        Deep Space Drift: 10 units/sec forward, 0.1°/sec roll
      </div>
    </div>
  );
};

// Variant 2: Medium Speed
const StarField3D2 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    starsRef.current = Array.from({ length: 500 }, () => new Star3D());

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        star.update(25, 0.25, deltaTime); // Gentle: 25 units/sec forward, 0.25°/sec roll
        
        const projected = star.project(canvas.width, canvas.height);
        if (projected.visible) {
          ctx.fillStyle = `rgba(255, 255, 255, ${projected.opacity})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
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
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        Gentle Cruise: 25 units/sec forward, 0.25°/sec roll
      </div>
    </div>
  );
};

// Variant 3: Fast Travel
const StarField3D3 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    starsRef.current = Array.from({ length: 500 }, () => new Star3D());

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        star.update(50, 0.5, deltaTime); // Moderate: 50 units/sec forward, 0.5°/sec roll
        
        const projected = star.project(canvas.width, canvas.height);
        if (projected.visible) {
          ctx.fillStyle = `rgba(255, 255, 255, ${projected.opacity})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
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
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        Moderate Travel: 50 units/sec forward, 0.5°/sec roll
      </div>
    </div>
  );
};

// Variant 4: Warp Speed
const StarField3D4 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    starsRef.current = Array.from({ length: 500 }, () => new Star3D());

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        star.update(100, 1, deltaTime); // Brisk: 100 units/sec forward, 1°/sec roll
        
        const projected = star.project(canvas.width, canvas.height);
        if (projected.visible) {
          ctx.fillStyle = `rgba(255, 255, 255, ${projected.opacity})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
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
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        Brisk Travel: 100 units/sec forward, 1°/sec roll
      </div>
    </div>
  );
};

// Main Viewer Component
const True3DStarFieldViewer = () => {
  const [currentVariant, setCurrentVariant] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  // Check if we're in development
  const isProduction = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';

  if (isProduction) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-gray-600 dark:text-gray-300">Page not found</p>
        </div>
      </div>
    );
  }

  const variants = [
    { name: 'Deep Space Drift', component: StarField3D1 },
    { name: 'Gentle Cruise', component: StarField3D2 },
    { name: 'Moderate Travel', component: StarField3D3 },
    { name: 'Brisk Travel', component: StarField3D4 },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            True 3D Star Field Motion
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
      {viewMode === 'single' ? (
        // Single View - Full screen star field
        <div className="h-screen">
          {React.createElement(variants[currentVariant].component)}
        </div>
      ) : (
        // Grid View - Show all variants in smaller panels
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 h-screen">
            {variants.map((variant, index) => (
              <div key={index} className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700">
                <div className="p-3 bg-gray-800 border-b border-gray-700">
                  <h3 className="font-medium text-white">{variant.name}</h3>
                </div>
                <div className="h-64 relative overflow-hidden">
                  {React.createElement(variant.component)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default True3DStarFieldViewer;