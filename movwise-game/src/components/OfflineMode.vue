<template>
  <div class="offline-mode-container">
    <!-- オフラインモード有効時のヘッダーバナー -->
    <transition name="slide-down">
      <div v-if="isOfflineMode" class="offline-header-banner">
        <div class="banner-content">
          <div class="offline-icon">🛸</div>
          <div class="offline-text">
            <div class="offline-title">オフラインモード</div>
            <div class="offline-subtitle">
              インターネット接続が復旧するまで、ローカルで学習を続けられます
            </div>
          </div>
          <div class="banner-actions">
            <button 
              class="retry-connection-btn"
              @click="checkConnection"
              :disabled="isCheckingConnection"
            >
              <span class="btn-icon">{{ isCheckingConnection ? '🔄' : '📡' }}</span>
              {{ isCheckingConnection ? '確認中...' : '接続確認' }}
            </button>
            <button 
              class="close-banner-btn"
              @click="dismissBanner"
              v-if="!forceShowBanner"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- オフラインモード開始ダイアログ -->
    <div v-if="showOfflineDialog" class="offline-dialog-overlay" @click="closeOfflineDialog">
      <div class="offline-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon">🛸</div>
          <h2 class="dialog-title">オフラインモードに切り替え</h2>
        </div>

        <div class="dialog-body">
          <p class="dialog-description">
            インターネット接続に問題があるようです。<br>
            オフラインモードに切り替えて、学習を続けることができます。
          </p>

          <div class="offline-features">
            <h3 class="features-title">🚀 オフラインでできること:</h3>
            <ul class="features-list">
              <li>✅ 個人学習ゲームの継続</li>
              <li>✅ 進捗の記録（ローカル保存）</li>
              <li>✅ 学習結果の確認</li>
              <li>⚠️ 協力学習は一時停止されます</li>
              <li>📡 接続復旧時に自動でデータ同期</li>
            </ul>
          </div>

          <div class="saved-progress" v-if="hasSavedProgress">
            <h3 class="progress-title">💾 保存されている進捗:</h3>
            <div class="progress-item" v-for="save in savedProgress" :key="save.id">
              <div class="save-icon">{{ save.gameIcon }}</div>
              <div class="save-details">
                <div class="save-name">{{ save.gameName }}</div>
                <div class="save-info">
                  レベル {{ save.level }} | スコア: {{ save.score }}
                </div>
                <div class="save-time">{{ formatSaveTime(save.timestamp) }}</div>
              </div>
              <button class="restore-btn" @click="restoreGame(save)">
                <span class="restore-icon">🔄</span>
                続きから
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button 
            class="cancel-button"
            @click="closeOfflineDialog"
          >
            <span class="button-icon">❌</span>
            キャンセル
          </button>
          
          <button 
            class="offline-button"
            @click="enableOfflineMode"
          >
            <span class="button-icon">🛸</span>
            オフラインモードを開始
          </button>
        </div>
      </div>
    </div>

    <!-- オフライン状態インジケーター -->
    <div v-if="isOfflineMode && showIndicator" class="offline-indicator">
      <div class="indicator-content">
        <div class="indicator-icon">🛸</div>
        <div class="indicator-text">オフライン</div>
      </div>
    </div>

    <!-- 接続復旧通知 -->
    <transition name="notification">
      <div v-if="showConnectionRestored" class="connection-restored-notification">
        <div class="notification-content">
          <span class="notification-icon">🎉</span>
          <div class="notification-text">
            <div class="notification-title">接続が復旧しました！</div>
            <div class="notification-subtitle">オンラインモードに戻りますか？</div>
          </div>
          <div class="notification-actions">
            <button class="sync-btn" @click="syncAndGoOnline">
              <span class="btn-icon">🔄</span>
              同期してオンラインに戻る
            </button>
            <button class="stay-offline-btn" @click="stayOffline">
              このまま続ける
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- データ同期進行状況 -->
    <div v-if="isSyncing" class="sync-overlay">
      <div class="sync-dialog">
        <div class="sync-icon">🔄</div>
        <h3 class="sync-title">データを同期中...</h3>
        <div class="sync-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${syncProgress}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ syncProgressText }}</div>
        </div>
        <div class="sync-details">
          <div class="sync-item" v-for="item in syncItems" :key="item.id">
            <span class="sync-item-icon">{{ item.status === 'completed' ? '✅' : '⏳' }}</span>
            <span class="sync-item-text">{{ item.name }}</span>
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
  name: 'OfflineMode',
  props: {
    autoStart: {
      type: Boolean,
      default: false
    },
    showIndicator: {
      type: Boolean,
      default: true
    },
    forceShowBanner: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'offline-mode-enabled',
    'offline-mode-disabled', 
    'game-restored',
    'sync-completed',
    'sync-failed'
  ],
  setup(props, { emit }) {
    const connectionStore = useConnectionStore()
    
    // 状態管理
    const isOfflineMode = ref(false)
    const showOfflineDialog = ref(false)
    const showBanner = ref(true)
    const isCheckingConnection = ref(false)
    const showConnectionRestored = ref(false)
    const isSyncing = ref(false)
    const syncProgress = ref(0)
    const syncProgressText = ref('')
    
    // 保存されたゲーム進捗
    const savedProgress = ref([])
    const syncItems = ref([])
    
    // 計算プロパティ
    const hasSavedProgress = computed(() => savedProgress.value.length > 0)
    
    // 接続状態の監視
    watch(() => connectionStore.isFullyConnected, (isConnected, wasConnected) => {
      if (!isConnected && wasConnected && !isOfflineMode.value) {
        // 接続が切断された場合
        if (props.autoStart) {
          enableOfflineMode()
        } else {
          showOfflineDialog.value = true
        }
      } else if (isConnected && !wasConnected && isOfflineMode.value) {
        // 接続が復旧した場合
        showConnectionRestored.value = true
        setTimeout(() => {
          if (showConnectionRestored.value) {
            showConnectionRestored.value = false
          }
        }, 10000) // 10秒後に自動で消す
      }
    })
    
    // オフラインモード開始
    const enableOfflineMode = () => {
      console.log('🛸 Enabling offline mode...')
      isOfflineMode.value = true
      showOfflineDialog.value = false
      showBanner.value = true
      
      // 現在の進捗を保存
      saveCurrentProgress()
      
      // ローカルストレージから保存済み進捗を読み込み
      loadSavedProgress()
      
      emit('offline-mode-enabled')
      
      connectionStore.addToHistory(
        'offline_mode_enabled',
        'オフラインモードが有効になりました',
        'info'
      )
    }
    
    // オフラインモード終了
    const disableOfflineMode = () => {
      console.log('🌐 Disabling offline mode...')
      isOfflineMode.value = false
      showBanner.value = false
      showConnectionRestored.value = false
      
      emit('offline-mode-disabled')
      
      connectionStore.addToHistory(
        'offline_mode_disabled',
        'オンラインモードに復帰しました',
        'success'
      )
    }
    
    // 現在の進捗を保存
    const saveCurrentProgress = () => {
      try {
        const currentState = getCurrentGameState()
        if (currentState) {
          const save = {
            id: Date.now(),
            timestamp: new Date(),
            ...currentState
          }
          
          const saves = JSON.parse(localStorage.getItem('movwise_offline_saves') || '[]')
          saves.unshift(save)
          
          // 最新10件まで保持
          if (saves.length > 10) {
            saves.splice(10)
          }
          
          localStorage.setItem('movwise_offline_saves', JSON.stringify(saves))
          console.log('💾 Current progress saved to offline storage')
        }
      } catch (error) {
        console.error('Failed to save current progress:', error)
      }
    }
    
    // 保存済み進捗の読み込み
    const loadSavedProgress = () => {
      try {
        const saves = JSON.parse(localStorage.getItem('movwise_offline_saves') || '[]')
        savedProgress.value = saves.map(save => ({
          ...save,
          timestamp: new Date(save.timestamp)
        }))
        console.log(`📂 Loaded ${savedProgress.value.length} saved games`)
      } catch (error) {
        console.error('Failed to load saved progress:', error)
        savedProgress.value = []
      }
    }
    
    // 現在のゲーム状態を取得（簡単な例）
    const getCurrentGameState = () => {
      // 実際のプロジェクトでは、現在アクティブなゲームから状態を取得
      return {
        gameName: 'Co-Pilot Dock',
        gameIcon: '🚀',
        level: 3,
        score: 2500,
        progress: 75,
        playTime: 1200,
        unlockedFeatures: ['basic_games', 'cooperative_mode'],
        achievements: ['first_mission', 'team_player']
      }
    }
    
    // ゲーム復元
    const restoreGame = (save) => {
      console.log('🔄 Restoring game from save:', save.id)
      
      // 実際のプロジェクトでは、ゲーム状態を復元
      emit('game-restored', save)
      
      connectionStore.addToHistory(
        'game_restored',
        `ゲームを復元しました: ${save.gameName}`,
        'success'
      )
      
      closeOfflineDialog()
    }
    
    // 接続確認
    const checkConnection = async () => {
      isCheckingConnection.value = true
      
      try {
        // 接続テストを実行
        await connectionStore.checkFirebaseConnection()
        await connectionStore.checkConnectionQuality()
        
        if (connectionStore.isFullyConnected) {
          showConnectionRestored.value = true
        }
      } catch (error) {
        console.error('Connection check failed:', error)
      } finally {
        setTimeout(() => {
          isCheckingConnection.value = false
        }, 1000)
      }
    }
    
    // データ同期してオンラインに戻る
    const syncAndGoOnline = async () => {
      isSyncing.value = true
      syncProgress.value = 0
      
      // 同期アイテムの初期化
      syncItems.value = [
        { id: 1, name: 'ゲーム進捗', status: 'pending' },
        { id: 2, name: '学習記録', status: 'pending' },
        { id: 3, name: '設定データ', status: 'pending' },
        { id: 4, name: 'アチーブメント', status: 'pending' }
      ]
      
      try {
        // 同期プロセスのシミュレーション
        for (let i = 0; i < syncItems.value.length; i++) {
          syncProgressText.value = `${syncItems.value[i].name}を同期中...`
          
          // 実際のプロジェクトでは、ここで実際の同期処理を行う
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          syncItems.value[i].status = 'completed'
          syncProgress.value = ((i + 1) / syncItems.value.length) * 100
        }
        
        syncProgressText.value = '同期完了'
        
        // 同期完了後の処理
        setTimeout(() => {
          isSyncing.value = false
          showConnectionRestored.value = false
          disableOfflineMode()
          emit('sync-completed')
        }, 1000)
        
      } catch (error) {
        console.error('Sync failed:', error)
        isSyncing.value = false
        emit('sync-failed', error)
        
        connectionStore.addToHistory(
          'sync_failed',
          'データ同期に失敗しました',
          'error'
        )
      }
    }
    
    // オフラインのまま続ける
    const stayOffline = () => {
      showConnectionRestored.value = false
    }
    
    // ダイアログを閉じる
    const closeOfflineDialog = () => {
      showOfflineDialog.value = false
    }
    
    // バナーを閉じる
    const dismissBanner = () => {
      showBanner.value = false
    }
    
    // 時刻フォーマット
    const formatSaveTime = (timestamp) => {
      const now = new Date()
      const save = new Date(timestamp)
      const diffMinutes = Math.floor((now - save) / (1000 * 60))
      
      if (diffMinutes < 1) return 'たった今'
      if (diffMinutes < 60) return `${diffMinutes}分前`
      
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `${diffHours}時間前`
      
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}日前`
    }
    
    // 公開メソッド
    const showOfflineModeDialog = () => {
      showOfflineDialog.value = true
    }
    
    const forceOfflineMode = () => {
      enableOfflineMode()
    }
    
    // ライフサイクル
    onMounted(() => {
      console.log('🛸 OfflineMode component mounted')
      loadSavedProgress()
      
      // 初期状態の確認
      if (!connectionStore.isFullyConnected && props.autoStart) {
        setTimeout(() => {
          enableOfflineMode()
        }, 1000)
      }
    })
    
    onUnmounted(() => {
      // クリーンアップ
    })
    
    return {
      connectionStore,
      isOfflineMode,
      showOfflineDialog,
      showBanner,
      isCheckingConnection,
      showConnectionRestored,
      isSyncing,
      syncProgress,
      syncProgressText,
      savedProgress,
      syncItems,
      hasSavedProgress,
      
      // メソッド
      enableOfflineMode,
      disableOfflineMode,
      restoreGame,
      checkConnection,
      syncAndGoOnline,
      stayOffline,
      closeOfflineDialog,
      dismissBanner,
      formatSaveTime,
      showOfflineModeDialog,
      forceOfflineMode
    }
  }
}
</script>

<style scoped>
.offline-mode-container {
  position: relative;
  z-index: 9000;
}

/* オフラインヘッダーバナー */
.offline-header-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border-bottom: 2px solid #60a5fa;
  z-index: 9001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.offline-icon {
  font-size: 24px;
  margin-right: 12px;
}

.offline-text {
  flex: 1;
  margin-right: 16px;
}

.offline-title {
  font-weight: 600;
  color: white;
  font-size: 16px;
  margin-bottom: 2px;
}

.offline-subtitle {
  color: #bfdbfe;
  font-size: 13px;
  line-height: 1.3;
}

.banner-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.retry-connection-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-connection-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.retry-connection-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.close-banner-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-banner-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* オフラインダイアログ */
.offline-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9002;
  padding: 20px;
}

.offline-dialog {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: dialog-enter 0.3s ease-out;
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  text-align: center;
  padding: 30px 30px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.dialog-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.dialog-body {
  padding: 20px 30px;
}

.dialog-description {
  font-size: 16px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 24px;
  text-align: center;
}

/* オフライン機能リスト */
.offline-features {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.features-title {
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 12px 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 6px 0;
  color: #164e63;
  font-size: 14px;
  line-height: 1.4;
}

/* 保存された進捗 */
.saved-progress {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 16px 0;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #f59e0b;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.save-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.save-details {
  flex: 1;
}

.save-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.save-info {
  color: #6b7280;
  font-size: 13px;
  margin: 2px 0;
}

.save-time {
  color: #9ca3af;
  font-size: 12px;
}

.restore-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f59e0b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.restore-btn:hover {
  background: #d97706;
}

.restore-icon {
  font-size: 12px;
}

/* ダイアログフッター */
.dialog-footer {
  padding: 20px 30px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button,
.offline-button {
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

.cancel-button {
  background: #6b7280;
  color: white;
}

.cancel-button:hover {
  background: #4b5563;
}

.offline-button {
  background: #3b82f6;
  color: white;
}

.offline-button:hover {
  background: #2563eb;
}

.button-icon {
  font-size: 16px;
}

/* オフラインインジケーター */
.offline-indicator {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  z-index: 9000;
  animation: pulse 2s infinite;
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-icon {
  font-size: 16px;
}

.indicator-text {
  font-size: 14px;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
  }
}

/* 接続復旧通知 */
.connection-restored-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  z-index: 9001;
  max-width: 500px;
  width: 90%;
}

.notification-content {
  text-align: center;
}

.notification-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.notification-title {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.notification-subtitle {
  color: #6b7280;
  margin-bottom: 20px;
}

.notification-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.sync-btn,
.stay-offline-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.sync-btn {
  background: #10b981;
  color: white;
}

.sync-btn:hover {
  background: #059669;
}

.stay-offline-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.stay-offline-btn:hover {
  background: #e5e7eb;
}

.btn-icon {
  font-size: 14px;
}

/* データ同期オーバーレイ */
.sync-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9003;
}

.sync-dialog {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.sync-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sync-title {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.sync-progress {
  margin-bottom: 20px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
}

.sync-details {
  text-align: left;
}

.sync-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
}

.sync-item-icon {
  font-size: 16px;
  width: 20px;
}

.sync-item-text {
  color: #374151;
}

/* アニメーション */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* レスポンシブ */
@media (max-width: 640px) {
  .banner-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .offline-dialog {
    margin: 10px;
    border-radius: 16px;
  }
  
  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding: 20px;
  }
  
  .dialog-footer {
    flex-direction: column;
  }
  
  .notification-actions {
    flex-direction: column;
  }
  
  .progress-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .restore-btn {
    align-self: stretch;
    justify-content: center;
  }
}
</style>