<!-- src/components/games/BeVerbRush.vue - 完全版（音響システム統合） -->
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
          <h1 class="text-3xl font-bold galaxy-text-primary cosmic-glow">⚡ Be Verb Rush</h1>
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
      </div>
    </div>

    <!-- メインゲームエリア -->
    <div class="relative z-10 flex-1 h-full" ref="gameArea" style="min-height: calc(100vh - 200px);">
      <!-- 待機画面 -->
      <div v-if="gameState === 'waiting'" class="flex items-center justify-center min-h-[60vh]">
        <div class="galaxy-card p-8 text-center max-w-2xl mx-auto">
          <div class="text-6xl mb-6 cosmic-glow">⚡</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-4">Be Verb Rush</h2>
          <p class="text-galaxy-moon-silver mb-8 leading-relaxed">
            Be動詞の完全習得！am/is/are を見極めて正解しよう！<br>
            90秒間でどれだけ高得点を取れるかな？
          </p>
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
          
          <!-- 学習モード選択 -->
          <div class="galaxy-card p-6 mb-6">
            <h3 class="text-lg font-bold galaxy-text-primary cosmic-glow mb-4">🎯 学習モード選択</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <button 
                v-for="mode in gameModes" 
                :key="mode.id"
                @click="selectedGameMode = mode.id"
                @mousedown="playClick"
                class="galaxy-button p-3 text-center transition-all"
                :class="selectedGameMode === mode.id ? 'galaxy-button-primary' : 'galaxy-button-secondary'"
              >
                <div class="text-2xl mb-1">{{ mode.icon }}</div>
                <div class="text-sm font-bold">{{ mode.name }}</div>
                <div class="text-xs text-galaxy-moon-silver">{{ mode.description }}</div>
              </button>
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
          <div class="text-2xl text-galaxy-moon-silver mb-4">準備はいい？ （{{ LEVEL_SETTINGS[selectedLevel].name }}モード）</div>
          <div class="text-lg text-galaxy-moon-silver">
            <kbd class="px-2 py-1 bg-black bg-opacity-50 rounded border text-white">1</kbd> 第1選択肢, 
            <kbd class="px-2 py-1 bg-black bg-opacity-50 rounded border text-white">2</kbd> 第2選択肢, 
            <kbd class="px-2 py-1 bg-black bg-opacity-50 rounded border text-white">3</kbd> 第3選択肢 でも操作可能
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
          <!-- 問題飛来エリア（画面の大部分） -->
          <div class="question-area" ref="questionArea">
            <div 
              v-if="currentQuestion && currentQuestion.text" 
              :key="currentQuestion.id || 'current'"
              class="flying-question visible-question"
              :class="getQuestionClasses()"
            >
              {{ currentQuestion.text }}
            </div>
            
            <!-- 3D空間の奥行き感を出すためのグリッド -->
            <div class="depth-grid"></div>
            
            <!-- 中央ガイドライン -->
            <div class="center-guideline"></div>
          </div>

          <!-- 答え選択ボタンエリア（下部固定） -->
          <div class="answer-area">
            <div class="answer-buttons" v-if="currentQuestion">
              <button 
                v-for="(option, index) in currentQuestion.options"
                :key="option + index"
                @click="handleAnswer(index)"
                @mousedown="playClick"
                class="answer-button"
                :class="getButtonClasses(option, index)"
                :disabled="!currentQuestion || gameState === 'paused'"
              >
                <span class="button-key">{{ index + 1 }}</span>
                <span class="button-text">{{ option }}</span>
              </button>
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
import { useGameSounds } from '@/composables/useGameSounds' // 完全自動生成音響システム
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
  testAllSounds,
  getSoundList
} = useGameSounds()

// === ゲームの定数 ===
const GAME_DURATION = 90000 // 90秒
const MAX_LIVES = 3

// レベル別ゲーム設定
const LEVEL_SETTINGS = {
  beginner: {
    spawnInterval: 12000, // 12秒間隔（初級）- 子供向けに延長
    questionLifetime: 15000, // 15秒表示（初級）- 十分な時間確保
    name: '初級',
    icon: '🐣',
    description: 'ゆっくり学習'
  },
  intermediate: {
    spawnInterval: 8000, // 8秒間隔（中級）- より余裕を持った間隔
    questionLifetime: 10000, // 10秒表示（中級）- 十分な考慮時間
    name: '中級',
    icon: '🚀',
    description: 'バランス良く'
  },
  advanced: {
    spawnInterval: 5000, // 5秒間隔（上級）- 少し余裕を持った間隔
    questionLifetime: 7000, // 7秒表示（上級）- 十分な反応時間
    name: '上級',
    icon: '🔥',
    description: '高速チャレンジ'
  }
}

// === 学習モード定義 ===
const gameModes = [
  {
    id: 'mixed',
    name: 'ミックス',
    icon: '🌌',
    description: '全パターンをランダム出題',
    scoreMultiplier: 1.0
  },
  {
    id: 'basic',
    name: '基本形',
    icon: '📝',
    description: 'I am/You are/He is の基本',
    scoreMultiplier: 1.1
  },
  {
    id: 'question',
    name: '疑問文',
    icon: '❓',
    description: 'Are you/Is he の使い分け',
    scoreMultiplier: 1.2
  },
  {
    id: 'negative',
    name: '否定文',
    icon: '❌',
    description: "I'm not/isn't/aren't の練習",
    scoreMultiplier: 1.3
  }
]

// === Be動詞学習データ（全モード対応） ===
const verbQuestions = {
  // ミックスモード用 - 全パターンを含む
  mixed: [
    // Be動詞基本形
    { id: 1, text: "I ___ happy", options: ["am", "is", "are"], correct: 0, type: "be_verb", difficulty: 1 },
    { id: 2, text: "She ___ a teacher", options: ["am", "is", "are"], correct: 1, type: "be_verb", difficulty: 1 },
    { id: 3, text: "They ___ students", options: ["am", "is", "are"], correct: 2, type: "be_verb", difficulty: 1 },
    { id: 4, text: "He ___ my friend", options: ["am", "is", "are"], correct: 1, type: "be_verb", difficulty: 1 },
    { id: 5, text: "We ___ at home", options: ["am", "is", "are"], correct: 2, type: "be_verb", difficulty: 1 },
    { id: 6, text: "You ___ very kind", options: ["am", "is", "are"], correct: 2, type: "be_verb", difficulty: 1 },
    { id: 7, text: "It ___ a cat", options: ["am", "is", "are"], correct: 1, type: "be_verb", difficulty: 1 },
    { id: 8, text: "The book ___ on the desk", options: ["am", "is", "are"], correct: 1, type: "be_verb", difficulty: 2 },
    { id: 9, text: "My parents ___ doctors", options: ["am", "is", "are"], correct: 2, type: "be_verb", difficulty: 2 },
    { id: 10, text: "This ___ my pen", options: ["am", "is", "are"], correct: 1, type: "be_verb", difficulty: 1 },
    
    // Be動詞疑問文
    { id: 11, text: "___ you a student?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 2 },
    { id: 12, text: "___ she your sister?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 2 },
    { id: 13, text: "___ they at school?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 2 },
    { id: 14, text: "___ I right?", options: ["Am", "Is", "Are"], correct: 0, type: "question", difficulty: 2 },
    { id: 15, text: "___ it a dog?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 2 },
    
    // Be動詞否定文
    { id: 16, text: "I ___ not tired", options: ["am", "is", "are"], correct: 0, type: "negative", difficulty: 2 },
    { id: 17, text: "She ___ not here", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 2 },
    { id: 18, text: "We ___ not late", options: ["am", "is", "are"], correct: 2, type: "negative", difficulty: 2 },
    { id: 19, text: "It ___ not my bag", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 2 },
    { id: 20, text: "They ___ not busy", options: ["am", "is", "are"], correct: 2, type: "negative", difficulty: 2 },
    
    // 上級レベル用（複雑な主語）
    { id: 21, text: "My little sister and I ___ very excited", options: ["am", "is", "are"], correct: 2, type: "be_verb", difficulty: 3 },
    { id: 22, text: "Everyone in the class ___ ready", options: ["am", "is", "are"], correct: 1, type: "be_verb", difficulty: 3 },
    { id: 23, text: "The children in the playground ___ happy", options: ["am", "is", "are"], correct: 2, type: "be_verb", difficulty: 3 },
    { id: 24, text: "My best friend from America ___ here", options: ["am", "is", "are"], correct: 1, type: "be_verb", difficulty: 3 },
    { id: 25, text: "The books on the shelf ___ old", options: ["am", "is", "are"], correct: 2, type: "be_verb", difficulty: 3 },
    
    // 上級レベル用（複雑な疑問文）
    { id: 26, text: "___ the students in your class friendly?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 3 },
    { id: 27, text: "___ your mother's cooking delicious?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 3 },
    { id: 28, text: "___ you and your friends coming tonight?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 3 },
    
    // 上級レベル用（複雑な否定文）
    { id: 29, text: "The weather today ___ not sunny", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 3 },
    { id: 30, text: "My homework assignments ___ not difficult", options: ["am", "is", "are"], correct: 2, type: "negative", difficulty: 3 }
  ],
  
  // 基本形モード用
  basic: [
    { id: 101, text: "I ___ a student", options: ["am", "is", "are"], correct: 0, type: "basic", difficulty: 1 },
    { id: 102, text: "You ___ my friend", options: ["am", "is", "are"], correct: 2, type: "basic", difficulty: 1 },
    { id: 103, text: "He ___ tall", options: ["am", "is", "are"], correct: 1, type: "basic", difficulty: 1 },
    { id: 104, text: "She ___ beautiful", options: ["am", "is", "are"], correct: 1, type: "basic", difficulty: 1 },
    { id: 105, text: "It ___ small", options: ["am", "is", "are"], correct: 1, type: "basic", difficulty: 1 },
    { id: 106, text: "We ___ happy", options: ["am", "is", "are"], correct: 2, type: "basic", difficulty: 1 },
    { id: 107, text: "They ___ smart", options: ["am", "is", "are"], correct: 2, type: "basic", difficulty: 1 },
    { id: 108, text: "The cat ___ black", options: ["am", "is", "are"], correct: 1, type: "basic", difficulty: 2 },
    { id: 109, text: "My books ___ new", options: ["am", "is", "are"], correct: 2, type: "basic", difficulty: 2 },
    { id: 110, text: "The weather ___ nice", options: ["am", "is", "are"], correct: 1, type: "basic", difficulty: 2 }
  ],
  
  // 疑問文モード用
  question: [
    { id: 201, text: "___ you okay?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 1 },
    { id: 202, text: "___ she a nurse?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 1 },
    { id: 203, text: "___ they at home?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 1 },
    { id: 204, text: "___ he your brother?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 2 },
    { id: 205, text: "___ we ready?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 2 },
    { id: 206, text: "___ it hot today?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 2 },
    { id: 207, text: "___ I wrong?", options: ["Am", "Is", "Are"], correct: 0, type: "question", difficulty: 1 },
    { id: 208, text: "___ the door open?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 3 },
    { id: 209, text: "___ the children sleepy?", options: ["Am", "Is", "Are"], correct: 2, type: "question", difficulty: 2 },
    { id: 210, text: "___ this your pen?", options: ["Am", "Is", "Are"], correct: 1, type: "question", difficulty: 2 }
  ],
  
  // 否定文モード用
  negative: [
    { id: 301, text: "I ___ not busy", options: ["am", "is", "are"], correct: 0, type: "negative", difficulty: 1 },
    { id: 302, text: "She ___ not here", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 1 },
    { id: 303, text: "They ___ not happy", options: ["am", "is", "are"], correct: 2, type: "negative", difficulty: 1 },
    { id: 304, text: "He ___ not angry", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 2 },
    { id: 305, text: "We ___ not late", options: ["am", "is", "are"], correct: 2, type: "negative", difficulty: 2 },
    { id: 306, text: "It ___ not cold", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 2 },
    { id: 307, text: "You ___ not tired", options: ["am", "is", "are"], correct: 2, type: "negative", difficulty: 1 },
    { id: 308, text: "The book ___ not mine", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 3 },
    { id: 309, text: "The flowers ___ not red", options: ["am", "is", "are"], correct: 2, type: "negative", difficulty: 2 },
    { id: 310, text: "My room ___ not clean", options: ["am", "is", "are"], correct: 1, type: "negative", difficulty: 2 }
  ]
}

// === リアクティブな状態 ===
const gameState = ref('waiting')
const currentScore = ref(0)
const currentLives = ref(MAX_LIVES)
const timeRemaining = ref(GAME_DURATION)
const currentCombo = ref(0)
const maxCombo = ref(0)
const currentQuestion = ref(null)
const maxLives = ref(MAX_LIVES)
const selectedGameMode = ref('mixed')
const selectedLevel = ref('intermediate') // デフォルトは中級
const currentModeQuestions = ref([])
const questionIndex = ref(0)

const sessionStats = reactive({
  totalAttempts: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  averageReactionTime: 0,
  reactionTimes: []
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
const subjectStartTime = ref(null)
const newAchievements = ref([])

// === ゲームタイマー ===
const gameTimer = ref(null)
const spawnTimer = ref(null)

// === ゲームモードデータの初期化 ===
const initializeModeQuestions = () => {
  const mode = selectedGameMode.value
  const questions = verbQuestions[mode] || verbQuestions.mixed
  
  // レベル別の難易度フィルタリング
  let maxDifficulty = 2 // デフォルトは中級
  if (selectedLevel.value === 'beginner') {
    maxDifficulty = 1 // 初級は難易度1のみ
  } else if (selectedLevel.value === 'intermediate') {
    maxDifficulty = 2 // 中級は難易度1-2
  } else if (selectedLevel.value === 'advanced') {
    maxDifficulty = 3 // 上級は難易度1-3
  }
  
  // 難易度に応じて問題をフィルタリング
  const filteredQuestions = questions.filter(q => q.difficulty <= maxDifficulty)
  
  // シャッフルしてランダムな順序に
  currentModeQuestions.value = [...filteredQuestions].sort(() => Math.random() - 0.5)
  questionIndex.value = 0
  
  console.log(`🎯 Mode initialized: ${mode}, Level: ${selectedLevel.value}, Questions: ${currentModeQuestions.value.length}`)
}

// === テンプレート参照 ===
const gameArea = ref(null)
const subjectArea = ref(null)

// === 計算されたプロパティ ===
const containerClasses = computed(() => ({
  'game-playing': gameState.value === 'playing',
  'game-paused': gameState.value === 'paused',
  'game-finished': gameState.value === 'finished'
}))

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

// === ゲーム制御メソッド ===
const resetGameSession = () => {
  try {
    clearTimers()
    
    currentScore.value = 0
    currentLives.value = MAX_LIVES
    timeRemaining.value = GAME_DURATION
    currentCombo.value = 0
    maxCombo.value = 0
    currentQuestion.value = null // 変数名変更
    lastFeedback.value = null
    isNewRecord.value = false
    newAchievements.value = []
    questionIndex.value = 0 // インデックスリセット
    
    // セッション統計リセット
    Object.assign(sessionStats, {
      totalAttempts: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageReactionTime: 0,
      reactionTimes: []
    })
    
    console.log('✅ Game session reset')
  } catch (error) {
    console.error('Reset game session error:', error)
  }
}

const startNewGame = async () => {
  try {
    console.log('🎮 Starting new game...')
    
    resetGameSession()
    initializeModeQuestions() // モード別問題の初期化
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
        spawnNextQuestion() // メソッド名変更
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

const spawnNextQuestion = () => {
  try {
    if (gameState.value !== 'playing') return
    
    // 現在のモードの問題を取得
    if (questionIndex.value >= currentModeQuestions.value.length) {
      // 問題が尽きたらシャッフルして再開
      initializeModeQuestions()
    }
    
    const question = currentModeQuestions.value[questionIndex.value]
    
    currentQuestion.value = {
      ...question,
      id: `${question.id}_${Date.now()}`,
      spawnTime: Date.now()
    }
    
    questionIndex.value++
    subjectStartTime.value = Date.now()
    
    // レベル別設定を取得
    const currentLevelSettings = LEVEL_SETTINGS[selectedLevel.value]
    
    console.log('📝 New question spawned:', currentQuestion.value.text, `(type: ${currentQuestion.value.type}, level: ${selectedLevel.value})`)
    
    // "ヒュー"音を再生（難易度によって音を変える）
    if (soundEnabled.value) {
      playWordAppear(currentQuestion.value.difficulty || 1)
    }
    
    // ランダムな飛び方向を設定
    setTimeout(() => {
      const questionElement = document.querySelector('.flying-question')
      if (questionElement) {
        // ランダムな方向を生成 (-400px ～ 400px)
        const randomX = (Math.random() - 0.5) * 800
        const randomY = (Math.random() - 0.5) * 600
        
        questionElement.style.setProperty('--random-x', `${randomX}px`)
        questionElement.style.setProperty('--random-y', `${randomY}px`)
      }
    }, 50)
    
    // 問題のタイムアウト処理（レベル別時間）
    const timeoutId = setTimeout(() => {
      if (currentQuestion.value && currentQuestion.value.id === currentQuestion.value.id) {
        console.log('⏰ Question timeout')
        handleQuestionTimeout()
      }
    }, currentLevelSettings.questionLifetime)
    
    // 問題にタイムアウトIDを保存（正解時にクリアするため）
    currentQuestion.value.timeoutId = timeoutId
    
    // 次の問題をスケジュール（レベル別間隔）
    spawnTimer.value = setTimeout(() => {
      spawnNextQuestion()
    }, currentLevelSettings.spawnInterval)
    
  } catch (error) {
    console.error('Spawn next question error:', error)
  }
}

const handleAnswer = (selectedIndex) => {
  try {
    if (!currentQuestion.value || gameState.value !== 'playing') {
      console.warn('Cannot handle answer - invalid state')
      return
    }
    
    // タイムアウトをクリア
    if (currentQuestion.value.timeoutId) {
      clearTimeout(currentQuestion.value.timeoutId)
    }
    
    const reactionTime = Date.now() - subjectStartTime.value
    const isCorrect = selectedIndex === currentQuestion.value.correct
    const selectedAnswer = currentQuestion.value.options[selectedIndex]
    const correctAnswer = currentQuestion.value.options[currentQuestion.value.correct]
    
    // 統計更新
    sessionStats.totalAttempts++
    sessionStats.reactionTimes.push(reactionTime)
    sessionStats.averageReactionTime = sessionStats.reactionTimes.reduce((a, b) => a + b, 0) / sessionStats.reactionTimes.length
    
    if (isCorrect) {
      handleCorrectAnswer(reactionTime)
      sessionStats.correctAnswers++
      
      // 正解音（コンボ考慮）
      if (soundEnabled.value) {
        playCorrectCombo(currentCombo.value)
      }
      
      // 正解時は問題を即座に消去（成功エフェクト付き）
      const questionElement = document.querySelector('.flying-question')
      if (questionElement) {
        questionElement.style.animation = 'correctAnswer 0.5s ease-out forwards'
      }
    } else {
      handleIncorrectAnswer()
      sessionStats.incorrectAnswers++
      
      // 不正解音
      if (soundEnabled.value) {
        playIncorrect()
      }
      
      // 不正解時も問題を消去（失敗エフェクト付き）
      const questionElement = document.querySelector('.flying-question')
      if (questionElement) {
        questionElement.style.animation = 'incorrectAnswer 0.5s ease-out forwards'
      }
    }
    
    showFeedback(isCorrect, selectedAnswer, correctAnswer)
    
    // 現在の問題をクリア
    currentQuestion.value = null
    
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
    
    // スコア計算（モード別倍率を適用）
    const baseScore = (currentQuestion.value.difficulty || 1) * 10
    const comboBonus = Math.floor(currentCombo.value / 5) * 5
    const timeBonus = reactionTime < 1000 ? 10 : reactionTime < 1500 ? 5 : 0
    const modeMultiplier = gameModes.find(mode => mode.id === selectedGameMode.value)?.scoreMultiplier || 1.0
    const totalScore = Math.round((baseScore + comboBonus + timeBonus) * modeMultiplier)
    
    currentScore.value += totalScore
    
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

const handleQuestionTimeout = () => {
  try {
    if (currentQuestion.value) {
      console.log('⏰ Question timeout')
      handleIncorrectAnswer()
      currentQuestion.value = null
    }
  } catch (error) {
    console.error('Handle question timeout error:', error)
  }
}

const showFeedback = (isCorrect, selected, correct) => {
  try {
    if (feedbackTimeout.value) {
      clearTimeout(feedbackTimeout.value)
    }
    
    lastFeedback.value = {
      type: isCorrect ? 'correct' : 'incorrect',
      message: isCorrect ? `正解！ ${selected}` : `不正解！ 正解は ${correct}`
    }
    
    feedbackTimeout.value = setTimeout(() => {
      lastFeedback.value = null
    }, 1500)
    
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
      
      if (!currentQuestion.value) {
        spawnNextQuestion()
      }
    }
  } catch (error) {
    console.error('Toggle pause error:', error)
  }
}

// === ユーティリティメソッド ===
const getQuestionClasses = () => {
  try {
    return {
      'flying-in': true,
      [`difficulty-${currentQuestion.value?.difficulty || 1}`]: true,
      [`type-${currentQuestion.value?.type || 'mixed'}`]: true
    }
  } catch (error) {
    console.warn('Get question classes error:', error)
    return { 'flying-in': true, 'difficulty-1': true, 'type-mixed': true }
  }
}

const getButtonClasses = (option, index) => {
  try {
    return {
      'answer-button': true,
      [`option-${index}`]: true,
      [`answer-${option.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`]: true,
      'disabled': !currentQuestion.value || gameState.value === 'paused'
    }
  } catch (error) {
    console.warn('Get button classes error:', error)
    return { 'answer-button': true }
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
    if (currentScore.value >= 1000 && !currentAchievements.includes('bronze_master')) {
      achievements.push('bronze_master')
    }
    if (currentScore.value >= 2000 && !currentAchievements.includes('silver_master')) {
      achievements.push('silver_master')
    }
    if (currentScore.value >= 3000 && !currentAchievements.includes('gold_master')) {
      achievements.push('gold_master')
    }
    
    // 精度関連
    if (sessionAccuracy.value >= 95 && sessionStats.totalAttempts >= 10 && !currentAchievements.includes('perfectionist')) {
      achievements.push('perfectionist')
    }
    
    // 速度関連
    if (sessionStats.averageReactionTime < 700 && sessionStats.reactionTimes.length >= 10 && !currentAchievements.includes('speed_demon')) {
      achievements.push('speed_demon')
    }
    
    // コンボ関連
    if (maxCombo.value >= 20 && !currentAchievements.includes('combo_master')) {
      achievements.push('combo_master')
    }
    
    // パーフェクト
    if (sessionStats.incorrectAnswers === 0 && sessionStats.totalAttempts >= 20 && !currentAchievements.includes('no_mistake')) {
      achievements.push('no_mistake')
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
      'bronze_master': '🥉 ブロンズマスター (1000点達成)',
      'silver_master': '🥈 シルバーマスター (2000点達成)',
      'gold_master': '🥇 ゴールドマスター (3000点達成)',
      'perfectionist': '💎 完璧主義者 (95%以上の正答率)',
      'speed_demon': '⚡ スピードデーモン (平均反応時間0.7秒未満)',
      'combo_master': '🔥 コンボマスター (20連続正解)',
      'no_mistake': '🎯 パーフェクト (ノーミス達成)'
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
    localStorage.setItem('beVerbRushProgress', JSON.stringify(saveData))
    console.log('💾 Progress saved')
  } catch (error) {
    console.error('Save progress error:', error)
  }
}

const loadProgress = () => {
  try {
    const savedData = localStorage.getItem('beVerbRushProgress')
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
    if (gameState.value !== 'playing' || !currentQuestion.value) return
    
    const keyMap = {
      '1': 0,
      '2': 1,
      '3': 2
    }
    
    const selectedIndex = keyMap[event.key]
    if (selectedIndex !== undefined && currentQuestion.value.options[selectedIndex]) {
      handleAnswer(selectedIndex)
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
watch(() => currentQuestion.value, (newQuestion) => {
  try {
    if (newQuestion) {
      subjectStartTime.value = Date.now()
    }
  } catch (error) {
    console.warn('Current question watch error:', error)
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

.question-area {
  @apply relative flex-1 flex items-center justify-center;
  perspective: 1500px;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
  overflow: hidden;
  min-height: 400px;
  height: calc(100% - 140px);
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

.subject-area {
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

.flying-question {
  @apply absolute text-white font-bold border-4 rounded-2xl shadow-2xl;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: approachAndFlyAway 6s ease-out forwards;
  z-index: 10;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  min-width: 200px;
  text-align: center;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.visible-question {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.answer-area {
  @apply bg-black bg-opacity-40 backdrop-blur-sm border-t border-gray-600;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-buttons {
  @apply flex justify-center items-center gap-8 w-full max-w-4xl mx-auto px-6;
}

.answer-button {
  @apply flex-1 max-w-xs py-6 text-3xl font-bold text-white rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 120px;
}

.button-key {
  @apply absolute top-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded;
}

.button-text {
  @apply text-3xl;
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

/* モード別スタイル */
.type-mixed {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa, #c084fc);
}

.type-third_person {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d);
}

.type-question {
  border-color: #10b981;
  background: linear-gradient(135deg, #10b981, #34d399, #6ee7b7);
}

.type-negative {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ef4444, #f87171, #fca5a5);
}

.type-be_verb {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd);
}

.type-irregular {
  border-color: #7c3aed;
  background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa);
}

.answer-button:disabled {
  @apply opacity-50 cursor-not-allowed transform-none;
}

.progress-bar {
  @apply absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 h-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-300;
}

.feedback-display {
  @apply absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold px-8 py-4 rounded-2xl z-40;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.feedback-display.correct {
  @apply bg-green-600 bg-opacity-90 text-white border-2 border-green-400;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
}

.feedback-display.incorrect {
  @apply bg-red-600 bg-opacity-90 text-white border-2 border-red-400;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
}

/* 奥から手前に来て、ランダムな方向に飛んでいくアニメーション - 子供向けに調整 */
@keyframes approachAndFlyAway {
  0% {
    transform: translate(-50%, -50%) translateZ(-400px) scale(0.3);
    opacity: 0.4;
    font-size: 1.2rem;
  }
  20% {
    transform: translate(-50%, -50%) translateZ(-200px) scale(0.6);
    opacity: 0.7;
    font-size: 2rem;
  }
  40% {
    transform: translate(-50%, -50%) translateZ(-50px) scale(0.8);
    opacity: 0.9;
    font-size: 3rem;
  }
  60% {
    transform: translate(-50%, -50%) translateZ(0px) scale(1);
    opacity: 1;
    font-size: 3.5rem;
  }
  70% {
    transform: translate(-50%, -50%) translateZ(0px) scale(1);
    opacity: 1;
    font-size: 3.5rem;
    filter: brightness(1.1);
  }
  100% {
    transform: translate(-50%, -50%) translateZ(150px) 
               translateX(var(--random-x, 200px)) 
               translateY(var(--random-y, -150px)) 
               scale(0.4);
    opacity: 0;
    font-size: 1.5rem;
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
    transform: translate(-50%, -50%) translateX(-20px) scale(1.1);
    background: linear-gradient(45deg, #ef4444, #f87171);
    filter: brightness(1.2);
  }
  30% {
    transform: translate(-50%, -50%) translateX(20px) scale(1.1);
    background: linear-gradient(45deg, #dc2626, #ef4444);
  }
  45% {
    transform: translate(-50%, -50%) translateX(-15px) scale(1);
    opacity: 0.8;
  }
  60% {
    transform: translate(-50%, -50%) translateX(10px) scale(0.9);
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

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .be-verb-buttons {
    @apply gap-4 px-4;
  }
  
  .be-verb-button {
    @apply text-xl py-4 px-4;
    min-height: 60px;
  }
  
  .flying-subject {
    @apply px-4 py-3;
    min-width: 100px;
  }
  
  .feedback-display {
    @apply text-2xl px-6 py-3;
  }
  
  .answer-area {
    height: 120px;
  }
}

@media (max-width: 480px) {
  .be-verb-buttons {
    @apply flex-col gap-3;
  }
  
  .be-verb-button {
    @apply text-lg py-3;
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .answer-area {
    height: 180px;
  }
  
  .flying-subject {
    min-width: 80px;
  }
}

/* アニメーション */
.game-playing {
  animation: gameStart 0.5s ease-out;
}

@keyframes gameStart {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-finished {
  animation: gameEnd 0.5s ease-out;
}

@keyframes gameEnd {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.gameplay-screen {
  @apply relative h-full flex flex-col;
}

.pause-overlay {
  @apply absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50;
}

.pause-content {
  @apply text-center text-white space-y-6;
}

.resume-button {
  @apply flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors;
}

/* Duplicate styles removed - already defined above */

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

.flying-question {
  @apply absolute text-white font-bold border-4 rounded-2xl shadow-2xl;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: approachAndFlyAway 4s ease-out forwards;
  z-index: 10;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  min-width: 200px;
  text-align: center;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.answer-area {
  @apply bg-black bg-opacity-40 backdrop-blur-sm border-t border-gray-600;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-buttons {
  @apply flex justify-center items-center gap-8 w-full max-w-4xl mx-auto px-6;
}

.answer-button {
  @apply flex-1 max-w-xs py-6 text-3xl font-bold text-white rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 120px;
}

.button-key {
  @apply absolute top-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded;
}

.button-text {
  @apply text-3xl;
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

/* モード別スタイル */
.type-mixed {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa, #c084fc);
}

.type-third_person {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d);
}

.type-question {
  border-color: #10b981;
  background: linear-gradient(135deg, #10b981, #34d399, #6ee7b7);
}

.type-negative {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ef4444, #f87171, #fca5a5);
}

.type-be_verb {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd);
}

.type-irregular {
  border-color: #7c3aed;
  background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa);
}

.answer-button:disabled {
  @apply opacity-50 cursor-not-allowed transform-none;
}

.progress-bar {
  @apply absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 h-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-300;
}

.feedback-display {
  @apply absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold px-8 py-4 rounded-2xl z-40;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
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
    transform: translate(-50%, -50%) translateZ(-800px) scale(0.1);
    opacity: 0.2;
    font-size: 0.8rem;
  }
  15% {
    transform: translate(-50%, -50%) translateZ(-400px) scale(0.4);
    opacity: 0.5;
    font-size: 1.5rem;
  }
  30% {
    transform: translate(-50%, -50%) translateZ(-200px) scale(0.7);
    opacity: 0.8;
    font-size: 2.5rem;
  }
  45% {
    transform: translate(-50%, -50%) translateZ(-50px) scale(0.9);
    opacity: 0.95;
    font-size: 3.5rem;
  }
  60% {
    transform: translate(-50%, -50%) translateZ(0px) scale(1);
    opacity: 1;
    font-size: 4rem;
  }
  65% {
    transform: translate(-50%, -50%) translateZ(10px) scale(1.1);
    opacity: 1;
    font-size: 4rem;
    filter: brightness(1.2);
  }
  100% {
    transform: translate(-50%, -50%) translateZ(300px) 
               translateX(var(--random-x, 400px)) 
               translateY(var(--random-y, -300px)) 
               scale(0.2);
    opacity: 0;
    font-size: 1rem;
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
    transform: translate(-50%, -50%) translateX(-20px) scale(1.1);
    background: linear-gradient(45deg, #ef4444, #f87171);
    filter: brightness(1.2);
  }
  30% {
    transform: translate(-50%, -50%) translateX(20px) scale(1.1);
    background: linear-gradient(45deg, #dc2626, #ef4444);
  }
  45% {
    transform: translate(-50%, -50%) translateX(-15px) scale(1);
    opacity: 0.8;
  }
  60% {
    transform: translate(-50%, -50%) translateX(10px) scale(0.9);
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

.results-header {
  @apply text-center mb-6;
}

.score-display {
  @apply bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 mb-6;
}

.final-score {
  @apply text-center;
}

.score-label {
  @apply block text-sm font-medium text-yellow-100;
}

.score-number {
  @apply block text-4xl font-bold text-white my-2;
}

.new-record {
  @apply block text-lg font-bold text-yellow-200 animate-pulse;
}

.stat-card {
  @apply bg-black bg-opacity-30 rounded-lg p-4 text-center;
}

.stat-card .stat-number {
  @apply text-xl font-bold text-blue-300;
}

.stat-card .stat-label {
  @apply text-xs text-gray-400 mt-1;
}

.achievements {
  @apply my-6 p-4 bg-purple-900 bg-opacity-50 rounded-xl;
}

.achievement-list {
  @apply space-y-2;
}

.achievement-item {
  @apply px-4 py-2 bg-yellow-600 bg-opacity-50 rounded-lg text-yellow-200 font-bold;
}

.action-buttons {
  @apply flex gap-4 justify-center mt-6;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .stats-bar {
    @apply flex-wrap gap-3 px-2 py-3;
  }
  
  .stat-item {
    @apply text-sm;
  }
  
  .game-area {
    height: calc(100vh - 100px);
  }
  
  .answer-area {
    height: 120px;
  }
  
  .be-verb-buttons {
    @apply gap-4 px-4;
  }
  
  .be-verb-button {
    @apply text-xl py-4 px-4;
    min-height: 60px;
  }
  
  .flying-subject {
    @apply px-4 py-3;
    min-width: 100px;
  }
  
  .feedback-display {
    @apply text-2xl px-6 py-3;
  }
  
  .audio-controls {
    @apply text-sm;
  }
}

@media (max-width: 480px) {
  .be-verb-buttons {
    @apply flex-col gap-3;
  }
  
  .be-verb-button {
    @apply text-lg py-3;
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .answer-area {
    height: 180px;
  }
  
  .flying-subject {
    min-width: 80px;
  }
  
  .action-buttons {
    @apply flex-col;
  }
}

/* 高解像度ディスプレイ対応 */
@media (min-width: 1200px) {
  .flying-subject {
    @apply px-12 py-6;
    min-width: 200px;
  }
  
  .be-verb-button {
    @apply text-4xl py-8 px-12;
  }
  
  .answer-area {
    height: 160px;
  }
}

/* アニメーション */
.game-playing {
  animation: gameStart 0.5s ease-out;
}

@keyframes gameStart {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-finished {
  animation: gameEnd 0.5s ease-out;
}

@keyframes gameEnd {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>