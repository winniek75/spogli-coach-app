-- ========================================
-- 月次成長レポート（スポぐり通信）テーブル
-- ========================================

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 月次レポートメインテーブル
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

  -- コーチのコメント（手動入力）
  coach_note TEXT,

  -- 成長まとめ（手動入力）
  growth_achievements TEXT[], -- できるようになったこと
  growth_challenges TEXT[],   -- 来月チャレンジすること

  -- レポート状態
  is_finalized BOOLEAN DEFAULT false,
  is_printed BOOLEAN DEFAULT false,
  printed_at TIMESTAMPTZ,
  printed_by UUID,

  -- メタ情報
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 一意制約（生徒・年・月の組み合わせはユニーク）
  UNIQUE(student_id, year, month)
);

-- レポートテンプレート設定テーブル（将来拡張用）
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- レポート印刷履歴テーブル
CREATE TABLE IF NOT EXISTS report_print_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES monthly_reports(id) ON DELETE CASCADE,
  printed_by UUID,
  printed_at TIMESTAMPTZ DEFAULT NOW(),
  print_format VARCHAR(20) DEFAULT 'pdf', -- pdf, html
  file_path TEXT, -- PDFファイルのパス（保存する場合）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- インデックス作成
-- ========================================
CREATE INDEX IF NOT EXISTS idx_monthly_reports_student ON monthly_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON monthly_reports(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_finalized ON monthly_reports(is_finalized);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_printed ON monthly_reports(is_printed);
CREATE INDEX IF NOT EXISTS idx_report_print_history_report ON report_print_history(report_id);

-- ========================================
-- トリガー（更新日時の自動更新）
-- ========================================
CREATE TRIGGER update_monthly_reports_updated_at
  BEFORE UPDATE ON monthly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- RLS設定
-- ========================================
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_print_history ENABLE ROW LEVEL SECURITY;

-- 講師は全てのレポートにアクセス可能
CREATE POLICY "Coaches can manage all reports" ON monthly_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM coaches WHERE id = auth.uid())
  );

CREATE POLICY "Coaches can manage templates" ON report_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM coaches WHERE id = auth.uid())
  );

CREATE POLICY "Coaches can view print history" ON report_print_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM coaches WHERE id = auth.uid())
  );

CREATE POLICY "Coaches can create print history" ON report_print_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM coaches WHERE id = auth.uid())
  );

-- ========================================
-- 初期テンプレートデータ
-- ========================================
INSERT INTO report_templates (name, description, template_data, is_active) VALUES
(
  'スポぐり通信 v1.0',
  'デフォルトの月次成長レポートテンプレート',
  '{
    "sections": [
      {"id": "certification", "name": "現在のレベル", "enabled": true},
      {"id": "skill_evaluation", "name": "今月のスキル評価", "enabled": true},
      {"id": "badges", "name": "バッジ状況", "enabled": true},
      {"id": "growth_summary", "name": "成長まとめ＆チャレンジ", "enabled": true},
      {"id": "coach_note", "name": "Coach''s Note", "enabled": true}
    ],
    "styling": {
      "header_color": "#1a1a2e",
      "accent_color": "#7fdbca",
      "font_family": "Nunito"
    }
  }',
  true
)
ON CONFLICT DO NOTHING;

-- ========================================
-- ビュー：レポート一覧（生徒情報付き）
-- ========================================
CREATE OR REPLACE VIEW monthly_reports_with_students AS
SELECT
  mr.*,
  s.name as student_name,
  s.name_kana as student_name_kana,
  s.level as student_level,
  s.school as student_school,
  s.class_type as student_class_type,
  s.birth_date as student_birth_date,
  s.photo_url as student_photo_url
FROM monthly_reports mr
JOIN students s ON mr.student_id = s.id;

-- ========================================
-- 便利な関数
-- ========================================

-- 月次レポート生成対象生徒を取得する関数
CREATE OR REPLACE FUNCTION get_students_for_monthly_report(
  target_year INTEGER,
  target_month INTEGER
)
RETURNS TABLE (
  student_id UUID,
  student_name VARCHAR,
  has_report BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as student_id,
    s.name as student_name,
    (mr.id IS NOT NULL) as has_report
  FROM students s
  LEFT JOIN monthly_reports mr ON (
    mr.student_id = s.id
    AND mr.year = target_year
    AND mr.month = target_month
  )
  WHERE s.status = 'active'
  ORDER BY s.school, s.class_type, s.name;
END;
$$ LANGUAGE plpgsql;

-- 指定月のレッスン統計を取得する関数
CREATE OR REPLACE FUNCTION get_monthly_lesson_stats(
  p_student_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'attendance_count', COUNT(*) FILTER (WHERE status = 'present'),
    'total_lessons', COUNT(*),
    'attendance_rate',
    CASE
      WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'present') * 100.0) / COUNT(*))
      ELSE 0
    END
  ) INTO result
  FROM attendance
  WHERE student_id = p_student_id
    AND EXTRACT(year FROM lesson_date::date) = p_year
    AND EXTRACT(month FROM lesson_date::date) = p_month;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 確認
-- ========================================
SELECT
  'monthly_reports' as table_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'monthly_reports')
    THEN 'created successfully'
    ELSE 'creation failed'
  END as status;