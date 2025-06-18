// 新しいステージ構成（英語習得の科学的順序に基づく）
export const newStageStructure = {
  // メインルート（音韻習得の道）
  mainRoute: {
    // Stage 1: サウンド・ファウンデーション（音の基礎）
    stage1: {
      id: 'soundFoundation',
      name: '🎵 サウンド・ファウンデーション',
      description: '純粋な音認識からスタート。英語の44音素をマスターしよう！',
      learningFocus: 'Stage 1: 音の基礎 → 音素認識能力を身につける',
      unlocked: true,
      games: [
        {
          id: 'pureSoundLab',
          name: 'ピュア・サウンド・ラボ',
          description: '文字を見ずに音だけで44音素を段階的に学習',
          icon: '🔬',
          difficulty: 1,
          routeName: 'pure-sound-lab'
        },
        {
          id: 'soundToSymbolMatch',
          name: 'サウンド→シンボル・マッチング',
          description: '音を聞いて対応する文字を選択する音文字結合',
          icon: '🎯',
          difficulty: 1,
          routeName: 'sound-to-symbol-match'
        },
        {
          id: 'phonemePatternLab',
          name: 'フォニックス・パターン・ラボ',
          description: '同音素グループの体系的学習（短母音、長母音等）',
          icon: '⚗️',
          difficulty: 1,
          routeName: 'phoneme-pattern-lab'
        }
      ]
    },

    // Stage 2: ブレンディング・ベーシック（音素合成）
    stage2: {
      id: 'blendingBasic',
      name: '⭐ ブレンディング・ベーシック',
      description: '音素を組み合わせて単語を作成！基本的な音声変換をマスター',
      learningFocus: 'Stage 2: 音素合成 → 音を組み合わせて単語を作る',
      unlockRequirement: 'Stage 1を70%完了',
      games: [
        {
          id: 'sequentialBlending',
          name: 'シーケンシャル・ブレンディング',
          description: 'c-a-t → catの段階的音素合成を視覚化',
          icon: '📈',
          difficulty: 2,
          routeName: 'sequential-blending'
        },
        {
          id: 'cvcWordFactory',
          name: 'CVC ワード・ファクトリー',
          description: '子音-母音-子音パターンの体系的学習',
          icon: '🏭',
          difficulty: 2,
          routeName: 'cvc-word-factory'
        },
        {
          id: 'wordFamilyTree',
          name: 'ワード・ファミリー・ツリー',
          description: '-at family（cat, hat, bat）等の音韻パターン学習',
          icon: '🌳',
          difficulty: 2,
          routeName: 'word-family-tree'
        }
      ]
    },

    // Stage 3: ディクテーション＆スペリング（音声を文字へ）
    stage3: {
      id: 'dictationSpelling',
      name: '✍️ ディクテーション＆スペリング',
      description: '聞いた音を正確に文字化！スペリング能力を強化',
      learningFocus: 'Stage 3: 音声→文字 → 聞いた音を正確に書き取る',
      unlockRequirement: 'Stage 2を60%完了',
      games: [
        {
          id: 'voiceDictation',
          name: '音声ディクテーション',
          description: '聞いた単語を正確にタイピング',
          icon: '🎧',
          difficulty: 2,
          routeName: 'voice-dictation'
        },
        {
          id: 'spellChallenge',
          name: 'スペル・チャレンジ',
          description: '正確な綴りを段階的に学習',
          icon: '✏️',
          difficulty: 2,
          routeName: 'spell-challenge'
        },
        {
          id: 'phonemeDecomposition',
          name: '音素分解ゲーム',
          description: '単語を聞いて音素に分解',
          icon: '🧩',
          difficulty: 3,
          routeName: 'phoneme-decomposition'
        }
      ]
    },

    // Stage 4: スペシャル・サウンド・ルール（特殊音韻ルール）
    stage4: {
      id: 'specialSoundRules',
      name: '🌙 スペシャル・サウンド・ルール',
      description: '特殊な音韻ルールをマスター！英語の音の秘密を解き明かそう',
      learningFocus: 'Stage 4: 特殊ルール → 音韻変化パターンを習得',
      unlockRequirement: 'Stage 3を70%完了',
      games: [
        {
          id: 'digraphMaster',
          name: 'ダイグラフ・マスター',
          description: 'ch, sh, th, wh, phの二文字一音パターン',
          icon: '👯',
          difficulty: 3,
          routeName: 'digraph-master'
        },
        {
          id: 'magicECastle',
          name: 'マジック・E・キャッスル',
          description: '長母音変化の魔法をマスター（can→cane, bit→bite）',
          icon: '🏰',
          difficulty: 3,
          routeName: 'magic-e-castle'
        },
        {
          id: 'silentLetterDetective',
          name: 'サイレント・レター探偵',
          description: '無音文字のパターンを発見（knife, knee, write等）',
          icon: '🕵️',
          difficulty: 3,
          routeName: 'silent-letter-detective'
        },
        {
          id: 'doubleLetterLab',
          name: 'ダブル・レター・ラボ',
          description: 'ff, ll, ssなどの重子音ルールを学習',
          icon: '👥',
          difficulty: 3,
          routeName: 'double-letter-lab'
        }
      ]
    },

    // Stage 5: アドバンスド・フォニックス（上級音韻）
    stage5: {
      id: 'advancedPhonics',
      name: '🚀 アドバンスド・フォニックス',
      description: '複雑な音韻パターンに挑戦！上級レベルへの道',
      learningFocus: 'Stage 5: 上級音韻 → 複雑なパターンを習得',
      unlockRequirement: 'Stage 4を70%完了',
      games: [
        {
          id: 'homophoneChallenge',
          name: '同音異綴チャレンジ',
          description: 'to/too/two, their/there等の使い分け',
          icon: '🎭',
          difficulty: 4,
          routeName: 'homophone-challenge'
        },
        {
          id: 'rControlledVowels',
          name: 'Rコントロール・ボウルティックス',
          description: 'ar, er, ir, or, urの音変化をマスター',
          icon: '🎪',
          difficulty: 4,
          routeName: 'r-controlled-vowels'
        },
        {
          id: 'complexPhonemePatterns',
          name: 'コンプレックス・フォニーム・パターンズ',
          description: 'ough, tion, sion等の複雑パターン',
          icon: '🧬',
          difficulty: 4,
          routeName: 'complex-phoneme-patterns'
        }
      ]
    },

    // Stage 6: プロソディ＆フルーエンシー（韻律と流暢さ）
    stage6: {
      id: 'prosodyFluency',
      name: '🎭 プロソディ＆フルーエンシー',
      description: '英語の音楽性を習得！自然な英語のリズムをマスター',
      learningFocus: 'Stage 6: 韻律 → 自然な英語の音楽性を身につける',
      unlockRequirement: 'Stage 5を80%完了',
      games: [
        {
          id: 'stressPatternMaster',
          name: 'ストレス・パターン・マスター',
          description: '単語アクセント学習（PREsent vs preSENT）',
          icon: '🥁',
          difficulty: 4,
          routeName: 'stress-pattern-master'
        },
        {
          id: 'intonationWave',
          name: 'イントネーション・ウェーブ',
          description: '文の音調変化（疑問文、平叙文の違い）',
          icon: '🌊',
          difficulty: 4,
          routeName: 'intonation-wave'
        },
        {
          id: 'rhythmAndFlow',
          name: 'リズム・アンド・フロー',
          description: '英語の自然なリズムとフレージング',
          icon: '🎵',
          difficulty: 4,
          routeName: 'rhythm-and-flow'
        }
      ]
    }
  },

  // パラレルルート（同時進行可能）
  parallelRoute: {
    // 語彙マスター・トラック
    vocabularyTrack: {
      id: 'vocabularyMaster',
      name: '📖 語彙マスター・トラック',
      description: '実用的な英単語を効率的に習得！',
      learningFocus: '並行学習: 語彙力向上',
      alwaysUnlocked: true,
      games: [
        {
          id: 'sightWordMaster',
          name: 'サイトワード・マスター',
          description: '頻出単語200語の瞬間認識',
          icon: '👁️',
          difficulty: 2,
          routeName: 'sight-word-master'
        },
        {
          id: 'wordRushArena',
          name: 'ワード・ラッシュ・アリーナ',
          description: '60秒で10問！画像・音声・定義から瞬時に英単語を認識',
          icon: '⚡',
          difficulty: 3,
          routeName: 'WordRushGame'
        },
        {
          id: 'themeVocabulary',
          name: 'テーマ別語彙チャレンジ',
          description: 'カテゴリー別に語彙を効率学習',
          icon: '🎯',
          difficulty: 3,
          routeName: 'theme-vocabulary'
        }
      ]
    },

    // リズム＆ライム・トラック（補助的な韻律学習）
    rhythmTrack: {
      id: 'rhythmRhyme',
      name: '🎪 リズム＆ライム・トラック',
      description: '楽しみながら英語のリズムを体得！',
      learningFocus: '並行学習: 音楽性向上',
      alwaysUnlocked: true,
      games: [
        {
          id: 'rhymingRush',
          name: 'ライミング・ラッシュ',
          description: '韻を踏む単語をスピードキャッチ',
          icon: '🎪',
          difficulty: 2,
          routeName: 'rhyming-rush'
        },
        {
          id: 'magicCardBattle',
          name: '魔法カードバトル',
          description: '音声でカードを発動！魔法のバトルゲーム',
          icon: '🃏',
          difficulty: 2,
          routeName: 'magic-card-battle'
        },
        {
          id: 'spellRacing',
          name: 'スペル・レーシング',
          description: '音声で宇宙船を操縦！高速レースゲーム',
          icon: '🚀',
          difficulty: 3,
          routeName: 'spell-racing'
        }
      ]
    }
  },

  // 文法ギャラクシー（音韻習得後に本格化）
  grammarGalaxy: {
    id: 'grammarGalaxy',
    name: '🌌 グラマー・ギャラクシー',
    description: '音韻をマスターしたら文法の世界へ！',
    learningFocus: '次のステップ: 文法習得',
    unlockRequirement: 'メインルートStage 4を完了',
    preview: true
  }
}

// ステージ進行のロジック
export const stageProgressionRules = {
  // メインルートは順番に進む必要がある
  mainRouteProgression: {
    linear: true,
    unlockThreshold: 0.7, // 70%完了で次のステージ解放
    requiredGamesPerStage: 2 // 各ステージで最低2つのゲームをプレイ
  },
  
  // パラレルルートは常に利用可能
  parallelRouteProgression: {
    alwaysAvailable: true,
    recommendedAfter: 'stage1', // Stage 1完了後を推奨
    bonusPoints: true // メインルートの進捗にボーナスポイント
  },
  
  // 適応学習
  adaptiveLearning: {
    enabled: true,
    difficultyAdjustment: true,
    personalizedPath: true
  }
}