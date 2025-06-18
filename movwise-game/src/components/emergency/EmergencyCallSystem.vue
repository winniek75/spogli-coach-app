<template>
  <div class="emergency-call-system">
    <!-- Student View - Emergency Help Button -->
    <div v-if="userRole === 'copilot'" class="student-emergency-interface">
      <EmergencyHelpButton
        :session-id="sessionId"
        :is-disabled="isGamePaused"
        @emergency-triggered="onEmergencyTriggered"
      />
      
      <!-- Encouragement System -->
      <EncouragementSystem
        :session-id="sessionId"
        :auto-mode="autoEncouragement"
        :max-visible-messages="3"
        ref="encouragementSystem"
      />
      
      <!-- Auto-detection Monitor -->
      <div class="hidden">
        <EmergencyAutoDetector
          :session-id="sessionId"
          :game-metrics="gameMetrics"
          :detection-enabled="autoDetectionEnabled"
          @emergency-detected="onAutoEmergencyDetected"
        />
      </div>
    </div>

    <!-- Instructor View - Notification Panel -->
    <div v-if="userRole === 'captain'" class="instructor-emergency-interface">
      <InstructorNotificationPanel
        :session-id="sessionId"
        @call-resolved="onCallResolved"
        @message-sent="onMessageSent"
      />
      
      <!-- Emergency History -->
      <EmergencyHistoryPanel
        :session-id="sessionId"
        @history-updated="onHistoryUpdated"
      />
    </div>

    <!-- Emergency Status Overlay (Both Roles) -->
    <div 
      v-if="hasActiveEmergency"
      class="emergency-status-overlay fixed top-0 left-0 right-0 z-30 pointer-events-none"
    >
      <div class="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm border-b border-red-400/30">
        <div class="max-w-7xl mx-auto px-4 py-2">
          <div class="flex items-center justify-center space-x-3 text-white">
            <div class="animate-pulse">
              <i class="fas fa-exclamation-triangle text-yellow-300"></i>
            </div>
            <span class="font-medium">
              {{ userRole === 'captain' ? 'Emergency call active' : 'Help request sent to instructor' }}
            </span>
            <div class="text-sm text-red-200">
              {{ formatDuration(currentCallDuration) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Emergency Alerts -->
    <div 
      v-if="showGlobalAlert"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div class="global-alert bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-8 m-4 max-w-md text-center text-white shadow-2xl">
        <div class="text-6xl mb-4 animate-bounce">🚨</div>
        <h2 class="text-2xl font-bold mb-2">System Emergency</h2>
        <p class="text-red-100 mb-6">{{ globalAlertMessage }}</p>
        <button
          @click="dismissGlobalAlert"
          class="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200"
        >
          OK
        </button>
      </div>
    </div>

    <!-- Debug Panel (Development Only) -->
    <div 
      v-if="showDebugPanel && isDevelopment"
      class="fixed top-4 right-4 z-40 bg-slate-900/90 backdrop-blur rounded-lg p-4 text-white text-sm max-w-xs"
    >
      <h4 class="font-semibold mb-2 text-purple-300">Emergency System Debug</h4>
      <div class="space-y-1 text-xs">
        <div>Active Call: {{ hasActiveEmergency ? 'YES' : 'NO' }}</div>
        <div>User Role: {{ userRole }}</div>
        <div>Session: {{ sessionId?.slice(-6) }}</div>
        <div>Auto Detection: {{ autoDetectionEnabled ? 'ON' : 'OFF' }}</div>
        <div>Game Metrics: {{ Object.keys(gameMetrics).length }} metrics</div>
        <div>Total Calls: {{ totalEmergencyCalls }}</div>
      </div>
      
      <div class="mt-3 space-y-1">
        <button
          @click="triggerTestEmergency"
          class="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
        >
          Test Emergency
        </button>
        <button
          @click="toggleAutoDetection"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
        >
          Toggle Auto Detection
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useEmergencyCallStore } from '@/stores/emergencyCall'
import { useAuthStore } from '@/stores/auth'
import EmergencyHelpButton from './EmergencyHelpButton.vue'
import InstructorNotificationPanel from './InstructorNotificationPanel.vue'
import EncouragementSystem from './EncouragementSystem.vue'
import EmergencyHistoryPanel from './EmergencyHistoryPanel.vue'
import EmergencyAutoDetector from './EmergencyAutoDetector.vue'

// Props
const props = defineProps({
  sessionId: {
    type: String,
    required: true
  },
  gameMetrics: {
    type: Object,
    default: () => ({})
  },
  isGamePaused: {
    type: Boolean,
    default: false
  },
  autoEncouragement: {
    type: Boolean,
    default: true
  },
  autoDetectionEnabled: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'emergency-triggered',
  'emergency-resolved', 
  'difficulty-adjusted',
  'encouragement-sent'
])

// Stores
const emergencyStore = useEmergencyCallStore()
const authStore = useAuthStore()

// Reactive data
const showGlobalAlert = ref(false)
const globalAlertMessage = ref('')
const showDebugPanel = ref(false)
const encouragementSystem = ref(null)

// System state
const systemHealth = reactive({
  firebaseConnected: true,
  audioEnabled: true,
  notificationsEnabled: false,
  lastHeartbeat: Date.now()
})

// Computed
const userRole = computed(() => authStore.currentUser?.role || authStore.userRole)
const hasActiveEmergency = computed(() => emergencyStore.hasActiveCall)
const currentCallDuration = computed(() => emergencyStore.currentCallDuration)
const totalEmergencyCalls = computed(() => emergencyStore.callHistory.length)
const isDevelopment = computed(() => process.env.NODE_ENV === 'development')

// Methods
const onEmergencyTriggered = (emergencyData) => {
  emit('emergency-triggered', emergencyData)
  
  // Track interaction for encouragement system
  if (encouragementSystem.value) {
    encouragementSystem.value.trackInteraction()
  }
}

const onAutoEmergencyDetected = (detectionData) => {
  // Auto-detection triggered
  console.log('Auto emergency detected:', detectionData)
  emit('emergency-triggered', {
    ...detectionData,
    autoDetected: true
  })
}

const onCallResolved = (callData) => {
  emit('emergency-resolved', callData)
  
  // Send success encouragement
  if (encouragementSystem.value && userRole.value === 'copilot') {
    encouragementSystem.value.sendAutoEncouragement('success')
  }
}

const onMessageSent = (messageData) => {
  emit('encouragement-sent', messageData)
}

const onHistoryUpdated = (historyData) => {
  // History panel updated
}

const formatDuration = (duration) => {
  if (!duration) return '0s'
  
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

const showSystemAlert = (message, duration = 5000) => {
  globalAlertMessage.value = message
  showGlobalAlert.value = true
  
  if (duration > 0) {
    setTimeout(() => {
      showGlobalAlert.value = false
    }, duration)
  }
}

const dismissGlobalAlert = () => {
  showGlobalAlert.value = false
}

// Debug methods
const triggerTestEmergency = async () => {
  if (userRole.value === 'copilot') {
    await emergencyStore.createEmergencyCall({
      sessionId: props.sessionId,
      reason: 'test_emergency',
      reasonText: 'Test emergency call',
      difficultyAdjustment: 0,
      autoDetected: false,
      urgent: false
    })
  }
}

const toggleAutoDetection = () => {
  // This would toggle auto-detection if it were configurable
  console.log('Auto detection toggled')
}

// System monitoring
const checkSystemHealth = () => {
  // Check Firebase connection
  systemHealth.firebaseConnected = navigator.onLine
  
  // Check notification permissions
  if ('Notification' in window) {
    systemHealth.notificationsEnabled = Notification.permission === 'granted'
  }
  
  // Check audio capabilities
  try {
    const audio = new Audio()
    systemHealth.audioEnabled = !!audio.canPlayType
  } catch (e) {
    systemHealth.audioEnabled = false
  }
  
  systemHealth.lastHeartbeat = Date.now()
}

const setupSystemMonitoring = () => {
  // Check system health every 30 seconds
  const healthInterval = setInterval(checkSystemHealth, 30000)
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    systemHealth.firebaseConnected = true
  })
  
  window.addEventListener('offline', () => {
    systemHealth.firebaseConnected = false
    showSystemAlert('インターネット接続が切断されました。再接続をお待ちください。', 0)
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(healthInterval)
    window.removeEventListener('online', checkSystemHealth)
    window.removeEventListener('offline', checkSystemHealth)
  })
}

// Emergency system initialization
const initializeEmergencySystem = async () => {
  try {
    // Setup emergency store listeners
    emergencyStore.setupListeners(props.sessionId)
    
    // Setup system monitoring
    setupSystemMonitoring()
    
    // Initial system health check
    checkSystemHealth()
    
    // Request notification permissions for instructor
    if (userRole.value === 'captain' && 'Notification' in window) {
      await Notification.requestPermission()
    }
    
    console.log('Emergency call system initialized')
  } catch (error) {
    console.error('Failed to initialize emergency system:', error)
    showSystemAlert('緊急コールシステムの初期化に失敗しました。')
  }
}

// Provide emergency system context to child components
provide('emergencySystem', {
  store: emergencyStore,
  metrics: computed(() => props.gameMetrics),
  sessionId: computed(() => props.sessionId),
  userRole: userRole,
  showAlert: showSystemAlert
})

// Lifecycle hooks
onMounted(() => {
  initializeEmergencySystem()
})

onUnmounted(() => {
  emergencyStore.cleanup()
})

// Watch for game metrics changes (for auto-detection)
watch(() => props.gameMetrics, (newMetrics) => {
  if (props.autoDetectionEnabled && emergencyStore.detectEmergencyConditions) {
    emergencyStore.detectEmergencyConditions(props.sessionId, newMetrics)
  }
}, { deep: true })

// Watch for session changes
watch(() => props.sessionId, (newSessionId) => {
  if (newSessionId) {
    emergencyStore.setupListeners(newSessionId)
  }
})

// Debug panel toggle (development only)
if (isDevelopment.value) {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      showDebugPanel.value = !showDebugPanel.value
    }
  })
}

// Expose methods for external use
defineExpose({
  triggerEmergency: emergencyStore.createEmergencyCall,
  resolveEmergency: emergencyStore.resolveEmergencyCall,
  sendEncouragement: emergencyStore.sendEncouragementMessage,
  getCallHistory: emergencyStore.getCallHistory,
  systemHealth,
  showAlert: showSystemAlert
})
</script>

<style scoped>
/* Emergency system global styles */
.emergency-call-system {
  position: relative;
  z-index: 1;
}

/* Emergency status overlay */
.emergency-status-overlay {
  backdrop-filter: blur(8px);
  animation: emergency-glow 2s ease-in-out infinite;
}

@keyframes emergency-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
  }
}

/* Global alert animations */
.global-alert {
  animation: alert-appear 0.5s ease-out forwards;
}

@keyframes alert-appear {
  from {
    transform: scale(0.8) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Debug panel styling */
.emergency-call-system .fixed.top-4.right-4 {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Interface transitions */
.student-emergency-interface,
.instructor-emergency-interface {
  transition: all 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .emergency-status-overlay {
    font-size: 0.875rem;
  }
  
  .global-alert {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .global-alert .text-6xl {
    font-size: 3rem;
  }
  
  .global-alert .text-2xl {
    font-size: 1.5rem;
  }
}

/* Accessibility improvements */
.global-alert button:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .emergency-status-overlay {
    background: rgba(220, 38, 38, 0.8) !important;
    border-bottom: 2px solid white;
  }
  
  .global-alert {
    border: 3px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .emergency-status-overlay,
  .global-alert,
  .animate-pulse,
  .animate-bounce {
    animation: none;
  }
}

/* Print styles */
@media print {
  .emergency-call-system {
    display: none;
  }
}
</style>