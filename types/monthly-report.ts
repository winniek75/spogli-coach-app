export interface MonthlyReport {
  id: string
  student_id: string
  year: number
  month: number
  coach_note?: string

  // 基本情報（生徒データから取得）
  student_name: string
  student_age: number
  student_level: number
  school: 'ageo' | 'okegawa'
  enrollment_date: string
  photo_url?: string

  // 出席情報
  attendance_count: number
  total_lessons: number
  attendance_rate: number

  // レベル・Certification情報
  current_level: {
    level: number
    title: string
    description: string
    badge_type: 'star' | 'shield' | 'crown'
    next_level_months: number
    next_certification_date: string
    is_on_track: boolean
    expected_level: number
    months_since_enrollment: number
  }

  // 今月のスキル評価
  skill_evaluation: {
    sport: string
    sport_emoji: string
    evaluation_count: number
    skills: SkillEvaluation[]
    training_averages: {
      vision: number
      rhythm: number
      coordination: number
    }
  }

  // バッジ状況
  badges: {
    earned: EarnedBadge[]
    in_progress: InProgressBadge[]
    potential: InProgressBadge[]
  }

  // 成長まとめ・チャレンジ
  growth_summary: {
    achievements: string[]
    next_challenges: string[]
  }

  // メタ情報
  generated_at: string
  generated_by: string
  is_finalized: boolean
}

export interface SkillEvaluation {
  category: 'vision' | 'rhythm' | 'coordination'
  skill_name: string
  rating: 1 | 2 | 3
  category_color: string
}

export interface EarnedBadge {
  sport: string
  category: string
  badge_type: 'star' | 'shield' | 'crown'
  earned_date: string
  icon: string
}

export interface InProgressBadge {
  sport: string
  category: string
  badge_type: 'star' | 'shield' | 'crown'
  current_count: number
  required_count: number
  progress_percentage: number
  icon: string
  is_potential?: boolean
}

export interface CreateMonthlyReportRequest {
  student_id: string
  year: number
  month: number
  coach_note?: string
  growth_summary?: {
    achievements: string[]
    next_challenges: string[]
  }
}

export interface UpdateMonthlyReportRequest {
  coach_note?: string
  growth_summary?: {
    achievements: string[]
    next_challenges: string[]
  }
  is_finalized?: boolean
}

// レポート生成用のヘルパー型
export interface MonthlyReportData {
  student: {
    id: string
    name: string
    name_kana?: string
    birth_date: string
    level: number
    school: 'ageo' | 'okegawa'
    enrollment_date: string
    photo_url?: string
  }
  attendance: {
    count: number
    total: number
    rate: number
  }
  evaluations: {
    sport: string
    training_type: 'vision' | 'rhythm' | 'coordination'
    skill_item_id: string
    rating: 1 | 2 | 3
    lesson_date: string
  }[]
  badges: {
    id: string
    sport: string
    category: string
    badge_type: 'star' | 'shield' | 'crown'
    earned_date?: string
    ceremony_completed: boolean
  }[]
}

// スポーツの絵文字マッピング
export const SPORT_EMOJIS = {
  volleyball: '🏐',
  basketball: '🏀',
  soccer: '⚽',
  tennis: '🎾',
  baseball: '⚾',
  rugby: '🏉'
} as const

// トレーニング種別の色とアイコン
export const TRAINING_TYPE_CONFIG = {
  vision: {
    color: '#3b82f6',
    icon: '👁',
    name: 'Vision'
  },
  rhythm: {
    color: '#a855f7',
    icon: '🎵',
    name: 'Rhythm'
  },
  coordination: {
    color: '#22c55e',
    icon: '🤸',
    name: 'Coordination'
  }
} as const

// バッジタイプのアイコン
export const BADGE_TYPE_ICONS = {
  star: '⭐',
  shield: '🛡',
  crown: '👑'
} as const