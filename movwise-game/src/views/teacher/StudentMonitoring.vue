<template>
  <div class="dashboard-card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white flex items-center gap-3">
        <span class="text-2xl">👥</span>
        生徒モニタリング
      </h3>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <span class="text-sm text-blue-400">{{ activeStudentsCount }}名 オンライン</span>
      </div>
    </div>

    <!-- Filter and Search -->
    <div class="flex items-center gap-4 mb-6">
      <div class="flex-1">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="生徒名で検索..."
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        >
      </div>
      <select 
        v-model="statusFilter"
        class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
      >
        <option value="">全ステータス</option>
        <option value="active">アクティブ</option>
        <option value="waiting">待機中</option>
        <option value="help_needed">ヘルプ要請</option>
      </select>
    </div>

    <!-- Students Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div 
        v-for="student in filteredStudents" 
        :key="student.id"
        class="student-card bg-slate-700/50 border rounded-lg p-4 hover:border-slate-500 transition-all"
        :class="getStudentCardClass(student)"
      >
        <div class="flex items-start justify-between">
          <!-- Student Info -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="text-3xl">{{ student.avatar }}</div>
              <!-- Status Indicator -->
              <div 
                class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-700"
                :class="getStatusIndicatorClass(student.status)"
              ></div>
              <!-- Help indicator -->
              <div 
                v-if="student.needsHelp"
                class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"
              ></div>
            </div>
            <div class="flex-1">
              <h4 class="text-white font-medium">{{ student.name }}</h4>
              <p class="text-slate-400 text-sm">{{ student.currentActivity }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs px-2 py-1 rounded-full" 
                      :class="getLevelBadgeClass(student.level)">
                  {{ getLevelText(student.level) }}
                </span>
                <span class="text-xs text-slate-500">{{ student.timeOnline }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center gap-1">
            <button 
              @click="$emit('view-student', student)"
              class="p-2 hover:bg-slate-600 rounded-lg transition-colors"
              title="詳細表示"
            >
              <span class="text-lg">👁️</span>
            </button>
            <button 
              @click="$emit('send-message', student)"
              class="p-2 hover:bg-slate-600 rounded-lg transition-colors"
              title="メッセージ送信"
            >
              <span class="text-lg">💬</span>
            </button>
            <button 
              v-if="student.needsHelp"
              @click="assistStudent(student)"
              class="p-2 hover:bg-red-600 rounded-lg transition-colors bg-red-500/20"
              title="緊急サポート"
            >
              <span class="text-lg">🆘</span>
            </button>
          </div>
        </div>

        <!-- Progress and Stats -->
        <div class="mt-4 space-y-3">
          <!-- Current Score -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">現在スコア</span>
            <div class="flex items-center gap-2">
              <div class="w-16 bg-slate-600 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getScoreBarColor(student.score)"
                  :style="{ width: `${student.score}%` }"
                ></div>
              </div>
              <span class="text-sm font-bold text-white w-10">{{ student.score }}%</span>
            </div>
          </div>

          <!-- Learning Streak -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">学習ストリーク</span>
            <span class="text-sm text-yellow-400 font-medium">{{ getLearningStreak(student) }}日</span>
          </div>

          <!-- Recent Activity -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">最近の活動</span>
            <span class="text-sm text-slate-300">{{ getLastActivity(student) }}</span>
          </div>
        </div>

        <!-- Student Mood/Focus Indicator -->
        <div class="mt-4 pt-3 border-t border-slate-600">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">集中度</span>
            <div class="flex items-center gap-1">
              <span 
                v-for="i in 5" 
                :key="i"
                class="w-2 h-2 rounded-full"
                :class="i <= getFocusLevel(student) ? 'bg-green-400' : 'bg-slate-600'"
              ></span>
              <span class="text-xs text-slate-400 ml-1">{{ getFocusLevel(student) }}/5</span>
            </div>
          </div>
        </div>

        <!-- Expandable Details -->
        <div v-if="expandedStudents.includes(student.id)" class="mt-4 pt-4 border-t border-slate-600">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">総学習時間:</span>
              <span class="text-white">{{ getTotalLearningTime(student) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">完了ミッション:</span>
              <span class="text-white">{{ getCompletedMissions(student) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">平均スコア:</span>
              <span class="text-white">{{ getAverageScore(student) }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">苦手分野:</span>
              <span class="text-red-400">{{ getWeakAreas(student) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">得意分野:</span>
              <span class="text-green-400">{{ getStrongAreas(student) }}</span>
            </div>
          </div>
        </div>

        <!-- Expand Toggle -->
        <button 
          @click="toggleStudentDetails(student.id)"
          class="mt-3 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span v-if="!expandedStudents.includes(student.id)">▼ 詳細情報</span>
          <span v-else>▲ 詳細を非表示</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredStudents.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4 opacity-50">👨‍🎓</div>
      <p class="text-slate-400 text-lg mb-2">
        {{ searchQuery || statusFilter ? '検索条件に一致する生徒がいません' : 'オンラインの生徒がいません' }}
      </p>
      <p class="text-slate-500 text-sm">生徒がログインすると、ここに表示されます</p>
    </div>

    <!-- Summary Stats -->
    <div v-if="students.length > 0" class="mt-6 pt-6 border-t border-slate-600">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-lg font-bold text-white">{{ activeStudentsCount }}</div>
          <div class="text-xs text-slate-400">オンライン中</div>
        </div>
        <div>
          <div class="text-lg font-bold text-yellow-400">{{ studentsNeedingHelp }}</div>
          <div class="text-xs text-slate-400">ヘルプ要請</div>
        </div>
        <div>
          <div class="text-lg font-bold text-green-400">{{ averageScore.toFixed(1) }}%</div>
          <div class="text-xs text-slate-400">平均スコア</div>
        </div>
        <div>
          <div class="text-lg font-bold text-blue-400">{{ averageFocus.toFixed(1) }}</div>
          <div class="text-xs text-slate-400">平均集中度</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'StudentMonitoring',
  props: {
    students: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view-student', 'send-message'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const statusFilter = ref('')
    const expandedStudents = ref([])

    // Computed properties
    const filteredStudents = computed(() => {
      let filtered = props.students

      // Search filter
      if (searchQuery.value) {
        filtered = filtered.filter(student => 
          student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Status filter
      if (statusFilter.value) {
        if (statusFilter.value === 'help_needed') {
          filtered = filtered.filter(student => student.needsHelp)
        } else {
          filtered = filtered.filter(student => student.status === statusFilter.value)
        }
      }

      return filtered
    })

    const activeStudentsCount = computed(() => 
      props.students.filter(s => s.status === 'active' || s.status === 'waiting').length
    )

    const studentsNeedingHelp = computed(() => 
      props.students.filter(s => s.needsHelp).length
    )

    const averageScore = computed(() => {
      if (props.students.length === 0) return 0
      const total = props.students.reduce((sum, student) => sum + student.score, 0)
      return total / props.students.length
    })

    const averageFocus = computed(() => {
      if (props.students.length === 0) return 0
      const total = props.students.reduce((sum, student) => sum + getFocusLevel(student), 0)
      return total / props.students.length
    })

    // Methods
    const getStudentCardClass = (student) => {
      if (student.needsHelp) return 'border-red-500/50 bg-red-900/10'
      if (student.status === 'active') return 'border-green-500/30'
      if (student.status === 'waiting') return 'border-yellow-500/30'
      return 'border-slate-600'
    }

    const getStatusIndicatorClass = (status) => {
      const classes = {
        'active': 'bg-green-400',
        'waiting': 'bg-yellow-400',
        'offline': 'bg-gray-400'
      }
      return classes[status] || 'bg-gray-400'
    }

    const getLevelBadgeClass = (level) => {
      const classes = {
        'beginner': 'bg-green-500/20 text-green-400',
        'intermediate': 'bg-yellow-500/20 text-yellow-400',
        'advanced': 'bg-red-500/20 text-red-400'
      }
      return classes[level] || 'bg-gray-500/20 text-gray-400'
    }

    const getLevelText = (level) => {
      const texts = {
        'beginner': '初級',
        'intermediate': '中級',
        'advanced': '上級'
      }
      return texts[level] || '不明'
    }

    const getScoreBarColor = (score) => {
      if (score >= 80) return 'bg-green-500'
      if (score >= 60) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    const getLearningStreak = (student) => {
      // Mock calculation based on student level and activity
      const baseStreak = student.level === 'advanced' ? 7 : student.level === 'intermediate' ? 4 : 2
      return baseStreak + Math.floor(Math.random() * 3)
    }

    const getLastActivity = (student) => {
      // Mock last activity
      const activities = ['5分前', '15分前', '1時間前', '今日']
      return activities[Math.floor(Math.random() * activities.length)]
    }

    const getFocusLevel = (student) => {
      // Calculate focus level based on score and status
      if (student.needsHelp) return 2
      if (student.status === 'active' && student.score > 80) return 5
      if (student.status === 'active' && student.score > 60) return 4
      if (student.status === 'active') return 3
      return 2
    }

    const getTotalLearningTime = (student) => {
      // Mock total learning time
      const hours = student.level === 'advanced' ? 50 : student.level === 'intermediate' ? 25 : 10
      return `${hours + Math.floor(Math.random() * 20)}時間`
    }

    const getCompletedMissions = (student) => {
      // Mock completed missions
      const base = student.level === 'advanced' ? 30 : student.level === 'intermediate' ? 15 : 5
      return base + Math.floor(Math.random() * 10)
    }

    const getAverageScore = (student) => {
      // Mock average score slightly different from current
      return student.score + Math.floor(Math.random() * 10 - 5)
    }

    const getWeakAreas = (student) => {
      const areas = ['文法構造', '音韻認識', '語彙', 'リスニング']
      return areas[Math.floor(Math.random() * areas.length)]
    }

    const getStrongAreas = (student) => {
      const areas = ['フォニックス', '発音', '読解', '文法']
      return areas[Math.floor(Math.random() * areas.length)]
    }

    const toggleStudentDetails = (studentId) => {
      const index = expandedStudents.value.indexOf(studentId)
      if (index > -1) {
        expandedStudents.value.splice(index, 1)
      } else {
        expandedStudents.value.push(studentId)
      }
    }

    const assistStudent = (student) => {
      alert(`🆘 ${student.name}への緊急サポートを開始します\n\n即座に協力セッションを開始し、問題解決をサポートします。`)
      
      // Mark as no longer needing help (simulate resolution)
      student.needsHelp = false
    }

    return {
      searchQuery,
      statusFilter,
      expandedStudents,
      filteredStudents,
      activeStudentsCount,
      studentsNeedingHelp,
      averageScore,
      averageFocus,
      getStudentCardClass,
      getStatusIndicatorClass,
      getLevelBadgeClass,
      getLevelText,
      getScoreBarColor,
      getLearningStreak,
      getLastActivity,
      getFocusLevel,
      getTotalLearningTime,
      getCompletedMissions,
      getAverageScore,
      getWeakAreas,
      getStrongAreas,
      toggleStudentDetails,
      assistStudent
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  @apply bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6;
}

.student-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.student-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* PC Optimized Styles */
@media (min-width: 1024px) {
  .student-card {
    @apply p-5;
  }
  
  .dashboard-card {
    @apply p-8;
  }
  
  /* Enhanced grid for larger screens */
  .grid-cols-1.lg\:grid-cols-2 {
    @apply xl:grid-cols-3;
  }
}

/* Animation for focus indicators */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

/* Focus styles for keyboard navigation */
button:focus-visible, input:focus-visible, select:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900;
}

/* Progress bar animations */
.transition-all {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>