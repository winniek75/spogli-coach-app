<template>
  <div id="app">
    <RouterView />
    <AudioManager
      ref="globalAudioManager"
      :settings="audioSettings"
      @audio-ready="onAudioReady"
    />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AudioManager from '@/components/games/grammar-galaxy/shared/AudioManager.vue'
import { useAudioStore } from '@/stores/audioStore'
import { ref, computed } from 'vue'

const audioStore = useAudioStore()
const globalAudioManager = ref(null)
const audioSettings = computed(() => audioStore.settings)

const onAudioReady = () => {
  console.log('Global audio system ready')
  audioStore.setAudioManager(globalAudioManager.value)
}
</script>

<style>
#app {
  min-height: 100vh;
}

/* 全体的なスタイル調整 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* タッチデバイス最適化 */
@media (max-width: 768px) {
  .game-button {
    @apply text-base px-4 py-3;
  }
  
  .phonics-option {
    @apply text-xl h-16;
  }
  
  .score-display {
    @apply text-2xl px-4 py-2;
  }
}

/* アニメーション */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>