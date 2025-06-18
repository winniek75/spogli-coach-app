<template>
  <div class="rhyme-ending-game">
    <div v-if="!gameStarted" class="difficulty-selection">
      <h2>難易度を選択</h2>
      <div class="difficulty-buttons">
        <button 
          v-for="level in difficultyLevels" 
          :key="level.name"
          class="difficulty-button"
          :class="{ 'selected': selectedDifficulty === level.name }"
          @click="selectDifficulty(level.name)"
        >
          <div class="difficulty-icon">{{ level.icon }}</div>
          <div class="difficulty-name">{{ level.displayName }}</div>
          <div class="difficulty-description">{{ level.description }}</div>
        </button>
      </div>
      <button class="start-button" @click="startGame" :disabled="!selectedDifficulty">
        ゲーム開始
      </button>
    </div>

    <div v-else class="game-container">
      <!-- ゲームヘッダー -->
      <div class="game-header">
        <div class="header-stats">
          <div class="stat-item">
            <span class="trophy-icon">🏆</span>
            <span class="stat-value">{{ score }}</span>
          </div>
          <div class="hearts-container">
            <span
              v-for="i in maxLives"
              :key="i"
              class="heart-icon"
              :class="i <= lives ? 'heart-filled' : 'heart-empty'"
            >
              ❤️
            </span>
          </div>
        </div>
        <div class="timer" :class="{ 'warning': timeLeft <= 3 }">
          {{ timeLeft }}
        </div>
      </div>

      <!-- メインゲームエリア -->
      <div class="game-area">
        <div class="target-word">
          <div class="word-display">{{ currentWord.word }}</div>
          <button class="play-button" @click="playSound">
            <span class="play-icon">▶️</span>
            音を再生
          </button>
        </div>

        <div class="choices-container">
          <div class="instruction">同じ音で終わる単語を選ぼう！</div>
          <div class="choices-grid">
            <button
              v-for="choice in choices"
              :key="choice.word"
              class="choice-button"
              :class="getChoiceClass(choice)"
              @click="selectEnding(choice.ending)"
              :disabled="isAnimating"
            >
              {{ choice.word }}
            </button>
          </div>
        </div>

        <div
          v-if="showFeedback"
          class="feedback-container"
          :class="isCorrect ? 'feedback-correct' : 'feedback-incorrect'"
        >
          <div class="feedback-message">{{ feedback }}</div>
          <div class="feedback-answer">{{ feedbackAnswer }}</div>
          <div class="sound-highlight" v-if="isCorrect">
            {{ currentWord.word }} と {{ selectedEnding }} は {{ currentWord.endingSound }} で終わります！
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameAudio } from '@/composables/useGameAudio'
import { useGameStore } from '@/stores/gameStore'

export default defineComponent({
  name: 'RhymeEndingGame',
  setup() {
    const { playWord } = useGameAudio()
    const gameStore = useGameStore()
    
    // 難易度選択関連
    const gameStarted = ref(false)
    const selectedDifficulty = ref('')
    const difficultyLevels = [
      {
        name: 'easy',
        displayName: 'かんたん',
        icon: '🌱',
        description: '時間制限: 10秒\nライフ: 5\nスコア倍率: 1倍'
      },
      {
        name: 'normal',
        displayName: 'ふつう',
        icon: '🌳',
        description: '時間制限: 8秒\nライフ: 3\nスコア倍率: 1.5倍'
      },
      {
        name: 'hard',
        displayName: 'むずかしい',
        icon: '🔥',
        description: '時間制限: 5秒\nライフ: 2\nスコア倍率: 2倍'
      }
    ]

    // ゲームの状態管理
    const score = ref(0)
    const lives = ref(3)
    const maxLives = ref(3)
    const timeLeft = ref(10)
    const timer = ref(null)
    const isAnimating = ref(false)
    const showFeedback = ref(false)
    const isCorrect = ref(false)
    const feedback = ref('')
    const feedbackAnswer = ref('')
    const selectedEnding = ref('')
    const progress = ref(0)
    const currentWordIndex = ref(0)
    const startTime = ref(Date.now())
    const correctAnswers = ref(0)
    const totalAttempts = ref(0)

    // 単語データ
    const wordData = [
      { word: 'cat', endingSound: 'at', rhymes: ['hat', 'bat', 'rat'], nonRhymes: ['dog', 'fish', 'bird'] },
      { word: 'dog', endingSound: 'og', rhymes: ['log', 'fog', 'jog'], nonRhymes: ['cat', 'fish', 'bird'] },
      { word: 'fish', endingSound: 'ish', rhymes: ['wish', 'dish', 'swish'], nonRhymes: ['cat', 'dog', 'bird'] },
      { word: 'bird', endingSound: 'ird', rhymes: ['word', 'heard', 'third'], nonRhymes: ['cat', 'dog', 'fish'] },
      { word: 'sun', endingSound: 'un', rhymes: ['run', 'fun', 'bun'], nonRhymes: ['moon', 'rain', 'cloud'] },
      { word: 'moon', endingSound: 'oon', rhymes: ['spoon', 'soon', 'tune'], nonRhymes: ['sun', 'star', 'sky'] },
      { word: 'rain', endingSound: 'ain', rhymes: ['train', 'pain', 'gain'], nonRhymes: ['sun', 'moon', 'star'] },
      { word: 'tree', endingSound: 'ee', rhymes: ['bee', 'see', 'free'], nonRhymes: ['sun', 'moon', 'star'] },
      { word: 'leaf', endingSound: 'eaf', rhymes: ['beef', 'chief', 'brief'], nonRhymes: ['tree', 'sun', 'moon'] },
      { word: 'wind', endingSound: 'ind', rhymes: ['find', 'mind', 'kind'], nonRhymes: ['sun', 'moon', 'star'] }
    ]

    // 現在の問題
    const currentWord = computed(() => wordData[currentWordIndex.value])
    const choices = ref([])

    // 選択肢の生成
    const generateChoices = () => {
      const currentPair = currentWord.value
      const allChoices = [
        ...currentPair.rhymes.map(word => ({ word, isRhyme: true })),
        ...currentPair.nonRhymes.map(word => ({ word, isRhyme: false }))
      ]
      choices.value = shuffleArray(allChoices)
    }

    // 配列のシャッフル
    const shuffleArray = (array) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }

    // 選択肢のクラス取得
    const getChoiceClass = (choice) => {
      if (!showFeedback.value) return 'choice-normal'
      
      if (choice.isRhyme) {
        return 'choice-correct'
      } else if (isAnimating.value && !isCorrect.value) {
        return 'choice-incorrect'
      }
      return 'choice-unselected'
    }

    // 難易度選択
    const selectDifficulty = (difficulty) => {
      selectedDifficulty.value = difficulty
      const settings = gameStore.gameSettings.difficultyLevels[difficulty]
      maxLives.value = settings.lives
      lives.value = settings.lives
      timeLeft.value = settings.timeLimit
    }

    // ゲーム開始
    const startGame = () => {
      gameStarted.value = true
      startTimer()
    }

    // タイマー管理
    const startTimer = () => {
      timer.value = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--
        } else {
          handleTimeUp()
        }
      }, 1000)
    }

    const handleTimeUp = () => {
      lives.value--
      if (lives.value <= 0) {
        endGame()
      } else {
        nextWord()
      }
    }

    // 選択肢の選択を更新
    const selectEnding = (ending) => {
      if (isAnimating.value) return
      selectedEnding.value = ending
    }

    // 次の問題を更新
    const nextWord = () => {
      if (isAnimating.value) return
      currentWordIndex.value = (currentWordIndex.value + 1) % wordData.length
      selectedEnding.value = ''
      feedback.value = ''
      progress.value = (currentWordIndex.value / wordData.length) * 100
    }

    // ゲーム終了
    const endGame = () => {
      gameStore.recordGameResult('rhyme-ending', score.value, score.value / 10, score.value / 10)
    }

    // サウンドエフェクト
    const playSoundEffect = (type) => {
      const audio = new Audio(`/sounds/game/${type}.mp3`)
      audio.play()
    }

    const playUISound = (type) => {
      const audio = new Audio(`/sounds/ui/${type}.mp3`)
      audio.play()
    }

    const playSound = () => {
      const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
      totalAttempts.value++
      playUISound('click')
    }

    const checkAnswer = () => {
      if (isAnimating.value) return
      isAnimating.value = true

      const isCorrect = selectedEnding.value === currentWord.value.ending
      totalAttempts.value++

      if (isCorrect) {
        feedback.value = '正解です！'
        score.value += 10
        correctAnswers.value++
        playSoundEffect('correct')

        // マスターした単語を記録
        const masteredWords = gameStore.gameProgress.rhymeEnding.masteredWords || []
        if (!masteredWords.includes(currentWord.value.word)) {
          masteredWords.push(currentWord.value.word)
          playSoundEffect('achievement')
        }

        // ゲーム進捗の更新
        gameStore.updateGameProgress('rhymeEnding', {
          bestScore: Math.max(score.value, gameStore.gameProgress.rhymeEnding.bestScore),
          masteredWords,
          attempts: totalAttempts.value
        })

        // 統計データの更新
        const playTime = Date.now() - startTime.value
        gameStore.updateGameStats('rhymeEnding', {
          correctAnswers: correctAnswers.value,
          totalAttempts: totalAttempts.value,
          playTime
        })

        // ストリーク更新
        gameStore.updateStreak()
      } else {
        feedback.value = 'もう一度試してみましょう'
        playSoundEffect('incorrect')
      }

      setTimeout(() => {
        isAnimating.value = false
      }, 500)
    }

    // コンポーネントのマウント時に初期化
    onMounted(() => {
      startTime.value = Date.now()
      // 既存の進捗を読み込み
      const savedProgress = gameStore.getGameProgress('rhymeEnding')
      if (savedProgress) {
        score.value = savedProgress.bestScore
        progress.value = savedProgress.progress || 0
      }
    })

    // コンポーネントのアンマウント時に最終統計を更新
    onUnmounted(() => {
      const playTime = Date.now() - startTime.value
      gameStore.updateGameStats('rhymeEnding', {
        correctAnswers: correctAnswers.value,
        totalAttempts: totalAttempts.value,
        playTime
      })
    })

    return {
      gameStarted,
      selectedDifficulty,
      difficultyLevels,
      score,
      lives,
      maxLives,
      timeLeft,
      currentWord,
      choices,
      isAnimating,
      showFeedback,
      feedback,
      feedbackAnswer,
      selectedEnding,
      progress,
      currentWordIndex,
      playSound,
      checkAnswer,
      nextWord,
      selectDifficulty,
      startGame,
      getChoiceClass
    }
  }
})
</script>

<style scoped>
@import '@/assets/styles/game-common.css';

.rhyme-ending-game {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #A8E6CF 0%, #3EADCF 100%);
  font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
}

.game-container {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.game-header {
  margin-bottom: 30px;
}

.header-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trophy-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.hearts-container {
  display: flex;
  gap: 5px;
}

.heart-icon {
  font-size: 24px;
}

.heart-empty {
  opacity: 0.3;
}

.game-area {
  text-align: center;
}

.target-word {
  margin-bottom: 30px;
}

.word-display {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.play-button {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(45deg, #A8E6CF, #3EADCF);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.choices-container {
  margin-bottom: 30px;
}

.instruction {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.choice-button {
  padding: 25px;
  border: none;
  border-radius: 20px;
  background: white;
  font-size: 32px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.choice-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.choice-button:disabled {
  cursor: not-allowed;
}

.choice-normal {
  background: white;
}

.choice-correct {
  background: linear-gradient(45deg, #A8E6CF, #3EADCF);
  color: white;
}

.choice-incorrect {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.choice-unselected {
  background: rgba(255, 255, 255, 0.5);
  opacity: 0.7;
}

.feedback-container {
  text-align: center;
  padding: 20px;
  border-radius: 20px;
  margin-top: 20px;
}

.feedback-correct {
  background: linear-gradient(45deg, #A8E6CF, #3EADCF);
}

.feedback-incorrect {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
}

.feedback-message {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
}

.feedback-answer {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
}

.sound-highlight {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
}

.difficulty-selection {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
}

.difficulty-selection h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
}

.difficulty-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.difficulty-button {
  background: white;
  border: 2px solid #ddd;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.difficulty-button.selected {
  border-color: var(--movwise-primary);
  background: rgba(74, 107, 223, 0.1);
}

.difficulty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.difficulty-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.difficulty-description {
  font-size: 0.9rem;
  color: #666;
  white-space: pre-line;
}

.start-button {
  background: var(--movwise-primary);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.timer {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  transition: all 0.3s ease;
}

.timer.warning {
  color: #FF6B6B;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style> 