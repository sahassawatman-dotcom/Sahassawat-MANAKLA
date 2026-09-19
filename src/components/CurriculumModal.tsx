import React from 'react';
import { BookOpen, CheckCircle, Award, Target, Brain, Compass, Sparkles, X } from 'lucide-react';
import { PE_CURRICULUM_STANDARDS } from '../data/curriculum';

interface CurriculumModalProps {
  onClose: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-800/90 p-5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                มาตรฐานและแผนการจัดการเรียนรู้พลศึกษา (สพฐ.)
              </h3>
              <p className="text-xs text-slate-400">
                การบูรณาการเทคโนโลยี AR เข้ากับการเรียนรู้สุขศึกษาและพลศึกษาในชั้นเรียนจริง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Core Learning Competencies */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 p-4 rounded-2xl border border-cyan-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong className="text-cyan-300 block mb-1">
              🎯 กรอบการพัฒนาทักษะ 5 ขั้นตอน (Pedagogical Framework):
            </strong>
            สื่อ AR ชิ้นนี้ถูกออกแบบมาเพื่อให้นักเรียนทุกคนในชั้นเรียนได้มีส่วนร่วมในการ
            <strong> สำรวจ (Explore)</strong> การเคลื่อนไหวของตนเอง,
            <strong> คิด (Think)</strong> และประมวลผลข้อมูลในอากาศ,
            <strong> ตัดสินใจ (Decide)</strong> เชิงกลยุทธ์ตามสถานการณ์จริง,
            <strong> แก้ปัญหา (Solve Problems)</strong> ทั้งเชิงตรรกะและทักษะกลไก, และได้รับ
            <strong> ผลป้อนกลับ (Feedback)</strong> ทันทีเพื่อนำไปปรับปรุงสมรรถภาพตนเอง
          </div>

          <div className="space-y-2.5">
            {PE_CURRICULUM_STANDARDS.map((std, idx) => (
              <div
                key={idx}
                className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white">
                      {std.title}
                    </span>
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-800">
                      {std.code}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-300 bg-purple-950 px-2 py-0.5 rounded-md border border-purple-800">
                      {std.cognitiveLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {std.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Assessment Rubric Guide */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
              เกณฑ์การประเมินผลสัมฤทธิ์ (Rubric Scoring Guide):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block">พุทธิพิสัย (Cognitive):</strong>
                ความเข้าใจกฎ กติกา และการวิเคราะห์สถานการณ์กีฬา (ผ่านคะแนน Tactical & Math Quiz)
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-cyan-400 block">ทักษะพิสัย (Psychomotor):</strong>
                ความคล่องแคล่ว เวลาตอบสนอง และการควบคุมร่างกาย (ผ่านคะแนน Agility & Hits)
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition"
          >
            เข้าใจแล้ว เข้าสู่ห้องเรียน
          </button>
        </div>
      </div>
    </div>
  );
};
