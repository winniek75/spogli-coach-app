<template>
  <div class="emergency-history-panel">
    <!-- History Toggle Button -->
    <button
      @click="togglePanel"
      class="fixed bottom-4 left-4 z-40 w-14 h-14 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 
             rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-110"
      :class="{ 'rotate-180': showPanel }"
    >
      <i class="fas fa-history text-xl"></i>
      <!-- Notification badge -->
      <div 
        v-if="unreadCount > 0"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </div>
    </button>

    <!-- History Panel -->
    <div 
      v-if="showPanel"
      class="fixed bottom-20 left-4 z-40 w-96 max-h-96 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur rounded-2xl border border-slate-600/50 shadow-2xl overflow-hidden"
    >
      <!-- Panel Header -->
      <div class="p-4 border-b border-slate-600/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <i class="fas fa-clock text-white text-sm"></i>
            </div>
            <div>
              <h3 class="text-white font-semibold">Emergency Call History</h3>
              <p class="text-slate-300 text-sm">{{ totalCalls }} calls total</p>
            </div>
          </div>
          
          <!-- Filter buttons -->
          <div class="flex space-x-1">
            <button
              v-for="filter in filters"
              :key="filter.key"
              @click="setFilter(filter.key)"
              class="px-2 py-1 text-xs rounded transition-colors"
              :class="currentFilter === filter.key 
                ? 'bg-purple-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="p-4 border-b border-slate-600/50">
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">{{ stats.resolved }}</div>
            <div class="text-xs text-slate-400">Resolved</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-400">{{ stats.pending }}</div>
            <div class="text-xs text-slate-400">Pending</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">{{ stats.avgResponseTime }}</div>
            <div class="text-xs text-slate-400">Avg Response</div>
          </div>
        </div>
      </div>

      <!-- Call List -->
      <div class="max-h-64 overflow-y-auto">
        <div v-if="filteredCalls.length === 0" class="p-6 text-center text-slate-400">
          <i class="fas fa-inbox text-3xl mb-2"></i>
          <div>No emergency calls found</div>
        </div>
        
        <div 
          v-for="call in filteredCalls" 
          :key="call.id || call.timestamp"
          class="call-item p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
          @click="selectCall(call)"
          :class="{ 'bg-slate-700/50': selectedCall?.timestamp === call.timestamp }"
        >
          <!-- Call header -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-2">
              <div 
                class="w-3 h-3 rounded-full"
                :class="getStatusColor(call)"
              ></div>
              <span class="text-white font-medium">{{ call.studentName || 'Unknown Student' }}</span>
              <span 
                v-if="call.urgent"
                class="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold"
              >
                URGENT
              </span>
            </div>
            <span class="text-slate-400 text-xs">{{ formatTime(call.timestamp) }}</span>
          </div>
          
          <!-- Reason -->
          <div class="flex items-center space-x-2 mb-2">
            <i :class="getReasonIcon(call.reason)" class="text-slate-400"></i>
            <span class="text-slate-300 text-sm">{{ getReasonText(call.reason) }}</span>
            <span 
              v-if="call.autoDetected"
              class="px-1 py-0.5 bg-blue-600 text-white text-xs rounded"
            >
              AUTO
            </span>
          </div>
          
          <!-- Resolution info -->
          <div v-if="call.resolved" class="flex items-center space-x-2 text-xs text-green-400">
            <i class="fas fa-check-circle"></i>
            <span>Resolved {{ formatTime(call.resolvedAt) }}</span>
            <span v-if="call.resolvedBy" class="text-slate-400">by {{ call.resolvedBy }}</span>
          </div>
          
          <!-- Duration -->
          <div class="text-xs text-slate-400 mt-1">
            Duration: {{ formatDuration(call.resolved ? call.resolvedAt - call.timestamp : Date.now() - call.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Panel Footer -->
      <div class="p-3 border-t border-slate-600/50 bg-slate-800/50">
        <div class="flex justify-between items-center">
          <button
            @click="clearHistory"
            class="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <i class="fas fa-trash mr-1"></i>
            Clear History
          </button>
          
          <button
            @click="exportHistory"
            class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <i class="fas fa-download mr-1"></i>
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Call Detail Modal -->
    <div 
      v-if="showDetailModal && selectedCall"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click="closeDetailModal"
    >
      <div 
        class="call-detail-modal bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 m-4 max-w-lg w-full max-h-96 overflow-y-auto"
        @click.stop
      >
        <!-- Modal header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-white">Emergency Call Details</h2>
          <button
            @click="closeDetailModal"
            class="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Call information -->
        <div class="space-y-4">
          <!-- Student info -->
          <div class="bg-slate-700/50 rounded-lg p-4">
            <h3 class="text-white font-semibold mb-2">Student Information</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Name:</span>
                <span class="text-white">{{ selectedCall.studentName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Session ID:</span>
                <span class="text-white font-mono">{{ selectedCall.sessionId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">User ID:</span>
                <span class="text-white font-mono">{{ selectedCall.studentId }}</span>
              </div>
            </div>
          </div>

          <!-- Call details -->
          <div class="bg-slate-700/50 rounded-lg p-4">
            <h3 class="text-white font-semibold mb-2">Call Details</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Reason:</span>
                <span class="text-white">{{ getReasonText(selectedCall.reason) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Status:</span>
                <span :class="selectedCall.resolved ? 'text-green-400' : 'text-yellow-400'">
                  {{ selectedCall.resolved ? 'Resolved' : 'Pending' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Auto-detected:</span>
                <span class="text-white">{{ selectedCall.autoDetected ? 'Yes' : 'No' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Urgent:</span>
                <span class="text-white">{{ selectedCall.urgent ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-slate-700/50 rounded-lg p-4">
            <h3 class="text-white font-semibold mb-2">Timeline</h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span class="text-slate-400">Call created:</span>
                <span class="text-white">{{ formatFullTime(selectedCall.timestamp) }}</span>
              </div>
              <div v-if="selectedCall.resolved" class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-slate-400">Call resolved:</span>
                <span class="text-white">{{ formatFullTime(selectedCall.resolvedAt) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span class="text-slate-400">Total duration:</span>
                <span class="text-white">{{ formatDuration(selectedCall.resolved ? selectedCall.resolvedAt - selectedCall.timestamp : Date.now() - selectedCall.timestamp) }}</span>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div v-if="selectedCall.metadata" class="bg-slate-700/50 rounded-lg p-4">
            <h3 class="text-white font-semibold mb-2">Metadata</h3>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-400">User Agent:</span>
                <span class="text-white truncate">{{ selectedCall.metadata.userAgent }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Screen Size:</span>
                <span class="text-white">{{ selectedCall.metadata.screenSize }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
const showPanel = ref(false)
const showDetailModal = ref(false)
const selectedCall = ref(null)
const currentFilter = ref('all')

// Filters
const filters = ref([
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'urgent', label: 'Urgent' }
])

// Computed
const allCalls = computed(() => emergencyStore.callHistory)
const totalCalls = computed(() => allCalls.value.length)
const unreadCount = computed(() => allCalls.value.filter(call => !call.resolved).length)

const filteredCalls = computed(() => {
  let calls = allCalls.value
  
  switch (currentFilter.value) {
    case 'pending':
      calls = calls.filter(call => !call.resolved)
      break
    case 'resolved':
      calls = calls.filter(call => call.resolved)
      break
    case 'urgent':
      calls = calls.filter(call => call.urgent)
      break
  }
  
  return calls.sort((a, b) => b.timestamp - a.timestamp)
})

const stats = computed(() => {
  const resolved = allCalls.value.filter(call => call.resolved).length
  const pending = allCalls.value.filter(call => !call.resolved).length
  
  const resolvedCalls = allCalls.value.filter(call => call.resolved && call.resolvedAt)
  const totalResponseTime = resolvedCalls.reduce((sum, call) => {
    return sum + (call.resolvedAt - call.timestamp)
  }, 0)
  
  const avgResponseTime = resolvedCalls.length > 0 
    ? Math.round(totalResponseTime / resolvedCalls.length / 1000 / 60) + 'm'
    : '0m'
  
  return {
    resolved,
    pending,
    avgResponseTime
  }
})

// Methods
const togglePanel = () => {
  showPanel.value = !showPanel.value
}

const setFilter = (filter) => {
  currentFilter.value = filter
}

const selectCall = (call) => {
  selectedCall.value = call
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedCall.value = null
}

const getStatusColor = (call) => {
  if (call.resolved) return 'bg-green-400'
  if (call.urgent) return 'bg-red-400 animate-pulse'
  return 'bg-yellow-400'
}

const getReasonIcon = (reason) => {
  const icons = {
    'too_difficult': 'fas fa-exclamation-triangle',
    'too_fast': 'fas fa-tachometer-alt',
    'dont_understand': 'fas fa-question-circle',
    'technical_issue': 'fas fa-cog',
    'need_explanation': 'fas fa-lightbulb',
    'urgent_help': 'fas fa-bolt'
  }
  return icons[reason] || 'fas fa-help'
}

const getReasonText = (reason) => {
  const reasons = {
    'too_difficult': '難しすぎる',
    'too_fast': '速すぎる',
    'dont_understand': '分からない',
    'technical_issue': '技術的問題',
    'need_explanation': '説明が必要',
    'urgent_help': '緊急ヘルプ'
  }
  return reasons[reason] || reason
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '今'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

const formatFullTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

const clearHistory = () => {
  if (confirm('Are you sure you want to clear all emergency call history?')) {
    emergencyStore.callHistory.splice(0)
  }
}

const exportHistory = () => {
  const data = {
    sessionId: props.sessionId,
    exportedAt: new Date().toISOString(),
    totalCalls: totalCalls.value,
    statistics: stats.value,
    calls: allCalls.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `emergency-calls-${props.sessionId}-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Setup listeners for new calls
onMounted(() => {
  emergencyStore.setupListeners(props.sessionId)
})
</script>

<style scoped>
/* Panel animations */
.emergency-history-panel {
  transition: all 0.3s ease;
}

/* Call item hover effects */
.call-item {
  transition: all 0.2s ease;
}

.call-item:hover {
  transform: translateX(4px);
}

/* Modal animations */
.call-detail-modal {
  animation: modal-appear 0.3s ease-out forwards;
}

@keyframes modal-appear {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
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
  background: rgba(168, 85, 247, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
}

/* Status indicators */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsive design */
@media (max-width: 640px) {
  .emergency-history-panel .w-96 {
    width: calc(100vw - 2rem);
    left: 1rem;
    right: 1rem;
  }
  
  .call-detail-modal {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
}

/* Accessibility improvements */
button:focus {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .emergency-history-panel {
    border: 2px solid white;
  }
  
  .call-item {
    border-bottom: 1px solid white;
  }
}
</style>