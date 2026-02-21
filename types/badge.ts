export interface Badge {
  id: string
  student_id: string
  sport: string
  category: string
  badge_type: 'star' | 'shield' | 'crown'
  earned_date: string
  awarded_date?: string
  ceremony_completed: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface BadgeWithStudent extends Badge {
  student?: {
    id: string
    name: string
    level: number
    school?: string
    class_type?: string
  }
}

export interface CreateBadgeRequest {
  student_id: string
  sport: string
  category: string
  badge_type: 'star' | 'shield' | 'crown'
  earned_date?: string
  notes?: string
}

export interface AwardBadgeRequest {
  awarded_date?: string
  ceremony_completed?: boolean
  notes?: string
}

// バッジタイプの定義
export const BADGE_TYPES = {
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
} as const

// スポーツ・カテゴリ別バッジ名
export const BADGE_NAMES = {
  soccer: {
    technical: 'サッカー技術マスター',
    physical: 'サッカー体力王',
    mental: 'サッカーメンタル強化',
    teamwork: 'サッカーチームワーク',
    communication: 'サッカーコミュニケーション',
    strategy: 'サッカー戦術理解',
    safety: 'サッカー安全プレー',
  },
  basketball: {
    technical: 'バスケ技術マスター',
    physical: 'バスケ体力王',
    mental: 'バスケメンタル強化',
    teamwork: 'バスケチームワーク',
    communication: 'バスケコミュニケーション',
    strategy: 'バスケ戦術理解',
    safety: 'バスケ安全プレー',
  },
  baseball: {
    technical: '野球技術マスター',
    physical: '野球体力王',
    mental: '野球メンタル強化',
    teamwork: '野球チームワーク',
    communication: '野球コミュニケーション',
    strategy: '野球戦術理解',
    safety: '野球安全プレー',
  },
} as const