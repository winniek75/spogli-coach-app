// src/services/adaptiveLearning.js
// 適応学習エンジン - 学習者の能力に応じた問題生成

import { NATIVE_PHONEME_PROGRESSION as PHONEME_PROGRESSION, COMMON_CONFUSION_PATTERNS, ADAPTIVE_SETTINGS } from '@/data/native-phoneme-database.js'

export class AdaptiveLearningEngine {
  constructor() {
    this.learnerModel = {
      strongAreas: new Set(),
      weakAreas: new Set(),
      confusionMatrix: new Map(),
      learningVelocity: 'normal',
      reactionTimeProfile: {},
      difficultyPreference: 'normal'
    }
  }

  // メイン関数: 次の問題を適応的に生成
  generateNextQuestion(currentStage, progressData, learnerProfile) {
    const targetPhoneme = this.selectTargetPhoneme(currentStage, progressData, learnerProfile)
    const confusingPhonemes = this.selectConfusingPhonemes(targetPhoneme, learnerProfile)
    const difficulty = this.calculateDifficulty(targetPhoneme, learnerProfile)
    
    return {
      target: targetPhoneme,
      choices: this.generateChoices(targetPhoneme, confusingPhonemes, difficulty),
      settings: this.getAdaptiveSettings(difficulty),
      explanation: this.generateExplanation(targetPhoneme),
      metadata: {
        difficulty,
        reasoning: this.getSelectionReasoning(targetPhoneme, learnerProfile)
      }
    }
  }

  // 対象音素の選択ロジック
  selectTargetPhoneme(currentStage, progressData, learnerProfile) {
    const stagePhonemes = PHONEME_PROGRESSION[currentStage] || []
    
    // 1. 弱い音素を優先（最高優先度）
    const weakPhonemes = this.identifyWeakPhonemes(stagePhonemes, progressData)
    if (weakPhonemes.length > 0) {
      return this.selectFromWeakPhonemes(weakPhonemes, progressData)
    }
    
    // 2. 未習得の音素（中優先度）
    const unmasteredPhonemes = this.identifyUnmasteredPhonemes(stagePhonemes, progressData)
    if (unmasteredPhonemes.length > 0) {
      return this.selectNewPhoneme(unmasteredPhonemes)
    }
    
    // 3. 復習用音素（低優先度）
    return this.selectReviewPhoneme(stagePhonemes, progressData)
  }

  identifyWeakPhonemes(phonemes, progressData) {
    return phonemes.filter(phoneme => {
      const attempts = this.getPhonemeAttempts(phoneme.symbol, progressData.attempts)
      if (attempts.length < 3) return false
      
      const recentAttempts = attempts.slice(-5)
      const accuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length
      const avgReactionTime = recentAttempts.reduce((sum, a) => sum + a.reactionTime, 0) / recentAttempts.length
      
      return accuracy < 0.7 || avgReactionTime > 3500
    })
  }

  selectFromWeakPhonemes(weakPhonemes, progressData) {
    // 最も苦手な音素を選択（最低正答率 + 最高反応時間）
    return weakPhonemes.reduce((worst, phoneme) => {
      const attempts = this.getPhonemeAttempts(phoneme.symbol, progressData.attempts)
      const accuracy = attempts.filter(a => a.correct).length / attempts.length
      const avgRT = attempts.reduce((sum, a) => sum + a.reactionTime, 0) / attempts.length
      
      const worstAttempts = this.getPhonemeAttempts(worst.symbol, progressData.attempts)
      const worstAccuracy = worstAttempts.filter(a => a.correct).length / worstAttempts.length
      const worstRT = worstAttempts.reduce((sum, a) => sum + a.reactionTime, 0) / worstAttempts.length
      
      // 複合スコア（低いほど弱い）
      const score = accuracy * 0.7 + (3000 / avgRT) * 0.3
      const worstScore = worstAccuracy * 0.7 + (3000 / worstRT) * 0.3
      
      return score < worstScore ? phoneme : worst
    })
  }

  identifyUnmasteredPhonemes(phonemes, progressData) {
    return phonemes.filter(phoneme => {
      const attempts = this.getPhonemeAttempts(phoneme.symbol, progressData.attempts)
      if (attempts.length < 3) return true // 未経験は未習得扱い
      
      const accuracy = attempts.filter(a => a.correct).length / attempts.length
      const consecutiveCorrect = this.getConsecutiveCorrect(phoneme.symbol, progressData.attempts)
      
      return accuracy < 0.85 || consecutiveCorrect < 3
    })
  }

  selectNewPhoneme(unmasteredPhonemes) {
    // 難易度順（易しいものから）
    return unmasteredPhonemes.sort((a, b) => a.difficulty - b.difficulty)[0]
  }

  selectReviewPhoneme(phonemes, progressData) {
    // 習得済みの中から、間隔反復学習のアルゴリズムで選択
    const masteredPhonemes = phonemes.filter(phoneme => {
      const attempts = this.getPhonemeAttempts(phoneme.symbol, progressData.attempts)
      const accuracy = attempts.filter(a => a.correct).length / attempts.length
      return accuracy >= 0.85
    })
    
    if (masteredPhonemes.length === 0) {
      return phonemes[0] // フォールバック
    }
    
    // 最後の正解から最も時間が経った音素を選択
    return masteredPhonemes.reduce((oldest, phoneme) => {
      const attempts = this.getPhonemeAttempts(phoneme.symbol, progressData.attempts)
      const lastCorrect = attempts.filter(a => a.correct).pop()
      const oldestAttempts = this.getPhonemeAttempts(oldest.symbol, progressData.attempts)
      const oldestLastCorrect = oldestAttempts.filter(a => a.correct).pop()
      
      if (!lastCorrect) return oldest
      if (!oldestLastCorrect) return phoneme
      
      return lastCorrect.timestamp < oldestLastCorrect.timestamp ? phoneme : oldest
    })
  }

  // 混乱させる音素の選択
  selectConfusingPhonemes(targetPhoneme, learnerProfile) {
    const confusingSounds = targetPhoneme.confusingSounds || []
    const personalConfusions = this.getPersonalConfusions(targetPhoneme.symbol, learnerProfile)
    
    // 個人的な混乱パターンを優先
    const prioritizedConfusions = [
      ...personalConfusions,
      ...confusingSounds.filter(sound => !personalConfusions.includes(sound))
    ]
    
    return prioritizedConfusions.slice(0, 2) // 最大2つの混乱音素
  }

  getPersonalConfusions(targetSymbol, learnerProfile) {
    const confusions = []
    
    Object.entries(learnerProfile.confusionPatterns || {}).forEach(([pattern, count]) => {
      if (pattern.includes(targetSymbol) && count > 2) {
        // パターンから混乱音素を抽出
        const parts = pattern.split('_vs_')
        if (parts.length === 2) {
          const otherPhoneme = parts[0] === targetSymbol ? parts[1] : parts[0]
          confusions.push(otherPhoneme)
        }
      }
    })
    
    return confusions
  }

  // 選択肢の生成
  generateChoices(targetPhoneme, confusingPhonemes, difficulty) {
    const choices = [targetPhoneme]
    
    // 段階的に混乱させる音素を追加
    if (difficulty.choiceCount >= 2) {
      choices.push(this.findPhonemeBySymbol(confusingPhonemes[0]))
    }
    
    if (difficulty.choiceCount >= 3) {
      choices.push(this.findPhonemeBySymbol(confusingPhonemes[1]))
    }
    
    if (difficulty.choiceCount >= 4) {
      // ランダムな音素を追加
      const allPhonemes = Object.values(PHONEME_PROGRESSION).flat()
      const randomPhoneme = allPhonemes.find(p => 
        p.symbol !== targetPhoneme.symbol && 
        !confusingPhonemes.includes(p.symbol)
      )
      choices.push(randomPhoneme)
    }
    
    // 選択肢をシャッフル
    return this.shuffleArray(choices.filter(Boolean))
  }

  findPhonemeBySymbol(symbol) {
    const allPhonemes = Object.values(PHONEME_PROGRESSION).flat()
    return allPhonemes.find(p => p.symbol === symbol)
  }

  // 難易度計算
  calculateDifficulty(phoneme, learnerProfile) {
    const baseSettings = ADAPTIVE_SETTINGS.normalMode
    
    // 学習者の能力に基づく調整
    const attempts = this.getPhonemeAttempts(phoneme.symbol, learnerProfile.attempts || [])
    
    if (attempts.length < 3) {
      // 初回学習者向け
      return {
        ...ADAPTIVE_SETTINGS.easyMode,
        reasoning: 'First time learning this phoneme'
      }
    }
    
    const accuracy = attempts.filter(a => a.correct).length / attempts.length
    const avgReactionTime = attempts.reduce((sum, a) => sum + a.reactionTime, 0) / attempts.length
    
    if (accuracy < 0.6 || avgReactionTime > 4000) {
      return {
        ...ADAPTIVE_SETTINGS.easyMode,
        reasoning: 'Struggling with this phoneme'
      }
    } else if (accuracy > 0.9 && avgReactionTime < 2000) {
      return {
        ...ADAPTIVE_SETTINGS.hardMode,
        reasoning: 'Mastered this phoneme'
      }
    }
    
    return {
      ...baseSettings,
      reasoning: 'Normal difficulty appropriate'
    }
  }

  // 適応設定の取得
  getAdaptiveSettings(difficulty) {
    return {
      audioSettings: {
        playSpeed: difficulty.playSpeed,
        repeatAllowed: difficulty.repeatAllowed,
        volume: 1.0
      },
      visualSettings: {
        feedbackDelay: difficulty.feedbackDelay,
        showHints: difficulty.choiceCount <= 2
      },
      timingSettings: {
        maxResponseTime: difficulty.choiceCount * 5000, // 選択肢数 × 5秒
        minThinkingTime: 1000 // 最低1秒は考えさせる
      }
    }
  }

  // 学習の説明生成
  generateExplanation(phoneme) {
    return {
      sound: {
        description: phoneme.description,
        tip: this.getArticulationTip(phoneme),
        examples: phoneme.examples.slice(0, 3)
      },
      visual: {
        mouthPosition: this.getMouthPositionDescription(phoneme),
        tonguePlacement: this.getTonguePlacementDescription(phoneme)
      },
      practice: {
        exercises: this.generatePracticeExercises(phoneme),
        commonMistakes: this.getCommonMistakes(phoneme)
      }
    }
  }

  getArticulationTip(phoneme) {
    const tips = {
      's': 'Place your tongue close to the roof of your mouth and blow air gently',
      'æ': 'Open your mouth wide like you\'re at the doctor saying "ah"',
      't': 'Touch the tip of your tongue to the roof of your mouth, then release',
      'ɪ': 'Make a small smile and relax your tongue',
      'p': 'Press your lips together, then release with a small puff of air',
      'n': 'Touch your tongue to the roof of your mouth and hum'
    }
    
    return tips[phoneme.ipa] || 'Focus on the tongue and lip position for this sound'
  }

  getMouthPositionDescription(phoneme) {
    const positions = {
      's': 'Lips slightly apart, teeth close together',
      'æ': 'Mouth wide open, jaw dropped',
      't': 'Lips neutral, mouth slightly open',
      'ɪ': 'Lips slightly spread in a small smile',
      'p': 'Lips pressed firmly together',
      'n': 'Lips slightly apart'
    }
    
    return positions[phoneme.ipa] || 'Natural mouth position'
  }

  getTonguePlacementDescription(phoneme) {
    const placements = {
      's': 'Tongue tip close to upper teeth, sides touching molars',
      'æ': 'Tongue low and forward in mouth',
      't': 'Tongue tip touching the bump behind upper teeth',
      'ɪ': 'Tongue relaxed, slightly forward',
      'p': 'Tongue relaxed, not involved in this sound',
      'n': 'Tongue tip touching the bump behind upper teeth'
    }
    
    return placements[phoneme.ipa] || 'Tongue in comfortable position'
  }

  generatePracticeExercises(phoneme) {
    return [
      `Practice saying "${phoneme.examples[0]}" slowly 5 times`,
      `Compare "${phoneme.examples[0]}" with similar sounding words`,
      `Use the sound in different word positions: beginning, middle, end`
    ]
  }

  getCommonMistakes(phoneme) {
    const mistakes = {
      's': ['Confusing with /z/ sound', 'Making the sound too strong'],
      'æ': ['Not opening mouth wide enough', 'Confusing with /ʌ/ sound'],
      't': ['Not releasing the tongue properly', 'Adding extra breath'],
      'ɪ': ['Making it too long like /iː/', 'Confusing with /e/ sound'],
      'p': ['Not using enough breath', 'Confusing with /b/ sound'],
      'n': ['Not touching tongue to roof', 'Confusing with /m/ sound']
    }
    
    return mistakes[phoneme.ipa] || ['Take your time with pronunciation']
  }

  // 選択理由の生成
  getSelectionReasoning(phoneme, learnerProfile) {
    const attempts = this.getPhonemeAttempts(phoneme.symbol, learnerProfile.attempts || [])
    
    if (attempts.length === 0) {
      return 'New phoneme introduction for systematic learning progression'
    }
    
    const accuracy = attempts.filter(a => a.correct).length / attempts.length
    
    if (accuracy < 0.7) {
      return `Targeted practice for challenging phoneme (${Math.round(accuracy * 100)}% accuracy)`
    }
    
    const lastAttempt = attempts[attempts.length - 1]
    const daysSinceLastAttempt = (Date.now() - lastAttempt.timestamp) / (1000 * 60 * 60 * 24)
    
    if (daysSinceLastAttempt > 3) {
      return `Spaced repetition review after ${Math.round(daysSinceLastAttempt)} days`
    }
    
    return 'Reinforcement practice for skill consolidation'
  }

  // ユーティリティメソッド
  getPhonemeAttempts(phonemeSymbol, attempts) {
    return (attempts || []).filter(attempt => attempt.phoneme === phonemeSymbol)
  }

  getConsecutiveCorrect(phonemeSymbol, attempts) {
    const phonemeAttempts = this.getPhonemeAttempts(phonemeSymbol, attempts).reverse()
    let consecutive = 0
    
    for (const attempt of phonemeAttempts) {
      if (attempt.correct) {
        consecutive++
      } else {
        break
      }
    }
    
    return consecutive
  }

  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // 学習者モデルの更新
  updateLearnerModel(phoneme, isCorrect, reactionTime, selectedChoice) {
    if (isCorrect) {
      this.learnerModel.strongAreas.add(phoneme.symbol)
      this.learnerModel.weakAreas.delete(phoneme.symbol)
    } else {
      this.learnerModel.weakAreas.add(phoneme.symbol)
      
      // 混乱パターンの記録
      if (selectedChoice) {
        const confusionKey = `${phoneme.symbol}_vs_${selectedChoice.symbol}`
        const currentCount = this.learnerModel.confusionMatrix.get(confusionKey) || 0
        this.learnerModel.confusionMatrix.set(confusionKey, currentCount + 1)
      }
    }
    
    // 反応時間プロファイルの更新
    this.learnerModel.reactionTimeProfile[phoneme.symbol] = {
      ...(this.learnerModel.reactionTimeProfile[phoneme.symbol] || {}),
      lastReactionTime: reactionTime,
      averageReactionTime: this.calculateAverageReactionTime(phoneme.symbol, reactionTime)
    }
  }

  calculateAverageReactionTime(phonemeSymbol, newTime) {
    const profile = this.learnerModel.reactionTimeProfile[phonemeSymbol]
    if (!profile || !profile.averageReactionTime) {
      return newTime
    }
    
    // 移動平均（重み0.7で新しい値、0.3で既存の平均）
    return profile.averageReactionTime * 0.7 + newTime * 0.3
  }

  // パフォーマンス分析
  generatePerformanceAnalysis(attempts) {
    const analysis = {
      overallTrends: this.analyzeOverallTrends(attempts),
      phonemeSpecificInsights: this.analyzePhonemeSpecificPerformance(attempts),
      learningVelocity: this.calculateLearningVelocity(attempts),
      predictedPerformance: this.predictFuturePerformance(attempts)
    }
    
    return analysis
  }

  analyzeOverallTrends(attempts) {
    if (attempts.length < 10) {
      return { trend: 'insufficient_data', message: 'More practice needed for trend analysis' }
    }
    
    const recentAttempts = attempts.slice(-20)
    const olderAttempts = attempts.slice(-40, -20)
    
    const recentAccuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length
    const olderAccuracy = olderAttempts.filter(a => a.correct).length / olderAttempts.length
    
    const improvement = recentAccuracy - olderAccuracy
    
    if (improvement > 0.1) {
      return { trend: 'improving', message: 'Strong improvement trend detected' }
    } else if (improvement < -0.1) {
      return { trend: 'declining', message: 'Performance decline needs attention' }
    } else {
      return { trend: 'stable', message: 'Consistent performance maintained' }
    }
  }

  calculateLearningVelocity(attempts) {
    // 新しい音素の習得にかかる平均試行回数
    const phonemeFirstMastery = new Map()
    
    attempts.forEach(attempt => {
      if (attempt.correct && !phonemeFirstMastery.has(attempt.phoneme)) {
        const phonemeAttempts = attempts.filter(a => 
          a.phoneme === attempt.phoneme && 
          a.timestamp <= attempt.timestamp
        )
        phonemeFirstMastery.set(attempt.phoneme, phonemeAttempts.length)
      }
    })
    
    const masteryTimes = Array.from(phonemeFirstMastery.values())
    const averageMasteryTime = masteryTimes.reduce((sum, time) => sum + time, 0) / masteryTimes.length
    
    if (averageMasteryTime < 5) {
      return 'fast'
    } else if (averageMasteryTime < 10) {
      return 'normal'
    } else {
      return 'needs_support'
    }
  }
}

// シングルトンインスタンスをエクスポート
export const adaptiveLearningEngine = new AdaptiveLearningEngine()