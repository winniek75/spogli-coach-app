<template>
  <div class="time-zone-navigator-game">
    <!-- ゲームヘッダー -->
    <div class="game-header">
      <div class="game-info">
        <h2 class="game-title">
          <Icon name="clock" class="w-8 h-8" />
          Time Zone Navigator
        </h2>
        <p class="game-description">Drag sentences to the correct time zone!</p>
      </div>
      <div class="game-stats">
        <div class="stat-item">
          <Icon name="star" class="w-5 h-5" />
          <span>{{ score }}</span>
        </div>
        <div class="stat-item">
          <Icon name="heart" class="w-5 h-5 text-red-400" />
          <span>{{ lives }}</span>
        </div>
        <div class="stat-item">
          <Icon name="clock" class="w-5 h-5" />
          <span>{{ timeLeft }}s</span>
        </div>
      </div>
    </div>

    <!-- メインゲームエリア -->
    <div class="game-area">
      <!-- 文法要素ドロップゾーン -->
      <div class="sentence-area">
        <div 
          v-if="currentSentence"
          class="sentence-card"
          :class="{ 'dragging': isDragging }"
          draggable="true"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
          @click="handleSentenceClick"
        >
          <div class="sentence-text">
            {{ currentSentence.text }}
          </div>
          <div class="sentence-hint" v-if="showHint">
            <Icon name="lightbulb" class="w-4 h-4" />
            {{ currentSentence.explanation }}
          </div>
        </div>
      </div>

      <!-- 3つの時制ゾーン -->
      <div class="time-zones">
        <!-- 過去ゾーン -->
        <div 
          class="time-zone past-zone"
          :class="{ 
            'drag-over': dragOverZone === 'past',
            'zone-correct': lastResult === 'correct' && lastZone === 'past',
            'zone-incorrect': lastResult === 'incorrect' && lastZone === 'past'
          }"
          @dragover.prevent="handleDragOver('past')"
          @dragleave="handleDragLeave"
          @drop="handleDrop('past')"
          @click="handleZoneClick('past')"
        >
          <div class="zone-header">
            <Icon name="arrow-left" class="w-6 h-6" />
            <h3>Past</h3>
          </div>
          <div class="zone-content">
            <div class="time-indicators">
              <span class="time-word">yesterday</span>
              <span class="time-word">last week</span>
              <span class="time-word">ago</span>
            </div>
            <div class="zone-examples">
              <div class="example">I <strong>ate</strong> lunch</div>
              <div class="example">She <strong>was</strong> here</div>
            </div>
          </div>
          <div class="zone-cosmic-bg">
            <div class="cosmic-particle" v-for="i in 8" :key="i"></div>
          </div>
        </div>

        <!-- 現在ゾーン -->
        <div 
          class="time-zone present-zone"
          :class="{ 
            'drag-over': dragOverZone === 'present',
            'zone-correct': lastResult === 'correct' && lastZone === 'present',
            'zone-incorrect': lastResult === 'incorrect' && lastZone === 'present'
          }"
          @dragover.prevent="handleDragOver('present')"
          @dragleave="handleDragLeave"
          @drop="handleDrop('present')"
          @click="handleZoneClick('present')"
        >
          <div class="zone-header">
            <Icon name="play" class="w-6 h-6" />
            <h3>Present</h3>
          </div>
          <div class="zone-content">
            <div class="time-indicators">
              <span class="time-word">now</span>
              <span class="time-word">today</span>
              <span class="time-word">usually</span>
            </div>
            <div class="zone-examples">
              <div class="example">I <strong>eat</strong> breakfast</div>
              <div class="example">She <strong>is</strong> happy</div>
            </div>
          </div>
          <div class="zone-cosmic-bg">
            <div class="cosmic-particle" v-for="i in 8" :key="i"></div>
          </div>
        </div>

        <!-- 未来ゾーン -->
        <div 
          class="time-zone future-zone"
          :class="{ 
            'drag-over': dragOverZone === 'future',
            'zone-correct': lastResult === 'correct' && lastZone === 'future',
            'zone-incorrect': lastResult === 'incorrect' && lastZone === 'future'
          }"
          @dragover.prevent="handleDragOver('future')"
          @dragleave="handleDragLeave"
          @drop="handleDrop('future')"
          @click="handleZoneClick('future')"
        >
          <div class="zone-header">
            <Icon name="arrow-right" class="w-6 h-6" />
            <h3>Future</h3>
          </div>
          <div class="zone-content">
            <div class="time-indicators">
              <span class="time-word">tomorrow</span>
              <span class="time-word">next week</span>
              <span class="time-word">will</span>
            </div>
            <div class="zone-examples">
              <div class="example">I <strong>will eat</strong> dinner</div>
              <div class="example">She <strong>will be</strong> there</div>
            </div>
          </div>
          <div class="zone-cosmic-bg">
            <div class="cosmic-particle" v-for="i in 8" :key="i"></div>
          </div>
        </div>
      </div>

      <!-- 完了形ゾーン（上級レベルで表示） -->
      <div 
        v-if="currentLevel >= 3"
        class="time-zone perfect-zone"
        :class="{ 
          'drag-over': dragOverZone === 'perfect',
          'zone-correct': lastResult === 'correct' && lastZone === 'perfect',
          'zone-incorrect': lastResult === 'incorrect' && lastZone === 'perfect'
        }"
        @dragover.prevent="handleDragOver('perfect')"
        @dragleave="handleDragLeave"
        @drop="handleDrop('perfect')"
        @click="handleZoneClick('perfect')"
      >
        <div class="zone-header">
          <Icon name="check-circle" class="w-6 h-6" />
          <h3>Perfect</h3>
        </div>
        <div class="zone-content">
          <div class="time-indicators">
            <span class="time-word">have/has</span>
            <span class="time-word">already</span>
            <span class="time-word">just</span>
          </div>
          <div class="zone-examples">
            <div class="example">I <strong>have eaten</strong></div>
            <div class="example">She <strong>has been</strong> here</div>
          </div>
        </div>
        <div class="zone-cosmic-bg">
          <div class="cosmic-particle" v-for="i in 8" :key="i"></div>
        </div>
      </div>
    </div>

    <!-- フィードバックエリア -->
    <div class="feedback-area">
      <div 
        v-if="feedbackMessage"
        class="feedback-message"
        :class="feedbackType"
      >
        <Icon :name="feedbackType === 'correct' ? 'check-circle' : 'x-circle'" class="w-5 h-5" />
        {{ feedbackMessage }}
      </div>

      <div class="game-controls">
        <button 
          @click="toggleHint"
          class="control-btn hint-btn"
          :class="{ 'active': showHint }"
        >
          <Icon name="lightbulb" class="w-5 h-5" />
          Hint
        </button>
        <button 
          @click="skipSentence"
          class="control-btn skip-btn"
          :disabled="skipsUsed >= maxSkips"
        >
          <Icon name="forward" class="w-5 h-5" />
          Skip ({{ maxSkips - skipsUsed }})
        </button>
      </div>
    </div>

    <!-- パーティクルエフェクト -->
    <ParticleEffect 
      :show="showParticles"
      :type="particleType"
      :count="particleCount"
      :color="particleColor"
      :duration="2000"
      @complete="onParticleComplete"
    />

    <!-- 結果モーダル -->
    <GameResultModal
      :show="showResult"
      :score="score"
      :maxScore="maxScore"
      :stars="earnedStars"
      :gameType="'time-zone-navigator'"
      @close="handleResultClose"
      @restart="handleRestart"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import { timeZoneNavigatorData } from '@/data/grammarFoundationData'
import Icon from '@/components/shared/Icon.vue'
import ParticleEffect from './shared/ParticleEffect.vue'
import GameResultModal from './shared/GameResultModal.vue'
import { useAudioStore } from '@/stores/audioStore'

// Props & Emits
const props = defineProps({
  level: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    default: 'beginner'
  }
})

const emit = defineEmits(['game-complete'])

// Store
const store = useGrammarGalaxyStore()
const audioStore = useAudioStore()

// Game State
const gameStarted = ref(false)
const gameFinished = ref(false)
const currentLevel = ref(props.level)
const currentQuestionIndex = ref(0)
const score = ref(0)
const lives = ref(3)
const timeLeft = ref(120) // 2分
const maxSkips = ref(3)
const skipsUsed = ref(0)

// Drag & Drop State
const isDragging = ref(false)
const dragOverZone = ref(null)
const selectedMode = ref('drag') // 'drag' or 'click'

// Game Content
const gameData = ref([])
const currentSentence = computed(() => gameData.value[currentQuestionIndex.value] || null)

// UI State
const showHint = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('')
const lastResult = ref('')
const lastZone = ref('')
const showResult = ref(false)

// Particle Effects
const showParticles = ref(false)
const particleType = ref('stars')
const particleCount = ref(15)
const particleColor = ref('gold')

// Computed Properties
const maxScore = computed(() => gameData.value.length * 100)
const earnedStars = computed(() => {
  const percentage = (score.value / maxScore.value) * 100
  if (percentage >= 90) return 3
  if (percentage >= 70) return 2
  if (percentage >= 50) return 1
  return 0
})

// Game Timer
let gameTimer = null

// Methods
const initializeGame = () => {
  gameData.value = [...timeZoneNavigatorData[props.difficulty] || timeZoneNavigatorData.beginner]
  currentQuestionIndex.value = 0
  score.value = 0
  lives.value = 3
  timeLeft.value = 120
  skipsUsed.value = 0
  gameStarted.value = true
  gameFinished.value = false
  
  startTimer()
}

const startTimer = () => {
  gameTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

const stopTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

// Drag & Drop Handlers
const handleDragStart = (event) => {
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', currentSentence.value.text)
}

const handleDragEnd = () => {
  isDragging.value = false
  dragOverZone.value = null
}

const handleDragOver = (zone) => {
  dragOverZone.value = zone
}

const handleDragLeave = () => {
  dragOverZone.value = null
}

const handleDrop = (zone) => {
  dragOverZone.value = null
  checkAnswer(zone)
}

// Click Handlers (for mobile/accessibility)
const handleSentenceClick = () => {
  if (selectedMode.value === 'click') {
    // Highlight sentence for click mode
  }
}

const handleZoneClick = (zone) => {
  if (selectedMode.value === 'click' || window.innerWidth < 768) {
    checkAnswer(zone)
  }
}

// Answer Checking
const checkAnswer = (selectedZone) => {
  if (!currentSentence.value) return

  const isCorrect = currentSentence.value.correctZone === selectedZone
  lastZone.value = selectedZone
  
  if (isCorrect) {
    handleCorrectAnswer()
  } else {
    handleIncorrectAnswer()
  }
  
  // Move to next question after delay
  setTimeout(() => {
    nextQuestion()
  }, 2000)
}

const handleCorrectAnswer = () => {
  lastResult.value = 'correct'
  score.value += 100
  
  // Bonus points for speed and no hints
  if (!showHint.value) score.value += 20
  if (timeLeft.value > 100) score.value += 10
  
  feedbackMessage.value = 'Excellent! Correct time zone!'
  feedbackType.value = 'correct'
  
  // Trigger particle effect
  showParticles.value = true
  particleType.value = 'stars'
  particleColor.value = 'gold'
  
  // Play success sound
  audioStore.playCorrect()
  audioStore.speak('Correct! Well done!')
}

const handleIncorrectAnswer = () => {
  lastResult.value = 'incorrect'
  lives.value--
  
  feedbackMessage.value = `Incorrect. This sentence belongs in the ${currentSentence.value.correctZone} zone.`
  feedbackType.value = 'incorrect'
  
  // Trigger error effect
  showParticles.value = true
  particleType.value = 'explosion'
  particleColor.value = 'red'
  
  // Play error sound
  audioStore.playIncorrect()
  audioStore.speak('Try again!')
  
  if (lives.value <= 0) {
    endGame()
  }
}

const nextQuestion = () => {
  currentQuestionIndex.value++
  showHint.value = false
  feedbackMessage.value = ''
  lastResult.value = ''
  lastZone.value = ''
  
  if (currentQuestionIndex.value >= gameData.value.length) {
    endGame()
  }
}

const skipSentence = () => {
  if (skipsUsed.value >= maxSkips) return
  
  skipsUsed.value++
  score.value = Math.max(0, score.value - 20) // Penalty for skipping
  nextQuestion()
}

const toggleHint = () => {
  showHint.value = !showHint.value
}

const endGame = () => {
  gameFinished.value = true
  stopTimer()
  
  // Save to store
  const gameResult = {
    score: score.value,
    maxScore: maxScore.value,
    stars: earnedStars.value,
    timeSpent: 120 - timeLeft.value,
    correctAnswers: Math.floor(score.value / 100),
    totalQuestions: gameData.value.length
  }
  
  store.completeGame('timeZoneNavigator', gameResult)
  
  // Show result modal
  setTimeout(() => {
    showResult.value = true
  }, 1000)
}

// Particle Effect Handler
const onParticleComplete = () => {
  showParticles.value = false
}

// Modal Handlers
const handleResultClose = () => {
  showResult.value = false
  emit('game-complete', {
    score: score.value,
    stars: earnedStars.value
  })
}

const handleRestart = () => {
  showResult.value = false
  initializeGame()
}

// Device Detection
const detectInputMethod = () => {
  if (window.innerWidth < 768 || 'ontouchstart' in window) {
    selectedMode.value = 'click'
  }
}

// Lifecycle
onMounted(() => {
  detectInputMethod()
  initializeGame()
  
  window.addEventListener('resize', detectInputMethod)
})

onUnmounted(() => {
  stopTimer()
  window.removeEventListener('resize', detectInputMethod)
})

// Watch for level changes
watch(() => props.level, (newLevel) => {
  currentLevel.value = newLevel
})
</script>

<style scoped>
.time-zone-navigator-game {
  @apply min-h-screen p-4 relative;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
}

/* Game Header */
.game-header {
  @apply flex justify-between items-center mb-6 p-4 rounded-lg;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.game-info .game-title {
  @apply flex items-center gap-3 text-2xl font-bold text-yellow-400;
}

.game-info .game-description {
  @apply text-gray-300 mt-1;
}

.game-stats {
  @apply flex gap-4;
}

.stat-item {
  @apply flex items-center gap-2 px-3 py-2 rounded bg-white bg-opacity-20;
}

/* Game Area */
.game-area {
  @apply space-y-6;
}

.sentence-area {
  @apply flex justify-center mb-8;
}

.sentence-card {
  @apply p-6 rounded-xl border-2 border-blue-400 bg-blue-900 bg-opacity-40;
  @apply cursor-grab transition-all duration-300 max-w-md text-center;
  backdrop-filter: blur(10px);
}

.sentence-card:hover {
  @apply scale-105 border-blue-300;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.sentence-card.dragging {
  @apply cursor-grabbing opacity-60 scale-95;
}

.sentence-text {
  @apply text-xl font-semibold mb-2;
}

.sentence-hint {
  @apply flex items-center justify-center gap-2 text-sm text-yellow-300;
  @apply mt-3 pt-3 border-t border-yellow-400 border-opacity-30;
}

/* Time Zones */
.time-zones {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6 mb-6;
}

.time-zone {
  @apply relative p-6 rounded-xl border-2 transition-all duration-300;
  @apply min-h-[200px] cursor-pointer overflow-hidden;
  backdrop-filter: blur(10px);
}

/* Zone Specific Styles */
.past-zone {
  @apply border-red-400 bg-gradient-to-br from-red-900 to-red-800;
  background-opacity: 0.3;
}

.present-zone {
  @apply border-green-400 bg-gradient-to-br from-green-900 to-green-800;
  background-opacity: 0.3;
}

.future-zone {
  @apply border-blue-400 bg-gradient-to-br from-blue-900 to-blue-800;
  background-opacity: 0.3;
}

.perfect-zone {
  @apply border-purple-400 bg-gradient-to-br from-purple-900 to-purple-800;
  background-opacity: 0.3;
  @apply col-span-1;
}

/* Zone States */
.time-zone.drag-over {
  @apply scale-105 border-opacity-100;
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2);
}

.zone-correct {
  @apply border-green-300;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
  animation: pulse-correct 1s ease-in-out;
}

.zone-incorrect {
  @apply border-red-300;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
  animation: shake 0.5s ease-in-out;
}

@keyframes pulse-correct {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

/* Zone Content */
.zone-header {
  @apply flex items-center gap-3 mb-4;
}

.zone-header h3 {
  @apply text-xl font-bold;
}

.time-indicators {
  @apply flex flex-wrap gap-2 mb-4;
}

.time-word {
  @apply px-2 py-1 text-xs rounded bg-white bg-opacity-20;
}

.zone-examples {
  @apply space-y-2 text-sm opacity-80;
}

.example strong {
  @apply text-yellow-300;
}

/* Cosmic Background */
.zone-cosmic-bg {
  @apply absolute inset-0 pointer-events-none;
}

.cosmic-particle {
  @apply absolute w-1 h-1 bg-white rounded-full opacity-60;
  animation: float 3s ease-in-out infinite;
}

.cosmic-particle:nth-child(odd) {
  animation-delay: -1s;
}

.cosmic-particle:nth-child(even) {
  animation-delay: -2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Position cosmic particles */
.cosmic-particle:nth-child(1) { top: 10%; left: 10%; }
.cosmic-particle:nth-child(2) { top: 20%; right: 15%; }
.cosmic-particle:nth-child(3) { top: 30%; left: 80%; }
.cosmic-particle:nth-child(4) { top: 60%; left: 20%; }
.cosmic-particle:nth-child(5) { top: 70%; right: 25%; }
.cosmic-particle:nth-child(6) { top: 80%; left: 60%; }
.cosmic-particle:nth-child(7) { top: 40%; left: 50%; }
.cosmic-particle:nth-child(8) { top: 50%; right: 40%; }

/* Feedback Area */
.feedback-area {
  @apply space-y-4;
}

.feedback-message {
  @apply flex items-center justify-center gap-3 p-4 rounded-lg;
  @apply text-lg font-semibold;
}

.feedback-message.correct {
  @apply bg-green-600 text-white;
}

.feedback-message.incorrect {
  @apply bg-red-600 text-white;
}

.game-controls {
  @apply flex justify-center gap-4;
}

.control-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg;
  @apply border border-gray-400 bg-gray-700 hover:bg-gray-600;
  @apply transition-all duration-200;
}

.control-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.hint-btn.active {
  @apply bg-yellow-600 border-yellow-500;
}

.skip-btn {
  @apply bg-blue-700 border-blue-500 hover:bg-blue-600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .time-zones {
    @apply grid-cols-1 gap-4;
  }
  
  .perfect-zone {
    @apply col-span-1;
  }
  
  .sentence-card {
    @apply p-4 text-lg;
  }
  
  .time-zone {
    @apply min-h-[150px] p-4;
  }
  
  .zone-header h3 {
    @apply text-lg;
  }
}

@media (max-width: 480px) {
  .game-header {
    @apply flex-col gap-4;
  }
  
  .game-stats {
    @apply justify-center;
  }
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 40px;
}

.time-chart {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 120px;
}
</style>