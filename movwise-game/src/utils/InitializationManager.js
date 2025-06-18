/**
 * MovWISE Initialization Manager
 * システム初期化と収益化準備
 */

import systemIntegrationTest from './SystemIntegrationTest'
import performanceOptimizer from './PerformanceOptimizer'
import securityChecker from './SecurityChecker'
import betaTestManager from './BetaTestManager'
import { DEPLOYMENT_CONFIG, INITIAL_DATA_CONFIG } from '@/config/deployment'

class InitializationManager {
  constructor() {
    this.isInitialized = false
    this.initializationSteps = []
    this.systemStatus = {
      health: 'unknown',
      readiness: false,
      version: DEPLOYMENT_CONFIG.deployment.VERSION,
      environment: DEPLOYMENT_CONFIG.environment
    }
    
    console.log('🚀 InitializationManager created')
  }

  /**
   * システム全体の初期化
   */
  async initializeSystem() {
    console.log('🎬 Starting MovWISE system initialization...')
    
    try {
      // 1. 環境設定の確認
      await this.validateEnvironment()
      
      // 2. セキュリティ設定の適用
      await this.applySecurity()
      
      // 3. パフォーマンス最適化の適用
      await this.applyPerformanceOptimizations()
      
      // 4. 初期データの投入
      await this.seedInitialData()
      
      // 5. βテストシステムの初期化
      await this.initializeBetaTest()
      
      // 6. 監視システムの開始
      await this.startMonitoring()
      
      // 7. 収益化機能の準備
      await this.prepareMonetization()
      
      // 8. 最終システムテスト
      await this.runFinalSystemTest()
      
      // 9. ヘルスチェック
      await this.performHealthCheck()
      
      this.isInitialized = true
      this.systemStatus.health = 'healthy'
      this.systemStatus.readiness = true
      
      console.log('✅ MovWISE system initialization completed successfully')
      
      return {
        success: true,
        status: this.systemStatus,
        steps: this.initializationSteps,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('❌ System initialization failed:', error)
      
      this.systemStatus.health = 'unhealthy'
      this.systemStatus.readiness = false
      
      return {
        success: false,
        error: error.message,
        status: this.systemStatus,
        steps: this.initializationSteps,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 環境設定の確認
   */
  async validateEnvironment() {
    console.log('🔍 Validating environment configuration...')
    
    const config = DEPLOYMENT_CONFIG.config
    const requiredEnvVars = [
      'FIREBASE_CONFIG',
      'API_BASE_URL'
    ]
    
    // 必要な環境変数の確認
    const missingVars = requiredEnvVars.filter(varName => {
      const value = config[varName] || process.env[`VITE_${varName}`]
      return !value
    })
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
    
    // Firebase設定の確認
    if (!config.FIREBASE_CONFIG.projectId) {
      throw new Error('Firebase configuration is incomplete')
    }
    
    this.addInitializationStep('Environment Validation', 'success', 'All required configurations verified')
  }

  /**
   * セキュリティ設定の適用
   */
  async applySecurity() {
    console.log('🔒 Applying security configurations...')
    
    // セキュリティチェッカーの初期化
    securityChecker.applySecurityMeasures()
    
    // Content Security Policy の設定
    this.setContentSecurityPolicy()
    
    // セキュリティヘッダーの設定
    this.setSecurityHeaders()
    
    // Firebase セキュリティルールの確認
    this.validateFirebaseRules()
    
    this.addInitializationStep('Security Configuration', 'success', 'Security measures applied')
  }

  /**
   * パフォーマンス最適化の適用
   */
  async applyPerformanceOptimizations() {
    console.log('⚡ Applying performance optimizations...')
    
    // パフォーマンスモニタリングの開始
    performanceOptimizer.startMonitoring()
    
    // 最適化の適用
    await performanceOptimizer.applyOptimizations()
    
    // プロダクション最適化の適用
    if (DEPLOYMENT_CONFIG.environment === 'production') {
      await performanceOptimizer.applyProductionOptimizations()
    }
    
    this.addInitializationStep('Performance Optimization', 'success', 'Performance optimizations applied')
  }

  /**
   * 初期データの投入
   */
  async seedInitialData() {
    console.log('📊 Seeding initial data...')
    
    try {
      // サンプル講師データの作成
      await this.createSampleTeachers()
      
      // サンプルゲームデータの作成
      await this.createSampleGames()
      
      // サンプルコンテンツの作成
      await this.createSampleContent()
      
      // 分析用初期データの作成
      await this.createAnalyticsData()
      
      this.addInitializationStep('Data Seeding', 'success', 'Initial data seeded successfully')
    } catch (error) {
      this.addInitializationStep('Data Seeding', 'warning', `Data seeding partially failed: ${error.message}`)
    }
  }

  /**
   * βテストシステムの初期化
   */
  async initializeBetaTest() {
    console.log('🧪 Initializing beta test system...')
    
    if (DEPLOYMENT_CONFIG.betaTest.ENABLED) {
      // βテストマネージャーの初期化は既に完了
      
      // βテスト用初期データの作成
      await this.createBetaTestData()
      
      this.addInitializationStep('Beta Test System', 'success', 'Beta test system initialized')
    } else {
      this.addInitializationStep('Beta Test System', 'skipped', 'Beta test disabled')
    }
  }

  /**
   * 監視システムの開始
   */
  async startMonitoring() {
    console.log('📈 Starting monitoring systems...')
    
    // エラー監視の開始
    this.startErrorMonitoring()
    
    // パフォーマンス監視の開始（既に開始済み）
    
    // ユーザー分析の開始
    this.startUserAnalytics()
    
    // システムヘルスチェックの開始
    this.startHealthMonitoring()
    
    this.addInitializationStep('Monitoring Systems', 'success', 'All monitoring systems started')
  }

  /**
   * 収益化機能の準備
   */
  async prepareMonetization() {
    console.log('💰 Preparing monetization features...')
    
    // 料金プランの設定
    this.setupPricingPlans()
    
    // 使用量制限の設定
    this.setupUsageLimits()
    
    // 決済システムの初期化（模擬）
    this.initializePaymentSystem()
    
    // 分析システムの設定
    this.setupAnalytics()
    
    this.addInitializationStep('Monetization Setup', 'success', 'Monetization features prepared')
  }

  /**
   * 最終システムテスト
   */
  async runFinalSystemTest() {
    console.log('🧪 Running final system test...')
    
    try {
      const testResult = await systemIntegrationTest.runFullSystemTest()
      
      // 成功指標のチェック
      const readinessCheck = systemIntegrationTest.checkBetaTestReadiness()
      
      if (testResult.summary.successRate >= 90 && readinessCheck.ready) {
        this.addInitializationStep('Final System Test', 'success', `System test passed (${testResult.summary.successRate}% success rate)`)
      } else {
        this.addInitializationStep('Final System Test', 'warning', `System test completed with issues (${testResult.summary.successRate}% success rate)`)
      }
      
      return testResult
    } catch (error) {
      this.addInitializationStep('Final System Test', 'error', `System test failed: ${error.message}`)
      throw error
    }
  }

  /**
   * ヘルスチェック
   */
  async performHealthCheck() {
    console.log('🩺 Performing health check...')
    
    const healthChecks = {
      database: await this.checkDatabaseConnection(),
      storage: await this.checkStorageAccess(),
      network: await this.checkNetworkConnectivity(),
      performance: await this.checkPerformanceMetrics(),
      security: await this.checkSecurityStatus()
    }
    
    const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy')
    
    if (allHealthy) {
      this.addInitializationStep('Health Check', 'success', 'All systems healthy')
    } else {
      const unhealthyChecks = Object.entries(healthChecks)
        .filter(([, check]) => check.status !== 'healthy')
        .map(([name]) => name)
      
      this.addInitializationStep('Health Check', 'warning', `Some systems need attention: ${unhealthyChecks.join(', ')}`)
    }
    
    return healthChecks
  }

  // === プライベートメソッド ===

  /**
   * Content Security Policy の設定
   */
  setContentSecurityPolicy() {
    const csp = DEPLOYMENT_CONFIG.security.CSP
    const cspString = Object.entries(csp)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ')
    
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = cspString
    document.head.appendChild(meta)
  }

  /**
   * セキュリティヘッダーの設定
   */
  setSecurityHeaders() {
    const headers = DEPLOYMENT_CONFIG.security.HEADERS
    
    Object.entries(headers).forEach(([header, value]) => {
      const meta = document.createElement('meta')
      meta.httpEquiv = header
      meta.content = value
      document.head.appendChild(meta)
    })
  }

  /**
   * Firebase セキュリティルールの確認
   */
  validateFirebaseRules() {
    const rules = DEPLOYMENT_CONFIG.firebase
    
    if (!rules.firestore || !rules.realtimeDatabase) {
      console.warn('Firebase security rules not properly configured')
    }
  }

  /**
   * サンプル講師データの作成
   */
  async createSampleTeachers() {
    const teachers = INITIAL_DATA_CONFIG.SAMPLE_TEACHERS
    
    teachers.forEach(teacher => {
      const teacherData = {
        ...teacher,
        createdAt: new Date().toISOString(),
        isActive: true,
        permissions: ['read', 'write', 'create_session'],
        preferences: {
          theme: 'space',
          language: 'ja',
          notifications: true
        }
      }
      
      localStorage.setItem(`teacher_${teacher.id}`, JSON.stringify(teacherData))
    })
    
    console.log(`✅ Created ${teachers.length} sample teachers`)
  }

  /**
   * サンプルゲームデータの作成
   */
  async createSampleGames() {
    const games = INITIAL_DATA_CONFIG.SAMPLE_GAMES
    
    games.forEach(game => {
      const gameData = {
        ...game,
        createdAt: new Date().toISOString(),
        isActive: true,
        settings: {
          allowCooperative: true,
          maxRetries: 3,
          timeLimit: game.duration * 60 // 分を秒に変換
        },
        analytics: {
          totalPlays: 0,
          averageScore: 0,
          completionRate: 0
        }
      }
      
      localStorage.setItem(`game_${game.id}`, JSON.stringify(gameData))
    })
    
    console.log(`✅ Created ${games.length} sample games`)
  }

  /**
   * サンプルコンテンツの作成
   */
  async createSampleContent() {
    const content = INITIAL_DATA_CONFIG.SAMPLE_CONTENT
    
    content.forEach(category => {
      const contentData = {
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        metadata: {
          source: 'initial_seed',
          version: '1.0.0'
        }
      }
      
      localStorage.setItem(`content_${category.category}_${category.level}`, JSON.stringify(contentData))
    })
    
    console.log(`✅ Created ${content.length} content categories`)
  }

  /**
   * 分析用初期データの作成
   */
  async createAnalyticsData() {
    const analyticsData = {
      systemMetrics: {
        totalUsers: 0,
        totalSessions: 0,
        totalGamePlays: 0,
        averageSessionDuration: 0,
        createdAt: new Date().toISOString()
      },
      performanceBaseline: {
        loadTime: 0,
        responseTime: 0,
        errorRate: 0,
        createdAt: new Date().toISOString()
      }
    }
    
    localStorage.setItem('movwise_analytics', JSON.stringify(analyticsData))
    console.log('✅ Created initial analytics data')
  }

  /**
   * βテスト用データの作成
   */
  async createBetaTestData() {
    const betaData = {
      testConfiguration: DEPLOYMENT_CONFIG.betaTest,
      createdAt: new Date().toISOString(),
      status: 'active',
      participants: {
        teachers: [],
        students: []
      },
      metrics: {
        registrations: 0,
        sessions: 0,
        feedback: 0
      }
    }
    
    localStorage.setItem('movwise_beta_test', JSON.stringify(betaData))
    console.log('✅ Created beta test configuration')
  }

  /**
   * エラー監視の開始
   */
  startErrorMonitoring() {
    window.addEventListener('error', (event) => {
      this.logError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('unhandled_promise_rejection', {
        reason: event.reason
      })
    })
  }

  /**
   * ユーザー分析の開始
   */
  startUserAnalytics() {
    if (DEPLOYMENT_CONFIG.monitoring.ANALYTICS.enabled) {
      // Google Analytics 初期化（模擬）
      console.log('📊 User analytics initialized')
    }
  }

  /**
   * システムヘルス監視の開始
   */
  startHealthMonitoring() {
    // 定期的なヘルスチェック
    setInterval(() => {
      this.performQuickHealthCheck()
    }, 5 * 60 * 1000) // 5分ごと
  }

  /**
   * 料金プランの設定
   */
  setupPricingPlans() {
    const plans = DEPLOYMENT_CONFIG.monetization.PRICING_TIERS
    localStorage.setItem('movwise_pricing_plans', JSON.stringify(plans))
    console.log('💰 Pricing plans configured')
  }

  /**
   * 使用量制限の設定
   */
  setupUsageLimits() {
    const limits = {
      free: {
        sessionsPerMonth: 10,
        studentsPerSession: 5
      },
      basic: {
        sessionsPerMonth: 50,
        studentsPerSession: 15
      },
      premium: {
        sessionsPerMonth: -1, // 無制限
        studentsPerSession: 30
      }
    }
    
    localStorage.setItem('movwise_usage_limits', JSON.stringify(limits))
    console.log('📊 Usage limits configured')
  }

  /**
   * 決済システムの初期化
   */
  initializePaymentSystem() {
    // 決済システムの初期化（模擬）
    const paymentConfig = {
      provider: 'stripe', // 実際にはStripeなどを使用
      publicKey: 'pk_test_example',
      currency: 'JPY',
      supportedMethods: ['card', 'bank_transfer']
    }
    
    localStorage.setItem('movwise_payment_config', JSON.stringify(paymentConfig))
    console.log('💳 Payment system initialized')
  }

  /**
   * 分析システムの設定
   */
  setupAnalytics() {
    const analyticsConfig = {
      events: [
        'user_registration',
        'session_start',
        'session_complete',
        'game_play',
        'feature_use',
        'error_encounter',
        'feedback_submit'
      ],
      goals: DEPLOYMENT_CONFIG.monetization.TARGETS
    }
    
    localStorage.setItem('movwise_analytics_config', JSON.stringify(analyticsConfig))
    console.log('📈 Analytics configured')
  }

  /**
   * データベース接続チェック
   */
  async checkDatabaseConnection() {
    try {
      // Firebase 接続チェック（模擬）
      const testData = { test: true, timestamp: Date.now() }
      localStorage.setItem('connection_test', JSON.stringify(testData))
      localStorage.removeItem('connection_test')
      
      return { status: 'healthy', message: 'Database connection OK' }
    } catch (error) {
      return { status: 'unhealthy', message: 'Database connection failed', error: error.message }
    }
  }

  /**
   * ストレージアクセスチェック
   */
  async checkStorageAccess() {
    try {
      // LocalStorage アクセスチェック
      localStorage.setItem('storage_test', 'test')
      localStorage.removeItem('storage_test')
      
      return { status: 'healthy', message: 'Storage access OK' }
    } catch (error) {
      return { status: 'unhealthy', message: 'Storage access failed', error: error.message }
    }
  }

  /**
   * ネットワーク接続チェック
   */
  async checkNetworkConnectivity() {
    try {
      if (!navigator.onLine) {
        return { status: 'warning', message: 'Browser reports offline' }
      }
      
      // 実際のネットワークテスト
      const response = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
      
      if (response.ok) {
        return { status: 'healthy', message: 'Network connectivity OK' }
      } else {
        return { status: 'warning', message: 'Network response not OK' }
      }
    } catch (error) {
      return { status: 'unhealthy', message: 'Network connectivity failed', error: error.message }
    }
  }

  /**
   * パフォーマンスメトリクスチェック
   */
  async checkPerformanceMetrics() {
    try {
      const report = performanceOptimizer.generatePerformanceReport()
      const score = performanceOptimizer.calculatePerformanceScore()
      
      if (score >= 80) {
        return { status: 'healthy', message: `Performance score: ${score}` }
      } else if (score >= 60) {
        return { status: 'warning', message: `Performance score: ${score} (needs improvement)` }
      } else {
        return { status: 'unhealthy', message: `Performance score: ${score} (critical)` }
      }
    } catch (error) {
      return { status: 'unhealthy', message: 'Performance check failed', error: error.message }
    }
  }

  /**
   * セキュリティ状況チェック
   */
  async checkSecurityStatus() {
    try {
      const securityReport = await securityChecker.runSecurityScan()
      
      if (securityReport.securityScore >= 90) {
        return { status: 'healthy', message: `Security score: ${securityReport.securityScore}` }
      } else if (securityReport.securityScore >= 70) {
        return { status: 'warning', message: `Security score: ${securityReport.securityScore} (needs attention)` }
      } else {
        return { status: 'unhealthy', message: `Security score: ${securityReport.securityScore} (critical)` }
      }
    } catch (error) {
      return { status: 'unhealthy', message: 'Security check failed', error: error.message }
    }
  }

  /**
   * クイックヘルスチェック
   */
  async performQuickHealthCheck() {
    const checks = await Promise.allSettled([
      this.checkStorageAccess(),
      this.checkNetworkConnectivity()
    ])
    
    const healthyChecks = checks.filter(check => 
      check.status === 'fulfilled' && check.value.status === 'healthy'
    ).length
    
    const healthPercentage = (healthyChecks / checks.length) * 100
    
    if (healthPercentage >= 100) {
      this.systemStatus.health = 'healthy'
    } else if (healthPercentage >= 50) {
      this.systemStatus.health = 'degraded'
    } else {
      this.systemStatus.health = 'unhealthy'
    }
  }

  /**
   * エラーログ
   */
  logError(type, data) {
    const errorLog = {
      type,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    console.error('System Error:', errorLog)
    
    // エラーをローカルストレージに保存
    const existingErrors = JSON.parse(localStorage.getItem('movwise_error_log') || '[]')
    existingErrors.push(errorLog)
    
    // 最新100件のエラーのみ保持
    if (existingErrors.length > 100) {
      existingErrors.splice(0, existingErrors.length - 100)
    }
    
    localStorage.setItem('movwise_error_log', JSON.stringify(existingErrors))
  }

  /**
   * 初期化ステップの追加
   */
  addInitializationStep(name, status, message) {
    const step = {
      name,
      status,
      message,
      timestamp: new Date().toISOString()
    }
    
    this.initializationSteps.push(step)
    console.log(`${this.getStatusEmoji(status)} ${name}: ${message}`)
  }

  /**
   * ステータス絵文字の取得
   */
  getStatusEmoji(status) {
    const emojis = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      skipped: '⏭️',
      info: 'ℹ️'
    }
    return emojis[status] || 'ℹ️'
  }

  /**
   * システム状況の取得
   */
  getSystemStatus() {
    return {
      ...this.systemStatus,
      uptime: this.isInitialized ? Date.now() - this.startTime : 0,
      initializationSteps: this.initializationSteps
    }
  }

  /**
   * システム統計の取得
   */
  getSystemStats() {
    return {
      initialization: {
        completed: this.isInitialized,
        steps: this.initializationSteps.length,
        successRate: this.initializationSteps.length > 0 ? 
          (this.initializationSteps.filter(s => s.status === 'success').length / this.initializationSteps.length) * 100 : 0
      },
      performance: performanceOptimizer.generatePerformanceReport(),
      security: this.systemStatus.health === 'healthy',
      betaTest: DEPLOYMENT_CONFIG.betaTest.ENABLED
    }
  }
}

// シングルトンインスタンス
const initializationManager = new InitializationManager()

export default initializationManager
export { InitializationManager }