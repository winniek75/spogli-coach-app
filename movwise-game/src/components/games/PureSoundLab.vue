<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- Nebula effect -->
    <div class="nebula-effect"></div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- ヘッダー -->
      <div class="galaxy-card rounded-3xl p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="handleBack"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5 cosmic-glow" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold galaxy-text-primary cosmic-title mb-2">
              🔬 ピュア・サウンド・ラボ
            </h1>
            <div class="text-lg text-galaxy-moon-silver mb-1">
              Stage {{ currentLearningStage }}: {{ currentStageInfo.name }}
            </div>
            <div class="text-sm text-galaxy-moon-silver">
              {{ currentStageInfo.description }}
            </div>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- 進捗バー -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-galaxy-moon-silver mb-2">
            <span>{{ currentPhonemeStage.toUpperCase() }} Progress</span>
            <span>{{ masteredCount }}/{{ currentPhonemes.length }} phonemes mastered</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-3">
            <div 
              class="energy-gauge h-3 rounded-full transition-all duration-500"
              :style="{ width: `${stageProgress}%` }"
            ></div>
          </div>
          
          <!-- ステージアップボタン -->
          <button 
            v-if="canAdvanceStage"
            @click="advanceToNextStage"
            class="mt-3 w-full galaxy-button galaxy-button-primary text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 animate-pulse"
          >
            🎉 Advance to {{ getNextStageName() }}!
          </button>
        </div>

        <!-- ステータス -->
        <div class="grid grid-cols-3 gap-4">
          <div class="galaxy-stats-card">
            <div class="flex justify-center gap-1 mb-2">
              <Heart 
                v-for="i in 3" 
                :key="i"
                :class="[
                  'w-6 h-6',
                  i <= lives ? 'text-red-500 fill-current cosmic-glow' : 'text-gray-500'
                ]"
              ></Heart>
            </div>
            <div class="text-sm text-galaxy-moon-silver">Lives</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold galaxy-text-primary mb-1">{{ masteredCount }}</div>
            <div class="text-sm text-galaxy-moon-silver">Mastered</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold galaxy-text-primary mb-1">{{ currentPhonemeStage }}</div>
            <div class="text-sm text-galaxy-moon-silver">Stage</div>
          </div>
        </div>
      </div>

      <!-- ローディング画面 -->
      <div v-if="loading" class="galaxy-card rounded-3xl shadow-2xl p-8 text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p class="text-galaxy-moon-silver">音素データベースを読み込み中...</p>
      </div>

      <!-- エラー画面 -->
      <div v-else-if="error" class="galaxy-card rounded-3xl shadow-2xl p-8 text-center">
        <div class="text-red-400 text-6xl mb-4 cosmic-glow">⚠️</div>
        <h3 class="text-xl font-bold text-red-400 mb-4">データ読み込みエラー</h3>
        <p class="text-galaxy-moon-silver mb-4">{{ error }}</p>
        <button 
          @click="initializePhonemeData"
          class="galaxy-button galaxy-button-primary px-6 py-3 text-white rounded-2xl hover:shadow-lg transition-all duration-200"
        >
          再試行
        </button>
      </div>

      <!-- フィードバック -->
      <Transition name="feedback">
        <div 
          v-if="gameState === 'feedback'" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            :class="[
              'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center backdrop-blur-md',
              feedbackType === 'correct' ? 'bg-green-500/90 text-white animate-correct' : 'bg-red-500/90 text-white animate-shake'
            ]"
          >
            <div class="mb-2">
              {{ feedbackType === 'correct' ? '🎉 Correct!' : '😢 Incorrect...' }}
            </div>
            <div class="text-lg font-normal mt-2">{{ feedback }}</div>
            <div v-if="currentQuestion?.explanation && feedbackType === 'incorrect'" class="text-base mt-4 opacity-90">
              💡 {{ currentQuestion.explanation.sound.tip }}
            </div>
          </div>
        </div>
      </Transition>

      <!-- メインゲーム画面 -->
      <div v-if="!loading && !error" class="galaxy-card rounded-3xl shadow-2xl p-8">
        <!-- イントロ画面 -->
        <div v-if="showIntro" class="text-center py-12">
          <div class="mb-8">
            <div class="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-float cosmic-glow">
              <span class="text-6xl">🔬</span>
            </div>
            <h2 class="text-3xl font-bold galaxy-text-primary mb-4 cosmic-title">科学的音素学習システム</h2>
            <div class="max-w-2xl mx-auto space-y-4">
              <div class="galaxy-card p-4 rounded-2xl border-l-4 border-cyan-400">
                <div class="flex items-center gap-3 mb-2">
                  <Volume2 class="w-6 h-6 text-cyan-400 cosmic-glow" />
                  <span class="font-bold text-cyan-400">Stage 1: ピュア・サウンド・ファウンデーション</span>
                </div>
                <p class="text-galaxy-moon-silver">44音素に集中 - 音のみ、視覚的な気晴らしなし！</p>
              </div>
              
              <div class="galaxy-card p-4 rounded-2xl border-l-4 border-purple-400">
                <div class="flex items-center gap-3 mb-2">
                  <Target class="w-6 h-6 text-purple-400 cosmic-glow" />
                  <span class="font-bold text-purple-400">Stage 2: サウンド→シンボル・マッピング</span>
                </div>
                <p class="text-galaxy-moon-silver">音と文字記号を結び付けよう！</p>
              </div>
              
              <div class="galaxy-card p-4 rounded-2xl border-l-4 border-pink-400">
                <div class="flex items-center gap-3 mb-2">
                  <Beaker class="w-6 h-6 text-pink-400 cosmic-glow" />
                  <span class="font-bold text-pink-400">Stage 3: フォニーム・パターン・ラボ</span>
                </div>
                <p class="text-galaxy-moon-silver">音素グループのパターンを発見しよう！</p>
              </div>
            </div>
            <div class="mt-6 text-center">
              <p class="text-galaxy-moon-silver mb-4">
                📊 現在のステージ: {{ currentPhonemes.length }}個の音素をマスター
              </p>
              <p class="text-sm text-galaxy-moon-silver opacity-80">
                科学的フォニックス研究に基づく適応的難易度調整
              </p>
            </div>
          </div>
          
          <button 
            @click="startGame"
            class="galaxy-button galaxy-button-primary px-12 py-4 text-xl font-bold text-white rounded-2xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            🚀 音素トレーニング開始
          </button>
        </div>

        <!-- Stage 1: Pure Sound Only -->
        <div v-else-if="gameState === 'playing' && currentLearningStage === 1" class="pure-sound-stage flex flex-col items-center justify-center min-h-[60vh]">
          <!-- ゲームガイド -->
          <div class="w-full text-center mb-6">
            <div class="text-2xl font-bold galaxy-text-primary cosmic-glow flex items-center justify-center gap-2">
              <span>👂 音をよく聞いて、同じ音を選ぼう！</span>
            </div>
            <div class="text-lg text-galaxy-moon-silver mt-2">🔊を押して音を聞き、1〜3のボタンをクリックして同じ音を選んで「決定」しよう！</div>
          </div>
          <!-- 実験室アニメーション（簡易ビーカー＋泡） -->
          <div class="relative mb-8">
            <div class="w-40 h-40 bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-100 rounded-full flex items-end justify-center shadow-2xl border-4 border-blue-400 overflow-hidden">
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-16 bg-gradient-to-t from-blue-400 via-blue-200 to-white opacity-90 rounded-b-full z-10" style="filter: blur(1px);"></div>
              <div v-for="i in 5" :key="i" class="absolute rounded-full animate-bounce"
                :style="{ left: `${30 + i * 8}%`, bottom: '60%', width: '16px', height: '16px', background: '#90e0ef', opacity: 0.7, animationDelay: `${i * 0.18}s` }">
              </div>
            </div>
          </div>
          <!-- PLAYボタン（問題音のみ） -->
          <button @click="playCurrentPhoneme" :disabled="isPlaying" class="w-32 h-32 bg-blue-500 hover:bg-blue-600 text-white text-5xl rounded-full flex items-center justify-center shadow-2xl mb-8 transition-all duration-200 animate-pulse">
            🔊
          </button>
          <!-- 選択肢（数字のみ＋音再生＋ハイライト） -->
          <div class="flex gap-8 mb-8">
            <button
              v-for="(choice, idx) in currentChoices"
              :key="idx"
              @click="selectChoice(idx, choice)"
              :class="[
                'w-24 h-24 text-4xl font-bold rounded-full shadow-xl flex items-center justify-center transition-all duration-200 border-4',
                selectedIdx === idx ? 'bg-yellow-400 border-yellow-600 scale-110 ring-4 ring-yellow-300' : '',
                playingIdx === idx ? 'bg-blue-300 border-blue-600 animate-pulse' : 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400'
              ]"
              :disabled="isPlaying"
            >
              {{ idx + 1 }}
            </button>
          </div>
          <!-- 決定ボタン -->
          <button @click="handleDecision" :disabled="selectedIdx === null || isPlaying" class="px-12 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-2xl shadow-xl transition-all duration-200 disabled:opacity-50">
            決定
          </button>
          <!-- フィードバック -->
          <transition name="bounce">
            <div v-if="gameState === 'feedback'" class="text-center mt-4">
              <div v-if="feedbackType === 'correct'" class="text-3xl font-bold text-green-500 animate-bounce">🎉 Perfect! That's the {{ currentQuestion?.target?.phoneme || '' }} sound!</div>
              <div v-else class="text-3xl font-bold text-red-500 animate-shake">😢 Not quite, try again!</div>
            </div>
          </transition>
        </div>

        <!-- Stage 2: Sound to Symbol Mapping -->
        <div v-else-if="gameState === 'playing' && currentLearningStage === 2" class="sound-to-symbol-stage flex flex-col items-center justify-center min-h-[60vh]">
          <div class="text-2xl font-bold text-blue-700 mb-4">🎯 Listen carefully...</div>
          <button @click="playCurrentPhoneme" class="w-24 h-24 bg-purple-500 hover:bg-purple-600 text-white text-4xl rounded-full flex items-center justify-center shadow-2xl mb-8 transition-all duration-200 animate-pulse">
            🔊
          </button>
          <div class="flex gap-8 mb-8">
            <button v-for="choice in currentChoices" :key="choice.symbol" @click="handlePhonemeAnswer(choice)"
              class="w-32 h-32 bg-pink-200 hover:bg-pink-300 text-3xl font-bold rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-200 border-4 border-pink-400">
              <div>{{ choice.symbol }}</div>
              <div class="text-lg text-gray-700 mt-2">{{ choice.example_word }}</div>
            </button>
          </div>
          <transition name="bounce">
            <div v-if="gameState === 'feedback'" class="text-center mt-4">
              <div v-if="feedbackType === 'correct'" class="text-3xl font-bold text-green-500 animate-bounce">🎉 Perfect! That's the {{ currentQuestion?.target?.symbol || '' }} sound!</div>
              <div v-else class="text-3xl font-bold text-red-500 animate-shake">😢 Not quite, try again!</div>
            </div>
          </transition>
        </div>

        <!-- Stage 3: Pattern Recognition -->
        <div v-else-if="gameState === 'playing' && currentLearningStage === 3" class="pattern-recognition-stage flex flex-col items-center justify-center min-h-[60vh]">
          <div class="text-2xl font-bold text-indigo-700 mb-4">🧬 Sound Family Discovery!</div>
          <div class="bg-white rounded-2xl shadow-xl p-6 mb-8 border-4 border-indigo-300">
            <div class="text-lg font-bold mb-2">These sounds are family:</div>
            <div class="flex gap-4 mb-2">
              <span v-for="s in currentPattern?.knownMembers || []" :key="s" class="text-2xl font-bold text-indigo-500">{{ s }}</span>
              <span class="text-2xl font-bold text-gray-400">[?]</span>
            </div>
            <div class="text-base text-gray-700 mb-2">{{ currentPattern?.description }}</div>
            <div v-if="currentPattern?.targetMember" class="text-base text-blue-600 font-bold mt-2">Hint: {{ currentPattern?.feature_tip }}</div>
          </div>
          <div class="flex gap-8 mb-8">
            <button v-for="choice in currentChoices" :key="choice.symbol" @click="handlePhonemeAnswer(choice)"
              class="w-32 h-32 bg-green-200 hover:bg-green-300 text-3xl font-bold rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-200 border-4 border-green-400">
              <div>{{ choice.symbol }}</div>
              <div class="text-lg text-gray-700 mt-2">{{ choice.example_word }}</div>
            </button>
          </div>
          <transition name="bounce">
            <div v-if="gameState === 'feedback'" class="text-center mt-4">
              <div v-if="feedbackType === 'correct'" class="text-3xl font-bold text-green-500 animate-bounce">🎉 Perfect! That's the {{ currentQuestion?.target?.symbol || '' }} sound!</div>
              <div v-else class="text-3xl font-bold text-red-500 animate-shake">😢 Not quite, try again!</div>
            </div>
          </transition>
        </div>

        <!-- ゲーム完了画面 -->
        <div v-else-if="gameState === 'complete'" class="text-center py-12">
          <div class="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Trophy class="w-16 h-16 text-white fill-current" />
          </div>
          
          <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Stage Complete!
          </h2>
          
          <div class="bg-gray-50 rounded-2xl p-6 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div class="text-3xl font-bold text-purple-600">{{ score }}</div>
                <div class="text-gray-600">Final Score</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-green-600">{{ Math.round(stageProgress) }}%</div>
                <div class="text-gray-600">Mastery Rate</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-blue-600">{{ masteredCount }}</div>
                <div class="text-gray-600">Phonemes Learned</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-yellow-600">{{ attempts.length }}</div>
                <div class="text-gray-600">Total Attempts</div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-4 justify-center">
            <button 
              @click="resetGame"
              class="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-bold text-lg transform hover:scale-105"
            >
              <RotateCcw class="w-5 h-5 inline mr-2" />
              Practice Again
            </button>
            <button 
              @click="advanceToNextStage"
              v-if="canAdvanceStage"
              class="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-bold text-lg transform hover:scale-105"
            >
              Next Stage
            </button>
          </div>
        </div>
      </div>

      <!-- 設定モーダル -->
      <div v-if="showSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showSettings = false">
        <div class="bg-white rounded-3xl p-8 max-w-md mx-4" @click.stop>
          <h3 class="text-2xl font-bold mb-6">Game Settings</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Learning Stage</label>
              <select v-model="currentLearningStage" class="w-full p-3 border rounded-xl">
                <option value="1">Stage 1: Pure Sound Foundation</option>
                <option value="2">Stage 2: Sound→Symbol Mapping</option>
                <option value="3">Stage 3: Phoneme Pattern Lab</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phoneme Stage</label>
              <select v-model="currentPhonemeStage" @change="updateCurrentPhonemes" class="w-full p-3 border rounded-xl">
                <option v-for="stage in availableStages" :key="stage" :value="stage">
                  {{ stage.toUpperCase() }}: {{ getStageDescription(stage) }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select v-model="difficultyLevel" class="w-full p-3 border rounded-xl">
                <option value="easy">Easy (2 choices, slow speed)</option>
                <option value="normal">Normal (3 choices, normal speed)</option>
                <option value="hard">Hard (4 choices, fast speed)</option>
              </select>
            </div>
          </div>
          
          <div class="flex gap-4 mt-6">
            <button 
              @click="showSettings = false"
              class="flex-1 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              @click="applySettings"
              class="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Settings, 
  Heart, 
  Volume2, 
  Play, 
  RotateCcw, 
  Trophy,
  Target,
  Beaker
} from 'lucide-vue-next'

// 新しいインポート - Native English pronunciation database
import { NATIVE_PHONEME_PROGRESSION, NATIVE_AUDIO_MAPPING, JAPANESE_LEARNER_TIPS, PHONEME_GROUPS } from '@/data/native-phoneme-database.js'
import { usePhonemeProgress } from '@/composables/usePhonemeProgress.js'
import { adaptiveLearningEngine } from '@/services/adaptiveLearning.js'

// 追加: フラットなJSONデータをimport
import stage1Phonemes from '@/data/csv/stage1_phonemes_flat.json'
import stage2Phonemes from '@/data/csv/stage2_phonemes_flat.json'
import stage3Groups   from '@/data/csv/stage3_groups_flat.json'

// ルーター
const router = useRouter()

// 進捗管理の使用
const {
  currentStage: currentPhonemeStage,
  masteredPhonemes,
  stageProgress,
  canAdvanceStage,
  availableStages,
  recordAttempt,
  advanceToNextStage: progressAdvanceStage,
  getNextRecommendedPhoneme,
  generateDetailedReport
} = usePhonemeProgress()

// currentPhonemesを独自にrefで管理
const currentPhonemes = ref([])

// 学習段階の定義（修正版）
const LEARNING_STAGES = {
  1: { 
    name: 'Pure Sound Foundation', 
    icon: '🔬', 
    description: '音のみに集中（文字・画像なし）',
    method: 'AUDIO_ONLY'
  },
  2: { 
    name: 'Sound→Symbol Mapping', 
    icon: '🎯', 
    description: '音を聞いて対応する文字を選択',
    method: 'AUDIO_TO_SYMBOL'
  },
  3: { 
    name: 'Phoneme Pattern Lab', 
    icon: '⚗️', 
    description: '音素グループの体系的学習',
    method: 'PATTERN_RECOGNITION'
  }
}

// 状態管理
const currentLearningStage = ref(1) // 1, 2, 3
const gameState = ref('intro') // intro, playing, feedback, complete
const currentQuestion = ref(null)
const currentChoices = ref([])
const currentPattern = ref(null)
const score = ref(0)
const lives = ref(3)
const playCount = ref(0)
const maxPlays = ref(3)
const feedback = ref('')
const showIntro = ref(true)
const isPlaying = ref(false)
const feedbackType = ref('') // 'correct' or 'incorrect'
const loading = ref(true)
const error = ref('')
const showSettings = ref(false)
const difficultyLevel = ref('normal')
const attempts = ref([])
const questionStartTime = ref(0)

// 背景パーティクル
const particles = ref(Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: 4 + Math.random() * 3,
  size: 3 + Math.random() * 4
})))

// 計算プロパティ
const masteredCount = computed(() => {
  return currentPhonemes.value.filter(phoneme => 
    masteredPhonemes.value.has(phoneme.symbol)
  ).length
})

const currentStageInfo = computed(() => {
  return LEARNING_STAGES[currentLearningStage.value] || LEARNING_STAGES[1]
})

// Stage 1用の状態
const selectedIdx = ref(null)
const playingIdx = ref(null)
const isAutoPlaying = ref(false)

// symbolからスラッシュを除去する関数（安全版）
const baseSymbol = (p) => (p && (p.label || p.ipa) ? (p.label || p.ipa).replace(/[\\/]/g, '') : '')

const loadNextQuestion = () => {
  // デバッグ: 出題直前のcurrentPhonemesを確認
  console.log('loadNextQuestion: currentPhonemes', currentPhonemes.value)
  // symbolが存在するものだけに限定
  const availablePhonemes = currentPhonemes.value.filter(p => p && (p.label || p.ipa))
  // デバッグ: フィルタ後のavailablePhonemesを確認
  console.log('availablePhonemes:', availablePhonemes)
  if (!availablePhonemes || availablePhonemes.length === 0) {
    gameState.value = 'complete'
    return
  }

  // デバッグ用：現在の音素リストを確認
  console.log('Available phonemes:', availablePhonemes)

  // 現在のステージの音素からランダムに問題を選ぶ
  const randomIndex = Math.floor(Math.random() * availablePhonemes.length)
  const targetPhoneme = availablePhonemes[randomIndex]

  // デバッグ用：選ばれた音素を確認
  console.log('Selected phoneme:', targetPhoneme)

  // 選択肢を生成（正解を含む3つの選択肢）
  let choices = [targetPhoneme]
  const otherPhonemes = availablePhonemes.filter(p => baseSymbol(p) !== baseSymbol(targetPhoneme))
  
  // デバッグ用：選択肢の生成過程を確認
  console.log('Other phonemes for choices:', otherPhonemes)
  
  // 残りの選択肢をランダムに選ぶ
  while (choices.length < 3 && otherPhonemes.length > 0) {
    const randomIdx = Math.floor(Math.random() * otherPhonemes.length)
    choices.push(otherPhonemes.splice(randomIdx, 1)[0])
  }

  // デバッグ用：最終的な選択肢を確認
  console.log('Final choices:', choices)

  // 選択肢をシャッフル
  currentChoices.value = choices.sort(() => Math.random() - 0.5)
  
  // 問題を設定
  currentQuestion.value = {
    target: targetPhoneme,
    choices: currentChoices.value,
    settings: {
      audioSettings: {
        repeatAllowed: 3
      },
      visualSettings: {
        feedbackDelay: 2500
      }
    }
  }

  // 状態をリセット
  playCount.value = 0
  maxPlays.value = currentQuestion.value.settings.audioSettings.repeatAllowed
  feedback.value = ''
  feedbackType.value = ''
  questionStartTime.value = Date.now()
  selectedIdx.value = null
  playingIdx.value = null

  // 自動で問題音を再生（Stage 1のみ）
  if (currentLearningStage.value === 1) {
    setTimeout(() => playCurrentPhoneme(), 500)
  }
}

const playPhonemeSound = async (phoneme, idx = null) => {
  if (!phoneme) return
  playingIdx.value = idx
  isPlaying.value = true

  // デバッグ用：再生しようとしている音素を確認
  console.log('Playing phoneme:', phoneme)

  // 既存の音声を止める
  if (window._currentAudio) {
    window._currentAudio.pause()
    window._currentAudio.currentTime = 0
  }

  try {
    // Native audio mapping を使用
    const phonemeSymbol = phoneme.symbol || phoneme
    const audioFileName = NATIVE_AUDIO_MAPPING[phonemeSymbol] || phoneme.audioFile || `${baseSymbol(phoneme)}.m4a`
    
    // 音声ファイルのパスを生成（Native English pronunciation）
    const audioPath = `/sounds/${audioFileName}`
    console.log('Playing native audio:', audioPath, 'for phoneme:', phonemeSymbol) // デバッグ用
    
    const audio = new Audio(audioPath)
    window._currentAudio = audio
    
    // 音声の再生
    await audio.play()
    
    // 再生終了時の処理
    audio.onended = () => {
      isPlaying.value = false
      playingIdx.value = null
      window._currentAudio = null
    }

    // エラー時の処理
    audio.onerror = (e) => {
      console.error(
        `Failed to play audio: ${audioPath}`,
        e,
        'phoneme:', JSON.stringify(phoneme),
        'label:', phoneme.label,
        'ipa:', phoneme.ipa
      )
      isPlaying.value = false
      playingIdx.value = null
      window._currentAudio = null
    }
  } catch (error) {
    console.error('Error playing audio:', error)
    isPlaying.value = false
    playingIdx.value = null
    window._currentAudio = null
  }
}

// 選択肢の音を自動再生
const autoPlayChoices = async () => {
  if (!currentChoices.value || currentChoices.value.length === 0) return
  
  isAutoPlaying.value = true
  for (let i = 0; i < currentChoices.value.length; i++) {
    await playPhonemeSound(currentChoices.value[i], i)
    // 各音の間に少し間隔を空ける
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  isAutoPlaying.value = false
}

// 問題音を再生した後に選択肢の音を自動再生
const playCurrentPhoneme = async () => {
  if (!currentQuestion.value || playCount.value >= maxPlays.value) return
  
  // 問題音を再生
  await playPhonemeSound(currentQuestion.value.target)
  playCount.value++
}

// 問題音再生→選択肢自動再生
const playQuestionAndChoices = async () => {
  await playCurrentPhoneme()
}

// 決定ボタンで答え合わせ
const handleDecision = () => {
  if (selectedIdx.value !== null) {
    handlePhonemeAnswer(currentChoices.value[selectedIdx.value])
    selectedIdx.value = null
  }
}

// メソッド
const initializePhonemeData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // データの検証 - Native Phoneme Database
    if (!NATIVE_PHONEME_PROGRESSION || Object.keys(NATIVE_PHONEME_PROGRESSION).length === 0) {
      throw new Error('Native phoneme database is empty')
    }
    
    updateCurrentPhonemes()
    loading.value = false
  } catch (err) {
    error.value = `Failed to initialize native phoneme data: ${err.message}`
    loading.value = false
  }
}

const updateCurrentPhonemes = () => {
  if (currentLearningStage.value === 1) {
    // Use native phoneme database for foundation learning
    const allNativePhonemes = [
      ...NATIVE_PHONEME_PROGRESSION.stage1A,
      ...NATIVE_PHONEME_PROGRESSION.stage1B,
      ...NATIVE_PHONEME_PROGRESSION.stage1C
    ]
    currentPhonemes.value = allNativePhonemes
  } else if (currentLearningStage.value === 2) {
    // Use native phoneme database for advanced learning
    const allNativePhonemes = [
      ...NATIVE_PHONEME_PROGRESSION.stage2A,
      ...NATIVE_PHONEME_PROGRESSION.stage2B,
      ...NATIVE_PHONEME_PROGRESSION.stage2C
    ]
    currentPhonemes.value = allNativePhonemes
  } else if (currentLearningStage.value === 3) {
    // Use all native phonemes for pattern recognition
    const allNativePhonemes = Object.values(NATIVE_PHONEME_PROGRESSION).flat()
    currentPhonemes.value = allNativePhonemes
  }
  console.log('updateCurrentPhonemes (native):', currentPhonemes.value)
}

const startGame = () => {
  updateCurrentPhonemes()
  console.log('startGame: currentPhonemes', currentPhonemes.value)
  showIntro.value = false
  gameState.value = 'playing'
  loadNextQuestion()
}

const generatePatternContext = (targetPhoneme) => {
  const group = PHONEME_GROUPS[targetPhoneme.group]
  if (group) {
    const groupMembers = group.members
    const knownMembers = groupMembers.filter(member => 
      member !== targetPhoneme.symbol && 
      Math.random() > 0.5 // ランダムに一部を表示
    ).slice(0, 2)
    
    currentPattern.value = {
      groupName: group.name,
      description: group.description,
      knownMembers,
      targetMember: targetPhoneme.symbol
    }
  }
}

const handlePhonemeAnswer = (choice) => {
  if (gameState.value !== 'playing') return
  
  gameState.value = 'feedback'
  
  const reactionTime = Date.now() - questionStartTime.value
  const isCorrect = choice === currentQuestion.value.target
  
  // 進捗記録
  recordAttempt(currentQuestion.value.target, isCorrect, reactionTime)
  attempts.value.push({
    phoneme: currentQuestion.value.target.symbol,
    stage: currentPhonemeStage.value,
    learningStage: currentLearningStage.value,
    correct: isCorrect,
    reactionTime,
    selectedChoice: choice.symbol,
    timestamp: Date.now()
  })
  
  // 適応学習エンジンの更新
  adaptiveLearningEngine.updateLearnerModel(
    currentQuestion.value.target,
    isCorrect,
    reactionTime,
    choice
  )
  
  if (isCorrect) {
    score.value += 100 + (currentLearningStage.value * 25)
    feedback.value = `Perfect! That's the ${currentQuestion.value.target.symbol} sound!`
    feedbackType.value = 'correct'
  } else {
    lives.value--
    feedback.value = `Not quite. The correct answer was "${currentQuestion.value.target.symbol}".`
    feedbackType.value = 'incorrect'
  }
  
  setTimeout(() => {
    if (lives.value <= 0 && !isCorrect) {
      gameState.value = 'complete'
    } else {
      gameState.value = 'playing'
      loadNextQuestion()
    }
  }, currentQuestion.value?.settings.visualSettings.feedbackDelay || 2500)
}

const getChoiceButtonClass = (choice) => {
  const baseClass = 'transition-all duration-200 transform hover:scale-105'
  
  if (gameState.value === 'feedback') {
    if (choice === currentQuestion.value.target) {
      return `${baseClass} bg-green-500 border-green-600 text-white scale-105`
    } else {
      return `${baseClass} bg-red-500/50 border-red-400`
    }
  }
  
  return baseClass
}

const getNextStageName = () => {
  const stageOrder = ['stage1A', 'stage1B', 'stage1C', 'stage2A', 'stage2B', 'stage2C']
  const currentIndex = stageOrder.indexOf(currentPhonemeStage.value)
  const nextStage = stageOrder[currentIndex + 1]
  return nextStage ? nextStage.toUpperCase() : 'Next Level'
}

const getStageDescription = (stage) => {
  const descriptions = {
    stage1A: 'Foundation (s, a, t)',
    stage1B: 'Expansion (i, p, n)', 
    stage1C: 'Completion (c, k, e)',
    stage2A: 'Intermediate (h, r, m, d)',
    stage2B: 'Advanced (g, o, u, l)',
    stage2C: 'Complex (f, b, j, z)'
  }
  return descriptions[stage] || 'Unknown Stage'
}

const advanceToNextStage = () => {
  const success = progressAdvanceStage()
  if (success) {
    gameState.value = 'playing'
    loadNextQuestion()
  } else {
    // 学習ステージの進級
    if (currentLearningStage.value < 3) {
      currentLearningStage.value++
      gameState.value = 'playing'
      loadNextQuestion()
    }
  }
}

const resetGame = () => {
  score.value = 0
  lives.value = 3
  attempts.value = []
  showIntro.value = true
  gameState.value = 'intro'
}

const applySettings = () => {
  updateCurrentPhonemes()
  resetGame()
  showSettings.value = false
}

const handleBack = () => {
  router.back()
}

// ライフサイクル
onMounted(() => {
  updateCurrentPhonemes()
  initializePhonemeData()
})

// 音素ステージの変更を監視
watch(currentPhonemeStage, () => {
 if (gameState.value === 'playing') {
   loadNextQuestion()
 }
})

// 学習ステージの変更を監視
watch(currentLearningStage, () => {
 if (gameState.value === 'playing') {
   loadNextQuestion()
 }
})

// 難易度レベルの変更を監視
watch(difficultyLevel, () => {
 if (gameState.value === 'playing') {
   loadNextQuestion()
 }
})

// 習得音素数の監視（成果表示用）
watch(masteredCount, (newCount, oldCount) => {
 if (newCount > oldCount) {
   // 新しい音素を習得した時の特別エフェクト
   setTimeout(() => {
     showMasteryNotification(newCount)
   }, 1000)
 }
})

// 習得通知の表示
const showMasteryNotification = (count) => {
 // 特定の習得数での特別な祝福
 const milestones = {
   3: "🎉 First 3 phonemes mastered! Great start!",
   6: "🌟 6 phonemes down! You're building strong foundations!",
   10: "🚀 10 phonemes mastered! Halfway through Stage 1A!",
   15: "💫 15 phonemes! You're becoming a phonics expert!",
   22: "🏆 22 phonemes! Over half of all English sounds mastered!",
   30: "🎊 30 phonemes! You're approaching advanced level!",
   40: "🏅 40 phonemes! Almost all English sounds mastered!",
   44: "👑 ALL 44 PHONEMES MASTERED! You are a phonics champion!"
 }
 
 if (milestones[count]) {
   // カスタム通知を表示（実装は必要に応じて）
   console.log(`Achievement unlocked: ${milestones[count]}`)
 }
}

// script setup内に追加
const selectChoice = (idx, choice) => {
  // 選択肢の音を再生
  playPhonemeSound(choice, idx)
  // 選択状態を更新
  selectedIdx.value = idx
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

.energy-gauge {
  background: linear-gradient(90deg, 
    #60A5FA 0%, 
    #A78BFA 50%, 
    #F472B6 100%);
  transition: width 0.5s ease;
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

/* Existing animations preserved */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.animate-correct {
  animation: correct-bounce 0.6s ease-out;
}

@keyframes correct-bounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Feedback transitions */
.feedback-enter-active, .feedback-leave-active {
  transition: all 0.5s ease;
}

.feedback-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-50px);
}

.feedback-leave-to {
  opacity: 0;
  transform: scale(1.2) translateY(50px);
}

.bounce-enter-active {
  animation: bounce-in 0.5s ease-out;
}

.bounce-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% { transform: scale(0) translateY(100px); opacity: 0; }
  50% { transform: scale(1.1) translateY(-20px); opacity: 0.8; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes bounce-out {
  0% { transform: scale(1) translateY(0); opacity: 1; }
  100% { transform: scale(0) translateY(-50px); opacity: 0; }
}
</style>