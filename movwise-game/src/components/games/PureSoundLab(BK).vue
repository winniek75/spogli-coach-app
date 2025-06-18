<template>
  <div class="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 relative overflow-hidden">
    <!-- 背景パーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute bg-white rounded-full opacity-20 animate-pulse"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`
        }"
      />
    </div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="handleBack"
            class="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            戻る
          </button>
          <div class="text-center">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              🔬 ピュア・サウンド・ラボ
            </h1>
            <p class="text-gray-600 text-lg">
              ステージ {{ currentStage }}: {{ PHONEME_STAGES[currentStage].emoji }} {{ PHONEME_STAGES[currentStage].name }}
            </p>
          </div>
          <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </div>
        <!-- 進捗バー -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>ステージ進捗</span>
            <span>{{ progress.correct }}/{{ progress.total }} 問正解</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full h-2 transition-all duration-500"
              :style="{ width: `${Math.min(masteryRate, 100)}%` }"
            />
          </div>
          <button 
            v-if="canAdvanceStage"
            @click="advanceStage"
            class="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            🎉 次のステージへ進む！
          </button>
        </div>
      </div>
      <!-- メインゲーム画面 -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mt-6">
        <!-- ゲーム開始画面 -->
        <div v-if="gameState === 'ready'" class="flex flex-col items-center justify-center py-12">
          <div class="lab-equipment mb-4">
            <div class="beaker scale-75 md:scale-90 flex items-center justify-center relative">
              <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-100 via-purple-100 to-pink-100 border-4 border-cyan-300 shadow-xl flex items-end justify-center relative overflow-hidden">
                <!-- 液体部分 -->
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-16 md:w-32 md:h-20 bg-gradient-to-t from-cyan-300 via-cyan-200 to-white opacity-90 rounded-b-full z-10" style="filter: blur(1px);"></div>
                <!-- 泡 -->
                <div 
                  v-for="i in 5" 
                  :key="i"
                  class="bubble"
                  :style="{
                    left: `${30 + i * 8}%`,
                    bottom: '60%',
                    background: `linear-gradient(135deg, #a5f3fc 60%, #f0abfc 100%)`,
                    animationDelay: `${i * 0.18}s`
                  }"
                />
              </div>
            </div>
          </div>
          <p class="text-gray-700 mb-8 max-w-lg mx-auto text-lg md:text-xl leading-relaxed text-center font-medium">
            44音素の純粋な音を聞いて、正しい音素記号を選択してください。<br>
            文字に頼らず、音だけで判断することが重要です。
          </p>
          <button 
            @click="startGame"
            class="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-bold text-xl mt-2 shadow-lg transform hover:scale-105"
          >
            🚀 実験開始
          </button>
        </div>

        <!-- ゲームプレイ画面 -->
        <div v-else-if="(gameState === 'playing' || gameState === 'feedback') && currentPhoneme" class="text-center">
          <!-- 音声再生エリア -->
          <div class="mb-8">
            <div 
              @click="playSound(currentPhoneme)"
              class="mx-auto mb-6 flex items-center justify-center w-20 h-20 md:w-16 md:h-16 rounded-full bg-white border-4 border-purple-300 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl"
            >
              <svg v-if="isPlaying" class="w-10 h-10 text-purple-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <svg v-else class="w-10 h-10 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">音を聞いて、正しい音素を選択してください</h3>
            <div class="flex items-center justify-center gap-4 text-lg">
              <span class="text-gray-600">再生回数: {{ playCount }}/3</span>
              <button 
                v-if="playCount < 3"
                @click="playSound(currentPhoneme)"
                class="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200" 
              >
                🔄 もう一度
              </button>
            </div>
          </div>

          <!-- 選択肢 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              v-for="(choice, index) in choices"
              :key="index"
              @click="handleAnswer(choice)"
              :disabled="gameState === 'feedback'"
              :class="[
                'phoneme-button',
                gameState === 'feedback' 
                  ? choice.symbol === currentPhoneme.symbol
                    ? 'feedback-correct bg-gradient-to-br from-secondary to-primary text-white'
                    : 'feedback-incorrect bg-gray-50 text-gray-500'
                  : '',
                gameState === 'feedback' && 'cursor-not-allowed'
              ]"
            >
              <div class="text-4xl font-bold mb-3">{{ choice.symbol }}</div>
              <div class="text-lg text-gray-600">({{ choice.word }})</div>
            </button>
          </div>

          <!-- フィードバック -->
          <transition name="fade">
            <div v-if="gameState === 'feedback'" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div :class="[
                'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center',
                feedback.includes('正解')
                  ? 'bg-green-500 text-white animate-bounce'
                  : 'bg-red-500 text-white animate-shake'
              ]">
                <div class="mb-2">{{ feedback.includes('正解') ? '🎉 正解！' : '😢 不正解...' }}</div>
                <div class="text-lg font-normal mt-2">{{ feedback }}</div>
              </div>
            </div>
          </transition>
        </div>

        <!-- ゲーム終了画面 -->
        <div v-else-if="gameState === 'complete'" class="text-center py-12">
          <div class="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg class="w-16 h-16 text-white fill-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">実験終了</h2>
          <div class="bg-surface rounded-2xl p-6 mb-8 border-2 border-beaker">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-3xl font-bold text-primary">{{ score }}</div>
                <div class="text-gray-600">スコア</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-secondary">{{ masteryRate.toFixed(1) }}%</div>
                <div class="text-gray-600">正解率</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-accent">{{ masteredPhonemes.size }}</div>
                <div class="text-gray-600">習得音素</div>
              </div>
            </div>
          </div>
          <div class="space-x-4">
            <button 
              @click="resetGame"
              class="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-bold text-lg transform hover:scale-105"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              もう一度挑戦
            </button>
          </div>
        </div>
      </div>

      <!-- 習得済み音素 -->
      <div v-if="masteredPhonemes.size > 0" class="bg-surface rounded-3xl p-6 mt-6 shadow-2xl">
        <h3 class="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4 flex items-center gap-2">
          🏆 習得済み音素
        </h3>
        <div class="flex flex-wrap gap-3">
          <span 
            v-for="phoneme in Array.from(masteredPhonemes)" 
            :key="phoneme" 
            class="px-4 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-2xl text-lg font-bold shadow-lg"
          >
            {{ phoneme }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// 型定義
type GameState = 'ready' | 'playing' | 'feedback' | 'complete'
type Phoneme = {
  symbol: string
  word: string
  audioUrl: string
}

type Stage = {
  name: string
  emoji: string
  phonemes: Phoneme[]
}

// ステージ定義
const PHONEME_STAGES: Record<number, Stage> = {
  1: {
    name: "短母音",
    emoji: "🔬",
    phonemes: [
      { symbol: "/æ/", word: "cat", audioUrl: "/sounds/a.m4a" },
      { symbol: "/ɪ/", word: "sit", audioUrl: "/sounds/i.m4a" },
      { symbol: "/ʌ/", word: "cup", audioUrl: "/sounds/:ʌ:.m4a" },
      { symbol: "/ɛ/", word: "bed", audioUrl: "/sounds/e.m4a" },
      { symbol: "/ɑ/", word: "hot", audioUrl: "/sounds/:ɑ:.m4a" }
    ]
  },
  2: {
    name: "長母音",
    emoji: "⚗️",
    phonemes: [
      { symbol: "/eɪ/", word: "make", audioUrl: "/sounds/eɪ.mp3" },
      { symbol: "/aɪ/", word: "time", audioUrl: "/sounds/ai.m4a" },
      { symbol: "/ɔɪ/", word: "boy", audioUrl: "/sounds/oi.m4a" },
      { symbol: "/aʊ/", word: "house", audioUrl: "/sounds/ou.m4a" },
      { symbol: "/oʊ/", word: "go", audioUrl: "/sounds/oa.m4a" }
    ]
  },
  3: {
    name: "基本子音",
    emoji: "🧪",
    phonemes: [
      { symbol: "/p/", word: "pen", audioUrl: "/sounds/p.m4a" },
      { symbol: "/b/", word: "bag", audioUrl: "/sounds/b" },
      { symbol: "/t/", word: "top", audioUrl: "/sounds/t.m4a" },
      { symbol: "/d/", word: "dog", audioUrl: "/sounds/d.m4a" },
      { symbol: "/k/", word: "cat", audioUrl: "/sounds/k.m4a" },
      { symbol: "/g/", word: "go", audioUrl: "/sounds/ɡ.m4a" }
    ]
  }
}

// 状態管理
const router = useRouter()
const gameState = ref<GameState>('ready')
const currentStage = ref(1)
const score = ref(0)
const soundGems = ref(0)
const lives = ref(3)
const playCount = ref(0)
const currentPhoneme = ref<Phoneme | null>(null)
const choices = ref<Phoneme[]>([])
const feedback = ref('')
const masteredPhonemes = ref(new Set<string>())

// 音声再生
const isPlaying = ref(false)
const audioContext = ref<AudioContext | null>(null)

const playSound = async (phoneme: Phoneme) => {
  try {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }

    const response = await fetch(phoneme.audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer)
    
    const source = audioContext.value.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.value.destination)
    
    isPlaying.value = true
    source.start(0)
    
    source.onended = () => {
      isPlaying.value = false
    }
    
    playCount.value++
  } catch (error) {
    console.error('音声再生エラー:', error)
    feedback.value = '音声の再生に失敗しました。もう一度お試しください。'
  }
}

// ゲーム制御
const startGame = () => {
  gameState.value = 'playing'
  loadNextQuestion()
}

const handleAnswer = (choice: Phoneme) => {
  if (gameState.value !== 'playing') return
  
  gameState.value = 'feedback'
  if (choice.symbol === currentPhoneme.value?.symbol) {
    score.value += 100
    soundGems.value += 10
    feedback.value = '正解です！素晴らしい！'
    masteredPhonemes.value.add(choice.symbol)
  } else {
    lives.value--
    feedback.value = `不正解です。正解は ${currentPhoneme.value?.symbol} でした。`
  }
  
  setTimeout(() => {
    if (lives.value <= 0) {
      gameState.value = 'complete'
    } else {
      loadNextQuestion()
    }
  }, 2000)
}

const loadNextQuestion = () => {
  const stagePhonemes = PHONEME_STAGES[currentStage.value].phonemes
  const correctPhoneme = stagePhonemes[Math.floor(Math.random() * stagePhonemes.length)]
  
  // 選択肢を生成（正解 + 2つの類似音素）
  const otherPhonemes = stagePhonemes.filter(p => p.symbol !== correctPhoneme.symbol)
  const wrongChoices = otherPhonemes
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  
  const allChoices = [correctPhoneme, ...wrongChoices]
    .sort(() => Math.random() - 0.5)
  
  currentPhoneme.value = correctPhoneme
  choices.value = allChoices
  gameState.value = 'playing'
  playCount.value = 0
  feedback.value = ''
}

const resetGame = () => {
  gameState.value = 'ready'
  score.value = 0
  soundGems.value = 0
  lives.value = 3
  masteredPhonemes.value.clear()
}

const handleBack = () => {
  router.back()
}

// 計算プロパティ
const masteryRate = computed(() => {
  return (masteredPhonemes.value.size / 44) * 100
})

const progress = computed(() => ({
  correct: masteredPhonemes.value.size,
  total: 44
}))

const canAdvanceStage = computed(() => {
  return masteryRate.value >= 80
})

const advanceStage = () => {
  if (currentStage.value < 3) {
    currentStage.value++
    resetGame()
  }
}
</script>

<style scoped>
:root {
  --primary: #3B82F6;
  --secondary: #10B981;
  --accent: #8B5CF6;
  --background: #F3F4F6;
  --surface: #FFFFFF;
  --beaker: #E5E7EB;
}

.pure-sound-lab {
  background: var(--background);
  min-height: 100vh;
}

.particle {
  position: absolute;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0.1;
  animation: float 8s infinite ease-in-out;
}

.header-container {
  background: var(--surface);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.progress-bar {
  width: 100%;
  height: 0.75rem;
  background: var(--beaker);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--secondary), var(--primary));
  border-radius: 9999px;
  transition: width 0.3s ease-in-out;
}

.lab-equipment {
  position: relative;
  width: 12rem;
  height: 12rem;
  margin: 0 auto;
}

.beaker {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: visible;
}

.bubble {
  position: absolute;
  bottom: 0;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  animation: bubble 2s infinite ease-in-out;
  opacity: 0.7;
  z-index: 20;
}

.play-button {
  width: 10rem;
  height: 10rem;
  background: linear-gradient(to bottom right, var(--primary), var(--accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.play-button:hover {
  transform: scale(1.1);
  box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08);
}

.phoneme-button {
  padding: 2rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  border: 3px solid var(--beaker);
  background: var(--surface);
  cursor: pointer;
}

.phoneme-button:hover:not(:disabled) {
  transform: scale(1.05);
  border-color: var(--primary);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.feedback-correct {
  animation: correct 0.5s ease-in-out;
}

.feedback-incorrect {
  animation: incorrect 0.5s ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes bubble {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-50px) scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100px) scale(0.8);
    opacity: 0;
  }
}

@keyframes correct {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes incorrect {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-10px); }
  80% { transform: translateX(10px); }
}

.animate-shake {
  animation: shake 0.5s;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>