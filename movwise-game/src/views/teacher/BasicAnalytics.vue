<template>
  <div class="dashboard-card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white flex items-center gap-3">
        <span class="text-2xl">📊</span>
        基本学習分析
      </h3>
      <div class="flex items-center gap-2">
        <select 
          v-model="selectedPeriod"
          class="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="today">今日</option>
          <option value="week">今週</option>
          <option value="month">今月</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Sessions -->
      <div class="metric-card bg-blue-900/20 border-blue-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-400 text-sm font-medium">総セッション数</p>
            <p class="text-2xl font-bold text-white">{{ metrics.totalSessions }}</p>
          </div>
          <div class="text-3xl opacity-60">🎮</div>
        </div>
        <div class="mt-2 text-xs text-blue-300">
          +{{ metrics.sessionGrowth }}% 前期比
        </div>
      </div>

      <!-- Average Completion -->
      <div class="metric-card bg-green-900/20 border-green-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-400 text-sm font-medium">平均完了率</p>
            <p class="text-2xl font-bold text-white">{{ metrics.averageCompletion }}%</p>
          </div>
          <div class="text-3xl opacity-60">✅</div>
        </div>
        <div class="mt-2 text-xs text-green-300">
          +{{ metrics.completionGrowth }}% 向上
        </div>
      </div>

      <!-- Student Engagement -->
      <div class="metric-card bg-purple-900/20 border-purple-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-400 text-sm font-medium">学習参加度</p>
            <p class="text-2xl font-bold text-white">{{ metrics.engagement }}/5</p>
          </div>
          <div class="text-3xl opacity-60">🎯</div>
        </div>
        <div class="mt-2 text-xs text-purple-300">
          優秀レベル
        </div>
      </div>

      <!-- Response Time -->
      <div class="metric-card bg-orange-900/20 border-orange-500/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-400 text-sm font-medium">平均応答時間</p>
            <p class="text-2xl font-bold text-white">{{ metrics.responseTime }}秒</p>
          </div>
          <div class="text-3xl opacity-60">⚡</div>
        </div>
        <div class="mt-2 text-xs text-orange-300">
          -{{ metrics.responseImprovement }}秒 改善
        </div>
      </div>
    </div>

    <!-- Session Trends Chart -->
    <div class="mb-6">
      <h4 class="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <span class="text-xl">📈</span>
        セッション傾向
      </h4>
      <div class="chart-container bg-slate-700/30 rounded-lg p-4">
        <!-- Simple Bar Chart -->
        <div class="flex items-end justify-between h-32 gap-2">
          <div 
            v-for="(data, index) in analyticsData.sessionTrends" 
            :key="index"
            class="flex flex-col items-center flex-1"
          >
            <div 
              class="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-500 hover:to-blue-300"
              :style="{ height: `${(data.sessions / maxSessions) * 100}%`, minHeight: '4px' }"
            ></div>
            <span class="text-xs text-slate-400 mt-2">{{ data.date }}</span>
          </div>
        </div>
        <div class="text-center mt-4">
          <span class="text-sm text-slate-400">セッション数の推移 (最大: {{ maxSessions }}セッション)</span>
        </div>
      </div>
    </div>

    <!-- Top Missions Performance -->
    <div class="mb-6">
      <h4 class="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <span class="text-xl">🏆</span>
        人気ミッション
      </h4>
      <div class="space-y-3">
        <div 
          v-for="(mission, index) in analyticsData.topMissions" 
          :key="index"
          class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold text-sm">
              {{ index + 1 }}
            </div>
            <div>
              <h5 class="text-white font-medium">{{ mission.name }}</h5>
              <p class="text-slate-400 text-sm">{{ mission.completions }}回完了</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-white">{{ mission.completions }}</div>
            <div class="text-xs text-slate-400">完了数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Progress Overview -->
    <div class="mb-6">
      <h4 class="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <span class="text-xl">👨‍🎓</span>
        生徒進捗概要
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Total Students -->
        <div class="progress-card">
          <div class="text-center mb-3">
            <div class="text-3xl mb-2">👥</div>
            <h5 class="text-white font-medium">総生徒数</h5>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">{{ analyticsData.studentProgress.totalStudents }}</div>
            <div class="text-sm text-slate-400">登録済み</div>
          </div>
        </div>

        <!-- Active Today -->
        <div class="progress-card">
          <div class="text-center mb-3">
            <div class="text-3xl mb-2">🌟</div>
            <h5 class="text-white font-medium">今日の参加者</h5>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">{{ analyticsData.studentProgress.activeToday }}</div>
            <div class="text-sm text-slate-400">アクティブ</div>
          </div>
        </div>

        <!-- Average Improvement -->
        <div class="progress-card">
          <div class="text-center mb-3">
            <div class="text-3xl mb-2">📊</div>
            <h5 class="text-white font-medium">平均改善率</h5>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-400">+{{ analyticsData.studentProgress.averageImprovement }}%</div>
            <div class="text-sm text-slate-400">今週</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Learning Difficulty Distribution -->
    <div class="mb-6">
      <h4 class="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <span class="text-xl">🎯</span>
        難易度別学習分布
      </h4>
      <div class="space-y-3">
        <div 
          v-for="difficulty in difficultyDistribution" 
          :key="difficulty.level"
          class="difficulty-bar"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium" :class="difficulty.textClass">{{ difficulty.label }}</span>
            <span class="text-sm text-slate-400">{{ difficulty.percentage }}%</span>
          </div>
          <div class="w-full bg-slate-600 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-700"
              :class="difficulty.barClass"
              :style="{ width: `${difficulty.percentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export and Actions -->
    <div class="pt-6 border-t border-slate-600">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            @click="exportAnalytics"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <span class="text-sm">📊</span>
            データエクスポート
          </button>
          
          <button 
            @click="generateReport"
            class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <span class="text-sm">📋</span>
            レポート生成
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
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'BasicAnalytics',
  props: {
    analyticsData: {
      type: Object,
      default: () => ({
        sessionTrends: [],
        topMissions: [],
        studentProgress: {}
      })
    }
  },
  setup(props) {
    const selectedPeriod = ref('today')
    const lastUpdateTime = ref(new Date().toLocaleTimeString())

    // Key metrics
    const metrics = ref({
      totalSessions: 24,
      sessionGrowth: 15,
      averageCompletion: 87,
      completionGrowth: 8,
      engagement: 4.2,
      responseTime: 12,
      responseImprovement: 3
    })

    // Difficulty distribution data
    const difficultyDistribution = ref([
      {
        level: 'beginner',
        label: '初級レベル',
        percentage: 45,
        textClass: 'text-green-400',
        barClass: 'bg-green-500'
      },
      {
        level: 'intermediate',
        label: '中級レベル',
        percentage: 35,
        textClass: 'text-yellow-400',
        barClass: 'bg-yellow-500'
      },
      {
        level: 'advanced',
        label: '上級レベル',
        percentage: 20,
        textClass: 'text-red-400',
        barClass: 'bg-red-500'
      }
    ])

    // Computed properties
    const maxSessions = computed(() => {
      if (!props.analyticsData.sessionTrends.length) return 10
      return Math.max(...props.analyticsData.sessionTrends.map(d => d.sessions))
    })

    // Methods
    const exportAnalytics = () => {
      alert('📊 分析データをエクスポートします\n\n以下の形式で出力:\n• CSV形式の詳細データ\n• PDF形式のサマリーレポート\n• Excel形式の統計データ\n\n※ エクスポート機能は開発中です')
    }

    const generateReport = () => {
      alert('📋 包括的なレポートを生成します\n\n含まれる内容:\n• 学習進捗分析\n• 生徒パフォーマンス評価\n• 改善提案\n• 次週の学習計画\n\n※ レポート生成機能は開発中です')
    }

    const updateMetrics = () => {
      // Update metrics based on selected period
      const multiplier = selectedPeriod.value === 'month' ? 30 : selectedPeriod.value === 'week' ? 7 : 1
      
      metrics.value = {
        totalSessions: 24 * multiplier,
        sessionGrowth: 10 + Math.floor(Math.random() * 10),
        averageCompletion: 80 + Math.floor(Math.random() * 15),
        completionGrowth: 5 + Math.floor(Math.random() * 10),
        engagement: 3.5 + Math.random() * 1.5,
        responseTime: 8 + Math.floor(Math.random() * 8),
        responseImprovement: 2 + Math.floor(Math.random() * 4)
      }
      
      lastUpdateTime.value = new Date().toLocaleTimeString()
    }

    // Watch for period changes
    const watchPeriod = () => {
      updateMetrics()
    }

    // Lifecycle
    onMounted(() => {
      console.log('📊 BasicAnalytics component mounted')
      updateMetrics()
      
      // Set up periodic updates
      setInterval(() => {
        lastUpdateTime.value = new Date().toLocaleTimeString()
      }, 30000) // Update timestamp every 30 seconds
    })

    return {
      selectedPeriod,
      lastUpdateTime,
      metrics,
      difficultyDistribution,
      maxSessions,
      exportAnalytics,
      generateReport,
      updateMetrics,
      watchPeriod
    }
  },
  watch: {
    selectedPeriod() {
      this.updateMetrics()
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  @apply bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6;
}

.metric-card {
  @apply border rounded-lg p-4 transition-all hover:scale-105;
}

.progress-card {
  @apply bg-slate-700/30 border border-slate-600 rounded-lg p-4 transition-all hover:border-slate-500;
}

.chart-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.difficulty-bar {
  transition: all 0.3s ease;
}

/* PC Optimized Styles */
@media (min-width: 1024px) {
  .dashboard-card {
    @apply p-8;
  }
  
  .metric-card {
    @apply p-6;
  }
  
  .progress-card {
    @apply p-6;
  }
  
  /* Better hover effects for larger screens */
  .metric-card:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  /* Enhanced chart interactivity */
  .chart-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* Animation for chart bars */
.chart-container div div {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-container div div:hover {
  filter: brightness(1.1);
}

/* Focus styles for keyboard navigation */
button:focus-visible, select:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .grid-cols-1.md\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Loading state animation */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.loading-shimmer {
  background: linear-gradient(90deg, #374151 25%, #475569 50%, #374151 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
</style>