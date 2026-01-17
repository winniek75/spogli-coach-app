export interface MissionItem {
  id: string
  mission_sheet_id: string
  category: string
  skill_item_id?: string
  target_description: string
  success_criteria: string
  completed_at?: string
  completion_notes?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface MissionSheet {
  id: string
  student_id: string
  coach_id: string
  lesson_date: string
  school: 'ageo' | 'okegawa'
  sport: string
  title: string
  description?: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface MissionSheetWithDetails extends MissionSheet {
  student?: {
    id: string
    name: string
    level: number
    age?: number
  }
  coach?: {
    id: string
    name: string
  }
  mission_items?: MissionItem[]
  completion_rate?: number
}

export interface CreateMissionSheetRequest {
  student_id: string
  coach_id: string
  lesson_date: string
  school: 'ageo' | 'okegawa'
  sport: string
  title?: string
  description?: string
  mission_items: CreateMissionItemRequest[]
}

export interface CreateMissionItemRequest {
  category: string
  skill_item_id?: string
  target_description: string
  success_criteria: string
  order_index?: number
}

export interface UpdateMissionSheetRequest {
  title?: string
  description?: string
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled'
}

export interface UpdateMissionItemRequest {
  target_description?: string
  success_criteria?: string
  completed?: boolean
  completion_notes?: string
  order_index?: number
}

// スキルカテゴリの定義
export const SKILL_CATEGORIES = {
  technical: '技術',
  physical: '体力・運動能力',
  mental: 'メンタル',
  teamwork: 'チームワーク',
  communication: 'コミュニケーション',
  strategy: '戦略・戦術',
  safety: '安全性',
} as const

// スポーツ別のスキル項目定義
export const SPORT_SKILLS = {
  soccer: {
    technical: [
      'ボールキック',
      'ドリブル',
      'パス',
      'トラップ',
      'シュート',
      'ヘディング',
    ],
    physical: [
      'スプリント',
      '持久力',
      'アジリティ',
      'バランス',
      'ジャンプ',
    ],
    mental: [
      '集中力',
      '判断力',
      '積極性',
      '忍耐力',
    ],
    teamwork: [
      '協力',
      'ポジション理解',
      'サポート',
    ],
    communication: [
      '声かけ',
      '英語でのコミュニケーション',
    ],
    strategy: [
      '戦術理解',
      '状況判断',
    ],
    safety: [
      'ルール理解',
      '安全な接触',
    ],
  },
  basketball: {
    technical: [
      'シューティング',
      'ドリブル',
      'パス',
      'レイアップ',
      'リバウンド',
      'ディフェンス',
    ],
    physical: [
      'ジャンプ力',
      'スピード',
      '持久力',
      'アジリティ',
    ],
    mental: [
      '集中力',
      '判断力',
      '積極性',
    ],
    teamwork: [
      'チームプレー',
      'スクリーン',
      'ポジション',
    ],
    communication: [
      '声かけ',
      '英語でのコミュニケーション',
    ],
    strategy: [
      'オフェンス戦術',
      'ディフェンス戦術',
    ],
    safety: [
      'ルール理解',
      'コンタクト',
    ],
  },
  baseball: {
    technical: [
      'バッティング',
      'ピッチング',
      'キャッチング',
      'スローイング',
      'フィールディング',
    ],
    physical: [
      '反応速度',
      '筋力',
      '柔軟性',
      '持久力',
    ],
    mental: [
      '集中力',
      '状況判断',
      '積極性',
    ],
    teamwork: [
      'チームプレー',
      'バックアップ',
      'サイン',
    ],
    communication: [
      '声かけ',
      '英語でのコミュニケーション',
    ],
    strategy: [
      '作戦理解',
      'ポジション戦略',
    ],
    safety: [
      'ルール理解',
      '危険回避',
    ],
  },
} as const

// 成功基準のテンプレート
export const SUCCESS_CRITERIA_TEMPLATES = [
  '3回中2回以上成功する',
  '5回連続で成功する',
  '正しいフォームで実行できる',
  '指示なしで自分で判断して実行できる',
  '他の生徒に教えることができる',
  '試合形式で実践できる',
  '英語の指示を理解して実行できる',
  '積極的に取り組む姿勢を見せる',
] as const