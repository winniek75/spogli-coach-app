<template>
  <div class="pattern-hunter-game">
    <!-- エラー表示 -->
    <div v-if="hasError" class="error-container">
      <div class="bg-red-900/80 border border-red-600 rounded-lg p-6 text-center backdrop-blur-sm">
        <div class="text-red-400 text-xl font-bold mb-2">❌ An error has occurred</div>
        <div class="text-red-200 mb-4">{{ errorMessage }}</div>
        <button 
          @click="goBackToGalaxy"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Back
        </button>
      </div>
    </div>

    <!-- ゲーム解説とスタートボタン -->
    <div v-if="gameState === 'ready' && !hasError" class="game-intro">
      <!-- Galaxy Background Stars -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="stars-layer-1"></div>
        <div class="stars-layer-2"></div>
        <div class="stars-layer-3"></div>
      </div>
      
      <div class="intro-container">
        <div class="galaxy-card intro-card">
          <div class="intro-icon cosmic-glow">🕵️‍♂️✨</div>
          <h2 class="intro-title galaxy-text-primary cosmic-glow">Pattern Hunter</h2>
          <p class="intro-subtitle text-galaxy-moon-silver">
            宇宙に散らばった文法パターンを探し出そう！
          </p>
          
          <div class="intro-description">
            <p class="text-galaxy-moon-silver mb-4 leading-relaxed">
              星の海に隠された文法パターンを発見する宇宙探検家になろう。<br>
              グリッドの単語を正しい順序で選んで、完璧な文法パターンを完成させよう！
            </p>
          </div>
          
          <div class="mission-briefing galaxy-card">
            <h3 class="text-lg font-bold galaxy-text-primary cosmic-glow mb-3">🎯 ミッション概要</h3>
            <ul class="mission-list">
              <li class="mission-item">
                <span class="mission-icon">🌟</span>
                <span>ターゲットパターンを正確に見つける</span>
              </li>
              <li class="mission-item">
                <span class="mission-icon">⚡</span>
                <span>制限時間120秒以内にクリア</span>
              </li>
              <li class="mission-item">
                <span class="mission-icon">🎯</span>
                <span>正しい語順で文法パターンを完成</span>
              </li>
              <li class="mission-item">
                <span class="mission-icon">🏆</span>
                <span>高得点を目指してコンボを狙う</span>
              </li>
            </ul>
          </div>
          
          <!-- 英検レベル選択 -->
          <div class="galaxy-card level-selection">
            <h3 class="text-lg font-bold galaxy-text-primary cosmic-glow mb-3">🎯 英検レベル選択</h3>
            <div class="level-grid">
              <button 
                v-for="(settings, level) in EIKEN_LEVELS" 
                :key="level"
                @click="selectedEikenLevel = level"
                class="galaxy-button level-button"
                :class="selectedEikenLevel === level ? 'galaxy-button-primary' : 'galaxy-button-secondary'"
              >
                <div class="level-icon">{{ settings.icon }}</div>
                <div class="level-name">{{ settings.name }}</div>
                <div class="level-desc text-galaxy-moon-silver">{{ settings.description }}</div>
              </button>
            </div>
          </div>

          <div class="stats-preview galaxy-card">
            <div class="stat-item">
              <span class="stat-label text-galaxy-moon-silver">最高記録</span>
              <span class="stat-value galaxy-text-primary cosmic-glow">{{ bestScore }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label text-galaxy-moon-silver">クリア率</span>
              <span class="stat-value galaxy-text-primary cosmic-glow">{{ clearRate }}%</span>
            </div>
          </div>
          
          <button @click="startGame" class="galaxy-button galaxy-button-primary start-button">
            <span class="button-content">
              <Icon name="play" class="w-6 h-6" />
              ミッション開始
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ゲームヘッダー -->
    <div v-if="!hasError && gameState !== 'ready'" class="game-header">
      <!-- Galaxy Background Stars -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="stars-layer-1"></div>
        <div class="stars-layer-2"></div>
        <div class="stars-layer-3"></div>
      </div>
      
      <div class="galaxy-card header-card-compact">
        <div class="header-layout">
          <button 
            @click="goBackToGalaxy"
            class="galaxy-button galaxy-button-secondary back-button-compact"
          >
            <Icon name="arrow-left" class="w-4 h-4" />
            戻る
          </button>
          
          <div class="title-compact">
            <h1 class="text-xl font-bold galaxy-text-primary cosmic-glow">🕵️‍♂️ Pattern Hunter</h1>
          </div>
          
          <div class="stats-compact">
            <div class="stat-compact">
              <span class="stat-icon-small">💫</span>
              <span class="stat-value-small galaxy-text-primary cosmic-glow">{{ score.toLocaleString() }}</span>
            </div>
            <div class="stat-compact">
              <span class="stat-icon-small">⏰</span>
              <span class="stat-value-small cosmic-glow" :class="timeClass">{{ formatTime(timeLeft) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ゲーム状態表示 -->
    <div v-if="!hasError && gameState !== 'ready'" class="game-status-compact">
      <div class="galaxy-card status-card-compact">
        <div class="status-row">
          <div class="target-compact">
            <span class="target-icon-small">🎯</span>
            <span class="target-text galaxy-text-primary cosmic-glow">
              {{ currentTarget?.meaning || 'Loading...' }}
            </span>
          </div>
          <div class="progress-compact">
            <span class="progress-text text-galaxy-moon-silver">
              {{ foundPatterns.length }}/{{ targetPatterns.length }}
            </span>
            <div class="progress-mini">
              <div 
                class="progress-fill-mini"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ゲームグリッド -->
    <div v-if="!hasError && gameState !== 'ready'" class="game-content">
      <div class="main-layout">
        <!-- 左側: グリッド -->
        <div class="grid-section">
          <div 
            class="cosmic-pattern-grid-compact"
            :class="{ 'grid-disabled': gameState !== 'playing' }"
          >
            <div
              v-for="(cell, index) in gameGrid"
              :key="index"
              class="cosmic-grid-cell-compact"
              :class="{
                'cell-selected': cell.isSelected,
                'cell-found': cell.isFound,
                'cell-correct': cell.isCorrect,
                'cell-wrong': cell.isWrong,
                'cell-highlight': cell.isHighlighted,
                'cell-empty': !cell.element
              }"
              @click="selectCell(index)"
            >
              <div v-if="cell.element" class="cell-content">
                <div class="cell-background"></div>
                <div class="cell-shine"></div>
                <GrammarElement
                  :element="{ word: cell.element.text, type: cell.element.type, color: getElementColor(cell.element.type) }"
                  :is-selected="cell.isSelected"
                  :is-found="cell.isFound"
                  class="w-full h-full relative z-10"
                />
              </div>
              <div v-else class="empty-cell">
                <div class="empty-stars">✨</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側: 選択エリアとアクション -->
        <div class="control-section">
          <!-- 選択された要素表示 -->
          <div class="galaxy-card selection-card-compact">
            <div class="selection-header-compact">
              <h3 class="selection-title-small galaxy-text-primary cosmic-glow">
                選択中 ({{ selectedElements.length }}/{{ currentTarget?.elements?.length || 0 }})
              </h3>
            </div>
            
            <div class="selection-area-compact">
              <template v-if="selectedElements.length > 0">
                <div class="selected-sequence-compact">
                  <div
                    v-for="(element, index) in selectedElements"
                    :key="index"
                    class="selected-element-mini"
                  >
                    <div class="element-background-mini"></div>
                    <GrammarElement
                      :element="{ word: element.text, type: element.type, color: getElementColor(element.type) }"
                      :is-selected="true"
                      class="element-content-mini"
                    />
                    <div class="element-order-mini">{{ index + 1 }}</div>
                  </div>
                </div>
              </template>
              <div v-else class="empty-selection-compact">
                <div class="empty-text-small text-galaxy-moon-silver">
                  星をクリック...
                </div>
              </div>
            </div>
            
            <div class="action-controls-compact">
              <button
                @click="checkPattern"
                :disabled="selectedElements.length < 2 || gameState !== 'playing'"
                class="galaxy-button galaxy-button-primary action-button-compact"
              >
                🔍 確認
              </button>
              <button
                @click="clearSelection"
                :disabled="selectedElements.length === 0"
                class="galaxy-button galaxy-button-secondary action-button-compact"
              >
                🗑️ クリア
              </button>
            </div>
          </div>

          <!-- ミッション目標 -->
          <div class="galaxy-card patterns-card-compact">
            <div class="patterns-header-compact">
              <h3 class="patterns-title-small galaxy-text-primary cosmic-glow">
                ミッション目標
              </h3>
            </div>
            
            <div class="patterns-list-compact">
              <div
                v-for="(pattern, index) in targetPatterns.slice(0, 4)"
                :key="index"
                class="pattern-mission-mini"
                :class="{
                  'mission-completed': pattern.isFound,
                  'mission-active': currentTarget?.id === pattern.id,
                  'mission-pending': !pattern.isFound && currentTarget?.id !== pattern.id
                }"
              >
                <div class="mission-status-mini">
                  <span v-if="pattern.isFound" class="completed-icon-mini">✅</span>
                  <span v-else-if="currentTarget?.id === pattern.id" class="active-icon-mini">🎯</span>
                  <span v-else class="pending-icon-mini">⏳</span>
                </div>
                <div class="mission-content-mini">
                  <div class="mission-pattern-mini">{{ pattern.meaning }}</div>
                </div>
                <div class="mission-points-mini">{{ pattern.points }}pt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- ゲーム終了モーダル -->
    <GameResultModal
      v-if="showGameResult && !hasError"
      :score="score"
      :completed-sentences="foundPatterns.length"
      :target-sentences="targetPatterns.length"
      :accuracy="accuracy"
      :time-taken="timeTaken"
      :combo-best="maxConsecutiveCorrect"
      :is-new-record="isNewRecord"
      @play-again="restartGame"
      @go-home="closeGame"
    />

    <!-- パーティクルエフェクト -->
    <ParticleEffect 
      v-if="!hasError"
      :show="showParticles"
      :type="particleType"
      :count="15"
      :color="particleColor"
      :duration="2000"
      @complete="onParticleComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import { patternHunterData } from '@/data/grammarFoundationData'
import GrammarElement from './game-elements/GrammarElement.vue'
import GameResultModal from './shared/GameResultModal.vue'
import Icon from '@/components/shared/Icon.vue'
import ParticleEffect from './shared/ParticleEffect.vue'
import { useAudioStore } from '@/stores/audioStore'
import { useRouter } from 'vue-router'

// Emits
const emit = defineEmits(['back'])

// Store
const store = useGrammarGalaxyStore()
const audioStore = useAudioStore()
const router = useRouter()

// Store debugging
console.log('🏪 Grammar Galaxy Store initialized:', !!store)
console.log('📋 Store planetsData:', store.planetsData)
console.log('🪐 beVerb planet data:', store.planetsData?.beVerb)
console.log('🎮 Pattern Hunter game:', store.planetsData?.beVerb?.games?.find(g => g.id === 'patternHunter'))

// ゲーム状態
const gameState = ref('ready') // 'ready', 'playing', 'paused', 'finished'
const score = ref(0)
const timeLeft = ref(120) // 120秒制限
const gameGrid = ref([])
const selectedElements = ref([])
const selectedCells = ref([])
const foundPatterns = ref([])
const targetPatterns = ref([])
const currentTarget = ref(null)
const showGameResult = ref(false)
const showParticles = ref(false)
const particleType = ref('stars')
const particleColor = ref('gold')
const hasError = ref(false)
const errorMessage = ref('')
let gameTimer = null
let particleId = 0

// グリッド設定
const GRID_ROWS = 4
const GRID_COLS = 6
const GRID_SIZE = GRID_ROWS * GRID_COLS

// 英検レベル設定
const EIKEN_LEVELS = {
  eiken5: {
    name: '英検5級',
    icon: '🌱',
    description: '基本単語・文法',
    patterns: 'eiken5'
  },
  eiken4: {
    name: '英検4級',
    icon: '🌿',
    description: '中学基礎レベル',
    patterns: 'eiken4'
  },
  eiken3: {
    name: '英検3級',
    icon: '🌳',
    description: '中学卒業レベル',
    patterns: 'eiken3'
  }
}

// 選択された英検レベル
const selectedEikenLevel = ref('eiken5')

// 統計データ
const bestScore = computed(() => {
  try {
    const planet = store.planetsData?.beVerb
    const game = planet?.games?.find(g => g.id === 'patternHunter')
    return game?.bestScore || 0
  } catch (error) {
    return 0
  }
})

const clearRate = computed(() => {
  try {
    const planet = store.planetsData?.beVerb
    const game = planet?.games?.find(g => g.id === 'patternHunter')
    const gamesPlayed = game?.gamesPlayed || 0
    const gamesCompleted = game?.gamesCompleted || 0
    return gamesPlayed > 0 ? Math.round((gamesCompleted / gamesPlayed) * 100) : 0
  } catch (error) {
    return 0
  }
})

// ゲーム統計
const gameStats = computed(() => ({
  'Patterns Found': foundPatterns.value.length,
  'Total Patterns': targetPatterns.value.length,
  'Accuracy': Math.round((foundPatterns.value.length / targetPatterns.value.length) * 100) + '%',
  'Time Used': `${60 - timeLeft.value}s`,
  'Consecutive Correct': consecutiveCorrect.value || 0
}))

// 正解率計算
const accuracy = computed(() => {
  if (targetPatterns.value.length === 0) return 0
  return Math.round((foundPatterns.value.length / targetPatterns.value.length) * 100)
})

// 使用時間計算
const timeTaken = computed(() => {
  return 60 - timeLeft.value
})

// 最高連続正解計算
const consecutiveCorrect = ref(0)
const maxConsecutiveCorrect = ref(0)

// 進捗率
const progressPercentage = computed(() => {
  if (targetPatterns.value.length === 0) return 0
  return Math.round((foundPatterns.value.length / targetPatterns.value.length) * 100)
})

// 時間表示のクラス
const timeClass = computed(() => ({
  'text-red-400': timeLeft.value <= 10,
  'text-yellow-400': timeLeft.value <= 30 && timeLeft.value > 10,
  'text-green-400': timeLeft.value > 30
}))

// スター評価
const stars = computed(() => {
  const completion = foundPatterns.value.length / targetPatterns.value.length
  const timeBonus = timeLeft.value / 60
  
  if (completion >= 0.8 && timeBonus >= 0.3) return 3
  if (completion >= 0.6 && timeBonus >= 0.1) return 2
  if (completion >= 0.4) return 1
  return 0
})

// 新記録判定
const isNewRecord = computed(() => {
  try {
    // PatternHunterゲームのbestScoreをplanetsDataから取得
    const planet = store.planetsData?.beVerb
    const game = planet?.games?.find(g => g.id === 'patternHunter')
    const currentBestScore = game?.bestScore || 0
    
    console.log('🏆 New record check:', {
      currentScore: score.value,
      bestScore: currentBestScore,
      isNewRecord: score.value > currentBestScore
    })
    
    return score.value > currentBestScore
  } catch (error) {
    console.error('❌ Error checking new record:', error)
    return false
  }
})

// ランダムにターゲットパターンを選択
const selectRandomTargetPatterns = (patterns, count = 5) => {
  const shuffled = [...patterns].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// 英検レベルに応じたパターンを取得
const getPatternsByEikenLevel = (level) => {
  const allPatterns = patternHunterData.targetPatterns
  
  switch (level) {
    case 'eiken5':
      // 英検5級: 基本的なBe動詞と一般動詞の文
      return allPatterns.filter(pattern => 
        pattern.difficulty <= 2 && 
        ['be_verb', 'general_verb'].includes(pattern.type)
      )
    
    case 'eiken4':
      // 英検4級: 疑問文も含む
      return allPatterns.filter(pattern => 
        pattern.difficulty <= 3 && 
        ['be_verb', 'general_verb', 'question'].includes(pattern.type)
      )
    
    case 'eiken3':
      // 英検3級: 全ての文型を含む
      return allPatterns.filter(pattern => pattern.difficulty <= 4)
    
    default:
      return allPatterns.filter(pattern => pattern.difficulty <= 2)
  }
}

// ゲーム初期化
const initializeGame = () => {
  try {
    // 選択された英検レベルに基づいてパターンを取得
    const levelPatterns = getPatternsByEikenLevel(selectedEikenLevel.value)
    
    // ランダムにターゲットパターンを選択
    const shuffledPatterns = [...levelPatterns].sort(() => 0.5 - Math.random())
    targetPatterns.value = shuffledPatterns.slice(0, 5).map(pattern => ({
      ...pattern,
      isFound: false // 発見状態をリセット
    }))
    
    // その中から1つランダムに選ぶ
    currentTarget.value = targetPatterns.value[Math.floor(Math.random() * targetPatterns.value.length)]
    
    console.log(`🎮 Game initialized with ${targetPatterns.value.length} patterns (${selectedEikenLevel.value})`)
    console.log(`🎯 First target: ${currentTarget.value.pattern}`)
    
    // グリッドの初期化
    initializeGrid()
    
    // ゲーム状態のリセット
    gameState.value = 'ready'
    score.value = 0
    timeLeft.value = 120
    foundPatterns.value = []
    selectedElements.value = []
    selectedCells.value = []
    consecutiveCorrect.value = 0
    maxConsecutiveCorrect.value = 0
    
    // タイマーの開始
    startGameTimer()
  } catch (error) {
    console.error('Error initializing game:', error)
    hasError.value = true
    errorMessage.value = 'Failed to initialize the game. Please try again.'
  }
}

// グリッドの初期化
const initializeGrid = () => {
  // すべてのターゲットパターンの要素を収集
  const allTargetElements = targetPatterns.value.flatMap(pattern => 
    pattern.elements.map(element => ({
      text: element,
      type: getElementType(element),
      isTarget: true
    }))
  )

  // ディストラクター単語を追加
  const distractors = patternHunterData.distractorWords.slice(0, 12).map(word => ({
    text: word,
    type: getElementType(word),
    isTarget: false
  }))

  console.log('🎯 Target elements:', allTargetElements.map(e => e.text))
  console.log('🎲 Distractor elements:', distractors.map(e => e.text))

  // グリッドサイズに合わせて要素を配置
  const gridElements = []
  const totalCells = GRID_ROWS * GRID_COLS
  const usedElements = new Set()

  // まず、すべてのターゲット要素を必ず配置
  allTargetElements.forEach(element => {
    if (!usedElements.has(element.text) && gridElements.length < totalCells) {
      usedElements.add(element.text)
      gridElements.push({
        element: element,
        isSelected: false,
        isFound: false,
        isCorrect: false,
        isWrong: false,
        isHighlighted: false
      })
    }
  })

  // 残りのセルをディストラクターで埋める
  const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random())
  for (const distractor of shuffledDistractors) {
    if (gridElements.length >= totalCells) break
    if (!usedElements.has(distractor.text)) {
      usedElements.add(distractor.text)
      gridElements.push({
        element: distractor,
        isSelected: false,
        isFound: false,
        isCorrect: false,
        isWrong: false,
        isHighlighted: false
      })
    }
  }

  // 残りのセルを空にする
  while (gridElements.length < totalCells) {
    gridElements.push({
      element: null,
      isSelected: false,
      isFound: false,
      isCorrect: false,
      isWrong: false,
      isHighlighted: false
    })
  }

  // 最終シャッフル
  gameGrid.value = gridElements.sort(() => 0.5 - Math.random())
  
  console.log(`🎲 Grid initialized with ${gridElements.filter(g => g.element).length} elements`)
  console.log(`📋 Target words in grid:`, gridElements.filter(g => g.element?.isTarget).map(g => g.element.text))
}

// ゲームタイマーの開始
const startGameTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
  
  gameTimer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      endGame()
    }
  }, 1000)
  
  gameState.value = 'playing'
}

// 要素タイプ判定
const getElementType = (text) => {
  const pronouns = ['I', 'you', 'he', 'she', 'it', 'we', 'they']
  const verbs = ['am', 'is', 'are', 'like', 'love', 'have', 'do', 'does', 'run', 'walk', 'eat', 'sleep']
  const adjectives = ['happy', 'sad', 'big', 'small', 'red', 'blue', 'green', 'yellow']
  const nouns = ['cats', 'dogs', 'books', 'cars', 'apples', 'ball', 'music']
  const questions = ['Do', 'Does', 'Are', 'Is']
  
  if (pronouns.includes(text)) return 'pronoun'
  if (verbs.includes(text)) return 'verb'
  if (adjectives.includes(text)) return 'adjective'
  if (nouns.includes(text)) return 'noun'
  if (questions.includes(text)) return 'question'
  return 'other'
}

// 要素カテゴリ判定
const getElementCategory = (text) => {
  if (['I', 'you', 'he', 'she', 'it', 'we', 'they'].includes(text)) return 'subject'
  if (['am', 'is', 'are', 'do', 'does'].includes(text)) return 'auxiliary'
  if (['like', 'love', 'have', 'run', 'walk', 'eat', 'sleep'].includes(text)) return 'verb'
  if (['happy', 'sad', 'big', 'small'].includes(text)) return 'adjective'
  if (['cats', 'dogs', 'books', 'cars', 'apples', 'ball', 'music'].includes(text)) return 'object'
  return 'other'
}

// 要素の色を取得
const getElementColor = (type) => {
  const typeColorMap = {
    'pronoun': 'blue',
    'verb': 'red',
    'adjective': 'purple',
    'noun': 'orange',
    'question': 'yellow',
    'auxiliary': 'green',
    'other': 'gray'
  }
  return typeColorMap[type] || 'gray'
}

// ゲーム開始
const startGame = () => {
  initializeGame()
}

// タイマー開始
const startTimer = () => {
  gameTimer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      endGame()
    }
  }, 1000)
}

// タイマー停止
const stopTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

// 次のターゲット設定
const setNextTarget = () => {
  const remainingPatterns = targetPatterns.value.filter(p => !p.isFound)
  if (remainingPatterns.length > 0) {
    // ランダムに次のターゲットを選択
    const randomIndex = Math.floor(Math.random() * remainingPatterns.length)
    currentTarget.value = remainingPatterns[randomIndex]
    
    console.log(`🎯 Next target set: ${currentTarget.value.pattern}`)
  } else {
    currentTarget.value = null
    console.log('🏁 All patterns found!')
  }
}

// セル選択
const selectCell = (index) => {
  if (gameState.value !== 'playing') return
  if (!gameGrid.value[index] || !gameGrid.value[index].element) return
  if (gameGrid.value[index].isFound) return
  
  const cell = gameGrid.value[index]
  
  if (cell.isSelected) {
    // 選択解除
    cell.isSelected = false
    const elementIndex = selectedElements.value.findIndex(el => el.text === cell.element.text)
    if (elementIndex !== -1) {
      selectedElements.value.splice(elementIndex, 1)
    }
    const cellIndex = selectedCells.value.indexOf(index)
    if (cellIndex !== -1) {
      selectedCells.value.splice(cellIndex, 1)
    }
  } else {
    // 選択
    cell.isSelected = true
    selectedElements.value.push(cell.element)
    selectedCells.value.push(index)
  }
}

// パターンチェック
const checkPattern = () => {
  if (selectedElements.value.length < 2) return
  
  const selectedTexts = selectedElements.value.map(el => el.text)
  
  // 現在のターゲットパターンとマッチするかチェック
  if (currentTarget.value) {
    const targetElements = currentTarget.value.elements
    // 語順も重要なので、sorted比較ではなく順序を保った比較を行う
    const isMatch = arraysEqual(selectedTexts, targetElements)
    
    if (isMatch) {
      // 正解！
      handleCorrectPattern()
    } else {
      // 不正解
      handleIncorrectPattern()
    }
  }
}

// 配列比較（順序も考慮）
const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false
  return a.every((val, index) => val === b[index])
}

// 正解処理
const handleCorrectPattern = () => {
  // 連続正解カウント更新
  consecutiveCorrect.value++
  maxConsecutiveCorrect.value = Math.max(maxConsecutiveCorrect.value, consecutiveCorrect.value)
  
  // スコア加算
  const baseScore = 100
  const timeBonus = Math.floor(timeLeft.value * 2)
  const patternBonus = selectedElements.value.length * 10
  const comboBonus = consecutiveCorrect.value * 20
  const totalScore = baseScore + timeBonus + patternBonus + comboBonus
  
  score.value += totalScore
  
  // パターンを発見済みとしてマーク
  const targetIndex = targetPatterns.value.findIndex(p => p.id === currentTarget.value.id)
  if (targetIndex !== -1) {
    targetPatterns.value[targetIndex].isFound = true
    foundPatterns.value.push(currentTarget.value)
  }
  
  // 選択されたセルを緑色にマーク
  selectedCells.value.forEach(cellIndex => {
    gameGrid.value[cellIndex].isFound = true
    gameGrid.value[cellIndex].isCorrect = true
  })
  
  // パーティクルエフェクト
  showSuccessParticles()
  audioStore.playCorrect()
  audioStore.speak('Correct! Well done!')
  
  // 選択をクリア
  clearSelection()
  
  // 次のターゲットを設定
  setNextTarget()
}

// 不正解処理
const handleIncorrectPattern = () => {
  // 連続正解をリセット
  consecutiveCorrect.value = 0
  
  // 選択されたセルを一時的に赤くする
  selectedCells.value.forEach(cellIndex => {
    gameGrid.value[cellIndex].isWrong = true
  })
  
  // 1秒後に赤色を解除
  setTimeout(() => {
    selectedCells.value.forEach(cellIndex => {
      gameGrid.value[cellIndex].isWrong = false
    })
    clearSelection()
  }, 1000)
  audioStore.playIncorrect()
  audioStore.speak('Try again!')
}

// 選択クリア
const clearSelection = () => {
  selectedElements.value = []
  selectedCells.value.forEach(cellIndex => {
    if (gameGrid.value[cellIndex]) {
      gameGrid.value[cellIndex].isSelected = false
    }
  })
  selectedCells.value = []
}

// 成功パーティクル
const showSuccessParticles = () => {
  showParticles.value = true
  particleType.value = 'stars'
  particleColor.value = 'gold'
}

// 時間フォーマット
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ゲーム終了
const endGame = () => {
  gameState.value = 'finished'
  clearInterval(gameTimer)
  
  // ゲーム結果の計算
  const accuracy = Math.round((foundPatterns.value.length / targetPatterns.value.length) * 100)
  const timeUsed = 60 - timeLeft.value
  const isNewRecord = score.value > (store.planetsData?.beVerb?.games?.find(g => g.id === 'patternHunter')?.bestScore || 0)
  
  // スターの計算
  const stars = calculateStars(accuracy, timeUsed)
  
  // 結果の表示
  showGameResult.value = true
  
  // ストアの更新
  store.completeGame('beVerb', 'patternHunter', score.value, stars, timeUsed)
}

const calculateStars = (accuracy, timeUsed) => {
  if (accuracy >= 90 && timeUsed <= 45) return 3
  if (accuracy >= 70 && timeUsed <= 55) return 2
  return 1
}

// ゲーム再開始
const restartGame = () => {
  console.log('🔄 Restarting game')
  showGameResult.value = false
  initializeGame()
}

// ギャラクシーに戻る
const goBackToGalaxy = () => {
  console.log('🏠 Going back to Grammar Galaxy')
  console.log('📍 Current route:', router.currentRoute.value.path)
  console.log('🎯 Target route: /grammar-galaxy')
  
  try {
    // タイマーを停止
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
    }
    
    // ゲーム状態をリセット
    gameState.value = 'ready'
    showGameResult.value = false
    
    // ギャラクシーハブに戻る - 複数の方法を試す
    router.push({ name: 'grammar-galaxy-hub' }).catch(err => {
      console.warn('⚠️ Named route failed, trying path:', err)
      return router.push('/grammar-galaxy')
    }).catch(err => {
      console.error('❌ Router navigation failed:', err)
      console.log('🔄 Trying window.location fallback')
      window.location.href = '/grammar-galaxy'
    })
  } catch (error) {
    console.error('❌ Error going back to galaxy:', error)
    console.log('🔄 Emergency fallback to home')
    window.location.href = '/'
  }
}

// ゲーム終了（モーダルから呼ばれる）
const closeGame = () => {
  console.log('🚪 closeGame called from modal')
  goBackToGalaxy()
}

// マウント時の処理
onMounted(() => {
  try {
    console.log('🚀 PatternHunterGame mounted')
    console.log('📋 Checking patternHunterData availability:', !!patternHunterData)
    console.log('📋 Checking targetPatterns:', !!patternHunterData?.targetPatterns)
    console.log('🏪 Checking store availability:', !!store)
    console.log('🪐 Checking store.planetsData:', !!store?.planetsData)
    console.log('🎮 Checking beVerb planet:', !!store?.planetsData?.beVerb)
    
    if (!store || !store.planetsData || !store.planetsData.beVerb) {
      console.error('❌ PatternHunterGame: ストアデータが利用できません')
      hasError.value = true
      errorMessage.value = 'ゲームストアの初期化に失敗しました'
      return
    }
    
    if (!patternHunterData || !patternHunterData.targetPatterns) {
      console.error('❌ PatternHunterGame: パターンデータが利用できません')
      hasError.value = true
      errorMessage.value = 'ゲームデータの読み込みに失敗しました'
      return
    }
  } catch (error) {
    console.error('❌ PatternHunterGame mount error:', error)
    hasError.value = true
    errorMessage.value = error.message || '初期化エラーが発生しました'
  }
})

// アンマウント時の処理
onUnmounted(() => {
  stopTimer()
})

// ゲーム状態監視
watch(gameState, (newState) => {
  if (newState === 'playing') {
    startTimer()
  } else {
    stopTimer()
  }
})

const handleCorrectAnswer = () => {
  showParticles.value = true
  particleType.value = 'stars'
  particleColor.value = 'gold'
}
const handleIncorrectAnswer = () => {
  showParticles.value = true
  particleType.value = 'explosion'
  particleColor.value = 'red'
}
const onParticleComplete = () => {
  showParticles.value = false
}
</script>

<style scoped>
.pattern-hunter-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #2a2a4a 100%);
  padding: 1rem;
  position: relative;
  overflow-x: hidden;
  color: white;
}

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
  backdrop-filter: blur(15px);
  padding: 1.5rem;
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
  padding: 0.75rem 1.5rem;
  font-weight: bold;
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

/* Intro Screen Styles */
.game-intro {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.intro-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.intro-card {
  text-align: center;
  margin: 2rem;
}

.intro-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.intro-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.intro-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.mission-briefing {
  margin: 2rem 0;
  padding: 1.5rem;
}

.mission-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mission-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.mission-item:last-child {
  border-bottom: none;
}

.mission-icon {
  font-size: 1.5rem;
}

.stats-preview {
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
  padding: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.start-button {
  padding: 1rem 2rem;
  font-size: 1.25rem;
  margin-top: 2rem;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Compact Header Styles */
.header-card-compact {
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
}

.header-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button-compact {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.title-compact {
  flex: 1;
  text-align: center;
}

.stats-compact {
  display: flex;
  gap: 1rem;
}

.stat-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.stat-icon-small {
  font-size: 1rem;
}

.stat-value-small {
  font-size: 1rem;
  font-weight: bold;
}

/* Compact Status Styles */
.game-status-compact {
  margin-bottom: 0.75rem;
}

.status-card-compact {
  padding: 0.75rem 1rem;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.target-icon-small {
  font-size: 1rem;
}

.target-text {
  font-size: 1rem;
  font-weight: bold;
}

.progress-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: bold;
}

.progress-mini {
  width: 60px;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, 
    #3B82F6 0%, 
    #8B5CF6 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #10B981 100%);
  transition: width 0.5s ease;
}

/* Compact Game Layout */
.game-content {
  height: calc(100vh - 180px);
  max-height: 600px;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  height: 100%;
}

.grid-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Compact Grid Styles */
.cosmic-pattern-grid-compact {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 0.5rem;
  max-width: 600px;
  width: 100%;
  aspect-ratio: 6/4;
}

.cosmic-grid-cell-compact {
  position: relative;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 3rem;
}

.cosmic-grid-cell-compact:hover:not(.cell-found) {
  transform: scale(1.05);
}

/* Compact Selection Card */
.selection-card-compact {
  padding: 1rem;
  flex: 1;
}

.selection-header-compact {
  margin-bottom: 1rem;
}

.selection-title-small {
  font-size: 1rem;
  font-weight: bold;
}

.selection-area-compact {
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.selected-sequence-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.selected-element-mini {
  position: relative;
  width: 3rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-background-mini {
  position: absolute;
  inset: 0;
  background: rgba(147, 51, 234, 0.3);
  border: 2px solid #9333ea;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
}

.element-content-mini {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  font-size: 0.75rem;
}

.element-order-mini {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1rem;
  height: 1rem;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: bold;
  color: white;
  border: 1px solid white;
}

.empty-selection-compact {
  text-align: center;
  padding: 1rem;
}

.empty-text-small {
  font-size: 0.875rem;
  font-style: italic;
}

.action-controls-compact {
  display: flex;
  gap: 0.5rem;
}

.action-button-compact {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

/* Compact Patterns Card */
.patterns-card-compact {
  padding: 1rem;
  flex: 1;
}

.patterns-header-compact {
  margin-bottom: 1rem;
}

.patterns-title-small {
  font-size: 1rem;
  font-weight: bold;
}

.patterns-list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-mission-mini {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  font-size: 0.875rem;
}

.mission-pending {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
}

.mission-active {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

.mission-completed {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.mission-status-mini {
  flex-shrink: 0;
}

.completed-icon-mini, .active-icon-mini, .pending-icon-mini {
  font-size: 1rem;
}

.mission-content-mini {
  flex: 1;
  min-width: 0;
}

.mission-pattern-mini {
  font-weight: bold;
  color: white;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mission-points-mini {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: bold;
  color: #FBBF24;
  background: rgba(251, 191, 36, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  
  .game-content {
    height: calc(100vh - 140px);
  }
  
  .cosmic-pattern-grid-compact {
    max-width: 100%;
    gap: 0.25rem;
  }
  
  .cosmic-grid-cell-compact {
    min-height: 2.5rem;
  }
  
  .control-section {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .selection-card-compact,
  .patterns-card-compact {
    flex: 1;
    padding: 0.75rem;
  }
}

/* Selection Card Styles */
.selection-card {
  margin-bottom: 2rem;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.selection-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.selection-counter {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 9999px;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.selection-area {
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.selected-sequence {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.selected-element-cosmic {
  position: relative;
  width: 4rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-background {
  position: absolute;
  inset: 0;
  background: rgba(147, 51, 234, 0.3);
  border: 2px solid #9333ea;
  border-radius: 0.75rem;
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.5);
}

.element-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 100%);
  border-radius: 0.75rem;
  animation: element-pulse 2s ease-in-out infinite;
}

.element-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
}

.element-order {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
}

.empty-selection {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  animation: float 3s ease-in-out infinite;
}

.empty-text {
  font-style: italic;
}

.action-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-button {
  flex: 1;
  max-width: 12rem;
}

.button-icon {
  font-size: 1.25rem;
}

@keyframes element-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Patterns Card Styles */
.patterns-card {
  margin-bottom: 2rem;
}

.patterns-header {
  text-align: center;
  margin-bottom: 2rem;
}

.patterns-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.patterns-subtitle {
  font-size: 1rem;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.pattern-mission-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mission-pending {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
}

.mission-active {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  transform: scale(1.02);
}

.mission-completed {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

.mission-status {
  flex-shrink: 0;
}

.status-icon {
  font-size: 1.5rem;
}

.completed-icon {
  color: #22c55e;
  filter: drop-shadow(0 0 8px currentColor);
}

.active-icon {
  color: #fbbf24;
  filter: drop-shadow(0 0 8px currentColor);
  animation: pulse 2s infinite;
}

.pending-icon {
  color: #94A3B8;
  opacity: 0.7;
}

.mission-content {
  flex: 1;
}

.mission-pattern {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.mission-meaning {
  font-size: 0.875rem;
}

.mission-points {
  flex-shrink: 0;
  text-align: center;
}

.points-value {
  font-size: 0.875rem;
  font-weight: bold;
  color: #FBBF24;
  background: rgba(251, 191, 36, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* パーティクルエフェクト */
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  animation: particleFloat var(--duration) ease-out var(--delay) forwards;
}

/* アニメーション */
@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
  100% { transform: scale(1); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .pattern-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(6, 1fr);
    aspect-ratio: 4/6;
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .target-patterns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .pattern-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(8, 1fr);
    aspect-ratio: 3/8;
    gap: 0.5rem;
  }
  
  .pattern-hunter-game {
    padding: 0.5rem;
  }
}
</style>