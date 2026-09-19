import React from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  Camera, 
  Users, 
  Award, 
  BookOpen, 
  SlidersHorizontal,
  Flame,
  Brain,
  Crosshair,
  Compass,
  FileSpreadsheet,
  Megaphone,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { GameModeType, StudentProfile } from '../types';

interface HeaderProps {
  currentMode: GameModeType;
  onSelectMode: (mode: GameModeType) => void;
  activeStudent: StudentProfile | null;
  students: StudentProfile[];
  onSelectStudent: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isSimulatedCamera: boolean;
  onToggleCameraMode: () => void;
  onOpenTeacherModal: () => void;
  onOpenCurriculumModal: () => void;
  onOpenGradebookModal: () => void;
  onCallStudent: () => void;
  onNextStudent: () => void;
  recordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  activeStudent,
  students,
  onSelectStudent,
  soundEnabled,
  onToggleSound,
  isSimulatedCamera,
  onToggleCameraMode,
  onOpenTeacherModal,
  onOpenCurriculumModal,
  onOpenGradebookModal,
  onCallStudent,
  onNextStudent,
  recordsCount,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & School / PE Badge */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  ActiveAR PhysEd
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  สื่อ AR พลศึกษา
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                สำรวจ • คิด • ตัดสินใจ • แก้ปัญหา • จัดเก็บ & แชร์ผล ปพ.5
              </p>
            </div>
          </div>

          {/* Mobile quick controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenGradebookModal}
              className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 relative"
              title="สมุดคะแนน & ส่งออก Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {recordsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {recordsCount}
                </span>
              )}
            </button>
            <button
              onClick={onCallStudent}
              className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300"
              title="ขานชื่อนักเรียน"
            >
              <Megaphone className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition ${
                soundEnabled 
                  ? 'bg-slate-800 border-slate-700 text-cyan-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenTeacherModal}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              title="จัดการนักเรียน"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Learning & Game Mode Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectMode('agility')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              currentMode === 'agility'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/50'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-300" />
            <span>1. ความคล่องแคล่ว & ตอบสนอง</span>
          </button>

          <button
            onClick={() => onSelectMode('tactical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              currentMode === 'tactical'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/50'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-emerald-300" />
            <span>2. กลยุทธ์ & การตัดสินใจ</span>
          </button>

          <button
            onClick={() => onSelectMode('kinesthetic_math')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              currentMode === 'kinesthetic_math'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 ring-1 ring-amber-400/50'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-300" />
            <span>3. แก้โจทย์ & เคลื่อนไหว</span>
          </button>

          <button
            onClick={() => onSelectMode('biomechanics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              currentMode === 'biomechanics'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-400/50'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-300" />
            <span>4. สำรวจกายวิภาค</span>
          </button>
        </nav>

        {/* Right Student Bar & Classroom Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {/* Active Student Selector & Call Button */}
          {activeStudent && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-cyan-500/40 px-2 py-1 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-1" />
              <select
                value={activeStudent.id}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="bg-transparent text-cyan-200 font-semibold focus:outline-none cursor-pointer max-w-[140px] truncate"
                title="เปลี่ยนนักเรียนด่วน"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    #{s.number} {s.name} ({s.grade})
                  </option>
                ))}
              </select>

              {/* Call voice button */}
              <button
                onClick={onCallStudent}
                className="p-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition"
                title="ขานชื่อนักเรียนเข้าจุดทดสอบ (Voice Call)"
              >
                <Megaphone className="w-3.5 h-3.5" />
              </button>

              {/* Next student quick button */}
              <button
                onClick={onNextStudent}
                className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                title="สลับเป็นนักเรียนคนถัดไป"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Class Gradebook & Data Storage Button */}
          <button
            onClick={onOpenGradebookModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600/80 to-teal-700/80 border border-emerald-500/50 text-white hover:border-emerald-400 shadow-md shadow-emerald-950/40 transition relative"
            title="เปิดสมุดคะแนน บันทึกประวัติ และส่งออก Excel (CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span>สมุดคะแนน / ปพ.5</span>
            {recordsCount > 0 && (
              <span className="bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                {recordsCount}
              </span>
            )}
          </button>

          {/* Camera / Demo toggle */}
          <button
            onClick={onToggleCameraMode}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs border transition ${
              isSimulatedCamera
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title={isSimulatedCamera ? 'ใช้งานโหมดจำลอง (คลิกเพื่อสลับเป็นกล้องจริง)' : 'ใช้งานกล้องจริง (คลิกเพื่อสลับโหมดจำลอง)'}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isSimulatedCamera ? 'จำลอง' : 'กล้อง AR'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Curriculum / Standards */}
          <button
            onClick={onOpenCurriculumModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition"
            title="มาตรฐานสาระการเรียนรู้พลศึกษา"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>เกณฑ์ สพฐ.</span>
          </button>

          {/* Teacher Roster & Settings */}
          <button
            onClick={onOpenTeacherModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 text-white hover:border-cyan-400 shadow-sm transition"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>รายชื่อนักเรียน</span>
          </button>
        </div>
      </div>
    </header>
  );
};
