<template>
  <div class="double-letter-lab">
    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="header-left">
        <button @click="$emit('back')" class="back-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          戻る
        </button>
        <div class="game-title">
          <span class="icon">⚗️</span>
          <h1>Chemical Reaction Lab</h1>
          <span class="icon">🧪</span>
        </div>
      </div>
      <div class="header-right">
        <button @click="toggleSettings" class="settings-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
      </div>
    </header>

    <!-- 進捗バー -->
    <div class="progress-section">
      <div class="progress-info">
        <span>Stage {{ currentStage }}/{{ totalStages }}</span>
        <span>{{ currentPattern }} Pattern</span>
      </div>
      <div class="progress-container">
        <div 
          class="progress-bar" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-percentage">{{ Math.round(progressPercentage) }}%</div>
    </div>

    <!-- メインゲームエリア -->
    <main class="game-main">
      <!-- 実験説明 -->
      <div class="experiment-info">
        <h2>化学反応実験: 文字の結合</h2>
        <p>2つの同じ文字が結合すると、どんな音になるでしょう？</p>
      </div>

      <!-- 化学反応式 -->
      <div class="reaction-container">
        <div class="reaction-equation">
          <div class="reactant">
            <div class="molecule" :class="{ 'animate-bubble': isReacting }">
              <span class="letter">{{ currentQuestion.letter }}</span>
              <div class="bubbles" v-if="isReacting">
                <div class="bubble" v-for="i in 5" :key="i"></div>
              </div>
            </div>
          </div>

          <div class="plus-sign">+</div>

          <div class="reactant">
            <div class="molecule" :class="{ 'animate-bubble': isReacting }">
              <span class="letter">{{ currentQuestion.letter }}</span>
              <div class="bubbles" v-if="isReacting">
                <div class="bubble" v-for="i in 5" :key="i"></div>
              </div>
            </div>
          </div>

          <div class="equals-sign">=</div>

          <div class="product">
            <div class="flask" :class="{ 'animate-reaction': showResult }">
              <div class="flask-body">
                <div class="liquid" :class="{ 'bubbling': isReacting }"></div>
                <div class="question-mark" v-if="!showResult">?</div>
                <div class="result" v-if="showResult">
                  {{ currentQuestion.letter }}{{ currentQuestion.letter }}
                </div>
              </div>
              <div class="flask-neck"></div>
              <!-- 化学反応エフェクト -->
              <div class="reaction-effects" v-if="isReacting">
                <div class="spark" v-for="i in 8" :key="i"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 例単語表示 -->
      <div class="example-words" v-if="currentQuestion">
        <h3>例単語:</h3>
        <div class="word-list">
          <span 
            v-for="word in currentQuestion.examples" 
            :key="word"
            class="example-word"
            @click="playWordAudio(word)"
          >
            {{ word }}
            <button class="audio-mini">🔊</button>
          </span>
        </div>
      </div>

      <!-- 質問 -->
      <div class="question-section">
        <h3>この化学反応の結果、どんな音になりますか？</h3>
        
        <!-- 音声再生ボタン -->
        <button 
          @click="playQuestionAudio" 
          class="audio-button"
          :class="{ 'playing': isPlayingAudio }"
          :disabled="isPlayingAudio"
        >
          <span class="audio-icon">🔊</span>
          <span>音を聞く</span>
          <div class="audio-waves" v-if="isPlayingAudio">
            <div class="wave" v-for="i in 4" :key="i"></div>
          </div>
        </button>
      </div>

      <!-- 選択肢 -->
      <div class="choices-section">
        <button
          v-for="(choice, index) in currentQuestion?.choices"
          :key="index"
          @click="selectAnswer(choice, index)"
          class="choice-button"
          :class="{
            'correct': showResult && choice === currentQuestion.correctAnswer,
            'incorrect': showResult && selectedChoice === choice && choice !== currentQuestion.correctAnswer,
            'disabled': showResult
          }"
          :disabled="showResult"
        >
          <span class="choice-sound">{{ choice }}</span>
          <div class="molecule-structure">
            <div class="atom"></div>
            <div class="bond"></div>
            <div class="atom"></div>
          </div>
        </button>
      </div>

      <!-- フィードバック -->
      <div v-if="showFeedback" class="feedback" :class="feedbackType">
        <div class="feedback-content">
          <div class="feedback-icon">
            {{ feedbackType === 'correct' ? '🎉' : '🔬' }}
          </div>
          <div class="feedback-text">
            <h4>{{ feedbackMessage.title }}</h4>
            <p>{{ feedbackMessage.description }}</p>
          </div>
        </div>
      </div>

      <!-- 次へボタン -->
      <div class="action-section" v-if="showResult">
        <button @click="nextQuestion" class="next-button">
          <span>次の実験</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </main>

    <!-- サイドバー情報 -->
    <aside class="game-sidebar">
      <!-- スコア表示 -->
      <div class="score-container">
        <div class="score-item">
          <span class="score-label">実験成功:</span>
          <span class="score-value">{{ score }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">連続成功:</span>
          <span class="score-value">{{ streak }}</span>
        </div>
      </div>

      <!-- ライフ表示 -->
      <div class="lives-container">
        <h4>実験チャンス:</h4>
        <div class="lives">
          <span 
            v-for="i in maxLives" 
            :key="i"
            class="life"
            :class="{ 'lost': i > lives }"
          >
            🧪
          </span>
        </div>
      </div>

      <!-- 学習進捗 -->
      <div class="learning-progress">
        <h4>マスター済みパターン:</h4>
        <div class="mastered-patterns">
          <div 
            v-for="pattern in masteredPatterns" 
            :key="pattern"
            class="pattern-badge"
          >
            {{ pattern }}
          </div>
        </div>
      </div>

      <!-- 学習のヒント -->
      <div class="learning-tips">
        <h4>実験のコツ:</h4>
        <ul>
          <li>同じ文字が2つ並ぶと、1つの音になります</li>
          <li>例: ff = /f/, ll = /l/, ss = /s/</li>
          <li>音を注意深く聞いて選択しましょう</li>
        </ul>
      </div>
    </aside>

    <!-- ゲーム完了モーダル -->
    <div v-if="showCompletionModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="completion-animation">
          <div class="trophy">🏆</div>
          <div class="particles">
            <div class="particle" v-for="i in 12" :key="i"></div>
          </div>
        </div>
        <h2>実験マスター達成！</h2>
        <div class="final-stats">
          <div class="stat">
            <span class="stat-label">総スコア:</span>
            <span class="stat-value">{{ score }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">正解率:</span>
            <span class="stat-value">{{ Math.round((score / totalQuestions) * 100) }}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">最大連続:</span>
            <span class="stat-value">{{ maxStreak }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="restartGame" class="restart-button">
            もう一度実験
          </button>
          <button @click="$emit('complete', { score, accuracy: Math.round((score / totalQuestions) * 100) })" class="finish-button">
            完了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DoubleLetterLabGame',
  emits: ['back', 'complete'],
  data() {
    return {
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      lives: 3,
      maxLives: 3,
      showResult: false,
      showFeedback: false,
      selectedChoice: null,
      feedbackType: '',
      isReacting: false,
      isPlayingAudio: false,
      showCompletionModal: false,
      masteredPatterns: [],
      totalStages: 6,
      currentStage: 1,
      questions: [
        {
          letter: 'f',
          pattern: 'ff',
          correctAnswer: '/f/',
          choices: ['/f/', '/ff/', '/ph/'],
          examples: ['stuff', 'cliff', 'muffin'],
          explanation: 'ffは/f/の音になります。stuffのように単語の最後によく出てきます。'
        },
        {
          letter: 'l',
          pattern: 'll',
          correctAnswer: '/l/',
          choices: ['/l/', '/ll/', '/w/'],
          examples: ['ball', 'call', 'hello'],
          explanation: 'llは/l/の音になります。ballのように語尾によく現れます。'
        },
        {
          letter: 's',
          pattern: 'ss',
          correctAnswer: '/s/',
          choices: ['/s/', '/ss/', '/z/'],
          examples: ['class', 'dress', 'kiss'],
          explanation: 'ssは/s/の音になります。classのように語尾に多く見られます。'
        },
        {
          letter: 't',
          pattern: 'tt',
          correctAnswer: '/t/',
          choices: ['/t/', '/tt/', '/d/'],
          examples: ['letter', 'butter', 'sitting'],
          explanation: 'ttは/t/の音になります。letterのように語中に現れることが多いです。'
        },
        {
          letter: 'p',
          pattern: 'pp',
          correctAnswer: '/p/',
          choices: ['/p/', '/pp/', '/b/'],
          examples: ['happy', 'puppy', 'apple'],
          explanation: 'ppは/p/の音になります。happyのように語中でよく使われます。'
        },
        {
          letter: 'n',
          pattern: 'nn',
          correctAnswer: '/n/',
          choices: ['/n/', '/nn/', '/m/'],
          examples: ['funny', 'sunny', 'dinner'],
          explanation: 'nnは/n/の音になります。funnyのように語中で使われます。'
        }
      ]
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || null
    },
    totalQuestions() {
      return this.questions.length
    },
    progressPercentage() {
      return (this.currentQuestionIndex / this.totalQuestions) * 100
    },
    currentPattern() {
      return this.currentQuestion?.pattern.toUpperCase() || ''
    },
    feedbackMessage() {
      if (this.feedbackType === 'correct') {
        return {
          title: '実験成功！',
          description: this.currentQuestion?.explanation || '素晴らしい化学反応です！'
        }
      } else {
        return {
          title: '実験継続中...',
          description: '別の組み合わせを試してみましょう。'
        }
      }
    }
  },
  watch: {
    lives(newLives) {
      if (newLives <= 0) {
        setTimeout(() => {
          this.showCompletionModal = true
        }, 2000)
      }
    }
  },
  mounted() {
    console.log('Double Letter Lab Game が開始されました')
  },
  methods: {
    async playQuestionAudio() {
      if (!this.currentQuestion || this.isPlayingAudio) return
      
      this.isPlayingAudio = true
      this.isReacting = true
      
      try {
        const utterance = new SpeechSynthesisUtterance()
        utterance.text = this.currentQuestion.examples[0] // 最初の例単語を再生
        utterance.rate = 0.8
        utterance.pitch = 1
        utterance.volume = 0.8
        
        utterance.onend = () => {
          this.isPlayingAudio = false
          this.isReacting = false
        }
        
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('音声再生エラー:', error)
        this.isPlayingAudio = false
        this.isReacting = false
      }
    },

    async playWordAudio(word) {
      try {
        const utterance = new SpeechSynthesisUtterance()
        utterance.text = word
        utterance.rate = 0.8
        utterance.pitch = 1
        utterance.volume = 0.8
        
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('単語音声再生エラー:', error)
      }
    },

    selectAnswer(choice, index) {
      if (this.showResult) return
      
      this.selectedChoice = choice
      const isCorrect = choice === this.currentQuestion.correctAnswer
      
      // 化学反応アニメーション開始
      this.isReacting = true
      
      setTimeout(() => {
        this.showResult = true
        this.isReacting = false
        
        if (isCorrect) {
          this.score += 10
          this.streak += 1
          this.maxStreak = Math.max(this.maxStreak, this.streak)
          this.feedbackType = 'correct'
          
          // パターンをマスター済みに追加
          if (!this.masteredPatterns.includes(this.currentQuestion.pattern)) {
            this.masteredPatterns.push(this.currentQuestion.pattern)
          }
        } else {
          this.lives -= 1
          this.streak = 0
          this.feedbackType = 'incorrect'
        }
        
        this.showFeedback = true
        
        // フィードバックを3秒後に非表示
        setTimeout(() => {
          this.showFeedback = false
        }, 3000)
      }, 1500)
    },

    nextQuestion() {
      if (this.lives <= 0) {
        this.showCompletionModal = true
        return
      }
      
      if (this.currentQuestionIndex < this.totalQuestions - 1) {
        this.currentQuestionIndex += 1
        this.currentStage = Math.min(Math.floor(this.currentQuestionIndex / 2) + 1, this.totalStages)
        this.resetQuestionState()
      } else {
        this.showCompletionModal = true
      }
    },

    resetQuestionState() {
      this.showResult = false
      this.showFeedback = false
      this.selectedChoice = null
      this.feedbackType = ''
    },

    restartGame() {
      this.currentQuestionIndex = 0
      this.score = 0
      this.streak = 0
      this.lives = this.maxLives
      this.currentStage = 1
      this.masteredPatterns = []
      this.showCompletionModal = false
      this.resetQuestionState()
    },

    closeModal() {
      this.showCompletionModal = false
    },

    toggleSettings() {
      console.log('設定メニューを開く')
      // 設定メニューの実装
    }
  }
}
</script>

<style scoped>
/* 基本スタイル設定 */
.double-letter-lab {
 min-height: 100vh;
 background: linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%);
 font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
 display: grid;
 grid-template-columns: 1fr 320px;
 grid-template-rows: auto auto 1fr;
 gap: 1.5rem;
 padding: 1rem;
}

/* ヘッダー */
.game-header {
 grid-column: 1 / -1;
 display: flex;
 justify-content: space-between;
 align-items: center;
 background: white;
 padding: 1rem 1.5rem;
 border-radius: 16px;
 box-shadow: 0 4px 20px rgba(0, 188, 212, 0.1);
}

.header-left {
 display: flex;
 align-items: center;
 gap: 1rem;
}

.back-button {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 padding: 0.5rem 1rem;
 background: #F5F5F5;
 border: none;
 border-radius: 8px;
 cursor: pointer;
 transition: all 0.2s ease;
}

.back-button:hover {
 background: #EEEEEE;
 transform: translateX(-2px);
}

.game-title {
 display: flex;
 align-items: center;
 gap: 0.75rem;
}

.game-title h1 {
 font-size: 1.5rem;
 font-weight: 700;
 color: #00BCD4;
 margin: 0;
}

.game-title .icon {
 font-size: 1.8rem;
}

.settings-button {
 padding: 0.75rem;
 background: #F0F9FF;
 border: none;
 border-radius: 12px;
 cursor: pointer;
 color: #0284C7;
 transition: all 0.2s ease;
}

.settings-button:hover {
 background: #E0F2FE;
 transform: scale(1.05);
}

/* 進捗セクション */
.progress-section {
 grid-column: 1;
 background: white;
 padding: 1.5rem;
 border-radius: 16px;
 box-shadow: 0 2px 12px rgba(0, 188, 212, 0.08);
}

.progress-info {
 display: flex;
 justify-content: space-between;
 margin-bottom: 1rem;
 font-weight: 600;
 color: #00695C;
}

.progress-container {
 width: 100%;
 height: 12px;
 background: #E0E0E0;
 border-radius: 6px;
 overflow: hidden;
 position: relative;
 box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
 margin-bottom: 0.5rem;
}

.progress-bar {
 height: 100%;
 background: linear-gradient(90deg, #4CAF50, #8BC34A, #CDDC39);
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

@keyframes progress-shine {
 0% { transform: translateX(-100%); }
 100% { transform: translateX(100%); }
}

.progress-percentage {
 text-align: right;
 font-weight: 600;
 color: #00695C;
}

/* メインゲームエリア */
.game-main {
 grid-column: 1;
 background: white;
 padding: 2rem;
 border-radius: 20px;
 box-shadow: 0 8px 32px rgba(0, 188, 212, 0.12);
}

.experiment-info {
 text-align: center;
 margin-bottom: 2rem;
}

.experiment-info h2 {
 font-size: 1.75rem;
 font-weight: 700;
 color: #00BCD4;
 margin-bottom: 0.5rem;
}

.experiment-info p {
 font-size: 1.1rem;
 color: #555;
}

/* 化学反応式 */
.reaction-container {
 background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
 border-radius: 20px;
 padding: 2rem;
 margin-bottom: 2rem;
 position: relative;
 overflow: hidden;
}

.reaction-equation {
 display: flex;
 justify-content: center;
 align-items: center;
 gap: 2rem;
 flex-wrap: wrap;
}

.reactant, .product {
 display: flex;
 flex-direction: column;
 align-items: center;
}

.molecule {
 width: 80px;
 height: 80px;
 background: linear-gradient(135deg, #00BCD4, #4FC3F7);
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 position: relative;
 box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
 transition: all 0.3s ease;
}

.molecule.animate-bubble {
 animation: bubble-float 1.5s infinite ease-in-out;
}

@keyframes bubble-float {
 0%, 100% { transform: translateY(0) scale(1); }
 50% { transform: translateY(-10px) scale(1.05); }
}

.letter {
 font-size: 2rem;
 font-weight: bold;
 color: white;
 text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.bubbles {
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 pointer-events: none;
}

.bubble {
 position: absolute;
 width: 8px;
 height: 8px;
 background: rgba(255, 255, 255, 0.6);
 border-radius: 50%;
 animation: bubble-rise 2s infinite ease-out;
}

.bubble:nth-child(1) { left: 20%; animation-delay: 0s; }
.bubble:nth-child(2) { left: 40%; animation-delay: 0.4s; }
.bubble:nth-child(3) { left: 60%; animation-delay: 0.8s; }
.bubble:nth-child(4) { left: 80%; animation-delay: 1.2s; }
.bubble:nth-child(5) { left: 50%; animation-delay: 1.6s; }

@keyframes bubble-rise {
 0% {
   bottom: 10px;
   opacity: 0;
   transform: scale(0);
 }
 20% {
   opacity: 1;
   transform: scale(1);
 }
 100% {
   bottom: 90px;
   opacity: 0;
   transform: scale(0.5);
 }
}

.plus-sign, .equals-sign {
 font-size: 2.5rem;
 font-weight: bold;
 color: #00BCD4;
 text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.flask {
 position: relative;
 display: flex;
 flex-direction: column;
 align-items: center;
}

.flask-body {
 width: 100px;
 height: 120px;
 background: linear-gradient(135deg, #E8F5E8, #C8E6C9);
 border-radius: 10px 10px 40px 40px;
 position: relative;
 display: flex;
 align-items: center;
 justify-content: center;
 box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
 overflow: hidden;
}

.flask-neck {
 width: 30px;
 height: 40px;
 background: linear-gradient(135deg, #E8F5E8, #C8E6C9);
 border-radius: 8px 8px 0 0;
 box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.liquid {
 position: absolute;
 bottom: 0;
 left: 0;
 right: 0;
 height: 60%;
 background: linear-gradient(0deg, #4CAF50, #8BC34A);
 border-radius: 0 0 40px 40px;
 transition: all 0.3s ease;
}

.liquid.bubbling {
 animation: liquid-bubble 1s infinite ease-in-out;
}

@keyframes liquid-bubble {
 0%, 100% { height: 60%; }
 50% { height: 70%; }
}

.question-mark {
 font-size: 3rem;
 font-weight: bold;
 color: #666;
 z-index: 2;
}

.result {
 font-size: 2rem;
 font-weight: bold;
 color: #2E7D32;
 z-index: 2;
 animation: result-appear 0.5s ease-out;
}

@keyframes result-appear {
 0% {
   opacity: 0;
   transform: scale(0);
 }
 100% {
   opacity: 1;
   transform: scale(1);
 }
}

.flask.animate-reaction {
 animation: flask-shake 0.8s ease-in-out;
}

@keyframes flask-shake {
 0%, 100% { transform: translateX(0); }
 25% { transform: translateX(-5px); }
 75% { transform: translateX(5px); }
}

.reaction-effects {
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 pointer-events: none;
}

.spark {
 position: absolute;
 width: 4px;
 height: 4px;
 background: #FFEB3B;
 border-radius: 50%;
 animation: spark-fly 1s infinite ease-out;
}

.spark:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
.spark:nth-child(2) { top: 30%; left: 80%; animation-delay: 0.2s; }
.spark:nth-child(3) { top: 70%; left: 10%; animation-delay: 0.4s; }
.spark:nth-child(4) { top: 60%; left: 90%; animation-delay: 0.6s; }
.spark:nth-child(5) { top: 10%; left: 50%; animation-delay: 0.8s; }
.spark:nth-child(6) { top: 90%; left: 30%; animation-delay: 1s; }
.spark:nth-child(7) { top: 40%; left: 70%; animation-delay: 1.2s; }
.spark:nth-child(8) { top: 80%; left: 60%; animation-delay: 1.4s; }

@keyframes spark-fly {
 0% {
   opacity: 1;
   transform: scale(1) translate(0, 0);
 }
 100% {
   opacity: 0;
   transform: scale(0) translate(20px, -20px);
 }
}

/* 例単語表示 */
.example-words {
 background: #F8F9FA;
 border-radius: 12px;
 padding: 1.5rem;
 margin-bottom: 2rem;
}

.example-words h3 {
 margin: 0 0 1rem 0;
 color: #00695C;
 font-size: 1.2rem;
}

.word-list {
 display: flex;
 gap: 1rem;
 flex-wrap: wrap;
}

.example-word {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 background: white;
 padding: 0.75rem 1rem;
 border-radius: 8px;
 cursor: pointer;
 transition: all 0.2s ease;
 border: 2px solid transparent;
}

.example-word:hover {
 border-color: #00BCD4;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(0, 188, 212, 0.2);
}

.audio-mini {
 background: none;
 border: none;
 font-size: 1rem;
 cursor: pointer;
 opacity: 0.7;
 transition: opacity 0.2s ease;
}

.audio-mini:hover {
 opacity: 1;
}

/* 質問セクション */
.question-section {
 text-align: center;
 margin-bottom: 2rem;
}

.question-section h3 {
 font-size: 1.3rem;
 color: #00695C;
 margin-bottom: 1.5rem;
}

.audio-button {
 display: flex;
 align-items: center;
 gap: 1rem;
 padding: 1rem 2rem;
 background: linear-gradient(135deg, #2196F3, #21CBF3);
 border: none;
 border-radius: 50px;
 color: white;
 font-size: 1.1rem;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
 position: relative;
 overflow: hidden;
}

.audio-button:hover:not(:disabled) {
 transform: scale(1.05);
 box-shadow: 0 6px 20px rgba(33, 150, 243, 0.6);
}

.audio-button:disabled {
 opacity: 0.8;
 cursor: not-allowed;
}

.audio-button.playing {
 animation: audio-pulse 1s infinite ease-in-out;
}

@keyframes audio-pulse {
 0%, 100% { box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4); }
 50% { box-shadow: 0 4px 25px rgba(33, 150, 243, 0.8); }
}

.audio-icon {
 font-size: 1.5rem;
}

.audio-waves {
 position: absolute;
 right: 1rem;
 display: flex;
 gap: 2px;
 align-items: center;
}

.wave {
 width: 3px;
 height: 20px;
 background: rgba(255, 255, 255, 0.8);
 border-radius: 2px;
 animation: wave-bounce 1.2s infinite ease-in-out;
}

.wave:nth-child(1) { animation-delay: 0s; }
.wave:nth-child(2) { animation-delay: 0.1s; }
.wave:nth-child(3) { animation-delay: 0.2s; }
.wave:nth-child(4) { animation-delay: 0.3s; }

@keyframes wave-bounce {
 0%, 40%, 100% { transform: scaleY(0.4); }
 20% { transform: scaleY(1); }
}

/* 選択肢セクション */
.choices-section {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
 gap: 1rem;
 margin-bottom: 2rem;
}

.choice-button {
 padding: 1.5rem;
 background: linear-gradient(135deg, #FFFFFF, #F8F9FA);
 border: 3px solid #E0E0E0;
 border-radius: 16px;
 cursor: pointer;
 transition: all 0.3s ease;
 position: relative;
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 1rem;
 min-height: 120px;
}

.choice-button:hover:not(.disabled) {
 border-color: #00BCD4;
 transform: translateY(-3px);
 box-shadow: 0 8px 25px rgba(0, 188, 212, 0.2);
}

.choice-button.correct {
 background: linear-gradient(135deg, #4CAF50, #8BC34A);
 border-color: #2E7D32;
 color: white;
 animation: correct-celebration 0.6s ease-in-out;
}

.choice-button.incorrect {
 background: linear-gradient(135deg, #FF5252, #FF8A80);
 border-color: #C62828;
 color: white;
 animation: incorrect-shake 0.5s ease-in-out;
}

.choice-button.disabled {
 opacity: 0.6;
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

.choice-sound {
 font-size: 1.5rem;
 font-weight: bold;
}

.molecule-structure {
 display: flex;
 align-items: center;
 gap: 4px;
}

.atom {
 width: 12px;
 height: 12px;
 background: #00BCD4;
 border-radius: 50%;
}

.bond {
 width: 20px;
 height: 3px;
 background: #757575;
}

/* フィードバック */
.feedback {
 background: white;
 border-radius: 16px;
 padding: 1.5rem;
 margin-bottom: 2rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
 border-left: 6px solid #4CAF50;
 animation: feedback-slide-in 0.5s ease-out;
}

.feedback.incorrect {
 border-left-color: #FF5722;
}

@keyframes feedback-slide-in {
 0% {
   opacity: 0;
   transform: translateY(20px);
 }
 100% {
   opacity: 1;
   transform: translateY(0);
 }
}

.feedback-content {
 display: flex;
 gap: 1rem;
 align-items: flex-start;
}

.feedback-icon {
 font-size: 2rem;
 flex-shrink: 0;
}

.feedback-text h4 {
 margin: 0 0 0.5rem 0;
 color: #2E7D32;
 font-size: 1.2rem;
}

.feedback.incorrect .feedback-text h4 {
 color: #D84315;
}

.feedback-text p {
 margin: 0;
 color: #555;
 line-height: 1.5;
}

/* アクションセクション */
.action-section {
 text-align: center;
}

.next-button {
 display: inline-flex;
 align-items: center;
 gap: 0.5rem;
 padding: 1rem 2rem;
 background: linear-gradient(135deg, #4CAF50, #8BC34A);
 border: none;
 border-radius: 50px;
 color: white;
 font-size: 1.1rem;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.next-button:hover {
 transform: scale(1.05);
 box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
}

/* サイドバー */
.game-sidebar {
 grid-column: 2;
 display: flex;
 flex-direction: column;
 gap: 1.5rem;
}

.score-container,
.lives-container,
.learning-progress,
.learning-tips {
 background: white;
 padding: 1.5rem;
 border-radius: 16px;
 box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.score-container {
 background: linear-gradient(135deg, #FFD700, #FFA000);
 color: #1A1A1A;
}

.score-item {
 display: flex;
 justify-content: space-between;
 margin-bottom: 0.5rem;
}

.score-item:last-child {
 margin-bottom: 0;
}

.score-label {
 font-weight: 500;
}

.score-value {
 font-weight: bold;
 font-size: 1.2rem;
}

.lives-container h4,
.learning-progress h4,
.learning-tips h4 {
 margin: 0 0 1rem 0;
 color: #00695C;
 font-size: 1.1rem;
}

.lives {
 display: flex;
 gap: 0.5rem;
}

.life {
 font-size: 1.5rem;
 transition: all 0.3s ease;
}

.life.lost {
 opacity: 0.3;
 filter: grayscale(100%);
}

.mastered-patterns {
 display: flex;
 flex-wrap: wrap;
 gap: 0.5rem;
}

.pattern-badge {
 background: #E8F5E8;
 color: #2E7D32;
 padding: 0.25rem 0.75rem;
 border-radius: 20px;
 font-size: 0.9rem;
 font-weight: 600;
 border: 2px solid #4CAF50;
}

.learning-tips ul {
 margin: 0;
 padding-left: 1.2rem;
}

.learning-tips li {
 margin-bottom: 0.5rem;
 line-height: 1.4;
 color: #555;
}

.learning-tips li:last-child {
 margin-bottom: 0;
}

/* モーダル */
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
 animation: modal-backdrop-appear 0.3s ease-out;
}

@keyframes modal-backdrop-appear {
 0% { opacity: 0; }
 100% { opacity: 1; }
}

.modal-content {
 background: white;
 border-radius: 20px;
 padding: 2rem;
 max-width: 500px;
 width: 90%;
 box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
 animation: modal-appear 0.3s ease-out;
 text-align: center;
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

.completion-animation {
 position: relative;
 margin-bottom: 2rem;
}

.trophy {
 font-size: 4rem;
 animation: trophy-bounce 2s infinite ease-in-out;
}

@keyframes trophy-bounce {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-10px); }
}

.particles {
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 pointer-events: none;
}

.particle {
 position: absolute;
 width: 8px;
 height: 8px;
 background: #FFD700;
 border-radius: 50%;
 animation: particle-burst 2s infinite ease-out;
}

.particle:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
.particle:nth-child(2) { top: 30%; left: 80%; animation-delay: 0.2s; }
.particle:nth-child(3) { top: 70%; left: 10%; animation-delay: 0.4s; }
.particle:nth-child(4) { top: 60%; left: 90%; animation-delay: 0.6s; }
.particle:nth-child(5) { top: 10%; left: 50%; animation-delay: 0.8s; }
.particle:nth-child(6) { top: 90%; left: 30%; animation-delay: 1s; }
.particle:nth-child(7) { top: 40%; left: 70%; animation-delay: 1.2s; }
.particle:nth-child(8) { top: 80%; left: 60%; animation-delay: 1.4s; }
.particle:nth-child(9) { top: 50%; left: 15%; animation-delay: 1.6s; }
.particle:nth-child(10) { top: 25%; left: 85%; animation-delay: 1.8s; }
.particle:nth-child(11) { top: 75%; left: 45%; animation-delay: 2s; }
.particle:nth-child(12) { top: 35%; left: 55%; animation-delay: 2.2s; }

@keyframes particle-burst {
 0% {
   opacity: 1;
   transform: scale(1) translate(0, 0);
 }
 100% {
   opacity: 0;
   transform: scale(0) translate(30px, -30px);
 }
}

.modal-content h2 {
 color: #00695C;
 margin-bottom: 1.5rem;
}

.final-stats {
 display: flex;
 flex-direction: column;
 gap: 1rem;
 margin-bottom: 2rem;
}

.stat {
 display: flex;
 justify-content: space-between;
 padding: 0.75rem;
 background: #F8F9FA;
 border-radius: 8px;
}

.stat-label {
 font-weight: 500;
 color: #555;
}

.stat-value {
 font-weight: bold;
 color: #00695C;
 font-size: 1.1rem;
}

.modal-actions {
 display: flex;
 gap: 1rem;
 justify-content: center;
}

.restart-button,
.finish-button {
 padding: 0.75rem 1.5rem;
 border: none;
 border-radius: 8px;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.2s ease;
}

.restart-button {
 background: #F5F5F5;
 color: #555;
}

.restart-button:hover {
 background: #EEEEEE;
}

.finish-button {
 background: linear-gradient(135deg, #4CAF50, #8BC34A);
 color: white;
}

.finish-button:hover {
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* レスポンシブデザイン */
@media (max-width: 1024px) {
 .double-letter-lab {
   grid-template-columns: 1fr;
   gap: 1rem;
 }
 
 .game-sidebar {
   grid-column: 1;
   grid-row: 3;
 }
}

@media (max-width: 768px) {
 .double-letter-lab {
   padding: 0.5rem;
 }
 
 .game-header {
   padding: 1rem;
 }
 
 .game-main {
   padding: 1.5rem;
 }
 
 .reaction-equation {
   gap: 1rem;
 }
 
 .molecule {
   width: 60px;
   height: 60px;
 }
 
 .letter {
   font-size: 1.5rem;
 }
 
 .plus-sign, .equals-sign {
   font-size: 2rem;
 }
 
 .flask-body {
   width: 80px;
   height: 100px;
 }
 
 .choices-section {
   grid-template-columns: 1fr;
   gap: 0.75rem;
 }
 
 .choice-button {
   padding: 1rem;
   min-height: 80px;
 }
}

@media (max-width: 480px) {
 .game-title h1 {
   font-size: 1.2rem;
 }
 
 .experiment-info h2 {
   font-size: 1.4rem;
 }
 
 .audio-button {
   padding: 0.75rem 1.5rem;
   font-size: 1rem;
 }
 
 .modal-content {
   padding: 1.5rem;
   width: 95%;
 }
 
 .modal-actions {
   flex-direction: column;
 }
 
 .restart-button,
 .finish-button {
   width: 100%;
 }
}
</style>