-- 開発環境用: RLSを一時的に無効化
-- 本番環境では適切なRLSポリシーを設定してください

-- RLSポリシーを削除（開発環境用）
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON coaches;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON evaluations;

-- 全テーブルに対してパブリックアクセスを許可（開発環境のみ！）
-- 警告: 本番環境では使用しないでください

CREATE POLICY "Allow all access" ON coaches FOR ALL USING (true);
CREATE POLICY "Allow all access" ON certifications FOR ALL USING (true);
CREATE POLICY "Allow all access" ON coach_shifts FOR ALL USING (true);
CREATE POLICY "Allow all access" ON lesson_menus FOR ALL USING (true);
CREATE POLICY "Allow all access" ON lesson_schedules FOR ALL USING (true);
CREATE POLICY "Allow all access" ON students FOR ALL USING (true);
CREATE POLICY "Allow all access" ON sports FOR ALL USING (true);
CREATE POLICY "Allow all access" ON evaluations FOR ALL USING (true);
CREATE POLICY "Allow all access" ON badges FOR ALL USING (true);
CREATE POLICY "Allow all access" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all access" ON contents FOR ALL USING (true);
CREATE POLICY "Allow all access" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all access" ON message_logs FOR ALL USING (true);