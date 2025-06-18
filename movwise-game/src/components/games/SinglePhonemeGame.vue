<template>
  <div class="min-h-screen galaxy-background p-6">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    <div class="max-w-4xl mx-auto">
      <!-- 戻るボタン -->
      <button
        @click="handleBack"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        戻る
      </button>
      <h1 class="text-4xl font-bold galaxy-text-primary cosmic-glow mb-8 text-center relative z-10">🔤 フォニックス・マスター</h1>
      
      <!-- レベル選択モーダル -->
      <div v-if="showLevelSelect" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div class="galaxy-card p-8 text-center max-w-2xl w-full mx-4">
          <div class="text-3xl font-bold mb-6 galaxy-text-primary cosmic-glow">レベルを選択</div>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div
              v-for="(level, index) in phonicsData"
              :key="index"
              @click="selectLevel(parseInt(index))"
              class="galaxy-card hover:galaxy-button-primary cursor-pointer p-4 transition-all duration-200"
            >
              <div class="text-2xl mb-2">{{ getIconForLevel(parseInt(index)) }}</div>
              <div class="text-lg font-bold galaxy-text-primary">レベル {{ index }}</div>
              <div class="text-sm text-galaxy-moon-silver">{{ level.name }}</div>
              <div class="text-xs text-galaxy-moon-silver mt-2">{{ level.description }}</div>
            </div>
          </div>
          <button
            @click="showLevelSelect = false"
            class="galaxy-button galaxy-button-secondary px-6 py-2"
          >
            キャンセル
          </button>
        </div>
      </div>
      
      <!-- ゲーム情報 -->
      <div class="galaxy-card p-6 mb-6 relative z-10">
        <div class="flex justify-between items-center mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold galaxy-text-primary cosmic-glow">レベル {{ currentLevel }}</div>
            <div class="text-galaxy-moon-silver">{{ phonicsData[currentLevel].name }}</div>
            <button
              @click="showLevelSelect = true"
              class="galaxy-button galaxy-button-secondary text-sm mt-2 px-3 py-1"
            >
              レベル変更
            </button>
          </div>
          
          <div class="flex gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-400 cosmic-glow">⭐ {{ score }}</div>
              <div class="text-galaxy-moon-silver">スコア</div>
            </div>
            
            <div class="text-center">
              <div class="text-2xl font-bold text-red-500 cosmic-glow">❤️ {{ lives }}</div>
              <div class="text-galaxy-moon-silver">ライフ</div>
            </div>
            
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-400 cosmic-glow">🔥 {{ combo }}</div>
              <div class="text-galaxy-moon-silver">コンボ</div>
            </div>
          </div>
        </div>
        
        <!-- タイマー -->
        <div class="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div 
            class="energy-gauge rounded-full h-2 transition-all duration-1000"
            :style="{ width: `${(timeLeft / 15) * 100}%` }"
          />
        </div>
      </div>
      
      <!-- メインゲームエリア -->
      <div class="galaxy-card p-6 relative z-10">
        <!-- 現在の音素 -->
        <div class="text-center mb-8">
          <div 
            class="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-4 shadow-lg"
            :style="{ backgroundColor: currentPhoneme.color }"
          >
            {{ currentPhoneme.emoji }}
          </div>
          <div class="text-lg text-galaxy-moon-silver font-semibold mb-2">最初の音は何？</div>
          <button
            @click="playPhonemeSound"
            :disabled="isPlaying"
            class="galaxy-button galaxy-button-primary px-6 py-3 font-bold disabled:opacity-50"
          >
            <div class="flex items-center gap-2">
              <Volume2 class="w-5 h-5" />
              <span>{{ isPlaying ? '再生中...' : '音を聞く' }}</span>
            </div>
          </button>
        </div>
        
        <!-- 選択肢 -->
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="choice in choices"
            :key="choice.letter"
            @click="handleChoiceSelect(choice)"
            :disabled="gamePhase !== 'choosing' || selectedChoice"
            :class="[
              'p-4 rounded-xl text-center transition-all duration-200',
              selectedChoice === choice
                ? isCorrect
                  ? 'galaxy-button galaxy-button-primary cosmic-glow'
                  : 'bg-red-500 text-white'
                : 'galaxy-card hover:galaxy-button-secondary'
            ]"
          >
            <div class="text-2xl font-bold mb-2 text-white">{{ choice.letter }}</div>
          </button>
        </div>
      </div>
      
      <!-- フィードバック -->
      <div
        v-if="showFeedback"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-40"
      >
        <div class="galaxy-card p-8 text-center max-w-md w-full mx-4" :class="{
          'border-green-400 shadow-green-400/50': isCorrect,
          'border-red-400 shadow-red-400/50': !isCorrect
        }">
          <div class="text-8xl mb-4 animate-bounce">
            {{ isCorrect ? '🎉' : '😔' }}
          </div>
          <div class="text-3xl font-bold mb-4" :class="{
            'text-green-400 cosmic-glow': isCorrect,
            'text-red-400': !isCorrect
          }">
            {{ isCorrect ? '正解！' : '不正解...' }}
          </div>
          <div v-if="isCorrect" class="text-galaxy-moon-silver mb-4">
            <div class="text-lg">素晴らしい！ 🌟</div>
            <div class="text-sm">「{{ currentPhoneme.letter }}」の音は「{{ currentPhoneme.sound }}」</div>
            <div class="text-sm">例: {{ currentPhoneme.word }} {{ currentPhoneme.emoji }}</div>
            <div v-if="combo > 1" class="text-yellow-400 mt-2">🔥 {{ combo }}連続正解！</div>
          </div>
          <div v-else class="text-galaxy-moon-silver mb-4">
            <div class="text-lg">もう一度挑戦しよう！ 💪</div>
            <div class="text-sm">正解: 「{{ currentPhoneme.letter }}」 ({{ currentPhoneme.sound }})</div>
            <div class="text-sm">{{ currentPhoneme.word }} {{ currentPhoneme.emoji }} の最初の音です</div>
            <div class="text-xs mt-2 text-yellow-300">💡 音をよく聞いて、最初の文字を選んでください</div>
          </div>
          <div v-if="isCorrect" class="text-sm text-gray-400">
            スコア: +{{ lastScoreGain }} (基本100 + コンボ{{ combo * 20 }} + 時間ボーナス{{ Math.max(0, (timeLeft - 5) * 10) }})
          </div>
        </div>
      </div>
      <!-- 終了モーダル -->
      <div v-if="isGameFinished" class="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div class="galaxy-card p-8 text-center max-w-md w-full mx-4">
          <div class="text-6xl mb-4">🏆</div>
          <div class="text-2xl font-bold mb-2 galaxy-text-primary cosmic-glow">全レベルクリア！</div>
          <div class="text-galaxy-moon-silver mb-6">おめでとうございます！フォニックスマスターを達成しました。</div>
          <button
            @click="goToHub"
            class="w-full galaxy-button galaxy-button-primary py-3 font-bold mb-2"
          >
            ハブに戻る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Volume2 } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'
import { useGameAudio } from '@/composables/useGameAudio'

export default {
  name: 'SinglePhonemeGame',
  components: {
    Volume2
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()
    const { playSound } = useGameAudio()

    // ゲーム設定（ローカルでデフォルト値を定義）
    const gameSettings = {
      difficulty: 'normal',
      totalQuestions: 10,
      timeLimit: 15
    }

    // ゲーム状態管理
    const currentLevel = ref(1)
    const currentPhonemeIndex = ref(0)
    const score = ref(0)
    const lives = ref(3)
    const combo = ref(0)
    const isPlaying = ref(false)
    const gamePhase = ref('listening')
    const selectedChoice = ref(null)
    const showFeedback = ref(false)
    const isCorrect = ref(false)
    const streak = ref(0)
    const showParticles = ref(false)
    const timeLeft = ref(gameSettings.timeLimit)
    const isTimerActive = ref(false)
    const isGameFinished = ref(false)
    const correctAnswers = ref(0)
    const totalQuestions = ref(gameSettings.totalQuestions)
    const showLevelSelect = ref(false)
    const lastScoreGain = ref(0)
    
    // タイマー参照
    let timerRef = null

    // フォニックス学習データ
    const phonicsData = reactive({
      1: {
      name: "基本の音",
      description: "英語の基本となる音を学ぼう！",
      phonemes: [
        { letter: 'a', sound: '/æ/', word: 'apple', emoji: '🍎', color: '#FF6B6B' },
        { letter: 't', sound: '/t/', word: 'tiger', emoji: '🐅', color: '#4ECDC4' },
        { letter: 'i', sound: '/ɪ/', word: 'igloo', emoji: '🏠', color: '#45B7D1' },
        { letter: 'p', sound: '/p/', word: 'pig', emoji: '🐷', color: '#96CEB4' },
        { letter: 'n', sound: '/n/', word: 'nest', emoji: '🪺', color: '#FECA57' },
        { letter: 's', sound: '/s/', word: 'sun', emoji: '☀️', color: '#FF9FF3' },
      ]
    },
      2: {
      name: "短母音マスター",
      description: "すべての短母音をマスターしよう！",
      phonemes: [
        { letter: 'e', sound: '/e/', word: 'egg', emoji: '🥚', color: '#FF6B6B' },
        { letter: 'o', sound: '/ɒ/', word: 'octopus', emoji: '🐙', color: '#4ECDC4' },
        { letter: 'u', sound: '/ʌ/', word: 'umbrella', emoji: '☂️', color: '#45B7D1' },
        { letter: 'm', sound: '/m/', word: 'mouse', emoji: '🐭', color: '#96CEB4' },
        { letter: 'd', sound: '/d/', word: 'dog', emoji: '🐕', color: '#FECA57' },
        { letter: 'g', sound: '/g/', word: 'goat', emoji: '🐐', color: '#FF9FF3' },
      ]
    },
      3: {
      name: "子音チャレンジ",
      description: "様々な子音を覚えよう！",
      phonemes: [
        { letter: 'c', sound: '/k/', word: 'cat', emoji: '🐱', color: '#FF6B6B' },
        { letter: 'k', sound: '/k/', word: 'kite', emoji: '🪁', color: '#4ECDC4' },
        { letter: 'r', sound: '/r/', word: 'rabbit', emoji: '🐰', color: '#45B7D1' },
        { letter: 'h', sound: '/h/', word: 'house', emoji: '🏠', color: '#96CEB4' },
        { letter: 'b', sound: '/b/', word: 'ball', emoji: '⚽', color: '#FECA57' },
        { letter: 'f', sound: '/f/', word: 'fish', emoji: '🐟', color: '#FF9FF3' },
      ]
    },
      4: {
      name: "長母音の世界",
      description: "長い音を学んでレベルアップ！",
      phonemes: [
        { letter: 'ai', sound: '/eɪ/', word: 'rain', emoji: '🌧️', color: '#FF6B6B' },
        { letter: 'ee', sound: '/iː/', word: 'tree', emoji: '🌳', color: '#4ECDC4' },
        { letter: 'oa', sound: '/əʊ/', word: 'boat', emoji: '🚤', color: '#45B7D1' },
        { letter: 'ie', sound: '/aɪ/', word: 'pie', emoji: '🥧', color: '#96CEB4' },
        { letter: 'oo', sound: '/uː/', word: 'moon', emoji: '🌙', color: '#FECA57' },
        { letter: 'ue', sound: '/juː/', word: 'blue', emoji: '💙', color: '#FF9FF3' },
      ]
    }
    })

    const currentPhonemes = computed(() => phonicsData[currentLevel.value].phonemes)
    const currentPhoneme = computed(() => currentPhonemes.value[currentPhonemeIndex.value])

    // 音声再生
    const playPhonemeSound = async () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      await playSound('word', { word: currentPhoneme.value.word })
      
      isPlaying.value = false
      if (gamePhase.value === 'listening') {
        gamePhase.value = 'choosing'
        startTimer()
      }
    }

    // タイマー管理
    const startTimer = () => {
      timeLeft.value = gameSettings.timeLimit
      isTimerActive.value = true
      timerRef = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          handleTimeUp()
        }
      }, 1000)
    }

    const stopTimer = () => {
      isTimerActive.value = false
      if (timerRef) {
        clearInterval(timerRef)
      }
    }

    const handleTimeUp = () => {
      stopTimer()
      lives.value--
      combo.value = 0
      showFeedback.value = true
      isCorrect.value = false
    
      setTimeout(() => {
        if (lives.value > 0) {
          nextPhoneme()
        } else {
          endGame()
        }
      }, 2000)
    }

    // 選択肢生成
    const generateChoices = () => {
      const correct = currentPhoneme.value
      const allOtherPhonemes = Object.values(phonicsData)
        .flatMap(level => level.phonemes)
        .filter(p => p.letter !== correct.letter)
      
      // 難易度に応じて選択肢の数を調整
      const numChoices = gameSettings.difficulty === 'easy' ? 3 : 
                        gameSettings.difficulty === 'normal' ? 4 : 6
      
      const incorrectChoices = []
      while (incorrectChoices.length < numChoices - 1) {
        const random = allOtherPhonemes[Math.floor(Math.random() * allOtherPhonemes.length)]
        if (!incorrectChoices.find(c => c.letter === random.letter)) {
          incorrectChoices.push(random)
        }
      }
      
      const choices = [correct, ...incorrectChoices]
      return shuffleArray(choices)
    }

    const shuffleArray = (array) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }

    // 選択肢選択
    const handleChoiceSelect = async (choice) => {
      if (gamePhase.value !== 'choosing' || selectedChoice.value) return
      
      stopTimer()
      selectedChoice.value = choice
      gamePhase.value = 'feedback'
      
      const correct = choice.letter === currentPhoneme.value.letter
      isCorrect.value = correct
      showFeedback.value = true
      
      if (correct) {
        await playSound('effect', 'correct')
        const baseScore = 100
        const comboBonus = combo.value * 20
        const timeBonus = Math.max(0, (timeLeft.value - 5) * 10)
        const totalScore = baseScore + comboBonus + timeBonus
        
        score.value += totalScore
        lastScoreGain.value = totalScore
        combo.value++
        streak.value++
        correctAnswers.value++
        showParticles.value = true
        
        // ゲーム進捗の更新
        gameStore.updateGameProgress('singlePhoneme', {
          bestScore: Math.max(score.value, gameStore.gameProgress.singlePhoneme?.bestScore || 0),
          correctAnswers: correctAnswers.value,
          totalQuestions: totalQuestions.value
        })
        
        setTimeout(() => {
          showParticles.value = false
        }, 1500)
      } else {
        await playSound('effect', 'incorrect')
        lives.value--
        combo.value = 0
        streak.value = 0
      }
      
      setTimeout(() => {
        if (!correct && lives.value <= 0) {
          endGame()
        } else {
          nextPhoneme()
        }
      }, 2500)
    }

    // 次の音素へ
    const nextPhoneme = () => {
      const nextIndex = currentPhonemeIndex.value + 1
      
      if (nextIndex >= currentPhonemes.value.length) {
        if (currentLevel.value < 4) {
          currentLevel.value++
          currentPhonemeIndex.value = 0
        } else {
          isGameFinished.value = true
          stopTimer()
          return
        }
      } else {
        currentPhonemeIndex.value = nextIndex
      }
      
      selectedChoice.value = null
      showFeedback.value = false
      gamePhase.value = 'listening'
      choices.value = generateChoices()
    }

    // ゲーム終了
    const endGame = () => {
      isGameFinished.value = true
      stopTimer()
      
      // 最終スコアの保存
      gameStore.updateGameProgress('singlePhoneme', {
        bestScore: Math.max(score.value, gameStore.gameProgress.singlePhoneme?.bestScore || 0),
        correctAnswers: correctAnswers.value,
        totalQuestions: totalQuestions.value,
        lastPlayed: new Date().toISOString()
      })
    }

    // ゲームリセット
    const resetGame = () => {
      currentLevel.value = 1
      currentPhonemeIndex.value = 0
      score.value = 0
      lives.value = 3
      combo.value = 0
      streak.value = 0
      correctAnswers.value = 0
      isGameFinished.value = false
      gamePhase.value = 'listening'
      selectedChoice.value = null
      showFeedback.value = false
      choices.value = generateChoices()
    }

    // 戻るボタン
    const handleBack = () => {
      router.back()
    }

    // ハブに戻る
    const goToHub = () => {
      router.push('/sound-adventure')
    }

    // レベル選択機能
    const selectLevel = (level) => {
      currentLevel.value = level
      currentPhonemeIndex.value = 0
      resetGame()
      showLevelSelect.value = false
    }

    // レベル用アイコン取得
    const getIconForLevel = (level) => {
      const icons = {
        1: '🎯',
        2: '🎪',
        3: '🚀',
        4: '🌟'
      }
      return icons[level] || '📚'
    }

    // 選択肢
    const choices = ref([])

    // 初期化
    onMounted(() => {
      choices.value = generateChoices()
    })

    return {
      currentLevel,
      currentPhoneme,
      score,
      lives,
      combo,
      isPlaying,
      gamePhase,
      selectedChoice,
      showFeedback,
      isCorrect,
      showParticles,
      timeLeft,
      isTimerActive,
      isGameFinished,
      correctAnswers,
      totalQuestions,
      choices,
      playPhonemeSound,
      handleChoiceSelect,
      resetGame,
      endGame,
      handleBack,
      goToHub,
      phonicsData,
      showLevelSelect,
      lastScoreGain,
      selectLevel,
      getIconForLevel
    }
  }
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

/* Galaxy-themed components - unified */
.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.8) 50%, 
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  color: white;
  padding: 0.5rem 1rem;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan-line 2s linear infinite;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

.energy-gauge {
  background: linear-gradient(90deg, 
    #60A5FA 0%, 
    #A78BFA 50%, 
    #F472B6 100%);
  transition: width 0.5s ease;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* CSS Custom Properties for Space Theme */
:root {
  --space-void: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a3e 25%, 
    #2d1b69 50%, 
    #1e1e3f 75%, 
    #0f0f23 100%);
}

/* Phoneme choice buttons hover effects */
.galaxy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(79, 172, 254, 0.6);
}

/* Custom animations for phonics game */
@keyframes phoneme-appear {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.phoneme-icon {
  animation: phoneme-appear 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>