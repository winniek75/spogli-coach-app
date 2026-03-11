import type { SkillItemWithBadge } from '@/types/badge'

// 注意: テニス グリップ・構え カテゴリの小学生バッジ条件は①のみ（例外1項目）
// 要件定義 v3.0 参照

export const tennisSkills: Record<string, SkillItemWithBadge[]> = {
  grip: [
    { id: 'tn-grip-01', order: 1, descriptionJa: 'ラケットを片手で持てる',                descriptionEn: 'Hold the racket!',           englishPhrase: 'Hold the racket!',         level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-grip-02', order: 2, descriptionJa: 'ラケットを正しい向きで持てる',          descriptionEn: 'Face up!',                   englishPhrase: 'Face up!',                 level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-grip-03', order: 3, descriptionJa: 'グリップを握る',                        descriptionEn: 'Grip it tight!',             englishPhrase: 'Grip it tight!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-grip-04', order: 4, descriptionJa: 'レディポジションができる',               descriptionEn: 'Ready position!',            englishPhrase: 'Ready position!',          level: 1, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'tn-grip-05', order: 5, descriptionJa: '膝を曲げて構えられる',                  descriptionEn: 'Bend your knees!',           englishPhrase: 'Bend your knees!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-grip-06', order: 6, descriptionJa: 'ラケットを体の前で構えられる',          descriptionEn: 'Racket in front!',           englishPhrase: 'Racket in front!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    // 小学生バッジ条件①のみ（例外: このカテゴリは1項目のみ）
    { id: 'tn-grip-07', order: 7, descriptionJa: '素早くグリップを持ち替えられる',        descriptionEn: 'Switch your grip!',          englishPhrase: 'Switch your grip!',        level: 4, badgeCondition: { preschool: false, elementary: 1 } },
  ],

  forehand: [
    { id: 'tn-fore-01', order: 1,  descriptionJa: '横を向いて構えられる',                 descriptionEn: 'Turn sideways!',             englishPhrase: 'Turn sideways!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-fore-02', order: 2,  descriptionJa: 'ラケットを後ろに引く',                 descriptionEn: 'Take it back!',              englishPhrase: 'Take it back!',            level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-fore-03', order: 3,  descriptionJa: '前に振る',                             descriptionEn: 'Swing forward!',             englishPhrase: 'Swing forward!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-fore-04', order: 4,  descriptionJa: '止まったボールに当てられる',           descriptionEn: 'Hit the still ball!',        englishPhrase: 'Hit the still ball!',      level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-fore-05', order: 5,  descriptionJa: '転がってきたボールを打てる',           descriptionEn: 'Hit the rolling ball!',      englishPhrase: 'Hit the rolling ball!',    level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-fore-06', order: 6,  descriptionJa: 'ワンバウンドで打てる',                 descriptionEn: 'After the bounce!',          englishPhrase: 'After the bounce!',        level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'tn-fore-07', order: 7,  descriptionJa: 'ボールを前に飛ばせる',                 descriptionEn: 'Send it forward!',           englishPhrase: 'Send it forward!',         level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-fore-08', order: 8,  descriptionJa: 'ネットを越えられる',                   descriptionEn: 'Over the net!',              englishPhrase: 'Over the net!',            level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'tn-fore-09', order: 9,  descriptionJa: 'コントロールして打てる',               descriptionEn: 'Control your shot!',         englishPhrase: 'Control your shot!',       level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-fore-10', order: 10, descriptionJa: 'フォロースルーができる',               descriptionEn: 'Follow through!',            englishPhrase: 'Follow through!',          level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  backhand: [
    { id: 'tn-back-01', order: 1, descriptionJa: '体の反対側で構えられる',                descriptionEn: 'Other side!',                englishPhrase: 'Other side!',              level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-back-02', order: 2, descriptionJa: '両手で持って構えられる',                descriptionEn: 'Two hands!',                 englishPhrase: 'Two hands!',               level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-back-03', order: 3, descriptionJa: 'バックハンドの形で振れる',              descriptionEn: 'Backhand swing!',            englishPhrase: 'Backhand swing!',          level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'tn-back-04', order: 4, descriptionJa: '止まったボールを打てる',                descriptionEn: 'Hit it!',                    englishPhrase: 'Hit it!',                  level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-back-05', order: 5, descriptionJa: '転がってきたボールを打てる',            descriptionEn: 'Hit the rolling ball!',      englishPhrase: 'Hit the rolling ball!',    level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-back-06', order: 6, descriptionJa: 'ワンバウンドで打てる',                  descriptionEn: 'After the bounce!',          englishPhrase: 'After the bounce!',        level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'tn-back-07', order: 7, descriptionJa: 'ボールを前に飛ばせる',                  descriptionEn: 'Send it forward!',           englishPhrase: 'Send it forward!',         level: 3, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-back-08', order: 8, descriptionJa: 'ネットを越えられる',                    descriptionEn: 'Over the net!',              englishPhrase: 'Over the net!',            level: 4, badgeCondition: { preschool: false, elementary: 2 } },
  ],

  serve: [
    { id: 'tn-srv-01', order: 1, descriptionJa: 'ボールを手で落として打てる',              descriptionEn: 'Drop and hit!',              englishPhrase: 'Drop and hit!',            level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-srv-02', order: 2, descriptionJa: 'ボールをトスできる',                     descriptionEn: 'Toss the ball!',             englishPhrase: 'Toss the ball!',           level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-srv-03', order: 3, descriptionJa: 'トスしたボールを打てる',                 descriptionEn: 'Toss and hit!',              englishPhrase: 'Toss and hit!',            level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-srv-04', order: 4, descriptionJa: 'ボールを前に飛ばせる',                   descriptionEn: 'Send it forward!',           englishPhrase: 'Send it forward!',         level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'tn-srv-05', order: 5, descriptionJa: 'ネットを越えられる',                     descriptionEn: 'Over the net!',              englishPhrase: 'Over the net!',            level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'tn-srv-06', order: 6, descriptionJa: '相手コートに入れられる',                 descriptionEn: 'In the box!',                englishPhrase: 'In the box!',              level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'tn-srv-07', order: 7, descriptionJa: 'サービスボックスを理解している',         descriptionEn: 'Aim for the box!',           englishPhrase: 'Aim for the box!',         level: 4, badgeCondition: { preschool: false, elementary: 0 } },
  ],

  rally: [
    { id: 'tn-raly-01', order: 1, descriptionJa: 'ボールを追いかけられる',                descriptionEn: 'Chase the ball!',            englishPhrase: 'Chase the ball!',          level: 1, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-raly-02', order: 2, descriptionJa: 'ボールの落下点に移動できる',            descriptionEn: 'Move to the ball!',          englishPhrase: 'Move to the ball!',        level: 2, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-raly-03', order: 3, descriptionJa: '打った後に戻れる',                      descriptionEn: 'Return to center!',          englishPhrase: 'Return to center!',        level: 4, badgeCondition: { preschool: false, elementary: 2 } },
    { id: 'tn-raly-04', order: 4, descriptionJa: '2回続けて打てる',                       descriptionEn: 'Rally!',                     englishPhrase: 'Rally!',                   level: 2, badgeCondition: { preschool: true,  elementary: 0 } },
    { id: 'tn-raly-05', order: 5, descriptionJa: '5回続けて打てる',                       descriptionEn: 'Keep it going!',             englishPhrase: 'Keep it going!',           level: 3, badgeCondition: { preschool: false, elementary: 1 } },
    { id: 'tn-raly-06', order: 6, descriptionJa: '10回以上ラリーできる',                  descriptionEn: 'Great rally!',               englishPhrase: 'Great rally!',             level: 5, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-raly-07', order: 7, descriptionJa: 'スプリットステップができる',             descriptionEn: 'Split step!',                englishPhrase: 'Split step!',              level: 4, badgeCondition: { preschool: false, elementary: 0 } },
    { id: 'tn-raly-08', order: 8, descriptionJa: 'サイドステップで動ける',                descriptionEn: 'Side step!',                 englishPhrase: 'Side step!',               level: 3, badgeCondition: { preschool: false, elementary: 0 } },
  ],
}

export const tennisBadgeConditions = {
  preschool: {
    grip:     ['tn-grip-04'],
    forehand: ['tn-fore-06'],
    backhand: ['tn-back-03'],
    serve:    ['tn-srv-04'],
    rally:    ['tn-raly-04'],
  },
  elementary: {
    // グリップ・構えは例外: 小学生も①のみ1項目
    grip:     ['tn-grip-07'],
    forehand: ['tn-fore-08', 'tn-fore-10'],
    backhand: ['tn-back-06', 'tn-back-08'],
    serve:    ['tn-srv-05',  'tn-srv-06'],
    rally:    ['tn-raly-05', 'tn-raly-03'],
  },
}
