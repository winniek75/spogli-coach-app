-- student_badges ビューまたはエイリアスを作成
CREATE OR REPLACE VIEW student_badges AS
SELECT * FROM badges;

-- student_evaluations ビューまたはエイリアスを作成
CREATE OR REPLACE VIEW student_evaluations AS
SELECT * FROM evaluations;

-- created_by カラムを students テーブルに追加（存在しない場合）
ALTER TABLE students
ADD COLUMN IF NOT EXISTS created_by UUID;

-- RLSポリシーを更新して、INSERT, UPDATE, DELETE を許可
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON students;

-- 新しいポリシーを作成
CREATE POLICY "Enable full access for authenticated users" ON students
  FOR ALL USING (auth.role() = 'authenticated');

-- badges テーブルのポリシー
CREATE POLICY "Enable full access for authenticated users" ON badges
  FOR ALL USING (auth.role() = 'authenticated');

-- evaluations テーブルのポリシー
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON evaluations;

CREATE POLICY "Enable full access for authenticated users" ON evaluations
  FOR ALL USING (auth.role() = 'authenticated');