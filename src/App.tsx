import React, { useState, useEffect } from 'react';
import { 
  GameModeType, 
  GameScoreResult, 
  StudentProfile,
  StudentHistoryRecord
} from './types';
import { DEFAULT_STUDENTS } from './data/curriculum';
import { Header } from './components/Header';
import { AgilityMode } from './components/GameModes/AgilityMode';
import { TacticalDecisionMode } from './components/GameModes/TacticalDecisionMode';
import { KinestheticMathMode } from './components/GameModes/KinestheticMathMode';
import { BiomechanicsExploreMode } from './components/GameModes/BiomechanicsExploreMode';
import { EvaluationModal } from './components/EvaluationModal';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { CurriculumModal } from './components/CurriculumModal';
import { ClassGradebookModal } from './components/ClassGradebookModal';
import { sound } from './utils/audio';
import { getHistoryRecords, saveHistoryRecord } from './utils/dataStore';
import { 
  Sparkles, 
  Users, 
  Tv, 
  BookOpen, 
  Activity, 
  Flame, 
  Brain, 
  Compass, 
  Crosshair,
  Award,
  Megaphone,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameModeType>('agility');
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('activear_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_STUDENTS;
      }
    }
    return DEFAULT_STUDENTS;
  });
  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    return DEFAULT_STUDENTS[0]?.id || 'std-1';
  });

  const [records, setRecords] = useState<StudentHistoryRecord[]>(() => {
    return getHistoryRecords();
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSimulatedCamera, setIsSimulatedCamera] = useState(false);

  // Modals
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentResult, setCurrentResult] = useState<GameScoreResult | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showGradebookModal, setShowGradebookModal] = useState(false);

  // Save student roster changes
  useEffect(() => {
    localStorage.setItem('activear_students', JSON.stringify(students));
  }, [students]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0] || null;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  const handleToggleCameraMode = () => {
    setIsSimulatedCamera(prev => !prev);
  };

  const getModeTitle = (mode: GameModeType) => {
    switch (mode) {
      case 'agility': return 'ทดสอบความคล่องแคล่ว & ปฏิกิริยาตอบสนอง (Agility Reflex)';
      case 'tactical': return 'วิเคราะห์กลยุทธ์ & ตัดสินใจในสถานการณ์กีฬา (Tactical Decision)';
      case 'kinesthetic_math': return 'คิดเร็วเคลื่อนไหวไว (Kinesthetic Problem Solving)';
      case 'biomechanics': return 'สำรวจกายวิภาค & วอร์มอัพยืดกล้ามเนื้อ (Biomechanics Explorer)';
    }
  };

  const handleFinishGame = (result: GameScoreResult) => {
    setCurrentResult(result);
    setShowEvaluation(true);

    // Save test result record to persistent data store automatically
    if (activeStudent) {
      const newRecord: StudentHistoryRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        studentNumber: activeStudent.number,
        studentGrade: activeStudent.grade,
        mode: currentMode,
        modeTitle: getModeTitle(currentMode),
        score: result.score,
        hits: result.hits,
        misses: result.misses,
        accuracy: result.accuracy,
        avgReactionTimeMs: result.avgReactionTimeMs,
        caloriesBurned: result.caloriesBurned,
        jumpsCount: result.jumpsCount,
        squatsCount: result.squatsCount,
        gradeEvaluation: result.gradeEvaluation,
        pedagogicalFeedback: result.pedagogicalFeedback,
        timestamp: result.timestamp || new Date().toISOString()
      };

      const updated = saveHistoryRecord(newRecord);
      setRecords(updated);
    }
  };

  const handleCallStudent = (customName?: string, customNumber?: string) => {
    const targetName = customName || activeStudent?.name || 'นักเรียน';
    const targetNumber = customNumber || activeStudent?.number;
    sound.speakStudentCall(targetName, targetNumber);
  };

  const handleNextStudent = (autoCall = true) => {
    const currentIndex = students.findIndex(s => s.id === activeStudentId);
    const nextIndex = (currentIndex + 1) % students.length;
    const nextStudent = students[nextIndex];
    if (nextStudent) {
      setActiveStudentId(nextStudent.id);
      if (autoCall && soundEnabled) {
        sound.speakStudentCall(nextStudent.name, nextStudent.number);
      }
    }
    setShowEvaluation(false);
  };

  const handlePlayAgain = () => {
    setShowEvaluation(false);
  };

  const handleAddStudent = (newStd: StudentProfile) => {
    setStudents(prev => [...prev, newStd]);
    setActiveStudentId(newStd.id);
  };

  const handleDeleteStudent = (id: string) => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter(s => s.id !== id));
    if (activeStudentId === id) {
      const remaining = students.filter(s => s.id !== id);
      if (remaining[0]) setActiveStudentId(remaining[0].id);
    }
  };

  const handleImportBackup = (newStudents: StudentProfile[], newRecords: StudentHistoryRecord[]) => {
    if (newStudents && newStudents.length > 0) {
      setStudents(newStudents);
      setActiveStudentId(newStudents[0].id);
    }
    if (newRecords && newRecords.length > 0) {
      setRecords(newRecords);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-['Kanit',sans-serif]">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setShowEvaluation(false);
        }}
        activeStudent={activeStudent}
        students={students}
        onSelectStudent={(id) => setActiveStudentId(id)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isSimulatedCamera={isSimulatedCamera}
        onToggleCameraMode={handleToggleCameraMode}
        onOpenTeacherModal={() => setShowTeacherModal(true)}
        onOpenCurriculumModal={() => setShowCurriculumModal(true)}
        onOpenGradebookModal={() => setShowGradebookModal(true)}
        onCallStudent={() => handleCallStudent()}
        onNextStudent={() => handleNextStudent(true)}
        recordsCount={records.length}
      />

      {/* Classroom Quick Station Bar for Easy In-Class Workflow */}
      <div className="w-full bg-slate-900/70 border-b border-slate-800/80 px-3 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>สถานีทดสอบห้องเรียน:</span>
            </span>
            {activeStudent && (
              <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <span className="font-bold text-cyan-300">
                  #{activeStudent.number} {activeStudent.name}
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({activeStudent.grade})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Call voice button */}
            <button
              onClick={() => handleCallStudent()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 transition"
              title="ระบบขานชื่อนักเรียนด้วยเสียงภาษาไทย"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>ขานชื่อเรียกคิว</span>
            </button>

            {/* Next Student button */}
            <button
              onClick={() => handleNextStudent(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
              title="สลับเป็นนักเรียนคนถัดไปทันที"
            >
              <span>คนถัดไป</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Open Gradebook & Export button */}
            <button
              onClick={() => setShowGradebookModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 transition"
              title="ดูคะแนนทั้งห้อง และส่งออกไฟล์ Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>สมุดคะแนน ปพ.5 ({records.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Arena Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col items-center justify-start">
        {/* Mode-specific game component */}
        {currentMode === 'agility' && (
          <AgilityMode
            activeStudent={activeStudent}
            onFinishGame={handleFinishGame}
            isSimulated={isSimulatedCamera}
            onToggleSimulated={handleToggleCameraMode}
          />
        )}

        {currentMode === 'tactical' && (
          <TacticalDecisionMode
            activeStudent={activeStudent}
            onFinishGame={handleFinishGame}
            isSimulated={isSimulatedCamera}
            onToggleSimulated={handleToggleCameraMode}
          />
        )}

        {currentMode === 'kinesthetic_math' && (
          <KinestheticMathMode
            activeStudent={activeStudent}
            onFinishGame={handleFinishGame}
            isSimulated={isSimulatedCamera}
            onToggleSimulated={handleToggleCameraMode}
          />
        )}

        {currentMode === 'biomechanics' && (
          <BiomechanicsExploreMode
            activeStudent={activeStudent}
            onFinishGame={handleFinishGame}
            isSimulated={isSimulatedCamera}
            onToggleSimulated={handleToggleCameraMode}
          />
        )}

        {/* Classroom Learning Pillars & Pedagogical Highlights */}
        <section className="w-full max-w-5xl mt-6 pt-5 border-t border-slate-900 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div 
            onClick={() => setCurrentMode('biomechanics')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              currentMode === 'biomechanics' 
                ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/30' 
                : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Compass className="w-4 h-4 text-purple-400" />
              <h4 className="font-bold text-xs text-white">1. สำรวจ (Explore)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              สำรวจชีวกลศาสตร์ กล้ามเนื้อ และองศาการเคลื่อนไหวของร่างกายในการยืดเหยียด
            </p>
          </div>

          <div 
            onClick={() => setCurrentMode('agility')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              currentMode === 'agility' 
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-950/30' 
                : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs text-white">2. คิด (Think)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              สังเกตเป้าหมาย แยกแยะไอเทมโบนัสกับอุปสรรค ตอบสนองอย่างรวดเร็ว (Reaction Time)
            </p>
          </div>

          <div 
            onClick={() => setCurrentMode('tactical')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              currentMode === 'tactical' 
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30' 
                : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Flame className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs text-white">3. ตัดสินใจ (Decide)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ตัดสินใจเลือกส่งบอล หาพื้นที่ว่าง หรือปิดมุมป้องกันในสถานการณ์จำลองกีฬา
            </p>
          </div>

          <div 
            onClick={() => setCurrentMode('kinesthetic_math')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              currentMode === 'kinesthetic_math' 
                ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30' 
                : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-xs text-white">4. แก้ปัญหา (Solve)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ฝึกแก้โจทย์ปัญหาเชิงตัวเลขและความรู้สุขศึกษาควบคู่กับการควบคุมสรีระร่างกาย
            </p>
          </div>
        </section>
      </main>

      {/* Classroom Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-3 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ActiveAR PhysEd • สื่อการเรียนรู้เกมความจริงเสริมสำหรับชั้นเรียนพลศึกษาจริง</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGradebookModal(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline transition flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>สมุดคะแนน & ส่งออก Excel (ปพ.5)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowCurriculumModal(true)}
              className="hover:text-cyan-400 underline transition"
            >
              มาตรฐานการเรียนรู้ สพฐ. พ 3.1 & พ 3.2
            </button>
            <span>•</span>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="hover:text-cyan-400 underline transition"
            >
              รายชื่อนักเรียน
            </button>
          </div>
        </div>
      </footer>

      {/* Evaluation & Feedback Modal */}
      {showEvaluation && currentResult && (
        <EvaluationModal
          result={currentResult}
          student={activeStudent}
          modeTitle={getModeTitle(currentMode)}
          onClose={() => setShowEvaluation(false)}
          onPlayAgain={handlePlayAgain}
          onNextStudent={() => handleNextStudent(true)}
        />
      )}

      {/* Teacher Roster Settings Modal */}
      {showTeacherModal && (
        <TeacherSettingsModal
          students={students}
          activeStudentId={activeStudentId}
          onSelectStudent={(id) => {
            setActiveStudentId(id);
            setShowTeacherModal(false);
          }}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
          onClose={() => setShowTeacherModal(false)}
          onCallStudent={(name, number) => handleCallStudent(name, number)}
        />
      )}

      {/* Curriculum Standards Modal */}
      {showCurriculumModal && (
        <CurriculumModal onClose={() => setShowCurriculumModal(false)} />
      )}

      {/* Class Gradebook & Data Storage / Export Modal */}
      {showGradebookModal && (
        <ClassGradebookModal
          records={records}
          students={students}
          onUpdateRecords={(updated) => setRecords(updated)}
          onImportBackup={handleImportBackup}
          onClose={() => setShowGradebookModal(false)}
        />
      )}
    </div>
  );
}
