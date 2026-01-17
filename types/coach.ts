export interface Coach {
  id: string
  name: string
  name_en?: string
  email: string
  phone?: string
  line_id?: string
  line_user_id?: string
  nationality?: string
  languages: string[]
  profile_image_url?: string
  role: 'coach' | 'senior_coach' | 'manager'
  schools: ('ageo' | 'okegawa')[]
  hire_date?: string
  status: 'active' | 'inactive'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Certification {
  id: string
  coach_id: string
  name: string
  issued_date: string
  expiry_date?: string
  certificate_url?: string
  status: 'valid' | 'expiring_soon' | 'expired'
  reminder_sent: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface CoachWithCertifications extends Coach {
  certifications: Certification[]
}

export interface CreateCoachRequest {
  name: string
  name_en?: string
  email: string
  phone?: string
  line_id?: string
  nationality?: string
  languages: string[]
  role?: 'coach' | 'senior_coach' | 'manager'
  schools: ('ageo' | 'okegawa')[]
  hire_date?: string
  notes?: string
}

export interface UpdateCoachRequest extends Partial<CreateCoachRequest> {
  status?: 'active' | 'inactive'
}

export interface CreateCertificationRequest {
  coach_id: string
  name: string
  issued_date: string
  expiry_date?: string
  certificate_url?: string
  notes?: string
}