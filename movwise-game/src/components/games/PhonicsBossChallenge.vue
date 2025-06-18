<template>
  <div class="phonics-boss-challenge">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="boss-title">
        <h1 class="title-text">
          ⚔️ Final Boss Battle
          <span class="crown">👑</span>
        </h1>
      </div>
      <div class="battle-stats">
        <div class="player-info">
          <div class="player-hp">
            <span class="hp-label">🛡️ Player HP:</span>
            <div class="hp-bar">
              <div 
                class="hp-fill player-hp-fill"
                :style="{ width: `${playerHpPercentage}%` }"
              ></div>
            </div>
            <span class="hp-numbers">{{ playerHp }}/{{ maxPlayerHp }}</span>
          </div>
          <div class="player-score">
            <span class="score-icon">⭐</span>
            <span class="score-text">Score: {{ totalScore.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ボスエリア -->
    <div class="boss-area">
      <div class="boss-container">
        <!-- ボスキャラクター -->
        <div 
          class="boss-character"
          :class="{ 
            'boss-damaged': bossDamaged,
            'boss-attacking': bossAttacking,
            'boss-defeated': bossHp <= 0
          }"
        >
          <div class="boss-sprite">👹</div>
          <div class="boss-name">PHONICS DEMON LORD</div>
          
          <!-- ボスHP -->
          <div class="boss-hp-container">
            <div class="boss-hp-bar">
              <div 
                class="hp-fill boss-hp-fill"
                :style="{ width: `${bossHpPercentage}%` }"
              ></div>
            </div>
            <div class="boss-hp-text">
              HP: {{ bossHp }}/{{ maxBossHp }}
            </div>
          </div>
        </div>

        <!-- ボスの台詞 -->
        <div class="boss-speech" v-if="bossMessage">
          <div class="speech-bubble">
            💬 {{ bossMessage }}
          </div>
        </div>
      </div>

      <!-- バトルエフェクト -->
      <div class="battle-effects">
        <div 
          v-for="effect in battleEffects" 
          :key="effect.id"
          class="battle-effect"
          :class="effect.type"
          :style="{ 
            left: effect.x + '%', 
            top: effect.y + '%',
            animationDelay: effect.delay + 's'
          }"
        >
          {{ effect.symbol }}
        </div>
      </div>
    </div>

    <!-- チャレンジエリア -->
    <div class="challenge-area">
      <div class="challenge-info">
        <div class="challenge-phase">
          🏰 Phase {{ currentPhase }}/{{ totalPhases }}: {{ phaseNames[currentPhase - 1] }}
        </div>
        <div class="challenge-description">
          {{ currentChallenge.description }}
        </div>
      </div>

      <!-- 問題表示 -->
      <div class="question-container">
        <div class="question-text">
          {{ currentChallenge.question }}
        </div>
        
        <!-- 音声再生ボタン（音声問題の場合） -->
        <button 
          v-if="currentChallenge.audio"
          class="audio-button"
          :class="{ playing: isPlaying }"
          @click="playAudio"
          :disabled="audioLoading"
        >
          <span v-if="audioLoading">⏳</span>
          <span v-else>🔊</span>
        </button>

        <!-- 視覚的な問題表示（パターン認識など） -->
        <div v-if="currentChallenge.visualPattern" class="visual-pattern">
          <div class="pattern-display">
            <span 
              v-for="(item, index) in currentChallenge.visualPattern" 
              :key="index"
              class="pattern-item"
              :class="{ 'pattern-blank': item === '?' }"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>

      <!-- 選択肢 -->
      <div class="choices-container">
        <button
          v-for="(choice, index) in currentChallenge.choices"
          :key="index"
          class="choice-button"
          :class="{ 
            'choice-selected': selectedChoice === index,
            'choice-correct': showResult && index === correctAnswer,
            'choice-incorrect': showResult && selectedChoice === index && index !== correctAnswer,
            'choice-disabled': showResult || gameOver
          }"
          @click="selectChoice(index)"
          :disabled="showResult || gameOver"
        >
          <!-- 武器アイコン -->
          <div class="weapon-icon">
            {{ weaponIcons[index % weaponIcons.length] }}
          </div>
          <div class="choice-text">
            {{ choice }}
          </div>
          
          <!-- 攻撃エフェクト -->
          <div 
            v-if="selectedChoice === index && showResult && index === correctAnswer"
            class="attack-effect"
          >
            ⚡💥⚡
          </div>
        </button>
      </div>

      <!-- フィードバック -->
      <div v-if="showResult" class="feedback-container">
        <div 
          class="feedback-message"
          :class="{ 
            'feedback-correct': selectedChoice === correctAnswer,
            'feedback-incorrect': selectedChoice !== correctAnswer
          }"
        >
          <div class="feedback-icon">
            {{ selectedChoice === correctAnswer ? '🎉' : '💔' }}
          </div>
          <div class="feedback-text">
            {{ feedbackMessage }}
          </div>
          <div v-if="selectedChoice === correctAnswer" class="damage-display">
            Boss takes {{ attackDamage }} damage! ⚔️
          </div>
          <div v-else class="damage-display">
            You take {{ bossAttackDamage }} damage! 🩸
          </div>
        </div>
      </div>

      <!-- 次へボタン -->
      <div class="action-buttons">
        <button
          v-if="showResult && !gameOver"
          class="next-button"
          @click="nextChallenge"
        >
          {{ bossHp <= 0 ? '🎊 Victory!' : '⚔️ Continue Battle' }}
        </button>
        
        <button
          v-if="gameOver"
          class="restart-button"
          @click="restartGame"
        >
          {{ bossHp <= 0 ? '🏆 Play Again' : '🔄 Try Again' }}
        </button>
      </div>
    </div>

    <!-- 勝利モーダル -->
    <div v-if="gameWon" class="modal-backdrop victory-modal">
      <div class="modal-content victory-content">
        <div class="victory-header">
          <h2>🏆 VICTORY! 🏆</h2>
          <div class="victory-subtitle">
            You have defeated the Phonics Demon Lord!
          </div>
        </div>
        
        <div class="victory-stats">
          <div class="stat-item">
            <span class="stat-label">Final Score:</span>
            <span class="stat-value">{{ totalScore.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Accuracy:</span>
            <span class="stat-value">{{ Math.round(accuracy) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Time:</span>
            <span class="stat-value">{{ formatTime(gameTime) }}</span>
          </div>
        </div>

        <div class="victory-rewards">
          <h3>🎁 Rewards Earned:</h3>
          <div class="reward-items">
            <div class="reward-item">🥇 Phonics Master Certificate</div>
            <div class="reward-item">⭐ {{ bonusPoints }} Bonus Points</div>
            <div class="reward-item">👑 Boss Slayer Title</div>
          </div>
        </div>

        <div class="victory-actions">
          <button class="victory-button" @click="playAgain">
            🔄 Challenge Again
          </button>
          <button class="victory-button secondary" @click="returnToMenu">
            🏠 Return to Menu
          </button>
        </div>
      </div>
    </div>

    <!-- 敗北モーダル -->
    <div v-if="gameOver && !gameWon" class="modal-backdrop defeat-modal">
      <div class="modal-content defeat-content">
        <div class="defeat-header">
          <h2>💀 DEFEAT 💀</h2>
          <div class="defeat-subtitle">
            The Phonics Demon Lord has won this battle...
          </div>
        </div>
        
        <div class="defeat-message">
          <p>Don't give up! Practice more and return stronger!</p>
          <div class="encouragement">
            💪 "Every master was once a beginner" 💪
          </div>
        </div>

        <div class="defeat-stats">
          <div class="stat-item">
            <span class="stat-label">Score Reached:</span>
            <span class="stat-value">{{ totalScore.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Phase Reached:</span>
            <span class="stat-value">{{ currentPhase }}/{{ totalPhases }}</span>
          </div>
        </div>

        <div class="defeat-actions">
          <button class="defeat-button" @click="restartGame">
            🔥 Try Again
          </button>
          <button class="defeat-button secondary" @click="returnToMenu">
            📚 Practice More
          </button>
        </div>
      </div>
    </div>

    <!-- パーティクルエフェクト -->
    <div class="particle-container">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="particle"
        :class="particle.type"
        :style="{ 
          left: particle.x + 'px', 
          top: particle.y + 'px',
          animationDelay: particle.delay + 's',
          animationDuration: particle.duration + 's'
        }"
      >
        {{ particle.symbol }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ゲーム状態
const currentPhase = ref(1)
const totalPhases = 5
const bossHp = ref(1000)
const maxBossHp = 1000
const playerHp = ref(100)
const maxPlayerHp = 100
const totalScore = ref(0)
const gameTime = ref(0)
const gameTimer = ref(null)

// UI状態
const selectedChoice = ref(null)
const showResult = ref(false)
const gameOver = ref(false)
const gameWon = ref(false)
const bossDamaged = ref(false)
const bossAttacking = ref(false)
const isPlaying = ref(false)
const audioLoading = ref(false)

// エフェクト
const battleEffects = ref([])
const particles = ref([])
const bossMessage = ref("Face me, if you dare! 😈")

// ゲームデータ
const phaseNames = [
  'Silent Letters',
  'Digraph Mastery', 
  'R-Controlled Vowels',
  'Advanced Patterns',
  'Ultimate Challenge'
]

const weaponIcons = ['🗡️', '⚡', '🔥', '❄️', '⭐', '💎']

const attackDamage = 200
const bossAttackDamage = 20

// 現在のチャレンジ
const currentChallenge = ref({})
const correctAnswer = ref(0)
const feedbackMessage = ref('')

// 計算プロパティ
const bossHpPercentage = computed(() => (bossHp.value / maxBossHp) * 100)
const playerHpPercentage = computed(() => (playerHp.value / maxPlayerHp) * 100)
const accuracy = computed(() => {
  if (totalChallenges.value === 0) return 100
  return (correctAnswers.value / totalChallenges.value) * 100
})

// 統計
const totalChallenges = ref(0)
const correctAnswers = ref(0)
const bonusPoints = computed(() => Math.floor(totalScore.value * 0.1))

// チャレンジデータベース
const challenges = {
  1: [ // Silent Letters
    {
      description: "Find the silent letter in each word",
      question: "Which letter is silent in 'knight'?",
      choices: ['k', 'n', 'i', 'g'],
      correct: 0,
      explanation: "The 'k' in 'knight' is silent"
    },
    {
      description: "Identify the silent consonant", 
      question: "Which letter is silent in 'lamb'?",
      choices: ['l', 'a', 'm', 'b'],
      correct: 3,
      explanation: "The 'b' in 'lamb' is silent"
    },
    {
      description: "Spot the silent letter",
      question: "Which letter is silent in 'write'?",
      choices: ['w', 'r', 'i', 't'],
      correct: 0,
      explanation: "The 'w' in 'write' is silent"
    }
  ],
  2: [ // Digraph Mastery
    {
      description: "Master the digraph sounds",
      question: "What sound does 'ch' make in 'chair'?",
      choices: ['/ʧ/', '/k/', '/ʃ/', '/s/'],
      correct: 0,
      explanation: "'ch' makes the /ʧ/ sound in 'chair'"
    },
    {
      description: "Identify the digraph sound",
      question: "What sound does 'ph' make in 'phone'?",
      choices: ['/p/', '/f/', '/θ/', '/ð/'],
      correct: 1,
      explanation: "'ph' makes the /f/ sound in 'phone'"
    },
    {
      description: "Distinguish digraph sounds",
      question: "What sound does 'th' make in 'think'?",
      choices: ['/θ/', '/ð/', '/t/', '/h/'],
      correct: 0,
      explanation: "'th' makes the /θ/ sound in 'think'"
    }
  ],
  3: [ // R-Controlled Vowels
    {
      description: "Master R-controlled vowel sounds",
      question: "What sound does 'ar' make in 'car'?",
      choices: ['/ɑr/', '/ɛr/', '/ɔr/', '/ər/'],
      correct: 0,
      explanation: "'ar' makes the /ɑr/ sound in 'car'"
    },
    {
      description: "Identify R-controlled patterns",
      question: "What sound does 'er' make in 'her'?",
      choices: ['/ɑr/', '/ɛr/', '/ɔr/', '/ər/'],
      correct: 3,
      explanation: "'er' makes the /ər/ sound in 'her'"
    },
    {
      description: "Recognize R-controlled variations",
      question: "What sound does 'or' make in 'for'?",
      choices: ['/ɑr/', '/ɛr/', '/ɔr/', '/ər/'],
      correct: 2,
      explanation: "'or' makes the /ɔr/ sound in 'for'"
    }
  ],
  4: [ // Advanced Patterns
    {
      description: "Complex phoneme combinations",
      question: "Complete the pattern: /str/ + /ɒŋ/ = ?",
      visualPattern: ['/str/', '+', '/ɒŋ/', '=', '?'],
      choices: ['strong', 'string', 'strange', 'stroke'],
      correct: 0,
      explanation: "/str/ + /ɒŋ/ = strong"
    },
    {
      description: "Advanced blending challenge",
      question: "Which word contains the /aɪ/ diphthong?",
      choices: ['height', 'weight', 'eight', 'freight'],
      correct: 0,
      explanation: "'height' contains the /aɪ/ diphthong"
    },
    {
      description: "Stress pattern recognition",
      question: "Where is the stress in 'photography'?",
      choices: ['PHO-to-gra-phy', 'pho-TO-gra-phy', 'pho-to-GRA-phy', 'pho-to-gra-PHY'],
      correct: 1,
      explanation: "The stress is on 'TO': pho-TO-gra-phy"
    }
  ],
  5: [ // Ultimate Challenge
    {
      description: "The ultimate phonics test",
      question: "Which phonetic transcription matches 'rough'?",
      choices: ['/rʌf/', '/roʊf/', '/ruːf/', '/rɒf/'],
      correct: 0,
      explanation: "'rough' is transcribed as /rʌf/"
    },
    {
      description: "Master-level sound analysis",
      question: "How many phonemes are in 'strength'?",
      choices: ['6', '7', '8', '9'],
      correct: 1,
      explanation: "'strength' has 7 phonemes: /s-t-r-e-ŋ-k-θ/"
    },
    {
      description: "Final boss challenge",
      question: "Complete: 'The quick brown fox jumps over the lazy dog' uses how many unique phonemes?",
      choices: ['35', '40', '44', '48'],
      correct: 2,
      explanation: "This pangram uses all 44 English phonemes"
    }
  ]
}

let challengeIndex = 0

// メソッド
const initializeGame = () => {
  currentPhase.value = 1
  challengeIndex = 0
  bossHp.value = maxBossHp
  playerHp.value = maxPlayerHp
  totalScore.value = 0
  gameTime.value = 0
  totalChallenges.value = 0
  correctAnswers.value = 0
  gameOver.value = false
  gameWon.value = false
  showResult.value = false
  selectedChoice.value = null
  
  loadNextChallenge()
  startGameTimer()
  setBossMessage("You dare challenge me? Prepare to face the ultimate test! 👹")
}

const loadNextChallenge = () => {
  const phaseChallenges = challenges[currentPhase.value]
  if (challengeIndex >= phaseChallenges.length) {
    if (currentPhase.value < totalPhases) {
      currentPhase.value++
      challengeIndex = 0
      setBossMessage(`Phase ${currentPhase.value}! You're stronger than I thought... 😠`)
    } else {
      // すべてのフェーズ完了
      if (bossHp.value <= 0) {
        victory()
      } else {
        loadNextChallenge()
      }
      return
    }
  }
  
  const challenge = challenges[currentPhase.value][challengeIndex]
  currentChallenge.value = { ...challenge }
  correctAnswer.value = challenge.correct
  
  showResult.value = false
  selectedChoice.value = null
}

const selectChoice = (index) => {
  if (showResult.value || gameOver.value) return
  
  selectedChoice.value = index
  totalChallenges.value++
  
  setTimeout(() => {
    checkAnswer()
  }, 500)
}

const checkAnswer = () => {
  showResult.value = true
  
  if (selectedChoice.value === correctAnswer.value) {
    // 正解
    correctAnswers.value++
    const scoreGain = 1000 * currentPhase.value
    totalScore.value += scoreGain
    
    feedbackMessage.value = `Excellent! ${currentChallenge.value.explanation}`
    
    // ボスにダメージ
    bossHp.value = Math.max(0, bossHp.value - attackDamage)
    bossDamaged.value = true
    createAttackEffect()
    
    // ボス敗北チェック
    if (bossHp.value <= 0) {
      setTimeout(() => {
        victory()
      }, 2000)
      return
    }
    
    setTimeout(() => {
      bossDamaged.value = false
    }, 1000)
    
  } else {
    // 不正解
    feedbackMessage.value = `Wrong! ${currentChallenge.value.explanation}`
    
    // プレイヤーにダメージ
    playerHp.value = Math.max(0, playerHp.value - bossAttackDamage)
    bossAttacking.value = true
    createBossAttackEffect()
    
    // プレイヤー敗北チェック
    if (playerHp.value <= 0) {
      setTimeout(() => {
        defeat()
      }, 2000)
      return
    }
    
    setTimeout(() => {
      bossAttacking.value = false
    }, 1000)
  }
}

const nextChallenge = () => {
  challengeIndex++
  loadNextChallenge()
}

const victory = () => {
  gameWon.value = true
  gameOver.value = true
  stopGameTimer()
  setBossMessage("Impossible! How did you...? 😵")
  createVictoryEffect()
}

const defeat = () => {
  gameOver.value = true
  stopGameTimer()
  setBossMessage("Hahaha! Better luck next time, weakling! 😈")
}

const restartGame = () => {
  initializeGame()
}

const playAgain = () => {
  gameWon.value = false
  initializeGame()
}

const returnToMenu = () => {
  // ゲームメニューに戻る処理
  console.log('Returning to main menu...')
}

const playAudio = () => {
  if (!currentChallenge.value.audio) return
  
  isPlaying.value = true
  audioLoading.value = true
  
  // Web Speech API を使用
  const utterance = new SpeechSynthesisUtterance(currentChallenge.value.audio)
  utterance.rate = 0.8
  utterance.pitch = 1
  
  utterance.onstart = () => {
    audioLoading.value = false
  }
  
  utterance.onend = () => {
    isPlaying.value = false
  }
  
  utterance.onerror = () => {
    isPlaying.value = false
    audioLoading.value = false
  }
  
  speechSynthesis.speak(utterance)
}

const setBossMessage = (message) => {
  bossMessage.value = message
  setTimeout(() => {
    bossMessage.value = ""
  }, 3000)
}

const startGameTimer = () => {
  gameTimer.value = setInterval(() => {
    gameTime.value++
  }, 1000)
}

const stopGameTimer = () => {
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

// エフェクト作成
const createAttackEffect = () => {
  for (let i = 0; i < 10; i++) {
    const effect = {
      id: Date.now() + i,
      type: 'attack-effect',
      symbol: ['⚡', '💥', '✨', '⭐'][Math.floor(Math.random() * 4)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      delay: Math.random() * 0.5
    }
    battleEffects.value.push(effect)
  }
  
  setTimeout(() => {
    battleEffects.value = []
  }, 2000)
}

const createBossAttackEffect = () => {
  for (let i = 0; i < 8; i++) {
    const effect = {
      id: Date.now() + i,
      type: 'boss-attack-effect',
      symbol: ['🔥', '💀', '⚡', '💥'][Math.floor(Math.random() * 4)],
      x: Math.random() * 60 + 20,
      y: Math.random() * 40 + 30,
      delay: Math.random() * 0.3
    }
    battleEffects.value.push(effect)
  }
  
  setTimeout(() => {
    battleEffects.value = []
  }, 1500)
}

const createVictoryEffect = () => {
  for (let i = 0; i < 20; i++) {
    const particle = {
      id: Date.now() + i,
      type: 'victory-particle',
      symbol: ['🎉', '🎊', '⭐', '✨', '🏆'][Math.floor(Math.random() * 5)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2
    }
    particles.value.push(particle)
  }
  
  setTimeout(() => {
    particles.value = []
  }, 5000)
}

// ライフサイクル
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  stopGameTimer()
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel()
  }
})
</script>
<style scoped>
/* ===== グローバル設定 ===== */
.phonics-boss-challenge {
  min-height: 100vh;
  background: linear-gradient(135deg, #1A1A1A 0%, #2D1B69 50%, #1A1A1A 100%);
  color: white;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
  padding: 1rem;
}

/* ===== ゲームヘッダー ===== */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(90deg, #B71C1C, #D32F2F);
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4);
  border: 2px solid #FFD700;
}

.boss-title {
  display: flex;
  align-items: center;
}

.title-text {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  background: linear-gradient(45deg, #FFD700, #FFA000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.crown {
  margin-left: 1rem;
  font-size: 3rem;
  animation: crown-glow 2s ease-in-out infinite alternate;
}

@keyframes crown-glow {
  0% { filter: drop-shadow(0 0 5px #FFD700); }
  100% { filter: drop-shadow(0 0 15px #FFD700); }
}

.battle-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.player-hp {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hp-label {
  font-size: 1.2rem;
  font-weight: bold;
}

.hp-bar {
  width: 200px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #FFD700;
}

.hp-fill {
  height: 100%;
  transition: width 0.5s ease-in-out;
  border-radius: 8px;
}

.player-hp-fill {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.hp-numbers {
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 80px;
  text-align: center;
}

.player-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: #1A1A1A;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.score-icon {
  font-size: 1.5rem;
  animation: score-sparkle 2s infinite ease-in-out;
}

@keyframes score-sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

/* ===== ボスエリア ===== */
.boss-area {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.boss-container {
  position: relative;
  z-index: 2;
}

.boss-character {
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.boss-character.boss-damaged {
  animation: boss-damage 0.5s ease-in-out;
  filter: hue-rotate(180deg);
}

.boss-character.boss-attacking {
  animation: boss-attack 0.8s ease-in-out;
  transform: scale(1.1);
}

.boss-character.boss-defeated {
  animation: boss-defeat 2s ease-in-out;
  opacity: 0.3;
  transform: scale(0.8);
}

@keyframes boss-damage {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px) scale(0.95); }
  75% { transform: translateX(10px) scale(0.95); }
}

@keyframes boss-attack {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2) rotateY(15deg); }
}

@keyframes boss-defeat {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.5; }
  100% { transform: scale(0.8) rotate(360deg); opacity: 0.3; }
}

.boss-sprite {
  font-size: 8rem;
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
  animation: boss-idle 3s ease-in-out infinite;
}

@keyframes boss-idle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.boss-name {
  font-size: 2rem;
  font-weight: bold;
  color: #FF5252;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  margin: 1rem 0;
  letter-spacing: 2px;
}

.boss-hp-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.boss-hp-bar {
  width: 400px;
  height: 30px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  overflow: hidden;
  border: 3px solid #FF5252;
  box-shadow: 0 0 20px rgba(255, 82, 82, 0.5);
}

.boss-hp-fill {
  background: linear-gradient(90deg, #FF5252, #FF8A80, #FF5252);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.3);
  animation: boss-hp-pulse 2s ease-in-out infinite;
}

@keyframes boss-hp-pulse {
  0%, 100% { box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.6); }
}

.boss-hp-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #FF5252;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.boss-speech {
  margin-top: 1rem;
}

.speech-bubble {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #FFD700;
  border-radius: 20px;
  padding: 1rem 2rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: #FFD700;
  position: relative;
  display: inline-block;
  animation: speech-appear 0.5s ease-out;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #FFD700;
}

@keyframes speech-appear {
  0% { opacity: 0; transform: scale(0.8) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* ===== バトルエフェクト ===== */
.battle-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.battle-effect {
  position: absolute;
  font-size: 3rem;
  font-weight: bold;
  pointer-events: none;
  z-index: 3;
}

.battle-effect.attack-effect {
  color: #FFD700;
  animation: attack-explosion 1.5s ease-out forwards;
}

.battle-effect.boss-attack-effect {
  color: #FF5252;
  animation: boss-attack-explosion 1.2s ease-out forwards;
}

@keyframes attack-explosion {
  0% {
    transform: scale(0.5) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.5) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(2) rotate(360deg);
    opacity: 0;
  }
}

@keyframes boss-attack-explosion {
  0% {
    transform: scale(0.3) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(-90deg);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.8) rotate(-180deg);
    opacity: 0;
  }
}

/* ===== チャレンジエリア ===== */
.challenge-area {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #9C27B0;
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(156, 39, 176, 0.3);
}

.challenge-info {
  text-align: center;
  margin-bottom: 2rem;
}

.challenge-phase {
  font-size: 1.8rem;
  font-weight: bold;
  color: #E040FB;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.challenge-description {
  font-size: 1.3rem;
  color: #B39DDB;
  margin-bottom: 1rem;
}

.question-container {
  text-align: center;
  margin-bottom: 2rem;
}

.question-text {
  font-size: 1.6rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.audio-button {
  background: linear-gradient(135deg, #2196F3, #21CBF3);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
  margin: 1rem;
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.6);
}

.audio-button:active {
  transform: scale(0.95);
}

.audio-button.playing {
  animation: audio-pulse 1s infinite ease-in-out;
}

@keyframes audio-pulse {
  0%, 100% { box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4); }
  50% { box-shadow: 0 4px 25px rgba(33, 150, 243, 0.8); }
}

.audio-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.visual-pattern {
  margin: 2rem 0;
}

.pattern-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.pattern-item {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #E040FB;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  font-size: 1.4rem;
  font-weight: bold;
  color: white;
  min-width: 60px;
  text-align: center;
}

.pattern-item.pattern-blank {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  color: #FFD700;
  animation: pattern-blank-glow 2s ease-in-out infinite;
}

@keyframes pattern-blank-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
}

/* ===== 選択肢 ===== */
.choices-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.choice-button {
  background: linear-gradient(135deg, #424242, #616161);
  border: 3px solid #9C27B0;
  border-radius: 15px;
  padding: 1.5rem;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.choice-button:hover:not(.choice-disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(156, 39, 176, 0.4);
  border-color: #E040FB;
}

.choice-button.choice-selected {
  border-color: #FFD700;
  background: linear-gradient(135deg, #795548, #8D6E63);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.choice-button.choice-correct {
  border-color: #4CAF50;
  background: linear-gradient(135deg, #388E3C, #4CAF50);
  animation: choice-correct 0.6s ease-in-out;
}

.choice-button.choice-incorrect {
  border-color: #FF5252;
  background: linear-gradient(135deg, #D32F2F, #FF5252);
  animation: choice-incorrect 0.5s ease-in-out;
}

.choice-button.choice-disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@keyframes choice-correct {
  0% { transform: scale(1); }
  50% { transform: scale(1.1) rotate(5deg); }
  100% { transform: scale(1); }
}

@keyframes choice-incorrect {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.weapon-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.choice-text {
  font-size: 1.1rem;
  text-align: center;
}

.attack-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  animation: attack-hit 1s ease-out;
}

@keyframes attack-hit {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
}

/* ===== フィードバック ===== */
.feedback-container {
  margin-bottom: 2rem;
}

.feedback-message {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid transparent;
  animation: feedback-appear 0.5s ease-out;
}

.feedback-message.feedback-correct {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.2));
}

.feedback-message.feedback-incorrect {
  border-color: #FF5252;
  background: linear-gradient(135deg, rgba(255, 82, 82, 0.2), rgba(255, 138, 128, 0.2));
}

@keyframes feedback-appear {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.feedback-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feedback-text {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
}

.damage-display {
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
}

.feedback-correct .damage-display {
  background: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

.feedback-incorrect .damage-display {
  background: rgba(255, 82, 82, 0.3);
  color: #FF5252;
}

/* ===== アクションボタン ===== */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.next-button, .restart-button {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  border: none;
  border-radius: 25px;
  padding: 1rem 2rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.next-button:hover, .restart-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.6);
}

.next-button:active, .restart-button:active {
  transform: translateY(-1px);
}

/* ===== モーダル ===== */
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
  animation: modal-backdrop-appear 0.3s ease-out;
}

@keyframes modal-backdrop-appear {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #1A1A1A, #2D1B69);
  border: 3px solid #FFD700;
  border-radius: 25px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  text-align: center;
  animation: modal-content-appear 0.5s ease-out;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

@keyframes modal-content-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ===== 勝利モーダル ===== */
.victory-modal .modal-content {
  border-color: #4CAF50;
  background: linear-gradient(135deg, #1B5E20, #2E7D32);
}

.victory-header h2 {
  font-size: 3rem;
  color: #FFD700;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  animation: victory-glow 2s ease-in-out infinite alternate;
}

@keyframes victory-glow {
  0% { text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5); }
  100% { text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.8); }
}

.victory-subtitle {
  font-size: 1.5rem;
  color: #81C784;
  margin-bottom: 2rem;
}

.victory-stats, .defeat-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
}

.stat-label {
  font-weight: bold;
  color: #B39DDB;
}

.stat-value {
  font-weight: bold;
  color: #FFD700;
  font-size: 1.3rem;
}

.victory-rewards {
  margin: 2rem 0;
}

.victory-rewards h3 {
  color: #FFD700;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.reward-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reward-item {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  padding: 0.8rem;
  font-size: 1.1rem;
  color: #FFD700;
}

.victory-actions, .defeat-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.victory-button, .defeat-button {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  border: none;
  border-radius: 25px;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.victory-button:hover, .defeat-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
}

.victory-button.secondary, .defeat-button.secondary {
  background: linear-gradient(135deg, #9E9E9E, #BDBDBD);
  box-shadow: 0 4px 15px rgba(158, 158, 158, 0.4);
}

.victory-button.secondary:hover, .defeat-button.secondary:hover {
  box-shadow: 0 6px 20px rgba(158, 158, 158, 0.6);
}

/* ===== 敗北モーダル ===== */
.defeat-modal .modal-content {
  border-color: #FF5252;
  background: linear-gradient(135deg, #5D1049, #B71C1C);
}

.defeat-header h2 {
  font-size: 3rem;
  color: #FF5252;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
}

.defeat-subtitle {
  font-size: 1.5rem;
  color: #FFAB91;
  margin-bottom: 2rem;
}

.defeat-message {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
}

.defeat-message p {
  font-size: 1.3rem;
  color: #FFCDD2;
  margin-bottom: 1rem;
}

.encouragement {
  font-size: 1.1rem;
  color: #FFD700;
  font-weight: bold;
}

/* ===== パーティクルエフェクト ===== */
.particle-container {
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
  font-size: 2rem;
  pointer-events: none;
}

.particle.victory-particle {
  animation: victory-particle-float linear forwards;
}

@keyframes victory-particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* ===== レスポンシブデザイン ===== */
@media (max-width: 1024px) {
  .title-text {
    font-size: 2rem;
  }
  
  .crown {
    font-size: 2.5rem;
  }
  
  .boss-sprite {
    font-size: 6rem;
  }
  
  .boss-hp-bar {
    width: 300px;
  }
  
  .choices-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .phonics-boss-challenge {
    padding: 0.5rem;
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .title-text {
    font-size: 1.8rem;
  }
  
  .boss-sprite {
    font-size: 5rem;
  }
  
  .boss-hp-bar {
    width: 250px;
    height: 25px;
  }
  
  .hp-bar {
    width: 150px;
    height: 18px;
  }
  
  .challenge-area {
    padding: 1rem;
  }
  
  .question-text {
    font-size: 1.3rem;
  }
  
  .choice-button {
    min-height: 80px;
    font-size: 1rem;
  }
  
  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .victory-actions, .defeat-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .title-text {
    font-size: 1.5rem;
  }
  
  .crown {
    font-size: 2rem;
  }
  
  .boss-sprite {
    font-size: 4rem;
  }
  
  .boss-name {
    font-size: 1.5rem;
  }
  
  .boss-hp-bar {
    width: 200px;
    height: 20px;
  }
  
  .hp-bar {
    width: 120px;
    height: 15px;
  }
  
  .challenge-phase {
    font-size: 1.4rem;
  }
  
  .question-text {
    font-size: 1.1rem;
  }
  
  .audio-button {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .choice-button {
    min-height: 70px;
    padding: 1rem;
  }
  
  .weapon-icon {
    font-size: 1.5rem;
  }
  
  .choice-text {
    font-size: 1rem;
  }
}
</style>