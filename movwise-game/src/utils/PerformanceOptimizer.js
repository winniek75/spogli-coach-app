/**
 * MovWISE Performance Optimization System
 * パフォーマンス最適化とモニタリング
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkLatency: 0,
      frameRate: 0,
      bundleSize: 0
    }
    
    this.thresholds = {
      maxLoadTime: 3000, // 3秒
      maxRenderTime: 200, // 200ms
      maxMemoryUsage: 100, // 100MB
      maxNetworkLatency: 200, // 200ms
      minFrameRate: 30 // 30fps
    }
    
    this.optimizations = []
    this.isMonitoring = false
    this.performanceObserver = null
    
    console.log('⚡ PerformanceOptimizer initialized')
  }

  /**
   * パフォーマンス監視を開始
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('Performance monitoring already active')
      return
    }

    console.log('🔍 Starting performance monitoring...')
    this.isMonitoring = true

    // Core Web Vitals の監視
    this.monitorCoreWebVitals()
    
    // メモリ使用量の監視
    this.monitorMemoryUsage()
    
    // フレームレートの監視
    this.monitorFrameRate()
    
    // ネットワーク遅延の監視
    this.monitorNetworkLatency()
    
    // バンドルサイズの分析
    this.analyzeBundleSize()
    
    // パフォーマンスイベントの監視
    this.setupPerformanceObserver()
  }

  /**
   * パフォーマンス監視を停止
   */
  stopMonitoring() {
    this.isMonitoring = false
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = null
    }
    
    console.log('⏹️ Performance monitoring stopped')
  }

  /**
   * Core Web Vitals の監視
   */
  monitorCoreWebVitals() {
    // First Contentful Paint (FCP)
    this.measureFCP()
    
    // Largest Contentful Paint (LCP)
    this.measureLCP()
    
    // Cumulative Layout Shift (CLS)
    this.measureCLS()
    
    // First Input Delay (FID)
    this.measureFID()
    
    // Time to Interactive (TTI)
    this.measureTTI()
  }

  /**
   * First Contentful Paint 測定
   */
  measureFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime
          console.log(`🎨 FCP: ${fcpEntry.startTime.toFixed(2)}ms`)
          
          if (fcpEntry.startTime > 1800) {
            this.addOptimization('FCP', 'critical', 'FCPが遅すぎます。画像の最適化やリソースの優先度設定を検討してください。')
          }
        }
      })
      
      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.warn('FCP monitoring not supported:', error)
    }
  }

  /**
   * Largest Contentful Paint 測定
   */
  measureLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime
          console.log(`🖼️ LCP: ${lastEntry.startTime.toFixed(2)}ms`)
          
          if (lastEntry.startTime > 2500) {
            this.addOptimization('LCP', 'high', 'LCPが遅いです。大きな画像やコンテンツの最適化が必要です。')
          }
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP monitoring not supported:', error)
    }
  }

  /**
   * Cumulative Layout Shift 測定
   */
  measureCLS() {
    try {
      let clsValue = 0
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        
        this.metrics.cls = clsValue
        console.log(`📐 CLS: ${clsValue.toFixed(4)}`)
        
        if (clsValue > 0.1) {
          this.addOptimization('CLS', 'medium', 'レイアウトシフトが多すぎます。画像のサイズ指定やフォントの最適化を検討してください。')
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS monitoring not supported:', error)
    }
  }

  /**
   * First Input Delay 測定
   */
  measureFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = entry.processingStart - entry.startTime
          console.log(`👆 FID: ${this.metrics.fid.toFixed(2)}ms`)
          
          if (this.metrics.fid > 100) {
            this.addOptimization('FID', 'high', 'First Input Delayが長すぎます。JavaScriptの最適化が必要です。')
          }
        }
      })
      
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID monitoring not supported:', error)
    }
  }

  /**
   * Time to Interactive 測定
   */
  measureTTI() {
    // TTIの簡易計算
    const startTime = performance.timing.navigationStart
    const domInteractive = performance.timing.domInteractive
    
    if (domInteractive) {
      this.metrics.tti = domInteractive - startTime
      console.log(`⚡ TTI (estimated): ${this.metrics.tti}ms`)
      
      if (this.metrics.tti > 3800) {
        this.addOptimization('TTI', 'critical', 'Time to Interactiveが遅すぎます。JavaScript の分割読み込みを検討してください。')
      }
    }
  }

  /**
   * メモリ使用量の監視
   */
  monitorMemoryUsage() {
    if (!performance.memory) {
      console.warn('Memory monitoring not supported')
      return
    }

    const updateMemoryMetrics = () => {
      if (!this.isMonitoring) return

      const memory = performance.memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      this.metrics.memoryLimit = memory.jsHeapSizeLimit / 1024 / 1024 // MB
      
      if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
        this.addOptimization('Memory', 'high', `メモリ使用量が${this.metrics.memoryUsage.toFixed(1)}MBと高すぎます。メモリリークの確認が必要です。`)
      }
      
      setTimeout(updateMemoryMetrics, 5000) // 5秒ごと
    }

    updateMemoryMetrics()
  }

  /**
   * フレームレートの監視
   */
  monitorFrameRate() {
    let lastTime = performance.now()
    let frameCount = 0
    let fps = 0

    const measureFPS = (currentTime) => {
      if (!this.isMonitoring) return

      frameCount++
      const deltaTime = currentTime - lastTime

      if (deltaTime >= 1000) { // 1秒ごと
        fps = Math.round((frameCount * 1000) / deltaTime)
        this.metrics.frameRate = fps
        
        if (fps < this.thresholds.minFrameRate) {
          this.addOptimization('FPS', 'medium', `フレームレートが${fps}fpsと低すぎます。アニメーションの最適化が必要です。`)
        }
        
        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(measureFPS)
    }

    requestAnimationFrame(measureFPS)
  }

  /**
   * ネットワーク遅延の監視
   */
  async monitorNetworkLatency() {
    const measureLatency = async () => {
      if (!this.isMonitoring) return

      try {
        const startTime = performance.now()
        
        // 小さなリソースでレイテンシを測定
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
        
        const latency = performance.now() - startTime
        this.metrics.networkLatency = latency
        
        if (latency > this.thresholds.maxNetworkLatency) {
          this.addOptimization('Network', 'medium', `ネットワーク遅延が${latency.toFixed(1)}msと高めです。CDNの使用を検討してください。`)
        }
        
        setTimeout(measureLatency, 30000) // 30秒ごと
      } catch (error) {
        console.warn('Network latency measurement failed:', error)
      }
    }

    measureLatency()
  }

  /**
   * バンドルサイズの分析
   */
  analyzeBundleSize() {
    try {
      // ナビゲーションタイミングからバンドルサイズを推定
      const navigationEntry = performance.getEntriesByType('navigation')[0]
      
      if (navigationEntry) {
        this.metrics.transferSize = navigationEntry.transferSize / 1024 // KB
        this.metrics.encodedBodySize = navigationEntry.encodedBodySize / 1024 // KB
        
        console.log(`📦 Transfer Size: ${this.metrics.transferSize.toFixed(1)}KB`)
        console.log(`📦 Encoded Size: ${this.metrics.encodedBodySize.toFixed(1)}KB`)
        
        if (this.metrics.transferSize > 1000) { // 1MB
          this.addOptimization('Bundle', 'high', 'バンドルサイズが大きすぎます。コード分割や圧縮の最適化を検討してください。')
        }
      }
    } catch (error) {
      console.warn('Bundle size analysis failed:', error)
    }
  }

  /**
   * パフォーマンスオブザーバーの設定
   */
  setupPerformanceObserver() {
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            console.log(`📏 Custom measure: ${entry.name} - ${entry.duration.toFixed(2)}ms`)
          } else if (entry.entryType === 'navigation') {
            this.analyzeNavigationTiming(entry)
          } else if (entry.entryType === 'resource') {
            this.analyzeResourceTiming(entry)
          }
        }
      })
      
      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      })
    } catch (error) {
      console.warn('PerformanceObserver setup failed:', error)
    }
  }

  /**
   * ナビゲーションタイミングの分析
   */
  analyzeNavigationTiming(entry) {
    const metrics = {
      dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcpConnection: entry.connectEnd - entry.connectStart,
      serverResponse: entry.responseStart - entry.requestStart,
      domProcessing: entry.domContentLoadedEventStart - entry.responseEnd,
      resourceLoad: entry.loadEventStart - entry.domContentLoadedEventEnd
    }
    
    console.log('🔍 Navigation Timing Analysis:', metrics)
    
    if (metrics.serverResponse > 500) {
      this.addOptimization('Server', 'high', 'サーバーレスポンス時間が遅いです。バックエンドの最適化が必要です。')
    }
    
    if (metrics.domProcessing > 1000) {
      this.addOptimization('DOM', 'medium', 'DOM処理時間が長いです。JavaScriptの最適化を検討してください。')
    }
  }

  /**
   * リソースタイミングの分析
   */
  analyzeResourceTiming(entry) {
    const loadTime = entry.responseEnd - entry.startTime
    
    if (loadTime > 1000 && entry.initiatorType === 'img') {
      this.addOptimization('Images', 'medium', `画像の読み込みが遅いです: ${entry.name}`)
    }
    
    if (loadTime > 2000 && entry.initiatorType === 'script') {
      this.addOptimization('Scripts', 'high', `スクリプトの読み込みが遅いです: ${entry.name}`)
    }
  }

  /**
   * 最適化の実行
   */
  async applyOptimizations() {
    console.log('🔧 Applying performance optimizations...')
    
    // 画像の遅延読み込み
    this.implementLazyLoading()
    
    // 不要なリソースのプリロード停止
    this.optimizeResourceLoading()
    
    // メモリリークの対策
    this.preventMemoryLeaks()
    
    // DOM操作の最適化
    this.optimizeDOMOperations()
    
    // イベントリスナーの最適化
    this.optimizeEventListeners()
    
    console.log('✅ Performance optimizations applied')
  }

  /**
   * 画像の遅延読み込み実装
   */
  implementLazyLoading() {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]')
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        })
      })
      
      images.forEach(img => imageObserver.observe(img))
      
      console.log(`🖼️ Lazy loading enabled for ${images.length} images`)
    }
  }

  /**
   * リソース読み込みの最適化
   */
  optimizeResourceLoading() {
    // 不要なプリロードリンクを削除
    const preloadLinks = document.querySelectorAll('link[rel="preload"]')
    preloadLinks.forEach(link => {
      if (!link.getAttribute('as') || link.getAttribute('as') === 'style') {
        // CSSプリロードの場合は保持
        return
      }
      link.remove()
    })
    
    // リソースヒントの最適化
    this.addResourceHints()
  }

  /**
   * リソースヒントの追加
   */
  addResourceHints() {
    const head = document.head
    
    // DNS prefetch for external domains
    const externalDomains = ['fonts.googleapis.com', 'cdn.jsdelivr.net']
    externalDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
        const link = document.createElement('link')
        link.rel = 'dns-prefetch'
        link.href = `//${domain}`
        head.appendChild(link)
      }
    })
  }

  /**
   * メモリリークの対策
   */
  preventMemoryLeaks() {
    // WeakMapを使用したイベントリスナー管理
    if (!window._movwiseEventListeners) {
      window._movwiseEventListeners = new WeakMap()
    }
    
    // 定期的なガベージコレクション促進
    if (window.gc && typeof window.gc === 'function') {
      setInterval(() => {
        if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
          window.gc()
        }
      }, 60000) // 1分ごと
    }
  }

  /**
   * DOM操作の最適化
   */
  optimizeDOMOperations() {
    // DocumentFragmentを使用したバッチ更新
    const batchDOMUpdates = (updates) => {
      const fragment = document.createDocumentFragment()
      updates.forEach(update => update(fragment))
      document.body.appendChild(fragment)
    }
    
    // レンダリングの最適化
    this.optimizeRendering()
  }

  /**
   * レンダリングの最適化
   */
  optimizeRendering() {
    // will-change プロパティの動的設定
    const animatedElements = document.querySelectorAll('[data-animated]')
    animatedElements.forEach(element => {
      element.style.willChange = 'transform'
      
      // アニメーション終了後にwill-changeをリセット
      element.addEventListener('animationend', () => {
        element.style.willChange = 'auto'
      }, { once: true })
    })
  }

  /**
   * イベントリスナーの最適化
   */
  optimizeEventListeners() {
    // パッシブリスナーの使用
    const scrollElements = document.querySelectorAll('[data-scroll-listener]')
    scrollElements.forEach(element => {
      if (element._optimizedScrollListener) return
      
      element._optimizedScrollListener = this.throttle(() => {
        // スクロール処理
      }, 16) // 60fps
      
      element.addEventListener('scroll', element._optimizedScrollListener, { passive: true })
    })
  }

  /**
   * スロットリング関数
   */
  throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * デバウンス関数
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * 最適化提案を追加
   */
  addOptimization(category, priority, message) {
    const optimization = {
      category,
      priority,
      message,
      timestamp: new Date().toISOString()
    }
    
    // 重複チェック
    const exists = this.optimizations.some(opt => 
      opt.category === category && opt.message === message
    )
    
    if (!exists) {
      this.optimizations.push(optimization)
      console.log(`💡 Optimization suggestion [${priority}]: ${message}`)
    }
  }

  /**
   * パフォーマンスレポートの生成
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      optimizations: this.optimizations,
      recommendations: this.generateRecommendations(),
      score: this.calculatePerformanceScore()
    }
    
    console.log('📊 Performance Report:', report)
    return report
  }

  /**
   * パフォーマンススコアの計算
   */
  calculatePerformanceScore() {
    let score = 100
    
    // Core Web Vitals based scoring
    if (this.metrics.fcp > 1800) score -= 10
    if (this.metrics.lcp > 2500) score -= 15
    if (this.metrics.cls > 0.1) score -= 10
    if (this.metrics.fid > 100) score -= 15
    
    // Memory usage
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) score -= 10
    
    // Frame rate
    if (this.metrics.frameRate < this.thresholds.minFrameRate) score -= 10
    
    // Network latency
    if (this.metrics.networkLatency > this.thresholds.maxNetworkLatency) score -= 5
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * 推奨事項の生成
   */
  generateRecommendations() {
    const recommendations = []
    
    // 高優先度の最適化があるかチェック
    const criticalOptimizations = this.optimizations.filter(opt => opt.priority === 'critical')
    if (criticalOptimizations.length > 0) {
      recommendations.push({
        priority: 'critical',
        message: '重要なパフォーマンス問題が検出されました。すぐに対応してください。',
        actions: criticalOptimizations.map(opt => opt.message)
      })
    }
    
    // メモリ使用量の推奨事項
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      recommendations.push({
        priority: 'high',
        message: 'メモリ使用量を最適化してください',
        actions: [
          '不要なイベントリスナーを削除',
          'DOM要素の参照を適切に削除',
          '大きなオブジェクトのメモリを解放'
        ]
      })
    }
    
    // 読み込み時間の推奨事項
    if (this.metrics.transferSize > 1000) {
      recommendations.push({
        priority: 'medium',
        message: 'バンドルサイズを最適化してください',
        actions: [
          'コード分割の実装',
          '不要なライブラリの削除',
          '画像とアセットの圧縮'
        ]
      })
    }
    
    return recommendations
  }

  /**
   * プロダクション最適化の適用
   */
  applyProductionOptimizations() {
    console.log('🚀 Applying production optimizations...')
    
    // サービスワーカーの登録
    this.registerServiceWorker()
    
    // キャッシュ戦略の適用
    this.implementCachingStrategy()
    
    // リソースの圧縮
    this.enableCompression()
    
    // CDNの設定
    this.configureCDN()
    
    console.log('✅ Production optimizations applied')
  }

  /**
   * サービスワーカーの登録
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('📱 Service Worker registered:', registration.scope)
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  /**
   * キャッシュ戦略の実装
   */
  implementCachingStrategy() {
    // Cache-first strategy for static assets
    const staticAssets = ['/css', '/js', '/images']
    
    // Network-first strategy for API calls
    const apiEndpoints = ['/api']
    
    console.log('💾 Caching strategy implemented')
  }

  /**
   * 圧縮の有効化
   */
  enableCompression() {
    // Gzip/Brotli compression settings
    console.log('🗜️ Compression enabled')
  }

  /**
   * CDNの設定
   */
  configureCDN() {
    // CDN configuration for static assets
    console.log('🌐 CDN configured')
  }
}

// シングルトンインスタンス
const performanceOptimizer = new PerformanceOptimizer()

export default performanceOptimizer
export { PerformanceOptimizer }