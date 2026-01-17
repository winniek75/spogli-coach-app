export interface Student {
  id: string
  name: string
  name_kana?: string
  name_en?: string
  birth_date: string
  gender: 'male' | 'female' | 'other'
  level: number
  enrollment_date: string
  school: 'ageo' | 'okegawa'
  class_type: 'preschool' | 'elementary'
  parent_name: string
  parent_email?: string
  parent_phone?: string
  line_id?: string
  emergency_contact?: string
  medical_notes?: string
  photo_url?: string
  notes?: string
  status: 'active' | 'inactive' | 'withdrawn'
  withdrawal_date?: string
  withdrawal_reason?: string
  created_at: string
  updated_at: string
}

export interface CreateStudentRequest {
  name: string
  name_kana?: string
  name_en?: string
  birth_date: string
  gender: 'male' | 'female' | 'other'
  level?: number
  enrollment_date: string
  school: 'ageo' | 'okegawa'
  class_type: 'preschool' | 'elementary'
  parent_name: string
  parent_email?: string
  parent_phone?: string
  line_id?: string
  emergency_contact?: string
  medical_notes?: string
  notes?: string
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  status?: 'active' | 'inactive' | 'withdrawn'
  withdrawal_date?: string
  withdrawal_reason?: string
}

export interface Evaluation {
  id: string
  student_id: string
  lesson_id?: string
  lesson_date: string
  coach_id: string
  school: 'ageo' | 'okegawa'
  training_type: 'vision' | 'rhythm' | 'coordination'
  sport: string
  category: string
  skill_item_id: string
  rating: 1 | 2 | 3
  notes?: string
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  student_id: string
  sport: string
  category: string
  badge_type: 'star' | 'shield' | 'crown'
  earned_date: string
  awarded_date?: string
  awarded_by?: string
  ceremony_completed: boolean
  notes?: string
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  lesson_id?: string
  lesson_date: string
  school: 'ageo' | 'okegawa'
  status: 'present' | 'absent' | 'late'
  created_at: string
}

export interface StudentWithDetails extends Student {
  age: number
  level_title: string
  latest_evaluations: Evaluation[]
  badges: Badge[]
  attendance_rate: number
}

export interface CreateEvaluationRequest {
  student_id: string
  lesson_id?: string
  lesson_date: string
  coach_id: string
  school: 'ageo' | 'okegawa'
  training_type: 'vision' | 'rhythm' | 'coordination'
  sport: string
  category: string
  skill_item_id: string
  rating: 1 | 2 | 3
  notes?: string
}

export interface CreateAttendanceRequest {
  student_id: string
  lesson_id?: string
  lesson_date: string
  school: 'ageo' | 'okegawa'
  status?: 'present' | 'absent' | 'late'
}

// レベル定義
export const LEVELS = {
  1: { title: 'Rookie', badge: 'star', period: '年少前半', description: '基本動作の習得' },
  2: { title: 'Challenger', badge: 'star', period: '年少後半', description: '積極的なチャレンジ' },
  3: { title: 'Adventurer', badge: 'shield', period: '年中前半', description: '応用動作の挑戦' },
  4: { title: 'Explorer', badge: 'shield', period: '年中後半', description: 'スキルの深化' },
  5: { title: 'Champion', badge: 'crown', period: '年長前半', description: 'リーダーシップ発揮' },
  6: { title: 'Master', badge: 'crown', period: '年長後半', description: '総合的な成長完了' },
} as const

// スポーツ・スキル項目の定義
export interface SkillItem {
  id: string
  sport: string
  category: string
  name_ja: string
  name_en: string
  description: string
  level: number
  order: number
}

// ミッションシート用
export interface MissionSheet {
  id: string
  lesson_date: string
  school: 'ageo' | 'okegawa'
  class_type: 'preschool' | 'elementary'
  sport: string
  training_type: 'vision' | 'rhythm' | 'coordination'
  students: {
    student_id: string
    student: Pick<Student, 'id' | 'name' | 'level'>
    evaluations: Evaluation[]
  }[]
  coach_id: string
  created_at: string
  updated_at: string
}