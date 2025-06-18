<template>
  <teleport to="body">
    <div
      v-if="show"
      class="stats-modal-overlay"
      @click="handleOverlayClick"
    >
      <div 
        class="stats-modal"
        :class="modalClasses"
        @click.stop
      >
        <!-- モーダルヘッダー -->
        <div class="modal-header">
          <div class="header-content">
            <div class="modal-title">
              <Icon name="chart-bar" class="w-6 h-6 text-green-400" />
              <h2>Learning Statistics</h2>
              <Icon name="trophy" class="w-6 h-6 text-yellow-400" />
            </div>
            <p class="modal-subtitle">Track your progress across the Grammar Galaxy</p>
          </div>
          <button
            @click="closeModal"
            class="close-button"
            :disabled="loading"
          >
            <Icon name="x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- 統計タブ -->
        <div class="stats-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ 'tab-active': activeTab === tab.id }"
          >
            <Icon :name="tab.icon" class="w-5 h-5" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- 統計内容 -->
        <div class="modal-body">
          <!-- 概要タブ -->
          <div v-if="activeTab === 'overview'" class="stats-section">
            <!-- 総合統計カード -->
            <div class="stats-cards">
              <div class="stat-card primary">
                <div class="stat-icon">
                  <Icon name="star" class="w-8 h-8 text-yellow-400" />
                </div>
                <div class="stat-content">
                  <h3 class="stat-value">{{ totalStats.totalStars }}</h3>
                  <p class="stat-label">Total Stars</p>
                </div>
                <div class="stat-trend up">
                  <Icon name="arrow-trending-up" class="w-4 h-4" />
                  <span>+{{ totalStats.recentStars }} this week</span>
                </div>
              </div>

              <div class="stat-card secondary">
                <div class="stat-icon">
                  <Icon name="game-pad" class="w-8 h-8 text-blue-400" />
                </div>
                <div class="stat-content">
                  <h3 class="stat-value">{{ totalStats.gamesPlayed }}</h3>
                  <p class="stat-label">Games Played</p>
                </div>
                <div class="stat-trend up">
                  <Icon name="arrow-trending-up" class="w-4 h-4" />
                  <span>{{ totalStats.averageGamesPerDay }}/day avg</span>
                </div>
              </div>

              <div class="stat-card success">
                <div class="stat-icon">
                  <Icon name="check-circle" class="w-8 h-8 text-green-400" />
                </div>
                <div class="stat-content">
                  <h3 class="stat-value">{{ totalStats.accuracy }}%</h3>
                  <p class="stat-label">Overall Accuracy</p>
                </div>
                <div class="stat-trend" :class="totalStats.accuracyTrend > 0 ? 'up' : 'down'">
                  <Icon :name="totalStats.accuracyTrend > 0 ? 'arrow-trending-up' : 'arrow-trending-down'" class="w-4 h-4" />
                  <span>{{ totalStats.accuracyTrend > 0 ? '+' : '' }}{{ totalStats.accuracyTrend }}% vs last week</span>
                </div>
              </div>

              <div class="stat-card warning">
                <div class="stat-icon">
                  <Icon name="clock" class="w-8 h-8 text-orange-400" />
                </div>
                <div class="stat-content">
                  <h3 class="stat-value">{{ formatTime(totalStats.totalPlayTime) }}</h3>
                  <p class="stat-label">Total Play Time</p>
                </div>
                <div class="stat-trend neutral">
                  <Icon name="information-circle" class="w-4 h-4" />
                  <span>{{ formatTime(totalStats.averageSessionTime) }} avg session</span>
                </div>
              </div>
            </div>

            <!-- 学習進捗チャート -->
            <div class="progress-section">
              <h3 class="section-title">Learning Progress</h3>
              <div class="progress-grid">
                <!-- レベル別進捗 -->
                <div class="progress-card">
                  <h4 class="progress-title">Grammar Levels</h4>
                  <div class="level-progress">
                    <div
                      v-for="level in levelProgress"
                      :key="level.name"
                      class="level-item"
                    >
                      <div class="level-info">
                        <span class="level-name">{{ level.name }}</span>
                        <span class="level-percentage">{{ level.completion }}%</span>
                      </div>
                      <div class="level-bar">
                        <div 
                          class="level-fill"
                          :style="{ width: level.completion + '%' }"
                          :class="getLevelColorClass(level.completion)"
                        ></div>
                      </div>
                      <div class="level-stars">
                        <Icon
                          v-for="i in 3"
                          :key="i"
                          name="star"
                          class="w-3 h-3"
                          :class="i <= level.stars ? 'text-yellow-400' : 'text-gray-400'"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 最近のアクティビティ -->
                <div class="progress-card">
                  <h4 class="progress-title">Recent Activity</h4>
                  <div class="activity-timeline">
                    <div
                      v-for="activity in recentActivities"
                      :key="activity.id"
                      class="activity-item"
                    >
                      <div class="activity-icon">
                        <Icon :name="activity.icon" class="w-4 h-4" :class="activity.iconColor" />
                      </div>
                      <div class="activity-content">
                        <p class="activity-text">{{ activity.text }}</p>
                        <span class="activity-time">{{ activity.time }}</span>
                      </div>
                      <div v-if="activity.stars" class="activity-stars">
                        <Icon
                          v-for="i in activity.stars"
                          :key="i"
                          name="star"
                          class="w-3 h-3 text-yellow-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 今週の目標 -->
            <div class="goals-section">
              <h3 class="section-title">Weekly Goals</h3>
              <div class="goals-grid">
                <div
                  v-for="goal in weeklyGoals"
                  :key="goal.id"
                  class="goal-card"
                  :class="{ 'goal-completed': goal.completed }"
                >
                  <div class="goal-icon">
                    <Icon :name="goal.icon" class="w-6 h-6" :class="goal.iconColor" />
                  </div>
                  <div class="goal-content">
                    <h4 class="goal-title">{{ goal.title }}</h4>
                    <p class="goal-description">{{ goal.description }}</p>
                    <div class="goal-progress">
                      <div class="goal-bar">
                        <div 
                          class="goal-fill"
                          :style="{ width: goal.progress + '%' }"
                        ></div>
                      </div>
                      <span class="goal-text">{{ goal.current }}/{{ goal.target }}</span>
                    </div>
                  </div>
                  <div v-if="goal.completed" class="goal-badge">
                    <Icon name="check" class="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ゲーム別統計タブ -->
          <div v-if="activeTab === 'games'" class="stats-section">
            <h3 class="section-title">Game Performance</h3>
            
            <div class="game-stats-grid">
              <div
                v-for="game in gameStats"
                :key="game.id"
                class="game-stat-card"
              >
                <div class="game-header">
                  <div class="game-icon">
                    <Icon :name="game.icon" class="w-6 h-6" :class="game.iconColor" />
                  </div>
                  <div class="game-info">
                    <h4 class="game-name">{{ game.name }}</h4>
                    <p class="game-category">{{ game.category }}</p>
                  </div>
                  <div class="game-stars">
                    <Icon
                      v-for="i in 3"
                      :key="i"
                      name="star"
                      class="w-4 h-4"
                      :class="i <= game.bestStars ? 'text-yellow-400' : 'text-gray-400'"
                    />
                  </div>
                </div>
                
                <div class="game-metrics">
                  <div class="metric-row">
                    <span class="metric-label">Best Score:</span>
                    <span class="metric-value">{{ game.bestScore.toLocaleString() }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Times Played:</span>
                    <span class="metric-value">{{ game.timesPlayed }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Avg Accuracy:</span>
                    <span class="metric-value">{{ game.avgAccuracy }}%</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Total Time:</span>
                    <span class="metric-value">{{ formatTime(game.totalTime) }}</span>
                  </div>
                </div>

                <div class="game-progress-chart">
                  <h5 class="chart-title">Recent Performance</h5>
                  <div class="mini-chart">
                    <div
                      v-for="(score, index) in game.recentScores"
                      :key="index"
                      class="chart-bar"
                      :style="{ height: (score / Math.max(...game.recentScores)) * 100 + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 達成度タブ -->
          <div v-if="activeTab === 'achievements'" class="stats-section">
            <h3 class="section-title">Achievements & Milestones</h3>
            
            <!-- 達成度概要 -->
            <div class="achievement-summary">
              <div class="summary-card">
                <Icon name="trophy" class="w-8 h-8 text-yellow-400" />
                <div class="summary-content">
                  <h4>{{ achievements.filter(a => a.unlocked).length }}</h4>
                  <p>Achievements Unlocked</p>
                </div>
              </div>
              <div class="summary-card">
                <Icon name="star" class="w-8 h-8 text-purple-400" />
                <div class="summary-content">
                  <h4>{{ achievements.filter(a => a.unlocked && a.rarity === 'rare').length }}</h4>
                  <p>Rare Achievements</p>
                </div>
              </div>
              <div class="summary-card">
                <Icon name="fire" class="w-8 h-8 text-red-400" />
                <div class="summary-content">
                  <h4>{{ totalStats.currentStreak }}</h4>
                  <p>Day Streak</p>
                </div>
              </div>
            </div>

            <!-- 達成度リスト -->
            <div class="achievements-grid">
              <div
                v-for="achievement in achievements"
                :key="achievement.id"
                class="achievement-card"
                :class="{
                  'achievement-unlocked': achievement.unlocked,
                  'achievement-rare': achievement.rarity === 'rare',
                  'achievement-legendary': achievement.rarity === 'legendary'
                }"
              >
                <div class="achievement-icon">
                  <Icon :name="achievement.icon" class="w-8 h-8" />
                  <div v-if="achievement.unlocked" class="unlock-badge">
                    <Icon name="check" class="w-3 h-3" />
                  </div>
                </div>
                
                <div class="achievement-content">
                  <h4 class="achievement-title">{{ achievement.title }}</h4>
                  <p class="achievement-description">{{ achievement.description }}</p>
                  
                  <div v-if="achievement.progress !== undefined" class="achievement-progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill"
                        :style="{ width: (achievement.progress / achievement.target) * 100 + '%' }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ achievement.progress }}/{{ achievement.target }}</span>
                  </div>
                  
                  <div v-if="achievement.unlocked" class="achievement-date">
                    Unlocked {{ achievement.unlockedDate }}
                  </div>
                </div>

                <div class="achievement-reward">
                  <Icon name="gift" class="w-4 h-4 text-yellow-400" />
                  <span>{{ achievement.reward }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 時間分析タブ -->
          <div v-if="activeTab === 'time'" class="stats-section">
            <h3 class="section-title">Time Analysis</h3>
            
            <!-- 時間統計カード -->
            <div class="time-stats-cards">
              <div class="time-card">
                <Icon name="calendar-days" class="w-6 h-6 text-blue-400" />
                <div class="time-content">
                  <h4>{{ totalStats.daysActive }}</h4>
                  <p>Days Active</p>
                </div>
              </div>
              <div class="time-card">
                <Icon name="clock" class="w-6 h-6 text-green-400" />
                <div class="time-content">
                  <h4>{{ formatTime(totalStats.totalPlayTime) }}</h4>
                  <p>Total Time</p>
                </div>
              </div>
              <div class="time-card">
                <Icon name="chart-bar" class="w-6 h-6 text-purple-400" />
                <div class="time-content">
                  <h4>{{ formatTime(totalStats.averageSessionTime) }}</h4>
                  <p>Avg Session</p>
                </div>
              </div>
              <div class="time-card">
                <Icon name="fire" class="w-6 h-6 text-orange-400" />
                <div class="time-content">
                  <h4>{{ totalStats.longestSession }}</h4>
                  <p>Longest Session</p>
                </div>
              </div>
            </div>

            <!-- 学習時間チャート -->
            <div class="time-chart-section">
              <h4 class="chart-title">Daily Learning Time (Last 7 Days)</h4>
              <div class="time-chart">
                <div
                  v-for="(day, index) in dailyTimeData"
                  :key="index"
                  class="time-bar-container"
                >
                  <div 
                    class="time-bar"
                    :style="{ height: (day.minutes / Math.max(...dailyTimeData.map(d => d.minutes))) * 100 + '%' }"
                  ></div>
                  <div class="time-label">{{ day.day }}</div>
                  <div class="time-value">{{ day.minutes }}m</div>
                </div>
              </div>
            </div>

            <!-- 時間帯別学習パターン -->
            <div class="time-pattern-section">
              <h4 class="chart-title">Learning Patterns by Time of Day</h4>
              <div class="time-pattern-grid">
                <div
                  v-for="hour in hourlyPattern"
                  :key="hour.hour"
                  class="hour-slot"
                  :class="getHourIntensityClass(hour.intensity)"
                >
                  <div class="hour-label">{{ hour.hour }}:00</div>
                  <div class="hour-bar" :style="{ height: hour.intensity + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- モーダルフッター -->
        <div class="modal-footer">
          <div class="footer-info">
            <div class="export-options">
              <button @click="exportStats" class="export-button">
                <Icon name="arrow-down-tray" class="w-4 h-4" />
                Export Statistics
              </button>
              <button @click="shareStats" class="share-button">
                <Icon name="share" class="w-4 h-4" />
                Share Progress
              </button>
            </div>
          </div>
          
          <div class="footer-actions">
            <button
              @click="closeModal"
              class="close-button-footer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import Icon from '@/components/shared/Icon.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Store
const store = useGrammarGalaxyStore()

// リアクティブデータ
const activeTab = ref('overview')
const loading = ref(false)

// タブ設定
const tabs = ref([
  { id: 'overview', label: 'Overview', icon: 'chart-pie' },
  { id: 'games', label: 'Games', icon: 'game-pad' },
  { id: 'achievements', label: 'Achievements', icon: 'trophy' },
  { id: 'time', label: 'Time Analysis', icon: 'clock' }
])

// 計算されたプロパティ
const modalClasses = computed(() => ({
  'modal-loading': loading.value
}))

// 総合統計
const totalStats = computed(() => {
  const progress = store.grammarProgress
  
  // 基本統計の計算
  let totalStars = 0
  let gamesPlayed = 0
  let totalPlayTime = 0
  let totalAccuracy = 0
  let accuracyCount = 0
  
  Object.values(progress).forEach(gameProgress => {
    if (gameProgress && typeof gameProgress === 'object') {
      totalStars += gameProgress.stars || 0
      gamesPlayed += gameProgress.timesPlayed || 0
      totalPlayTime += gameProgress.totalTime || 0
      
      if (gameProgress.accuracy) {
        totalAccuracy += gameProgress.accuracy
        accuracyCount++
      }
    }
  })
  
  return {
    totalStars,
    recentStars: Math.floor(totalStars * 0.3), // 模擬的な最近のスター数
    gamesPlayed,
    averageGamesPerDay: Math.round((gamesPlayed / Math.max(1, totalStats.value?.daysActive || 7)) * 10) / 10,
    accuracy: accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0,
    accuracyTrend: Math.floor(Math.random() * 10) - 5, // 模擬的なトレンド
    totalPlayTime,
    averageSessionTime: gamesPlayed > 0 ? Math.round(totalPlayTime / gamesPlayed) : 0,
    currentStreak: 7, // 模擬データ
    daysActive: 15, // 模擬データ
    longestSession: '45m' // 模擬データ
  }
})

// レベル別進捗
const levelProgress = computed(() => [
  {
    name: 'Foundation',
    completion: Math.min(100, (store.grammarProgress.grammarColorCode?.stars || 0) * 25 +
                              (store.grammarProgress.patternHunter?.stars || 0) * 25),
    stars: Math.max(store.grammarProgress.grammarColorCode?.stars || 0,
                   store.grammarProgress.patternHunter?.stars || 0)
  },
  {
    name: 'Application', 
    completion: Math.min(100, (store.grammarProgress.timeZoneNavigator?.stars || 0) * 20 +
                              (store.grammarProgress.grammarReflexArena?.stars || 0) * 20),
    stars: Math.max(store.grammarProgress.timeZoneNavigator?.stars || 0,
                   store.grammarProgress.grammarReflexArena?.stars || 0)
  },
  {
    name: 'Mastery',
    completion: Math.min(100, (store.grammarProgress.advancedPatternMatrix?.stars || 0) * 15),
    stars: store.grammarProgress.advancedPatternMatrix?.stars || 0
  }
])

// ゲーム別統計
const gameStats = computed(() => [
  {
    id: 'grammar-color-code',
    name: 'Grammar Color Code',
    category: 'Pattern Recognition',
    icon: 'paint-brush',
    iconColor: 'text-blue-400',
    bestScore: store.grammarProgress.grammarColorCode?.bestScore || 0,
    bestStars: store.grammarProgress.grammarColorCode?.stars || 0,
    timesPlayed: store.grammarProgress.grammarColorCode?.timesPlayed || 0,
    avgAccuracy: store.grammarProgress.grammarColorCode?.accuracy || 0,
    totalTime: store.grammarProgress.grammarColorCode?.totalTime || 0,
    recentScores: store.grammarProgress.grammarColorCode?.recentScores || [0, 0, 0, 0, 0]
  },
  {
    id: 'pattern-hunter',
    name: 'Pattern Hunter',
    category: 'Visual Search',
    icon: 'magnifying-glass',
    iconColor: 'text-purple-400',
    bestScore: store.grammarProgress.patternHunter?.bestScore || 0,
    bestStars: store.grammarProgress.patternHunter?.stars || 0,
    timesPlayed: store.grammarProgress.patternHunter?.timesPlayed || 0,
    avgAccuracy: store.grammarProgress.patternHunter?.accuracy || 0,
    totalTime: store.grammarProgress.patternHunter?.totalTime || 0,
    recentScores: store.grammarProgress.patternHunter?.recentScores || [0, 0, 0, 0, 0]
  },
  {
    id: 'time-zone-navigator',
    name: 'Time Zone Navigator',
    category: 'Tense Mastery',
    icon: 'clock',
    iconColor: 'text-green-400',
    bestScore: store.grammarProgress.timeZoneNavigator?.bestScore || 0,
    bestStars: store.grammarProgress.timeZoneNavigator?.stars || 0,
    timesPlayed: store.grammarProgress.timeZoneNavigator?.timesPlayed || 0,
    avgAccuracy: store.grammarProgress.timeZoneNavigator?.accuracy || 0,
    totalTime: store.grammarProgress.timeZoneNavigator?.totalTime || 0,
    recentScores: store.grammarProgress.timeZoneNavigator?.recentScores || [0, 0, 0, 0, 0]
  }
])

// 最近のアクティビティ
const recentActivities = ref([
  {
    id: 1,
    text: 'Completed Pattern Hunter',
    time: '2 hours ago',
    icon: 'check-circle',
    iconColor: 'text-green-400',
    stars: 3
  },
  {
    id: 2,
    text: 'Unlocked Time Zone Navigator',
    time: '1 day ago',
    icon: 'lock-open',
    iconColor: 'text-blue-400'
  },
  {
    id: 3,
    text: 'New high score in Grammar Color Code',
    time: '2 days ago',
    icon: 'trophy',
    iconColor: 'text-yellow-400'
  },
  {
    id: 4,
    text: 'Achieved 7-day learning streak',
    time: '3 days ago',
    icon: 'fire',
    iconColor: 'text-red-400'
  }
])

// 週間目標
const weeklyGoals = ref([
  {
    id: 1,
    title: 'Play 10 Games',
    description: 'Complete 10 grammar games this week',
    icon: 'game-pad',
    iconColor: 'text-blue-400',
    current: 7,
    target: 10,
    progress: 70,
    completed: false
  },
  {
    id: 2,
    title: 'Earn 15 Stars',
    description: 'Collect 15 stars across all games',
    icon: 'star',
    iconColor: 'text-yellow-400',
    current: 15,
    target: 15,
    progress: 100,
    completed: true
  },
  {
    id: 3,
    title: 'Study Streak',
    description: 'Maintain a 7-day learning streak',
    icon: 'fire',
    iconColor: 'text-red-400',
    current: 7,
    target: 7,
    progress: 100,
    completed: true
  }
])

// 達成度
const achievements = ref([
  {
    id: 1,
    title: 'First Steps',
    description: 'Complete your first grammar game',
    icon: 'star',
    rarity: 'common',
    unlocked: true,
    unlockedDate: '5 days ago',
    reward: '100 XP'
  },
  {
    id: 2,
    title: 'Pattern Master',
    description: 'Get 3 stars in Pattern Hunter',
    icon: 'magnifying-glass',
    rarity: 'rare',
    unlocked: true,
    unlockedDate: '2 days ago',
    reward: '250 XP'
  },
  {
    id: 3,
    title: 'Grammar Guru',
    description: 'Complete all Foundation level games',
    icon: 'academic-cap',
    rarity: 'rare',
    unlocked: false,
    progress: 2,
    target: 3,
    reward: '500 XP'
  },
  {
    id: 4,
    title: 'Speed Demon',
    description: 'Complete a game in under 30 seconds',
    icon: 'bolt',
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
    target: 1,
    reward: '1000 XP'
  }
])

// 日別学習時間データ
const dailyTimeData = ref([
  { day: 'Mon', minutes: 25 },
  { day: 'Tue', minutes: 45 },
  { day: 'Wed', minutes: 30 },
  { day: 'Thu', minutes: 60 },
  { day: 'Fri', minutes: 35 },
  { day: 'Sat', minutes: 40 },
  { day: 'Sun', minutes: 20 }
])

// 時間帯別パターン
const hourlyPattern = ref(
  Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    intensity: Math.random() * 100
  }))
)

// メソッド
const formatTime = (seconds) => {
  if (typeof seconds === 'string') return seconds
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

const getLevelColorClass = (completion) => {
  if (completion >= 80) return 'bg-green-500'
  if (completion >= 60) return 'bg-yellow-500'
  if (completion >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

const getHourIntensityClass = (intensity) => {
  if (intensity >= 80) return 'intensity-high'
  if (intensity >= 60) return 'intensity-medium-high'
  if (intensity >= 40) return 'intensity-medium'
  if (intensity >= 20) return 'intensity-low'
  return 'intensity-none'
}

const exportStats = () => {
  const statsData = {
    totalStats: totalStats.value,
    gameStats: gameStats.value,
    achievements: achievements.value.filter(a => a.unlocked),
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(statsData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `movwise-stats-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const shareStats = () => {
  const shareText = `🌟 My MovWISE Progress 🌟\n\n` +
    `⭐ Total Stars: ${totalStats.value.totalStars}\n` +
    `🎮 Games Played: ${totalStats.value.gamesPlayed}\n` +
    `🎯 Accuracy: ${totalStats.value.accuracy}%\n` +
    `🔥 Current Streak: ${totalStats.value.currentStreak} days\n\n` +
    `Join me in Grammar Galaxy! 🚀`
  
  if (navigator.share) {
    navigator.share({
      title: 'My MovWISE Learning Progress',
      text: shareText
    })
  } else {
    // フォールバック: クリップボードにコピー
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Progress copied to clipboard!')
    })
  }
}

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  if (!loading.value) {
    closeModal()
  }
}

// ライフサイクル
onMounted(() => {
  // 統計データの初期化または更新
})
</script>

<style scoped>
.stats-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.stats-modal {
  background: linear-gradient(135deg, #1a1a3a 0%, #2a2a4a 50%, #3a3a5a 100%);
  border-radius: 1.5rem;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-loading {
  pointer-events: none;
  opacity: 0.8;
}

/* ヘッダー */
.modal-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  text-align: center;
  flex: 1;
}

.modal-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

/* タブ */
.stats-tabs {
  background: rgba(0, 0, 0, 0.2);
  padding: 0 2rem;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.tab-button {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  font-size: 0.9rem;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-active {
  color: white !important;
  border-bottom-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

/* ボディ */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.stats-section {
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

/* 統計カード */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.stat-card.primary {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-card.secondary {
  background: rgba(147, 51, 234, 0.1);
  border-color: rgba(147, 51, 234, 0.3);
}

.stat-card.success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.stat-card.warning {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
}

.stat-icon {
  margin-bottom: 1rem;
}

.stat-content h3 {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.stat-trend.up {
  color: #22c55e;
}

.stat-trend.down {
  color: #ef4444;
}

.stat-trend.neutral {
  color: rgba(255, 255, 255, 0.6);
}

/* 進捗セクション */
.progress-section {
  margin-bottom: 2rem;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.progress-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* レベル進捗 */
.level-progress {
  space-y: 1rem;
}

.level-item {
  margin-bottom: 1rem;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.level-name {
  color: white;
  font-weight: 500;
}

.level-percentage {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.level-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.level-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.level-stars {
  display: flex;
  gap: 0.2rem;
}

/* アクティビティタイムライン */
.activity-timeline {
  space-y: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: white;
  font-size: 0.9rem;
  margin: 0;
}

.activity-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.activity-stars {
  display: flex;
  gap: 0.1rem;
}

/* 目標セクション */
.goals-section {
  margin-bottom: 2rem;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.goal-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.goal-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.goal-completed {
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: rgba(34, 197, 94, 0.3) !important;
}

.goal-icon {
  margin-bottom: 1rem;
}

.goal-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.goal-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.goal-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.goal-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.goal-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.goal-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ゲーム統計 */
.game-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.game-stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.game-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-info {
  flex: 1;
}

.game-name {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.game-category {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0;
}

.game-stars {
  display: flex;
  gap: 0.1rem;
}

.game-metrics {
  margin-bottom: 1rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-row:last-child {
  border-bottom: none;
}

.metric-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.metric-value {
  color: white;
  font-weight: 500;
}

.game-progress-chart {
  margin-top: 1rem;
}

.chart-title {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 40px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #9333ea, #c084fc);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
}

/* 達成度 */
.achievement-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-content h4 {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.summary-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.achievement-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.achievement-unlocked {
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: rgba(34, 197, 94, 0.3) !important;
}

.achievement-rare {
  background: rgba(147, 51, 234, 0.1) !important;
  border-color: rgba(147, 51, 234, 0.3) !important;
}

.achievement-legendary {
  background: rgba(251, 191, 36, 0.1) !important;
  border-color: rgba(251, 191, 36, 0.3) !important;
}

.achievement-icon {
  position: relative;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.unlock-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.achievement-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.achievement-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #9333ea, #c084fc);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.achievement-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-style: italic;
}

.achievement-reward {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fbbf24;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 時間分析 */
.time-stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.time-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-content h4 {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.time-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.time-chart-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
}

.chart-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.time-chart {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 120px;
  padding: 1rem 0;
}

.time-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.time-bar {
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  width: 100%;
  min-height: 4px;
  margin-bottom: 0.5rem;
}

.time-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.time-value {
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
}

.time-pattern-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.time-pattern-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.25rem;
  margin-top: 1rem;
}

.hour-slot {
  aspect-ratio: 1;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hour-slot.intensity-none {
  background: rgba(255, 255, 255, 0.05);
}

.hour-slot.intensity-low {
  background: rgba(59, 130, 246, 0.3);
}

.hour-slot.intensity-medium {
  background: rgba(59, 130, 246, 0.5);
}

.hour-slot.intensity-medium-high {
  background: rgba(59, 130, 246, 0.7);
}

.hour-slot.intensity-high {
  background: rgba(59, 130, 246, 0.9);
}

.hour-label {
  color: white;
  font-size: 0.6rem;
  font-weight: 500;
  position: absolute;
  top: 2px;
}

.hour-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.125rem 0.125rem 0 0;
}

/* フッター */
.modal-footer {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  flex: 1;
}

.export-options {
  display: flex;
  gap: 1rem;
}

.export-button,
.share-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.export-button {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.export-button:hover {
  background: rgba(34, 197, 94, 0.3);
}

.share-button {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}

.share-button:hover {
  background: rgba(59, 130, 246, 0.3);
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

.close-button-footer {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button-footer:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .stats-modal {
    max-width: 100%;
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body {
    padding: 1rem;
  }
  
  .stats-tabs {
    padding: 0 1rem;
    overflow-x: auto;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
  
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .progress-grid,
  .goals-grid,
  .game-stats-grid,
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-summary {
    flex-direction: column;
  }
  
  .time-stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .time-pattern-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .export-options {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.2rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .time-chart {
    gap: 0.5rem;
  }
  
  .time-pattern-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .export-options {
    flex-direction: column;
  }
  
  .export-button,
  .share-button {
    justify-content: center;
  }
}
</style>