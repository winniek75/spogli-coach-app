-- ============================================
-- 全テーブルのRLSポリシーを修正
-- 開発環境用：全てのテーブルでCRUD操作を可能にする
-- ============================================

-- 1. 講師テーブル（coaches）のRLSを無効化
ALTER TABLE coaches DISABLE ROW LEVEL SECURITY;

-- 2. 生徒テーブル（students）のRLSを無効化
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- 3. バッジテーブル（badges）のRLSを無効化
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;

-- 4. 評価テーブル（evaluations）のRLSを無効化
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;

-- 5. その他の関連テーブルのRLSも無効化
ALTER TABLE IF EXISTS certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coach_shifts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS message_logs DISABLE ROW LEVEL SECURITY;

-- 6. 確認用：各テーブルのRLS状態を表示
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ 全てのテーブルのRLSを無効化しました。';
  RAISE NOTICE '📝 開発環境での全ての操作が可能になりました。';
  RAISE NOTICE '⚠️ 重要: 本番環境では必ず適切なRLSポリシーを設定してください！';
END $$;