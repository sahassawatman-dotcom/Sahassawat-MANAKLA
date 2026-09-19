import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Award, Flame, Zap, Timer, HeartPulse, CheckCircle2 } from 'lucide-react';
import { ARTarget, GameScoreResult, StudentProfile } from '../../types';
import { CameraView } from '../CameraView';
import { sound } from '../../utils/audio';

interface AgilityModeProps {
  activeStudent: StudentProfile | null;
  onFinishGame: (result: GameScoreResult) => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
}

export const AgilityMode: React.FC<AgilityModeProps> = ({
  activeStudent,
  onFinishGame,
  isSimulated,
  onToggleSimulated,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(35);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [jumps, setJumps] = useState(0);
  const [squats, setSquats] = useState(0);
  const [targets, setTargets] = useState<ARTarget[]>([]);

  const gameTimerRef = useRef<number | null>(null);
  const targetSpawnerRef = useRef<number | null>(null);
  const lastTargetSpawnTime = useRef<number>(Date.now());

  // Spawn dynamic target in AR room
  const spawnTarget = useCallback(() => {
    const id = `target-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    // Random position avoiding extreme edges
    const x = 18 + Math.random() * 64;
    const y = 20 + Math.random() * 60;

    // Decide type: 70% standard, 15% bonus, 15% hazard
    const rand = Math.random();
    let type: ARTarget['type'] = 'standard';
    let color = '#06b6d4'; // cyan
    let value = 100;
    let requiredAction: ARTarget['requiredAction'] = 'touch';

    if (rand < 0.15) {
      type = 'hazard';
      color = '#ef4444'; // red
      value = -80;
    } else if (rand < 0.35) {
      type = 'bonus';
      color = '#eab308'; // gold
      value = 250;
      requiredAction = y < 40 ? 'jump' : 'touch';
    } else {
      // Standard target
      if (y > 65) requiredAction = 'squat';
      else if (x < 35) requiredAction = 'left_hand';
      else if (x > 65) requiredAction = 'right_hand';
    }

    const newTarget: ARTarget = {
      id,
      x,
      y,
      radius: type === 'bonus' ? 12 : 10,
      type,
      color,
      activeTime: Date.now(),
      duration: 2600, // lives for 2.6 seconds
      value,
      hit: false,
      requiredAction
    };

    setTargets(prev => [...prev.filter(t => !t.hit).slice(-3), newTarget]);
    lastTargetSpawnTime.current = Date.now();
  }, []);

  // Start game with 3-second coach countdown
  const startCountdown = () => {
    setCountdown(3);
    sound.playWhistle();

    let count = 3;
    const countTimer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        sound.playBeep(false);
        setCountdown(count);
      } else if (count === 0) {
        sound.playBeep(true);
        setCountdown(null);
        clearInterval(countTimer);
        startGame();
      }
    }, 1000);
  };

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(35);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setJumps(0);
    setSquats(0);
    setTargets([]);

    // Spawn first target immediately
    spawnTarget();

    // Spawner interval
    targetSpawnerRef.current = window.setInterval(() => {
      spawnTarget();
    }, 1200);

    // Main game countdown timer
    gameTimerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (targetSpawnerRef.current) clearInterval(targetSpawnerRef.current);
    setTargets([]);
    sound.playFanfare();

    // Calculate score, accuracy, and feedback
    const totalAttempts = hits + misses;
    const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
    const avgReactionTimeMs = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
      : 850;
    const caloriesBurned = Math.round((hits * 0.8) + (jumps * 1.5) + (squats * 1.2) + 6);

    let gradeEvaluation: GameScoreResult['gradeEvaluation'] = 'ต้องปรับปรุง (Needs Work)';
    let feedback = '';

    if (score >= 1800 || (hits >= 18 && accuracy >= 80)) {
      gradeEvaluation = 'ยอดเยี่ยม (Excellent)';
      feedback = 'ปฏิกิริยาการตอบสนองและความคล่องตัวสูงมาก อยู่ในเกณฑ์ดีเลิศของระดับชั้น มีสมาธิในการหลบหลีกสิ่งกีดขวางได้แม่นยำ!';
    } else if (score >= 1100 || (hits >= 12 && accuracy >= 65)) {
      gradeEvaluation = 'ดี (Good)';
      feedback = 'ความคล่องแคล่วว่องไวอยู่ในเกณฑ์มาตรฐาน พยายามเพิ่มการเคลื่อนไหวช่วงล่าง (ย่อตัวและกระโดด) ให้รวดเร็วขึ้นอีกเล็กน้อย';
    } else if (score >= 600) {
      gradeEvaluation = 'ปานกลาง (Average)';
      feedback = 'สามารถรับรู้ตำแหน่งเป้าหมายได้ดี ฝึกฝนการก้าวเท้าและการทรงตัว (Footwork) เพื่อลดเวลาปฏิกิริยาตอบสนอง';
    } else {
      gradeEvaluation = 'ต้องปรับปรุง (Needs Work)';
      feedback = 'ควรฝึกการประสานสัมพันธ์ระหว่างสายตากับมือ (Hand-Eye Coordination) และการเตรียมพร้อมในท่ายืนขั้นพื้นฐาน';
    }

    onFinishGame({
      score,
      hits,
      misses,
      accuracy,
      avgReactionTimeMs,
      caloriesBurned,
      jumpsCount: jumps,
      squatsCount: squats,
      gradeEvaluation,
      pedagogicalFeedback: feedback,
      timestamp: new Date().toLocaleTimeString('th-TH')
    });
  }, [hits, misses, jumps, squats, score, reactionTimes, onFinishGame]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (targetSpawnerRef.current) clearInterval(targetSpawnerRef.current);
    };
  }, []);

  // Handle target hit detection
  const handleTargetHit = (targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (!target || target.hit) return;

    const reactionTime = Date.now() - target.activeTime;

    // Mark as hit
    setTargets(prev => prev.map(t => t.id === targetId ? { ...t, hit: true } : t));

    if (target.type === 'hazard') {
      sound.playError();
      setScore(s => Math.max(0, s + target.value));
      setCombo(0);
      setMisses(m => m + 1);
    } else {
      const isBonus = target.type === 'bonus';
      const comboMultiplier = 1 + Math.floor(combo / 3) * 0.2;
      const pointsEarned = Math.round(target.value * comboMultiplier);

      if (isBonus) sound.playCorrect();
      else sound.playHit(combo + 1);

      setScore(s => s + pointsEarned);
      setHits(h => h + 1);
      setCombo(c => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setReactionTimes(r => [...r, reactionTime]);
    }
  };

  const handleJump = () => {
    setJumps(j => j + 1);
    setScore(s => s + 40);
  };

  const handleSquat = () => {
    setSquats(sq => sq + 1);
    setScore(s => s + 40);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Game Header Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-900/80 border border-slate-800 p-3 sm:px-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>ทดสอบความคล่องแคล่ว & ปฏิกิริยาตอบสนอง</span>
              <span className="text-xs font-normal text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                มาตรฐาน พ 3.1
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              แตะเป้าหมายสีฟ้า/ทองในอากาศ หลีกเลี่ยงเป้าสีแดง ย่อตัวหรือกระโดดตามคำสั่ง
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center">
            <span className="text-[11px] text-slate-400 block uppercase">เวลา</span>
            <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-400 block uppercase">คะแนน</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {score}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-400 block uppercase">คอมโบ</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {combo}x
            </span>
          </div>

          {!isPlaying && countdown === null && (
            <button
              onClick={startCountdown}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>เริ่มกิจกรรม</span>
            </button>
          )}

          {isPlaying && (
            <button
              onClick={endGame}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>หยุด</span>
            </button>
          )}
        </div>
      </div>

      {/* AR Camera & Targets Stage */}
      <div className="w-full max-w-5xl">
        <CameraView
          targets={targets}
          onTargetHit={handleTargetHit}
          onJump={handleJump}
          onSquat={handleSquat}
          countdown={countdown}
          isPlaying={isPlaying}
          gameTitle="Agility Reflex Arena"
          currentCombo={combo}
          isSimulated={isSimulated}
          onToggleSimulated={onToggleSimulated}
          instructionText="ขยับร่างกายหรือเอื้อมมือแตะเป้าหมายที่ปรากฏในอากาศ!"
        />
      </div>

      {/* Real-time PE Classroom Stats Strip */}
      <div className="w-full max-w-5xl mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">สัมผัสสำเร็จ (Hits)</span>
            <span className="font-bold text-white text-sm">{hits} ครั้ง</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
          <Timer className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">เวลาตอบสนองเฉลี่ย</span>
            <span className="font-bold text-white text-sm">
              {reactionTimes.length > 0 
                ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
                : '--'} ms
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-orange-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">การเคลื่อนที่แนวตั้ง</span>
            <span className="font-bold text-white text-sm">
              กระโดด {jumps} | ย่อ {squats}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
          <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">พลังงานที่ใช้โดยประมาณ</span>
            <span className="font-bold text-white text-sm">
              {Math.round((hits * 0.8) + (jumps * 1.5) + (squats * 1.2))} kcal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
