-- 既存テーブルは作成せず、不足しているテーブルのみを作成
-- IF NOT EXISTS を使用して安全に実行

-- UUID拡張を有効化（既に有効な場合はスキップ）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Videos table (動画テーブル) - contentsテーブルがある場合は別名で作成
-- ========================================
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

-- ========================================
-- PDF Materials table (PDF資料テーブル)
-- ========================================
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

-- ========================================
-- Student Badges table (生徒バッジ結合テーブル)
-- ========================================
-- まず badges テーブルが student_badges という名前で存在する可能性があるので確認
DO $$
BEGIN
    -- student_badges テーブルが存在しない場合のみ作成
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_badges') THEN
        CREATE TABLE student_badges (
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
    END IF;
END $$;

-- ========================================
-- Student Evaluations table (生徒評価テーブル)
-- ========================================
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

-- ========================================
-- Missions table (ミッションテーブル)
-- ========================================
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

-- ========================================
-- Mission Sheets table (ミッションシートテーブル)
-- ========================================
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

-- ========================================
-- Mission Items table (ミッション項目テーブル)
-- ========================================
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

-- ========================================
-- Shifts table (シフトテーブル) - coach_shiftsとは別
-- ========================================
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

-- ========================================
-- Sport Goals table (スポーツ目標テーブル)
-- ========================================
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

-- ========================================
-- Goal Milestones table (目標マイルストーンテーブル)
-- ========================================
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
-- Lesson Activities table (レッスン活動テーブル)
-- ========================================
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
-- 更新トリガー関数（存在しない場合のみ作成）
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 新しく作成したテーブルにトリガーを追加
DO $$
BEGIN
  -- videos
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_videos_updated_at') THEN
    CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- pdf_materials
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pdf_materials_updated_at') THEN
    CREATE TRIGGER update_pdf_materials_updated_at BEFORE UPDATE ON pdf_materials
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- student_evaluations
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_evaluations_updated_at') THEN
    CREATE TRIGGER update_student_evaluations_updated_at BEFORE UPDATE ON student_evaluations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- その他のテーブルも同様に...
END $$;

-- RLSポリシー（開発環境用）
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_activities ENABLE ROW LEVEL SECURITY;

-- 開発環境用: 全アクセス許可
CREATE POLICY "Allow all access" ON videos FOR ALL USING (true);
CREATE POLICY "Allow all access" ON pdf_materials FOR ALL USING (true);
CREATE POLICY "Allow all access" ON student_evaluations FOR ALL USING (true);
CREATE POLICY "Allow all access" ON student_badges FOR ALL USING (true);
CREATE POLICY "Allow all access" ON missions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON mission_sheets FOR ALL USING (true);
CREATE POLICY "Allow all access" ON mission_items FOR ALL USING (true);
CREATE POLICY "Allow all access" ON shifts FOR ALL USING (true);
CREATE POLICY "Allow all access" ON sport_goals FOR ALL USING (true);
CREATE POLICY "Allow all access" ON goal_milestones FOR ALL USING (true);
CREATE POLICY "Allow all access" ON lesson_activities FOR ALL USING (true);

-- 確認
SELECT 'Missing tables created successfully' as status;