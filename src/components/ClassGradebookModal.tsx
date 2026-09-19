import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Award, 
  Share2, 
  Check, 
  Copy, 
  Calendar, 
  Flame, 
  Timer, 
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { StudentHistoryRecord, StudentProfile } from '../types';
import { 
  exportRecordsToCSV, 
  exportCompleteBackupJSON, 
  formatScorecardShareText,
  deleteHistoryRecord,
  clearAllHistory
} from '../utils/dataStore';

interface ClassGradebookModalProps {
  records: StudentHistoryRecord[];
  students: StudentProfile[];
  onUpdateRecords: (updated: StudentHistoryRecord[]) => void;
  onImportBackup?: (students: StudentProfile[], records: StudentHistoryRecord[]) => void;
  onClose: () => void;
}

export const ClassGradebookModal: React.FC<ClassGradebookModalProps> = ({
  records,
  students,
  onUpdateRecords,
  onImportBackup,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'leaderboard'>('records');

  // Extract unique grades
  const uniqueGrades = useMemo(() => {
    const grades = new Set<string>();
    students.forEach(s => s.grade && grades.add(s.grade));
    records.forEach(r => r.studentGrade && grades.add(r.studentGrade));
    return Array.from(grades);
  }, [students, records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.studentNumber.includes(searchTerm);
      const matchGrade = selectedGrade === 'all' || r.studentGrade === selectedGrade;
      const matchMode = selectedMode === 'all' || r.mode === selectedMode;
      return matchSearch && matchGrade && matchMode;
    });
  }, [records, searchTerm, selectedGrade, selectedMode]);

  // Classroom stats calculations
  const stats = useMemo(() => {
    if (records.length === 0) {
      return { totalTests: 0, avgScore: 0, totalKcal: 0, highPassRate: 0, avgReaction: 0 };
    }
    const totalTests = records.length;
    const sumScore = records.reduce((acc, r) => acc + r.score, 0);
    const sumKcal = records.reduce((acc, r) => acc + (r.caloriesBurned || 0), 0);
    const sumReaction = records.reduce((acc, r) => acc + (r.avgReactionTimeMs || 0), 0);
    const excellentOrGoodCount = records.filter(r => 
      r.gradeEvaluation.includes('ยอดเยี่ยม') || r.gradeEvaluation.includes('ดี')
    ).length;

    return {
      totalTests,
      avgScore: Math.round(sumScore / totalTests),
      totalKcal: Math.round(sumKcal * 10) / 10,
      highPassRate: Math.round((excellentOrGoodCount / totalTests) * 100),
      avgReaction: Math.round(sumReaction / totalTests)
    };
  }, [records]);

  // Top leaderboard ranking
  const leaderboard = useMemo(() => {
    const studentBestScores = new Map<string, { record: StudentHistoryRecord; totalScore: number; gamesPlayed: number }>();
    records.forEach(r => {
      const existing = studentBestScores.get(r.studentId);
      if (!existing) {
        studentBestScores.set(r.studentId, { record: r, totalScore: r.score, gamesPlayed: 1 });
      } else {
        existing.totalScore += r.score;
        existing.gamesPlayed += 1;
        if (r.score > existing.record.score) {
          existing.record = r;
        }
      }
    });

    return Array.from(studentBestScores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  }, [records]);

  const handleDeleteOne = (id: string) => {
    if (window.confirm('คุณต้องการลบผลการทดสอบรายการนี้ใช่หรือไม่?')) {
      const updated = deleteHistoryRecord(id);
      onUpdateRecords(updated);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('⚠️ คำเตือน: คุณต้องการล้างบันทึกผลการทดสอบทั้งหมดของห้องเรียนใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      clearAllHistory();
      onUpdateRecords([]);
    }
  };

  const handleExportCSV = () => {
    exportRecordsToCSV(records, selectedGrade === 'all' ? undefined : selectedGrade);
  };

  const handleExportBackup = () => {
    exportCompleteBackupJSON(students, records);
  };

  const handleCopyText = (record: StudentHistoryRecord) => {
    const text = `🏅 ผลการประเมินพลศึกษา ActiveAR PhysEd
👤 นักเรียน: ${record.studentName} (เลขที่ ${record.studentNumber} ชั้น ${record.studentGrade})
🎯 กิจกรรม: ${record.modeTitle}
⭐️ คะแนนสะสม: ${record.score} แต้ม
🏆 ระดับสมรรถภาพ: ${record.gradeEvaluation}
⏱️ ปฏิกิริยาตอบสนอง: ${record.avgReactionTimeMs} ms | ความแม่นยำ: ${record.accuracy}%
🔥 พลังงานเผาผลาญ: ${record.caloriesBurned} kcal
💡 ผลป้อนกลับ: ${record.pedagogicalFeedback}
📅 วันที่บันทึก: ${record.timestamp}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.records && Array.isArray(parsed.records)) {
          localStorage.setItem('activear_history_records', JSON.stringify(parsed.records));
          if (parsed.students && Array.isArray(parsed.students)) {
            localStorage.setItem('activear_students', JSON.stringify(parsed.students));
          }
          if (onImportBackup) {
            onImportBackup(parsed.students || students, parsed.records);
          } else {
            onUpdateRecords(parsed.records);
          }
          alert(`นำเข้าข้อมูลสำเร็จ! พบผลการทดสอบ ${parsed.records.length} รายการ`);
        } else {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์สำรอง');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-5 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  สมุดบันทึกผลคะแนน & ฐานข้อมูลสมรรถภาพ
                </h3>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ปพ.5 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                จัดเก็บประวัติการทดสอบอัตโนมัติ ส่งออกเป็น Excel (CSV) และแชร์ผลการเรียนรู้
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Quick Export Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 transition"
              title="ส่งออกไฟล์ Excel สำหรับทำแบบบันทึกผลการเรียนรู้ ปพ.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก Excel (CSV)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Classroom Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-slate-950/70 border-b border-slate-800 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block">จำนวนการทดสอบ</span>
              <span className="text-base font-black text-white">{stats.totalTests} รอบ</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block">คะแนนเฉลี่ยทั้งชั้น</span>
              <span className="text-base font-black text-amber-300">{stats.avgScore} แต้ม</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block">ผ่านเกณฑ์ 'ดี-ยอดเยี่ยม'</span>
              <span className="text-base font-black text-emerald-300">{stats.highPassRate}%</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-orange-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block">พลังงานรวมที่เผาผลาญ</span>
              <span className="text-base font-black text-orange-400">{stats.totalKcal} kcal</span>
            </div>
          </div>
        </div>

        {/* Filter and Tab Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'records'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              รายการคะแนนทั้งหมด ({filteredRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>อันดับคะแนนรวม (Leaderboard)</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ / เลขที่..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Room Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">ทุกห้องเรียน</option>
              {uniqueGrades.map(g => (
                <option key={g} value={g}>ห้อง {g}</option>
              ))}
            </select>

            {/* Mode Filter */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">ทุกกิจกรรม AR</option>
              <option value="agility">ความคล่องแคล่ว</option>
              <option value="tactical">กลยุทธ์กีฬา</option>
              <option value="kinesthetic_math">แก้โจทย์เคลื่อนไหว</option>
              <option value="biomechanics">สำรวจกายวิภาค</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {activeTab === 'records' ? (
            filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold">ยังไม่พบข้อมูลผลการทดสอบที่ตรงกับเงื่อนไข</p>
                <p className="text-xs text-slate-500">
                  เมื่อนักเรียนทำกิจกรรมเสร็จสิ้น คะแนนและผลประเมินจะถูกบันทึกและแสดงที่นี่อัตโนมัติ
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                      <th className="py-2.5 px-3 font-semibold">วันเวลา</th>
                      <th className="py-2.5 px-3 font-semibold">เลขที่ / ห้อง</th>
                      <th className="py-2.5 px-3 font-semibold">ชื่อ-นามสกุล</th>
                      <th className="py-2.5 px-3 font-semibold">กิจกรรม AR</th>
                      <th className="py-2.5 px-3 font-semibold text-right">คะแนน</th>
                      <th className="py-2.5 px-3 font-semibold text-center">เวลาตอบสนอง</th>
                      <th className="py-2.5 px-3 font-semibold text-center">ความแม่นยำ</th>
                      <th className="py-2.5 px-3 font-semibold text-center">ระดับสมรรถภาพ</th>
                      <th className="py-2.5 px-3 font-semibold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRecords.map((r) => {
                      const isExcellent = r.gradeEvaluation.includes('ยอดเยี่ยม');
                      const isGood = r.gradeEvaluation.includes('ดี');
                      return (
                        <tr key={r.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                            {r.timestamp}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-300">
                            #{r.studentNumber} • {r.studentGrade}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-bold text-white">
                            {r.studentName}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 text-[11px]">
                            {r.modeTitle.split('(')[0]}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-cyan-400 whitespace-nowrap">
                            {r.score}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-300 whitespace-nowrap">
                            {r.avgReactionTimeMs} ms
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-300 whitespace-nowrap">
                            {r.accuracy}%
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isExcellent 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                : isGood 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}>
                              {r.gradeEvaluation.split('(')[0]}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleCopyText(r)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition"
                                title="คัดลอกข้อความสรุปผลสำหรับส่งกลุ่ม LINE"
                              >
                                {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteOne(r.id)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="ลบรายการนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Leaderboard Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>10 อันดับยอดเยี่ยมประจำชั้นเรียน (Class Champions):</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  คิดจากคะแนนสะสมรวมและการมีส่วนร่วม
                </span>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  ยังไม่มีข้อมูลเพียงพอสำหรับจัดอันดับ
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {leaderboard.map((item, idx) => (
                    <div 
                      key={item.record.studentId}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/70 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          idx === 0 
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30' 
                            : idx === 1 
                              ? 'bg-slate-300 text-slate-950' 
                              : idx === 2 
                                ? 'bg-amber-700 text-amber-100' 
                                : 'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-xs sm:text-sm">
                            {item.record.studentName}
                          </h5>
                          <span className="text-[11px] text-slate-400">
                            เลขที่ {item.record.studentNumber} • ชั้น {item.record.studentGrade} • เล่น {item.gamesPlayed} ครั้ง
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-cyan-400 block">
                          {item.totalScore} แต้ม
                        </span>
                        <span className="text-[10px] text-slate-400">
                          สูงสุด: {item.record.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Backup JSON */}
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="ดาวน์โหลดไฟล์สำรองข้อมูลทั้งระบบ"
            >
              <Download className="w-3.5 h-3.5" />
              <span>สำรองข้อมูล (JSON)</span>
            </button>

            {/* Import JSON */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>นำเข้าข้อมูล (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Clear All Records */}
            {records.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                title="ล้างข้อมูลการทดสอบทั้งหมดของห้องเรียน"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างประวัติ</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition ml-auto"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
