export interface Sport {
  id: string
  code: string
  name: string
  description?: string
  category: SportCategory
  image_url?: string
  icon?: string
  color?: string
  rules?: SportRules
  objectives?: SportObjective[]
  skills?: SportSkill[]
  levels?: SportLevel[]
  equipment?: SportEquipment[]
  metrics?: SportMetrics[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SportCategory {
  id: string
  name: string
  description?: string
  display_order: number
}

export interface SportRules {
  id: string
  sport_id: string
  players_per_team?: number
  game_duration?: number
  field_dimensions?: string
  basic_rules?: string[]
  scoring_system?: string
  updated_at: string
}

export interface SportObjective {
  id: string
  sport_id: string
  title: string
  description: string
  category: 'physical' | 'technical' | 'tactical' | 'mental'
  level: number
  age_group?: string
  target_metrics?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SportSkill {
  id: string
  sport_id: string
  name: string
  category: 'basic' | 'intermediate' | 'advanced'
  description?: string
  difficulty: number
  prerequisites?: string[]
  coaching_points?: string[]
  common_mistakes?: string[]
  practice_drills?: string[]
  created_at: string
}

export interface SportLevel {
  id: string
  sport_id: string
  level_number: number
  name: string
  description?: string
  requirements?: string[]
  skills_required?: string[]
  target_age_range?: string
  assessment_criteria?: AssessmentCriterion[]
  certification_available?: boolean
}

export interface SportEquipment {
  id: string
  name: string
  category: 'essential' | 'optional' | 'safety'
  description?: string
  specifications?: string
  recommended_brands?: string[]
  estimated_cost?: number
  maintenance_tips?: string[]
}

export interface SportMetrics {
  id: string
  sport_id: string
  metric_name: string
  metric_type: 'performance' | 'fitness' | 'skill' | 'tactical'
  unit: string
  description?: string
  measurement_method?: string
  benchmark_values?: Record<string, any>
  tracking_frequency?: string
}

export interface AssessmentCriterion {
  id: string
  name: string
  description: string
  max_score: number
  evaluation_method: string
  pass_score?: number
}

// スポーツ目標
export interface SportGoal {
  id: string
  sport_id: string
  student_id?: string
  coach_id: string
  title: string
  description?: string
  category: 'short_term' | 'medium_term' | 'long_term'
  status: 'not_started' | 'in_progress' | 'achieved' | 'paused' | 'cancelled'
  target_date: string
  start_date: string
  achieved_date?: string
  target_metrics?: Record<string, any>
  current_metrics?: Record<string, any>
  milestones?: GoalMilestone[]
  notes?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  description?: string
  target_date: string
  achieved_date?: string
  status: 'pending' | 'achieved' | 'missed'
  metrics?: Record<string, any>
  notes?: string
}

// スポーツ統計
export interface SportStatistics {
  sport_id: string
  sport_name: string
  total_students: number
  active_students: number
  total_coaches: number
  total_lessons: number
  total_evaluations: number
  average_rating: number
  completion_rate: number
  popular_skills: Array<{
    skill_name: string
    count: number
  }>
  goal_achievement_rate: number
  equipment_usage: Array<{
    equipment_name: string
    usage_count: number
  }>
  level_distribution: Array<{
    level_name: string
    student_count: number
  }>
  monthly_progress: Array<{
    month: string
    new_students: number
    lessons_conducted: number
    goals_achieved: number
  }>
}

// API リクエスト
export interface CreateSportRequest {
  code: string
  name: string
  description?: string
  category_id: string
  image_url?: string
  icon?: string
  color?: string
  is_active?: boolean
}

export interface UpdateSportRequest extends Partial<CreateSportRequest> {}

export interface CreateSportGoalRequest {
  sport_id: string
  student_id?: string
  title: string
  description?: string
  category: 'short_term' | 'medium_term' | 'long_term'
  target_date: string
  target_metrics?: Record<string, any>
  milestones?: Omit<GoalMilestone, 'id' | 'goal_id'>[]
  is_public?: boolean
}

export interface UpdateSportGoalRequest extends Partial<CreateSportGoalRequest> {
  status?: 'not_started' | 'in_progress' | 'achieved' | 'paused' | 'cancelled'
  current_metrics?: Record<string, any>
  achieved_date?: string
  notes?: string
}

// スポーツ定数
export const SPORT_CATEGORIES = [
  { id: 'ball', name: '球技', description: 'ボールを使用するスポーツ' },
  { id: 'track', name: '陸上', description: '走る・跳ぶ・投げる競技' },
  { id: 'water', name: '水泳', description: '水中・水上で行うスポーツ' },
  { id: 'martial', name: '格闘技', description: '武道・格闘技全般' },
  { id: 'dance', name: 'ダンス', description: 'ダンス・体操系' },
  { id: 'winter', name: 'ウィンタースポーツ', description: '雪上・氷上スポーツ' },
  { id: 'other', name: 'その他', description: 'その他のスポーツ' },
]

export const SPORT_SKILL_CATEGORIES = {
  basic: '基礎',
  intermediate: '中級',
  advanced: '上級',
}

export const SPORT_OBJECTIVE_CATEGORIES = {
  physical: '身体的',
  technical: '技術的',
  tactical: '戦術的',
  mental: 'メンタル',
}

export const GOAL_CATEGORIES = {
  short_term: '短期（〜3ヶ月）',
  medium_term: '中期（3〜6ヶ月）',
  long_term: '長期（6ヶ月〜）',
}

export const GOAL_STATUS = {
  not_started: '未開始',
  in_progress: '進行中',
  achieved: '達成',
  paused: '一時停止',
  cancelled: 'キャンセル',
}