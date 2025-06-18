<template>
  <div class="complex-phoneme-game">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="header-content">
        <div class="logo-container">
          <div class="dna-logo">🧬</div>
          <h1 class="game-title">DNA Phoneme Laboratory</h1>
          <div class="lab-icon">🔬</div>
        </div>
        <div class="game-controls">
          <button @click="toggleSettings" class="control-btn settings-btn">⚙️</button>
          <button @click="exitGame" class="control-btn exit-btn">❌</button>
        </div>
      </div>
    </header>

    <!-- 進捗バー -->
    <div class="progress-section">
      <div class="progress-container">
        <div class="progress-label">Analysis Progress</div>
        <div class="progress-bar-container">
          <div 
            class="progress-bar" 
            :style="{ width: `${(currentQuestion / totalQuestions) * 100}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ Math.round((currentQuestion / totalQuestions) * 100) }}% Complete</div>
      </div>
    </div>

    <!-- メインゲームエリア -->
    <main class="game-main">
      <!-- DNA構造表示エリア -->
      <div class="dna-analysis-section">
        <h2 class="section-title">Genetic Code Analysis</h2>
        
        <!-- DNA二重螺旋構造 -->
        <div class="dna-helix-container">
          <div class="dna-helix" :class="{ 'analyzing': isAnalyzing }">
            <!-- 上部のベースペア -->
            <div class="base-pair-row">
              <div class="base left-base">{{ currentPattern.base1 || 'A' }}</div>
              <div class="bond-line"></div>
              <div class="base right-base">{{ currentPattern.base2 || 'T' }}</div>
            </div>
            
            <!-- 中部のベースペア -->
            <div class="base-pair-row">
              <div class="base left-base">{{ currentPattern.base3 || 'G' }}</div>
              <div class="bond-line"></div>
              <div class="base right-base">{{ currentPattern.base4 || 'C' }}</div>
            </div>
            
            <!-- 音韻遺伝子ペア -->
            <div class="phoneme-pair-row">
              <div class="phoneme-base left-phoneme">{{ currentPattern.phoneme1 }}</div>
              <div class="phoneme-bond"></div>
              <div class="phoneme-base right-phoneme">{{ currentPattern.phoneme2 }}</div>
            </div>
          </div>
        </div>

        <!-- 分析ディスプレイ -->
        <div class="analysis-display">
          <div class="analysis-screen">
            <div class="screen-header">
              <span class="screen-title">🔬 Pattern Analysis</span>
              <div class="scanning-indicator" :class="{ 'active': isAnalyzing }"></div>
            </div>
            <div class="screen-content">
              <div class="pattern-info">
                <div class="pattern-name">{{ currentPattern.name }}</div>
                <div class="pattern-description">{{ currentPattern.description }}</div>
                <div class="example-words">
                  <span class="label">Examples:</span>
                  <span class="words">{{ currentPattern.examples.join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 問題エリア -->
      <div class="question-section">
        <div class="question-container">
          <h3 class="question-title">Decode the phoneme pattern:</h3>
          <div class="question-text">{{ currentQuestion.question }}</div>
          
          <!-- 音声再生ボタン -->
          <div class="audio-section">
            <button 
              @click="playAudio" 
              class="audio-button"
              :class="{ 'playing': isPlaying }"
              :disabled="isPlaying"
            >
              <span class="audio-icon">🔊</span>
              <span class="audio-text">{{ isPlaying ? 'Playing...' : 'Listen' }}</span>
            </button>
          </div>

          <!-- 選択肢 -->
          <div class="choices-container">
            <button
              v-for="(choice, index) in currentQuestion.choices"
              :key="index"
              @click="selectAnswer(choice, index)"
              class="choice-button"
              :class="{ 
                'selected': selectedChoice === index,
                'correct': showFeedback && choice.correct,
                'incorrect': showFeedback && selectedChoice === index && !choice.correct
              }"
              :disabled="showFeedback"
            >
              <div class="choice-content">
                <div class="choice-label">{{ choice.label }}</div>
                <div class="choice-description">{{ choice.description }}</div>
              </div>
              <div v-if="showFeedback && choice.correct" class="choice-indicator correct-indicator">✓</div>
              <div v-else-if="showFeedback && selectedChoice === index && !choice.correct" class="choice-indicator incorrect-indicator">✗</div>
            </button>
          </div>
        </div>
      </div>

      <!-- ステータス表示 -->
      <div class="status-section">
        <div class="status-grid">
          <div class="status-item lives">
            <span class="status-label">🛡️ Lives:</span>
            <div class="lives-display">
              <span v-for="n in maxLives" :key="n" class="life-heart" :class="{ 'lost': n > currentLives }">
                {{ n <= currentLives ? '❤️' : '💔' }}
              </span>
            </div>
          </div>
          
          <div class="status-item score">
            <span class="status-label">⭐ Score:</span>
            <span class="score-value" :class="{ 'score-increase': scoreIncreasing }">
              {{ formatScore(currentScore) }}
            </span>
          </div>
          
          <div class="status-item level">
            <span class="status-label">🧬 Level:</span>
            <span class="level-value">{{ currentLevel }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- フィードバックモーダル -->
    <div v-if="showFeedbackModal" class="modal-backdrop" @click="closeFeedbackModal">
      <div class="modal-content" @click.stop>
        <div class="feedback-modal" :class="{ 'correct': lastAnswerCorrect, 'incorrect': !lastAnswerCorrect }">
          <div class="feedback-icon">
            {{ lastAnswerCorrect ? '🎉' : '😞' }}
          </div>
          <div class="feedback-title">
            {{ lastAnswerCorrect ? 'Excellent!' : 'Not quite right' }}
          </div>
          <div class="feedback-message">{{ feedbackMessage }}</div>
          <div v-if="!lastAnswerCorrect" class="correct-answer">
            <span class="label">Correct answer:</span>
            <span class="answer">{{ correctAnswer }}</span>
          </div>
          <button @click="closeFeedbackModal" class="continue-btn">
            {{ lastAnswerCorrect ? 'Continue' : 'Try Again' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ゲーム完了モーダル -->
    <div v-if="gameCompleted" class="modal-backdrop">
      <div class="modal-content">
        <div class="completion-modal">
          <div class="completion-icon">🏆</div>
          <h2 class="completion-title">Laboratory Analysis Complete!</h2>
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">Final Score:</span>
              <span class="stat-value">{{ formatScore(currentScore) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Patterns Mastered:</span>
              <span class="stat-value">{{ correctAnswers }}/{{ totalQuestions }}</span>
            </div>
          </div>
          <div class="completion-actions">
            <button @click="restartGame" class="action-btn primary">Play Again</button>
            <button @click="exitGame" class="action-btn secondary">Exit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ゲームオーバーモーダル -->
    <div v-if="gameOver" class="modal-backdrop">
      <div class="modal-content">
        <div class="game-over-modal">
          <div class="game-over-icon">💔</div>
          <h2 class="game-over-title">Analysis Failed</h2>
          <div class="game-over-message">
            The DNA sequence analysis was unsuccessful. Would you like to try again?
          </div>
          <div class="game-over-stats">
            <div class="stat-item">
              <span class="stat-label">Score Achieved:</span>
              <span class="stat-value">{{ formatScore(currentScore) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Questions Completed:</span>
              <span class="stat-value">{{ currentQuestion }}/{{ totalQuestions }}</span>
            </div>
          </div>
          <div class="game-over-actions">
            <button @click="restartGame" class="action-btn primary">Try Again</button>
            <button @click="exitGame" class="action-btn secondary">Exit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- パーティクルエフェクト -->
    <div class="particles-container">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="particle"
        :style="particle.style"
        :class="particle.type"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

// ゲーム状態
const currentQuestion = ref(1)
const totalQuestions = ref(12)
const currentScore = ref(0)
const currentLives = ref(3)
const maxLives = ref(3)
const currentLevel = ref(1)
const correctAnswers = ref(0)
const selectedChoice = ref(null)
const showFeedback = ref(false)
const showFeedbackModal = ref(false)
const lastAnswerCorrect = ref(false)
const feedbackMessage = ref('')
const correctAnswer = ref('')
const gameCompleted = ref(false)
const gameOver = ref(false)
const isAnalyzing = ref(false)
const isPlaying = ref(false)
const scoreIncreasing = ref(false)

// パーティクルシステム
const particles = ref([])
let particleId = 0

// 音声システム
let speechSynthesis = null
let currentUtterance = null

// 複雑音韻パターンデータ
const phonemePatterns = ref([
  {
    name: "Consonant Clusters",
    description: "Two or more consonants together",
    base1: "C", base2: "L", base3: "U", base4: "S",
    phoneme1: "/bl/", phoneme2: "/str/",
    examples: ["black", "strong", "spring"]
  },
  {
    name: "Diphthongs",
    description: "Two vowel sounds in one syllable",
    base1: "O", base2: "U", base3: "A", base4: "I",
    phoneme1: "/aɪ/", phoneme2: "/aʊ/",
    examples: ["time", "house", "coin"]
  },
  {
    name: "Schwa Patterns",
    description: "Unstressed vowel sound /ə/",
    base1: "A", base2: "E", base3: "O", base4: "U",
    phoneme1: "/ə/", phoneme2: "/ɪ/",
    examples: ["about", "taken", "lemon"]
  }
])

// 問題データ
const questions = ref([
  {
    id: 1,
    question: "Which consonant cluster appears in 'spring'?",
    audioText: "spring",
    pattern: "Consonant Clusters",
    choices: [
      { label: "/spr/", description: "s-p-r cluster", correct: true },
      { label: "/str/", description: "s-t-r cluster", correct: false },
      { label: "/skr/", description: "s-k-r cluster", correct: false }
    ]
  },
  {
    id: 2,
    question: "What diphthong sound is in 'house'?",
    audioText: "house",
    pattern: "Diphthongs",
    choices: [
      { label: "/aɪ/", description: "like in 'time'", correct: false },
      { label: "/aʊ/", description: "like in 'now'", correct: true },
      { label: "/ɔɪ/", description: "like in 'coin'", correct: false }
    ]
  },
  {
    id: 3,
    question: "Where is the schwa sound in 'elephant'?",
    audioText: "elephant",
    pattern: "Schwa Patterns",
    choices: [
      { label: "First syllable", description: "/ˈel/", correct: false },
      { label: "Second syllable", description: "/ə/", correct: true },
      { label: "Third syllable", description: "/ənt/", correct: false }
    ]
  },
  {
    id: 4,
    question: "What consonant cluster is in 'twelve'?",
    audioText: "twelve",
    pattern: "Consonant Clusters",
    choices: [
      { label: "/tw/", description: "t-w cluster", correct: true },
      { label: "/lv/", description: "l-v cluster", correct: false },
      { label: "/elv/", description: "e-l-v cluster", correct: false }
    ]
  },
  {
    id: 5,
    question: "Which diphthong is in 'enjoy'?",
    audioText: "enjoy",
    pattern: "Diphthongs",
    choices: [
      { label: "/eɪ/", description: "like in 'day'", correct: false },
      { label: "/ɔɪ/", description: "like in 'boy'", correct: true },
      { label: "/aɪ/", description: "like in 'my'", correct: false }
    ]
  },
  {
    id: 6,
    question: "Where is the schwa in 'banana'?",
    audioText: "banana",
    pattern: "Schwa Patterns",
    choices: [
      { label: "First 'a'", description: "/bə/", correct: true },
      { label: "Second 'a'", description: "/næ/", correct: false },
      { label: "Third 'a'", description: "/nə/", correct: false }
    ]
  },
  {
    id: 7,
    question: "What cluster is in 'splash'?",
    audioText: "splash",
    pattern: "Consonant Clusters",
    choices: [
      { label: "/spl/", description: "s-p-l cluster", correct: true },
      { label: "/ash/", description: "a-s-h cluster", correct: false },
      { label: "/pl/", description: "p-l cluster", correct: false }
    ]
  },
  {
    id: 8,
    question: "Which diphthong is in 'loud'?",
    audioText: "loud",
    pattern: "Diphthongs",
    choices: [
      { label: "/aʊ/", description: "like in 'how'", correct: true },
      { label: "/oʊ/", description: "like in 'go'", correct: false },
      { label: "/aɪ/", description: "like in 'high'", correct: false }
    ]
  },
  {
    id: 9,
    question: "Where is the schwa in 'computer'?",
    audioText: "computer",
    pattern: "Schwa Patterns",
    choices: [
      { label: "First syllable", description: "/kəm/", correct: false },
      { label: "Second syllable", description: "/pju/", correct: false },
      { label: "Third syllable", description: "/tər/", correct: true }
    ]
  },
  {
    id: 10,
    question: "What cluster is in 'strong'?",
    audioText: "strong",
    pattern: "Consonant Clusters",
    choices: [
      { label: "/str/", description: "s-t-r cluster", correct: true },
      { label: "/ong/", description: "o-n-g cluster", correct: false },
      { label: "/ng/", description: "n-g cluster", correct: false }
    ]
  },
  {
    id: 11,
    question: "Which diphthong is in 'point'?",
    audioText: "point",
    pattern: "Diphthongs",
    choices: [
      { label: "/ɔɪ/", description: "like in 'voice'", correct: true },
      { label: "/aɪ/", description: "like in 'right'", correct: false },
      { label: "/aʊ/", description: "like in 'ount'", correct: false }
    ]
  },
  {
    id: 12,
    question: "Where is the schwa in 'photograph'?",
    audioText: "photograph",
    pattern: "Schwa Patterns",
    choices: [
      { label: "First syllable", description: "/foʊ/", correct: false },
      { label: "Second syllable", description: "/tə/", correct: true },
      { label: "Third syllable", description: "/græf/", correct: false }
    ]
  }
])

// 現在のパターンと問題
const currentPattern = computed(() => {
  const question = questions.value[currentQuestion.value - 1]
  if (!question) return phonemePatterns.value[0]
  
  return phonemePatterns.value.find(p => p.name === question.pattern) || phonemePatterns.value[0]
})

const currentQuestion = computed(() => {
  return questions.value[currentQuestion.value - 1] || questions.value[0]
})

// ゲーム機能
const selectAnswer = (choice, index) => {
  if (showFeedback.value) return
  
  selectedChoice.value = index
  showFeedback.value = true
  
  setTimeout(() => {
    processAnswer(choice)
  }, 500)
}

const processAnswer = (choice) => {
  isAnalyzing.value = true
  
  setTimeout(() => {
    if (choice.correct) {
      handleCorrectAnswer()
    } else {
      handleIncorrectAnswer(choice)
    }
    isAnalyzing.value = false
  }, 1500)
}

const handleCorrectAnswer = () => {
  lastAnswerCorrect.value = true
  correctAnswers.value++
  const points = 100 * currentLevel.value
  currentScore.value += points
  scoreIncreasing.value = true
  
  feedbackMessage.value = `Excellent analysis! The DNA pattern has been successfully decoded. +${points} points!`
  
  createParticles('success')
  showFeedbackModal.value = true
  
  setTimeout(() => {
    scoreIncreasing.value = false
  }, 600)
}

const handleIncorrectAnswer = (selectedChoice) => {
  lastAnswerCorrect.value = false
  currentLives.value--
  
  const correctChoice = currentQuestion.value.choices.find(c => c.correct)
  correctAnswer.value = correctChoice ? correctChoice.label : ''
  
  feedbackMessage.value = `The analysis was incomplete. The DNA sequence requires more careful examination.`
  
  createParticles('failure')
  showFeedbackModal.value = true
  
  if (currentLives.value <= 0) {
    setTimeout(() => {
      showFeedbackModal.value = false
      gameOver.value = true
    }, 2000)
  }
}

const closeFeedbackModal = () => {
  showFeedbackModal.value = false
  
  if (currentQuestion.value >= totalQuestions.value) {
    gameCompleted.value = true
  } else if (currentLives.value > 0) {
    nextQuestion()
  }
}

const nextQuestion = () => {
  currentQuestion.value++
  selectedChoice.value = null
  showFeedback.value = false
  
  // レベルアップチェック
  if (currentQuestion.value % 4 === 1 && currentQuestion.value > 1) {
    currentLevel.value++
  }
}

const playAudio = () => {
  if (isPlaying.value || !speechSynthesis) return
  
  isPlaying.value = true
  const text = currentQuestion.value.audioText
  
  currentUtterance = new SpeechSynthesisUtterance(text)
  currentUtterance.rate = 0.8
  currentUtterance.pitch = 1.0
  
  currentUtterance.onend = () => {
    isPlaying.value = false
  }
  
  speechSynthesis.speak(currentUtterance)
}

const createParticles = (type) => {
  const particleCount = type === 'success' ? 15 : 8
  
  for (let i = 0; i < particleCount; i++) {
    const particle = {
      id: particleId++,
      type: type,
      style: {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 0.5 + 's'
      }
    }
    
    particles.value.push(particle)
    
    setTimeout(() => {
      const index = particles.value.findIndex(p => p.id === particle.id)
      if (index > -1) {
        particles.value.splice(index, 1)
      }
    }, 2000)
  }
}

const formatScore = (score) => {
  return score.toLocaleString()
}

const restartGame = () => {
  // ゲーム状態リセット
  currentQuestion.value = 1
  currentScore.value = 0
  currentLives.value = maxLives.value
  currentLevel.value = 1
  correctAnswers.value = 0
  selectedChoice.value = null
  showFeedback.value = false
  showFeedbackModal.value = false
  gameCompleted.value = false
  gameOver.value = false
  particles.value = []
}

const exitGame = () => {
  // ゲーム終了処理
  console.log('Exiting Complex Phoneme Patterns Game')
}

const toggleSettings = () => {
  // 設定モーダル表示
  console.log('Settings modal')
}

// ライフサイクル
onMounted(() => {
  speechSynthesis = window.speechSynthesis
})

onUnmounted(() => {
  if (currentUtterance) {
    speechSynthesis?.cancel()
  }
})
</script>
<style scoped>
/* Complex Phoneme Patterns Game Styles */

/* カラー変数（DNAラボテーマ） */
.complex-phoneme-game {
  --primary: #1A237E;
  --secondary: #00E676;
  --accent: #E040FB;
  --background: #000051;
  --surface: #1A1A2E;
  --text: #FFFFFF;
  --dna-blue: #40C4FF;
  --helix-purple: #7C4DFF;
  --success: #00E676;
  --error: #FF3D71;
  --warning: #FFB300;
  --bond: #E040FB;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #1A1A2E 100%);
  color: var(--text);
  font-family: 'Roboto', 'Arial', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* ゲームヘッダー */
.game-header {
  background: linear-gradient(90deg, var(--primary), var(--surface));
  border-bottom: 2px solid var(--dna-blue);
  box-shadow: 0 4px 20px rgba(26, 35, 126, 0.5);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dna-logo {
  font-size: 2.5rem;
  animation: dna-rotate 4s linear infinite;
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--dna-blue);
  text-shadow: 0 0 10px rgba(64, 196, 255, 0.5);
  margin: 0;
}

.lab-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 5px rgba(0, 230, 118, 0.7));
}

.game-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--dna-blue);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 1.2rem;
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(64, 196, 255, 0.2);
  transform: scale(1.1);
}

/* 進捗バー */
.progress-section {
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.progress-container {
  background: rgba(26, 26, 46, 0.8);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--dna-blue);
}

.progress-label {
  font-size: 1rem;
  color: var(--dna-blue);
  margin-bottom: 0.5rem;
  text-align: center;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--secondary), var(--dna-blue), var(--accent));
  border-radius: 6px;
  transition: width 0.5s ease-in-out;
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

.progress-text {
  text-align: center;
  margin-top: 0.5rem;
  font-weight: bold;
  color: var(--secondary);
}

/* メインゲームエリア */
.game-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* DNA分析セクション */
.dna-analysis-section {
  background: rgba(26, 26, 46, 0.9);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid var(--dna-blue);
  box-shadow: 0 10px 30px rgba(64, 196, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.dna-analysis-section::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(64, 196, 255, 0.1) 0%, transparent 70%);
  animation: background-pulse 4s ease-in-out infinite;
  z-index: -1;
}

.section-title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--secondary);
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.5);
}

/* DNA二重螺旋構造 */
.dna-helix-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.dna-helix {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 2rem;
  border: 2px solid var(--helix-purple);
  backdrop-filter: blur(10px);
  transform-style: preserve-3d;
  animation: helix-float 3s ease-in-out infinite;
}

.dna-helix.analyzing {
  animation: helix-analyze 2s ease-in-out infinite;
  box-shadow: 0 0 30px var(--accent);
}

.base-pair-row, .phoneme-pair-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  gap: 2rem;
}

.base, .phoneme-base {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  animation: base-glow 2s ease-in-out infinite alternate;
}

.base {
  background: linear-gradient(135deg, var(--dna-blue), var(--helix-purple));
  border: 2px solid var(--secondary);
}

.phoneme-base {
  background: linear-gradient(135deg, var(--accent), var(--secondary));
  border: 2px solid var(--dna-blue);
  font-size: 1rem;
  width: 60px;
  height: 60px;
}

.bond-line {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--dna-blue), var(--helix-purple), var(--dna-blue));
  position: relative;
  animation: bond-pulse 1.5s ease-in-out infinite;
}

.phoneme-bond {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), var(--secondary), var(--accent));
  position: relative;
  animation: phoneme-bond-pulse 1.8s ease-in-out infinite;
}

.bond-line::before, .phoneme-bond::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: var(--text);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--secondary);
}

/* 分析ディスプレイ */
.analysis-display {
  margin-top: 2rem;
}

.analysis-screen {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--secondary);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 230, 118, 0.3);
}

.screen-header {
  background: linear-gradient(90deg, var(--secondary), var(--dna-blue));
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--background);
  font-weight: bold;
}

.scanning-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--error);
  transition: background 0.3s ease;
}

.scanning-indicator.active {
  background: var(--secondary);
  animation: scanning-blink 1s infinite;
}

.screen-content {
  padding: 1rem;
}

.pattern-name {
  font-size: 1.3rem;
  color: var(--secondary);
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.pattern-description {
  color: var(--dna-blue);
  margin-bottom: 1rem;
  font-style: italic;
}

.example-words {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.example-words .label {
  color: var(--text);
  font-weight: bold;
}

.example-words .words {
  color: var(--accent);
  font-family: monospace;
}

/* 問題セクション */
.question-section {
  background: rgba(26, 26, 46, 0.9);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid var(--accent);
  box-shadow: 0 10px 30px rgba(224, 64, 251, 0.2);
}

.question-container {
  text-align: center;
}

.question-title {
  font-size: 1.4rem;
  color: var(--accent);
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(224, 64, 251, 0.5);
}

.question-text {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--text);
  line-height: 1.6;
}

/* 音声セクション */
.audio-section {
  margin: 2rem 0;
}

.audio-button {
  background: linear-gradient(135deg, var(--dna-blue), var(--helix-purple));
  border: none;
  border-radius: 15px;
  padding: 1rem 2rem;
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(64, 196, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.audio-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(64, 196, 255, 0.6);
}

.audio-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.audio-button.playing {
  animation: audio-pulse 1s infinite ease-in-out;
}

.audio-icon {
  font-size: 1.3rem;
  animation: audio-icon-bounce 2s infinite ease-in-out;
}

/* 選択肢 */
.choices-container {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
}

.choice-button {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--dna-blue);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  text-align: left;
  color: var(--text);
}

.choice-button:hover:not(:disabled) {
  background: rgba(64, 196, 255, 0.1);
  border-color: var(--secondary);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 196, 255, 0.3);
}

.choice-button.selected {
  border-color: var(--accent);
  background: rgba(224, 64, 251, 0.1);
}

.choice-button.correct {
  border-color: var(--success);
  background: rgba(0, 230, 118, 0.2);
  animation: correct-glow 0.6s ease-in-out;
}

.choice-button.incorrect {
  border-color: var(--error);
  background: rgba(255, 61, 113, 0.2);
  animation: incorrect-shake 0.5s ease-in-out;
}

.choice-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.choice-label {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--secondary);
  font-family: monospace;
}

.choice-description {
  font-size: 0.9rem;
  color: var(--dna-blue);
  opacity: 0.8;
}

.choice-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.correct-indicator {
  background: var(--success);
  color: var(--background);
  animation: indicator-pop 0.4s ease-out;
}

.incorrect-indicator {
  background: var(--error);
  color: var(--text);
  animation: indicator-pop 0.4s ease-out;
}

/* ステータスセクション */
.status-section {
  grid-column: 1 / -1;
  margin-top: 2rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid var(--dna-blue);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  backdrop-filter: blur(10px);
}

.status-label {
  display: block;
  font-size: 0.9rem;
  color: var(--dna-blue);
  margin-bottom: 0.5rem;
}

.lives-display {
  display: flex;
  justify-content: center;
  gap: 0.2rem;
}

.life-heart {
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.life-heart.lost {
  opacity: 0.3;
  filter: grayscale(100%);
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--secondary);
  transition: all 0.3s ease;
}

.score-value.score-increase {
  animation: score-bump 0.6s ease-out;
  color: var(--accent);
}

.level-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--accent);
}

/* モーダル */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modal-fade-in 0.3s ease-out;
}

.modal-content {
  background: linear-gradient(135deg, var(--surface), var(--background));
  border: 2px solid var(--dna-blue);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: modal-slide-up 0.4s ease-out;
  text-align: center;
}

/* フィードバックモーダル */
.feedback-modal {
  color: var(--text);
}

.feedback-modal.correct {
  border-top: 4px solid var(--success);
}

.feedback-modal.incorrect {
  border-top: 4px solid var(--error);
}

.feedback-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: feedback-bounce 0.6s ease-out;
}

.feedback-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.feedback-modal.correct .feedback-title {
  color: var(--success);
}

.feedback-modal.incorrect .feedback-title {
  color: var(--error);
}

.feedback-message {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--dna-blue);
}

.correct-answer {
  background: rgba(255, 61, 113, 0.1);
  border: 1px solid var(--error);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.correct-answer .label {
  color: var(--text);
  font-weight: bold;
}

.correct-answer .answer {
  color: var(--secondary);
  font-family: monospace;
  font-size: 1.1rem;
}

.continue-btn {
  background: linear-gradient(135deg, var(--secondary), var(--dna-blue));
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  color: var(--background);
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 230, 118, 0.4);
}

.continue-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 230, 118, 0.6);
}

/* 完了/ゲームオーバーモーダル */
.completion-modal, .game-over-modal {
  color: var(--text);
}

.completion-icon, .game-over-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: icon-pulse 1s ease-in-out infinite;
}

.completion-title, .game-over-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.completion-title {
  color: var(--secondary);
}

.game-over-title {
  color: var(--error);
}

.completion-stats, .game-over-stats {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: var(--dna-blue);
}

.stat-value {
  color: var(--secondary);
  font-weight: bold;
}

.completion-actions, .game-over-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--secondary), var(--dna-blue));
  color: var(--background);
  box-shadow: 0 4px 15px rgba(0, 230, 118, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
  border: 1px solid var(--dna-blue);
}

.action-btn:hover {
  transform: scale(1.05);
}

/* パーティクルエフェクト */
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.particle {
  position: absolute;
  pointer-events: none;
}

.particle.success {
  width: 20px;
  height: 20px;
  background: var(--secondary);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: particle-burst 2s ease-out forwards;
}

.particle.failure {
  width: 15px;
  height: 15px;
  background: var(--error);
  border-radius: 50%;
  animation: particle-fall 2s ease-out forwards;
}

/* アニメーション */
@keyframes dna-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes helix-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes helix-analyze {
  0%, 100% { transform: scale(1) rotateY(0deg); }
  50% { transform: scale(1.05) rotateY(180deg); }
}

@keyframes base-glow {
  0% { box-shadow: 0 0 5px rgba(64, 196, 255, 0.5); }
  100% { box-shadow: 0 0 20px rgba(0, 230, 118, 0.8); }
}

@keyframes bond-pulse {
  0%, 100% { opacity: 0.7; transform: scaleX(1); }
  50% { opacity: 1; transform: scaleX(1.1); }
}

@keyframes phoneme-bond-pulse {
  0%, 100% { opacity: 0.8; transform: scaleX(1); }
  50% { opacity: 1; transform: scaleX(1.2); }
}

@keyframes scanning-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes background-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes audio-pulse {
  0%, 100% { box-shadow: 0 4px 15px rgba(64, 196, 255, 0.4); }
  50% { box-shadow: 0 4px 25px rgba(64, 196, 255, 0.8); }
}

@keyframes audio-icon-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes correct-glow {
  0% { box-shadow: 0 0 0 rgba(0, 230, 118, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 230, 118, 0.8); }
  100% { box-shadow: 0 0 0 rgba(0, 230, 118, 0.5); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes indicator-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes score-bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes modal-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes modal-slide-up {
  0% { 
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  100% { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes feedback-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes particle-burst {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

@keyframes particle-fall {
  0% {
    transform: translateY(0px);
    opacity: 1;
  }
  100% {
    transform: translateY(100px);
    opacity: 0;
  }
}

/* レスポンシブデザイン */
@media (max-width: 1024px) {
  .game-main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 768px) {
  .logo-container {
    gap: 0.5rem;
  }
  
  .dna-logo, .lab-icon {
    font-size: 1.8rem;
  }
  
  .game-title {
    font-size: 1.2rem;
  }
  
  .dna-helix {
    padding: 1rem;
  }
  
  .base, .phoneme-base {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .phoneme-base {
    width: 50px;
    height: 50px;
  }
  
  .bond-line {
    width: 60px;
  }
  
  .phoneme-bond {
    width: 80px;
  }
  
  .choice-button {
    padding: 0.8rem;
  }
  
  .choice-label {
    font-size: 1rem;
  }
  
  .choice-description {
    font-size: 0.8rem;
  }
  
  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .game-main {
    padding: 0.5rem;
  }
  
  .dna-analysis-section,
  .question-section {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .choices-container {
    gap: 0.8rem;
  }
  
  .audio-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
  
  .completion-actions,
  .game-over-actions {
    flex-direction: column;
  }
}
</style>