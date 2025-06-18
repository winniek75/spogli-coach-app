<template>
  <div class="sequential-blending-game">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div class="game-title">
          <h1>📊 Sound Wave Laboratory</h1>
          <p>段階的音素合成マスター</p>
        </div>
      </div>
      <div class="header-right">
        <div class="lives-display">
          <span class="lives-label">Lives:</span>
          <div class="hearts">
            <span v-for="i in 3" :key="i" class="heart" :class="{ lost: i > lives }">❤️</span>
          </div>
        </div>
        <div class="score-display">
          <span class="score-icon">⭐</span>
          <span class="score-value">{{ score.toLocaleString() }}</span>
        </div>
      </div>
    </header>

    <!-- 進捗バー -->
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      <div class="progress-text">Progress: {{ Math.round(progress) }}%</div>
    </div>

    <!-- メインゲームエリア -->
    <main class="game-main">
      <div class="wave-laboratory">
        <div class="lab-title">
          <h2>🔊 Blending Sequence Analysis</h2>
          <p>音素を段階的に合成して単語を作りましょう</p>
        </div>

        <!-- 現在の問題表示 -->
        <div v-if="currentProblem" class="problem-display">
          <div class="target-word">
            <span class="word-label">Target Word:</span>
            <span class="target">{{ currentProblem.word }}</span>
            <button @click="playTargetWord" class="play-button" :disabled="isPlaying">
              <span v-if="!isPlaying">🔊</span>
              <span v-else class="spinner">⚡</span>
            </button>
          </div>
        </div>

        <!-- 音波合成プロセス -->
        <div class="blending-process">
          <div class="phase-container">
            <!-- フェーズ1: 個別音素 -->
            <div class="blending-phase" :class="{ active: currentPhase >= 1, completed: currentPhase > 1 }">
              <h3>Phase 1: Individual Phonemes</h3>
              <div class="phoneme-sequence">
                <div 
                  v-for="(phoneme, index) in currentProblem?.phonemes || []" 
                  :key="`individual-${index}`"
                  class="phoneme-wave"
                  :class="{ active: activePhoneme === index }"
                >
                  <div class="phoneme-symbol">{{ phoneme }}</div>
                  <div class="wave-visualization">
                    <svg class="wave-svg" viewBox="0 0 100 30">
                      <path 
                        :d="generateWavePath(index)" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2"
                        :class="{ animated: activePhoneme === index }"
                      />
                    </svg>
                  </div>
                  <button 
                    @click="playPhoneme(phoneme, index)" 
                    class="phoneme-play-btn"
                    :disabled="isPlaying"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>

            <!-- フェーズ2: 2音素合成 -->
            <div class="blending-phase" :class="{ active: currentPhase >= 2, completed: currentPhase > 2 }">
              <h3>Phase 2: Two-Phoneme Blending</h3>
              <div class="blend-sequence">
                <div 
                  v-for="(blend, index) in twoPhonemeBlends" 
                  :key="`blend-${index}`"
                  class="blend-wave"
                  :class="{ active: activeBlend === index }"
                >
                  <div class="blend-symbol">{{ blend.combined }}</div>
                  <div class="wave-visualization">
                    <svg class="wave-svg" viewBox="0 0 120 30">
                      <path 
                        :d="generateBlendWavePath(index)" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2"
                        :class="{ animated: activeBlend === index }"
                      />
                    </svg>
                  </div>
                  <button 
                    @click="playBlend(blend.combined, index)" 
                    class="blend-play-btn"
                    :disabled="isPlaying"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>

            <!-- フェーズ3: 完全合成 -->
            <div class="blending-phase" :class="{ active: currentPhase >= 3, completed: gamePhase === 'answer' }">
              <h3>Phase 3: Complete Word</h3>
              <div class="final-blend">
                <div class="final-word" :class="{ revealed: currentPhase >= 3 }">
                  <div class="word-symbol">{{ currentProblem?.word || '' }}</div>
                  <div class="wave-visualization final">
                    <svg class="wave-svg" viewBox="0 0 200 40">
                      <path 
                        :d="generateFinalWavePath()" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="3"
                        :class="{ animated: currentPhase >= 3 }"
                      />
                    </svg>
                  </div>
                  <button 
                    @click="playFinalWord" 
                    class="final-play-btn"
                    :disabled="isPlaying || currentPhase < 3"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 進行制御ボタン -->
          <div class="phase-controls">
            <button 
              @click="nextPhase" 
              class="phase-button"
              :disabled="currentPhase >= 3 || isPlaying"
              v-if="currentPhase < 3"
            >
              Next Phase →
            </button>
            <button 
              @click="showAnswerPhase" 
              class="complete-button"
              :disabled="currentPhase < 3"
              v-if="currentPhase >= 3 && gamePhase !== 'answer'"
            >
              Test Your Knowledge! 🧠
            </button>
          </div>
        </div>

        <!-- 回答フェーズ -->
        <div v-if="gamePhase === 'answer'" class="answer-phase">
          <div class="question-prompt">
            <h3>🎯 Which word did we create?</h3>
            <p>Listen to the blended sound and choose the correct word:</p>
            <button @click="playTargetWord" class="review-button" :disabled="isPlaying">
              🔊 Listen Again
            </button>
          </div>

          <div class="answer-choices">
            <button
              v-for="(choice, index) in currentChoices"
              :key="`choice-${index}`"
              @click="selectAnswer(choice)"
              class="choice-button"
              :class="{ 
                correct: showResult && choice === currentProblem?.word,
                incorrect: showResult && choice === selectedAnswer && choice !== currentProblem?.word,
                disabled: showResult
              }"
              :disabled="showResult"
            >
              <span class="choice-text">{{ choice }}</span>
              <span class="choice-play" @click.stop="playChoice(choice)">🔊</span>
            </button>
          </div>
        </div>

        <!-- 結果表示 -->
        <div v-if="showResult" class="result-display">
          <div class="result-content" :class="{ correct: isCorrectAnswer, incorrect: !isCorrectAnswer }">
            <div class="result-icon">
              <span v-if="isCorrectAnswer">🎉</span>
              <span v-else>💭</span>
            </div>
            <div class="result-message">
              <h3 v-if="isCorrectAnswer">Excellent Blending!</h3>
              <h3 v-else>Good Try!</h3>
              <p v-if="isCorrectAnswer">
                You successfully identified the word "{{ currentProblem?.word }}"!
              </p>
              <p v-else>
                The correct word was "{{ currentProblem?.word }}".
              </p>
              <div class="word-breakdown">
                <span class="breakdown-label">Phoneme Breakdown:</span>
                <span class="phonemes">
                  {{ currentProblem?.phonemes?.join(' + ') }} = {{ currentProblem?.word }}
                </span>
              </div>
            </div>
          </div>
          <button @click="nextProblem" class="next-button">
            {{ currentProblemIndex < problems.length - 1 ? 'Next Word →' : 'Complete! 🏆' }}
          </button>
        </div>
      </div>
    </main>

    <!-- ゲーム完了モーダル -->
    <div v-if="gameCompleted" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="completion-celebration">
          <div class="celebration-icon">🏆</div>
          <h2>Sound Wave Master!</h2>
          <p>You've mastered sequential blending!</p>
          
          <div class="final-stats">
            <div class="stat-item">
              <span class="stat-label">Final Score:</span>
              <span class="stat-value">{{ score.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ Math.round((correctAnswers / problems.length) * 100) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Words Mastered:</span>
              <span class="stat-value">{{ correctAnswers }}/{{ problems.length }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="playAgain" class="action-button primary">
              🔄 Play Again
            </button>
            <button @click="goToMenu" class="action-button secondary">
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

// ゲーム状態
const currentProblemIndex = ref(0)
const currentPhase = ref(0) // 0: start, 1: individual, 2: blending, 3: complete
const gamePhase = ref('learning') // 'learning' | 'answer'
const lives = ref(3)
const score = ref(0)
const isPlaying = ref(false)
const activePhoneme = ref(-1)
const activeBlend = ref(-1)
const selectedAnswer = ref('')
const showResult = ref(false)
const gameCompleted = ref(false)
const correctAnswers = ref(0)

// 問題データ
const problems = ref([
  {
    word: 'cat',
    phonemes: ['/k/', '/æ/', '/t/'],
    choices: ['cat', 'bat', 'hat', 'rat']
  },
  {
    word: 'dog',
    phonemes: ['/d/', '/ɒ/', '/g/'],
    choices: ['dog', 'log', 'bog', 'hog']
  },
  {
    word: 'sun',
    phonemes: ['/s/', '/ʌ/', '/n/'],
    choices: ['sun', 'run', 'fun', 'gun']
  },
  {
    word: 'book',
    phonemes: ['/b/', '/ʊ/', '/k/'],
    choices: ['book', 'look', 'cook', 'took']
  },
  {
    word: 'fish',
    phonemes: ['/f/', '/ɪ/', '/ʃ/'],
    choices: ['fish', 'dish', 'wish', 'cash']
  }
])

// 計算プロパティ
const currentProblem = computed(() => problems.value[currentProblemIndex.value])
const currentChoices = computed(() => currentProblem.value?.choices || [])
const progress = computed(() => ((currentProblemIndex.value) / problems.value.length) * 100)
const isCorrectAnswer = computed(() => selectedAnswer.value === currentProblem.value?.word)

const twoPhonemeBlends = computed(() => {
  if (!currentProblem.value?.phonemes) return []
  const phonemes = currentProblem.value.phonemes
  const blends = []
  
  // 2音素の組み合わせを作成
  if (phonemes.length >= 2) {
    blends.push({
      combined: phonemes[0] + phonemes[1],
      phonemes: [phonemes[0], phonemes[1]]
    })
  }
  if (phonemes.length >= 3) {
    blends.push({
      combined: phonemes[1] + phonemes[2],
      phonemes: [phonemes[1], phonemes[2]]
    })
  }
  
  return blends
})

// 音声再生関数
const playSound = async (text) => {
  if (isPlaying.value) return
  
  try {
    isPlaying.value = true
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    utterance.onend = () => {
      isPlaying.value = false
    }
    
    speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('音声再生エラー:', error)
    isPlaying.value = false
  }
}

const playPhoneme = async (phoneme, index) => {
  activePhoneme.value = index
  await playSound(phoneme.replace(/[\/]/g, ''))
  setTimeout(() => {
    activePhoneme.value = -1
  }, 1000)
}

const playBlend = async (blend, index) => {
  activeBlend.value = index
  await playSound(blend.replace(/[\/]/g, ''))
  setTimeout(() => {
    activeBlend.value = -1
  }, 1000)
}

const playTargetWord = () => {
  if (currentProblem.value) {
    playSound(currentProblem.value.word)
  }
}

const playFinalWord = () => {
  if (currentProblem.value) {
    playSound(currentProblem.value.word)
  }
}

const playChoice = (choice) => {
  playSound(choice)
}

// 波形生成関数
const generateWavePath = (index) => {
  const frequency = 2 + index * 0.5
  const amplitude = 8
  let path = `M 0 15`
  
  for (let x = 1; x <= 99; x++) {
    const y = 15 + amplitude * Math.sin((x * frequency * Math.PI) / 50)
    path += ` L ${x} ${y}`
  }
  
  return path
}

const generateBlendWavePath = (index) => {
  const frequency = 1.5 + index * 0.3
  const amplitude = 10
  let path = `M 0 15`
  
  for (let x = 1; x <= 119; x++) {
    const y = 15 + amplitude * Math.sin((x * frequency * Math.PI) / 60) * Math.cos((x * 0.5 * Math.PI) / 60)
    path += ` L ${x} ${y}`
  }
  
  return path
}

const generateFinalWavePath = () => {
  const amplitude = 12
  let path = `M 0 20`
  
  for (let x = 1; x <= 199; x++) {
    const y = 20 + amplitude * Math.sin((x * 3 * Math.PI) / 100) * (1 + 0.3 * Math.sin((x * 0.5 * Math.PI) / 100))
    path += ` L ${x} ${y}`
  }
  
  return path
}

// ゲーム進行関数
const nextPhase = () => {
  if (currentPhase.value < 3) {
    currentPhase.value++
  }
}

const showAnswerPhase = () => {
  gamePhase.value = 'answer'
}

const selectAnswer = (choice) => {
  if (showResult.value) return
  
  selectedAnswer.value = choice
  showResult.value = true
  
  if (choice === currentProblem.value?.word) {
    correctAnswers.value++
    score.value += 100
    gameStore.updateScore('sequential-blending', score.value)
  } else {
    lives.value = Math.max(0, lives.value - 1)
  }
}

const nextProblem = () => {
  if (currentProblemIndex.value < problems.value.length - 1) {
    currentProblemIndex.value++
    resetProblemState()
  } else {
    completeGame()
  }
}

const resetProblemState = () => {
  currentPhase.value = 0
  gamePhase.value = 'learning'
  selectedAnswer.value = ''
  showResult.value = false
  activePhoneme.value = -1
  activeBlend.value = -1
}

const completeGame = () => {
  gameCompleted.value = true
  gameStore.completeGame('sequential-blending', {
    score: score.value,
    accuracy: Math.round((correctAnswers.value / problems.value.length) * 100),
    wordsCompleted: correctAnswers.value
  })
}

// ナビゲーション関数
const goBack = () => {
  router.push('/games')
}

const playAgain = () => {
  // ゲーム状態をリセット
  currentProblemIndex.value = 0
  lives.value = 3
  score.value = 0
  correctAnswers.value = 0
  gameCompleted.value = false
  resetProblemState()
}

const goToMenu = () => {
  router.push('/games')
}

const closeModal = () => {
  gameCompleted.value = false
  goToMenu()
}

// ライフサイクル
onMounted(() => {
  // ゲーム開始時の初期化
  resetProblemState()
})
</script>

<style scoped>
/* === 音波研究所テーマカラー === */
.sequential-blending-game {
  --primary: #3F51B5;        /* インディゴ */
  --secondary: #00E676;      /* アクアグリーン */
  --accent: #FF4081;         /* ピンクアクセント */
  --background: #E8EAF6;     /* ライトインディゴ */
  --wave: #1976D2;           /* 音波ブルー */
  --frequency: #4CAF50;      /* 周波数グリーン */
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --success: #4CAF50;
  --error: #FF5252;
  --warning: #FF9800;
}

/* === 基本レイアウト === */
.sequential-blending-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background), #F3E5F5);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

/* === ヘッダー === */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--surface);
  border-bottom: 3px solid var(--primary);
  box-shadow: 0 2px 10px rgba(63, 81, 181, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
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
  box-shadow: 0 2px 8px rgba(63, 81, 181, 0.3);
}

.back-button:hover {
  background: #303F9F;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.4);
}

.game-title h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  margin: 0;
}

.game-title p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.lives-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lives-label {
  font-weight: bold;
  color: var(--text);
}

.hearts {
  display: flex;
  gap: 0.25rem;
}

.heart {
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.heart.lost {
  opacity: 0.3;
  filter: grayscale(100%);
}

.score-display {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: #1A1A1A;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.score-icon {
  font-size: 1.3rem;
  animation: score-sparkle 2s infinite ease-in-out;
}

@keyframes score-sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

/* === 進捗バー === */
.progress-container {
  width: 100%;
  height: 12px;
  background: #E0E0E0;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--frequency), var(--secondary), var(--wave));
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
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255,255,255,0.3), 
    transparent
  );
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--text);
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
}

/* === メインゲームエリア === */
.game-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.wave-laboratory {
  background: var(--surface);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(63, 81, 181, 0.15);
  border: 2px solid var(--primary);
}

.lab-title {
  text-align: center;
  margin-bottom: 2rem;
}

.lab-title h2 {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.lab-title p {
  font-size: 1.1rem;
  color: #666;
}

/* === 問題表示 === */
.problem-display {
  background: linear-gradient(135deg, var(--wave), var(--primary));
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
}

.target-word {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.3rem;
}

.word-label {
  font-weight: 600;
}

.target {
  font-size: 2rem;
  font-weight: bold;
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.play-button {
  background: rgba(255,255,255,0.2);
  border: 2px solid white;
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-size: 1.2rem;
}

.play-button:hover:not(:disabled) {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.play-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === ブレンディングプロセス === */
.blending-process {
  margin-bottom: 2rem;
}

.phase-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.blending-phase {
  background: #F8F9FA;
  border: 2px solid #E0E0E0;
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
}

.blending-phase.active {
  border-color: var(--primary);
  background: rgba(63, 81, 181, 0.05);
  box-shadow: 0 4px 20px rgba(63, 81, 181, 0.1);
}

.blending-phase.completed {
  border-color: var(--frequency);
  background: rgba(76, 175, 80, 0.05);
}

.blending-phase::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.blending-phase.active::before {
  opacity: 1;
}

.blending-phase h3 {
  color: var(--primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

/* === 音素シーケンス === */
.phoneme-sequence {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.phoneme-wave {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface);
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  transition: all 0.3s ease;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.phoneme-wave.active {
  border-color: var(--wave);
  background: rgba(25, 118, 210, 0.1);
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.phoneme-symbol {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  background: rgba(63, 81, 181, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  min-width: 60px;
  text-align: center;
}

.wave-visualization {
  width: 100px;
  height: 30px;
  color: var(--wave);
}

.wave-svg {
  width: 100%;
  height: 100%;
}

.wave-svg path.animated {
  animation: wave-pulse 1s ease-in-out;
  stroke: var(--accent);
}

@keyframes wave-pulse {
  0%, 100% { stroke-width: 2; }
  50% { stroke-width: 4; }
}

.phoneme-play-btn {
  background: var(--wave);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phoneme-play-btn:hover:not(:disabled) {
  background: #1565C0;
  transform: scale(1.1);
}

.phoneme-play-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === ブレンドシーケンス === */
.blend-sequence {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.blend-wave {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.2rem;
  background: var(--surface);
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  transition: all 0.3s ease;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.blend-wave.active {
  border-color: var(--secondary);
  background: rgba(0, 230, 118, 0.1);
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 230, 118, 0.3);
}

.blend-symbol {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--secondary);
  background: rgba(0, 230, 118, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  min-width: 80px;
  text-align: center;
}

.blend-play-btn {
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blend-play-btn:hover:not(:disabled) {
  background: #00C853;
  transform: scale(1.1);
}

/* === 最終ブレンド === */
.final-blend {
  display: flex;
  justify-content: center;
}

.final-word {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: var(--surface);
  border: 3px solid #E0E0E0;
  border-radius: 20px;
  transition: all 0.5s ease;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.final-word.revealed {
  border-color: var(--accent);
  background: rgba(255, 64, 129, 0.05);
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(255, 64, 129, 0.2);
}

.word-symbol {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent);
  background: rgba(255, 64, 129, 0.1);
  padding: 1rem 2rem;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.wave-visualization.final {
  width: 200px;
  height: 40px;
  color: var(--accent);
}

.final-play-btn {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 64, 129, 0.3);
}

.final-play-btn:hover:not(:disabled) {
  background: #E91E63;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 64, 129, 0.4);
}

.final-play-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* === フェーズ制御 === */
.phase-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.phase-button, .complete-button {
  background: linear-gradient(135deg, var(--primary), var(--wave));
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(63, 81, 181, 0.3);
}

.phase-button:hover:not(:disabled), .complete-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(63, 81, 181, 0.4);
}

.phase-button:disabled, .complete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.complete-button {
  background: linear-gradient(135deg, var(--accent), #E91E63);
}

/* === 回答フェーズ === */
.answer-phase {
  background: rgba(255, 64, 129, 0.05);
  border: 2px solid var(--accent);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
}

.question-prompt {
  text-align: center;
  margin-bottom: 2rem;
}

.question-prompt h3 {
  font-size: 1.8rem;
  color: var(--accent);
  margin-bottom: 1rem;
}

.question-prompt p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
}

.review-button {
  background: var(--accent);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 64, 129, 0.3);
}

.review-button:hover:not(:disabled) {
  background: #E91E63;
  transform: translateY(-2px);
}

.answer-choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.choice-button {
  background: var(--surface);
  border: 3px solid #E0E0E0;
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.choice-button:hover:not(.disabled) {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(63, 81, 181, 0.2);
}

.choice-button.correct {
  border-color: var(--success);
  background: rgba(76, 175, 80, 0.1);
  animation: correct-pulse 0.6s ease;
}

.choice-button.incorrect {
  border-color: var(--error);
  background: rgba(255, 82, 82, 0.1);
  animation: incorrect-shake 0.5s ease;
}

@keyframes correct-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.choice-button.disabled {
  cursor: not-allowed;
}

.choice-text {
  flex-grow: 1;
}

.choice-play {
  background: var(--wave);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-play:hover {
  background: #1565C0;
  transform: scale(1.1);
}

/* === 結果表示 === */
.result-display {
  background: rgba(76, 175, 80, 0.05);
  border: 2px solid var(--success);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
}

.result-display .result-content.incorrect {
  border-color: var(--warning);
  background: rgba(255, 152, 0, 0.05);
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.result-icon {
  font-size: 4rem;
  animation: result-bounce 0.6s ease;
}

@keyframes result-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.result-message h3 {
  font-size: 1.8rem;
  color: var(--success);
  margin-bottom: 0.5rem;
}

.result-content.incorrect .result-message h3 {
  color: var(--warning);
}

.result-message p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
}

.word-breakdown {
  background: rgba(255,255,255,0.8);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #E0E0E0;
}

.breakdown-label {
  font-weight: bold;
  color: var(--primary);
  display: block;
  margin-bottom: 0.5rem;
}

.phonemes {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--accent);
}

.next-button {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* === モーダル === */
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
  animation: modal-fade-in 0.3s ease;
}

@keyframes modal-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--surface);
  border-radius: 25px;
  padding: 3rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modal-slide-up 0.4s ease;
}

@keyframes modal-slide-up {
  from { 
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.completion-celebration {
  text-align: center;
}

.celebration-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: celebration-bounce 1s ease infinite;
}

@keyframes celebration-bounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.completion-celebration h2 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.completion-celebration p {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 2rem;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: rgba(63, 81, 181, 0.1);
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid var(--primary);
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--primary), var(--wave));
  color: white;
  box-shadow: 0 4px 15px rgba(63, 81, 181, 0.3);
}

.action-button.secondary {
  background: #F5F5F5;
  color: var(--text);
  border: 2px solid #E0E0E0;
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-button.primary:hover {
  box-shadow: 0 6px 20px rgba(63, 81, 181, 0.4);
}

.action-button.secondary:hover {
  background: #EEEEEE;
  border-color: #BDBDBD;
}

/* === レスポンシブデザイン === */
@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .header-right {
    gap: 1rem;
  }

  .game-main {
    padding: 1rem;
  }

  .phoneme-sequence, .blend-sequence {
    flex-direction: column;
    align-items: center;
  }

  .answer-choices {
    grid-template-columns: 1fr;
  }

  .choice-button {
    font-size: 1.1rem;
  }

  .modal-content {
    padding: 2rem;
    margin: 1rem;
  }

  .final-stats {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .target {
    font-size: 1.5rem;
  }

  .phoneme-symbol, .blend-symbol {
    font-size: 1.2rem;
  }

  .word-symbol {
    font-size: 2rem;
  }

  .choice-button {
    padding: 1rem;
    font-size: 1rem;
  }

  .celebration-icon {
    font-size: 4rem;
  }

  .completion-celebration h2 {
    font-size: 2rem;
  }
}
</style>