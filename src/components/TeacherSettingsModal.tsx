import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  GraduationCap, 
  Info, 
  Tv, 
  HelpCircle,
  Lightbulb,
  Search,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { StudentProfile } from '../types';

interface TeacherSettingsModalProps {
  students: StudentProfile[];
  activeStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onAddStudent: (student: StudentProfile) => void;
  onDeleteStudent: (studentId: string) => void;
  onClose: () => void;
  onCallStudent?: (name: string, number?: string) => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  students,
  activeStudentId,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onClose,
  onCallStudent,
}) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [grade, setGrade] = useState('ม.2/1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');

  const uniqueGrades = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => s.grade && set.add(s.grade));
    return Array.from(set);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.number.includes(searchTerm);
      const matchGrade = selectedGradeFilter === 'all' || s.grade === selectedGradeFilter;
      return matchSearch && matchGrade;
    });
  }, [students, searchTerm, selectedGradeFilter]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent: StudentProfile = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      number: number.trim() || String(students.length + 1).padStart(2, '0'),
      grade: grade.trim() || 'ม.2/1',
    };

    onAddStudent(newStudent);
    setName('');
    setNumber('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-800/90 p-5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                จัดการรายชื่อนักเรียน & ห้องเรียน
              </h3>
              <p className="text-xs text-slate-400">
                เลือกลำดับนักเรียนสำหรับเข้าทดสอบเกม AR ในคาบเรียนพลศึกษา
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

        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Classroom Setup Guide */}
          <div className="bg-cyan-950/40 border border-cyan-500/30 p-3.5 rounded-2xl text-xs space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>คำแนะนำการติดตั้งในห้องเรียน/โรงยิมจริง:</span>
            </div>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>ต่อจอโปรเจกเตอร์หรือ Smart TV ในโรงยิม เพื่อให้นักเรียนทั้งห้องร่วมลุ้นและสังเกตการณ์</li>
              <li>ให้นักเรียนยืนห่างจากกล้องประมาณ 1.5 - 2.5 เมตร เพื่อให้เห็นการเคลื่อนไหวช่วงตัวและศีรษะครบถ้วน</li>
              <li>กดไอคอนโทรโข่ง <Megaphone className="w-3 h-3 inline text-cyan-400" /> เพื่อให้ระบบขานชื่อนักเรียนเข้าจุดทดสอบ</li>
            </ul>
          </div>

          {/* Add Student Form */}
          <form onSubmit={handleAdd} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">
              เพิ่มนักเรียนเข้าสู่ระบบ:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล นักเรียน"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sm:col-span-6 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="เลขที่"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="ห้อง (เช่น ม.2/1)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="sm:col-span-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs py-2 flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </form>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือเลขที่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {uniqueGrades.length > 1 && (
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">ทุกห้อง</option>
                {uniqueGrades.map(g => (
                  <option key={g} value={g}>ห้อง {g}</option>
                ))}
              </select>
            )}
          </div>

          {/* Student Roster List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                รายชื่อนักเรียน ({filteredStudents.length} คน)
              </span>
              <span className="text-[11px] text-slate-500">
                คลิกเลือกชื่อเพื่อกำหนดผู้เข้าทดสอบรอบปัจจุบัน
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredStudents.map((std) => {
                const isActive = std.id === activeStudentId;
                return (
                  <div
                    key={std.id}
                    onClick={() => onSelectStudent(std.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md shadow-cyan-950/30'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {isActive ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : std.number}
                      </div>
                      <div>
                        <span className="text-xs font-medium block">
                          {std.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          เลขที่ {std.number} • ชั้น {std.grade}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Voice Call Button */}
                      {onCallStudent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCallStudent(std.name, std.number);
                          }}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition"
                          title="ขานชื่อนักเรียน"
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isActive && (
                        <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-900/60 px-2 py-0.5 rounded-md border border-cyan-700">
                          กำลังทดสอบ
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStudent(std.id);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="ลบรายชื่อ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
