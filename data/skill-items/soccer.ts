import type { SkillItemWithBadge } from '@/types/badge'

// badgeCondition:
//   preschool: true  → 未就学児バッジ条件スキル（指定スキル1項目、⭐⭐⭐×1回以上）
//   elementary: 1    → 小学生バッジ条件スキル①
//   elementary: 2    → 小学生バッジ条件スキル②
//   elementary: 0    → バッジ条件なし（通常スキル）

export const soccerSkills: Record<string, SkillItemWithBadge[]> = {
  kick: [
    { id: 'sc-kick-01', order: 1,  descriptionJa: 'ボールに足を当てられる',           descriptionEn: 'Touch the ball!',        englishPhrase: 'Touch the ball!',        level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-kick-02', order: 2,  descriptionJa: '止まったボールを前に蹴れる',        descriptionEn: 'Kick it forward!',       englishPhrase: 'Kick it forward!',       level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-kick-03', order: 3,  descriptionJa: '助け足で強く蹴れる',               descriptionEn: 'Kick it hard!',          englishPhrase: 'Kick it hard!',          level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-kick-04', order: 4,  descriptionJa: '正確な方向に蹴れる',               descriptionEn: 'Aim and kick!',          englishPhrase: 'Aim and kick!',          level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'sc-kick-05', order: 5,  descriptionJa: 'ゴールに向かって蹴れる',           descriptionEn: 'Shoot at the goal!',     englishPhrase: 'Shoot at the goal!',     level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-kick-06', order: 6,  descriptionJa: '動いてきたボールを蹴れる',         descriptionEn: 'Kick the moving ball!',  englishPhrase: 'Kick the moving ball!',  level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-kick-07', order: 7,  descriptionJa: '走りながら蹴れる',                 descriptionEn: 'Run and kick!',          englishPhrase: 'Run and kick!',          level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'sc-kick-08', order: 8,  descriptionJa: '両足で蹴れる',                     descriptionEn: 'Use both feet!',         englishPhrase: 'Use both feet!',         level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'sc-kick-09', order: 9,  descriptionJa: 'インサイドキックができる',          descriptionEn: 'Inside of your foot!',   englishPhrase: 'Inside of your foot!',   level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-kick-10', order: 10, descriptionJa: 'インステップキックができる',        descriptionEn: 'Top of your foot!',      englishPhrase: 'Top of your foot!',      level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  dribble: [
    { id: 'sc-drib-01', order: 1,  descriptionJa: 'ボールを足で触りながら歩ける',      descriptionEn: 'Walk with the ball!',    englishPhrase: 'Walk with the ball!',    level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-drib-02', order: 2,  descriptionJa: 'ボールを足で触りながら走れる',      descriptionEn: 'Run with the ball!',     englishPhrase: 'Run with the ball!',     level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-drib-03', order: 3,  descriptionJa: 'ボールを見ながら進める',            descriptionEn: 'Watch the ball!',        englishPhrase: 'Watch the ball!',        level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-drib-04', order: 4,  descriptionJa: '前を見ながらドリブルできる',        descriptionEn: 'Look up while dribbling!', englishPhrase: 'Look up!',             level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'sc-drib-05', order: 5,  descriptionJa: 'まっすぐ進める',                   descriptionEn: 'Go straight!',           englishPhrase: 'Go straight!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-drib-06', order: 6,  descriptionJa: 'コーンを避けて進める',              descriptionEn: 'Go around the cones!',   englishPhrase: 'Go around the cones!',   level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-drib-07', order: 7,  descriptionJa: '方向を変えられる',                 descriptionEn: 'Change direction!',      englishPhrase: 'Change direction!',      level: 2, badgeCondition: { preschool: true,  elementary: 1 } },
    { id: 'sc-drib-08', order: 8,  descriptionJa: 'スピードを変えられる',              descriptionEn: 'Faster! Slower!',        englishPhrase: 'Faster! Slower!',        level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-drib-09', order: 9,  descriptionJa: '相手から守って続けられる',          descriptionEn: 'Keep the ball!',         englishPhrase: 'Keep the ball!',         level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-drib-10', order: 10, descriptionJa: '両足を使ってドリブルできる',        descriptionEn: 'Use both feet!',         englishPhrase: 'Use both feet!',         level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  pass: [
    { id: 'sc-pass-01', order: 1, descriptionJa: '仲間にボールを蹴って渡せる',         descriptionEn: 'Pass to your friend!',   englishPhrase: 'Pass to your friend!',   level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-pass-02', order: 2, descriptionJa: '止まっている仲間にパスできる',        descriptionEn: 'Pass to them!',          englishPhrase: 'Pass to them!',          level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-pass-03', order: 3, descriptionJa: '仲間の足元にパスできる',              descriptionEn: 'To their feet!',         englishPhrase: 'To their feet!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-pass-04', order: 4, descriptionJa: '強さを調整してパスできる',            descriptionEn: 'Not too hard!',          englishPhrase: 'Not too hard!',          level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'sc-pass-05', order: 5, descriptionJa: '距離を調整してパスできる',            descriptionEn: 'Short pass! Long pass!', englishPhrase: 'Short pass! Long pass!', level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-pass-06', order: 6, descriptionJa: '動いている仲間にパスできる',          descriptionEn: 'Pass to the runner!',    englishPhrase: 'Pass to the runner!',    level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'sc-pass-07', order: 7, descriptionJa: '自分が動きながらパスできる',          descriptionEn: 'Move and pass!',         englishPhrase: 'Move and pass!',         level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'sc-pass-08', order: 8, descriptionJa: '声を出してからパスできる',            descriptionEn: 'Call their name, then pass!', englishPhrase: 'Call their name!', level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-pass-09', order: 9, descriptionJa: 'ワンタッチでパスできる',              descriptionEn: 'One touch pass!',        englishPhrase: 'One touch pass!',        level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  trap: [
    { id: 'sc-trap-01', order: 1, descriptionJa: '転がってきたボールを止められる',      descriptionEn: 'Stop the ball!',         englishPhrase: 'Stop the ball!',         level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'sc-trap-02', order: 2, descriptionJa: '足の裏で止められる',                 descriptionEn: 'Use the bottom of your foot!', englishPhrase: 'Sole trap!',        level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-trap-03', order: 3, descriptionJa: '足のインサイドで止められる',          descriptionEn: 'Inside of your foot!',   englishPhrase: 'Inside trap!',           level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-trap-04', order: 4, descriptionJa: 'ボールを体の近くに止められる',        descriptionEn: 'Keep it close!',         englishPhrase: 'Keep it close!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-trap-05', order: 5, descriptionJa: '投げられたボールを足で止められる',    descriptionEn: 'Trap the throw!',        englishPhrase: 'Trap the throw!',        level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-trap-06', order: 6, descriptionJa: '動きながらボールを受けられる',        descriptionEn: 'Move and receive!',      englishPhrase: 'Move and receive!',      level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'sc-trap-07', order: 7, descriptionJa: '止めた後すぐに次の動作に移れる',      descriptionEn: 'Trap and go!',           englishPhrase: 'Trap and go!',           level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'sc-trap-08', order: 8, descriptionJa: '胸でボールを受けられる',              descriptionEn: 'Chest trap!',            englishPhrase: 'Chest trap!',            level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  shoot: [
    { id: 'sc-shot-01', order: 1, descriptionJa: 'ゴールの方向を向いて蹴れる',         descriptionEn: 'Face the goal!',         englishPhrase: 'Face the goal!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-shot-02', order: 2, descriptionJa: 'ゴールに向かってボールを飛ばせる',   descriptionEn: 'Shoot!',                 englishPhrase: 'Shoot!',                 level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'sc-shot-03', order: 3, descriptionJa: 'ゴールの枠内に蹴れる',               descriptionEn: 'On target!',             englishPhrase: 'On target!',             level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-shot-04', order: 4, descriptionJa: 'ゴールに入れられる',                 descriptionEn: 'Goal!',                  englishPhrase: 'Goal!',                  level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-shot-05', order: 5, descriptionJa: '強いシュートを打てる',               descriptionEn: 'Power shot!',            englishPhrase: 'Power shot!',            level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-shot-06', order: 6, descriptionJa: 'ドリブルからシュートできる',          descriptionEn: 'Dribble and shoot!',     englishPhrase: 'Dribble and shoot!',     level: 4, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'sc-shot-07', order: 7, descriptionJa: 'パスを受けてシュートできる',          descriptionEn: 'Receive and shoot!',     englishPhrase: 'Receive and shoot!',     level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'sc-shot-08', order: 8, descriptionJa: 'ゴールの隅を狙える',                 descriptionEn: 'Aim for the corner!',    englishPhrase: 'Aim for the corner!',    level: 5, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'sc-shot-09', order: 9, descriptionJa: 'キーパーを見てコースを変えられる',   descriptionEn: 'Watch the keeper!',      englishPhrase: 'Watch the keeper!',      level: 6, badgeCondition: { preschool: false, elementary: 0 } },
  ],
}

/** サッカーのバッジ条件スキルID（クラスタイプ別・カテゴリ別） */
export const soccerBadgeConditions = {
  preschool: {
    kick:    ['sc-kick-04'],
    dribble: ['sc-drib-07'],
    pass:    ['sc-pass-04'],
    trap:    ['sc-trap-01'],
    shoot:   ['sc-shot-02'],
  },
  elementary: {
    kick:    ['sc-kick-07', 'sc-kick-08'],
    dribble: ['sc-drib-07', 'sc-drib-04'],
    pass:    ['sc-pass-06', 'sc-pass-07'],
    trap:    ['sc-trap-06', 'sc-trap-07'],
    shoot:   ['sc-shot-06', 'sc-shot-07'],
  },
}
