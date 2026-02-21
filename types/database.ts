export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      coaches: {
        Row: {
          id: string
          name: string
          name_en: string | null
          email: string
          phone: string | null
          line_id: string | null
          line_user_id: string | null
          nationality: string | null
          languages: string[]
          profile_image_url: string | null
          role: 'coach' | 'senior_coach' | 'manager'
          schools: ('ageo' | 'okegawa')[]
          hire_date: string | null
          status: 'active' | 'inactive'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          email: string
          phone?: string | null
          line_id?: string | null
          line_user_id?: string | null
          nationality?: string | null
          languages?: string[]
          profile_image_url?: string | null
          role?: 'coach' | 'senior_coach' | 'manager'
          schools: ('ageo' | 'okegawa')[]
          hire_date?: string | null
          status?: 'active' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          email?: string
          phone?: string | null
          line_id?: string | null
          line_user_id?: string | null
          nationality?: string | null
          languages?: string[]
          profile_image_url?: string | null
          role?: 'coach' | 'senior_coach' | 'manager'
          schools?: ('ageo' | 'okegawa')[]
          hire_date?: string | null
          status?: 'active' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          name_kana: string | null
          name_en: string | null
          birth_date: string
          gender: 'male' | 'female' | 'other'
          level: number
          enrollment_date: string
          school: 'ageo' | 'okegawa'
          class_type: 'preschool' | 'elementary'
          parent_name: string
          parent_email: string | null
          parent_phone: string | null
          line_id: string | null
          emergency_contact: string | null
          medical_notes: string | null
          photo_url: string | null
          notes: string | null
          status: 'active' | 'inactive' | 'withdrawn'
          withdrawal_date: string | null
          withdrawal_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_kana?: string | null
          name_en?: string | null
          birth_date: string
          gender: 'male' | 'female' | 'other'
          level?: number
          enrollment_date: string
          school: 'ageo' | 'okegawa'
          class_type: 'preschool' | 'elementary'
          parent_name: string
          parent_email?: string | null
          parent_phone?: string | null
          line_id?: string | null
          emergency_contact?: string | null
          medical_notes?: string | null
          photo_url?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'withdrawn'
          withdrawal_date?: string | null
          withdrawal_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_kana?: string | null
          name_en?: string | null
          birth_date?: string
          gender?: 'male' | 'female' | 'other'
          level?: number
          enrollment_date?: string
          school?: 'ageo' | 'okegawa'
          class_type?: 'preschool' | 'elementary'
          parent_name?: string
          parent_email?: string | null
          parent_phone?: string | null
          line_id?: string | null
          emergency_contact?: string | null
          medical_notes?: string | null
          photo_url?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'withdrawn'
          withdrawal_date?: string | null
          withdrawal_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}