import { ARTarget, VisionDetectionStats } from '../types';

export interface MotionPoint {
  x: number;
  y: number;
  intensity: number;
}

export class VisionEngine {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private animationFrameId: number | null = null;

  private width: number = 160;
  private height: number = 120;
  private sensitivityThreshold: number = 28; // luminance difference threshold
  private motionTriggerThreshold: number = 0.08; // % of target area showing motion to trigger hit

  // Calibration & vertical tracking
  private baselineY: number = 50; // percentage
  private recentYValues: number[] = [];
  public stats: VisionDetectionStats = {
    motionIntensity: 0,
    bodyCenterY: 50,
    isJumping: false,
    isSquatting: false,
    fps: 0,
    trackingQuality: 'calibrating'
  };

  private lastTime: number = 0;
  private frameCount: number = 0;
  private onTargetHitCallback: ((targetId: string) => void) | null = null;
  private onJumpCallback: (() => void) | null = null;
  private onSquatCallback: (() => void) | null = null;

  public isSimulated: boolean = false;
  private activeTargets: ARTarget[] = [];
  private jumpCooldown: number = 0;
  private squatCooldown: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public setCallbacks(
    onHit: (targetId: string) => void,
    onJump?: () => void,
    onSquat?: () => void
  ) {
    this.onTargetHitCallback = onHit;
    this.onJumpCallback = onJump || null;
    this.onSquatCallback = onSquat || null;
  }

  public setActiveTargets(targets: ARTarget[]) {
    this.activeTargets = targets.filter(t => !t.hit);
  }

  public setSensitivity(level: 'low' | 'medium' | 'high') {
    if (level === 'low') {
      this.sensitivityThreshold = 38;
      this.motionTriggerThreshold = 0.12;
    } else if (level === 'medium') {
      this.sensitivityThreshold = 28;
      this.motionTriggerThreshold = 0.08;
    } else {
      this.sensitivityThreshold = 18;
      this.motionTriggerThreshold = 0.05;
    }
  }

  public async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: 'user' | 'environment' = 'user'
  ): Promise<boolean> {
    this.stop();
    this.video = videoElement;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      this.video.srcObject = stream;
      await this.video.play();
      this.isSimulated = false;
      this.stats.trackingQuality = 'optimal';
      this.startProcessingLoop();
      return true;
    } catch (err) {
      console.warn('Camera access error or denied, falling back to interactive simulation:', err);
      this.isSimulated = true;
      this.stats.trackingQuality = 'simulated';
      this.startSimulatedLoop();
      return false;
    }
  }

  public startSimulatedMode() {
    this.stop();
    this.isSimulated = true;
    this.stats.trackingQuality = 'simulated';
    this.startSimulatedLoop();
  }

  private startProcessingLoop() {
    this.lastTime = performance.now();
    this.frameCount = 0;

    const loop = () => {
      this.processFrame();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private processFrame() {
    if (!this.video || !this.ctx || this.video.readyState < 2) return;

    // Measure FPS
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastTime >= 1000) {
      this.stats.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }

    // Draw video to downscaled canvas (mirrored horizontally if front facing)
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
    const frame = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = frame.data;
    const length = data.length;

    if (!this.prevFrameData) {
      this.prevFrameData = new Uint8ClampedArray(length);
      this.prevFrameData.set(data);
      return;
    }

    let totalMovingPixels = 0;
    let sumY = 0;
    const movingMap = new Uint8Array(this.width * this.height);

    // Frame differencing
    for (let i = 0; i < length; i += 4) {
      const rDiff = Math.abs(data[i] - this.prevFrameData[i]);
      const gDiff = Math.abs(data[i + 1] - this.prevFrameData[i + 1]);
      const bDiff = Math.abs(data[i + 2] - this.prevFrameData[i + 2]);
      const delta = (rDiff + gDiff + bDiff) / 3;

      const pixelIdx = i / 4;
      if (delta > this.sensitivityThreshold) {
        movingMap[pixelIdx] = 1;
        totalMovingPixels++;
        const py = Math.floor(pixelIdx / this.width);
        sumY += py;
      }
    }

    // Copy current frame to previous
    this.prevFrameData.set(data);

    // Update motion intensity
    const totalPixels = this.width * this.height;
    const motionRatio = totalMovingPixels / totalPixels;
    this.stats.motionIntensity = Math.min(100, Math.round(motionRatio * 500));

    // Calculate vertical centroid
    if (totalMovingPixels > 50) {
      const avgY = (sumY / totalMovingPixels / this.height) * 100;
      this.recentYValues.push(avgY);
      if (this.recentYValues.length > 8) this.recentYValues.shift();

      const smoothedY = this.recentYValues.reduce((a, b) => a + b, 0) / this.recentYValues.length;
      this.stats.bodyCenterY = smoothedY;

      // Jump & Squat detection logic
      const nowMs = Date.now();
      if (this.jumpCooldown < nowMs && smoothedY < this.baselineY - 14) {
        this.stats.isJumping = true;
        this.jumpCooldown = nowMs + 1000;
        if (this.onJumpCallback) this.onJumpCallback();
        setTimeout(() => { this.stats.isJumping = false; }, 350);
      }

      if (this.squatCooldown < nowMs && smoothedY > this.baselineY + 16) {
        this.stats.isSquatting = true;
        this.squatCooldown = nowMs + 1000;
        if (this.onSquatCallback) this.onSquatCallback();
        setTimeout(() => { this.stats.isSquatting = false; }, 350);
      }
    }

    // Check Active Targets Collision via motion in target bounds
    for (const target of this.activeTargets) {
      // Convert target % coordinate to internal canvas coordinates
      // Note: Video is mirrored in UI, so coordinate matching corresponds to screen coordinate
      const targetCanvasX = Math.round((target.x / 100) * this.width);
      const targetCanvasY = Math.round((target.y / 100) * this.height);
      const targetCanvasR = Math.max(3, Math.round((target.radius / 100) * this.width));

      const minX = Math.max(0, targetCanvasX - targetCanvasR);
      const maxX = Math.min(this.width - 1, targetCanvasX + targetCanvasR);
      const minY = Math.max(0, targetCanvasY - targetCanvasR);
      const maxY = Math.min(this.height - 1, targetCanvasY + targetCanvasR);

      let targetAreaPixels = 0;
      let targetMovingPixels = 0;

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dx = x - targetCanvasX;
          const dy = y - targetCanvasY;
          if (dx * dx + dy * dy <= targetCanvasR * targetCanvasR) {
            targetAreaPixels++;
            if (movingMap[y * this.width + x] === 1) {
              targetMovingPixels++;
            }
          }
        }
      }

      if (targetAreaPixels > 0) {
        const targetMotionRatio = targetMovingPixels / targetAreaPixels;
        if (targetMotionRatio >= this.motionTriggerThreshold) {
          if (this.onTargetHitCallback) {
            this.onTargetHitCallback(target.id);
          }
        }
      }
    }
  }

  // Simulated loop for devices without webcam or classroom preview
  private startSimulatedLoop() {
    let simY = 50;
    let t = 0;
    const loop = () => {
      t += 0.05;
      simY = 50 + Math.sin(t) * 8;
      this.stats.bodyCenterY = simY;
      this.stats.motionIntensity = 35 + Math.round(Math.abs(Math.sin(t * 2)) * 30);
      this.stats.fps = 60;
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public simulateHit(targetId: string) {
    if (this.onTargetHitCallback) {
      this.onTargetHitCallback(targetId);
    }
  }

  public calibrateBaseline() {
    if (this.recentYValues.length > 0) {
      this.baselineY = this.stats.bodyCenterY;
    } else {
      this.baselineY = 50;
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.video && this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.prevFrameData = null;
  }
}

export const visionEngine = new VisionEngine();
