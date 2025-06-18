<template>
  <div class="word-family-tree-game">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          <ChevronLeftIcon class="w-6 h-6" />
        </button>
        <h1 class="game-title">
          <span class="text-2xl">🌳</span>
          Magical Word Forest
          <span class="text-xl">🍃</span>
        </h1>
      </div>
      <div class="header-right">
        <button @click="toggleSettings" class="settings-button">
          <CogIcon class="w-6 h-6" />
        </button>
      </div>
    </header>

    <!-- 進捗バー -->
    <div class="progress-section">
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
      <span class="progress-text">Progress: {{ Math.round(progress) }}%</span>
    </div>

    <!-- メインゲームエリア -->
    <main class="game-main">
      <!-- 木の成長エリア -->
      <div class="tree-container">
        <div class="magical-forest-bg">
          <!-- 背景の森の要素 -->
          <div class="background-trees">
            <div class="bg-tree" v-for="i in 3" :key="i"></div>
          </div>
          
          <!-- メインの語族の木 -->
          <div class="word-tree">
            <!-- 完成した単語（花として表示） -->
            <div class="flowers-layer">
              <div 
                v-for="(word, index) in completedWords" 
                :key="word"
                class="flower-word"
                :class="{ 'animate-bloom': newlyCompleted.includes(word) }"
                :style="getFlowerPosition(index)"
              >
                <div class="flower">🌸</div>
                <div class="word-text">{{ word }}</div>
              </div>
            </div>

            <!-- 枝と葉（進行中の単語） -->
            <div class="branches-layer">
              <div class="branch main-branch"></div>
              <div 
                v-for="(word, index) in branchWords" 
                :key="word"
                class="branch-word"
                :style="getBranchPosition(index)"
              >
                <div class="leaf">🍃</div>
                <div class="word-text">{{ word }}</div>
              </div>
            </div>

            <!-- 幹 -->
            <div class="trunk">
              <div class="trunk-section"></div>
            </div>

            <!-- 根（語族パターン） -->
            <div class="roots">
              <div class="root-pattern">
                <div class="soil">▓▓▓▓▓</div>
                <div class="pattern-text">-{{ currentPattern }}</div>
              </div>
            </div>
          </div>

          <!-- 森の動物たち -->
          <div class="forest-animals">
            <div class="animal rabbit" :class="{ 'happy': recentSuccess }">🐰</div>
            <div class="animal squirrel" :class="{ 'happy': recentSuccess }">🐿️</div>
            <div class="animal bird" :class="{ 'happy': recentSuccess }">🐦</div>
          </div>
        </div>
      </div>

      <!-- インストラクション -->
      <div class="instruction-panel">
        <h3 class="instruction-title">Grow your word tree!</h3>
        <p class="instruction-text">
          Drag words from the family <strong>-{{ currentPattern }}</strong> to help the tree grow.
          Watch as new branches sprout and flowers bloom!
        </p>
      </div>

      <!-- ドラッグ可能な単語エリア -->
      <div class="word-bank">
        <h4 class="word-bank-title">Word Bank</h4>
        <div class="draggable-words">
          <div
            v-for="word in availableWords"
            :key="word"
            class="draggable-word"
            :class="{
              'correct-family': isCorrectFamily(word),
              'incorrect-family': !isCorrectFamily(word),
              'dragging': draggedWord === word
            }"
            draggable="true"
            @dragstart="startDrag(word, $event)"
            @dragend="endDrag"
            @click="handleWordClick(word)"
          >
            {{ word }}
          </div>
        </div>
      </div>

      <!-- ドロップゾーン -->
      <div 
        class="drop-zone"
        :class="{ 'drag-over': isDragOver, 'can-drop': canDrop }"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <span class="text-4xl">🌳</span>
        <span class="drop-text">Drop words here to grow the tree</span>
      </div>
    </main>

    <!-- ゲーム統計 -->
    <div class="game-stats">
      <div class="stat-item">
        <HeartIcon class="stat-icon lives" />
        <span>{{ lives }}</span>
      </div>
      <div class="stat-item">
        <StarIcon class="stat-icon score" />
        <span>{{ score }}</span>
      </div>
      <div class="stat-item">
        <ClockIcon class="stat-icon time" />
        <span>{{ formatTime(timeElapsed) }}</span>
      </div>
    </div>

    <!-- フィードバックモーダル -->
    <transition name="modal">
      <div v-if="showFeedback" class="modal-backdrop" @click="closeFeedback">
        <div class="modal-content feedback-modal" @click.stop>
          <div class="feedback-content" :class="feedbackType">
            <div class="feedback-icon">
              <CheckCircleIcon v-if="feedbackType === 'correct'" class="w-16 h-16" />
              <XCircleIcon v-else class="w-16 h-16" />
            </div>
            <h3 class="feedback-title">{{ feedbackTitle }}</h3>
            <p class="feedback-message">{{ feedbackMessage }}</p>
            <button @click="closeFeedback" class="feedback-button">Continue</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- レベル完了モーダル -->
    <transition name="modal">
      <div v-if="showLevelComplete" class="modal-backdrop">
        <div class="modal-content level-complete-modal">
          <div class="level-complete-content">
            <div class="celebration-icon">🎉</div>
            <h2 class="level-complete-title">Forest Complete!</h2>
            <p class="level-complete-message">
              You've successfully grown a beautiful word tree for the -{{ currentPattern }} family!
            </p>
            <div class="completion-stats">
              <div class="stat">
                <span class="stat-label">Words Found:</span>
                <span class="stat-value">{{ completedWords.length }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Final Score:</span>
                <span class="stat-value">{{ score }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Time:</span>
                <span class="stat-value">{{ formatTime(timeElapsed) }}</span>
              </div>
            </div>
            <div class="level-complete-actions">
              <button @click="nextLevel" class="next-level-button">
                Next Forest
                <ArrowRightIcon class="w-5 h-5 ml-2" />
              </button>
              <button @click="restartLevel" class="restart-button">
                Play Again
                <ArrowPathIcon class="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 設定モーダル -->
    <transition name="modal">
      <div v-if="showSettings" class="modal-backdrop" @click="toggleSettings">
        <div class="modal-content settings-modal" @click.stop>
          <h3 class="settings-title">Game Settings</h3>
          <div class="settings-content">
            <div class="setting-item">
              <label class="setting-label">Sound Effects</label>
              <button 
                @click="toggleSound" 
                class="toggle-button"
                :class="{ 'active': soundEnabled }"
              >
                <SpeakerWaveIcon v-if="soundEnabled" class="w-5 h-5" />
                <SpeakerXMarkIcon v-else class="w-5 h-5" />
              </button>
            </div>
            <div class="setting-item">
              <label class="setting-label">Difficulty</label>
              <select v-model="difficulty" class="difficulty-select">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <button @click="toggleSettings" class="close-settings-button">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import {
  ChevronLeftIcon,
  CogIcon,
  // TreeIcon, // Does not exist
  // LeafIcon, // Does not exist  
  HeartIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/vue/24/outline'

// Router and Store
const router = useRouter()
const gameStore = useGameStore()

// Game State
const currentLevel = ref(0)
const currentPattern = ref('at')
const lives = ref(3)
const score = ref(0)
const timeElapsed = ref(0)
const gameTimer = ref(null)

// Word Data
const wordFamilies = {
  'at': {
    correct: ['cat', 'hat', 'bat', 'rat', 'mat', 'fat', 'sat', 'pat'],
    incorrect: ['dog', 'run', 'big', 'sun', 'car', 'bed']
  },
  'an': {
    correct: ['can', 'man', 'ran', 'pan', 'tan', 'fan', 'van', 'ban'],
    incorrect: ['cat', 'big', 'sun', 'top', 'red', 'wet']
  },
  'ap': {
    correct: ['cap', 'map', 'tap', 'gap', 'nap', 'sap', 'lap', 'rap'],
    incorrect: ['cat', 'dog', 'run', 'big', 'sun', 'car']
  },
  'it': {
    correct: ['sit', 'hit', 'bit', 'fit', 'pit', 'kit', 'lit', 'wit'],
    incorrect: ['cat', 'dog', 'run', 'big', 'sun', 'car']
  },
  'op': {
    correct: ['top', 'hop', 'cop', 'mop', 'pop', 'shop', 'stop', 'drop'],
    incorrect: ['cat', 'dog', 'run', 'big', 'sun', 'car']
  }
}

const patterns = Object.keys(wordFamilies)
const completedWords = ref([])
const branchWords = ref([])
const availableWords = ref([])
const newlyCompleted = ref([])

// UI State
const showFeedback = ref(false)
const showLevelComplete = ref(false)
const showSettings = ref(false)
const feedbackType = ref('correct')
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const soundEnabled = ref(true)
const difficulty = ref('medium')

// Drag and Drop State
const draggedWord = ref(null)
const isDragOver = ref(false)
const canDrop = ref(false)
const recentSuccess = ref(false)

// Computed Properties
const progress = computed(() => {
  const totalWords = wordFamilies[currentPattern.value].correct.length
  return (completedWords.value.length / totalWords) * 100
})

// Game Logic Methods
const initializeLevel = () => {
  const pattern = patterns[currentLevel.value]
  currentPattern.value = pattern
  completedWords.value = []
  branchWords.value = []
  newlyCompleted.value = []
  
  // Create mixed word pool
  const correctWords = [...wordFamilies[pattern].correct]
  const incorrectWords = [...wordFamilies[pattern].incorrect]
  
  // Shuffle and limit based on difficulty
  const totalWords = difficulty.value === 'easy' ? 8 : difficulty.value === 'medium' ? 10 : 12
  const correctRatio = difficulty.value === 'easy' ? 0.7 : difficulty.value === 'medium' ? 0.6 : 0.5
  
  const numCorrect = Math.floor(totalWords * correctRatio)
  const numIncorrect = totalWords - numCorrect
  
  const selectedCorrect = correctWords.sort(() => Math.random() - 0.5).slice(0, numCorrect)
  const selectedIncorrect = incorrectWords.sort(() => Math.random() - 0.5).slice(0, numIncorrect)
  
  availableWords.value = [...selectedCorrect, ...selectedIncorrect].sort(() => Math.random() - 0.5)
  
  lives.value = 3
  startTimer()
}

const isCorrectFamily = (word) => {
  return wordFamilies[currentPattern.value].correct.includes(word)
}

const startDrag = (word, event) => {
  draggedWord.value = word
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', word)
}

const endDrag = () => {
  draggedWord.value = null
  isDragOver.value = false
  canDrop.value = false
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
  canDrop.value = draggedWord.value && isCorrectFamily(draggedWord.value)
}

const handleDragLeave = () => {
  isDragOver.value = false
  canDrop.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  const word = event.dataTransfer.getData('text/plain')
  processWordDrop(word)
  endDrag()
}

const handleWordClick = (word) => {
  // Alternative to drag and drop for touch devices
  processWordDrop(word)
}

const processWordDrop = (word) => {
  if (isCorrectFamily(word)) {
    handleCorrectWord(word)
  } else {
    handleIncorrectWord(word)
  }
}

const handleCorrectWord = (word) => {
  if (completedWords.value.includes(word) || branchWords.value.includes(word)) {
    return // Word already used
  }
  
  // Add to tree
  branchWords.value.push(word)
  newlyCompleted.value.push(word)
  
  // After animation, move to completed
  setTimeout(() => {
    const index = branchWords.value.indexOf(word)
    if (index > -1) {
      branchWords.value.splice(index, 1)
      completedWords.value.push(word)
    }
  }, 1000)
  
  // Remove from available words
  const index = availableWords.value.indexOf(word)
  if (index > -1) {
    availableWords.value.splice(index, 1)
  }
  
  // Update score
  score.value += 100
  recentSuccess.value = true
  setTimeout(() => { recentSuccess.value = false }, 1000)
  
  // Play success sound
  if (soundEnabled.value) {
    playSuccessSound()
  }
  
  // Show feedback
  showCorrectFeedback(word)
  
  // Check level completion
  if (completedWords.value.length + branchWords.value.length >= wordFamilies[currentPattern.value].correct.length) {
    setTimeout(() => {
      completeLevel()
    }, 2000)
  }
}

const handleIncorrectWord = (word) => {
  lives.value--
  
  // Show feedback
  showIncorrectFeedback(word)
  
  // Play error sound
  if (soundEnabled.value) {
    playErrorSound()
  }
  
  if (lives.value <= 0) {
    gameOver()
  }
}

const showCorrectFeedback = (word) => {
  feedbackType.value = 'correct'
  feedbackTitle.value = 'Perfect!'
  feedbackMessage.value = `"${word}" belongs to the -${currentPattern.value} family! The tree is growing beautifully.`
  showFeedback.value = true
}

const showIncorrectFeedback = (word) => {
  feedbackType.value = 'incorrect'
  feedbackTitle.value = 'Not quite right!'
  feedbackMessage.value = `"${word}" doesn't belong to the -${currentPattern.value} family. Try again!`
  showFeedback.value = true
}

const closeFeedback = () => {
  showFeedback.value = false
  newlyCompleted.value = []
}

const completeLevel = () => {
  stopTimer()
  showLevelComplete.value = true
  
  // Save progress
  gameStore.updateProgress('WordFamilyTree', {
    level: currentLevel.value,
    score: score.value,
    time: timeElapsed.value,
    pattern: currentPattern.value
  })
}

const nextLevel = () => {
  currentLevel.value = (currentLevel.value + 1) % patterns.length
  showLevelComplete.value = false
  initializeLevel()
}

const restartLevel = () => {
  showLevelComplete.value = false
  score.value = 0
  timeElapsed.value = 0
  initializeLevel()
}

const gameOver = () => {
  stopTimer()
  feedbackType.value = 'incorrect'
  feedbackTitle.value = 'Game Over!'
  feedbackMessage.value = 'Don\'t worry! Every great gardener learns from experience. Try again!'
  showFeedback.value = true
}

// Position calculation methods
const getFlowerPosition = (index) => {
  const positions = [
    { top: '10%', left: '30%' },
    { top: '15%', left: '60%' },
    { top: '8%', left: '45%' },
    { top: '20%', left: '25%' },
    { top: '12%', left: '70%' },
    { top: '25%', left: '40%' },
    { top: '18%', left: '55%' },
    { top: '22%', left: '35%' }
  ]
  return positions[index % positions.length]
}

const getBranchPosition = (index) => {
  const positions = [
    { top: '35%', left: '35%' },
    { top: '40%', left: '55%' },
    { top: '32%', left: '45%' },
    { top: '38%', left: '25%' },
    { top: '42%', left: '65%' },
    { top: '36%', left: '40%' },
    { top: '44%', left: '50%' },
    { top: '34%', left: '60%' }
  ]
  return positions[index % positions.length]
}

// Timer methods
const startTimer = () => {
  gameTimer.value = setInterval(() => {
    timeElapsed.value++
  }, 1000)
}

const stopTimer = () => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
    gameTimer.value = null
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Audio methods
const playSuccessSound = () => {
  // Web Audio API implementation would go here
  console.log('Playing success sound')
}

const playErrorSound = () => {
  // Web Audio API implementation would go here
  console.log('Playing error sound')
}

// Settings methods
const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
}

// Navigation methods
const goBack = () => {
  stopTimer()
  router.push('/games')
}

// Lifecycle
onMounted(() => {
  initializeLevel()
})

onUnmounted(() => {
  stopTimer()
})

// Watch for difficulty changes
watch(difficulty, () => {
  initializeLevel()
})
</script>

<style scoped>
/* ===========================================
   Word Family Tree Game Styles
   テーマ: 魔法の森 - 語族パターンの学習
   ========================================== */

/* CSS Variables */
.word-family-tree-game {
  --primary: #2E7D32;      /* フォレストグリーン */
  --secondary: #8BC34A;    /* ライトグリーン */
  --accent: #FF9800;       /* アンバー */
  --background: #E8F5E8;   /* ペールグリーン */
  --surface: #FFFFFF;      /* ピュアホワイト */
  --bark: #5D4E37;         /* 樹皮ブラウン */
  --leaf: #4CAF50;         /* リーフグリーン */
  --flower: #E91E63;       /* 花ピンク */
  --soil: #8D6E63;         /* 土ブラウン */
  --sky: #87CEEB;          /* スカイブルー */
  --success: #4CAF50;
  --error: #FF5252;
  --text: #1F2937;
  --border: #E5E7EB;
}

/* Main Container */
.word-family-tree-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, var(--sky) 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: var(--text);
  position: relative;
  overflow-x: hidden;
}

/* Header Styles */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--primary);
  box-shadow: 0 2px 10px rgba(46, 125, 50, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button, .settings-button {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.back-button:hover, .settings-button:hover {
  background: #1B5E20;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4);
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.title-icon, .leaf-icon {
  width: 2rem;
  height: 2rem;
  color: var(--leaf);
}

.leaf-icon {
  animation: leaf-sway 3s ease-in-out infinite;
}

@keyframes leaf-sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

/* Progress Section */
.progress-section {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-container {
  flex: 1;
  height: 12px;
  background: #E0E0E0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary), var(--leaf));
  border-radius: 6px;
  transition: width 0.8s ease-in-out;
  position: relative;
}

.progress-bar::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-weight: 600;
  color: var(--primary);
  font-size: 0.9rem;
}

/* Main Game Area */
.game-main {
  padding: 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  min-height: 600px;
}

/* Tree Container */
.tree-container {
  position: relative;
  background: linear-gradient(180deg, var(--sky) 0%, var(--background) 70%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(46, 125, 50, 0.2);
  overflow: hidden;
}

.magical-forest-bg {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* Background Trees */
.background-trees {
  position: absolute;
  top: 20%;
  left: 0;
  right: 0;
  z-index: 1;
}

.bg-tree {
  position: absolute;
  width: 60px;
  height: 120px;
  background: linear-gradient(180deg, var(--leaf) 0%, var(--bark) 70%);
  border-radius: 30px 30px 10px 10px;
  opacity: 0.3;
}

.bg-tree:nth-child(1) { left: 10%; transform: scale(0.8); }
.bg-tree:nth-child(2) { right: 15%; transform: scale(0.6); }
.bg-tree:nth-child(3) { left: 70%; transform: scale(0.7); }

/* Main Word Tree */
.word-tree {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}

/* Tree Layers */
.flowers-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60%;
  z-index: 4;
}

.branches-layer {
  position: absolute;
  top: 20%;
  left: 0;
  right: 0;
  bottom: 40%;
  z-index: 3;
}

/* Flower Words (Completed) */
.flower-word {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: gentle-sway 4s ease-in-out infinite;
}

.flower-word.animate-bloom {
  animation: bloom-animation 1s ease-out, gentle-sway 4s ease-in-out infinite 1s;
}

@keyframes bloom-animation {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(-90deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes gentle-sway {
  0%, 100% { transform: translateX(-2px) rotate(-1deg); }
  50% { transform: translateX(2px) rotate(1deg); }
}

.flower {
  font-size: 2rem;
  margin-bottom: 0.2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.word-text {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border: 2px solid var(--leaf);
}

/* Branch Words (In Progress) */
.branch-word {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: leaf-rustle 3s ease-in-out infinite;
}

@keyframes leaf-rustle {
  0%, 100% { transform: translateY(-1px) rotate(-2deg); }
  50% { transform: translateY(1px) rotate(2deg); }
}

.leaf {
  font-size: 1.8rem;
  margin-bottom: 0.2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Tree Trunk */
.trunk {
  position: absolute;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.trunk-section {
  width: 40px;
  height: 150px;
  background: linear-gradient(180deg, var(--bark) 0%, #4A2C17 100%);
  border-radius: 20px;
  box-shadow: 
    inset -5px 0 10px rgba(0,0,0,0.3),
    inset 5px 0 10px rgba(255,255,255,0.1);
  position: relative;
}

.trunk-section::before {
  content: "";
  position: absolute;
  top: 20%;
  left: -3px;
  width: 8px;
  height: 15px;
  background: var(--bark);
  border-radius: 50%;
  box-shadow: 0 5px 0 var(--bark), 0 15px 0 var(--bark);
}

/* Main Branch */
.main-branch {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 8px;
  background: linear-gradient(90deg, var(--bark), #6D4C41, var(--bark));
  border-radius: 4px;
  z-index: 1;
}

.main-branch::before,
.main-branch::after {
  content: "";
  position: absolute;
  width: 100px;
  height: 6px;
  background: inherit;
  border-radius: 3px;
}

.main-branch::before {
  top: -15px;
  left: 30px;
  transform: rotate(-25deg);
}

.main-branch::after {
  top: -15px;
  right: 30px;
  transform: rotate(25deg);
}

/* Tree Roots */
.roots {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.root-pattern {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.soil {
  font-size: 1.5rem;
  color: var(--soil);
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.pattern-text {
  background: linear-gradient(135deg, var(--accent), #FFA726);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
  border: 3px solid white;
}

/* Forest Animals */
.forest-animals {
  position: absolute;
  bottom: 15%;
  left: 0;
  right: 0;
  z-index: 5;
}

.animal {
  position: absolute;
  font-size: 1.5rem;
  transition: all 0.5s ease;
  cursor: pointer;
}

.animal.happy {
  animation: happy-jump 0.6s ease-in-out;
}

@keyframes happy-jump {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.2); }
}

.rabbit {
  bottom: 0;
  left: 20%;
  animation: rabbit-hop 5s ease-in-out infinite;
}

.squirrel {
  bottom: 5px;
  right: 25%;
  animation: squirrel-twitch 3s ease-in-out infinite;
}

.bird {
  bottom: 40px;
  left: 60%;
  animation: bird-fly 6s ease-in-out infinite;
}

@keyframes rabbit-hop {
  0%, 90%, 100% { transform: translateX(0); }
  45% { transform: translateX(10px); }
}

@keyframes squirrel-twitch {
  0%, 80%, 100% { transform: rotate(0deg); }
  40% { transform: rotate(5deg); }
}

@keyframes bird-fly {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Right Panel */
.game-main > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Instruction Panel */
.instruction-panel {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 16px;
  border-left: 4px solid var(--secondary);
  box-shadow: 0 4px 12px rgba(139, 195, 74, 0.2);
}

.instruction-title {
  color: var(--primary);
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 0.8rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.instruction-title::before {
  content: "🌱";
  font-size: 1.5rem;
}

.instruction-text {
  color: var(--text);
  line-height: 1.5;
  margin: 0;
}

/* Word Bank */
.word-bank {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
}

.word-bank-title {
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.word-bank-title::before {
  content: "📚";
  font-size: 1.3rem;
}

/* Draggable Words */
.draggable-words {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.8rem;
}

.draggable-word {
  background: linear-gradient(135deg, var(--surface), #F5F5F5);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 0.8rem;
  text-align: center;
  font-weight: bold;
  cursor: grab;
  transition: all 0.3s ease;
  user-select: none;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.draggable-word:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.draggable-word:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.draggable-word.correct-family {
  border-color: var(--success);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1));
}

.draggable-word.incorrect-family {
  border-color: var(--error);
  background: linear-gradient(135deg, rgba(255, 82, 82, 0.1), rgba(255, 138, 128, 0.1));
}

.draggable-word.dragging {
  opacity: 0.5;
  transform: rotate(5deg) scale(1.05);
}

/* Drop Zone */
.drop-zone {
  background: rgba(255, 255, 255, 0.8);
  border: 3px dashed var(--border);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-height: 120px;
  justify-content: center;
}

.drop-zone.drag-over {
  border-color: var(--primary);
  background: rgba(46, 125, 50, 0.1);
  transform: scale(1.02);
}

.drop-zone.can-drop {
  border-color: var(--success);
  background: rgba(76, 175, 80, 0.15);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.drop-icon {
  width: 3rem;
  height: 3rem;
  color: var(--primary);
  opacity: 0.6;
}

.drop-text {
  color: var(--primary);
  font-weight: 600;
  opacity: 0.8;
}

/* Game Statistics */
.game-stats {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.stat-item {
  background: rgba(255, 255, 255, 0.95);
  padding: 0.8rem 1.2rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  backdrop-filter: blur(10px);
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-icon.lives {
  color: #E91E63;
}

.stat-icon.score {
  color: #FFD700;
}

.stat-icon.time {
  color: var(--primary);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

/* Feedback Modal */
.feedback-modal .feedback-content {
  text-align: center;
}

.feedback-content.correct {
  border-top: 4px solid var(--success);
}

.feedback-content.incorrect {
  border-top: 4px solid var(--error);
}

.feedback-icon {
  margin-bottom: 1rem;
}

.feedback-icon .w-16 {
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
}

.feedback-content.correct .feedback-icon {
  color: var(--success);
}

.feedback-content.incorrect .feedback-icon {
  color: var(--error);
}

.feedback-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.feedback-content.correct .feedback-title {
  color: var(--success);
}

.feedback-content.incorrect .feedback-title {
  color: var(--error);
}

.feedback-message {
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  color: var(--text);
}

.feedback-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feedback-button:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 125, 50, 0.3);
}

/* Level Complete Modal */
.level-complete-modal {
  max-width: 600px;
}

.level-complete-content {
  text-align: center;
}

.celebration-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: celebration-bounce 1s ease-in-out;
}

@keyframes celebration-bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.level-complete-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--primary);
  margin: 0 0 1rem 0;
}

.level-complete-message {
  font-size: 1.2rem;
  line-height: 1.5;
  margin: 0 0 2rem 0;
  color: var(--text);
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  background: var(--background);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text);
}

.level-complete-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.next-level-button, .restart-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-level-button {
  background: var(--primary);
  color: white;
}

.next-level-button:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 125, 50, 0.3);
}

.restart-button {
  background: var(--accent);
  color: white;
}

.restart-button:hover {
  background: #F57C00;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 152, 0, 0.3);
}

/* Settings Modal */
.settings-modal {
  max-width: 400px;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-weight: 600;
  color: var(--text);
}

.toggle-button {
  background: #E0E0E0;
  border: none;
  border-radius: 25px;
  width: 50px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-button.active {
  background: var(--primary);
  color: white;
}

.difficulty-select {
  background: white;
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.difficulty-select:focus {
  outline: none;
  border-color: var(--primary);
}

.close-settings-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.close-settings-button:hover {
  background: #1B5E20;
  transform: translateY(-2px);
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .game-main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .tree-container {
    order: 1;
  }
  
  .game-main > div:last-child {
    order: 2;
  }
}

@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 1.4rem;
  }
  
  .game-main {
    padding: 1rem;
    gap: 1rem;
  }
  
  .tree-container {
    padding: 1rem;
    min-height: 400px;
  }
  
  .draggable-words {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .game-stats {
    position: static;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .stat-item {
    padding: 0.6rem 1rem;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 0.5rem;
  }
  
  .game-title {
    font-size: 1.2rem;
  }
  
  .title-icon, .leaf-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .level-complete-actions {
    flex-direction: column;
  }
  
  .next-level-button, .restart-button {
    width: 100%;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .word-family-tree-game {
    --background: #1A2E1A;
    --surface: #2E2E2E;
    --text: #FFFFFF;
    --border: #404040;
  }
  
  .tree-container {
    background: linear-gradient(180deg, #2C3E50 0%, var(--background) 70%);
  }
  
  .modal-content {
    background: var(--surface);
    color: var(--text);
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .draggable-word {
    border-width: 3px;
  }
  
  .drop-zone {
    border-width: 4px;
  }
  
  .word-text {
    border-width: 3px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print Styles */
@media print {
  .word-family-tree-game {
    background: white;
    color: black;
  }
  
  .game-stats,
  .modal-backdrop,
  .settings-button {
    display: none !important;
  }
}
</style>