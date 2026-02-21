-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 講師テーブル
CREATE TABLE coaches (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 講師資格テーブル
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  status VARCHAR(20) DEFAULT 'valid',
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- シフトテーブル
CREATE TABLE coach_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  school VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coach_id, shift_date, school)
);

-- レッスンメニューテーブル
CREATE TABLE lesson_menus (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レッスンスケジュールテーブル
CREATE TABLE lesson_schedules (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生徒テーブル
CREATE TABLE students (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スポーツ情報テーブル
CREATE TABLE sports (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 評価テーブル
CREATE TABLE evaluations (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バッジテーブル
CREATE TABLE badges (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, sport, category)
);

-- 出席記録
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lesson_schedules(id),
  lesson_date DATE NOT NULL,
  school VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- レッスンコンテンツ
CREATE TABLE contents (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知テーブル
CREATE TABLE notifications (
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
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- メッセージ送信履歴
CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES coaches(id),
  recipient_id UUID REFERENCES coaches(id),
  message_type VARCHAR(20) NOT NULL,
  subject VARCHAR(200),
  content TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT
);

-- インデックス
CREATE INDEX idx_coaches_status ON coaches(status);
CREATE INDEX idx_certifications_expiry ON certifications(expiry_date);
CREATE INDEX idx_certifications_coach ON certifications(coach_id);
CREATE INDEX idx_shifts_date ON coach_shifts(shift_date);
CREATE INDEX idx_shifts_coach ON coach_shifts(coach_id);
CREATE INDEX idx_lessons_date ON lesson_schedules(lesson_date);
CREATE INDEX idx_lessons_school ON lesson_schedules(school);
CREATE INDEX idx_students_school ON students(school);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_evaluations_date ON evaluations(lesson_date);
CREATE INDEX idx_badges_student ON badges(student_id);
CREATE INDEX idx_contents_sport ON contents(sport);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_menus_sport ON lesson_menus(sport);

-- Row Level Security (RLS) の有効化
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー（認証済みユーザーは全て読み取り可能、管理者のみ編集可能）
-- 実際のアプリケーションでは、より詳細な権限設定が必要
CREATE POLICY "Enable read access for authenticated users" ON coaches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_shifts_updated_at BEFORE UPDATE ON coach_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_menus_updated_at BEFORE UPDATE ON lesson_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_schedules_updated_at BEFORE UPDATE ON lesson_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON sports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();