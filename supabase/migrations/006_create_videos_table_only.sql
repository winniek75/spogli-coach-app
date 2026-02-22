-- Videos table のみを安全に作成
-- 既存のテーブル構造を変更せず、videosテーブルのみを追加

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Videos table のみを作成
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
-- 更新トリガー関数の確認
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- videosテーブル専用のトリガー作成
-- ========================================
DO $$
BEGIN
  -- videosテーブルが存在し、トリガーが存在しない場合のみ作成
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'videos'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_videos_updated_at'
  ) THEN
    CREATE TRIGGER update_videos_updated_at
      BEFORE UPDATE ON videos
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    RAISE NOTICE 'Created trigger for videos table';
  END IF;
END $$;

-- ========================================
-- RLS設定（videosテーブルのみ）
-- ========================================
DO $$
BEGIN
  -- videosテーブルが存在する場合のみRLSを設定
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'videos'
  ) THEN
    -- RLSを有効化
    ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

    -- 既存のポリシーを削除
    DROP POLICY IF EXISTS "Allow all access" ON videos;

    -- 新しいポリシーを作成（開発環境用）
    CREATE POLICY "Allow all access" ON videos FOR ALL USING (true);

    RAISE NOTICE 'Enabled RLS for videos table';
  END IF;
END $$;

-- ========================================
-- インデックスの作成
-- ========================================
CREATE INDEX IF NOT EXISTS idx_videos_sport ON videos(sport);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_level ON videos(level);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);

-- ========================================
-- 確認
-- ========================================
SELECT
  'videos' as table_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos')
    THEN 'created successfully'
    ELSE 'creation failed'
  END as status;