<template>
  <div class="cosmic-status-container">
    <!-- メインステータス -->
    <div class="main-status">
      <div class="captain-info">
        <div class="captain-avatar cosmic-glow">{{ avatar }}</div>
        <div class="captain-details">
          <div class="captain-title">{{ title }}</div>
          <div class="captain-level">船長Lv.{{ status.captainLevel }}</div>
        </div>
      </div>
      
      <!-- エネルギーゲージ -->
      <div class="energy-gauge-container">
        <div class="gauge-label">
          <span class="cosmic-glow">⚡</span>
          宇宙エネルギー
        </div>
        <div class="energy-gauge">
          <div 
            class="energy-fill"
            :style="{ width: `${status.energyLevel}%` }"
          ></div>
        </div>
        <div class="energy-text">{{ status.cosmicEnergy.toLocaleString() }}</div>
      </div>
    </div>

    <!-- サブステータス -->
    <div class="sub-status">
      <div class="status-item">
        <div class="status-icon cosmic-glow">🌟</div>
        <div class="status-value">{{ status.exploredPlanets }}</div>
        <div class="status-label">探索済み惑星</div>
      </div>
      
      <div class="status-item">
        <div class="status-icon cosmic-glow">🚀</div>
        <div class="status-value">{{ status.navigationDays }}</div>
        <div class="status-label">航行日数</div>
      </div>
      
      <div class="status-item">
        <div class="status-icon cosmic-glow">💎</div>
        <div class="status-value">{{ soundGems.toLocaleString() }}</div>
        <div class="status-label">サウンドジェム</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
})

const gameStore = useGameStore()

const status = computed(() => gameStore.spaceshipStatus)
const avatar = computed(() => gameStore.playerData.avatar || '🦸‍♂️')
const title = computed(() => gameStore.playerData.title || 'スペース・レンジャー')
const soundGems = computed(() => gameStore.playerData.soundGems || 0)
</script>

<style scoped>
.cosmic-status-container {
  @apply bg-black/20 rounded-2xl p-6 backdrop-blur-md;
  border: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
}

.main-status {
  @apply flex items-center gap-6 mb-6;
}

.captain-info {
  @apply flex items-center gap-4;
}

.captain-avatar {
  @apply w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl;
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
}

.captain-details {
  @apply text-white;
}

.captain-title {
  @apply text-lg font-bold text-yellow-400;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
}

.captain-level {
  @apply text-sm text-blue-200;
}

.energy-gauge-container {
  @apply flex-1 ml-6;
}

.gauge-label {
  @apply flex items-center gap-2 text-sm text-white mb-2;
}

.energy-gauge {
  @apply w-full h-4 bg-gray-700 rounded-full overflow-hidden relative;
}

.energy-fill {
  @apply h-full rounded-full transition-all duration-500;
  background: linear-gradient(90deg, var(--cosmos-energy-green), var(--cosmos-star-gold));
  position: relative;
}

.energy-fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: energy-flow 2s ease-in-out infinite;
}

.energy-text {
  @apply text-right text-sm text-yellow-400 font-bold mt-1;
}

.sub-status {
  @apply grid grid-cols-3 gap-4;
}

.status-item {
  @apply text-center;
}

.status-icon {
  @apply text-2xl mb-2;
}

.status-value {
  @apply text-xl font-bold text-yellow-400 mb-1;
}

.status-label {
  @apply text-xs text-gray-300;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .main-status {
    @apply flex-col gap-4;
  }
  
  .energy-gauge-container {
    @apply ml-0 w-full;
  }
  
  .sub-status {
    @apply grid-cols-1 gap-2;
  }
  
  .captain-avatar {
    @apply w-12 h-12 text-xl;
  }
}

/* コンパクトモード */
.cosmic-status-container.compact {
  @apply p-4;
}

.cosmic-status-container.compact .main-status {
  @apply mb-4;
}

.cosmic-status-container.compact .captain-avatar {
  @apply w-12 h-12 text-xl;
}

.cosmic-status-container.compact .sub-status {
  @apply grid-cols-3 gap-2;
}

.cosmic-status-container.compact .status-icon {
  @apply text-lg mb-1;
}

.cosmic-status-container.compact .status-value {
  @apply text-lg;
}
</style>