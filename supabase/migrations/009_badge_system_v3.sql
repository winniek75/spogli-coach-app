-- ============================================================
-- Migration 009: バッジシステム v3.0 全面改修
-- スポーツ単位バッジ（カテゴリ単位 → スポーツ単位）
-- 年齢別2トラック: preschool(Cトラック) / elementary(Bトラック)
-- 年2回まで同スポーツで再獲得可能（UNIQUE制約なし）
-- ============================================================

-- 既存のbadgesテーブルをバックアップ（データ保持）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'badges') THEN
    ALTER TABLE IF EXISTS badges RENAME TO badges_v2_backup;
  END IF;
END $$;

-- ============================================================
-- sport_badges テーブル（v3.0 スポーツ単位バッジ）
-- ============================================================
CREATE TABLE IF NOT EXISTS sport_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL,
  student_class_type VARCHAR(20) NOT NULL,     -- 'preschool' | 'elementary'（取得時点）
  badge_label VARCHAR(100) NOT NULL,            -- 例: 'サッカー KIDS' / 'サッカー'
  badge_type VARCHAR(20) NOT NULL,              -- 'star' | 'shield' | 'crown'（Lvから自動決定）
  occurrence_number INTEGER NOT NULL DEFAULT 1, -- 同スポーツ何回目の取得か（1, 2, 3...）
  earned_date DATE NOT NULL,                    -- 条件達成日（月末集計時）
  awarded_date DATE,                            -- 実際の授与日（翌月最初のレッスン冒頭）
  awarded_by UUID REFERENCES coaches(id),
  ceremony_completed BOOLEAN DEFAULT false,
  report_printed BOOLEAN DEFAULT false,         -- 月次レポート配布済み
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- UNIQUE制約なし: 年2回まで同スポーツで再獲得可能
);

-- ============================================================
-- badge_progress_cache テーブル（月次集計用キャッシュ）
-- スポーツ × カテゴリ × クラスタイプ別の進捗を保持
-- ============================================================
CREATE TABLE IF NOT EXISTS badge_progress_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL,
  class_type VARCHAR(20) NOT NULL,              -- 'preschool' | 'elementary'
  category VARCHAR(50) NOT NULL,
  required_skill_ids TEXT[] NOT NULL,           -- バッジ条件スキルID一覧
  achieved_skill_ids TEXT[] NOT NULL DEFAULT '{}', -- 達成済み条件スキルID
  has_triple_star BOOLEAN DEFAULT false,        -- ⭐⭐⭐達成フラグ（preschoolのみ使用）
  is_category_complete BOOLEAN DEFAULT false,   -- このカテゴリの条件クリア
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, sport, class_type, category)
);

-- ============================================================
-- インデックス
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sport_badges_student    ON sport_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_sport_badges_sport      ON sport_badges(sport);
CREATE INDEX IF NOT EXISTS idx_sport_badges_earned     ON sport_badges(earned_date);
CREATE INDEX IF NOT EXISTS idx_sport_badges_ceremony   ON sport_badges(ceremony_completed);
CREATE INDEX IF NOT EXISTS idx_badge_progress_student  ON badge_progress_cache(student_id);
CREATE INDEX IF NOT EXISTS idx_badge_progress_sport    ON badge_progress_cache(sport, class_type);
CREATE INDEX IF NOT EXISTS idx_badge_progress_complete ON badge_progress_cache(is_category_complete);

-- ============================================================
-- RLS ポリシー
-- ============================================================
ALTER TABLE sport_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_progress_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sport_badges"
  ON sport_badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert sport_badges"
  ON sport_badges FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update sport_badges"
  ON sport_badges FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage badge_progress_cache"
  ON badge_progress_cache FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- ヘルパー関数: バッジ取得回数（次回取得番号）を返す
-- ============================================================
CREATE OR REPLACE FUNCTION get_sport_badge_occurrence(
  p_student_id UUID,
  p_sport VARCHAR
) RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((
    SELECT MAX(occurrence_number) + 1
    FROM sport_badges
    WHERE student_id = p_student_id AND sport = p_sport
  ), 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ヘルパー関数: バッジラベルを生成
-- preschool → '{スポーツ名} KIDS' / elementary → '{スポーツ名}'
-- ============================================================
CREATE OR REPLACE FUNCTION generate_badge_label(
  p_sport VARCHAR,
  p_class_type VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
  sport_names JSONB := '{
    "soccer":     "サッカー",
    "basketball": "バスケットボール",
    "baseball":   "野球",
    "volleyball": "バレーボール",
    "tennis":     "テニス",
    "rugby":      "タグラグビー"
  }';
  sport_name VARCHAR;
BEGIN
  sport_name := sport_names ->> p_sport;
  IF sport_name IS NULL THEN sport_name := p_sport; END IF;
  IF p_class_type = 'preschool' THEN
    RETURN sport_name || ' KIDS';
  ELSE
    RETURN sport_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ヘルパー関数: レベルからバッジタイプを決定
-- Lv1-2 → star / Lv3-4 → shield / Lv5-6 → crown
-- ============================================================
CREATE OR REPLACE FUNCTION get_badge_type_from_level(p_level INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  IF    p_level <= 2 THEN RETURN 'star';
  ELSIF p_level <= 4 THEN RETURN 'shield';
  ELSE                     RETURN 'crown';
  END IF;
END;
$$ LANGUAGE plpgsql;
