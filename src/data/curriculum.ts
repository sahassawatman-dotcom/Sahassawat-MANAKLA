import { StudentProfile } from '../types';

export interface CurriculumCompetency {
  code: string;
  title: string;
  description: string;
  cognitiveLevel: 'สำรวจ (Explore)' | 'คิด (Think)' | 'ตัดสินใจ (Decide)' | 'แก้ปัญหา (Solve)' | 'ฟีดแบ็ก (Feedback)';
}

export const PE_CURRICULUM_STANDARDS: CurriculumCompetency[] = [
  {
    code: 'พ 3.1 ป.4-ม.3',
    title: 'ทักษะกลไกและการเคลื่อนไหวประกอบเกม',
    description: 'ควบคุมการเคลื่อนไหวของร่างกายในการรับรู้ตำแหน่ง ทิศทาง และพื้นที่ (Spatial Awareness & Agility)',
    cognitiveLevel: 'สำรวจ (Explore)'
  },
  {
    code: 'พ 3.1 ข้อ 2',
    title: 'การรับรู้และตอบสนองต่อสิ่งเร้า (Reaction Time)',
    description: 'สังเกตและประมวลผลข้อมูลเป้าหมายเสมือนจริงในอากาศอย่างรวดเร็วและแม่นยำ',
    cognitiveLevel: 'คิด (Think)'
  },
  {
    code: 'พ 3.2 ข้อ 1',
    title: 'การตัดสินใจเชิงกลยุทธ์ในสถานการณ์กีฬา',
    description: 'วิเคราะห์สถานการณ์เพื่อเลือกเส้นทางการส่งบอล หลบหลีก หรือป้องกันภายใต้ความกดดันเวลา',
    cognitiveLevel: 'ตัดสินใจ (Decide)'
  },
  {
    code: 'พ 3.1 ข้อ 3',
    title: 'การแก้ปัญหาการเคลื่อนไหวเชิงบูรณาการ (Kinesthetic Problem Solving)',
    description: 'บูรณาการการคิดคำนวณและลำดับตรรกะร่วมกับการควบคุมการทำงานประสานของระบบประสาทและกล้ามเนื้อ',
    cognitiveLevel: 'แก้ปัญหา (Solve)'
  },
  {
    code: 'พ 4.1 / สมรรถภาพทางกาย',
    title: 'การประเมินและสะท้อนผลสมรรถภาพตนเอง',
    description: 'รับผลป้อนกลับทันทีด้านความเร็ว ความแม่นยำ และระดับความฟิตเพื่อนำไปพัฒนาทักษะตนเอง',
    cognitiveLevel: 'ฟีดแบ็ก (Feedback)'
  }
];

export const DEFAULT_STUDENTS: StudentProfile[] = [
  { id: 'std-1', name: 'ด.ช. ภัทรพล สิทธิชัย', number: '01', grade: 'ม.2/1' },
  { id: 'std-2', name: 'ด.ญ. กัญญารัตน์ วงศ์สมบูรณ์', number: '02', grade: 'ม.2/1' },
  { id: 'std-3', name: 'ด.ช. ธนกร พงศ์ประเสริฐ', number: '03', grade: 'ม.2/1' },
  { id: 'std-4', name: 'ด.ญ. นภัสสร สุขสว่าง', number: '04', grade: 'ม.2/1' },
  { id: 'std-5', name: 'ด.ช. วรเมธ จิตต์พิริยะ', number: '05', grade: 'ม.2/1' },
];

export interface BiomechanicsMuscle {
  id: string;
  nameThai: string;
  nameEng: string;
  action: string;
  targetArea: { x: number; y: number };
  benefit: string;
  stretchTip: string;
}

export const BIOMECHANICS_STRETCHES: BiomechanicsMuscle[] = [
  {
    id: 'deltoid',
    nameThai: 'กล้ามเนื้อหัวไหล่ (Deltoids)',
    nameEng: 'Deltoid Muscle Stretch',
    action: 'ยืดแขนข้ามลำตัวแล้วใช้มืออีกข้างกดข้อศอกเข้าหาอก',
    targetArea: { x: 30, y: 35 },
    benefit: 'เพิ่มมุมการเคลื่อนไหวข้อต่อหัวไหล่ ป้องกันการบาดเจ็บในกีฬาแบดมินตัน/วอลเลย์บอล',
    stretchTip: 'ค้างไว้ 10-15 วินาที หายใจเข้า-ออกลึกๆ สม่ำเสมอ'
  },
  {
    id: 'core_obliques',
    nameThai: 'กล้ามเนื้อแกนกลางลำตัว (Core & Obliques)',
    nameEng: 'Core & Torso Rotation',
    action: 'ยืนตรง เอี้ยวตัวไปด้านข้าง ชูแขนสูง เอียงลำตัวเปิดซี่โครง',
    targetArea: { x: 70, y: 50 },
    benefit: 'สร้างความมั่นคงของลำตัว เพิ่มแรงส่งในการกระโดดและบิดตัวเล่นกีฬา',
    stretchTip: 'เกร็งหน้าท้องเล็กน้อย ไม่แอ่นหลังส่วนล่าง'
  },
  {
    id: 'quadriceps',
    nameThai: 'กล้ามเนื้อต้นขาด้านหน้า (Quadriceps)',
    nameEng: 'Standing Quad Stretch',
    action: 'ยืนทรงตัวขาเดียว พับเข่าจับข้อเท้าดึงแนบสะโพก',
    targetArea: { x: 35, y: 75 },
    benefit: 'เพิ่มความยืดหยุ่นหน้าขาและสะโพก ช่วยในการสปรินต์และกระโดดบล็อก',
    stretchTip: 'รักษาแนวเข่าให้ชี้ลงพื้น ชิดเข่าทั้งสองข้างเข้าหากัน'
  },
  {
    id: 'hamstrings',
    nameThai: 'กล้ามเนื้อต้นขาด้านหลัง & น่อง (Hamstrings & Calves)',
    nameEng: 'Hamstring & Calf Reach',
    action: 'ก้าวขาไปข้างหน้าหนึ่งก้าว ปลายเท้ายกขึ้น ย่อขาหลัง โน้มตัวเอื้อมแตะปลายเท้า',
    targetArea: { x: 65, y: 80 },
    benefit: 'คลายกล้ามเนื้อโซ่หลัง ป้องกันอาการกล้ามเนื้อกระตุกหรือเป็นตะคริวขณะวิ่ง',
    stretchTip: 'หลังตรง โน้มจากข้อต่อสะโพก รู้สึกตึงสบายด้านหลังต้นขา'
  }
];

export interface MathMovementQuestion {
  question: string;
  options: { label: string; isCorrect: boolean; x: number; y: number; action: string }[];
  hint: string;
  explanation: string;
}

export const KINESTHETIC_MATH_QUESTIONS: MathMovementQuestion[] = [
  {
    question: '🎯 โจทย์ข้อที่ 1: ผลลัพธ์ของ 12 + 15 คือเท่าใด?',
    hint: 'ใช้มือซ้ายหรือขวาแตะเป้าหมายหมายเลขที่ถูกต้องในอากาศ!',
    explanation: '12 + 15 = 27 การคิดคำนวณพร้อมการเคลื่อนไหวช่วยกระตุ้นสมองสองซีก (Dual-tasking)',
    options: [
      { label: '25', isCorrect: false, x: 22, y: 35, action: 'แตะซ้ายบน' },
      { label: '27', isCorrect: true, x: 78, y: 35, action: 'แตะขวาบน' },
      { label: '37', isCorrect: false, x: 50, y: 80, action: 'ย่อตัวแตะล่าง' },
    ]
  },
  {
    question: '⚡ โจทย์ข้อที่ 2: อัตราการเต้นหัวใจขณะพักปกติของนักกีฬาคือเท่าใด?',
    hint: 'เลือกคำตอบที่ถูกต้องโดยการเอื้อมหรือกระโดดแตะเป้า!',
    explanation: 'นักกีฬาที่ฟิตจะมี Resting Heart Rate ประมาณ 40-60 bpm เนื่องจากหัวใจแข็งแรงสูบฉีดเลือดได้มีประสิทธิภาพ',
    options: [
      { label: '40-60 bpm', isCorrect: true, x: 25, y: 30, action: 'เอื้อมซ้าย' },
      { label: '100-120 bpm', isCorrect: false, x: 75, y: 30, action: 'เอื้อมขวา' },
      { label: '140-160 bpm', isCorrect: false, x: 50, y: 82, action: 'ย่อตัวล่าง' },
    ]
  },
  {
    question: '🧩 โจทย์ข้อที่ 3: ข้อใดคือทักษะการเคลื่อนไหวแบบไม่เคลื่อนที่ (Non-locomotor)?',
    hint: 'ตัดสินใจและเลือกคำตอบที่ถูกต้องอย่างรวดเร็ว',
    explanation: 'การบิดตัว (Twisting/Bending) เป็น Non-locomotor ส่วนการวิ่งและสไลด์เป็น Locomotor',
    options: [
      { label: 'วิ่งสปรินต์', isCorrect: false, x: 22, y: 38, action: 'ซ้าย' },
      { label: 'การก้มบิดตัว', isCorrect: true, x: 50, y: 22, action: 'กระโดดแตะบน' },
      { label: 'การสไลด์ข้าง', isCorrect: false, x: 78, y: 38, action: 'ขวา' },
    ]
  },
  {
    question: '🏀 โจทย์ข้อที่ 4: การคำนวณแคลอรี่: วิ่งกระโดด 10 นาที เผาผลาญประมาณกี่แคลอรี่?',
    hint: 'คิดและเคลื่อนไหวแตะเป้าหมายที่สมเหตุสมผลที่สุด',
    explanation: 'การกระโดดเชือกหรือวิ่งความเข้มข้นปานกลาง-สูงจะเผาผลาญประมาณ 100 kcal ต่อ 10 นาที',
    options: [
      { label: '10 kcal', isCorrect: false, x: 25, y: 40, action: 'ซ้าย' },
      { label: '100 kcal', isCorrect: true, x: 75, y: 40, action: 'ขวา' },
      { label: '500 kcal', isCorrect: false, x: 50, y: 80, action: 'ล่าง' },
    ]
  }
];

export interface TacticalScenario {
  id: string;
  title: string;
  sport: string;
  situation: string;
  objective: string;
  diagramElements: {
    type: 'teammate_open' | 'opponent_block' | 'empty_lane' | 'target_goal';
    label: string;
    x: number;
    y: number;
    isOptimalDecision: boolean;
    feedback: string;
  }[];
}

export const TACTICAL_SCENARIOS: TacticalScenario[] = [
  {
    id: 'sc-1',
    title: 'สถานการณ์ที่ 1: การเลือกส่งบอลในจังหวะโต้กลับเร็ว (Fast Break)',
    sport: 'บาสเกตบอล / แชร์บอล',
    situation: 'คุณครองบอลอยู่ตรงกลาง คู่ต่อสู้วิ่งเข้ามาประชิดตรงหน้า มีเพื่อนร่วมทีม 2 คนวิ่งขึ้นหน้า',
    objective: 'ตัดสินใจส่งบอลไปยังจุดที่เปิดว่างและได้เปรียบที่สุด!',
    diagramElements: [
      {
        type: 'opponent_block',
        label: 'คู่ต่อสู้ดักหน้า',
        x: 50,
        y: 45,
        isOptimalDecision: false,
        feedback: '❌ ถูกบล็อก! ฝืนส่งตรงกลางจะโดนตัดบอล (Interception)'
      },
      {
        type: 'teammate_open',
        label: 'เพื่อนปีกขวา (ไม่มีคนประกบ)',
        x: 80,
        y: 30,
        isOptimalDecision: true,
        feedback: '✅ ยอดเยี่ยม! ส่งบอลไปยังพื้นที่ว่าง ปีกขวามีโอกาสทำคะแนนสูงที่สุด'
      },
      {
        type: 'teammate_open',
        label: 'เพื่อนปีกซ้าย (มีคนตามประกบชิด)',
        x: 20,
        y: 35,
        isOptimalDecision: false,
        feedback: '⚠️ เสี่ยงสูง! เพื่อนปีกซ้ายมีกองหลังประกบชิด มีโอกาสเสียบอล'
      }
    ]
  },
  {
    id: 'sc-2',
    title: 'สถานการณ์ที่ 2: การป้องกันลูกตบในวอลเลย์บอล (Defense & Cover)',
    sport: 'วอลเลย์บอล',
    situation: 'ตัวตบคู่ต่อสู้ขึ้นตบจากหัวเสา บล็อกเกอร์ของเราปิดมุมตรงไว้แล้ว',
    objective: 'ตัดสินใจเคลื่อนที่ไปปิดตำแหน่งมุมทแยง (Cross-court) หรือแดนหลัง!',
    diagramElements: [
      {
        type: 'empty_lane',
        label: 'แดนทแยงมุมคอร์ท (Cross-court)',
        x: 25,
        y: 65,
        isOptimalDecision: true,
        feedback: '✅ ถูกต้อง! เมื่อบล็อกเกอร์ปิดมุมตรง บอลมีโอกาสมามุมทแยงมากที่สุด'
      },
      {
        type: 'empty_lane',
        label: 'หลังบล็อกเกอร์มุมตรง',
        x: 75,
        y: 60,
        isOptimalDecision: false,
        feedback: '❌ ทับตำแหน่ง! บล็อกเกอร์ปิดมุมนี้อยู่แล้ว โซนอื่นจึงเปิดโล่ง'
      },
      {
        type: 'opponent_block',
        label: 'ตัวตบคู่แข่ง',
        x: 75,
        y: 20,
        isOptimalDecision: false,
        feedback: '⚠️ จุดตบของคู่แข่ง ห้ามยืนชิดตาข่ายเกินไป'
      }
    ]
  },
  {
    id: 'sc-3',
    title: 'สถานการณ์ที่ 3: การหาพื้นที่ว่างเพื่อรับบอล (Creating Space)',
    sport: 'ฟุตซอล / ฟุตบอล',
    situation: 'เพื่อนร่วมทีมกำลังโดนรุม 2 ต่อ 1 คุณควรเคลื่อนที่ไปช่วยเพื่อเป็นทางเลือกในการจ่ายบอล',
    objective: 'เคลื่อนที่ตัดเข้าไปยังช่องว่างรูปสามเหลี่ยม (Passing Triangle)!',
    diagramElements: [
      {
        type: 'empty_lane',
        label: 'ช่องทางส่งสามเหลี่ยม (Open Pocket)',
        x: 50,
        y: 32,
        isOptimalDecision: true,
        feedback: '✅ ยอดเยี่ยม! การสร้างรูปสามเหลี่ยมทำให้เพื่อนจ่ายบอลง่ายและหนีการเพรสซิ่งได้'
      },
      {
        type: 'teammate_open',
        label: 'ยืนนิ่งที่เดิม',
        x: 18,
        y: 70,
        isOptimalDecision: false,
        feedback: '❌ อยู่ไกลเกินไปและมีมุมส่งที่แคบ เพื่อนอาจเสียบอล'
      },
      {
        type: 'opponent_block',
        label: 'วิ่งไปติดกองหลัง',
        x: 82,
        y: 60,
        isOptimalDecision: false,
        feedback: '❌ วิ่งเข้าหาตัวประกบทำให้ไม่สามารถรับบอลได้'
      }
    ]
  }
];
