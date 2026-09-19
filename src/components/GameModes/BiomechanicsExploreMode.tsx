import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, Play, ArrowRight, ShieldAlert, Award, Sparkles, Activity } from 'lucide-react';
import { ARTarget, GameScoreResult, StudentProfile } from '../../types';
import { CameraView } from '../CameraView';
import { BIOMECHANICS_STRETCHES, BiomechanicsMuscle } from '../../data/curriculum';
import { sound } from '../../utils/audio';

interface BiomechanicsExploreModeProps {
  activeStudent: StudentProfile | null;
  onFinishGame: (result: GameScoreResult) => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
}

export const BiomechanicsExploreMode: React.FC<BiomechanicsExploreModeProps> = ({
  activeStudent,
  onFinishGame,
  isSimulated,
  onToggleSimulated,
}) => {
  const [stretchIndex, setStretchIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdTimer, setHoldTimer] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [targets, setTargets] = useState<ARTarget[]>([]);
  const [completedStretches, setCompletedStretches] = useState<string[]>([]);

  const currentStretch: BiomechanicsMuscle = BIOMECHANICS_STRETCHES[stretchIndex % BIOMECHANICS_STRETCHES.length];

  // Set AR target onto the muscle anatomical region
  useEffect(() => {
    const target: ARTarget = {
      id: `muscle-${currentStretch.id}`,
      x: currentStretch.targetArea.x,
      y: currentStretch.targetArea.y,
      radius: 14,
      type: 'body_zone',
      label: currentStretch.nameThai,
      color: '#a855f7', // purple
      activeTime: Date.now(),
      duration: 30000,
      value: 100,
      hit: false,
      requiredAction: 'touch'
    };
    setTargets([target]);
    setIsHolding(false);
    setHoldTimer(10);
    setIsCompleted(false);
  }, [stretchIndex, currentStretch]);

  // Hold timer countdown when stretching
  useEffect(() => {
    let interval: number;
    if (isHolding && holdTimer > 0) {
      interval = window.setInterval(() => {
        setHoldTimer(prev => {
          if (prev <= 1) {
            handleHoldComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHolding, holdTimer]);

  const handleStartHold = () => {
    setIsHolding(true);
    sound.playWhistle();
  };

  const handleHoldComplete = () => {
    setIsHolding(false);
    setIsCompleted(true);
    sound.playFanfare();
    if (!completedStretches.includes(currentStretch.id)) {
      setCompletedStretches(prev => [...prev, currentStretch.id]);
    }
  };

  const nextStretch = () => {
    if (stretchIndex + 1 < BIOMECHANICS_STRETCHES.length) {
      setStretchIndex(i => i + 1);
    } else {
      finishExploration();
    }
  };

  const finishExploration = () => {
    sound.playFanfare();
    onFinishGame({
      score: 1200,
      hits: BIOMECHANICS_STRETCHES.length,
      misses: 0,
      accuracy: 100,
      avgReactionTimeMs: 650,
      caloriesBurned: 22,
      jumpsCount: 1,
      squatsCount: 4,
      gradeEvaluation: 'ยอดเยี่ยม (Excellent)',
      pedagogicalFeedback: 'สำรวจและยืดเหยียดกล้ามเนื้อครบทุกกลุ่มสำคัญตามหลักชีวกลศาสตร์ (Biomechanics) ได้อย่างถูกต้อง ช่วยลดความเสี่ยงการบาดเจ็บพร้อมสำหรับการเล่นกีฬา!',
      timestamp: new Date().toLocaleTimeString('th-TH')
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Biomechanics Header */}
      <div className="w-full max-w-5xl mb-3 bg-slate-900/90 border border-purple-500/30 p-3 sm:px-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800">
                  กล้ามเนื้อกลุ่มที่ {stretchIndex + 1}/{BIOMECHANICS_STRETCHES.length}
                </span>
                <span className="text-xs text-slate-400">
                  การสำรวจกลไกและการยืดเหยียดร่างกาย (พ 3.1)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {currentStretch.nameThai}
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                <strong>วิธีปฏิบัติ:</strong> {currentStretch.action}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {!isHolding && !isCompleted && (
              <button
                onClick={handleStartHold}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-500/20 text-xs sm:text-sm transition"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>เริ่มจับเวลายืด 10 วิ</span>
              </button>
            )}

            {isHolding && (
              <div className="flex items-center gap-2 bg-purple-950 border border-purple-500/50 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-purple-300">ค้างท่าไว้:</span>
                <span className="text-xl font-black text-white animate-pulse">
                  {holdTimer}s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AR Viewport */}
      <div className="w-full max-w-5xl relative">
        <CameraView
          targets={targets}
          onTargetHit={() => {
            sound.playHit(2);
            if (!isHolding && !isCompleted) handleStartHold();
          }}
          countdown={null}
          isPlaying={true}
          gameTitle="Anatomy & Biomechanics AR"
          isSimulated={isSimulated}
          onToggleSimulated={onToggleSimulated}
          instructionText="จัดตำแหน่งร่างกายให้ตรงกับจุดกายวิภาคแล้วยืดเหยียดตามคำแนะนำ"
        />

        {/* Completed Stretch Banner */}
        {isCompleted && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 z-40 rounded-2xl animate-in zoom-in-95 duration-200">
            <div className="max-w-md w-full bg-slate-900 border border-purple-500/50 p-5 rounded-2xl shadow-2xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                ยืดเหยียดกลุ่มกล้ามเนื้อนี้สำเร็จ!
              </h3>
              <p className="text-xs text-purple-300 mb-4">
                {currentStretch.benefit}
              </p>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 text-left mb-5">
                <strong className="text-purple-400 block mb-1">💡 เคล็ดลับการฝึก:</strong>
                {currentStretch.stretchTip}
              </div>

              <button
                onClick={nextStretch}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition mx-auto"
              >
                <span>{stretchIndex + 1 < BIOMECHANICS_STRETCHES.length ? 'สำรวจกล้ามเนื้อถัดไป' : 'ดูสรุปผลการประเมิน'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Anatomical Benefit Strip */}
      <div className="w-full max-w-5xl mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-purple-400 font-semibold flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4" />
            <span>ประโยชน์ต่อการเล่นกีฬา (Athletic Performance):</span>
          </span>
          <p className="text-slate-300">{currentStretch.benefit}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-amber-400 font-semibold flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>ข้อควรระวังในการยืดเหยียด:</span>
          </span>
          <p className="text-slate-300">{currentStretch.stretchTip}</p>
        </div>
      </div>
    </div>
  );
};
