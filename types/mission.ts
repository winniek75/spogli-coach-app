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
  mission_items?: any[]
}

export interface UpdateMissionItemRequest {
  target_description?: string
  success_criteria?: string
  completed?: boolean
  completion_notes?: string
  order_index?: number
}

// スポーツ別カテゴリ表示名（data/skill-items/ のカテゴリキーと対応）
export const SPORT_CATEGORIES: Record<string, Record<string, string>> = {
  soccer: {
    kick:     'キック',
    dribble:  'ドリブル',
    pass:     'パス',
    trap:     'トラップ',
    shoot:    'シュート',
  },
  basketball: {
    dribble:  'ドリブル',
    pass:     'パス',
    catch:    'キャッチ',
    shoot:    'シュート',
    defense:  'ディフェンス',
  },
  baseball: {
    throw:       'スロー',
    catch:       'キャッチ',
    hit:         'バッティング',
    baseRunning: '走塁',
    defense:     'ディフェンス',
  },
  volleyball: {
    catch:     'キャッチ',
    toss:      'トス',
    underhand: 'アンダーハンド',
    serve:     'サーブ',
    teamPlay:  'チームプレー',
  },
  tennis: {
    grip:     'グリップ・構え',
    forehand: 'フォアハンド',
    backhand: 'バックハンド',
    serve:    'サーブ',
    rally:    'ラリー',
  },
  rugby: {
    running:    'ランニング',
    pass:       'パス',
    catch:      'キャッチ',
    tagDefense: 'タグディフェンス',
    tryScoring: 'トライ',
  },
}

// スポーツ表示名
export const SPORT_LABELS: Record<string, string> = {
  soccer:     'サッカー',
  basketball: 'バスケットボール',
  baseball:   '野球',
  volleyball: 'バレーボール',
  tennis:     'テニス',
  rugby:      'タグラグビー',
}

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