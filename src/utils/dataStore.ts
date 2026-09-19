import QRCode from 'qrcode';
import { StudentHistoryRecord, StudentProfile, GameScoreResult, GameModeType } from '../types';

const HISTORY_STORAGE_KEY = 'activear_history_records';

export const getHistoryRecords = (): StudentHistoryRecord[] => {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load history records', err);
    return [];
  }
};

export const saveHistoryRecord = (record: StudentHistoryRecord): StudentHistoryRecord[] => {
  try {
    const current = getHistoryRecords();
    const updated = [record, ...current];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save history record', err);
    return [];
  }
};

export const deleteHistoryRecord = (recordId: string): StudentHistoryRecord[] => {
  try {
    const current = getHistoryRecords();
    const updated = current.filter(r => r.id !== recordId);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history record', err);
    return [];
  }
};

export const clearAllHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history', err);
  }
};

// Export to CSV with UTF-8 BOM so Microsoft Excel & Numbers open Thai correctly
export const exportRecordsToCSV = (records: StudentHistoryRecord[], classNameFilter?: string): void => {
  if (records.length === 0) {
    alert('ยังไม่มีข้อมูลผลการทดสอบสำหรับการส่งออก');
    return;
  }

  const filtered = classNameFilter && classNameFilter !== 'all'
    ? records.filter(r => r.studentGrade === classNameFilter)
    : records;

  if (filtered.length === 0) {
    alert(`ไม่มีข้อมูลของห้องเรียน ${classNameFilter}`);
    return;
  }

  const headers = [
    'ลำดับ',
    'เลขที่',
    'ชื่อ-นามสกุล',
    'ชั้นเรียน',
    'วันเวลาที่ทดสอบ',
    'ทักษะการเรียนรู้ / กิจกรรม',
    'คะแนนรวม (แต้ม)',
    'เวลาตอบสนองเฉลี่ย (ms)',
    'ความแม่นยำ (%)',
    'จำนวนการกระโดด (ครั้ง)',
    'จำนวนการย่อตัว (ครั้ง)',
    'พลังงานเผาผลาญ (kcal)',
    'ระดับสมรรถภาพ (เกณฑ์ สพฐ./กรมพลศึกษา)',
    'ข้อเสนอแนะเชิงพัฒนาการ (Formative Feedback)'
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = filtered.map((r, index) => [
    index + 1,
    r.studentNumber,
    r.studentName,
    r.studentGrade,
    r.timestamp,
    r.modeTitle,
    r.score,
    r.avgReactionTimeMs,
    r.accuracy,
    r.jumpsCount,
    r.squatsCount,
    r.caloriesBurned,
    r.gradeEvaluation,
    r.pedagogicalFeedback
  ].map(escapeCSV).join(','));

  // Prepend UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `ActiveAR_ผลการประเมินพลศึกษา_${classNameFilter || 'รวมทุกห้อง'}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Backup complete data as JSON
export const exportCompleteBackupJSON = (students: StudentProfile[], records: StudentHistoryRecord[]): void => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'ActiveAR PhysEd',
    students,
    records
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ActiveAR_สำรองข้อมูล_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate shareable message formatted for LINE / Classroom
export const formatScorecardShareText = (
  result: GameScoreResult, 
  student: StudentProfile | null, 
  modeTitle: string
): string => {
  const studentInfo = student 
    ? `👤 ผู้รับการทดสอบ: ${student.name} (เลขที่ ${student.number} ชั้น ${student.grade})`
    : '👤 ผู้รับการทดสอบ: นักเรียนทั่วไป';

  return `🏅 [ผลการประเมินวิชาพลศึกษา ActiveAR PhysEd]
${studentInfo}
🎯 ทักษะ/กิจกรรม: ${modeTitle}
⭐️ คะแนนรวม: ${result.score} แต้ม
🏆 ระดับสมรรถภาพ: ${result.gradeEvaluation}
⏱️ เวลาตอบสนองเฉลี่ย: ${result.avgReactionTimeMs} ms
🎯 ความแม่นยำ: ${result.accuracy}%
⚡ การเคลื่อนไหว: กระโดด ${result.jumpsCount} ครั้ง | ย่อตัว ${result.squatsCount} ครั้ง
🔥 พลังงานเผาผลาญ: ${result.caloriesBurned} kcal
💡 ผลป้อนกลับเชิงพัฒนาการ: ${result.pedagogicalFeedback}
📅 วันที่บันทึก: ${result.timestamp}
📌 มาตรฐานการเรียนรู้ สพฐ. พ 3.1 & พ 3.2`;
};

// Generate QR Code data URL for students / parents to scan
export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR Code', err);
    return '';
  }
};
