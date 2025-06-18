<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button 
            @click="handleBack"
            class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all border border-slate-600/50"
          >
            <span class="text-xl">←</span>
            <span class="text-sm text-slate-300">戻る</span>
          </button>
          <h1 class="text-2xl font-bold text-yellow-400">
            🎓 協力学習セッション
          </h1>
        </div>
        
        <div v-if="sessionState.isConnected" class="flex items-center gap-4">
          <div class="session-status connected">
            <div class="status-dot"></div>
            <span class="text-sm">接続中</span>
          </div>
          <div class="text-sm text-slate-400">
            セッション: {{ sessionState.sessionId?.slice(-6) }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 max-w-7xl mx-auto px-6 pb-20">
      
      <!-- Join Session Form -->
      <div v-if="!sessionState.isConnected && !isJoining" class="max-w-md mx-auto">
        <div class="session-card p-8">
          <div class="text-center mb-8">
            <div class="text-6xl mb-4">🎓</div>
            <h2 class="text-2xl font-bold text-yellow-400 mb-2">
              セッションに参加
            </h2>
            <p class="text-slate-400">
              先生から教えてもらった招待コードを入力してください
            </p>
          </div>

          <form @submit.prevent="joinSession" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                招待コード
              </label>
              <input
                v-model="inviteCode"
                type="text"
                placeholder="例: ABC123"
                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white uppercase tracking-widest text-center text-lg"
                maxlength="6"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                あなたの名前
              </label>
              <input
                v-model="studentName"
                type="text"
                placeholder="田中太郎"
                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="!inviteCode || !studentName"
              class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              セッションに参加
            </button>
          </form>
        </div>
      </div>

      <!-- Joining Status -->
      <div v-if="isJoining" class="max-w-md mx-auto">
        <div class="session-card p-8 text-center">
          <div class="loading-spinner mb-4"></div>
          <h3 class="text-xl font-bold text-yellow-400 mb-2">接続中...</h3>
          <p class="text-slate-400">セッションに参加しています</p>
        </div>
      </div>

      <!-- Active Session -->
      <div v-if="sessionState.isConnected" class="space-y-6">
        
        <!-- Session Info -->
        <div class="session-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-yellow-400">
                {{ teacherInfo?.name || '先生' }}の学習セッション
              </h3>
              <p class="text-slate-400">{{ teacherInfo?.subject || '英語学習' }}</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-sm text-slate-400">
                参加者: {{ participantCount }}名
              </div>
              <button
                @click="startScreenShare"
                :disabled="isScreenSharing"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {{ isScreenSharing ? '画面共有中' : '画面を共有' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Teacher Guidance Display -->
        <div v-if="currentGuidance" class="guidance-card">
          <div class="flex items-start gap-4">
            <div class="guidance-icon">
              {{ getGuidanceIcon(currentGuidance.type) }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-bold text-yellow-400">先生からのアドバイス</h4>
                <button 
                  @click="dismissGuidance"
                  class="text-slate-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <div class="guidance-content">
                {{ currentGuidance.data.message || currentGuidance.data.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- Game Area -->
        <div class="game-area">
          <div class="session-card p-6">
            <div class="text-center">
              <h3 class="text-xl font-bold text-yellow-400 mb-4">
                🎮 学習ゲームエリア
              </h3>
              <p class="text-slate-400 mb-6">
                このエリアで学習ゲームをプレイします。<br>
                先生があなたの画面を見て、リアルタイムでサポートします。
              </p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  @click="navigateToGame('grammar-galaxy-foundation')"
                  class="game-button"
                >
                  <div class="text-3xl mb-2">🌌</div>
                  <div class="font-bold">文法銀河</div>
                </button>
                <button
                  @click="navigateToGame('SoundAdventureHub')"
                  class="game-button"
                >
                  <div class="text-3xl mb-2">🎵</div>
                  <div class="font-bold">サウンド星雲</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Annotations -->
        <div v-if="activeAnnotations.length > 0" class="annotations-overlay">
          <div
            v-for="annotation in activeAnnotations"
            :key="annotation.id"
            :class="['annotation', `annotation-${annotation.type}`]"
            :style="getAnnotationStyle(annotation)"
          >
            <div v-if="annotation.type === 'text'" class="annotation-text">
              {{ annotation.content }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collaborativeSession } from '@/services/collaborativeSession'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  inviteCode: String
})

// Reactive state
const inviteCode = ref(props.inviteCode || route.params.inviteCode || '')
const studentName = ref('')
const isJoining = ref(false)
const isScreenSharing = ref(false)
const currentGuidance = ref(null)
const activeAnnotations = ref([])

// Collaborative session state
const sessionState = computed(() => collaborativeSession.sessionState)

const teacherInfo = computed(() => {
  const participants = sessionState.value.participants || []
  return participants.find(p => p.role === 'teacher')
})

const participantCount = computed(() => {
  return (sessionState.value.participants || []).length
})

// Methods
const joinSession = async () => {
  if (!inviteCode.value || !studentName.value) return

  try {
    isJoining.value = true
    console.log(`🔄 Attempting to join session with code: ${inviteCode.value}`)

    // Initialize collaborative session
    console.log('📡 Initializing collaborative session...')
    await collaborativeSession.initialize('ws://localhost:3001')
    console.log('✅ Collaborative session initialized')

    // Join session
    console.log('🚪 Joining session...')
    const result = await collaborativeSession.joinStudentSession(inviteCode.value, {
      name: studentName.value,
      grade: '中学生', // デフォルト値
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    })

    console.log('✅ Successfully joined session:', result)

  } catch (error) {
    console.error('❌ Failed to join session:', error)
    
    let errorMessage = 'セッションへの参加に失敗しました'
    
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      errorMessage += ': 接続がタイムアウトしました。WebSocketサーバーが起動していることを確認してください。'
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection refused')) {
      errorMessage += ': WebSocketサーバーに接続できません。サーバーが起動していることを確認してください。'
    } else if (error.message.includes('Session not found') || error.message.includes('Invalid invite code')) {
      errorMessage += ': 招待コードが正しくないか、セッションが存在しません。'
    } else {
      errorMessage += `: ${error.message}`
    }
    
    alert(errorMessage)
  } finally {
    isJoining.value = false
  }
}

const startScreenShare = async () => {
  try {
    isScreenSharing.value = true
    await collaborativeSession.startScreenShare()
    console.log('🖥️ Screen sharing started')
  } catch (error) {
    console.error('❌ Failed to start screen sharing:', error)
    alert('画面共有の開始に失敗しました: ' + error.message)
    isScreenSharing.value = false
  }
}

const navigateToGame = (gameRoute) => {
  // ゲーム状態を同期してからナビゲート
  collaborativeSession.syncGameState({
    gameType: gameRoute,
    level: 1,
    score: 0,
    progress: 0,
    currentQuestion: null,
    studentResponse: null
  })

  router.push({ name: gameRoute })
}

const dismissGuidance = () => {
  currentGuidance.value = null
}

const getGuidanceIcon = (type) => {
  const icons = {
    hint: '💡',
    correction: '✏️',
    encouragement: '👏',
    annotation: '📝',
    question: '❓'
  }
  return icons[type] || '💬'
}

const getAnnotationStyle = (annotation) => {
  return {
    left: annotation.position?.x + 'px',
    top: annotation.position?.y + 'px',
    width: annotation.position?.width + 'px',
    height: annotation.position?.height + 'px'
  }
}

const handleBack = () => {
  if (sessionState.value.isConnected) {
    const confirmLeave = confirm('セッションから退出しますか？')
    if (confirmLeave) {
      collaborativeSession.endSession()
      router.push({ name: 'home' })
    }
  } else {
    router.push({ name: 'home' })
  }
}

// Lifecycle
onMounted(() => {
  // Set up collaborative session callbacks
  collaborativeSession.onTeacherGuidance = (guidance) => {
    console.log('📝 Received teacher guidance:', guidance)
    
    if (guidance.type === 'annotation') {
      // Add annotation to active annotations
      const annotation = {
        id: Date.now(),
        ...guidance.data,
        timestamp: Date.now()
      }
      activeAnnotations.value.push(annotation)
      
      // Remove annotation after duration
      setTimeout(() => {
        const index = activeAnnotations.value.findIndex(a => a.id === annotation.id)
        if (index !== -1) {
          activeAnnotations.value.splice(index, 1)
        }
      }, guidance.data.duration || 5000)
    } else {
      // Show guidance message
      currentGuidance.value = guidance
    }
  }

  collaborativeSession.onRealtimeAction = (action) => {
    console.log('⚡ Received real-time action:', action)
    // Handle real-time actions from teacher
  }
})

onUnmounted(() => {
  if (sessionState.value.isConnected) {
    collaborativeSession.endSession()
  }
})
</script>

<style scoped>
/* Base Styles */
.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

/* Cards */
.session-card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(20px);
}

.guidance-card {
  background: rgba(251, 191, 36, 0.1);
  border: 2px solid rgba(251, 191, 36, 0.4);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(20px);
}

.guidance-icon {
  @apply text-2xl w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center;
}

.guidance-content {
  @apply text-slate-200 leading-relaxed;
}

/* Session Status */
.session-status {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg;
}

.session-status.connected {
  @apply bg-green-500/20 text-green-400;
}

.status-dot {
  @apply w-2 h-2 rounded-full bg-current animate-pulse;
}

/* Game Buttons */
.game-button {
  @apply p-6 bg-slate-800/50 hover:bg-slate-700/70 border-2 border-slate-600/50 hover:border-blue-500/50 rounded-xl transition-all text-center;
}

.game-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

/* Loading Spinner */
.loading-spinner {
  @apply w-8 h-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto;
}

/* Annotations */
.annotations-overlay {
  @apply fixed inset-0 pointer-events-none z-50;
}

.annotation {
  @apply absolute pointer-events-none;
}

.annotation-highlight {
  @apply bg-yellow-400/20 border-2 border-yellow-400 rounded;
}

.annotation-arrow {
  @apply border-l-4 border-l-red-500 border-t-4 border-t-transparent border-b-4 border-b-transparent;
}

.annotation-circle {
  @apply border-4 border-red-500 rounded-full bg-red-500/10;
}

.annotation-text {
  @apply bg-slate-900/90 text-white px-3 py-2 rounded-lg text-sm font-medium;
}

/* Responsive Design */
@media (max-width: 768px) {
  .session-card {
    @apply mx-4;
  }
  
  .game-area .grid {
    @apply grid-cols-1;
  }
}
</style>