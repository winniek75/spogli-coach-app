<template>
  <div class="stress-pattern-game">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="header-left">
        <button class="back-button" @click="$emit('back')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="game-title">
          <span class="drum-icon">🥁</span>
          Stress Pattern Master
        </h1>
      </div>
      <div class="header-right">
        <button class="settings-button" @click="toggleSettings">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 進捗バー -->
    <div class="progress-section">
      <div class="progress-info">
        <span class="progress-text">Progress: {{ currentRound }}/{{ totalRounds }}</span>
        <span class="score-text">Score: {{ formatScore(score) }}</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- メインゲーム画面 -->
    <main class="game-main">
      <div v-if="gameState === 'playing'" class="game-area">
        <!-- ドラムスタジオ環境 -->
        <div class="drum-studio">
          <div class="studio-background">
            <div class="drum-kit">
              <div class="drum-piece hihat" :class="{ active: playingBeat }"></div>
              <div class="drum-piece snare" :class="{ active: playingBeat }"></div>
              <div class="drum-piece kick" :class="{ active: playingBeat }"></div>
              <div class="drum-piece crash" :class="{ active: playingBeat }"></div>
            </div>
            <div class="studio-lights">
              <div class="light" :class="{ on: playingBeat }" 
                   :style="{ animationDelay: '0s' }"></div>
              <div class="light" :class="{ on: playingBeat }" 
                   :style="{ animationDelay: '0.2s' }"></div>
              <div class="light" :class="{ on: playingBeat }" 
                   :style="{ animationDelay: '0.4s' }"></div>
            </div>
          </div>
        </div>

        <!-- 現在の単語とストレスパターン -->
        <div class="word-display">
          <div class="current-word">
            <h2 class="word-text">{{ currentWord.word }}</h2>
            <div class="word-meaning">{{ currentWord.meaning }}</div>
            
            <!-- 音声再生ボタン -->
            <button class="audio-button" @click="playWordAudio" :disabled="isPlayingAudio">
              <span v-if="!isPlayingAudio">🔊</span>
              <span v-else class="audio-spinner">🎵</span>
            </button>
          </div>

          <!-- ストレスパターン可視化 -->
          <div class="stress-visualization">
            <div class="beat-pattern">
              <div v-for="(syllable, index) in currentWord.syllables" 
                   :key="index"
                   class="syllable-beat"
                   :class="{ 
                     'stressed': syllable.stressed,
                     'playing': playingBeat && syllable.stressed 
                   }">
                <div class="beat-indicator"></div>
                <div class="syllable-text">{{ syllable.text }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- メトロノーム -->
        <div class="metronome-section">
          <div class="metronome" :class="{ active: metronomeActive }">
            <div class="metronome-arm" :class="{ swinging: metronomeActive }"></div>
            <div class="metronome-base"></div>
          </div>
          <div class="tempo-info">
            <span class="tempo-text">Tempo: {{ currentTempo }} BPM</span>
            <button class="tempo-button" @click="toggleMetronome">
              {{ metronomeActive ? 'Stop' : 'Start' }} Beat
            </button>
          </div>
        </div>

        <!-- 挑戦問題 -->
        <div class="challenge-section">
          <div class="challenge-text">
            Tap the <strong>stressed syllable</strong> in rhythm!
          </div>
          
          <!-- インタラクティブ音節ボタン -->
          <div class="syllable-buttons">
            <button v-for="(syllable, index) in currentWord.syllables"
                    :key="index"
                    class="syllable-button"
                    :class="{
                      'selected': selectedSyllable === index,
                      'correct': feedback && syllable.stressed && selectedSyllable === index,
                      'incorrect': feedback && !syllable.stressed && selectedSyllable === index,
                      'correct-answer': feedback && syllable.stressed
                    }"
                    @click="selectSyllable(index)"
                    :disabled="feedback">
              <div class="syllable-content">
                <div class="syllable-text">{{ syllable.text }}</div>
                <div class="stress-indicator" v-if="syllable.stressed">●</div>
                <div class="stress-indicator unstressed" v-else>○</div>
              </div>
            </button>
          </div>
        </div>

        <!-- フィードバック表示 -->
        <div v-if="feedback" class="feedback-section">
          <div class="feedback-content" :class="feedback.type">
            <div class="feedback-icon">
              {{ feedback.type === 'correct' ? '🎉' : '🎯' }}
            </div>
            <div class="feedback-text">
              <h3>{{ feedback.title }}</h3>
              <p>{{ feedback.message }}</p>
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="action-buttons">
          <button v-if="!feedback" class="submit-button" 
                  @click="submitAnswer" 
                  :disabled="selectedSyllable === null">
            Check Answer
          </button>
          <button v-else class="next-button" 
                  @click="nextRound">
            {{ currentRound >= totalRounds ? 'Finish Game' : 'Next Word' }}
          </button>
        </div>
      </div>

      <!-- ゲーム結果画面 -->
      <div v-else-if="gameState === 'finished'" class="results-screen">
        <div class="results-content">
          <div class="results-header">
            <h2 class="results-title">🏆 Rhythm Master Results!</h2>
            <div class="final-score">
              <span class="score-label">Final Score:</span>
              <span class="score-value">{{ formatScore(score) }}</span>
            </div>
          </div>

          <div class="performance-stats">
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value">{{ correctAnswers }}/{{ totalRounds }}</div>
                <div class="stat-label">Correct</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-value">{{ Math.round(accuracy) }}%</div>
                <div class="stat-label">Accuracy</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🥁</div>
              <div class="stat-content">
                <div class="stat-value">{{ averageResponseTime }}ms</div>
                <div class="stat-label">Avg. Speed</div>
              </div>
            </div>
          </div>

          <div class="performance-message">
            <h3>{{ getPerformanceMessage() }}</h3>
            <p>{{ getPerformanceAdvice() }}</p>
          </div>

          <div class="results-actions">
            <button class="play-again-button" @click="restartGame">
              🎮 Play Again
            </button>
            <button class="menu-button" @click="$emit('back')">
              📚 Back to Menu
            </button>
          </div>
        </div>
      </div>

      <!-- ローディング画面 -->
      <div v-else-if="gameState === 'loading'" class="loading-screen">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h3>Tuning the drums...</h3>
          <p>Getting ready for rhythm practice!</p>
        </div>
      </div>
    </main>

    <!-- 設定モーダル -->
    <div v-if="showSettings" class="modal-backdrop" @click="toggleSettings">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Game Settings</h3>
          <button class="close-button" @click="toggleSettings">×</button>
        </div>
        <div class="modal-body">
          <div class="setting-group">
            <label class="setting-label">Difficulty Level:</label>
            <select v-model="difficulty" class="setting-select">
              <option value="easy">Easy (2 syllables)</option>
              <option value="medium">Medium (2-3 syllables)</option>
              <option value="hard">Hard (3-4 syllables)</option>
            </select>
          </div>
          <div class="setting-group">
            <label class="setting-label">Metronome Tempo:</label>
            <input v-model="currentTempo" type="range" min="60" max="140" 
                   class="setting-range">
            <span class="tempo-display">{{ currentTempo }} BPM</span>
          </div>
          <div class="setting-group">
            <label class="setting-label">Sound Effects:</label>
            <label class="toggle-switch">
              <input v-model="soundEnabled" type="checkbox">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'StressPatternMasterGame',
  emits: ['back', 'complete'],
  setup(props, { emit }) {
    // ゲーム状態管理
    const gameState = ref('loading')
    const currentRound = ref(1)
    const totalRounds = ref(10)
    const score = ref(0)
    const correctAnswers = ref(0)
    const selectedSyllable = ref(null)
    const feedback = ref(null)
    const responseTimes = ref([])
    const questionStartTime = ref(null)

    // 設定関連
    const showSettings = ref(false)
    const difficulty = ref('medium')
    const currentTempo = ref(100)
    const soundEnabled = ref(true)
    const metronomeActive = ref(false)

    // 音声・アニメーション状態
    const isPlayingAudio = ref(false)
    const playingBeat = ref(false)
    const metronomeInterval = ref(null)

    // 単語データ（難易度別）
    const wordDatabase = ref({
      easy: [
        {
          word: 'apple',
          syllables: [
            { text: 'AP', stressed: true },
            { text: 'ple', stressed: false }
          ],
          meaning: 'a round fruit',
          phonetic: '/ˈæp.əl/'
        },
        {
          word: 'teacher',
          syllables: [
            { text: 'TEACH', stressed: true },
            { text: 'er', stressed: false }
          ],
          meaning: 'someone who teaches',
          phonetic: '/ˈtiː.tʃər/'
        },
        {
          word: 'present',
          syllables: [
            { text: 'PRE', stressed: true },
            { text: 'sent', stressed: false }
          ],
          meaning: 'a gift (noun)',
          phonetic: '/ˈprez.ənt/'
        },
        {
          word: 'record',
          syllables: [
            { text: 'REC', stressed: true },
            { text: 'ord', stressed: false }
          ],
          meaning: 'a music album (noun)',
          phonetic: '/ˈrek.ɔrd/'
        },
        {
          word: 'happy',
          syllables: [
            { text: 'HAP', stressed: true },
            { text: 'py', stressed: false }
          ],
          meaning: 'feeling joy',
          phonetic: '/ˈhæp.i/'
        }
      ],
      medium: [
        {
          word: 'computer',
          syllables: [
            { text: 'com', stressed: false },
            { text: 'PU', stressed: true },
            { text: 'ter', stressed: false }
          ],
          meaning: 'electronic device',
          phonetic: '/kəmˈpjuː.tər/'
        },
        {
          word: 'important',
          syllables: [
            { text: 'im', stressed: false },
            { text: 'POR', stressed: true },
            { text: 'tant', stressed: false }
          ],
          meaning: 'having great significance',
          phonetic: '/ɪmˈpɔr.tənt/'
        },
        {
          word: 'banana',
          syllables: [
            { text: 'ba', stressed: false },
            { text: 'NA', stressed: true },
            { text: 'na', stressed: false }
          ],
          meaning: 'yellow fruit',
          phonetic: '/bəˈnæn.ə/'
        },
        {
          word: 'photography',
          syllables: [
            { text: 'pho', stressed: false },
            { text: 'TOG', stressed: true },
            { text: 'ra', stressed: false },
            { text: 'phy', stressed: false }
          ],
          meaning: 'art of taking pictures',
          phonetic: '/fəˈtɑg.rə.fi/'
        }
      ],
      hard: [
        {
          word: 'university',
          syllables: [
            { text: 'u', stressed: false },
            { text: 'ni', stressed: false },
            { text: 'VER', stressed: true },
            { text: 'si', stressed: false },
            { text: 'ty', stressed: false }
          ],
          meaning: 'higher education institution',
          phonetic: '/ˌjuː.nɪˈvɜr.sɪ.ti/'
        },
        {
          word: 'information',
          syllables: [
            { text: 'in', stressed: false },
            { text: 'for', stressed: false },
            { text: 'MA', stressed: true },
            { text: 'tion', stressed: false }
          ],
          meaning: 'facts or knowledge',
          phonetic: '/ˌɪn.fərˈmeɪ.ʃən/'
        },
        {
          word: 'organization',
          syllables: [
            { text: 'or', stressed: false },
            { text: 'gan', stressed: false },
            { text: 'i', stressed: false },
            { text: 'ZA', stressed: true },
            { text: 'tion', stressed: false }
          ],
          meaning: 'structured group',
          phonetic: '/ˌɔr.gən.əˈzeɪ.ʃən/'
        }
      ]
    })

    const currentWord = ref(null)

    // 計算プロパティ
    const progressPercentage = computed(() => {
      return ((currentRound.value - 1) / totalRounds.value) * 100
    })

    const accuracy = computed(() => {
      return currentRound.value > 1 ? (correctAnswers.value / (currentRound.value - 1)) * 100 : 0
    })

    const averageResponseTime = computed(() => {
      if (responseTimes.value.length === 0) return 0
      const sum = responseTimes.value.reduce((a, b) => a + b, 0)
      return Math.round(sum / responseTimes.value.length)
    })

    // ゲーム初期化
    const initGame = async () => {
      gameState.value = 'loading'
      
      // ローディング演出
      setTimeout(() => {
        loadNextWord()
        gameState.value = 'playing'
        questionStartTime.value = Date.now()
      }, 2000)
    }

    // 次の単語を読み込み
    const loadNextWord = () => {
      const words = wordDatabase.value[difficulty.value]
      const randomIndex = Math.floor(Math.random() * words.length)
      currentWord.value = { ...words[randomIndex] }
      selectedSyllable.value = null
      feedback.value = null
    }

    // 音節選択
    const selectSyllable = (index) => {
      if (feedback.value) return
      selectedSyllable.value = index
    }

    // 答えの提出
    const submitAnswer = () => {
      if (selectedSyllable.value === null) return

      const responseTime = Date.now() - questionStartTime.value
      responseTimes.value.push(responseTime)

      const selectedSyllableData = currentWord.value.syllables[selectedSyllable.value]
      const isCorrect = selectedSyllableData.stressed

      if (isCorrect) {
        correctAnswers.value++
        score.value += calculateScore(responseTime)
        feedback.value = {
          type: 'correct',
          title: 'Perfect Rhythm! 🎉',
          message: `You found the stressed syllable! "${selectedSyllableData.text}" gets the emphasis.`
        }
        playSuccessSound()
      } else {
        const correctSyllable = currentWord.value.syllables.find(s => s.stressed)
        feedback.value = {
          type: 'incorrect',
          title: 'Keep Practicing! 🎯',
          message: `The stressed syllable is "${correctSyllable.text}". Listen to the rhythm!`
        }
        playErrorSound()
      }
    }

    // スコア計算
    const calculateScore = (responseTime) => {
      const baseScore = 100
      const timeBonus = Math.max(0, 50 - Math.floor(responseTime / 100))
      return baseScore + timeBonus
    }

    // 次のラウンド
    const nextRound = () => {
      if (currentRound.value >= totalRounds.value) {
        finishGame()
      } else {
        currentRound.value++
        loadNextWord()
        questionStartTime.value = Date.now()
      }
    }

    // ゲーム終了
    const finishGame = () => {
      gameState.value = 'finished'
      stopMetronome()
      emit('complete', {
        score: score.value,
        accuracy: accuracy.value,
        totalQuestions: totalRounds.value,
        correctAnswers: correctAnswers.value
      })
    }

    // ゲーム再開
    const restartGame = () => {
      currentRound.value = 1
      score.value = 0
      correctAnswers.value = 0
      responseTimes.value = []
      selectedSyllable.value = null
      feedback.value = null
      initGame()
    }

    // 音声再生
    const playWordAudio = async () => {
      if (!soundEnabled.value || isPlayingAudio.value) return
      
      isPlayingAudio.value = true
      
      try {
        // Web Speech API を使用した音声合成
        const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
        utterance.rate = 0.8
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        utterance.onend = () => {
          isPlayingAudio.value = false
        }
        
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('Audio playback failed:', error)
        isPlayingAudio.value = false
      }
    }

    // メトロノーム制御
    const toggleMetronome = () => {
      if (metronomeActive.value) {
        stopMetronome()
      } else {
        startMetronome()
      }
    }

    const startMetronome = () => {
      if (metronomeInterval.value) return
      
      metronomeActive.value = true
      const intervalTime = 60000 / currentTempo.value // BPMをミリ秒に変換
      
      metronomeInterval.value = setInterval(() => {
        playingBeat.value = true
        playMetronomeSound()
        
        setTimeout(() => {
          playingBeat.value = false
        }, 100)
      }, intervalTime)
    }

    const stopMetronome = () => {
      if (metronomeInterval.value) {
        clearInterval(metronomeInterval.value)
        metronomeInterval.value = null
      }
      metronomeActive.value = false
      playingBeat.value = false
    }

    // 効果音再生
    const playSuccessSound = () => {
      if (!soundEnabled.value) return
      // Web Audio API を使った効果音（実装を簡略化）
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    const playErrorSound = () => {
      if (!soundEnabled.value) return
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    const playMetronomeSound = () => {
      if (!soundEnabled.value) return
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }

    // 設定モーダル
    const toggleSettings = () => {
      showSettings.value = !showSettings.value
    }

    // パフォーマンス評価
    const getPerformanceMessage = () => {
      const accuracyRate = accuracy.value
      if (accuracyRate >= 90) return "🌟 Rhythm Master! 🌟"
      if (accuracyRate >= 75) return "🥁 Great Drummer! 🥁"
      if (accuracyRate >= 60) return "🎵 Good Beat! 🎵"
      return "🎯 Keep Practicing! 🎯"
    }

    const getPerformanceAdvice = () => {
      const accuracyRate = accuracy.value
      if (accuracyRate >= 90) return "You have excellent rhythm sense! Try harder difficulty levels."
      if (accuracyRate >= 75) return "Great job! Focus on listening to the stress patterns more carefully."
      if (accuracyRate >= 60) return "Good progress! Practice with the metronome to improve your timing."
      return "Don't give up! Listen to each syllable carefully and feel the rhythm."
    }

    // ユーティリティ関数
    const formatScore = (score) => {
      return score.toLocaleString()
    }

    // ライフサイクル
    onMounted(() => {
      initGame()
    })

    onUnmounted(() => {
      stopMetronome()
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
      }
    })

    return {
      // 状態
      gameState,
      currentRound,
      totalRounds,
      score,
      correctAnswers,
      selectedSyllable,
      feedback,
      showSettings,
      difficulty,
      currentTempo,
      soundEnabled,
      metronomeActive,
      isPlayingAudio,
      playingBeat,
      currentWord,
      
      // 計算プロパティ
      progressPercentage,
      accuracy,
      averageResponseTime,
      
      // メソッド
      selectSyllable,
      submitAnswer,
      nextRound,
      restartGame,
      playWordAudio,
      toggleMetronome,
      toggleSettings,
      getPerformanceMessage,
      getPerformanceAdvice,
      formatScore
    }
  }
}
</script>
<style scoped>
/* ===== テーマカラー変数 ===== */
.stress-pattern-game {
  --primary: #FF5722;      /* ディープオレンジ */
  --secondary: #607D8B;    /* ブルーグレー */
  --accent: #FFEB3B;       /* イエロー */
  --background: #FFF3E0;   /* オレンジライト */
  --beat: #F44336;         /* ビートレッド */
  --drum: #8D6E63;         /* ドラムブラウン */
  --success: #4CAF50;      /* 正解グリーン */
  --error: #FF5252;        /* 不正解レッド */
  --text: #1F2937;         /* テキストカラー */
  --light-bg: #F9FAFB;     /* ライト背景 */
  --border: #E5E7EB;       /* ボーダー */
}

/* ===== メインコンテナ ===== */
.stress-pattern-game {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #FFCCBC 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: var(--text);
  position: relative;
  overflow-x: hidden;
}

/* ===== ヘッダー ===== */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(90deg, var(--primary), #FF7043);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button,
.settings-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover,
.settings-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.drum-icon {
  font-size: 2rem;
  animation: drum-bounce 2s infinite ease-in-out;
}

@keyframes drum-bounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

/* ===== 進捗バー ===== */
.progress-section {
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid var(--border);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.progress-text {
  color: var(--secondary);
}

.score-text {
  color: var(--primary);
  font-size: 1.2rem;
}

.progress-container {
  width: 100%;
  height: 12px;
  background: #E0E0E0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
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

/* ===== メインゲーム画面 ===== */
.game-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.game-area {
  display: grid;
  gap: 2rem;
  grid-template-areas: 
    "studio studio"
    "word metronome"
    "challenge challenge"
    "feedback feedback"
    "actions actions";
  grid-template-columns: 1fr 300px;
}

/* ===== ドラムスタジオ環境 ===== */
.drum-studio {
  grid-area: studio;
  background: linear-gradient(135deg, #37474F 0%, #263238 100%);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.studio-background {
  position: relative;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drum-kit {
  display: grid;
  grid-template-areas: 
    ". hihat crash"
    "kick snare .";
  gap: 1rem;
  scale: 0.8;
}

.drum-piece {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drum-piece.hihat {
  grid-area: hihat;
  background: linear-gradient(135deg, #FFD700, #FFA000);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.drum-piece.snare {
  grid-area: snare;
  background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
  box-shadow: 0 4px 15px rgba(189, 189, 189, 0.4);
}

.drum-piece.kick {
  grid-area: kick;
  background: linear-gradient(135deg, var(--drum), #5D4037);
  box-shadow: 0 4px 15px rgba(141, 110, 99, 0.4);
  width: 80px;
  height: 80px;
}

.drum-piece.crash {
  grid-area: crash;
  background: linear-gradient(135deg, #FFD700, #FF8F00);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.drum-piece.active {
  transform: scale(1.2);
  box-shadow: 0 0 25px currentColor;
}

.studio-lights {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
}

.light {
  width: 20px;
  height: 20px;
  background: #666;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.light.on {
  background: var(--accent);
  box-shadow: 0 0 15px var(--accent);
  animation: light-pulse 0.5s ease-in-out;
}

@keyframes light-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* ===== 単語表示セクション ===== */
.word-display {
  grid-area: word;
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 3px solid var(--primary);
}

.current-word {
  text-align: center;
  margin-bottom: 2rem;
}

.word-text {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(255, 87, 34, 0.2);
}

.word-meaning {
  font-size: 1.2rem;
  color: var(--secondary);
  margin-bottom: 1rem;
  font-style: italic;
}

.audio-button {
  background: linear-gradient(135deg, #2196F3, #21CBF3);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.6);
}

.audio-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.audio-spinner {
  animation: audio-spin 1s linear infinite;
}

@keyframes audio-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== ストレスパターン可視化 ===== */
.stress-visualization {
  margin-top: 1rem;
}

.beat-pattern {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.syllable-beat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.beat-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #E0E0E0;
  transition: all 0.3s ease;
}

.syllable-beat.stressed .beat-indicator {
  background: var(--beat);
  transform: scale(1.5);
  box-shadow: 0 0 15px var(--beat);
}

.syllable-beat.playing .beat-indicator {
  animation: beat-pulse 0.5s ease-in-out;
}

@keyframes beat-pulse {
  0%, 100% { transform: scale(1.5); }
  50% { transform: scale(2); }
}

.syllable-text {
  font-weight: bold;
  color: var(--text);
  font-size: 1.1rem;
}

.syllable-beat.stressed .syllable-text {
  color: var(--beat);
  text-transform: uppercase;
}

/* ===== メトロノーム ===== */
.metronome-section {
  grid-area: metronome;
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.metronome {
  position: relative;
  width: 120px;
  height: 150px;
  margin-bottom: 1rem;
}

.metronome-arm {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 4px;
  height: 100px;
  background: var(--secondary);
  border-radius: 2px;
  transform-origin: 50% 90%;
  transform: translateX(-50%);
  transition: transform 0.3s ease;
}

.metronome-arm::before {
  content: "";
  position: absolute;
  top: -10px;
  left: -8px;
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 50%;
}

.metronome-arm.swinging {
  animation: metronome-swing 0.6s ease-in-out infinite alternate;
}

@keyframes metronome-swing {
  0% { transform: translateX(-50%) rotate(-30deg); }
  100% { transform: translateX(-50%) rotate(30deg); }
}

.metronome-base {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 80px;
  height: 40px;
  background: var(--drum);
  border-radius: 0 0 40px 40px;
  transform: translateX(-50%);
}

.tempo-info {
  text-align: center;
}

.tempo-text {
  display: block;
  font-weight: bold;
  color: var(--secondary);
  margin-bottom: 1rem;
}

.tempo-button {
  background: linear-gradient(135deg, var(--secondary), #455A64);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tempo-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(96, 125, 139, 0.4);
}

/* ===== チャレンジセクション ===== */
.challenge-section {
  grid-area: challenge;
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.challenge-text {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 2rem;
  font-weight: 600;
}

.syllable-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.syllable-button {
  background: linear-gradient(135deg, var(--light-bg), #F3F4F6);
  border: 3px solid var(--border);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.syllable-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary);
}

.syllable-button.selected {
  background: linear-gradient(135deg, var(--primary), #FF7043);
  color: white;
  border-color: var(--primary);
  transform: translateY(-5px) scale(1.05);
}

.syllable-button.correct {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: white;
  border-color: var(--success);
  animation: correct-celebration 0.6s ease-in-out;
}

.syllable-button.incorrect {
  background: linear-gradient(135deg, var(--error), #FF7979);
  color: white;
  border-color: var(--error);
  animation: incorrect-shake 0.5s ease-in-out;
}

.syllable-button.correct-answer {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: white;
  border-color: var(--success);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
}

@keyframes correct-celebration {
  0% { transform: translateY(-5px) scale(1.05) rotate(0deg); }
  25% { transform: translateY(-8px) scale(1.15) rotate(3deg); }
  50% { transform: translateY(-5px) scale(1.1) rotate(-2deg); }
  75% { transform: translateY(-8px) scale(1.15) rotate(1deg); }
  100% { transform: translateY(-5px) scale(1.05) rotate(0deg); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

.syllable-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.syllable-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.stress-indicator {
  font-size: 1.5rem;
  font-weight: bold;
}

.stress-indicator.unstressed {
  opacity: 0.5;
}

/* ===== フィードバックセクション ===== */
.feedback-section {
  grid-area: feedback;
  margin: 2rem 0;
}

.feedback-content {
  padding: 2rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: feedback-appear 0.5s ease-out;
}

.feedback-content.correct {
  background: linear-gradient(135deg, var(--success), #66BB6A);
  color: white;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.feedback-content.incorrect {
  background: linear-gradient(135deg, var(--error), #FF7979);
  color: white;
  box-shadow: 0 8px 25px rgba(255, 82, 82, 0.3);
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

.feedback-icon {
  font-size: 3rem;
}

.feedback-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.feedback-text p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

/* ===== アクションボタン ===== */
.action-buttons {
  grid-area: actions;
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-button,
.next-button {
  background: linear-gradient(135deg, var(--primary), #FF7043);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.submit-button:hover,
.next-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 87, 34, 0.4);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ===== 結果画面 ===== */
.results-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.results-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.results-header {
  margin-bottom: 2rem;
}

.results-title {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.final-score {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
}

.score-label {
  color: var(--secondary);
  font-weight: 600;
}

.score-value {
  color: var(--primary);
  font-weight: bold;
  font-size: 2rem;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 2rem 0;
  padding: 2rem;
  background: var(--light-bg);
  border-radius: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.stat-label {
  color: var(--secondary);
  font-size: 0.9rem;
  font-weight: 600;
}

.performance-message {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--accent), #FDD835);
  border-radius: 15px;
  color: var(--text);
}

.performance-message h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.performance-message p {
  margin: 0;
  opacity: 0.8;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.play-again-button,
.menu-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-again-button {
  background: linear-gradient(135deg, var(--primary), #FF7043);
  color: white;
}

.menu-button {
  background: linear-gradient(135deg, var(--secondary), #455A64);
  color: white;
}

.play-again-button:hover,
.menu-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* ===== ローディング画面 ===== */
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.loading-content {
  text-align: center;
  color: var(--text);
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

@keyframes loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
}

.loading-content p {
  color: var(--secondary);
  font-size: 1.1rem;
}

/* ===== 設定モーダル ===== */
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
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(90deg, var(--primary), #FF7043);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 2rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.setting-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.setting-select:focus {
  outline: none;
  border-color: var(--primary);
}

.setting-range {
  width: 100%;
  margin: 0.5rem 0;
}

.tempo-display {
  font-weight: bold;
  color: var(--primary);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* ===== レスポンシブデザイン ===== */
@media (max-width: 1024px) {
  .game-area {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "studio"
      "word"
      "metronome"
      "challenge"
      "feedback"
      "actions";
  }
}

@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 1.4rem;
  }
  
  .game-main {
    padding: 1rem;
  }
  
  .word-text {
    font-size: 2rem;
  }
  
  .syllable-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .syllable-button {
    width: 100%;
    max-width: 200px;
  }
  
  .performance-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .results-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .play-again-button,
  .menu-button {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .drum-kit {
    scale: 0.6;
  }
  
  .metronome {
    scale: 0.8;
  }
  
  .audio-button {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .word-text {
    font-size: 1.8rem;
  }
  
  .challenge-text {
    font-size: 1.1rem;
  }
  
  .syllable-button {
    padding: 0.8rem 1rem;
    min-width: 80px;
  }
  
  .feedback-content {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
  }
  
  .feedback-icon {
    font-size: 2.5rem;
  }
  
  .results-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .results-title {
    font-size: 2rem;
  }
  
  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .modal-body {
    padding: 1.5rem;
  }
}

/* ===== アクセシビリティ対応 ===== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* フォーカス表示の改善 */
.syllable-button:focus,
.audio-button:focus,
.submit-button:focus,
.next-button:focus,
.tempo-button:focus {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.syllable-button:focus-visible,
.audio-button:focus-visible {
  transform: translateY(-5px) scale(1.05);
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  .stress-pattern-game {
    --primary: #D32F2F;
    --secondary: #1976D2;
    --accent: #F57F17;
    --success: #388E3C;
    --error: #D32F2F;
    --text: #000000;
    --background: #FFFFFF;
  }
  
  .syllable-button {
    border-width: 4px;
  }
  
  .feedback-content {
    border: 3px solid currentColor;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .stress-pattern-game {
    --background: #121212;
    --light-bg: #1E1E1E;
    --text: #FFFFFF;
    --border: #333333;
  }
  
  .word-display,
  .metronome-section,
  .challenge-section,
  .results-content,
  .modal-content {
    background: #1E1E1E;
    color: var(--text);
  }
  
  .modal-body {
    background: #1E1E1E;
  }
  
  .setting-select {
    background: #2D2D2D;
    color: var(--text);
    border-color: var(--border);
  }
}

/* 印刷スタイル */
@media print {
  .stress-pattern-game {
    background: white !important;
    color: black !important;
  }
  
  .game-header,
  .action-buttons,
  .modal-backdrop {
    display: none !important;
  }
  
  .game-main {
    padding: 0 !important;
  }
  
  .word-display,
  .challenge-section {
    box-shadow: none !important;
    border: 2px solid #000 !important;
  }
}

/* カスタムスクロールバー */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--light-bg);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #E64A19;
}

/* セレクション色 */
::selection {
  background: var(--primary);
  color: white;
}

/* プレースホルダー色 */
::placeholder {
  color: var(--secondary);
  opacity: 0.7;
}

/* カスタムチェックボックス・ラジオボタン */
input[type="checkbox"],
input[type="radio"] {
  accent-color: var(--primary);
}

/* ツールチップスタイル */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: var(--background);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: nowrap;
  z-index: 1000;
  animation: tooltip-appear 0.3s ease-out;
}

@keyframes tooltip-appear {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 特殊効果：パーティクルアニメーション */
.particle-effect {
  position: absolute;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  animation: particle-float 2s ease-out forwards;
}

@keyframes particle-float {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(0);
  }
}

/* 成功時の紙吹雪エフェクト */
.confetti {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--accent);
  animation: confetti-fall 3s ease-out forwards;
}

.confetti:nth-child(odd) {
  background: var(--primary);
  border-radius: 50%;
}

.confetti:nth-child(even) {
  background: var(--success);
  transform: rotate(45deg);
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translateY(-100vh) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

/* 音波エフェクト */
.sound-wave {
  position: absolute;
  border-radius: 50%;
  border: 2px solid var(--primary);
  animation: sound-wave-expand 1.5s ease-out infinite;
}

@keyframes sound-wave-expand {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

/* グラデーション背景アニメーション */
.animated-gradient {
  background: linear-gradient(-45deg, var(--primary), var(--secondary), var(--accent), var(--primary));
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* カスタムチェックマーク */
.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
}

.custom-checkbox input {
  opacity: 0;
  position: absolute;
}

.custom-checkbox .checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 24px;
  width: 24px;
  background-color: var(--light-bg);
  border: 2px solid var(--border);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: var(--primary);
  border-color: var(--primary);
}

.custom-checkbox .checkmark::after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked ~ .checkmark::after {
  display: block;
  animation: checkmark-appear 0.3s ease-out;
}

@keyframes checkmark-appear {
  0% {
    opacity: 0;
    transform: rotate(45deg) scale(0);
  }
  100% {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}
</style>