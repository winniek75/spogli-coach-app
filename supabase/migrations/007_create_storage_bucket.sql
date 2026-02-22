-- ========================================
-- Supabase Storage バケット設定用SQL
-- ========================================
-- 注意: このSQLは参考用です。
-- 実際のバケット作成はSupabase Dashboardから行ってください。
-- Storage > New Bucket から以下の設定で作成:
-- - Name: lesson-videos
-- - Public bucket: OFF（認証必要）
-- - File size limit: 500MB
-- - Allowed MIME types: video/mp4, video/quicktime, video/webm

-- ========================================
-- Storage用のRLSポリシー例
-- ========================================
-- バケット作成後、以下のようなポリシーを設定できます:

-- 講師（coaches）のみアップロード可能
-- INSERT storage.objects
-- WITH CHECK (
--   auth.role() = 'authenticated' AND
--   EXISTS (
--     SELECT 1 FROM coaches
--     WHERE id = auth.uid()
--   )
-- );

-- 講師のみダウンロード可能
-- SELECT storage.objects
-- USING (
--   auth.role() = 'authenticated' AND
--   EXISTS (
--     SELECT 1 FROM coaches
--     WHERE id = auth.uid()
--   )
-- );

-- ========================================
-- 動画メタデータ管理テーブル（オプション）
-- ========================================
CREATE TABLE IF NOT EXISTS lesson_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL, -- Storage内のパス
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  duration_seconds INTEGER,
  thumbnail_url TEXT,

  -- カテゴリ分類
  sport VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 1,
  tags TEXT[],

  -- アクセス管理
  is_public BOOLEAN DEFAULT false,
  is_downloadable BOOLEAN DEFAULT false,

  -- 統計
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,

  -- メタ情報
  uploaded_by UUID REFERENCES coaches(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_lesson_videos_sport ON lesson_videos(sport);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_category ON lesson_videos(category);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_level ON lesson_videos(level);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_uploaded_by ON lesson_videos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_created_at ON lesson_videos(created_at);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_lesson_videos_updated_at
  BEFORE UPDATE ON lesson_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLSの有効化
ALTER TABLE lesson_videos ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 講師は全ての動画を閲覧可能
CREATE POLICY "Coaches can view all lesson videos" ON lesson_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coaches WHERE id = auth.uid()
    )
  );

-- RLSポリシー: 講師は自分がアップロードした動画を編集可能
CREATE POLICY "Coaches can edit own videos" ON lesson_videos
  FOR UPDATE USING (
    uploaded_by = auth.uid()
  );

-- RLSポリシー: 講師は動画をアップロード可能
CREATE POLICY "Coaches can upload videos" ON lesson_videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches WHERE id = auth.uid()
    )
  );

-- ========================================
-- 視聴履歴テーブル（オプション）
-- ========================================
CREATE TABLE IF NOT EXISTS video_watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES lesson_videos(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id),
  watch_duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  last_position_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(video_id, coach_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_watch_history_video ON video_watch_history(video_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_coach ON video_watch_history(coach_id);

-- RLSの有効化
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 講師は自分の視聴履歴のみ閲覧・更新可能
CREATE POLICY "Coaches can manage own watch history" ON video_watch_history
  FOR ALL USING (coach_id = auth.uid());