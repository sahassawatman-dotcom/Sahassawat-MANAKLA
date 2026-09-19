import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Zap, 
  Sparkles, 
  Sliders, 
  Flame, 
  ChevronUp, 
  ChevronDown,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { ARTarget, VisionDetectionStats } from '../types';
import { visionEngine } from '../utils/visionEngine';
import { sound } from '../utils/audio';

interface HitParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface CameraViewProps {
  targets: ARTarget[];
  onTargetHit: (targetId: string) => void;
  onJump?: () => void;
  onSquat?: () => void;
  countdown: number | null;
  isPlaying: boolean;
  gameTitle?: string;
  currentCombo?: number;
  isSimulated: boolean;
  onToggleSimulated: () => void;
  instructionText?: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  targets,
  onTargetHit,
  onJump,
  onSquat,
  countdown,
  isPlaying,
  gameTitle,
  currentCombo = 0,
  isSimulated,
  onToggleSimulated,
  instructionText
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stats, setStats] = useState<VisionDetectionStats>(visionEngine.stats);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [sensitivity, setSensitivityState] = useState<'low' | 'medium' | 'high'>('medium');
  const particlesRef = useRef<HitParticle[]>([]);

  // Setup Vision Engine callbacks & targets
  useEffect(() => {
    visionEngine.setCallbacks(
      (targetId) => {
        // Trigger particle burst at target
        const hitTarget = targets.find(t => t.id === targetId);
        if (hitTarget) {
          createParticleBurst(hitTarget.x, hitTarget.y, hitTarget.color);
        }
        onTargetHit(targetId);
      },
      onJump,
      onSquat
    );
  }, [targets, onTargetHit, onJump, onSquat]);

  useEffect(() => {
    visionEngine.setActiveTargets(targets);
  }, [targets]);

  // Spawn particle sparks when target is hit
  const createParticleBurst = (x: number, y: number, color: string) => {
    const newParticles: HitParticle[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        id: Math.random(),
        x,
        y,
        color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 20 + Math.random() * 15
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  // Initialize Camera
  const initCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);

    if (isSimulated) {
      visionEngine.startSimulatedMode();
      setIsInitializing(false);
      return;
    }

    if (videoRef.current) {
      const success = await visionEngine.startCamera(videoRef.current, facingMode);
      if (!success) {
        setCameraError('ไม่สามารถเข้าถึงกล้องได้ ระบบจะใช้โหมดจำลอง (Interactive Simulation) เพื่อให้สามารถเล่นได้ทันที');
      }
    }
    setIsInitializing(false);
  }, [isSimulated, facingMode]);

  useEffect(() => {
    initCamera();
    return () => {
      visionEngine.stop();
    };
  }, [initCamera]);

  // Loop for stats and canvas particle overlay
  useEffect(() => {
    let animId: number;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas?.getContext('2d');

    const renderLoop = () => {
      setStats({ ...visionEngine.stats });

      // Render particles on canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        if (particlesRef.current.length > 0) {
          particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
          for (const p of particlesRef.current) {
            p.x += (p.vx * 0.1);
            p.y += (p.vy * 0.1);
            p.life++;

            const alpha = 1 - p.life / p.maxLife;
            const px = (p.x / 100) * canvas.width;
            const py = (p.y / 100) * canvas.height;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color || '#38bdf8';
            ctx.beginPath();
            ctx.arc(px, py, 4 * alpha + 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle direct click/touch on target
  const handleTargetClick = (target: ARTarget) => {
    if (target.hit) return;
    createParticleBurst(target.x, target.y, target.color);
    visionEngine.simulateHit(target.id);
  };

  const handleSensitivityChange = (newSens: 'low' | 'medium' | 'high') => {
    setSensitivityState(newSens);
    visionEngine.setSensitivity(newSens);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[72vh] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl shadow-cyan-950/40 select-none flex items-center justify-center"
      id="ar-camera-stage"
    >
      {/* Video Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover ${
          facingMode === 'user' ? '-scale-x-100' : ''
        } ${isSimulated ? 'hidden' : 'block'}`}
      />

      {/* Simulated Virtual Gym Backdrop if Camera is off or simulated */}
      {isSimulated && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 flex items-center justify-center overflow-hidden">
          {/* Virtual Gymnasium 3D Grid Lines */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Simulated Body Silhouette for demo */}
          <div className="relative flex flex-col items-center justify-center opacity-30 animate-pulse">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-400/60 mb-2" />
            <div className="w-44 h-64 rounded-3xl border-4 border-cyan-400/60" />
            <span className="text-cyan-300 text-xs font-semibold mt-3 tracking-widest uppercase">
              หุ่นจำลองตำแหน่งผู้เรียน (Simulated Student)
            </span>
          </div>

          <div className="absolute top-4 left-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>โหมดจำลองเสมือนจริง: สามารถใช้เมาส์หรือการแตะหน้าจอเพื่อสัมผัสเป้าหมาย AR ได้ทันที</span>
          </div>
        </div>
      )}

      {/* Particle Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Real-time AR Target Objects in 3D Space */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {targets.map((target) => {
          if (target.hit) return null;

          return (
            <div
              key={target.id}
              onClick={() => handleTargetClick(target)}
              className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 active:scale-90"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
              }}
              title={target.label || 'เป้าหมาย AR'}
            >
              {/* Outer Pulsing Glow Wave */}
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-60"
                style={{
                  backgroundColor: target.color,
                  margin: '-12px'
                }}
              />

              {/* Main Interactive AR Node */}
              <div
                className="relative flex flex-col items-center justify-center rounded-full border-3 shadow-xl backdrop-blur-md transition-all hover:scale-110"
                style={{
                  width: `${Math.max(64, target.radius * 7)}px`,
                  height: `${Math.max(64, target.radius * 7)}px`,
                  backgroundColor: `${target.color}33`,
                  borderColor: target.color,
                  boxShadow: `0 0 25px ${target.color}88`
                }}
              >
                {/* Target Type Icon or Value */}
                {target.type === 'hazard' ? (
                  <span className="text-xl">⚠️</span>
                ) : target.type === 'bonus' ? (
                  <Sparkles className="w-7 h-7 text-yellow-300 animate-spin" />
                ) : target.label ? (
                  <span className="text-sm font-bold text-white px-1 text-center line-clamp-2 leading-tight">
                    {target.label}
                  </span>
                ) : (
                  <span className="text-lg font-extrabold text-white">
                    +{target.value}
                  </span>
                )}

                {/* Sub-label for actions */}
                {target.requiredAction && (
                  <span className="absolute -bottom-5 bg-slate-900/90 text-cyan-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-cyan-500/40 whitespace-nowrap">
                    {target.requiredAction === 'jump' && 'กระโดด!'}
                    {target.requiredAction === 'squat' && 'ย่อตัว!'}
                    {target.requiredAction === 'touch' && 'สัมผัส!'}
                    {target.requiredAction === 'left_hand' && 'มือซ้าย'}
                    {target.requiredAction === 'right_hand' && 'มือขวา'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motion & Biometric HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none text-xs">
        {/* Left: Motion Energy Bar */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 pointer-events-auto">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-slate-400 hidden sm:inline">พลังงานการเคลื่อนไหว:</span>
          <div className="w-24 sm:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-orange-500 transition-all duration-150"
              style={{ width: `${stats.motionIntensity}%` }}
            />
          </div>
          <span className="font-bold text-cyan-300 text-xs">{stats.motionIntensity}%</span>
        </div>

        {/* Center: Instruction Banner */}
        {instructionText && (
          <div className="hidden md:flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 px-4 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{instructionText}</span>
          </div>
        )}

        {/* Right: Camera Quality & Sensitivity Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Jump / Squat Real-time Indicator */}
          {stats.isJumping && (
            <div className="flex items-center gap-1 bg-yellow-500 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow-lg animate-bounce">
              <ChevronUp className="w-4 h-4" />
              <span>JUMP!</span>
            </div>
          )}
          {stats.isSquatting && (
            <div className="flex items-center gap-1 bg-teal-400 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow-lg animate-bounce">
              <ChevronDown className="w-4 h-4" />
              <span>SQUAT!</span>
            </div>
          )}

          {/* Combo Badge */}
          {currentCombo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-red-500 text-white font-black px-2.5 py-1 rounded-xl shadow-lg animate-pulse">
              <Zap className="w-3.5 h-3.5" />
              <span>COMBO x{currentCombo}</span>
            </div>
          )}

          {/* Sensitivity Selector */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl px-2 py-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>ความไว:</span>
            {(['low', 'medium', 'high'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleSensitivityChange(lvl)}
                className={`px-1.5 py-0.5 rounded ${
                  sensitivity === lvl 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl === 'low' ? 'ต่ำ' : lvl === 'medium' ? 'กลาง' : 'สูง'}
              </button>
            ))}
          </div>

          {/* Toggle Camera Facing Mode (Front / Rear for tablet) */}
          {!isSimulated && (
            <button
              onClick={() => {
                setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
              }}
              className="p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 hover:text-white"
              title="สลับกล้องหน้า/หลัง"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Countdown Big Display Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
          <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-blue-500 to-indigo-600 drop-shadow-[0_0_35px_rgba(56,189,248,0.6)] animate-bounce">
            {countdown}
          </span>
          <p className="text-lg font-bold text-cyan-200 mt-4 tracking-wider uppercase">
            เตรียมพร้อมร่างกายในเฟรมกล้อง!
          </p>
        </div>
      )}

      {/* Camera Access Error Notification */}
      {cameraError && !isSimulated && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-40">
          <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">ต้องการการเข้าถึงกล้อง</h3>
          <p className="text-sm text-slate-300 max-w-md mb-4">{cameraError}</p>
          <div className="flex gap-3">
            <button
              onClick={initCamera}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition"
            >
              ลองเปิดกล้องใหม่อีกครั้ง
            </button>
            <button
              onClick={onToggleSimulated}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl border border-slate-700 transition"
            >
              ใช้งานโหมดจำลอง (Interactive Touch/Mouse)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
