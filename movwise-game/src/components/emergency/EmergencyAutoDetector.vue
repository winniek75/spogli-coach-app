<template>
  <div class="emergency-auto-detector hidden">
    <!-- This component runs invisibly in the background -->
    <!-- Debug visualization (only shown in development) -->
    <div 
      v-if="showDebugVisualization && isDevelopment"
      class="fixed bottom-4 right-80 z-30 bg-slate-900/90 backdrop-blur rounded-lg p-4 text-white text-xs max-w-xs"
    >
      <h4 class="font-semibold mb-2 text-orange-300">Auto Detection Debug</h4>
      
      <!-- Detection status -->
      <div class="space-y-1 mb-3">
        <div class="flex justify-between">
          <span>Status:</span>
          <span :class="detectionEnabled ? 'text-green-400' : 'text-red-400'">
            {{ detectionEnabled ? 'ACTIVE' : 'DISABLED' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Last Check:</span>
          <span class="text-gray-300">{{ formatTime(lastCheckTime) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Risk Level:</span>
          <span :class="getRiskLevelColor(currentRiskLevel)">
            {{ currentRiskLevel.toUpperCase() }}
          </span>
        </div>
      </div>
      
      <!-- Current metrics -->
      <div class="mb-3">
        <div class="text-orange-300 font-semibold mb-1">Current Metrics:</div>
        <div class="space-y-1">
          <div class="flex justify-between">
            <span>Failures:</span>
            <span :class="gameMetrics.consecutiveFailures >= 3 ? 'text-red-400' : 'text-gray-300'">
              {{ gameMetrics.consecutiveFailures || 0 }}
            </span>
          </div>
          <div class="flex justify-between">
            <span>Time Stuck:</span>
            <span :class="(gameMetrics.timeStuckOnProblem || 0) > 180000 ? 'text-red-400' : 'text-gray-300'">
              {{ formatDuration(gameMetrics.timeStuckOnProblem || 0) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span>Accuracy:</span>
            <span :class="(gameMetrics.accuracyRate || 1) < 0.4 ? 'text-red-400' : 'text-gray-300'">
              {{ Math.round((gameMetrics.accuracyRate || 1) * 100) }}%
            </span>
          </div>
          <div class="flex justify-between">
            <span>Inactive:</span>
            <span :class="(gameMetrics.inactivityTime || 0) > 90000 ? 'text-red-400' : 'text-gray-300'">
              {{ formatDuration(gameMetrics.inactivityTime || 0) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Detection triggers -->
      <div class="mb-3">
        <div class="text-orange-300 font-semibold mb-1">Active Triggers:</div>
        <div class="space-y-1">
          <div 
            v-for="trigger in activeTriggers" 
            :key="trigger.id"
            class="text-red-400 text-xs"
          >
            • {{ trigger.description }}
          </div>
          <div v-if="activeTriggers.length === 0" class="text-gray-500 text-xs">
            No active triggers
          </div>
        </div>
      </div>
      
      <!-- Manual trigger button -->
      <button
        @click="manualTrigger"
        :disabled="!detectionEnabled"
        class="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white text-xs py-1 px-2 rounded"
      >
        Manual Trigger
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEmergencyCallStore } from '@/stores/emergencyCall'

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
  detectionEnabled: {
    type: Boolean,
    default: true
  },
  sensitivityLevel: {
    type: String,
    default: 'medium', // low, medium, high
    validator: (value) => ['low', 'medium', 'high'].includes(value)
  }
})

// Emits
const emit = defineEmits(['emergency-detected', 'risk-level-changed'])

// Store
const emergencyStore = useEmergencyCallStore()

// Reactive data
const lastCheckTime = ref(Date.now())
const currentRiskLevel = ref('low')
const detectionHistory = ref([])
const activeTriggers = ref([])
const showDebugVisualization = ref(false)

// Detection configuration based on sensitivity
const detectionThresholds = reactive({
  low: {
    consecutiveFailures: 8,
    timeStuckThreshold: 480000, // 8 minutes
    accuracyThreshold: 0.2,
    inactivityThreshold: 180000, // 3 minutes
    frustrationThreshold: 0.8
  },
  medium: {
    consecutiveFailures: 5,
    timeStuckThreshold: 300000, // 5 minutes
    accuracyThreshold: 0.3,
    inactivityThreshold: 120000, // 2 minutes
    frustrationThreshold: 0.6
  },
  high: {
    consecutiveFailures: 3,
    timeStuckThreshold: 180000, // 3 minutes
    accuracyThreshold: 0.4,
    inactivityThreshold: 90000, // 1.5 minutes
    frustrationThreshold: 0.4
  }
})

// Detection patterns
const detectionPatterns = ref([
  {
    id: 'consecutive_failures',
    name: 'Consecutive Failures',
    description: 'Multiple wrong answers in a row',
    check: (metrics, thresholds) => (metrics.consecutiveFailures || 0) >= thresholds.consecutiveFailures,
    severity: 'medium',
    suggestedAction: 'difficulty_reduction'
  },
  {
    id: 'stuck_on_problem',
    name: 'Stuck on Problem',
    description: 'Spending too long on one problem',
    check: (metrics, thresholds) => (metrics.timeStuckOnProblem || 0) > thresholds.timeStuckThreshold,
    severity: 'high',
    suggestedAction: 'explanation_needed'
  },
  {
    id: 'accuracy_drop',
    name: 'Accuracy Drop',
    description: 'Overall accuracy has dropped significantly',
    check: (metrics, thresholds) => (metrics.accuracyRate || 1) < thresholds.accuracyThreshold,
    severity: 'medium',
    suggestedAction: 'difficulty_reduction'
  },
  {
    id: 'inactivity_detected',
    name: 'User Inactivity',
    description: 'No interaction for extended period',
    check: (metrics, thresholds) => (metrics.inactivityTime || 0) > thresholds.inactivityThreshold,
    severity: 'low',
    suggestedAction: 'engagement_prompt'
  },
  {
    id: 'frustration_indicators',
    name: 'Frustration Indicators',
    description: 'Behavioral patterns suggesting frustration',
    check: (metrics, thresholds) => (metrics.frustrationScore || 0) > thresholds.frustrationThreshold,
    severity: 'high',
    suggestedAction: 'encouragement_needed'
  },
  {
    id: 'rapid_clicking',
    name: 'Rapid Clicking',
    description: 'Excessive clicking suggesting confusion',
    check: (metrics) => (metrics.clicksPerMinute || 0) > 30,
    severity: 'medium',
    suggestedAction: 'clarification_needed'
  },
  {
    id: 'session_duration',
    name: 'Extended Session',
    description: 'Learning session has been very long',
    check: (metrics) => (metrics.sessionDuration || 0) > 1800000, // 30 minutes
    severity: 'low',
    suggestedAction: 'break_suggestion'
  }
])

// Computed
const isDevelopment = computed(() => process.env.NODE_ENV === 'development')
const currentThresholds = computed(() => detectionThresholds[props.sensitivityLevel])

// Methods
const runDetectionCheck = () => {
  if (!props.detectionEnabled) return

  lastCheckTime.value = Date.now()
  
  const metrics = props.gameMetrics
  const thresholds = currentThresholds.value
  const triggeredPatterns = []
  
  // Check each detection pattern
  detectionPatterns.value.forEach(pattern => {
    if (pattern.check(metrics, thresholds)) {
      triggeredPatterns.push(pattern)
    }
  })
  
  // Update active triggers
  activeTriggers.value = triggeredPatterns
  
  // Calculate risk level
  const newRiskLevel = calculateRiskLevel(triggeredPatterns)
  if (newRiskLevel !== currentRiskLevel.value) {
    currentRiskLevel.value = newRiskLevel
    emit('risk-level-changed', newRiskLevel)
  }
  
  // Check if emergency should be triggered
  const shouldTriggerEmergency = shouldTriggerEmergencyCall(triggeredPatterns)
  
  if (shouldTriggerEmergency) {
    triggerAutoEmergency(triggeredPatterns)
  }
  
  // Record detection history
  recordDetectionResult(triggeredPatterns, newRiskLevel)
}

const calculateRiskLevel = (triggeredPatterns) => {
  if (triggeredPatterns.length === 0) return 'low'
  
  const highSeverityCount = triggeredPatterns.filter(p => p.severity === 'high').length
  const mediumSeverityCount = triggeredPatterns.filter(p => p.severity === 'medium').length
  
  if (highSeverityCount >= 2 || (highSeverityCount >= 1 && mediumSeverityCount >= 2)) {
    return 'critical'
  } else if (highSeverityCount >= 1 || mediumSeverityCount >= 2) {
    return 'high'
  } else if (triggeredPatterns.length >= 2) {
    return 'medium'
  } else {
    return 'low'
  }
}

const shouldTriggerEmergencyCall = (triggeredPatterns) => {
  // Don't trigger if there's already an active call
  if (emergencyStore.hasActiveCall) return false
  
  // Check for critical patterns
  const criticalPatterns = triggeredPatterns.filter(p => p.severity === 'high')
  if (criticalPatterns.length >= 1) return true
  
  // Check for multiple medium severity patterns
  const mediumPatterns = triggeredPatterns.filter(p => p.severity === 'medium')
  if (mediumPatterns.length >= 2) return true
  
  // Check for sustained issues (multiple checks with problems)
  const recentHistory = detectionHistory.value.slice(-5)
  const consistentIssues = recentHistory.filter(h => h.triggeredPatterns.length > 0).length
  if (consistentIssues >= 3 && triggeredPatterns.length > 0) return true
  
  return false
}

const triggerAutoEmergency = async (triggeredPatterns) => {
  const primaryPattern = triggeredPatterns
    .sort((a, b) => (b.severity === 'high' ? 2 : b.severity === 'medium' ? 1 : 0) - 
                    (a.severity === 'high' ? 2 : a.severity === 'medium' ? 1 : 0))[0]
  
  const reasonMap = {
    'consecutive_failures': 'too_difficult',
    'stuck_on_problem': 'need_explanation', 
    'accuracy_drop': 'too_difficult',
    'inactivity_detected': 'dont_understand',
    'frustration_indicators': 'too_fast',
    'rapid_clicking': 'dont_understand',
    'session_duration': 'too_fast'
  }
  
  const difficultyAdjustmentMap = {
    'too_difficult': -1,
    'too_fast': -1,
    'need_explanation': 0,
    'dont_understand': 0
  }
  
  const reason = reasonMap[primaryPattern.id] || 'dont_understand'
  const emergencyData = {
    sessionId: props.sessionId,
    reason: reason,
    reasonText: `自動検出: ${primaryPattern.description}`,
    difficultyAdjustment: difficultyAdjustmentMap[reason] || 0,
    autoDetected: true,
    urgent: primaryPattern.severity === 'high',
    detectionData: {
      triggeredPatterns: triggeredPatterns.map(p => p.id),
      riskLevel: currentRiskLevel.value,
      metrics: props.gameMetrics,
      timestamp: Date.now()
    }
  }
  
  try {
    await emergencyStore.createEmergencyCall(emergencyData)
    emit('emergency-detected', emergencyData)
  } catch (error) {
    console.error('Failed to trigger auto emergency:', error)
  }
}

const recordDetectionResult = (triggeredPatterns, riskLevel) => {
  const record = {
    timestamp: Date.now(),
    triggeredPatterns: triggeredPatterns.map(p => ({
      id: p.id,
      name: p.name,
      severity: p.severity
    })),
    riskLevel,
    metrics: { ...props.gameMetrics }
  }
  
  detectionHistory.value.push(record)
  
  // Keep only last 50 records
  if (detectionHistory.value.length > 50) {
    detectionHistory.value = detectionHistory.value.slice(-50)
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

const getRiskLevelColor = (level) => {
  const colors = {
    low: 'text-green-400',
    medium: 'text-yellow-400', 
    high: 'text-orange-400',
    critical: 'text-red-400'
  }
  return colors[level] || 'text-gray-400'
}

const manualTrigger = () => {
  triggerAutoEmergency([{
    id: 'manual_trigger',
    name: 'Manual Trigger',
    description: 'Manually triggered for testing',
    severity: 'medium'
  }])
}

// Setup detection interval
let detectionInterval = null

const startDetection = () => {
  if (detectionInterval) return
  
  // Run detection every 15 seconds
  detectionInterval = setInterval(runDetectionCheck, 15000)
  
  // Initial check
  runDetectionCheck()
}

const stopDetection = () => {
  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
  }
}

// Lifecycle
onMounted(() => {
  if (props.detectionEnabled) {
    startDetection()
  }
  
  // Enable debug visualization in development
  if (isDevelopment.value) {
    showDebugVisualization.value = true
    
    // Keyboard shortcut to toggle debug (Ctrl+Shift+D)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        showDebugVisualization.value = !showDebugVisualization.value
      }
    })
  }
})

onUnmounted(() => {
  stopDetection()
})

// Watchers
watch(() => props.detectionEnabled, (enabled) => {
  if (enabled) {
    startDetection()
  } else {
    stopDetection()
  }
})

watch(() => props.gameMetrics, () => {
  // Metrics updated, check if we need immediate detection
  if (props.detectionEnabled) {
    // Don't run too frequently, respect the interval
    const timeSinceLastCheck = Date.now() - lastCheckTime.value
    if (timeSinceLastCheck > 10000) { // At least 10 seconds
      runDetectionCheck()
    }
  }
}, { deep: true })

// Expose methods for external use
defineExpose({
  runDetectionCheck,
  getDetectionHistory: () => detectionHistory.value,
  getCurrentRiskLevel: () => currentRiskLevel.value,
  getActiveTriggers: () => activeTriggers.value,
  manualTrigger
})
</script>

<style scoped>
/* Auto detector runs invisibly, minimal styles needed */
.emergency-auto-detector {
  position: absolute;
  pointer-events: none;
}

/* Debug visualization styling */
.emergency-auto-detector .fixed {
  pointer-events: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Risk level indicators */
.text-green-400 { color: #4ade80; }
.text-yellow-400 { color: #facc15; }
.text-orange-400 { color: #fb923c; }
.text-red-400 { color: #f87171; }

/* Responsive debug panel */
@media (max-width: 768px) {
  .emergency-auto-detector .fixed.bottom-4.right-80 {
    right: 1rem;
    bottom: 1rem;
    max-width: calc(100vw - 2rem);
  }
}
</style>