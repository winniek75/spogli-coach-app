<template>
  <div class="dashboard-card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white flex items-center gap-3">
        <span class="text-2xl">🚨</span>
        緊急コール対応パネル
      </h3>
      <div class="flex items-center gap-2">
        <div 
          class="w-2 h-2 rounded-full"
          :class="emergencyStatus.indicator"
        ></div>
        <span 
          class="text-sm font-medium"
          :class="emergencyStatus.textClass"
        >
          {{ emergencyStatus.text }}
        </span>
      </div>
    </div>

    <!-- Emergency Alert Banner -->
    <div 
      v-if="urgentCalls.length > 0"
      class="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg animate-pulse"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">⚠️</span>
        <div>
          <h4 class="text-red-400 font-bold">緊急対応が必要です！</h4>
          <p class="text-red-300 text-sm">{{ urgentCalls.length }}件の高優先度コールがあります</p>
        </div>
        <button 
          @click="respondToAllUrgent"
          class="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          一括対応
        </button>
      </div>
    </div>

    <!-- Emergency Calls List -->
    <div class="space-y-4">
      <div 
        v-for="call in sortedEmergencyCalls" 
        :key="call.id"
        class="emergency-call-card rounded-lg p-4 transition-all"
        :class="getCallCardClass(call)"
      >
        <div class="flex items-start justify-between">
          <!-- Call Information -->
          <div class="flex items-start gap-3 flex-1">
            <!-- Priority Indicator -->
            <div 
              class="w-3 h-3 rounded-full mt-1 flex-shrink-0"
              :class="getPriorityColor(call.priority)"
            ></div>
            
            <!-- Student Info -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="text-white font-medium">{{ call.studentName }}</h4>
                <span 
                  class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="getPriorityBadgeClass(call.priority)"
                >
                  {{ getPriorityText(call.priority) }}
                </span>
                <span class="text-xs text-slate-400">{{ getTimeAgo(call.timestamp) }}</span>
              </div>
              
              <!-- Call Type and Message -->
              <div class="mb-2">
                <span 
                  class="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded mr-2"
                >
                  {{ getCallTypeText(call.type) }}
                </span>
                <p class="text-slate-300 text-sm mt-1">{{ call.message }}</p>
              </div>

              <!-- Additional Details (if expanded) -->
              <div v-if="expandedCalls.includes(call.id)" class="mt-3 pt-3 border-t border-slate-600">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-slate-400">現在のミッション:</span>
                    <span class="text-white ml-2">{{ getStudentCurrentMission(call.studentId) }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400">進捗:</span>
                    <span class="text-white ml-2">{{ getStudentProgress(call.studentId) }}%</span>
                  </div>
                  <div>
                    <span class="text-slate-400">学習時間:</span>
                    <span class="text-white ml-2">{{ getStudentSessionTime(call.studentId) }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400">最後のスコア:</span>
                    <span class="text-white ml-2">{{ getStudentLastScore(call.studentId) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 ml-4">
            <!-- Respond Button -->
            <button 
              @click="$emit('respond-to-call', call)"
              class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <span class="text-sm">🎯</span>
              対応
            </button>

            <!-- Quick Message Button -->
            <button 
              @click="sendQuickMessage(call)"
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <span class="text-sm">💬</span>
              返信
            </button>

            <!-- Dismiss Button -->
            <button 
              @click="$emit('dismiss-call', call.id)"
              class="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
            >
              <span class="text-sm">✕</span>
            </button>
          </div>
        </div>

        <!-- Expand/Collapse Toggle -->
        <button 
          @click="toggleCallDetails(call.id)"
          class="mt-3 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span v-if="!expandedCalls.includes(call.id)">▼ 詳細表示</span>
          <span v-else>▲ 詳細を非表示</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="emergencyCalls.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4 opacity-50">✅</div>
        <p class="text-slate-400 text-lg mb-2">緊急コールはありません</p>
        <p class="text-slate-500 text-sm">全ての生徒が順調に学習を進めています</p>
      </div>
    </div>

    <!-- Emergency Response Guidelines -->
    <div v-if="emergencyCalls.length > 0" class="mt-6 pt-6 border-t border-slate-600">
      <h4 class="text-sm font-medium text-slate-300 mb-3">緊急対応ガイドライン</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span class="text-red-400 font-medium">高優先度</span>
          </div>
          <p class="text-slate-300 text-xs">即座に対応してください。生徒が学習を継続できない状態です。</p>
        </div>
        <div class="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span class="text-yellow-400 font-medium">中優先度</span>
          </div>
          <p class="text-slate-300 text-xs">5分以内に対応してください。学習効率が低下しています。</p>
        </div>
        <div class="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-blue-400 font-medium">低優先度</span>
          </div>
          <p class="text-slate-300 text-xs">時間があるときに対応してください。一般的な質問です。</p>
        </div>
      </div>
    </div>

    <!-- Quick Response Templates -->
    <div v-if="showQuickResponses" class="mt-6 pt-6 border-t border-slate-600">
      <h4 class="text-sm font-medium text-slate-300 mb-3">クイック返信テンプレート</h4>
      <div class="space-y-2">
        <button 
          v-for="template in quickResponseTemplates" 
          :key="template.id"
          @click="useQuickResponse(template)"
          class="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-sm text-slate-300"
        >
          {{ template.message }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'EmergencyPanel',
  props: {
    emergencyCalls: {
      type: Array,
      default: () => []
    }
  },
  emits: ['respond-to-call', 'dismiss-call'],
  setup(props, { emit }) {
    const expandedCalls = ref([])
    const showQuickResponses = ref(false)
    const selectedCall = ref(null)

    // Quick response templates
    const quickResponseTemplates = ref([
      {
        id: 1,
        message: "すぐにサポートします。少々お待ちください。"
      },
      {
        id: 2,
        message: "ヒントを送りました。それを参考に続けてみてください。"
      },
      {
        id: 3,
        message: "一緒に問題を解決しましょう。協力セッションを開始します。"
      },
      {
        id: 4,
        message: "よくできています！この調子で続けてください。"
      },
      {
        id: 5,
        message: "難しい部分ですね。ゆっくりと一歩ずつ進めましょう。"
      }
    ])

    // Computed properties
    const sortedEmergencyCalls = computed(() => {
      return [...props.emergencyCalls].sort((a, b) => {
        // Sort by priority first (high -> medium -> low)
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        // Then by timestamp (newest first)
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
    })

    const urgentCalls = computed(() => 
      props.emergencyCalls.filter(call => call.priority === 'high')
    )

    const emergencyStatus = computed(() => {
      const callCount = props.emergencyCalls.length
      const urgentCount = urgentCalls.value.length
      
      if (urgentCount > 0) {
        return {
          indicator: 'bg-red-500 animate-pulse',
          textClass: 'text-red-400',
          text: `${urgentCount}件 緊急`
        }
      } else if (callCount > 0) {
        return {
          indicator: 'bg-yellow-500',
          textClass: 'text-yellow-400',
          text: `${callCount}件 対応中`
        }
      } else {
        return {
          indicator: 'bg-green-500',
          textClass: 'text-green-400',
          text: '正常'
        }
      }
    })

    // Methods
    const getCallCardClass = (call) => {
      const baseClass = 'border'
      const priorityClasses = {
        'high': 'border-red-500/50 bg-red-900/10',
        'medium': 'border-yellow-500/50 bg-yellow-900/10',
        'low': 'border-blue-500/50 bg-blue-900/10'
      }
      return `${baseClass} ${priorityClasses[call.priority] || 'border-slate-600 bg-slate-700/30'}`
    }

    const getPriorityColor = (priority) => {
      const colors = {
        'high': 'bg-red-500',
        'medium': 'bg-yellow-500',
        'low': 'bg-blue-500'
      }
      return colors[priority] || 'bg-gray-500'
    }

    const getPriorityBadgeClass = (priority) => {
      const classes = {
        'high': 'bg-red-500/20 text-red-400',
        'medium': 'bg-yellow-500/20 text-yellow-400',
        'low': 'bg-blue-500/20 text-blue-400'
      }
      return classes[priority] || 'bg-gray-500/20 text-gray-400'
    }

    const getPriorityText = (priority) => {
      const texts = {
        'high': '緊急',
        'medium': '通常',
        'low': '低'
      }
      return texts[priority] || '不明'
    }

    const getCallTypeText = (type) => {
      const texts = {
        'help_request': 'ヘルプ要請',
        'technical_issue': '技術的問題',
        'question': '質問',
        'encouragement': '励まし要求',
        'stuck': '行き詰まり'
      }
      return texts[type] || '一般'
    }

    const getTimeAgo = (timestamp) => {
      const now = new Date()
      const diff = now - new Date(timestamp)
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'たった今'
      if (minutes < 60) return `${minutes}分前`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}時間前`
      
      const days = Math.floor(hours / 24)
      return `${days}日前`
    }

    const getStudentCurrentMission = (studentId) => {
      // Mock data based on student ID
      const missions = ['Sound Radar Command', 'Grammar Construction', 'Phonics Lab']
      return missions[studentId.charCodeAt(studentId.length - 1) % missions.length]
    }

    const getStudentProgress = (studentId) => {
      // Mock progress calculation
      return 45 + (studentId.charCodeAt(studentId.length - 1) % 40)
    }

    const getStudentSessionTime = (studentId) => {
      // Mock session time
      const minutes = 10 + (studentId.charCodeAt(studentId.length - 1) % 30)
      return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
    }

    const getStudentLastScore = (studentId) => {
      // Mock last score
      return 60 + (studentId.charCodeAt(studentId.length - 1) % 35)
    }

    const toggleCallDetails = (callId) => {
      const index = expandedCalls.value.indexOf(callId)
      if (index > -1) {
        expandedCalls.value.splice(index, 1)
      } else {
        expandedCalls.value.push(callId)
      }
    }

    const sendQuickMessage = (call) => {
      selectedCall.value = call
      showQuickResponses.value = !showQuickResponses.value
    }

    const useQuickResponse = (template) => {
      if (selectedCall.value) {
        alert(`💬 ${selectedCall.value.studentName}に返信しました:\n"${template.message}"`)
        showQuickResponses.value = false
        selectedCall.value = null
      }
    }

    const respondToAllUrgent = () => {
      const urgentCount = urgentCalls.value.length
      const confirmed = confirm(`${urgentCount}件の緊急コールに一括対応しますか？\n\nすべての緊急コールに標準的な対応メッセージを送信し、個別セッションを開始します。`)
      
      if (confirmed) {
        urgentCalls.value.forEach(call => {
          emit('respond-to-call', call)
        })
        alert(`✅ ${urgentCount}件の緊急コールに対応しました！`)
      }
    }

    return {
      expandedCalls,
      showQuickResponses,
      selectedCall,
      quickResponseTemplates,
      sortedEmergencyCalls,
      urgentCalls,
      emergencyStatus,
      getCallCardClass,
      getPriorityColor,
      getPriorityBadgeClass,
      getPriorityText,
      getCallTypeText,
      getTimeAgo,
      getStudentCurrentMission,
      getStudentProgress,
      getStudentSessionTime,
      getStudentLastScore,
      toggleCallDetails,
      sendQuickMessage,
      useQuickResponse,
      respondToAllUrgent
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  @apply bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6;
}

.emergency-call-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.emergency-call-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* PC Optimized Styles */
@media (min-width: 1024px) {
  .emergency-call-card {
    @apply p-5;
  }
  
  .dashboard-card {
    @apply p-8;
  }
  
  /* Better button spacing for mouse interaction */
  button {
    @apply transition-all duration-200;
  }
  
  button:hover {
    transform: translateY(-1px);
  }
}

/* Emergency alert animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Priority indicator animations */
.bg-red-500.animate-pulse {
  animation: emergency-pulse 1s ease-in-out infinite;
}

@keyframes emergency-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Focus styles for keyboard navigation */
button:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900;
}

/* Responsive text sizing */
@media (max-width: 640px) {
  .emergency-call-card {
    @apply p-3;
  }
}
</style>