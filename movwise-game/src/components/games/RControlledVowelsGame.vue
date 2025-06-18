<template>
  <div class="r-controlled-vowels-game">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="circus-tent">🎪</div>
          <h1 class="game-title">Magic Circus Tent</h1>
        </div>
        <div class="game-controls">
          <button 
            @click="toggleSettings" 
            class="settings-btn"
            :class="{ 'active': showSettings }"
          >
            ⚙️
          </button>
          <button @click="exitGame" class="exit-btn">❌</button>
        </div>
      </div>
      
      <!-- 進捗バー -->
      <div class="progress-container">
        <div class="progress-label">Progress: {{ Math.round(progressPercentage) }}%</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>
    </header>

    <!-- 設定パネル -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-content">
        <h3>⚙️ ゲーム設定</h3>
        <div class="setting-item">
          <label>🔊 音量:</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            v-model="volume"
            class="volume-slider"
          />
          <span>{{ Math.round(volume * 100) }}%</span>
        </div>
        <div class="setting-item">
          <label>⏱️ 制限時間:</label>
          <select v-model="timeLimit" class="time-selector">
            <option value="30">30秒</option>
            <option value="60">60秒</option>
            <option value="90">90秒</option>
            <option value="0">制限なし</option>
          </select>
        </div>
        <button @click="resetGame" class="reset-btn">🔄 ゲームリセット</button>
      </div>
    </div>

    <!-- メインゲームエリア -->
    <main class="game-main">
      <!-- サーカステント背景 -->
      <div class="circus-background">
        <div class="tent-stripes"></div>
        <div class="circus-flags">
          <span class="flag">🚩</span>
          <span class="flag">🏁</span>
          <span class="flag">🚩</span>
          <span class="flag">🏁</span>
        </div>
      </div>

      <!-- ゲーム状態に応じた表示 -->
      <div v-if="gameState === 'ready'" class="game-ready">
        <div class="welcome-circus">
          <h2>🎭 Amazing R-Magician へようこそ！</h2>
          <p>Rマジシャンが母音を魔法で変身させます。正しい音を当てましょう！</p>
          <div class="magic-preview">
            <div class="transformation-demo">
              <span class="before-magic">a</span>
              <span class="magic-wand">🪄</span>
              <span class="magic-sparkles">✨R MAGIC!✨</span>
              <span class="after-magic">ar</span>
            </div>
          </div>
          <button @click="startGame" class="start-btn">
            🎪 ショー開始！
          </button>
        </div>
      </div>

      <div v-else-if="gameState === 'playing'" class="game-playing">
        <!-- ステータス表示 -->
        <div class="game-status">
          <div class="status-item">
            <span class="status-icon">❤️</span>
            <span class="lives-display">
              <span 
                v-for="life in maxLives" 
                :key="life" 
                class="life-heart"
                :class="{ 'lost': life > lives }"
              >
                {{ life <= lives ? '❤️' : '💔' }}
              </span>
            </span>
          </div>
          <div class="status-item">
            <span class="status-icon">⭐</span>
            <span class="score-display">{{ score.toLocaleString() }}</span>
          </div>
          <div v-if="timeLimit > 0" class="status-item">
            <span class="status-icon">⏱️</span>
            <span class="timer-display" :class="{ 'warning': timeRemaining <= 10 }">
              {{ Math.ceil(timeRemaining) }}s
            </span>
          </div>
        </div>

        <!-- マジックショーエリア -->
        <div class="magic-show-area">
          <div class="magician-section">
            <div class="magician-character">🎩</div>
            <h3 class="magician-title">The Amazing R-Magician</h3>
          </div>

          <!-- 変身プロセス表示 -->
          <div class="transformation-stage">
            <div class="stage-title">🎭 Magic Transformation</div>
            
            <div class="transformation-process">
              <!-- 変身前 -->
              <div class="before-section">
                <div class="section-label">Before Magic:</div>
                <div class="vowel-box before-magic">
                  {{ currentQuestion.baseVowel }}
                </div>
              </div>

              <!-- 魔法エフェクト -->
              <div class="magic-effect" :class="{ 'animate': showMagicEffect }">
                <div class="magic-wand">🪄</div>
                <div class="magic-sparkles">
                  <span class="sparkle">✨</span>
                  <span class="sparkle">⭐</span>
                  <span class="sparkle">💫</span>
                </div>
                <div class="magic-text">R MAGIC!</div>
              </div>

              <!-- 変身後 -->
              <div class="after-section">
                <div class="section-label">After Magic:</div>
                <div class="vowel-box after-magic">
                  {{ currentQuestion.rControlled }}
                </div>
              </div>
            </div>
          </div>

          <!-- 問題文 -->
          <div class="question-section">
            <h3 class="question-text">
              What sound does "{{ currentQuestion.rControlled }}" make?
            </h3>
            
            <!-- 音声再生ボタン -->
            <button 
              @click="playQuestionAudio" 
              class="audio-btn"
              :class="{ 'playing': isPlayingAudio }"
              :disabled="isPlayingAudio"
            >
              🔊
            </button>
          </div>

          <!-- 選択肢 -->
          <div class="choices-section">
            <button
              v-for="(choice, index) in currentQuestion.choices"
              :key="index"
              @click="selectAnswer(choice)"
              class="choice-btn"
              :class="{ 
                'selected': selectedChoice === choice,
                'correct': showResult && choice === currentQuestion.correct,
                'incorrect': showResult && selectedChoice === choice && choice !== currentQuestion.correct
              }"
              :disabled="showResult"
            >
              {{ choice }}
            </button>
          </div>

          <!-- 例単語表示 -->
          <div class="example-words">
            <div class="examples-title">🎪 Example Words:</div>
            <div class="word-list">
              <span 
                v-for="word in currentQuestion.examples" 
                :key="word"
                class="example-word"
              >
                {{ word }}
              </span>
            </div>
          </div>
        </div>

        <!-- フィードバック表示 -->
        <div 
          v-if="showResult" 
          class="feedback-section"
          :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }"
        >
          <div class="feedback-content">
            <div class="feedback-icon">
              {{ isCorrect ? '🎉' : '😅' }}
            </div>
            <div class="feedback-message">
              {{ isCorrect ? 'Great Magic!' : 'Try Again!' }}
            </div>
            <div v-if="!isCorrect" class="correct-answer">
              Correct: {{ currentQuestion.correct }}
            </div>
          </div>
        </div>
      </div>

      <!-- ゲーム終了画面 -->
      <div v-else-if="gameState === 'finished'" class="game-finished">
        <div class="results-circus">
          <h2>🎊 Show is Over! 🎊</h2>
          <div class="final-performance">
            <div class="performance-icon">
              {{ finalRank.icon }}
            </div>
            <div class="performance-title">{{ finalRank.title }}</div>
            <div class="performance-message">{{ finalRank.message }}</div>
          </div>
          
          <div class="final-stats">
            <div class="stat-item">
              <span class="stat-label">最終スコア:</span>
              <span class="stat-value">{{ score.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正解率:</span>
              <span class="stat-value">{{ accuracyPercentage }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">習得パターン:</span>
              <span class="stat-value">{{ completedPatterns }}/{{ totalPatterns }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="restartGame" class="restart-btn">
              🔄 もう一度
            </button>
            <button @click="exitGame" class="exit-btn-final">
              🏠 ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- パーティクルエフェクト -->
    <div class="particles-container">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="particle"
        :class="particle.type"
        :style="particle.style"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'RControlledVowelsGame',
  emits: ['game-complete', 'exit-game'],
  
  setup(props, { emit }) {
    // ゲーム状態
    const gameState = ref('ready') // 'ready', 'playing', 'finished'
    const showSettings = ref(false)
    const showResult = ref(false)
    
    // ゲーム設定
    const volume = ref(0.7)
    const timeLimit = ref(60) // 秒
    const timeRemaining = ref(60)
    const gameTimer = ref(null)
    
    // ゲームデータ
    const score = ref(0)
    const lives = ref(3)
    const maxLives = ref(3)
    const currentQuestionIndex = ref(0)
    const correctAnswers = ref(0)
    const totalQuestions = ref(0)
    const selectedChoice = ref(null)
    const isCorrect = ref(false)
    const showMagicEffect = ref(false)
    const isPlayingAudio = ref(false)
    
    // パーティクルエフェクト
    const particles = ref([])
    const particleId = ref(0)

    // R制御母音の問題データ
    const rControlledPatterns = [
      {
        pattern: 'ar',
        baseVowel: 'a',
        rControlled: 'ar',
        sound: '/ɑr/',
        examples: ['car', 'star', 'park', 'dark', 'arm', 'farm']
      },
      {
        pattern: 'er',
        baseVowel: 'e',
        rControlled: 'er',
        sound: '/ər/',
        examples: ['her', 'fern', 'term', 'verb', 'clerk', 'stern']
      },
      {
        pattern: 'ir',
        baseVowel: 'i',
        rControlled: 'ir',
        sound: '/ər/',
        examples: ['bird', 'girl', 'shirt', 'first', 'third', 'whirl']
      },
      {
        pattern: 'or',
        baseVowel: 'o',
        rControlled: 'or',
        sound: '/ɔr/',
        examples: ['for', 'horn', 'corn', 'short', 'sport', 'storm']
      },
      {
        pattern: 'ur',
        baseVowel: 'u',
        rControlled: 'ur',
        sound: '/ər/',
        examples: ['hurt', 'turn', 'burn', 'purse', 'nurse', 'curve']
      }
    ]

    // 問題生成
    const generateQuestions = () => {
      const questions = []
      
      rControlledPatterns.forEach(pattern => {
        // 各パターンから2-3問作成
        for (let i = 0; i < 3; i++) {
          const otherSounds = rControlledPatterns
            .filter(p => p.pattern !== pattern.pattern)
            .map(p => p.sound)
            .slice(0, 2)
          
          const choices = [pattern.sound, ...otherSounds].sort(() => Math.random() - 0.5)
          
          questions.push({
            id: `${pattern.pattern}_${i}`,
            baseVowel: pattern.baseVowel,
            rControlled: pattern.rControlled,
            pattern: pattern.pattern,
            correct: pattern.sound,
            choices: choices,
            examples: pattern.examples.slice(0, 4)
          })
        }
      })
      
      return questions.sort(() => Math.random() - 0.5)
    }

    const questions = ref(generateQuestions())
    
    // 現在の問題
    const currentQuestion = computed(() => 
      questions.value[currentQuestionIndex.value] || questions.value[0]
    )
    
    // 進捗計算
    const progressPercentage = computed(() => 
      questions.value.length > 0 ? (currentQuestionIndex.value / questions.value.length) * 100 : 0
    )
    
    // 正解率計算
    const accuracyPercentage = computed(() => 
      totalQuestions.value > 0 ? Math.round((correctAnswers.value / totalQuestions.value) * 100) : 0
    )
    
    // 完了パターン数
    const completedPatterns = computed(() => {
      const patterns = new Set()
      questions.value.slice(0, currentQuestionIndex.value).forEach(q => {
        patterns.add(q.pattern)
      })
      return patterns.size
    })
    
    const totalPatterns = computed(() => rControlledPatterns.length)
    
    // 最終ランク計算
    const finalRank = computed(() => {
      const accuracy = accuracyPercentage.value
      if (accuracy >= 90) {
        return {
          icon: '👑',
          title: 'Magic Master!',
          message: 'Perfect R-controlled vowel mastery!'
        }
      } else if (accuracy >= 80) {
        return {
          icon: '🎭',
          title: 'Great Magician!',
          message: 'Excellent performance in the circus!'
        }
      } else if (accuracy >= 70) {
        return {
          icon: '🎪',
          title: 'Circus Performer!',
          message: 'Good job learning R-magic!'
        }
      } else {
        return {
          icon: '🎠',
          title: 'Magic Apprentice!',
          message: 'Keep practicing your R-magic!'
        }
      }
    })

    // 音声再生
    const playQuestionAudio = async () => {
      if (isPlayingAudio.value) return
      
      try {
        isPlayingAudio.value = true
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(currentQuestion.value.rControlled)
          utterance.rate = 0.8
          utterance.pitch = 1.0
          utterance.volume = volume.value
          
          utterance.onend = () => {
            isPlayingAudio.value = false
          }
          
          speechSynthesis.speak(utterance)
          
          // マジックエフェクト表示
          showMagicEffect.value = true
          setTimeout(() => {
            showMagicEffect.value = false
          }, 1000)
        }
      } catch (error) {
        console.error('Audio playback failed:', error)
        isPlayingAudio.value = false
      }
    }

    // 回答選択
    const selectAnswer = (choice) => {
      if (showResult.value) return
      
      selectedChoice.value = choice
      isCorrect.value = choice === currentQuestion.value.correct
      showResult.value = true
      totalQuestions.value++
      
      if (isCorrect.value) {
        correctAnswers.value++
        score.value += 100
        createParticles('success')
        playSuccessSound()
      } else {
        lives.value--
        createParticles('error')
        playErrorSound()
      }
      
      // 次の問題に進む
      setTimeout(() => {
        nextQuestion()
      }, 2000)
    }

    // 次の問題
    const nextQuestion = () => {
      if (lives.value <= 0) {
        endGame()
        return
      }
      
      if (currentQuestionIndex.value >= questions.value.length - 1) {
        endGame()
        return
      }
      
      currentQuestionIndex.value++
      selectedChoice.value = null
      showResult.value = false
    }

    // パーティクル作成
    const createParticles = (type) => {
      const count = type === 'success' ? 12 : 6
      
      for (let i = 0; i < count; i++) {
        const particle = {
          id: particleId.value++,
          type: type,
          style: {
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 0.5 + 's',
            animationDuration: (1 + Math.random()) + 's'
          }
        }
        
        particles.value.push(particle)
        
        // パーティクルを削除
        setTimeout(() => {
          const index = particles.value.findIndex(p => p.id === particle.id)
          if (index > -1) {
            particles.value.splice(index, 1)
          }
        }, 2000)
      }
    }

    // 音声フィードバック
    const playSuccessSound = () => {
      // 成功時の音声フィードバック（実装は環境に依存）
      console.log('Play success sound')
    }
    
    const playErrorSound = () => {
      // エラー時の音声フィードバック（実装は環境に依存）
      console.log('Play error sound')
    }

    // ゲーム制御
    const startGame = () => {
      gameState.value = 'playing'
      if (timeLimit.value > 0) {
        timeRemaining.value = timeLimit.value
        startTimer()
      }
    }
    
    const endGame = () => {
      gameState.value = 'finished'
      stopTimer()
      
      // ゲーム完了をemit
      emit('game-complete', {
        score: score.value,
        accuracy: accuracyPercentage.value,
        completedPatterns: completedPatterns.value,
        totalPatterns: totalPatterns.value
      })
    }
    
    const restartGame = () => {
      // ゲームリセット
      gameState.value = 'ready'
      score.value = 0
      lives.value = maxLives.value
      currentQuestionIndex.value = 0
      correctAnswers.value = 0
      totalQuestions.value = 0
      selectedChoice.value = null
      showResult.value = false
      showMagicEffect.value = false
      particles.value = []
      
      // 問題シャッフル
      questions.value = generateQuestions()
      
      stopTimer()
    }
    
    const resetGame = () => {
      restartGame()
      showSettings.value = false
    }
    
    const exitGame = () => {
      stopTimer()
      emit('exit-game')
    }
    
    // タイマー制御
    const startTimer = () => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
      }
      
      gameTimer.value = setInterval(() => {
        timeRemaining.value--
        
        if (timeRemaining.value <= 0) {
          endGame()
        }
      }, 1000)
    }
    
    const stopTimer = () => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
        gameTimer.value = null
      }
    }
    
    // 設定制御
    const toggleSettings = () => {
      showSettings.value = !showSettings.value
    }

    // タイムリミット変更時の処理
    watch(timeLimit, (newLimit) => {
      if (gameState.value === 'playing' && newLimit > 0) {
        timeRemaining.value = newLimit
        startTimer()
      } else if (newLimit === 0) {
        stopTimer()
      }
    })

    // クリーンアップ
    onUnmounted(() => {
      stopTimer()
    })

    return {
      // 状態
      gameState,
      showSettings,
      showResult,
      
      // 設定
      volume,
      timeLimit,
      timeRemaining,
      
      // ゲームデータ
      score,
      lives,
      maxLives,
      currentQuestion,
      selectedChoice,
      isCorrect,
      showMagicEffect,
      isPlayingAudio,
      particles,
      
      // 計算されたプロパティ
      progressPercentage,
      accuracyPercentage,
      completedPatterns,
      totalPatterns,
      finalRank,
      
      // メソッド
      startGame,
      selectAnswer,
      playQuestionAudio,
      restartGame,
      resetGame,
      exitGame,
      toggleSettings
    }
  }
}
</script>
/* R-Controlled Vowels Game Styles */
<style scoped>
/* ベースコンテナ */
.r-controlled-vowels-game {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #FFEBEE 0%, #FCE4EC 50%, #F3E5F5 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* ===== ヘッダーセクション ===== */
.game-header {
  background: linear-gradient(135deg, #D32F2F, #F44336);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 15px rgba(211, 47, 47, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.circus-tent {
  font-size: 2.5rem;
  animation: tent-sway 3s ease-in-out infinite;
}

@keyframes tent-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-controls {
  display: flex;
  gap: 0.5rem;
}

.settings-btn,
.exit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.settings-btn:hover,
.exit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.settings-btn.active {
  background: rgba(255, 215, 0, 0.8);
  border-color: #FFD700;
}

/* 進捗バー */
.progress-container {
  margin-top: 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.progress-label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD600, #FFA000, #FF6F00);
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-fill::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ===== 設定パネル ===== */
.settings-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #D32F2F;
  border-radius: 15px;
  padding: 2rem;
  margin: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 50;
}

.settings-content h3 {
  margin: 0 0 1.5rem 0;
  color: #D32F2F;
  font-size: 1.5rem;
  text-align: center;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
}

.setting-item label {
  font-weight: bold;
  min-width: 100px;
  color: #1A1A1A;
}

.volume-slider,
.time-selector {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #FFD600;
  border-radius: 8px;
  background: white;
}

.reset-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 87, 34, 0.4);
}

/* ===== メインゲームエリア ===== */
.game-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  min-height: calc(100vh - 200px);
}

/* サーカス背景 */
.circus-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.tent-stripes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: repeating-linear-gradient(
    90deg,
    #1976D2 0px,
    #1976D2 20px,
    #FFFFFF 20px,
    #FFFFFF 40px
  );
  opacity: 0.1;
}

.circus-flags {
  position: absolute;
  top: 150px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  font-size: 2rem;
  animation: flags-wave 4s ease-in-out infinite;
}

@keyframes flags-wave {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.flag {
  animation: flag-flutter 2s ease-in-out infinite;
}

.flag:nth-child(2) { animation-delay: 0.5s; }
.flag:nth-child(3) { animation-delay: 1s; }
.flag:nth-child(4) { animation-delay: 1.5s; }

@keyframes flag-flutter {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

/* ===== ゲーム準備画面 ===== */
.game-ready {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 3px solid #D32F2F;
}

.welcome-circus h2 {
  color: #D32F2F;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-circus p {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.magic-preview {
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, #7B1FA2, #E040FB);
  border-radius: 20px;
  color: white;
}

.transformation-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.before-magic,
.after-magic {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  min-width: 60px;
  text-align: center;
}

.magic-wand {
  font-size: 2rem;
  animation: wand-wave 2s ease-in-out infinite;
}

@keyframes wand-wave {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
}

.magic-sparkles {
  color: #FFD600;
  font-weight: bold;
  text-shadow: 0 0 10px #FFD600;
  animation: sparkle-glow 1.5s ease-in-out infinite alternate;
}

@keyframes sparkle-glow {
  0% { text-shadow: 0 0 5px #FFD600; }
  100% { text-shadow: 0 0 20px #FFD600, 0 0 30px #FFD600; }
}

.start-btn {
  background: linear-gradient(135deg, #D32F2F, #F44336);
  color: white;
  border: none;
  padding: 1.5rem 3rem;
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(211, 47, 47, 0.3);
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.5);
  background: linear-gradient(135deg, #C62828, #D32F2F);
}

/* ===== ゲームプレイ画面 ===== */
.game-playing {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 3px solid #D32F2F;
}

/* ステータス表示 */
.game-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #FFD600, #FFA000);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(255, 214, 0, 0.3);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: #1A1A1A;
}

.status-icon {
  font-size: 1.5rem;
}

.lives-display {
  display: flex;
  gap: 0.2rem;
}

.life-heart {
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.life-heart.lost {
  opacity: 0.3;
  transform: scale(0.8);
}

.score-display {
  font-size: 1.3rem;
  color: #D32F2F;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.timer-display {
  font-size: 1.2rem;
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.timer-display.warning {
  background: #FF5252;
  color: white;
  animation: timer-pulse 1s ease-in-out infinite;
}

@keyframes timer-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* マジックショーエリア */
.magic-show-area {
  text-align: center;
}

.magician-section {
  margin-bottom: 2rem;
}

.magician-character {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  animation: magician-bow 3s ease-in-out infinite;
}

@keyframes magician-bow {
  0%, 90%, 100% { transform: rotate(0deg); }
  45% { transform: rotate(15deg); }
}

.magician-title {
  color: #7B1FA2;
  font-size: 1.5rem;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 変身ステージ */
.transformation-stage {
  background: linear-gradient(135deg, #E040FB, #7B1FA2);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  position: relative;
  overflow: hidden;
}

.transformation-stage::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
  animation: stage-spotlight 8s linear infinite;
}

@keyframes stage-spotlight {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stage-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.transformation-process {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.before-section,
.after-section {
  flex: 1;
}

.section-label {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.vowel-box {
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 2rem;
  font-weight: bold;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.vowel-box.before-magic {
  animation: vowel-pulse 2s ease-in-out infinite;
}

.vowel-box.after-magic {
  background: rgba(255, 215, 0, 0.3);
  border-color: #FFD600;
  color: #FFD600;
  text-shadow: 0 0 10px #FFD600;
}

@keyframes vowel-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* マジックエフェクト */
.magic-effect {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.magic-effect.animate .magic-wand {
  animation: wand-cast 1s ease-in-out;
}

.magic-effect.animate .magic-sparkles {
  animation: sparkles-burst 1s ease-in-out;
}

.magic-effect.animate .magic-text {
  animation: magic-text-glow 1s ease-in-out;
}

@keyframes wand-cast {
  0% { transform: rotate(-30deg) scale(1); }
  50% { transform: rotate(30deg) scale(1.2); }
  100% { transform: rotate(0deg) scale(1); }
}

@keyframes sparkles-burst {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes magic-text-glow {
  0% { text-shadow: 0 0 5px #FFD600; }
  50% { text-shadow: 0 0 25px #FFD600, 0 0 35px #FFD600; }
  100% { text-shadow: 0 0 10px #FFD600; }
}

.magic-wand {
  font-size: 2.5rem;
}

.magic-sparkles {
  display: flex;
  gap: 0.5rem;
  font-size: 1.5rem;
}

.sparkle {
  animation: sparkle-twinkle 1.5s ease-in-out infinite;
}

.sparkle:nth-child(2) { animation-delay: 0.3s; }
.sparkle:nth-child(3) { animation-delay: 0.6s; }

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.magic-text {
  font-weight: bold;
  color: #FFD600;
  text-shadow: 0 0 10px #FFD600;
}

/* 問題セクション */
.question-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #FFEBEE, #FCE4EC);
  border-radius: 15px;
  border: 2px solid #D32F2F;
}

.question-text {
  color: #D32F2F;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.audio-btn {
  background: linear-gradient(135deg, #2196F3, #21CBF3);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
  position: relative;
}

.audio-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.6);
}

.audio-btn:active {
  transform: scale(0.95);
}

.audio-btn.playing {
  animation: audio-pulse 1s infinite ease-in-out;
}

.audio-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes audio-pulse {
  0%, 100% { box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4); }
  50% { box-shadow: 0 4px 25px rgba(33, 150, 243, 0.8); }
}

/* 選択肢セクション */
.choices-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.choice-btn {
  background: linear-gradient(135deg, #FFFFFF, #F5F5F5);
  border: 3px solid #D32F2F;
  border-radius: 15px;
  padding: 1.5rem 2rem;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #D32F2F;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.choice-btn:hover {
  background: linear-gradient(135deg, #FFD600, #FFA000);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 214, 0, 0.3);
  color: #1A1A1A;
}

.choice-btn.selected {
  background: linear-gradient(135deg, #FFD600, #FFA000);
  color: #1A1A1A;
}

.choice-btn.correct {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white;
  animation: correct-celebration 0.6s ease-in-out;
  border-color: #2E7D32;
}

.choice-btn.incorrect {
  background: linear-gradient(135deg, #FF5252, #FF8A80);
  color: white;
  animation: incorrect-shake 0.5s ease-in-out;
  border-color: #C62828;
}

.choice-btn:disabled {
  cursor: not-allowed;
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

/* 例単語表示 */
.example-words {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 15px;
  border: 2px solid #FFD600;
}

.examples-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #D32F2F;
  margin-bottom: 1rem;
  text-align: center;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.example-word {
  background: linear-gradient(135deg, #FFD600, #FFA000);
  color: #1A1A1A;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(255, 214, 0, 0.3);
  animation: word-float 3s ease-in-out infinite;
}

.example-word:nth-child(2) { animation-delay: 0.5s; }
.example-word:nth-child(3) { animation-delay: 1s; }
.example-word:nth-child(4) { animation-delay: 1.5s; }

@keyframes word-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

/* フィードバックセクション */
.feedback-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 3px solid;
  min-width: 300px;
}

.feedback-section.correct {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1));
}

.feedback-section.incorrect {
  border-color: #FF5252;
  background: linear-gradient(135deg, rgba(255, 82, 82, 0.1), rgba(255, 138, 128, 0.1));
}

.feedback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.feedback-icon {
  font-size: 4rem;
  animation: feedback-bounce 0.6s ease-in-out;
}

@keyframes feedback-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.feedback-message {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.correct-answer {
  font-size: 1.2rem;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 10px;
}

/* ===== ゲーム終了画面 ===== */
.game-finished {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 3px solid #D32F2F;
}

.results-circus h2 {
  color: #D32F2F;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.final-performance {
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, #7B1FA2, #E040FB);
  border-radius: 20px;
  color: white;
}

.performance-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: performance-celebrate 2s ease-in-out infinite;
}

@keyframes performance-celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(5deg); }
  50% { transform: scale(1.05) rotate(-3deg); }
  75% { transform: scale(1.1) rotate(3deg); }
}

.performance-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.performance-message {
  font-size: 1.2rem;
  opacity: 0.9;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-item {
  background: linear-gradient(135deg, #FFD600, #FFA000);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(255, 214, 0, 0.3);
}

.stat-label {
  display: block;
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #D32F2F;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.restart-btn,
.exit-btn-final {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.restart-btn {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
}

.exit-btn-final {
  background: linear-gradient(135deg, #607D8B, #90A4AE);
  color: white;
  box-shadow: 0 4px 15px rgba(96, 125, 139, 0.3);
}

.exit-btn-final:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(96, 125, 139, 0.5);
}

/* ===== パーティクルエフェクト ===== */
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 500;
}

.particle {
  position: absolute;
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.particle.success {
  background: #FFD700;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: particle-success 2s ease-out forwards;
}

.particle.error {
  background: #FF5252;
  border-radius: 50%;
  animation: particle-error 1s ease-out forwards;
}

@keyframes particle-success {
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

@keyframes particle-error {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

/* ===== レスポンシブデザイン ===== */
@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .game-title {
    font-size: 1.5rem;
  }
  
  .game-main {
    padding: 1rem;
  }
  
  .transformation-process {
    flex-direction: column;
    gap: 1rem;
  }
  
  .choices-section {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .choice-btn {
    font-size: 1.1rem;
    padding: 1rem;
    min-height: 60px;
  }
  
  .game-status {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .restart-btn,
  .exit-btn-final {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .welcome-circus h2 {
    font-size: 2rem;
  }
  
  .results-circus h2 {
    font-size: 2rem;
  }
  
  .transformation-demo {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .vowel-box {
    font-size: 1.5rem;
    padding: 0.8rem 1rem;
  }
  
  .choice-btn {
    font-size: 1rem;
    padding: 0.8rem;
  }
  
  .feedback-section {
    width: 90%;
    padding: 1.5rem;
  }
}

/* ===== アニメーション最適化 ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== アクセシビリティ ===== */
.choice-btn:focus,
.audio-btn:focus,
.start-btn:focus,
.restart-btn:focus,
.exit-btn-final:focus {
  outline: 3px solid #FFD700;
  outline-offset: 3px;
}

/* ===== ダークモード対応 ===== */
@media (prefers-color-scheme: dark) {
  .r-controlled-vowels-game {
    background: linear-gradient(135deg, #1A1A1A 0%, #2D1B69 50%, #1A237E 100%);
  }
  
  .game-playing,
  .game-ready,
  .game-finished {
    background: rgba(30, 30, 30, 0.95);
    color: white;
  }
  
  .question-section {
    background: linear-gradient(135deg, #333, #444);
  }
  
  .question-text {
    color: #FFD600;
  }
}
</style>