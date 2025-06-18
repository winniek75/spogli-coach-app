<template>
  <div class="result-modal-overlay" @click.self="$emit('goHome')">
    <div class="result-modal">
      <!-- Header -->
      <div class="result-header">
        <div class="result-icon">
          {{ getResultIcon() }}
        </div>
        <h2 class="result-title">{{ getResultTitle() }}</h2>
        <p class="result-subtitle">{{ getResultSubtitle() }}</p>
      </div>

      <!-- Score Display -->
      <div class="score-section">
        <div class="main-score">
          <div class="score-label">最終スコア</div>
          <div class="score-value">{{ score.toLocaleString() }}</div>
          <div v-if="isNewRecord" class="new-record-badge">
            🏆 新記録！
          </div>
        </div>
      </div>

      <!-- Statistics Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-value">{{ completedSentences }}</div>
          <div class="stat-label">完成した文</div>
          <div class="stat-detail">目標: {{ targetSentences }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">{{ accuracy }}%</div>
          <div class="stat-label">正解率</div>
          <div class="stat-detail">{{ getAccuracyMessage() }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatTime(timeTaken) }}</div>
          <div class="stat-label">プレイ時間</div>
          <div class="stat-detail">{{ getTimeMessage() }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">{{ comboBest }}</div>
          <div class="stat-label">最高連続正解</div>
          <div class="stat-detail">{{ getComboMessage() }}</div>
        </div>
      </div>

      <!-- Performance Analysis -->
      <div class="performance-section">
        <h3 class="performance-title">🎓 学習成果</h3>
        <div class="performance-content">
          <div class="achievement-stars">
            <div 
              v-for="star in 3"
              :key="star"
              class="star"
              :class="{ 'earned': star <= earnedStars }"
            >
              ⭐
            </div>
          </div>
          <div class="performance-text">
            <p>{{ getPerformanceMessage() }}</p>
            <div v-if="improvements.length > 0" class="improvements">
              <h4>💡 改善ポイント:</h4>
              <ul>
                <li v-for="improvement in improvements" :key="improvement">
                  {{ improvement }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Reward Section -->
      <div v-if="rewards.length > 0" class="reward-section">
        <h3 class="reward-title">🎁 獲得報酬</h3>
        <div class="rewards-grid">
          <div 
            v-for="reward in rewards"
            :key="reward.type"
            class="reward-item"
          >
            <div class="reward-icon">{{ reward.icon }}</div>
            <div class="reward-name">{{ reward.name }}</div>
            <div class="reward-description">{{ reward.description }}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          @click="handlePlayAgain"
          class="action-button primary-button"
        >
          <Icon name="play" class="w-5 h-5" />
          もう一度プレイ
        </button>
        
        <button 
          @click="handleGoHome"
          class="action-button secondary-button"
        >
          <Icon name="home" class="w-5 h-5" />
          ホームに戻る
        </button>
      </div>

      <!-- Close Button -->
      <button 
        @click="handleGoHome"
        class="close-button"
        title="閉じる"
      >
        <Icon name="x-mark" class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/components/shared/Icon.vue'

const props = defineProps({
  score: {
    type: Number,
    default: 0
  },
  completedSentences: {
    type: Number,
    default: 0
  },
  targetSentences: {
    type: Number,
    default: 5
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  comboBest: {
    type: Number,
    default: 0
  },
  isNewRecord: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['playAgain', 'goHome'])

// Computed properties
const completionRate = computed(() => {
  return Math.round((props.completedSentences / props.targetSentences) * 100)
})

const earnedStars = computed(() => {
  let stars = 0
  
  // Star 1: Complete at least 60% of target
  if (completionRate.value >= 60) stars++
  
  // Star 2: Achieve 80% accuracy
  if (props.accuracy >= 80) stars++
  
  // Star 3: Complete 100% of target with high accuracy
  if (completionRate.value >= 100 && props.accuracy >= 85) stars++
  
  return stars
})

const rewards = computed(() => {
  const rewardsList = []
  
  if (earnedStars.value >= 1) {
    rewardsList.push({
      type: 'stars',
      icon: '⭐',
      name: `${earnedStars.value}つ星獲得`,
      description: '素晴らしい成果です！'
    })
  }
  
  if (props.isNewRecord) {
    rewardsList.push({
      type: 'record',
      icon: '🏆',
      name: '新記録達成',
      description: '自己ベストを更新しました！'
    })
  }
  
  if (props.comboBest >= 5) {
    rewardsList.push({
      type: 'combo',
      icon: '🔥',
      name: 'コンボマスター',
      description: '5連続正解を達成しました！'
    })
  }
  
  if (props.accuracy === 100) {
    rewardsList.push({
      type: 'perfect',
      icon: '💯',
      name: 'パーフェクト',
      description: '全問正解です！'
    })
  }
  
  return rewardsList
})

const improvements = computed(() => {
  const suggestions = []
  
  if (props.accuracy < 70) {
    suggestions.push('文法ルールを復習して正確性を向上させましょう')
  }
  
  if (completionRate.value < 80) {
    suggestions.push('制限時間内により多くの文を完成させましょう')
  }
  
  if (props.comboBest < 3) {
    suggestions.push('連続正解を目指して集中力を高めましょう')
  }
  
  return suggestions
})

// Methods
const getResultIcon = () => {
  if (earnedStars.value >= 3) return '🏆'
  if (earnedStars.value >= 2) return '🎉'
  if (earnedStars.value >= 1) return '👏'
  return '💪'
}

const getResultTitle = () => {
  if (earnedStars.value >= 3) return 'パーフェクト！'
  if (earnedStars.value >= 2) return '素晴らしい！'
  if (earnedStars.value >= 1) return 'よくできました！'
  return 'お疲れさまでした！'
}

const getResultSubtitle = () => {
  if (completionRate.value >= 100) {
    return '目標を完全達成しました！'
  } else if (completionRate.value >= 80) {
    return 'とても良い成果です！'
  } else if (completionRate.value >= 60) {
    return '順調に進歩しています！'
  } else {
    return '次回はもっと頑張りましょう！'
  }
}

const getAccuracyMessage = () => {
  if (props.accuracy >= 90) return '完璧！'
  if (props.accuracy >= 80) return '優秀'
  if (props.accuracy >= 70) return '良好'
  if (props.accuracy >= 60) return '普通'
  return '要改善'
}

const getTimeMessage = () => {
  const minutes = Math.floor(props.timeTaken / 60)
  if (minutes < 1) return '高速クリア！'
  if (minutes < 2) return '良いペース'
  if (minutes < 3) return '安定したペース'
  return 'じっくり取り組みました'
}

const getComboMessage = () => {
  if (props.comboBest >= 5) return '素晴らしい集中力！'
  if (props.comboBest >= 3) return '良い調子！'
  if (props.comboBest >= 2) return '順調です'
  return '次回は連続正解を目指そう'
}

const getPerformanceMessage = () => {
  if (earnedStars.value >= 3) {
    return 'パーフェクトな成果です！文法の理解が深まりました。'
  } else if (earnedStars.value >= 2) {
    return '素晴らしい進歩です！文法スキルが向上しています。'
  } else if (earnedStars.value >= 1) {
    return '良いスタートです！継続して学習を続けましょう。'
  } else {
    return '練習を重ねることで必ず上達します。諦めずに頑張りましょう！'
  }
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`
  }
  return `${remainingSeconds}秒`
}

// もう一度プレイボタンのハンドラー
const handlePlayAgain = () => {
  console.log('🎮 GameResultModal: Play Again button clicked')
  console.log('📤 Emitting playAgain event')
  emit('playAgain')
}

// ホームに戻るボタンのハンドラー
const handleGoHome = () => {
  console.log('🏠 GameResultModal: Go Home button clicked')
  console.log('📤 Emitting goHome event')
  emit('goHome')
}
</script>

<style scoped>
.result-modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4;
  backdrop-filter: blur(5px);
}

.result-modal {
  @apply bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto relative;
  border: 2px solid rgba(99, 102, 241, 0.3);
  color: #E5E7EB;
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Header */
.result-header {
  @apply text-center mb-8;
}

.result-icon {
  @apply text-6xl mb-4;
}

.result-title {
  @apply text-3xl font-bold text-yellow-400 mb-2;
}

.result-subtitle {
  @apply text-lg text-gray-300;
}

/* Score Section */
.score-section {
  @apply text-center mb-8;
}

.main-score {
  @apply relative inline-block;
}

.score-label {
  @apply text-sm text-gray-400 mb-2;
}

.score-value {
  @apply text-5xl font-bold text-yellow-400 mb-2;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.new-record-badge {
  @apply absolute -top-2 -right-12 bg-gradient-to-r from-yellow-400 to-orange-500;
  @apply text-black px-3 py-1 rounded-full text-sm font-bold transform rotate-12;
  animation: recordPulse 2s ease-in-out infinite;
}

@keyframes recordPulse {
  0%, 100% { transform: rotate(12deg) scale(1); }
  50% { transform: rotate(12deg) scale(1.05); }
}

/* Statistics Grid */
.stats-grid {
  @apply grid grid-cols-2 gap-4 mb-8;
}

.stat-card {
  @apply bg-slate-700 rounded-lg p-4 text-center;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.stat-icon {
  @apply text-2xl mb-2;
}

.stat-value {
  @apply text-2xl font-bold text-yellow-400 mb-1;
}

.stat-label {
  @apply text-sm font-medium text-gray-300 mb-1;
}

.stat-detail {
  @apply text-xs text-gray-400;
}

/* Performance Section */
.performance-section {
  @apply mb-8;
}

.performance-title {
  @apply text-xl font-bold text-gray-200 mb-4;
}

.performance-content {
  @apply bg-slate-700 rounded-lg p-6;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.achievement-stars {
  @apply flex justify-center space-x-2 mb-4;
}

.star {
  @apply text-3xl transition-all duration-300;
  filter: grayscale(100%) opacity(0.3);
}

.star.earned {
  filter: grayscale(0%) opacity(1);
  animation: starEarn 0.5s ease-out;
}

@keyframes starEarn {
  0% { transform: scale(0.5) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.performance-text {
  @apply text-center;
}

.improvements {
  @apply mt-4 text-left;
}

.improvements h4 {
  @apply font-medium text-yellow-400 mb-2;
}

.improvements ul {
  @apply space-y-1;
}

.improvements li {
  @apply text-sm text-gray-300;
}

.improvements li::before {
  content: "→";
  @apply mr-2 text-yellow-400;
}

/* Reward Section */
.reward-section {
  @apply mb-8;
}

.reward-title {
  @apply text-xl font-bold text-gray-200 mb-4;
}

.rewards-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.reward-item {
  @apply bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-center;
  animation: rewardGlow 2s ease-in-out infinite alternate;
}

@keyframes rewardGlow {
  0% { box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
  100% { box-shadow: 0 8px 25px rgba(139, 92, 246, 0.6); }
}

.reward-icon {
  @apply text-3xl mb-2;
}

.reward-name {
  @apply font-bold text-white mb-1;
}

.reward-description {
  @apply text-sm text-purple-100;
}

/* Action Buttons */
.action-buttons {
  @apply flex space-x-4;
}

.action-button {
  @apply flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all;
}

.primary-button {
  @apply bg-gradient-to-r from-purple-600 to-blue-600 text-white;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.secondary-button {
  @apply bg-slate-700 text-gray-300 border border-slate-600;
}

.secondary-button:hover {
  @apply bg-slate-600 -translate-y-1;
}

/* Close Button */
.close-button {
  @apply absolute top-4 right-4 w-8 h-8 flex items-center justify-center;
  @apply text-gray-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors;
}

/* Responsive Design */
@media (max-width: 640px) {
  .result-modal {
    @apply p-6;
  }
  
  .result-icon {
    @apply text-4xl mb-3;
  }
  
  .result-title {
    @apply text-2xl;
  }
  
  .score-value {
    @apply text-4xl;
  }
  
  .stats-grid {
    @apply grid-cols-1 gap-3;
  }
  
  .stat-value {
    @apply text-xl;
  }
  
  .action-buttons {
    @apply flex-col space-x-0 space-y-3;
  }
  
  .new-record-badge {
    @apply -right-8 text-xs px-2;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .result-modal {
    @apply bg-slate-900;
    border-color: rgba(99, 102, 241, 0.4);
  }
  
  .stat-card,
  .performance-content {
    @apply bg-slate-800;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .result-modal {
    border-width: 3px;
  }
  
  .stat-card,
  .performance-content {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .result-modal,
  .star.earned,
  .reward-item,
  .new-record-badge {
    animation: none;
  }
  
  .primary-button:hover,
  .secondary-button:hover {
    transform: none;
  }
}
</style>