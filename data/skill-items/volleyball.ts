import type { SkillItemWithBadge } from '@/types/badge'

export const volleyballSkills: Record<string, SkillItemWithBadge[]> = {
  catch: [
    { id: 'vl-ctch-01', order: 1, descriptionJa: '両手を前に出して構えられる',            descriptionEn: 'Ready position!',            englishPhrase: 'Ready position!',          level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-ctch-02', order: 2, descriptionJa: '投げたボールを確かにキャッチできる',    descriptionEn: 'Catch it gently!',            englishPhrase: 'Catch it gently!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-ctch-03', order: 3, descriptionJa: '自分の胸の前でキャッチできる',          descriptionEn: 'Catch at your chest!',        englishPhrase: 'Catch at your chest!',     level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-ctch-04', order: 4, descriptionJa: '頭の上でキャッチできる',               descriptionEn: 'Catch above your head!',      englishPhrase: 'Catch above your head!',   level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-ctch-05', order: 5, descriptionJa: '低いボールをキャッチできる',            descriptionEn: 'Catch down low!',             englishPhrase: 'Catch down low!',          level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-ctch-06', order: 6, descriptionJa: '動いてボールの下に入る',               descriptionEn: 'Move to the ball!',           englishPhrase: 'Move to the ball!',        level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'vl-ctch-07', order: 7, descriptionJa: '横に動いてキャッチできる',              descriptionEn: 'Side step and catch!',        englishPhrase: 'Side step and catch!',     level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'vl-ctch-08', order: 8, descriptionJa: '後ろに下がってキャッチできる',          descriptionEn: 'Move back and catch!',        englishPhrase: 'Move back and catch!',     level: 3, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'vl-ctch-09', order: 9, descriptionJa: '強いボールをキャッチできる',            descriptionEn: 'Strong catch!',               englishPhrase: 'Strong catch!',            level: 4, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  toss: [
    { id: 'vl-toss-01', order: 1, descriptionJa: '両手でおでこの前に構えられる',          descriptionEn: 'Hands up by your forehead!', englishPhrase: 'Hands up!',                level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-toss-02', order: 2, descriptionJa: 'ボールを上に投げられる',               descriptionEn: 'Toss it up!',                englishPhrase: 'Toss it up!',              level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-toss-03', order: 3, descriptionJa: '自分の真上に上げられる',               descriptionEn: 'Straight up!',               englishPhrase: 'Straight up!',             level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'vl-toss-04', order: 4, descriptionJa: '仲間に向かって上げられる',              descriptionEn: 'Toss to your friend!',       englishPhrase: 'Toss to your friend!',     level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-toss-05', order: 5, descriptionJa: '高く上げられる',                       descriptionEn: 'Higher!',                    englishPhrase: 'Higher!',                  level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-toss-06', order: 6, descriptionJa: 'コントロールして上げられる',            descriptionEn: 'Control the toss!',          englishPhrase: 'Control the toss!',        level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-toss-07', order: 7, descriptionJa: 'オーバーハンドパスの形ができる',        descriptionEn: 'Good hand position!',        englishPhrase: 'Good hand position!',      level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-toss-08', order: 8, descriptionJa: 'オーバーハンドでボールを飛ばせる',      descriptionEn: 'Overhand pass!',             englishPhrase: 'Overhand pass!',           level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'vl-toss-09', order: 9, descriptionJa: '連続でパスを続けられる',               descriptionEn: 'Keep it going!',             englishPhrase: 'Keep it going!',           level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  underhand: [
    { id: 'vl-unh-01', order: 1, descriptionJa: '両手を組む形ができる',                  descriptionEn: 'Make a platform!',           englishPhrase: 'Make a platform!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-unh-02', order: 2, descriptionJa: '腕をまっすぐ伸ばせる',                  descriptionEn: 'Straight arms!',             englishPhrase: 'Straight arms!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-unh-03', order: 3, descriptionJa: '膝を曲げて構えられる',                  descriptionEn: 'Bend your knees!',           englishPhrase: 'Bend your knees!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-unh-04', order: 4, descriptionJa: '止まったボールを腕に当てられる',        descriptionEn: 'Bump the ball!',             englishPhrase: 'Bump the ball!',           level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-unh-05', order: 5, descriptionJa: '投げられたボールを打てる',              descriptionEn: 'Bump the toss!',             englishPhrase: 'Bump the toss!',           level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-unh-06', order: 6, descriptionJa: 'ボールを上に飛ばせる',                  descriptionEn: 'Send it up!',                englishPhrase: 'Send it up!',              level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'vl-unh-07', order: 7, descriptionJa: '正確な方向に飛ばせる',                  descriptionEn: 'Aim your bump!',             englishPhrase: 'Aim your bump!',           level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'vl-unh-08', order: 8, descriptionJa: '動いてボールの下に入る',               descriptionEn: 'Move to the ball!',          englishPhrase: 'Move to the ball!',        level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-unh-09', order: 9, descriptionJa: 'レシーブの形ができる',                  descriptionEn: 'Good receive!',              englishPhrase: 'Good receive!',            level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  serve: [
    { id: 'vl-srv-01', order: 1, descriptionJa: 'ボールを片手で持てる',                   descriptionEn: 'Hold the ball!',             englishPhrase: 'Hold the ball!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-srv-02', order: 2, descriptionJa: 'ボールを前にトスできる',                 descriptionEn: 'Toss in front!',             englishPhrase: 'Toss in front!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-srv-03', order: 3, descriptionJa: '下から手でボールを打てる',               descriptionEn: 'Underhand serve!',           englishPhrase: 'Underhand serve!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-srv-04', order: 4, descriptionJa: 'ボールを前に飛ばせる',                   descriptionEn: 'Send it forward!',           englishPhrase: 'Send it forward!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-srv-05', order: 5, descriptionJa: 'ネットに向かって打てる',                 descriptionEn: 'Aim at the net!',            englishPhrase: 'Aim at the net!',          level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'vl-srv-06', order: 6, descriptionJa: 'ネットを越えられる',                    descriptionEn: 'Over the net!',              englishPhrase: 'Over the net!',            level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'vl-srv-07', order: 7, descriptionJa: '相手コートに入れられる',                descriptionEn: 'In the court!',              englishPhrase: 'In the court!',            level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'vl-srv-08', order: 8, descriptionJa: '立つ位置を理解している',                descriptionEn: 'Stand behind the line!',     englishPhrase: 'Stand behind the line!',   level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-srv-09', order: 9, descriptionJa: '正確な場所に打てる',                    descriptionEn: 'Aim your serve!',            englishPhrase: 'Aim your serve!',          level: 5, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  teamPlay: [
    { id: 'vl-team-01', order: 1, descriptionJa: '自分の場所で待てる',                    descriptionEn: 'Stay in your spot!',         englishPhrase: 'Stay in your spot!',       level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-team-02', order: 2, descriptionJa: 'ローテーションを理解している',          descriptionEn: 'Rotate!',                    englishPhrase: 'Rotate!',                  level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-team-03', order: 3, descriptionJa: 'ボク！と声を出せる',                    descriptionEn: 'Call for the ball!',         englishPhrase: 'Mine!',                    level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'vl-team-04', order: 4, descriptionJa: 'ボールを譲り合える',                    descriptionEn: 'You take it!',               englishPhrase: 'You take it!',             level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-team-05', order: 5, descriptionJa: '仲間を応援できる',                      descriptionEn: 'Nice try!',                  englishPhrase: 'Nice try!',                level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-team-06', order: 6, descriptionJa: 'ボールを落としても切り替えられる',      descriptionEn: 'Next one!',                  englishPhrase: 'Next one!',                level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'vl-team-07', order: 7, descriptionJa: '3回で返すルール理解',                   descriptionEn: 'Three touches!',             englishPhrase: 'Three touches!',           level: 4, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'vl-team-08', order: 8, descriptionJa: 'つなぐ意識ができる',                    descriptionEn: 'Connect the plays!',         englishPhrase: 'Connect the plays!',       level: 5, badgeCondition: { preschool: false, elementary: 2 } },
  ],
}

export const volleyballBadgeConditions = {
  preschool: {
    catch:    ['vl-ctch-06'],
    toss:     ['vl-toss-03'],
    underhand: ['vl-unh-06'],
    serve:    ['vl-srv-05'],
    teamPlay: ['vl-team-03'],
  },
  elementary: {
    catch:    ['vl-ctch-07', 'vl-ctch-08'],
    toss:     ['vl-toss-08', 'vl-toss-09'],
    underhand: ['vl-unh-07', 'vl-unh-09'],
    serve:    ['vl-srv-06',  'vl-srv-07'],
    teamPlay: ['vl-team-07', 'vl-team-08'],
  },
}
