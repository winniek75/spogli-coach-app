<template>
  <div 
    class="planet-card"
    :class="{ 
      'unlocked': isUnlocked,
      'locked': !isUnlocked,
      'completed': isCompleted 
    }"
    @click="handleClick"
  >
    <div class="planet-surface">
      <div class="planet-icon">{{ planetInfo.icon }}</div>
      <div v-if="!isUnlocked" class="lock-overlay">🔒</div>
    </div>
    
    <div class="planet-info">
      <h3 class="planet-name">{{ planetInfo.name }}</h3>
      <p class="planet-description">{{ planetInfo.description }}</p>
      
      <div class="planet-progress">
        <div class="progress-stars">
          <span 
            v-for="i in planetInfo.maxStars" 
            :key="i"
            class="star"
            :class="{ 'filled': i <= planetInfo.stars }"
          >
            ⭐
          </span>
        </div>
        <div class="progress-text">
          {{ planetInfo.gamesCompleted }}/{{ planetInfo.totalGames }} ゲーム完了
        </div>
      </div>
      
      <div v-if="isUnlocked" class="available-games">
        <div class="games-list">
          <button
            v-for="game in planetInfo.games"
            :key="game.id"
            @click.stop="startGame(game.id)"
            class="game-button"
            :class="{ 'locked': !game.unlocked }"
            :disabled="!game.unlocked"
          >
            <span class="game-icon">{{ game.icon }}</span>
            <span class="game-name">{{ game.name }}</span>
            <div class="game-stars">
              <span 
                v-for="i in game.maxStars" 
                :key="i"
                class="mini-star"
                :class="{ 'filled': i <= game.stars }"
              >
                ⭐
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  planetId: {
    type: String,
    required: true
  },
  planetInfo: {
    type: Object,
    required: true
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['select-planet', 'start-game'])

const isCompleted = computed(() => {
  return props.planetInfo.gamesCompleted === props.planetInfo.totalGames
})

const handleClick = () => {
  if (props.isUnlocked) {
    emit('select-planet', props.planetId)
  }
}

const startGame = (gameId) => {
  if (props.isUnlocked) {
    emit('start-game', props.planetId, gameId)
  }
}
</script>

<style scoped>
.planet-card {
  @apply relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%);
  border: 2px solid rgba(99, 102, 241, 0.4);
  min-height: 300px;
  backdrop-filter: blur(15px);
}

.planet-card.locked {
  @apply opacity-40 cursor-not-allowed;
  filter: grayscale(0.8);
}

.planet-card.unlocked:hover {
  @apply scale-105;
  box-shadow: 0 20px 40px rgba(99,102,241,0.3);
}

.planet-card.completed {
  background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%);
  border: 2px solid rgba(34,197,94,0.5);
}

.planet-surface {
  @apply relative text-center mb-4;
}

.planet-icon {
  @apply text-6xl mb-2 inline-block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.lock-overlay {
  @apply absolute inset-0 flex items-center justify-center text-4xl;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
}

.planet-info {
  @apply text-center;
}

.planet-name {
  @apply text-xl font-bold mb-2;
  color: #FBBF24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.planet-description {
  @apply text-sm mb-4 leading-relaxed;
  color: #F3F4F6;
}

.planet-progress {
  @apply mb-4;
}

.progress-stars {
  @apply flex justify-center gap-1 mb-2;
}

.star {
  @apply text-sm;
  opacity: 0.3;
  color: #FBBF24;
}

.star.filled {
  @apply opacity-100;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.8));
}

.progress-text {
  @apply text-xs;
  color: #9CA3AF;
}

.available-games {
  @apply mt-4;
}

.games-list {
  @apply space-y-2;
}

.game-button {
  @apply w-full p-3 rounded-lg text-left transition-all;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #F3F4F6;
  backdrop-filter: blur(10px);
}

.game-button:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-1px);
}

.game-button.locked {
  @apply opacity-50 cursor-not-allowed;
  filter: grayscale(0.8);
}

.game-button:disabled {
  @apply cursor-not-allowed;
}

.game-icon {
  @apply mr-2;
}

.game-name {
  @apply font-medium;
  color: #F3F4F6;
}

.game-stars {
  @apply flex gap-1 mt-1;
}

.mini-star {
  @apply text-xs;
  opacity: 0.3;
  color: #FBBF24;
}

.mini-star.filled {
  @apply opacity-100;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.6));
}
</style>