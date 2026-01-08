// src/services/adaptiveDifficultySystem.js - リアルタイム適応的難易度調整システム
import { useLearningRecommendationEngine } from '@/services/learningRecommendationEngine'
import { useAIPrediction } from '@/services/aiPredictionEngine'
import { useBehaviorAnalysisStore } from '@/stores/behaviorAnalysisStore'
import logger from '@/utils/logger'

export class AdaptiveDifficultySystem {
  constructor() {
    this.recommendationEngine = null
    this.aiEngine = null
    this.behaviorStore = null
    this.initialized = false

    // リアルタイム調整パラメータ
    this.adjustmentParams = {
      // パフォーマンスベース調整
      performance: {
        excellent_threshold: 0.9,    // 90%以上で難易度上げ
        poor_threshold: 0.6,         // 60%以下で難易度下げ
        adjustment_rate: 0.1,        // 調整率
        max_adjustment: 0.3,         // 最大調整幅
        stabilization_buffer: 5      // 調整後の安定化回数
      },

      // 時間ベース調整
      timing: {
        too_fast_threshold: 0.5,     // 平均時間の50%以下で難易度上げ
        too_slow_threshold: 2.0,     // 平均時間の2倍以上で難易度下げ
        speed_weight: 0.15           // スピード調整の重み
      },

      // エンゲージメントベース調整
      engagement: {
        low_threshold: 0.4,          // 低エンゲージメント閾値
        high_threshold: 0.8,         // 高エンゲージメント閾値
        frustration_indicators: ['multiple_wrong', 'long_pause', 'rage_quit'],
        boredom_indicators: ['too_fast', 'low_variety', 'predictable']
      },

      // フロー状態の維持
      flow: {
        optimal_challenge_ratio: 0.7, // 最適チャレンジ比率
        skill_challenge_balance: 0.1,  // スキル-チャレンジバランス調整幅
        flow_indicators: ['consistent_performance', 'steady_improvement', 'engaged_timing']
      }
    }

    // ゲーム固有の難易度設定
    this.gameConfigs = {
      'FloatingLetterHunt': {
        parameters: ['letter_speed', 'spawn_rate', 'target_count', 'time_limit'],
        difficulty_mapping: {
          0.1: { letter_speed: 0.3, spawn_rate: 1.0, target_count: 3, time_limit: 60 },
          0.5: { letter_speed: 0.6, spawn_rate: 1.5, target_count: 5, time_limit: 45 },
          1.0: { letter_speed: 1.0, spawn_rate: 2.0, target_count: 8, time_limit: 30 }
        }
      },
      'GrammarGameEngine': {
        parameters: ['sentence_complexity', 'time_pressure', 'error_tolerance', 'hint_availability'],
        difficulty_mapping: {
          0.1: { sentence_complexity: 'simple', time_pressure: 'low', error_tolerance: 0.8, hint_availability: 'high' },
          0.5: { sentence_complexity: 'medium', time_pressure: 'medium', error_tolerance: 0.6, hint_availability: 'medium' },
          1.0: { sentence_complexity: 'complex', time_pressure: 'high', error_tolerance: 0.4, hint_availability: 'low' }
        }
      },
      'TypingArena': {
        parameters: ['wpm_target', 'accuracy_requirement', 'word_complexity', 'combo_multiplier'],
        difficulty_mapping: {
          0.1: { wpm_target: 20, accuracy_requirement: 0.8, word_complexity: 'basic', combo_multiplier: 1.0 },
          0.5: { wpm_target: 40, accuracy_requirement: 0.9, word_complexity: 'intermediate', combo_multiplier: 1.5 },
          1.0: { wpm_target: 60, accuracy_requirement: 0.95, word_complexity: 'advanced', combo_multiplier: 2.0 }
        }
      },
      'RhythmPhonicsMini': {
        parameters: ['beat_complexity', 'tempo', 'pattern_variation', 'accuracy_window'],
        difficulty_mapping: {
          0.1: { beat_complexity: 'simple', tempo: 80, pattern_variation: 'low', accuracy_window: 0.5 },
          0.5: { beat_complexity: 'medium', tempo: 100, pattern_variation: 'medium', accuracy_window: 0.3 },
          1.0: { beat_complexity: 'complex', tempo: 120, pattern_variation: 'high', accuracy_window: 0.2 }
        }
      }
    }

    // セッション状態追跡
    this.sessionState = {
      currentDifficulty: 0.5,
      baselinePerformance: null,
      adjustmentHistory: [],
      flowState: 'unknown',
      frustrationLevel: 0,
      boredomLevel: 0,
      stabilizationCounter: 0,
      lastAdjustment: null
    }

    // リアルタイムメトリクス
    this.realtimeMetrics = {
      responseTime: [],
      accuracy: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      pauseDuration: [],
      clickPatterns: [],
      errorTypes: []
    }
  }

  async initialize() {
    try {
      this.recommendationEngine = useLearningRecommendationEngine()
      this.aiEngine = useAIPrediction()
      this.behaviorStore = useBehaviorAnalysisStore()

      await this.recommendationEngine.initialize()
      await this.aiEngine.initialize()

      this.initialized = true
      logger.log('🎚️ Adaptive Difficulty System initialized')
    } catch (error) {
      logger.error('Failed to initialize adaptive difficulty system:', error)
      throw error
    }
  }

  // ゲーム開始時の難易度設定
  async initializeGameDifficulty(gameId, userId, context = {}) {
    if (!this.initialized) await this.initialize()

    // ユーザープロファイルから初期難易度を計算
    const userProfile = this.behaviorStore.getUserProfile(userId)
    const initialDifficulty = await this.calculateInitialDifficulty(gameId, userProfile, context)

    // ゲーム固有の設定を取得
    const gameSettings = this.generateGameSettings(gameId, initialDifficulty)

    // セッション状態をリセット
    this.resetSessionState(initialDifficulty, userProfile)

    logger.log(`🎮 Game difficulty initialized`, {
      gameId,
      initialDifficulty: initialDifficulty.toFixed(3),
      settings: gameSettings
    })

    return {
      difficulty: initialDifficulty,
      settings: gameSettings,
      adaptations: {
        enabled: true,
        sensitivity: this.calculateAdaptationSensitivity(userProfile),
        targets: this.defineAdaptationTargets(gameId, userProfile)
      }
    }
  }

  // リアルタイム難易度調整
  async adjustDifficultyRealtime(gameId, performanceData) {
    if (!this.initialized) return null

    // メトリクスを更新
    this.updateRealtimeMetrics(performanceData)

    // 現在の状態を分析
    const currentState = this.analyzeCurrentState()

    // 調整が必要かチェック
    const adjustmentNeeded = this.assessAdjustmentNeed(currentState)

    if (!adjustmentNeeded) {
      return { adjusted: false, reason: 'No adjustment needed', currentState }
    }

    // 新しい難易度を計算
    const newDifficulty = await this.calculateDifficultyAdjustment(currentState, performanceData)

    // 調整を適用
    const adjustmentResult = this.applyDifficultyAdjustment(gameId, newDifficulty, currentState)

    logger.log(`⚡ Real-time difficulty adjusted`, {
      gameId,
      from: this.sessionState.currentDifficulty.toFixed(3),
      to: newDifficulty.toFixed(3),
      reason: adjustmentResult.reason,
      confidence: adjustmentResult.confidence
    })

    return adjustmentResult
  }

  // 初期難易度計算
  async calculateInitialDifficulty(gameId, userProfile, context) {
    // AIエンジンから最適難易度を取得
    const aiOptimal = await this.aiEngine.optimizeDifficulty(userProfile, context)

    // ゲーム固有の調整
    const gameCategory = this.getGameCategory(gameId)
    const categorySkill = userProfile.performance.skillLevels?.[gameCategory] || 0.5

    // コンテキスト調整
    let contextAdjustment = 0
    if (context.sessionType === 'warmup') contextAdjustment -= 0.1
    if (context.sessionType === 'challenge') contextAdjustment += 0.1
    if (context.energyLevel === 'low') contextAdjustment -= 0.15
    if (context.timeConstraint === 'tight') contextAdjustment -= 0.1

    // 最終難易度計算（重み付き平均）
    const finalDifficulty = (
      aiOptimal * 0.4 +
      categorySkill * 0.3 +
      userProfile.performance.preferredDifficultyValue * 0.2 +
      (0.5 + contextAdjustment) * 0.1
    )

    return Math.max(0.1, Math.min(1.0, finalDifficulty))
  }

  // リアルタイムメトリクス更新
  updateRealtimeMetrics(performanceData) {
    const maxHistoryLength = 20

    // 応答時間
    if (performanceData.responseTime) {
      this.realtimeMetrics.responseTime.push(performanceData.responseTime)
      if (this.realtimeMetrics.responseTime.length > maxHistoryLength) {
        this.realtimeMetrics.responseTime.shift()
      }
    }

    // 正解率
    if (performanceData.correct !== undefined) {
      this.realtimeMetrics.accuracy.push(performanceData.correct ? 1 : 0)
      if (this.realtimeMetrics.accuracy.length > maxHistoryLength) {
        this.realtimeMetrics.accuracy.shift()
      }

      // 連続正解/不正解
      if (performanceData.correct) {
        this.realtimeMetrics.consecutiveCorrect++
        this.realtimeMetrics.consecutiveWrong = 0
      } else {
        this.realtimeMetrics.consecutiveWrong++
        this.realtimeMetrics.consecutiveCorrect = 0
      }
    }

    // 一時停止時間
    if (performanceData.pauseDuration) {
      this.realtimeMetrics.pauseDuration.push(performanceData.pauseDuration)
      if (this.realtimeMetrics.pauseDuration.length > maxHistoryLength) {
        this.realtimeMetrics.pauseDuration.shift()
      }
    }

    // エラータイプ
    if (performanceData.errorType) {
      this.realtimeMetrics.errorTypes.push({
        type: performanceData.errorType,
        timestamp: Date.now()
      })
    }
  }

  // 現在の状態分析
  analyzeCurrentState() {
    const recentAccuracy = this.calculateRecentAccuracy()
    const averageResponseTime = this.calculateAverageResponseTime()
    const frustrationScore = this.calculateFrustrationScore()
    const boredomScore = this.calculateBoredomScore()
    const flowScore = this.calculateFlowScore()

    return {
      performance: {
        accuracy: recentAccuracy,
        responseTime: averageResponseTime,
        consistency: this.calculateConsistency(),
        improvement: this.calculateImprovementTrend()
      },
      engagement: {
        frustration: frustrationScore,
        boredom: boredomScore,
        flow: flowScore
      },
      patterns: {
        consecutiveCorrect: this.realtimeMetrics.consecutiveCorrect,
        consecutiveWrong: this.realtimeMetrics.consecutiveWrong,
        errorPatterns: this.analyzeErrorPatterns(),
        timingPatterns: this.analyzeTimingPatterns()
      }
    }
  }

  // 調整必要性評価
  assessAdjustmentNeed(currentState) {
    // 安定化期間中はスキップ
    if (this.sessionState.stabilizationCounter > 0) {
      this.sessionState.stabilizationCounter--
      return false
    }

    const { performance, engagement } = currentState

    // パフォーマンスベース判定
    if (performance.accuracy > this.adjustmentParams.performance.excellent_threshold) return true
    if (performance.accuracy < this.adjustmentParams.performance.poor_threshold) return true

    // エンゲージメントベース判定
    if (engagement.frustration > this.adjustmentParams.engagement.low_threshold) return true
    if (engagement.boredom > this.adjustmentParams.engagement.low_threshold) return true

    // フロー状態逸脱判定
    if (engagement.flow < this.adjustmentParams.flow.optimal_challenge_ratio) return true

    return false
  }

  // 難易度調整計算
  async calculateDifficultyAdjustment(currentState, performanceData) {
    let adjustment = 0
    let confidence = 0.5
    const reasons = []

    // パフォーマンスベース調整
    if (currentState.performance.accuracy > this.adjustmentParams.performance.excellent_threshold) {
      adjustment += this.adjustmentParams.performance.adjustment_rate
      confidence += 0.2
      reasons.push('High performance detected')
    }

    if (currentState.performance.accuracy < this.adjustmentParams.performance.poor_threshold) {
      adjustment -= this.adjustmentParams.performance.adjustment_rate
      confidence += 0.2
      reasons.push('Low performance detected')
    }

    // 応答時間ベース調整
    const expectedTime = performanceData.expectedResponseTime || 3000
    if (currentState.performance.responseTime < expectedTime * this.adjustmentParams.timing.too_fast_threshold) {
      adjustment += this.adjustmentParams.timing.speed_weight
      reasons.push('Too fast responses')
    }

    if (currentState.performance.responseTime > expectedTime * this.adjustmentParams.timing.too_slow_threshold) {
      adjustment -= this.adjustmentParams.timing.speed_weight
      reasons.push('Slow responses')
    }

    // エンゲージメントベース調整
    if (currentState.engagement.frustration > this.adjustmentParams.engagement.low_threshold) {
      adjustment -= this.adjustmentParams.performance.adjustment_rate * 1.5
      confidence += 0.3
      reasons.push('Frustration detected')
    }

    if (currentState.engagement.boredom > this.adjustmentParams.engagement.low_threshold) {
      adjustment += this.adjustmentParams.performance.adjustment_rate * 1.2
      reasons.push('Boredom detected')
    }

    // 調整幅制限
    adjustment = Math.max(-this.adjustmentParams.performance.max_adjustment,
                         Math.min(this.adjustmentParams.performance.max_adjustment, adjustment))

    // 新しい難易度計算
    const newDifficulty = Math.max(0.1,
      Math.min(1.0, this.sessionState.currentDifficulty + adjustment))

    return {
      newDifficulty,
      adjustment,
      confidence: Math.min(1.0, confidence),
      reasons
    }
  }

  // 難易度調整適用
  applyDifficultyAdjustment(gameId, newDifficulty, currentState) {
    const previousDifficulty = this.sessionState.currentDifficulty
    this.sessionState.currentDifficulty = newDifficulty

    // 調整履歴記録
    this.sessionState.adjustmentHistory.push({
      timestamp: Date.now(),
      from: previousDifficulty,
      to: newDifficulty,
      state: currentState,
      reason: 'real_time_adaptation'
    })

    // 安定化期間設定
    this.sessionState.stabilizationCounter = this.adjustmentParams.performance.stabilization_buffer

    // 新しいゲーム設定生成
    const newSettings = this.generateGameSettings(gameId, newDifficulty)

    return {
      adjusted: true,
      difficulty: newDifficulty,
      settings: newSettings,
      confidence: currentState.confidence || 0.7,
      reason: `Adjusted from ${previousDifficulty.toFixed(2)} to ${newDifficulty.toFixed(2)}`
    }
  }

  // ゲーム設定生成
  generateGameSettings(gameId, difficulty) {
    const config = this.gameConfigs[gameId]
    if (!config) {
      logger.warn(`No difficulty config found for game: ${gameId}`)
      return { difficulty }
    }

    // 線形補間で設定値を計算
    const lowerBound = this.findLowerBound(config.difficulty_mapping, difficulty)
    const upperBound = this.findUpperBound(config.difficulty_mapping, difficulty)

    if (lowerBound === upperBound) {
      return config.difficulty_mapping[lowerBound]
    }

    return this.interpolateSettings(
      config.difficulty_mapping[lowerBound],
      config.difficulty_mapping[upperBound],
      lowerBound,
      upperBound,
      difficulty
    )
  }

  // メトリクス計算ヘルパー
  calculateRecentAccuracy() {
    const recent = this.realtimeMetrics.accuracy.slice(-10)
    if (recent.length === 0) return 0.5
    return recent.reduce((sum, val) => sum + val, 0) / recent.length
  }

  calculateAverageResponseTime() {
    const recent = this.realtimeMetrics.responseTime.slice(-10)
    if (recent.length === 0) return 3000
    return recent.reduce((sum, val) => sum + val, 0) / recent.length
  }

  calculateFrustrationScore() {
    let score = 0

    // 連続不正解
    if (this.realtimeMetrics.consecutiveWrong >= 3) score += 0.4
    if (this.realtimeMetrics.consecutiveWrong >= 5) score += 0.3

    // 長時間の一時停止
    const longPauses = this.realtimeMetrics.pauseDuration.filter(d => d > 5000).length
    score += Math.min(0.3, longPauses * 0.1)

    return Math.min(1.0, score)
  }

  calculateBoredomScore() {
    let score = 0

    // 高速すぎる応答
    const fastResponses = this.realtimeMetrics.responseTime.filter(t => t < 1000).length
    score += Math.min(0.4, fastResponses * 0.1)

    // 連続正解が多すぎる
    if (this.realtimeMetrics.consecutiveCorrect >= 8) score += 0.3

    return Math.min(1.0, score)
  }

  calculateFlowScore() {
    const accuracy = this.calculateRecentAccuracy()
    const consistency = this.calculateConsistency()

    // フロー状態の指標：適度なチャレンジ + 一貫したパフォーマンス
    const challengeLevel = 1 - Math.abs(accuracy - 0.75) / 0.25
    const flowScore = (challengeLevel + consistency) / 2

    return Math.max(0, Math.min(1, flowScore))
  }

  calculateConsistency() {
    const recent = this.realtimeMetrics.responseTime.slice(-10)
    if (recent.length < 3) return 0.5

    const mean = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length
    const coefficient = Math.sqrt(variance) / mean

    return Math.max(0, 1 - coefficient)
  }

  // ヘルパーメソッド
  resetSessionState(initialDifficulty, userProfile) {
    this.sessionState = {
      currentDifficulty: initialDifficulty,
      baselinePerformance: userProfile.performance.averageScore || 70,
      adjustmentHistory: [],
      flowState: 'unknown',
      frustrationLevel: 0,
      boredomLevel: 0,
      stabilizationCounter: 0,
      lastAdjustment: null
    }

    this.realtimeMetrics = {
      responseTime: [],
      accuracy: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      pauseDuration: [],
      clickPatterns: [],
      errorTypes: []
    }
  }

  findLowerBound(mapping, difficulty) {
    const keys = Object.keys(mapping).map(Number).sort((a, b) => a - b)
    return keys.reverse().find(key => key <= difficulty) || keys[0]
  }

  findUpperBound(mapping, difficulty) {
    const keys = Object.keys(mapping).map(Number).sort((a, b) => a - b)
    return keys.find(key => key >= difficulty) || keys[keys.length - 1]
  }

  interpolateSettings(lower, upper, lowerKey, upperKey, difficulty) {
    if (lowerKey === upperKey) return lower

    const ratio = (difficulty - lowerKey) / (upperKey - lowerKey)
    const result = {}

    for (const [key, value] of Object.entries(lower)) {
      if (typeof value === 'number') {
        result[key] = lower[key] + (upper[key] - lower[key]) * ratio
      } else {
        result[key] = ratio > 0.5 ? upper[key] : lower[key]
      }
    }

    return result
  }
}

// シングルトンインスタンス
let instance = null

export function useAdaptiveDifficultySystem() {
  if (!instance) {
    instance = new AdaptiveDifficultySystem()
  }
  return instance
}

export default AdaptiveDifficultySystem