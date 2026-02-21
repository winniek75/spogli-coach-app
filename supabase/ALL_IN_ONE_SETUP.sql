-- ============================================
-- Supabase 完全セットアップSQL
-- このファイルの内容を全てコピーして、
-- SupabaseのSQL Editorで実行してください
-- ============================================

-- 1. UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. studentsテーブルを作成
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
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. badgesテーブルを作成
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  badge_type VARCHAR(20) NOT NULL,
  earned_date DATE NOT NULL,
  awarded_date DATE,
  ceremony_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. evaluationsテーブルを作成
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  school VARCHAR(20) NOT NULL,
  training_type VARCHAR(30) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  skill_item_id VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ビューを作成（APIで使用）
CREATE OR REPLACE VIEW student_badges AS
SELECT * FROM badges;

CREATE OR REPLACE VIEW student_evaluations AS
SELECT * FROM evaluations;

-- 6. インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_badges_student ON badges(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON evaluations(student_id);

-- 7. Row Level Security (RLS) を有効化
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 8. RLSポリシーを作成（認証済みユーザーは全操作可能）
CREATE POLICY "Enable full access for authenticated users" ON students
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable full access for authenticated users" ON badges
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable full access for authenticated users" ON evaluations
  FOR ALL USING (auth.role() = 'authenticated');

-- 9. 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. サンプルデータを挿入（テスト用）
INSERT INTO students (
  name, name_kana, name_en, birth_date, gender, level,
  enrollment_date, school, class_type, parent_name, parent_email,
  parent_phone, emergency_contact, medical_notes, notes, status
) VALUES
  ('田中太郎', 'たなか たろう', 'Taro Tanaka', '2018-04-15', 'male', 3,
   '2024-04-01', 'ageo', 'preschool', '田中一郎', 'tanaka@example.com',
   '090-1234-5678', '080-9876-5432', 'アレルギー: なし', '元気で活発な子です', 'active'),

  ('鈴木花子', 'すずき はなこ', 'Hanako Suzuki', '2017-08-20', 'female', 4,
   '2024-03-15', 'okegawa', 'elementary', '鈴木美香', 'suzuki@example.com',
   '090-2345-6789', '080-8765-4321', '喘息あり', '集中力が高い', 'active'),

  ('佐藤健太', 'さとう けんた', 'Kenta Sato', '2019-01-10', 'male', 2,
   '2024-05-01', 'ageo', 'preschool', '佐藤智子', 'sato@example.com',
   '090-3456-7890', NULL, NULL, NULL, 'active');

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ セットアップが完了しました！';
END $$;