-- ============================================
-- RLS (Row Level Security) ポリシーを修正
-- 認証なしでもCRUD操作ができるように設定（開発環境用）
-- ============================================

-- 1. 既存のRLSポリシーを削除
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON students;

-- 2. RLSを無効化（開発環境用）
-- 注意: 本番環境では適切なRLSポリシーを設定してください
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- 3. badges と evaluations テーブルも同様に設定
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;

-- 4. または、全てのユーザーにアクセスを許可（代替案）
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON students FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON badges FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON evaluations FOR ALL USING (true) WITH CHECK (true);

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ RLSポリシーを修正しました。開発環境での動作が可能になりました。';
  RAISE NOTICE '⚠️ 注意: 本番環境では適切なセキュリティポリシーを設定してください。';
END $$;