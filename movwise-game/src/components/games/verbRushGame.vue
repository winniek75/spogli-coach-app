<!-- src/components/games/VerbRush.vue - 一般動詞マスターゲーム -->
<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden" :class="containerClasses">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- ゲームヘッダー -->
    <div class="relative z-10 galaxy-card p-4 mb-6">
      <div class="flex justify-between items-center">
        <button 
          @click="handleBackButton"
          @mousedown="playClick"
          class="galaxy-button galaxy-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          戻る
        </button>
        
        <div class="text-center">
          <h1 class="text-3xl font-bold galaxy-text-primary cosmic-glow">🏃‍♂️ Verb Rush</h1>
          <p class="text-galaxy-moon-silver text-sm">一般動詞の変化をマスターしよう！</p>
        </div>
      
        <div class="flex items-center gap-2">
          <button 
            v-if="gameState === 'playing' || gameState === 'paused'"
            @click="togglePause"
            @mousedown="playClick"
            class="galaxy-button galaxy-button-secondary"
          >
            <PauseIcon v-if="gameState === 'playing'" class="w-5 h-5" />
            <PlayIcon v-else class="w-5 h-5" />
          </button>
          
          <!-- 音響ON/OFF切り替えボタン -->
          <button 
            @click="toggleSound"
            @mousedown="playClick"
            class="galaxy-button"
            :class="soundEnabled ? 'galaxy-button-primary' : 'galaxy-button-secondary'"
          >
            <SpeakerWaveIcon v-if="soundEnabled" class="w-5 h-5" />
            <SpeakerXMarkIcon v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- ゲーム統計バー -->
    <div class="relative z-10 galaxy-card p-4 mb-6" v-if="gameState !== 'waiting'">
      <div class="flex justify-center items-center gap-6">
        <div class="flex items-center gap-2 text-galaxy-moon-silver">
          <ClockIcon class="w-4 h-4 cosmic-glow" />
          <span class="font-bold text-white">{{ timeRemainingSeconds }}s</span>
        </div>
        
        <div class="flex items-center gap-1">
          <HeartIcon 
            v-for="n in maxLives" 
            :key="n"
            class="w-5 h-5"
            :class="n <= currentLives ? 'text-red-500 cosmic-glow' : 'text-gray-400'"
          />
        </div>
        
        <div class="flex items-center gap-2 text-galaxy-moon-silver">
          <span>Score:</span>
          <span class="font-bold text-yellow-400 cosmic-glow">{{ currentScore.toLocaleString() }}</span>
        </div>
        
        <div class="flex items-center gap-2 text-galaxy-moon-silver" v-if="currentCombo > 0">
          <span>Combo:</span>
          <span class="font-bold text-orange-400 cosmic-glow">x{{ currentCombo }}</span>
        </div>

        <!-- 現在のゲームモード表示 -->
        <div class="flex items-center gap-2 text-galaxy-moon-silver">
          <span class="text-sm">Mode:</span>
          <span class="font-bold text-purple-400 cosmic-glow">{{ currentGameMode.name }}</span>
        </div>
      </div>
    </div>

    <!-- メインゲームエリア -->
    <div class="relative z-10 flex-1 h-full" ref="gameArea" style="min-height: calc(100vh - 200px);">
      <!-- 待機画面 -->
      <div v-if="gameState === 'waiting'" class="flex items-center justify-center min-h-[60vh]">
        <div class="galaxy-card p-8 text-center max-w-2xl mx-auto">
          <div class="text-6xl mb-6 cosmic-glow">🏃‍♂️</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-4">Verb Rush</h2>
          <p class="text-galaxy-moon-silver mb-8 leading-relaxed">
            一般動詞の変化パターンを習得しよう！<br>
            主語に応じた正しい動詞の形を素早く選択して高得点を狙え！
          </p>

          <!-- 難易度レベル選択 -->
          <div class="galaxy-card p-6 mb-6">
            <h3 class="text-lg font-bold galaxy-text-primary cosmic-glow mb-4">🎯 難易度レベル</h3>
            <div class="grid grid-cols-3 gap-4 mb-6">
              <button 
                v-for="(settings, level) in LEVEL_SETTINGS" 
                :key="level"
                @click="selectedLevel = level"
                @mousedown="playClick"
                class="galaxy-button p-4 text-center transition-all"
                :class="selectedLevel === level ? 'galaxy-button-primary' : 'galaxy-button-secondary'"
              >
                <div class="text-3xl mb-2">{{ settings.icon }}</div>
                <div class="text-sm font-bold">{{ settings.name }}</div>
                <div class="text-xs text-galaxy-moon-silver">{{ settings.description }}</div>
              </button>
            </div>
          </div>
          
          <!-- ゲームモード選択 -->
          <div class="galaxy-card p-6 mb-6">
            <h3 class="text-lg font-bold galaxy-text-primary cosmic-glow mb-4">ゲームモード選択</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                v-for="mode in gameModes"
                :key="mode.id"
                @click="selectedMode = mode.id"
                @mousedown="playClick"
                class="galaxy-button p-4 text-left transition-all duration-300"
                :class="selectedMode === mode.id ? 'galaxy-button-primary' : 'galaxy-button-secondary'"
              >
                <div class="text-2xl mb-2">{{ mode.icon }}</div>
                <div class="font-bold text-white">{{ mode.name }}</div>
                <div class="text-sm text-galaxy-moon-silver opacity-80">{{ mode.description }}</div>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="galaxy-card p-4 text-center">
              <span class="block text-2xl font-bold text-yellow-400 cosmic-glow">{{ persistentData.bestScore.toLocaleString() }}</span>
              <span class="text-galaxy-moon-silver text-sm">最高スコア</span>
            </div>
            <div class="galaxy-card p-4 text-center">
              <span class="block text-2xl font-bold text-blue-400 cosmic-glow">{{ overallAccuracy }}%</span>
              <span class="text-galaxy-moon-silver text-sm">総合正答率</span>
            </div>
            <div class="galaxy-card p-4 text-center">
              <span class="block text-2xl font-bold text-purple-400 cosmic-glow">{{ persistentData.mastery }}%</span>
              <span class="text-galaxy-moon-silver text-sm">習熟度</span>
            </div>
          </div>
          
          <!-- 音響テストボタン -->
          <div class="galaxy-card p-6 mb-6">
            <button @click="testAllSounds" @mousedown="playClick" class="galaxy-button galaxy-button-secondary mb-4">
              🎵 音響テスト
            </button>
            <div class="flex items-center gap-3 text-galaxy-moon-silver">
              <span>音量:</span>
              <input 
                type="range" 
                :value="volume * 100" 
                @input="setVolume($event.target.value / 100)"
                min="0" 
                max="100" 
                class="flex-1"
              />
              <span class="text-white font-bold">{{ Math.round(volume * 100) }}%</span>
            </div>
          </div>
          
          <button @click="startNewGame" @mousedown="playClick" class="galaxy-button galaxy-button-primary px-8 py-4 text-xl font-bold">
            <PlayIcon class="w-6 h-6" />
            ゲーム開始
          </button>
        </div>
      </div>

      <!-- カウントダウン画面 -->
      <div v-else-if="gameState === 'countdown'" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <div class="text-8xl font-bold galaxy-text-primary cosmic-glow mb-6">{{ countdownNumber }}</div>
          <div class="text-2xl text-galaxy-moon-silver mb-4">{{ currentGameMode.name }} モード （{{ LEVEL_SETTINGS[selectedLevel].name }}レベル）</div>
          <div class="text-lg text-galaxy-moon-silver">
            <kbd class="px-2 py-1 bg-black bg-opacity-50 rounded border text-white">1</kbd> ~ 
            <kbd class="px-2 py-1 bg-black bg-opacity-50 rounded border text-white">4</kbd> キーでも操作可能
          </div>
        </div>
      </div>

      <!-- ゲームプレイ画面 -->
      <div v-else-if="gameState === 'playing' || gameState === 'paused'" class="gameplay-screen h-full">
        <!-- 一時停止オーバーレイ -->
        <div v-if="gameState === 'paused'" class="pause-overlay">
          <div class="pause-content">
            <PauseIcon class="w-16 h-16 text-white" />
            <h3>一時停止中</h3>
            <button @click="togglePause" @mousedown="playClick" class="resume-button">
              <PlayIcon class="w-5 h-5" />
              再開
            </button>
          </div>
        </div>

        <!-- ゲームプレイエリア全体 -->
        <div class="game-play-area h-full">
          <!-- 回答選択ボタンエリア（上部固定） -->
          <div class="answer-area-top">
            <div class="verb-answer-buttons-top">
              <button 
                v-for="(option, index) in currentChallenge?.options || []"
                :key="option"
                @click="handleAnswer(option)"
                @mousedown="playClick"
                class="verb-answer-button-top"
                :class="getButtonClasses(option, index)"
                :disabled="!currentChallenge || gameState === 'paused'"
              >
                <span class="button-key">{{ index + 1 }}</span>
                <span class="button-text">{{ option }}</span>
              </button>
            </div>
          </div>

          <!-- 問題表示エリア（中央部） -->
          <div class="challenge-area" ref="challengeArea">
            <div 
              v-if="currentChallenge && showFlyingWords" 
              :key="currentChallenge.id || 'current'"
              class="flying-challenge"
              :class="getChallengeClasses()"
            >
              <!-- 主語表示 -->
              <div class="subject-display-enhanced">{{ currentChallenge.subject }}</div>
              
              <!-- 動詞（原形）表示 -->
              <div class="verb-display-enhanced">{{ currentChallenge.baseVerb }}</div>
            </div>
            
            <!-- 3D空間の奥行き感を出すためのグリッド -->
            <div class="depth-grid"></div>
            
            <!-- 中央ガイドライン -->
            <div class="center-guideline"></div>
          </div>

          <!-- 問題指示エリア（下部固定） -->
          <div class="instruction-area-bottom" v-if="showInstruction">
            <div class="challenge-instruction-fixed">
              {{ currentChallenge?.challengeText || '準備中...' }}
            </div>
          </div>
        </div>

        <!-- 進捗インジケーター -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: gameProgress + '%' }"></div>
        </div>

        <!-- フィードバック表示 -->
        <div v-if="lastFeedback" class="feedback-display" :class="lastFeedback.type">
          {{ lastFeedback.message }}
        </div>
      </div>

      <!-- ゲーム終了画面 -->
      <div v-else-if="gameState === 'finished'" class="flex items-center justify-center min-h-[60vh]">
        <div class="galaxy-card p-8 text-center max-w-2xl mx-auto">
          <div class="text-6xl mb-6 cosmic-glow">🏆</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-6">ゲーム終了！</h2>
          
          <div class="galaxy-card p-6 mb-6">
            <div class="text-center">
              <span class="block text-sm text-galaxy-moon-silver">最終スコア</span>
              <span class="block text-4xl font-bold galaxy-text-primary cosmic-glow my-2">{{ currentScore.toLocaleString() }}</span>
              <span v-if="isNewRecord" class="block text-lg font-bold text-yellow-400 cosmic-glow animate-pulse">🎉 新記録！</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="galaxy-card p-4 text-center">
              <span class="block text-xl font-bold text-green-400 cosmic-glow">{{ sessionAccuracy }}%</span>
              <span class="text-galaxy-moon-silver text-sm">正答率</span>
            </div>
            <div class="galaxy-card p-4 text-center">
              <span class="block text-xl font-bold text-orange-400 cosmic-glow">{{ maxCombo }}</span>
              <span class="text-galaxy-moon-silver text-sm">最大コンボ</span>
            </div>
            <div class="galaxy-card p-4 text-center">
              <span class="block text-xl font-bold text-blue-400 cosmic-glow">{{ averageReactionTime }}ms</span>
              <span class="text-galaxy-moon-silver text-sm">平均反応時間</span>
            </div>
            <div class="galaxy-card p-4 text-center">
              <span class="block text-xl font-bold text-purple-400 cosmic-glow">{{ sessionStats.totalAttempts }}</span>
              <span class="text-galaxy-moon-silver text-sm">総問題数</span>
            </div>
          </div>

          <!-- アチーブメント表示 -->
          <div class="galaxy-card p-6 mb-6" v-if="newAchievements.length > 0">
            <h3 class="text-lg font-bold galaxy-text-primary cosmic-glow mb-4">🎖️ 新しいアチーブメント</h3>
            <div class="space-y-2">
              <div 
                v-for="achievement in newAchievements" 
                :key="achievement"
                class="galaxy-card p-3 text-yellow-400 font-bold cosmic-glow"
              >
                {{ getAchievementName(achievement) }}
              </div>
            </div>
          </div>

          <!-- 分野別正答率 -->
          <div class="galaxy-card p-6 mb-6">
            <h3 class="text-lg font-bold galaxy-text-primary cosmic-glow mb-4">📊 分野別正答率</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <span class="block text-lg font-bold text-blue-400 cosmic-glow">{{ categoryAccuracy.thirdPerson }}%</span>
                <span class="text-galaxy-moon-silver text-sm">三人称単数</span>
              </div>
              <div class="text-center">
                <span class="block text-lg font-bold text-green-400 cosmic-glow">{{ categoryAccuracy.questions }}%</span>
                <span class="text-galaxy-moon-silver text-sm">疑問文</span>
              </div>
              <div class="text-center">
                <span class="block text-lg font-bold text-purple-400 cosmic-glow">{{ categoryAccuracy.negatives }}%</span>
                <span class="text-galaxy-moon-silver text-sm">否定文</span>
              </div>
              <div class="text-center">
                <span class="block text-lg font-bold text-orange-400 cosmic-glow">{{ categoryAccuracy.irregular }}%</span>
                <span class="text-galaxy-moon-silver text-sm">不規則動詞</span>
              </div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button @click="startNewGame" @mousedown="playClick" class="galaxy-button galaxy-button-primary flex items-center gap-2">
              <ArrowPathIcon class="w-5 h-5" />
              もう一度プレイ
            </button>
            <button @click="handleBackButton" @mousedown="playClick" class="galaxy-button galaxy-button-secondary flex items-center gap-2">
              <HomeIcon class="w-5 h-5" />
              ハブに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameSounds } from '@/composables/useGameSounds'
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  HeartIcon,
  HomeIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

// === 音響システムの初期化 ===
const {
  isEnabled: soundEnabled,
  volume,
  playWhoosh,
  playCorrect,
  playIncorrect,
  playClick,
  playCountdown,
  playGameStart,
  playGameEnd,
  playCombo,
  playWordAppear,
  playBGM,
  pauseBGM,
  stopBGM,
  playCorrectCombo,
  playNewRecord,
  setVolume,
  toggleSound,
  testAllSounds
} = useGameSounds()

// === ゲームの定数 ===
const GAME_DURATION = 90000 // 90秒
const MAX_LIVES = 3

// レベル別ゲーム設定
const LEVEL_SETTINGS = {
  beginner: {
    spawnInterval: 8000, // 8秒間隔（初級）
    challengeLifetime: 10000, // 10秒表示（初級）
    name: '初級',
    icon: '🐣',
    description: 'ゆっくり学習'
  },
  intermediate: {
    spawnInterval: 4000, // 4秒間隔（中級）
    challengeLifetime: 5000, // 5秒表示（中級）
    name: '中級',
    icon: '🚀',
    description: 'バランス良く'
  },
  advanced: {
    spawnInterval: 2800, // 2.8秒間隔（上級）
    challengeLifetime: 3500, // 3.5秒表示（上級）
    name: '上級',
    icon: '🔥',
    description: '高速チャレンジ'
  }
}

// === ゲームモード定義 ===
const gameModes = ref([
  {
    id: 'mixed',
    name: 'ミックス',
    icon: '🎯',
    description: '全パターンをランダムに出題',
    weight: 1.0
  },
  {
    id: 'thirdPerson',
    name: '三人称単数',
    icon: '🎪',
    description: 'he/she/it + 動詞s の練習',
    weight: 1.2
  },
  {
    id: 'questions',
    name: '疑問文',
    icon: '❓',
    description: 'Do/Does を使った疑問文',
    weight: 1.1
  },
  {
    id: 'negatives',
    name: '否定文',
    icon: '❌',
    description: "don't/doesn't の練習",
    weight: 1.1
  }
])

const selectedMode = ref('mixed')
const selectedLevel = ref('intermediate') // デフォルトは中級

// === 一般動詞データ（包括的） ===
const verbsData = [
  // 基本動詞（頻出・規則変化）
  { id: 1, base: "like", difficulty: 1, irregular: false },
  { id: 2, base: "want", difficulty: 1, irregular: false },
  { id: 3, base: "need", difficulty: 1, irregular: false },
  { id: 4, base: "help", difficulty: 1, irregular: false },
  { id: 5, base: "work", difficulty: 1, irregular: false },
  { id: 6, base: "play", difficulty: 1, irregular: false },
  { id: 7, base: "study", difficulty: 1, irregular: false },
  { id: 8, base: "live", difficulty: 1, irregular: false },
  { id: 9, base: "love", difficulty: 1, irregular: false },
  { id: 10, base: "watch", difficulty: 1, irregular: false },
  
  // 中級動詞（やや複雑な変化）
  { id: 11, base: "try", difficulty: 2, irregular: false },
  { id: 12, base: "carry", difficulty: 2, irregular: false },
  { id: 13, base: "worry", difficulty: 2, irregular: false },
  { id: 14, base: "finish", difficulty: 2, irregular: false },
  { id: 15, base: "teach", difficulty: 2, irregular: false },
  { id: 16, base: "wash", difficulty: 2, irregular: false },
  { id: 17, base: "fix", difficulty: 2, irregular: false },
  { id: 18, base: "kiss", difficulty: 2, irregular: false },
  { id: 19, base: "miss", difficulty: 2, irregular: false },
  { id: 20, base: "pass", difficulty: 2, irregular: false },
  
  // 不規則動詞（重要）
  { id: 21, base: "have", difficulty: 3, irregular: true, thirdPerson: "has" },
  { id: 22, base: "do", difficulty: 3, irregular: true, thirdPerson: "does" },
  { id: 23, base: "go", difficulty: 3, irregular: true, thirdPerson: "goes" },
  { id: 24, base: "say", difficulty: 3, irregular: true, thirdPerson: "says" },
  { id: 25, base: "get", difficulty: 3, irregular: true, thirdPerson: "gets" },
  { id: 26, base: "make", difficulty: 3, irregular: true, thirdPerson: "makes" },
  { id: 27, base: "come", difficulty: 3, irregular: true, thirdPerson: "comes" },
  { id: 28, base: "take", difficulty: 3, irregular: true, thirdPerson: "takes" },
  
  // 上級動詞（複雑な変化・高度な語彙）
  { id: 29, base: "enjoy", difficulty: 3, irregular: false },
  { id: 30, base: "remember", difficulty: 3, irregular: false },
  { id: 31, base: "understand", difficulty: 3, irregular: false },
  { id: 32, base: "recognize", difficulty: 3, irregular: false },
  { id: 33, base: "appreciate", difficulty: 3, irregular: false },
  { id: 34, base: "communicate", difficulty: 3, irregular: false },
  { id: 35, base: "participate", difficulty: 3, irregular: false },
  { id: 36, base: "concentrate", difficulty: 3, irregular: false }
]

// === 主語データ ===
const subjects = [
  // 一人称・二人称（原形使用）
  { id: 1, text: "I", person: "first", requiresS: false, difficulty: 1 },
  { id: 2, text: "You", person: "second", requiresS: false, difficulty: 1 },
  { id: 3, text: "We", person: "first", requiresS: false, difficulty: 2 },
  { id: 4, text: "They", person: "third", requiresS: false, difficulty: 2 },
  
  // 三人称単数（動詞にsが必要）
  { id: 5, text: "He", person: "third", requiresS: true, difficulty: 1 },
  { id: 6, text: "She", person: "third", requiresS: true, difficulty: 1 },
  { id: 7, text: "It", person: "third", requiresS: true, difficulty: 1 },
  { id: 8, text: "Tom", person: "third", requiresS: true, difficulty: 2 },
  { id: 9, text: "My sister", person: "third", requiresS: true, difficulty: 2 },
  { id: 10, text: "The cat", person: "third", requiresS: true, difficulty: 2 },
  { id: 11, text: "My friend", person: "third", requiresS: true, difficulty: 3 },
  { id: 12, text: "Everyone", person: "third", requiresS: true, difficulty: 3 },
  
  // 複雑な主語（上級レベル用）
  { id: 13, text: "My younger brother", person: "third", requiresS: true, difficulty: 3 },
  { id: 14, text: "The teacher in our school", person: "third", requiresS: true, difficulty: 3 },
  { id: 15, text: "Each student", person: "third", requiresS: true, difficulty: 3 },
  { id: 16, text: "Nobody", person: "third", requiresS: true, difficulty: 3 },
  { id: 17, text: "The children and their parents", person: "third", requiresS: false, difficulty: 3 },
  { id: 18, text: "My classmates", person: "third", requiresS: false, difficulty: 3 },
  { id: 19, text: "Both of them", person: "third", requiresS: false, difficulty: 3 },
  { id: 20, text: "All of us", person: "first", requiresS: false, difficulty: 3 }
]

// === リアクティブな状態 ===
const gameState = ref('waiting')
const currentScore = ref(0)
const currentLives = ref(MAX_LIVES)
const timeRemaining = ref(GAME_DURATION)
const currentCombo = ref(0)
const maxCombo = ref(0)
const currentChallenge = ref(null)
const maxLives = ref(MAX_LIVES)

const sessionStats = reactive({
  totalAttempts: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  averageReactionTime: 0,
  reactionTimes: [],
  categoryStats: {
    thirdPerson: { correct: 0, total: 0 },
    questions: { correct: 0, total: 0 },
    negatives: { correct: 0, total: 0 },
    irregular: { correct: 0, total: 0 }
  }
})

const persistentData = reactive({
  bestScore: 0,
  totalGamesPlayed: 0,
  totalCorrectAnswers: 0,
  totalQuestions: 0,
  mastery: 0,
  achievements: []
})

// === UI状態 ===
const countdownNumber = ref(3)
const lastFeedback = ref(null)
const feedbackTimeout = ref(null)
const isNewRecord = ref(false)
const challengeStartTime = ref(null)
const newAchievements = ref([])

// === 段階的表示用状態 ===
const showInstruction = ref(false)
const showFlyingWords = ref(false)
const instructionTimer = ref(null)

// === ゲームタイマー ===
const gameTimer = ref(null)
const spawnTimer = ref(null)

// === テンプレート参照 ===
const gameArea = ref(null)
const challengeArea = ref(null)

// === 計算されたプロパティ ===
const containerClasses = computed(() => ({
  'game-playing': gameState.value === 'playing',
  'game-paused': gameState.value === 'paused',
  'game-finished': gameState.value === 'finished'
}))

const currentGameMode = computed(() => {
  return gameModes.value.find(mode => mode.id === selectedMode.value) || gameModes.value[0]
})

const timeRemainingSeconds = computed(() => {
  return Math.max(0, Math.ceil(timeRemaining.value / 1000))
})

const gameProgress = computed(() => {
  return Math.min(100, ((GAME_DURATION - timeRemaining.value) / GAME_DURATION) * 100)
})

const sessionAccuracy = computed(() => {
  if (sessionStats.totalAttempts === 0) return 100
  return Math.round((sessionStats.correctAnswers / sessionStats.totalAttempts) * 100)
})

const overallAccuracy = computed(() => {
  if (persistentData.totalQuestions === 0) return 0
  return Math.round((persistentData.totalCorrectAnswers / persistentData.totalQuestions) * 100)
})

const averageReactionTime = computed(() => {
  if (sessionStats.reactionTimes.length === 0) return 0
  const avg = sessionStats.reactionTimes.reduce((a, b) => a + b, 0) / sessionStats.reactionTimes.length
  return Math.round(avg)
})

const categoryAccuracy = computed(() => {
  const categories = sessionStats.categoryStats
  const getAccuracy = (category) => {
    if (category.total === 0) return 0
    return Math.round((category.correct / category.total) * 100)
  }
  
  return {
    thirdPerson: getAccuracy(categories.thirdPerson),
    questions: getAccuracy(categories.questions),
    negatives: getAccuracy(categories.negatives),
    irregular: getAccuracy(categories.irregular)
  }
})

// === 動詞変化ユーティリティ関数 ===
const getVerbForm = (verb, subject, tense = 'present', isQuestion = false, isNegative = false) => {
  try {
    // 疑問文の場合
    if (isQuestion) {
      if (subject.requiresS) {
        return verb.irregular && verb.base === 'do' ? 'Does' : 'Does'
      } else {
        return 'Do'
      }
    }
    
    // 否定文の場合
    if (isNegative) {
      if (subject.requiresS) {
        return "doesn't"
      } else {
        return "don't"
      }
    }
    
    // 肯定文（三人称単数の場合）
    if (subject.requiresS) {
      if (verb.irregular && verb.thirdPerson) {
        return verb.thirdPerson
      }
      
      // 規則変化
      const base = verb.base
      if (base.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(ending => base.endsWith(ending))) {
        return base.slice(0, -1) + 'ies'
      } else if (base.endsWith('s') || base.endsWith('sh') || base.endsWith('ch') || base.endsWith('x') || base.endsWith('z')) {
        return base + 'es'
      } else if (base.endsWith('o')) {
        return base + 'es'
      } else {
        return base + 's'
      }
    }
    
   // その他（原形）
    return verb.base
  } catch (error) {
    console.error('Verb form generation error:', error)
    return verb.base
  }
}

// === チャレンジ生成関数 ===
const generateChallenge = () => {
  try {
    // レベル別の難易度設定
    let maxDifficulty = 1
    if (selectedLevel.value === 'beginner') {
      maxDifficulty = 1 // 初級は難易度1のみ
    } else if (selectedLevel.value === 'intermediate') {
      maxDifficulty = 2 // 中級は難易度1-2
    } else if (selectedLevel.value === 'advanced') {
      maxDifficulty = 3 // 上級は難易度1-3
    }
    
    // 利用可能な動詞と主語をフィルタリング
    const availableVerbs = verbsData.filter(v => v.difficulty <= maxDifficulty)
    const availableSubjects = subjects.filter(s => s.difficulty <= maxDifficulty)
    
    const verb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)]
    const subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)]
    
    // チャレンジタイプを選択（モードに基づく）
    let challengeTypes = []
    
    if (selectedMode.value === 'mixed') {
      challengeTypes = ['affirmative', 'question', 'negative']
    } else if (selectedMode.value === 'thirdPerson') {
      challengeTypes = ['affirmative']
      // 三人称単数の主語のみ使用
      const thirdPersonSubjects = subjects.filter(s => s.requiresS && s.difficulty <= maxDifficulty)
      if (thirdPersonSubjects.length > 0) {
        const randomSubject = thirdPersonSubjects[Math.floor(Math.random() * thirdPersonSubjects.length)]
        const challenge = createAffirmativeChallenge(verb, randomSubject)
        return challenge
      }
    } else if (selectedMode.value === 'questions') {
      challengeTypes = ['question']
    } else if (selectedMode.value === 'negatives') {
      challengeTypes = ['negative']
    }
    
    const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)]
    
    switch (challengeType) {
      case 'affirmative':
        return createAffirmativeChallenge(verb, subject)
      case 'question':
        return createQuestionChallenge(verb, subject)
      case 'negative':
        return createNegativeChallenge(verb, subject)
      default:
        return createAffirmativeChallenge(verb, subject)
    }
  } catch (error) {
    console.error('Challenge generation error:', error)
    return null
  }
}

// === 肯定文チャレンジ ===
const createAffirmativeChallenge = (verb, subject) => {
  const correctAnswer = getVerbForm(verb, subject)
  const options = [correctAnswer]
  
  // 間違いの選択肢を生成
  if (subject.requiresS) {
    // 三人称単数なので、原形（間違い）を追加
    if (!options.includes(verb.base)) {
      options.push(verb.base)
    }
    // 他の間違った形も追加
    if (verb.base !== 'have' && !options.includes(verb.base + 'es')) {
      options.push(verb.base + 'es')
    }
  } else {
    // 三人称単数以外なので、s形（間違い）を追加
    const wrongForm = verb.irregular && verb.thirdPerson ? verb.thirdPerson : verb.base + 's'
    if (!options.includes(wrongForm)) {
      options.push(wrongForm)
    }
  }
  
  // さらに選択肢を追加
  while (options.length < 4) {
    const randomVerb = verbsData[Math.floor(Math.random() * verbsData.length)]
    const randomForm = getVerbForm(randomVerb, subject)
    if (!options.includes(randomForm)) {
      options.push(randomForm)
    }
  }
  
  // 選択肢をシャッフル
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)
  
  return {
    id: `challenge_${Date.now()}`,
    type: 'affirmative',
    subject: subject.text,
    baseVerb: verb.base,
    correctAnswer,
    options: shuffledOptions,
    challengeText: `「${subject.text}」の時、「${verb.base}」はどんな形になる？`,
    difficulty: Math.max(verb.difficulty, subject.difficulty),
    category: subject.requiresS ? 'thirdPerson' : 'regular',
    spawnTime: Date.now()
  }
}

// === 疑問文チャレンジ ===
const createQuestionChallenge = (verb, subject) => {
  const correctAnswer = subject.requiresS ? 'Does' : 'Do'
  const options = ['Do', 'Does']
  
  // さらに選択肢を追加
  if (!options.includes("Don't")) {
    options.push("Don't")
  }
  if (!options.includes("Doesn't")) {
    options.push("Doesn't")
  }
  
  // 選択肢をシャッフル
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)
  
  return {
    id: `challenge_${Date.now()}`,
    type: 'question',
    subject: subject.text,
    baseVerb: verb.base,
    correctAnswer,
    options: shuffledOptions,
    challengeText: `疑問文を作ろう！\n「___ ${subject.text.toLowerCase()} ${verb.base}?」\n正しい単語は？`,
    difficulty: Math.max(verb.difficulty, subject.difficulty),
    category: 'questions',
    spawnTime: Date.now()
  }
}

// === 否定文チャレンジ ===
const createNegativeChallenge = (verb, subject) => {
  const correctAnswer = subject.requiresS ? "doesn't" : "don't"
  const options = ["don't", "doesn't"]
  
  // さらに選択肢を追加
  if (!options.includes('Do')) {
    options.push('Do')
  }
  if (!options.includes('Does')) {
    options.push('Does')
  }
  
  // 選択肢をシャッフル
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)
  
  return {
    id: `challenge_${Date.now()}`,
    type: 'negative',
    subject: subject.text,
    baseVerb: verb.base,
    correctAnswer,
    options: shuffledOptions,
    challengeText: `否定文を作ろう！\n「${subject.text} ___ ${verb.base}.」\n正しい単語は？`,
    difficulty: Math.max(verb.difficulty, subject.difficulty),
    category: 'negatives',
    spawnTime: Date.now()
  }
}

// === ゲーム制御メソッド ===
const resetGameSession = () => {
  try {
    clearTimers()
    
    currentScore.value = 0
    currentLives.value = MAX_LIVES
    timeRemaining.value = GAME_DURATION
    currentCombo.value = 0
    maxCombo.value = 0
    currentChallenge.value = null
    lastFeedback.value = null
    isNewRecord.value = false
    newAchievements.value = []
    
    // 段階的表示状態をリセット
    showInstruction.value = false
    showFlyingWords.value = false
    
    // セッション統計リセット
    Object.assign(sessionStats, {
      totalAttempts: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageReactionTime: 0,
      reactionTimes: [],
      categoryStats: {
        thirdPerson: { correct: 0, total: 0 },
        questions: { correct: 0, total: 0 },
        negatives: { correct: 0, total: 0 },
        irregular: { correct: 0, total: 0 }
      }
    })
    
    console.log('✅ Game session reset')
  } catch (error) {
    console.error('Reset game session error:', error)
  }
}

const startNewGame = async () => {
  try {
    console.log('🎮 Starting new game...', 'Mode:', selectedMode.value)
    
    resetGameSession()
    gameState.value = 'countdown'
    
    // BGM開始
    if (soundEnabled.value) {
      await playBGM()
    }
    
    // カウントダウン実行
    countdownNumber.value = 3
    if (soundEnabled.value) {
      await playCountdown()
    }
    
    const countdownInterval = setInterval(async () => {
      countdownNumber.value--
      if (soundEnabled.value) {
        await playCountdown()
      }
      
      if (countdownNumber.value <= 0) {
        clearInterval(countdownInterval)
        
        // ゲーム開始
        gameState.value = 'playing'
        if (soundEnabled.value) {
          await playGameStart()
        }
        startGameTimer()
        spawnNextChallenge()
        console.log('🎯 Game started!')
      }
    }, 1000)
    
  } catch (error) {
    console.error('Start new game error:', error)
    gameState.value = 'waiting'
  }
}

const clearTimers = () => {
  try {
    if (gameTimer.value) {
      clearInterval(gameTimer.value)
      gameTimer.value = null
    }
    if (spawnTimer.value) {
      clearTimeout(spawnTimer.value)
      spawnTimer.value = null
    }
    if (instructionTimer.value) {
      clearTimeout(instructionTimer.value)
      instructionTimer.value = null
    }
  } catch (error) {
    console.warn('Clear timers error:', error)
  }
}

const startGameTimer = () => {
  try {
    clearTimers()
    
    gameTimer.value = setInterval(() => {
      if (gameState.value === 'playing') {
        timeRemaining.value = Math.max(0, timeRemaining.value - 100)
        
        if (timeRemaining.value <= 0) {
          endGame()
        }
      }
    }, 100)
  } catch (error) {
    console.error('Start game timer error:', error)
  }
}

const spawnNextChallenge = () => {
  try {
    if (gameState.value !== 'playing') return
    
    const challenge = generateChallenge()
    if (!challenge) {
      console.error('Failed to generate challenge')
      return
    }
    
    currentChallenge.value = challenge
    challengeStartTime.value = Date.now()
    
    console.log('📝 New challenge spawned:', challenge.type, challenge.subject, challenge.baseVerb)
    
    // 段階的表示をリセット
    showInstruction.value = false
    showFlyingWords.value = false
    
    // タイマーをクリア
    if (instructionTimer.value) {
      clearTimeout(instructionTimer.value)
      instructionTimer.value = null
    }
    
    // 第1段階: 問題指示を先に表示
    showInstruction.value = true
    
    // 第2段階: 1.5秒後に単語を飛来させる
    instructionTimer.value = setTimeout(() => {
      showFlyingWords.value = true
      
      // 音を再生（単語が飛来するタイミング）
      if (soundEnabled.value) {
        playWordAppear(challenge.difficulty)
      }
      
      // ランダムな飛び方向を設定
      setTimeout(() => {
        const challengeElement = document.querySelector('.flying-challenge')
        if (challengeElement) {
          const randomX = (Math.random() - 0.5) * 800
          const randomY = (Math.random() - 0.5) * 600
          
          challengeElement.style.setProperty('--random-x', `${randomX}px`)
          challengeElement.style.setProperty('--random-y', `${randomY}px`)
        }
      }, 50)
    }, 1500) // 1.5秒待機
    
    // レベル別設定を取得
    const currentLevelSettings = LEVEL_SETTINGS[selectedLevel.value]
    
    // チャレンジのタイムアウト処理（レベル別時間）
    const timeoutId = setTimeout(() => {
      if (currentChallenge.value && currentChallenge.value.id === challenge.id) {
        console.log('⏰ Challenge timeout')
        handleChallengeTimeout()
      }
    }, currentLevelSettings.challengeLifetime)
    
    // チャレンジにタイムアウトIDを保存（正解時にクリアするため）
    currentChallenge.value.timeoutId = timeoutId
    
    // 次のチャレンジをスケジュール（レベル別間隔）
    spawnTimer.value = setTimeout(() => {
      spawnNextChallenge()
    }, currentLevelSettings.spawnInterval)
    
  } catch (error) {
    console.error('Spawn next challenge error:', error)
  }
}

const handleAnswer = (selectedAnswer) => {
  try {
    if (!currentChallenge.value || gameState.value !== 'playing') {
      console.warn('Cannot handle answer - invalid state')
      return
    }
    
    // タイムアウトをクリア
    if (currentChallenge.value.timeoutId) {
      clearTimeout(currentChallenge.value.timeoutId)
    }
    
    const reactionTime = Date.now() - challengeStartTime.value
    const isCorrect = selectedAnswer === currentChallenge.value.correctAnswer
    
    // 統計更新
    sessionStats.totalAttempts++
    sessionStats.reactionTimes.push(reactionTime)
    sessionStats.averageReactionTime = sessionStats.reactionTimes.reduce((a, b) => a + b, 0) / sessionStats.reactionTimes.length
    
    // カテゴリ別統計更新
    const category = currentChallenge.value.category
    if (sessionStats.categoryStats[category]) {
      sessionStats.categoryStats[category].total++
      if (isCorrect) {
        sessionStats.categoryStats[category].correct++
      }
    }
    
    // 不規則動詞の統計
    const verb = verbsData.find(v => v.base === currentChallenge.value.baseVerb)
    if (verb && verb.irregular) {
      sessionStats.categoryStats.irregular.total++
      if (isCorrect) {
        sessionStats.categoryStats.irregular.correct++
      }
    }
    
    if (isCorrect) {
      handleCorrectAnswer(reactionTime)
      sessionStats.correctAnswers++
      
      // 正解音（コンボ考慮）
      if (soundEnabled.value) {
        playCorrectCombo(currentCombo.value)
      }
      
      // 正解時は問題を即座に消去（成功エフェクト付き）
      const challengeElement = document.querySelector('.flying-challenge')
      if (challengeElement) {
        challengeElement.style.animation = 'correctAnswer 0.5s ease-out forwards'
      }
    } else {
      handleIncorrectAnswer()
      sessionStats.incorrectAnswers++
      
      // 不正解音
      if (soundEnabled.value) {
        playIncorrect()
      }
      
      // 不正解時も問題を消去（失敗エフェクト付き）
      const challengeElement = document.querySelector('.flying-challenge')
      if (challengeElement) {
        challengeElement.style.animation = 'incorrectAnswer 0.5s ease-out forwards'
      }
    }
    
    showFeedback(isCorrect, selectedAnswer, currentChallenge.value.correctAnswer, currentChallenge.value.type)
    
    // 現在のチャレンジをクリア
    currentChallenge.value = null
    
    console.log(`📊 Answer: ${selectedAnswer} - ${isCorrect ? 'Correct' : 'Incorrect'}`)
    
  } catch (error) {
    console.error('Handle answer error:', error)
  }
}

const handleCorrectAnswer = (reactionTime) => {
  try {
    currentCombo.value++
    if (currentCombo.value > maxCombo.value) {
      maxCombo.value = currentCombo.value
    }
    
    // スコア計算
    const baseScore = (currentChallenge.value.difficulty || 1) * 15
    const comboBonus = Math.floor(currentCombo.value / 5) * 10
    const timeBonus = reactionTime < 1000 ? 15 : reactionTime < 2000 ? 10 : reactionTime < 3000 ? 5 : 0
    const modeBonus = Math.floor(baseScore * ((currentGameMode.value.weight || 1.0) - 1.0))
    const totalScore = baseScore + comboBonus + timeBonus + modeBonus
    
    currentScore.value += totalScore
    
    console.log(`🎯 Correct! +${totalScore} (base:${baseScore}, combo:${comboBonus}, time:${timeBonus}, mode:${modeBonus})`)
    
  } catch (error) {
    console.error('Handle correct answer error:', error)
  }
}

const handleIncorrectAnswer = () => {
  try {
    currentCombo.value = 0
    currentLives.value = Math.max(0, currentLives.value - 1)
    
    if (currentLives.value <= 0) {
      endGame()
    }
    
  } catch (error) {
    console.error('Handle incorrect answer error:', error)
  }
}

const handleChallengeTimeout = () => {
  try {
    if (currentChallenge.value) {
      console.log('⏰ Challenge timeout')
      handleIncorrectAnswer()
      currentChallenge.value = null
    }
  } catch (error) {
    console.error('Handle challenge timeout error:', error)
  }
}

const showFeedback = (isCorrect, selected, correct, challengeType) => {
  try {
    if (feedbackTimeout.value) {
      clearTimeout(feedbackTimeout.value)
    }
    
    let message = ''
    if (isCorrect) {
      const encouragements = ['正解！', 'いいね！', '素晴らしい！', '完璧！', 'グッド！']
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
      message = `${randomEncouragement} ${selected}`
    } else {
      let explanation = ''
      switch (challengeType) {
        case 'affirmative':
          explanation = '三人称単数には動詞にsを付けます'
          break
        case 'question':
          explanation = '三人称単数にはDoes、その他にはDoを使います'
          break
        case 'negative':
          explanation = "三人称単数にはdoesn't、その他にはdon'tを使います"
          break
      }
      message = `不正解！正解は「${correct}」\n${explanation}`
    }
    
    lastFeedback.value = {
      type: isCorrect ? 'correct' : 'incorrect',
      message
    }
    
    feedbackTimeout.value = setTimeout(() => {
      lastFeedback.value = null
    }, 2000)
    
  } catch (error) {
    console.error('Show feedback error:', error)
  }
}

const endGame = () => {
  try {
    console.log('🏁 Game ended')
    
    gameState.value = 'finished'
    clearTimers()
    
    // BGM停止
    if (soundEnabled.value) {
      stopBGM()
    }
    
    // 新記録チェック
    if (currentScore.value > persistentData.bestScore) {
      persistentData.bestScore = currentScore.value
      isNewRecord.value = true
      
      // 新記録音
      if (soundEnabled.value) {
        setTimeout(() => playNewRecord(), 500)
      }
    } else {
      // 通常のゲーム終了音
      if (soundEnabled.value) {
        playGameEnd()
      }
    }
    
    // 永続データ更新
    persistentData.totalGamesPlayed++
    persistentData.totalCorrectAnswers += sessionStats.correctAnswers
    persistentData.totalQuestions += sessionStats.totalAttempts
    
    if (persistentData.totalQuestions > 0) {
      persistentData.mastery = Math.round((persistentData.totalCorrectAnswers / persistentData.totalQuestions) * 100)
    }
    
    // アチーブメントチェック
    newAchievements.value = checkAchievements()
    
    saveProgress()
    
  } catch (error) {
    console.error('End game error:', error)
  }
}

const togglePause = () => {
  try {
    if (gameState.value === 'playing') {
      gameState.value = 'paused'
      clearTimers()
      if (soundEnabled.value) {
        pauseBGM()
      }
    } else if (gameState.value === 'paused') {
      gameState.value = 'playing'
      startGameTimer()
      if (soundEnabled.value) {
        playBGM()
      }
      
      if (!currentChallenge.value) {
        spawnNextChallenge()
      }
    }
  } catch (error) {
    console.error('Toggle pause error:', error)
  }
}

// === ユーティリティメソッド ===
const getChallengeClasses = () => {
  try {
    return {
      'flying-in': true,
      [`difficulty-${currentChallenge.value?.difficulty || 1}`]: true,
      [`type-${currentChallenge.value?.type || 'mixed'}`]: true
    }
  } catch (error) {
    console.warn('Get challenge classes error:', error)
    return { 'flying-in': true, 'difficulty-1': true, 'type-mixed': true }
  }
}

const getButtonClasses = (option, index) => {
  try {
    return {
      'verb-answer-button-top': true,
      [`option-${index}`]: true,
      [`answer-${option.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`]: true,
      'disabled': !currentChallenge.value || gameState.value === 'paused'
    }
  } catch (error) {
    console.warn('Get button classes error:', error)
    return { 'verb-answer-button-top': true }
  }
}

const handleBackButton = () => {
  try {
    console.log('Back button clicked, gameState:', gameState.value)
    
    if (gameState.value === 'playing') {
      if (confirm('ゲームを中断して戻りますか？')) {
        clearTimers()
        if (soundEnabled.value) {
          stopBGM()
        }
        navigateToHub()
      }
    } else {
      navigateToHub()
    }
  } catch (error) {
    console.error('Back button error:', error)
    navigateToHub()
  }
}

const navigateToHub = () => {
  try {
    console.log('Navigating to grammar galaxy hub...')
    
    // 第一選択肢: nameでナビゲーション
    router.push({ name: 'grammar-galaxy-hub' })
      .then(() => {
        console.log('Navigation successful')
      })
      .catch((err) => {
        console.warn('Navigation by name failed:', err)
        
        // 第二選択肢: pathでナビゲーション
        router.push('/grammar-galaxy')
          .then(() => {
            console.log('Navigation by path successful')
          })
          .catch((err2) => {
            console.error('Navigation by path also failed:', err2)
            
            // 第三選択肢: 直接 URL 変更
            window.location.href = '/grammar-galaxy'
          })
      })
  } catch (error) {
    console.error('Navigate to hub error:', error)
    // フォールバック: 直接 URL 変更
    window.location.href = '/grammar-galaxy'
  }
}

const checkAchievements = () => {
  try {
    const achievements = []
    const currentAchievements = persistentData.achievements || []
    
    // スコア関連
    if (currentScore.value >= 1500 && !currentAchievements.includes('verb_bronze_master')) {
      achievements.push('verb_bronze_master')
    }
    if (currentScore.value >= 3000 && !currentAchievements.includes('verb_silver_master')) {
      achievements.push('verb_silver_master')
    }
    if (currentScore.value >= 4500 && !currentAchievements.includes('verb_gold_master')) {
      achievements.push('verb_gold_master')
    }
    
    // 精度関連
    if (sessionAccuracy.value >= 95 && sessionStats.totalAttempts >= 15 && !currentAchievements.includes('verb_perfectionist')) {
      achievements.push('verb_perfectionist')
    }
    
    // 速度関連
    if (sessionStats.averageReactionTime < 800 && sessionStats.reactionTimes.length >= 15 && !currentAchievements.includes('verb_speed_demon')) {
      achievements.push('verb_speed_demon')
    }
    
    // コンボ関連
    if (maxCombo.value >= 25 && !currentAchievements.includes('verb_combo_master')) {
      achievements.push('verb_combo_master')
    }
    
    // パーフェクト
    if (sessionStats.incorrectAnswers === 0 && sessionStats.totalAttempts >= 25 && !currentAchievements.includes('verb_no_mistake')) {
      achievements.push('verb_no_mistake')
    }
    
    // 新規アチーブメント追加
    achievements.forEach(achievement => {
      if (!currentAchievements.includes(achievement)) {
        persistentData.achievements.push(achievement)
      }
    })
    
    return achievements
  } catch (error) {
    console.error('Check achievements error:', error)
    return []
  }
}

const getAchievementName = (achievement) => {
  try {
    const names = {
      'verb_bronze_master': '🥉 一般動詞ブロンズマスター (1500点達成)',
      'verb_silver_master': '🥈 一般動詞シルバーマスター (3000点達成)',
      'verb_gold_master': '🥇 一般動詞ゴールドマスター (4500点達成)',
      'verb_perfectionist': '💎 動詞完璧主義者 (95%以上の正答率)',
      'verb_speed_demon': '⚡ 動詞スピードデーモン (平均反応時間0.8秒未満)',
      'verb_combo_master': '🔥 動詞コンボマスター (25連続正解)',
      'verb_no_mistake': '🎯 動詞パーフェクト (ノーミス達成)'
    }
    return names[achievement] || achievement
  } catch (error) {
    console.warn('Achievement name error:', error)
    return achievement || 'Unknown Achievement'
  }
}

// === データ永続化 ===
const saveProgress = () => {
  try {
    const saveData = {
      persistentData: { ...persistentData },
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem('verbRushProgress', JSON.stringify(saveData))
    console.log('💾 Progress saved')
  } catch (error) {
    console.error('Save progress error:', error)
  }
}

const loadProgress = () => {
  try {
    const savedData = localStorage.getItem('verbRushProgress')
    if (savedData) {
      const data = JSON.parse(savedData)
      if (data.persistentData) {
        Object.assign(persistentData, data.persistentData)
        console.log('📖 Progress loaded')
      }
    }
  } catch (error) {
    console.error('Load progress error:', error)
  }
}

// === キーボードサポート ===
const handleKeyPress = (event) => {
  try {
    if (gameState.value !== 'playing' || !currentChallenge.value) return
    
    const keyMap = {
      '1': 0,
      '2': 1,
      '3': 2,
      '4': 3
    }
    
    const selectedIndex = keyMap[event.key]
    if (selectedIndex !== undefined && currentChallenge.value.options[selectedIndex]) {
      handleAnswer(currentChallenge.value.options[selectedIndex])
    }
    
    // スペースキーで一時停止
    if (event.key === ' ') {
      event.preventDefault()
      togglePause()
    }
  } catch (error) {
    console.warn('Key press error:', error)
  }
}

// === ライフサイクル ===
onMounted(() => {
  try {
    console.log('🔧 Component mounted')
    
    loadProgress()
    document.addEventListener('keydown', handleKeyPress)
    
    // フォーカス設定
    if (gameArea.value) {
      gameArea.value.focus()
    }
    
  } catch (error) {
    console.error('Component mount error:', error)
  }
})

onUnmounted(() => {
  try {
    clearTimers()
    document.removeEventListener('keydown', handleKeyPress)
    
    if (feedbackTimeout.value) {
      clearTimeout(feedbackTimeout.value)
    }
    
    // 音響システムのクリーンアップ
    if (soundEnabled.value) {
      stopBGM()
    }
    
    console.log('🧹 Component unmounted')
  } catch (error) {
    console.error('Component unmount error:', error)
  }
})

// === ウォッチャー ===
watch(() => currentChallenge.value, (newChallenge) => {
  try {
    if (newChallenge) {
      challengeStartTime.value = Date.now()
    }
  } catch (error) {
    console.warn('Current challenge watch error:', error)
  }
})

watch(() => gameState.value, async (newState) => {
  try {
    if (newState === 'finished') {
      // アチーブメント音
      if (newAchievements.value.length > 0 && soundEnabled.value) {
        setTimeout(() => {
          playCombo()
        }, 1000)
      }
    }
  } catch (error) {
    console.error('Game state change error:', error)
  }
})
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
  color: white;
  padding: 0.5rem 1rem;
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

/* Game-specific styles */
.gameplay-screen {
  @apply relative flex flex-col;
  height: calc(100vh - 180px);
  min-height: 600px;
}

.pause-overlay {
  @apply absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50;
}

.pause-content {
  @apply text-center text-white space-y-6;
}

.game-play-area {
  @apply flex-1 flex flex-col;
  height: 100%;
  min-height: 500px;
}

.challenge-area {
  @apply relative flex-1 flex items-center justify-center;
  perspective: 1500px;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
  overflow: hidden;
  min-height: 400px;
  height: calc(100% - 140px);
}

.depth-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 1px, transparent 2px);
  background-size: 60px 60px, 60px 60px, 30px 30px;
  transform: rotateX(75deg) translateZ(-200px);
  opacity: 0.4;
  pointer-events: none;
  animation: gridPulse 4s ease-in-out infinite;
}

@keyframes gridPulse {
  0%, 100% {
    opacity: 0.3;
    transform: rotateX(75deg) translateZ(-200px);
  }
  50% {
    opacity: 0.5;
    transform: rotateX(75deg) translateZ(-150px);
  }
}

.center-guideline {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.flying-challenge {
  @apply absolute text-white font-bold border-4 rounded-2xl shadow-2xl;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: approachAndFlyAway 5s ease-out forwards;
  z-index: 10;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  min-width: 300px;
  max-width: 500px;
  text-align: center;
  padding: 1.5rem 2rem;
  font-size: 1.2rem;
}

.subject-display {
  @apply text-3xl font-bold mb-2;
  color: #FBBF24;
}

.verb-display {
  @apply text-2xl font-semibold mb-2;
  color: #60A5FA;
}

.challenge-type {
  @apply text-lg;
  color: #A78BFA;
}

.answer-area {
  @apply bg-black bg-opacity-40 backdrop-blur-sm border-t border-gray-600;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verb-answer-buttons {
  @apply flex justify-center items-center gap-6 w-full max-w-5xl mx-auto px-6;
}

.verb-answer-button {
  @apply flex-1 max-w-48 py-6 text-2xl font-bold text-white rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 100px;
}

.button-key {
  @apply absolute top-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded;
}

.button-text {
  @apply text-2xl;
}

/* 選択肢別カラー */
.option-0 {
  @apply bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

.option-1 {
  @apply bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.option-2 {
  @apply bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

.option-3 {
  @apply bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600;
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4);
}

/* チャレンジタイプ別スタイル */
.type-affirmative {
  border-color: #10b981;
  background: linear-gradient(135deg, #10b981, #34d399, #6ee7b7);
}

.type-question {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d);
}

.type-negative {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ef4444, #f87171, #fca5a5);
}

.type-mixed {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa, #c084fc);
}

.verb-answer-button:disabled {
  @apply opacity-50 cursor-not-allowed transform-none;
}

.progress-bar {
  @apply absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 h-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-300;
}

.feedback-display {
  @apply absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold px-8 py-4 rounded-2xl z-40;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  white-space: pre-line;
  max-width: 80vw;
  text-align: center;
}

.feedback-display.correct {
  @apply bg-green-600 bg-opacity-90 text-white border-2 border-green-400;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
}

.feedback-display.incorrect {
  @apply bg-red-600 bg-opacity-90 text-white border-2 border-red-400;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
}

/* 奥から手前に来て、ランダムな方向に飛んでいくアニメーション */
@keyframes approachAndFlyAway {
  0% {
    transform: translate(-50%, -50%) translateZ(-1000px) scale(0.1);
    opacity: 0.2;
    font-size: 0.8rem;
  }
  15% {
    transform: translate(-50%, -50%) translateZ(-600px) scale(0.4);
    opacity: 0.5;
    font-size: 1.2rem;
  }
  30% {
    transform: translate(-50%, -50%) translateZ(-300px) scale(0.7);
    opacity: 0.8;
    font-size: 1.8rem;
  }
  45% {
    transform: translate(-50%, -50%) translateZ(-100px) scale(0.9);
    opacity: 0.95;
    font-size: 2.2rem;
  }
  60% {
    transform: translate(-50%, -50%) translateZ(0px) scale(1);
    opacity: 1;
    font-size: 2.5rem;
  }
  65% {
    transform: translate(-50%, -50%) translateZ(20px) scale(1.1);
    opacity: 1;
    font-size: 2.5rem;
    filter: brightness(1.2);
  }
  100% {
    transform: translate(-50%, -50%) translateZ(400px) 
               translateX(var(--random-x, 500px)) 
               translateY(var(--random-y, -400px)) 
               scale(0.1);
    opacity: 0;
    font-size: 0.8rem;
  }
}

/* 正解時のアニメーション */
@keyframes correctAnswer {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    background: linear-gradient(45deg, #16a34a, #22c55e);
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
    filter: brightness(1);
  }
  30% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 1;
    background: linear-gradient(45deg, #22c55e, #4ade80);
    box-shadow: 0 0 60px rgba(34, 197, 94, 1);
    filter: brightness(1.5);
  }
  60% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 0.8;
    background: linear-gradient(45deg, #4ade80, #86efac);
    box-shadow: 0 0 80px rgba(34, 197, 94, 1);
    filter: brightness(2);
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    filter: brightness(2);
  }
}

/* 不正解時のアニメーション */
@keyframes incorrectAnswer {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    background: linear-gradient(45deg, #dc2626, #ef4444);
    filter: brightness(1);
  }
  15% {
    transform: translate(-50%, -50%) translateX(-30px) scale(1.1);
    background: linear-gradient(45deg, #ef4444, #f87171);
    filter: brightness(1.2);
  }
  30% {
    transform: translate(-50%, -50%) translateX(30px) scale(1.1);
    background: linear-gradient(45deg, #dc2626, #ef4444);
  }
  45% {
    transform: translate(-50%, -50%) translateX(-20px) scale(1);
    opacity: 0.8;
  }
  60% {
    transform: translate(-50%, -50%) translateX(15px) scale(0.9);
    opacity: 0.6;
  }
  75% {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

/* 難易度別のカラーバリエーション */
.difficulty-1 {
  background: linear-gradient(135deg, #16a34a, #22c55e, #4ade80);
  border-color: #22c55e;
}

.difficulty-2 {
  background: linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa);
  border-color: #3b82f6;
}

.difficulty-3 {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa);
  border-color: #8b5cf6;
}

/* 上部選択肢エリアのスタイル */
.answer-area-top {
  @apply fixed top-32 left-0 right-0 z-20 px-6;
}

.verb-answer-buttons-top {
  @apply flex justify-center gap-4 max-w-4xl mx-auto;
}

.verb-answer-button-top {
  @apply relative px-6 py-4 text-white font-bold text-lg rounded-xl border-2 border-white border-opacity-30 cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg;
  min-width: 120px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
}

.verb-answer-button-top:hover {
  @apply border-opacity-50 shadow-2xl;
  backdrop-filter: blur(15px);
}

.verb-answer-button-top .button-key {
  @apply absolute -top-2 -left-2 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold;
}

.verb-answer-button-top .button-text {
  @apply block text-center;
}

/* 改善された問題表示エリア */
.challenge-instruction {
  @apply text-xl font-bold text-white text-center mb-6 px-4 py-3 bg-black bg-opacity-40 rounded-xl backdrop-filter backdrop-blur-md border border-white border-opacity-20;
  line-height: 1.6;
  white-space: pre-line;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  max-width: 90%;
  margin: 0 auto 1.5rem auto;
}

.subject-display-enhanced {
  @apply text-4xl font-black text-yellow-300 mb-4 text-center cosmic-glow;
  text-shadow: 0 0 20px rgba(253, 224, 71, 0.8), 0 4px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.1em;
}

.verb-display-enhanced {
  @apply text-3xl font-bold text-blue-300 text-center cosmic-glow;
  text-shadow: 0 0 15px rgba(147, 197, 253, 0.8), 0 2px 6px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
}

/* 上部選択肢用の色分け */
.verb-answer-button-top.option-0 {
  @apply bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.verb-answer-button-top.option-1 {
  @apply bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.verb-answer-button-top.option-2 {
  @apply bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

.verb-answer-button-top.option-3 {
  @apply bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500;
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4);
}

.verb-answer-button-top:disabled {
  @apply opacity-50 cursor-not-allowed transform-none;
}

/* 下部固定の問題指示エリア */
.instruction-area-bottom {
  @apply fixed bottom-20 left-0 right-0 z-20 px-6;
}

.challenge-instruction-fixed {
  @apply text-lg font-bold text-white text-center px-6 py-4 bg-black bg-opacity-60 rounded-2xl backdrop-filter backdrop-blur-md border border-white border-opacity-30 max-w-3xl mx-auto transition-all duration-500;
  line-height: 1.6;
  white-space: pre-line;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: instructionFadeIn 0.6s ease-out;
}

/* 問題指示のフェードインアニメーション */
@keyframes instructionFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .verb-answer-buttons {
    @apply gap-4 px-4;
  }
  
  .verb-answer-button {
    @apply text-xl py-4 px-4;
    min-height: 80px;
  }
  
  .flying-challenge {
    @apply px-4 py-3;
    min-width: 200px;
    max-width: 90vw;
  }
  
  .feedback-display {
    @apply text-xl px-6 py-3;
  }
  
  .answer-area {
    height: 120px;
  }
}

@media (max-width: 480px) {
  .verb-answer-buttons {
    @apply flex-col gap-3;
  }
  
  .verb-answer-button {
    @apply text-lg py-3;
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
  }
  
  .answer-area {
    height: 200px;
  }
  
  .flying-challenge {
    min-width: 150px;
  }
}

.resume-button {
  @apply flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors;
}
</style>