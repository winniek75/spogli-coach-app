<template>
  <div class="min-h-screen galaxy-background p-6 relative overflow-hidden">
    <!-- Animated star layers -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>
    <div class="max-w-4xl mx-auto">
      <!-- 戻るボタン -->
      <button
        @click="handleBack"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
      >
        ← 戻る
      </button>
      <h1 class="text-4xl font-bold galaxy-text-primary mb-8 text-center cosmic-glow">🏭 CVC ワード・ファクトリー</h1>
      <!-- 問題がない場合のエラー表示 -->
      <div v-if="questions.length === 0" class="galaxy-card rounded-3xl p-8 shadow-2xl text-center text-red-400 font-bold text-xl my-12">
        選択した条件に該当する問題がありません。<br>設定を見直してください。
        <div class="mt-6">
          <button @click="goToSettings" class="galaxy-button galaxy-button-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200">設定に戻る</button>
        </div>
      </div>
      <div v-else>
        <!-- ゲーム情報 -->
        <div class="galaxy-card rounded-3xl p-6 shadow-2xl mb-6">
          <div class="flex justify-between items-center mb-6">
            <div class="text-center">
              <div class="text-2xl font-bold galaxy-text-primary">レベル {{ currentLevel }}</div>
              <div class="text-galaxy-moon-silver">{{ cvcWordData[currentLevel].name }}</div>
            </div>
            <div class="flex gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-400">⭐ {{ score }}</div>
                <div class="text-galaxy-moon-silver">スコア</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-400">❤️ {{ lives }}</div>
                <div class="text-galaxy-moon-silver">ライフ</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-400">🔥 {{ combo }}</div>
                <div class="text-galaxy-moon-silver">コンボ</div>
              </div>
            </div>
          </div>
          <!-- タイマー -->
          <div class="w-full bg-galaxy-deep-space/30 rounded-full h-2 mb-6">
            <div 
              class="bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full h-2 transition-all duration-1000 cosmic-glow"
              :style="{ width: `${(timeLeft / 20) * 100}%` }"
            ></div>
          </div>
        </div>
        <!-- メインゲームエリア -->
        <div class="galaxy-card rounded-3xl p-6 shadow-2xl">
          <!-- 遊び方説明文 -->
          <div class="mb-6 text-center">
            <div class="text-lg font-semibold galaxy-text-primary">聞こえた単語を3つの文字で正しく組み立てよう！</div>
            <div class="text-sm text-galaxy-moon-silver mt-1">「単語を聞く」ボタンを押して、音をよく聞いてから文字を選んでください。</div>
          </div>
          <!-- 単語を聞くボタン -->
          <div class="flex justify-center mb-6">
            <button
              @click="playWordSound"
              :disabled="isPlaying"
              class="galaxy-button galaxy-button-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5l-7 7h4v6h6v-6h4l-7-7z" /></svg>
              <span>{{ isPlaying ? '再生中...' : '単語を聞く' }}</span>
            </button>
          </div>
          <!-- 選択した文字 -->
          <div v-if="currentWord" class="flex justify-center gap-2 mb-6">
            <button
              v-for="(letter, idx) in selectedLetters"
              :key="'selected-' + idx"
              @click="removeLetter(idx)"
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg bg-gradient-to-br letter-button"
              :style="{ background: getLetterColor(letter) }"
            >
              {{ letter }}
            </button>
          </div>
          <!-- 文字選択肢 -->
          <div v-if="currentWord" class="grid grid-cols-4 gap-4 mb-6">
            <button
              v-for="letter in availableLetters"
              :key="'avail-' + letter"
              @click="selectLetter(letter)"
              :disabled="selectedLetters.filter(l => l).length >= currentWord.sounds.length"
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg bg-gradient-to-br letter-button transition-transform duration-200"
              :style="{ background: getLetterColor(letter) }"
            >
              {{ letter }}
            </button>
          </div>
          <!-- チェックボタン -->
          <div v-if="currentWord" class="flex justify-center">
            <button
              @click="checkAnswer()"
              :disabled="selectedLetters.filter(l => l).length !== currentWord.sounds.length"
              class="galaxy-button galaxy-button-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <CheckCircle class="w-5 h-5 inline-block mr-2" /> チェック
            </button>
          </div>
        </div>
        <!-- フィードバック -->
        <div v-if="showFeedback" class="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
          <div class="galaxy-card rounded-3xl p-8 text-center cosmic-glow">
            <div class="text-6xl mb-4">{{ isCorrect ? '🎉' : '😢' }}</div>
            <div class="text-2xl font-bold mb-2 galaxy-text-primary">{{ isCorrect ? '正解！' : '不正解...' }}</div>
            <div class="text-galaxy-moon-silver">{{ isCorrect ? '素晴らしい！' : 'もう一度挑戦しよう！' }}</div>
          </div>
        </div>
        <!-- 終了モーダル -->
        <div v-if="isGameFinished" class="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div class="galaxy-card rounded-3xl p-8 text-center max-w-md w-full mx-4 cosmic-glow">
            <div class="text-6xl mb-4">🏆</div>
            <div class="text-2xl font-bold mb-2 galaxy-text-primary">全問クリア！</div>
            <div class="text-galaxy-moon-silver mb-6">おめでとうございます！CVCワード・ファクトリーを達成しました。</div>
            <button
              @click="goToHub"
              class="w-full galaxy-button galaxy-button-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 mb-2"
            >
              ハブに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameSettingsStore } from '../../stores/gameSettings'
import { CheckCircle } from 'lucide-vue-next'

export default {
  name: 'CvcWordGame',
  components: {
    CheckCircle
  },
  setup() {
    const router = useRouter()
    const store = useGameSettingsStore()

    // ゲーム状態管理
    const gamePhase = ref('menu') // menu, playing, result
    const currentWordIndex = ref(0)
    const score = ref(0)
    const lives = ref(3)
    const combo = ref(0)
    const maxCombo = ref(0)
    const timeLeft = ref(20)
    const isTimerActive = ref(false)
    const selectedLetters = ref(['', '', ''])
    const availableLetters = ref([])
    const showFeedback = ref(false)
    const isCorrect = ref(false)
    const showParticles = ref(false)
    const isPlaying = ref(false)
    const streak = ref(0)
    const correctAnswers = ref(0)
    const hintsUsed = ref(0)
    const showHint = ref(false)
    const isGameFinished = ref(false)

    // 参照
    let timerRef = null

    // ストアからデータを取得
    const {
      gameMode,
      currentLevel,
      selectedCategory,
      selectedSubcategory,
      difficulty,
      questionCount,
      getQuestions
    } = store

    // 現在の問題を取得
    const questions = computed(() => getQuestions())
    const currentWord = computed(() => questions.value[currentWordIndex.value])

    // CVC単語データ（レベル別・テーマ別）
    const cvcWordData = reactive({
      1: { // レベル1: 基本的なCVC単語
        name: "基本CVC工場",
        description: "子音-母音-子音の基本パターンを学ぼう！",
        timeLimit: 20,
        theme: "動物と日用品",
        words: [
          { 
            word: 'cat', 
            sounds: ['c', 'a', 't'], 
            emoji: '🐱', 
            hint: 'ニャーと鳴く可愛いペット',
            category: 'animals'
          },
          { 
            word: 'dog', 
            sounds: ['d', 'o', 'g'], 
            emoji: '🐕', 
            hint: 'ワンワンと鳴く忠実な友達',
            category: 'animals'
          },
          { 
            word: 'hat', 
            sounds: ['h', 'a', 't'], 
            emoji: '🎩', 
            hint: '頭にかぶるファッションアイテム',
            category: 'clothes'
          },
          { 
            word: 'sun', 
            sounds: ['s', 'u', 'n'], 
            emoji: '☀️', 
            hint: '昼間に空で輝く明るい星',
            category: 'nature'
          },
          { 
            word: 'cup', 
            sounds: ['c', 'u', 'p'], 
            emoji: '☕', 
            hint: '飲み物を入れる容器',
            category: 'items'
          },
          { 
            word: 'pen', 
            sounds: ['p', 'e', 'n'], 
            emoji: '🖊️', 
            hint: '文字を書くための道具',
            category: 'items'
          },
          { 
            word: 'bag', 
            sounds: ['b', 'a', 'g'], 
            emoji: '👜', 
            hint: '物を入れて持ち運ぶもの',
            category: 'items'
          },
          { 
            word: 'fox', 
            sounds: ['f', 'o', 'x'], 
            emoji: '🦊', 
            hint: 'オレンジ色でふわふわの尻尾の動物',
            category: 'animals'
          }
        ]
      },
      2: { // レベル2: 中級CVC単語
        name: "アドバンス工場",
        description: "より多様なCVCパターンに挑戦！",
        timeLimit: 18,
        theme: "アクションと感情",
        words: [
          { 
            word: 'run', 
            sounds: ['r', 'u', 'n'], 
            emoji: '🏃', 
            hint: '速く移動すること',
            category: 'actions'
          },
          { 
            word: 'win', 
            sounds: ['w', 'i', 'n'], 
            emoji: '🏆', 
            hint: '競争や試合で1位になること',
            category: 'actions'
          },
          { 
            word: 'hop', 
            sounds: ['h', 'o', 'p'], 
            emoji: '🦘', 
            hint: 'カンガルーのように跳ぶこと',
            category: 'actions'
          },
          { 
            word: 'dig', 
            sounds: ['d', 'i', 'g'], 
            emoji: '⛏️', 
            hint: '地面に穴を掘ること',
            category: 'actions'
          },
          { 
            word: 'hug', 
            sounds: ['h', 'u', 'g'], 
            emoji: '🤗', 
            hint: '愛情を込めて抱きしめること',
            category: 'actions'
          },
          { 
            word: 'zip', 
            sounds: ['z', 'i', 'p'], 
            emoji: '🤐', 
            hint: 'ファスナーを閉めること',
            category: 'actions'
          },
          { 
            word: 'job', 
            sounds: ['j', 'o', 'b'], 
            emoji: '💼', 
            hint: 'お金をもらってする仕事',
            category: 'concepts'
          },
          { 
            word: 'fun', 
            sounds: ['f', 'u', 'n'], 
            emoji: '🎉', 
            hint: '楽しい気持ちや体験',
            category: 'concepts'
          }
        ]
      },
      3: { // レベル3: 上級CVC単語
        name: "マスター工場",
        description: "難易度の高いCVCパターンを完璧に！",
        timeLimit: 15,
        theme: "自然と環境",
        words: [
          { 
            word: 'bug', 
            sounds: ['b', 'u', 'g'], 
            emoji: '🐛', 
            hint: '小さな昆虫',
            category: 'nature'
          },
          { 
            word: 'mud', 
            sounds: ['m', 'u', 'd'], 
            emoji: '🟤', 
            hint: '土と水が混ざったもの',
            category: 'nature'
          },
          { 
            word: 'web', 
            sounds: ['w', 'e', 'b'], 
            emoji: '🕸️', 
            hint: 'クモが作る巣',
            category: 'nature'
          },
          { 
            word: 'log', 
            sounds: ['l', 'o', 'g'], 
            emoji: '🪵', 
            hint: '切られた木の幹',
            category: 'nature'
          },
          { 
            word: 'gem', 
            sounds: ['g', 'e', 'm'], 
            emoji: '💎', 
            hint: '美しく輝く貴重な石',
            category: 'items'
          },
          { 
            word: 'box', 
            sounds: ['b', 'o', 'x'], 
            emoji: '📦', 
            hint: '物を入れる四角い容器',
            category: 'items'
          }
        ]
      }
    })

    const currentLevelData = computed(() => cvcWordData[currentLevel.value])

    // 文字の色分け
    const letterColors = {
      // 子音
      'b': '#FF6B6B', 'c': '#4ECDC4', 'd': '#45B7D1', 'f': '#96CEB4', 'g': '#FECA57',
      'h': '#FF9FF3', 'j': '#54A0FF', 'k': '#5F27CD', 'l': '#00D2D3', 'm': '#FF9F43',
      'n': '#10AC84', 'p': '#EE5A24', 'r': '#0984E3', 's': '#A29BFE', 't': '#FD79A8',
      'v': '#FDCB6E', 'w': '#6C5CE7', 'x': '#74B9FF', 'z': '#00B894',
      // 母音
      'a': '#E74C3C', 'e': '#3498DB', 'i': '#9B59B6', 'o': '#F39C12', 'u': '#27AE60'
    }

    const getLetterColor = (letter) => {
      return `linear-gradient(135deg, ${letterColors[letter] || '#ccc'}, #fff 80%)`
    }

    // 利用可能な文字を生成
    const generateAvailableLetters = () => {
      if (!currentWord.value) return []
      
      const correctLetters = [...currentWord.value.sounds]
      const allLetters = [
        'a', 'e', 'i', 'o', 'u', // 母音
        'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'z' // 子音
      ]
      
      const distractorLetters = allLetters.filter(letter => !correctLetters.includes(letter))
      const selectedDistractors = []
      
      // レベルに応じてダミー文字数を調整
      const numDistractors = currentLevel.value === 1 ? 6 : currentLevel.value === 2 ? 8 : 10
      
      for (let i = 0; i < numDistractors && selectedDistractors.length < numDistractors; i++) {
        const randomIndex = Math.floor(Math.random() * distractorLetters.length)
        const letter = distractorLetters.splice(randomIndex, 1)[0]
        if (letter) selectedDistractors.push(letter)
      }
      
      return shuffleArray([...correctLetters, ...selectedDistractors])
    }

    const shuffleArray = (array) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }

    // 音声再生
    const playWordSound = async () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.7
      utterance.pitch = 1.1
      utterance.volume = 1.0
      
      utterance.onend = () => {
        isPlaying.value = false
      }
      
      speechSynthesis.speak(utterance)
    }

    // 個別音素再生
    const playLetterSound = async (letter) => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      const utterance = new SpeechSynthesisUtterance(letter)
      utterance.lang = 'en-US'
      utterance.rate = 0.5
      utterance.pitch = 1.3
      utterance.volume = 1.0
      
      utterance.onend = () => {
        isPlaying.value = false
      }
      
      speechSynthesis.speak(utterance)
    }

    // タイマー管理
    const startTimer = () => {
      timeLeft.value = currentLevelData.value.timeLimit
      isTimerActive.value = true
      timerRef = setInterval(() => {
        timeLeft.value = Math.max(0, timeLeft.value - 1)
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
      lives.value = Math.max(0, lives.value - 1)
      combo.value = 0
      showFeedback.value = true
      isCorrect.value = false
      
      setTimeout(() => {
        if (lives.value > 0) {
          nextWord()
        } else {
          endGame()
        }
      }, 2500)
    }

    // ゲーム開始
    const startGame = () => {
      gamePhase.value = 'playing'
      currentWordIndex.value = 0
      score.value = 0
      lives.value = 3
      combo.value = 0
      maxCombo.value = 0
      correctAnswers.value = 0
      streak.value = 0
      hintsUsed.value = 0
      selectedLetters.value = ['', '', '']
      showFeedback.value = false
      showHint.value = false
      availableLetters.value = generateAvailableLetters()
      startTimer()
    }

    // 文字選択
    const selectLetter = (letter) => {
      const emptyIndex = selectedLetters.value.findIndex(slot => slot === '')
      if (emptyIndex !== -1) {
        const newSelectedLetters = [...selectedLetters.value]
        newSelectedLetters[emptyIndex] = letter
        selectedLetters.value = newSelectedLetters
        
        // 3文字揃ったら自動チェック
        if (emptyIndex === 2) {
          setTimeout(() => {
            checkAnswer()
          }, 500)
        }
      }
    }

    // 文字削除
    const removeLetter = (index) => {
      const newSelectedLetters = [...selectedLetters.value]
      newSelectedLetters[index] = ''
      selectedLetters.value = newSelectedLetters
    }

    // 答えチェック
    const checkAnswer = (lettersToCheck = selectedLetters.value) => {
      if (lettersToCheck.some(letter => letter === '')) return
      
      stopTimer()
      
      const userWord = lettersToCheck.join('')
      const correct = userWord === currentWord.value.word
      
      isCorrect.value = correct
      showFeedback.value = true
      
      if (correct) {
        const baseScore = 100
        const comboBonus = combo.value * 30
        const timeBonus = Math.max(0, timeLeft.value * 5)
        const levelBonus = currentLevel.value * 50
        const hintPenalty = hintsUsed.value * 10
        const totalScore = Math.max(0, baseScore + comboBonus + timeBonus + levelBonus - hintPenalty)
        
        score.value = score.value + totalScore
        combo.value = combo.value + 1
        maxCombo.value = Math.max(maxCombo.value, combo.value)
        streak.value = streak.value + 1
        correctAnswers.value = correctAnswers.value + 1
        showParticles.value = true
        
        setTimeout(() => showParticles.value = false, 2000)
      } else {
        lives.value = Math.max(0, lives.value - 1)
        combo.value = 0
        streak.value = 0
      }
      
      setTimeout(() => {
        if (!correct && lives.value <= 0) {
          endGame()
        } else {
          nextWord()
        }
      }, 3000)
    }

    // ヒント表示
    const toggleHint = () => {
      if (!showHint.value) {
        hintsUsed.value = hintsUsed.value + 1
        score.value = Math.max(0, score.value - 20) // ヒント使用でスコア減点
      }
      showHint.value = !showHint.value
    }

    // 次の単語
    const nextWord = () => {
      const nextIndex = currentWordIndex.value + 1
      
      if (nextIndex >= Math.min(questionCount.value, currentLevelData.value.words.length)) {
        endGame()
        return
      }
      
      currentWordIndex.value = nextIndex
      selectedLetters.value = ['', '', '']
      showFeedback.value = false
      showHint.value = false
      availableLetters.value = generateAvailableLetters()
      startTimer()
    }

    // ゲーム終了
    const endGame = () => {
      stopTimer()
      isGameFinished.value = true
      gamePhase.value = 'result'
    }

    // ゲームリセット
    const resetToMenu = () => {
      gamePhase.value = 'menu'
      currentWordIndex.value = 0
      score.value = 0
      lives.value = 3
      combo.value = 0
      maxCombo.value = 0
      correctAnswers.value = 0
      streak.value = 0
      hintsUsed.value = 0
      selectedLetters.value = ['', '', '']
      showFeedback.value = false
      showHint.value = false
    }

    // 結果評価の取得
    const getResultGrade = () => {
      const accuracy = (correctAnswers.value / Math.min(questionCount.value, currentWordIndex.value + 1)) * 100
      const efficiency = Math.max(0, 100 - (hintsUsed.value * 5)) // ヒント使用による効率性評価
      const overallScore = (accuracy + efficiency) / 2
      
      if (overallScore >= 90) return { grade: 'S', color: 'from-yellow-400 to-yellow-600', message: '完璧！CVC マスター！' }
      if (overallScore >= 80) return { grade: 'A', color: 'from-green-400 to-green-600', message: '素晴らしい工場長！' }
      if (overallScore >= 70) return { grade: 'B', color: 'from-blue-400 to-blue-600', message: '良い仕事です！' }
      if (overallScore >= 60) return { grade: 'C', color: 'from-purple-400 to-purple-600', message: 'もう少し練習！' }
      return { grade: 'D', color: 'from-gray-400 to-gray-600', message: '基礎から頑張ろう！' }
    }

    // 戻るボタン
    const handleBack = () => {
      router.back()
    }

    // ハブに戻る
    const goToHub = () => {
      router.push('/sound-adventure')
    }

    // ルーターへ戻る
    const goToSettings = () => {
      router.push('/games/cvc/settings')
    }

    // エフェクト
    onMounted(() => {
      if (currentWord.value) {
        availableLetters.value = generateAvailableLetters()
      }
    })

    onUnmounted(() => {
      stopTimer()
    })

    // パーティクル生成
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3
    }))

    return {
      gamePhase,
      currentLevel,
      currentWordIndex,
      score,
      lives,
      combo,
      maxCombo,
      timeLeft,
      isTimerActive,
      selectedLetters,
      availableLetters,
      showFeedback,
      isCorrect,
      showParticles,
      isPlaying,
      streak,
      correctAnswers,
      questionCount,
      hintsUsed,
      showHint,
      currentWord,
      letterColors,
      getLetterColor,
      generateAvailableLetters,
      shuffleArray,
      playWordSound,
      playLetterSound,
      startTimer,
      stopTimer,
      handleTimeUp,
      startGame,
      selectLetter,
      removeLetter,
      checkAnswer,
      toggleHint,
      nextWord,
      endGame,
      resetToMenu,
      getResultGrade,
      particles,
      isGameFinished,
      handleBack,
      goToHub,
      goToSettings
    }
  }
}
</script>

<style scoped>
/* Galaxy Theme Styles */
.galaxy-background {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 75%, #000000 100%);
  position: relative;
}

.galaxy-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.galaxy-button {
  position: relative;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.galaxy-button:hover::before {
  left: 100%;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.galaxy-button-primary:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(148, 163, 184, 0.4);
}

.galaxy-button-secondary:hover {
  box-shadow: 0 6px 20px rgba(148, 163, 184, 0.6);
  transform: translateY(-2px);
}

.galaxy-text-primary {
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.5);
}

.text-galaxy-moon-silver {
  color: #94a3b8;
}

.galaxy-deep-space {
  color: #1e293b;
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px rgba(147, 197, 253, 0.5));
}

/* Animated Stars */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.stars-layer-1 {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #ddd, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 3s linear infinite;
}

.stars-layer-2 {
  background-image: 
    radial-gradient(1px 1px at 40px 60px, #fff, transparent),
    radial-gradient(1px 1px at 80px 10px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 120px 50px, #eee, transparent),
    radial-gradient(1px 1px at 180px 80px, rgba(255,255,255,0.5), transparent);
  background-repeat: repeat;
  background-size: 220px 120px;
  animation: sparkle 4s linear infinite reverse;
}

.stars-layer-3 {
  background-image: 
    radial-gradient(1px 1px at 60px 20px, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 100px 90px, #fff, transparent),
    radial-gradient(1px 1px at 150px 60px, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat;
  background-size: 180px 90px;
  animation: sparkle 5s linear infinite;
}

@keyframes sparkle {
  from { transform: translateX(0); }
  to { transform: translateX(-200px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Letter button enhancements for galaxy theme */
.letter-button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.letter-button::before {
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

.letter-button:hover::before {
  width: 100%;
  height: 100%;
}

.letter-button:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}
</style>