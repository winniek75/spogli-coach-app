<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <!-- モーダルヘッダー -->
        <header class="modal-header">
          <div class="game-info">
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-details">
              <h2 class="game-name">{{ game.name }}</h2>
              <p class="game-description">{{ game.description }}</p>
            </div>
          </div>
          <button class="close-button" @click="$emit('close')">
            <span class="close-icon">✕</span>
          </button>
        </header>

        <!-- 統計データ -->
        <main class="modal-content">
          <!-- 概要統計 -->
          <section class="stats-overview">
            <div class="stat-card primary">
              <div class="stat-icon">🏆</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.bestScore || 0 }}%</div>
                <div class="stat-label">ベストスコア</div>
              </div>
            </div>
            
            <div class="stat-card secondary">
              <div class="stat-icon">🎮</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalPlays || 0 }}</div>
                <div class="stat-label">総プレイ回数</div>
              </div>
            </div>
            
            <div class="stat-card tertiary">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.averageScore || 0 }}%</div>
                <div class="stat-label">平均スコア</div>
              </div>
            </div>
            
            <div class="stat-card quaternary">
              <div class="stat-icon">⏱️</div>
              <div class="stat-info">
                <div class="stat-value">{{ formatTime(stats.totalTime) }}</div>
                <div class="stat-label">総プレイ時間</div>
              </div>
            </div>
          </section>

          <!-- 進捗チャート -->
          <section class="progress-section" v-if="stats.recentScores && stats.recentScores.length > 0">
            <h3 class="section-title">📊 最近の成績</h3>
            <div class="chart-container">
              <div class="score-chart">
                <div 
                  v-for="(score, index) in stats.recentScores" 
                  :key="index"
                  class="chart-bar"
                  :style="{ height: `${score}%` }"
                  :title="`${index + 1}回目: ${score}%`"
                >
                  <div class="bar-fill" :class="getScoreClass(score)"></div>
                  <div class="bar-label">{{ score }}%</div>
                </div>
              </div>
              <div class="chart-labels">
                <span v-for="(score, index) in stats.recentScores" :key="index" class="chart-label">
                  {{ index + 1 }}
                </span>
              </div>
            </div>
          </section>

          <!-- 実績・バッジ -->
          <section class="achievements-section">
            <h3 class="section-title">🏅 このゲームの実績</h3>
            <div class="achievements-grid">
              <div 
                v-for="achievement in gameAchievements" 
                :key="achievement.id"
                class="achievement-item"
                :class="{ 'earned': achievement.earned, 'locked': !achievement.earned }"
              >
                <div class="achievement-icon">{{ achievement.icon }}</div>
                <div class="achievement-info">
                  <div class="achievement-name">{{ achievement.name }}</div>
                  <div class="achievement-description">{{ achievement.description }}</div>
                  <div class="achievement-progress" v-if="!achievement.earned && achievement.progress">
                    {{ achievement.progress.current }} / {{ achievement.progress.target }}
                  </div>
                </div>
                <div class="achievement-status">
                  <span v-if="achievement.earned" class="status-earned">✓</span>
                  <span v-else class="status-locked">🔒</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 詳細統計 -->
          <section class="detailed-stats">
            <h3 class="section-title">📋 詳細統計</h3>
            <div class="stats-grid">
              <div class="detail-stat">
                <div class="detail-label">最高連続正解</div>
                <div class="detail-value">{{ stats.bestStreak || 0 }}回</div>
              </div>
              <div class="detail-stat">
                <div class="detail-label">正解率</div>
                <div class="detail-value">{{ stats.accuracy || 0 }}%</div>
              </div>
              <div class="detail-stat">
                <div class="detail-label">最短クリア時間</div>
                <div class="detail-value">{{ formatTime(stats.fastestTime) }}</div>
              </div>
              <div class="detail-stat">
                <div class="detail-label">最後にプレイ</div>
                <div class="detail-value">{{ formatLastPlayed(stats.lastPlayed) }}</div>
              </div>
              <div class="detail-stat">
                <div class="detail-label">獲得ジェム</div>
                <div class="detail-value">{{ stats.totalGems || 0 }}💎</div>
              </div>
              <div class="detail-stat">
                <div class="detail-label">レベルアップ</div>
                <div class="detail-value">{{ stats.levelUps || 0 }}回</div>
              </div>
            </div>
          </section>

          <!-- レコメンデーション -->
          <section class="recommendations" v-if="recommendations.length > 0">
            <h3 class="section-title">💡 おすすめ</h3>
            <div class="recommendation-list">
              <div 
                v-for="rec in recommendations" 
                :key="rec.id"
                class="recommendation-item"
              >
                <div class="rec-icon">{{ rec.icon }}</div>
                <div class="rec-text">{{ rec.message }}</div>
              </div>
            </div>
          </section>
        </main>

        <!-- モーダルフッター -->
        <footer class="modal-footer">
          <button class="action-button secondary" @click="$emit('close')">
            <span class="button-icon">📊</span>
            <span class="button-text">閉じる</span>
          </button>
          <button class="action-button primary" @click="handlePlayGame">
            <span class="button-icon">🎮</span>
            <span class="button-text">プレイする</span>
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'GameStatsModal',
  props: {
    game: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'play-game'],
  setup(props, { emit }) {
    // ゲーム固有の実績
    const gameAchievements = computed(() => {
      const baseAchievements = [
        {
          id: `${props.game.id}_first_play`,
          name: '初挑戦',
          description: 'このゲームを初めてプレイ',
          icon: '🎯',
          earned: (props.stats.totalPlays || 0) > 0
        },
        {
          id: `${props.game.id}_perfect_score`,
          name: 'パーフェクト',
          description: '100%スコア達成',
          icon: '💯',
          earned: (props.stats.bestScore || 0) >= 100
        },
        {
          id: `${props.game.id}_10_plays`,
          name: 'リピーター',
          description: '10回プレイ',
          icon: '🔄',
          earned: (props.stats.totalPlays || 0) >= 10,
          progress: {
            current: Math.min(props.stats.totalPlays || 0, 10),
            target: 10
          }
        },
        {
          id: `${props.game.id}_streak_master`,
          name: 'ストリークマスター',
          description: '10連続正解',
          icon: '🔥',
          earned: (props.stats.bestStreak || 0) >= 10,
          progress: {
            current: Math.min(props.stats.bestStreak || 0, 10),
            target: 10
          }
        }
      ]
      
      // ゲーム固有の追加実績
      if (props.game.id === 'rhyming') {
        baseAchievements.push({
          id: 'rhyme_master',
          name: 'ライムマスター',
          description: '韻の達人になる',
          icon: '🎵',
          earned: (props.stats.averageScore || 0) >= 85
        })
      } else if (props.game.id === 'rhythmTapper') {
        baseAchievements.push({
          id: 'rhythm_master',
          name: 'リズムマスター',
          description: 'リズムの達人',
          icon: '👏',
          earned: (props.stats.averageScore || 0) >= 85
        })
      }
      
      return baseAchievements
    })

    // レコメンデーション
    const recommendations = computed(() => {
      const recs = []
      
      if ((props.stats.totalPlays || 0) === 0) {
        recs.push({
          id: 'first_try',
          icon: '🚀',
          message: 'まずは一度プレイしてみましょう！'
        })
      } else if ((props.stats.averageScore || 0) < 50) {
        recs.push({
          id: 'practice_more',
          icon: '📚',
          message: '練習を重ねてスコアアップを目指しましょう！'
        })
      } else if ((props.stats.averageScore || 0) >= 90) {
        recs.push({
          id: 'try_harder',
          icon: '🌟',
          message: '素晴らしい！より難しいゲームに挑戦してみませんか？'
        })
      }
      
      if ((props.stats.totalPlays || 0) >= 5 && (props.stats.bestStreak || 0) < 5) {
        recs.push({
          id: 'focus_accuracy',
          icon: '🎯',
          message: '正確性を重視してプレイしてみましょう'
        })
      }
      
      return recs
    })

    // メソッド
    const formatTime = (seconds) => {
      if (!seconds) return '--'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}時間${minutes}分`
      } else if (minutes > 0) {
        return `${minutes}分${secs}秒`
      } else {
        return `${secs}秒`
      }
    }

    const formatLastPlayed = (timestamp) => {
      if (!timestamp) return '未プレイ'
      
      const now = new Date()
      const lastPlayed = new Date(timestamp)
      const diffMs = now - lastPlayed
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return '今日'
      } else if (diffDays === 1) {
        return '昨日'
      } else if (diffDays < 7) {
        return `${diffDays}日前`
      } else {
        return lastPlayed.toLocaleDateString('ja-JP')
      }
    }

    const getScoreClass = (score) => {
      if (score >= 90) return 'excellent'
      if (score >= 70) return 'good'
      if (score >= 50) return 'average'
      return 'poor'
    }

    const handleOverlayClick = () => {
      emit('close')
    }

    const handlePlayGame = () => {
      emit('play-game', props.game)
      emit('close')
    }

    return {
      gameAchievements,
      recommendations,
      formatTime,
      formatLastPlayed,
      getScoreClass,
      handleOverlayClick,
      handlePlayGame
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: white;
  border-radius: 25px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* ヘッダー */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px 25px 0 0;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.game-icon {
  font-size: 3rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.game-details {
  flex: 1;
}

.game-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.game-description {
  font-size: 1rem;
  opacity: 0.9;
}

.close-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

/* コンテンツ */
.modal-content {
  padding: 30px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 統計概要 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  transition: transform 0.3s ease;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.primary {
  border-left-color: #ff6b9d;
  background: linear-gradient(135deg, #ff6b9d 0%, #c471ed 100%);
  color: white;
}

.stat-card.secondary {
  border-left-color: #4ecdc4;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.stat-card.tertiary {
  border-left-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.quaternary {
  border-left-color: #ffd93d;
  background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
  color: white;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 進捗チャート */
.progress-section {
  margin-bottom: 40px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
}

.score-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
  margin-bottom: 15px;
}

.chart-bar {
  flex: 1;
  background: #e9ecef;
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  transform: scale(1.05);
}

.bar-fill {
  width: 100%;
  height: 100%;
  border-radius: 4px 4px 0 0;
  position: relative;
}

.bar-fill.excellent {
  background: linear-gradient(180deg, #4ecdc4 0%, #44a08d 100%);
}

.bar-fill.good {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.bar-fill.average {
  background: linear-gradient(180deg, #ffd93d 0%, #ff9a9e 100%);
}

.bar-fill.poor {
  background: linear-gradient(180deg, #ff6b6b 0%, #ffd93d 100%);
}

.bar-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chart-bar:hover .bar-label {
  opacity: 1;
}

.chart-labels {
  display: flex;
  gap: 8px;
}

.chart-label {
  flex: 1;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
}

/* 実績セクション */
.achievements-section {
  margin-bottom: 40px;
}

.achievements-grid {
  display: grid;
  gap: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
}

.achievement-item.earned {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.achievement-item.locked {
  opacity: 0.6;
}

.achievement-item:hover {
  transform: translateX(5px);
}

.achievement-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.achievement-description {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.achievement-progress {
  font-size: 0.8rem;
  font-weight: bold;
}

.achievement-status {
  font-size: 1.5rem;
}

.status-earned {
  color: #4ecdc4;
}

.status-locked {
  opacity: 0.5;
}

/* 詳細統計 */
.detailed-stats {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-stat {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

.detail-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

/* レコメンデーション */
.recommendations {
  margin-bottom: 20px;
}

.recommendation-list {
  display: grid;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  padding: 15px;
  border-left: 4px solid #f39c12;
}

.rec-icon {
  font-size: 1.5rem;
}

.rec-text {
  font-size: 0.95rem;
  color: #856404;
  font-weight: 500;
}

/* フッター */
.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: end;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 0 0 25px 25px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.secondary {
  background: #e9ecef;
  color: #666;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.button-icon {
  font-size: 1.1rem;
}

.button-text {
  font-size: 0.95rem;
}

/* アニメーション */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .game-info {
    gap: 15px;
  }
  
  .game-icon {
    font-size: 2.5rem;
  }
  
  .game-name {
    font-size: 1.5rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    padding: 20px;
    flex-direction: column;
  }
}
</style>