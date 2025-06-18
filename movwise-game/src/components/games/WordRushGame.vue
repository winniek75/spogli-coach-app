<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 relative overflow-hidden">
    <!-- 背景パーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="particle in backgroundParticles"
        :key="particle.id"
        class="absolute bg-white rounded-full opacity-20"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animation: `float ${particle.duration}s ease-in-out infinite`,
          animationDelay: `${particle.delay}s`
        }"
      />
    </div>

    <!-- ゲームヘッダー -->
    <header class="relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button 
            @click="handleBack"
            class="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              ⚡ ワード・ラッシュ・アリーナ
            </h1>
            <p class="text-gray-600">高速語彙習得ゲーム</p>
          </div>

          <button 
            @click="showSettings = true"
            class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5" />
          </button>
        </div>

        <!-- ゲーム中のステータス -->
        <div v-if="gameState === 'playing'" class="flex items-center justify-center gap-8 mt-4">
          <div class="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
            <Clock class="w-5 h-5" />
            <span class="font-bold text-lg">{{ timeLeft }}s</span>
          </div>
          
          <div class="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
            <Flame class="w-5 h-5" />
            <span class="font-bold text-lg">{{ streak }}連続</span>
          </div>
          
          <div class="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
            <Star class="w-5 h-5" />
            <span class="font-bold text-lg">{{ score.toLocaleString() }}</span>
          </div>
          
          <div class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg">
            <Target class="w-5 h-5" />
            <span class="font-bold text-lg">{{ currentQuestion + 1 }}/{{ QUESTIONS_PER_ROUND }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- メインゲームエリア -->
    <main class="relative z-10 container mx-auto px-4 py-8">
      <!-- 開始画面 -->
      <div v-if="gameState === 'start'" class="max-w-2xl mx-auto">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center">
          <div class="text-6xl mb-6">⚡</div>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">ワード・ラッシュに挑戦！</h2>
          <p class="text-gray-600 mb-6 leading-relaxed">
            60秒間で10問の語彙問題に挑戦します。画像、音声、定義から正しい英単語を選んでください。
            連続正解でコンボボーナス獲得！
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl">
              <div class="text-3xl mb-2">🖼️</div>
              <div class="font-bold text-gray-800">画像問題</div>
              <div class="text-sm text-gray-600">画像を見て英単語を選択</div>
            </div>
            <div class="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl">
              <div class="text-3xl mb-2">🔊</div>
              <div class="font-bold text-gray-800">音声問題</div>
              <div class="text-sm text-gray-600">音声を聞いて英単語を選択</div>
            </div>
            <div class="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl">
              <div class="text-3xl mb-2">📝</div>
              <div class="font-bold text-gray-800">定義問題</div>
              <div class="text-sm text-gray-600">日本語定義から英単語を選択</div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span class="text-gray-700">難易度レベル:</span>
              <select 
                v-model="difficultyLevel" 
                class="bg-white border border-gray-300 rounded-lg px-3 py-1 font-bold"
              >
                <option value="beginner">初級 (200語)</option>
                <option value="intermediate">中級 (300語)</option>
                <option value="advanced">上級 (200語)</option>
              </select>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span class="text-gray-700">カテゴリ:</span>
              <select v-model="selectedCategory" class="bg-white border border-gray-300 rounded-lg px-3 py-1 font-bold">
                <option value="" disabled>カテゴリを選択</option>
                <option v-for="cat in categories" :key="cat.key" :value="cat.key">{{ cat.name }}</option>
              </select>
            </div>
            <div v-if="subLevels.length > 0" class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span class="text-gray-700">レベル/級:</span>
              <select v-model="selectedSubLevel" class="bg-white border border-gray-300 rounded-lg px-3 py-1 font-bold">
                <option value="" disabled>レベル/級を選択</option>
                <option v-for="sub in subLevels" :key="sub" :value="sub">{{ subLevelLabels[sub] || sub }}</option>
              </select>
            </div>
            <button 
              @click="startGame"
              class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              :disabled="!selectedCategory || (subLevels.length > 0 && !selectedSubLevel)"
            >
              <div class="flex items-center justify-center gap-3">
                <Play class="w-6 h-6" />
                ゲーム開始
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- ゲーム画面 -->
      <div v-if="gameState === 'playing'" class="max-w-4xl mx-auto">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <!-- 問題エリア -->
          <div class="text-center mb-8">
            <!-- 画像問題 -->
            <div v-if="currentQuestionData.type === 'image_to_word'" class="space-y-6">
              <div class="text-xl font-bold text-gray-800 mb-4">この画像の英単語は？</div>
              <div class="flex justify-center">
                <div class="relative w-64 h-64">
                  <img 
                    :src="loadImage(currentQuestionData.image)" 
                    :alt="currentQuestionData.english"
                    class="w-full h-full object-cover rounded-2xl shadow-lg transition-opacity duration-300"
                    :class="{ 'opacity-0': !imageCache.has(currentQuestionData.image) }"
                    @error="handleImageError"
                    loading="lazy"
                  />
                  <div 
                    v-if="imageLoadError" 
                    class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-8xl shadow-lg"
                  >
                    {{ getFallbackEmoji(currentQuestionData.english) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 音声問題 -->
            <div v-if="currentQuestionData.type === 'audio_to_word'" class="space-y-6">
              <div class="text-xl font-bold text-gray-800 mb-4">音声を聞いて英単語を選んでください</div>
              <div class="flex justify-center">
                <button 
                  @click="playAudio"
                  class="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full flex items-center justify-center text-4xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
                  :class="{ 'animate-pulse': isPlaying }"
                >
                  <Volume2 class="w-12 h-12" />
                </button>
              </div>
              <div class="text-gray-600">
                <button 
                  @click="playAudio"
                  class="text-blue-500 hover:text-blue-700 font-bold"
                >
                  🔊 もう一度聞く
                </button>
              </div>
            </div>

            <!-- 定義問題 -->
            <div v-if="currentQuestionData.type === 'definition_to_word'" class="space-y-6">
              <div class="text-xl font-bold text-gray-800 mb-4">この意味の英単語は？</div>
              <div class="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl">
                <div class="text-2xl font-bold text-gray-800">{{ currentQuestionData.definition }}</div>
              </div>
            </div>
          </div>

          <!-- 選択肢 -->
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="(option, index) in currentQuestionData.options"
              :key="index"
              @click="selectAnswer(option, index)"
              :disabled="answerSelected"
              :class="[
                'p-6 rounded-2xl font-bold text-xl transition-all duration-300 transform',
                answerSelected
                  ? option === currentQuestionData.correct
                    ? 'galaxy-button galaxy-button-primary text-white shadow-2xl scale-105 cosmic-glow'
                    : selectedAnswerIndex === index
                    ? 'galaxy-card border-red-400 text-white shadow-2xl bg-red-500/50'
                    : 'galaxy-card opacity-50 text-galaxy-moon-silver'
                  : 'galaxy-card text-white hover:galaxy-button-primary hover:shadow-xl hover:scale-105 shadow-lg'
              ]"
            >
              {{ option }}
            </button>
          </div>

          <!-- フィードバック -->
          <div v-if="showFeedback" class="mt-6 text-center">
            <div v-if="isCorrect" class="space-y-2">
              <div class="text-3xl">🎉</div>
              <div class="text-xl font-bold text-green-600">正解！</div>
              <div v-if="streak >= 3" class="text-lg font-bold text-orange-500">
                コンボボーナス: +{{ getComboBonus() }}点
              </div>
            </div>
            <div v-else class="space-y-2">
              <div class="text-3xl">😅</div>
              <div class="text-xl font-bold text-red-600">不正解</div>
              <div class="text-gray-600">正解: {{ currentQuestionData.correct }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 結果画面 -->
      <div v-if="gameState === 'result'" class="max-w-2xl mx-auto">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center">
          <div class="text-6xl mb-6">🏆</div>
          <h2 class="text-3xl font-bold text-gray-800 mb-6">ゲーム完了！</h2>
          
          <div class="space-y-4 mb-8">
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-2xl">
              <div class="text-2xl font-bold">{{ finalScore.toLocaleString() }}点</div>
              <div class="text-sm opacity-90">最終スコア</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl">
                <div class="text-2xl font-bold text-green-700">{{ correctAnswers }}</div>
                <div class="text-sm text-gray-600">正解数</div>
              </div>
              <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl">
                <div class="text-2xl font-bold text-blue-700">{{ Math.round((correctAnswers / QUESTIONS_PER_ROUND) * 100) }}%</div>
                <div class="text-sm text-gray-600">正解率</div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl">
              <div class="text-xl font-bold text-purple-700">{{ maxStreak }}連続</div>
              <div class="text-sm text-gray-600">最長連続正解</div>
            </div>

            <!-- パフォーマンス評価 -->
            <div class="bg-gradient-to-br from-pink-100 to-red-100 p-4 rounded-2xl">
              <div class="text-lg font-bold text-pink-700">{{ getPerformanceRating() }}</div>
              <div class="text-sm text-gray-600">{{ getPerformanceMessage() }}</div>
            </div>
          </div>

          <div class="space-y-4">
            <button 
              @click="restartGame"
              class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              もう一度プレイ
            </button>
            <button 
              @click="handleBack"
              class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-2xl font-bold transition-colors"
            >
              ハブに戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 設定モーダル -->
    <div v-if="showSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">ゲーム設定</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-gray-700 font-bold mb-2">音量</label>
            <input 
              type="range" 
              v-model="audioVolume" 
              min="0" 
              max="1" 
              step="0.1"
              class="w-full"
            >
          </div>
          
          <div>
            <label class="block text-gray-700 font-bold mb-2">難易度</label>
            <select 
              v-model="difficultyLevel" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
            </select>
          </div>
        </div>
        
        <button
          @click="showSettings = false"
          class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-xl font-bold transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import vocabularyData from '@/data/vocabulary.json'
import { 
  ArrowLeft, Settings, Clock, Flame, Star, Target, 
  Play, Volume2, ChevronRight
} from 'lucide-vue-next'

const router = useRouter()

// ゲーム定数
const GAME_DURATION = 60 // 秒
const QUESTIONS_PER_ROUND = 10

// ゲーム状態
const gameState = ref('start') // 'start', 'playing', 'result'
const timeLeft = ref(GAME_DURATION)
const currentQuestion = ref(0)
const score = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const correctAnswers = ref(0)
const finalScore = ref(0)
const answerSelected = ref(false)
const selectedAnswerIndex = ref(-1)
const showFeedback = ref(false)
const isCorrect = ref(false)
const showSettings = ref(false)
const isPlaying = ref(false)
const imageLoadError = ref(false)
const currentQuestionData = ref({})
const backgroundParticles = ref(Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 2,
  size: 2 + Math.random() * 3
})))

// 設定
const difficultyLevel = ref('beginner')
const audioVolume = ref(0.7)
const selectedCategory = ref('')
const selectedSubLevel = ref('')

// カテゴリ一覧
const categories = computed(() => {
  return Object.entries(vocabularyData.categories).map(([key, cat]) => ({
    key,
    name: cat.name
  }))
})

// サブレベル一覧（カテゴリ選択時に動的取得）
const subLevels = computed(() => {
  if (!selectedCategory.value) return []
  const levels = vocabularyData.categories[selectedCategory.value]?.levels || {}
  return Object.keys(levels)
})

// サブレベルのラベル表示用
const subLevelLabels = {
  grade5: '5級', grade4: '4級', grade3: '3級', pre2: '準2級', grade2: '2級', pre1: '準1級', grade1: '1級',
  beginner: '初級', intermediate: '中級', advanced: '上級'
}

// 難易度→レベルキーのマッピング
const levelKeyMap = {
  'kids': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
  'eiken': { beginner: 'grade5', intermediate: 'grade3', advanced: 'pre1' },
  'toeic': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
  'toefl': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
  'daily': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' }
}

// 語彙データベース（旧データ）
const vocabularyDatabase = {
  beginner: [
    {
      english: 'apple',
      japanese: 'りんご',
      image: '/src/assets/images/vocabulary/apple.jpg',
      category: 'food',
      distractors: ['orange', 'banana', 'grape']
    },
    {
      english: 'book',
      japanese: '本',
      image: '/src/assets/images/vocabulary/book.jpg',
      category: 'object',
      distractors: ['pen', 'pencil', 'notebook']
    },
    {
      english: 'cat',
      japanese: '猫',
      image: '/src/assets/images/vocabulary/cat.jpg',
      category: 'animal',
      distractors: ['dog', 'bird', 'fish']
    }
  ],
  intermediate: [
    {
      english: 'computer',
      japanese: 'コンピュータ',
      image: '/src/assets/images/vocabulary/computer.jpg',
      category: 'technology',
      distractors: ['phone', 'tablet', 'camera']
    },
    {
      english: 'garden',
      japanese: '庭',
      image: '/src/assets/images/vocabulary/garden.jpg',
      category: 'place',
      distractors: ['park', 'forest', 'beach']
    }
  ],
  advanced: [
    {
      english: 'architecture',
      japanese: '建築',
      image: '/src/assets/images/vocabulary/architecture.jpg',
      category: 'art',
      distractors: ['design', 'sculpture', 'painting']
    },
    {
      english: 'philosophy',
      japanese: '哲学',
      image: '/src/assets/images/vocabulary/philosophy.jpg',
      category: 'academic',
      distractors: ['psychology', 'sociology', 'anthropology']
    }
  ]
}

// 問題タイプの重み
const questionTypeWeights = {
  'image_to_word': 0.4,
  'audio_to_word': 0.35,
  'definition_to_word': 0.25
}

// 画像キャッシュ
const preloadedImages = new Set()
const imageCache = new Map()

// 画像のプリロード
const preloadImage = (imagePath) => {
  if (preloadedImages.has(imagePath)) return
  const img = new Image()
  img.src = imagePath
  img.onload = () => {
    preloadedImages.add(imagePath)
    imageCache.set(imagePath, img)
  }
}

// 次の問題の画像をプリロード
const preloadNextImages = () => {
  const vocabulary = vocabularyDatabase[difficultyLevel.value]
  const nextWords = vocabulary
    .filter(word => word.image)
    .slice(0, 3)
  nextWords.forEach(word => {
    preloadImage(word.image)
  })
}

watch(difficultyLevel, () => {
  preloadNextImages()
})
onMounted(() => {
  preloadNextImages()
})

// 画像の遅延読み込み
const loadImage = (imagePath) => {
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath).src
  }
  return imagePath
}

// 問題生成
const generateQuestion = () => {
  imageLoadError.value = false
  let vocabulary = []
  if (selectedCategory.value && vocabularyData.categories[selectedCategory.value]) {
    const levels = vocabularyData.categories[selectedCategory.value].levels
    let levelKey = ''
    // サブレベルが選択されていればそれを使う
    if (selectedSubLevel.value && levels[selectedSubLevel.value]) {
      levelKey = selectedSubLevel.value
    } else {
      // 旧ロジック: 難易度→レベルキーのマッピング
      levelKey = (levelKeyMap[selectedCategory.value] && levelKeyMap[selectedCategory.value][difficultyLevel.value]) || difficultyLevel.value
    }
    vocabulary = levels[levelKey] || []
  } else {
    vocabulary = vocabularyDatabase[difficultyLevel.value] || []
  }
  if (!vocabulary.length) {
    currentQuestionData.value = {}
    return
  }
  const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)]
  // 問題タイプをランダムに選択（重み付きランダム）
  const rand = Math.random()
  let questionType
  if (rand < questionTypeWeights.image_to_word) {
    questionType = 'image_to_word'
  } else if (rand < questionTypeWeights.image_to_word + questionTypeWeights.audio_to_word) {
    questionType = 'audio_to_word'
  } else {
    questionType = 'definition_to_word'
  }
  // 選択肢を生成
  const options = [randomWord.english, ...randomWord.distractors]
  shuffleArray(options)
  currentQuestionData.value = {
    type: questionType,
    correct: randomWord.english,
    japanese: randomWord.japanese,
    image: randomWord.image,
    definition: randomWord.japanese,
    options: options,
    word: randomWord
  }
  answerSelected.value = false
  showFeedback.value = false
  selectedAnswerIndex.value = -1
  // 次の問題の画像をプリロード
  preloadNextImages()
}

// 配列シャッフル
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

// 回答選択
const selectAnswer = (answer, index) => {
  if (answerSelected.value) return
  answerSelected.value = true
  selectedAnswerIndex.value = index
  const correct = answer === currentQuestionData.value.correct
  if (correct) {
    isCorrect.value = true
    correctAnswers.value++
    streak.value++
    maxStreak.value = Math.max(maxStreak.value, streak.value)
    // スコア計算
    const basePoints = 100
    const timeBonus = Math.max(0, (timeLeft.value - 50)) * 10
    const comboBonus = getComboBonus()
    const totalPoints = basePoints + timeBonus + comboBonus
    score.value += totalPoints
  } else {
    isCorrect.value = false
    streak.value = 0
    score.value = Math.max(0, score.value - 50) // ペナルティ
  }
  showFeedback.value = true
  // 1.5秒後に次の問題
  setTimeout(() => {
    nextQuestion()
  }, 1500)
}

// コンボボーナス計算
const getComboBonus = () => {
  if (streak.value >= 8) return 250 // 5x
  if (streak.value >= 5) return 150 // 3x
  if (streak.value >= 3) return 100 // 2x
  return 0
}

// 次の問題
const nextQuestion = () => {
  currentQuestion.value++
  if (currentQuestion.value >= QUESTIONS_PER_ROUND) {
    endGame()
  } else {
    generateQuestion()
  }
}

// ゲーム終了
const endGame = () => {
  gameState.value = 'result'
  finalScore.value = score.value
  // パーフェクトラウンドボーナス
  if (correctAnswers.value === QUESTIONS_PER_ROUND) {
    finalScore.value *= 2
  }
  clearInterval(gameTimer)
}

// ゲーム開始
const startGame = () => {
  if (!selectedCategory.value || (subLevels.value.length > 0 && !selectedSubLevel.value)) return
  gameState.value = 'playing'
  resetGameState()
  generateQuestion()
  startTimer()
}

// ゲーム状態リセット
const resetGameState = () => {
  timeLeft.value = GAME_DURATION
  currentQuestion.value = 0
  score.value = 0
  streak.value = 0
  maxStreak.value = 0
  correctAnswers.value = 0
  answerSelected.value = false
  showFeedback.value = false
}

// タイマー開始
let gameTimer = null
const startTimer = () => {
  gameTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

// ゲーム再開
const restartGame = () => {
  gameState.value = 'start'
}

// 戻るボタン
const handleBack = () => {
  if (gameState.value === 'playing') {
    if (confirm('ゲームを中断しますか？進捗は失われます。')) {
      clearInterval(gameTimer)
      router.back()
    }
  } else {
    router.back()
  }
}

// パフォーマンス評価
const getPerformanceRating = () => {
  const accuracy = (correctAnswers.value / QUESTIONS_PER_ROUND) * 100
  if (accuracy >= 90) return '🏆 パーフェクト！'
  if (accuracy >= 80) return '🥉 素晴らしい！'
  if (accuracy >= 70) return '🎯 良い調子！'
  if (accuracy >= 60) return '📈 まずまず'
  return '💪 次回頑張ろう！'
}
const getPerformanceMessage = () => {
  const accuracy = (correctAnswers.value / QUESTIONS_PER_ROUND) * 100
  if (accuracy >= 90) return 'あなたは語彙マスターです！'
  if (accuracy >= 80) return '素晴らしい語彙力です！'
  if (accuracy >= 70) return '順調に成長しています！'
  if (accuracy >= 60) return 'もう少しで上達します！'
  return '基礎から復習しましょう！'
}

// 画像エラーハンドリング
const handleImageError = () => {
  imageLoadError.value = true
  console.warn(`画像の読み込みに失敗しました: ${currentQuestionData.value.image}`)
}

// フォールバック絵文字の取得
const getFallbackEmoji = (word) => {
  const emojiMap = {
    'apple': '🍎',
    'book': '📚',
    'cat': '🐱',
    'computer': '💻',
    'garden': '🌺',
    'architecture': '🏛️',
    'philosophy': '🤔'
  }
  return emojiMap[word?.toLowerCase?.()] || '❓'
}

// 音声再生
const playAudio = () => {
  if ('speechSynthesis' in window) {
    isPlaying.value = true
    const utterance = new SpeechSynthesisUtterance(currentQuestionData.value.correct)
    utterance.lang = 'en-US'
    utterance.volume = audioVolume.value
    utterance.rate = 1.0
    utterance.pitch = 1.0
    
    // 音声の品質を向上させるための設定
    const voices = speechSynthesis.getVoices()
    const englishVoice = voices.find(voice => 
      voice.lang === 'en-US' && 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.name.includes('Samantha')
    )
    
    if (englishVoice) {
      utterance.voice = englishVoice
    }
    
    utterance.onend = () => {
      isPlaying.value = false
    }
    
    speechSynthesis.speak(utterance)
  }
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
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

/* Galaxy-themed components - unified */
.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.8) 50%, 
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.galaxy-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan-line 2s linear infinite;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* ホバーエフェクト */
button:hover {
  transform: translateY(-2px);
}

/* 回答ボタンの特別エフェクト */
.answer-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 正解アニメーション */
@keyframes celebration {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
  }
  50% {
    transform: scale(1.05) rotate(-3deg);
  }
  75% {
    transform: scale(1.08) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.celebration {
  animation: celebration 0.6s ease-in-out;
}

/* 不正解シェイク */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-8px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(8px);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

/* タイマー警告 */
.timer-warning {
  animation: pulse 0.5s ease-in-out infinite;
  background: linear-gradient(45deg, #ef4444, #dc2626) !important;
}

/* スコア増加アニメーション */
@keyframes scoreIncrease {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.score-increase {
  animation: scoreIncrease 0.3s ease-out;
}

/* ストリークエフェクト */
@keyframes streakGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(249, 115, 22, 0.8);
  }
}

.streak-glow {
  animation: streakGlow 1s ease-in-out infinite;
}

/* レスポンシブ調整 */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .answer-button {
    padding: 1rem;
    font-size: 1.1rem;
  }
  
  .text-8xl {
    font-size: 4rem;
  }
}

/* ダークモード対応準備 */
@media (prefers-color-scheme: dark) {
  .bg-white\/95 {
    background: rgba(31, 41, 55, 0.95);
  }
  
  .text-gray-800 {
    color: rgb(229, 231, 235);
  }
  
  .text-gray-600 {
    color: rgb(156, 163, 175);
  }
}

/* 画像のフェードインアニメーション */
img {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

img.loaded {
  opacity: 1;
}
</style>

    // 