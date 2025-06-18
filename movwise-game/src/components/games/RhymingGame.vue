<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Success Particles -->
    <div v-if="showParticles" class="absolute inset-0 pointer-events-none z-50">
      <div
        v-for="i in 20"
        :key="i"
        class="absolute text-3xl animate-bounce cosmic-glow"
        :style="{
          left: `${15 + Math.random() * 70}%`,
          top: `${15 + Math.random() * 70}%`,
          animationDelay: `${Math.random() * 0.8}s`
        }"
      >
        {{ ['🌟', '✨', '💫', '🎉', '🎊', '💖'][Math.floor(Math.random() * 6)] }}
      </div>
    </div>

    <!-- Menu Screen -->
    <div v-if="gamePhase === 'menu'" class="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div class="galaxy-card p-8 shadow-2xl max-w-2xl w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold galaxy-text-primary cosmic-title mb-4">
            🎯 韻踏みハンター
          </h1>
          <p class="text-galaxy-moon-silver text-lg">同じ音で終わる単語を見つけて、韻踏みマスターになろう！</p>
        </div>

        <!-- Level Selection -->
        <div class="mb-8">
          <h3 class="text-xl font-bold galaxy-text-primary mb-4">レベルを選択</h3>
          <div class="grid gap-4">
            <button
              v-for="(data, level) in rhymingData"
              :key="level"
              @click="currentLevel = parseInt(level)"
              class="p-4 rounded-2xl text-left transition-all duration-200"
              :class="[
                currentLevel === parseInt(level)
                  ? 'galaxy-button galaxy-button-primary shadow-lg'
                  : 'galaxy-card hover:scale-105'
              ]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-lg galaxy-text-primary">レベル {{ level }}: {{ data.name }}</div>
                  <div class="text-sm text-galaxy-moon-silver opacity-90">{{ data.description }}</div>
                  <div class="text-sm text-galaxy-moon-silver opacity-75">制限時間: {{ data.timeLimit }}秒</div>
                </div>
                <div class="text-2xl cosmic-glow">
                  {{ level === '1' ? '🌱' : level === '2' ? '🌳' : '🔥' }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Question Count Selection -->
        <div class="mb-8">
          <h3 class="text-xl font-bold galaxy-text-primary mb-4">問題数を選択</h3>
          <div class="flex gap-4">
            <button
              v-for="num in [5, 10, 15, 20]"
              :key="num"
              @click="totalQuestions = num"
              class="px-6 py-3 rounded-2xl font-bold transition-all duration-200"
              :class="[
                totalQuestions === num
                  ? 'galaxy-button galaxy-button-primary shadow-lg'
                  : 'galaxy-card text-galaxy-moon-silver hover:scale-105'
              ]"
            >
              {{ num }}問
            </button>
          </div>
        </div>

        <!-- Start Button -->
        <button
          @click="startGame"
          class="w-full galaxy-button galaxy-button-primary py-4 px-8 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
        >
          <div class="flex items-center justify-center gap-3">
            <PlayIcon class="w-6 h-6 cosmic-glow" />
            <span>ゲーム開始！</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Game Screen -->
    <div v-if="gamePhase === 'playing' && currentRound" class="relative z-10 container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="galaxy-card p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="galaxy-button galaxy-button-primary px-4 py-2 rounded-2xl font-bold">
              Level {{ currentLevel }}
            </div>
            <div class="text-galaxy-moon-silver font-medium">
              {{ currentRoundIndex + 1 }} / {{ Math.min(totalQuestions, currentLevelData.rounds.length) }}
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Lives -->
            <div class="flex items-center gap-1">
              <HeartIcon
                v-for="i in 3"
                :key="i"
                class="w-6 h-6"
                :class="i <= lives ? 'text-red-500 fill-current cosmic-glow' : 'text-gray-500'"
              />
            </div>
            <!-- Score -->
            <div class="flex items-center gap-2 galaxy-card px-3 py-1 rounded-xl">
              <TrophyIcon class="w-5 h-5 text-yellow-400 cosmic-glow" />
              <span class="font-bold text-galaxy-moon-silver">{{ score.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Progress & Combo -->
        <div class="flex items-center justify-between">
          <div class="flex-1 bg-gray-700 rounded-full h-3 mr-4">
            <div
              class="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500 cosmic-glow"
              :style="{ width: `${((currentRoundIndex + 1) / Math.min(totalQuestions, currentLevelData.rounds.length)) * 100}%` }"
            />
          </div>
          <div v-if="combo > 1" class="flex items-center gap-2 galaxy-card px-3 py-1 rounded-xl animate-pulse">
            <BoltIcon class="w-4 h-4 text-orange-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ combo }}連続!</span>
          </div>
        </div>
      </div>

      <!-- Main Game Area -->
      <div class="galaxy-card p-8 shadow-2xl">
        <!-- Timer -->
        <div class="mb-6">
          <div class="flex items-center justify-center mb-2">
            <div class="text-3xl font-bold galaxy-text-primary" :class="{ 'animate-pulse': timeLeft <= 5 }">
              <ClockIcon class="w-8 h-8 inline mr-2 cosmic-glow" />
              {{ timeLeft }}
            </div>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-3">
            <div
              class="h-3 rounded-full transition-all duration-1000 cosmic-glow"
              :class="{
                'bg-red-500': timeLeft <= 5,
                'bg-yellow-500': timeLeft <= 10 && timeLeft > 5,
                'bg-green-500': timeLeft > 10
              }"
              :style="{ width: `${(timeLeft / currentLevelData.timeLimit) * 100}%` }"
            />
          </div>
        </div>

        <!-- Target Word -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold galaxy-text-primary mb-4">
            この単語と韻を踏む単語を選ぼう！
          </h2>
          <div class="galaxy-card rounded-3xl p-8 mb-6">
            <div class="text-8xl mb-4 cosmic-glow">{{ currentRound.targetWord.emoji }}</div>
            <div class="text-4xl font-bold galaxy-text-primary mb-2">
              {{ currentRound.targetWord.word }}
            </div>
            <div class="text-xl text-galaxy-moon-silver mb-4">
              {{ currentRound.targetWord.sound }}
            </div>
            <button
              @click="playWordSound(currentRound.targetWord.word)"
              :disabled="isPlaying"
              class="galaxy-button galaxy-button-primary px-8 py-3 rounded-full font-bold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-70"
            >
              <div class="flex items-center gap-3">
                <div v-if="isPlaying" class="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <VolumeIcon v-else class="w-6 h-6 cosmic-glow" />
                <span>{{ isPlaying ? '再生中...' : '音を聞く' }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Choices -->
        <div class="grid grid-cols-2 gap-6 mb-8">
          <button
            v-for="(choice, index) in shuffledChoices"
            :key="index"
            @click="selectChoice(choice)"
            :disabled="selectedChoice !== null"
            class="p-6 rounded-3xl transition-all duration-300 cursor-pointer"
            :class="getChoiceClass(choice)"
          >
            <div class="text-center space-y-3">
              <div class="text-5xl cosmic-glow">{{ choice.emoji }}</div>
              <div class="text-2xl font-bold">{{ choice.word }}</div>
              <div class="text-lg opacity-75">{{ choice.sound }}</div>
            </div>
          </button>
        </div>

        <!-- Feedback -->
        <div
          v-if="showFeedback"
          class="text-center p-6 rounded-2xl galaxy-card"
          :class="{ 'border-green-500': isCorrect, 'border-red-500': !isCorrect }"
        >
          <div class="text-4xl font-bold mb-2 galaxy-text-primary">
            {{ isCorrect ? '🎉 正解！' : '😅 残念...' }}
          </div>
          <div class="text-xl mb-4 text-galaxy-moon-silver">
            <span v-if="isCorrect">
              素晴らしい！"{{ currentRound.targetWord.word }}"と"{{ selectedChoice.word }}"は韻を踏んでいます！
            </span>
            <span v-else>
              "{{ currentRound.targetWord.word }}"と韻を踏む単語は "{{ currentRound.choices.find(c => c.isRhyme).word }}" でした
            </span>
          </div>
          <div v-if="isCorrect && combo > 1" class="text-orange-400 font-bold text-lg cosmic-glow">
            🔥 {{ combo }}連続正解! ボーナス: +{{ combo * 25 }}点
          </div>
          <div class="mt-4">
            <div class="text-sm text-galaxy-moon-silver">
              韻を踏む単語: {{ currentRound.choices.filter(c => c.isRhyme).map(c => c.word).join(', ') }}
            </div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="flex justify-center gap-4 mt-6">
          <button
            @click="resetToMenu"
            class="flex items-center gap-2 galaxy-button galaxy-button-secondary px-6 py-3 rounded-2xl font-bold transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5" />
            メニューに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- Result Screen -->
    <div v-if="gamePhase === 'result'" class="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div class="galaxy-card p-8 shadow-2xl max-w-2xl w-full">
        <div class="text-center">
          <!-- Grade Display -->
          <div class="mb-8">
            <div class="text-8xl font-bold galaxy-text-primary cosmic-title mb-4">
              {{ getResultGrade().grade }}
            </div>
            <h2 class="text-3xl font-bold galaxy-text-primary mb-2">ゲーム終了！</h2>
            <p class="text-xl text-galaxy-moon-silver">{{ getResultGrade().message }}</p>
          </div>

          <!-- Detailed Results -->
          <div class="grid grid-cols-2 gap-6 mb-8">
            <div class="galaxy-card p-6 text-white rounded-2xl border border-yellow-400">
              <div class="text-3xl mb-2 cosmic-glow">🏆</div>
              <div class="text-2xl font-bold galaxy-text-primary">{{ score.toLocaleString() }}</div>
              <div class="text-sm text-galaxy-moon-silver">総スコア</div>
            </div>
            
            <div class="galaxy-card p-6 text-white rounded-2xl border border-green-400">
              <div class="text-3xl mb-2 cosmic-glow">✅</div>
              <div class="text-2xl font-bold galaxy-text-primary">{{ correctAnswers }}</div>
              <div class="text-sm text-galaxy-moon-silver">正解数</div>
            </div>
            
            <div class="galaxy-card p-6 text-white rounded-2xl border border-purple-400">
              <div class="text-3xl mb-2 cosmic-glow">⚡</div>
              <div class="text-2xl font-bold galaxy-text-primary">{{ maxCombo }}</div>
              <div class="text-sm text-galaxy-moon-silver">最大連続</div>
            </div>
            
            <div class="galaxy-card p-6 text-white rounded-2xl border border-blue-400">
              <div class="text-3xl mb-2 cosmic-glow">📊</div>
              <div class="text-2xl font-bold galaxy-text-primary">
                {{ Math.round((correctAnswers / Math.min(totalQuestions, currentRoundIndex + 1)) * 100) }}%
              </div>
              <div class="text-sm text-galaxy-moon-silver">正答率</div>
            </div>
          </div>

          <!-- Level Feedback -->
          <div class="galaxy-card p-6 mb-6">
            <h3 class="text-xl font-bold galaxy-text-primary mb-3">レベル別パフォーマンス</h3>
            <div class="text-galaxy-moon-silver">
              レベル {{ currentLevel }}: {{ currentLevelData.name }}
              <br />
              {{ correctAnswers >= Math.min(totalQuestions, currentRoundIndex + 1) * 0.8 
                ? '🌟 このレベルをマスターしました！' 
                : '📚 もう少し練習してみましょう！'
              }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              @click="startGame"
              class="flex-1 galaxy-button galaxy-button-primary py-3 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              <div class="flex items-center justify-center gap-2">
                <ArrowPathIcon class="w-5 h-5" />
                もう一度挑戦
              </div>
            </button>
            
            <button
              @click="resetToMenu"
              class="flex-1 galaxy-button galaxy-button-secondary py-3 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              <div class="flex items-center justify-center gap-2">
                <ChevronRightIcon class="w-5 h-5" />
                メニューに戻る
              </div>
            </button>
          </div>

          <!-- Next Level Challenge -->
          <div v-if="currentLevel < 3 && correctAnswers >= Math.min(totalQuestions, currentRoundIndex + 1) * 0.7" class="mt-6">
            <button
              @click="() => { currentLevel = currentLevel + 1; gamePhase = 'menu'; }"
              class="galaxy-button galaxy-button-primary py-3 px-8 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <div class="flex items-center justify-center gap-2">
                <TrophyIcon class="w-5 h-5 cosmic-glow" />
                レベル {{ currentLevel + 1 }} に挑戦！
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  PlayIcon, TrophyIcon, BoltIcon, HeartIcon, ClockIcon, 
  ArrowPathIcon, ChevronRightIcon, SpeakerWaveIcon
} from '@heroicons/vue/24/outline'
// import { CrownIcon } from '@heroicons/vue/24/solid' // CrownIcon does not exist

// Game state management
const gamePhase = ref('menu') // menu, playing, result
const currentLevel = ref(1)
const currentRoundIndex = ref(0)
const score = ref(0)
const lives = ref(3)
const combo = ref(0)
const maxCombo = ref(0)
const timeLeft = ref(15)
const isTimerActive = ref(false)
const selectedChoice = ref(null)
const showFeedback = ref(false)
const isCorrect = ref(false)
const showParticles = ref(false)
const isPlaying = ref(false)
const streak = ref(0)
const totalQuestions = ref(10)
const correctAnswers = ref(0)

// Timer reference
let timerRef = null

// Rhyming learning data (by level)
const rhymingData = reactive({
  1: { // Level 1: Basic rhyming
    name: "基本の韻踏み",
    description: "簡単な韻を見つけよう！",
    timeLimit: 15,
    rounds: [
      {
        targetWord: { word: 'cat', sound: '/æt/', emoji: '🐱' },
        choices: [
          { word: 'hat', sound: '/æt/', emoji: '🎩', isRhyme: true },
          { word: 'dog', sound: '/ɒg/', emoji: '🐕', isRhyme: false },
          { word: 'bat', sound: '/æt/', emoji: '🦇', isRhyme: true },
          { word: 'fish', sound: '/ɪʃ/', emoji: '🐟', isRhyme: false }
        ]
      },
      {
        targetWord: { word: 'sun', sound: '/ʌn/', emoji: '☀️' },
        choices: [
          { word: 'moon', sound: '/uːn/', emoji: '🌙', isRhyme: false },
          { word: 'run', sound: '/ʌn/', emoji: '🏃', isRhyme: true },
          { word: 'fun', sound: '/ʌn/', emoji: '🎉', isRhyme: true },
          { word: 'star', sound: '/ɑːr/', emoji: '⭐', isRhyme: false }
        ]
      },
      {
        targetWord: { word: 'tree', sound: '/iː/', emoji: '🌳' },
        choices: [
          { word: 'bee', sound: '/iː/', emoji: '🐝', isRhyme: true },
          { word: 'bird', sound: '/ɜːrd/', emoji: '🐦', isRhyme: false },
          { word: 'free', sound: '/iː/', emoji: '🆓', isRhyme: true },
          { word: 'house', sound: '/aʊs/', emoji: '🏠', isRhyme: false }
        ]
      },
      {
        targetWord: { word: 'ball', sound: '/ɔːl/', emoji: '⚽' },
        choices: [
          { word: 'wall', sound: '/ɔːl/', emoji: '🧱', isRhyme: true },
          { word: 'book', sound: '/ʊk/', emoji: '📚', isRhyme: false },
          { word: 'tall', sound: '/ɔːl/', emoji: '📏', isRhyme: true },
          { word: 'small', sound: '/ɔːl/', emoji: '🐭', isRhyme: true }
        ]
      },
      {
        targetWord: { word: 'ring', sound: '/ɪŋ/', emoji: '💍' },
        choices: [
          { word: 'sing', sound: '/ɪŋ/', emoji: '🎤', isRhyme: true },
          { word: 'dance', sound: '/æns/', emoji: '💃', isRhyme: false },
          { word: 'king', sound: '/ɪŋ/', emoji: '👑', isRhyme: true },
          { word: 'music', sound: '/juːzɪk/', emoji: '🎵', isRhyme: false }
        ]
      }
    ]
  },
  2: { // Level 2: Intermediate rhyming
    name: "韻踏みチャレンジ",
    description: "より複雑な韻に挑戦！",
    timeLimit: 12,
    rounds: [
      {
        targetWord: { word: 'light', sound: '/aɪt/', emoji: '💡' },
        choices: [
          { word: 'night', sound: '/aɪt/', emoji: '🌙', isRhyme: true },
          { word: 'bright', sound: '/aɪt/', emoji: '✨', isRhyme: true },
          { word: 'dark', sound: '/ɑːrk/', emoji: '🌑', isRhyme: false },
          { word: 'shadow', sound: '/ʃædoʊ/', emoji: '👥', isRhyme: false }
        ]
      },
      {
        targetWord: { word: 'flower', sound: '/aʊər/', emoji: '🌸' },
        choices: [
          { word: 'power', sound: '/aʊər/', emoji: '⚡', isRhyme: true },
          { word: 'garden', sound: '/ɡɑːrdən/', emoji: '🌿', isRhyme: false },
          { word: 'tower', sound: '/aʊər/', emoji: '🗼', isRhyme: true },
          { word: 'beauty', sound: '/bjuːti/', emoji: '💄', isRhyme: false }
        ]
      },
      {
        targetWord: { word: 'ocean', sound: '/oʊʃən/', emoji: '🌊' },
        choices: [
          { word: 'motion', sound: '/moʊʃən/', emoji: '🏃‍♂️', isRhyme: true },
          { word: 'water', sound: '/wɔːtər/', emoji: '💧', isRhyme: false },
          { word: 'potion', sound: '/poʊʃən/', emoji: '🧪', isRhyme: true },
          { word: 'river', sound: '/rɪvər/', emoji: '🏞️', isRhyme: false }
        ]
      }
    ]
  },
  3: { // Level 3: Advanced rhyming
    name: "韻踏みマスター",
    description: "複雑な韻をマスターしよう！",
    timeLimit: 10,
    rounds: [
      {
        targetWord: { word: 'education', sound: '/eɪʃən/', emoji: '🎓' },
        choices: [
          { word: 'nation', sound: '/eɪʃən/', emoji: '🏛️', isRhyme: true },
          { word: 'creation', sound: '/eɪʃən/', emoji: '🎨', isRhyme: true },
          { word: 'knowledge', sound: '/nɑːlɪdʒ/', emoji: '📚', isRhyme: false },
          { word: 'learning', sound: '/lɜːrnɪŋ/', emoji: '📖', isRhyme: false }
        ]
      },
      {
        targetWord: { word: 'beautiful', sound: '/fəl/', emoji: '🌺' },
        choices: [
          { word: 'wonderful', sound: '/fəl/', emoji: '🌟', isRhyme: true },
          { word: 'colorful', sound: '/fəl/', emoji: '🌈', isRhyme: true },
          { word: 'amazing', sound: '/ɪŋ/', emoji: '🤩', isRhyme: false },
          { word: 'fantastic', sound: '/ɪk/', emoji: '🎆', isRhyme: false }
        ]
      }
    ]
  }
})

const currentLevelData = computed(() => rhymingData[currentLevel.value])
const currentRound = computed(() => currentLevelData.value?.rounds[currentRoundIndex.value])

// Shuffled choices
const shuffledChoices = ref([])

const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Audio playback
const playWordSound = async (word) => {
  if (isPlaying.value) return
  
  isPlaying.value = true
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  utterance.rate = 0.8
  utterance.pitch = 1.0
  utterance.volume = 1.0
  
  utterance.onend = () => {
    isPlaying.value = false
  }
  
  speechSynthesis.speak(utterance)
}

// Timer management
const startTimer = () => {
  timeLeft.value = currentLevelData.value.timeLimit
  isTimerActive.value = true
  timerRef = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      handleTimeUp()
    }
  }, 1000)
}

const stopTimer = () => {
  isTimerActive.value = false
  if (timerRef) {
    clearInterval(timerRef)
  }
}

const handleTimeUp = () => {
  stopTimer()
  lives.value--
  combo.value = 0
  showFeedback.value = true
  isCorrect.value = false
  
  setTimeout(() => {
    if (lives.value > 0) {
      nextRound()
    } else {
      endGame()
    }
  }, 2500)
}

// Game start
const startGame = () => {
  gamePhase.value = 'playing'
  currentRoundIndex.value = 0
  score.value = 0
  lives.value = 3
  combo.value = 0
  maxCombo.value = 0
  correctAnswers.value = 0
  streak.value = 0
  showFeedback.value = false
  selectedChoice.value = null
  shuffledChoices.value = shuffleArray(currentRound.value.choices)
  startTimer()
}

// Choice selection
const selectChoice = (choice) => {
  if (selectedChoice.value || showFeedback.value) return
  
  stopTimer()
  selectedChoice.value = choice
  
  const correct = choice.isRhyme
  isCorrect.value = correct
  showFeedback.value = true
  
  if (correct) {
    const baseScore = 100
    const comboBonus = combo.value * 25
    const timeBonus = Math.max(0, timeLeft.value * 10)
    const levelBonus = currentLevel.value * 50
    const totalScore = baseScore + comboBonus + timeBonus + levelBonus
    
    score.value += totalScore
    combo.value++
    maxCombo.value = Math.max(maxCombo.value, combo.value)
    streak.value++
    correctAnswers.value++
    showParticles.value = true
    
    setTimeout(() => { showParticles.value = false }, 2000)
  } else {
    lives.value--
    combo.value = 0
    streak.value = 0
  }
  
  setTimeout(() => {
    if (!correct && lives.value <= 0) {
      endGame()
    } else {
      nextRound()
    }
  }, 3000)
}

// Next round
const nextRound = () => {
  const nextIndex = currentRoundIndex.value + 1
  
  if (nextIndex >= Math.min(totalQuestions.value, currentLevelData.value.rounds.length)) {
    // Level clear or set question count complete
    if (currentLevel.value < 3 && nextIndex >= currentLevelData.value.rounds.length) {
      currentLevel.value++
      currentRoundIndex.value = 0
    } else {
      endGame()
      return
    }
  } else {
    currentRoundIndex.value = nextIndex
  }
  
  // Reset state
  selectedChoice.value = null
  showFeedback.value = false
  shuffledChoices.value = shuffleArray(rhymingData[currentLevel.value].rounds[currentRoundIndex.value % rhymingData[currentLevel.value].rounds.length].choices)
  startTimer()
}

// Game end
const endGame = () => {
  stopTimer()
  gamePhase.value = 'result'
}

// Game reset
const resetToMenu = () => {
  gamePhase.value = 'menu'
  currentLevel.value = 1
  currentRoundIndex.value = 0
  score.value = 0
  lives.value = 3
  combo.value = 0
  maxCombo.value = 0
  correctAnswers.value = 0
  streak.value = 0
  showFeedback.value = false
  selectedChoice.value = null
}

// Choice class calculation
const getChoiceClass = (choice) => {
  if (!showFeedback.value) {
    return selectedChoice.value === choice 
      ? 'galaxy-button galaxy-button-primary transform scale-105 shadow-xl'
      : 'galaxy-card hover:scale-105 hover:shadow-lg'
  }
  
  if (choice.isRhyme) {
    return 'galaxy-card border-green-500 transform scale-105 shadow-xl'
  } else if (choice === selectedChoice.value) {
    return 'galaxy-card border-red-500 transform scale-105 shadow-xl'
  }
  
  return 'galaxy-card opacity-50'
}

// Result grade calculation
const getResultGrade = () => {
  const accuracy = (correctAnswers.value / Math.min(totalQuestions.value, currentRoundIndex.value + 1)) * 100
  if (accuracy >= 90) return { grade: 'S', message: '完璧！韻踏みマスター！' }
  if (accuracy >= 80) return { grade: 'A', message: '素晴らしい！' }
  if (accuracy >= 70) return { grade: 'B', message: 'よくできました！' }
  if (accuracy >= 60) return { grade: 'C', message: 'もう少し！' }
  return { grade: 'D', message: '練習あるのみ！' }
}

// Effects
onMounted(() => {
  if (currentRound.value) {
    shuffledChoices.value = shuffleArray(currentRound.value.choices)
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
/* Galaxy theme styles */
.galaxy-background {
  background: radial-gradient(ellipse at center, #0a0a0f 0%, #000000 100%);
  position: relative;
  overflow: hidden;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fbbf24, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(251, 191, 36, 0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, #3b82f6, transparent),
    radial-gradient(2px 2px at 160px 30px, rgba(99, 102, 241, 0.6), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: cosmic-drift 30s linear infinite;
  opacity: 0.8;
}

.stars-layer-2 {
  animation-duration: 40s;
  opacity: 0.6;
}

.stars-layer-3 {
  animation-duration: 50s;
  opacity: 0.4;
}

@keyframes cosmic-drift {
  from { transform: translateX(0px); }
  to { transform: translateX(-200px); }
}

.galaxy-card {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  color: #fff;
  transition: all 0.3s ease;
}

.galaxy-button {
  border: none;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  color: white;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.galaxy-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.5);
}

.galaxy-button-secondary {
  background: rgba(75, 85, 99, 0.8);
  color: white;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.galaxy-button-secondary:hover {
  background: rgba(107, 114, 128, 0.9);
  transform: translateY(-1px);
}

.galaxy-text-primary {
  color: #e2e8f0;
}

.text-galaxy-moon-silver {
  color: #cbd5e1;
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.6));
}

.cosmic-title {
  background: linear-gradient(45deg, #fbbf24, #3b82f6, #fbbf24);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: cosmic-shimmer 3s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
}

@keyframes cosmic-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>