-- ============================================
-- Supabase 修正用SQL
-- すでにテーブルが存在する場合の修正版
-- ============================================

-- 1. created_by カラムを追加（存在しない場合のみ）
ALTER TABLE students
ADD COLUMN IF NOT EXISTS created_by UUID;

-- 2. ビューを作成または置き換え（APIで使用）
CREATE OR REPLACE VIEW student_badges AS
SELECT * FROM badges;

CREATE OR REPLACE VIEW student_evaluations AS
SELECT * FROM evaluations;

-- 3. RLSポリシーを削除して再作成
-- studentsテーブル
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON students;

CREATE POLICY "Enable full access for authenticated users" ON students
  FOR ALL USING (auth.role() = 'authenticated');

-- badgesテーブル
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON badges;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON badges;

CREATE POLICY "Enable full access for authenticated users" ON badges
  FOR ALL USING (auth.role() = 'authenticated');

-- evaluationsテーブル
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON evaluations;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON evaluations;

CREATE POLICY "Enable full access for authenticated users" ON evaluations
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. テストデータが必要な場合は、以下のコメントを外して実行
-- 注意: 既存のデータがある場合は実行しないでください

/*
-- サンプルデータを挿入
INSERT INTO students (
  name, name_kana, name_en, birth_date, gender, level,
  enrollment_date, school, class_type, parent_name, parent_email,
  parent_phone, emergency_contact, medical_notes, notes, status
) VALUES
  ('テスト太郎', 'てすと たろう', 'Test Taro', '2018-01-01', 'male', 3,
   '2024-01-01', 'ageo', 'preschool', 'テスト保護者', 'test@example.com',
   '090-0000-0000', '080-0000-0000', 'テスト用データ', 'これはテストデータです', 'active');
*/

-- 5. 現在のテーブル構造を確認
SELECT
  'Students table: ' || count(*) || ' records' as info
FROM students
UNION ALL
SELECT
  'Badges table: ' || count(*) || ' records'
FROM badges
UNION ALL
SELECT
  'Evaluations table: ' || count(*) || ' records'
FROM evaluations;

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ 修正が完了しました！';
END $$;