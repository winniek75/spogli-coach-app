/**
 * MovWISE Security Checker
 * セキュリティチェックとルール設定
 */

class SecurityChecker {
  constructor() {
    this.securityConfig = {
      enableCSP: true,
      enableXSSProtection: true,
      enableDataSanitization: true,
      enableInputValidation: true,
      enableSecureStorage: true
    }
    
    this.vulnerabilities = []
    this.securityScore = 100
    this.lastScanTime = null
    
    console.log('🔒 SecurityChecker initialized')
  }

  /**
   * 包括的セキュリティスキャンを実行
   */
  async runSecurityScan() {
    console.log('🔍 Starting comprehensive security scan...')
    this.vulnerabilities = []
    this.securityScore = 100
    this.lastScanTime = new Date().toISOString()

    try {
      // 1. XSS脆弱性チェック
      await this.checkXSSVulnerabilities()
      
      // 2. データサニタイゼーションチェック
      await this.checkDataSanitization()
      
      // 3. ローカルストレージセキュリティチェック
      await this.checkLocalStorageSecurity()
      
      // 4. 入力値検証チェック
      await this.checkInputValidation()
      
      // 5. CSPヘッダーチェック
      await this.checkCSPHeaders()
      
      // 6. HTTPSチェック
      await this.checkHTTPS()
      
      // 7. 外部リソースチェック
      await this.checkExternalResources()
      
      // 8. Firebase セキュリティルールチェック
      await this.checkFirebaseSecurity()
      
      // 9. 認証・認可チェック
      await this.checkAuthentication()
      
      // 10. セッション管理チェック
      await this.checkSessionManagement()
      
      const report = this.generateSecurityReport()
      console.log('✅ Security scan completed')
      
      return report
      
    } catch (error) {
      console.error('❌ Security scan failed:', error)
      throw error
    }
  }

  /**
   * XSS脆弱性チェック
   */
  async checkXSSVulnerabilities() {
    console.log('🛡️ Checking XSS vulnerabilities...')
    
    const xssPatterns = [
      '<script>',
      'javascript:',
      'onload=',
      'onerror=',
      'onclick=',
      'onmouseover=',
      'eval(',
      'innerHTML',
      'document.write'
    ]
    
    // DOM内のテキストコンテンツをチェック
    const textNodes = this.getAllTextNodes(document.body)
    textNodes.forEach(node => {
      const content = node.textContent.toLowerCase()
      xssPatterns.forEach(pattern => {
        if (content.includes(pattern.toLowerCase())) {
          this.addVulnerability('XSS', 'high', `Potential XSS pattern found: ${pattern}`, {
            element: node.parentElement,
            content: node.textContent.substring(0, 100)
          })
        }
      })
    })
    
    // HTMLコンテンツのチェック
    const elements = document.querySelectorAll('*')
    elements.forEach(element => {
      // onclick, onload等のインラインイベントハンドラーをチェック
      for (const attr of element.attributes) {
        if (attr.name.startsWith('on') && attr.value) {
          this.addVulnerability('XSS', 'critical', `Inline event handler found: ${attr.name}`, {
            element: element,
            attribute: attr.name,
            value: attr.value
          })
        }
      }
      
      // href属性のjavascript:スキームをチェック
      if (element.href && element.href.startsWith('javascript:')) {
        this.addVulnerability('XSS', 'high', 'JavaScript URL scheme detected', {
          element: element,
          href: element.href
        })
      }
    })
    
    // 動的コンテンツ生成のチェック
    this.checkDynamicContentGeneration()
  }

  /**
   * データサニタイゼーションチェック
   */
  async checkDataSanitization() {
    console.log('🧼 Checking data sanitization...')
    
    // ローカルストレージ内のデータをチェック
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      
      try {
        const data = JSON.parse(value)
        this.checkDataForMaliciousContent(data, `localStorage.${key}`)
      } catch (error) {
        // JSON以外のデータもチェック
        this.checkStringForMaliciousContent(value, `localStorage.${key}`)
      }
    }
    
    // フォーム入力値のサニタイゼーションチェック
    const inputs = document.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      if (input.value) {
        this.checkStringForMaliciousContent(input.value, `form.${input.name || input.id}`)
      }
    })
  }

  /**
   * ローカルストレージセキュリティチェック
   */
  async checkLocalStorageSecurity() {
    console.log('💾 Checking localStorage security...')
    
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'private', 'secure', 'session', 'login', 'api_key'
    ]
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      
      // 機密データの平文保存チェック
      sensitiveKeys.forEach(sensitiveKey => {
        if (key.toLowerCase().includes(sensitiveKey)) {
          this.addVulnerability('Storage', 'high', `Sensitive data in localStorage: ${key}`, {
            key: key,
            valueLength: value.length
          })
        }
      })
      
      // 大きなデータの保存チェック
      if (value.length > 100000) { // 100KB
        this.addVulnerability('Storage', 'medium', `Large data in localStorage: ${key}`, {
          key: key,
          size: value.length
        })
      }
      
      // 期限切れデータのチェック
      try {
        const data = JSON.parse(value)
        if (data.timestamp) {
          const age = Date.now() - new Date(data.timestamp).getTime()
          if (age > 7 * 24 * 60 * 60 * 1000) { // 1週間
            this.addVulnerability('Storage', 'low', `Old data in localStorage: ${key}`, {
              key: key,
              age: Math.round(age / (24 * 60 * 60 * 1000)) + ' days'
            })
          }
        }
      } catch (error) {
        // JSON以外は無視
      }
    }
    
    // ストレージ容量チェック
    this.checkStorageQuota()
  }

  /**
   * 入力値検証チェック
   */
  async checkInputValidation() {
    console.log('✅ Checking input validation...')
    
    const inputs = document.querySelectorAll('input, textarea')
    inputs.forEach(input => {
      // 必須フィールドの検証
      if (input.required && !input.value) {
        this.addVulnerability('Validation', 'medium', `Required field not validated: ${input.name}`, {
          element: input,
          type: input.type
        })
      }
      
      // 入力長制限の検証
      if (input.type === 'text' || input.type === 'textarea') {
        if (!input.maxLength && input.value.length > 1000) {
          this.addVulnerability('Validation', 'medium', `No length limit on input: ${input.name}`, {
            element: input,
            currentLength: input.value.length
          })
        }
      }
      
      // Eメール形式の検証
      if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input.value)) {
          this.addVulnerability('Validation', 'medium', `Invalid email format: ${input.name}`, {
            element: input,
            value: input.value
          })
        }
      }
      
      // パスワード強度の検証
      if (input.type === 'password' && input.value) {
        const passwordStrength = this.checkPasswordStrength(input.value)
        if (passwordStrength.score < 3) {
          this.addVulnerability('Validation', 'high', `Weak password detected: ${input.name}`, {
            element: input,
            strength: passwordStrength
          })
        }
      }
    })
  }

  /**
   * CSPヘッダーチェック
   */
  async checkCSPHeaders() {
    console.log('🛡️ Checking CSP headers...')
    
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    
    if (!cspMeta) {
      this.addVulnerability('CSP', 'high', 'Content Security Policy not found', {
        recommendation: 'Implement CSP headers to prevent XSS attacks'
      })
      return
    }
    
    const cspContent = cspMeta.getAttribute('content')
    
    // 危険なCSPディレクティブをチェック
    const dangerousPatterns = [
      "'unsafe-inline'",
      "'unsafe-eval'",
      "data:",
      "*"
    ]
    
    dangerousPatterns.forEach(pattern => {
      if (cspContent.includes(pattern)) {
        this.addVulnerability('CSP', 'medium', `Potentially unsafe CSP directive: ${pattern}`, {
          csp: cspContent
        })
      }
    })
    
    // 必要なディレクティブの存在確認
    const requiredDirectives = ['default-src', 'script-src', 'style-src', 'img-src']
    requiredDirectives.forEach(directive => {
      if (!cspContent.includes(directive)) {
        this.addVulnerability('CSP', 'medium', `Missing CSP directive: ${directive}`, {
          csp: cspContent
        })
      }
    })
  }

  /**
   * HTTPS チェック
   */
  async checkHTTPS() {
    console.log('🔐 Checking HTTPS configuration...')
    
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      this.addVulnerability('HTTPS', 'critical', 'Site not served over HTTPS', {
        protocol: location.protocol,
        hostname: location.hostname
      })
    }
    
    // Mixed content チェック
    const resources = performance.getEntriesByType('resource')
    resources.forEach(resource => {
      if (resource.name.startsWith('http:') && location.protocol === 'https:') {
        this.addVulnerability('HTTPS', 'high', 'Mixed content detected', {
          resource: resource.name,
          type: resource.initiatorType
        })
      }
    })
    
    // Secure cookies チェック
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      if (cookie.trim() && !cookie.includes('Secure') && location.protocol === 'https:') {
        this.addVulnerability('HTTPS', 'medium', 'Cookie without Secure flag', {
          cookie: cookie.trim().split('=')[0]
        })
      }
    })
  }

  /**
   * 外部リソースチェック
   */
  async checkExternalResources() {
    console.log('🌐 Checking external resources...')
    
    // 外部スクリプトのチェック
    const scripts = document.querySelectorAll('script[src]')
    scripts.forEach(script => {
      const src = script.src
      if (src && !src.startsWith(location.origin)) {
        // integrity属性のチェック
        if (!script.integrity) {
          this.addVulnerability('External', 'high', 'External script without integrity check', {
            src: src,
            element: script
          })
        }
        
        // 信頼できないドメインのチェック
        if (this.isUntrustedDomain(src)) {
          this.addVulnerability('External', 'critical', 'Script from untrusted domain', {
            src: src,
            element: script
          })
        }
      }
    })
    
    // 外部スタイルシートのチェック
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"][href]')
    stylesheets.forEach(link => {
      const href = link.href
      if (href && !href.startsWith(location.origin)) {
        if (!link.integrity) {
          this.addVulnerability('External', 'medium', 'External stylesheet without integrity check', {
            href: href,
            element: link
          })
        }
      }
    })
    
    // 外部画像のチェック
    const images = document.querySelectorAll('img[src]')
    images.forEach(img => {
      const src = img.src
      if (src && !src.startsWith(location.origin) && !src.startsWith('data:')) {
        if (this.isUntrustedDomain(src)) {
          this.addVulnerability('External', 'low', 'Image from untrusted domain', {
            src: src,
            element: img
          })
        }
      }
    })
  }

  /**
   * Firebase セキュリティチェック
   */
  async checkFirebaseSecurity() {
    console.log('🔥 Checking Firebase security...')
    
    // Firebase設定の確認
    const firebaseConfig = this.getFirebaseConfig()
    if (firebaseConfig) {
      // APIキーの公開チェック
      if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza')) {
        console.warn('Firebase API key is exposed (this is normal for web apps)')
      }
      
      // プロジェクト設定の検証
      if (!firebaseConfig.authDomain || !firebaseConfig.projectId) {
        this.addVulnerability('Firebase', 'high', 'Incomplete Firebase configuration', {
          config: firebaseConfig
        })
      }
    }
    
    // セキュリティルールの推奨事項
    this.addFirebaseSecurityRecommendations()
  }

  /**
   * 認証・認可チェック
   */
  async checkAuthentication() {
    console.log('🔑 Checking authentication...')
    
    // セッション情報のチェック
    const sessionData = localStorage.getItem('movwise_session') || 
                       sessionStorage.getItem('movwise_session')
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        
        // セッション期限のチェック
        if (session.expiresAt) {
          const now = Date.now()
          const expiresAt = new Date(session.expiresAt).getTime()
          if (now > expiresAt) {
            this.addVulnerability('Auth', 'medium', 'Expired session detected', {
              expiresAt: session.expiresAt,
              now: new Date().toISOString()
            })
          }
        }
        
        // セッションIDの強度チェック
        if (session.sessionId && session.sessionId.length < 32) {
          this.addVulnerability('Auth', 'medium', 'Weak session ID', {
            length: session.sessionId.length
          })
        }
        
      } catch (error) {
        this.addVulnerability('Auth', 'high', 'Invalid session data format', {
          error: error.message
        })
      }
    }
    
    // ログイン状態のチェック
    this.checkLoginSecurity()
  }

  /**
   * セッション管理チェック
   */
  async checkSessionManagement() {
    console.log('📝 Checking session management...')
    
    // セッション固定攻撃の対策チェック
    const sessionKeys = ['sessionId', 'authToken', 'userId']
    sessionKeys.forEach(key => {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (value && value.length < 16) {
        this.addVulnerability('Session', 'medium', `Short session identifier: ${key}`, {
          key: key,
          length: value.length
        })
      }
    })
    
    // セッションタイムアウトのチェック
    this.checkSessionTimeout()
  }

  // === ヘルパーメソッド ===

  /**
   * 全テキストノードを取得
   */
  getAllTextNodes(element) {
    const textNodes = []
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )
    
    let node
    while (node = walker.nextNode()) {
      textNodes.push(node)
    }
    
    return textNodes
  }

  /**
   * 動的コンテンツ生成のチェック
   */
  checkDynamicContentGeneration() {
    // innerHTML使用の検出
    const originalInnerHTML = Element.prototype.innerHTML
    Element.prototype.innerHTML = function(value) {
      if (arguments.length > 0) {
        console.warn('innerHTML usage detected - potential XSS risk')
      }
      return originalInnerHTML.apply(this, arguments)
    }
  }

  /**
   * データの悪意あるコンテンツチェック
   */
  checkDataForMaliciousContent(data, source) {
    if (typeof data === 'object' && data !== null) {
      Object.values(data).forEach(value => {
        if (typeof value === 'string') {
          this.checkStringForMaliciousContent(value, source)
        } else if (typeof value === 'object') {
          this.checkDataForMaliciousContent(value, source)
        }
      })
    }
  }

  /**
   * 文字列の悪意あるコンテンツチェック
   */
  checkStringForMaliciousContent(str, source) {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /expression\s*\(/gi
    ]
    
    maliciousPatterns.forEach(pattern => {
      if (pattern.test(str)) {
        this.addVulnerability('DataSanitization', 'high', `Malicious content in ${source}`, {
          source: source,
          pattern: pattern.toString(),
          content: str.substring(0, 100)
        })
      }
    })
  }

  /**
   * パスワード強度チェック
   */
  checkPasswordStrength(password) {
    let score = 0
    const feedback = []
    
    // 長さチェック
    if (password.length >= 8) score++
    else feedback.push('At least 8 characters')
    
    // 小文字チェック
    if (/[a-z]/.test(password)) score++
    else feedback.push('Lowercase letters')
    
    // 大文字チェック
    if (/[A-Z]/.test(password)) score++
    else feedback.push('Uppercase letters')
    
    // 数字チェック
    if (/\d/.test(password)) score++
    else feedback.push('Numbers')
    
    // 特殊文字チェック
    if (/[^A-Za-z0-9]/.test(password)) score++
    else feedback.push('Special characters')
    
    return { score, feedback }
  }

  /**
   * ストレージ容量チェック
   */
  checkStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const usage = estimate.usage / 1024 / 1024 // MB
        const quota = estimate.quota / 1024 / 1024 // MB
        const percentage = (usage / quota) * 100
        
        if (percentage > 80) {
          this.addVulnerability('Storage', 'medium', 'High storage usage', {
            usage: usage.toFixed(2) + 'MB',
            quota: quota.toFixed(2) + 'MB',
            percentage: percentage.toFixed(1) + '%'
          })
        }
      })
    }
  }

  /**
   * 信頼できないドメインかチェック
   */
  isUntrustedDomain(url) {
    const trustedDomains = [
      'cdnjs.cloudflare.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ]
    
    try {
      const domain = new URL(url).hostname
      return !trustedDomains.includes(domain)
    } catch (error) {
      return true
    }
  }

  /**
   * Firebase設定を取得
   */
  getFirebaseConfig() {
    // グローバル変数やDOM要素から設定を取得
    if (window.firebaseConfig) {
      return window.firebaseConfig
    }
    
    const configScript = document.querySelector('script[data-firebase-config]')
    if (configScript) {
      try {
        return JSON.parse(configScript.textContent)
      } catch (error) {
        return null
      }
    }
    
    return null
  }

  /**
   * Firebaseセキュリティ推奨事項
   */
  addFirebaseSecurityRecommendations() {
    const recommendations = [
      {
        category: 'Firebase',
        priority: 'high',
        message: 'Firestore Security Rules: Ensure read/write permissions are properly restricted',
        details: 'Review rules in Firebase Console'
      },
      {
        category: 'Firebase',
        priority: 'medium',
        message: 'Authentication: Enable appropriate authentication providers only',
        details: 'Disable unused authentication methods'
      },
      {
        category: 'Firebase',
        priority: 'medium',
        message: 'API Usage: Monitor API usage and set appropriate quotas',
        details: 'Check Firebase Console for usage metrics'
      }
    ]
    
    recommendations.forEach(rec => {
      this.addVulnerability(rec.category, rec.priority, rec.message, rec.details)
    })
  }

  /**
   * ログインセキュリティチェック
   */
  checkLoginSecurity() {
    // ログインフォームのチェック
    const loginForms = document.querySelectorAll('form[data-login], form[data-auth]')
    loginForms.forEach(form => {
      const passwordInput = form.querySelector('input[type="password"]')
      if (passwordInput && !passwordInput.autocomplete) {
        this.addVulnerability('Auth', 'low', 'Password input without autocomplete attribute', {
          form: form,
          input: passwordInput
        })
      }
      
      // CSRF対策のチェック
      const csrfToken = form.querySelector('input[name="csrf_token"], input[name="_token"]')
      if (!csrfToken) {
        this.addVulnerability('Auth', 'high', 'Login form without CSRF protection', {
          form: form
        })
      }
    })
  }

  /**
   * セッションタイムアウトチェック
   */
  checkSessionTimeout() {
    const sessionStart = localStorage.getItem('session_start_time')
    if (sessionStart) {
      const now = Date.now()
      const startTime = parseInt(sessionStart)
      const sessionDuration = now - startTime
      const maxDuration = 24 * 60 * 60 * 1000 // 24時間
      
      if (sessionDuration > maxDuration) {
        this.addVulnerability('Session', 'medium', 'Long-running session detected', {
          duration: Math.round(sessionDuration / (60 * 60 * 1000)) + ' hours',
          maxDuration: '24 hours'
        })
      }
    }
  }

  /**
   * 脆弱性を追加
   */
  addVulnerability(category, severity, description, details = {}) {
    const vulnerability = {
      id: Date.now() + Math.random(),
      category,
      severity,
      description,
      details,
      timestamp: new Date().toISOString()
    }
    
    this.vulnerabilities.push(vulnerability)
    
    // セキュリティスコアの調整
    const scoreReduction = {
      critical: 20,
      high: 10,
      medium: 5,
      low: 2
    }
    
    this.securityScore = Math.max(0, this.securityScore - (scoreReduction[severity] || 0))
    
    console.log(`🚨 Security Issue [${severity}]: ${description}`)
  }

  /**
   * セキュリティレポートの生成
   */
  generateSecurityReport() {
    const report = {
      timestamp: this.lastScanTime,
      securityScore: this.securityScore,
      vulnerabilities: this.vulnerabilities,
      summary: this.generateSummary(),
      recommendations: this.generateSecurityRecommendations(),
      firebaseSecurityRules: this.generateFirebaseSecurityRules()
    }
    
    console.log('📊 Security Report:', report)
    return report
  }

  /**
   * サマリー生成
   */
  generateSummary() {
    const severityCounts = this.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1
      return acc
    }, {})
    
    return {
      totalVulnerabilities: this.vulnerabilities.length,
      severityCounts,
      riskLevel: this.getRiskLevel(),
      complianceStatus: this.getComplianceStatus()
    }
  }

  /**
   * リスクレベルの判定
   */
  getRiskLevel() {
    if (this.securityScore >= 90) return 'Low'
    if (this.securityScore >= 70) return 'Medium'
    if (this.securityScore >= 50) return 'High'
    return 'Critical'
  }

  /**
   * コンプライアンス状況の判定
   */
  getComplianceStatus() {
    const criticalVulns = this.vulnerabilities.filter(v => v.severity === 'critical')
    const highVulns = this.vulnerabilities.filter(v => v.severity === 'high')
    
    if (criticalVulns.length === 0 && highVulns.length === 0) {
      return 'Compliant'
    } else if (criticalVulns.length === 0) {
      return 'Minor Issues'
    } else {
      return 'Non-Compliant'
    }
  }

  /**
   * セキュリティ推奨事項の生成
   */
  generateSecurityRecommendations() {
    const recommendations = []
    
    // 重要度別の推奨事項
    const criticalVulns = this.vulnerabilities.filter(v => v.severity === 'critical')
    if (criticalVulns.length > 0) {
      recommendations.push({
        priority: 'immediate',
        title: '緊急対応が必要',
        description: 'クリティカルな脆弱性が発見されました。すぐに対応してください。',
        actions: criticalVulns.map(v => v.description)
      })
    }
    
    const highVulns = this.vulnerabilities.filter(v => v.severity === 'high')
    if (highVulns.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '高優先度の修正',
        description: '重要な脆弱性があります。計画的に対応してください。',
        actions: highVulns.map(v => v.description)
      })
    }
    
    // 一般的なセキュリティ改善提案
    recommendations.push({
      priority: 'general',
      title: '一般的なセキュリティ強化',
      description: 'セキュリティを向上させるための推奨事項',
      actions: [
        'Content Security Policy (CSP) の実装',
        'HTTPS の強制使用',
        'セキュアなCookie設定',
        '定期的なセキュリティ監査の実施',
        '依存関係の定期的な更新'
      ]
    })
    
    return recommendations
  }

  /**
   * Firebase セキュリティルールの生成
   */
  generateFirebaseSecurityRules() {
    return {
      firestore: {
        rules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Sessions require authentication
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Game data requires teacher or participant access
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'teacher' || 
         request.auth.uid in resource.data.participants);
    }
    
    // Emergency calls require authentication
    match /emergency_calls/{callId} {
      allow read, write: if request.auth != null;
    }
    
    // Analytics data is read-only for students
    match /analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role == 'teacher';
    }
  }
}`,
        explanation: 'これらのルールにより、ユーザーは自分のデータのみにアクセスでき、講師は追加の権限を持ちます。'
      },
      realtimeDatabase: {
        rules: `{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "sessions": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "games": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}`,
        explanation: 'Realtime Database用のセキュリティルール'
      }
    }
  }

  /**
   * セキュリティ設定の適用
   */
  applySecurityMeasures() {
    console.log('🔒 Applying security measures...')
    
    // CSP の設定
    this.setContentSecurityPolicy()
    
    // セキュアヘッダーの設定
    this.setSecurityHeaders()
    
    // 入力値サニタイゼーションの実装
    this.implementInputSanitization()
    
    // XSS 保護の実装
    this.implementXSSProtection()
    
    console.log('✅ Security measures applied')
  }

  /**
   * Content Security Policy の設定
   */
  setContentSecurityPolicy() {
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta')
      meta.httpEquiv = 'Content-Security-Policy'
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebaseapp.com https://*.firebaseio.com"
      document.head.appendChild(meta)
      console.log('🛡️ CSP header added')
    }
  }

  /**
   * セキュリティヘッダーの設定
   */
  setSecurityHeaders() {
    // X-Content-Type-Options
    const nosniff = document.createElement('meta')
    nosniff.httpEquiv = 'X-Content-Type-Options'
    nosniff.content = 'nosniff'
    document.head.appendChild(nosniff)
    
    // X-Frame-Options
    const frameOptions = document.createElement('meta')
    frameOptions.httpEquiv = 'X-Frame-Options'
    frameOptions.content = 'DENY'
    document.head.appendChild(frameOptions)
    
    console.log('🔒 Security headers added')
  }

  /**
   * 入力値サニタイゼーションの実装
   */
  implementInputSanitization() {
    // DOMPurify のような機能を簡易実装
    window.sanitizeHTML = function(dirty) {
      const div = document.createElement('div')
      div.textContent = dirty
      return div.innerHTML
    }
    
    console.log('🧼 Input sanitization implemented')
  }

  /**
   * XSS 保護の実装
   */
  implementXSSProtection() {
    // 危険な要素の監視
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // script タグの動的追加を検出
            if (node.tagName === 'SCRIPT') {
              console.warn('Dynamic script injection detected')
            }
            
            // インラインイベントハンドラーを検出
            for (const attr of node.attributes || []) {
              if (attr.name.startsWith('on')) {
                console.warn('Inline event handler detected:', attr.name)
              }
            }
          }
        })
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })
    
    console.log('🛡️ XSS protection implemented')
  }
}

// シングルトンインスタンス
const securityChecker = new SecurityChecker()

export default securityChecker
export { SecurityChecker }