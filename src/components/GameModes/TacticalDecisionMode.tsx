import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, ShieldCheck, Flame, CheckCircle, XCircle, ArrowRight, Brain, Trophy } from 'lucide-react';
import { ARTarget, GameScoreResult, StudentProfile } from '../../types';
import { CameraView } from '../CameraView';
import { TACTICAL_SCENARIOS, TacticalScenario } from '../../data/curriculum';
import { sound } from '../../utils/audio';

interface TacticalDecisionModeProps {
  activeStudent: StudentProfile | null;
  onFinishGame: (result: GameScoreResult) => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
}

export const TacticalDecisionMode: React.FC<TacticalDecisionModeProps> = ({
  activeStudent,
  onFinishGame,
  isSimulated,
  onToggleSimulated,
}) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [decisionTimeLeft, setDecisionTimeLeft] = useState(8);
  const [scenarioFeedback, setScenarioFeedback] = useState<string | null>(null);
  const [isCorrectDecision, setIsCorrectDecision] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [targets, setTargets] = useState<ARTarget[]>([]);
  const [decisionSpeeds, setDecisionSpeeds] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const currentScenario: TacticalScenario = TACTICAL_SCENARIOS[scenarioIndex % TACTICAL_SCENARIOS.length];

  // Convert scenario elements into interactive AR targets
  const loadScenarioTargets = (scenario: TacticalScenario) => {
    const arTargets: ARTarget[] = scenario.diagramElements.map((el, idx) => {
      const color = el.type === 'opponent_block' 
        ? '#ef4444' 
        : el.type === 'teammate_open' 
          ? '#10b981' 
          : '#3b82f6';

      return {
        id: `tactical-node-${idx}`,
        x: el.x,
        y: el.y,
        radius: 12,
        type: 'tactical_pass',
        label: el.label,
        color,
        activeTime: Date.now(),
        duration: 9000,
        value: el.isOptimalDecision ? 300 : 50,
        hit: false,
        requiredAction: el.y < 35 ? 'jump' : el.y > 60 ? 'squat' : 'touch'
      };
    });

    setTargets(arTargets);
    setStartTime(Date.now());
  };

  const startScenario = () => {
    setIsPlaying(true);
    setScenarioFeedback(null);
    setIsCorrectDecision(null);
    setDecisionTimeLeft(8);
    sound.playWhistle();
    loadScenarioTargets(currentScenario);
  };

  // Timer loop for tactical round
  useEffect(() => {
    let timer: number;
    if (isPlaying && !scenarioFeedback && decisionTimeLeft > 0) {
      timer = window.setInterval(() => {
        setDecisionTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, scenarioFeedback, decisionTimeLeft]);

  const handleTimeout = () => {
    sound.playError();
    setIsCorrectDecision(false);
    setScenarioFeedback('⏱️ หมดเวลาการตัดสินใจ! ในสถานการณ์แข่งขันจริง การลังเลเกิน 3-5 วินาทีจะทำให้ถูกแย่งบอลหรือเสียโอกาสทำแต้ม');
  };

  const handleTargetHit = (targetId: string) => {
    if (scenarioFeedback) return; // already answered
    const nodeIdx = parseInt(targetId.replace('tactical-node-', ''), 10);
    const chosenElement = currentScenario.diagramElements[nodeIdx];
    if (!chosenElement) return;

    const reactionTime = Date.now() - startTime;
    setDecisionSpeeds(prev => [...prev, reactionTime]);

    // Mark as hit
    setTargets(prev => prev.map(t => t.id === targetId ? { ...t, hit: true } : t));

    if (chosenElement.isOptimalDecision) {
      sound.playCorrect();
      setIsCorrectDecision(true);
      setScore(s => s + 350);
      setCorrectCount(c => c + 1);
    } else {
      sound.playError();
      setIsCorrectDecision(false);
    }

    setScenarioFeedback(chosenElement.feedback);
  };

  const nextScenario = () => {
    if (scenarioIndex + 1 < TACTICAL_SCENARIOS.length) {
      setScenarioIndex(i => i + 1);
      setIsPlaying(true);
      setScenarioFeedback(null);
      setIsCorrectDecision(null);
      setDecisionTimeLeft(8);
      loadScenarioTargets(TACTICAL_SCENARIOS[scenarioIndex + 1]);
    } else {
      finishAllScenarios();
    }
  };

  const finishAllScenarios = () => {
    setIsPlaying(false);
    sound.playFanfare();

    const total = TACTICAL_SCENARIOS.length;
    const accuracy = Math.round((correctCount / total) * 100);
    const avgSpeed = decisionSpeeds.length > 0 
      ? Math.round(decisionSpeeds.reduce((a, b) => a + b, 0) / decisionSpeeds.length)
      : 1200;

    let gradeEvaluation: GameScoreResult['gradeEvaluation'] = 'ต้องปรับปรุง (Needs Work)';
    let feedback = '';

    if (correctCount === total) {
      gradeEvaluation = 'ยอดเยี่ยม (Excellent)';
      feedback = 'สายตาและการอ่านเกมระดับยอดเยี่ยม! เข้าใจหลักการหาพื้นที่ว่าง การสร้างรูปสามเหลี่ยมส่งบอล และการป้องกันลูกตบได้ครบถ้วน';
    } else if (correctCount >= 2) {
      gradeEvaluation = 'ดี (Good)';
      feedback = 'มีทักษะการตัดสินใจเชิงกลยุทธ์ที่ดี สามารถมองเห็นพื้นที่ได้เปรียบ แนะนำให้ฝึกสังเกตตำแหน่งตัวประกบให้รอบคอบยิ่งขึ้น';
    } else {
      gradeEvaluation = 'ปานกลาง (Average)';
      feedback = 'ต้องฝึกการสังเกตภาพรวมของสนาม (Peripheral Vision) และลดความลังเลใจในการเลือกจ่ายบอล';
    }

    onFinishGame({
      score: score + (correctCount * 100),
      hits: correctCount,
      misses: total - correctCount,
      accuracy,
      avgReactionTimeMs: avgSpeed,
      caloriesBurned: 18,
      jumpsCount: 2,
      squatsCount: 3,
      gradeEvaluation,
      pedagogicalFeedback: feedback,
      tacticalAccuracy: accuracy,
      timestamp: new Date().toLocaleTimeString('th-TH')
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tactical Scenario Brief Header */}
      <div className="w-full max-w-5xl mb-3 bg-slate-900/90 border border-emerald-500/30 p-3 sm:px-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                  กีฬา: {currentScenario.sport}
                </span>
                <span className="text-xs text-slate-400">
                  ข้อ {scenarioIndex + 1}/{TACTICAL_SCENARIOS.length}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {currentScenario.title}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                <span className="text-emerald-400 font-semibold">ภารกิจ: </span>
                {currentScenario.objective}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            {isPlaying && (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400">ตัดสินใจภายใน:</span>
                <span className={`font-black text-sm ${decisionTimeLeft <= 3 ? 'text-red-400 animate-ping' : 'text-emerald-400'}`}>
                  {decisionTimeLeft}s
                </span>
              </div>
            )}

            {!isPlaying && (
              <button
                onClick={startScenario}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>เริ่มสถานการณ์</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AR Viewport with Tactical Nodes */}
      <div className="w-full max-w-5xl relative">
        <CameraView
          targets={targets}
          onTargetHit={handleTargetHit}
          countdown={countdown}
          isPlaying={isPlaying}
          gameTitle="Tactical Decision Arena"
          isSimulated={isSimulated}
          onToggleSimulated={onToggleSimulated}
          instructionText="ขยับร่างกายหรือเอื้อมแตะตัวเลือกตำแหน่งที่มีโอกาสสำเร็จสูงสุด!"
        />

        {/* Immediate Pedagogical Feedback Card Popup */}
        {scenarioFeedback && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 z-40 rounded-2xl animate-in zoom-in-95 duration-200">
            <div className="max-w-lg w-full bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-2xl text-center">
              <div className="flex justify-center mb-3">
                {isCorrectDecision ? (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                    <XCircle className="w-8 h-8" />
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {isCorrectDecision ? 'การตัดสินใจยอดเยี่ยม! (+350 แต้ม)' : 'การตัดสินใจยังมีความเสี่ยง'}
              </h3>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-sm text-slate-200 text-left mb-5 leading-relaxed">
                {scenarioFeedback}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={nextScenario}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg transition"
                >
                  <span>{scenarioIndex + 1 < TACTICAL_SCENARIOS.length ? 'สถานการณ์ถัดไป' : 'ดูผลการประเมินทักษะ'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Classroom Pedagogical Guide for PE Teacher */}
      <div className="w-full max-w-5xl mt-3 bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>จุดประสงค์การเรียนรู้ (พ 3.2):</strong> ฝึกให้นักเรียนอ่านทิศทางคู่แข่งและเพื่อนร่วมทีม แก้ปัญหาในเสี้ยววินาที
          </span>
        </div>
        <div className="hidden sm:block text-slate-500">
          คะแนนสะสม: <span className="text-emerald-400 font-bold">{score}</span> | ตอบถูกต้อง: {correctCount}/{TACTICAL_SCENARIOS.length}
        </div>
      </div>
    </div>
  );
};
