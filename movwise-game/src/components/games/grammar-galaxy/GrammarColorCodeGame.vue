<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    <!-- Game Header -->
    <header class="relative z-10 galaxy-card mx-4 mt-4 rounded-3xl">
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button 
              @click="() => {
                console.log('Header back button clicked');
                try {
                  handleBackButton();
                  console.log('handleBackButton() called successfully');
                } catch (err) {
                  console.error('Error calling handleBackButton():', err);
                }
              }"
              @mousedown="() => { console.log('Header back button mousedown'); playSound('click'); }"
              class="galaxy-button galaxy-button-secondary"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h1 class="text-2xl font-bold galaxy-text-primary cosmic-glow">
              🎨 Grammar Color Code
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="game-stats">
              <div class="stat-item">
                <span class="stat-label">スコア</span>
                <span class="stat-value">{{ gameState.score }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">連続正解</span>
                <span class="stat-value">{{ gameState.streak }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">時間</span>
                <span class="stat-value">{{ formatTime(gameState.timeRemaining) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">コンテンツを読み込み中...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="error-overlay">
      <div class="error-content">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mb-4" />
        <h2 class="text-xl font-bold text-red-400 mb-2">読み込みエラー</h2>
        <p class="text-gray-300 mb-4">{{ errorMessage }}</p>
        <button @click="retryLoading" class="retry-button">
          再試行
        </button>
      </div>
    </div>

    <!-- Game Instructions -->
    <div v-if="!gameState.started && !isLoading && !hasError" class="instructions-overlay">
      <div class="instructions-modal galaxy-card">
        <h2 class="text-3xl font-bold text-center mb-6 galaxy-text-primary cosmic-glow">🎨 Color Code ゲーム</h2>
        
        <!-- Color Rules -->
        <div class="color-rules mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">色分けルール</h3>
          <div class="flex flex-wrap justify-center gap-3">
            <div class="color-rule-card-compact blue-family">
              <div class="color-icon-compact">🔵</div>
              <div class="color-content-compact">
                <div class="color-name-compact">青ファミリー</div>
                <div class="color-description-compact">Be動詞系</div>
              </div>
            </div>
            <div class="color-rule-card-compact red-family">
              <div class="color-icon-compact">🔴</div>
              <div class="color-content-compact">
                <div class="color-name-compact">赤ファミリー</div>
                <div class="color-description-compact">一般動詞系</div>
              </div>
            </div>
            <div class="color-rule-card-compact yellow-family">
              <div class="color-icon-compact">🟡</div>
              <div class="color-content-compact">
                <div class="color-name-compact">黄ファミリー</div>
                <div class="color-description-compact">疑問詞系</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Rules -->
        <div class="game-rules mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">ゲームの進め方</h3>
          <ol class="rules-list-galaxy">
            <li>同じ色ファミリーの要素をドラッグ&ドロップで組み合わせよう</li>
            <li>正しい文法の組み合わせで文を完成させよう</li>
            <li>正解すると要素が消えて得点獲得！</li>
            <li>制限時間内にできるだけ多くの文を作ろう</li>
          </ol>
        </div>

        <!-- Difficulty Selection -->
        <div class="difficulty-selection">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">難易度を選択</h3>
          <div class="difficulty-buttons-galaxy">
            <button 
              v-for="level in difficultyLevels"
              :key="level.id"
              @click="selectDifficulty(level.id)"
              class="difficulty-button-galaxy"
              :class="{ 'selected': selectedDifficulty === level.id }"
            >
              <div class="difficulty-name-galaxy">{{ level.name }}</div>
              <div class="difficulty-description-galaxy">{{ level.description }}</div>
              <div class="difficulty-details-galaxy">
                <div>時間: {{ level.timeLimit }}秒</div>
                <div>目標: {{ level.targetSentences }}文</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Mode Selection -->
        <div class="mode-selection mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">モード選択</h3>
          <div class="mode-buttons-galaxy">
            <button 
              @click="gameMode = 'normal'"
              class="mode-button-galaxy"
              :class="{ 'selected': gameMode === 'normal' }"
            >
              <CursorArrowRaysIcon class="w-6 h-6 mb-2 cosmic-glow" />
              <span>通常モード</span>
              <small>ドラッグ&ドロップ</small>
            </button>
            <button 
              @click="gameMode = 'kids'"
              class="mode-button-galaxy"
              :class="{ 'selected': gameMode === 'kids' }"
            >
              <HandRaisedIcon class="w-6 h-6 mb-2 cosmic-glow" />
              <span>かんたんモード</span>
              <small>クリックのみ</small>
            </button>
          </div>
        </div>

        <div class="button-controls">
          <button 
            @click="() => { 
              console.log('Modal back button clicked - attempting navigation'); 
              try {
                goHome();
                console.log('goHome() called successfully');
              } catch (err) {
                console.error('Error calling goHome():', err);
              }
            }"
            @mousedown="() => { console.log('Modal back button mousedown'); playSound('click'); }"
            class="galaxy-button galaxy-button-secondary mr-4"
          >
            戻る
          </button>
          <button 
            @click="startGame"
            class="start-game-button-galaxy"
            :disabled="!selectedDifficulty"
          >
            ゲーム開始
          </button>
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <main v-if="gameState.started && !isLoading && !hasError" class="game-main">
      <div class="max-w-6xl mx-auto px-6">
        <!-- Progress Bar -->
        <div class="progress-section mb-6">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${timeProgress}%` }"
            ></div>
          </div>
          <div class="progress-info">
            <span>完成した文: {{ gameState.completedSentences }}</span>
            <span>目標: {{ gameState.targetSentences }}</span>
          </div>
        </div>

        <!-- Current Sentence Target -->
        <div v-if="currentProblem" class="sentence-target mb-6">
          <h3 class="text-lg font-bold mb-2">作る文:</h3>
          <div class="target-sentence">
            {{ currentProblem.hint_ja }}
          </div>
          <div class="target-hint">
            <div class="hint-header">
              <LightBulbIcon class="w-5 h-5" />
              <span>ヒント</span>
              <button 
                @click="toggleHint" 
                class="hint-toggle"
                :class="{ 'active': showHint }"
              >
                {{ showHint ? '隠す' : '表示' }}
              </button>
            </div>
            <div v-if="showHint" class="hint-content">
              <div class="hint-text">この文を英語で作ってみましょう！</div>
              <div class="hint-example" v-if="currentProblem.example">
                例: {{ currentProblem.example }}
              </div>
            </div>
          </div>
        </div>

        <!-- Game Grid -->
        <div class="game-grid">
          <!-- Drop Zones -->
          <div class="drop-zones-container">
            <div class="drop-zones">
              <div 
                v-for="zone in dropZones"
                :key="zone.id"
                class="drop-zone galaxy-card"
                :class="{ 
                  'drop-active': zone.isActive,
                  'drop-valid': zone.isValid,
                  'drop-invalid': zone.isInvalid,
                  'kids-mode': gameMode === 'kids'
                }"
                :data-zone-id="zone.id"
                @drop="handleDrop($event, zone.id)"
                @dragover="handleDragOver($event, zone.id)"
                @dragleave="handleDragLeave(zone.id)"
                @click="handleZoneClick(zone.id)"
                @touchstart.passive="handleTouchStart($event, zone.id)"
                @touchmove.prevent="handleTouchMove($event, zone.id)"
                @touchend.passive="handleTouchEnd($event, zone.id)"
              >
                <div v-if="zone.element" class="dropped-element">
                  <GrammarElement 
                    :element="zone.element"
                    :is-dropped="true"
                    :kids-mode="gameMode === 'kids'"
                    :show-japanese-hint="gameMode === 'kids'"
                    @remove="removeFromZone(zone.id)"
                  />
                </div>
                <div v-else class="drop-placeholder">
                  <span class="drop-label">{{ zone.label }}</span>
                  <span class="drop-hint">{{ zone.hint }}</span>
                </div>
              </div>
            </div>
            
            <!-- Validate Button -->
            <button 
              @click="validateSentence"
              class="validate-button"
              :disabled="!canValidate"
              :class="{ 'ready': canValidate, 'kids-mode': gameMode === 'kids' }"
            >
              <CheckIcon class="w-5 h-5" />
              文を確認
            </button>
          </div>

          <!-- Grammar Elements Pool -->
          <div class="elements-pool">
            <h3 class="pool-title">使用可能な要素</h3>
            
            <!-- Debug Information -->
            <div v-if="showDebugInfo" class="debug-elements mb-2">
              <p class="text-xs text-gray-400">
                問題セット: {{ currentProblemIndex + 1 }}/{{ totalProblems }} | 
                要素: {{ availableElements.length }}個 | 
                使用済み: {{ availableElements.filter(el => el.isUsed).length }}個
              </p>
            </div>
            
            <!-- Loading Elements -->
            <div v-if="elementsLoading" class="loading-elements">
              <div class="loading-spinner-small"></div>
              <p class="text-gray-400">要素を生成中...</p>
            </div>
            
            <!-- No Elements -->
            <div v-else-if="availableElements.length === 0" class="no-elements-message">
              <p class="text-gray-400">要素がありません</p>
              <button @click="generateProblem" class="text-blue-400 underline">
                新しい問題を生成
              </button>
            </div>
            
            <!-- Elements Grid -->
            <div v-else class="elements-grid" :class="{ 'kids-mode': gameMode === 'kids' }">
              <GrammarElement
                v-for="element in availableElements"
                :key="element.id"
                :element="element"
                :is-draggable="gameMode === 'normal' && !element.isUsed"
                :kids-mode="gameMode === 'kids'"
                :show-japanese-hint="gameMode === 'kids'"
                :data-element-id="element.id"
                @drag-start="handleDragStart"
                @drag-end="handleDragEnd"
                @click="handleElementClick"
                @touchstart.passive="handleElementTouchStart($event, element)"
                @touchmove.prevent="handleElementTouchMove($event, element)"
                @touchend.passive="handleElementTouchEnd($event, element)"
              />
            </div>
            
            <!-- All Elements Used -->
            <div v-if="availableElements.length > 0 && availableElements.filter(el => !el.isUsed).length === 0" class="all-used-message">
              <p class="text-yellow-400">すべての要素が使用されています</p>
              <button @click="generateProblem" class="text-blue-400 underline">
                新しい問題を生成
              </button>
            </div>
          </div>
        </div>

        <!-- Combo Display -->
        <div v-if="gameState.combo > 1" class="combo-display">
          <div class="combo-text">{{ gameState.combo }}連続正解！</div>
          <div class="combo-multiplier">×{{ getComboMultiplier() }}</div>
        </div>

        <!-- Visual Feedback Display -->
        <div v-if="showMeaningImage" class="meaning-display">
          <div class="meaning-content">
            <div class="meaning-icon">
              {{ currentMeaningVisual.icon }}
            </div>
            <div class="meaning-text">
              {{ currentMeaningVisual.description_ja }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Game Result Modal -->
    <GameResultModal 
      v-if="gameState.finished"
      :score="gameState.score"
      :completed-sentences="gameState.completedSentences"
      :target-sentences="gameState.targetSentences"
      :accuracy="gameState.accuracy"
      :time-taken="gameTime - gameState.timeRemaining"
      :combo-best="gameState.bestCombo"
      :is-new-record="gameState.isNewRecord"
      @play-again="resetGame"
      @go-home="goHome"
    />

    <!-- Particle Effects -->
    <ParticleEffect 
      v-if="showParticles"
      :type="particleType"
      @complete="showParticles = false"
    />

    <!-- Debug Info - Hidden -->
    <div v-if="false" class="debug-info">
      <p>Planet ID: {{ planetId }}</p>
      <p>CSV Loaded: {{ csvDataLoaded }}</p>
      <p>Current Problem: {{ currentProblemIndex + 1 }}/{{ totalProblems }}</p>
      <p>Game Mode: {{ gameMode }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import GrammarElement from '@/components/games/grammar-galaxy/game-elements/GrammarElement.vue'
import GameResultModal from '@/components/games/grammar-galaxy/shared/GameResultModal.vue'
import ParticleEffect from '@/components/games/grammar-galaxy/shared/ParticleEffect.vue'
import Icon from '@/components/shared/Icon.vue'
import {
  ArrowLeftIcon,
  LightBulbIcon,
  CheckIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// データ管理システム
import grammarContentManager from '@/data/grammarContentManager.js'
import { problemGenerator } from '@/components/games/grammar-galaxy/shared/problemGenerator.js'

const router = useRouter()
const route = useRoute()
const grammarStore = useGrammarGalaxyStore()

// Debug and development flags
const showDebugInfo = ref(false)

// Data loading state
const isLoading = ref(true)
const elementsLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const csvDataLoaded = ref(false)

// Game mode
const gameMode = ref('normal') // 'normal' or 'kids'

// CSV Data
const grammarContent = ref([])
const problemSets = ref([])
const visualElements = ref([])

// Current problem state
const currentProblemIndex = ref(0)
const currentProblem = ref(null)
const totalProblems = ref(0)

// Game state
const gameState = ref({
  started: false,
  isPlaying: false,
  finished: false,
  score: 0,
  streak: 0,
  combo: 0,
  bestCombo: 0,
  timeRemaining: 0,
  completedSentences: 0,
  targetSentences: 0
})

// 問題管理用の状態を追加
const problems = ref([])

// Game settings
const selectedDifficulty = ref('normal')
const planetId = computed(() => route.params.planetId || 'beVerb')
const currentGameId = 'grammarColorCode'

// Element selection for kids mode
const selectedElementForKids = ref(null)
const selectedZoneForKids = ref(null)

// Difficulty levels with Eiken support
const difficultyLevels = [
  {
    id: 'eiken5',
    name: '英検5級レベル',
    timeLimit: 90,
    targetSentences: 3,
    level: 'beginner',
    eiken_level: '5',
    description: 'be動詞・一般動詞の基本'
  },
  {
    id: 'eiken4', 
    name: '英検4級レベル',
    timeLimit: 60,
    targetSentences: 5,
    level: 'intermediate',
    eiken_level: '4',
    description: '疑問文・過去形'
  },
  {
    id: 'eiken3',
    name: '英検3級レベル',
    timeLimit: 45,
    targetSentences: 7,
    level: 'advanced',
    eiken_level: '3',
    description: '助動詞・完了形'
  }
]

// Game elements
const availableElements = ref([])
const dropZones = ref([
  { 
    id: 'subject', 
    label: '主語', 
    hint: '誰が？何が？', 
    element: null, 
    isActive: false, 
    isValid: false, 
    isInvalid: false 
  },
  { 
    id: 'verb', 
    label: '動詞', 
    hint: 'どうする？', 
    element: null, 
    isActive: false, 
    isValid: false, 
    isInvalid: false 
  },
  { 
    id: 'object', 
    label: '目的語/補語', 
    hint: '何を？どんな？', 
    element: null, 
    isActive: false, 
    isValid: false, 
    isInvalid: false 
  }
])

// Visual feedback
const showParticles = ref(false)
const particleType = ref('success')
const showMeaningImage = ref(false)
const currentMeaningVisual = ref(null)

// Drag and drop state
const draggedElement = ref(null)

// Timer
let gameTimer = null
const gameTime = ref(60)

// Computed properties
const timeProgress = computed(() => {
  return (gameState.value.timeRemaining / gameTime.value) * 100
})

const canValidate = computed(() => {
  return dropZones.value.every(zone => zone.element !== null)
})

// Data loading methods
const loadCSVData = async () => {
  try {
    isLoading.value = true
    hasError.value = false
    
    console.log('Loading CSV data...')
    
    // Load all CSV data
    console.log('📥 grammarContentManager.loadAllData() 開始')
    try {
      const loadResult = await grammarContentManager.loadAllData()
      console.log('📥 grammarContentManager.loadAllData() 完了:', loadResult)
      
      grammarContent.value = grammarContentManager.getGrammarContent() || []
      problemSets.value = grammarContentManager.getProblemSets() || []
      
    } catch (grammarManagerError) {
      console.error('❌ grammarContentManager.loadAllData() エラー:', grammarManagerError)
      // エラーの場合は空の配列で初期化
      grammarContent.value = []
      problemSets.value = []
    }
    
    console.log('📊 grammarContentManager から取得したデータ:')
    console.log('- grammarContent.value:', grammarContent.value.length)
    console.log('- problemSets.value:', problemSets.value.length)
    
    // Visual elementsを直接JSONから読み込み
    try {
      console.log('📥 Visual elements JSON読み込み開始')
      const visualResponse = await fetch('/data/csv/visual_elements.json')
      console.log('📥 Visual elements レスポンス:', visualResponse.status)
      visualElements.value = await visualResponse.json()
      console.log('📥 Visual elements読み込み完了:', visualElements.value.length)
    } catch (error) {
      console.warn('Visual elements load failed, using empty array:', error)
      visualElements.value = []
    }
    
    console.log('CSV data loaded:', {
      content: Array.isArray(grammarContent.value) ? grammarContent.value.length : 0,
      problems: Array.isArray(problemSets.value) ? problemSets.value.length : 0,
      visuals: Array.isArray(visualElements.value) ? visualElements.value.length : 0
    })
    
    csvDataLoaded.value = true
    
    // Initialize problem generator
    console.log('🔧 Initializing problemGenerator with data:')
    console.log('- Grammar content:', grammarContent.value.length)
    console.log('- Problem sets:', problemSets.value.length)
    console.log('- Visual elements:', visualElements.value.length)
    
    // データが0の場合は直接新しいJSONファイルから読み込み
    if (problemSets.value.length === 0 || grammarContent.value.length === 0) {
      console.log('⚠️ grammarContentManagerからデータが取得できないため、新しいJSONから直接読み込みます')
      try {
        console.log('📂 新しいJSON ファイル直接読み込み開始...')
        const [problemResponse, grammarResponse] = await Promise.all([
          fetch('/data/csv/problem_sets.json'),
          fetch('/data/csv/grammar_content.json')
        ])
        console.log('📂 Response status:', {
          problemSets: problemResponse.status,
          grammarContent: grammarResponse.status
        })
        if (!problemResponse.ok) {
          throw new Error(`Problem sets fetch failed: ${problemResponse.status}`)
        }
        if (!grammarResponse.ok) {
          throw new Error(`Grammar content fetch failed: ${grammarResponse.status}`)
        }
        problemSets.value = await problemResponse.json()
        grammarContent.value = await grammarResponse.json()
        console.log('✅ 新しいJSON読み込み完了:', {
          problemSets: problemSets.value.length,
          grammarContent: grammarContent.value.length
        })
        
        // Eiken level分布を確認
        const eikenDistribution = {}
        problemSets.value.forEach(problem => {
          const eikenLevel = problem.eiken_level || 'unknown'
          eikenDistribution[eikenLevel] = (eikenDistribution[eikenLevel] || 0) + 1
        })
        console.log('📊 Eiken Level分布:', eikenDistribution)
        
        // サンプルデータ表示
        if (problemSets.value.length > 0) {
          console.log('📋 Problem sets sample (with eiken_level):', problemSets.value[0])
        }
        if (grammarContent.value.length > 0) {
          console.log('📝 Grammar content sample (with eiken_level):', grammarContent.value[0])
        }
      } catch (error) {
        console.error('❌ 新しいJSON読み込みも失敗:', error)
        console.error('❌ エラー詳細:', error.message)
      }
    }
    
    console.log('🚀 problemGenerator.initialize()を呼び出し直前のデータ確認:')
    console.log('- grammarContent.value type:', typeof grammarContent.value, 'length:', grammarContent.value?.length)
    console.log('- problemSets.value type:', typeof problemSets.value, 'length:', problemSets.value?.length)
    console.log('- visualElements.value type:', typeof visualElements.value, 'length:', visualElements.value?.length)
    
    if (problemSets.value?.length > 0) {
      console.log('- problemSets.value[0]:', problemSets.value[0])
    }
    
    problemGenerator.initialize(grammarContent.value, problemSets.value, visualElements.value)
    
    // 初期化後の確認
    console.log('🔍 initialize()実行後のproblemGenerator状態確認:')
    console.log('- problemGenerator.problemSets.length:', problemGenerator.problemSets?.length)
    console.log('- problemGenerator.contentData.length:', problemGenerator.contentData?.length)
    console.log('- problemGenerator.isInitialized:', problemGenerator.isInitialized)
    
  } catch (error) {
    console.error('Error loading CSV data:', error)
    hasError.value = true
    errorMessage.value = error.message || 'データの読み込みに失敗しました'
  } finally {
    isLoading.value = false
  }
}

const retryLoading = () => {
  loadCSVData()
}

// Game methods
const selectDifficulty = (difficultyId) => {
  selectedDifficulty.value = difficultyId
  const difficulty = difficultyLevels.find(d => d.id === difficultyId)
  gameTime.value = difficulty.timeLimit
  gameState.value.targetSentences = difficulty.targetSentences
  console.log(`Selected difficulty: ${difficulty.name} (Eiken Level ${difficulty.eiken_level})`)
}

const startGame = async () => {
  console.log('🎮 ゲーム開始ボタンがクリックされました')
  console.log('📊 データ読み込み状況:', csvDataLoaded.value)
  
  if (!csvDataLoaded.value) {
    console.error('CSV data not loaded')
    return
  }
  
  console.log('🎯 ゲーム状態を開始に設定')
  gameState.value.started = true
  gameState.value.isPlaying = true
  gameState.value.timeRemaining = gameTime.value
  
  console.log('🔍 ゲーム状態確認:', {
    started: gameState.value.started,
    isPlaying: gameState.value.isPlaying,
    isLoading: isLoading.value,
    hasError: hasError.value
  })
  
  // 問題を一括生成
  const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty.value)
  const generatedProblems = await problemGenerator.generateMultipleProblems(
    gameState.value.targetSentences,
    {
      level: difficulty.level,
      eiken_level: difficulty.eiken_level,
      planetId: planetId.value
    }
  )
  
  if (!generatedProblems || generatedProblems.length === 0) {
    throw new Error('問題の生成に失敗しました')
  }
  
  problems.value = generatedProblems
  currentProblemIndex.value = 0
  
  // 最初の問題を表示
  await showCurrentProblem()
  
  // タイマー開始
  startTimer()
  
  // 開始音を再生
  playSound('gameStart')
}

const showCurrentProblem = async () => {
  try {
    elementsLoading.value = true
    
    const problem = problems.value[currentProblemIndex.value]
    currentProblem.value = {
      target_sentence: problem.targetSentence,
      hint_ja: problem.hintJapanese,
      words_pool: problem.elements?.filter(el => el.isCorrect) || []
    }
    
    availableElements.value = problem.elements?.map((element, index) => ({
      ...element,
      id: `element-${currentProblemIndex.value}-${index}`,
      isUsed: false
    })) || []
    
    // ドロップゾーンをクリア
    clearDropZones()
    
  } catch (error) {
    console.error('Error showing problem:', error)
    hasError.value = true
    errorMessage.value = '問題の表示に失敗しました'
  } finally {
    elementsLoading.value = false
  }
}

const startTimer = () => {
  gameTimer = setInterval(() => {
    gameState.value.timeRemaining--
    
    if (gameState.value.timeRemaining <= 0) {
      endGame()
    }
  }, 1000)
}

// Drag and drop handlers
const handleDragStart = (element) => {
  if (gameMode.value !== 'normal') return
  draggedElement.value = element
}

const handleDragEnd = () => {
  // Reset all drop zone states
  dropZones.value.forEach(zone => {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  draggedElement.value = null
}

const handleDragOver = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  
  event.preventDefault()
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone && !zone.element) {
    zone.isActive = true
    
    if (draggedElement.value) {
      zone.isValid = isValidDrop(draggedElement.value, zoneId)
      zone.isInvalid = !zone.isValid
    }
  }
}

const handleDragLeave = (zoneId) => {
  if (gameMode.value !== 'normal') return
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone) {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  }
}

const handleDrop = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  event.preventDefault()
  console.log(`[handleDrop] ドロップイベント発火: zoneId=${zoneId}`)
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone) {
    console.warn(`[handleDrop] ドロップゾーンが見つかりません: ${zoneId}`)
    return
  }
  if (zone.element) {
    console.warn(`[handleDrop] 既に要素が配置されています: zoneId=${zoneId}`)
    return
  }
  if (!draggedElement.value) {
    console.warn('[handleDrop] draggedElementがnullです')
    return
  }
  const valid = isValidDrop(draggedElement.value, zoneId)
  console.log(`[handleDrop] バリデーション結果: valid=${valid}`)
  if (!valid) {
    playSound('error')
    showErrorFeedback()
    console.error(`[handleDrop] ドロップ失敗: element=${draggedElement.value.word}, zoneId=${zoneId}`)
    return
  }
  placeElementInZone(draggedElement.value, zoneId)
  playSound('drop')
  console.log(`[handleDrop] ドロップ成功: element=${draggedElement.value.word}, zoneId=${zoneId}`)
}

// Kids mode handlers
const handleElementClick = (element) => {
  if (gameMode.value !== 'kids' || element.isUsed) return
  
  if (selectedElementForKids.value?.id === element.id) {
    // Deselect if clicking the same element
    selectedElementForKids.value = null
    return
  }
  
  selectedElementForKids.value = element
  
  // Highlight valid zones for this element
  dropZones.value.forEach(zone => {
    if (!zone.element) {
      zone.isValid = isValidDrop(element, zone.id)
      zone.isInvalid = !zone.isValid
    }
  })
  
  playSound('select')
}

const handleZoneClick = (zoneId) => {
  if (gameMode.value !== 'kids') return
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone || zone.element) return
  
  if (selectedElementForKids.value) {
    if (isValidDrop(selectedElementForKids.value, zoneId)) {
      placeElementInZone(selectedElementForKids.value, zoneId)
      selectedElementForKids.value = null
      
      // Clear zone highlights
      dropZones.value.forEach(z => {
        z.isValid = false
        z.isInvalid = false
      })
      
      playSound('drop')
    } else {
      playSound('error')
      showErrorFeedback()
    }
  }
}

// Element placement logic
const placeElementInZone = (element, zoneId) => {
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone) {
    console.warn(`[placeElementInZone] 指定ゾーンが見つかりません: ${zoneId}`)
    return
  }
  // Place element in zone
  zone.element = { ...element }
  // Mark element as used
  const elementInPool = availableElements.value.find(e => e.id === element.id)
  if (elementInPool) {
    elementInPool.isUsed = true
    console.log(`[placeElementInZone] isUsedフラグをtrueに: ${elementInPool.word}`)
  } else {
    console.warn(`[placeElementInZone] availableElementsに要素が見つかりません: ${element.word}`)
  }
  // DropZoneのelement設定確認
  console.log(`[placeElementInZone] zoneId=${zoneId} に要素を配置:`, zone.element)
  // Reset zone states
  zone.isActive = false
  zone.isValid = false
  zone.isInvalid = false
}

const removeFromZone = (zoneId) => {
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone || !zone.element) return
  
  // Return element to pool
  const element = availableElements.value.find(e => e.id === zone.element.id)
  if (element) {
    element.isUsed = false
  }
  
  zone.element = null
}

const isValidDrop = (element, zoneId) => {
  if (!currentProblem.value) return false

  // availableElementsからposition一致を直接判定
  const found = availableElements.value.find(e => e.id === element.id)
  if (found) {
    const match = found.position === zoneId
    console.log(`[isValidDrop] element: ${found.word}, position: ${found.position}, zoneId: ${zoneId}, match: ${match}`)
    return match
  }
  // フォールバック: element.positionとzoneIdの直接比較
  const fallbackMatch = element.position === zoneId
  console.log(`[isValidDrop] Fallback check: element.position=${element.position}, zoneId=${zoneId}, match=${fallbackMatch}`)
  return fallbackMatch
}

const validateSentence = async () => {
  if (!canValidate.value) return
  
  const isCorrect = checkAnswer()
  
  if (isCorrect) {
    // 正解時の処理
    gameState.value.score += 10
    gameState.value.streak++
    gameState.value.completedSentences++
    
    // 次の問題へ
    if (currentProblemIndex.value < problems.value.length - 1) {
      currentProblemIndex.value++
      await showCurrentProblem()
    } else {
      // 全問題完了
      endGame()
    }
    
    playSound('correct')
  } else {
    // 不正解時の処理
    gameState.value.streak = 0
    playSound('incorrect')
  }
}

const checkAnswer = () => {
  if (!currentProblem.value) return false
  
  const subject = dropZones.value[0].element
  const verb = dropZones.value[1].element
  const object = dropZones.value[2].element
  
  if (!subject || !verb || !object) return false
  
  // Check against expected words in problem
  const expectedWords = currentProblem.value.words_pool || []
  if (expectedWords.length === 3) {
    const expectedSubject = expectedWords.find(w => w.position === 'subject')
    const expectedVerb = expectedWords.find(w => w.position === 'verb')
    const expectedObject = expectedWords.find(w => w.position === 'object')
    
    return (
      expectedSubject && subject.word === expectedSubject.word &&
      expectedVerb && verb.word === expectedVerb.word &&
      expectedObject && object.word === expectedObject.word
    )
  }
  
  return false
}

const showMeaningFeedback = async () => {
  if (!currentProblem.value || !visualElements.value.length) return
  
  try {
    // Find visual element for current sentence
    const sentence = currentProblem.value.target_sentence.toLowerCase()
    const visual = visualElements.value.find(v => 
      sentence.includes(v.keyword.toLowerCase())
    )
    
    if (visual) {
      currentMeaningVisual.value = visual
      showMeaningImage.value = true
      
      // Hide after 3 seconds
      setTimeout(() => {
        showMeaningImage.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error showing meaning feedback:', error)
  }
}

const getComboMultiplier = () => {
  if (gameState.value.combo >= 5) return 2.0
  if (gameState.value.combo >= 3) return 1.5
  if (gameState.value.combo >= 2) return 1.2
  return 1.0
}

const clearDropZones = () => {
  dropZones.value.forEach(zone => {
    zone.element = null
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  
  // Clear kids mode selection
  selectedElementForKids.value = null
  selectedZoneForKids.value = null
}

const showSuccessFeedback = () => {
  particleType.value = 'success'
  showParticles.value = true
}

const showErrorFeedback = () => {
  particleType.value = 'error'
  showParticles.value = true
}

const endGame = () => {
  gameState.value.isPlaying = false
  gameState.value.finished = true
  
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  
  // Calculate stars earned
  const starsEarned = calculateStarsEarned()
  const completionTime = gameTime.value - gameState.value.timeRemaining
  
  // Update grammar store with results
  grammarStore.completeGame(
    planetId.value,
    currentGameId,
    gameState.value.score,
    starsEarned,
    completionTime
  )
  
  // Check if it's a new record
  const planet = grammarStore.getPlanetInfo(planetId.value)
  const game = planet?.games?.find(g => g.id === currentGameId)
  gameState.value.isNewRecord = game && gameState.value.score > (game.bestScore || 0)
  
  playSound('gameEnd')
}

const calculateStarsEarned = () => {
  let stars = 0
  
  const completionRate = (gameState.value.completedSentences / gameState.value.targetSentences) * 100
  
  if (completionRate >= 60) stars++
  if (gameState.value.accuracy >= 80) stars++
  if (completionRate >= 100 && gameState.value.accuracy >= 85) stars++
  
  return stars
}

const resetGame = () => {
  console.log('🔄 resetGame called')
  // Reset all game state properly using .value
  gameState.value.started = false
  gameState.value.isPlaying = false
  gameState.value.finished = false
  gameState.value.score = 0
  gameState.value.streak = 0
  gameState.value.combo = 0
  gameState.value.bestCombo = 0
  gameState.value.timeRemaining = 0
  gameState.value.completedSentences = 0
  gameState.value.accuracy = 0
  gameState.value.totalAttempts = 0
  gameState.value.correctAttempts = 0
  gameState.value.isNewRecord = false
  // Clear states
  clearDropZones()
  currentProblemIndex.value = 0
  currentProblem.value = null
  availableElements.value = []
  problems.value = []
  // Clear timer
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  // Reset problem generator used problems to get fresh problems
  problemGenerator.resetUsedProblems()
  // 最新データで初期化
  problemGenerator.initialize(grammarContent.value, problemSets.value, visualElements.value)
  console.log('✅ resetGame completed, gameState.finished:', gameState.value.finished)
  console.log('🟢 problemSets:', problemSets.value.length, 'grammarContent:', grammarContent.value.length)
}

const goHome = () => {
  try {
    console.log('Navigating to Grammar Galaxy Hub...')
    
    // 第一選択肢: nameでナビゲーション
    router.push({ name: 'grammar-galaxy-hub' })
      .then(() => {
        console.log('Navigation to hub successful')
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

const resetToLevelSelection = () => {
  try {
    console.log('Resetting to level selection...')
    
    // ゲーム状態をリセット
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
    }
    
    // レベル選択モーダルに戻るための状態リセット
    gameState.value.started = false
    gameState.value.isPlaying = false
    gameState.value.finished = false
    gameState.value.score = 0
    gameState.value.streak = 0
    gameState.value.combo = 0
    gameState.value.timeRemaining = 0
    gameState.value.completedSentences = 0
    
    // ゲームデータをクリア
    clearDropZones()
    currentProblemIndex.value = 0
    currentProblem.value = null
    availableElements.value = []
    problems.value = []
    
    // 難易度選択もリセットしたい場合はコメントアウトを外す
    // selectedDifficulty.value = ''
    
    console.log('Successfully reset to level selection')
  } catch (error) {
    console.error('Error resetting to level selection:', error)
  }
}

// 別名: 後方互換性のため
const goBackToLevelSelection = resetToLevelSelection

const handleBackButton = () => {
  try {
    console.log('Back button clicked, current game state:', {
      started: gameState.value.started,
      isPlaying: gameState.value.isPlaying,
      finished: gameState.value.finished
    })
    
    if (gameState.value.isPlaying) {
      // ゲーム中の場合は確認ダイアログを表示
      if (confirm('ゲームを終了しますか？進捗は保存されません。')) {
        endGame()
        goHome()
      }
    } else {
      // レベル選択モーダルやゲーム終了後は確認なしで戻る
      console.log('ゲーム中ではないため、直接ホームに戻る')
      goHome()
    }
  } catch (error) {
    console.error('Back button error:', error)
    goHome()
  }
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playSound = (type) => {
  try {
    console.log(`Playing sound: ${type}`)
    // 簡単な実装：後でAudioManagerと統合予定
  } catch (error) {
    console.warn('Sound play error:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('GrammarColorCodeGame mounted')
  
  // Load grammar store progress
  grammarStore.loadProgress()
  
  // Load CSV data
  await loadCSVData()
  
  // Set default difficulty
  selectDifficulty('eiken5')
})

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})

// Watch for route changes
watch(() => route.params.planetId, (newPlanetId) => {
  if (newPlanetId && gameState.value.started) {
    generateProblem()
  }
})

const showHint = ref(false)

const toggleHint = () => {
  showHint.value = !showHint.value
}

// Touch event handlers for iPad drag support
const handleTouchStart = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  
  const touch = event.touches[0]
  const element = event.target.closest('.grammar-element')
  
  if (element) {
    // Find the element data
    const elementId = element.dataset.elementId
    const foundElement = availableElements.value.find(e => e.id === elementId)
    
    if (foundElement && !foundElement.isUsed) {
      draggedElement.value = foundElement
      console.log(`[handleTouchStart] Touch started on element: ${foundElement.word}`)
    }
  }
}

const handleTouchMove = (event, zoneId) => {
  if (gameMode.value !== 'normal' || !draggedElement.value) return
  
  // Prevent scrolling during drag
  event.preventDefault()
  
  const touch = event.touches[0]
  const zone = dropZones.value.find(z => z.id === zoneId)
  
  if (zone && !zone.element) {
    zone.isActive = true
    zone.isValid = isValidDrop(draggedElement.value, zoneId)
    zone.isInvalid = !zone.isValid
  }
}

const handleTouchEnd = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  
  if (zone && draggedElement.value && !zone.element) {
    const valid = isValidDrop(draggedElement.value, zoneId)
    
    if (valid) {
      placeElementInZone(draggedElement.value, zoneId)
      playSound('drop')
      console.log(`[handleTouchEnd] Touch drop successful: ${draggedElement.value.word} in ${zoneId}`)
    } else {
      playSound('error')
      showErrorFeedback()
      console.log(`[handleTouchEnd] Touch drop failed: ${draggedElement.value.word} not valid for ${zoneId}`)
    }
  }
  
  // Reset all drop zone states
  dropZones.value.forEach(zone => {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  
  draggedElement.value = null
}

// Touch event handlers for grammar elements (iPad support)
const handleElementTouchStart = (event, element) => {
  if (gameMode.value !== 'normal' || element.isUsed) return
  
  draggedElement.value = element
  console.log(`[handleElementTouchStart] Touch started on element: ${element.word}`)
  
  // Highlight valid zones for this element
  dropZones.value.forEach(zone => {
    if (!zone.element) {
      zone.isValid = isValidDrop(element, zone.id)
      zone.isInvalid = !zone.isValid
    }
  })
}

const handleElementTouchMove = (event, element) => {
  if (gameMode.value !== 'normal' || !draggedElement.value) return
  
  // Prevent scrolling during drag
  event.preventDefault()
  
  const touch = event.touches[0]
  // Find the zone under the touch point
  const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY)
  const zoneElement = elementFromPoint?.closest('.drop-zone')
  
  if (zoneElement) {
    const zoneId = zoneElement.dataset.zoneId || getZoneIdFromElement(zoneElement)
    const zone = dropZones.value.find(z => z.id === zoneId)
    
    if (zone && !zone.element) {
      // Clear previous highlights
      dropZones.value.forEach(z => {
        z.isActive = false
      })
      
      zone.isActive = true
      zone.isValid = isValidDrop(draggedElement.value, zone.id)
      zone.isInvalid = !zone.isValid
    }
  }
}

const handleElementTouchEnd = (event, element) => {
  if (gameMode.value !== 'normal' || !draggedElement.value) return
  
  const touch = event.changedTouches[0]
  const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY)
  const zoneElement = elementFromPoint?.closest('.drop-zone')
  
  if (zoneElement) {
    const zoneId = zoneElement.dataset.zoneId || getZoneIdFromElement(zoneElement)
    const zone = dropZones.value.find(z => z.id === zoneId)
    
    if (zone && !zone.element) {
      const valid = isValidDrop(draggedElement.value, zone.id)
      
      if (valid) {
        placeElementInZone(draggedElement.value, zone.id)
        playSound('drop')
        console.log(`[handleElementTouchEnd] Touch drop successful: ${draggedElement.value.word} in ${zone.id}`)
      } else {
        playSound('error')
        showErrorFeedback()
        console.log(`[handleElementTouchEnd] Touch drop failed: ${draggedElement.value.word} not valid for ${zone.id}`)
      }
    }
  }
  
  // Reset all drop zone states
  dropZones.value.forEach(zone => {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  
  draggedElement.value = null
}

// Helper function to get zone ID from DOM element
const getZoneIdFromElement = (element) => {
  // First try to get from data attribute
  if (element.dataset.zoneId) {
    return element.dataset.zoneId
  }
  
  // Fallback: Extract zone ID from class names
  const classList = Array.from(element.classList)
  for (const className of classList) {
    if (className.includes('subject')) return 'subject'
    if (className.includes('verb')) return 'verb'
    if (className.includes('object')) return 'object'
  }
  return null
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
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
  pointer-events: none;
  z-index: 0;
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

/* CSS Custom Properties for Space Theme */
:root {
  --space-void: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a3e 25%, 
    #2d1b69 50%, 
    #1e1e3f 75%, 
    #0f0f23 100%);
}

/* Galaxy stats - unified */
.galaxy-stats {
  @apply flex items-center space-x-6;
}

.game-header {
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(10px);
}

.game-text-primary {
  color: #FBBF24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.game-button {
  @apply font-medium rounded-lg px-4 py-2 transition-all duration-200;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-button-secondary {
  background: rgba(71, 85, 105, 0.7);
  color: #E5E7EB;
}

.game-button-secondary:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.9);
  transform: translateY(-1px);
}

.game-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-stats {
  @apply flex items-center space-x-6;
}

.stat-item {
  @apply text-center;
}

.stat-label {
  @apply block text-xs text-gray-400 mb-1;
}

.stat-value {
  @apply block text-lg font-bold text-yellow-400;
}

/* Loading and Error States */
.loading-overlay, .error-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50;
}

.loading-content, .error-content {
  @apply bg-slate-800 rounded-2xl p-8 text-center max-w-md;
  color: #E5E7EB;
  border: 2px solid rgba(99, 102, 241, 0.3);
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4;
}

.loading-spinner-small {
  @apply w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto;
}

.loading-text {
  @apply text-gray-300;
}

.retry-button {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors;
}

/* Instructions Modal */
.instructions-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4;
}

.instructions-modal {
  @apply rounded-3xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(79, 172, 254, 0.4);
  backdrop-filter: blur(20px);
  box-shadow: 0 0 50px rgba(79, 172, 254, 0.3);
  color: #E5E7EB;
}

/* Compact Color Rules - Galaxy Style */
.color-rule-card-compact {
  @apply flex items-center gap-2 p-3 rounded-lg border-2 transition-all backdrop-filter backdrop-blur-md;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
  border-color: rgba(59, 130, 246, 0.4);
  min-width: 140px;
}

.color-rule-card-compact.blue-family {
  border-color: rgba(74, 144, 226, 0.6);
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.15), rgba(59, 130, 246, 0.1));
}

.color-rule-card-compact.red-family {
  border-color: rgba(239, 68, 68, 0.6);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
}

.color-rule-card-compact.yellow-family {
  border-color: rgba(251, 191, 36, 0.6);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(252, 211, 77, 0.1));
}

.color-icon-compact {
  @apply text-xl;
}

.color-content-compact {
  @apply flex flex-col;
}

.color-name-compact {
  @apply font-bold text-sm text-white;
}

.color-description-compact {
  @apply text-xs text-gray-300;
}

.color-rule-card {
  @apply p-4 rounded-lg text-center border-2;
}

.blue-family {
  background: rgba(74, 144, 226, 0.1);
  border-color: #4A90E2;
}

.red-family {
  background: rgba(255, 107, 107, 0.1);
  border-color: #FF6B6B;
}

.yellow-family {
  background: rgba(255, 215, 0, 0.1);
  border-color: #FFD700;
}

.color-icon {
  @apply text-3xl mb-2;
}

.color-name {
  @apply font-bold text-lg mb-1;
}

.color-description {
  @apply text-sm text-gray-300;
}

.rules-list-galaxy {
  @apply space-y-2 text-galaxy-moon-silver;
  list-style: none;
  padding-left: 0;
}

.rules-list-galaxy li {
  @apply flex items-start;
}

.rules-list-galaxy li::before {
  content: "→";
  @apply mr-2 text-yellow-400 flex-shrink-0 cosmic-glow;
}

/* Galaxy Difficulty Buttons */
.difficulty-buttons-galaxy {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.difficulty-button-galaxy {
  @apply p-4 rounded-xl border-2 transition-all galaxy-card backdrop-filter backdrop-blur-md;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7));
  border-color: rgba(59, 130, 246, 0.4);
}

.difficulty-button-galaxy:hover {
  border-color: rgba(79, 172, 254, 0.8);
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.1));
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
  transform: translateY(-2px);
}

.difficulty-button-galaxy.selected {
  border-color: #4FACFE;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.2));
  box-shadow: 0 0 25px rgba(79, 172, 254, 0.5);
}

.difficulty-name-galaxy {
  @apply font-bold text-lg mb-1 galaxy-text-primary cosmic-glow;
}

.difficulty-description-galaxy {
  @apply text-sm text-galaxy-moon-silver mb-2 italic;
}

.difficulty-details-galaxy {
  @apply text-sm text-white space-y-1;
}

/* Galaxy Mode Selection */
.mode-buttons-galaxy {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.mode-button-galaxy {
  @apply p-4 rounded-xl border-2 transition-all flex flex-col items-center galaxy-card backdrop-filter backdrop-blur-md;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7));
  border-color: rgba(59, 130, 246, 0.4);
}

.mode-button-galaxy:hover {
  border-color: rgba(79, 172, 254, 0.8);
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.1));
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
  transform: translateY(-2px);
}

.mode-button-galaxy.selected {
  border-color: #4FACFE;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.2));
  box-shadow: 0 0 25px rgba(79, 172, 254, 0.5);
}

.mode-button-galaxy span {
  @apply galaxy-text-primary font-bold;
}

.mode-button-galaxy small {
  @apply text-galaxy-moon-silver text-xs mt-1;
}

.button-controls {
  @apply flex justify-center items-center mt-6;
}

.start-game-button-galaxy {
  @apply py-4 px-8 rounded-xl font-bold text-lg galaxy-button galaxy-button-primary cosmic-glow;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.5), rgba(0, 242, 254, 0.5));
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
  transition: all 0.3s ease;
}

.start-game-button-galaxy:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(79, 172, 254, 0.6);
}

.start-game-button-galaxy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Game Main Area */
.game-main {
  @apply py-2;
}

.progress-section {
  @apply bg-slate-800 rounded-lg p-4;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.progress-bar {
  @apply w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000;
}

.progress-info {
  @apply flex justify-between text-sm text-gray-300;
}

/* Sentence Target */
.sentence-target {
  @apply bg-slate-800 rounded-lg p-4 text-center;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.target-sentence {
  @apply text-xl font-medium text-gray-200 p-4 bg-gray-800 rounded-lg;
}

.target-hint {
  @apply mt-2 p-3 bg-gray-800 rounded-lg;
}

.hint-header {
  @apply flex items-center gap-2 text-gray-400;
}

.hint-toggle {
  @apply ml-auto px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 transition-colors;
}

.hint-toggle.active {
  @apply bg-blue-600 hover:bg-blue-500;
}

.hint-content {
  @apply mt-2 text-gray-300;
}

.hint-text {
  @apply text-gray-300 mb-2;
}

.hint-example {
  @apply text-sm text-gray-400 italic;
}

/* Game Grid */
.game-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-3;
}

/* Drop Zones */
.drop-zones-container {
  @apply flex flex-col space-y-4;
}

.drop-zones {
  @apply flex flex-row space-x-2 w-full justify-center items-center;
}

.drop-zone {
  @apply flex-1 h-20 min-w-[100px] max-w-[200px] mx-1 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center transition-all bg-white cursor-pointer;
}

.drop-zone.kids-mode {
  @apply h-24 min-w-[120px] rounded-xl;
}

.drop-zone.drop-active {
  border-color: #6366F1;
  background: rgba(99, 102, 241, 0.1);
}

.drop-zone.drop-valid {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.1);
}

.drop-zone.drop-invalid {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.drop-placeholder {
  @apply text-center;
}

.drop-label {
  @apply block font-medium text-gray-600 mb-1;
}

.drop-hint {
  @apply block text-xs text-gray-500;
}

.dropped-element {
  @apply w-full h-full flex items-center justify-center;
}

.validate-button {
  @apply flex items-center justify-center space-x-2 w-full py-3 rounded-lg font-medium transition-all;
  background: rgba(71, 85, 105, 0.5);
  color: #9CA3AF;
  border: 2px solid rgba(71, 85, 105, 0.5);
}

.validate-button.kids-mode {
  @apply py-4 text-lg;
}

.validate-button.ready {
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
  border-color: #10B981;
}

.validate-button.ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.validate-button:disabled {
  cursor: not-allowed;
}

/* Elements Pool */
.elements-pool {
  @apply bg-slate-800 rounded-lg p-4;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.pool-title {
  @apply text-lg font-bold text-gray-200 mb-4;
}

.debug-elements {
  @apply text-center py-2;
}

.loading-elements {
  @apply text-center py-8;
}

.no-elements-message, .all-used-message {
  @apply text-center py-8;
}

.elements-grid {
  @apply grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2;
}

.elements-grid.kids-mode {
  @apply grid-cols-2 sm:grid-cols-3 gap-3;
}

/* Visual Feedback */
.combo-display {
  @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40;
  @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full;
  @apply font-bold text-xl shadow-lg;
  animation: comboPopup 2s ease-out forwards;
}

.combo-text {
  @apply text-center mb-1;
}

.combo-multiplier {
  @apply text-center text-2xl;
}

.meaning-display {
  @apply fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40;
  @apply bg-white rounded-xl p-6 shadow-2xl border-2 border-blue-300;
  animation: meaningFadeIn 3s ease-out forwards;
}

.meaning-content {
  @apply text-center;
}

.meaning-icon {
  @apply text-6xl mb-3;
}

.meaning-text {
  @apply text-lg font-medium text-gray-800;
}

/* Animations */
@keyframes comboPopup {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
}

@keyframes meaningFadeIn {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  10% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 1;
  }
  90% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
  }
}

/* Debug Info */
.debug-info {
  @apply fixed bottom-4 left-4 bg-black bg-opacity-75 text-green-400 p-2 rounded text-xs z-50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .instructions-modal {
    @apply p-4;
  }
  
  .game-main {
    @apply py-1;
  }
  
  .max-w-6xl {
    max-width: 100vw;
  }
  
  .game-grid {
    @apply grid-cols-1 gap-2;
  }
  
  .drop-zones {
    @apply flex-col space-x-0 space-y-2;
  }
  
  .drop-zone {
    @apply w-full max-w-full min-w-0 mb-1;
  }
  
  .elements-grid {
    @apply grid-cols-3 gap-1;
  }
  
  .elements-grid.kids-mode {
    @apply grid-cols-2 gap-2;
  }
  
  .game-stats {
    @apply space-x-3;
  }
  
  .stat-value {
    @apply text-base;
  }
  
  .color-rules {
    @apply grid-cols-1;
  }
  
  .difficulty-buttons {
    @apply grid-cols-1;
  }
  
  .mode-buttons {
    @apply grid-cols-1;
  }
}

@media (max-width: 640px) {
  .instructions-modal {
    @apply p-6;
  }
  
  .elements-pool {
    @apply p-2;
  }
  
  .drop-zone {
    @apply h-16 min-w-[80px];
  }
  
  .drop-zone.kids-mode {
    @apply h-20 min-w-[100px];
  }
  
  .validate-button {
    @apply text-sm py-2;
  }
  
  .validate-button.kids-mode {
    @apply text-base py-3;
  }
  
  .meaning-display {
    @apply p-4;
  }
  
  .meaning-icon {
    @apply text-4xl mb-2;
  }
  
  .meaning-text {
    @apply text-base;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .drop-zone {
    border-width: 3px;
  }
  
  .drop-zone.drop-valid {
    @apply border-green-600 bg-green-600/20;
  }
  
  .drop-zone.drop-invalid {
    @apply border-red-600 bg-red-600/20;
  }
  
  .game-button {
    border-width: 2px;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .instructions-modal {
    @apply bg-gray-900 border-gray-700;
  }
  
  .progress-section,
  .elements-pool,
  .sentence-target {
    @apply bg-gray-900 border-gray-700;
  }
  
  .meaning-display {
    @apply bg-gray-800 text-white border-gray-600;
  }
  
  .meaning-text {
    @apply text-gray-200;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .combo-display,
  .meaning-display,
  .validate-button,
  .start-game-button {
    animation: none !important;
    transition: none !important;
  }
  
  .validate-button.ready:hover,
  .start-game-button:hover:not(:disabled) {
    transform: none !important;
  }
}

/* Focus styles for accessibility */
.drop-zone:focus,
.validate-button:focus,
.difficulty-button:focus,
.mode-button:focus,
.start-game-button:focus {
  outline: 3px solid #FFD700;
  outline-offset: 2px;
}

/* Kids mode specific styles */
.kids-mode .drop-label {
  @apply text-lg font-bold;
}

.kids-mode .drop-hint {
  @apply text-sm;
}

/* Touch-friendly enhancements for iPad */
@media (pointer: coarse) {
  .drop-zone {
    @apply min-h-[100px] p-4;
    touch-action: none;
  }
  
  .elements-grid {
    @apply gap-4;
  }
  
  .grammar-element {
    @apply min-h-[80px] p-4;
    touch-action: manipulation;
  }
  
  .drop-zone.drop-active {
    @apply scale-105;
    border-width: 3px;
  }
  
  .drop-zone.drop-valid {
    @apply bg-green-500/20 border-green-400;
    animation: valid-pulse 1s ease-in-out infinite;
  }
  
  .drop-zone.drop-invalid {
    @apply bg-red-500/20 border-red-400;
    animation: invalid-shake 0.5s ease-in-out;
  }
}

@keyframes valid-pulse {
  0%, 100% { 
    background-color: rgba(34, 197, 94, 0.2);
    border-color: rgb(74, 222, 128);
  }
  50% { 
    background-color: rgba(34, 197, 94, 0.3);
    border-color: rgb(34, 197, 94);
  }
}

@keyframes invalid-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Print styles */
@media print {
  .game-background {
    background: white !important;
    color: black !important;
  }
  
  .instructions-overlay,
  .combo-display,
  .meaning-display,
  .debug-info {
    display: none !important;
  }
  
  .drop-zone {
    @apply border-black bg-white;
  }
}

/* Loading states */
.drop-zone.loading {
  @apply animate-pulse;
}

.elements-grid.loading {
  @apply opacity-50;
}

/* Hover effects */
.difficulty-button:hover,
.mode-button:hover {
  transform: translateY(-1px);
}

.validate-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

/* Custom scrollbar for modal */
.instructions-modal::-webkit-scrollbar {
  width: 8px;
}

.instructions-modal::-webkit-scrollbar-track {
  background: rgba(71, 85, 105, 0.3);
  border-radius: 4px;
}

.instructions-modal::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.6);
  border-radius: 4px;
}

.instructions-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
</style>