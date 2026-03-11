// ============================================================
// バッジシステム v3.0
// スポーツ単位バッジ（最大6種 × 複数回獲得可能）
// 年齢別2トラック: preschool(Cトラック) / elementary(Bトラック)
// ============================================================

/**
 * スポーツバッジ（v3.0 スポーツ単位）
 *
 * 【未就学児 preschool】Cトラック
 *   条件: 全5カテゴリで 指定スキル(1項目)達成 + ⭐⭐⭐×1回以上
 *   バッジ名: '{スポーツ名} KIDS'
 *
 * 【小学生 elementary】Bトラック
 *   条件: 全5カテゴリで 指定スキル(2項目)達成（⭐⭐⭐は条件に含まない）
 *   バッジ名: '{スポーツ名}'
 *
 * 年2回まで同スポーツで再獲得可能
 * バッジ形状はCertification Lvから自動決定: Lv1-2→STAR / Lv3-4→SHIELD / Lv5-6→CROWN
 */
export interface SportBadge {
  id: string
  student_id: string
  sport: SportKey
  student_class_type: 'preschool' | 'elementary'  // 取得時点のクラス区分
  badge_label: string        // 例: 'サッカー KIDS' / 'サッカー'
  badge_type: BadgeType      // Lvから自動決定
  occurrence_number: number  // 同スポーツ何回目の取得か（1, 2, 3...）
  earned_date: string        // 条件達成日（月末集計時）
  awarded_date?: string      // 実際の授与日（翌月最初のレッスン冒頭）
  awarded_by?: string        // coachId
  ceremony_completed: boolean
  report_printed: boolean    // 月次レポート配布済み
  notes?: string
  created_at: string
}

export interface SportBadgeWithStudent extends SportBadge {
  student?: {
    id: string
    name: string
    level: number
    school?: string
    class_type?: string
  }
}

export interface CreateSportBadgeRequest {
  student_id: string
  sport: SportKey
  student_class_type: 'preschool' | 'elementary'
  badge_label: string
  badge_type: BadgeType
  occurrence_number: number
  earned_date: string
  notes?: string
}

export interface AwardSportBadgeRequest {
  awarded_date?: string
  awarded_by?: string
  ceremony_completed?: boolean
  report_printed?: boolean
  notes?: string
}

// ============================================================
// バッジ条件スキル定義
// ============================================================

/**
 * バッジ条件スキル（スポーツ × カテゴリ × 年齢トラック別）
 */
export interface BadgeConditionSkill {
  sport: SportKey
  category: string
  classType: 'preschool' | 'elementary'
  requiredSkillIds: string[]  // preschool: 1項目 / elementary: 2項目（例外あり）
}

/**
 * スキル項目（バッジ条件フラグ付き）
 */
export interface SkillItemWithBadge {
  id: string
  order: number
  descriptionJa: string
  descriptionEn: string
  englishPhrase: string
  level: number
  badgeCondition: {
    preschool: boolean   // 未就学児バッジ条件スキルか
    elementary: 0 | 1 | 2  // 0=条件なし / 1=小学生①必須 / 2=小学生②必須
  }
}

// ============================================================
// バッジ進捗
// ============================================================

/**
 * バッジ進捗状況（生徒×スポーツ×クラスタイプ単位のリアルタイム計算）
 */
export interface BadgeProgress {
  studentId: string
  sport: SportKey
  classType: 'preschool' | 'elementary'
  categories: {
    [category: string]: BadgeCategoryProgress
  }
  allCategoriesComplete: boolean  // 全5カテゴリクリア → バッジ獲得
  badgeEarnedAt?: string
}

export interface BadgeCategoryProgress {
  requiredSkillIds: string[]
  achievedSkillIds: string[]       // 達成済み条件スキル
  hasTripleStar: boolean           // ⭐⭐⭐達成フラグ（preschoolのみ使用）
  isComplete: boolean              // このカテゴリの条件クリア
}

// ============================================================
// 定数
// ============================================================

export type SportKey = 'soccer' | 'basketball' | 'baseball' | 'volleyball' | 'tennis' | 'rugby'
export type BadgeType = 'star' | 'shield' | 'crown'

export const SPORT_KEYS: SportKey[] = ['soccer', 'basketball', 'baseball', 'volleyball', 'tennis', 'rugby']

/** レベルからバッジタイプを決定 */
export function getBadgeTypeFromLevel(level: number): BadgeType {
  if (level <= 2) return 'star'
  if (level <= 4) return 'shield'
  return 'crown'
}

/** バッジラベルを生成 */
export function generateBadgeLabel(sport: SportKey, classType: 'preschool' | 'elementary'): string {
  const sportNames: Record<SportKey, string> = {
    soccer:     'サッカー',
    basketball: 'バスケットボール',
    baseball:   '野球',
    volleyball: 'バレーボール',
    tennis:     'テニス',
    rugby:      'タグラグビー',
  }
  const name = sportNames[sport] ?? sport
  return classType === 'preschool' ? `${name} KIDS` : name
}

export const BADGE_TYPES: Record<BadgeType, { title: string; description: string; color: string; icon: string }> = {
  star: {
    title: 'スターバッジ',
    description: 'レベル1-2の生徒が獲得',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⭐',
  },
  shield: {
    title: 'シールドバッジ',
    description: 'レベル3-4の生徒が獲得',
    color: 'bg-blue-100 text-blue-800',
    icon: '🛡️',
  },
  crown: {
    title: 'クラウンバッジ',
    description: 'レベル5-6の生徒が獲得',
    color: 'bg-purple-100 text-purple-800',
    icon: '👑',
  },
}

/** バッジ獲得条件ルール */
export const BADGE_CONDITIONS = {
  preschool: {
    description: '全5カテゴリで 指定スキル(1項目)達成 + ⭐⭐⭐×1回以上',
    requiredSkillsPerCategory: 1,
    requiresTripleStar: true,
  },
  elementary: {
    description: '全5カテゴリで 指定スキル(2項目)達成（⭐⭐⭐は条件に含まない）',
    requiredSkillsPerCategory: 2,
    requiresTripleStar: false,
  },
} as const

/** Certification レベルアップ条件 */
export const CERTIFICATION_RULES = {
  monthly: {
    lessonThreshold: 24,  // 月謝制: 累計24回超でレベルアップ提案
    description: '月謝制（月4回 × 6ヶ月 = 24回超）',
  },
  ticket: {
    lessonThreshold: 20,  // チケット制: 累計20回超でレベルアップ提案
    description: 'チケット制（初回8枚 + 追加4枚 × 3回 = 20回超）',
  },
} as const

/** スポーツスケジュール（月別） */
export const SPORT_SCHEDULE: Record<number, { sport: SportKey; name: string; icon: string }> = {
  1:  { sport: 'volleyball',  name: 'バレーボール',        icon: '🏐' },
  2:  { sport: 'tennis',      name: 'テニス/ネオテニス',    icon: '🎾' },
  3:  { sport: 'rugby',       name: 'タグラグビー',         icon: '🏉' },
  4:  { sport: 'baseball',    name: '野球/ベースボール5',   icon: '⚾' },
  5:  { sport: 'soccer',      name: 'サッカー',             icon: '⚽' },
  6:  { sport: 'basketball',  name: 'バスケットボール',     icon: '🏀' },
  7:  { sport: 'volleyball',  name: 'バレーボール',         icon: '🏐' },
  8:  { sport: 'tennis',      name: 'テニス/ネオテニス',    icon: '🎾' },
  9:  { sport: 'rugby',       name: 'タグラグビー',         icon: '🏉' },
  10: { sport: 'baseball',    name: '野球/ベースボール5',   icon: '⚾' },
  11: { sport: 'soccer',      name: 'サッカー',             icon: '⚽' },
  12: { sport: 'basketball',  name: 'バスケットボール',     icon: '🏀' },
}
