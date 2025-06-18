<template>
  <div class="game-results">
    <!-- 結果ヘッダー -->
    <div class="results-header">
      <div class="performance-icon">
        {{ performanceIcon }}
      </div>
      <h2 class="results-title">{{ performanceMessage }}</h2>
      <div class="results-subtitle">ゲーム結果</div>
    </div>
    
    <!-- メイン結果カード -->
    <div class="results-main">
      <div class="score-section">
        <div class="main-score">
          <span class="score-label">スコア</span>
          <span class="score-value">{{ score }}</span>
        </div>
        
        <div class="accuracy-ring">
          <svg class="ring-svg" width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e5e7eb"
              stroke-width="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              :stroke="accuracyColor"
              stroke-width="8"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="circumference - (accuracy / 100) * circumference"
              class="accuracy-circle"
            />
          </svg>
          <div class="accuracy-text">
            <span class="accuracy-value">{{ accuracy }}%</span>
            <span class="accuracy-label">正解率</span>
          </div>
        </div>
      </div>
      
      <!-- 詳細統計 -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ correct }}</div>
            <div class="stat-label">正解</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <div class="stat-value">{{ incorrect }}</div>
            <div class="stat-label">不正解</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">総問題数</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <div class="stat-value">{{ formattedTime }}</div>
            <div class="stat-label">プレイ時間</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- カテゴリ別結果 -->
    <div v-if="category" class="category-results">
      <h3 class="section-title">
        {{ getCategoryDisplayName(category) }} の結果
      </h3>
      
      <div class="category-stats">
        <div class="category-progress">
          <div class="progress-info">
            <span>今回の成績</span>
            <span>{{ accuracy }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: accuracy + '%', backgroundColor: accuracyColor }"
            ></div>
          </div>
        </div>
        
        <div class="category-comparison" v-if="categoryData">
          <div class="comparison-item">
            <span class="comparison-label">平均正解率</span>
            <span class="comparison-value">{{ categoryData.averageAccuracy }}%</span>
          </div>
          <div class="comparison-item">
            <span class="comparison-label">最高スコア</span>
            <span class="comparison-value">{{ categoryData.highScore }}</span>
          </div>
          <div class="comparison-item">
            <span class="comparison-label">総プレイ回数</span>
            <span class="comparison-value">{{ categoryData.played }}回</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 新しい実績 -->
    <div v-if="newAchievements && newAchievements.length > 0" class="achievements-section">
      <h3 class="section-title">🏆 新しい実績を獲得しました！</h3>
      <div class="achievements-list">
        <div 
          v-for="achievement in newAchievements" 
          :key="achievement.id"
          class="achievement-item"
        >
          <div class="achievement-icon">🎉</div>
          <div class="achievement-info">
            <div class="achievement-name">{{ achievement.name }}</div>
            <div class="achievement-description">{{ achievement.description }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 進捗とレベル -->
    <div class="progress-section">
      <h3 class="section-title">学習進捗</h3>
      
      <div class="level-info">
        <div class="current-level">
          <span class="level-badge" :class="levelClass">
            {{ getLevelName(gameStore.currentLevel) }}
          </span>
          <span class="level-description">
            総スコア: {{ gameStore.learningStats.totalScore }}
          </span>
        </div>
        
        <div v-if="nextMilestone" class="next-milestone">
          <div class="milestone-info">
            <span>次の目標まで</span>
            <span>{{ nextMilestone.target - nextMilestone.current }} 問</span>
          </div>
          <div class="milestone-progress">
            <div 
              class="milestone-fill"
              :style="{ width: nextMilestone.progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- アクションボタン -->
    <div class="action-buttons">
      <button 
        @click="$emit('playAgain')"
        class="btn btn-primary"
      >
        <span class="btn-icon">🔄</span>
        もう一度プレイ
      </button>
      
      <button 
        @click="$emit('selectCategory')"
        class="btn btn-secondary"
      >
        <span class="btn-icon">📚</span>
        他のカテゴリ
      </button>
      
      <button 
        @click="$emit('backToHome')"
        class="btn btn-outline"
      >
        <span class="btn-icon">🏠</span>
        ホームに戻る
      </button>
    </div>
    
    <!-- シェアボタン -->
    <div class="share-section">
      <button @click="shareResults" class="share-button">
        <span class="share-icon">📱</span>
        結果をシェア
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { useGameAudio } from '../composables/useGameAudio.js'

export default defineComponent({
  name: 'GameResults',
  emits: ['playAgain', 'selectCategory', 'backToHome'],
  props: {
    score: {
      type: Number,
      required: true
    },
    correct: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      default: null
    },
    playTime: {
      type: Number,
      default: 0
    },
    newAchievements: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const gameStore = useGameStore()
    const { playEffectSound } = useGameAudio()
    
    // 計算されたプロパティ
    const accuracy = computed(() => {
      return props.total > 0 ? Math.round((props.correct / props.total) * 100) : 0
    })
    
    const incorrect = computed(() => {
      return props.total - props.correct
    })
    
    const performanceLevel = computed(() => {
      if (accuracy.value >= 90) return 'excellent'
      if (accuracy.value >= 70) return 'good'
      if (accuracy.value >= 50) return 'fair'
      return 'needs-improvement'
    })
    
    const performanceMessage = computed(() => {
      switch (performanceLevel.value) {
        case 'excellent': return 'すばらしい！完璧です！'
        case 'good': return 'よくできました！'
        case 'fair': return 'いい調子です！'
        default: return 'もう少し練習しましょう！'
      }
    })
    
    const performanceIcon = computed(() => {
      switch (performanceLevel.value) {
        case 'excellent': return '🌟'
        case 'good': return '👏'
        case 'fair': return '👍'
        default: return '💪'
      }
    })
    
    const accuracyColor = computed(() => {
      if (accuracy.value >= 90) return '#10B981' // green-500
      if (accuracy.value >= 70) return '#3B82F6' // blue-500
      if (accuracy.value >= 50) return '#F59E0B' // amber-500
      return '#EF4444' // red-500
    })
    
    const levelClass = computed(() => {
      return `level-${gameStore.currentLevel}`
    })
    
    const formattedTime = computed(() => {
      const minutes = Math.floor(props.playTime / 60)
      const seconds = props.playTime % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })
    
    const categoryData = computed(() => {
      return props.category ? gameStore.categoryProgress[props.category] : null
    })
    
    const nextMilestone = computed(() => {
      return gameStore.nextAchievementProgress
    })
    
    // 円周の計算（SVG用）
    const circumference = computed(() => {
      return 2 * Math.PI * 50 // radius = 50
    })
    
    // メソッド
    const getCategoryDisplayName = (category) => {
      const names = {
        vowels: '母音',
        diphthongs: '重母音',
        consonants: '子音',
        digraphs: 'ダイグラフ'
      }
      return names[category] || category
    }
    
    const getLevelName = (level) => {
      const names = {
        beginner: '初心者',
        intermediate: '中級者',
        advanced: '上級者',
        expert: 'エキスパート'
      }
      return names[level] || level
    }
    
    const shareResults = async () => {
      const shareText = `MovWISEで${getCategoryDisplayName(props.category)}を学習しました！\n` +
                      `スコア: ${props.score}\n` +
                      `正解率: ${accuracy.value}%\n` +
                      `#MovWISE #英語学習`
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'MovWISE 学習結果',
            text: shareText,
            url: window.location.href
          })
        } catch (error) {
          console.log('シェアがキャンセルされました')
        }
      } else {
        // フォールバック: クリップボードにコピー
        try {
          await navigator.clipboard.writeText(shareText)
          alert('結果をクリップボードにコピーしました！')
          playEffectSound('button')
        } catch (error) {
          console.error('クリップボードへのコピーに失敗:', error)
        }
      }
    }
    
    // ライフサイクル
    onMounted(() => {
      // 結果に応じた効果音再生
      setTimeout(() => {
        if (performanceLevel.value === 'excellent') {
          playEffectSound('levelUp')
        } else if (performanceLevel.value === 'good') {
          playEffectSound('complete')
        } else {
          playEffectSound('correct')
        }
      }, 500)
      
      // 新しい実績の効果音
      if (props.newAchievements.length > 0) {
        setTimeout(() => {
          playEffectSound('newRecord')
        }, 1500)
      }
    })
    
    return {
      gameStore,
      accuracy,
      incorrect,
      performanceLevel,
      performanceMessage,
      performanceIcon,
      accuracyColor,
      levelClass,
      formattedTime,
      categoryData,
      nextMilestone,
      circumference,
      getCategoryDisplayName,
      getLevelName,
      shareResults
    }
  }
})
</script>

<style scoped>
.game-results {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  text-align: center;
  margin-bottom: 30px;
}

.performance-icon {
  font-size: 60px;
  margin-bottom: 10px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.results-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.results-subtitle {
  font-size: 16px;
  opacity: 0.8;
}

.results-main {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  backdrop-filter: blur(10px);
}

.score-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.main-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.accuracy-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  transform: rotate(-90deg);
}

.accuracy-circle {
  transition: stroke-dashoffset 1s ease-in-out;
}

.accuracy-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.accuracy-value {
  font-size: 20px;
  font-weight: bold;
}

.accuracy-label {
  font-size: 12px;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.category-results,
.achievements-section,
.progress-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.category-progress,
.category-comparison {
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comparison-item:last-child {
  border-bottom: none;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 215, 0, 0.2);
  border: 2px solid #FFD700;
  border-radius: 10px;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 5px #FFD700; }
  to { box-shadow: 0 0 20px #FFD700; }
}

.achievement-icon {
  font-size: 24px;
}

.achievement-name {
  font-weight: bold;
  margin-bottom: 2px;
}

.achievement-description {
  font-size: 12px;
  opacity: 0.9;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.current-level {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-badge {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.level-beginner { background: #10B981; }
.level-intermediate { background: #3B82F6; }
.level-advanced { background: #8B5CF6; }
.level-expert { background: #F59E0B; }

.milestone-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.milestone-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.milestone-fill {
  height: 100%;
  background: #10B981;
  border-radius: 3px;
  transition: width 1s ease-in-out;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 25px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(45deg, #10B981, #059669);
  color: white;
}

.btn-secondary {
  background: linear-gradient(45deg, #3B82F6, #2563EB);
  color: white;
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.share-section {
  text-align: center;
}

.share-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.share-icon {
  font-size: 16px;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .game-results {
    margin: 10px;
    padding: 15px;
  }
  
  .results-main {
    padding: 20px;
  }
  
  .score-section {
    flex-direction: column;
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .current-level {
    flex-direction: column;
    text-align: center;
    gap: 5px;
  }
  
  .performance-icon {
    font-size: 48px;
  }
  
  .results-title {
    font-size: 24px;
  }
  
  .score-value {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .accuracy-ring svg {
    width: 100px;
    height: 100px;
  }
  
  .accuracy-value {
    font-size: 16px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}