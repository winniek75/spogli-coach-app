/**
 * Sound Adventure と Grammar Galaxy Foundation の連携API
 * 音韻学習の進捗に基づいて文法学習のアンロック条件を管理
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSoundAdventureStore = defineStore('soundAdventure', () => {
  // === Sound Adventure 進捗データ ===
  const playerProgress = ref({
    // 基本情報
    totalGamesCompleted: 0,
    totalStarsEarned: 0,
    currentLevel: 1,
    lastPlayDate: null,

    // 音素習得データ（44音素）
    phonemesMastery: {
      // 短母音
      short_vowels: {
        'æ': { accuracy: 0, attempts: 0, lastPlayed: null }, // cat
        'ɪ': { accuracy: 0, attempts: 0, lastPlayed: null }, // sit
        'ʌ': { accuracy: 0, attempts: 0, lastPlayed: null }, // cup
        'ɛ': { accuracy: 0, attempts: 0, lastPlayed: null }, // bed
        'ɒ': { accuracy: 0, attempts: 0, lastPlayed: null }  // hot
      },
      // 長母音
      long_vowels: {
        'eɪ': { accuracy: 0, attempts: 0, lastPlayed: null }, // cake
        'aɪ': { accuracy: 0, attempts: 0, lastPlayed: null }, // bike
        'ɔɪ': { accuracy: 0, attempts: 0, lastPlayed: null }, // boy
        'aʊ': { accuracy: 0, attempts: 0, lastPlayed: null }, // house
        'oʊ': { accuracy: 0, attempts: 0, lastPlayed: null }  // boat
      },
      // 基本子音
      basic_consonants: {
        'p': { accuracy: 0, attempts: 0, lastPlayed: null },
        'b': { accuracy: 0, attempts: 0, lastPlayed: null },
        't': { accuracy: 0, attempts: 0, lastPlayed: null },
        'd': { accuracy: 0, attempts: 0, lastPlayed: null },
        'k': { accuracy: 0, attempts: 0, lastPlayed: null },
        'g': { accuracy: 0, attempts: 0, lastPlayed: null }
      },
      // 摩擦音
      fricatives: {
        'f': { accuracy: 0, attempts: 0, lastPlayed: null },
        'v': { accuracy: 0, attempts: 0, lastPlayed: null },
        'θ': { accuracy: 0, attempts: 0, lastPlayed: null }, // think
        'ð': { accuracy: 0, attempts: 0, lastPlayed: null }, // this
        's': { accuracy: 0, attempts: 0, lastPlayed: null },
        'z': { accuracy: 0, attempts: 0, lastPlayed: null }
      },
      // その他子音
      other_consonants: {
        'ʃ': { accuracy: 0, attempts: 0, lastPlayed: null }, // ship
        'ʒ': { accuracy: 0, attempts: 0, lastPlayed: null }, // measure
        'ʧ': { accuracy: 0, attempts: 0, lastPlayed: null }, // church
        'ʤ': { accuracy: 0, attempts: 0, lastPlayed: null }, // judge
        'm': { accuracy: 0, attempts: 0, lastPlayed: null },
        'n': { accuracy: 0, attempts: 0, lastPlayed: null },
        'ŋ': { accuracy: 0, attempts: 0, lastPlayed: null }  // sing
      },
      // 流音・半母音
      liquids_glides: {
        'l': { accuracy: 0, attempts: 0, lastPlayed: null },
        'r': { accuracy: 0, attempts: 0, lastPlayed: null },
        'w': { accuracy: 0, attempts: 0, lastPlayed: null },
        'j': { accuracy: 0, attempts: 0, lastPlayed: null }, // yes
        'h': { accuracy: 0, attempts: 0, lastPlayed: null }
      }
    },

    // 語彙習得データ
    vocabularyMastery: {
      basic_nouns: { learned: 0, target: 100 },      // 基本名詞
      action_verbs: { learned: 0, target: 80 },      // 動作動詞
      adjectives: { learned: 0, target: 60 },        // 形容詞
      function_words: { learned: 0, target: 40 },    // 機能語
      sight_words: { learned: 0, target: 200 }       // サイトワード
    },

    // ブレンディングスキル
    blendingSkills: {
      cvc_words: { accuracy: 0, speed: 0 },          // cat, dog, pen
      cvce_words: { accuracy: 0, speed: 0 },         // cake, bike, home
      consonant_blends: { accuracy: 0, speed: 0 },   // blend, stop, three
      advanced_patterns: { accuracy: 0, speed: 0 }   // thought, night, phone
    },

    // 読解流暢度
    readingFluency: {
      words_per_minute: 0,
      comprehension_rate: 0,
      expression_score: 0
    }
  })

  // === 計算されたプロパティ ===
  
  /**
   * 全音素の平均習得率
   */
  const overallPhonemeMastery = computed(() => {
    let totalAccuracy = 0
    let phonemeCount = 0

    Object.values(playerProgress.value.phonemesMastery).forEach(category => {
      Object.values(category).forEach(phoneme => {
        if (phoneme.attempts > 0) {
          totalAccuracy += phoneme.accuracy
          phonemeCount++
        }
      })
    })

    return phonemeCount > 0 ? totalAccuracy / phonemeCount : 0
  })

  /**
   * 語彙カテゴリ別習得率
   */
  const vocabularyCompletionRate = computed(() => {
    const vocab = playerProgress.value.vocabularyMastery
    let totalLearned = 0
    let totalTarget = 0

    Object.values(vocab).forEach(category => {
      totalLearned += category.learned
      totalTarget += category.target
    })

    return totalTarget > 0 ? totalLearned / totalTarget : 0
  })

  /**
   * 基本語彙数（500語基準）
   */
  const basicVocabularyCount = computed(() => {
    const vocab = playerProgress.value.vocabularyMastery
    return vocab.basic_nouns.learned + 
           vocab.action_verbs.learned + 
           vocab.adjectives.learned + 
           vocab.function_words.learned
  })

  /**
   * ブレンディング全体スキル
   */
  const overallBlendingSkill = computed(() => {
    const skills = playerProgress.value.blendingSkills
    const accuracies = Object.values(skills).map(skill => skill.accuracy)
    return accuracies.length > 0 ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length : 0
  })

  /**
   * Grammar Galaxy 解禁の準備状況
   */
  const grammarGalaxyReadiness = computed(() => {
    const readiness = {
      phonicsReady: overallPhonemeMastery.value >= 0.85, // 85%以上
      vocabularyReady: basicVocabularyCount.value >= 500, // 500語以上
      blendingReady: overallBlendingSkill.value >= 0.75,  // 75%以上
      fluencyReady: playerProgress.value.readingFluency.words_per_minute >= 60 // 60WPM以上
    }

    const totalCriteria = Object.keys(readiness).length
    const metCriteria = Object.values(readiness).filter(Boolean).length

    return {
      ...readiness,
      overallReady: metCriteria >= 3, // 4項目中3項目以上でOK
      completionRate: metCriteria / totalCriteria,
      nextSteps: getNextSteps(readiness)
    }
  })

  // === アクション ===

  /**
   * 音素習得データを更新
   */
  const updatePhonemeMastery = (phoneme, accuracy, category = null) => {
    // カテゴリが指定されていない場合は自動検出
    if (!category) {
      category = findPhonemeCategory(phoneme)
    }

    if (category && playerProgress.value.phonemesMastery[category] && 
        playerProgress.value.phonemesMastery[category][phoneme]) {
      const phonemeData = playerProgress.value.phonemesMastery[category][phoneme]
      phonemeData.attempts += 1
      phonemeData.accuracy = Math.max(phonemeData.accuracy, accuracy)
      phonemeData.lastPlayed = new Date().toISOString()
      
      saveProgress()
    }
  }

  /**
   * 語彙習得データを更新
   */
  const updateVocabularyMastery = (category, wordsLearned) => {
    if (playerProgress.value.vocabularyMastery[category]) {
      playerProgress.value.vocabularyMastery[category].learned = Math.max(
        playerProgress.value.vocabularyMastery[category].learned,
        wordsLearned
      )
      saveProgress()
    }
  }

  /**
   * ブレンディングスキルを更新
   */
  const updateBlendingSkills = (skillType, accuracy, speed) => {
    if (playerProgress.value.blendingSkills[skillType]) {
      const skill = playerProgress.value.blendingSkills[skillType]
      skill.accuracy = Math.max(skill.accuracy, accuracy)
      skill.speed = Math.max(skill.speed, speed)
      saveProgress()
    }
  }

  /**
   * 読解流暢度を更新
   */
  const updateReadingFluency = (wpm, comprehension, expression) => {
    const fluency = playerProgress.value.readingFluency
    fluency.words_per_minute = Math.max(fluency.words_per_minute, wpm)
    fluency.comprehension_rate = Math.max(fluency.comprehension_rate, comprehension)
    fluency.expression_score = Math.max(fluency.expression_score, expression)
    saveProgress()
  }

  /**
   * ゲーム完了データを記録
   */
  const recordGameCompletion = (gameType, score, accuracy, timeSpent) => {
    playerProgress.value.totalGamesCompleted += 1
    playerProgress.value.lastPlayDate = new Date().toISOString()

    // ゲームタイプに応じて適切なデータを更新
    switch (gameType) {
      case 'phoneme_recognition':
        // 音素認識ゲームの場合
        break
      case 'word_building':
        // 単語構築ゲームの場合
        break
      case 'sight_word_training':
        // サイトワード練習の場合
        break
    }

    saveProgress()
  }

  /**
   * Grammar Galaxy用の完了データを生成
   */
  const getCompletionData = () => {
    return {
      phonicsMastery: overallPhonemeMastery.value,
      vocabularyBase: basicVocabularyCount.value,
      vocabularyRate: vocabularyCompletionRate.value,
      blendingSkill: overallBlendingSkill.value,
      readingFluency: playerProgress.value.readingFluency.words_per_minute / 100, // 正規化
      comprehensionRate: playerProgress.value.readingFluency.comprehension_rate,
      
      // Grammar Galaxy解禁条件
      readyForGrammar: grammarGalaxyReadiness.value.overallReady,
      
      // 詳細統計
      statistics: {
        totalGames: playerProgress.value.totalGamesCompleted,
        totalStars: playerProgress.value.totalStarsEarned,
        level: playerProgress.value.currentLevel,
        lastPlayed: playerProgress.value.lastPlayDate
      },

      // 推奨学習パス
      recommendations: generateRecommendations()
    }
  }

  /**
   * 次のステップを取得
   */
  const getNextSteps = (readiness) => {
    const steps = []

    if (!readiness.phonicsReady) {
      steps.push({
        type: 'phonics',
        message: '音素認識をもう少し練習しましょう',
        target: '85%の正解率',
        current: `${Math.round(overallPhonemeMastery.value * 100)}%`
      })
    }

    if (!readiness.vocabularyReady) {
      steps.push({
        type: 'vocabulary',
        message: '基本語彙を増やしましょう',
        target: '500語',
        current: `${basicVocabularyCount.value}語`
      })
    }

    if (!readiness.blendingReady) {
      steps.push({
        type: 'blending',
        message: '単語の読み方練習を続けましょう',
        target: '75%の正解率',
        current: `${Math.round(overallBlendingSkill.value * 100)}%`
      })
    }

    if (!readiness.fluencyReady) {
      steps.push({
        type: 'fluency',
        message: '読む速度を上げましょう',
        target: '60語/分',
        current: `${playerProgress.value.readingFluency.words_per_minute}語/分`
      })
    }

    return steps
  }

  /**
   * 推奨学習パスを生成
   */
  const generateRecommendations = () => {
    const recommendations = []
    const readiness = grammarGalaxyReadiness.value

    if (readiness.overallReady) {
      recommendations.push({
        type: 'grammar_galaxy',
        priority: 'high',
        title: 'Grammar Galaxy を始めましょう！',
        description: 'Sound Adventure の基礎学習が完了しました。文法学習に進む準備ができています。',
        action: 'start_grammar_galaxy'
      })
    } else {
      // 弱点に基づいた推奨
      const steps = readiness.nextSteps
      if (steps.length > 0) {
        const priorityStep = steps[0]
        recommendations.push({
          type: priorityStep.type,
          priority: 'high',
          title: `${priorityStep.message}`,
          description: `目標: ${priorityStep.target} (現在: ${priorityStep.current})`,
          action: `focus_on_${priorityStep.type}`
        })
      }
    }

    return recommendations
  }

  /**
   * 音素のカテゴリを検索
   */
  const findPhonemeCategory = (phoneme) => {
    for (const [category, phonemes] of Object.entries(playerProgress.value.phonemesMastery)) {
      if (phonemes[phoneme]) {
        return category
      }
    }
    return null
  }

  /**
   * 弱点音素を特定
   */
  const getWeakPhonemes = (threshold = 0.7) => {
    const weakPhonemes = []

    Object.entries(playerProgress.value.phonemesMastery).forEach(([category, phonemes]) => {
      Object.entries(phonemes).forEach(([phoneme, data]) => {
        if (data.attempts > 0 && data.accuracy < threshold) {
          weakPhonemes.push({
            phoneme,
            category,
            accuracy: data.accuracy,
            attempts: data.attempts,
            lastPlayed: data.lastPlayed
          })
        }
      })
    })

    return weakPhonemes.sort((a, b) => a.accuracy - b.accuracy)
  }

  /**
   * 学習統計を取得
   */
  const getStatistics = () => {
    const phonemeStats = {
      total: 0,
      learned: 0,
      accuracy: 0
    }

    Object.values(playerProgress.value.phonemesMastery).forEach(category => {
      Object.values(category).forEach(phoneme => {
        phonemeStats.total++
        if (phoneme.attempts > 0) {
          phonemeStats.learned++
          phonemeStats.accuracy += phoneme.accuracy
        }
      })
    })

    if (phonemeStats.learned > 0) {
      phonemeStats.accuracy /= phonemeStats.learned
    }

    return {
      phonemes: phonemeStats,
      vocabulary: {
        total: basicVocabularyCount.value,
        rate: vocabularyCompletionRate.value
      },
      blending: {
        skill: overallBlendingSkill.value
      },
      fluency: playerProgress.value.readingFluency,
      grammarReadiness: grammarGalaxyReadiness.value
    }
  }

  /**
   * 進捗データを保存
   */
  const saveProgress = () => {
    try {
      const saveData = {
        playerProgress: playerProgress.value,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      }
      localStorage.setItem('soundAdventureProgress', JSON.stringify(saveData))
    } catch (error) {
      console.error('Failed to save sound adventure progress:', error)
    }
  }

  /**
   * 進捗データを読み込み
   */
  const loadProgress = () => {
    try {
      const savedData = localStorage.getItem('soundAdventureProgress')
      if (savedData) {
        const data = JSON.parse(savedData)
        if (data.playerProgress) {
          playerProgress.value = { ...playerProgress.value, ...data.playerProgress }
          return true
        }
      }
    } catch (error) {
      console.error('Failed to load sound adventure progress:', error)
    }
    return false
  }

  /**
   * 進捗をリセット（開発・テスト用）
   */
  const resetProgress = () => {
    // 初期状態にリセット
    Object.values(playerProgress.value.phonemesMastery).forEach(category => {
      Object.values(category).forEach(phoneme => {
        phoneme.accuracy = 0
        phoneme.attempts = 0
        phoneme.lastPlayed = null
      })
    })

    Object.values(playerProgress.value.vocabularyMastery).forEach(category => {
      category.learned = 0
    })

    Object.values(playerProgress.value.blendingSkills).forEach(skill => {
      skill.accuracy = 0
      skill.speed = 0
    })

    playerProgress.value.readingFluency = {
      words_per_minute: 0,
      comprehension_rate: 0,
      expression_score: 0
    }

    playerProgress.value.totalGamesCompleted = 0
    playerProgress.value.totalStarsEarned = 0
    playerProgress.value.currentLevel = 1
    playerProgress.value.lastPlayDate = null

    saveProgress()
  }

  /**
   * テストデータを生成
   */
  const generateTestData = () => {
    // Grammar Galaxy解禁に必要な最小限の進捗を設定
    
    // 基本音素を高精度で習得済みに設定
    const essentialPhonemes = ['æ', 'ɪ', 'ʌ', 'ɛ', 'ɒ', 'p', 'b', 't', 'd', 'k', 'g', 's', 'z', 'm', 'n', 'l', 'r']
    
    Object.values(playerProgress.value.phonemesMastery).forEach(category => {
      Object.keys(category).forEach(phoneme => {
        if (essentialPhonemes.includes(phoneme)) {
          category[phoneme] = {
            accuracy: 0.85 + Math.random() * 0.15, // 85-100%
            attempts: 10 + Math.floor(Math.random() * 10),
            lastPlayed: new Date().toISOString()
          }
        }
      })
    })

    // 語彙データを設定
    playerProgress.value.vocabularyMastery = {
      basic_nouns: { learned: 120, target: 100 },
      action_verbs: { learned: 85, target: 80 },
      adjectives: { learned: 65, target: 60 },
      function_words: { learned: 45, target: 40 },
      sight_words: { learned: 220, target: 200 }
    }

    // ブレンディングスキル
    playerProgress.value.blendingSkills = {
      cvc_words: { accuracy: 0.85, speed: 75 },
      cvce_words: { accuracy: 0.80, speed: 65 },
      consonant_blends: { accuracy: 0.75, speed: 55 },
      advanced_patterns: { accuracy: 0.70, speed: 45 }
    }

    // 読解流暢度
    playerProgress.value.readingFluency = {
      words_per_minute: 65,
      comprehension_rate: 0.85,
      expression_score: 0.75
    }

    // 基本統計
    playerProgress.value.totalGamesCompleted = 45
    playerProgress.value.totalStarsEarned = 120
    playerProgress.value.currentLevel = 5
    playerProgress.value.lastPlayDate = new Date().toISOString()

    saveProgress()
  }

  // 初期化時にデータを読み込み
  loadProgress()

  return {
    // State
    playerProgress,
    
    // Computed
    overallPhonemeMastery,
    vocabularyCompletionRate,
    basicVocabularyCount,
    overallBlendingSkill,
    grammarGalaxyReadiness,
    
    // Actions
    updatePhonemeMastery,
    updateVocabularyMastery,
    updateBlendingSkills,
    updateReadingFluency,
    recordGameCompletion,
    getCompletionData,
    getWeakPhonemes,
    getStatistics,
    saveProgress,
    loadProgress,
    resetProgress,
    generateTestData
  }
}, {
  persist: {
    key: 'movwise-sound-adventure',
    storage: localStorage,
    paths: ['playerProgress']
  }
})

/**
 * Grammar Galaxy との連携ユーティリティ関数
 */
export const SoundAdventureGrammarBridge = {
  /**
   * Grammar Galaxy 解禁チェック
   */
  checkGrammarGalaxyUnlock: (soundStore) => {
    const readiness = soundStore.grammarGalaxyReadiness
    return {
      canUnlock: readiness.overallReady,
      requirements: readiness,
      recommendations: soundStore.getCompletionData().recommendations
    }
  },

  /**
   * 学習データの移行
   */
  transferLearningData: (soundStore, grammarStore) => {
    const completionData = soundStore.getCompletionData()
    
    if (completionData.readyForGrammar) {
      // Grammar Galaxy の最初のプラネットを解禁
      grammarStore.initializeFromSoundAdventure(completionData)
      
      return {
        success: true,
        unlockedContent: ['beVerb'],
        message: 'Grammar Galaxy が解禁されました！'
      }
    }
    
    return {
      success: false,
      requirements: completionData.recommendations,
      message: 'もう少し Sound Adventure で練習してから Grammar Galaxy に進みましょう。'
    }
  },

  /**
   * 連携状態の確認
   */
  validateBridge: (soundStore, grammarStore) => {
    const soundData = soundStore.getCompletionData()
    const grammarData = grammarStore.getStatistics()
    
    return {
      soundAdventureComplete: soundData.readyForGrammar,
      grammarGalaxyActive: grammarData.unlockedPlanets > 0,
      bridgeActive: soundData.readyForGrammar && grammarData.unlockedPlanets > 0,
      lastSync: new Date().toISOString()
    }
  }
}