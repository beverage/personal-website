'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Github, Linkedin, Mail, ExternalLink, Code, Server, Smartphone } from 'lucide-react';

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
    this.z = 10000 + Math.random() * 40000; // Uniform from 10000 to 50000
  }

  update(forwardSpeed: number, rollSpeed: number, deltaTime: number) {
    // Move forward through deep space
    this.z -= forwardSpeed * deltaTime;
    
    // Wrap when star passes close enough to go off-screen
    // Use threshold less than one frame of movement to ensure smooth cycling
    const wrapThreshold = 50; // Fixed small threshold
    if (this.z <= wrapThreshold) {
      const overshoot = wrapThreshold - this.z;
      this.z = 50000 + overshoot; // Maintains continuous flow
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

  project(screenWidth: number, screenHeight: number, focalLength = 800) {
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

// Custom star rendering function for main page
const renderMainPageStar = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number, 
  opacity: number, 
  time: number
) => {
  // Compact glow - normal size with tighter glow radius
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

// Background Starfield Component
const BackgroundStarField = ({ opacity = 0.3 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize stars
    const width = window?.innerWidth || 1920;
    const height = window?.innerHeight || 1080;
    starsRef.current = Array.from({ length: 3000 }, () => new Star3D(width, height));

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate delta time
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      // Clear canvas
      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and render stars
      starsRef.current.forEach(star => {
        star.update(800, 0.8, deltaTime); // Subtle speed for background
        
        const projected = star.project(canvas.width, canvas.height);
        if (projected.visible) {
          renderMainPageStar(ctx, projected.x, projected.y, projected.size, projected.opacity * opacity, currentTime);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        
        // Update star canvas dimensions
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

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%',
        zIndex: 0
      }}
    />
  );
};

const PortfolioStarter = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200 relative">
      {/* Background Starfield - only visible in dark mode */}
      {darkMode && <BackgroundStarField opacity={0.4} />}
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl">beverage.me</div>
            <div className="flex items-center space-x-6">
              <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
              <a href="#projects" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Projects</a>
              <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hello, I&apos;m Alex
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Backend developer expanding into frontend development. Building full-stack solutions with passion for clean code and great user experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                View My Work
              </button>
              <button className="px-8 py-3 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors font-medium">
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">About Me</h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                I&apos;m a backend developer with extensive experience in server-side technologies and mobile development. 
                Currently expanding my skillset into frontend development to build complete, end-to-end solutions.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                I believe in writing clean, maintainable code and creating solutions that not only work well but are 
                built to last. Always learning, always building.
              </p>
              <div className="flex flex-wrap gap-3">
                {['TypeScript', 'Node.js', 'React', 'Python', 'Docker', 'PostgreSQL'].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <Server className="mx-auto mb-4 text-blue-600" size={32} />
                <h3 className="font-semibold mb-2">Backend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Extensive experience</p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <Smartphone className="mx-auto mb-4 text-green-600" size={32} />
                <h3 className="font-semibold mb-2">Mobile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cross-platform development</p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <Code className="mx-auto mb-4 text-purple-600" size={32} />
                <h3 className="font-semibold mb-2">Frontend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Learning & building</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((project) => (
              <div key={project} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-2">Project {project}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Brief description of your project and the technologies used to build it. What problem does it solve?
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">React</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">TypeScript</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Node.js</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      <ExternalLink size={16} />
                      <span>Live Demo</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      <Github size={16} />
                      <span>Code</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Let&apos;s Connect</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            I&apos;m always interested in hearing about new opportunities and interesting projects.
          </p>
          <div className="flex justify-center gap-6">
            <a href="mailto:hello@beverage.me" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Mail size={20} />
              <span>Email Me</span>
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors">
              <Github size={20} />
              <span>GitHub</span>
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors">
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 relative z-10">
        <p>&copy; 2025 beverage.me. Built with Next.js and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default PortfolioStarter;