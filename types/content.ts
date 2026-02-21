export interface Video {
  id: string
  title: string
  description?: string
  url: string
  thumbnail_url?: string
  duration?: number
  file_size?: number
  category: string
  tags?: string[]
  level: number
  sport: string
  is_downloadable: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface VideoWithDetails extends Video {
  created_by_name?: string
  view_count?: number
  download_count?: number
}

export interface CreateVideoRequest {
  title: string
  description?: string
  url: string
  thumbnail_url?: string
  duration?: number
  file_size?: number
  category: string
  tags?: string[]
  level: number
  sport: string
  is_downloadable: boolean
}

export interface UpdateVideoRequest {
  title?: string
  description?: string
  url?: string
  thumbnail_url?: string
  duration?: number
  file_size?: number
  category?: string
  tags?: string[]
  level?: number
  sport?: string
  is_downloadable?: boolean
}

export interface PDFMaterial {
  id: string
  title: string
  description?: string
  url: string
  thumbnail_url?: string
  file_size?: number
  category: string
  tags?: string[]
  level: number
  sport: string
  is_downloadable: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface PDFMaterialWithDetails extends PDFMaterial {
  created_by_name?: string
  view_count?: number
  download_count?: number
}

export interface CreatePDFMaterialRequest {
  title: string
  description?: string
  url: string
  thumbnail_url?: string
  file_size?: number
  category: string
  tags?: string[]
  level: number
  sport: string
  is_downloadable: boolean
}

export interface UpdatePDFMaterialRequest {
  title?: string
  description?: string
  url?: string
  thumbnail_url?: string
  file_size?: number
  category?: string
  tags?: string[]
  level?: number
  sport?: string
  is_downloadable?: boolean
}

// コンテンツカテゴリの定義
export const CONTENT_CATEGORIES = {
  technical_training: '技術指導',
  tactical_training: '戦術指導',
  physical_training: '体力向上',
  mental_training: 'メンタル指導',
  game_analysis: '試合分析',
  safety_training: '安全指導',
  referee_training: '審判指導',
  coaching_tips: 'コーチング技術',
} as const

// ビデオ形式
export const VIDEO_FORMATS = {
  mp4: 'MP4',
  mov: 'MOV',
  avi: 'AVI',
  webm: 'WebM',
} as const

// PDF用途
export const PDF_PURPOSES = {
  drill: '練習メニュー',
  tactics: '戦術図解',
  rules: 'ルール説明',
  safety: '安全指針',
  assessment: '評価シート',
  handout: '配布資料',
} as const