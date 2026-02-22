-- ⚠️ 警告: このスクリプトは全てのテーブルとデータを削除します
-- 実行前に必ずバックアップを取ってください

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON coaches CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON students CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON evaluations CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON coaches CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON certifications CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON coach_shifts CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON lesson_menus CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON lesson_schedules CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON students CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON sports CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON evaluations CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON badges CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON attendance CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON contents CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON notifications CASCADE;
DROP POLICY IF EXISTS "Allow all access" ON message_logs CASCADE;

-- トリガーを削除
DROP TRIGGER IF EXISTS update_coaches_updated_at ON coaches;
DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
DROP TRIGGER IF EXISTS update_coach_shifts_updated_at ON coach_shifts;
DROP TRIGGER IF EXISTS update_lesson_menus_updated_at ON lesson_menus;
DROP TRIGGER IF EXISTS update_lesson_schedules_updated_at ON lesson_schedules;
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
DROP TRIGGER IF EXISTS update_sports_updated_at ON sports;
DROP TRIGGER IF EXISTS update_evaluations_updated_at ON evaluations;
DROP TRIGGER IF EXISTS update_contents_updated_at ON contents;
DROP TRIGGER IF EXISTS update_badges_updated_at ON badges;
DROP TRIGGER IF EXISTS update_student_badges_updated_at ON student_badges;
DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
DROP TRIGGER IF EXISTS update_mission_sheets_updated_at ON mission_sheets;
DROP TRIGGER IF EXISTS update_mission_items_updated_at ON mission_items;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
DROP TRIGGER IF EXISTS update_sport_goals_updated_at ON sport_goals;
DROP TRIGGER IF EXISTS update_goal_milestones_updated_at ON goal_milestones;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_pdf_materials_updated_at ON pdf_materials;
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
DROP TRIGGER IF EXISTS update_lesson_activities_updated_at ON lesson_activities;

-- 関数を削除
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_updated_at();

-- テーブルを削除（依存関係を考慮した順序）
DROP TABLE IF EXISTS goal_milestones CASCADE;
DROP TABLE IF EXISTS sport_goals CASCADE;
DROP TABLE IF EXISTS mission_items CASCADE;
DROP TABLE IF EXISTS mission_sheets CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS student_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS student_evaluations CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS lesson_activities CASCADE;
DROP TABLE IF EXISTS lesson_schedules CASCADE;
DROP TABLE IF EXISTS lesson_menus CASCADE;
DROP TABLE IF EXISTS coach_shifts CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS message_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS pdf_materials CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;

-- 確認メッセージ
SELECT 'All tables dropped successfully' as status;