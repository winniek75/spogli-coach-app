import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
  // 基本接続状態
  const isOnline = ref(navigator.onLine)
  const firebaseConnected = ref(true)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = ref(5)
  const reconnectDelay = ref(1000) // 初期遅延: 1秒
  const isReconnecting = ref(false)

  // エラー管理
  const lastError = ref(null)
  const errorHistory = ref([])
  const criticalErrors = ref([])

  // ゲーム状態バックアップ
  const gameStateBackup = ref(null)
  const lastBackupTime = ref(null)
  const autoBackupEnabled = ref(true)

  // 接続品質監視
  const connectionQuality = ref('excellent') // excellent, good, poor, critical
  const latency = ref(0)
  const packetLoss = ref(0)

  // 計算プロパティ
  const isFullyConnected = computed(() => isOnline.value && firebaseConnected.value)
  const canUseCooperativeMode = computed(() => isFullyConnected.value && connectionQuality.value !== 'critical')
  const shouldShowOfflineMode = computed(() => !isOnline.value || !firebaseConnected.value)
  const reconnectProgress = computed(() => {
    if (!isReconnecting.value) return 0
    return Math.min((reconnectAttempts.value / maxReconnectAttempts.value) * 100, 100)
  })

  // 接続状態監視の開始
  const startConnectionMonitoring = () => {
    console.log('🛰️ Starting connection monitoring...')

    // ブラウザのオンライン/オフライン監視
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 定期的な接続品質チェック
    startConnectionQualityCheck()

    // Firebase接続監視（模擬）
    startFirebaseConnectionMonitoring()
  }

  // ブラウザオンライン状態変更
  const handleOnline = () => {
    console.log('🌐 Browser back online')
    isOnline.value = true
    
    if (!firebaseConnected.value) {
      attemptReconnection()
    }

    addToHistory('network_restored', 'ネットワーク接続が復旧しました', 'info')
  }

  const handleOffline = () => {
    console.log('📡 Browser went offline')
    isOnline.value = false
    firebaseConnected.value = false
    connectionQuality.value = 'critical'
    
    addToHistory('network_lost', 'ネットワーク接続が失われました', 'warning')
    
    // ゲーム状態の緊急バックアップ
    if (autoBackupEnabled.value) {
      createEmergencyBackup()
    }
  }

  // Firebase接続監視（模擬）
  const startFirebaseConnectionMonitoring = () => {
    setInterval(() => {
      if (isOnline.value) {
        checkFirebaseConnection()
      }
    }, 10000) // 10秒ごと
  }

  const checkFirebaseConnection = async () => {
    try {
      // 実際のプロジェクトではFirebaseのリアルタイム接続をチェック
      const isConnected = await simulateFirebaseCheck()
      
      if (!isConnected && firebaseConnected.value) {
        handleFirebaseDisconnection()
      } else if (isConnected && !firebaseConnected.value) {
        handleFirebaseReconnection()
      }
      
      firebaseConnected.value = isConnected
    } catch (error) {
      console.error('Firebase connection check failed:', error)
      handleFirebaseError(error)
    }
  }

  // Firebase接続チェックのシミュレーション
  const simulateFirebaseCheck = () => {
    return new Promise((resolve) => {
      // ランダムに接続状態をシミュレート（実際のプロジェクトでは実際のFirebase接続をチェック）
      const isConnected = Math.random() > 0.05 // 95%の確率で接続
      setTimeout(() => resolve(isConnected), 100)
    })
  }

  const handleFirebaseDisconnection = () => {
    console.log('🔥 Firebase connection lost')
    firebaseConnected.value = false
    addToHistory('firebase_disconnected', 'サーバーとの接続が切断されました', 'error')
    
    if (autoBackupEnabled.value) {
      createEmergencyBackup()
    }
    
    attemptReconnection()
  }

  const handleFirebaseReconnection = () => {
    console.log('🔥 Firebase connection restored')
    firebaseConnected.value = true
    reconnectAttempts.value = 0
    isReconnecting.value = false
    
    addToHistory('firebase_reconnected', 'サーバーとの接続が復旧しました', 'success')
    
    // 状態復元の試行
    if (gameStateBackup.value) {
      attemptStateRestore()
    }
  }

  const handleFirebaseError = (error) => {
    const errorInfo = {
      type: 'firebase_error',
      message: error.message || 'Firebase接続エラー',
      timestamp: new Date(),
      details: error
    }
    
    lastError.value = errorInfo
    criticalErrors.value.push(errorInfo)
    addToHistory('firebase_error', errorInfo.message, 'error')
  }

  // 自動再接続処理
  const attemptReconnection = () => {
    if (isReconnecting.value || reconnectAttempts.value >= maxReconnectAttempts.value) {
      return
    }

    isReconnecting.value = true
    reconnectAttempts.value++

    console.log(`🔄 Attempting reconnection (${reconnectAttempts.value}/${maxReconnectAttempts.value})`)

    const delay = Math.min(reconnectDelay.value * Math.pow(2, reconnectAttempts.value - 1), 30000) // 最大30秒

    setTimeout(async () => {
      try {
        if (isOnline.value) {
          const connected = await simulateFirebaseCheck()
          
          if (connected) {
            handleFirebaseReconnection()
          } else {
            // 再試行
            isReconnecting.value = false
            if (reconnectAttempts.value < maxReconnectAttempts.value) {
              setTimeout(() => attemptReconnection(), 2000)
            } else {
              handleReconnectionFailure()
            }
          }
        } else {
          isReconnecting.value = false
        }
      } catch (error) {
        console.error('Reconnection attempt failed:', error)
        isReconnecting.value = false
        handleFirebaseError(error)
      }
    }, delay)
  }

  const handleReconnectionFailure = () => {
    console.error('❌ All reconnection attempts failed')
    isReconnecting.value = false
    
    addToHistory('reconnection_failed', '自動再接続に失敗しました。手動で再試行してください。', 'error')
    
    // 重要なエラーとして記録
    const criticalError = {
      type: 'reconnection_failure',
      message: '自動再接続に失敗しました',
      timestamp: new Date(),
      attempts: reconnectAttempts.value
    }
    
    criticalErrors.value.push(criticalError)
    lastError.value = criticalError
  }

  // 手動再接続
  const manualReconnect = async () => {
    console.log('🔄 Manual reconnection initiated')
    reconnectAttempts.value = 0
    isReconnecting.value = false
    
    if (isOnline.value) {
      attemptReconnection()
    } else {
      addToHistory('manual_reconnect_failed', 'ネットワーク接続を確認してください', 'warning')
    }
  }

  // 接続品質監視
  const startConnectionQualityCheck = () => {
    setInterval(() => {
      if (isOnline.value && firebaseConnected.value) {
        checkConnectionQuality()
      }
    }, 5000) // 5秒ごと
  }

  const checkConnectionQuality = async () => {
    try {
      const startTime = performance.now()
      
      // 簡単な接続テスト（実際のプロジェクトではping相当の処理）
      await simulateLatencyTest()
      
      const endTime = performance.now()
      latency.value = Math.round(endTime - startTime)
      
      // 接続品質の判定
      if (latency.value < 100) {
        connectionQuality.value = 'excellent'
      } else if (latency.value < 300) {
        connectionQuality.value = 'good'
      } else if (latency.value < 1000) {
        connectionQuality.value = 'poor'
      } else {
        connectionQuality.value = 'critical'
      }
      
    } catch (error) {
      connectionQuality.value = 'critical'
      console.error('Connection quality check failed:', error)
    }
  }

  const simulateLatencyTest = () => {
    return new Promise((resolve) => {
      // 実際のプロジェクトでは小さなHTTPリクエストまたはWebSocket pingを使用
      const simulatedLatency = Math.random() * 500 // 0-500ms
      setTimeout(resolve, simulatedLatency)
    })
  }

  // ゲーム状態管理
  const saveGameState = (gameState) => {
    try {
      const stateToSave = {
        ...gameState,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
      
      gameStateBackup.value = stateToSave
      lastBackupTime.value = new Date()
      
      // LocalStorageにも保存
      localStorage.setItem('movwise_game_state_backup', JSON.stringify(stateToSave))
      
      console.log('💾 Game state saved successfully')
      return true
    } catch (error) {
      console.error('Failed to save game state:', error)
      addToHistory('backup_failed', 'ゲーム状態の保存に失敗しました', 'error')
      return false
    }
  }

  const restoreGameState = () => {
    try {
      // メモリから復元を試行
      if (gameStateBackup.value) {
        console.log('🔄 Restoring game state from memory')
        return gameStateBackup.value
      }
      
      // LocalStorageから復元を試行
      const savedState = localStorage.getItem('movwise_game_state_backup')
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        gameStateBackup.value = parsedState
        console.log('🔄 Restoring game state from localStorage')
        return parsedState
      }
      
      console.log('📭 No saved game state found')
      return null
    } catch (error) {
      console.error('Failed to restore game state:', error)
      addToHistory('restore_failed', 'ゲーム状態の復元に失敗しました', 'error')
      return null
    }
  }

  const createEmergencyBackup = () => {
    // 現在のゲーム状態を緊急バックアップ
    const currentState = getCurrentGameState()
    if (currentState) {
      saveGameState(currentState)
      addToHistory('emergency_backup', '緊急バックアップを作成しました', 'info')
    }
  }

  const getCurrentGameState = () => {
    // 実際のプロジェクトでは各ゲームコンポーネントから状態を収集
    // ここでは簡単な例を示す
    return {
      currentGame: 'co-pilot-dock',
      progress: 75,
      score: 1500,
      level: 3,
      playTime: 600,
      collaborativeSession: {
        partnerId: 'teacher_001',
        sessionId: 'session_123',
        startTime: new Date().toISOString()
      }
    }
  }

  const attemptStateRestore = () => {
    const savedState = restoreGameState()
    if (savedState) {
      addToHistory('state_restored', 'ゲーム状態を復元しました', 'success')
      // 実際のプロジェクトでは各ゲームコンポーネントに状態を復元
      return savedState
    }
    return null
  }

  // エラー履歴管理
  const addToHistory = (type, message, severity = 'info') => {
    const entry = {
      id: Date.now() + Math.random(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      isRead: false
    }
    
    errorHistory.value.unshift(entry)
    
    // 履歴を最新50件に制限
    if (errorHistory.value.length > 50) {
      errorHistory.value = errorHistory.value.slice(0, 50)
    }
    
    console.log(`📝 ${severity.toUpperCase()}: ${message}`)
  }

  const clearHistory = () => {
    errorHistory.value = []
    criticalErrors.value = []
  }

  const markAsRead = (entryId) => {
    const entry = errorHistory.value.find(e => e.id === entryId)
    if (entry) {
      entry.isRead = true
    }
  }

  // 設定管理
  const updateSettings = (newSettings) => {
    if (newSettings.autoBackupEnabled !== undefined) {
      autoBackupEnabled.value = newSettings.autoBackupEnabled
    }
    if (newSettings.maxReconnectAttempts !== undefined) {
      maxReconnectAttempts.value = newSettings.maxReconnectAttempts
    }
    if (newSettings.reconnectDelay !== undefined) {
      reconnectDelay.value = newSettings.reconnectDelay
    }
  }

  // リセット機能
  const resetConnection = () => {
    reconnectAttempts.value = 0
    isReconnecting.value = false
    lastError.value = null
    connectionQuality.value = 'excellent'
    latency.value = 0
    
    // 接続状態を再チェック
    checkFirebaseConnection()
  }

  const clearBackup = () => {
    gameStateBackup.value = null
    lastBackupTime.value = null
    localStorage.removeItem('movwise_game_state_backup')
    addToHistory('backup_cleared', 'バックアップデータをクリアしました', 'info')
  }

  // クリーンアップ
  const stopConnectionMonitoring = () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }

  return {
    // 状態
    isOnline,
    firebaseConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    isReconnecting,
    lastError,
    errorHistory,
    criticalErrors,
    gameStateBackup,
    lastBackupTime,
    autoBackupEnabled,
    connectionQuality,
    latency,
    packetLoss,
    
    // 計算プロパティ
    isFullyConnected,
    canUseCooperativeMode,
    shouldShowOfflineMode,
    reconnectProgress,
    
    // アクション
    startConnectionMonitoring,
    stopConnectionMonitoring,
    manualReconnect,
    saveGameState,
    restoreGameState,
    createEmergencyBackup,
    attemptStateRestore,
    addToHistory,
    clearHistory,
    markAsRead,
    updateSettings,
    resetConnection,
    clearBackup,
    
    // 内部メソッド（テスト用）
    handleOnline,
    handleOffline,
    checkFirebaseConnection,
    checkConnectionQuality
  }
})