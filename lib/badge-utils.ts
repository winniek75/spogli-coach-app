/**
 * バッジ進捗計算ユーティリティ v3.0
 *
 * バッジ獲得条件:
 * 【未就学児 preschool】 全5カテゴリで 指定スキル(1項目)達成 + ⭐⭐⭐×1回以上
 * 【小学生 elementary】  全5カテゴリで 指定スキル(2項目)達成（⭐⭐⭐は条件に含まない）
 *                        ※ 例外カテゴリ（グリップ・構え / トライ）は1項目のみ
 */

import type {
  SportKey,
  BadgeType,
  BadgeProgress,
  BadgeCategoryProgress,
  SportBadge,
} from '@/types/badge'
import {
  getBadgeTypeFromLevel,
  generateBadgeLabel,
  SPORT_SCHEDULE,
} from '@/types/badge'
import { SPORT_BADGE_CONDITIONS, getAllSkillsForSport } from '@/data/skill-items'
import type { Evaluation } from '@/types/student'

// ============================================================
// バッジ進捗チェック
// ============================================================

/**
 * 生徒の評価履歴からバッジ進捗を計算する
 *
 * @param studentId       生徒ID
 * @param sport           スポーツキー
 * @param classType       クラスタイプ (preschool | elementary)
 * @param evaluations     その生徒の全評価履歴
 * @returns BadgeProgress
 */
export function computeBadgeProgress(
  studentId: string,
  sport: SportKey,
  classType: 'preschool' | 'elementary',
  evaluations: Evaluation[]
): BadgeProgress {
  const conditionMap = SPORT_BADGE_CONDITIONS[sport][classType]
  const categories: Record<string, BadgeCategoryProgress> = {}

  // スポーツに関連する評価のみフィルタ
  const sportEvals = evaluations.filter(e => e.sport === sport)

  for (const [category, requiredSkillIds] of Object.entries(conditionMap)) {
    const categoryEvals = sportEvals.filter(e => e.category === category)

    // 達成済み条件スキルID（rating=3 の評価があるもの）
    const achievedSkillIds = requiredSkillIds.filter(skillId =>
      categoryEvals.some(e => e.skill_item_id === skillId && e.rating === 3)
    )

    // ⭐⭐⭐達成フラグ（preschool用: 全スキル中いずれかでrating=3）
    const hasTripleStar = classType === 'preschool'
      ? categoryEvals.some(e => e.rating === 3)
      : false

    // カテゴリ条件クリア判定
    const isComplete = classType === 'preschool'
      ? achievedSkillIds.length >= requiredSkillIds.length && hasTripleStar
      : achievedSkillIds.length >= requiredSkillIds.length

    categories[category] = {
      requiredSkillIds,
      achievedSkillIds,
      hasTripleStar,
      isComplete,
    }
  }

  // 全カテゴリクリア判定
  const allCategoriesComplete = Object.values(categories).every(c => c.isComplete)

  return {
    studentId,
    sport,
    classType,
    categories,
    allCategoriesComplete,
    badgeEarnedAt: allCategoriesComplete ? new Date().toISOString().split('T')[0] : undefined,
  }
}

// ============================================================
// バッジ生成
// ============================================================

/**
 * バッジ進捗からSportBadgeレコードを生成する（DB挿入用）
 *
 * @param progress          バッジ進捗
 * @param studentLevel      生徒の現在レベル（バッジタイプ決定に使用）
 * @param earnedDate        条件達成日
 * @param occurrenceNumber  同スポーツ何回目の取得か
 */
export function createSportBadgeRecord(
  progress: BadgeProgress,
  studentLevel: number,
  earnedDate: string,
  occurrenceNumber: number
): Omit<SportBadge, 'id' | 'created_at'> {
  return {
    student_id:          progress.studentId,
    sport:               progress.sport,
    student_class_type:  progress.classType,
    badge_label:         generateBadgeLabel(progress.sport, progress.classType),
    badge_type:          getBadgeTypeFromLevel(studentLevel),
    occurrence_number:   occurrenceNumber,
    earned_date:         earnedDate,
    awarded_date:        undefined,
    awarded_by:          undefined,
    ceremony_completed:  false,
    report_printed:      false,
  }
}

// ============================================================
// 月末バッジチェック（月次集計用）
// ============================================================

/**
 * 今月のスポーツを取得する
 */
export function getCurrentMonthSport(): { sport: SportKey; name: string; icon: string } {
  const month = new Date().getMonth() + 1
  return SPORT_SCHEDULE[month]
}

/**
 * 指定月のスポーツを取得する
 */
export function getSportForMonth(month: number): { sport: SportKey; name: string; icon: string } {
  return SPORT_SCHEDULE[month]
}

/**
 * バッジ獲得待ちの生徒（全カテゴリクリア済み・未授与）を特定する
 * ダッシュボードのアラート表示に使用
 */
export function filterBadgeReadyStudents(
  progresses: (BadgeProgress & { studentName: string; existingBadges: SportBadge[] })[]
): (BadgeProgress & { studentName: string; existingBadges: SportBadge[] })[] {
  return progresses.filter(p => {
    if (!p.allCategoriesComplete) return false
    // 今期すでにバッジを授与済みかチェック（年度内2回まで）
    const currentYear = new Date().getFullYear()
    const awarded = p.existingBadges.filter(
      b => b.sport === p.sport && new Date(b.earned_date).getFullYear() === currentYear
    )
    return awarded.length < 2
  })
}

// ============================================================
// 進捗表示ヘルパー
// ============================================================

/**
 * カテゴリの達成率（%）を返す
 */
export function getCategoryProgress(cat: BadgeCategoryProgress): number {
  if (cat.requiredSkillIds.length === 0) return 0
  return Math.round((cat.achievedSkillIds.length / cat.requiredSkillIds.length) * 100)
}

/**
 * スポーツ全体の達成カテゴリ数を返す
 */
export function getCompletedCategoryCount(progress: BadgeProgress): number {
  return Object.values(progress.categories).filter(c => c.isComplete).length
}

/**
 * スポーツの総カテゴリ数を返す
 */
export function getTotalCategoryCount(progress: BadgeProgress): number {
  return Object.keys(progress.categories).length
}

/**
 * バッジタイプのラベルとアイコンを返す
 */
export function getBadgeDisplay(type: BadgeType): { label: string; icon: string } {
  const map: Record<BadgeType, { label: string; icon: string }> = {
    star:   { label: 'スター',   icon: '⭐' },
    shield: { label: 'シールド', icon: '🛡️' },
    crown:  { label: 'クラウン', icon: '👑' },
  }
  return map[type]
}

/**
 * Certification レベルアップ提案チェック
 * @param totalLessons 累計レッスン数
 * @param plan         'monthly' | 'ticket'
 */
export function shouldSuggestLevelUp(
  totalLessons: number,
  plan: 'monthly' | 'ticket'
): boolean {
  const threshold = plan === 'monthly' ? 24 : 20
  return totalLessons > threshold
}
