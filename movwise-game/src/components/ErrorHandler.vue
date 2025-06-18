<template>
  <div class="error-handler-container">
    <!-- 軽微なエラー用トースト通知 -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in visibleToasts"
        :key="toast.id"
        class="toast-notification"
        :class="getToastClass(toast.severity)"
        @click="dismissToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            {{ getToastIcon(toast.severity) }}
          </div>
          <div class="toast-message">
            <div class="toast-title">{{ getToastTitle(toast.severity) }}</div>
            <div class="toast-text">{{ toast.message }}</div>
          </div>
          <button class="toast-close" @click.stop="dismissToast(toast.id)">
            ×
          </button>
        </div>
      </div>
    </transition-group>

    <!-- 重要なエラー用モーダル -->
    <div v-if="showModal" class="error-modal-overlay" @click="closeModal">
      <div class="error-modal" @click.stop>
        <div class="error-modal-header">
          <div class="error-icon-large">
            {{ getModalIcon(modalError.type) }}
          </div>
          <h2 class="error-title">{{ getModalTitle(modalError.type) }}</h2>
        </div>

        <div class="error-modal-body">
          <p class="error-description">{{ modalError.message }}</p>
          
          <!-- 接続エラーの場合の詳細情報 -->
          <div v-if="isConnectionError(modalError.type)" class="connection-details">
            <div class="connection-status">
              <div class="status-item">
                <span class="status-label">インターネット:</span>
                <span :class="connectionStore.isOnline ? 'status-ok' : 'status-error'">
                  {{ connectionStore.isOnline ? '✅ 接続中' : '❌ 切断' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">ゲームサーバー:</span>
                <span :class="connectionStore.firebaseConnected ? 'status-ok' : 'status-error'">
                  {{ connectionStore.firebaseConnected ? '✅ 接続中' : '❌ 切断' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">接続品質:</span>
                <span :class="getQualityClass(connectionStore.connectionQuality)">
                  {{ getQualityText(connectionStore.connectionQuality) }}
                </span>
              </div>
            </div>

            <!-- 再接続進行状況 -->
            <div v-if="connectionStore.isReconnecting" class="reconnection-progress">
              <div class="progress-header">
                <span class="progress-icon">🛰️</span>
                <span class="progress-text">宇宙船を修理中...</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${connectionStore.reconnectProgress}%` }"
                ></div>
              </div>
              <div class="progress-info">
                {{ connectionStore.reconnectAttempts }}/{{ connectionStore.maxReconnectAttempts }} 回目の修理
              </div>
            </div>
          </div>

          <!-- ユーザーガイダンス -->
          <div class="user-guidance">
            <div class="guidance-title">🚀 解決方法:</div>
            <ul class="guidance-list">
              <li v-for="step in getGuidanceSteps(modalError.type)" :key="step">
                {{ step }}
              </li>
            </ul>
          </div>

          <!-- 緊急時の連絡先 -->
          <div v-if="modalError.type === 'critical'" class="emergency-contact">
            <div class="emergency-title">🆘 困ったときは:</div>
            <div class="emergency-info">
              <p>保護者の方や先生に相談してください</p>
              <div class="contact-buttons">
                <button class="emergency-btn" @click="showHelpGuide">
                  📚 ヘルプガイド
                </button>
                <button class="emergency-btn" @click="copyErrorInfo">
                  📋 エラー情報をコピー
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="error-modal-footer">
          <button 
            v-if="canRetry(modalError.type)" 
            class="retry-button"
            @click="retryAction"
            :disabled="isRetrying"
          >
            <span class="button-icon">🔄</span>
            {{ isRetrying ? '修理中...' : 'もう一度試す' }}
          </button>
          
          <button 
            v-if="hasOfflineMode(modalError.type)"
            class="offline-button"
            @click="switchToOfflineMode"
          >
            <span class="button-icon">🛸</span>
            オフラインで続ける
          </button>

          <button class="close-button" @click="closeModal">
            <span class="button-icon">✅</span>
            わかった
          </button>
        </div>
      </div>
    </div>

    <!-- デバッグ情報パネル（開発モード） -->
    <div v-if="showDebugPanel && isDevelopment" class="debug-panel">
      <div class="debug-header">
        <span class="debug-title">🔧 デバッグ情報</span>
        <button class="debug-toggle" @click="toggleDebugPanel">×</button>
      </div>
      <div class="debug-content">
        <div class="debug-section">
          <h4>接続状態</h4>
          <pre>{{ JSON.stringify(debugConnectionInfo, null, 2) }}</pre>
        </div>
        <div class="debug-section">
          <h4>エラー履歴</h4>
          <div class="error-history">
            <div 
              v-for="error in connectionStore.errorHistory.slice(0, 5)" 
              :key="error.id"
              class="history-item"
            >
              <span class="history-time">{{ formatTime(error.timestamp) }}</span>
              <span class="history-type">{{ error.type }}</span>
              <span class="history-message">{{ error.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useConnectionStore } from '@/stores/connectionStatus'

export default {
  name: 'ErrorHandler',
  props: {
    maxToasts: {
      type: Number,
      default: 3
    },
    toastDuration: {
      type: Number,
      default: 5000
    },
    enableDebugPanel: {
      type: Boolean,
      default: false
    }
  },
  emits: ['error-resolved', 'offline-mode-requested', 'help-requested'],
  setup(props, { emit }) {
    const connectionStore = useConnectionStore()
    
    // 状態管理
    const visibleToasts = ref([])
    const showModal = ref(false)
    const modalError = ref(null)
    const isRetrying = ref(false)
    const showDebugPanel = ref(props.enableDebugPanel)
    const isDevelopment = ref(process.env.NODE_ENV === 'development')

    // タイマー管理
    const toastTimers = new Map()

    // 計算プロパティ
    const debugConnectionInfo = computed(() => ({
      isOnline: connectionStore.isOnline,
      firebaseConnected: connectionStore.firebaseConnected,
      connectionQuality: connectionStore.connectionQuality,
      latency: connectionStore.latency,
      reconnectAttempts: connectionStore.reconnectAttempts,
      isReconnecting: connectionStore.isReconnecting,
      lastError: connectionStore.lastError
    }))

    // エラー監視
    watch(() => connectionStore.errorHistory, (newHistory) => {
      if (newHistory.length > 0) {
        const latestError = newHistory[0]
        if (!latestError.isRead) {
          handleNewError(latestError)
          connectionStore.markAsRead(latestError.id)
        }
      }
    }, { deep: true })

    watch(() => connectionStore.criticalErrors, (newErrors) => {
      if (newErrors.length > 0) {
        const latestCritical = newErrors[newErrors.length - 1]
        showCriticalError(latestCritical)
      }
    }, { deep: true })

    // エラー処理メソッド
    const handleNewError = (error) => {
      if (shouldShowAsModal(error)) {
        showCriticalError(error)
      } else {
        showToast(error)
      }
    }

    const shouldShowAsModal = (error) => {
      const modalTypes = [
        'firebase_error',
        'reconnection_failed',
        'critical_game_error',
        'data_corruption',
        'permission_denied'
      ]
      return modalTypes.includes(error.type) || error.severity === 'error'
    }

    const showToast = (error) => {
      // 重複チェック
      const existing = visibleToasts.value.find(toast => 
        toast.type === error.type && toast.message === error.message
      )
      if (existing) return

      const toast = {
        id: error.id || Date.now() + Math.random(),
        type: error.type,
        message: error.message,
        severity: error.severity || 'info',
        timestamp: Date.now()
      }

      visibleToasts.value.unshift(toast)

      // 最大数を超えた場合は古いものを削除
      if (visibleToasts.value.length > props.maxToasts) {
        const removed = visibleToasts.value.pop()
        clearToastTimer(removed.id)
      }

      // 自動削除タイマー
      const timer = setTimeout(() => {
        dismissToast(toast.id)
      }, props.toastDuration)
      
      toastTimers.set(toast.id, timer)
    }

    const showCriticalError = (error) => {
      modalError.value = error
      showModal.value = true
    }

    const dismissToast = (toastId) => {
      const index = visibleToasts.value.findIndex(toast => toast.id === toastId)
      if (index !== -1) {
        visibleToasts.value.splice(index, 1)
        clearToastTimer(toastId)
      }
    }

    const clearToastTimer = (toastId) => {
      const timer = toastTimers.get(toastId)
      if (timer) {
        clearTimeout(timer)
        toastTimers.delete(toastId)
      }
    }

    const closeModal = () => {
      showModal.value = false
      modalError.value = null
      isRetrying.value = false
    }

    // UI ヘルパー関数
    const getToastClass = (severity) => {
      const classes = {
        'info': 'toast-info',
        'success': 'toast-success',
        'warning': 'toast-warning',
        'error': 'toast-error'
      }
      return classes[severity] || 'toast-info'
    }

    const getToastIcon = (severity) => {
      const icons = {
        'info': '🛰️',
        'success': '✅',
        'warning': '⚠️',
        'error': '🚨'
      }
      return icons[severity] || '🛰️'
    }

    const getToastTitle = (severity) => {
      const titles = {
        'info': '宇宙船からの通信',
        'success': 'ミッション成功',
        'warning': '注意が必要です',
        'error': '緊急事態発生'
      }
      return titles[severity] || '宇宙船からの通信'
    }

    const getModalIcon = (errorType) => {
      const icons = {
        'network_lost': '📡',
        'firebase_disconnected': '🔥',
        'firebase_error': '🔥',
        'reconnection_failed': '🛠️',
        'critical_game_error': '🚨',
        'data_corruption': '💾',
        'permission_denied': '🔒'
      }
      return icons[errorType] || '🚨'
    }

    const getModalTitle = (errorType) => {
      const titles = {
        'network_lost': '宇宙船の通信が途絶えました',
        'firebase_disconnected': 'サーバーとの接続が切れました',
        'firebase_error': 'サーバーエラーが発生しました',
        'reconnection_failed': '自動修理に失敗しました',
        'critical_game_error': '重要なエラーが発生しました',
        'data_corruption': 'データに問題があります',
        'permission_denied': 'アクセスが拒否されました'
      }
      return titles[errorType] || '問題が発生しました'
    }

    const isConnectionError = (errorType) => {
      const connectionErrors = [
        'network_lost',
        'firebase_disconnected',
        'firebase_error',
        'reconnection_failed'
      ]
      return connectionErrors.includes(errorType)
    }

    const getQualityClass = (quality) => {
      const classes = {
        'excellent': 'quality-excellent',
        'good': 'quality-good',
        'poor': 'quality-poor',
        'critical': 'quality-critical'
      }
      return classes[quality] || 'quality-unknown'
    }

    const getQualityText = (quality) => {
      const texts = {
        'excellent': '🟢 最高',
        'good': '🟡 良好',
        'poor': '🟠 不安定',
        'critical': '🔴 問題あり'
      }
      return texts[quality] || '⚪ 不明'
    }

    const getGuidanceSteps = (errorType) => {
      const steps = {
        'network_lost': [
          'Wi-Fiの電波状況を確認してください',
          'ルーターの電源を入れ直してみてください',
          '他のデバイスでもインターネットに接続できるか確認してください'
        ],
        'firebase_disconnected': [
          'しばらく待ってから自動で再接続されます',
          '「もう一度試す」ボタンを押してください',
          '問題が続く場合は大人に相談してください'
        ],
        'reconnection_failed': [
          'インターネット接続を確認してください',
          'ページを更新（リロード）してみてください',
          'ブラウザを一度閉じて、もう一度開いてください'
        ],
        'critical_game_error': [
          'ページを更新してみてください',
          'ブラウザのキャッシュをクリアしてください',
          '大人に相談してください'
        ]
      }
      return steps[errorType] || ['大人に相談してください']
    }

    const canRetry = (errorType) => {
      const retryableErrors = [
        'firebase_disconnected',
        'firebase_error',
        'reconnection_failed',
        'network_lost'
      ]
      return retryableErrors.includes(errorType)
    }

    const hasOfflineMode = (errorType) => {
      const offlineCompatibleErrors = [
        'network_lost',
        'firebase_disconnected',
        'reconnection_failed'
      ]
      return offlineCompatibleErrors.includes(errorType)
    }

    // アクション
    const retryAction = async () => {
      isRetrying.value = true
      
      try {
        if (modalError.value?.type.includes('firebase') || modalError.value?.type.includes('network')) {
          await connectionStore.manualReconnect()
        }
        
        // 成功したらモーダルを閉じる
        setTimeout(() => {
          if (connectionStore.isFullyConnected) {
            closeModal()
            emit('error-resolved', modalError.value)
          }
        }, 2000)
        
      } catch (error) {
        console.error('Retry failed:', error)
      } finally {
        isRetrying.value = false
      }
    }

    const switchToOfflineMode = () => {
      closeModal()
      emit('offline-mode-requested', modalError.value)
    }

    const showHelpGuide = () => {
      emit('help-requested', modalError.value)
    }

    const copyErrorInfo = async () => {
      const errorInfo = {
        timestamp: new Date().toISOString(),
        error: modalError.value,
        connection: debugConnectionInfo.value,
        userAgent: navigator.userAgent
      }
      
      try {
        await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2))
        showToast({
          id: Date.now(),
          type: 'copy_success',
          message: 'エラー情報をコピーしました',
          severity: 'success'
        })
      } catch (error) {
        console.error('Failed to copy error info:', error)
      }
    }

    const toggleDebugPanel = () => {
      showDebugPanel.value = !showDebugPanel.value
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }

    // 公開メソッド
    const showCustomError = (error) => {
      handleNewError(error)
    }

    const clearAllToasts = () => {
      visibleToasts.value.forEach(toast => clearToastTimer(toast.id))
      visibleToasts.value = []
    }

    // ライフサイクル
    onMounted(() => {
      console.log('🛠️ ErrorHandler mounted')
    })

    onUnmounted(() => {
      // すべてのタイマーをクリア
      toastTimers.forEach(timer => clearTimeout(timer))
      toastTimers.clear()
    })

    return {
      connectionStore,
      visibleToasts,
      showModal,
      modalError,
      isRetrying,
      showDebugPanel,
      isDevelopment,
      debugConnectionInfo,
      
      // メソッド
      dismissToast,
      closeModal,
      retryAction,
      switchToOfflineMode,
      showHelpGuide,
      copyErrorInfo,
      toggleDebugPanel,
      formatTime,
      showCustomError,
      clearAllToasts,
      
      // ヘルパー
      getToastClass,
      getToastIcon,
      getToastTitle,
      getModalIcon,
      getModalTitle,
      isConnectionError,
      getQualityClass,
      getQualityText,
      getGuidanceSteps,
      canRetry,
      hasOfflineMode
    }
  }
}
</script>

<style scoped>
.error-handler-container {
  position: relative;
  z-index: 9999;
}

/* トースト通知 */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
}

.toast-notification {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  overflow: hidden;
  pointer-events: all;
  max-width: 400px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toast-notification:hover {
  transform: translateX(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
}

.toast-icon {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #1f2937;
}

.toast-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #6b7280;
}

/* トーストタイプ別スタイル */
.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

/* エラーモーダル */
.error-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
}

.error-modal {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modal-enter 0.3s ease-out;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.error-modal-header {
  text-align: center;
  padding: 30px 30px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.error-icon-large {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.error-modal-body {
  padding: 20px 30px;
}

.error-description {
  font-size: 16px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* 接続状態詳細 */
.connection-details {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.connection-status {
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.status-label {
  color: #6b7280;
}

.status-ok {
  color: #10b981;
  font-weight: 500;
}

.status-error {
  color: #ef4444;
  font-weight: 500;
}

/* 再接続進行状況 */
.reconnection-progress {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
}

.progress-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.progress-icon {
  font-size: 20px;
  margin-right: 8px;
}

.progress-text {
  font-weight: 500;
  color: #1e40af;
}

.progress-bar {
  background: #e0e7ff;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 8px;
}

.progress-info {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

/* 接続品質表示 */
.quality-excellent {
  color: #10b981;
}

.quality-good {
  color: #f59e0b;
}

.quality-poor {
  color: #f97316;
}

.quality-critical {
  color: #ef4444;
}

/* ユーザーガイダンス */
.user-guidance {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.guidance-title {
  font-weight: bold;
  color: #0c4a6e;
  margin-bottom: 12px;
}

.guidance-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guidance-list li {
  padding: 6px 0;
  border-bottom: 1px solid #e0f2fe;
  color: #164e63;
}

.guidance-list li:last-child {
  border-bottom: none;
}

.guidance-list li:before {
  content: "👉 ";
  margin-right: 8px;
}

/* 緊急連絡先 */
.emergency-contact {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
}

.emergency-title {
  font-weight: bold;
  color: #991b1b;
  margin-bottom: 12px;
}

.emergency-info p {
  color: #7f1d1d;
  margin-bottom: 12px;
}

.contact-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.emergency-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.emergency-btn:hover {
  background: #b91c1c;
}

/* モーダルフッター */
.error-modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.retry-button,
.offline-button,
.close-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button {
  background: #3b82f6;
  color: white;
}

.retry-button:hover:not(:disabled) {
  background: #2563eb;
}

.retry-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.offline-button {
  background: #f59e0b;
  color: white;
}

.offline-button:hover {
  background: #d97706;
}

.close-button {
  background: #6b7280;
  color: white;
}

.close-button:hover {
  background: #4b5563;
}

.button-icon {
  font-size: 16px;
}

/* デバッグパネル */
.debug-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 8px;
  width: 400px;
  max-height: 300px;
  overflow: hidden;
  z-index: 10000;
  font-family: monospace;
  font-size: 12px;
}

.debug-header {
  background: #374151;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-title {
  font-weight: bold;
}

.debug-toggle {
  background: none;
  border: none;
  color: #f9fafb;
  cursor: pointer;
  font-size: 16px;
}

.debug-content {
  padding: 12px;
  overflow-y: auto;
  max-height: 250px;
}

.debug-section {
  margin-bottom: 16px;
}

.debug-section h4 {
  color: #fbbf24;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.debug-section pre {
  background: #111827;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}

.error-history {
  max-height: 100px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  padding: 4px;
  background: #111827;
  border-radius: 4px;
}

.history-time {
  color: #9ca3af;
  width: 60px;
  flex-shrink: 0;
}

.history-type {
  color: #fbbf24;
  width: 80px;
  flex-shrink: 0;
}

.history-message {
  color: #f9fafb;
  word-break: break-word;
}

/* アニメーション */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* レスポンシブ */
@media (max-width: 640px) {
  .toast-container {
    left: 10px;
    right: 10px;
    top: 10px;
  }
  
  .toast-notification {
    max-width: none;
  }
  
  .error-modal {
    margin: 10px;
    border-radius: 16px;
  }
  
  .error-modal-header,
  .error-modal-body,
  .error-modal-footer {
    padding: 20px;
  }
  
  .error-modal-footer {
    flex-direction: column;
  }
  
  .debug-panel {
    left: 10px;
    right: 10px;
    width: auto;
  }
  
  .contact-buttons {
    flex-direction: column;
  }
}
</style>