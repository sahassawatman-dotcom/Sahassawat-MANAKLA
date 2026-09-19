export type GameModeType = 
  | 'agility'          // ความคล่องแคล่ว & ปฏิกิริยาตอบสนอง
  | 'tactical'         // การคิดวิเคราะห์ & ตัดสินใจในสถานการณ์กีฬา
  | 'kinesthetic_math' // Active Brain Break - แก้โจทย์ปัญหาด้วยการเคลื่อนไหว
  | 'biomechanics';    // สำรวจกายวิภาคและท่ายืดกล้ามเนื้อ

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ARTarget {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number; // in percentage of screen
  type: 'standard' | 'bonus' | 'hazard' | 'question_option' | 'tactical_pass' | 'body_zone';
  label?: string;
  icon?: string;
  color: string;
  activeTime: number; // timestamp created
  duration: number; // ms to live
  value: number;
  hit: boolean;
  requiredAction?: 'touch' | 'jump' | 'squat' | 'left_hand' | 'right_hand';
}

export interface StudentHistoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  studentGrade: string;
  mode: GameModeType;
  modeTitle: string;
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  avgReactionTimeMs: number;
  caloriesBurned: number;
  jumpsCount: number;
  squatsCount: number;
  gradeEvaluation: 'ยอดเยี่ยม (Excellent)' | 'ดี (Good)' | 'ปานกลาง (Average)' | 'ต้องปรับปรุง (Needs Work)';
  pedagogicalFeedback: string;
  timestamp: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  number: string;
  grade: string;
  history?: StudentHistoryRecord[];
}

export interface GameScoreResult {
  score: number;
  hits: number;
  misses: number;
  accuracy: number; // 0 - 100
  avgReactionTimeMs: number;
  caloriesBurned: number;
  jumpsCount: number;
  squatsCount: number;
  gradeEvaluation: 'ยอดเยี่ยม (Excellent)' | 'ดี (Good)' | 'ปานกลาง (Average)' | 'ต้องปรับปรุง (Needs Work)';
  pedagogicalFeedback: string;
  tacticalAccuracy?: number;
  problemSolvingScore?: number;
  timestamp: string;
}

export interface ClassRoomSession {
  className: string;
  teacherName: string;
  subject: string;
  students: StudentProfile[];
  currentStudentIndex: number;
}

export interface VisionDetectionStats {
  motionIntensity: number;
  bodyCenterY: number;
  isJumping: boolean;
  isSquatting: boolean;
  fps: number;
  trackingQuality: 'optimal' | 'low_light' | 'calibrating' | 'simulated';
}
