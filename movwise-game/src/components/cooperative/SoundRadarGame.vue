<template>
  <div class="sound-radar-game min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
    <!-- Stars Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="absolute bg-white rounded-full animate-pulse"
        :style="{
          left: star.x + '%',
          top: star.y + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          animationDelay: star.delay + 's'
        }"
      ></div>
    </div>

    <!-- Game Header -->
    <header class="relative z-10 p-6 text-white">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-satellite-dish text-xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Sound Radar Command Center
            </h1>
            <p class="text-blue-200 text-sm">宇宙音素レーダー探査</p>
          </div>
        </div>
        
        <!-- Emergency Call Button -->
        <EmergencyCallButton 
          v-if="userRole === 'copilot'"
          @emergency="handleEmergencyCall"
          :disabled="gameState.emergency?.active"
        />
        
        <!-- Session Status -->
        <div class="text-right">
          <div class="text-sm text-cyan-300">
            セッション: {{ sessionId }}
          </div>
          <div class="text-xs text-blue-200">
            状態: {{ gameState.status }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Game Area -->
    <main class="relative z-10 flex-1 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Radar Display (Captain/Co-Pilot shared view) -->
          <div class="lg:col-span-2">
            <RadarDisplay
              :current-phoneme="currentPhoneme"
              :scanning="isScanning"
              :phoneme-detected="phonemeDetected"
              :user-role="userRole"
              :radar-data="radarData"
              @start-scan="startPhonemeScanning"
              @phoneme-found="onPhonemeFound"
            />
          </div>

          <!-- Control Panel -->
          <div class="space-y-6">
            
            <!-- Phoneme Detector (Co-Pilot) -->
            <PhonemeDetector
              v-if="userRole === 'copilot'"
              :target-phoneme="currentPhoneme"
              :is-active="phonemeDetected && !pronunciationComplete"
              @pronunciation-result="handlePronunciationResult"
              @audio-data="handleAudioData"
            />

            <!-- Captain Controls -->
            <div v-if="userRole === 'captain'" class="space-y-4">
              <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-cyan-500/30">
                <h3 class="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
                  <i class="fas fa-user-tie mr-2"></i>
                  Captain Controls
                </h3>
                
                <div class="space-y-3">
                  <button
                    @click="startNewScan"
                    :disabled="isScanning || gameState.status !== 'active'"
                    class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 
                           disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg 
                           transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
                  >
                    <i class="fas fa-radar mr-2"></i>
                    新規スキャン開始
                  </button>
                  
                  <button
                    @click="nextPhoneme"
                    :disabled="!canProceedToNext"
                    class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                           disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg 
                           transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
                  >
                    <i class="fas fa-arrow-right mr-2"></i>
                    次の音素へ
                  </button>
                </div>
              </div>
            </div>

            <!-- Cooperative Scoring -->
            <CooperativeScoring
              :captain-score="gameState.progress?.captainScore || 0"
              :copilot-score="gameState.progress?.coPilotScore || 0"
              :total-score="gameState.progress?.score || 0"
              :current-phase="gameState.progress?.currentPhase || 0"
              :total-phases="gameState.progress?.totalPhases || 5"
              :recent-success="recentSuccess"
            />

            <!-- Communication Panel -->
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-cyan-500/30">
              <h3 class="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
                <i class="fas fa-comments mr-2"></i>
                通信
              </h3>
              
              <!-- Emergency Alert -->
              <div 
                v-if="gameState.emergency?.active"
                class="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg animate-pulse"
              >
                <div class="flex items-center text-red-300">
                  <i class="fas fa-exclamation-triangle mr-2"></i>
                  緊急コール受信中
                </div>
                <p class="text-sm text-red-200 mt-1">
                  {{ gameState.emergency.message || 'Co-Pilotがヘルプを求めています' }}
                </p>
                <button
                  v-if="userRole === 'captain'"
                  @click="resolveEmergency"
                  class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  対応完了
                </button>
              </div>

              <!-- Status Messages -->
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div 
                  v-for="message in recentMessages" 
                  :key="message.id"
                  class="text-sm p-2 bg-slate-700/50 rounded border-l-2"
                  :class="getMessageStyle(message)"
                >
                  <span class="font-medium">{{ message.fromRole === 'captain' ? 'Captain' : 'Co-Pilot' }}:</span>
                  {{ message.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success Animation Overlay -->
    <div 
      v-if="showSuccessAnimation"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <!-- Confetti particles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          v-for="particle in confettiParticles" 
          :key="particle.id"
          class="absolute w-3 h-3 animate-confetti-fall"
          :style="{
            left: particle.x + '%',
            backgroundColor: particle.color,
            animationDelay: particle.delay + 's',
            animationDuration: particle.duration + 's'
          }"
        ></div>
      </div>

      <!-- Success content -->
      <div class="text-center text-white space-y-6 animate-system-boot">
        <!-- Success icon with explosion effect -->
        <div class="relative">
          <div class="text-8xl animate-success-explosion">🎯</div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full animate-radar-ping"></div>
          </div>
        </div>

        <!-- Success title with neon effect -->
        <h2 class="text-5xl font-bold neon-cyan animate-achievement-glow">
          音素発見成功！
        </h2>
        
        <!-- Phoneme info -->
        <div class="space-y-2">
          <p class="text-2xl text-blue-200">
            {{ currentPhoneme?.symbol }} - {{ currentPhoneme?.ipa }}
          </p>
          <p class="text-lg text-cyan-300">
            協力ミッション完了
          </p>
        </div>

        <!-- Team celebration -->
        <div class="flex justify-center space-x-8 mt-8">
          <div class="text-center animate-team-sync">
            <div class="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-tie text-white text-xl"></i>
            </div>
            <div class="text-cyan-300 font-medium">Captain</div>
            <div class="text-white text-sm">発見成功!</div>
          </div>
          
          <div class="flex items-center">
            <div class="w-16 h-1 bg-gradient-to-r from-cyan-400 to-green-400 animate-connection-pulse"></div>
          </div>
          
          <div class="text-center animate-team-sync animate-delay-1">
            <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-astronaut text-white text-xl"></i>
            </div>
            <div class="text-green-300 font-medium">Co-Pilot</div>
            <div class="text-white text-sm">発音成功!</div>
          </div>
        </div>

        <!-- Score celebration -->
        <div class="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 glass-morphism-dark">
          <div class="text-purple-300 text-sm mb-2">獲得ポイント</div>
          <div class="text-4xl font-bold neon-purple animate-score-bounce">
            +{{ (recentSuccess?.bonusPoints || 150) }}
          </div>
          <div class="text-pink-200 text-sm mt-2">チームワークボーナス</div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div 
      v-if="isLoading"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div class="text-center text-white">
        <div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg">{{ loadingMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCooperativeGameStore } from '@/stores/cooperativeGame'
import { useAuthStore } from '@/stores/auth'
import { cooperativeGameService } from '@/services/cooperativeGameService'
import { NATIVE_PHONEME_PROGRESSION as PHONEME_PROGRESSION } from '@/data/native-phoneme-database.js'
import RadarDisplay from './RadarDisplay.vue'
import PhonemeDetector from './PhonemeDetector.vue'
import CooperativeScoring from './CooperativeScoring.vue'
import EmergencyCallButton from './EmergencyCallButton.vue'

// Props
const props = defineProps({
  sessionId: {
    type: String,
    required: true
  }
})

// Stores
const gameStore = useCooperativeGameStore()
const authStore = useAuthStore()

// Reactive data
const gameState = reactive({
  status: 'waiting',
  progress: {
    currentPhase: 0,
    totalPhases: 5,
    captainScore: 0,
    coPilotScore: 0,
    score: 0
  },
  emergency: null
})

const isLoading = ref(false)
const loadingMessage = ref('')
const isScanning = ref(false)
const phonemeDetected = ref(false)
const pronunciationComplete = ref(false)
const showSuccessAnimation = ref(false)
const recentSuccess = ref(null)
const recentMessages = ref([])

// Current game data
const currentPhoneme = ref(null)
const radarData = ref({
  signals: [],
  scanAngle: 0,
  foundSignals: []
})

// Stars for background
const stars = ref([])

// Confetti particles for success animation
const confettiParticles = ref([])

// Computed
const userRole = computed(() => authStore.currentUser?.role || authStore.userRole)

const canProceedToNext = computed(() => {
  return pronunciationComplete.value && 
         gameState.status === 'active' && 
         userRole.value === 'captain'
})

// Methods
const initializeGame = async () => {
  isLoading.value = true
  loadingMessage.value = 'ゲームを初期化中...'

  try {
    // Join or create session
    if (userRole.value === 'captain') {
      await createGameSession()
    } else {
      await joinGameSession()
    }

    // Initialize phoneme progression
    initializePhonemes()
    
    // Set up real-time listeners
    setupRealtimeListeners()
    
    // Generate background stars
    generateStars()
    
  } catch (error) {
    console.error('Failed to initialize game:', error)
  } finally {
    isLoading.value = false
  }
}

const createGameSession = async () => {
  const gameConfig = {
    type: 'soundRadar',
    difficulty: 'beginner',
    totalPhases: 5,
    maxDuration: 30,
    gameData: {
      phonemeStage: 'stage1A',
      currentPhonemeIndex: 0
    }
  }

  const result = await cooperativeGameService.createSession(gameConfig)
  if (!result.success) {
    throw new Error(result.error)
  }
}

const joinGameSession = async () => {
  const result = await cooperativeGameService.joinSession(props.sessionId)
  if (!result.success) {
    throw new Error(result.error)
  }
}

const initializePhonemes = () => {
  const phonemes = PHONEME_PROGRESSION.stage1A
  currentPhoneme.value = phonemes[0]
}

const setupRealtimeListeners = () => {
  // Override service event handlers
  cooperativeGameService.onSessionUpdate = (sessionData) => {
    Object.assign(gameState, sessionData)
  }

  cooperativeGameService.onProgressUpdate = (progressData) => {
    Object.assign(gameState.progress, progressData)
  }

  cooperativeGameService.onEmergencyUpdate = (emergencyData) => {
    gameState.emergency = emergencyData
  }

  cooperativeGameService.onMessagesUpdate = (messages) => {
    recentMessages.value = messages.slice(-5) // Keep last 5 messages
  }
}

const generateStars = () => {
  stars.value = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2
  }))
}

const startNewScan = async () => {
  if (userRole.value !== 'captain') return

  isScanning.value = true
  phonemeDetected.value = false
  pronunciationComplete.value = false

  // Update game state
  await cooperativeGameService.updateProgress({
    scanning: true,
    currentPhoneme: currentPhoneme.value
  })

  // Simulate radar scanning
  setTimeout(() => {
    startPhonemeScanning()
  }, 1000)
}

const startPhonemeScanning = () => {
  // Animate radar sweep
  const scanInterval = setInterval(() => {
    radarData.value.scanAngle += 5
    if (radarData.value.scanAngle >= 360) {
      radarData.value.scanAngle = 0
    }
  }, 50)

  // Simulate phoneme detection after scanning
  setTimeout(() => {
    clearInterval(scanInterval)
    onPhonemeFound()
  }, 3000)
}

const onPhonemeFound = async () => {
  phonemeDetected.value = true
  isScanning.value = false

  // Add signal to radar
  radarData.value.foundSignals.push({
    phoneme: currentPhoneme.value,
    angle: Math.random() * 360,
    distance: Math.random() * 0.8 + 0.2,
    timestamp: Date.now()
  })

  // Update game state
  await cooperativeGameService.updateProgress({
    phonemeDetected: true,
    scanning: false
  })

  // Send message to co-pilot
  await cooperativeGameService.sendMessage(
    `音素 ${currentPhoneme.value.symbol} を発見！Co-Pilotの発音をお願いします`,
    'game_update'
  )
}

const handlePronunciationResult = async (result) => {
  if (!phonemeDetected.value) return

  const { accuracy, isCorrect, audioData } = result

  if (isCorrect && accuracy > 0.8) {
    pronunciationComplete.value = true
    
    // Update scores
    const captainScore = gameState.progress.captainScore + 50 // Discovery bonus
    const coPilotScore = gameState.progress.coPilotScore + Math.round(accuracy * 100)
    
    await cooperativeGameService.updateScore('captain', captainScore)
    await cooperativeGameService.updateScore('copilot', coPilotScore)

    // Show success animation
    showSuccessEffect()
    
    // Send success message
    await cooperativeGameService.sendMessage(
      `音素 ${currentPhoneme.value.symbol} 発音成功！ 精度: ${Math.round(accuracy * 100)}%`,
      'success'
    )
  } else {
    // Encourage retry
    await cooperativeGameService.sendMessage(
      `もう一度お試しください。目標音素: ${currentPhoneme.value.symbol}`,
      'encouragement'
    )
  }
}

const handleAudioData = (audioData) => {
  // Process audio data for visualization
  // This could be used for real-time audio visualization
}

const nextPhoneme = async () => {
  if (userRole.value !== 'captain' || !canProceedToNext.value) return

  const phonemes = PHONEME_PROGRESSION.stage1A
  const currentIndex = phonemes.findIndex(p => p.symbol === currentPhoneme.value.symbol)
  
  if (currentIndex < phonemes.length - 1) {
    currentPhoneme.value = phonemes[currentIndex + 1]
    
    // Reset game state for next phoneme
    phonemeDetected.value = false
    pronunciationComplete.value = false
    radarData.value.foundSignals = []
    
    // Update phase progress
    await cooperativeGameService.updateProgress({
      currentPhase: gameState.progress.currentPhase + 1,
      currentPhoneme: currentPhoneme.value,
      phonemeDetected: false
    })

    await cooperativeGameService.sendMessage(
      `次の音素: ${currentPhoneme.value.symbol} の探索を開始します`,
      'phase_change'
    )
  } else {
    // Game complete
    await cooperativeGameService.endSession()
    showGameCompleteAnimation()
  }
}

const showSuccessEffect = () => {
  showSuccessAnimation.value = true
  recentSuccess.value = {
    phoneme: currentPhoneme.value.symbol,
    timestamp: Date.now(),
    bonusPoints: 150
  }

  // Generate confetti particles
  generateConfetti()

  setTimeout(() => {
    showSuccessAnimation.value = false
    confettiParticles.value = []
  }, 4000)
}

const generateConfetti = () => {
  const colors = ['#22d3ee', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#ec4899']
  confettiParticles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }))
}

const showGameCompleteAnimation = () => {
  // Implementation for game completion
  console.log('Game completed!')
}

const handleEmergencyCall = async (message) => {
  await cooperativeGameService.sendEmergencyCall(message)
}

const resolveEmergency = async () => {
  await cooperativeGameService.resolveEmergencyCall()
}

const getMessageStyle = (message) => {
  const styles = {
    success: 'border-green-500 text-green-300',
    error: 'border-red-500 text-red-300',
    game_update: 'border-blue-500 text-blue-300',
    encouragement: 'border-yellow-500 text-yellow-300',
    phase_change: 'border-purple-500 text-purple-300'
  }
  return styles[message.type] || 'border-gray-500 text-gray-300'
}

// Lifecycle
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  cooperativeGameService.cleanup()
})

// Watch for session changes
watch(() => props.sessionId, (newSessionId) => {
  if (newSessionId) {
    initializeGame()
  }
})
</script>

<style scoped>
@import '@/assets/css/sound-radar-animations.css';

.sound-radar-game {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Component-specific styles */
.radar-sweep {
  animation: radar-sweep 3s linear infinite;
}

.phoneme-pulse {
  animation: phoneme-pulse 2s ease-in-out infinite;
}
</style>