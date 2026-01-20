export interface LessonMenu {
  id: string
  title: string
  description?: string
  sport: string
  level: number
  duration_minutes: number
  max_participants?: number
  equipment?: string[]
  objectives: string[]
  activities: LessonActivity[]
  tags?: string[]
  notes?: string
  is_public: boolean
  is_template: boolean
  monthly_type?: 'monthly' | 'single' // 月次プログラムか単発レッスンか
  weeks?: WeeklyProgram[] // 月次プログラムの週構造
  created_by: string
  created_at: string
  updated_at: string
}

export interface LessonActivity {
  id: string
  lesson_menu_id?: string
  name: string
  description?: string
  duration_minutes: number
  activity_type?: string
  instructions?: string[]
  equipment?: string[]
  safety_notes?: string
  variations?: string[]
  order_index: number
  video_reference?: string // 動画コンテンツへの参照
}

export interface WeeklyProgram {
  week: number
  title: string
  description: string
  video_content?: {
    id: string
    title: string
    duration_minutes: number
  }
  activities: LessonActivity[]
}

export interface VideoContent {
  id: string
  title: string
  description?: string
  sport: string
  level: number
  duration_minutes: number
  thumbnail_url?: string
  video_url?: string
  category: string
  tags: string[]
}

export interface LessonMenuWithDetails extends LessonMenu {
  created_by_name?: string
  usage_count?: number
  favorite_count?: number
  last_used_date?: string
}

export interface CreateLessonMenuRequest {
  title: string
  description?: string
  sport: string
  level: number
  duration_minutes: number
  max_participants: number
  equipment_needed?: string[]
  objectives: string[]
  activities: CreateLessonActivityRequest[]
  notes?: string
  is_public: boolean
  is_template: boolean
}

export interface CreateLessonActivityRequest {
  title: string
  description?: string
  duration_minutes: number
  activity_type: string
  instructions?: string[]
  equipment?: string[]
  safety_notes?: string
  variations?: string[]
  order_index: number
}

export interface UpdateLessonMenuRequest {
  title?: string
  description?: string
  sport?: string
  level?: number
  duration_minutes?: number
  max_participants?: number
  equipment_needed?: string[]
  objectives?: string[]
  notes?: string
  is_public?: boolean
  is_template?: boolean
}

export interface UpdateLessonActivityRequest {
  title?: string
  description?: string
  duration_minutes?: number
  activity_type?: string
  instructions?: string[]
  equipment?: string[]
  safety_notes?: string
  variations?: string[]
  order_index?: number
}

// アクティビティタイプの定義
export const ACTIVITY_TYPES = {
  warmup: 'ウォーミングアップ',
  technical_drill: '技術練習',
  tactical_drill: '戦術練習',
  physical_training: '体力トレーニング',
  scrimmage: '試合形式',
  cooldown: 'クールダウン',
  stretching: 'ストレッチ',
  skill_game: 'スキルゲーム',
  conditioning: 'コンディショニング',
} as const

// 必要器具の定義
export const COMMON_EQUIPMENT = {
  soccer: [
    'ボール',
    'コーン',
    'マーカー',
    'ラダー',
    'ハードル',
    'ゴール',
    'ビブス',
    'ストップウォッチ',
    'ホイッスル',
    'メディシンボール',
  ],
  basketball: [
    'ボール',
    'コーン',
    'マーカー',
    'ラダー',
    'ハードル',
    'バスケットゴール',
    'ビブス',
    'ストップウォッチ',
    'ホイッスル',
    'メディシンボール',
  ],
  baseball: [
    'ボール',
    'バット',
    'グローブ',
    'コーン',
    'マーカー',
    'ベース',
    'ティー',
    'ネット',
    'ビブス',
    'ストップウォッチ',
    'ホイッスル',
  ],
} as const

// レッスン目標のテンプレート
export const LESSON_OBJECTIVES_TEMPLATES = {
  technical: [
    'ボールコントロールの向上',
    'パス精度の向上',
    'シュート技術の習得',
    'ドリブル技術の向上',
    '基本技術の定着',
  ],
  tactical: [
    'ポジショニングの理解',
    'チーム戦術の習得',
    '状況判断力の向上',
    'コミュニケーションの向上',
    'ゲーム理解の深化',
  ],
  physical: [
    '基礎体力の向上',
    'スピード・アジリティの向上',
    '持久力の向上',
    'バランス感覚の向上',
    '柔軟性の向上',
  ],
  mental: [
    '集中力の向上',
    '自信の向上',
    'チームワークの向上',
    '積極性の向上',
    '忍耐力の向上',
  ],
} as const