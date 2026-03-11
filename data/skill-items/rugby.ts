import type { SkillItemWithBadge } from '@/types/badge'

// 注意: タグラグビー トライ カテゴリの小学生バッジ条件は①のみ（例外1項目）
// 要件定義 v3.0 参照

export const rugbySkills: Record<string, SkillItemWithBadge[]> = {
  running: [
    { id: 'rg-run-01', order: 1, descriptionJa: 'ボールを両手で持てる',                   descriptionEn: 'Hold the ball tight!',       englishPhrase: 'Hold the ball tight!',     level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-run-02', order: 2, descriptionJa: 'ボールを抱えて歩ける',                   descriptionEn: 'Walk with the ball!',         englishPhrase: 'Walk with the ball!',      level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-run-03', order: 3, descriptionJa: 'ボールを抱えて走れる',                   descriptionEn: 'Run with the ball!',          englishPhrase: 'Run with the ball!',       level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-run-04', order: 4, descriptionJa: 'まっすぐ走れる',                         descriptionEn: 'Run straight!',               englishPhrase: 'Run straight!',            level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-run-05', order: 5, descriptionJa: 'スピードを出して走れる',                 descriptionEn: 'Run fast!',                   englishPhrase: 'Run fast!',                level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-run-06', order: 6, descriptionJa: '方向を変えながら走れる',                 descriptionEn: 'Change direction!',           englishPhrase: 'Change direction!',        level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'rg-run-07', order: 7, descriptionJa: 'ステップを踏む',                         descriptionEn: 'Side step!',                  englishPhrase: 'Side step!',               level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'rg-run-08', order: 8, descriptionJa: 'フェイントを入れられる',                 descriptionEn: 'Fake them out!',              englishPhrase: 'Fake them out!',           level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-run-09', order: 9, descriptionJa: 'タグを取られないように走れる',           descriptionEn: 'Protect your tags!',          englishPhrase: 'Protect your tags!',       level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  pass: [
    { id: 'rg-pass-01', order: 1, descriptionJa: '両手でボールを持って投げられる',         descriptionEn: 'Two hands!',                  englishPhrase: 'Two hands!',               level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-pass-02', order: 2, descriptionJa: '横にパスできる',                        descriptionEn: 'Pass sideways!',              englishPhrase: 'Pass sideways!',           level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'rg-pass-03', order: 3, descriptionJa: '後ろにパスできる',                      descriptionEn: 'Pass backwards!',             englishPhrase: 'Pass backwards!',          level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-pass-04', order: 4, descriptionJa: '仲間に届くように投げられる',             descriptionEn: 'Pass to your friend!',        englishPhrase: 'Pass to your friend!',     level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-pass-05', order: 5, descriptionJa: '走りながらパスできる',                  descriptionEn: 'Run and pass!',               englishPhrase: 'Run and pass!',            level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'rg-pass-06', order: 6, descriptionJa: '声を出してからパスできる',               descriptionEn: 'Call, then pass!',            englishPhrase: 'Call, then pass!',         level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-pass-07', order: 7, descriptionJa: 'タイミングよくパスできる',               descriptionEn: 'Good timing!',                englishPhrase: 'Good timing!',             level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'rg-pass-08', order: 8, descriptionJa: 'ポップパスができる',                    descriptionEn: 'Pop pass!',                   englishPhrase: 'Pop pass!',                level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-pass-09', order: 9, descriptionJa: 'スクリューパスに挑戦できる',             descriptionEn: 'Spin pass!',                  englishPhrase: 'Spin pass!',               level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  catch: [
    { id: 'rg-ctch-01', order: 1, descriptionJa: '両手を前に出して構えられる',             descriptionEn: 'Hands ready!',               englishPhrase: 'Hands ready!',             level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-ctch-02', order: 2, descriptionJa: '投げられたボールをキャッチできる',       descriptionEn: 'Catch it!',                   englishPhrase: 'Catch it!',                level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'rg-ctch-03', order: 3, descriptionJa: '胸の前でキャッチできる',                 descriptionEn: 'Catch at your chest!',        englishPhrase: 'Catch at your chest!',     level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-ctch-04', order: 4, descriptionJa: '横のパスをキャッチできる',               descriptionEn: 'Catch the side pass!',        englishPhrase: 'Catch the side pass!',     level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-ctch-05', order: 5, descriptionJa: '走りながらキャッチできる',               descriptionEn: 'Catch on the run!',           englishPhrase: 'Catch on the run!',        level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'rg-ctch-06', order: 6, descriptionJa: '難しいパスを捕ろうとする',               descriptionEn: 'Try to catch it!',            englishPhrase: 'Try to catch it!',         level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-ctch-07', order: 7, descriptionJa: 'キャッチ後すぐに走り出す',               descriptionEn: 'Catch and go!',               englishPhrase: 'Catch and go!',            level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  tagDefense: [
    { id: 'rg-def-01', order: 1, descriptionJa: 'タグの位置を知っている',                  descriptionEn: 'Where are the tags?',         englishPhrase: 'Where are the tags?',      level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-def-02', order: 2, descriptionJa: '仲間のタグを取る',                        descriptionEn: 'Take the tag!',               englishPhrase: 'Take the tag!',            level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'rg-def-03', order: 3, descriptionJa: '走っている相手のタグを取る',               descriptionEn: 'Chase and tag!',              englishPhrase: 'Chase and tag!',           level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'rg-def-04', order: 4, descriptionJa: 'タグを取ったら見せられる',                descriptionEn: 'Show the tag!',               englishPhrase: 'Show the tag!',            level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-def-05', order: 5, descriptionJa: 'タグを取ったら叫ぶ',                      descriptionEn: 'Tag!',                        englishPhrase: 'Tag!',                     level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-def-06', order: 6, descriptionJa: '相手の動きを予測できる',                  descriptionEn: 'Watch where they go!',        englishPhrase: 'Watch where they go!',     level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-def-07', order: 7, descriptionJa: '追いかけてタグを取る',                    descriptionEn: 'Run them down!',              englishPhrase: 'Run them down!',           level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-def-08', order: 8, descriptionJa: 'チームで協力して守る',                    descriptionEn: 'Work together!',              englishPhrase: 'Work together!',           level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  tryScoring: [
    { id: 'rg-try-01', order: 1, descriptionJa: 'トライエリアの場所を知っている',           descriptionEn: "That's the try zone!",        englishPhrase: 'Try zone!',                level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-try-02', order: 2, descriptionJa: 'トライエリアまで走れる',                   descriptionEn: 'Run to the zone!',            englishPhrase: 'Run to the zone!',         level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'rg-try-03', order: 3, descriptionJa: 'ボールを地面に置く',                       descriptionEn: 'Put the ball down!',          englishPhrase: 'Put the ball down!',       level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'rg-try-04', order: 4, descriptionJa: 'タグを取られずにトライできる',             descriptionEn: 'Score a try!',                englishPhrase: 'Score a try!',             level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    // 小学生バッジ条件①のみ（例外: このカテゴリは1項目のみ）
    { id: 'rg-try-05', order: 5, descriptionJa: 'パスをもらってトライできる',               descriptionEn: 'Receive and try!',            englishPhrase: 'Receive and try!',         level: 4, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'rg-try-06', order: 6, descriptionJa: 'トライ後に喜ぶ',                           descriptionEn: 'Celebrate!',                  englishPhrase: 'Celebrate!',               level: 1, badgeCondition: { preschool: false, elementary: 0 } },
  ],
}

export const rugbyBadgeConditions = {
  preschool: {
    running:    ['rg-run-06'],
    pass:       ['rg-pass-02'],
    catch:      ['rg-ctch-02'],
    tagDefense: ['rg-def-02'],
    tryScoring: ['rg-try-02'],
  },
  elementary: {
    running:    ['rg-run-07',  'rg-run-09'],
    pass:       ['rg-pass-05', 'rg-pass-07'],
    catch:      ['rg-ctch-05', 'rg-ctch-07'],
    tagDefense: ['rg-def-03',  'rg-def-08'],
    // トライは例外: 小学生も①のみ1項目
    tryScoring: ['rg-try-05'],
  },
}
