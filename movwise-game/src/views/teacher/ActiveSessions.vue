<template>
  <div class="dashboard-card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white flex items-center gap-3">
        <span class="text-2xl">🚀</span>
        アクティブセッション
      </h3>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm text-green-400">{{ sessions.length }}件 実行中</span>
      </div>
    </div>

    <!-- Session List -->
    <div class="space-y-4">
      <div 
        v-for="session in sessions" 
        :key="session.id"
        class="session-card bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-all"
      >
        <div class="flex items-center justify-between">
          <!-- Student Info -->
          <div class="flex items-center gap-4">
            <div class="text-3xl">{{ session.studentAvatar }}</div>
            <div>
              <h4 class="text-white font-medium">{{ session.studentName }}</h4>
              <p class="text-slate-400 text-sm">{{ session.mission }}</p>
              <div class="flex items-center gap-4 mt-1">
                <span class="text-xs px-2 py-1 rounded-full" 
                      :class="getDifficultyBadgeClass(session.difficulty)">
                  {{ getDifficultyText(session.difficulty) }}
                </span>
                <span class="text-xs text-slate-500">{{ session.stage }}</span>
              </div>
            </div>
          </div>

          <!-- Session Stats -->
          <div class="flex items-center gap-6">
            <!-- Duration -->
            <div class="text-center">
              <div class="text-lg font-mono text-white">{{ session.duration }}</div>
              <div class="text-xs text-slate-400">経過時間</div>
            </div>

            <!-- Score -->
            <div class="text-center">
              <div class="text-lg font-bold text-yellow-400">{{ session.currentScore }}%</div>
              <div class="text-xs text-slate-400">現在スコア</div>
            </div>

            <!-- Status -->
            <div class="text-center">
              <div class="flex items-center justify-center w-3 h-3 rounded-full mb-1"
                   :class="getStatusColor(session.status)">
              </div>
              <div class="text-xs text-slate-400">{{ getStatusText(session.status) }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button 
              v-if="session.status === 'waiting'"
              @click="$emit('join-session', session)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <span class="text-sm">🎯</span>
              参加
            </button>
            
            <button 
              v-if="session.status === 'in_progress'"
              @click="viewSession(session)"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <span class="text-sm">👁️</span>
              監視
            </button>

            <button 
              @click="$emit('end-session', session.id)"
              class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              :class="{ 'opacity-50': session.status === 'waiting' }"
            >
              <span class="text-sm">🛑</span>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>ミッション進捗</span>
            <span>{{ getProgressPercentage(session) }}%</span>
          </div>
          <div class="w-full bg-slate-600 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-500"
              :class="getProgressBarColor(session.status)"
              :style="{ width: `${getProgressPercentage(session)}%` }"
            ></div>
          </div>
        </div>

        <!-- Session Details (Expandable) -->
        <div v-if="expandedSessions.includes(session.id)" class="mt-4 pt-4 border-t border-slate-600">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-slate-400">開始時刻</div>
              <div class="text-white">{{ getSessionStartTime(session) }}</div>
            </div>
            <div>
              <div class="text-slate-400">正解率</div>
              <div class="text-white">{{ session.currentScore }}%</div>
            </div>
            <div>
              <div class="text-slate-400">問題数</div>
              <div class="text-white">{{ getQuestionsAnswered(session) }}</div>
            </div>
            <div>
              <div class="text-slate-400">ヒント使用</div>
              <div class="text-white">{{ getHintsUsed(session) }}回</div>
            </div>
          </div>
        </div>

        <!-- Expand/Collapse Button -->
        <button 
          @click="toggleSessionDetails(session.id)"
          class="mt-3 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span v-if="!expandedSessions.includes(session.id)">▼ 詳細を表示</span>
          <span v-else>▲ 詳細を非表示</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4 opacity-50">🎮</div>
        <p class="text-slate-400 text-lg mb-2">アクティブなセッションはありません</p>
        <p class="text-slate-500 text-sm">生徒がセッションを開始すると、ここに表示されます</p>
      </div>
    </div>

    <!-- Session Controls -->
    <div v-if="sessions.length > 0" class="mt-6 pt-6 border-t border-slate-600">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            @click="refreshSessions"
            class="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white text-sm transition-colors"
          >
            <span class="text-sm">🔄</span>
            更新
          </button>
          
          <button 
            @click="exportSessionData"
            class="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white text-sm transition-colors"
          >
            <span class="text-sm">📊</span>
            エクスポート
          </button>
        </div>

        <div class="text-sm text-slate-400">
          最終更新: {{ lastUpdateTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ActiveSessions',
  props: {
    sessions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['join-session', 'end-session'],
  setup(props, { emit }) {
    const expandedSessions = ref([])
    const lastUpdateTime = ref(new Date().toLocaleTimeString())

    // Methods
    const getDifficultyBadgeClass = (difficulty) => {
      const classes = {
        'beginner': 'bg-green-500/20 text-green-400',
        'intermediate': 'bg-yellow-500/20 text-yellow-400',
        'advanced': 'bg-red-500/20 text-red-400'
      }
      return classes[difficulty] || 'bg-gray-500/20 text-gray-400'
    }

    const getDifficultyText = (difficulty) => {
      const texts = {
        'beginner': '初級',
        'intermediate': '中級',
        'advanced': '上級'
      }
      return texts[difficulty] || '不明'
    }

    const getStatusColor = (status) => {
      const colors = {
        'in_progress': 'bg-green-400 animate-pulse',
        'waiting': 'bg-yellow-400',
        'paused': 'bg-orange-400',
        'completed': 'bg-blue-400'
      }
      return colors[status] || 'bg-gray-400'
    }

    const getStatusText = (status) => {
      const texts = {
        'in_progress': '進行中',
        'waiting': '待機中',
        'paused': '一時停止',
        'completed': '完了'
      }
      return texts[status] || '不明'
    }

    const getProgressBarColor = (status) => {
      const colors = {
        'in_progress': 'bg-green-500',
        'waiting': 'bg-yellow-500',
        'paused': 'bg-orange-500',
        'completed': 'bg-blue-500'
      }
      return colors[status] || 'bg-gray-500'
    }

    const getProgressPercentage = (session) => {
      // Calculate progress based on score and time
      if (session.status === 'waiting') return 0
      if (session.status === 'completed') return 100
      
      // For in-progress sessions, estimate based on current score
      return Math.min(90, session.currentScore)
    }

    const getSessionStartTime = (session) => {
      // Mock start time calculation
      const now = new Date()
      const [hours, minutes, seconds] = session.duration.split(':').map(Number)
      const startTime = new Date(now.getTime() - (hours * 3600 + minutes * 60 + seconds) * 1000)
      return startTime.toLocaleTimeString()
    }

    const getQuestionsAnswered = (session) => {
      // Mock calculation based on session duration and score
      const [, minutes] = session.duration.split(':').map(Number)
      return Math.floor(minutes / 2) + Math.floor(session.currentScore / 10)
    }

    const getHintsUsed = (session) => {
      // Mock calculation - beginners use more hints
      const multiplier = session.difficulty === 'beginner' ? 3 : session.difficulty === 'intermediate' ? 2 : 1
      return Math.floor(Math.random() * multiplier)
    }

    const toggleSessionDetails = (sessionId) => {
      const index = expandedSessions.value.indexOf(sessionId)
      if (index > -1) {
        expandedSessions.value.splice(index, 1)
      } else {
        expandedSessions.value.push(sessionId)
      }
    }

    const viewSession = (session) => {
      alert(`👁️ ${session.studentName}のセッションを監視中\n\nミッション: ${session.mission}\n現在スコア: ${session.currentScore}%\n\n※ リアルタイム監視機能は開発中です`)
    }

    const refreshSessions = () => {
      lastUpdateTime.value = new Date().toLocaleTimeString()
      alert('🔄 セッションデータを更新しました')
    }

    const exportSessionData = () => {
      alert('📊 セッションデータをエクスポートします\n\n※ CSV形式でダウンロード機能は開発中です')
    }

    return {
      expandedSessions,
      lastUpdateTime,
      getDifficultyBadgeClass,
      getDifficultyText,
      getStatusColor,
      getStatusText,
      getProgressBarColor,
      getProgressPercentage,
      getSessionStartTime,
      getQuestionsAnswered,
      getHintsUsed,
      toggleSessionDetails,
      viewSession,
      refreshSessions,
      exportSessionData
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  @apply bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6;
}

.session-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.session-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* PC Optimized Styles */
@media (min-width: 1024px) {
  .session-card {
    @apply p-6;
  }
  
  /* Better hover effects */
  button:hover {
    transform: translateY(-1px);
  }
  
  /* Enhanced spacing for larger screens */
  .dashboard-card {
    @apply p-8;
  }
}

/* Animation for progress bars */
.transition-all {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus styles for keyboard navigation */
button:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900;
}
</style>