// src/data/phoneme-database.js
// MovWISE Native English Pronunciation - 44 Phonemes Database (General American English)

export const PHONEME_PROGRESSION = {
  // Stage 1A: Foundation Phonemes (Critical for Japanese Learners)
  stage1A: [
    {
      symbol: '/s/',
      ipa: 's',
      description: 'Voiceless alveolar fricative',
      examples: ['sun', 'sit', 'bass'],
      difficulty: 1,
      group: 'fricatives',
      confusingSounds: ['/z/', '/θ/', '/ʃ/'],
      masteryThreshold: 0.85,
      color: 'from-blue-400 to-blue-600',
      audioFile: 's.m4a',
      nativeTips: 'Keep tongue tip near but not touching alveolar ridge. Continuous airflow.',
      commonErrors: 'Japanese speakers often add vowel sound (su). Practice pure /s/ without vowel.'
    },
    {
      symbol: '/æ/',
      ipa: 'æ',
      description: 'Near-open front unrounded vowel (Standard American /æ/)',
      examples: ['cat', 'hat', 'bad'],
      difficulty: 2,
      group: 'short_vowels',
      confusingSounds: ['/ʌ/', '/ɑ/', '/ɛ/'],
      masteryThreshold: 0.85,
      color: 'from-red-400 to-red-600',
      audioFile: 'a1.m4a',
      nativeTips: 'Tongue low and front, mouth wider than Japanese /a/. Very different from Japanese /a/.',
      commonErrors: 'Japanese speakers substitute /a/ sound. Practice extreme mouth width and tongue position.'
    },
    {
      symbol: '/t/',
      ipa: 't',
      description: 'Voiceless alveolar plosive (with aspiration in initial position)',
      examples: ['top', 'cat', 'better'],
      difficulty: 1,
      group: 'plosives',
      confusingSounds: ['/d/', '/k/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-green-400 to-green-600',
      audioFile: 't.m4a',
      nativeTips: 'Strong aspiration when word-initial. Tongue tip contacts alveolar ridge.',
      commonErrors: 'Insufficient aspiration in initial position. Practice strong puff of air.'
    }
  ],

  // Stage 1B: Critical Distinctions for Japanese Learners
  stage1B: [
    {
      symbol: '/ɪ/',
      ipa: 'ɪ',
      description: 'Near-close near-front unrounded vowel (lax vowel)',
      examples: ['sit', 'hit', 'big'],
      difficulty: 2,
      group: 'short_vowels',
      confusingSounds: ['/iː/', '/e/', '/ɛ/'],
      masteryThreshold: 0.85,
      color: 'from-purple-400 to-purple-600',
      audioFile: '/audio/phonemes/i.mp3'
    },
    {
      symbol: '/p/',
      ipa: 'p',
      description: 'Voiceless bilabial plosive',
      examples: ['pen', 'top', 'cup'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/b/', '/t/', '/k/'],
      masteryThreshold: 0.85,
      color: 'from-yellow-400 to-yellow-600',
      audioFile: '/audio/phonemes/p.mp3'
    },
    {
      symbol: '/n/',
      ipa: 'n',
      description: 'Voiced alveolar nasal',
      examples: ['sun', 'pen', 'run'],
      difficulty: 2,
      group: 'nasals',
      confusingSounds: ['/m/', '/ŋ/', '/l/'],
      masteryThreshold: 0.85,
      color: 'from-indigo-400 to-indigo-600',
      audioFile: '/audio/phonemes/n.mp3'
    }
  ],

  // Stage 1C: 基礎完成
  stage1C: [
    {
      symbol: '/c/',
      ipa: 'k',
      description: 'Voiceless velar plosive (written as c/k)',
      examples: ['cat', 'cup', 'can'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/g/', '/t/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-orange-400 to-orange-600',
      audioFile: '/audio/phonemes/k.mp3'
    },
    {
      symbol: '/k/',
      ipa: 'k',
      description: 'Voiceless velar plosive (written as k)',
      examples: ['key', 'kid', 'kite'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/g/', '/t/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-cyan-400 to-cyan-600',
      audioFile: '/audio/phonemes/k.mp3'
    },
    {
      symbol: '/e/',
      ipa: 'e',
      description: 'Close-mid front unrounded vowel',
      examples: ['bed', 'red', 'get'],
      difficulty: 2,
      group: 'short_vowels',
      confusingSounds: ['/ɛ/', '/ɪ/', '/æ/'],
      masteryThreshold: 0.85,
      color: 'from-pink-400 to-pink-600',
      audioFile: '/audio/phonemes/e.mp3'
    }
  ]
}

// 学習段階の依存関係
export const STAGE_DEPENDENCIES = {
  stage1B: ['stage1A'],
  stage1C: ['stage1A', 'stage1B'],
  stage2A: ['stage1A', 'stage1B', 'stage1C'],
  stage2B: ['stage2A'],
  stage2C: ['stage2A', 'stage2B']
}

// マスタリー基準
export const MASTERY_CRITERIA = {
  singlePhoneme: 0.85,        // 個別音素85%以上
  stageCompletion: 0.80,      // ステージ全体80%以上
  levelAdvancement: 0.90,     // レベル進級90%以上
  consecutiveCorrect: 3,      // 連続3回正解
  minAttempts: 5             // 最低試行回数
}

// 音素グループ分類
export const PHONEME_GROUPS = {
  short_vowels: {
    name: 'Short Vowels',
    description: '短母音',
    members: ['/a/', '/e/', '/i/', '/o/', '/u/'],
    color: 'from-red-400 to-pink-500'
  },
  long_vowels: {
    name: 'Long Vowels', 
    description: '長母音',
    members: ['/eɪ/', '/aɪ/', '/ɔɪ/', '/aʊ/', '/oʊ/'],
    color: 'from-blue-400 to-purple-500'
  },
  plosives: {
    name: 'Plosives',
    description: '破裂音',
    members: ['/p/', '/b/', '/t/', '/d/', '/k/', '/g/'],
    color: 'from-green-400 to-teal-500'
  },
  fricatives: {
    name: 'Fricatives',
    description: '摩擦音',
    members: ['/f/', '/v/', '/θ/', '/ð/', '/s/', '/z/', '/ʃ/', '/ʒ/'],
    color: 'from-yellow-400 to-orange-500'
  },
  nasals: {
    name: 'Nasals',
    description: '鼻音',
    members: ['/m/', '/n/', '/ŋ/'],
    color: 'from-purple-400 to-indigo-500'
  }
}

// 段階的学習パス
export const LEARNING_PATH = [
  {
    stage: 'stage1A',
    name: 'Foundation Phase',
    description: '基礎3音素の確立',
    requiredMastery: 0.90,
    estimatedTime: '1-2 weeks'
  },
  {
    stage: 'stage1B',
    name: 'Expansion Phase',
    description: '基礎音素の拡張',
    requiredMastery: 0.85,
    estimatedTime: '1-2 weeks'
  },
  {
    stage: 'stage1C',
    name: 'Completion Phase',
    description: '基礎段階の完成',
    requiredMastery: 0.85,
    estimatedTime: '1-2 weeks'
  }
]

// エラー分析パターン
export const COMMON_CONFUSION_PATTERNS = {
  voicing: {
    description: '有声・無声の混同',
    pairs: [
      ['/p/', '/b/'],
      ['/t/', '/d/'],
      ['/k/', '/g/'],
      ['/f/', '/v/'],
      ['/s/', '/z/']
    ]
  },
  place_of_articulation: {
    description: '調音位置の混同',
    pairs: [
      ['/p/', '/t/', '/k/'],
      ['/b/', '/d/', '/g/'],
      ['/f/', '/θ/', '/s/']
    ]
  },
  vowel_height: {
    description: '母音の舌の高さ',
    pairs: [
      ['/i/', '/ɪ/'],
      ['/e/', '/ɛ/'],
      ['/o/', '/ɔ/']
    ]
  }
}

// 適応学習設定
export const ADAPTIVE_SETTINGS = {
  easyMode: {
    choiceCount: 2,           // 選択肢2つ
    playSpeed: 0.7,           // ゆっくり再生
    repeatAllowed: 5,         // 5回まで再生可能
    feedbackDelay: 3000       // 3秒フィードバック表示
  },
  normalMode: {
    choiceCount: 3,
    playSpeed: 1.0,
    repeatAllowed: 3,
    feedbackDelay: 2000
  },
  hardMode: {
    choiceCount: 4,
    playSpeed: 1.2,
    repeatAllowed: 1,
    feedbackDelay: 1500
  }
}

// 音声合成設定
export const TTS_SETTINGS = {
  language: 'en-US',
  voices: [
    'Google US English Female',
    'Microsoft Zira Desktop',
    'Alex'
  ],
  phoneme: {
    rate: 0.6,
    pitch: 1.0,
    volume: 1.0
  },
  word: {
    rate: 0.8,
    pitch: 1.1,
    volume: 1.0
  }
}