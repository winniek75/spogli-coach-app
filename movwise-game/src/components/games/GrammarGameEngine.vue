<template>
  <div class="grammar-game-engine">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="header-left">
        <button @click="pauseGame" class="pause-button">
          <PauseIcon v-if="!isPaused" class="h-6 w-6" />
          <PlayIcon v-else class="h-6 w-6" />
        </button>
        <div class="game-title">
          <h2>{{ gameData.name }}</h2>
          <p class="game-type">{{ gameData.type }}</p>
        </div>
      </div>
      
      <div class="header-center">
        <div class="progress-container">
          <div class="level-progress">
            <span class="level-text">問題 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="game-stats">
          <div class="stat-item">
            <ClockIcon class="h-5 w-5" />
            <span>{{ formattedTime }}</span>
          </div>
          <div class="stat-item">
            <StarIcon class="h-5 w-5 text-yellow-400" />
            <span>{{ currentScore }}</span>
          </div>
          <div class="stat-item hearts">
            <HeartIcon 
              v-for="i in maxLives" 
              :key="i"
              :class="[
                'h-5 w-5',
                i <= currentLives ? 'text-red-500' : 'text-gray-300'
              ]"
            />
          </div>
        </div>
        <button @click="exitGame" class="exit-button">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </header>

    <!-- メインゲームエリア -->
    <main class="game-content" :class="{ 'paused': isPaused }">
      <!-- 一時停止オーバーレイ -->
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-modal">
          <h3>ゲーム一時停止</h3>
          <div class="pause-buttons">
            <button @click="resumeGame" class="resume-button">
              <PlayIcon class="h-5 w-5" />
              再開
            </button>
            <button @click="restartGame" class="restart-button">
              <ArrowPathIcon class="h-5 w-5" />
              最初から
            </button>
            <button @click="exitGame" class="exit-button-pause">
              <HomeIcon class="h-5 w-5" />
              終了
            </button>
          </div>
        </div>
      </div>

      <!-- ゲーム状態に応じたコンテンツ -->
      <div v-if="gameState === 'loading'" class="game-loading">
        <div class="loading-spinner"></div>
        <p>ゲームを準備中...</p>
      </div>

      <div v-else-if="gameState === 'ready'" class="game-ready">
        <div class="ready-content">
          <div class="game-icon">{{ gameData.icon }}</div>
          <h3>{{ gameData.name }}</h3>
          <p class="game-description">{{ gameData.description }}</p>
          <div class="game-instructions">
            <h4>遊び方</h4>
            <ul>
              <li v-for="instruction in gameData.instructions" :key="instruction">
                {{ instruction }}
              </li>
            </ul>
          </div>
          <button @click="startGame" class="start-game-button">
            <PlayIcon class="h-6 w-6" />
            ゲームスタート
          </button>
        </div>
      </div>

      <div v-else-if="gameState === 'playing'" class="game-playing">
        <!-- ゲーム固有のコンテンツをスロットで受け取る -->
        <slot 
          name="game-content"
          :current-question="currentQuestion"
          :current-question-index="currentQuestionIndex"
          :answer-question="answerQuestion"
          :game-data="gameData"
          :is-answering="isAnswering"
        >
          <!-- デフォルトゲームコンテンツ -->
          <div class="default-game-content">
            <div class="question-area">
              <h3 class="question-text">{{ currentQuestion.text }}</h3>
              <div class="question-options">
                <button
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  @click="answerQuestion(index)"
                  :disabled="isAnswering"
                  class="option-button"
                  :class="getOptionClass(index)"
                >
                  {{ option.text }}
                </button>
              </div>
            </div>
          </div>
        </slot>

        <!-- フィードバックエリア -->
        <div v-if="showFeedback" class="feedback-area">
          <Transition name="feedback" appear>
            <div 
              class="feedback-message"
              :class="lastAnswerCorrect ? 'correct' : 'incorrect'"
            >
              <div class="feedback-icon">
                <CheckCircleIcon v-if="lastAnswerCorrect" class="h-12 w-12" />
                <XCircleIcon v-else class="h-12 w-12" />
              </div>
              <div class="feedback-text">
                <h4>{{ lastAnswerCorrect ? '正解！' : '不正解' }}</h4>
                <p v-if="currentQuestion.explanation">{{ currentQuestion.explanation }}</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div v-else-if="gameState === 'completed'" class="game-completed">
        <div class="completion-content">
          <div class="completion-animation">
            <div class="trophy-icon">🏆</div>
            <div class="stars-earned">
              <StarIcon 
                v-for="i in starsEarned" 
                :key="i"
                class="h-8 w-8 text-yellow-400 fill-current star-animate"
                :style="{ animationDelay: (i * 0.2) + 's' }"
              />
            </div>
          </div>
          
          <h3 class="completion-title">ゲーム完了！</h3>
          
          <div class="final-stats">
            <div class="stat-box">
              <div class="stat-value">{{ finalScore }}</div>
              <div class="stat-label">最終スコア</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ correctAnswers }}</div>
              <div class="stat-label">正解数</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ Math.round(accuracy) }}%</div>
              <div class="stat-label">正解率</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ formattedFinalTime }}</div>
              <div class="stat-label">完了時間</div>
            </div>
          </div>

          <div class="completion-buttons">
            <button @click="restartGame" class="play-again-button">
              <ArrowPathIcon class="h-5 w-5" />
              もう一度プレイ
            </button>
            <button @click="goToNextGame" class="next-game-button" v-if="hasNextGame">
              <ChevronRightIcon class="h-5 w-5" />
              次のゲーム
            </button>
            <button @click="exitGame" class="back-to-map-button">
              <HomeIcon class="h-5 w-5" />
              マップに戻る
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="gameState === 'failed'" class="game-failed">
        <div class="failure-content">
          <div class="failure-icon">😢</div>
          <h3>ゲーム終了</h3>
          <p>ライフが尽きました。もう一度挑戦してみましょう！</p>
          
          <div class="failure-stats">
            <div class="stat-item">
              <span class="stat-label">到達問題数:</span>
              <span class="stat-value">{{ currentQuestionIndex + 1 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正解数:</span>
              <span class="stat-value">{{ correctAnswers }}</span>
            </div>
          </div>

          <div class="failure-buttons">
            <button @click="restartGame" class="retry-button">
              <ArrowPathIcon class="h-5 w-5" />
              リトライ
            </button>
            <button @click="exitGame" class="back-button">
              <HomeIcon class="h-5 w-5" />
              戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- ゲーム固有のUI要素（オーバーレイなど） -->
    <slot name="game-overlay" :game-state="gameState" :game-data="gameData"></slot>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import {
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  ArrowPathIcon,
  HomeIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'GrammarGameEngine',
  components: {
    PauseIcon,
    PlayIcon,
    XMarkIcon,
    ClockIcon,
    StarIcon,
    HeartIcon,
    ArrowPathIcon,
    HomeIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    XCircleIcon
  },
  props: {
    gameConfig: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    planetId: {
      type: String,
      required: true
    }
  },
  emits: ['game-started', 'game-completed', 'game-failed', 'question-answered', 'game-paused'],
  setup(props, { emit }) {
    const router = useRouter()
    const grammarStore = useGrammarGalaxyStore()

    // ゲーム状態
    const gameState = ref('loading') // loading, ready, playing, paused, completed, failed
    const isPaused = ref(false)
    const isAnswering = ref(false)
    const showFeedback = ref(false)

    // ゲームデータ
    const gameData = ref(props.gameConfig)
    const currentQuestionIndex = ref(0)
    const currentQuestion = ref(null)
    const totalQuestions = ref(props.questions.length)

    // スコアとライフ
    const currentScore = ref(0)
    const currentLives = ref(gameData.value.maxLives || 3)
    const maxLives = ref(gameData.value.maxLives || 3)
    const correctAnswers = ref(0)
    const totalAnswers = ref(0)

    // タイマー
    const startTime = ref(null)
    const endTime = ref(null)
    const elapsedTime = ref(0)
    const gameTimer = ref(null)

    // フィードバック
    const lastAnswerCorrect = ref(false)
    const selectedOptionIndex = ref(null)

    // 計算されたプロパティ
    const progressPercent = computed(() => {
      return totalQuestions.value > 0 ? (currentQuestionIndex.value / totalQuestions.value) * 100 : 0
    })

    const formattedTime = computed(() => {
      return formatTime(elapsedTime.value)
    })

    const formattedFinalTime = computed(() => {
      return formatTime(endTime.value - startTime.value)
    })

    const accuracy = computed(() => {
      return totalAnswers.value > 0 ? (correctAnswers.value / totalAnswers.value) * 100 : 0
    })

    const finalScore = computed(() => {
      return currentScore.value
    })

    const starsEarned = computed(() => {
      if (accuracy.value >= 90) return 3
      if (accuracy.value >= 70) return 2
      if (accuracy.value >= 50) return 1
      return 0
    })

    const hasNextGame = computed(() => {
      // 次のゲームがあるかどうかを判定
      const planet = grammarStore.getPlanetInfo(props.planetId)
      if (!planet) return false
      
      const currentGameIndex = planet.games.findIndex(g => g.id === gameData.value.id)
      return currentGameIndex !== -1 && currentGameIndex + 1 < planet.games.length
    })

    // 時間フォーマット
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // ゲーム初期化
    const initializeGame = async () => {
      gameState.value = 'loading'
      
      // ゲームデータの検証と初期化
      if (!props.questions || props.questions.length === 0) {
        console.error('No questions provided for game')
        return
      }

      currentQuestion.value = props.questions[0]
      totalQuestions.value = props.questions.length
      
      // 少し遅延を入れてローディング状態を見せる
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      gameState.value = 'ready'
    }

    // ゲーム開始
    const startGame = () => {
      gameState.value = 'playing'
      isPaused.value = false
      startTime.value = Date.now()
      currentQuestionIndex.value = 0
      currentQuestion.value = props.questions[0]
      
      startTimer()
      emit('game-started', {
        gameId: gameData.value.id,
        planetId: props.planetId,
        startTime: startTime.value
      })
    }

    // タイマー開始
    const startTimer = () => {
      gameTimer.value = setInterval(() => {
        if (!isPaused.value && gameState.value === 'playing') {
          elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
        }
      }, 1000)
    }

    // タイマー停止
    const stopTimer = () => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
        gameTimer.value = null
      }
    }

    // 質問に答える
    const answerQuestion = async (optionIndex) => {
      if (isAnswering.value || gameState.value !== 'playing') return

      isAnswering.value = true
      selectedOptionIndex.value = optionIndex
      totalAnswers.value++

      const question = currentQuestion.value
      const isCorrect = question.options[optionIndex].correct

      lastAnswerCorrect.value = isCorrect

      if (isCorrect) {
        correctAnswers.value++
        currentScore.value += gameData.value.pointsPerCorrect || 10
      } else {
        currentLives.value--
        if (currentLives.value <= 0) {
          await showQuestionFeedback()
          endGame(false)
          return
        }
      }

      emit('question-answered', {
        questionIndex: currentQuestionIndex.value,
        selectedOption: optionIndex,
        correct: isCorrect,
        question: question
      })

      await showQuestionFeedback()
      nextQuestion()
    }

    // フィードバック表示
    const showQuestionFeedback = () => {
      return new Promise(resolve => {
        showFeedback.value = true
        setTimeout(() => {
          showFeedback.value = false
          isAnswering.value = false
          resolve()
        }, 1500)
      })
    }

    // 次の質問
    const nextQuestion = () => {
      if (currentQuestionIndex.value + 1 < totalQuestions.value) {
        currentQuestionIndex.value++
        currentQuestion.value = props.questions[currentQuestionIndex.value]
        selectedOptionIndex.value = null
      } else {
        endGame(true)
      }
    }

    // ゲーム終了
    const endGame = (completed) => {
      stopTimer()
      endTime.value = Date.now()
      
      if (completed) {
        gameState.value = 'completed'
        const gameResult = {
          planetId: props.planetId,
          gameId: gameData.value.id,
          score: finalScore.value,
          starsEarned: starsEarned.value,
          completionTime: Math.floor((endTime.value - startTime.value) / 1000),
          accuracy: accuracy.value,
          correctAnswers: correctAnswers.value,
          totalAnswers: totalAnswers.value
        }
        
        // ストアにゲーム完了を記録
        grammarStore.completeGame(
          props.planetId,
          gameData.value.id,
          finalScore.value,
          starsEarned.value,
          gameResult.completionTime
        )
        
        emit('game-completed', gameResult)
      } else {
        gameState.value = 'failed'
        emit('game-failed', {
          planetId: props.planetId,
          gameId: gameData.value.id,
          reachedQuestion: currentQuestionIndex.value + 1,
          correctAnswers: correctAnswers.value
        })
      }
    }

    // ゲーム一時停止
    const pauseGame = () => {
      if (gameState.value === 'playing') {
        isPaused.value = true
        emit('game-paused', { paused: true })
      }
    }

    // ゲーム再開
    const resumeGame = () => {
      if (gameState.value === 'playing') {
        isPaused.value = false
        emit('game-paused', { paused: false })
      }
    }

    // ゲーム再スタート
    const restartGame = () => {
      stopTimer()
      
      // 状態をリセット
      currentQuestionIndex.value = 0
      currentQuestion.value = props.questions[0]
      currentScore.value = 0
      currentLives.value = maxLives.value
      correctAnswers.value = 0
      totalAnswers.value = 0
      elapsedTime.value = 0
      isPaused.value = false
      isAnswering.value = false
      showFeedback.value = false
      selectedOptionIndex.value = null
      
      gameState.value = 'ready'
    }

    // ゲーム終了（マップに戻る）
    const exitGame = () => {
      stopTimer()
      router.push(`/grammar-galaxy`)
    }

    // 次のゲームに進む
    const goToNextGame = () => {
      const planet = grammarStore.getPlanetInfo(props.planetId)
      if (!planet) return
      
      const currentGameIndex = planet.games.findIndex(g => g.id === gameData.value.id)
      if (currentGameIndex !== -1 && currentGameIndex + 1 < planet.games.length) {
        const nextGame = planet.games[currentGameIndex + 1]
        router.push(`/grammar-galaxy/game/${nextGame.id}`)
      }
    }

    // オプションボタンのクラス取得
    const getOptionClass = (index) => {
      const baseClasses = ['option-button']
      
      if (isAnswering.value && selectedOptionIndex.value === index) {
        baseClasses.push('selected')
      }
      
      if (showFeedback.value && selectedOptionIndex.value === index) {
        baseClasses.push(lastAnswerCorrect.value ? 'correct-selected' : 'incorrect-selected')
      }
      
      if (showFeedback.value && currentQuestion.value.options[index].correct) {
        baseClasses.push('correct-answer')
      }
      
      return baseClasses
    }

    // キーボードショートカット
    const handleKeyPress = (event) => {
      if (gameState.value === 'playing' && !isPaused.value && !isAnswering.value) {
        const key = event.key
        if (key >= '1' && key <= '4') {
          const optionIndex = parseInt(key) - 1
          if (optionIndex < currentQuestion.value.options.length) {
            answerQuestion(optionIndex)
          }
        } else if (key === ' ' || key === 'Escape') {
          pauseGame()
        }
      } else if (gameState.value === 'ready') {
        if (key === ' ' || key === 'Enter') {
          startGame()
        }
      } else if (isPaused.value) {
        if (key === ' ' || key === 'Escape') {
          resumeGame()
        }
      }
    }

    // ウィンドウフォーカス管理
    const handleWindowBlur = () => {
      if (gameState.value === 'playing' && !isPaused.value) {
        pauseGame()
      }
    }

    // ライフサイクル
    onMounted(() => {
      initializeGame()
      window.addEventListener('keydown', handleKeyPress)
      window.addEventListener('blur', handleWindowBlur)
    })

    onUnmounted(() => {
      stopTimer()
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('blur', handleWindowBlur)
    })

    // ゲーム状態の監視
    watch(gameState, (newState) => {
      if (newState === 'completed' || newState === 'failed') {
        stopTimer()
      }
    })

    return {
      // State
      gameState,
      isPaused,
      isAnswering,
      showFeedback,
      gameData,
      currentQuestionIndex,
      currentQuestion,
      totalQuestions,
      currentScore,
      currentLives,
      maxLives,
      correctAnswers,
      totalAnswers,
      elapsedTime,
      lastAnswerCorrect,
      selectedOptionIndex,

      // Computed
      progressPercent,
      formattedTime,
      formattedFinalTime,
      accuracy,
      finalScore,
      starsEarned,
      hasNextGame,

      // Methods
      startGame,
      pauseGame,
      resumeGame,
      restartGame,
      exitGame,
      goToNextGame,
      answerQuestion,
      getOptionClass
    }
  }
}
</script>
<style scoped>
/* Grammar Game Engine スタイル */
.grammar-game-engine {
  @apply min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col;
}

/* ゲームヘッダー */
.game-header {
  @apply bg-black bg-opacity-30 backdrop-blur-md border-b border-white border-opacity-20 px-4 py-3 flex items-center justify-between relative z-10;
}

.header-left {
  @apply flex items-center gap-4 flex-1;
}

.pause-button {
  @apply p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200;
}

.game-title h2 {
  @apply text-xl font-bold;
}

.game-type {
  @apply text-sm text-blue-200;
}

.header-center {
  @apply flex-1 max-w-md;
}

.progress-container {
  @apply w-full;
}

.level-progress {
  @apply text-center;
}

.level-text {
  @apply text-sm font-medium mb-2 block;
}

.progress-bar {
  @apply w-full h-3 bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out;
}

.header-right {
  @apply flex items-center gap-4 flex-1 justify-end;
}

.game-stats {
  @apply flex items-center gap-4;
}

.stat-item {
  @apply flex items-center gap-1 text-sm font-medium;
}

.hearts {
  @apply gap-0.5;
}

.exit-button {
  @apply p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300;
}

/* メインゲームエリア */
.game-content {
  @apply flex-1 relative overflow-hidden;
}

.game-content.paused {
  @apply pointer-events-none;
}

/* 一時停止オーバーレイ */
.pause-overlay {
  @apply absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50;
}

.pause-modal {
  @apply bg-gray-900 rounded-2xl p-8 text-center max-w-md w-full mx-4;
  border: 1px solid rgba(255,255,255,0.2);
}

.pause-modal h3 {
  @apply text-2xl font-bold mb-6;
}

.pause-buttons {
  @apply flex flex-col gap-3;
}

.resume-button {
  @apply flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition-all duration-200;
}

.restart-button {
  @apply flex items-center justify-center gap-2 w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-semibold transition-all duration-200;
}

.exit-button-pause {
  @apply flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition-all duration-200;
}

/* ゲーム状態 - ローディング */
.game-loading {
  @apply flex flex-col items-center justify-center h-full text-center;
}

.loading-spinner {
  @apply w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4;
}

/* ゲーム状態 - 準備完了 */
.game-ready {
  @apply flex items-center justify-center h-full p-8;
}

.ready-content {
  @apply text-center max-w-2xl w-full;
}

.game-icon {
  @apply text-8xl mb-6;
}

.ready-content h3 {
  @apply text-3xl font-bold mb-4;
}

.game-description {
  @apply text-lg text-blue-200 mb-8 leading-relaxed;
}

.game-instructions {
  @apply bg-white bg-opacity-5 rounded-xl p-6 mb-8 text-left;
}

.game-instructions h4 {
  @apply text-lg font-semibold mb-4 text-yellow-400;
}

.game-instructions ul {
  @apply space-y-2;
}

.game-instructions li {
  @apply flex items-start gap-2;
}

.game-instructions li::before {
  content: "▶";
  @apply text-blue-400 mt-0.5;
}

.start-game-button {
  @apply flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-xl font-bold transition-all duration-200 transform hover:scale-105;
}

/* ゲーム状態 - プレイ中 */
.game-playing {
  @apply h-full flex flex-col;
}

.default-game-content {
  @apply flex-1 flex items-center justify-center p-8;
}

.question-area {
  @apply max-w-4xl w-full text-center;
}

.question-text {
  @apply text-2xl md:text-3xl font-bold mb-8 leading-relaxed;
}

.question-options {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto;
}

.option-button {
  @apply p-6 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 border-2 border-transparent;
}

.option-button:disabled {
  @apply cursor-not-allowed transform-none;
}

.option-button.selected {
  @apply bg-blue-500 bg-opacity-30 border-blue-400;
}

.option-button.correct-answer {
  @apply bg-green-500 bg-opacity-30 border-green-400;
}

.option-button.correct-selected {
  @apply bg-green-500 bg-opacity-50 border-green-400;
}

.option-button.incorrect-selected {
  @apply bg-red-500 bg-opacity-50 border-red-400;
}

/* フィードバックエリア */
.feedback-area {
  @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-40;
}

.feedback-message {
  @apply flex flex-col items-center text-center p-8 rounded-2xl max-w-md w-full mx-4;
}

.feedback-message.correct {
  @apply bg-green-600 bg-opacity-20;
  border: 2px solid rgba(34, 197, 94, 0.5);
}

.feedback-message.incorrect {
  @apply bg-red-600 bg-opacity-20;
  border: 2px solid rgba(239, 68, 68, 0.5);
}

.feedback-icon {
  @apply mb-4;
}

.feedback-text h4 {
  @apply text-2xl font-bold mb-2;
}

.feedback-text p {
  @apply text-gray-200;
}

/* フィードバックアニメーション */
.feedback-enter-active {
  transition: all 0.3s ease;
}

.feedback-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

/* ゲーム状態 - 完了 */
.game-completed {
  @apply flex items-center justify-center h-full p-8;
}

.completion-content {
  @apply text-center max-w-2xl w-full;
}

.completion-animation {
  @apply mb-8;
}

.trophy-icon {
  @apply text-8xl mb-4;
  animation: trophy-bounce 2s ease-in-out infinite;
}

@keyframes trophy-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.stars-earned {
  @apply flex justify-center gap-2;
}

.star-animate {
  animation: star-appear 0.5s ease-out forwards;
  opacity: 0;
  transform: scale(0);
}

@keyframes star-appear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.completion-title {
  @apply text-3xl font-bold mb-8;
}

.final-stats {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-8;
}

.stat-box {
  @apply bg-white bg-opacity-10 rounded-xl p-4;
}

.stat-value {
  @apply text-2xl font-bold mb-1;
}

.stat-label {
  @apply text-sm text-gray-300;
}

.completion-buttons {
  @apply flex flex-col md:flex-row gap-3;
}

.play-again-button {
  @apply flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all duration-200;
}

.next-game-button {
  @apply flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition-all duration-200;
}

.back-to-map-button {
  @apply flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition-all duration-200;
}

/* ゲーム状態 - 失敗 */
.game-failed {
  @apply flex items-center justify-center h-full p-8;
}

.failure-content {
  @apply text-center max-w-md w-full;
}

.failure-icon {
  @apply text-6xl mb-4;
}

.failure-content h3 {
  @apply text-2xl font-bold mb-4;
}

.failure-content p {
  @apply text-gray-300 mb-6;
}

.failure-stats {
  @apply bg-white bg-opacity-5 rounded-xl p-4 mb-6;
}

.failure-stats .stat-item {
  @apply flex justify-between items-center py-2;
}

.failure-buttons {
  @apply flex flex-col gap-3;
}

.retry-button {
  @apply flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all duration-200;
}

.back-button {
  @apply flex items-center justify-center gap-2 w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition-all duration-200;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .game-header {
    @apply px-2 py-2 flex-wrap gap-2;
  }
  
  .header-left,
  .header-center,
  .header-right {
    @apply flex-none w-full;
  }
  
  .header-center {
    @apply order-last;
  }
  
  .game-stats {
    @apply gap-2;
  }
  
  .stat-item {
    @apply text-xs;
  }
  
  .question-text {
    @apply text-xl;
  }
  
  .question-options {
    @apply grid-cols-1;
  }
  
  .option-button {
    @apply p-4 text-base;
  }
  
  .completion-buttons {
    @apply flex-col;
  }
  
  .final-stats {
    @apply grid-cols-2;
  }
}

@media (max-width: 480px) {
  .pause-modal {
    @apply p-6;
  }
  
  .ready-content {
    @apply p-4;
  }
  
  .game-icon {
    @apply text-6xl;
  }
  
  .ready-content h3 {
    @apply text-2xl;
  }
  
  .start-game-button {
    @apply text-lg py-3;
  }
  
  .feedback-message {
    @apply p-6;
  }
  
  .trophy-icon {
    @apply text-6xl;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .grammar-game-engine {
    /* デフォルトでダークテーマなので変更なし */
  }
}

/* 高コントラスト対応 */
@media (prefers-contrast: high) {
  .option-button {
    @apply border-2 border-white;
  }
  
  .feedback-message {
    @apply border-2;
  }
  
  .pause-modal {
    @apply border-2 border-white;
  }
}

/* アクセシビリティ - アニメーション削減 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner,
  .trophy-icon,
  .star-animate {
    animation: none;
  }
  
  .option-button:hover,
  .start-game-button:hover {
    transform: none;
  }
  
  .progress-fill {
    transition: width 0.1s;
  }
}

/* フォーカス表示 */
.option-button:focus,
.start-game-button:focus,
.pause-button:focus,
.exit-button:focus {
  @apply outline-none ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900;
}

/* 印刷対応 */
@media print {
  .grammar-game-engine {
    @apply bg-white text-black;
  }
  
  .game-header {
    @apply bg-gray-100 text-black border-gray-300;
  }
  
  .pause-overlay,
  .feedback-area {
    @apply hidden;
  }
}
</style>