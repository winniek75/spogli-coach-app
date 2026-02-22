-- 完全なデータベーススキーマ作成（依存関係を考慮した順序）
-- このファイルは全てのテーブルを正しい順序で作成します

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. 独立したマスターテーブル（他に依存しない）
-- ========================================

-- Coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  line_id VARCHAR(50),
  line_user_id VARCHAR(100),
  nationality VARCHAR(50),
  languages TEXT[],
  profile_image_url TEXT,
  role VARCHAR(20) DEFAULT 'coach',
  schools TEXT[] NOT NULL,
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_kana VARCHAR(100),
  name_en VARCHAR(100),
  birth_date DATE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  level INTEGER DEFAULT 1,
  enrollment_date DATE NOT NULL,
  school VARCHAR(20) NOT NULL,
  class_type VARCHAR(20) NOT NULL,
  parent_name VARCHAR(100) NOT NULL,
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  line_id VARCHAR(50),
  emergency_contact VARCHAR(20),
  medical_notes TEXT,
  photo_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  withdrawal_date DATE,
  withdrawal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports table
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  months INTEGER[] NOT NULL,
  overview JSONB NOT NULL,
  categories JSONB NOT NULL,
  safety_notes TEXT[],
  required_equipment TEXT[],
  school_specific_notes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions table (独立テーブル - 他のテーブルから参照される)
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  difficulty INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  requirements TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  sport VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 1,
  duration_minutes INTEGER,
  file_size BIGINT,
  tags TEXT[],
  is_downloadable BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PDF Materials table
CREATE TABLE IF NOT EXISTS pdf_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  sport VARCHAR(50),
  level INTEGER DEFAULT 1,
  file_size BIGINT,
  tags TEXT[],
  is_downloadable BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contents table (旧バージョンとの互換性のため)
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description TEXT,
  content_type VARCHAR(20) NOT NULL,
  url TEXT NOT NULL,
  download_url TEXT,
  thumbnail_url TEXT,
  sport VARCHAR(50),
  category VARCHAR(50),
  skill_items TEXT[],
  tags TEXT[],
  duration INTEGER,
  file_size BIGINT,
  display_order INTEGER DEFAULT 0,
  is_downloadable BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  badge_type VARCHAR(20) NOT NULL,
  earned_date DATE NOT NULL,
  awarded_date DATE,
  awarded_by UUID REFERENCES coaches(id),
  ceremony_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, sport, category)
);

-- ========================================
-- 2. Coachesに依存するテーブル
-- ========================================

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  status VARCHAR(20) DEFAULT 'valid',
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach Shifts table
CREATE TABLE IF NOT EXISTS coach_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  school VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coach_id, shift_date, school)
);

-- Shifts table (別バージョン)
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  class_type VARCHAR(50),
  max_students INTEGER,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Menus table
CREATE TABLE IF NOT EXISTS lesson_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  training_type VARCHAR(30) NOT NULL,
  target_levels INTEGER[],
  target_class VARCHAR(20),
  duration INTEGER NOT NULL,
  overview JSONB NOT NULL,
  timeline JSONB NOT NULL,
  equipment TEXT[],
  setup_notes TEXT,
  evaluation_criteria JSONB,
  created_by UUID REFERENCES coaches(id),
  last_edited_by UUID REFERENCES coaches(id),
  is_template BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  recipient_id UUID REFERENCES coaches(id),
  recipient_type VARCHAR(20) DEFAULT 'coach',
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  priority VARCHAR(20) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Message Logs table
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES coaches(id),
  recipient_id UUID REFERENCES coaches(id),
  message_type VARCHAR(20) NOT NULL,
  subject VARCHAR(200),
  content TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);

-- ========================================
-- 3. Lesson関連テーブル
-- ========================================

-- Lesson Schedules table
CREATE TABLE IF NOT EXISTS lesson_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  school VARCHAR(20) NOT NULL,
  class_type VARCHAR(20) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  training_type VARCHAR(30) NOT NULL,
  assigned_coach_ids UUID[],
  max_students INTEGER DEFAULT 12,
  lesson_menu_id UUID REFERENCES lesson_menus(id),
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Activities table
CREATE TABLE IF NOT EXISTS lesson_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_menu_id UUID REFERENCES lesson_menus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  activity_type VARCHAR(50),
  instructions TEXT[],
  equipment TEXT[],
  variations TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. Student関連テーブル
-- ========================================

-- Student Badges table
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID,
  sport VARCHAR(50),
  category VARCHAR(50),
  badge_type VARCHAR(20),
  earned_date DATE NOT NULL,
  awarded_date DATE,
  ceremony_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission Sheets table (studentsとmissionsに依存)
CREATE TABLE IF NOT EXISTS mission_sheets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission Items table (mission_sheetsとmissionsに依存)
CREATE TABLE IF NOT EXISTS mission_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sheet_id UUID REFERENCES mission_sheets(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id),
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sport Goals table
CREATE TABLE IF NOT EXISTS sport_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id),
  coach_id UUID REFERENCES coaches(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  status VARCHAR(50) DEFAULT 'not_started',
  progress INTEGER DEFAULT 0,
  start_date DATE,
  completion_date DATE,
  is_public BOOLEAN DEFAULT false,
  milestones JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal Milestones table
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES sport_goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 5. 評価・出席関連テーブル
-- ========================================

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lesson_schedules(id),
  lesson_date DATE NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  school VARCHAR(20) NOT NULL,
  training_type VARCHAR(30) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  skill_item_id VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 3),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Evaluations table (別バージョン)
CREATE TABLE IF NOT EXISTS student_evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id),
  lesson_date DATE NOT NULL,
  sport VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  skill_name VARCHAR(255),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  training_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lesson_schedules(id),
  lesson_date DATE NOT NULL,
  school VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'present',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- ========================================
-- インデックス作成
-- ========================================

CREATE INDEX IF NOT EXISTS idx_coaches_status ON coaches(status);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_certifications_coach ON certifications(coach_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON coach_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_coach ON coach_shifts(coach_id);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON lesson_schedules(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lessons_school ON lesson_schedules(school);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON evaluations(lesson_date);
CREATE INDEX IF NOT EXISTS idx_badges_student ON badges(student_id);
CREATE INDEX IF NOT EXISTS idx_contents_sport ON contents(sport);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_menus_sport ON lesson_menus(sport);

-- ========================================
-- 更新トリガー関数
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成（存在チェック付き）
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'coaches', 'students', 'sports', 'missions', 'videos', 'pdf_materials',
      'contents', 'badges', 'certifications', 'coach_shifts', 'shifts',
      'lesson_menus', 'lesson_activities', 'lesson_schedules', 'student_badges',
      'mission_sheets', 'mission_items', 'sport_goals', 'goal_milestones',
      'evaluations', 'student_evaluations', 'attendance', 'notifications', 'message_logs'
    ]) AS table_name
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name)
       AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_' || t.table_name || '_updated_at') THEN
      EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t.table_name, t.table_name);
    END IF;
  END LOOP;
END $$;

-- ========================================
-- RLS (Row Level Security) 設定
-- ========================================

-- RLSを有効化
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- 開発環境用: 全アクセス許可ポリシー
-- 注意: 本番環境では適切なポリシーに置き換えてください
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'coaches', 'students', 'sports', 'missions', 'videos', 'pdf_materials',
      'contents', 'badges', 'certifications', 'coach_shifts', 'shifts',
      'lesson_menus', 'lesson_activities', 'lesson_schedules', 'student_badges',
      'mission_sheets', 'mission_items', 'sport_goals', 'goal_milestones',
      'evaluations', 'student_evaluations', 'attendance', 'notifications', 'message_logs'
    )
  LOOP
    -- 既存のポリシーを削除
    EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON %I', t.table_name);
    -- 新しいポリシーを作成
    EXECUTE format('CREATE POLICY "Allow all access" ON %I FOR ALL USING (true)', t.table_name);
  END LOOP;
END $$;

-- 確認メッセージ
SELECT 'Database schema created successfully with correct dependency order' as status;