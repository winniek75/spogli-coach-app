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
            <ArrowLeft class="w-5 h-5" />
            Back
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              🔬 Pure Sound Lab
            </h1>
            <div class="stage-indicator">
              Stage {{ currentStage }}: {{ currentStageInfo.name }}
            </div>
          </div>

          <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200">
            <Settings class="w-5 h-5" />
          </button>
        </div>

        <!-- 進捗バー -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Mastered Phonemes</span>
            <span>{{ masteredPhonemes.size }}/5 sounds</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full h-3 transition-all duration-500"
              :style="{ width: `${masteryRate}%` }"
            />
          </div>
          
          <!-- 段階アップボタン -->
          <button 
            v-if="canAdvanceStage"
            @click="advanceStage"
            class="mt-3 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 animate-pulse"
          >
            🎉 Advance to {{ LEARNING_STAGES[currentStage + 1].name }}!
          </button>
        </div>

        <!-- ステータス -->
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ score }}</div>
            <div class="text-gray-600 text-sm">Score</div>
          </div>
          <div class="text-center">
            <div class="flex justify-center gap-1">
              <Heart 
                v-for="i in 3" 
                :key="i"
                :class="[
                  'w-6 h-6',
                  i <= lives ? 'text-red-500 fill-current' : 'text-gray-300'
                ]"
              />
            </div>
            <div class="text-gray-600 text-sm">Lives</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ masteredPhonemes.size }}</div>
            <div class="text-gray-600 text-sm">Mastered</div>
          </div>
        </div>
      </div>

      <!-- フィードバック -->
      <Transition name="feedback">
        <div 
          v-if="gameState === 'feedback'" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            :class="[
              'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center',
              feedbackType === 'correct' ? 'bg-green-500 text-white animate-correct' : 'bg-red-500 text-white animate-shake'
            ]"
          >
            <div class="mb-2">
              {{ feedbackType === 'correct' ? '🎉 Correct!' : '😢 Incorrect...' }}
            </div>
            <div class="text-lg font-normal mt-2">{{ feedback }}</div>
          </div>
        </div>
      </Transition>

      <!-- メインゲーム画面 -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <!-- イントロ画面 -->
        <div v-if="showIntro" class="text-center py-12">
          <div class="mb-8">
            <div class="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-float">
              <span class="text-6xl">🔬</span>
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Progressive Learning System</h2>
            <div class="max-w-2xl mx-auto space-y-4">
              <div class="bg-blue-50 p-4 rounded-2xl border-l-4 border-blue-400">
                <div class="flex items-center gap-3 mb-2">
                  <Camera class="w-6 h-6 text-blue-600" />
                  <span class="font-bold text-blue-700">Stage 1: Picture Learning</span>
                </div>
                <p class="text-blue-600">Start with visual association using real photos!</p>
              </div>
              
              <div class="bg-green-50 p-4 rounded-2xl border-l-4 border-green-400">
                <div class="flex items-center gap-3 mb-2">
                  <Book class="w-6 h-6 text-green-600" />
                  <span class="font-bold text-green-700">Stage 2: Word Learning</span>
                </div>
                <p class="text-green-600">Connect English words with their sounds!</p>
              </div>
              
              <div class="bg-purple-50 p-4 rounded-2xl border-l-4 border-purple-400">
                <div class="flex items-center gap-3 mb-2">
                  <GraduationCap class="w-6 h-6 text-purple-600" />
                  <span class="font-bold text-purple-700">Stage 3: Symbol Learning</span>
                </div>
                <p class="text-purple-600">Master phonetic symbols like a pro!</p>
              </div>
            </div>
          </div>
          
          <button 
            @click="startGame"
            class="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-bold text-xl shadow-lg transform hover:scale-105"
          >
            🚀 Start Learning
          </button>
        </div>

        <!-- ゲームプレイ画面 -->
        <div v-else-if="gameState === 'playing' && currentPhoneme" class="text-center">
          <!-- 音声再生エリア -->
          <div class="mb-8">
            <div 
              @click="speakPhoneme(currentPhoneme)"
              :class="[
                'mx-auto mb-6 flex items-center justify-center w-24 h-24 rounded-full text-white shadow-2xl cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-3xl bg-gradient-to-br from-blue-400 to-purple-500',
                isPlaying ? 'animate-pulse' : ''
              ]"
            >
              <Volume2 v-if="isPlaying" class="w-10 h-10 animate-pulse" />
              <Play v-else class="w-10 h-10" />
            </div>
            
            <h3 class="text-2xl font-bold text-gray-800 mb-3">
              Listen to the sound and choose the correct answer
            </h3>
            
            <div class="flex items-center justify-center gap-4 text-lg">
              <span class="text-gray-600">Plays: {{ playCount }}/3</span>
              <button 
                v-if="playCount < 3"
                @click="speakPhoneme(currentPhoneme)"
                class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                <RotateCcw class="w-4 h-4 inline mr-1" />
                Play Again
              </button>
            </div>
          </div>

          <!-- 選択肢 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              v-for="(choice, index) in choices"
              :key="index"
              @click="handleAnswer(choice)"
              :class="[
                'choice-button p-6 rounded-2xl border-4 border-gray-200 bg-white cursor-pointer transition-all duration-300',
                gameState === 'feedback' && choice === currentPhoneme ? 'correct' : '',
                gameState === 'feedback' && choice !== currentPhoneme ? '' : ''
              ]"
            >
              <!-- 画像表示 -->
              <div v-if="currentStage === 1" class="image-container mb-4">
                <img 
                  :src="PHONEME_DATA[choice].imageUrl" 
                  :alt="PHONEME_DATA[choice].word"
                  class="w-full h-40 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
              
              <!-- テキスト表示 -->
              <div class="text-center">
                <div v-if="currentStage >= 2" class="text-4xl font-bold mb-2 text-gray-800">
                  {{ getDisplayText(choice) }}
                </div>
                
                <!-- 段階に応じた補助情報 -->
                <div v-if="currentStage === 1" class="text-xl font-bold text-gray-700">
                  {{ PHONEME_DATA[choice].word }}
                </div>
                
                <div v-if="currentStage === 2" class="text-gray-600 text-sm mt-2">
                  {{ PHONEME_DATA[choice].description }}
                </div>
                
                <div v-if="currentStage === 3" class="space-y-1">
                  <div class="text-lg text-gray-600">{{ PHONEME_DATA[choice].word }}</div>
                  <div class="text-gray-500 text-sm">{{ PHONEME_DATA[choice].description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ゲーム終了画面 -->
        <div v-else-if="gameState === 'complete'" class="text-center py-12">
          <div class="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Star class="w-16 h-16 text-white fill-current" />
          </div>
          
          <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Great Job!
          </h2>
          
          <div class="bg-gray-50 rounded-2xl p-6 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-3xl font-bold text-purple-600">{{ score }}</div>
                <div class="text-gray-600">Final Score</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-green-600">
                  {{ Math.round(masteryRate) }}%
                </div>
                <div class="text-gray-600">Mastery Rate</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-blue-600">{{ currentStage }}</div>
                <div class="text-gray-600">Stage Reached</div>
              </div>
            </div>
          </div>
          
          <button 
            @click="resetGame"
            class="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-bold text-lg transform hover:scale-105"
          >
            <RotateCcw class="w-5 h-5 inline mr-2" />
            Try Again
          </button>
        </div>
      </div>

      <!-- 習得済み音素表示 -->
      <div v-if="masteredPhonemes.size > 0 && !showIntro" class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mt-6 shadow-2xl">
        <h3 class="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <Trophy class="w-6 h-6 text-green-500" />
          Mastered Phonemes
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div 
            v-for="phoneme in Array.from(masteredPhonemes)" 
            :key="phoneme"
            :class="[
              'p-4 rounded-2xl text-white font-bold shadow-lg text-center bg-gradient-to-r',
              PHONEME_DATA[phoneme].color
            ]"
          >
            <div class="space-y-2">
              <img 
                :src="PHONEME_DATA[phoneme].imageUrl" 
                :alt="PHONEME_DATA[phoneme].word"
                class="w-16 h-12 object-cover rounded-lg mx-auto"
              />
              <div class="text-sm">{{ PHONEME_DATA[phoneme].word }}</div>
              <div v-if="currentStage >= 3" class="text-xs opacity-80">{{ phoneme }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Settings, 
  Heart, 
  Camera, 
  Book, 
  GraduationCap, 
  Volume2, 
  Play, 
  RotateCcw, 
  Star, 
  Trophy 
} from 'lucide-vue-next'

// ルーター
const router = useRouter()

// 学習段階の定義
const LEARNING_STAGES = {
  1: { name: 'Picture Learning', icon: '📷', description: 'Learn with pictures' },
  2: { name: 'Word Learning', icon: '📚', description: 'Connect words with sounds' },
  3: { name: 'Symbol Learning', icon: '🎓', description: 'Master phonetic symbols' }
}

// 音素データ（写真付き）
const PHONEME_DATA = {
  '/æ/': {
    word: 'cat',
    description: 'The "a" sound in cat',
    imageQuery: 'orange cat cute',
    color: 'from-orange-400 to-red-500',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=200&fit=crop&crop=face'
  },
  '/ɪ/': {
    word: 'pig',
    description: 'The "i" sound in pig',
    imageQuery: 'pink pig farm',
    color: 'from-pink-400 to-purple-500',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&h=200&fit=crop&crop=center'
  },
  '/ʌ/': {
    word: 'cup',
    description: 'The "u" sound in cup',
    imageQuery: 'coffee cup white',
    color: 'from-amber-400 to-orange-500',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop&crop=center'
  },
  '/ɛ/': {
    word: 'bed',
    description: 'The "e" sound in bed',
    imageQuery: 'comfortable bed bedroom',
    color: 'from-blue-400 to-indigo-500',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&crop=center'
  },
  '/ɑ/': {
    word: 'hot',
    description: 'The "o" sound in hot',
    imageQuery: 'fire flame hot',
    color: 'from-red-400 to-pink-500',
    imageUrl: 'https://images.unsplash.com/photo-1525923838299-2312b60f6d69?w=300&h=200&fit=crop&crop=center'
  }
}

// 状態管理
const currentStage = ref(1)
const gameState = ref('intro') // intro, playing, feedback, complete
const currentPhoneme = ref(null)
const choices = ref([])
const score = ref(0)
const lives = ref(3)
const playCount = ref(0)
const feedback = ref('')
const showIntro = ref(true)
const masteredPhonemes = ref(new Set())
const isPlaying = ref(false)
const feedbackType = ref('') // 'correct' or 'incorrect'

// 背景パーティクル
const particles = ref(Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 2,
  size: 2 + Math.random() * 3
})))

// 計算プロパティ
const masteryRate = computed(() => {
  return (masteredPhonemes.value.size / 5) * 100
})

const canAdvanceStage = computed(() => {
  return masteredPhonemes.value.size >= 3 && currentStage.value < 3
})

const currentStageInfo = computed(() => {
  return LEARNING_STAGES[currentStage.value] || LEARNING_STAGES[1]
})

// メソッド
const speakPhoneme = (phoneme) => {
  if ('speechSynthesis' in window && PHONEME_DATA[phoneme]) {
    isPlaying.value = true
    playCount.value++
    
    const utterance = new SpeechSynthesisUtterance(PHONEME_DATA[phoneme].word)
    utterance.lang = 'en-US'
    utterance.rate = 0.7
    utterance.pitch = 1.2
    utterance.volume = 1.0
    utterance.onend = () => {
      isPlaying.value = false
    }
    
    speechSynthesis.speak(utterance)
  }
}

const startGame = () => {
  showIntro.value = false
  gameState.value = 'playing'
  loadNextQuestion()
}

const loadNextQuestion = () => {
  const phonemes = Object.keys(PHONEME_DATA)
  const correctPhoneme = phonemes[Math.floor(Math.random() * phonemes.length)]
  
  // 選択肢を生成
  const otherPhonemes = phonemes.filter(p => p !== correctPhoneme)
  const wrongChoices = otherPhonemes
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  
  const allChoices = [correctPhoneme, ...wrongChoices]
    .sort(() => Math.random() - 0.5)
  
  currentPhoneme.value = correctPhoneme
  choices.value = allChoices
  playCount.value = 0
  feedback.value = ''
  feedbackType.value = ''
  
  // 自動で音声再生
  setTimeout(() => speakPhoneme(correctPhoneme), 500)
}

const handleAnswer = (choice) => {
  if (gameState.value !== 'playing') return
  
  gameState.value = 'feedback'
  
  if (choice === currentPhoneme.value) {
    score.value += 100
    feedback.value = 'Excellent! Perfect answer!'
    feedbackType.value = 'correct'
    masteredPhonemes.value.add(choice)
  } else {
    lives.value--
    feedback.value = `Incorrect. The answer was "${PHONEME_DATA[currentPhoneme.value].word}".`
    feedbackType.value = 'incorrect'
  }
  
  setTimeout(() => {
    if (lives.value <= 0 && choice !== currentPhoneme.value) {
      gameState.value = 'complete'
    } else {
      gameState.value = 'playing'
      loadNextQuestion()
    }
  }, 2500)
}

const getDisplayText = (phoneme) => {
  const data = PHONEME_DATA[phoneme]
  switch (currentStage.value) {
    case 1: return '' // 画像のみ
    case 2: return data.word
    case 3: return phoneme
    default: return ''
  }
}

const advanceStage = () => {
  if (currentStage.value < 3) {
    currentStage.value++
    gameState.value = 'playing'
    loadNextQuestion()
  }
}

const resetGame = () => {
  score.value = 0
  lives.value = 3
  masteredPhonemes.value = new Set()
  currentStage.value = 1
  showIntro.value = true
  gameState.value = 'intro'
}

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
/* カスタムアニメーション */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes bubble {
  0% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-50px) scale(1.2); opacity: 0.6; }
  100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-10px); }
  80% { transform: translateX(10px); }
}

@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.animate-float { 
  animation: float 3s ease-in-out infinite; 
}

.animate-bubble { 
  animation: bubble 2s infinite ease-in-out; 
}

.animate-shake { 
  animation: shake 0.5s; 
}

.animate-correct { 
  animation: correctPulse 0.6s ease-in-out; 
}

/* ステージインジケーター */
.stage-indicator {
  background: linear-gradient(135deg, #8B5CF6, #A78BFA);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

/* 選択肢ボタン */
.choice-button {
  transition: all 0.3s ease;
  transform-origin: center;
}

.choice-button:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.choice-button.correct {
  background: linear-gradient(135deg, #10B981, #34D399) !important;
  color: white !important;
  border-color: #059669 !important;
}

.choice-button.incorrect {
  background: linear-gradient(135deg, #EF4444, #F87171) !important;
  color: white !important;
  border-color: #DC2626 !important;
}

/* 画像コンテナ */
.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.image-container img {
  transition: transform 0.3s ease;
}

.image-container:hover img {
  transform: scale(1.1);
}

/* フィードバックトランジション */
.feedback-enter-active, 
.feedback-leave-active {
  transition: opacity 0.4s ease;
}

.feedback-enter-from, 
.feedback-leave-to {
  opacity: 0;
}
</style>