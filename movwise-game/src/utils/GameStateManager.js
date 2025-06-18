/**
 * MovWISE Game State Manager
 * ゲーム状態の保存・復元・管理システム
 */

class GameStateManager {
  constructor() {
    this.storageKey = 'movwise_game_states'
    this.backupKey = 'movwise_backup_states' 
    this.maxStates = 10 // 最大保存状態数
    this.autoSaveInterval = null
    this.autoSaveEnabled = true
    this.listeners = new Map()
    
    console.log('🎮 GameStateManager initialized')
    this.initializeStorage()
  }

  /**
   * ストレージの初期化
   */
  initializeStorage() {
    try {
      if (!localStorage.getItem(this.storageKey)) {
        localStorage.setItem(this.storageKey, JSON.stringify([]))
      }
      if (!localStorage.getItem(this.backupKey)) {
        localStorage.setItem(this.backupKey, JSON.stringify([]))
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error)
    }
  }

  /**
   * ゲーム状態を保存
   * @param {Object} gameState - 保存するゲーム状態
   * @param {Object} options - オプション設定
   * @returns {Promise<boolean>} 保存成功可否
   */
  async saveGameState(gameState, options = {}) {
    try {
      const {
        gameId = 'default',
        sessionId = this.generateSessionId(),
        isAutoSave = false,
        priority = 'normal', // normal, high, critical
        metadata = {}
      } = options

      // ゲーム状態の検証
      const validatedState = this.validateGameState(gameState)
      if (!validatedState.isValid) {
        throw new Error(`Invalid game state: ${validatedState.errors.join(', ')}`)
      }

      // 保存データの構築
      const saveData = {
        id: sessionId,
        gameId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        isAutoSave,
        priority,
        metadata: {
          userAgent: navigator.userAgent,
          gameVersion: metadata.gameVersion || '1.0.0',
          platform: this.detectPlatform(),
          connectionStatus: metadata.connectionStatus || 'unknown',
          ...metadata
        },
        gameState: this.deepClone(gameState),
        checksum: await this.generateChecksum(gameState)
      }

      // 暗号化（オプション）
      if (options.encrypt) {
        saveData.gameState = await this.encryptData(saveData.gameState)
        saveData.encrypted = true
      }

      // 既存状態を取得
      const savedStates = this.getSavedStates()
      
      // 重複チェック
      const existingIndex = savedStates.findIndex(state => 
        state.gameId === gameId && 
        state.id === sessionId
      )

      if (existingIndex !== -1) {
        // 既存状態を更新
        savedStates[existingIndex] = saveData
        console.log(`🔄 Updated existing game state: ${gameId}:${sessionId}`)
      } else {
        // 新しい状態を追加
        savedStates.unshift(saveData)
        console.log(`💾 Saved new game state: ${gameId}:${sessionId}`)
      }

      // 最大数を超えた古い状態を削除
      if (savedStates.length > this.maxStates) {
        const removed = savedStates.splice(this.maxStates)
        console.log(`🗑️ Removed ${removed.length} old save states`)
      }

      // ストレージに保存
      localStorage.setItem(this.storageKey, JSON.stringify(savedStates))
      
      // バックアップも作成
      if (priority === 'critical' || Math.random() < 0.1) {
        this.createBackup(saveData)
      }

      // リスナーに通知
      this.emit('stateSaved', { saveData, gameId, sessionId })

      return true

    } catch (error) {
      console.error('Failed to save game state:', error)
      this.emit('saveError', { error, gameState, options })
      return false
    }
  }

  /**
   * ゲーム状態を復元
   * @param {string} gameId - ゲームID
   * @param {string} sessionId - セッションID
   * @param {Object} options - 復元オプション
   * @returns {Promise<Object|null>} 復元されたゲーム状態
   */
  async restoreGameState(gameId, sessionId = null, options = {}) {
    try {
      const savedStates = this.getSavedStates()
      
      let targetState = null
      
      if (sessionId) {
        // 特定のセッションを復元
        targetState = savedStates.find(state => 
          state.gameId === gameId && state.id === sessionId
        )
      } else {
        // 最新の状態を復元
        targetState = savedStates.find(state => state.gameId === gameId)
      }

      if (!targetState) {
        console.log(`📭 No saved state found for game: ${gameId}`)
        return null
      }

      // チェックサム検証
      if (targetState.checksum) {
        const isValid = await this.verifyChecksum(targetState.gameState, targetState.checksum)
        if (!isValid) {
          console.warn('⚠️ Checksum verification failed, state may be corrupted')
          if (!options.allowCorrupted) {
            throw new Error('Game state checksum verification failed')
          }
        }
      }

      // 復号化（必要な場合）
      let gameState = targetState.gameState
      if (targetState.encrypted) {
        gameState = await this.decryptData(gameState)
      }

      // 深いクローンで返す
      const restoredState = this.deepClone(gameState)
      
      console.log(`🔄 Restored game state: ${gameId} from ${targetState.timestamp}`)
      
      // リスナーに通知
      this.emit('stateRestored', { 
        gameState: restoredState, 
        metadata: targetState.metadata,
        gameId, 
        sessionId: targetState.id 
      })

      return restoredState

    } catch (error) {
      console.error('Failed to restore game state:', error)
      this.emit('restoreError', { error, gameId, sessionId })
      
      // バックアップからの復元を試行
      if (options.tryBackup !== false) {
        console.log('🔄 Attempting backup restoration...')
        return this.restoreFromBackup(gameId, sessionId)
      }
      
      return null
    }
  }

  /**
   * 保存された状態一覧を取得
   * @param {string} gameId - ゲームID（省略時は全て）
   * @returns {Array} 保存状態一覧
   */
  getSavedStates(gameId = null) {
    try {
      const savedStates = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
      
      if (gameId) {
        return savedStates.filter(state => state.gameId === gameId)
      }
      
      return savedStates
    } catch (error) {
      console.error('Failed to get saved states:', error)
      return []
    }
  }

  /**
   * 特定のゲーム状態を削除
   * @param {string} gameId - ゲームID
   * @param {string} sessionId - セッションID
   * @returns {boolean} 削除成功可否
   */
  deleteGameState(gameId, sessionId = null) {
    try {
      const savedStates = this.getSavedStates()
      
      let newStates
      if (sessionId) {
        // 特定のセッションを削除
        newStates = savedStates.filter(state => 
          !(state.gameId === gameId && state.id === sessionId)
        )
      } else {
        // ゲームの全状態を削除
        newStates = savedStates.filter(state => state.gameId !== gameId)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(newStates))
      
      const deletedCount = savedStates.length - newStates.length
      console.log(`🗑️ Deleted ${deletedCount} game state(s) for ${gameId}`)
      
      this.emit('stateDeleted', { gameId, sessionId, deletedCount })
      
      return deletedCount > 0

    } catch (error) {
      console.error('Failed to delete game state:', error)
      return false
    }
  }

  /**
   * 自動保存を開始
   * @param {Function} getGameStateFunc - ゲーム状態取得関数
   * @param {Object} options - 自動保存オプション
   */
  startAutoSave(getGameStateFunc, options = {}) {
    const {
      interval = 30000, // 30秒
      gameId = 'default',
      condition = null // 保存条件関数
    } = options

    if (this.autoSaveInterval) {
      this.stopAutoSave()
    }

    console.log(`⏰ Starting auto-save for ${gameId} (interval: ${interval}ms)`)
    
    this.autoSaveInterval = setInterval(async () => {
      try {
        const gameState = await getGameStateFunc()
        
        // 保存条件をチェック
        if (condition && !condition(gameState)) {
          return
        }

        // 前回の自動保存と同じ場合はスキップ
        if (this.isSameAsLastSave(gameState, gameId)) {
          return
        }

        await this.saveGameState(gameState, {
          gameId,
          isAutoSave: true,
          priority: 'normal',
          sessionId: `auto_${Date.now()}`
        })

      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, interval)

    this.autoSaveEnabled = true
  }

  /**
   * 自動保存を停止
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
      console.log('⏰ Auto-save stopped')
    }
    this.autoSaveEnabled = false
  }

  /**
   * 緊急バックアップ作成
   * @param {Object} gameState - ゲーム状態
   * @param {string} reason - バックアップ理由
   */
  createEmergencyBackup(gameState, reason = 'emergency') {
    try {
      const backupData = {
        id: `emergency_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reason,
        gameState: this.deepClone(gameState),
        metadata: {
          userAgent: navigator.userAgent,
          connectionStatus: navigator.onLine ? 'online' : 'offline',
          url: window.location.href
        }
      }

      const backups = this.getBackups()
      backups.unshift(backupData)

      // 最大10件のバックアップを保持
      if (backups.length > 10) {
        backups.splice(10)
      }

      localStorage.setItem(this.backupKey, JSON.stringify(backups))
      
      console.log(`🆘 Emergency backup created: ${reason}`)
      this.emit('emergencyBackup', backupData)

      return backupData.id

    } catch (error) {
      console.error('Failed to create emergency backup:', error)
      return null
    }
  }

  /**
   * バックアップから復元
   * @param {string} gameId - ゲームID
   * @param {string} sessionId - セッションID
   * @returns {Object|null} 復元されたゲーム状態
   */
  restoreFromBackup(gameId, sessionId = null) {
    try {
      const backups = this.getBackups()
      
      if (backups.length === 0) {
        console.log('📭 No backups available')
        return null
      }

      // 最新のバックアップを使用
      const latestBackup = backups[0]
      const restoredState = this.deepClone(latestBackup.gameState)
      
      console.log(`🔄 Restored from backup: ${latestBackup.id}`)
      this.emit('backupRestored', { gameState: restoredState, backup: latestBackup })
      
      return restoredState

    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return null
    }
  }

  /**
   * ストレージをクリア
   * @param {boolean} includeBackups - バックアップも削除するか
   */
  clearStorage(includeBackups = false) {
    try {
      localStorage.removeItem(this.storageKey)
      
      if (includeBackups) {
        localStorage.removeItem(this.backupKey)
      }
      
      console.log('🗑️ Game state storage cleared')
      this.emit('storageCleared', { includeBackups })

    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  /**
   * ストレージ使用量を取得
   * @returns {Object} ストレージ情報
   */
  getStorageInfo() {
    try {
      const states = localStorage.getItem(this.storageKey) || '[]'
      const backups = localStorage.getItem(this.backupKey) || '[]'
      
      return {
        statesSize: new Blob([states]).size,
        backupsSize: new Blob([backups]).size,
        totalSize: new Blob([states, backups]).size,
        statesCount: JSON.parse(states).length,
        backupsCount: JSON.parse(backups).length,
        lastUpdate: this.getLastUpdateTime()
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return null
    }
  }

  /**
   * イベントリスナーを追加
   * @param {string} event - イベント名
   * @param {Function} callback - コールバック関数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * イベントリスナーを削除
   * @param {string} event - イベント名
   * @param {Function} callback - コールバック関数
   */
  off(event, callback) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index !== -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * イベントを発火
   * @param {string} event - イベント名
   * @param {Object} data - イベントデータ
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // === プライベートメソッド ===

  /**
   * セッションIDを生成
   * @returns {string} セッションID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * ゲーム状態を検証
   * @param {Object} gameState - ゲーム状態
   * @returns {Object} 検証結果
   */
  validateGameState(gameState) {
    const errors = []

    if (!gameState || typeof gameState !== 'object') {
      errors.push('Game state must be an object')
    }

    // 循環参照チェック
    try {
      JSON.stringify(gameState)
    } catch (error) {
      errors.push('Game state contains circular references')
    }

    // サイズチェック（1MB制限）
    const sizeInBytes = new Blob([JSON.stringify(gameState)]).size
    if (sizeInBytes > 1024 * 1024) {
      errors.push('Game state is too large (>1MB)')
    }

    return {
      isValid: errors.length === 0,
      errors,
      size: sizeInBytes
    }
  }

  /**
   * チェックサムを生成
   * @param {Object} data - データ
   * @returns {Promise<string>} チェックサム
   */
  async generateChecksum(data) {
    try {
      const jsonString = JSON.stringify(data)
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(jsonString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.warn('Failed to generate checksum:', error)
      return null
    }
  }

  /**
   * チェックサムを検証
   * @param {Object} data - データ
   * @param {string} expectedChecksum - 期待されるチェックサム
   * @returns {Promise<boolean>} 検証結果
   */
  async verifyChecksum(data, expectedChecksum) {
    try {
      const actualChecksum = await this.generateChecksum(data)
      return actualChecksum === expectedChecksum
    } catch (error) {
      console.warn('Failed to verify checksum:', error)
      return false
    }
  }

  /**
   * データを暗号化（簡易版）
   * @param {Object} data - データ
   * @returns {string} 暗号化されたデータ
   */
  async encryptData(data) {
    // 実際のプロジェクトでは適切な暗号化ライブラリを使用
    const jsonString = JSON.stringify(data)
    return btoa(jsonString) // 単純なBase64エンコード（デモ用）
  }

  /**
   * データを復号化（簡易版）
   * @param {string} encryptedData - 暗号化されたデータ
   * @returns {Object} 復号化されたデータ
   */
  async decryptData(encryptedData) {
    // 実際のプロジェクトでは適切な復号化ライブラリを使用
    const jsonString = atob(encryptedData) // 単純なBase64デコード（デモ用）
    return JSON.parse(jsonString)
  }

  /**
   * オブジェクトの深いクローン
   * @param {Object} obj - クローンするオブジェクト
   * @returns {Object} クローンされたオブジェクト
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  /**
   * プラットフォームを検出
   * @returns {string} プラットフォーム名
   */
  detectPlatform() {
    const userAgent = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS'
    if (/Android/.test(userAgent)) return 'Android'
    if (/Windows/.test(userAgent)) return 'Windows'
    if (/Mac/.test(userAgent)) return 'macOS'
    if (/Linux/.test(userAgent)) return 'Linux'
    return 'Unknown'
  }

  /**
   * バックアップ一覧を取得
   * @returns {Array} バックアップ一覧
   */
  getBackups() {
    try {
      return JSON.parse(localStorage.getItem(this.backupKey) || '[]')
    } catch (error) {
      console.error('Failed to get backups:', error)
      return []
    }
  }

  /**
   * バックアップを作成
   * @param {Object} saveData - 保存データ
   */
  createBackup(saveData) {
    try {
      const backups = this.getBackups()
      const backupData = {
        ...saveData,
        id: `backup_${saveData.id}`,
        backupTimestamp: new Date().toISOString()
      }

      backups.unshift(backupData)

      // 最大5件のバックアップを保持
      if (backups.length > 5) {
        backups.splice(5)
      }

      localStorage.setItem(this.backupKey, JSON.stringify(backups))
      console.log(`📦 Backup created: ${backupData.id}`)

    } catch (error) {
      console.error('Failed to create backup:', error)
    }
  }

  /**
   * 前回の保存と同じかチェック
   * @param {Object} gameState - ゲーム状態
   * @param {string} gameId - ゲームID
   * @returns {boolean} 同じかどうか
   */
  isSameAsLastSave(gameState, gameId) {
    try {
      const savedStates = this.getSavedStates(gameId)
      if (savedStates.length === 0) return false

      const lastSave = savedStates[0]
      const currentHash = JSON.stringify(gameState)
      const lastHash = JSON.stringify(lastSave.gameState)

      return currentHash === lastHash
    } catch (error) {
      return false
    }
  }

  /**
   * 最終更新時刻を取得
   * @returns {string|null} 最終更新時刻
   */
  getLastUpdateTime() {
    try {
      const states = this.getSavedStates()
      if (states.length === 0) return null

      const timestamps = states.map(state => new Date(state.timestamp))
      return new Date(Math.max(...timestamps)).toISOString()
    } catch (error) {
      return null
    }
  }
}

// シングルトンインスタンス
const gameStateManager = new GameStateManager()

export default gameStateManager
export { GameStateManager }