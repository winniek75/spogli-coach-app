/**
 * MovWISE Beta Test Manager
 * βテスト管理とフィードバック収集システム
 */

import { BETA_TEST_CONFIG, MONETIZATION_CONFIG } from '@/config/deployment'

class BetaTestManager {
  constructor() {
    this.isActive = BETA_TEST_CONFIG.ENABLED
    this.participants = {
      teachers: [],
      students: []
    }
    this.feedback = []
    this.metrics = {
      registrations: 0,
      sessions: 0,
      completions: 0,
      errors: 0
    }
    this.startDate = new Date()
    this.endDate = new Date(Date.now() + BETA_TEST_CONFIG.TEST_DURATION_DAYS * 24 * 60 * 60 * 1000)
    
    console.log('🧪 BetaTestManager initialized')
    
    if (this.isActive) {
      this.initializeBetaTest()
    }
  }

  /**
   * βテストの初期化
   */
  initializeBetaTest() {
    console.log('🚀 Initializing Beta Test...')
    
    // 既存参加者データの読み込み
    this.loadParticipants()
    
    // フィードバックデータの読み込み
    this.loadFeedback()
    
    // メトリクスの読み込み
    this.loadMetrics()
    
    // イベントリスナーの設定
    this.setupEventListeners()
    
    // 定期的なフィードバック収集の開始
    this.startFeedbackCollection()
    
    // 使用状況の監視開始
    this.startUsageMonitoring()
    
    console.log('✅ Beta Test initialized')
  }

  /**
   * βテスト参加者の登録
   */
  async registerParticipant(userData) {
    try {
      const { type, ...participantData } = userData
      
      // 参加者数の制限チェック
      if (type === 'teacher' && this.participants.teachers.length >= BETA_TEST_CONFIG.MAX_TEACHERS) {
        throw new Error('Teacher limit reached for beta test')
      }
      
      if (type === 'student' && this.participants.students.length >= BETA_TEST_CONFIG.MAX_STUDENTS) {
        throw new Error('Student limit reached for beta test')
      }
      
      // 参加者データの作成
      const participant = {
        id: this.generateParticipantId(type),
        ...participantData,
        registrationDate: new Date().toISOString(),
        status: 'active',
        lastActivity: new Date().toISOString(),
        feedbackSubmitted: [],
        usageStats: {
          sessionsStarted: 0,
          sessionsCompleted: 0,
          totalPlayTime: 0,
          gamesPlayed: [],
          featuresUsed: []
        }
      }
      
      // 参加者リストに追加
      this.participants[type + 's'].push(participant)
      
      // メトリクス更新
      this.metrics.registrations++
      
      // データ保存
      this.saveParticipants()
      this.saveMetrics()
      
      // ウェルカムメッセージの送信
      this.sendWelcomeMessage(participant)
      
      console.log(`✅ Beta participant registered: ${type} ${participant.id}`)
      
      return participant
      
    } catch (error) {
      console.error('Failed to register beta participant:', error)
      throw error
    }
  }

  /**
   * フィードバックの収集
   */
  async collectFeedback(participantId, feedbackData) {
    try {
      const feedback = {
        id: this.generateFeedbackId(),
        participantId,
        timestamp: new Date().toISOString(),
        type: feedbackData.type || 'general',
        category: feedbackData.category || 'usability',
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        features: feedbackData.features || [],
        suggestions: feedbackData.suggestions || [],
        bugs: feedbackData.bugs || [],
        metadata: {
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timestamp: Date.now()
        }
      }
      
      // フィードバックリストに追加
      this.feedback.push(feedback)
      
      // 参加者のフィードバック履歴を更新
      const participant = this.findParticipant(participantId)
      if (participant) {
        participant.feedbackSubmitted.push(feedback.id)
        participant.lastActivity = new Date().toISOString()
      }
      
      // データ保存
      this.saveFeedback()
      this.saveParticipants()
      
      // フィードバック送信の確認
      this.sendFeedbackConfirmation(participant, feedback)
      
      console.log(`💬 Feedback collected from ${participantId}`)
      
      return feedback
      
    } catch (error) {
      console.error('Failed to collect feedback:', error)
      throw error
    }
  }

  /**
   * 使用状況の記録
   */
  recordUsage(participantId, activityType, data = {}) {
    try {
      const participant = this.findParticipant(participantId)
      if (!participant) {
        console.warn(`Participant not found: ${participantId}`)
        return
      }
      
      // 最終活動時刻を更新
      participant.lastActivity = new Date().toISOString()
      
      // 活動タイプ別の処理
      switch (activityType) {
        case 'session_start':
          participant.usageStats.sessionsStarted++
          this.metrics.sessions++
          break
          
        case 'session_complete':
          participant.usageStats.sessionsCompleted++
          this.metrics.completions++
          break
          
        case 'game_play':
          if (data.gameId && !participant.usageStats.gamesPlayed.includes(data.gameId)) {
            participant.usageStats.gamesPlayed.push(data.gameId)
          }
          if (data.duration) {
            participant.usageStats.totalPlayTime += data.duration
          }
          break
          
        case 'feature_use':
          if (data.feature && !participant.usageStats.featuresUsed.includes(data.feature)) {
            participant.usageStats.featuresUsed.push(data.feature)
          }
          break
          
        case 'error_encountered':
          this.metrics.errors++
          this.recordError(participantId, data)
          break
      }
      
      // データ保存
      this.saveParticipants()
      this.saveMetrics()
      
    } catch (error) {
      console.error('Failed to record usage:', error)
    }
  }

  /**
   * βテストレポートの生成
   */
  generateBetaTestReport() {
    const report = {
      testPeriod: {
        startDate: this.startDate.toISOString(),
        endDate: this.endDate.toISOString(),
        daysElapsed: Math.ceil((Date.now() - this.startDate.getTime()) / (24 * 60 * 60 * 1000)),
        daysRemaining: Math.max(0, Math.ceil((this.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      },
      
      participants: {
        teachers: {
          registered: this.participants.teachers.length,
          active: this.participants.teachers.filter(p => this.isActiveParticipant(p)).length,
          target: BETA_TEST_CONFIG.MAX_TEACHERS
        },
        students: {
          registered: this.participants.students.length,
          active: this.participants.students.filter(p => this.isActiveParticipant(p)).length,
          target: BETA_TEST_CONFIG.MAX_STUDENTS
        }
      },
      
      usage: {
        totalSessions: this.metrics.sessions,
        completedSessions: this.metrics.completions,
        completionRate: this.metrics.sessions > 0 ? (this.metrics.completions / this.metrics.sessions) * 100 : 0,
        target: MONETIZATION_CONFIG.TARGETS.COMPLETION_RATE
      },
      
      feedback: {
        totalSubmissions: this.feedback.length,
        averageRating: this.calculateAverageRating(),
        categoryCounts: this.calculateFeedbackCategories(),
        topSuggestions: this.getTopSuggestions(),
        criticalBugs: this.getCriticalBugs()
      },
      
      performance: {
        errorRate: this.metrics.sessions > 0 ? (this.metrics.errors / this.metrics.sessions) * 100 : 0,
        avgSessionDuration: this.calculateAverageSessionDuration(),
        popularFeatures: this.getPopularFeatures(),
        dropoffPoints: this.getDropoffPoints()
      },
      
      insights: this.generateInsights(),
      recommendations: this.generateRecommendations()
    }
    
    console.log('📊 Beta test report generated:', report)
    return report
  }

  /**
   * フィードバック収集の開始
   */
  startFeedbackCollection() {
    const reminderInterval = BETA_TEST_CONFIG.FEEDBACK_COLLECTION.reminderInterval * 24 * 60 * 60 * 1000
    
    setInterval(() => {
      this.sendFeedbackReminders()
    }, reminderInterval)
    
    console.log('🔔 Feedback collection started')
  }

  /**
   * 使用状況監視の開始
   */
  startUsageMonitoring() {
    // 定期的なデータ収集
    setInterval(() => {
      this.collectUsageMetrics()
    }, 60000) // 1分ごと
    
    // 非アクティブ参加者の検出
    setInterval(() => {
      this.detectInactiveParticipants()
    }, 24 * 60 * 60 * 1000) // 1日ごと
    
    console.log('📈 Usage monitoring started')
  }

  // === プライベートメソッド ===

  /**
   * 参加者IDの生成
   */
  generateParticipantId(type) {
    const prefix = type === 'teacher' ? 'BT' : 'BS'
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 4)
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * フィードバックIDの生成
   */
  generateFeedbackId() {
    return `FB_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * 参加者の検索
   */
  findParticipant(participantId) {
    return [...this.participants.teachers, ...this.participants.students]
      .find(p => p.id === participantId)
  }

  /**
   * アクティブ参加者の判定
   */
  isActiveParticipant(participant) {
    const lastActivity = new Date(participant.lastActivity)
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000)
    return daysSinceActivity <= 7 // 7日以内に活動があればアクティブ
  }

  /**
   * ウェルカムメッセージの送信
   */
  sendWelcomeMessage(participant) {
    const message = {
      type: 'welcome',
      title: 'MovWISE βテストへようこそ！',
      content: `${participant.name}さん、MovWISEのβテストにご参加いただきありがとうございます。\n\nテスト期間中は以下にご協力ください：\n- 定期的なフィードバックの提供\n- バグや問題の報告\n- 使い勝手の評価\n\nご質問がございましたら、お気軽にお知らせください。`,
      cta: {
        text: 'フィードバックを送信',
        url: BETA_TEST_CONFIG.FEEDBACK_COLLECTION.surveyUrl
      }
    }
    
    this.showNotification(message)
  }

  /**
   * フィードバック確認の送信
   */
  sendFeedbackConfirmation(participant, feedback) {
    const message = {
      type: 'feedback_received',
      title: 'フィードバックを受け取りました',
      content: `${participant.name}さん、貴重なフィードバックをありがとうございます。\n\nいただいたご意見は開発チームで検討し、サービスの改善に活用させていただきます。`,
      cta: {
        text: '追加フィードバック',
        url: BETA_TEST_CONFIG.FEEDBACK_COLLECTION.surveyUrl
      }
    }
    
    this.showNotification(message)
  }

  /**
   * フィードバックリマインダーの送信
   */
  sendFeedbackReminders() {
    const participantsNeedingFeedback = [...this.participants.teachers, ...this.participants.students]
      .filter(p => {
        const lastFeedback = p.feedbackSubmitted.length > 0 ? 
          Math.max(...p.feedbackSubmitted.map(id => {
            const feedback = this.feedback.find(f => f.id === id)
            return feedback ? new Date(feedback.timestamp).getTime() : 0
          })) : 0
        
        const daysSinceLastFeedback = (Date.now() - lastFeedback) / (24 * 60 * 60 * 1000)
        return daysSinceLastFeedback >= BETA_TEST_CONFIG.FEEDBACK_COLLECTION.reminderInterval
      })
    
    participantsNeedingFeedback.forEach(participant => {
      const message = {
        type: 'feedback_reminder',
        title: 'フィードバックのお願い',
        content: `${participant.name}さん、MovWISEのβテストはいかがですか？\n\nより良いサービスを提供するため、ぜひフィードバックをお聞かせください。`,
        cta: {
          text: 'フィードバックを送信',
          url: BETA_TEST_CONFIG.FEEDBACK_COLLECTION.surveyUrl
        }
      }
      
      this.showNotification(message)
    })
  }

  /**
   * 通知の表示
   */
  showNotification(message) {
    // 実装：実際のプロジェクトでは通知システムを呼び出し
    console.log('📢 Beta Test Notification:', message)
  }

  /**
   * エラーの記録
   */
  recordError(participantId, errorData) {
    const errorRecord = {
      id: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      participantId,
      timestamp: new Date().toISOString(),
      type: errorData.type || 'unknown',
      message: errorData.message || '',
      stack: errorData.stack || '',
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // エラーをフィードバックに追加
    this.feedback.push({
      id: this.generateFeedbackId(),
      participantId,
      timestamp: new Date().toISOString(),
      type: 'error_report',
      category: 'bug',
      rating: 1,
      comment: `自動エラーレポート: ${errorRecord.message}`,
      bugs: [errorRecord],
      metadata: {
        errorId: errorRecord.id,
        automatic: true
      }
    })
    
    this.saveFeedback()
  }

  /**
   * 平均評価の計算
   */
  calculateAverageRating() {
    const ratingsWithScore = this.feedback.filter(f => f.rating > 0)
    if (ratingsWithScore.length === 0) return 0
    
    const sum = ratingsWithScore.reduce((acc, f) => acc + f.rating, 0)
    return Math.round((sum / ratingsWithScore.length) * 10) / 10
  }

  /**
   * フィードバックカテゴリの集計
   */
  calculateFeedbackCategories() {
    return this.feedback.reduce((acc, feedback) => {
      acc[feedback.category] = (acc[feedback.category] || 0) + 1
      return acc
    }, {})
  }

  /**
   * トップ提案の取得
   */
  getTopSuggestions() {
    const suggestions = this.feedback.flatMap(f => f.suggestions || [])
    const counts = suggestions.reduce((acc, suggestion) => {
      acc[suggestion] = (acc[suggestion] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([suggestion, count]) => ({ suggestion, count }))
  }

  /**
   * 重要なバグの取得
   */
  getCriticalBugs() {
    return this.feedback
      .filter(f => f.bugs && f.bugs.length > 0)
      .flatMap(f => f.bugs)
      .filter(bug => bug.type === 'critical' || bug.message.includes('crash'))
      .slice(0, 10)
  }

  /**
   * 平均セッション時間の計算
   */
  calculateAverageSessionDuration() {
    const allParticipants = [...this.participants.teachers, ...this.participants.students]
    const totalPlayTime = allParticipants.reduce((acc, p) => acc + p.usageStats.totalPlayTime, 0)
    const totalSessions = allParticipants.reduce((acc, p) => acc + p.usageStats.sessionsStarted, 0)
    
    return totalSessions > 0 ? Math.round(totalPlayTime / totalSessions) : 0
  }

  /**
   * 人気機能の取得
   */
  getPopularFeatures() {
    const allParticipants = [...this.participants.teachers, ...this.participants.students]
    const featureUsage = allParticipants.flatMap(p => p.usageStats.featuresUsed)
    
    const counts = featureUsage.reduce((acc, feature) => {
      acc[feature] = (acc[feature] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([feature, count]) => ({ feature, count }))
  }

  /**
   * ドロップオフポイントの取得
   */
  getDropoffPoints() {
    // セッション開始数と完了数の差分から推定
    const startedSessions = this.metrics.sessions
    const completedSessions = this.metrics.completions
    
    return {
      sessionStart: startedSessions,
      sessionComplete: completedSessions,
      dropoffRate: startedSessions > 0 ? ((startedSessions - completedSessions) / startedSessions) * 100 : 0
    }
  }

  /**
   * インサイトの生成
   */
  generateInsights() {
    const insights = []
    
    // 参加者数の分析
    const teacherParticipation = (this.participants.teachers.length / BETA_TEST_CONFIG.MAX_TEACHERS) * 100
    const studentParticipation = (this.participants.students.length / BETA_TEST_CONFIG.MAX_STUDENTS) * 100
    
    if (teacherParticipation < 50) {
      insights.push('講師の参加率が低いため、より積極的な募集が必要です')
    }
    
    if (studentParticipation < 50) {
      insights.push('生徒の参加率が低いため、学校との連携強化が必要です')
    }
    
    // 完了率の分析
    const completionRate = this.metrics.sessions > 0 ? (this.metrics.completions / this.metrics.sessions) * 100 : 0
    if (completionRate < MONETIZATION_CONFIG.TARGETS.COMPLETION_RATE) {
      insights.push(`ゲーム完了率が目標の${MONETIZATION_CONFIG.TARGETS.COMPLETION_RATE}%を下回っています`)
    }
    
    // フィードバックの分析
    const avgRating = this.calculateAverageRating()
    if (avgRating < 3.5) {
      insights.push('平均評価が低いため、ユーザビリティの改善が必要です')
    }
    
    return insights
  }

  /**
   * 推奨事項の生成
   */
  generateRecommendations() {
    const recommendations = []
    
    // 参加者募集の推奨事項
    if (this.participants.teachers.length < BETA_TEST_CONFIG.MAX_TEACHERS) {
      recommendations.push({
        category: 'recruitment',
        priority: 'high',
        action: '講師向けのマーケティング強化',
        details: '教育関連の展示会やSNSでの宣伝を増やす'
      })
    }
    
    // ユーザビリティの推奨事項
    const avgRating = this.calculateAverageRating()
    if (avgRating < 4.0) {
      recommendations.push({
        category: 'usability',
        priority: 'high',
        action: 'ユーザーインターフェースの改善',
        details: 'フィードバックに基づいた操作性の向上'
      })
    }
    
    // バグ修正の推奨事項
    const criticalBugs = this.getCriticalBugs()
    if (criticalBugs.length > 0) {
      recommendations.push({
        category: 'quality',
        priority: 'critical',
        action: '重要なバグの修正',
        details: `${criticalBugs.length}件の重要なバグが報告されています`
      })
    }
    
    return recommendations
  }

  /**
   * 使用状況メトリクスの収集
   */
  collectUsageMetrics() {
    // 現在のアクティブユーザー数を記録
    const activeUsers = [...this.participants.teachers, ...this.participants.students]
      .filter(p => this.isActiveParticipant(p)).length
    
    // メトリクスをローカルストレージに保存
    const metricsData = {
      timestamp: new Date().toISOString(),
      activeUsers,
      totalSessions: this.metrics.sessions,
      completions: this.metrics.completions,
      errors: this.metrics.errors
    }
    
    const existingMetrics = JSON.parse(localStorage.getItem('beta_usage_metrics') || '[]')
    existingMetrics.push(metricsData)
    
    // 直近24時間のデータのみ保持
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const recentMetrics = existingMetrics.filter(m => new Date(m.timestamp).getTime() > oneDayAgo)
    
    localStorage.setItem('beta_usage_metrics', JSON.stringify(recentMetrics))
  }

  /**
   * 非アクティブ参加者の検出
   */
  detectInactiveParticipants() {
    const inactiveParticipants = [...this.participants.teachers, ...this.participants.students]
      .filter(p => !this.isActiveParticipant(p))
    
    inactiveParticipants.forEach(participant => {
      const message = {
        type: 'reactivation',
        title: 'MovWISEでお待ちしています',
        content: `${participant.name}さん、しばらくMovWISEをご利用いただいていないようです。\n\nβテスト期間は限られています。ぜひ再度お試しください！`,
        cta: {
          text: 'ゲームを開始',
          url: '/'
        }
      }
      
      this.showNotification(message)
    })
  }

  /**
   * データの保存・読み込みメソッド
   */
  saveParticipants() {
    localStorage.setItem('beta_participants', JSON.stringify(this.participants))
  }
  
  loadParticipants() {
    const data = localStorage.getItem('beta_participants')
    if (data) {
      this.participants = JSON.parse(data)
    }
  }
  
  saveFeedback() {
    localStorage.setItem('beta_feedback', JSON.stringify(this.feedback))
  }
  
  loadFeedback() {
    const data = localStorage.getItem('beta_feedback')
    if (data) {
      this.feedback = JSON.parse(data)
    }
  }
  
  saveMetrics() {
    localStorage.setItem('beta_metrics', JSON.stringify(this.metrics))
  }
  
  loadMetrics() {
    const data = localStorage.getItem('beta_metrics')
    if (data) {
      this.metrics = JSON.parse(data)
    }
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // ページ離脱時のデータ保存
    window.addEventListener('beforeunload', () => {
      this.saveParticipants()
      this.saveFeedback()
      this.saveMetrics()
    })
    
    // エラーイベントの監視
    window.addEventListener('error', (event) => {
      this.recordError('current_user', {
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : ''
      })
    })
    
    // Promise拒否の監視
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('current_user', {
        type: 'unhandled_promise_rejection',
        message: event.reason ? event.reason.toString() : 'Unknown promise rejection',
        stack: event.reason && event.reason.stack ? event.reason.stack : ''
      })
    })
  }
}

// シングルトンインスタンス
const betaTestManager = new BetaTestManager()

export default betaTestManager
export { BetaTestManager }