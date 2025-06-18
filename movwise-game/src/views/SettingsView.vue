<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- 背景パーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div v-for="particle in backgroundParticles" :key="particle.id" 
           class="particle absolute rounded-full bg-white opacity-20"
           :style="{
             left: particle.x + '%',
             top: particle.y + '%',
             width: particle.size + 'px',
             height: particle.size + 'px',
             animationDelay: particle.delay + 's',
             animationDuration: particle.duration + 's'
           }">
      </div>
    </div>
    <div class="relative z-10 container mx-auto px-4 py-8">
      <!-- ヘッダー -->
      <div class="text-center mb-8">
        <div class="mb-6">
          <div class="relative inline-block">
            <h1 class="text-5xl font-black bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight title-glow">
              設定
            </h1>
            <div class="absolute -top-2 -right-8 text-4xl floating-icon">⚙️</div>
          </div>
          <div class="text-center">
            <span class="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-widest">
              SYSTEM SETTINGS
            </span>
            <div class="flex justify-center items-center gap-2 mt-2">
              <div class="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
              <span class="text-lg text-white/80 font-semibold tracking-[0.2em] uppercase">Configuration</span>
              <div class="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 設定セクション -->
      <div class="space-y-6">
        <!-- 音声設定 -->
        <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <i class="fas fa-volume-up text-green-400"></i>
            音声設定
          </h2>
          
          <div class="space-y-4">
            <!-- 音量設定 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                音量: {{ volume }}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                v-model="volume"
                @input="updateVolume"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <!-- 音声速度設定 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                音声速度: {{ speechRate }}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                v-model="speechRate"
                @input="updateSpeechRate"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <!-- 音声言語設定 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                音声言語
              </label>
              <select
                v-model="selectedVoice"
                @change="updateVoice"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">デフォルト</option>
                <option v-for="voice in availableVoices" :key="voice.name" :value="voice.name">
                  {{ voice.name }} ({{ voice.lang }})
                </option>
              </select>
            </div>

            <!-- 音声テスト -->
            <div>
              <button
                @click="testVoice"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                音声テスト
              </button>
            </div>
          </div>
        </div>

        <!-- ゲーム設定 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            ゲーム設定
          </h2>
          
          <div class="space-y-4">
            <!-- 難易度設定 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                難易度
              </label>
              <select
                v-model="difficulty"
                @change="updateDifficulty"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easy">簡単</option>
                <option value="normal">普通</option>
                <option value="hard">難しい</option>
              </select>
            </div>

            <!-- タイマー設定 -->
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="timerEnabled"
                  @change="updateTimerEnabled"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">タイマーを有効にする</span>
              </label>
            </div>

            <!-- 自動進行設定 -->
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="autoProgress"
                  @change="updateAutoProgress"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">自動で次の問題に進む</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 表示設定 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            表示設定
          </h2>
          
          <div class="space-y-4">
            <!-- テーマ設定 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                テーマ
              </label>
              <select
                v-model="theme"
                @change="updateTheme"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="auto">自動</option>
              </select>
            </div>

            <!-- アニメーション設定 -->
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="animationsEnabled"
                  @change="updateAnimationsEnabled"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">アニメーションを有効にする</span>
              </label>
            </div>

            <!-- 振動設定 -->
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="vibrationEnabled"
                  @change="updateVibrationEnabled"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">振動フィードバックを有効にする</span>
              </label>
            </div>
          </div>
        </div>

        <!-- データ管理 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            データ管理
          </h2>
          
          <div class="space-y-4">
            <!-- データリセット -->
            <div>
              <p class="text-sm text-gray-600 mb-2">
                学習データをリセットすると、すべての進捗とスコアが削除されます。
              </p>
              <button
                @click="showResetConfirm = true"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                学習データをリセット
              </button>
            </div>

            <!-- データエクスポート -->
            <div>
              <p class="text-sm text-gray-600 mb-2">
                学習データをJSONファイルとしてエクスポートできます。
              </p>
              <button
                @click="exportData"
                class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                データをエクスポート
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 戻るボタン -->
      <div class="mt-8">
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ホームに戻る
        </router-link>
      </div>
    </div>

    <!-- リセット確認ダイアログ -->
    <div
      v-if="showResetConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showResetConfirm = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">データリセットの確認</h3>
        <p class="text-gray-600 mb-6">
          本当にすべての学習データをリセットしますか？この操作は取り消せません。
        </p>
        <div class="flex space-x-4">
          <button
            @click="resetData"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            リセット
          </button>
          <button
            @click="showResetConfirm = false"
            class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 背景パーティクル
const backgroundParticles = ref([])

// 音声設定
const volume = ref(50)
const speechRate = ref(1.0)
const selectedVoice = ref('')
const availableVoices = ref([])

// ゲーム設定
const difficulty = ref('normal')
const timerEnabled = ref(true)
const autoProgress = ref(false)

// 表示設定
const theme = ref('light')
const animationsEnabled = ref(true)
const vibrationEnabled = ref(true)

// UI状態
const showResetConfirm = ref(false)

// 背景パーティクルの初期化
const initBackgroundParticles = () => {
  backgroundParticles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 2,
    size: 2 + Math.random() * 3
  }))
}

// 音声関連の初期化
onMounted(() => {
  initBackgroundParticles()
  loadSettings()
  loadAvailableVoices()
})

// 設定の読み込み
const loadSettings = () => {
  const settings = JSON.parse(localStorage.getItem('movwise-settings') || '{}')
  
  volume.value = settings.volume || 50
  speechRate.value = settings.speechRate || 1.0
  selectedVoice.value = settings.selectedVoice || ''
  difficulty.value = settings.difficulty || 'normal'
  timerEnabled.value = settings.timerEnabled !== false
  autoProgress.value = settings.autoProgress || false
  theme.value = settings.theme || 'light'
  animationsEnabled.value = settings.animationsEnabled !== false
  vibrationEnabled.value = settings.vibrationEnabled !== false
}

// 利用可能な音声の読み込み
const loadAvailableVoices = () => {
  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices()
    availableVoices.value = voices.filter(voice => 
      voice.lang.startsWith('en') || voice.lang.startsWith('ja')
    )
    
    // 音声リストが空の場合は、少し待ってから再試行
    if (voices.length === 0) {
      setTimeout(loadAvailableVoices, 100)
    }
  }
}

// 設定の保存
const saveSettings = () => {
  const settings = {
    volume: volume.value,
    speechRate: speechRate.value,
    selectedVoice: selectedVoice.value,
    difficulty: difficulty.value,
    timerEnabled: timerEnabled.value,
    autoProgress: autoProgress.value,
    theme: theme.value,
    animationsEnabled: animationsEnabled.value,
    vibrationEnabled: vibrationEnabled.value
  }
  
  localStorage.setItem('movwise-settings', JSON.stringify(settings))
}

// 音量更新
const updateVolume = () => {
  saveSettings()
}

// 音声速度更新
const updateSpeechRate = () => {
  saveSettings()
}

// 音声更新
const updateVoice = () => {
  saveSettings()
}

// 音声テスト
const testVoice = () => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('Hello! This is a voice test.')
    utterance.volume = volume.value / 100
    utterance.rate = speechRate.value
    
    if (selectedVoice.value) {
      const voice = availableVoices.value.find(v => v.name === selectedVoice.value)
      if (voice) {
        utterance.voice = voice
      }
    }
    
    speechSynthesis.speak(utterance)
  }
}

// 難易度更新
const updateDifficulty = () => {
  gameStore.setDifficulty(difficulty.value)
  saveSettings()
}

// タイマー設定更新
const updateTimerEnabled = () => {
  saveSettings()
}

// 自動進行設定更新
const updateAutoProgress = () => {
  saveSettings()
}

// テーマ更新
const updateTheme = () => {
  saveSettings()
  // テーマの適用ロジックをここに追加
}

// アニメーション設定更新
const updateAnimationsEnabled = () => {
  saveSettings()
}

// 振動設定更新
const updateVibrationEnabled = () => {
  saveSettings()
}

// データリセット
const resetData = () => {
  gameStore.resetAllData()
  localStorage.removeItem('movwise-settings')
  localStorage.removeItem('movwise-progress')
  localStorage.removeItem('movwise-scores')
  
  showResetConfirm.value = false
  
  // 設定を初期値に戻す
  loadSettings()
  
  alert('すべてのデータがリセットされました。')
}

// データエクスポート
const exportData = () => {
  const data = {
    settings: JSON.parse(localStorage.getItem('movwise-settings') || '{}'),
    progress: JSON.parse(localStorage.getItem('movwise-progress') || '{}'),
    scores: JSON.parse(localStorage.getItem('movwise-scores') || '{}'),
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `movwise-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

.particle {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
    opacity: 0.6; 
  }
  25% { 
    transform: translateY(-15px) rotate(90deg); 
    opacity: 0.8; 
  }
  50% { 
    transform: translateY(-25px) rotate(180deg); 
    opacity: 1; 
  }
  75% { 
    transform: translateY(-15px) rotate(270deg); 
    opacity: 0.8; 
  }
}

.title-glow {
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }
  to {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  }
}

.floating-icon {
  animation: floatingIcon 2s ease-in-out infinite;
}

@keyframes floatingIcon {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
}
</style>