// src/services/learningRecommendationEngine.js - AIパーソナライゼーション学習推薦エンジン
import { useStreakStore } from '@/stores/streakStore'
import { useQuestStore } from '@/stores/questStore'
import { useBehaviorAnalysisStore } from '@/stores/behaviorAnalysisStore'
import { useAIPrediction } from '@/services/aiPredictionEngine'
import logger from '@/utils/logger'

export class LearningRecommendationEngine {
  constructor() {
    this.aiEngine = null
    this.streakStore = null
    this.questStore = null
    this.behaviorStore = null
    this.initialized = false

    // 推薦アルゴリズムの重み
    this.weights = {
      performance: 0.25,    // 過去のパフォーマンス
      preference: 0.20,     // ユーザー好み
      difficulty: 0.20,     // 適応的難易度
      streak: 0.15,         // ストリーク状態
      time: 0.10,          // 時間的要因
      variety: 0.10        // 多様性確保
    }

    // ゲームカテゴリとスキル定義
    this.gameCategories = {
      phonics: {
        skills: ['phoneme_recognition', 'sound_blending', 'segmentation'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced', 'expert'],
        games: ['FloatingLetterHunt', 'PhonicsTrainingHub', 'ComplexPhonemeGame']
      },
      grammar: {
        skills: ['verb_forms', 'sentence_structure', 'question_formation', 'tenses'],
        difficulty_levels: ['basic', 'intermediate', 'advanced', 'mastery'],
        games: ['GrammarGameEngine', 'VerbTimeMachine', 'GrammarReflexArena']
      },
      vocabulary: {
        skills: ['word_recognition', 'meaning_comprehension', 'usage_context'],
        difficulty_levels: ['starter', 'elementary', 'intermediate', 'advanced'],
        games: ['WordFamilyTreeGame', 'SightWordMaster', 'VocabularyGameWrapper']
      },
      typing: {
        skills: ['speed', 'accuracy', 'rhythm', 'finger_placement'],
        difficulty_levels: ['novice', 'proficient', 'expert', 'master'],
        games: ['TypingArena', 'TypingArenaEnhanced', 'RhythmTapperGame']
      },
      pronunciation: {
        skills: ['phoneme_accuracy', 'stress_patterns', 'intonation'],
        difficulty_levels: ['basic', 'intermediate', 'advanced', 'native_like'],
        games: ['CvPronunciationTrainer', 'StressPatternMasterGame', 'VoicePuzzleGame']
      }
    }
  }

  async initialize() {
    try {
      this.aiEngine = useAIPrediction()
      this.streakStore = useStreakStore()
      this.questStore = useQuestStore()
      this.behaviorStore = useBehaviorAnalysisStore()

      await this.aiEngine.initialize()
      this.initialized = true

      logger.log('🎯 Learning Recommendation Engine initialized')
    } catch (error) {
      logger.error('Failed to initialize recommendation engine:', error)
      throw error
    }
  }

  // メイン推薦メソッド
  async generateRecommendations(userId, context = {}) {
    if (!this.initialized) await this.initialize()

    const userProfile = this.buildUserProfile(userId)
    const situationalContext = this.analyzeSituationalContext(context)

    logger.log('🔮 Generating AI-powered recommendations', {
      userId,
      context: situationalContext
    })

    // 複数の推薦アルゴリズムを組み合わせ
    const recommendations = {
      immediate: await this.getImmediateRecommendations(userProfile, situationalContext),
      session: await this.getSessionRecommendations(userProfile, situationalContext),
      longTerm: await this.getLongTermRecommendations(userProfile),
      adaptive: await this.getAdaptiveRecommendations(userProfile, situationalContext)
    }

    // 推薦の優先順位付けと最終調整
    const prioritized = this.prioritizeRecommendations(recommendations, userProfile)

    return {
      recommendations: prioritized,
      confidence: this.calculateRecommendationConfidence(prioritized, userProfile),
      reasoning: this.generateRecommendationReasoning(prioritized, userProfile),
      metadata: {
        algorithm_version: '1.0',
        generated_at: new Date().toISOString(),
        user_profile_hash: this.hashProfile(userProfile)
      }
    }
  }

  // ユーザープロファイル構築
  buildUserProfile(userId) {
    const behaviorData = this.behaviorStore.getUserProfile(userId)
    const streakData = this.streakStore.getStreakInfo()
    const questData = this.questStore.getUserProgress()

    return {
      userId,

      // 学習パフォーマンス
      performance: {
        averageScore: behaviorData.performance.averageScore || 70,
        accuracyTrend: behaviorData.performance.accuracyTrend || 'stable',
        improvementRate: behaviorData.performance.improvementRate || 0.05,
        strongSkills: behaviorData.performance.strongSkills || [],
        weakSkills: behaviorData.performance.weakSkills || [],
        preferredDifficulty: behaviorData.performance.preferredDifficulty || 'intermediate'
      },

      // 行動パターン
      behavior: {
        sessionLength: behaviorData.behaviorPatterns.sessionMetrics.averageSessionLength || 15,
        playFrequency: behaviorData.behaviorPatterns.sessionMetrics.dailyFrequency || 2,
        timePreferences: behaviorData.behaviorPatterns.timePreferences.preferredHours || [17, 18, 19],
        gamePreferences: behaviorData.behaviorPatterns.gamePreferences.favoriteGenres || ['phonics'],
        challengeResponse: behaviorData.behaviorPatterns.gamePreferences.challengeResponse || 'moderate'
      },

      // モチベーション指標
      motivation: {
        streakLevel: streakData.level || 'none',
        currentStreak: streakData.current || 0,
        questCompletionRate: questData.averageCompletionRate || 0.7,
        engagementLevel: behaviorData.motivationMetrics.engagementLevel || 'medium',
        goalOrientation: behaviorData.motivationMetrics.goalOrientation || 'balanced'
      },

      // 学習進捗
      progress: {
        totalGamesPlayed: behaviorData.activityMetrics.totalGamesPlayed || 0,
        totalStudyTime: behaviorData.activityMetrics.totalStudyTime || 0,
        masteredSkills: this.identifyMasteredSkills(behaviorData),
        learningGoals: questData.activeQuests?.map(q => q.category) || [],
        difficultyProgression: this.calculateDifficultyProgression(behaviorData)
      }
    }
  }

  // 状況分析
  analyzeSituationalContext(context) {
    const currentHour = new Date().getHours()
    const dayOfWeek = new Date().getDay()

    return {
      timeOfDay: this.categorizeTimeOfDay(currentHour),
      dayType: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday',
      sessionType: context.sessionType || 'regular',
      availableTime: context.availableTime || 15, // 分
      deviceType: context.deviceType || 'unknown',
      connectionQuality: context.connectionQuality || 'good',
      interruptionLevel: context.interruptionLevel || 'low',
      energyLevel: context.energyLevel || 'medium',
      previousSession: context.lastGamePlayed || null
    }
  }

  // 即座の推薦（今すぐプレイすべきゲーム）
  async getImmediateRecommendations(userProfile, context) {
    const churnRisk = await this.aiEngine.predictChurn(userProfile)

    let recommendations = []

    // 離脱リスクが高い場合は軽いゲームを推薦
    if (churnRisk > 0.7) {
      recommendations.push({
        type: 'churn_prevention',
        gameId: 'RhythmPhonicsMini',
        priority: 0.9,
        reason: 'Quick 3-minute game to maintain habit',
        estimatedDuration: 3,
        difficulty: 'easy'
      })
    }

    // ストリーク維持が必要な場合
    if (userProfile.motivation.streakLevel === 'at_risk') {
      const quickGames = this.getQuickWinGames(userProfile)
      recommendations.push(...quickGames.map(game => ({
        type: 'streak_maintenance',
        gameId: game,
        priority: 0.85,
        reason: 'Maintain your streak with a familiar game',
        estimatedDuration: 5,
        difficulty: 'comfortable'
      })))
    }

    // 時間制約に基づく推薦
    if (context.availableTime <= 5) {
      recommendations.push({
        type: 'micro_learning',
        gameId: 'FloatingLetterHunt',
        priority: 0.8,
        reason: 'Perfect for a quick learning session',
        estimatedDuration: 3,
        difficulty: this.calculateOptimalDifficulty(userProfile, 'phonics')
      })
    }

    return recommendations
  }

  // セッション全体の推薦
  async getSessionRecommendations(userProfile, context) {
    const optimalDifficulty = await this.aiEngine.optimizeDifficulty(userProfile, context)
    const engagementPrediction = await this.aiEngine.forecastEngagement(userProfile, context)

    let sessionPlan = []

    // ウォームアップゲーム
    if (context.sessionType === 'full') {
      sessionPlan.push({
        type: 'warmup',
        gameId: this.selectWarmupGame(userProfile),
        priority: 0.7,
        reason: 'Start with an easy warm-up',
        position: 'start',
        estimatedDuration: 5,
        difficulty: Math.max(0.1, optimalDifficulty - 0.2)
      })
    }

    // メインゲーム（弱点強化）
    const weakSkill = userProfile.performance.weakSkills[0]
    if (weakSkill) {
      const skillGames = this.getGamesForSkill(weakSkill)
      sessionPlan.push({
        type: 'skill_building',
        gameId: skillGames[0],
        priority: 0.8,
        reason: `Focus on improving ${weakSkill}`,
        position: 'main',
        estimatedDuration: 10,
        difficulty: optimalDifficulty
      })
    }

    // チャレンジゲーム（高エンゲージメントが予測される場合）
    if (engagementPrediction > 0.7) {
      sessionPlan.push({
        type: 'challenge',
        gameId: this.selectChallengeGame(userProfile),
        priority: 0.6,
        reason: 'Ready for a challenge!',
        position: 'end',
        estimatedDuration: 8,
        difficulty: Math.min(1.0, optimalDifficulty + 0.3)
      })
    }

    return sessionPlan
  }

  // 長期的な推薦
  async getLongTermRecommendations(userProfile) {
    const learningPath = this.generateLearningPath(userProfile)

    return {
      nextMilestone: this.identifyNextMilestone(userProfile),
      skillProgression: learningPath,
      weeklyGoals: this.generateWeeklyGoals(userProfile),
      newGameSuggestions: this.suggestNewGames(userProfile),
      difficultyAdjustments: this.planDifficultyProgression(userProfile)
    }
  }

  // 適応的推薦（リアルタイム調整）
  async getAdaptiveRecommendations(userProfile, context) {
    const currentPerformance = context.recentPerformance || userProfile.performance.averageScore
    const adaptations = []

    // パフォーマンスが低下している場合
    if (currentPerformance < userProfile.performance.averageScore * 0.8) {
      adaptations.push({
        type: 'difficulty_reduction',
        adjustment: -0.2,
        reason: 'Reducing difficulty due to recent struggles',
        temporary: true,
        duration: '1_session'
      })
    }

    // 連続で高スコアの場合
    if (currentPerformance > userProfile.performance.averageScore * 1.2) {
      adaptations.push({
        type: 'difficulty_increase',
        adjustment: +0.15,
        reason: 'Increasing challenge due to excellent performance',
        gradual: true,
        steps: 3
      })
    }

    // 疲労の兆候がある場合
    if (context.sessionLength > userProfile.behavior.sessionLength * 1.5) {
      adaptations.push({
        type: 'break_suggestion',
        gameId: 'RhythmPhonicsMini',
        reason: 'Light rhythm game to prevent fatigue',
        energyLevel: 'low'
      })
    }

    return adaptations
  }

  // 推薦の優先順位付け
  prioritizeRecommendations(recommendations, userProfile) {
    const allRecs = [
      ...recommendations.immediate,
      ...recommendations.session,
      ...(Array.isArray(recommendations.adaptive) ? recommendations.adaptive : [])
    ]

    // 重み付きスコア計算
    return allRecs
      .map(rec => ({
        ...rec,
        finalScore: this.calculateRecommendationScore(rec, userProfile)
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5) // トップ5を選択
  }

  // 推薦スコア計算
  calculateRecommendationScore(recommendation, userProfile) {
    let score = recommendation.priority || 0.5

    // ユーザー好みとの一致度
    const gameCategory = this.getGameCategory(recommendation.gameId)
    if (userProfile.behavior.gamePreferences.includes(gameCategory)) {
      score += 0.2
    }

    // 難易度の適合性
    const difficultyMatch = this.calculateDifficultyMatch(
      recommendation.difficulty,
      userProfile.performance.preferredDifficulty
    )
    score += difficultyMatch * 0.15

    // 時間的な適合性
    const timeMatch = recommendation.estimatedDuration <= userProfile.behavior.sessionLength
    if (timeMatch) score += 0.1

    // 多様性ボーナス（最近プレイしていないゲーム）
    const isNewGame = !this.isRecentlyPlayed(recommendation.gameId, userProfile)
    if (isNewGame) score += 0.1

    return Math.min(1.0, score)
  }

  // 信頼度計算
  calculateRecommendationConfidence(recommendations, userProfile) {
    const dataQuality = this.assessDataQuality(userProfile)
    const predictionStability = this.assessPredictionStability(recommendations)

    return Math.min(1.0, (dataQuality + predictionStability) / 2)
  }

  // 推薦理由生成
  generateRecommendationReasoning(recommendations, userProfile) {
    return recommendations.map(rec => ({
      gameId: rec.gameId,
      reason: rec.reason,
      factors: this.identifyInfluencingFactors(rec, userProfile),
      confidence: rec.finalScore
    }))
  }

  // ヘルパーメソッド
  categorizeTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  getGameCategory(gameId) {
    for (const [category, data] of Object.entries(this.gameCategories)) {
      if (data.games.includes(gameId)) return category
    }
    return 'general'
  }

  calculateOptimalDifficulty(userProfile, category) {
    const baseLevel = userProfile.performance.preferredDifficulty === 'easy' ? 0.3 :
                     userProfile.performance.preferredDifficulty === 'medium' ? 0.6 : 0.8

    const performanceAdjust = (userProfile.performance.averageScore - 70) / 100
    const streakBonus = userProfile.motivation.currentStreak > 7 ? 0.1 : 0

    return Math.max(0.1, Math.min(1.0, baseLevel + performanceAdjust + streakBonus))
  }

  getQuickWinGames(userProfile) {
    const favoriteCategory = userProfile.behavior.gamePreferences[0] || 'phonics'
    return this.gameCategories[favoriteCategory]?.games?.slice(0, 2) || ['RhythmPhonicsMini']
  }

  selectWarmupGame(userProfile) {
    const easyGames = ['FloatingLetterHunt', 'RhythmPhonicsMini', 'SightWordMaster']
    const favorites = userProfile.behavior.gamePreferences

    const warmupOptions = easyGames.filter(game =>
      favorites.some(fav => this.getGameCategory(game) === fav)
    )

    return warmupOptions[0] || easyGames[0]
  }

  // データ品質評価
  assessDataQuality(userProfile) {
    let quality = 0.5

    if (userProfile.progress.totalGamesPlayed > 50) quality += 0.2
    if (userProfile.progress.totalStudyTime > 600) quality += 0.2 // 10時間以上
    if (userProfile.performance.strongSkills.length > 0) quality += 0.1

    return Math.min(1.0, quality)
  }

  // その他のヘルパーメソッドを実装...
  identifyMasteredSkills(behaviorData) {
    return behaviorData.performance?.strongSkills || []
  }

  calculateDifficultyProgression(behaviorData) {
    return behaviorData.performance?.difficultyProgression || 0.5
  }

  hashProfile(profile) {
    return btoa(JSON.stringify(profile)).slice(0, 16)
  }

  identifyInfluencingFactors(recommendation, userProfile) {
    return [
      `Performance level: ${userProfile.performance.averageScore}`,
      `Streak status: ${userProfile.motivation.streakLevel}`,
      `Preferred category: ${userProfile.behavior.gamePreferences[0] || 'general'}`
    ]
  }

  assessPredictionStability(recommendations) {
    const scoreVariance = this.calculateVariance(recommendations.map(r => r.finalScore))
    return Math.max(0.1, 1.0 - scoreVariance)
  }

  calculateVariance(scores) {
    if (scores.length === 0) return 0
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    return variance
  }

  isRecentlyPlayed(gameId, userProfile) {
    // 簡単な実装 - 実際にはより詳細な履歴チェックを行う
    return false
  }
}

// シングルトンインスタンス
let instance = null

export function useLearningRecommendationEngine() {
  if (!instance) {
    instance = new LearningRecommendationEngine()
  }
  return instance
}

export default LearningRecommendationEngine