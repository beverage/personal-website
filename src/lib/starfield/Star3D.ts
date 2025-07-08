export class Star3D {
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