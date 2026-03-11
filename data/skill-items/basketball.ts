import type { SkillItemWithBadge } from '@/types/badge'

export const basketballSkills: Record<string, SkillItemWithBadge[]> = {
  dribble: [
    { id: 'bk-drib-01', order: 1,  descriptionJa: '両手でボールを弾く',                 descriptionEn: 'Bounce with two hands!',   englishPhrase: 'Bounce with two hands!', level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-02', order: 2,  descriptionJa: '片手でボールを弾く',                 descriptionEn: 'One hand dribble!',        englishPhrase: 'One hand dribble!',      level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-03', order: 3,  descriptionJa: '連続でつける（3回以上）',             descriptionEn: 'Keep bouncing!',           englishPhrase: 'Keep bouncing!',         level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bk-drib-04', order: 4,  descriptionJa: '連続でつける（10回以上）',            descriptionEn: 'Great control!',           englishPhrase: 'Great control!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-05', order: 5,  descriptionJa: '立ったままドリブルできる',            descriptionEn: 'Dribble in place!',        englishPhrase: 'Dribble in place!',      level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-06', order: 6,  descriptionJa: '歩きながらドリブルできる',            descriptionEn: 'Walk and dribble!',        englishPhrase: 'Walk and dribble!',      level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-07', order: 7,  descriptionJa: '走りながらドリブルできる',            descriptionEn: 'Run and dribble!',         englishPhrase: 'Run and dribble!',       level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bk-drib-08', order: 8,  descriptionJa: '低いドリブルができる',               descriptionEn: 'Low dribble!',             englishPhrase: 'Low dribble!',           level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-09', order: 9,  descriptionJa: '高いドリブルができる',               descriptionEn: 'High dribble!',            englishPhrase: 'High dribble!',          level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-10', order: 10, descriptionJa: '左右の手を切り替えられる',            descriptionEn: 'Switch hands!',            englishPhrase: 'Switch hands!',          level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-drib-11', order: 11, descriptionJa: '前を見ながらドリブルできる',          descriptionEn: 'Eyes up!',                 englishPhrase: 'Eyes up!',               level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bk-drib-12', order: 12, descriptionJa: '相手を避けながらドリブルできる',      descriptionEn: 'Go around them!',          englishPhrase: 'Go around them!',        level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  pass: [
    { id: 'bk-pass-01', order: 1,  descriptionJa: '両手でボールを持てる',                descriptionEn: 'Hold the ball tight!',     englishPhrase: 'Hold the ball tight!',   level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-pass-02', order: 2,  descriptionJa: '胸の前から押し出す（チェストパス）',  descriptionEn: 'Chest pass!',              englishPhrase: 'Chest pass!',            level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bk-pass-03', order: 3,  descriptionJa: '仲間に届くように投げられる',          descriptionEn: 'Pass to your friend!',     englishPhrase: 'Pass to your friend!',   level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-pass-04', order: 4,  descriptionJa: 'バウンドパスができる',               descriptionEn: 'Bounce pass!',             englishPhrase: 'Bounce pass!',           level: 3, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bk-pass-05', order: 5,  descriptionJa: '頭の上から投げられる（オーバーヘッド）', descriptionEn: 'Overhead pass!',         englishPhrase: 'Overhead pass!',         level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-pass-06', order: 6,  descriptionJa: '距離を調整できる',                   descriptionEn: 'Short pass! Long pass!',   englishPhrase: 'Short pass! Long pass!', level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-pass-07', order: 7,  descriptionJa: '強さを調整できる',                   descriptionEn: 'Soft pass! Hard pass!',    englishPhrase: 'Soft pass! Hard pass!',  level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-pass-08', order: 8,  descriptionJa: '動いている仲間にパスできる',          descriptionEn: 'Pass to the runner!',      englishPhrase: 'Pass to the runner!',    level: 4, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bk-pass-09', order: 9,  descriptionJa: '自分が動きながらパスできる',          descriptionEn: 'Move and pass!',           englishPhrase: 'Move and pass!',         level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-pass-10', order: 10, descriptionJa: '片手でパスできる',                   descriptionEn: 'One hand pass!',           englishPhrase: 'One hand pass!',         level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  catch: [
    { id: 'bk-ctch-01', order: 1, descriptionJa: '投げたボールを両手で受けられる',       descriptionEn: 'Catch it!',                englishPhrase: 'Catch it!',              level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bk-ctch-02', order: 2, descriptionJa: '胸の前でキャッチできる',               descriptionEn: 'Catch at your chest!',     englishPhrase: 'Catch at your chest!',   level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-ctch-03', order: 3, descriptionJa: 'バウンドしたボールをキャッチできる',   descriptionEn: 'Catch the bounce!',        englishPhrase: 'Catch the bounce!',      level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-ctch-04', order: 4, descriptionJa: '高いボールをキャッチできる',           descriptionEn: 'Catch up high!',           englishPhrase: 'Catch up high!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-ctch-05', order: 5, descriptionJa: '低いボールをキャッチできる',           descriptionEn: 'Catch down low!',          englishPhrase: 'Catch down low!',        level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-ctch-06', order: 6, descriptionJa: '動きながらキャッチできる',             descriptionEn: 'Move and catch!',          englishPhrase: 'Move and catch!',        level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bk-ctch-07', order: 7, descriptionJa: 'ジャンプしてキャッチできる',           descriptionEn: 'Jump and catch!',          englishPhrase: 'Jump and catch!',        level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bk-ctch-08', order: 8, descriptionJa: 'キャッチ後すぐに次の動作に移れる',     descriptionEn: 'Catch and go!',            englishPhrase: 'Catch and go!',          level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-ctch-09', order: 9, descriptionJa: '強いパスをキャッチできる',             descriptionEn: 'Strong catch!',            englishPhrase: 'Strong catch!',          level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  shoot: [
    { id: 'bk-shot-01', order: 1, descriptionJa: 'ゴールに向かって投げられる',           descriptionEn: 'Throw at the basket!',     englishPhrase: 'Throw at the basket!',   level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bk-shot-02', order: 2, descriptionJa: '下から投げてゴールに届く',             descriptionEn: 'Underhand throw!',         englishPhrase: 'Underhand throw!',       level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-shot-03', order: 3, descriptionJa: '上から投げてゴールに届く',             descriptionEn: 'Overhand throw!',          englishPhrase: 'Overhand throw!',        level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-shot-04', order: 4, descriptionJa: 'ゴールのボードに当てられる',           descriptionEn: 'Hit the backboard!',       englishPhrase: 'Hit the backboard!',     level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-shot-05', order: 5, descriptionJa: 'ゴールに入れられる',                   descriptionEn: 'Basket!',                  englishPhrase: 'Basket!',                level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-shot-06', order: 6, descriptionJa: '正しいシュートフォームができる',        descriptionEn: 'Good form!',               englishPhrase: 'Good form!',             level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-shot-07', order: 7, descriptionJa: '近い距離からシュートを決められる',      descriptionEn: 'Close shot!',              englishPhrase: 'Close shot!',            level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-shot-08', order: 8, descriptionJa: 'ドリブルからシュートできる',            descriptionEn: 'Dribble and shoot!',       englishPhrase: 'Dribble and shoot!',     level: 4, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bk-shot-09', order: 9, descriptionJa: 'パスを受けてシュートできる',            descriptionEn: 'Catch and shoot!',         englishPhrase: 'Catch and shoot!',       level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  defense: [
    { id: 'bk-def-01', order: 1, descriptionJa: '両手を出して立てる',                    descriptionEn: 'Hands up!',                englishPhrase: 'Hands up!',              level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'bk-def-02', order: 2, descriptionJa: '膝を曲げて構えられる',                  descriptionEn: 'Bend your knees!',         englishPhrase: 'Bend your knees!',       level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-def-03', order: 3, descriptionJa: '相手の前に立てる',                      descriptionEn: 'Stay in front!',           englishPhrase: 'Stay in front!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-def-04', order: 4, descriptionJa: '相手についていく',                      descriptionEn: 'Follow them!',             englishPhrase: 'Follow them!',           level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'bk-def-05', order: 5, descriptionJa: 'サイドステップで動く',                  descriptionEn: 'Slide your feet!',         englishPhrase: 'Slide your feet!',       level: 3, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'bk-def-06', order: 6, descriptionJa: 'ボールを見ながら守れる',                descriptionEn: 'Watch the ball!',          englishPhrase: 'Watch the ball!',        level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-def-07', order: 7, descriptionJa: 'パスを遮断しようとできる',              descriptionEn: 'Block the pass!',          englishPhrase: 'Block the pass!',        level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-def-08', order: 8, descriptionJa: 'シュートを遮断しようとできる',          descriptionEn: 'Contest the shot!',        englishPhrase: 'Contest the shot!',      level: 5, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'bk-def-09', order: 9, descriptionJa: 'ボールを奪おうとできる',                descriptionEn: 'Steal the ball!',          englishPhrase: 'Steal the ball!',        level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],
}

export const basketballBadgeConditions = {
  preschool: {
    dribble: ['bk-drib-03'],
    pass:    ['bk-pass-02'],
    catch:   ['bk-ctch-01'],
    shoot:   ['bk-shot-01'],
    defense: ['bk-def-01'],
  },
  elementary: {
    dribble: ['bk-drib-07', 'bk-drib-11'],
    pass:    ['bk-pass-08', 'bk-pass-04'],
    catch:   ['bk-ctch-06', 'bk-ctch-07'],
    shoot:   ['bk-shot-08', 'bk-shot-09'],
    defense: ['bk-def-04',  'bk-def-05'],
  },
}
