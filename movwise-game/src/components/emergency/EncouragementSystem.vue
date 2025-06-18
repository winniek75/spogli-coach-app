<template>
  <div class="encouragement-system">
    <!-- Floating Encouragement Messages -->
    <div 
      v-for="message in visibleMessages"
      :key="message.id"
      class="fixed z-40 pointer-events-none"
      :style="getMessagePosition(message)"
    >
      <div 
        class="encouragement-bubble transform transition-all duration-500"
        :class="getMessageClass(message)"
      >
        <!-- Message bubble -->
        <div class="relative">
          <!-- Avatar -->
          <div class="flex items-start space-x-3 p-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <i class="fas fa-user-tie text-white text-lg"></i>
              </div>
              <!-- Speech bubble tail -->
              <div class="absolute -bottom-2 left-6 w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 transform rotate-45"></div>
            </div>
            
            <!-- Message content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm font-semibold text-green-100">先生より</span>
                <span class="text-xs text-green-200">{{ formatMessageTime(message.timestamp) }}</span>
              </div>
              
              <div class="text-white text-lg leading-relaxed">
                {{ message.text }}
              </div>
              
              <!-- Message type indicator -->
              <div class="flex items-center space-x-2 mt-2">
                <i :class="getMessageIcon(message.type)" class="text-green-300 text-sm"></i>
                <span class="text-xs text-green-200">{{ getMessageTypeText(message.type) }}</span>
              </div>
            </div>
            
            <!-- Close button -->
            <button
              @click="dismissMessage(message.id)"
              class="flex-shrink-0 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors pointer-events-auto"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Encouragement Animation Overlay -->
    <div 
      v-if="showAnimation"
      class="fixed inset-0 z-30 pointer-events-none"
    >
      <!-- Sparkle effects -->
      <div 
        v-for="sparkle in sparkles"
        :key="sparkle.id"
        class="absolute animate-sparkle"
        :style="{
          left: sparkle.x + '%',
          top: sparkle.y + '%',
          animationDelay: sparkle.delay + 's',
          fontSize: sparkle.size + 'px'
        }"
      >
        ✨
      </div>
      
      <!-- Heart effects -->
      <div 
        v-for="heart in hearts"
        :key="heart.id"
        class="absolute animate-heart-float"
        :style="{
          left: heart.x + '%',
          top: heart.y + '%',
          animationDelay: heart.delay + 's',
          fontSize: heart.size + 'px'
        }"
      >
        {{ heart.emoji }}
      </div>
    </div>

    <!-- Message Queue Indicator -->
    <div 
      v-if="messageQueue.length > 0"
      class="fixed bottom-4 left-4 z-40"
    >
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full px-4 py-2 text-white text-sm shadow-lg">
        <i class="fas fa-envelope mr-2"></i>
        {{ messageQueue.length }} 件の新しいメッセージ
      </div>
    </div>

    <!-- Auto-encouragement Settings (for debugging) -->
    <div 
      v-if="showDebugPanel"
      class="fixed top-4 left-4 z-50 bg-slate-800/90 backdrop-blur rounded-lg p-4 text-white text-sm max-w-xs"
    >
      <h4 class="font-semibold mb-2">Encouragement Debug</h4>
      <div class="space-y-1">
        <div>Active Messages: {{ visibleMessages.length }}</div>
        <div>Queue: {{ messageQueue.length }}</div>
        <div>Auto Mode: {{ autoMode ? 'ON' : 'OFF' }}</div>
        <div>Last Sent: {{ lastSentTime ? formatMessageTime(lastSentTime) : 'None' }}</div>
      </div>
      <button
        @click="testEncouragement"
        class="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Test Message
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useEmergencyCallStore } from '@/stores/emergencyCall'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  sessionId: {
    type: String,
    required: true
  },
  autoMode: {
    type: Boolean,
    default: true
  },
  maxVisibleMessages: {
    type: Number,
    default: 3
  },
  showDebugPanel: {
    type: Boolean,
    default: false
  }
})

// Stores
const emergencyStore = useEmergencyCallStore()
const authStore = useAuthStore()

// Reactive data
const visibleMessages = ref([])
const messageQueue = ref([])
const showAnimation = ref(false)
const sparkles = ref([])
const hearts = ref([])
const lastSentTime = ref(null)

// Auto-encouragement tracking
const autoEncouragementTimer = ref(null)
const lastInteractionTime = ref(Date.now())
const strugglingDetected = ref(false)

// Message positioning
const messagePositions = reactive([
  { x: 85, y: 20 }, // Top right
  { x: 85, y: 35 }, // Middle right  
  { x: 85, y: 50 }  // Lower right
])

// Predefined encouragement messages
const encouragementTemplates = reactive({
  general: [
    '頑張ってるね！その調子だよ！🌟',
    '素晴らしい取り組みです！👏',
    '一歩一歩進んでいこう！🚶‍♂️',
    'あなたのペースで大丈夫だよ！😊',
    '先生はいつでもサポートするからね！👩‍🏫'
  ],
  struggling: [
    '難しい時は無理しなくていいよ！🤗',
    'ゆっくりでも確実に進歩してるよ！🐌',
    '分からない時は恥ずかしがらずに聞いてね！💭',
    '間違えても大丈夫！学びの一部だよ！📚',
    '君ならきっとできるよ！💪'
  ],
  success: [
    'やったね！素晴らしい！🎉',
    '完璧な答えだったよ！⭐',
    'その調子で頑張って！🚀',
    '理解が深まってるね！🧠',
    '先生も嬉しいよ！😄'
  ],
  technical: [
    '技術的な問題は解決できたかな？🔧',
    '音声は聞こえるようになった？🔊',
    '画面は正常に表示されてる？📱',
    '何か困ったことがあれば教えてね！💻'
  ]
})

// Computed
const userRole = computed(() => authStore.currentUser?.role || authStore.userRole)

// Methods
const getMessagePosition = (message) => {
  const index = visibleMessages.value.indexOf(message)
  const position = messagePositions[index] || messagePositions[0]
  return {
    right: (100 - position.x) + '%',
    top: position.y + '%'
  }
}

const getMessageClass = (message) => {
  const baseClass = 'animate-message-slide-in'
  const typeClasses = {
    encouragement: 'bg-gradient-to-br from-green-500 to-emerald-600',
    auto_encouragement: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
    instructor_response: 'bg-gradient-to-br from-purple-500 to-pink-600',
    instructor_custom: 'bg-gradient-to-br from-orange-500 to-red-600',
    resolution_confirmation: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    difficulty_adjustment: 'bg-gradient-to-br from-yellow-500 to-amber-600'
  }
  
  return `${baseClass} ${typeClasses[message.type] || typeClasses.encouragement} rounded-2xl shadow-2xl max-w-sm backdrop-blur border border-white/20`
}

const getMessageIcon = (type) => {
  const icons = {
    encouragement: 'fas fa-heart',
    auto_encouragement: 'fas fa-robot',
    instructor_response: 'fas fa-user-tie',
    instructor_custom: 'fas fa-comment',
    resolution_confirmation: 'fas fa-check-circle',
    difficulty_adjustment: 'fas fa-cog'
  }
  return icons[type] || 'fas fa-heart'
}

const getMessageTypeText = (type) => {
  const texts = {
    encouragement: '励ましメッセージ',
    auto_encouragement: '自動メッセージ',
    instructor_response: '先生からの返信',
    instructor_custom: 'カスタムメッセージ',
    resolution_confirmation: '解決確認',
    difficulty_adjustment: '難易度調整'
  }
  return texts[type] || '励ましメッセージ'
}

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '今'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

const addMessage = (messageData) => {
  const message = {
    id: Date.now() + Math.random(),
    text: messageData.text,
    type: messageData.type || 'encouragement',
    timestamp: messageData.timestamp || Date.now(),
    autoSent: messageData.autoSent || false
  }
  
  // Add to queue if too many visible messages
  if (visibleMessages.value.length >= props.maxVisibleMessages) {
    messageQueue.value.push(message)
  } else {
    visibleMessages.value.push(message)
    showEncouragementAnimation()
  }
  
  lastSentTime.value = Date.now()
  
  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    dismissMessage(message.id)
  }, 8000)
}

const dismissMessage = (messageId) => {
  const index = visibleMessages.value.findIndex(msg => msg.id === messageId)
  if (index !== -1) {
    visibleMessages.value.splice(index, 1)
    
    // Show next message from queue
    if (messageQueue.value.length > 0) {
      const nextMessage = messageQueue.value.shift()
      visibleMessages.value.push(nextMessage)
    }
  }
}

const showEncouragementAnimation = () => {
  showAnimation.value = true
  generateSparkles()
  generateHearts()
  
  setTimeout(() => {
    showAnimation.value = false
    sparkles.value = []
    hearts.value = []
  }, 3000)
}

const generateSparkles = () => {
  sparkles.value = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 10,
    delay: Math.random() * 2
  }))
}

const generateHearts = () => {
  const heartEmojis = ['💖', '💝', '💗', '💓', '💕']
  hearts.value = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
    size: 24 + Math.random() * 12,
    delay: Math.random() * 1.5
  }))
}

const sendAutoEncouragement = (context = 'general') => {
  if (!props.autoMode) return
  
  const templates = encouragementTemplates[context] || encouragementTemplates.general
  const message = templates[Math.floor(Math.random() * templates.length)]
  
  addMessage({
    text: message,
    type: 'auto_encouragement',
    autoSent: true
  })
}

const detectStruggling = (gameMetrics) => {
  const {
    consecutiveFailures = 0,
    timeOnCurrentProblem = 0,
    accuracyRate = 1,
    inactivityTime = 0
  } = gameMetrics
  
  // Detect struggling patterns
  if (consecutiveFailures >= 3 || 
      timeOnCurrentProblem > 180000 || // 3 minutes
      accuracyRate < 0.3 ||
      inactivityTime > 60000) { // 1 minute
    
    if (!strugglingDetected.value) {
      strugglingDetected.value = true
      sendAutoEncouragement('struggling')
    }
  } else {
    strugglingDetected.value = false
  }
}

const startAutoEncouragementTimer = () => {
  if (autoEncouragementTimer.value) return
  
  autoEncouragementTimer.value = setInterval(() => {
    const timeSinceLastInteraction = Date.now() - lastInteractionTime.value
    const timeSinceLastMessage = lastSentTime.value ? Date.now() - lastSentTime.value : Infinity
    
    // Send encouragement if student has been inactive for a while
    if (timeSinceLastInteraction > 120000 && // 2 minutes inactive
        timeSinceLastMessage > 180000) { // 3 minutes since last message
      sendAutoEncouragement('general')
    }
  }, 30000) // Check every 30 seconds
}

const stopAutoEncouragementTimer = () => {
  if (autoEncouragementTimer.value) {
    clearInterval(autoEncouragementTimer.value)
    autoEncouragementTimer.value = null
  }
}

const testEncouragement = () => {
  addMessage({
    text: 'これはテストメッセージです！',
    type: 'instructor_custom',
    autoSent: false
  })
}

const trackInteraction = () => {
  lastInteractionTime.value = Date.now()
}

// Setup listeners
const setupListeners = () => {
  // Listen for encouragement messages from store
  emergencyStore.onEncouragementReceived = (message) => {
    addMessage(message)
  }
  
  // Listen for success events
  document.addEventListener('game-success', () => {
    sendAutoEncouragement('success')
    trackInteraction()
  })
  
  // Listen for user interactions
  document.addEventListener('click', trackInteraction)
  document.addEventListener('keydown', trackInteraction)
  document.addEventListener('touchstart', trackInteraction)
}

const cleanupListeners = () => {
  document.removeEventListener('game-success', trackInteraction)
  document.removeEventListener('click', trackInteraction)
  document.removeEventListener('keydown', trackInteraction)
  document.removeEventListener('touchstart', trackInteraction)
}

// Lifecycle
onMounted(() => {
  setupListeners()
  if (props.autoMode) {
    startAutoEncouragementTimer()
  }
})

onUnmounted(() => {
  cleanupListeners()
  stopAutoEncouragementTimer()
})

// Watch for auto mode changes
watch(() => props.autoMode, (newMode) => {
  if (newMode) {
    startAutoEncouragementTimer()
  } else {
    stopAutoEncouragementTimer()
  }
})

// Expose methods for external use
defineExpose({
  addMessage,
  sendAutoEncouragement,
  detectStruggling,
  trackInteraction
})
</script>

<style scoped>
/* Message animations */
@keyframes message-slide-in {
  from {
    transform: translateX(100%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

.animate-message-slide-in {
  animation: message-slide-in 0.5s ease-out forwards;
}

/* Sparkle animation */
@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

/* Heart float animation */
@keyframes heart-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  20% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1.2);
  }
}

.animate-heart-float {
  animation: heart-float 3s ease-out forwards;
}

/* Bubble styling */
.encouragement-bubble {
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .encouragement-bubble {
    max-width: calc(100vw - 2rem);
    margin-right: 1rem;
  }
}

/* Accessibility */
.encouragement-bubble button:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .encouragement-bubble {
    border: 2px solid white;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-message-slide-in,
  .animate-sparkle,
  .animate-heart-float {
    animation: none;
  }
}
</style>