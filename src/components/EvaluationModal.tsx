import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  Flame, 
  RotateCcw, 
  UserCheck, 
  Printer, 
  X, 
  Sparkles, 
  Zap, 
  Timer, 
  HeartPulse,
  Share2,
  Copy,
  Check,
  QrCode,
  Save,
  Volume2
} from 'lucide-react';
import { GameScoreResult, StudentProfile } from '../types';
import { formatScorecardShareText, generateQRCodeDataURL } from '../utils/dataStore';

interface EvaluationModalProps {
  result: GameScoreResult;
  student: StudentProfile | null;
  modeTitle: string;
  onClose: () => void;
  onPlayAgain: () => void;
  onNextStudent: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  result,
  student,
  modeTitle,
  onClose,
  onPlayAgain,
  onNextStudent,
}) => {
  const scorecardRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  }, []);

  // Generate QR code on demand
  useEffect(() => {
    if (showQR && !qrDataUrl) {
      const summaryText = formatScorecardShareText(result, student, modeTitle);
      generateQRCodeDataURL(summaryText).then(url => {
        if (url) setQrDataUrl(url);
      });
    }
  }, [showQR, qrDataUrl, result, student, modeTitle]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareText = formatScorecardShareText(result, student, modeTitle);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ผลการประเมินพลศึกษา - ${student?.name || 'นักเรียน'}`,
          text: shareText,
        });
      } catch {
        // User dismissed or share failed
      }
    } else {
      // Fallback copy to clipboard
      handleCopy();
    }
  };

  const handleCopy = () => {
    const shareText = formatScorecardShareText(result, student, modeTitle);
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const getBadgeColor = (grade: string) => {
    if (grade.includes('ยอดเยี่ยม')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (grade.includes('ดี')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (grade.includes('ปานกลาง')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        ref={scorecardRef}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-cyan-200 block">
                  ผลการประเมินการเรียนรู้รายบุคคล (PE Assessment Feedback)
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-medium">
                  <Save className="w-2.5 h-2.5" />
                  <span>บันทึกประวัติแล้ว</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {modeTitle}
              </h2>
            </div>
          </div>

          {/* Student Info Pill */}
          {student && (
            <div className="mt-4 flex flex-wrap items-center gap-2 bg-black/25 backdrop-blur-sm px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-white/10">
              <span className="text-white/70">ผู้รับการประเมิน:</span>
              <span className="font-bold text-white">{student.name}</span>
              <span className="text-white/60">|</span>
              <span className="text-cyan-200">เลขที่ {student.number}</span>
              <span className="text-white/60">|</span>
              <span className="text-cyan-200">ชั้น {student.grade}</span>
              <span className="text-white/60 ml-auto">{result.timestamp}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Score & Grade Tier */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">คะแนนรวมสะสม</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  {result.score}
                </span>
                <span className="text-xs text-slate-400">แต้ม</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                ระดับสมรรถภาพ (ตามเกณฑ์กรมพลศึกษา)
              </span>
              <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border ${getBadgeColor(result.gradeEvaluation)}`}>
                {result.gradeEvaluation}
              </span>
            </div>
          </div>

          {/* 4 Quantitative Competency Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl text-center">
              <Timer className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] text-slate-400 block">เวลาตอบสนอง</span>
              <span className="text-base sm:text-lg font-bold text-white">
                {result.avgReactionTimeMs} ms
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[11px] text-slate-400 block">ความแม่นยำ</span>
              <span className="text-base sm:text-lg font-bold text-white">
                {result.accuracy}%
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <span className="text-[11px] text-slate-400 block">กระโดด & ย่อ</span>
              <span className="text-base sm:text-lg font-bold text-white">
                {result.jumpsCount} / {result.squatsCount}
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <span className="text-[11px] text-slate-400 block">พลังงานเผาผลาญ</span>
              <span className="text-base sm:text-lg font-bold text-white">
                {result.caloriesBurned} kcal
              </span>
            </div>
          </div>

          {/* Pedagogical Feedback (ข้อเสนอแนะเชิงพัฒนาการเพื่อการเรียนรู้) */}
          <div className="bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ผลป้อนกลับเชิงพัฒนาการ (Formative Feedback & Reflection):</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {result.pedagogicalFeedback}
            </p>
          </div>

          {/* QR Code Section (Collapsible) */}
          {showQR && (
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-cyan-300 flex items-center justify-center sm:justify-start gap-1.5">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>สแกน QR Code เพื่อดูผลคะแนน</span>
                </span>
                <p className="text-xs text-slate-400">
                  นักเรียนหรือผู้ปกครองสามารถใช้กล้องโทรศัพท์สแกนเพื่อรับสรุปผลการประเมิน
                </p>
              </div>
              <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Scorecard QR Code" className="w-28 h-28 object-contain" />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-xs text-slate-500">
                    กำลังสร้าง QR...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Self-Reflection Prompt for Student */}
          <div className="bg-slate-950/40 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300">
            <strong className="text-amber-400 block mb-1">
              🤔 คำถามชวนคิดหลังกิจกรรม (Post-Movement Reflection):
            </strong>
            <p>
              "ในระหว่างการเคลื่อนไหว นักเรียนคิดว่าอะไรช่วยให้ตัดสินใจได้เร็วขึ้น และครั้งต่อไปจะวางตำแหน่งเท้าหรือสายตาอย่างไรให้แม่นยำยิ่งขึ้น?"
            </p>
          </div>

          {/* Action Buttons: Sharing & Classroom Workflow */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            {/* Left sharing tools */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition"
                title="แชร์ผลคะแนนผ่าน LINE หรือแอปอื่น"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>แชร์คะแนน</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                title="คัดลอกข้อความสรุปสำหรับส่งใน LINE"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">คัดลอกแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกข้อความ</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowQR(!showQR)}
                className={`p-2 rounded-xl border text-xs transition ${
                  showQR 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="เปิด/ปิด QR Code สำหรับสแกน"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="พิมพ์ใบประเมิน / PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            {/* Right student workflow tools */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onPlayAgain}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นซ้ำ</span>
              </button>

              <button
                onClick={onNextStudent}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 transition group"
              >
                <UserCheck className="w-4 h-4" />
                <span>บันทึก & คนถัดไป</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
