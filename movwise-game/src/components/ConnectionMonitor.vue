<template>
  <div class="connection-monitor">
    <!-- 接続状態インジケーター（常時表示） -->
    <div 
      class="connection-indicator"
      :class="getIndicatorClass()"
      @click="toggleDetails"
    >
      <div class="indicator-icon">
        {{ getStatusIcon() }}
      </div>
      <div class="indicator-pulse" v-if="shouldShowPulse()"></div>
    </div>

    <!-- 詳細パネル（トグル表示） -->
    <transition name="slide-down">
      <div v-if="showDetails" class="connection-details-panel">
        <div class="panel-header">
          <h3 class="panel-title">🛰️ 宇宙船接続状況</h3>
          <button class="close-button" @click="closeDetails">×</button>
        </div>

        <div class="panel-content">
          <!-- 基本接続状態 -->
          <div class="connection-section">
            <h4 class="section-title">基本状態</h4>
            <div class="status-grid">
              <div class="status-item">
                <div class="status-label">インターネット</div>
                <div class="status-value" :class="connectionStore.isOnline ? 'status-good' : 'status-bad'">
                  {{ connectionStore.isOnline ? '✅ 接続中' : '❌ 切断' }}
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">ゲームサーバー</div>
                <div class="status-value" :class="connectionStore.firebaseConnected ? 'status-good' : 'status-bad'">
                  {{ connectionStore.firebaseConnected ? '✅ 接続中' : '❌ 切断' }}
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">協力モード</div>
                <div class="status-value" :class="connectionStore.canUseCooperativeMode ? 'status-good' : 'status-warning'">
                  {{ connectionStore.canUseCooperativeMode ? '✅ 利用可能' : '⚠️ 制限あり' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 接続品質 -->
          <div class="connection-section">
            <h4 class="section-title">接続品質</h4>
            <div class="quality-display">
              <div class="quality-indicator">
                <div class="quality-bars">
                  <div 
                    v-for="i in 4" 
                    :key="i"
                    class="quality-bar"
                    :class="{ 'active': i <= getQualityLevel() }"
                  ></div>
                </div>
                <div class="quality-text">{{ getQualityDisplayText() }}</div>
              </div>
              <div class="quality-metrics">
                <div class="metric">
                  <span class="metric-label">レイテンシ:</span>
                  <span class="metric-value">{{ connectionStore.latency }}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">品質:</span>
                  <span class="metric-value" :class="getQualityClass()">
                    {{ getQualityDisplayText() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 再接続状況 -->
          <div v-if="connectionStore.isReconnecting" class="connection-section">
            <h4 class="section-title">🔄 修理中</h4>
            <div class="reconnection-status">
              <div class="reconnection-text">
                宇宙船のエンジンを修理中です...
              </div>
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: `${connectionStore.reconnectProgress}%` }"
                  ></div>
                </div>
                <div class="progress-text">
                  {{ connectionStore.reconnectAttempts }}/{{ connectionStore.maxReconnectAttempts }} 回目
                </div>
              </div>
            </div>
          </div>

          <!-- 履歴（最新5件） -->
          <div class="connection-section">
            <h4 class="section-title">通信ログ</h4>
            <div class="log-container">
              <div 
                v-for="entry in recentHistory" 
                :key="entry.id"
                class="log-entry"
                :class="getLogEntryClass(entry.severity)"
              >
                <div class="log-time">{{ formatLogTime(entry.timestamp) }}</div>
                <div class="log-message">{{ entry.message }}</div>
              </div>
              <div v-if="connectionStore.errorHistory.length === 0" class="no-logs">
                📡 すべて正常です
              </div>
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="panel-actions">
            <button 
              v-if="!connectionStore.isFullyConnected"
              class="action-button retry-button"
              @click="handleRetry"
              :disabled="connectionStore.isReconnecting"
            >
              <span class="button-icon">🔄</span>
              {{ connectionStore.isReconnecting ? '修理中...' : '再接続' }}
            </button>
            
            <button 
              class="action-button test-button"
              @click="handleConnectionTest"
              :disabled="isTestingConnection"
            >
              <span class="button-icon">🧪</span>
              {{ isTestingConnection ? 'テスト中...' : '接続テスト' }}
            </button>
            
            <button 
              v-if="!connectionStore.isFullyConnected"
              class="action-button offline-button"
              @click="handleOfflineMode"
            >
              <span class="button-icon">🛸</span>
              オフラインモード
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 接続切断時の警告バナー -->
    <transition name="slide-down">
      <div v-if="shouldShowWarningBanner()" class="connection-warning-banner">
        <div class="warning-content">
          <div class="warning-icon">{{ getWarningIcon() }}</div>
          <div class="warning-text">
            <div class="warning-title">{{ getWarningTitle() }}</div>
            <div class="warning-message">{{ getWarningMessage() }}</div>
          </div>
          <div class="warning-actions">
            <button 
              class="warning-button primary"
              @click="handleQuickFix"
              :disabled="connectionStore.isReconnecting"
            >
              {{ connectionStore.isReconnecting ? '修理中...' : 'すぐ修理' }}
            </button>
            <button class="warning-button secondary" @click="dismissWarning">
              後で
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 接続回復通知 -->
    <transition name="notification">
      <div v-if="showRecoveryNotification" class="recovery-notification">
        <div class="recovery-content">
          <span class="recovery-icon">🎉</span>
          <span class="recovery-text">宇宙船の通信が復旧しました！</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useConnectionStore } from '@/stores/connectionStatus'
import { SpeakerWaveIcon as VolumeIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ConnectionMonitor',
  props: {
    showIndicator: {
      type: Boolean,
      default: true
    },
    autoShowDetails: {
      type: Boolean,
      default: false
    },
    compactMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['connection-changed', 'offline-mode-requested', 'retry-requested'],
  setup(props, { emit }) {
    const connectionStore = useConnectionStore()
    
    // 状態管理
    const showDetails = ref(props.autoShowDetails)
    const isTestingConnection = ref(false)
    const showWarningBanner = ref(false)
    const showRecoveryNotification = ref(false)
    const warningDismissed = ref(false)
    const lastConnectionState = ref(connectionStore.isFullyConnected)

    // 計算プロパティ
    const recentHistory = computed(() => 
      connectionStore.errorHistory.slice(0, 5)
    )

    // 監視
    watch(() => connectionStore.isFullyConnected, (newState, oldState) => {
      if (newState !== oldState) {
        lastConnectionState.value = newState
        emit('connection-changed', newState)
        
        if (newState && !oldState) {
          // 接続回復
          showRecoveryNotification.value = true
          warningDismissed.value = false
          setTimeout(() => {
            showRecoveryNotification.value = false
          }, 3000)
        }
        
        if (!newState && oldState) {
          // 接続切断
          warningDismissed.value = false
        }
      }
    })

    watch(() => connectionStore.isOnline, (isOnline) => {
      if (!isOnline) {
        showWarningBanner.value = true
      }
    })

    // UI状態メソッド
    const getIndicatorClass = () => {
      const baseClass = 'connection-indicator'
      
      if (connectionStore.isFullyConnected) {
        return `${baseClass} status-excellent`
      } else if (connectionStore.isOnline && !connectionStore.firebaseConnected) {
        return `${baseClass} status-warning`
      } else {
        return `${baseClass} status-error`
      }
    }

    const getStatusIcon = () => {
      if (connectionStore.isFullyConnected) {
        switch (connectionStore.connectionQuality) {
          case 'excellent': return '🟢'
          case 'good': return '🟡'
          case 'poor': return '🟠'
          default: return '🟢'
        }
      } else if (connectionStore.isReconnecting) {
        return '🔄'
      } else {
        return '🔴'
      }
    }

    const shouldShowPulse = () => {
      return connectionStore.isReconnecting || !connectionStore.isFullyConnected
    }

    const getQualityLevel = () => {
      const qualityMap = {
        'excellent': 4,
        'good': 3,
        'poor': 2,
        'critical': 1
      }
      return qualityMap[connectionStore.connectionQuality] || 0
    }

    const getQualityDisplayText = () => {
      const qualityTexts = {
        'excellent': '最高',
        'good': '良好',
        'poor': '不安定',
        'critical': '問題あり'
      }
      return qualityTexts[connectionStore.connectionQuality] || '不明'
    }

    const getQualityClass = () => {
      return `quality-${connectionStore.connectionQuality}`
    }

    const getLogEntryClass = (severity) => {
      return `log-${severity}`
    }

    const formatLogTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 警告バナー関連
    const shouldShowWarningBanner = () => {
      return !connectionStore.isFullyConnected && !warningDismissed.value
    }

    const getWarningIcon = () => {
      if (!connectionStore.isOnline) return '📡'
      if (!connectionStore.firebaseConnected) return '🔥'
      return '⚠️'
    }

    const getWarningTitle = () => {
      if (!connectionStore.isOnline) return '通信が切断されました'
      if (!connectionStore.firebaseConnected) return 'サーバーとの接続が切れました'
      return '接続に問題があります'
    }

    const getWarningMessage = () => {
      if (!connectionStore.isOnline) {
        return 'インターネット接続を確認してください'
      }
      if (!connectionStore.firebaseConnected) {
        return '自動で再接続を試行中です'
      }
      return '協力学習機能が制限される可能性があります'
    }

    // アクション
    const toggleDetails = () => {
      showDetails.value = !showDetails.value
    }

    const closeDetails = () => {
      showDetails.value = false
    }

    const handleRetry = async () => {
      emit('retry-requested')
      await connectionStore.manualReconnect()
    }

    const handleConnectionTest = async () => {
      isTestingConnection.value = true
      
      try {
        // 接続テストの実行
        await connectionStore.checkConnectionQuality()
        await connectionStore.checkFirebaseConnection()
        
        // テスト結果をログに追加
        connectionStore.addToHistory(
          'connection_test',
          '接続テストが完了しました',
          'info'
        )
      } catch (error) {
        connectionStore.addToHistory(
          'connection_test_failed',
          '接続テストに失敗しました',
          'error'
        )
      } finally {
        setTimeout(() => {
          isTestingConnection.value = false
        }, 1000)
      }
    }

    const handleOfflineMode = () => {
      emit('offline-mode-requested')
    }

    const handleQuickFix = async () => {
      if (!connectionStore.isOnline) {
        // ブラウザの接続状態を再チェック
        connectionStore.handleOnline()
      } else {
        // サーバー接続の修復を試行
        await handleRetry()
      }
    }

    const dismissWarning = () => {
      warningDismissed.value = true
    }

    // 自動監視の開始/停止
    const startAutoMonitoring = () => {
      if (!connectionStore.startConnectionMonitoring) {
        console.warn('Connection monitoring not available')
        return
      }
      connectionStore.startConnectionMonitoring()
    }

    const stopAutoMonitoring = () => {
      if (connectionStore.stopConnectionMonitoring) {
        connectionStore.stopConnectionMonitoring()
      }
    }

    // ライフサイクル
    onMounted(() => {
      console.log('🛰️ ConnectionMonitor mounted')
      startAutoMonitoring()
      
      // 初期状態の設定
      lastConnectionState.value = connectionStore.isFullyConnected
    })

    onUnmounted(() => {
      stopAutoMonitoring()
    })

    return {
      connectionStore,
      showDetails,
      isTestingConnection,
      showRecoveryNotification,
      recentHistory,
      
      // Methods
      toggleDetails,
      closeDetails,
      handleRetry,
      handleConnectionTest,
      handleOfflineMode,
      handleQuickFix,
      dismissWarning,
      
      // UI helpers
      getIndicatorClass,
      getStatusIcon,
      shouldShowPulse,
      getQualityLevel,
      getQualityDisplayText,
      getQualityClass,
      getLogEntryClass,
      formatLogTime,
      shouldShowWarningBanner,
      getWarningIcon,
      getWarningTitle,
      getWarningMessage
    }
  }
}
</script>

<style scoped>
.connection-monitor {
  position: relative;
  z-index: 1000;
}

/* 接続インジケーター */
.connection-indicator {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.connection-indicator:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.status-excellent {
  background: linear-gradient(135deg, #10b981, #059669);
}

.status-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.status-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.indicator-icon {
  font-size: 20px;
  z-index: 2;
}

.indicator-pulse {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: inherit;
  animation: pulse 2s infinite;
  opacity: 0.6;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* 詳細パネル */
.connection-details-panel {
  position: fixed;
  top: 80px;
  left: 20px;
  width: 400px;
  max-height: 80vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000;
}

.panel-header {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.panel-content {
  padding: 20px;
  max-height: calc(80vh - 70px);
  overflow-y: auto;
}

/* セクション */
.connection-section {
  margin-bottom: 24px;
}

.connection-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ステータスグリッド */
.status-grid {
  display: grid;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #e5e7eb;
}

.status-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.status-value {
  font-size: 13px;
  font-weight: 600;
}

.status-good {
  color: #059669;
}

.status-warning {
  color: #d97706;
}

.status-bad {
  color: #dc2626;
}

/* 品質表示 */
.quality-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quality-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-bars {
  display: flex;
  gap: 3px;
  align-items: flex-end;
}

.quality-bar {
  width: 6px;
  height: 20px;
  background: #e5e7eb;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.quality-bar:nth-child(1) { height: 8px; }
.quality-bar:nth-child(2) { height: 12px; }
.quality-bar:nth-child(3) { height: 16px; }
.quality-bar:nth-child(4) { height: 20px; }

.quality-bar.active {
  background: #10b981;
}

.quality-text {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.metric-label {
  color: #6b7280;
}

.metric-value {
  font-weight: 500;
  color: #374151;
}

.quality-excellent { color: #059669; }
.quality-good { color: #d97706; }
.quality-poor { color: #f97316; }
.quality-critical { color: #dc2626; }

/* 再接続状況 */
.reconnection-status {
  text-align: center;
}

.reconnection-text {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 12px;
}

.progress-container {
  margin-bottom: 8px;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
}

/* ログ */
.log-container {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #6b7280;
  font-family: monospace;
  width: 70px;
  flex-shrink: 0;
}

.log-message {
  color: #374151;
  word-break: break-word;
}

.log-info { border-left: 3px solid #3b82f6; }
.log-success { border-left: 3px solid #10b981; }
.log-warning { border-left: 3px solid #f59e0b; }
.log-error { border-left: 3px solid #ef4444; }

.no-logs {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

/* アクションボタン */
.panel-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
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

.test-button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.test-button:hover:not(:disabled) {
  background: #e5e7eb;
}

.offline-button {
  background: #f59e0b;
  color: white;
}

.offline-button:hover {
  background: #d97706;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  font-size: 14px;
}

/* 警告バナー */
.connection-warning-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-bottom: 1px solid #f59e0b;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.warning-content {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.warning-icon {
  font-size: 24px;
  margin-right: 12px;
}

.warning-text {
  flex: 1;
  margin-right: 16px;
}

.warning-title {
  font-weight: 600;
  color: #92400e;
  font-size: 14px;
  margin-bottom: 2px;
}

.warning-message {
  color: #b45309;
  font-size: 13px;
}

.warning-actions {
  display: flex;
  gap: 8px;
}

.warning-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.warning-button.primary {
  background: #f59e0b;
  color: white;
}

.warning-button.primary:hover:not(:disabled) {
  background: #d97706;
}

.warning-button.secondary {
  background: transparent;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.warning-button.secondary:hover {
  background: #fef3c7;
}

/* 回復通知 */
.recovery-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 1002;
}

.recovery-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recovery-icon {
  font-size: 20px;
}

.recovery-text {
  font-weight: 500;
}

/* アニメーション */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* レスポンシブ */
@media (max-width: 640px) {
  .connection-details-panel {
    left: 10px;
    right: 10px;
    width: auto;
  }
  
  .warning-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .warning-actions {
    justify-content: center;
  }
  
  .quality-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .panel-actions {
    flex-direction: column;
  }
}

/* カスタムスクロールバー */
.panel-content::-webkit-scrollbar,
.log-container::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track,
.log-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb,
.log-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover,
.log-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>