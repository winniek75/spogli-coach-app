export interface CoachShift {
  id: string
  coach_id: string
  shift_date: string
  start_time: string
  end_time: string
  school: 'ageo' | 'okegawa'
  status: 'scheduled' | 'confirmed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface LessonSchedule {
  id: string
  lesson_date: string
  start_time: string
  end_time: string
  school: 'ageo' | 'okegawa'
  class_type: 'preschool' | 'elementary'
  sport: string
  training_type: 'vision' | 'rhythm' | 'coordination'
  assigned_coach_ids: string[]
  max_students: number
  lesson_menu_id?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateShiftRequest {
  coach_id: string
  shift_date: string
  start_time: string
  end_time: string
  school: 'ageo' | 'okegawa'
  notes?: string
}

export interface CreateLessonRequest {
  lesson_date: string
  start_time: string
  end_time: string
  school: 'ageo' | 'okegawa'
  class_type: 'preschool' | 'elementary'
  sport: string
  training_type: 'vision' | 'rhythm' | 'coordination'
  max_students?: number
  notes?: string
}

export interface UpdateShiftRequest extends Partial<CreateShiftRequest> {
  status?: 'scheduled' | 'confirmed' | 'cancelled'
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {
  assigned_coach_ids?: string[]
  lesson_menu_id?: string
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export interface ShiftWithCoach extends CoachShift {
  coach: {
    id: string
    name: string
    name_en?: string
  }
}

export interface LessonWithDetails extends LessonSchedule {
  assigned_coaches: {
    id: string
    name: string
    name_en?: string
  }[]
  lesson_menu?: {
    id: string
    title: string
  }
}