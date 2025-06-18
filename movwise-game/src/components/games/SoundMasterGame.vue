<template>
  <div class="sound-master-game">
    <!-- メニュー画面 -->
    <div v-if="currentScreen === 'menu'" class="menu-screen">
      <div class="menu-container">
        <div class="menu-header">
          <h1 class="game-title">
            <span class="title-sound">Sound</span>
            <span class="title-master">Master</span>
          </h1>
          <p class="game-subtitle">音声を聞いて、正しい文字を選ぼう！</p>
        </div>
        <!-- コース選択 -->
        <div class="course-selection">
          <label class="selection-label">コースを選択</label>
          <div class="course-options">
            <button
              v-for="course in courses"
              :key="course.id"
              class="course-button"
              :class="selectedCourse === course.id ? 'course-selected' : 'course-unselected'"
              @click="selectCourse(course.id)"
            >
              <div class="course-content">
                <span class="course-icon">{{ course.icon }}</span>
                <div class="course-text">
                  <div class="course-name">{{ course.name }}</div>
                  <div class="course-description">{{ course.description }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        <!-- グループ選択 -->
        <div class="group-selection">
          <label class="selection-label">グループを選択</label>
          <select v-model="selectedGroup" class="group-select">
            <option v-for="group in availableGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
          <p class="group-description">{{ selectedGroupDescription }}</p>
        </div>
        <!-- メニューボタン -->
        <div class="menu-buttons">
          <button class="start-button" @click="startGame">ゲーム開始</button>
          <button class="review-button" @click="goToReview">復習モード</button>
        </div>
      </div>
    </div>

    <!-- ゲーム画面 -->
    <div v-else-if="currentScreen === 'game'" class="game-screen" :class="{ shake: isShaking }">
      <div class="game-container">
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
            <div class="combo-display" v-if="combo > 1">
              <span class="combo-text">{{ combo }}連続正解！</span>
            </div>
          </div>
          <div class="header-controls">
            <span class="group-name">{{ currentGroup.name }}</span>
            <div class="control-buttons">
              <button class="control-button stop-button" @click="stopGame">
                <span class="stop-icon">⏹️</span>
              </button>
              <button class="control-button back-button" @click="goToMenu">
                <span class="back-icon">←</span>
              </button>
            </div>
          </div>
        </div>
        <div class="timer-container">
          <div class="timer-bar">
            <div
              class="timer-progress"
              :class="timerColorClass"
              :style="{ width: `${timerProgress}%` }"
            ></div>
          </div>
        </div>
        <div class="audio-section">
          <div class="character-display">
            <div class="sound-question">音を聞いて、正しい文字を選ぼう！</div>
          </div>
          <button
            class="play-button"
            :class="{ 'play-enabled': !isPlaying, 'play-disabled': isPlaying }"
            @click="playSound"
            :disabled="isPlaying"
          >
            <span class="play-icon">▶️</span>
            <span>音を再生</span>
          </button>
        </div>
        <div class="choices-grid">
          <button
            v-for="choice in choices"
            :key="choice"
            class="choice-button"
            :class="getChoiceClass(choice)"
            @click="selectChoice(choice)"
            :disabled="isChoiceDisabled"
          >
            {{ choice }}
          </button>
        </div>
        <div
          v-if="showFeedback"
          class="feedback-container"
          :class="isCorrect ? 'feedback-correct' : 'feedback-incorrect'"
        >
          <div class="feedback-message">{{ feedbackMessage }}</div>
          <div class="feedback-answer">{{ feedbackAnswer }}</div>
        </div>
      </div>
    </div>

    <!-- 結果画面 -->
    <div v-else-if="currentScreen === 'result'" class="result-screen">
      <div class="result-container">
        <div class="result-header">
          <h2 class="result-title">ゲーム終了！</h2>
          <div class="result-score">
            <span class="score-label">スコア</span>
            <span class="score-value">{{ score }}</span>
          </div>
        </div>
        <div class="result-stats">
          <div class="stat-row">
            <span class="stat-label">正解数</span>
            <span class="stat-value">{{ correctAnswers }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">連続正解</span>
            <span class="stat-value">{{ maxCombo }}</span>
          </div>
        </div>
        <div class="result-buttons">
          <button class="retry-button" @click="retryGame">もう一度挑戦</button>
          <button class="menu-button" @click="goToMenu">メニューに戻る</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

export default defineComponent({
  name: 'SoundMasterGame',
  setup() {
    const gameStore = useGameStore()
    const score = ref(0)
    const progress = ref(0)
    const currentWordIndex = ref(0)
    const userAnswer = ref('')
    const feedback = ref('')
    const startTime = ref(Date.now())
    const correctAnswers = ref(0)
    const totalAttempts = ref(0)
    const isAnimating = ref(false)

    // サウンドエフェクト
    const playSoundEffect = (type) => {
      const audio = new Audio(`/sounds/game/${type}.mp3`)
      audio.play()
    }

    const playUISound = (type) => {
      const audio = new Audio(`/sounds/ui/${type}.mp3`)
      audio.play()
    }

    // ... existing wordList ...

    const currentWord = computed(() => wordList[currentWordIndex.value])

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
      totalAttempts.value++

      const isCorrect = userAnswer.value.toLowerCase() === currentWord.value.word.toLowerCase()

      if (isCorrect) {
        feedback.value = '正解です！'
        score.value += 10
        correctAnswers.value++
        playSoundEffect('correct')

        // マスターした単語を記録
        const masteredWords = gameStore.gameProgress.soundMaster.masteredWords || []
        if (!masteredWords.includes(currentWord.value.word)) {
          masteredWords.push(currentWord.value.word)
          playSoundEffect('achievement')
        }

        // ゲーム進捗の更新
        gameStore.updateGameProgress('soundMaster', {
          bestScore: Math.max(score.value, gameStore.gameProgress.soundMaster.bestScore),
          masteredWords,
          attempts: totalAttempts.value
        })

        // 統計データの更新
        const playTime = Date.now() - startTime.value
        gameStore.updateGameStats('soundMaster', {
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
        userAnswer.value = ''
        feedback.value = ''
      }, 1000)
    }

    const nextWord = () => {
      if (isAnimating.value) return
      playUISound('select')
      currentWordIndex.value = (currentWordIndex.value + 1) % wordList.length
      userAnswer.value = ''
      feedback.value = ''
      progress.value = (currentWordIndex.value / wordList.length) * 100
    }

    // コンポーネントのマウント時に初期化
    onMounted(() => {
      startTime.value = Date.now()
      // 既存の進捗を読み込み
      const savedProgress = gameStore.getGameProgress('soundMaster')
      if (savedProgress) {
        score.value = savedProgress.bestScore
        progress.value = savedProgress.progress || 0
      }
    })

    // コンポーネントのアンマウント時に最終統計を更新
    onUnmounted(() => {
      const playTime = Date.now() - startTime.value
      gameStore.updateGameStats('soundMaster', {
        correctAnswers: correctAnswers.value,
        totalAttempts: totalAttempts.value,
        playTime
      })
    })

    return {
      score,
      progress,
      currentWord,
      userAnswer,
      feedback,
      playSound,
      checkAnswer,
      nextWord,
      isAnimating
    }
  }
})
</script>

<style scoped>
.sound-master-game {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%);
  font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
}

/* メニュー画面のスタイル */
.menu-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.menu-container {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.menu-header {
  text-align: center;
  margin-bottom: 40px;
}

.game-title {
  font-size: 64px;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.title-sound {
  color: #4a90e2;
}

.title-master {
  color: #f5a623;
}

.game-subtitle {
  font-size: 20px;
  color: #666;
  margin: 10px 0 0;
}

.course-selection {
  margin-bottom: 30px;
}

.selection-label {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.course-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.course-button {
  width: 100%;
  padding: 25px;
  border: none;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.course-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.course-selected {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.course-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.course-icon {
  font-size: 40px;
}

.course-text {
  text-align: left;
}

.course-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.course-description {
  font-size: 14px;
  opacity: 0.8;
}

.group-selection {
  margin-bottom: 30px;
}

.group-select {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  color: #333;
  background: white;
  cursor: pointer;
  margin-bottom: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.group-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.menu-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.start-button,
.review-button {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.start-button {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.review-button {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
  color: white;
}

.start-button:hover,
.review-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* ゲーム画面のスタイル */
.game-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.game-container {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.trophy-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.hearts-container {
  display: flex;
  gap: 5px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.heart-icon {
  font-size: 20px;
  opacity: 0.3;
}

.heart-filled {
  opacity: 1;
}

.combo-display {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.combo-text {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.group-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.stop-button {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
}

.stop-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.back-button {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.stop-icon,
.back-icon {
  font-size: 20px;
  color: white;
}

.timer-container {
  margin-bottom: 20px;
}

.timer-bar {
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
}

.timer-progress {
  height: 100%;
  transition: width 0.1s linear;
  border-radius: 5px;
}

.timer-green {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
}

.timer-yellow {
  background: linear-gradient(45deg, #FFE66D, #FFD93D);
}

.timer-red {
  background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
}

.audio-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.character-display {
  margin-bottom: 20px;
}

.sound-question {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.play-button {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.play-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.play-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.play-icon {
  font-size: 24px;
}

.choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
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
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.feedback-correct {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
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
}

/* 結果画面のスタイル */
.result-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.result-container {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}

.result-header {
  margin-bottom: 30px;
}

.result-title {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 20px;
}

.result-score {
  display: inline-block;
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  padding: 15px 40px;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.score-label {
  font-size: 18px;
  color: white;
  margin-right: 10px;
}

.score-value {
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.result-stats {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 18px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.result-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.retry-button,
.menu-button {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.retry-button {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
}

.menu-button {
  background: linear-gradient(45deg, #4ECDC4, #45B7AF);
  color: white;
}

.retry-button:hover,
.menu-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* アニメーション */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

.input-field {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 15px;
  font-size: 1.2rem;
  width: 100%;
  max-width: 300px;
  text-align: center;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #4ECDC4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
}

.feedback-message {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.feedback-message.correct {
  background: #2ecc71;
  color: white;
  animation: correctFeedback 0.5s ease;
}

@keyframes correctFeedback {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.play-button,
.check-button,
.next-button {
  position: relative;
  overflow: hidden;
}

.play-button::after,
.check-button::after,
.next-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.play-button:hover::after,
.check-button:hover::after,
.next-button:hover::after {
  width: 200%;
  height: 200%;
}

.play-button:active,
.check-button:active,
.next-button:active {
  transform: scale(0.95);
}
</style>