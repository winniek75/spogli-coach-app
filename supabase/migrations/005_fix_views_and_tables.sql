-- ビューとテーブルの競合を解決し、安全にスキーマを作成
-- student_badgesがビューとして存在する問題を修正

-- ========================================
-- 既存のビューを一時的に削除（後で再作成可能）
-- ========================================
DROP VIEW IF EXISTS student_badges CASCADE;

-- ========================================
-- student_badgesテーブルを作成
-- ========================================
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

-- ========================================
-- 更新トリガー関数の確認と作成
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- トリガーの安全な作成（テーブルのみ、ビューは除外）
-- ========================================
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'  -- 'r' = ordinary table (ビューを除外)
    AND n.nspname = 'public'
    AND c.relname IN (
      'coaches', 'students', 'sports', 'missions', 'videos', 'pdf_materials',
      'contents', 'badges', 'certifications', 'coach_shifts', 'shifts',
      'lesson_menus', 'lesson_activities', 'lesson_schedules', 'student_badges',
      'mission_sheets', 'mission_items', 'sport_goals', 'goal_milestones',
      'evaluations', 'student_evaluations', 'attendance', 'notifications', 'message_logs'
    )
  LOOP
    -- 既存のトリガーを確認してから作成
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_' || t.table_name || '_updated_at'
    ) THEN
      BEGIN
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
                      t.table_name, t.table_name);
        RAISE NOTICE 'Created trigger for table: %', t.table_name;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Skipped trigger for % (may be a view or trigger already exists): %', t.table_name, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- ========================================
-- RLS設定（テーブルのみ、ビューは除外）
-- ========================================
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'  -- 'r' = ordinary table
    AND n.nspname = 'public'
    AND c.relname IN (
      'coaches', 'students', 'sports', 'missions', 'videos', 'pdf_materials',
      'contents', 'badges', 'certifications', 'coach_shifts', 'shifts',
      'lesson_menus', 'lesson_activities', 'lesson_schedules', 'student_badges',
      'mission_sheets', 'mission_items', 'sport_goals', 'goal_milestones',
      'evaluations', 'student_evaluations', 'attendance', 'notifications', 'message_logs'
    )
  LOOP
    BEGIN
      -- RLSを有効化
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t.table_name);

      -- 既存のポリシーを削除
      EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON %I', t.table_name);

      -- 新しいポリシーを作成（開発環境用）
      EXECUTE format('CREATE POLICY "Allow all access" ON %I FOR ALL USING (true)', t.table_name);

      RAISE NOTICE 'Enabled RLS for table: %', t.table_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Skipped RLS for % (may not be a table): %', t.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- ========================================
-- インデックスの作成（存在チェック付き）
-- ========================================
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_sport ON student_badges(sport);
CREATE INDEX IF NOT EXISTS idx_student_badges_category ON student_badges(category);

-- ========================================
-- 確認クエリ
-- ========================================
-- テーブルとビューの状態を確認
SELECT
  c.relname AS name,
  CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized view'
    ELSE c.relkind::text
  END AS type,
  obj_description(c.oid, 'pg_class') AS description
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname LIKE '%badge%'
ORDER BY c.relname;

-- 成功メッセージ
SELECT 'Fixed view/table conflicts and created schema successfully' as status;