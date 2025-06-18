<template>
  <div class="instructor-notification-panel">
    <!-- Emergency Alert Overlay -->
    <div 
      v-if="hasActiveEmergency"
      class="fixed top-4 right-4 z-50 max-w-sm transform transition-all duration-300"
      :class="{ 'animate-emergency-slide-in': hasActiveEmergency }"
    >
      <div class="emergency-alert bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-2xl border-2 border-red-300">
        <!-- Alert header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <i class="fas fa-exclamation-triangle text-yellow-300"></i>
            </div>
            <div>
              <h3 class="font-bold text-lg">緊急コール受信</h3>
              <p class="text-red-100 text-sm">{{ formatTime(currentCall.timestamp) }}</p>
            </div>
          </div>
          
          <!-- Urgency indicator -->
          <div v-if="currentCall.urgent" class="animate-urgent-flash">
            <i class="fas fa-bolt text-yellow-300 text-xl"></i>
          </div>
        </div>

        <!-- Student information -->
        <div class="mb-4 p-3 bg-white/10 rounded-lg">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white"></i>
            </div>
            <div>
              <div class="font-semibold">{{ currentCall.studentName }}</div>
              <div class="text-red-100 text-sm">セッション: {{ currentCall.sessionId?.slice(-6) }}</div>
            </div>
          </div>
        </div>

        <!-- Problem details -->
        <div class="mb-4">
          <div class="flex items-center space-x-2 mb-2">
            <i class="fas fa-question-circle text-yellow-300"></i>
            <span class="font-semibold">問題内容:</span>
          </div>
          <div class="text-lg bg-white/10 rounded-lg p-3">
            {{ getReasonText(currentCall.reason) }}
          </div>
          <div v-if="currentCall.autoDetected" class="text-xs text-red-200 mt-1">
            <i class="fas fa-robot mr-1"></i>
            システムが自動検出
          </div>
        </div>

        <!-- Action buttons -->
        <div class="space-y-3">
          <!-- Quick resolution -->
          <button
            @click="resolveWithEncouragement"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                   text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <i class="fas fa-heart mr-2"></i>
            励ましメッセージを送信
          </button>
          
          <!-- Send custom message -->
          <button
            @click="showCustomMessage = true"
            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                   text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <i class="fas fa-comment mr-2"></i>
            カスタムメッセージ
          </button>
          
          <!-- Adjust difficulty -->
          <button
            v-if="currentCall.difficultyAdjustment !== 0"
            @click="adjustDifficulty"
            class="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 
                   text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <i class="fas fa-cog mr-2"></i>
            難易度を調整 ({{ currentCall.difficultyAdjustment > 0 ? '上げる' : '下げる' }})
          </button>
          
          <!-- Mark as resolved -->
          <button
            @click="resolveCall"
            class="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 
                   text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <i class="fas fa-check mr-2"></i>
            解決済みにする
          </button>
        </div>

        <!-- Call duration -->
        <div class="mt-4 text-center text-red-100 text-sm">
          通話時間: {{ formatDuration(callDuration) }}
        </div>
      </div>
    </div>

    <!-- Custom Message Modal -->
    <div 
      v-if="showCustomMessage"
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click="hideCustomMessage"
    >
      <div 
        class="custom-message-modal bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 m-4 max-w-md w-full"
        @click.stop
      >
        <!-- Modal header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">カスタムメッセージ</h3>
          <button
            @click="hideCustomMessage"
            class="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Message input -->
        <div class="mb-4">
          <textarea
            v-model="customMessageText"
            placeholder="生徒への励ましメッセージを入力してください..."
            class="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:border-blue-400"
            :maxlength="200"
          ></textarea>
          <div class="text-xs text-gray-400 mt-1">
            {{ customMessageText.length }}/200 文字
          </div>
        </div>

        <!-- Quick templates -->
        <div class="mb-4">
          <div class="text-sm text-gray-300 mb-2">クイックテンプレート:</div>
          <div class="space-y-2">
            <button
              v-for="template in messageTemplates"
              :key="template.id"
              @click="selectTemplate(template.text)"
              class="w-full text-left p-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm transition-colors"
            >
              {{ template.text }}
            </button>
          </div>
        </div>

        <!-- Send button -->
        <button
          @click="sendCustomMessage"
          :disabled="!customMessageText.trim()"
          class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
        >
          <i class="fas fa-paper-plane mr-2"></i>
          メッセージを送信
        </button>
      </div>
    </div>

    <!-- Notification History Panel -->
    <div 
      v-if="showHistory"
      class="fixed bottom-4 right-4 z-40 max-w-sm bg-slate-800/90 backdrop-blur rounded-xl p-4 border border-slate-600"
    >
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-white font-semibold">通話履歴</h4>
        <button
          @click="showHistory = false"
          class="text-gray-400 hover:text-white"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div 
          v-for="call in recentCalls" 
          :key="call.timestamp"
          class="p-2 bg-slate-700/50 rounded text-sm text-white"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-medium">{{ call.studentName }}</div>
              <div class="text-gray-300">{{ getReasonText(call.reason) }}</div>
            </div>
            <div class="text-xs text-gray-400">
              {{ formatTime(call.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audio notification (hidden) -->
    <audio
      ref="notificationAudio"
      preload="auto"
      @ended="onAudioEnded"
    >
      <source src="/sounds/emergency-notification.mp3" type="audio/mpeg">
      <source src="/sounds/emergency-notification.wav" type="audio/wav">
    </audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEmergencyCallStore } from '@/stores/emergencyCall'

// Props
const props = defineProps({
  sessionId: {
    type: String,
    required: true
  }
})

// Store
const emergencyStore = useEmergencyCallStore()

// Reactive data
const showCustomMessage = ref(false)
const showHistory = ref(false)
const customMessageText = ref('')
const notificationAudio = ref(null)
const callDuration = ref(0)
const durationInterval = ref(null)

// Message templates
const messageTemplates = ref([
  { id: 1, text: '大丈夫です！一緒に頑張りましょう！' },
  { id: 2, text: 'ゆっくりでいいので、一歩ずつ進めていきましょう。' },
  { id: 3, text: '素晴らしい質問ですね！説明させていただきます。' },
  { id: 4, text: '困った時はいつでも声をかけてくださいね。' },
  { id: 5, text: 'もう一度詳しく説明しますので、安心してください。' }
])

// Computed
const hasActiveEmergency = computed(() => emergencyStore.hasActiveCall)
const currentCall = computed(() => emergencyStore.activeCall)
const recentCalls = computed(() => emergencyStore.getCallHistory(props.sessionId).slice(0, 10))

// Methods
const getReasonText = (reason) => {
  const reasonMap = {
    'too_difficult': '問題が難しすぎる',
    'too_fast': 'ペースが速すぎる',
    'dont_understand': '内容が理解できない',
    'technical_issue': '技術的な問題',
    'need_explanation': '説明が必要',
    'urgent_help': '緊急ヘルプ要請'
  }
  return reasonMap[reason] || reason
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const resolveWithEncouragement = async () => {
  if (!currentCall.value) return
  
  // Send default encouragement message
  await emergencyStore.sendEncouragementMessage(props.sessionId, {
    text: '大丈夫です！先生がサポートするので安心して続けてくださいね！✨',
    type: 'instructor_response',
    autoSent: false
  })
  
  // Resolve the call
  await resolveCall()
}

const adjustDifficulty = async () => {
  if (!currentCall.value) return
  
  await emergencyStore.applyDifficultyAdjustment(
    props.sessionId, 
    currentCall.value.difficultyAdjustment
  )
  
  await resolveCall()
}

const resolveCall = async () => {
  await emergencyStore.resolveEmergencyCall(props.sessionId)
  stopDurationTimer()
}

const hideCustomMessage = () => {
  showCustomMessage.value = false
  customMessageText.value = ''
}

const selectTemplate = (text) => {
  customMessageText.value = text
}

const sendCustomMessage = async () => {
  if (!customMessageText.value.trim()) return
  
  await emergencyStore.sendEncouragementMessage(props.sessionId, {
    text: customMessageText.value.trim(),
    type: 'instructor_custom',
    autoSent: false
  })
  
  hideCustomMessage()
  await resolveCall()
}

const playNotificationSound = () => {
  if (notificationAudio.value) {
    notificationAudio.value.currentTime = 0
    notificationAudio.value.play().catch(console.error)
  }
}

const triggerVibration = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200])
  }
}

const startDurationTimer = () => {
  if (durationInterval.value) clearInterval(durationInterval.value)
  
  durationInterval.value = setInterval(() => {
    if (currentCall.value) {
      callDuration.value = Date.now() - currentCall.value.timestamp
    }
  }, 1000)
}

const stopDurationTimer = () => {
  if (durationInterval.value) {
    clearInterval(durationInterval.value)
    durationInterval.value = null
  }
  callDuration.value = 0
}

const onAudioEnded = () => {
  // Audio notification ended
}

// Setup emergency call listener
const setupEmergencyListener = () => {
  emergencyStore.onCallCreated = (call) => {
    // Play notification sound
    playNotificationSound()
    
    // Trigger vibration
    triggerVibration()
    
    // Start duration timer
    startDurationTimer()
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('緊急コール受信', {
        body: `${call.studentName}さんからヘルプ要請: ${getReasonText(call.reason)}`,
        icon: '/icons/emergency-icon.png',
        tag: 'emergency-call'
      })
    }
  }
  
  emergencyStore.onCallResolved = () => {
    stopDurationTimer()
  }
}

// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

// Lifecycle
onMounted(() => {
  emergencyStore.setupListeners(props.sessionId)
  setupEmergencyListener()
  requestNotificationPermission()
})

onUnmounted(() => {
  emergencyStore.cleanup()
  stopDurationTimer()
})

// Watch for active call changes
watch(hasActiveEmergency, (hasEmergency) => {
  if (hasEmergency) {
    startDurationTimer()
  } else {
    stopDurationTimer()
  }
})
</script>

<style scoped>
/* Emergency alert animations */
@keyframes emergency-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-emergency-slide-in {
  animation: emergency-slide-in 0.5s ease-out forwards;
}

@keyframes urgent-flash {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.2);
  }
}

.animate-urgent-flash {
  animation: urgent-flash 1s ease-in-out infinite;
}

/* Emergency alert styling */
.emergency-alert {
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.emergency-alert::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  padding: 2px;
  background: linear-gradient(45deg, #ef4444, #dc2626, #ef4444);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: exclude;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: border-glow 2s ease-in-out infinite;
}

@keyframes border-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* Custom message modal */
.custom-message-modal {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Button hover effects */
.emergency-alert button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(100, 116, 139, 0.1);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 68, 68, 0.7);
}

/* Responsive design */
@media (max-width: 640px) {
  .emergency-alert {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }
  
  .custom-message-modal {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
}

/* Accessibility improvements */
.emergency-alert button:focus,
.custom-message-modal button:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .emergency-alert {
    border: 3px solid white;
    background: #dc2626 !important;
  }
  
  .custom-message-modal {
    border: 2px solid white;
    background: #1e293b !important;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-emergency-slide-in,
  .animate-urgent-flash,
  .animate-pulse {
    animation: none;
  }
}
</style>