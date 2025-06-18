<template>
  <div class="digraph-master-game">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="logo-section">
        <div class="logo-icon">💃</div>
        <h1 class="game-title">Dance Partnership Hall</h1>
        <div class="logo-icon">🕺</div>
      </div>
      <div class="game-info">
        <div class="score-display">
          <span class="score-icon">⭐</span>
          Score: {{ score }}
        </div>
        <div class="lives-display">
          <span v-for="n in lives" :key="`life-${n}`" class="life-heart">❤️</span>
          <span v-for="n in (3 - lives)" :key="`empty-${n}`" class="life-empty">🤍</span>
        </div>
      </div>
    </header>

    <!-- プログレスバー -->
    <div class="progress-section">
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }"></div>
      </div>
      <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
    </div>

    <!-- メインゲームエリア -->
    <main class="game-main">
      <!-- ゲーム状態に応じた表示 -->
      <div v-if="gameState === 'loading'" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">ダンサーたちを準備中...</p>
      </div>

      <div v-else-if="gameState === 'playing'" class="playing-state">
        <!-- パーフェクトパートナーセクション -->
        <div class="perfect-partners-section">
          <h2 class="section-title">🎭 Perfect Partners 🎭</h2>
          
          <!-- 現在のチャレンジ表示 -->
          <div class="current-challenge">
            <div class="challenge-display">
              <div class="single-letter-container">
                <div class="letter-card searching" :class="{ dancing: isDancing }">
                  <span class="letter">{{ currentQuestion.baseLetter }}</span>
                  <div class="dancer-icon">💃</div>
                </div>
                <div class="plus-sign">+</div>
                <div class="letter-card partner-slot" :class="{ found: selectedPartner }">
                  <span class="letter">{{ selectedPartner || '?' }}</span>
                  <div class="dancer-icon" v-if="selectedPartner">🕺</div>
                </div>
                <div class="equals-sign">=</div>
                <div class="sound-result" :class="{ revealed: selectedPartner }">
                  {{ selectedPartner ? currentQuestion.sound : '?' }}
                </div>
              </div>
            </div>
          </div>

          <!-- パートナー選択肢 -->
          <div class="partner-selection">
            <p class="selection-prompt">Find the perfect partner:</p>
            <div class="partner-options">
              <button
                v-for="option in currentQuestion.options"
                :key="option"
                @click="selectPartner(option)"
                class="partner-option"
                :class="{ 
                  selected: selectedPartner === option,
                  correct: showFeedback && option === currentQuestion.correctPartner,
                  incorrect: showFeedback && selectedPartner === option && option !== currentQuestion.correctPartner
                }"
                :disabled="showFeedback"
              >
                <span class="option-letter">{{ option }}</span>
                <div class="option-dancer">🕺</div>
              </button>
            </div>
          </div>

          <!-- 例単語表示 -->
          <div v-if="selectedPartner === currentQuestion.correctPartner" class="example-words">
            <div class="musical-notes">🎵</div>
            <div class="words-list">
              <span v-for="(word, index) in currentQuestion.examples" :key="word" class="example-word">
                {{ word }}<span v-if="index < currentQuestion.examples.length - 1">, </span>
              </span>
            </div>
            <div class="musical-notes">🎵</div>
          </div>
        </div>

        <!-- 音声再生ボタン -->
        <div v-if="selectedPartner === currentQuestion.correctPartner" class="audio-section">
          <button @click="playDigraphSound" class="audio-button" :class="{ playing: isPlaying }">
            <span class="audio-icon">🔊</span>
          </button>
          <p class="audio-prompt">Click to hear the sound!</p>
        </div>

        <!-- フィードバック表示 -->
        <div v-if="showFeedback" class="feedback-section">
          <div class="feedback-message" :class="feedbackType">
            <span class="feedback-icon">{{ feedbackType === 'correct' ? '🎉' : '💔' }}</span>
            <span class="feedback-text">{{ feedbackMessage }}</span>
          </div>
          <button @click="nextQuestion" class="next-button">
            {{ currentQuestionIndex < totalQuestions - 1 ? 'Next Challenge' : 'Finish Game' }}
          </button>
        </div>
      </div>

      <!-- ゲーム終了画面 -->
      <div v-else-if="gameState === 'finished'" class="finished-state">
        <div class="final-performance">
          <h2 class="performance-title">🏆 Final Performance! 🏆</h2>
          <div class="final-score">
            <div class="score-circle">
              <span class="score-number">{{ score }}</span>
              <span class="score-label">Points</span>
            </div>
          </div>
          <div class="performance-stats">
            <div class="stat-item">
              <span class="stat-label">Correct Matches:</span>
              <span class="stat-value">{{ correctAnswers }} / {{ totalQuestions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</span>
            </div>
          </div>
          <div class="performance-message">
            <p>{{ getPerformanceMessage() }}</p>
            <div class="celebration-emojis">💃🕺✨🎭🎉</div>
          </div>
          <div class="final-actions">
            <button @click="restartGame" class="restart-button">
              🔄 Dance Again
            </button>
            <button @click="$emit('gameComplete', { score, correctAnswers, totalQuestions })" class="complete-button">
              🏠 Back to Hall
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- パーティクルエフェクト -->
    <div v-if="showParticles" class="particles-container">
      <div v-for="n in 12" :key="`particle-${n}`" class="particle" :style="getParticleStyle(n)"></div>
    </div>

    <!-- 背景装飾 -->
    <div class="background-decorations">
      <div class="disco-ball"></div>
      <div class="stage-lights"></div>
      <div class="dance-floor-pattern"></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue'

export default {
  name: 'DigraphMasterGame',
  emits: ['gameComplete'],
  setup(props, { emit }) {
    // ゲーム状態
    const gameState = ref('loading') // 'loading', 'playing', 'finished'
    const score = ref(0)
    const lives = ref(3)
    const currentQuestionIndex = ref(0)
    const selectedPartner = ref('')
    const showFeedback = ref(false)
    const feedbackType = ref('')
    const feedbackMessage = ref('')
    const correctAnswers = ref(0)
    const isDancing = ref(false)
    const isPlaying = ref(false)
    const showParticles = ref(false)

    // ダイグラフ問題データ
    const digraphQuestions = ref([
      {
        baseLetter: 'c',
        correctPartner: 'h',
        sound: '/ʧ/',
        options: ['h', 't', 'k', 'r'],
        examples: ['chair', 'cheese', 'church'],
        audioFile: 'ch-sound.mp3'
      },
      {
        baseLetter: 's',
        correctPartner: 'h',
        sound: '/ʃ/',
        options: ['h', 'p', 't', 'n'],
        examples: ['ship', 'shell', 'fish'],
        audioFile: 'sh-sound.mp3'
      },
      {
        baseLetter: 't',
        correctPartner: 'h',
        sound: '/θ/',
        options: ['h', 'r', 'w', 's'],
        examples: ['think', 'three', 'bath'],
        audioFile: 'th-sound.mp3'
      },
      {
        baseLetter: 'w',
        correctPartner: 'h',
        sound: '/w/',
        options: ['h', 'r', 't', 'y'],
        examples: ['what', 'where', 'when'],
        audioFile: 'wh-sound.mp3'
      },
      {
        baseLetter: 'p',
        correctPartner: 'h',
        sound: '/f/',
        options: ['h', 'r', 'l', 't'],
        examples: ['phone', 'photo', 'graph'],
        audioFile: 'ph-sound.mp3'
      }
    ])

    // 計算されたプロパティ
    const totalQuestions = computed(() => digraphQuestions.value.length)
    const currentQuestion = computed(() => digraphQuestions.value[currentQuestionIndex.value])

    // ゲーム初期化
    const initializeGame = () => {
      gameState.value = 'loading'
      score.value = 0
      lives.value = 3
      currentQuestionIndex.value = 0
      selectedPartner.value = ''
      showFeedback.value = false
      correctAnswers.value = 0
      
      // ローディング後にゲーム開始
      setTimeout(() => {
        gameState.value = 'playing'
        startDanceAnimation()
      }, 2000)
    }

    // ダンスアニメーション開始
    const startDanceAnimation = () => {
      isDancing.value = true
      setTimeout(() => {
        isDancing.value = false
      }, 1000)
    }

    // パートナー選択
    const selectPartner = (partner) => {
      if (showFeedback.value) return
      
      selectedPartner.value = partner
      
      // 少し遅延してフィードバック表示
      setTimeout(() => {
        checkAnswer()
      }, 500)
    }

    // 答えの確認
    const checkAnswer = () => {
      const isCorrect = selectedPartner.value === currentQuestion.value.correctPartner
      
      if (isCorrect) {
        feedbackType.value = 'correct'
        feedbackMessage.value = 'Perfect Partnership! 💃🕺'
        score.value += 100
        correctAnswers.value++
        triggerParticles()
        playSuccessSound()
      } else {
        feedbackType.value = 'incorrect'
        feedbackMessage.value = 'Try another partner! 💔'
        lives.value--
        playErrorSound()
      }
      
      showFeedback.value = true
    }

    // 次の問題へ
    const nextQuestion = () => {
      if (currentQuestionIndex.value < totalQuestions.value - 1) {
        currentQuestionIndex.value++
        selectedPartner.value = ''
        showFeedback.value = false
        startDanceAnimation()
      } else {
        gameState.value = 'finished'
      }
    }

    // ダイグラフ音声再生
    const playDigraphSound = () => {
      isPlaying.value = true
      
      // Web Speech APIを使用
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentQuestion.value.sound)
        utterance.rate = 0.8
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        utterance.onend = () => {
          isPlaying.value = false
        }
        
        speechSynthesis.speak(utterance)
      }
      
      // フォールバック
      setTimeout(() => {
        isPlaying.value = false
      }, 1000)
    }

    // 効果音再生
    const playSuccessSound = () => {
      // ブラウザAPI使用の簡単な効果音
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }

    const playErrorSound = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    // パーティクルエフェクト
    const triggerParticles = () => {
      showParticles.value = true
      setTimeout(() => {
        showParticles.value = false
      }, 2000)
    }

    const getParticleStyle = (index) => {
      const angle = (index * 30) * Math.PI / 180
      const distance = 100 + Math.random() * 100
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      
      return {
        '--x': `${x}px`,
        '--y': `${y}px`,
        '--delay': `${index * 0.1}s`,
        '--duration': `${1.5 + Math.random() * 0.5}s`
      }
    }

    // パフォーマンスメッセージ
    const getPerformanceMessage = () => {
      const accuracy = (correctAnswers.value / totalQuestions.value) * 100
      
      if (accuracy === 100) {
        return "Perfect Performance! You're a Dance Master! 🏆"
      } else if (accuracy >= 80) {
        return "Excellent Dancing! You've got the rhythm! 💃"
      } else if (accuracy >= 60) {
        return "Good effort! Keep practicing your moves! 🕺"
      } else {
        return "Don't give up! Every dancer starts somewhere! 💪"
      }
    }

    // ゲーム再開
    const restartGame = () => {
      initializeGame()
    }

    // ライフが0になったときの処理
    watch(lives, (newLives) => {
      if (newLives <= 0) {
        gameState.value = 'finished'
      }
    })

    // マウント時の初期化
    onMounted(() => {
      initializeGame()
    })

    return {
      // 状態
      gameState,
      score,
      lives,
      currentQuestionIndex,
      selectedPartner,
      showFeedback,
      feedbackType,
      feedbackMessage,
      correctAnswers,
      isDancing,
      isPlaying,
      showParticles,
      
      // データ
      totalQuestions,
      currentQuestion,
      
      // メソッド
      selectPartner,
      nextQuestion,
      playDigraphSound,
      restartGame,
      getPerformanceMessage,
      getParticleStyle
    }
  }
}
</script>
/* Digraph Master Game - Scoped Styles */
<style scoped>
/* ========================================
   カラーパレット・基本変数
======================================== */
.partner-option:active {
  transform: translateY(-2px) scale(1.02);
}

.partner-option.selected {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--white);
  border-color: var(--accent);
  box-shadow: 0 12px 30px rgba(233, 30, 99, 0.5);
}

.partner-option.correct {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: var(--white);
  border-color: var(--success);
  animation: correct-celebration 0.8s ease-out;
}

.partner-option.incorrect {
  background: linear-gradient(135deg, var(--error), #FF8A80);
  color: var(--white);
  border-color: var(--error);
  animation: incorrect-shake 0.5s ease-in-out;
}

.option-letter {
  font-size: 2rem;
  font-weight: bold;
}

.option-dancer {
  font-size: 1.5rem;
  animation: option-dance 2s infinite ease-in-out;
}

/* ========================================
   例単語表示
======================================== */
.example-words {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.2));
  border-radius: 15px;
  margin-top: 1rem;
  animation: words-appear 0.8s ease-out;
}

.musical-notes {
  font-size: 1.5rem;
  animation: notes-float 3s infinite ease-in-out;
}

.words-list {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--stage);
  text-align: center;
}

.example-word {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  margin: 0 0.25rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.example-word:hover {
  background: var(--accent);
  color: var(--stage);
  transform: scale(1.1);
}

/* ========================================
   音声セクション
======================================== */
.audio-section {
  text-align: center;
  margin: 2rem 0;
}

.audio-button {
  background: linear-gradient(135deg, #2196F3, #21CBF3);
  border: none;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4);
  position: relative;
  overflow: hidden;
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(33, 150, 243, 0.6);
}

.audio-button:active {
  transform: scale(0.95);
}

.audio-button.playing {
  animation: audio-pulse 1s infinite ease-in-out;
}

.audio-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: audio-ripple 2s infinite ease-out;
}

.audio-icon {
  font-size: 2.5rem;
  position: relative;
  z-index: 2;
}

.audio-prompt {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: var(--stage);
  font-weight: bold;
}

/* ========================================
   フィードバックセクション
======================================== */
.feedback-section {
  text-align: center;
  margin-top: 2rem;
  animation: feedback-appear 0.5s ease-out;
}

.feedback-message {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-radius: 25px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px var(--shadow);
}

.feedback-message.correct {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: var(--white);
}

.feedback-message.incorrect {
  background: linear-gradient(135deg, var(--error), #FF8A80);
  color: var(--white);
}

.feedback-icon {
  font-size: 2rem;
  animation: feedback-bounce 1s infinite ease-in-out;
}

.next-button {
  background: linear-gradient(135deg, var(--accent), #FFB300);
  color: var(--stage);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
}

.next-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
}

/* ========================================
   ゲーム終了画面
======================================== */
.finished-state {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.final-performance {
  background: var(--white);
  border-radius: 30px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 50px var(--shadow);
  position: relative;
  overflow: hidden;
}

.final-performance::before {
  content: "";
  position: absolute;
  top: -100px;
  left: -100px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  animation: celebration-light 3s infinite ease-in-out;
}

.performance-title {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.final-score {
  margin-bottom: 2rem;
}

.score-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, var(--accent), #FFB300);
  border-radius: 50%;
  box-shadow: 0 15px 35px rgba(255, 215, 0, 0.4);
  position: relative;
}

.score-circle::before {
  content: "";
  position: absolute;
  inset: 10px;
  background: var(--white);
  border-radius: 50%;
  z-index: 1;
}

.score-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary);
  z-index: 2;
  position: relative;
}

.score-label {
  font-size: 1rem;
  color: var(--stage);
  z-index: 2;
  position: relative;
}

.performance-stats {
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem 0;
  background: rgba(233, 30, 99, 0.1);
  border-radius: 15px;
  font-size: 1.1rem;
}

.stat-label {
  font-weight: bold;
  color: var(--stage);
}

.stat-value {
  font-weight: bold;
  color: var(--primary);
}

.performance-message {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  color: var(--stage);
  line-height: 1.5;
}

.celebration-emojis {
  font-size: 2rem;
  margin-top: 1rem;
  animation: celebration-dance 2s infinite ease-in-out;
}

.final-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.restart-button, .complete-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.restart-button {
  background: linear-gradient(135deg, var(--secondary), #AB47BC);
  color: var(--white);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.3);
}

.complete-button {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: var(--white);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
}

.restart-button:hover, .complete-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* ========================================
   パーティクルエフェクト
======================================== */
.particles-container {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 1000;
}

.particle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--accent);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: particle-burst var(--duration, 1.5s) ease-out var(--delay, 0s) forwards;
}

/* ========================================
   背景装飾
======================================== */
.background-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.disco-ball {
  position: absolute;
  top: 10%;
  right: 15%;
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #C0C0C0, #F5F5F5, #C0C0C0);
  border-radius: 50%;
  box-shadow: 
    inset -10px -10px 20px rgba(0, 0, 0, 0.2),
    0 0 50px rgba(255, 255, 255, 0.5);
  animation: disco-rotate 10s infinite linear;
}

.disco-ball::before {
  content: "";
  position: absolute;
  inset: 10px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 60%);
  border-radius: 50%;
}

.stage-lights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(180deg, 
    rgba(255, 215, 0, 0.2) 0%, 
    rgba(233, 30, 99, 0.1) 50%, 
    transparent 100%);
  animation: stage-lights-sweep 8s infinite ease-in-out;
}

.dance-floor-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: 
    repeating-linear-gradient(45deg,
      rgba(233, 30, 99, 0.1) 0px,
      rgba(233, 30, 99, 0.1) 20px,
      rgba(156, 39, 176, 0.1) 20px,
      rgba(156, 39, 176, 0.1) 40px);
  opacity: 0.5;
}

/* ========================================
   アニメーション定義
======================================== */
@keyframes dance-icon {
  0%, 100% { transform: rotate(-10deg) scale(1); }
  50% { transform: rotate(10deg) scale(1.1); }
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spotlight-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes search-pulse {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 8px 20px var(--shadow);
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 12px 30px rgba(233, 30, 99, 0.4);
  }
}

@keyframes dance-move {
  0% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-10px) rotate(-5deg); }
  50% { transform: translateX(10px) rotate(5deg); }
  75% { transform: translateX(-5px) rotate(-2deg); }
  100% { transform: translateX(0) rotate(0deg); }
}

@keyframes partner-found {
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
  50% { transform: scale(1.1) rotate(5deg); opacity: 0.8; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes dancer-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes option-dance {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.05); }
  75% { transform: rotate(5deg) scale(1.05); }
}

@keyframes correct-celebration {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(5deg); }
  50% { transform: scale(1.1) rotate(-3deg); }
  75% { transform: scale(1.15) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes words-appear {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.9); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes notes-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-5px) rotate(5deg); }
  66% { transform: translateY(3px) rotate(-3deg); }
}

@keyframes audio-pulse {
  0%, 100% { 
    box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4); 
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 12px 40px rgba(33, 150, 243, 0.8); 
    transform: scale(1.05);
  }
}

@keyframes audio-ripple {
  0% { 
    transform: translate(-50%, -50%) scale(0); 
    opacity: 1; 
  }
  100% { 
    transform: translate(-50%, -50%) scale(2); 
    opacity: 0; 
  }
}

@keyframes feedback-appear {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.9); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes feedback-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes celebration-light {
  0%, 100% { 
    transform: translate(0, 0) scale(1); 
    opacity: 0.3; 
  }
  50% { 
    transform: translate(50px, 30px) scale(1.2); 
    opacity: 0.7; 
  }
}

@keyframes celebration-dance {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.1); }
  75% { transform: rotate(5deg) scale(1.1); }
}

@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--x), var(--y)) scale(1) rotate(360deg);
    opacity: 0;
  }
}

@keyframes disco-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes stage-lights-sweep {
  0%, 100% { 
    background: linear-gradient(90deg, 
      rgba(255, 215, 0, 0.2) 0%, 
      rgba(233, 30, 99, 0.1) 50%, 
      transparent 100%);
  }
  50% { 
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(156, 39, 176, 0.2) 50%, 
      rgba(255, 215, 0, 0.1) 100%);
  }
}

/* ========================================
   レスポンシブ対応
======================================== */
@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .logo-section {
    order: 1;
  }
  
  .game-info {
    order: 2;
    gap: 1rem;
  }
  
  .game-title {
    font-size: 1.4rem;
  }
  
  .progress-section {
    padding: 1rem;
  }
  
  .game-main {
    padding: 1rem;
  }
  
  .single-letter-container {
    gap: 1rem;
    font-size: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .letter-card {
    width: 80px;
    height: 80px;
  }
  
  .letter {
    font-size: 2rem;
  }
  
  .partner-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .partner-option {
    padding: 1rem 0.5rem;
  }
  
  .option-letter {
    font-size: 1.5rem;
  }
  
  .final-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .restart-button, .complete-button {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .perfect-partners-section {
    padding: 1.5rem 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .single-letter-container {
    font-size: 1.2rem;
  }
  
  .letter-card {
    width: 70px;
    height: 70px;
  }
  
  .letter {
    font-size: 1.5rem;
  }
  
  .partner-options {
    grid-template-columns: 1fr;
  }
  
  .audio-button {
    width: 80px;
    height: 80px;
  }
  
  .audio-icon {
    font-size: 2rem;
  }
}

/* ========================================
   アクセシビリティ対応
======================================== */
.partner-option:focus {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.audio-button:focus {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.next-button:focus,
.restart-button:focus,
.complete-button:focus {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  .letter-card {
    border-width: 6px;
  }
  
  .partner-option {
    border-width: 4px;
  }
  
  .feedback-message {
    border: 3px solid var(--stage);
  }
}

/* 動きを抑制する設定対応 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01s !important;
  }
  
  .disco-ball,
  .stage-lights,
  .particles-container {
    display: none;
  }
}

.digraph-master-game {
  --primary: #E91E63;      /* ピンク */
  --secondary: #9C27B0;    /* パープル */
  --accent: #FFD700;       /* ゴールド */
  --background: #FCE4EC;   /* ピンクライト */
  --spotlight: #FFF59D;    /* スポットライト */
  --stage: #424242;        /* ステージグレー */
  --success: #4CAF50;      /* 成功グリーン */
  --error: #FF5252;        /* エラーレッド */
  --white: #FFFFFF;
  --shadow: rgba(0, 0, 0, 0.2);
}

/* ========================================
   メインコンテナ
======================================== */
.digraph-master-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #F8BBD9 50%, var(--background) 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

/* ========================================
   ヘッダーセクション
======================================== */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  color: var(--white);
  box-shadow: 0 4px 20px var(--shadow);
  position: relative;
  z-index: 100;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  font-size: 2.5rem;
  animation: dance-icon 2s infinite ease-in-out;
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.score-display {
  background: var(--accent);
  color: var(--stage);
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.score-icon {
  margin-right: 0.5rem;
  animation: sparkle 2s infinite ease-in-out;
}

.lives-display {
  display: flex;
  gap: 0.25rem;
}

.life-heart, .life-empty {
  font-size: 1.5rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

/* ========================================
   プログレスセクション
======================================== */
.progress-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.progress-container {
  flex: 1;
  height: 12px;
  background: #E0E0E0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-bar::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progress-shine 2s infinite;
}

.progress-text {
  font-weight: bold;
  color: var(--stage);
  min-width: 60px;
  text-align: center;
}

/* ========================================
   メインゲームエリア
======================================== */
.game-main {
  padding: 2rem;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
}

/* ========================================
   ローディング状態
======================================== */
.loading-state {
  text-align: center;
  color: var(--stage);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #E0E0E0;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: loading-spin 1s linear infinite;
  margin: 0 auto 2rem;
}

.loading-text {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
}

/* ========================================
   プレイング状態
======================================== */
.playing-state {
  width: 100%;
  max-width: 800px;
}

.perfect-partners-section {
  background: var(--white);
  border-radius: 30px;
  padding: 2rem;
  box-shadow: 0 20px 40px var(--shadow);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.perfect-partners-section::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(233, 30, 99, 0.1) 0%, transparent 70%);
  animation: spotlight-rotate 10s infinite linear;
  pointer-events: none;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin: 0 0 2rem 0;
  color: var(--primary);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

/* ========================================
   チャレンジ表示
======================================== */
.current-challenge {
  margin-bottom: 2rem;
}

.challenge-display {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--spotlight), #FFF176);
  border-radius: 20px;
  box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.1);
}

.single-letter-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 2rem;
  font-weight: bold;
}

.letter-card {
  position: relative;
  background: var(--white);
  border: 4px solid var(--primary);
  border-radius: 20px;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px var(--shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.letter-card.searching {
  animation: search-pulse 2s infinite ease-in-out;
}

.letter-card.dancing {
  animation: dance-move 1s ease-in-out;
}

.letter-card.partner-slot {
  border-style: dashed;
  background: rgba(255, 255, 255, 0.5);
}

.letter-card.found {
  border-style: solid;
  background: var(--white);
  animation: partner-found 0.6s ease-out;
}

.letter {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.dancer-icon {
  font-size: 1.5rem;
  animation: dancer-bounce 1.5s infinite ease-in-out;
}

.plus-sign, .equals-sign {
  font-size: 2rem;
  color: var(--secondary);
  font-weight: bold;
}

.sound-result {
  background: var(--secondary);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border-radius: 15px;
  font-size: 1.8rem;
  font-weight: bold;
  min-width: 80px;
  text-align: center;
  box-shadow: 0 6px 15px rgba(156, 39, 176, 0.3);
  transition: all 0.5s ease-out;
  opacity: 0.3;
  transform: scale(0.8);
}

.sound-result.revealed {
  opacity: 1;
  transform: scale(1);
}
/* ========================================
   パートナー選択
======================================== */
.partner-selection {
  text-align: center;
  margin-bottom: 2rem;
}

.selection-prompt {
  font-size: 1.3rem;
  color: var(--stage);
  margin-bottom: 1rem;
  font-weight: bold;
}

.partner-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.partner-option {
  position: relative;
  background: var(--white);
  border: 3px solid var(--secondary);
  border-radius: 20px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 15px rgba(156, 39, 176, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.partner-option:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 25px rgba(156, 39, 176, 0.4);
  border-color: var(--primary);
}

.partner-option:active {
  transform: translateY(-2px) scale(1.02);
}

.partner-option.selected {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--white);
  border-color: var(--accent);
  box-shadow: 0 12px 30px rgba(233, 30, 99, 0.5);
}

.partner-option.correct {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: var(--white);
  border-color: var(--success);
  animation: correct-celebration 0.8s ease-out;
}

.partner-option.incorrect {
  background: linear-gradient(135deg, var(--error), #FF8A80);
  color: var(--white);
  border-color: var(--error);
  animation: incorrect-shake 0.5s ease-in-out;
}

.option-letter {
  font-size: 2rem;
  font-weight: bold;
}

.option-dancer {
  font-size: 1.5rem;
  animation: option-dance 2s infinite ease-in-out;
}

/* ========================================
   例単語表示
======================================== */
.example-words {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.2));
  border-radius: 15px;
  margin-top: 1rem;
  animation: words-appear 0.8s ease-out;
}

.musical-notes {
  font-size: 1.5rem;
  animation: notes-float 3s infinite ease-in-out;
}

.words-list {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--stage);
  text-align: center;
}

.example-word {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  margin: 0 0.25rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.example-word:hover {
  background: var(--accent);
  color: var(--stage);
  transform: scale(1.1);
}

/* ========================================
   音声セクション
======================================== */
.audio-section {
  text-align: center;
  margin: 2rem 0;
}

.audio-button {
  background: linear-gradient(135deg, #2196F3, #21CBF3);
  border: none;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4);
  position: relative;
  overflow: hidden;
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(33, 150, 243, 0.6);
}

.audio-button:active {
  transform: scale(0.95);
}

.audio-button.playing {
  animation: audio-pulse 1s infinite ease-in-out;
}

.audio-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: audio-ripple 2s infinite ease-out;
}

.audio-icon {
  font-size: 2.5rem;
  position: relative;
  z-index: 2;
}

.audio-prompt {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: var(--stage);
  font-weight: bold;
}

/* ========================================
   フィードバックセクション
======================================== */
.feedback-section {
  text-align: center;
  margin-top: 2rem;
  animation: feedback-appear 0.5s ease-out;
}

.feedback-message {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-radius: 25px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px var(--shadow);
}

.feedback-message.correct {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: var(--white);
}

.feedback-message.incorrect {
  background: linear-gradient(135deg, var(--error), #FF8A80);
  color: var(--white);
}

.feedback-icon {
  font-size: 2rem;
  animation: feedback-bounce 1s infinite ease-in-out;
}

.next-button {
  background: linear-gradient(135deg, var(--accent), #FFB300);
  color: var(--stage);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
}

.next-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
}

/* ========================================
   ゲーム終了画面
======================================== */
.finished-state {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.final-performance {
  background: var(--white);
  border-radius: 30px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 50px var(--shadow);
  position: relative;
  overflow: hidden;
}

.final-performance::before {
  content: "";
  position: absolute;
  top: -100px;
  left: -100px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  animation: celebration-light 3s infinite ease-in-out;
}

.performance-title {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.final-score {
  margin-bottom: 2rem;
}

.score-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, var(--accent), #FFB300);
  border-radius: 50%;
  box-shadow: 0 15px 35px rgba(255, 215, 0, 0.4);
  position: relative;
}

.score-circle::before {
  content: "";
  position: absolute;
  inset: 10px;
  background: var(--white);
  border-radius: 50%;
  z-index: 1;
}

.score-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary);
  z-index: 2;
  position: relative;
}

.score-label {
  font-size: 1rem;
  color: var(--stage);
  z-index: 2;
  position: relative;
}

.performance-stats {
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem 0;
  background: rgba(233, 30, 99, 0.1);
  border-radius: 15px;
  font-size: 1.1rem;
}

.stat-label {
  font-weight: bold;
  color: var(--stage);
}

.stat-value {
  font-weight: bold;
  color: var(--primary);
}

.performance-message {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  color: var(--stage);
  line-height: 1.5;
}

.celebration-emojis {
  font-size: 2rem;
  margin-top: 1rem;
  animation: celebration-dance 2s infinite ease-in-out;
}

.final-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.restart-button, .complete-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.restart-button {
  background: linear-gradient(135deg, var(--secondary), #AB47BC);
  color: var(--white);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.3);
}

.complete-button {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: var(--white);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
}

.restart-button:hover, .complete-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* ========================================
   パーティクルエフェクト
======================================== */
.particles-container {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 1000;
}

.particle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--accent);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: particle-burst var(--duration, 1.5s) ease-out var(--delay, 0s) forwards;
}

/* ========================================
   アニメーション定義（パートナー選択以降）
======================================== */
@keyframes option-dance {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.05); }
  75% { transform: rotate(5deg) scale(1.05); }
}

@keyframes correct-celebration {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(5deg); }
  50% { transform: scale(1.1) rotate(-3deg); }
  75% { transform: scale(1.15) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes words-appear {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.9); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes notes-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-5px) rotate(5deg); }
  66% { transform: translateY(3px) rotate(-3deg); }
}

@keyframes audio-pulse {
  0%, 100% { 
    box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4); 
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 12px 40px rgba(33, 150, 243, 0.8); 
    transform: scale(1.05);
  }
}

@keyframes audio-ripple {
  0% { 
    transform: translate(-50%, -50%) scale(0); 
    opacity: 1; 
  }
  100% { 
    transform: translate(-50%, -50%) scale(2); 
    opacity: 0; 
  }
}

@keyframes feedback-appear {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.9); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes feedback-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes celebration-light {
  0%, 100% { 
    transform: translate(0, 0) scale(1); 
    opacity: 0.3; 
  }
  50% { 
    transform: translate(50px, 30px) scale(1.2); 
    opacity: 0.7; 
  }
}

@keyframes celebration-dance {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.1); }
  75% { transform: rotate(5deg) scale(1.1); }
}

@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--x), var(--y)) scale(1) rotate(360deg);
    opacity: 0;
  }
}

/* ========================================
   レスポンシブ対応（パートナー選択以降）
======================================== */
@media (max-width: 768px) {
  .partner-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .partner-option {
    padding: 1rem 0.5rem;
  }
  
  .option-letter {
    font-size: 1.5rem;
  }
  
  .audio-button {
    width: 80px;
    height: 80px;
  }
  
  .audio-icon {
    font-size: 2rem;
  }
  
  .feedback-message {
    font-size: 1.2rem;
    padding: 1rem 1.5rem;
  }
  
  .final-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .restart-button, .complete-button {
    width: 100%;
    max-width: 280px;
  }
  
  .performance-title {
    font-size: 2rem;
  }
  
  .score-circle {
    width: 120px;
    height: 120px;
  }
  
  .score-number {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .partner-options {
    grid-template-columns: 1fr;
  }
  
  .partner-option {
    padding: 1.2rem 1rem;
  }
  
  .example-words {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .words-list {
    font-size: 1.1rem;
  }
  
  .audio-button {
    width: 70px;
    height: 70px;
  }
  
  .audio-icon {
    font-size: 1.8rem;
  }
  
  .feedback-message {
    font-size: 1.1rem;
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .final-performance {
    padding: 2rem 1rem;
  }
  
  .performance-title {
    font-size: 1.8rem;
  }
  
  .score-circle {
    width: 100px;
    height: 100px;
  }
  
  .score-number {
    font-size: 1.8rem;
  }
  
  .stat-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* ========================================
   アクセシビリティ対応（パートナー選択以降）
======================================== */
.partner-option:focus {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.audio-button:focus {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.next-button:focus,
.restart-button:focus,
.complete-button:focus {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  .partner-option {
    border-width: 4px;
  }
  
  .feedback-message {
    border: 3px solid var(--stage);
  }
  
  .example-word {
    border: 2px solid var(--stage);
  }
}

/* 動きを抑制する設定対応 */
@media (prefers-reduced-motion: reduce) {
  .option-dancer,
  .musical-notes,
  .feedback-icon,
  .celebration-emojis,
  .particles-container {
    animation: none;
  }
  
  .audio-button::before {
    animation: none;
  }
  
  .final-performance::before {
    animation: none;
  }
}
</style>
