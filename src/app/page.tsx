'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Github, Linkedin, Mail } from 'lucide-react';

// 3D Star class for background starfield
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

// Starfield rendering function
const renderStar = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number, 
  opacity: number, 
  time: number
) => {
  const twinkle = Math.sin(time * 0.003 + x * 0.01 + y * 0.01) * 0.3 + 0.7;
  const colorShift = Math.sin(time * 0.002 + x * 0.005) * 0.2 + 0.8;
  
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
  gradient.addColorStop(0, `rgba(255, ${255 * colorShift}, ${255 * colorShift}, ${opacity * twinkle})`);
  gradient.addColorStop(0.4, `rgba(${255 * colorShift}, ${255 * colorShift}, 255, ${opacity * twinkle * 0.7})`);
  gradient.addColorStop(0.8, `rgba(${200 * colorShift}, ${220 * colorShift}, 255, ${opacity * twinkle * 0.2})`);
  gradient.addColorStop(1, `rgba(150, 180, 255, 0)`);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
  ctx.fill();
};

// Starfield Background Hook
const useStarField = (opacity: number = 0.8) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const width = window?.innerWidth || 1920;
    const height = window?.innerHeight || 1080;
    starsRef.current = Array.from({ length: 4000 }, () => new Star3D(width, height));

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      // If tab was inactive for a while, clamp deltaTime to prevent a huge visual jump.
      if (deltaTime > 0.1) {
        deltaTime = 0.1;
      }
      lastTimeRef.current = currentTime;

      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        star.update(1000, -1.5, deltaTime);
        
        const projected = star.project(canvas.width, canvas.height);
        if (projected.visible) {
          renderStar(ctx, projected.x, projected.y, projected.size, projected.opacity * opacity, currentTime);
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
  }, [opacity]);

  return canvasRef;
};

// Main Home Page Component
const HomePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const canvasRef = useStarField(1.0);
  
  useEffect(() => { 
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode); 
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
      
      <div className="absolute top-8 left-8 z-50">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
          <div className="font-bold text-white">beverage.me</div>
        </div>
      </div>
      
      <div className="absolute top-8 right-8 z-50">
        <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full hover:bg-black/30 transition-all">
          <Sun size={20} />
        </button>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-5xl">
          <div className="p-12 mb-8">
            <h1 className="text-6xl sm:text-8xl font-bold mb-6 tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Coming Soon</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Finally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 border border-cyan-400 text-cyan-300 rounded-lg transition-all font-medium hover:bg-cyan-400/10">
                Explore Projects
              </button>
              <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/50">
                Get In Touch
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
          <div className="flex items-center space-x-6">
            <div className="text-white/60 text-sm">© 2025</div>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors"><Github size={18} /></a>
              <a href="#" className="text-white/60 hover:text-white transition-colors"><Linkedin size={18} /></a>
              <a href="#" className="text-white/60 hover:text-white transition-colors"><Mail size={18} /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 