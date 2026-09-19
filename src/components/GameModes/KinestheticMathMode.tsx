import React, { useState, useEffect } from 'react';
import { Play, Brain, CheckCircle2, XCircle, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';
import { ARTarget, GameScoreResult, StudentProfile } from '../../types';
import { CameraView } from '../CameraView';
import { KINESTHETIC_MATH_QUESTIONS, MathMovementQuestion } from '../../data/curriculum';
import { sound } from '../../utils/audio';

interface KinestheticMathModeProps {
  activeStudent: StudentProfile | null;
  onFinishGame: (result: GameScoreResult) => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
}

export const KinestheticMathMode: React.FC<KinestheticMathModeProps> = ({
  activeStudent,
  onFinishGame,
  isSimulated,
  onToggleSimulated,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [targets, setTargets] = useState<ARTarget[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [solveTimes, setSolveTimes] = useState<number[]>([]);

  const currentQ: MathMovementQuestion = KINESTHETIC_MATH_QUESTIONS[qIndex % KINESTHETIC_MATH_QUESTIONS.length];

  const loadQuestionTargets = (q: MathMovementQuestion) => {
    const arTargets: ARTarget[] = q.options.map((opt, idx) => {
      return {
        id: `math-opt-${idx}`,
        x: opt.x,
        y: opt.y,
        radius: 12,
        type: 'question_option',
        label: opt.label,
        color: '#f59e0b', // amber
        activeTime: Date.now(),
        duration: 12000,
        value: opt.isCorrect ? 300 : 0,
        hit: false,
        requiredAction: opt.y < 30 ? 'jump' : opt.y > 65 ? 'squat' : 'touch'
      };
    });

    setTargets(arTargets);
    setStartTime(Date.now());
  };

  const startQuiz = () => {
    setIsPlaying(true);
    setQuestionFeedback(null);
    setIsCorrect(null);
    sound.playWhistle();
    loadQuestionTargets(currentQ);
  };

  const handleTargetHit = (targetId: string) => {
    if (questionFeedback) return;
    const optIdx = parseInt(targetId.replace('math-opt-', ''), 10);
    const chosen = currentQ.options[optIdx];
    if (!chosen) return;

    const timeSpent = Date.now() - startTime;
    setSolveTimes(prev => [...prev, timeSpent]);

    setTargets(prev => prev.map(t => t.id === targetId ? { ...t, hit: true } : t));

    if (chosen.isCorrect) {
      sound.playCorrect();
      setIsCorrect(true);
      setScore(s => s + 300);
      setCorrectCount(c => c + 1);
      setQuestionFeedback(`ถูกต้อง! 🎉 ${currentQ.explanation}`);
    } else {
      sound.playError();
      setIsCorrect(false);
      setQuestionFeedback(`ยังไม่ถูกต้อง 💡 คำตอบที่ถูกต้องคือ: ${currentQ.options.find(o => o.isCorrect)?.label} (${currentQ.explanation})`);
    }
  };

  const nextQuestion = () => {
    if (qIndex + 1 < KINESTHETIC_MATH_QUESTIONS.length) {
      setQIndex(i => i + 1);
      setIsPlaying(true);
      setQuestionFeedback(null);
      setIsCorrect(null);
      loadQuestionTargets(KINESTHETIC_MATH_QUESTIONS[qIndex + 1]);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsPlaying(false);
    sound.playFanfare();

    const total = KINESTHETIC_MATH_QUESTIONS.length;
    const accuracy = Math.round((correctCount / total) * 100);
    const avgSolveTime = solveTimes.length > 0
      ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length)
      : 2500;

    let gradeEvaluation: GameScoreResult['gradeEvaluation'] = 'ต้องปรับปรุง (Needs Work)';
    let feedback = '';

    if (correctCount === total) {
      gradeEvaluation = 'ยอดเยี่ยม (Excellent)';
      feedback = 'สมองและร่างกายทำงานประสานกัน (Cognitive-Motor Dual Task) ได้อย่างยอดเยี่ยม คิดคำนวณและตัดสินใจเคลื่อนไหวได้แม่นยำ 100%';
    } else if (correctCount >= 2) {
      gradeEvaluation = 'ดี (Good)';
      feedback = 'สามารถแก้ปัญหาพร้อมเคลื่อนไหวได้ดี การฝึกร่างกายและสมองร่วมกันช่วยเพิ่มสมาธิและความจำในการเรียนรู้';
    } else {
      gradeEvaluation = 'ปานกลาง (Average)';
      feedback = 'ฝึกฝนการแยกประสาทสัมผัส โดยค่อยๆ คิดหาคำตอบแล้วขยับเอื้อมแตะเป้าหมายอย่างมั่นคง';
    }

    onFinishGame({
      score: score + (correctCount * 120),
      hits: correctCount,
      misses: total - correctCount,
      accuracy,
      avgReactionTimeMs: avgSolveTime,
      caloriesBurned: 15,
      jumpsCount: 2,
      squatsCount: 2,
      gradeEvaluation,
      pedagogicalFeedback: feedback,
      problemSolvingScore: accuracy,
      timestamp: new Date().toLocaleTimeString('th-TH')
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full max-w-5xl mb-3 bg-slate-900/90 border border-amber-500/30 p-3 sm:px-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800">
                  โจทย์ที่ {qIndex + 1}/{KINESTHETIC_MATH_QUESTIONS.length}
                </span>
                <span className="text-xs text-slate-400">
                  Active Brain Break & Dual-Tasking
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                {currentQ.question}
              </h2>
              <p className="text-xs text-amber-300 flex items-center gap-1.5 mt-0.5">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                <span>{currentQ.hint}</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {!isPlaying && (
              <button
                onClick={startQuiz}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>เริ่มตอบโจทย์</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AR Viewport */}
      <div className="w-full max-w-5xl relative">
        <CameraView
          targets={targets}
          onTargetHit={handleTargetHit}
          countdown={null}
          isPlaying={isPlaying}
          gameTitle="Kinesthetic Math Challenge"
          isSimulated={isSimulated}
          onToggleSimulated={onToggleSimulated}
          instructionText="คิดคำตอบในใจ แล้วเคลื่อนไหวร่างกายแตะเป้าหมายที่ถูกต้อง!"
        />

        {/* Feedback Card */}
        {questionFeedback && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 z-40 rounded-2xl animate-in zoom-in-95 duration-200">
            <div className="max-w-lg w-full bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-2xl text-center">
              <div className="flex justify-center mb-3">
                {isCorrect ? (
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                    <XCircle className="w-8 h-8" />
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {isCorrect ? 'ตอบถูกต้องและเคลื่อนไหวแม่นยำ! (+300)' : 'ทบทวนคำตอบและการเคลื่อนไหว'}
              </h3>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-sm text-slate-200 text-left mb-5 leading-relaxed">
                {questionFeedback}
              </div>

              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl shadow-lg transition mx-auto"
              >
                <span>{qIndex + 1 < KINESTHETIC_MATH_QUESTIONS.length ? 'ข้อถัดไป' : 'ดูผลการประเมิน'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl mt-3 bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>
            <strong>ประโยชน์ของการเรียนรู้แบบ Kinesthetic:</strong> เชื่อมโยงระบบการคิดคำนวณกับการประสานกล้ามเนื้อ (Motor-Cognitive Integration)
          </span>
        </div>
        <div className="hidden sm:block text-slate-500">
          ความแม่นยำ: {correctCount}/{KINESTHETIC_MATH_QUESTIONS.length}
        </div>
      </div>
    </div>
  );
};
