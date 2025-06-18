// Magic E (Hopping E) Words Database
// 中学生レベルの基本英単語を網羅的に収録

export const magicEWords = {
  // 初級レベル (小学校高学年〜中1)
  beginner: [
    // a → a_e (短母音 /æ/ → 長母音 /eɪ/)
    { short: 'bat', long: 'bate', meaning: 'こうもり → 和らげる', category: 'animal/action' },
    { short: 'can', long: 'cane', meaning: '缶 → 杖', category: 'object' },
    { short: 'cap', long: 'cape', meaning: '帽子 → 岬/マント', category: 'clothing/nature' },
    { short: 'dam', long: 'dame', meaning: 'ダム → 貴婦人', category: 'structure/person' },
    { short: 'fad', long: 'fade', meaning: '一時的流行 → 消える', category: 'trend/action' },
    { short: 'gal', long: 'gale', meaning: '女の子 → 強風', category: 'person/weather' },
    { short: 'gap', long: 'gape', meaning: '隙間 → 口を開ける', category: 'space/action' },
    { short: 'hat', long: 'hate', meaning: '帽子 → 嫌う', category: 'clothing/emotion' },
    { short: 'mad', long: 'made', meaning: '怒った → 作った', category: 'emotion/action' },
    { short: 'man', long: 'mane', meaning: '男 → たてがみ', category: 'person/animal' },
    { short: 'mat', long: 'mate', meaning: 'マット → 仲間', category: 'object/person' },
    { short: 'pal', long: 'pale', meaning: '友達 → 青白い', category: 'person/appearance' },
    { short: 'pan', long: 'pane', meaning: 'フライパン → 窓ガラス', category: 'kitchen/object' },
    { short: 'plan', long: 'plane', meaning: '計画 → 飛行機/平面', category: 'concept/transport' },
    { short: 'rat', long: 'rate', meaning: 'ネズミ → 率/評価', category: 'animal/measure' },
    { short: 'Sam', long: 'same', meaning: 'サム(名前) → 同じ', category: 'name/concept' },
    { short: 'tap', long: 'tape', meaning: '軽く叩く → テープ', category: 'action/object' },
    { short: 'van', long: 'vane', meaning: 'バン → 風見鶏', category: 'vehicle/object' },

    // i → i_e (短母音 /ɪ/ → 長母音 /aɪ/)
    { short: 'bid', long: 'bide', meaning: '入札する → 待つ', category: 'action' },
    { short: 'bit', long: 'bite', meaning: '少し → 噛む', category: 'amount/action' },
    { short: 'dim', long: 'dime', meaning: '薄暗い → 10セント硬貨', category: 'light/money' },
    { short: 'din', long: 'dine', meaning: '騒音 → 食事する', category: 'sound/action' },
    { short: 'fir', long: 'fire', meaning: 'モミの木 → 火', category: 'nature/element' },
    { short: 'fin', long: 'fine', meaning: 'ひれ → 素晴らしい/罰金', category: 'animal/quality' },
    { short: 'hid', long: 'hide', meaning: '隠した → 隠す/皮', category: 'action/object' },
    { short: 'kit', long: 'kite', meaning: '道具一式 → 凧', category: 'tool/toy' },
    { short: 'lit', long: 'lite', meaning: '点灯した → 軽い', category: 'action/weight' },
    { short: 'pin', long: 'pine', meaning: 'ピン → 松', category: 'object/tree' },
    { short: 'pip', long: 'pipe', meaning: '種 → パイプ', category: 'seed/object' },
    { short: 'rid', long: 'ride', meaning: '取り除く → 乗る', category: 'action' },
    { short: 'rip', long: 'ripe', meaning: '引き裂く → 熟した', category: 'action/state' },
    { short: 'sit', long: 'site', meaning: '座る → 場所', category: 'action/place' },
    { short: 'slim', long: 'slime', meaning: '細い → スライム', category: 'appearance/substance' },
    { short: 'spin', long: 'spine', meaning: '回転する → 背骨', category: 'action/body' },
    { short: 'tim', long: 'time', meaning: 'ティム(名前) → 時間', category: 'name/concept' },
    { short: 'twin', long: 'twine', meaning: '双子 → より糸', category: 'person/object' },
    { short: 'win', long: 'wine', meaning: '勝つ → ワイン', category: 'action/drink' },
    { short: 'wid', long: 'wide', meaning: '未亡人(widow略) → 広い', category: 'person/size' },

    // o → o_e (短母音 /ɒ/ → 長母音 /oʊ/)
    { short: 'cod', long: 'code', meaning: 'タラ → コード/暗号', category: 'fish/system' },
    { short: 'con', long: 'cone', meaning: '詐欺 → 円錐/コーン', category: 'crime/shape' },
    { short: 'cop', long: 'cope', meaning: '警官 → 対処する', category: 'person/action' },
    { short: 'cot', long: 'cote', meaning: '簡易ベッド → 小屋', category: 'furniture/building' },
    { short: 'dop', long: 'dope', meaning: '浸す → 薬物/情報', category: 'action/substance' },
    { short: 'glob', long: 'globe', meaning: '塊 → 地球儀', category: 'form/object' },
    { short: 'hop', long: 'hope', meaning: '跳ぶ → 希望', category: 'action/emotion' },
    { short: 'lob', long: 'lobe', meaning: '高く打つ → 耳たぶ', category: 'action/body' },
    { short: 'mod', long: 'mode', meaning: '改造 → モード/方法', category: 'action/system' },
    { short: 'nod', long: 'node', meaning: 'うなずく → 結節点', category: 'action/point' },
    { short: 'not', long: 'note', meaning: '〜ない → メモ/音符', category: 'negative/object' },
    { short: 'pop', long: 'pope', meaning: '飛び出る → 教皇', category: 'action/person' },
    { short: 'rob', long: 'robe', meaning: '奪う → ローブ', category: 'action/clothing' },
    { short: 'rod', long: 'rode', meaning: '棒 → 乗った', category: 'object/action' },
    { short: 'rot', long: 'rote', meaning: '腐る → 暗記', category: 'action/method' },
    { short: 'slop', long: 'slope', meaning: 'こぼす → 斜面', category: 'action/geography' },
    { short: 'ton', long: 'tone', meaning: 'トン → 音色/調子', category: 'weight/sound' },
    { short: 'tot', long: 'tote', meaning: '幼児 → 運ぶ', category: 'person/action' },

    // u → u_e (短母音 /ʌ/ → 長母音 /juː/)
    { short: 'cub', long: 'cube', meaning: '子熊 → 立方体', category: 'animal/shape' },
    { short: 'cut', long: 'cute', meaning: '切る → かわいい', category: 'action/appearance' },
    { short: 'dud', long: 'dude', meaning: '不発弾 → やつ/男', category: 'object/person' },
    { short: 'fum', long: 'fume', meaning: 'もたつく → 煙/怒り', category: 'action/substance' },
    { short: 'hug', long: 'huge', meaning: '抱きしめる → 巨大な', category: 'action/size' },
    { short: 'jut', long: 'jute', meaning: '突き出る → ジュート(繊維)', category: 'action/material' },
    { short: 'mut', long: 'mute', meaning: '雑種犬 → 無音の', category: 'animal/sound' },
    { short: 'plum', long: 'plume', meaning: 'プラム → 羽毛', category: 'fruit/object' },
    { short: 'pun', long: 'pune', meaning: 'だじゃれ → プネー(都市)', category: 'language/place' },
    { short: 'tub', long: 'tube', meaning: '浴槽 → 管/チューブ', category: 'container/object' },
    { short: 'us', long: 'use', meaning: '私たち → 使う', category: 'pronoun/action' }
  ],

  // 中級レベル (中2〜中3)
  intermediate: [
    // より複雑な単語や学習頻度の高い単語
    { short: 'bar', long: 'bare', meaning: '棒 → 裸の', category: 'object/state' },
    { short: 'car', long: 'care', meaning: '車 → 世話/気にする', category: 'vehicle/action' },
    { short: 'far', long: 'fare', meaning: '遠い → 運賃', category: 'distance/money' },
    { short: 'scar', long: 'scare', meaning: '傷跡 → 怖がらせる', category: 'mark/action' },
    { short: 'star', long: 'stare', meaning: '星 → じっと見る', category: 'celestial/action' },
    { short: 'sham', long: 'shame', meaning: '偽物 → 恥', category: 'fake/emotion' },
    { short: 'shin', long: 'shine', meaning: 'すね → 輝く', category: 'body/action' },
    { short: 'slim', long: 'slime', meaning: '細い → ぬめり', category: 'appearance/substance' },
    { short: 'strip', long: 'stripe', meaning: '剥ぐ → 縞模様', category: 'action/pattern' },
    { short: 'them', long: 'theme', meaning: '彼ら → テーマ', category: 'pronoun/concept' },
    { short: 'dot', long: 'dote', meaning: '点 → 溺愛する', category: 'mark/emotion' },
    { short: 'got', long: 'goat', meaning: '得た → ヤギ', category: 'action/animal' },
    { short: 'mop', long: 'mope', meaning: 'モップ → ふさぎ込む', category: 'tool/emotion' },
    { short: 'scrap', long: 'scrape', meaning: 'くず → こする', category: 'waste/action' },
    { short: 'grip', long: 'gripe', meaning: '握る → 不平を言う', category: 'action/complaint' },
    { short: 'slid', long: 'slide', meaning: '滑った → 滑る', category: 'action' },
    { short: 'spit', long: 'spite', meaning: '唾を吐く → 悪意', category: 'action/emotion' },
    { short: 'stag', long: 'stage', meaning: '雄鹿 → 舞台', category: 'animal/place' },
    { short: 'grad', long: 'grade', meaning: '卒業生 → 学年/成績', category: 'person/measure' },
    { short: 'prim', long: 'prime', meaning: 'きちんとした → 主要な', category: 'manner/importance' }
  ],

  // 上級レベル (高校入試レベル)
  advanced: [
    { short: 'bath', long: 'bathe', meaning: '風呂 → 入浴する', category: 'place/action' },
    { short: 'breath', long: 'breathe', meaning: '息 → 呼吸する', category: 'air/action' },
    { short: 'cloth', long: 'clothe', meaning: '布 → 服を着せる', category: 'material/action' },
    { short: 'grim', long: 'grime', meaning: '厳しい → 汚れ', category: 'mood/dirt' },
    { short: 'shred', long: 'shrede', meaning: '細切れ → 細断する', category: 'piece/action' },
    { short: 'strand', long: 'strande', meaning: '房 → 座礁させる', category: 'group/action' },
    { short: 'past', long: 'paste', meaning: '過去 → 貼り付ける', category: 'time/action' },
    { short: 'wast', long: 'waste', meaning: '〜だった → 無駄', category: 'verb/noun' },
    { short: 'cast', long: 'caste', meaning: '投げる → カースト', category: 'action/social' },
    { short: 'quit', long: 'quite', meaning: 'やめる → かなり', category: 'action/degree' }
  ]
};

// カテゴリー別に整理
export const magicEByCategory = {
  emotions: [
    { short: 'hat', long: 'hate', meaning: '帽子 → 嫌う' },
    { short: 'hop', long: 'hope', meaning: '跳ぶ → 希望' },
    { short: 'mad', long: 'made', meaning: '怒った → 作った' },
    { short: 'sham', long: 'shame', meaning: '偽物 → 恥' },
    { short: 'spit', long: 'spite', meaning: '唾を吐く → 悪意' },
    { short: 'mop', long: 'mope', meaning: 'モップ → ふさぎ込む' },
    { short: 'dot', long: 'dote', meaning: '点 → 溺愛する' }
  ],
  
  actions: [
    { short: 'bit', long: 'bite', meaning: '少し → 噛む' },
    { short: 'cut', long: 'cute', meaning: '切る → かわいい' },
    { short: 'din', long: 'dine', meaning: '騒音 → 食事する' },
    { short: 'hid', long: 'hide', meaning: '隠した → 隠す' },
    { short: 'rid', long: 'ride', meaning: '取り除く → 乗る' },
    { short: 'slid', long: 'slide', meaning: '滑った → 滑る' },
    { short: 'tap', long: 'tape', meaning: '軽く叩く → テープ' },
    { short: 'win', long: 'wine', meaning: '勝つ → ワイン' }
  ],
  
  objects: [
    { short: 'can', long: 'cane', meaning: '缶 → 杖' },
    { short: 'cap', long: 'cape', meaning: '帽子 → 岬/マント' },
    { short: 'kit', long: 'kite', meaning: '道具一式 → 凧' },
    { short: 'mat', long: 'mate', meaning: 'マット → 仲間' },
    { short: 'not', long: 'note', meaning: '〜ない → メモ/音符' },
    { short: 'pan', long: 'pane', meaning: 'フライパン → 窓ガラス' },
    { short: 'pin', long: 'pine', meaning: 'ピン → 松' },
    { short: 'tub', long: 'tube', meaning: '浴槽 → 管/チューブ' }
  ],
  
  nature: [
    { short: 'fir', long: 'fire', meaning: 'モミの木 → 火' },
    { short: 'gal', long: 'gale', meaning: '女の子 → 強風' },
    { short: 'pin', long: 'pine', meaning: 'ピン → 松' },
    { short: 'rat', long: 'rate', meaning: 'ネズミ → 率/評価' },
    { short: 'star', long: 'stare', meaning: '星 → じっと見る' }
  ],
  
  body: [
    { short: 'shin', long: 'shine', meaning: 'すね → 輝く' },
    { short: 'spin', long: 'spine', meaning: '回転する → 背骨' },
    { short: 'lob', long: 'lobe', meaning: '高く打つ → 耳たぶ' }
  ]
};

// ゲーム用ヘルパー関数
export function getRandomMagicEPair(difficulty = 'all') {
  let pool = [];
  
  switch(difficulty) {
    case 'beginner':
      pool = magicEWords.beginner;
      break;
    case 'intermediate':
      pool = magicEWords.intermediate;
      break;
    case 'advanced':
      pool = magicEWords.advanced;
      break;
    case 'all':
    default:
      pool = [...magicEWords.beginner, ...magicEWords.intermediate, ...magicEWords.advanced];
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getMagicEPairsByCategory(category) {
  return magicEByCategory[category] || [];
}

export function getAllMagicEWords() {
  return [...magicEWords.beginner, ...magicEWords.intermediate, ...magicEWords.advanced];
}