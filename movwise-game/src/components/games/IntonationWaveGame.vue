<template>
  <div class="intonation-wave-game">
    <!-- ゲームヘッダー -->
    <GameHeader
      :title="gameTitle"
      :icon="'🏄‍♂️'"
      :progress="progress"
      :score="score"
      :lives="lives"
      @pause="pauseGame"
      @quit="quitGame"
    />

    <!-- ゲームメイン画面 -->
    <div class="game-container">
      <!-- 波のアニメーション背景 -->
      <div class="wave-background">
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
        <div class="wave wave-3"></div>
      </div>

      <!-- ゲーム状態に応じた表示 -->
      <div v-if="gameState === 'ready'" class="game-ready">
        <div class="welcome-card">
          <h2>🌊 Surf the Sound Waves!</h2>
          <p>英語のイントネーションパターンを波に乗って学びましょう！</p>
          <p class="instruction">文の音調変化を聞いて、正しいパターンを選択してください。</p>
          <button @click="startGame" class="start-button">
            🏄‍♂️ サーフィン開始
          </button>
        </div>
      </div>

      <div v-else-if="gameState === 'playing'" class="game-playing">
        <!-- 問題表示エリア -->
        <div class="question-area">
          <div class="sentence-display">
            <h3>{{ currentQuestion.text }}</h3>
            <p class="sentence-type">{{ currentQuestion.type }}</p>
          </div>

          <!-- 音声再生ボタン -->
          <div class="audio-controls">
            <button 
              @click="playAudio" 
              :disabled="isPlaying"
              class="audio-button"
              :class="{ playing: isPlaying }"
            >
              <span v-if="!isPlaying">🔊</span>
              <span v-else>🎵</span>
            </button>
            <p class="play-instruction">音声を聞いてください</p>
          </div>
        </div>

        <!-- サーファーキャラクター -->
        <div class="surfer-area">
          <div 
            class="surfer-character"
            :class="{ 
              'surfing': isSurfing,
              'celebrating': showFeedback && isCorrect,
              'wiping-out': showFeedback && !isCorrect
            }"
          >
            🏄‍♂️
          </div>
        </div>

        <!-- 波パターン選択肢 -->
        <div class="wave-patterns">
          <h4>どの波パターンが正しいですか？</h4>
          <div class="pattern-choices">
            <button
              v-for="(pattern, index) in currentQuestion.choices"
              :key="index"
              @click="selectPattern(index)"
              :disabled="showFeedback || selectedAnswer !== null"
              class="wave-pattern-button"
              :class="{
                'selected': selectedAnswer === index,
                'correct': showFeedback && index === currentQuestion.correctAnswer,
                'incorrect': showFeedback && selectedAnswer === index && index !== currentQuestion.correctAnswer
              }"
            >
              <div class="wave-visualization">
                <WaveVisualization 
                  :pattern="pattern.pattern"
                  :type="pattern.type"
                  :is-animated="selectedAnswer === index"
                />
              </div>
              <p class="pattern-label">{{ pattern.label }}</p>
            </button>
          </div>
        </div>

        <!-- フィードバック表示 -->
        <div v-if="showFeedback" class="feedback-area">
          <div class="feedback-message" :class="{ correct: isCorrect, incorrect: !isCorrect }">
            <div v-if="isCorrect" class="correct-feedback">
              <h3>🌊 Perfect Wave! 🏄‍♂️</h3>
              <p>素晴らしい！正しいイントネーションパターンです！</p>
              <div class="score-bonus">+{{ scoreBonus }}pt</div>
            </div>
            <div v-else class="incorrect-feedback">
              <h3>🌊 Wipe Out! 😵</h3>
              <p>残念！正しいパターンは「{{ currentQuestion.choices[currentQuestion.correctAnswer].label }}」です。</p>
              <div class="explanation">
                {{ currentQuestion.explanation }}
              </div>
            </div>
          </div>
          
          <button @click="nextQuestion" class="next-button">
            {{ isLastQuestion ? '🏁 結果を見る' : '🏄‍♂️ 次の波へ' }}
          </button>
        </div>
      </div>

      <!-- ゲーム完了画面 -->
      <div v-else-if="gameState === 'completed'" class="game-completed">
        <GameResults
          :score="score"
          :total-questions="questions.length"
          :correct-answers="correctAnswers"
          :game-title="gameTitle"
          @restart="restartGame"
          @quit="quitGame"
        />
      </div>

      <!-- ゲーム一時停止画面 -->
      <div v-else-if="gameState === 'paused'" class="game-paused">
        <div class="pause-menu">
          <h3>⏸️ ゲーム一時停止</h3>
          <button @click="resumeGame" class="resume-button">▶️ 再開</button>
          <button @click="restartGame" class="restart-button">🔄 最初から</button>
          <button @click="quitGame" class="quit-button">🚪 終了</button>
        </div>
      </div>
    </div>

    <!-- パーティクルエフェクト -->
    <ParticleEffect 
      v-if="showParticles"
      :type="particleType"
      @complete="hideParticles"
    />

    <!-- ビーチ装飾 -->
    <div class="beach-decoration">
      <div class="decoration-item">🏖️</div>
      <div class="decoration-item">🐚</div>
      <div class="decoration-item">⭐</div>
      <div class="decoration-item">🦀</div>
      <div class="decoration-item">⭐</div>
      <div class="decoration-item">🐚</div>
      <div class="decoration-item">🏖️</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
// import GameHeader from '@/components/common/GameHeader.vue'
// import GameResults from '@/components/common/GameResults.vue'
import WaveVisualization from '@/components/games/WaveVisualization.vue'
// import ParticleEffect from '@/components/common/ParticleEffect.vue'

// ゲーム状態管理
const gameStore = useGameStore()
const gameState = ref('ready') // ready, playing, paused, completed
const gameTitle = 'Intonation Wave'

// ゲーム進行状態
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showFeedback = ref(false)
const isCorrect = ref(false)
const score = ref(0)
const lives = ref(3)
const correctAnswers = ref(0)
const scoreBonus = ref(0)

// アニメーション状態
const isPlaying = ref(false)
const isSurfing = ref(false)
const showParticles = ref(false)
const particleType = ref('success')

// 音声関連
let currentAudio = null
let speechSynthesis = null

// 問題データ
const questions = ref([
  {
    text: "You like pizza.",
    type: "平叙文 (Statement)",
    audio: "You like pizza.",
    intonation: "falling",
    choices: [
      {
        label: "下降調",
        pattern: "falling",
        type: "statement"
      },
      {
        label: "上昇調", 
        pattern: "rising",
        type: "question"
      },
      {
        label: "水平調",
        pattern: "flat",
        type: "monotone"
      }
    ],
    correctAnswer: 0,
    explanation: "平叙文は通常、文末で音調が下がります。"
  },
  {
    text: "You like pizza?",
    type: "疑問文 (Yes/No Question)",
    audio: "You like pizza?",
    intonation: "rising",
    choices: [
      {
        label: "下降調",
        pattern: "falling", 
        type: "statement"
      },
      {
        label: "上昇調",
        pattern: "rising",
        type: "question"
      },
      {
        label: "水平調",
        pattern: "flat",
        type: "monotone"
      }
    ],
    correctAnswer: 1,
    explanation: "Yes/No疑問文は文末で音調が上がります。"
  },
  {
    text: "What do you like?",
    type: "WH疑問文 (WH-Question)",
    audio: "What do you like?",
    intonation: "falling",
    choices: [
      {
        label: "下降調",
        pattern: "falling",
        type: "wh-question"
      },
      {
        label: "上昇調",
        pattern: "rising", 
        type: "question"
      },
      {
        label: "波型調",
        pattern: "wave",
        type: "complex"
      }
    ],
    correctAnswer: 0,
    explanation: "WH疑問文は通常、文末で音調が下がります。"
  },
  {
    text: "It's a beautiful day, isn't it?",
    type: "付加疑問文 (Tag Question)",
    audio: "It's a beautiful day, isn't it?",
    intonation: "rising",
    choices: [
      {
        label: "下降調",
        pattern: "falling",
        type: "statement"
      },
      {
        label: "上昇調",
        pattern: "rising",
        type: "tag-question"
      },
      {
        label: "複合調",
        pattern: "complex",
        type: "complex"
      }
    ],
    correctAnswer: 1,
    explanation: "確認を求める付加疑問文は音調が上がります。"
  },
  {
    text: "I love swimming, surfing, and diving.",
    type: "列挙文 (List)",
    audio: "I love swimming, surfing, and diving.",
    intonation: "list",
    choices: [
      {
        label: "単調",
        pattern: "flat",
        type: "monotone"
      },
      {
        label: "波型調",
        pattern: "wave",
        type: "list"
      },
      {
        label: "下降調",
        pattern: "falling",
        type: "statement"
      }
    ],
    correctAnswer: 1,
    explanation: "列挙文では項目ごとに音調が変化します。"
  }
])

// 計算プロパティ
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100)
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)

// ゲーム開始
const startGame = () => {
  gameState.value = 'playing'
  resetGame()
  initializeSpeech()
}

// ゲームリセット
const resetGame = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showFeedback.value = false
  score.value = 0
  lives.value = 3
  correctAnswers.value = 0
  isCorrect.value = false
}

// 音声合成初期化
const initializeSpeech = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis
  }
}

// 音声再生
const playAudio = () => {
  if (isPlaying.value) return
  
  const text = currentQuestion.value.audio
  
  if (speechSynthesis) {
    // Web Speech API使用
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    
    // イントネーションパターンに応じてピッチ調整
    switch (currentQuestion.value.intonation) {
      case 'rising':
        utterance.pitch = 1.2
        break
      case 'falling':
        utterance.pitch = 0.8
        break
      case 'wave':
      case 'list':
        utterance.pitch = 1.0
        break
      default:
        utterance.pitch = 1.0
    }
    
    utterance.onstart = () => {
      isPlaying.value = true
      isSurfing.value = true
    }
    
    utterance.onend = () => {
      isPlaying.value = false
      isSurfing.value = false
    }
    
    speechSynthesis.speak(utterance)
  }
}

// パターン選択
const selectPattern = (index) => {
  if (selectedAnswer.value !== null || showFeedback.value) return
  
  selectedAnswer.value = index
  isCorrect.value = index === currentQuestion.value.correctAnswer
  
  // スコア計算
  if (isCorrect.value) {
    scoreBonus.value = 150
    score.value += scoreBonus.value
    correctAnswers.value++
    showParticles.value = true
    particleType.value = 'success'
  } else {
    lives.value--
    scoreBonus.value = 0
    showParticles.value = true
    particleType.value = 'failure'
  }
  
  // フィードバック表示
  setTimeout(() => {
    showFeedback.value = true
  }, 500)
  
  // ゲーム進行統計更新
  gameStore.updateGameStats('intonation_wave', {
    totalPlayed: 1,
    correctAnswers: isCorrect.value ? 1 : 0,
    score: scoreBonus.value
  })
}

// 次の問題へ
const nextQuestion = () => {
  if (isLastQuestion.value || lives.value <= 0) {
    completeGame()
  } else {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    showFeedback.value = false
    isCorrect.value = false
  }
}

// ゲーム完了
const completeGame = () => {
  gameState.value = 'completed'
  
  // 最終統計の保存
  gameStore.completeGame('intonation_wave', {
    finalScore: score.value,
    questionsAnswered: currentQuestionIndex.value + 1,
    correctAnswers: correctAnswers.value,
    accuracy: (correctAnswers.value / (currentQuestionIndex.value + 1)) * 100
  })
}

// ゲーム再開
const resumeGame = () => {
  gameState.value = 'playing'
}

// ゲーム再スタート
const restartGame = () => {
  gameState.value = 'playing'
  resetGame()
}

// ゲーム一時停止
const pauseGame = () => {
  gameState.value = 'paused'
  if (speechSynthesis) {
    speechSynthesis.cancel()
  }
  isPlaying.value = false
  isSurfing.value = false
}

// ゲーム終了
const quitGame = () => {
  if (speechSynthesis) {
    speechSynthesis.cancel()
  }
  // ルーターでゲーム選択画面に戻る
  // router.push('/games')
}

// パーティクル非表示
const hideParticles = () => {
  showParticles.value = false
}

// コンポーネント破棄時のクリーンアップ
onUnmounted(() => {
  if (speechSynthesis) {
    speechSynthesis.cancel()
  }
  if (currentAudio) {
    currentAudio.pause()
  }
})

// 初期化
onMounted(() => {
  initializeSpeech()
})
</script>
<style scoped>
/* Intonation Wave Game Styles */

/* カラー変数 */
.intonation-wave-game {
  --primary: #0277BD;        /* オーシャンブルー */
  --secondary: #00BCD4;      /* シアン */
  --accent: #FF9800;         /* サンセットオレンジ */
  --background: #E1F5FE;     /* スカイブルー */
  --wave: #4FC3F7;           /* ウェーブブルー */
  --sand: #FFCC80;           /* サンドベージュ */
  --success: #4CAF50;        /* 正解グリーン */
  --error: #FF5252;          /* 不正解レッド */
  --white: #FFFFFF;
  --text: #1A1A1A;
  --border: #E0E0E0;
}

/* ゲーム全体のコンテナ */
.intonation-wave-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #B3E5FC 100%);
  position: relative;
  overflow: hidden;
}

/* ゲームコンテナ */
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 10;
}

/* 波のアニメーション背景 */
.wave-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 195, 247, 0.1), transparent);
  animation: wave-flow 8s infinite linear;
}

.wave-1 { animation-delay: 0s; }
.wave-2 { 
  animation-delay: -2s; 
  background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.08), transparent);
}
.wave-3 { 
  animation-delay: -4s; 
  background: linear-gradient(90deg, transparent, rgba(2, 119, 189, 0.06), transparent);
}

@keyframes wave-flow {
  0% { transform: translateX(0); }
  100% { transform: translateX(50%); }
}

/* ゲーム準備画面 */
.game-ready {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.welcome-card {
  background: var(--white);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(2, 119, 189, 0.15);
  text-align: center;
  max-width: 500px;
  border: 3px solid var(--primary);
}

.welcome-card h2 {
  color: var(--primary);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.welcome-card p {
  color: var(--text);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.instruction {
  background: var(--background);
  padding: 1rem;
  border-radius: 10px;
  margin: 1.5rem 0;
  border-left: 4px solid var(--secondary);
}

.start-button {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--white);
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(2, 119, 189, 0.3);
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(2, 119, 189, 0.4);
}

/* ゲームプレイ画面 */
.game-playing {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* 問題表示エリア */
.question-area {
  background: var(--white);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(2, 119, 189, 0.1);
  text-align: center;
  border: 2px solid var(--wave);
}

.sentence-display h3 {
  color: var(--primary);
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.sentence-type {
  color: var(--secondary);
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  background: rgba(0, 188, 212, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  display: inline-block;
}

/* 音声コントロール */
.audio-controls {
  margin: 2rem 0;
}

.audio-button {
  background: linear-gradient(135deg, var(--primary), #0288D1);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(2, 119, 189, 0.4);
  font-size: 2rem;
  position: relative;
  overflow: hidden;
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(2, 119, 189, 0.6);
}

.audio-button:active {
  transform: scale(0.95);
}

.audio-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.audio-button.playing {
  animation: audio-pulse 1s infinite ease-in-out;
}

@keyframes audio-pulse {
  0%, 100% { 
    box-shadow: 0 4px 15px rgba(2, 119, 189, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 4px 25px rgba(2, 119, 189, 0.8);
    transform: scale(1.05);
  }
}

.play-instruction {
  color: var(--text);
  margin-top: 1rem;
  font-size: 1rem;
}

/* サーファーエリア */
.surfer-area {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  position: relative;
}

.surfer-character {
  font-size: 4rem;
  transition: all 0.5s ease;
  animation: surfer-idle 3s infinite ease-in-out;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.surfer-character.surfing {
  animation: surfer-riding 1s ease-in-out;
  transform: translateX(20px) rotate(15deg);
}

.surfer-character.celebrating {
  animation: surfer-celebrate 1s ease-in-out;
  transform: scale(1.2) rotate(10deg);
}

.surfer-character.wiping-out {
  animation: surfer-wipeout 1s ease-in-out;
  transform: rotate(-45deg) translateY(20px);
}

@keyframes surfer-idle {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes surfer-riding {
  0% { transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(30px) rotate(20deg); }
  100% { transform: translateX(0) rotate(0deg); }
}

@keyframes surfer-celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.3) rotate(-10deg); }
  75% { transform: scale(1.3) rotate(10deg); }
}

@keyframes surfer-wipeout {
  0% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(-90deg) translateY(30px); }
  100% { transform: rotate(-45deg) translateY(20px); }
}

/* 波パターン選択 */
.wave-patterns {
  background: var(--white);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(2, 119, 189, 0.1);
  border: 2px solid var(--sand);
}

.wave-patterns h4 {
  color: var(--primary);
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.pattern-choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.wave-pattern-button {
  background: var(--white);
  border: 3px solid var(--border);
  border-radius: 15px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.wave-pattern-button:hover {
  border-color: var(--secondary);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 188, 212, 0.2);
}

.wave-pattern-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.wave-pattern-button.selected {
  border-color: var(--primary);
  background: rgba(2, 119, 189, 0.05);
  transform: scale(1.05);
}

.wave-pattern-button.correct {
  border-color: var(--success);
  background: rgba(76, 175, 80, 0.1);
  animation: correct-bounce 0.6s ease-in-out;
}

.wave-pattern-button.incorrect {
  border-color: var(--error);
  background: rgba(255, 82, 82, 0.1);
  animation: incorrect-shake 0.5s ease-in-out;
}

@keyframes correct-bounce {
  0%, 100% { transform: scale(1.05); }
  50% { transform: scale(1.15); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.wave-visualization {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.pattern-label {
  color: var(--text);
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

/* 波の可視化コンポーネント専用スタイル */
.wave-visualization .wave-svg {
  transition: all 0.3s ease;
}

.wave-visualization .wave-svg.animated {
  animation: wave-glow 1s ease-in-out;
}

@keyframes wave-glow {
  0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
  50% { filter: drop-shadow(0 0 15px currentColor); }
}

.wave-visualization .wave-path {
  transition: all 0.3s ease;
}

.wave-visualization .wave-pulse {
  animation: pulse-ring 1.5s infinite ease-out;
}

@keyframes pulse-ring {
  0% {
    r: 5;
    opacity: 0.3;
  }
  100% {
    r: 20;
    opacity: 0;
  }
}

.wave-visualization .direction-arrow {
  position: absolute;
  right: -10px;
  font-size: 1.5rem;
  animation: arrow-bounce 1s infinite ease-in-out;
}

.wave-visualization .direction-arrow.up {
  top: 0;
  color: var(--secondary);
}

.wave-visualization .direction-arrow.down {
  bottom: 0;
  color: var(--error);
}

@keyframes arrow-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* フィードバックエリア */
.feedback-area {
  background: var(--white);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 15px 35px rgba(2, 119, 189, 0.15);
  text-align: center;
  border: 3px solid var(--wave);
}

.feedback-message.correct {
  border-color: var(--success);
}

.feedback-message.incorrect {
  border-color: var(--error);
}

.correct-feedback h3 {
  color: var(--success);
  font-size: 2rem;
  margin-bottom: 1rem;
}

.incorrect-feedback h3 {
  color: var(--error);
  font-size: 2rem;
  margin-bottom: 1rem;
}

.correct-feedback p,
.incorrect-feedback p {
  font-size: 1.2rem;
  color: var(--text);
  margin-bottom: 1rem;
}

.score-bonus {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: var(--text);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.3rem;
  display: inline-block;
  margin: 1rem 0;
  animation: score-pop 0.5s ease-out;
}

@keyframes score-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.explanation {
  background: rgba(2, 119, 189, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  border-left: 4px solid var(--primary);
  font-style: italic;
}

.next-button {
  background: linear-gradient(135deg, var(--accent), #F57C00);
  color: var(--white);
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

/* ゲーム一時停止画面 */
.game-paused {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.pause-menu {
  background: var(--white);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(2, 119, 189, 0.2);
  text-align: center;
  border: 3px solid var(--primary);
}

.pause-menu h3 {
  color: var(--primary);
  font-size: 2rem;
  margin-bottom: 2rem;
}

.pause-menu button {
  display: block;
  width: 100%;
  margin: 1rem 0;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resume-button {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: var(--white);
}

.restart-button {
  background: linear-gradient(135deg, var(--accent), #FF7043);
  color: var(--white);
}

.quit-button {
  background: linear-gradient(135deg, var(--error), #EF5350);
  color: var(--white);
}

.pause-menu button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* ビーチ装飾 */
.beach-decoration {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(135deg, var(--sand), #FFB74D);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 5;
  border-top: 3px solid var(--accent);
}

.decoration-item {
  font-size: 2rem;
  animation: decoration-float 3s infinite ease-in-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.decoration-item:nth-child(2n) {
  animation-delay: -1s;
}

.decoration-item:nth-child(3n) {
  animation-delay: -2s;
}

@keyframes decoration-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .game-container {
    padding: 1rem;
  }
  
  .welcome-card {
    padding: 2rem;
    margin: 1rem;
  }
  
  .welcome-card h2 {
    font-size: 2rem;
  }
  
  .sentence-display h3 {
    font-size: 1.5rem;
  }
  
  .pattern-choices {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .wave-pattern-button {
    padding: 1rem;
  }
  
  .audio-button {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .surfer-character {
    font-size: 3rem;
  }
  
  .beach-decoration {
    height: 60px;
  }
  
  .decoration-item {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .welcome-card {
    padding: 1.5rem;
  }
  
  .question-area,
  .wave-patterns,
  .feedback-area {
    padding: 1.5rem;
  }
  
  .sentence-display h3 {
    font-size: 1.3rem;
  }
  
  .pattern-choices {
    gap: 0.5rem;
  }
  
  .wave-pattern-button {
    padding: 0.8rem;
  }
  
  .feedback-message h3 {
    font-size: 1.5rem;
  }
}

/* アニメーション用キーフレーム */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInFromRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInFromLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* トランジション */
.game-playing {
  animation: fadeIn 0.5s ease-out;
}

.question-area {
  animation: slideInFromLeft 0.6s ease-out;
}

.wave-patterns {
  animation: slideInFromRight 0.6s ease-out;
}

.feedback-area {
  animation: fadeIn 0.4s ease-out;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .intonation-wave-game {
    --background: #0D1421;
    --white: #1E2936;
    --text: #E2E8F0;
    --border: #334155;
  }
  
  .wave-background .wave {
    background: linear-gradient(90deg, transparent, rgba(79, 195, 247, 0.05), transparent);
  }
  
  .wave-background .wave-2 {
    background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.04), transparent);
  }
  
  .wave-background .wave-3 {
    background: linear-gradient(90deg, transparent, rgba(2, 119, 189, 0.03), transparent);
  }
}

/* 高コントラストモード対応 */
@media (prefers-contrast: high) {
  .intonation-wave-game {
    --primary: #0066CC;
    --secondary: #008080;
    --accent: #CC6600;
    --success: #006600;
    --error: #CC0000;
    --border: #333333;
  }
  
  .wave-pattern-button {
    border-width: 4px;
  }
  
  .wave-pattern-button.selected {
    border-width: 5px;
  }
  
  .audio-button {
    border: 3px solid var(--white);
  }
}

/* 動きを減らす設定への対応 */
@media (prefers-reduced-motion: reduce) {
  .wave,
  .surfer-character,
  .decoration-item,
  .wave-pulse,
  .direction-arrow {
    animation: none;
  }
  
  .audio-button.playing {
    animation: none;
    box-shadow: 0 4px 25px rgba(2, 119, 189, 0.8);
  }
  
  .wave-visualization .wave-svg.animated {
    animation: none;
    filter: drop-shadow(0 0 10px currentColor);
  }
  
  * {
    transition-duration: 0.1s !important;
  }
}

/* 印刷用スタイル */
@media print {
  .intonation-wave-game {
    background: white;
    color: black;
  }
  
  .wave-background,
  .beach-decoration,
  .audio-button,
  .start-button,
  .next-button {
    display: none;
  }
  
  .game-container {
    max-width: none;
    padding: 1rem;
  }
  
  .question-area,
  .wave-patterns,
  .feedback-area {
    border: 2px solid black;
    box-shadow: none;
    page-break-inside: avoid;
  }
  
  .pattern-choices {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .wave-visualization {
    border: 1px solid black;
  }
}

/* 大画面対応 */
@media (min-width: 1400px) {
  .game-container {
    max-width: 1400px;
  }
  
  .game-playing {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    grid-template-areas: 
      "question surfer"
      "patterns patterns";
  }
  
  .question-area {
    grid-area: question;
  }
  
  .surfer-area {
    grid-area: surfer;
  }
  
  .wave-patterns {
    grid-area: patterns;
  }
}

/* 非常に小さな画面対応 */
@media (max-width: 320px) {
  .welcome-card {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .welcome-card h2 {
    font-size: 1.5rem;
  }
  
  .sentence-display h3 {
    font-size: 1.1rem;
  }
  
  .audio-button {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .surfer-character {
    font-size: 2.5rem;
  }
  
  .wave-pattern-button {
    padding: 0.5rem;
  }
  
  .pattern-label {
    font-size: 0.9rem;
  }
}

/* ゲーム状態遷移アニメーション */
.game-state-enter-active,
.game-state-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.game-state-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.game-state-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.1);
}

/* フォーカス管理 */
.focus-trap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

/* スクリーンリーダー対応 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* カスタムスクロールバー */
.game-container::-webkit-scrollbar {
  width: 8px;
}

.game-container::-webkit-scrollbar-track {
  background: rgba(79, 195, 247, 0.1);
  border-radius: 4px;
}

.game-container::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 4px;
}

.game-container::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}

/* エラー状態のスタイル */
.error-state {
  background: rgba(255, 82, 82, 0.1);
  border: 2px solid var(--error);
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.error-state h3 {
  color: var(--error);
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--text);
  margin-bottom: 1rem;
}

.retry-button {
  background: linear-gradient(135deg, var(--error), #EF5350);
  color: var(--white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.3);
}

/* ローディング状態 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(2, 119, 189, 0.2);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: loading-spin 1s linear infinite;
}

@keyframes loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: var(--primary);
  font-weight: 600;
}

/* ツールチップ */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 200px;
  background-color: var(--text);
  color: var(--white);
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  position: absolute;
  z-index: 1000;
  bottom: 125%;
  left: 50%;
  margin-left: -100px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.9rem;
}

.tooltip .tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: var(--text) transparent transparent transparent;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* バッジとラベル */
.difficulty-badge {
  background: linear-gradient(135deg, var(--accent), #F57C00);
  color: var(--white);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-indicator {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.level-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 4px;
  background: var(--border);
  transition: all 0.3s ease;
}

.level-dot.active {
  background: var(--primary);
  transform: scale(1.2);
}

.level-dot.completed {
  background: var(--success);
}

/* ヘルプとヒント */
.help-button {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  color: var(--white);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
}

.help-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
}

.help-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.help-content {
  background: var(--white);
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.help-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text);
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.help-close:hover {
  background: var(--border);
}

/* パフォーマンス最適化 */
.will-change-transform {
  will-change: transform;
}

.will-change-opacity {
  will-change: opacity;
}

.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 最終調整 */
* {
  box-sizing: border-box;
}

button {
  font-family: inherit;
}

input, button, select, textarea {
  font-size: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

/* ゲーム終了時のオーバーレイ */
.game-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(2, 119, 189, 0.9), rgba(0, 188, 212, 0.9));
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: overlay-appear 0.5s ease-out;
}

@keyframes overlay-appear {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(10px);
  }
}

/* 成果バッジ */
.achievement-badge {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: var(--text);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  font-size: 0.9rem;
  margin: 0.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  animation: badge-shine 2s infinite ease-in-out;
}

@keyframes badge-shine {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.achievement-badge.perfect {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: white;
}

.achievement-badge.speed {
  background: linear-gradient(135deg, #FF5722, #FF7043);
  color: white;
}

.achievement-badge.streak {
  background: linear-gradient(135deg, #9C27B0, #BA68C8);
  color: white;
}

/* プログレスリング */
.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 2rem auto;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring circle {
  fill: none;
  stroke-width: 8;
}

.progress-ring .progress-ring-bg {
  stroke: var(--border);
}

.progress-ring .progress-ring-fill {
  stroke: var(--primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease-in-out;
}

.progress-ring .progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

/* 統計表示 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text);
  opacity: 0.8;
}

/* 星評価表示 */
.star-rating {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
  font-size: 2rem;
}

.star {
  color: #FFD700;
  transition: all 0.3s ease;
  animation: star-twinkle 1.5s infinite ease-in-out;
}

.star.empty {
  color: var(--border);
  animation: none;
}

@keyframes star-twinkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(10deg); }
}

/* ソーシャルシェア */
.share-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.share-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.share-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.share-button:hover::before {
  left: 100%;
}

.share-button.twitter {
  background: #1DA1F2;
  color: white;
}

.share-button.facebook {
  background: #4267B2;
  color: white;
}

.share-button.line {
  background: #00B900;
  color: white;
}

.share-button:hover {
  transform: scale(1.1);
}

/* 次回プレイ推奨 */
.next-recommendation {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.next-recommendation h4 {
  color: var(--primary);
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.next-recommendation p {
  color: var(--text);
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.recommendation-button {
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.recommendation-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
}

/* 学習進捗バー */
.learning-progress {
  margin: 2rem 0;
}

.learning-progress h4 {
  color: var(--primary);
  text-align: center;
  margin-bottom: 1rem;
}

.progress-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.category-progress {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.category-name {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.category-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.category-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--secondary), var(--primary));
  border-radius: 4px;
  transition: width 1s ease-in-out;
  position: relative;
}

.category-fill::after {
  content: '';
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

.category-percentage {
  font-size: 0.8rem;
  color: var(--text);
  margin-top: 0.25rem;
  text-align: right;
}

/* 詳細統計モーダル */
.detailed-stats-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
}

.detailed-stats-content {
  background: var(--white);
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.stats-tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
  margin-bottom: 2rem;
}

.stats-tab {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
  opacity: 0.6;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.stats-tab.active {
  opacity: 1;
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.stats-tab:hover {
  opacity: 0.8;
}

/* チャート表示 */
.chart-container {
  height: 300px;
  margin: 2rem 0;
  position: relative;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--background);
  border-radius: 10px;
  color: var(--text);
  font-style: italic;
}

/* 学習のヒント */
.learning-tips {
  background: linear-gradient(135deg, rgba(79, 195, 247, 0.1), rgba(0, 188, 212, 0.1));
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid var(--secondary);
}

.learning-tips h4 {
  color: var(--primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.learning-tips ul {
  list-style: none;
  padding: 0;
}

.learning-tips li {
  padding: 0.5rem 0;
  color: var(--text);
  position: relative;
  padding-left: 1.5rem;
}

.learning-tips li::before {
  content: '🌊';
  position: absolute;
  left: 0;
}

/* 最終的なメディアクエリ調整 */
@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .progress-categories {
    grid-template-columns: 1fr;
  }
  
  .share-buttons {
    gap: 0.5rem;
  }
  
  .share-button {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .detailed-stats-content {
    padding: 1.5rem;
  }
  
  .stats-tabs {
    flex-wrap: wrap;
  }
  
  .stats-tab {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-ring {
    width: 100px;
    height: 100px;
  }
  
  .progress-ring .progress-text {
    font-size: 1.2rem;
  }
  
  .star-rating {
    font-size: 1.5rem;
  }
}

/* 最終的なz-index管理 */
.game-overlay { z-index: 999; }
.help-modal { z-index: 1001; }
.detailed-stats-modal { z-index: 1002; }
.focus-trap { z-index: 1000; }

/* 最終的なスクロール調整 */
@media (max-height: 600px) {
  .game-container {
    padding: 1rem;
  }
  
  .welcome-card,
  .detailed-stats-content {
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>