<template>
  <div 
    class="game-card"
    :class="[
      `difficulty-${game.difficulty}`,
      { 'locked': !game.available, 'new': game.isNew, 'completed': isCompleted }
    ]"
    @click="handlePlay"
    @mouseenter="handleHover"
    @mouseleave="handleLeave"
  >
    <!-- カード背景エフェクト -->
    <div class="card-background"></div>
    
    <!-- 新着バッジ -->
    <div v-if="game.isNew" class="new-badge">NEW!</div>
    
    <!-- 完了バッジ -->
    <div v-if="isCompleted" class="completed-badge">✓</div>
    
    <!-- ロックアイコン -->
    <div v-if="!game.available" class="lock-icon">🔒</div>
    
    <!-- ゲームアイコン -->
    <div class="game-icon" :class="{ 'animated': isHovered }">
      {{ game.icon }}
    </div>
    
    <!-- ゲーム情報 -->
    <div class="game-info">
      <h4 class="game-name">{{ game.name }}</h4>
      <p class="game-description">{{ game.description }}</p>
    </div>
    
    <!-- 統計情報 -->
    <div class="game-stats" v-if="game.available">
      <div class="stat-item">
        <span class="stat-label">ベスト</span>
        <span class="stat-value">{{ game.bestScore || 0 }}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">プレイ回数</span>
        <span class="stat-value">{{ game.playCount || 0 }}</span>
      </div>
    </div>
    
    <!-- 難易度バッジ -->
    <div class="difficulty-badge" :class="`badge-${game.difficulty}`">
      {{ getDifficultyText(game.difficulty) }}
    </div>
    
    <!-- 進捗バー -->
    <div class="progress-container" v-if="game.available">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${game.bestScore || 0}%` }"
          :class="`progress-${game.difficulty}`"
        ></div>
      </div>
      <span class="progress-text">{{ game.bestScore || 0 }}% クリア</span>
    </div>
    
    <!-- アクションボタン -->
    <div class="card-actions">
      <button 
        class="play-button"
        :class="{ 'disabled': !game.available }"
        @click.stop="handlePlay"
        :disabled="!game.available"
      >
        <span class="button-icon">{{ game.available ? '▶️' : '🔒' }}</span>
        <span class="button-text">{{ game.available ? 'プレイ' : 'ロック中' }}</span>
      </button>
      
      <button 
        class="stats-button"
        v-if="game.available && game.playCount > 0"
        @click.stop="$emit('show-stats', game)"
      >
        <span class="button-icon">📊</span>
      </button>
    </div>
    
    <!-- ホバーエフェクト -->
    <div class="hover-overlay" v-if="isHovered && game.available"></div>
    
    <!-- パーティクルエフェクト -->
    <div class="particles" v-if="showParticles">
      <div 
        v-for="i in 6" 
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'GameCard',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  emits: ['play', 'show-stats'],
  setup(props, { emit }) {
    const isHovered = ref(false)
    const showParticles = ref(false)
    
    // 計算されたプロパティ
    const isCompleted = computed(() => {
      return props.game.bestScore >= 90
    })
    
    // メソッド
    const handlePlay = () => {
      if (!props.game.available) {
        playLockedSound()
        showLockMessage()
        return
      }
      
      showParticles.value = true
      playClickSound()
      
      setTimeout(() => {
        showParticles.value = false
        emit('play', props.game)
      }, 300)
    }
    
    const handleHover = () => {
      if (props.game.available) {
        isHovered.value = true
        playHoverSound()
      }
    }
    
    const handleLeave = () => {
      isHovered.value = false
    }
    
    const getDifficultyText = (difficulty) => {
      const difficultyMap = {
        beginner: '初級',
        intermediate: '中級',
        advanced: '上級',
        expert: '超級'
      }
      return difficultyMap[difficulty] || '不明'
    }
    
    const getParticleStyle = (index) => {
      const angle = (360 / 6) * index
      const radius = 50
      const x = Math.cos(angle * Math.PI / 180) * radius
      const y = Math.sin(angle * Math.PI / 180) * radius
      
      return {
        transform: `translate(${x}px, ${y}px)`,
        animationDelay: `${index * 0.1}s`
      }
    }
    
    const playClickSound = () => {
      try {
        const audio = new Audio('/sounds/click-success.mp3')
        audio.volume = 0.4
        audio.play()
      } catch (error) {
        console.log('音声再生エラー:', error)
      }
    }
    
    const playHoverSound = () => {
      try {
        const audio = new Audio('/sounds/hover.mp3')
        audio.volume = 0.2
        audio.play()
      } catch (error) {
        console.log('音声再生エラー:', error)
      }
    }
    
    const playLockedSound = () => {
      try {
        const audio = new Audio('/sounds/locked.mp3')
        audio.volume = 0.3
        audio.play()
      } catch (error) {
        console.log('音声再生エラー:', error)
      }
    }
    
    const showLockMessage = () => {
      // 簡易的なトースト表示
      const toast = document.createElement('div')
      toast.className = 'lock-toast'
      toast.textContent = 'このゲームはまだ解放されていません！'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 2000)
    }
    
    return {
      isHovered,
      showParticles,
      isCompleted,
      handlePlay,
      handleHover,
      handleLeave,
      getDifficultyText,
      getParticleStyle
    }
  }
})
</script>

<style scoped>
.game-card {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 難易度別の背景色 */
.game-card.difficulty-beginner {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.game-card.difficulty-intermediate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-card.difficulty-advanced {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.game-card.difficulty-expert {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
}

/* ロック状態 */
.game-card.locked {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  cursor: not-allowed;
  opacity: 0.7;
}

/* 新着ゲーム */
.game-card.new::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #4ecdc4, #45b7d1);
  background-size: 400% 400%;
  border-radius: 22px;
  z-index: -1;
  animation: gradientShift 3s ease infinite;
}

/* 完了状態 */
.game-card.completed {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

/* カード背景エフェクト */
.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

/* バッジ */
.new-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  animation: pulse 2s infinite;
}

.completed-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
}

.lock-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.5rem;
  opacity: 0.7;
}

/* ゲームアイコン */
.game-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  text-align: center;
}

.game-icon.animated {
  animation: bounce 0.6s ease;
  transform: scale(1.1);
}

/* ゲーム情報 */
.game-info {
  flex: 1;
  margin-bottom: 20px;
}

.game-name {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.game-description {
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.4;
}

/* 統計情報 */
.game-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: bold;
}

/* 難易度バッジ */
.difficulty-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  backdrop-filter: blur(5px);
}

.badge-beginner {
  background: rgba(78, 205, 196, 0.8);
  color: white;
}

.badge-intermediate {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}

.badge-advanced {
  background: rgba(240, 147, 251, 0.8);
  color: white;
}

.badge-expert {
  background: rgba(255, 236, 210, 0.8);
  color: #333;
}

/* 進捗バー */
.progress-container {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  transition: width 0.8s ease;
}

.progress-beginner {
  background: linear-gradient(90deg, #4ecdc4, #44a08d);
}

.progress-intermediate {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.progress-advanced {
  background: linear-gradient(90deg, #f093fb, #f5576c);
}

.progress-text {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* アクションボタン */
.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.play-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 12px 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.play-button:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.play-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-button {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.button-icon {
  font-size: 1.1rem;
}

.button-text {
  font-size: 0.9rem;
}

/* ホバーエフェクト */
.game-card:hover:not(.locked) {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 1s ease-in-out;
  pointer-events: none;
}

/* パーティクルエフェクト */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: particleFloat 0.8s ease-out forwards;
}

/* アニメーション */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
  40%, 43% { transform: translate3d(0, -8px, 0); }
  70% { transform: translate3d(0, -4px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* レスポンシブ */
@media (max-width: 480px) {
  .game-card {
    padding: 20px;
    min-height: 250px;
  }
  
  .game-icon {
    font-size: 3rem;
  }
  
  .game-name {
    font-size: 1.2rem;
  }
  
  .game-description {
    font-size: 0.9rem;
  }
}
</style>

<style>
/* グローバルスタイル（トースト用） */
.lock-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  animation: toastSlide 2s ease;
}

@keyframes toastSlide {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  10%, 90% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}
</style>