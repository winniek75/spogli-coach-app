import { soccerSkills, soccerBadgeConditions } from './soccer'
import { basketballSkills, basketballBadgeConditions } from './basketball'
import { baseballSkills, baseballBadgeConditions } from './baseball'
import { volleyballSkills, volleyballBadgeConditions } from './volleyball'
import { tennisSkills, tennisBadgeConditions } from './tennis'
import { rugbySkills, rugbyBadgeConditions } from './rugby'
import type { SkillItemWithBadge } from '@/types/badge'
import type { SportKey } from '@/types/badge'

export type { SkillItemWithBadge }

/** スポーツ別スキル項目マップ */
export const SPORT_SKILLS: Record<SportKey, Record<string, SkillItemWithBadge[]>> = {
  soccer:     soccerSkills,
  basketball: basketballSkills,
  baseball:   baseballSkills,
  volleyball: volleyballSkills,
  tennis:     tennisSkills,
  rugby:      rugbySkills,
}

/** スポーツ別バッジ条件スキルIDマップ */
export const SPORT_BADGE_CONDITIONS: Record<SportKey, {
  preschool: Record<string, string[]>
  elementary: Record<string, string[]>
}> = {
  soccer:     soccerBadgeConditions,
  basketball: basketballBadgeConditions,
  baseball:   baseballBadgeConditions,
  volleyball: volleyballBadgeConditions,
  tennis:     tennisBadgeConditions,
  rugby:      rugbyBadgeConditions,
}

/**
 * 指定スポーツの全スキル項目をフラットに返す
 */
export function getAllSkillsForSport(sport: SportKey): SkillItemWithBadge[] {
  const sportSkills = SPORT_SKILLS[sport]
  return Object.values(sportSkills).flat()
}

/**
 * スキルIDからスキル項目を検索する
 */
export function findSkillById(sport: SportKey, skillId: string): SkillItemWithBadge | undefined {
  return getAllSkillsForSport(sport).find(s => s.id === skillId)
}

/**
 * 指定スポーツ・クラスタイプのバッジ条件スキルIDを全カテゴリ分返す
 */
export function getBadgeConditionSkillIds(
  sport: SportKey,
  classType: 'preschool' | 'elementary'
): Record<string, string[]> {
  return SPORT_BADGE_CONDITIONS[sport][classType] ?? {}
}

// 各スポーツのスキルデータを個別にエクスポート
export {
  soccerSkills, soccerBadgeConditions,
  basketballSkills, basketballBadgeConditions,
  baseballSkills, baseballBadgeConditions,
  volleyballSkills, volleyballBadgeConditions,
  tennisSkills, tennisBadgeConditions,
  rugbySkills, rugbyBadgeConditions,
}
