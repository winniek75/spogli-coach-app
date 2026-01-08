// src/utils/aiTestingSuite.js - AI予測精度テスト＆最適化スイート
import { useLearningRecommendationEngine } from '@/services/learningRecommendationEngine'
import { useAdaptiveDifficultySystem } from '@/services/adaptiveDifficultySystem'
import { useBehaviorAnalysisStore } from '@/stores/behaviorAnalysisStore'
import { useAIPrediction } from '@/services/aiPredictionEngine'
import logger from '@/utils/logger'

export class AITestingSuite {
  constructor() {
    this.testResults = []
    this.benchmarkData = []
    this.services = {}
    this.initialized = false

    // テストシナリオ
    this.testScenarios = {
      churnPrediction: [
        {
          name: 'High Risk User',
          profile: this.createTestProfile({
            daysSinceLastSession: 5,
            averageSessionLength: 3,
            streakBreaks: 3,
            questCompletionRate: 0.2,
            totalGamesPlayed: 50
          }),
          expectedChurnRisk: 0.8
        },
        {
          name: 'Engaged User',
          profile: this.createTestProfile({
            daysSinceLastSession: 1,
            averageSessionLength: 15,
            streakBreaks: 0,
            questCompletionRate: 0.9,
            totalGamesPlayed: 100
          }),
          expectedChurnRisk: 0.1
        },
        {
          name: 'Moderate Risk User',
          profile: this.createTestProfile({
            daysSinceLastSession: 2,
            averageSessionLength: 8,
            streakBreaks: 1,
            questCompletionRate: 0.6,
            totalGamesPlayed: 25
          }),
          expectedChurnRisk: 0.4
        }
      ],

      difficultyOptimization: [
        {
          name: 'Beginner',
          profile: this.createTestProfile({
            averageScore: 50,
            preferredDifficulty: 'easy',
            skillLevel: 0.2
          }),
          expectedDifficulty: 0.3
        },
        {
          name: 'Advanced',
          profile: this.createTestProfile({
            averageScore: 90,
            preferredDifficulty: 'hard',
            skillLevel: 0.9
          }),
          expectedDifficulty: 0.8
        },
        {
          name: 'Intermediate',
          profile: this.createTestProfile({
            averageScore: 75,
            preferredDifficulty: 'medium',
            skillLevel: 0.6
          }),
          expectedDifficulty: 0.6
        }
      ],

      recommendationAccuracy: [
        {
          name: 'Phonics Lover',
          profile: this.createTestProfile({
            favoriteGenres: ['phonics'],
            averageScore: 80,
            sessionLength: 10
          }),
          expectedGameCategory: 'phonics'
        },
        {
          name: 'Grammar Focus',
          profile: this.createTestProfile({
            favoriteGenres: ['grammar'],
            weakSkills: ['verb_forms'],
            averageScore: 65
          }),
          expectedGameCategory: 'grammar'
        },
        {
          name: 'Time Constrained',
          profile: this.createTestProfile({
            sessionLength: 5,
            timePreferences: [12, 13]
          }),
          context: { availableTime: 5 },
          expectedDuration: 5
        }
      ]
    }

    // 精度メトリクス
    this.accuracyMetrics = {
      mae: 0, // Mean Absolute Error
      rmse: 0, // Root Mean Square Error
      accuracy: 0, // Classification accuracy
      precision: 0,
      recall: 0,
      f1Score: 0
    }
  }

  async initialize() {
    try {
      this.services.recommendation = useLearningRecommendationEngine()
      this.services.difficulty = useAdaptiveDifficultySystem()
      this.services.behavior = useBehaviorAnalysisStore()
      this.services.prediction = useAIPrediction()

      await Promise.all([
        this.services.recommendation.initialize(),
        this.services.difficulty.initialize(),
        this.services.prediction.initialize()
      ])

      this.initialized = true
      logger.log('🧪 AI Testing Suite initialized')
    } catch (error) {
      logger.error('Failed to initialize AI Testing Suite:', error)
      throw error
    }
  }

  // メイン実行メソッド
  async runFullTestSuite() {
    if (!this.initialized) await this.initialize()

    logger.log('🚀 Starting comprehensive AI testing suite...')

    const results = {
      timestamp: new Date().toISOString(),
      churnPrediction: await this.testChurnPrediction(),
      difficultyOptimization: await this.testDifficultyOptimization(),
      recommendationAccuracy: await this.testRecommendationAccuracy(),
      realtimeAdaptation: await this.testRealtimeAdaptation(),
      performanceMetrics: await this.measurePerformance(),
      overallScore: 0
    }

    results.overallScore = this.calculateOverallScore(results)
    this.testResults.push(results)

    logger.log('✅ AI Testing Suite completed', {
      overallScore: results.overallScore.toFixed(3),
      timestamp: results.timestamp
    })

    return results
  }

  // 離脱予測テスト
  async testChurnPrediction() {
    const results = []

    for (const scenario of this.testScenarios.churnPrediction) {
      const startTime = Date.now()

      try {
        const predicted = await this.services.prediction.predictChurn(scenario.profile)
        const error = Math.abs(predicted - scenario.expectedChurnRisk)
        const accuracy = 1 - error

        results.push({
          scenario: scenario.name,
          expected: scenario.expectedChurnRisk,
          predicted: predicted,
          error: error,
          accuracy: accuracy,
          executionTime: Date.now() - startTime,
          passed: error < 0.2 // 20%以内の誤差で合格
        })
      } catch (error) {
        results.push({
          scenario: scenario.name,
          error: error.message,
          passed: false,
          executionTime: Date.now() - startTime
        })
      }
    }

    const avgAccuracy = results
      .filter(r => r.passed)
      .reduce((sum, r) => sum + r.accuracy, 0) / results.length

    return {
      results,
      avgAccuracy,
      passRate: results.filter(r => r.passed).length / results.length
    }
  }

  // 難易度最適化テスト
  async testDifficultyOptimization() {
    const results = []

    for (const scenario of this.testScenarios.difficultyOptimization) {
      const startTime = Date.now()

      try {
        const predicted = await this.services.prediction.optimizeDifficulty(
          scenario.profile,
          { sessionType: 'test' }
        )
        const error = Math.abs(predicted - scenario.expectedDifficulty)
        const accuracy = 1 - error

        results.push({
          scenario: scenario.name,
          expected: scenario.expectedDifficulty,
          predicted: predicted,
          error: error,
          accuracy: accuracy,
          executionTime: Date.now() - startTime,
          passed: error < 0.15
        })
      } catch (error) {
        results.push({
          scenario: scenario.name,
          error: error.message,
          passed: false,
          executionTime: Date.now() - startTime
        })
      }
    }

    const avgAccuracy = results
      .filter(r => r.passed)
      .reduce((sum, r) => sum + r.accuracy, 0) / results.length

    return {
      results,
      avgAccuracy,
      passRate: results.filter(r => r.passed).length / results.length
    }
  }

  // 推薦精度テスト
  async testRecommendationAccuracy() {
    const results = []

    for (const scenario of this.testScenarios.recommendationAccuracy) {
      const startTime = Date.now()

      try {
        const recResult = await this.services.recommendation.generateRecommendations(
          'test-user',
          scenario.context || {}
        )

        const recommendations = recResult.recommendations

        let passed = false
        let details = {}

        if (scenario.expectedGameCategory) {
          const hasExpectedCategory = recommendations.some(rec =>
            this.getGameCategory(rec.gameId) === scenario.expectedGameCategory
          )
          passed = hasExpectedCategory
          details.categoryMatch = hasExpectedCategory
        }

        if (scenario.expectedDuration) {
          const hasShortGames = recommendations.some(rec =>
            rec.estimatedDuration <= scenario.expectedDuration
          )
          passed = passed && hasShortGames
          details.durationMatch = hasShortGames
        }

        results.push({
          scenario: scenario.name,
          recommendations: recommendations.map(r => ({
            gameId: r.gameId,
            category: this.getGameCategory(r.gameId),
            duration: r.estimatedDuration,
            priority: r.finalScore
          })),
          passed,
          details,
          confidence: recResult.confidence,
          executionTime: Date.now() - startTime
        })
      } catch (error) {
        results.push({
          scenario: scenario.name,
          error: error.message,
          passed: false,
          executionTime: Date.now() - startTime
        })
      }
    }

    return {
      results,
      passRate: results.filter(r => r.passed).length / results.length,
      avgConfidence: results
        .filter(r => r.confidence)
        .reduce((sum, r) => sum + r.confidence, 0) / results.length
    }
  }

  // リアルタイム適応テスト
  async testRealtimeAdaptation() {
    const results = []

    const adaptationScenarios = [
      {
        name: 'Performance Decline',
        performanceData: [
          { correct: true, responseTime: 2000 },
          { correct: false, responseTime: 5000 },
          { correct: false, responseTime: 6000 },
          { correct: false, responseTime: 4000 }
        ],
        expectedAdjustment: 'decrease'
      },
      {
        name: 'High Performance',
        performanceData: [
          { correct: true, responseTime: 1000 },
          { correct: true, responseTime: 800 },
          { correct: true, responseTime: 900 },
          { correct: true, responseTime: 700 }
        ],
        expectedAdjustment: 'increase'
      }
    ]

    for (const scenario of adaptationScenarios) {
      const startTime = Date.now()

      try {
        // 難易度システムを初期化
        await this.services.difficulty.initializeGameDifficulty('TestGame', 'test-user')
        const initialDifficulty = 0.5

        let finalDifficulty = initialDifficulty

        // パフォーマンスデータを順次適用
        for (const perfData of scenario.performanceData) {
          const adjustment = await this.services.difficulty.adjustDifficultyRealtime(
            'TestGame',
            perfData
          )

          if (adjustment && adjustment.adjusted) {
            finalDifficulty = adjustment.difficulty
          }
        }

        const difficultyChange = finalDifficulty - initialDifficulty
        let actualAdjustment = 'none'

        if (difficultyChange > 0.05) actualAdjustment = 'increase'
        if (difficultyChange < -0.05) actualAdjustment = 'decrease'

        const passed = actualAdjustment === scenario.expectedAdjustment

        results.push({
          scenario: scenario.name,
          initialDifficulty,
          finalDifficulty,
          difficultyChange,
          expectedAdjustment: scenario.expectedAdjustment,
          actualAdjustment,
          passed,
          executionTime: Date.now() - startTime
        })
      } catch (error) {
        results.push({
          scenario: scenario.name,
          error: error.message,
          passed: false,
          executionTime: Date.now() - startTime
        })
      }
    }

    return {
      results,
      passRate: results.filter(r => r.passed).length / results.length
    }
  }

  // パフォーマンス測定
  async measurePerformance() {
    const benchmarks = []

    // 推薦生成速度
    const recTimes = []
    for (let i = 0; i < 10; i++) {
      const start = Date.now()
      await this.services.recommendation.generateRecommendations('test-user-' + i)
      recTimes.push(Date.now() - start)
    }

    // 離脱予測速度
    const churnTimes = []
    for (let i = 0; i < 10; i++) {
      const start = Date.now()
      await this.services.prediction.predictChurn(this.createTestProfile())
      churnTimes.push(Date.now() - start)
    }

    return {
      recommendationGeneration: {
        avgTime: recTimes.reduce((sum, t) => sum + t, 0) / recTimes.length,
        maxTime: Math.max(...recTimes),
        minTime: Math.min(...recTimes)
      },
      churnPrediction: {
        avgTime: churnTimes.reduce((sum, t) => sum + t, 0) / churnTimes.length,
        maxTime: Math.max(...churnTimes),
        minTime: Math.min(...churnTimes)
      }
    }
  }

  // 総合スコア計算
  calculateOverallScore(results) {
    const weights = {
      churnPrediction: 0.3,
      difficultyOptimization: 0.25,
      recommendationAccuracy: 0.25,
      realtimeAdaptation: 0.2
    }

    let score = 0
    score += results.churnPrediction.passRate * weights.churnPrediction
    score += results.difficultyOptimization.passRate * weights.difficultyOptimization
    score += results.recommendationAccuracy.passRate * weights.recommendationAccuracy
    score += results.realtimeAdaptation.passRate * weights.realtimeAdaptation

    return score
  }

  // 継続的改善のための分析
  async analyzeAndOptimize() {
    if (this.testResults.length < 2) {
      logger.warn('Need at least 2 test results for trend analysis')
      return null
    }

    const latest = this.testResults[this.testResults.length - 1]
    const previous = this.testResults[this.testResults.length - 2]

    const improvement = {
      overallScore: latest.overallScore - previous.overallScore,
      churnPrediction: latest.churnPrediction.passRate - previous.churnPrediction.passRate,
      difficultyOptimization: latest.difficultyOptimization.passRate - previous.difficultyOptimization.passRate,
      recommendationAccuracy: latest.recommendationAccuracy.passRate - previous.recommendationAccuracy.passRate
    }

    // 改善提案
    const suggestions = []

    if (improvement.churnPrediction < 0) {
      suggestions.push({
        area: 'Churn Prediction',
        issue: 'Accuracy declining',
        suggestion: 'Review feature weights and add more behavioral signals'
      })
    }

    if (improvement.difficultyOptimization < 0) {
      suggestions.push({
        area: 'Difficulty Optimization',
        issue: 'Optimization accuracy declining',
        suggestion: 'Calibrate difficulty mapping and add performance context'
      })
    }

    if (latest.performanceMetrics.recommendationGeneration.avgTime > 500) {
      suggestions.push({
        area: 'Performance',
        issue: 'Slow recommendation generation',
        suggestion: 'Optimize recommendation algorithm and cache frequent queries'
      })
    }

    return {
      improvement,
      suggestions,
      timestamp: new Date().toISOString()
    }
  }

  // ヘルパーメソッド
  createTestProfile(overrides = {}) {
    const defaultProfile = {
      userId: 'test-user',
      performance: {
        averageScore: 70,
        accuracyTrend: 'stable',
        improvementRate: 0.05,
        strongSkills: ['phoneme_recognition'],
        weakSkills: ['grammar_rules'],
        preferredDifficulty: 'medium',
        skillLevels: { phonics: 0.6, grammar: 0.4 }
      },
      behavior: {
        sessionLength: 15,
        playFrequency: 2,
        timePreferences: [17, 18, 19],
        gamePreferences: ['phonics'],
        challengeResponse: 'moderate'
      },
      motivation: {
        streakLevel: 'common',
        currentStreak: 5,
        questCompletionRate: 0.7,
        engagementLevel: 'medium',
        goalOrientation: 'balanced'
      },
      progress: {
        totalGamesPlayed: 30,
        totalStudyTime: 450,
        masteredSkills: ['basic_phonics'],
        learningGoals: ['improve_grammar'],
        difficultyProgression: 0.5
      },
      activityMetrics: {
        daysSinceLastSession: 1,
        averageSessionLength: 15,
        streakBreaks: 0,
        questCompletionRate: 0.7,
        totalGamesPlayed: 30,
        totalStudyTime: 450
      }
    }

    return this.deepMerge(defaultProfile, overrides)
  }

  getGameCategory(gameId) {
    const categories = {
      'FloatingLetterHunt': 'phonics',
      'PhonicsTrainingHub': 'phonics',
      'GrammarGameEngine': 'grammar',
      'VerbTimeMachine': 'grammar',
      'TypingArena': 'typing',
      'WordFamilyTreeGame': 'vocabulary'
    }
    return categories[gameId] || 'general'
  }

  deepMerge(target, source) {
    const result = { ...target }
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }

  // 公開API
  getLatestResults() {
    return this.testResults[this.testResults.length - 1] || null
  }

  getTestHistory() {
    return this.testResults
  }

  generateReport() {
    const latest = this.getLatestResults()
    if (!latest) return 'No test results available'

    return `
AI Testing Suite Report
Generated: ${latest.timestamp}
Overall Score: ${latest.overallScore.toFixed(3)}

Churn Prediction: ${(latest.churnPrediction.passRate * 100).toFixed(1)}% pass rate
Difficulty Optimization: ${(latest.difficultyOptimization.passRate * 100).toFixed(1)}% pass rate
Recommendation Accuracy: ${(latest.recommendationAccuracy.passRate * 100).toFixed(1)}% pass rate
Realtime Adaptation: ${(latest.realtimeAdaptation.passRate * 100).toFixed(1)}% pass rate

Performance:
- Recommendation Generation: ${latest.performanceMetrics.recommendationGeneration.avgTime.toFixed(0)}ms avg
- Churn Prediction: ${latest.performanceMetrics.churnPrediction.avgTime.toFixed(0)}ms avg
    `.trim()
  }
}

// シングルトンインスタンス
let instance = null

export function useAITestingSuite() {
  if (!instance) {
    instance = new AITestingSuite()
  }
  return instance
}

export default AITestingSuite