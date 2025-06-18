// Comprehensive error handling system for MovWISE cooperative learning
export class ErrorHandler {
  constructor() {
    this.errors = []
    this.errorCallbacks = []
    this.maxErrors = 100 // Keep last 100 errors
    this.criticalErrors = []
  }

  // Error types
  static ERROR_TYPES = {
    AUTHENTICATION: 'authentication',
    NETWORK: 'network',
    FIREBASE: 'firebase',
    PERMISSION: 'permission',
    SESSION: 'session',
    GAME: 'game',
    VALIDATION: 'validation',
    UNKNOWN: 'unknown'
  }

  // Error severity levels
  static SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }

  // Initialize error handling
  initialize() {
    // Set up global error handlers
    this.setupGlobalHandlers()
    console.log('Error handler initialized')
  }

  // Set up global error handlers
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: ErrorHandler.ERROR_TYPES.UNKNOWN,
        severity: ErrorHandler.SEVERITY.HIGH,
        message: 'Unhandled promise rejection',
        details: event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      })
    })

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: ErrorHandler.ERROR_TYPES.UNKNOWN,
        severity: ErrorHandler.SEVERITY.MEDIUM,
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      })
    })
  }

  // Main error handling method
  handleError(errorInfo) {
    const error = this.normalizeError(errorInfo)
    
    // Add to error list
    this.errors.unshift(error)
    if (this.errors.length > this.maxErrors) {
      this.errors.pop()
    }

    // Handle critical errors separately
    if (error.severity === ErrorHandler.SEVERITY.CRITICAL) {
      this.criticalErrors.unshift(error)
      this.handleCriticalError(error)
    }

    // Log error
    this.logError(error)

    // Notify callbacks
    this.notifyCallbacks(error)

    // Return error for chaining
    return error
  }

  // Normalize error object
  normalizeError(errorInfo) {
    // If it's already a normalized error, return as is
    if (errorInfo.id && errorInfo.type && errorInfo.severity) {
      return errorInfo
    }

    // Create normalized error object
    const error = {
      id: this.generateErrorId(),
      type: errorInfo.type || ErrorHandler.ERROR_TYPES.UNKNOWN,
      severity: errorInfo.severity || ErrorHandler.SEVERITY.MEDIUM,
      message: errorInfo.message || 'Unknown error occurred',
      details: errorInfo.details || errorInfo,
      stack: errorInfo.stack || (new Error()).stack,
      timestamp: errorInfo.timestamp || new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    }

    return error
  }

  // Generate unique error ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get current user ID for context
  getCurrentUserId() {
    try {
      // Try to get from auth service
      const authService = window.authService || globalThis.authService
      return authService?.getCurrentUser()?.uid || 'anonymous'
    } catch {
      return 'anonymous'
    }
  }

  // Handle critical errors
  handleCriticalError(error) {
    console.error('CRITICAL ERROR:', error)
    
    // Could send to external error reporting service
    this.reportCriticalError(error)
    
    // Show user notification for critical errors
    this.showCriticalErrorNotification(error)
  }

  // Report critical error to external service
  async reportCriticalError(error) {
    try {
      // In a real implementation, this would send to an error reporting service
      console.log('Reporting critical error to external service:', error)
      
      // Example: Send to Firebase, Sentry, or custom endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // })
      
    } catch (reportError) {
      console.error('Failed to report critical error:', reportError)
    }
  }

  // Show critical error notification to user
  showCriticalErrorNotification(error) {
    // This would integrate with your notification system
    console.warn('Critical error notification:', error.message)
  }

  // Log error appropriately
  logError(error) {
    const logMethod = this.getLogMethod(error.severity)
    logMethod(`[${error.type.toUpperCase()}] ${error.message}`, error)
  }

  // Get appropriate log method based on severity
  getLogMethod(severity) {
    switch (severity) {
      case ErrorHandler.SEVERITY.CRITICAL:
      case ErrorHandler.SEVERITY.HIGH:
        return console.error
      case ErrorHandler.SEVERITY.MEDIUM:
        return console.warn
      case ErrorHandler.SEVERITY.LOW:
      default:
        return console.log
    }
  }

  // Specific error handling methods
  
  // Authentication errors
  handleAuthError(error, context = {}) {
    return this.handleError({
      type: ErrorHandler.ERROR_TYPES.AUTHENTICATION,
      severity: ErrorHandler.SEVERITY.HIGH,
      message: this.getAuthErrorMessage(error),
      details: { ...error, context },
      timestamp: new Date().toISOString()
    })
  }

  getAuthErrorMessage(error) {
    const errorMessages = {
      'auth/user-not-found': 'ユーザーが見つかりません',
      'auth/wrong-password': 'パスワードが間違っています',
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
      'auth/weak-password': 'パスワードが弱すぎます',
      'auth/invalid-email': 'メールアドレスの形式が正しくありません',
      'auth/network-request-failed': 'ネットワークエラーが発生しました',
      'auth/too-many-requests': 'リクエストが多すぎます。しばらく待ってから再試行してください'
    }

    return errorMessages[error.code] || error.message || '認証エラーが発生しました'
  }

  // Network errors
  handleNetworkError(error, context = {}) {
    return this.handleError({
      type: ErrorHandler.ERROR_TYPES.NETWORK,
      severity: ErrorHandler.SEVERITY.MEDIUM,
      message: 'ネットワークエラーが発生しました',
      details: { ...error, context },
      timestamp: new Date().toISOString()
    })
  }

  // Firebase errors
  handleFirebaseError(error, context = {}) {
    const severity = this.getFirebaseErrorSeverity(error)
    
    return this.handleError({
      type: ErrorHandler.ERROR_TYPES.FIREBASE,
      severity: severity,
      message: this.getFirebaseErrorMessage(error),
      details: { ...error, context },
      timestamp: new Date().toISOString()
    })
  }

  getFirebaseErrorSeverity(error) {
    const criticalCodes = ['permission-denied', 'unavailable']
    return criticalCodes.includes(error.code) ? 
      ErrorHandler.SEVERITY.CRITICAL : 
      ErrorHandler.SEVERITY.MEDIUM
  }

  getFirebaseErrorMessage(error) {
    const errorMessages = {
      'permission-denied': 'アクセス権限がありません',
      'unavailable': 'サービスが一時的に利用できません',
      'cancelled': '操作がキャンセルされました',
      'data-loss': 'データが失われました',
      'deadline-exceeded': 'リクエストがタイムアウトしました'
    }

    return errorMessages[error.code] || error.message || 'Firebase エラーが発生しました'
  }

  // Permission errors
  handlePermissionError(action, context = {}) {
    return this.handleError({
      type: ErrorHandler.ERROR_TYPES.PERMISSION,
      severity: ErrorHandler.SEVERITY.MEDIUM,
      message: `権限エラー: ${action} を実行する権限がありません`,
      details: { action, context },
      timestamp: new Date().toISOString()
    })
  }

  // Session errors
  handleSessionError(error, sessionId, context = {}) {
    return this.handleError({
      type: ErrorHandler.ERROR_TYPES.SESSION,
      severity: ErrorHandler.SEVERITY.HIGH,
      message: this.getSessionErrorMessage(error),
      details: { ...error, sessionId, context },
      timestamp: new Date().toISOString()
    })
  }

  getSessionErrorMessage(error) {
    const errorMessages = {
      'session-not-found': 'セッションが見つかりません',
      'session-full': 'セッションが満員です',
      'session-ended': 'セッションが終了しています',
      'connection-lost': 'セッションとの接続が失われました'
    }

    return errorMessages[error.code] || error.message || 'セッションエラーが発生しました'
  }

  // Game errors
  handleGameError(error, gameType, context = {}) {
    return this.handleError({
      type: ErrorHandler.ERROR_TYPES.GAME,
      severity: ErrorHandler.SEVERITY.LOW,
      message: `ゲームエラー: ${error.message || '不明なエラー'}`,
      details: { ...error, gameType, context },
      timestamp: new Date().toISOString()
    })
  }

  // Validation errors
  handleValidationError(field, value, rule, context = {}) {
    return this.handleError({
      type: ErrorHandler.ERROR_TYPES.VALIDATION,
      severity: ErrorHandler.SEVERITY.LOW,
      message: `入力検証エラー: ${field} の値が無効です`,
      details: { field, value, rule, context },
      timestamp: new Date().toISOString()
    })
  }

  // Error callback management
  onError(callback) {
    this.errorCallbacks.push(callback)
    
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
  }

  notifyCallbacks(error) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    })
  }

  // Utility methods
  getErrors(type = null, severity = null) {
    let filteredErrors = this.errors

    if (type) {
      filteredErrors = filteredErrors.filter(error => error.type === type)
    }

    if (severity) {
      filteredErrors = filteredErrors.filter(error => error.severity === severity)
    }

    return filteredErrors
  }

  getCriticalErrors() {
    return [...this.criticalErrors]
  }

  clearErrors() {
    this.errors = []
    this.criticalErrors = []
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      critical: this.criticalErrors.length,
      byType: {},
      bySeverity: {},
      recent: this.errors.slice(0, 10)
    }

    // Count by type
    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
    })

    // Count by severity
    this.errors.forEach(error => {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })

    return stats
  }

  // Recovery methods
  async attemptRecovery(error) {
    console.log('Attempting recovery for error:', error.id)

    switch (error.type) {
      case ErrorHandler.ERROR_TYPES.NETWORK:
        return await this.recoverFromNetworkError(error)
      case ErrorHandler.ERROR_TYPES.FIREBASE:
        return await this.recoverFromFirebaseError(error)
      case ErrorHandler.ERROR_TYPES.SESSION:
        return await this.recoverFromSessionError(error)
      default:
        return false
    }
  }

  async recoverFromNetworkError(error) {
    // Try to reconnect
    if (navigator.onLine) {
      console.log('Network appears to be available, attempting reconnect...')
      return true
    }
    return false
  }

  async recoverFromFirebaseError(error) {
    // Try Firebase reconnection
    console.log('Attempting Firebase reconnection...')
    return false // Implement specific recovery logic
  }

  async recoverFromSessionError(error) {
    // Try to rejoin session or create new one
    console.log('Attempting session recovery...')
    return false // Implement specific recovery logic
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

// Auto-initialize
if (typeof window !== 'undefined') {
  errorHandler.initialize()
}

// Export error types and severity for use in other modules
export const { ERROR_TYPES, SEVERITY } = ErrorHandler