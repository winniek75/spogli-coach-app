import type { SkillItemWithBadge } from '@/types/badge'

export const baseballSkills: Record<string, SkillItemWithBadge[]> = {
  throw: [
    { id: 'bb-thrw-01', order: 1, descriptionJa: 'ボールを掴む',                        descriptionEn: 'Hold the ball!',           englishPhrase: 'Hold the ball!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-thrw-02', order: 2, descriptionJa: '前に投げられる',                       descriptionEn: 'Throw forward!',           englishPhrase: 'Throw forward!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-thrw-03', order: 3, descriptionJa: '上から投げられる',                     descriptionEn: 'Overhand throw!',          englishPhrase: 'Overhand throw!',        level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-thrw-04', order: 4, descriptionJa: '仲間に向かって投げられる',              descriptionEn: 'Throw to your friend!',    englishPhrase: 'Throw to your friend!',  level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bb-thrw-05', order: 5, descriptionJa: '仲間に届くように投げられる',            descriptionEn: 'Make it reach!',           englishPhrase: 'Make it reach!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-thrw-06', order: 6, descriptionJa: '強く投げられる',                       descriptionEn: 'Throw hard!',              englishPhrase: 'Throw hard!',            level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-thrw-07', order: 7, descriptionJa: 'コントロールして投げられる',            descriptionEn: 'Aim and throw!',           englishPhrase: 'Aim and throw!',         level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bb-thrw-08', order: 8, descriptionJa: 'ステップして投げられる',                descriptionEn: 'Step and throw!',          englishPhrase: 'Step and throw!',        level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bb-thrw-09', order: 9, descriptionJa: '素早く投げられる',                     descriptionEn: 'Quick throw!',             englishPhrase: 'Quick throw!',           level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  catch: [
    { id: 'bb-ctch-01', order: 1, descriptionJa: '両手を前に出して構えられる',            descriptionEn: 'Hands ready!',             englishPhrase: 'Hands ready!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-ctch-02', order: 2, descriptionJa: '転がったボールを止められる',            descriptionEn: 'Stop the ball!',           englishPhrase: 'Stop the ball!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-ctch-03', order: 3, descriptionJa: '転がったボールを手で捕る',              descriptionEn: 'Scoop it up!',             englishPhrase: 'Scoop it up!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-ctch-04', order: 4, descriptionJa: '確かにキャッチできる',                  descriptionEn: 'Catch!',                   englishPhrase: 'Catch!',                 level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bb-ctch-05', order: 5, descriptionJa: '胸の前でキャッチできる',                descriptionEn: 'Catch at your chest!',     englishPhrase: 'Catch at your chest!',   level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-ctch-06', order: 6, descriptionJa: 'フライを追いかけられる',                descriptionEn: 'Under the fly ball!',      englishPhrase: 'Under the fly ball!',    level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-ctch-07', order: 7, descriptionJa: 'フライをキャッチできる',                descriptionEn: 'Catch the fly!',           englishPhrase: 'Catch the fly!',         level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bb-ctch-08', order: 8, descriptionJa: '動いてボールを捕る',                    descriptionEn: 'Move and catch!',          englishPhrase: 'Move and catch!',        level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bb-ctch-09', order: 9, descriptionJa: '捕ったらすぐに投げられる',              descriptionEn: 'Catch and throw!',         englishPhrase: 'Catch and throw!',       level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  hit: [
    { id: 'bb-hit-01', order: 1, descriptionJa: '構えの姿勢ができる',                     descriptionEn: 'Ready stance!',            englishPhrase: 'Ready stance!',          level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-hit-02', order: 2, descriptionJa: '止まったボールを手で打てる',             descriptionEn: 'Hit with your hand!',      englishPhrase: 'Hit with your hand!',    level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-hit-03', order: 3, descriptionJa: 'ボールを前に飛ばせる',                   descriptionEn: 'Send it forward!',         englishPhrase: 'Send it forward!',       level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bb-hit-04', order: 4, descriptionJa: '強く打てる',                             descriptionEn: 'Hit it hard!',             englishPhrase: 'Hit it hard!',           level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-hit-05', order: 5, descriptionJa: '投げられたボールを打てる',               descriptionEn: 'Hit the pitch!',           englishPhrase: 'Hit the pitch!',         level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bb-hit-06', order: 6, descriptionJa: '正確な方向に打てる',                     descriptionEn: 'Aim your hit!',            englishPhrase: 'Aim your hit!',          level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bb-hit-07', order: 7, descriptionJa: 'ゴロを打てる',                           descriptionEn: 'Ground ball!',             englishPhrase: 'Ground ball!',           level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-hit-08', order: 8, descriptionJa: 'フライを打てる',                         descriptionEn: 'Fly ball!',                englishPhrase: 'Fly ball!',              level: 5, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-hit-09', order: 9, descriptionJa: '打ったらすぐに走り出せる',               descriptionEn: 'Hit and run!',             englishPhrase: 'Hit and run!',           level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  baseRunning: [
    { id: 'bb-run-01', order: 1, descriptionJa: 'ベースの場所を知っている',               descriptionEn: 'Where are the bases?',     englishPhrase: 'Where are the bases?',   level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-run-02', order: 2, descriptionJa: '1塁に向かって走れる',                    descriptionEn: 'Run to first!',            englishPhrase: 'Run to first!',          level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bb-run-03', order: 3, descriptionJa: 'ベースを踏む',                           descriptionEn: 'Step on the base!',        englishPhrase: 'Step on the base!',      level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-run-04', order: 4, descriptionJa: '全力で走れる',                           descriptionEn: 'Run fast!',                englishPhrase: 'Run fast!',              level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-run-05', order: 5, descriptionJa: '打ったら走れる',                         descriptionEn: 'Hit and run!',             englishPhrase: 'Hit and run!',           level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-run-06', order: 6, descriptionJa: '次のベースに進める',                     descriptionEn: 'Go to the next base!',     englishPhrase: 'Go to the next base!',   level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bb-run-07', order: 7, descriptionJa: 'アウトにならず走れる',                   descriptionEn: 'Beat the throw!',          englishPhrase: 'Beat the throw!',        level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-run-08', order: 8, descriptionJa: 'コーチの指示を聞く',                     descriptionEn: 'Listen to the coach!',     englishPhrase: 'Listen to the coach!',   level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bb-run-09', order: 9, descriptionJa: 'ホームまで帰れる',                       descriptionEn: 'Run home!',                englishPhrase: 'Run home!',              level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  defense: [
    { id: 'bb-def-01', order: 1, descriptionJa: '自分のポジションに立てる',               descriptionEn: 'Go to your position!',     englishPhrase: 'Go to your position!',   level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-def-02', order: 2, descriptionJa: '構えて待てる',                           descriptionEn: 'Ready position!',          englishPhrase: 'Ready position!',        level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-def-03', order: 3, descriptionJa: 'ボールを追いかけられる',                 descriptionEn: 'Chase the ball!',          englishPhrase: 'Chase the ball!',        level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-def-04', order: 4, descriptionJa: 'ボールを拾える',                         descriptionEn: 'Pick it up!',              englishPhrase: 'Pick it up!',            level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bb-def-05', order: 5, descriptionJa: '拾ったら1塁に投げられる',                descriptionEn: 'Throw to first!',          englishPhrase: 'Throw to first!',        level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bb-def-06', order: 6, descriptionJa: '仲間と声を掛け合える',                   descriptionEn: 'Talk to your team!',       englishPhrase: 'Talk to your team!',     level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bb-def-07', order: 7, descriptionJa: 'カバーリングができる',                   descriptionEn: 'Back up your teammate!',   englishPhrase: 'Back up your teammate!', level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],
}

export const baseballBadgeConditions = {
  preschool: {
    throw:       ['bb-thrw-04'],
    catch:       ['bb-ctch-04'],
    hit:         ['bb-hit-03'],
    baseRunning: ['bb-run-02'],
    defense:     ['bb-def-04'],
  },
  elementary: {
    throw:       ['bb-thrw-07', 'bb-thrw-08'],
    catch:       ['bb-ctch-07', 'bb-ctch-08'],
    hit:         ['bb-hit-05',  'bb-hit-06'],
    baseRunning: ['bb-run-06',  'bb-run-08'],
    defense:     ['bb-def-05',  'bb-def-07'],
  },
}
