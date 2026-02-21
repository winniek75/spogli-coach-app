-- サンプルデータを挿入するSQLファイル
-- 注意: 本番環境では実行しないでください

-- 生徒のサンプルデータ
INSERT INTO students (
  name, name_kana, name_en, birth_date, gender, level,
  enrollment_date, school, class_type, parent_name, parent_email,
  parent_phone, emergency_contact, medical_notes, notes, status
) VALUES
  ('田中太郎', 'たなか たろう', 'Taro Tanaka', '2018-04-15', 'male', 3,
   '2024-04-01', 'ageo', 'preschool', '田中一郎', 'tanaka@example.com',
   '090-1234-5678', '080-9876-5432', 'アレルギー: なし', '元気で活発な子です', 'active'),

  ('鈴木花子', 'すずき はなこ', 'Hanako Suzuki', '2017-08-20', 'female', 4,
   '2024-03-15', 'okegawa', 'elementary', '鈴木美香', 'suzuki@example.com',
   '090-2345-6789', '080-8765-4321', '喘息あり', '集中力が高い', 'active'),

  ('佐藤健太', 'さとう けんた', 'Kenta Sato', '2019-01-10', 'male', 2,
   '2024-05-01', 'ageo', 'preschool', '佐藤智子', 'sato@example.com',
   '090-3456-7890', NULL, NULL, NULL, 'active'),

  ('山田美咲', 'やまだ みさき', 'Misaki Yamada', '2018-11-25', 'female', 3,
   '2024-02-01', 'okegawa', 'preschool', '山田太一', 'yamada@example.com',
   '090-4567-8901', '080-7654-3210', NULL, '運動が大好き', 'active'),

  ('伊藤翔', 'いとう しょう', 'Sho Ito', '2016-06-30', 'male', 5,
   '2023-09-01', 'ageo', 'elementary', '伊藤真理', 'ito@example.com',
   '090-5678-9012', NULL, NULL, 'リーダーシップがある', 'active');

-- バッジのサンプルデータ
INSERT INTO badges (
  student_id, sport, category, badge_type, earned_date, ceremony_completed
)
SELECT
  s.id, 'soccer', 'basic', 'star', '2024-05-01', true
FROM students s WHERE s.name = '田中太郎'
UNION ALL
SELECT
  s.id, 'basketball', 'advanced', 'crown', '2024-05-15', false
FROM students s WHERE s.name = '鈴木花子'
UNION ALL
SELECT
  s.id, 'tennis', 'intermediate', 'shield', '2024-06-01', true
FROM students s WHERE s.name = '山田美咲';

-- 評価のサンプルデータ
INSERT INTO evaluations (
  student_id, lesson_date, sport, category, skill_item_id, rating,
  school, training_type, notes
)
SELECT
  s.id, '2024-06-01', 'soccer', 'basic', 'dribbling', 3,
  'ageo', 'skill', 'とても上手にドリブルができています'
FROM students s WHERE s.name = '田中太郎'
UNION ALL
SELECT
  s.id, '2024-06-08', 'soccer', 'basic', 'passing', 2,
  'ageo', 'skill', 'パスの精度が向上しています'
FROM students s WHERE s.name = '田中太郎'
UNION ALL
SELECT
  s.id, '2024-06-10', 'basketball', 'advanced', 'shooting', 3,
  'okegawa', 'skill', 'シュート成功率が高い'
FROM students s WHERE s.name = '鈴木花子';