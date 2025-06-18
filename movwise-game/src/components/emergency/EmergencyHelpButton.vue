<template>
  <div class="emergency-help-button relative">
    <!-- Main Emergency Button - Large and Child-Friendly -->
    <button
      @click="showReasonSelection"
      :disabled="isDisabled || hasActiveCall"
      class="help-button relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95"
      :class="getButtonClass()"
    >
      <!-- Background glow animation -->
      <div class="absolute inset-0 rounded-full opacity-30">
        <div class="w-full h-full rounded-full animate-help-glow" :class="getGlowClass()"></div>
      </div>
      
      <!-- Icon and text -->
      <div class="relative z-10 flex flex-col items-center justify-center text-white p-6">
        <!-- Main icon with bounce animation -->
        <div class="text-6xl mb-3 animate-help-bounce">
          <i v-if="!hasActiveCall" class="fas fa-hand-paper"></i>
          <i v-else class="fas fa-check-circle"></i>
        </div>
        
        <!-- Button text -->
        <div class="text-center">
          <div class="text-2xl font-bold mb-1">
            {{ hasActiveCall ? '先生に連絡済み' : '先生助けて！' }}
          </div>
          <div class="text-lg opacity-90">
            {{ hasActiveCall ? 'もう少し待ってね' : '困った時はここを押してね' }}
          </div>
        </div>
      </div>
      
      <!-- Pulse rings for attention -->
      <div v-if="!hasActiveCall" class="absolute inset-0 flex items-center justify-center">
        <div 
          v-for="ring in pulseRings" 
          :key="ring.id"
          class="absolute border-4 rounded-full animate-help-pulse"
          :class="ring.class"
          :style="{
            width: ring.size + 'px',
            height: ring.size + 'px',
            animationDelay: ring.delay + 's'
          }"
        ></div>
      </div>
      
      <!-- Active call indicator -->
      <div 
        v-if="hasActiveCall"
        class="absolute top-4 right-4 flex items-center space-x-2 bg-green-500 rounded-full px-3 py-1"
      >
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span class="text-white text-sm font-medium">通話中</span>
      </div>
    </button>

    <!-- Reason Selection Modal -->
    <div 
      v-if="showReasonModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click="hideReasonSelection"
    >
      <div 
        class="reason-modal bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 m-4 max-w-md w-full relative"
        @click.stop
      >
        <!-- Close button -->
        <button
          @click="hideReasonSelection"
          class="absolute top-4 right-4 w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Modal header -->
        <div class="text-center mb-6">
          <div class="text-5xl mb-4">🤔</div>
          <h2 class="text-2xl font-bold text-white mb-2">どんなことで困っているの？</h2>
          <p class="text-purple-200">教えてくれると先生が助けやすくなるよ！</p>
        </div>
        
        <!-- Reason options -->
        <div class="space-y-3 mb-6">
          <button
            v-for="reason in helpReasons"
            :key="reason.id"
            @click="selectReason(reason)"
            class="w-full p-4 bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-500/70 hover:to-pink-500/70 
                   rounded-2xl text-white text-left transition-all duration-200 transform hover:scale-[1.02] border border-purple-400/30"
          >
            <div class="flex items-center space-x-3">
              <div class="text-2xl">{{ reason.icon }}</div>
              <div>
                <div class="font-semibold">{{ reason.title }}</div>
                <div class="text-sm text-purple-200">{{ reason.description }}</div>
              </div>
            </div>
          </button>
        </div>
        
        <!-- Quick help button -->
        <button
          @click="sendQuickHelp"
          class="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                 rounded-2xl text-white font-bold text-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          <i class="fas fa-exclamation-triangle mr-2"></i>
          今すぐ助けて！
        </button>
      </div>
    </div>

    <!-- Encouragement Messages Overlay -->
    <div 
      v-if="showEncouragement"
      class="fixed bottom-4 right-4 z-40 max-w-sm"
    >
      <div 
        v-for="message in activeEncouragements"
        :key="message.id"
        class="encouragement-message bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-3 text-white shadow-lg transform animate-slide-in"
      >
        <div class="flex items-start space-x-3">
          <div class="text-2xl">👩‍🏫</div>
          <div>
            <div class="font-semibold text-sm">先生からのメッセージ</div>
            <div class="text-lg">{{ message.text }}</div>
          </div>
          <button
            @click="dismissEncouragement(message.id)"
            class="ml-auto text-white/70 hover:text-white"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Call Status Indicator -->
    <div 
      v-if="hasActiveCall"
      class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center animate-pulse shadow-lg"
    >
      <i class="fas fa-phone text-white text-sm"></i>
    </div>

    <!-- Help animations -->
    <div 
      v-if="showHelpAnimation"
      class="fixed inset-0 z-30 pointer-events-none"
    >
      <!-- Flying hearts animation -->
      <div 
        v-for="heart in flyingHearts"
        :key="heart.id"
        class="absolute text-4xl animate-heart-fly"
        :style="{
          left: heart.x + '%',
          top: heart.y + '%',
          animationDelay: heart.delay + 's'
        }"
      >
        {{ heart.emoji }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useEmergencyCallStore } from '@/stores/emergencyCall'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  sessionId: {
    type: String,
    required: true
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
})

// Stores
const emergencyStore = useEmergencyCallStore()
const authStore = useAuthStore()

// Reactive data
const showReasonModal = ref(false)
const showEncouragement = ref(false)
const showHelpAnimation = ref(false)
const activeEncouragements = ref([])
const flyingHearts = ref([])

// Pulse rings for attention
const pulseRings = reactive([
  { id: 1, size: 200, class: 'border-yellow-400', delay: 0 },
  { id: 2, size: 240, class: 'border-orange-400', delay: 0.4 },
  { id: 3, size: 280, class: 'border-red-400', delay: 0.8 }
])

// Help reasons
const helpReasons = reactive([
  {
    id: 'too_difficult',
    icon: '😵',
    title: '難しすぎる',
    description: '問題が難しくて分からない',
    difficultyAdjustment: -1
  },
  {
    id: 'too_fast',
    icon: '💨',
    title: '速すぎる',
    description: 'もう少しゆっくりやりたい',
    difficultyAdjustment: -1
  },
  {
    id: 'dont_understand',
    icon: '❓',
    title: '分からない',
    description: '何をすればいいか分からない',
    difficultyAdjustment: 0
  },
  {
    id: 'technical_issue',
    icon: '🔧',
    title: '動かない',
    description: '音が聞こえない・画面がおかしい',
    difficultyAdjustment: 0
  },
  {
    id: 'need_explanation',
    icon: '💡',
    title: '説明がほしい',
    description: 'もう一度説明してほしい',
    difficultyAdjustment: 0
  }
])

// Computed
const hasActiveCall = computed(() => emergencyStore.hasActiveCall)
const userRole = computed(() => authStore.currentUser?.role || authStore.userRole)

const getButtonClass = () => {
  if (props.isDisabled) {
    return 'w-80 h-80 bg-gray-600 cursor-not-allowed opacity-50 rounded-full'
  } else if (hasActiveCall.value) {
    return 'w-80 h-80 bg-gradient-to-br from-green-500 to-green-600 cursor-default rounded-full shadow-2xl shadow-green-500/30'
  } else {
    return 'w-80 h-80 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 cursor-pointer rounded-full shadow-2xl hover:shadow-red-500/40'
  }
}

const getGlowClass = () => {
  if (hasActiveCall.value) {
    return 'bg-gradient-to-br from-green-300/50 to-green-400/50'
  } else {
    return 'bg-gradient-to-br from-red-300/50 to-yellow-300/50'
  }
}

// Methods
const showReasonSelection = () => {
  if (props.isDisabled || hasActiveCall.value) return
  showReasonModal.value = true
}

const hideReasonSelection = () => {
  showReasonModal.value = false
}

const selectReason = async (reason) => {
  hideReasonSelection()
  
  await emergencyStore.createEmergencyCall({
    sessionId: props.sessionId,
    reason: reason.id,
    reasonText: reason.title,
    difficultyAdjustment: reason.difficultyAdjustment,
    autoDetected: false
  })
  
  showHelpRequestAnimation()
}

const sendQuickHelp = async () => {
  hideReasonSelection()
  
  await emergencyStore.createEmergencyCall({
    sessionId: props.sessionId,
    reason: 'urgent_help',
    reasonText: '緊急ヘルプ要請',
    difficultyAdjustment: -1,
    autoDetected: false,
    urgent: true
  })
  
  showHelpRequestAnimation()
}

const showHelpRequestAnimation = () => {
  showHelpAnimation.value = true
  generateFlyingHearts()
  
  setTimeout(() => {
    showHelpAnimation.value = false
    flyingHearts.value = []
  }, 3000)
}

const generateFlyingHearts = () => {
  const emojis = ['💛', '🧡', '❤️', '💚', '💙', '💜', '🌟', '✨']
  flyingHearts.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    delay: Math.random() * 2
  }))
}

const dismissEncouragement = (messageId) => {
  activeEncouragements.value = activeEncouragements.value.filter(msg => msg.id !== messageId)
  if (activeEncouragements.value.length === 0) {
    showEncouragement.value = false
  }
}

// Setup real-time listeners
const setupListeners = () => {
  // Listen for encouragement messages
  emergencyStore.onEncouragementReceived = (message) => {
    activeEncouragements.value.push({
      id: Date.now(),
      text: message.text,
      timestamp: message.timestamp
    })
    showEncouragement.value = true
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      dismissEncouragement(activeEncouragements.value[0]?.id)
    }, 10000)
  }
  
  // Listen for call resolution
  emergencyStore.onCallResolved = () => {
    // Show thank you message
    activeEncouragements.value.push({
      id: Date.now(),
      text: '先生が確認したよ！頑張って続けよう！',
      timestamp: Date.now()
    })
    showEncouragement.value = true
  }
}

// Lifecycle
onMounted(() => {
  setupListeners()
})

onUnmounted(() => {
  emergencyStore.cleanup()
})
</script>

<style scoped>
/* Help button animations */
@keyframes help-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.animate-help-glow {
  animation: help-glow 2s ease-in-out infinite;
}

@keyframes help-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-help-bounce {
  animation: help-bounce 2s ease-in-out infinite;
}

@keyframes help-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.animate-help-pulse {
  animation: help-pulse 2s ease-out infinite;
}

/* Heart flying animation */
@keyframes heart-fly {
  0% {
    transform: translateY(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(-20px) rotate(45deg) scale(1);
  }
  90% {
    opacity: 1;
    transform: translateY(-200px) rotate(405deg) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-220px) rotate(450deg) scale(0);
  }
}

.animate-heart-fly {
  animation: heart-fly 3s ease-out forwards;
}

/* Slide in animation for encouragement messages */
@keyframes slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.5s ease-out forwards;
}

/* Reason modal animations */
.reason-modal {
  animation: modal-appear 0.3s ease-out forwards;
  transform: scale(0.9);
  opacity: 0;
}

@keyframes modal-appear {
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Encouragement message styling */
.encouragement-message {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Help button hover effects */
.help-button:not(:disabled):hover {
  filter: brightness(1.1);
}

.help-button:not(:disabled):active {
  filter: brightness(0.9);
}

/* Responsive design */
@media (max-width: 640px) {
  .help-button {
    width: 240px !important;
    height: 240px !important;
  }
  
  .help-button .text-6xl {
    font-size: 3rem;
  }
  
  .help-button .text-2xl {
    font-size: 1.5rem;
  }
  
  .help-button .text-lg {
    font-size: 1rem;
  }
}

/* Accessibility improvements */
.help-button:focus {
  outline: 4px solid #fbbf24;
  outline-offset: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .help-button {
    border: 3px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-help-glow,
  .animate-help-bounce,
  .animate-help-pulse,
  .animate-heart-fly {
    animation: none;
  }
}
</style>