<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    <!-- 背景の魔法の城 -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="castle-background opacity-20">
        <div class="castle-main">
          🏰
        </div>
        <div 
          class="castle-door transition-all duration-1000"
          :class="{ 'door-opening': doorOpening }"
        >
          🚪
        </div>
      </div>
    </div>

    <!-- 魔法のパーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="particle in magicParticles"
        :key="particle.id"
        class="absolute text-2xl animate-bounce opacity-60"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`
        }"
      >
        ✨
      </div>
    </div>

    <!-- ゲームヘッダー -->
    <div class="relative z-10 p-4">
      <div class="flex items-center justify-between mb-4">
        <button 
          @click="goBack"
          class="flex items-center gap-2 galaxy-button galaxy-button-secondary px-4 py-2 rounded-full font-bold transition-all shadow-lg"
        >
          <ArrowLeft class="w-5 h-5" />
          戻る
        </button>

        <h1 class="text-3xl font-bold text-center">
          <span class="galaxy-text-primary cosmic-glow">
            🏰 マジック・キャッスル・ジャンプ
          </span>
        </h1>

        <button 
          @click="toggleSound"
          :class="[
            'p-2 rounded-full font-bold transition-all shadow-lg',
            soundEnabled 
              ? 'galaxy-button galaxy-button-primary' 
              : 'galaxy-button galaxy-button-secondary'
          ]"
        >
          <Volume2 v-if="soundEnabled" class="w-5 h-5" />
          <VolumeX v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- ゲーム統計 -->
      <div class="flex justify-center gap-4 mb-6">
        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Trophy class="w-5 h-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ score }}</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Target class="w-5 h-5 text-blue-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ currentQuestion + 1 }}/{{ totalQuestions }}</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Heart class="w-5 h-5 text-red-400 cosmic-glow" />
            <div class="flex gap-1">
              <div 
                v-for="i in 3" 
                :key="i"
                :class="[
                  'w-3 h-3 rounded-full',
                  i <= lives ? 'bg-red-400' : 'bg-gray-600'
                ]"
              />
            </div>
          </div>
        </div>

        <div v-if="combo > 1" class="galaxy-card text-white rounded-2xl px-4 py-2 shadow-lg animate-pulse">
          <div class="flex items-center gap-2">
            <Flame class="w-5 h-5 cosmic-glow" />
            <span class="font-bold galaxy-text-primary">{{ combo }}連続！</span>
          </div>
        </div>
      </div>
    </div>

    <!-- メインゲームエリア -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
      <div v-if="gameState === 'playing'" class="text-center">
        <!-- 現在の単語表示 -->
        <div class="mb-8">
          <div class="text-lg text-galaxy-moon-silver mb-2">
            {{ gamePhase === 'showOriginal' ? '最初の単語' : 'E妖精が魔法をかけました！' }}
          </div>
          
          <div class="relative inline-block">
            <div 
              class="text-8xl font-bold mb-6 p-8 rounded-3xl shadow-2xl transition-all duration-500"
              :class="[
                gamePhase === 'showOriginal' 
                  ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-600 border-4 border-red-300' 
                  : 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600 border-4 border-teal-300'
              ]"
            >
              {{ displayWord }}
              
              <!-- E妖精 -->
              <div 
                v-if="gamePhase === 'showTransformed' && showEFairy"
                class="absolute -top-4 -right-4 fairy-bounce"
                :class="{ 'fairy-hop': fairyHopping }"
                @click="playWordSound(currentPair.long)"
              >
                <div class="relative cursor-pointer">
                  <div class="text-6xl">🧚‍♀️</div>
                  <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    E
                  </div>
                  <div class="absolute -top-2 -right-2 animate-ping">
                    ✨
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 音声再生ボタン -->
          <button
            @click="playCurrentWordSound"
            class="galaxy-button galaxy-button-primary px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 mb-6"
          >
            <div class="flex items-center gap-2">
              <Volume2 class="w-5 h-5" />
              音を聞く
            </div>
          </button>
        </div>

        <!-- ゲームフェーズ別コンテンツ -->
        <div v-if="gamePhase === 'showOriginal'" class="space-y-4">
          <p class="text-xl text-galaxy-moon-silver mb-6">
            E妖精が魔法をかけてくれます！<br>
            妖精をタップして魔法を発動させよう！
          </p>
          
          <button
            @click="castMagic"
            class="group relative galaxy-button galaxy-button-primary text-white px-12 py-6 rounded-3xl font-bold text-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div class="flex items-center gap-3">
              <div class="text-4xl group-hover:animate-bounce">🧚‍♀️</div>
              <span>魔法をかける！</span>
              <div class="text-2xl">✨</div>
            </div>
          </button>
        </div>

        <div v-else-if="gamePhase === 'showTransformed'" class="space-y-6">
          <p class="text-xl text-galaxy-moon-silver mb-6">
            単語が変身しました！<br>
            音の違いを聞き比べてみよう
          </p>

          <!-- 音声比較ボタン -->
          <div class="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <button
              @click="playWordSound(currentPair.short)"
              class="galaxy-button galaxy-button-secondary text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              <div class="text-center">
                <div class="text-2xl mb-2">🔊</div>
                <div class="text-lg">{{ currentPair.short }}</div>
                <div class="text-sm opacity-90">短い音</div>
              </div>
            </button>
            
            <button
              @click="playWordSound(currentPair.long)"
              class="galaxy-button galaxy-button-primary text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              <div class="text-center">
                <div class="text-2xl mb-2">🔊</div>
                <div class="text-lg">{{ currentPair.long }}</div>
                <div class="text-sm opacity-90">長い音</div>
              </div>
            </button>
          </div>

          <button
            @click="proceedToQuiz"
            class="galaxy-button galaxy-button-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            クイズに挑戦！
          </button>
        </div>

        <div v-else-if="gamePhase === 'quiz'" class="space-y-6">
          <p class="text-xl text-galaxy-moon-silver mb-6">
            {{ quizQuestion }}
          </p>

          <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              v-for="(option, index) in quizOptions"
              :key="index"
              @click="selectAnswer(option)"
              :disabled="answerSelected"
              :class="[
                'p-6 rounded-2xl font-bold text-2xl transition-all duration-200 border-4',
                getOptionClass(option)
              ]"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- 結果表示 -->
      <div v-else-if="gameState === 'result'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <div v-if="gameResult === 'correct'" class="space-y-4">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-3xl font-bold text-green-400 cosmic-glow mb-2">正解！</h3>
            <p class="text-lg text-galaxy-moon-silver mb-4">
              素晴らしい！E妖精の魔法で音が変わることがわかりましたね
            </p>
            <div class="text-2xl font-bold text-yellow-600">
              +{{ lastScoreGain }}点！
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="text-6xl mb-4">😅</div>
            <h3 class="text-3xl font-bold text-orange-400 cosmic-glow mb-2">惜しい！</h3>
            <p class="text-lg text-galaxy-moon-silver mb-4">
              もう一度音を聞いて、違いを感じてみよう
            </p>
            <div class="galaxy-card rounded-2xl p-4">
              <div class="text-lg font-bold text-galaxy-moon-silver">
                正解: {{ correctAnswer }}
              </div>
            </div>
          </div>

          <button
            @click="nextQuestion"
            class="w-full galaxy-button galaxy-button-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 mt-6"
          >
            {{ currentQuestion + 1 < totalQuestions ? '次の問題' : 'ゲーム終了' }}
          </button>
        </div>
      </div>

      <!-- ゲーム終了画面 -->
      <div v-else-if="gameState === 'finished'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-lg mx-auto">
          <div class="text-6xl mb-6">🏆</div>
          <h2 class="text-4xl font-bold galaxy-text-primary cosmic-glow mb-4">
            お疲れさまでした！
          </h2>
          
          <div class="space-y-4 mb-6">
            <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4">
              <div class="text-2xl font-bold text-yellow-700">最終スコア</div>
              <div class="text-4xl font-bold text-yellow-800">{{ score }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-blue-700">正解率</div>
                <div class="text-2xl font-bold text-blue-800">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</div>
              </div>
              <div class="bg-purple-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-purple-700">最大コンボ</div>
                <div class="text-2xl font-bold text-purple-800">{{ maxCombo }}</div>
              </div>
            </div>

            <!-- 習得した単語一覧 -->
            <div class="bg-green-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-green-700 mb-2">習得した魔法の単語</div>
              <div class="flex flex-wrap gap-2 justify-center">
                <span 
                  v-for="word in masteredWords" 
                  :key="word"
                  class="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold"
                >
                  {{ word }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="restartGame"
              class="flex-1 galaxy-button galaxy-button-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              もう一度プレイ
            </button>
            <button
              @click="goBack"
              class="flex-1 galaxy-button galaxy-button-secondary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>

      <!-- ゲームオーバー画面 -->
      <div v-else-if="gameState === 'gameOver'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <div class="text-6xl mb-4">😔</div>
          <h2 class="text-3xl font-bold text-red-400 cosmic-glow mb-4">ゲームオーバー</h2>
          <p class="text-lg text-galaxy-moon-silver mb-6">
            また挑戦して、E妖精の魔法をマスターしよう！
          </p>
          
          <div class="galaxy-card rounded-2xl p-4 mb-6">
            <div class="text-lg font-bold text-galaxy-moon-silver">最終スコア</div>
            <div class="text-3xl font-bold text-yellow-400 cosmic-glow">{{ score }}</div>
          </div>

          <div class="flex gap-4">
            <button
              @click="restartGame"
              class="flex-1 galaxy-button galaxy-button-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              リトライ
            </button>
            <button
              @click="goBack"
              class="flex-1 galaxy-button galaxy-button-secondary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- フィードバックエフェクト -->
    <div 
      v-if="showFeedback"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div 
        class="text-8xl animate-bounce"
        :class="{
          'animate-pulse': feedbackType === 'correct',
          'animate-bounce': feedbackType === 'incorrect'
        }"
      >
        {{ feedbackType === 'correct' ? '🎉' : '😅' }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { 
  ArrowLeft, Volume2, VolumeX, Trophy, Target, Heart, Flame, Play 
} from 'lucide-vue-next'

export default {
  name: 'MagicCastleJumpGame',
  components: {
    ArrowLeft,
    Volume2,
    VolumeX,
    Trophy,
    Target,
    Heart,
    Flame,
    Play
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()

    // ゲーム状態
    const gameState = ref('playing') // 'playing', 'result', 'finished', 'gameOver'
    const gamePhase = ref('showOriginal') // 'showOriginal', 'showTransformed', 'quiz'
    const currentQuestion = ref(0)
    const totalQuestions = ref(10)
    const score = ref(0)
    const lives = ref(3)
    const combo = ref(0)
    const maxCombo = ref(0)
    const correctAnswers = ref(0)
    const soundEnabled = ref(true)

    // 表示制御
    const showEFairy = ref(false)
    const fairyHopping = ref(false)
    const doorOpening = ref(false)
    const showFeedback = ref(false)
    const feedbackType = ref('')
    const answerSelected = ref(false)

    // ゲームデータ
    const gameResult = ref('')
    const lastScoreGain = ref(0)
    const correctAnswer = ref('')
    const masteredWords = ref([])

    // Magic E学習データ
    const magicEPairs = [
      // 初級レベル
      { short: 'bit', long: 'bite', level: 1 },
      { short: 'cut', long: 'cute', level: 1 },
      { short: 'cap', long: 'cape', level: 1 },
      { short: 'tap', long: 'tape', level: 1 },
      { short: 'hop', long: 'hope', level: 1 },
      { short: 'not', long: 'note', level: 1 },
      { short: 'kit', long: 'kite', level: 1 },
      { short: 'hat', long: 'hate', level: 1 },
      { short: 'mat', long: 'mate', level: 1 },
      { short: 'rat', long: 'rate', level: 1 },
      
      // 中級レベル
      { short: 'them', long: 'theme', level: 2 },
      { short: 'glob', long: 'globe', level: 2 },
      { short: 'shin', long: 'shine', level: 2 },
      { short: 'plan', long: 'plane', level: 2 },
      { short: 'slid', long: 'slide', level: 2 }
    ]

    const currentPair = ref({})
    const quizQuestion = ref('')
    const quizOptions = ref([])

    // 魔法パーティクル
    const magicParticles = ref(Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2
    })))

    // 計算プロパティ
    const displayWord = computed(() => {
      if (gamePhase.value === 'showOriginal') {
        return currentPair.value.short || ''
      } else {
        return currentPair.value.long || ''
      }
    })

    // ゲーム初期化
    const initGame = () => {
      currentQuestion.value = 0
      score.value = 0
      lives.value = 3
      combo.value = 0
      maxCombo.value = 0
      correctAnswers.value = 0
      masteredWords.value = []
      gameState.value = 'playing'
      loadNextQuestion()
    }

    // 次の問題を読み込み
    const loadNextQuestion = () => {
      if (currentQuestion.value >= totalQuestions.value) {
        finishGame()
        return
      }

      // ランダムな単語ペアを選択
      const availablePairs = magicEPairs.filter(pair => 
        pair.level <= (currentQuestion.value < 5 ? 1 : 2)
      )
      currentPair.value = availablePairs[Math.floor(Math.random() * availablePairs.length)]
      
      gamePhase.value = 'showOriginal'
      showEFairy.value = false
      answerSelected.value = false
      
      console.log('🎮 新しい問題:', currentPair.value)
    }

    // E妖精の魔法を発動
    const castMagic = () => {
      fairyHopping.value = true
      
      setTimeout(() => {
        gamePhase.value = 'showTransformed'
        showEFairy.value = true
        fairyHopping.value = false
        
        // 魔法のエフェクト
        doorOpening.value = true
        setTimeout(() => {
          doorOpening.value = false
        }, 1000)
        
        // 自動音声再生
        if (soundEnabled.value) {
          setTimeout(() => {
            playWordSound(currentPair.value.long)
          }, 500)
        }
      }, 800)
    }

    // クイズフェーズに進む
    const proceedToQuiz = () => {
      gamePhase.value = 'quiz'
      generateQuiz()
    }

    // クイズ問題生成
    const generateQuiz = () => {
      const quizTypes = [
        {
          question: `"${currentPair.value.long}" の音を聞いて、どちらが正しいですか？`,
          type: 'sound_identification'
        },
        {
          question: `E妖精の魔法で "${currentPair.value.short}" はどの単語になりましたか？`,
          type: 'word_transformation'
        },
        {
          question: `"${currentPair.value.short}" と "${currentPair.value.long}" のうち、長い音はどちらですか？`,
          type: 'long_short_comparison'
        }
      ]

      const selectedQuiz = quizTypes[Math.floor(Math.random() * quizTypes.length)]
      quizQuestion.value = selectedQuiz.question

      // 選択肢生成
      const wrongOptions = magicEPairs
        .filter(pair => pair.short !== currentPair.value.short)
        .slice(0, 1)

      if (selectedQuiz.type === 'sound_identification' || selectedQuiz.type === 'long_short_comparison') {
        quizOptions.value = [currentPair.value.long, currentPair.value.short]
        correctAnswer.value = currentPair.value.long
      } else {
        quizOptions.value = [currentPair.value.long, wrongOptions[0]?.long || 'plane']
        correctAnswer.value = currentPair.value.long
      }

      // シャッフル
      quizOptions.value = [...quizOptions.value].sort(() => Math.random() - 0.5)
    }

    // 回答選択
    const selectAnswer = (selectedOption) => {
      if (answerSelected.value) return
      
      answerSelected.value = true
      const isCorrect = selectedOption === correctAnswer.value

      if (isCorrect) {
        gameResult.value = 'correct'
        correctAnswers.value++
        combo.value++
        maxCombo.value = Math.max(maxCombo.value, combo.value)
        
        // スコア計算
        const baseScore = 10
        const comboBonus = combo.value > 1 ? (combo.value - 1) * 5 : 0
        lastScoreGain.value = baseScore + comboBonus
        score.value += lastScoreGain.value

        // 習得単語に追加
        if (!masteredWords.value.includes(currentPair.value.long)) {
          masteredWords.value.push(currentPair.value.long)
        }

        // 正解エフェクト
        showSuccessEffect()
      } else {
        gameResult.value = 'incorrect'
        lives.value--
        combo.value = 0
        lastScoreGain.value = 0

        // 失敗エフェクト
        showErrorEffect()

        if (lives.value <= 0) {
          setTimeout(() => {
            gameState.value = 'gameOver'
          }, 2000)
          return
        }
      }

      gameState.value = 'result'
    }

    // 次の問題へ
    const nextQuestion = () => {
      currentQuestion.value++
      if (currentQuestion.value >= totalQuestions.value) {
        finishGame()
      } else {
        gameState.value = 'playing'
        loadNextQuestion()
      }
    }

    // ゲーム終了
    const finishGame = () => {
      gameState.value = 'finished'
      
      // 進捗保存
      const gameData = {
        completed: true,
        bestScore: Math.max(gameStore.getGameProgress('magicCastleJump').bestScore, score.value),
        lastScore: score.value,
        masteredWords: masteredWords.value,
        progress: Math.min(100, Math.round((correctAnswers.value / totalQuestions.value) * 100))
      }

      gameStore.updateGameProgress('magicCastleJump', gameData)

      // 統計更新
      gameStore.updateGameStats('magicCastleJump', {
        correctAnswers: correctAnswers.value,
        totalAttempts: totalQuestions.value,
        playTime: 5 // 概算プレイ時間（分）
      })

      console.log('🎯 ゲーム完了:', gameData)
    }

    // ネイティブ英語音声再生
    const playWordSound = async (word) => {
      if (!soundEnabled.value || !word) return

      try {
        // ネイティブ英語話者のみを使用
        const voices = speechSynthesis.getVoices()
        const nativeEnglishVoice = voices.find(voice => 
          voice.lang === 'en-US' && 
          (voice.name.includes('Microsoft') || 
           voice.name.includes('Google') || 
           voice.name.includes('Samantha') ||
           voice.name.includes('Alex') ||
           voice.name.includes('Daniel') ||
           voice.name.includes('Karen')) &&
          !voice.name.includes('Japanese') &&
          !voice.name.includes('JP')
        ) || voices.find(voice => voice.lang === 'en-US')

        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        utterance.volume = 1.0
        
        if (nativeEnglishVoice) {
          utterance.voice = nativeEnglishVoice
          console.log('🎯 ネイティブ英語音声使用:', nativeEnglishVoice.name)
        }
        
        speechSynthesis.speak(utterance)
        
        console.log('🔊 音声再生:', word)
      } catch (error) {
        console.error('❌ 音声再生エラー:', error)
      }
    }

    const playCurrentWordSound = () => {
      if (gamePhase.value === 'showOriginal') {
        playWordSound(currentPair.value.short)
      } else {
        playWordSound(currentPair.value.long)
      }
    }

    // エフェクト
    const showSuccessEffect = () => {
      feedbackType.value = 'correct'
      showFeedback.value = true
      
      setTimeout(() => {
        showFeedback.value = false
      }, 1500)
    }

    // 選択肢のスタイルクラス
    const getOptionClass = (option) => {
      if (!answerSelected.value) {
        return 'bg-white hover:bg-blue-50 text-gray-700 border-gray-300 hover:border-blue-400 cursor-pointer'
      }
      
      if (option === correctAnswer.value) {
        return 'bg-green-500 text-white border-green-600'
      } else if (option !== correctAnswer.value) {
        return 'bg-red-500 text-white border-red-600'
      }
      
      return 'bg-gray-300 text-gray-600 border-gray-400'
    }

    // ユーティリティ関数
    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
    }

    const restartGame = () => {
      initGame()
    }

    const goBack = () => {
      router.back()
    }

    // キーボード操作
    const handleKeyPress = (event) => {
      if (gameState.value === 'playing') {
        if (gamePhase.value === 'showOriginal' && event.code === 'Space') {
          castMagic()
        } else if (gamePhase.value === 'showTransformed' && event.code === 'Enter') {
          proceedToQuiz()
        } else if (gamePhase.value === 'quiz') {
          if (event.key === '1' && quizOptions.value[0]) {
            selectAnswer(quizOptions.value[0])
          } else if (event.key === '2' && quizOptions.value[1]) {
            selectAnswer(quizOptions.value[1])
          }
        }
      } else if (gameState.value === 'result' && event.code === 'Enter') {
        nextQuestion()
      }
    }

    // ライフサイクル
    onMounted(() => {
      console.log('🏰 Magic Castle Jump ゲーム開始')
      initGame()
      window.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress)
    })

    return {
      // 状態
      gameState,
      gamePhase,
      currentQuestion,
      totalQuestions,
      score,
      lives,
      combo,
      maxCombo,
      correctAnswers,
      soundEnabled,
      showEFairy,
      fairyHopping,
      doorOpening,
      showFeedback,
      feedbackType,
      answerSelected,
      gameResult,
      lastScoreGain,
      correctAnswer,
      masteredWords,
      currentPair,
      quizQuestion,
      quizOptions,
      magicParticles,
      
      // 計算プロパティ
      displayWord,
      
      // メソッド
      castMagic,
      proceedToQuiz,
      selectAnswer,
      nextQuestion,
      playWordSound,
      playCurrentWordSound,
      getOptionClass,
      toggleSound,
      restartGame,
      goBack
    }
  }
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
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
  pointer-events: none;
  z-index: 0;
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

/* 城の背景アニメーション (魔法要素を維持) */
.castle-background {
  font-size: 12rem;
  position: relative;
  filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.5));
}

.castle-main {
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
}

.castle-door {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  transition: all 1s ease;
}

.door-opening {
  transform: translateX(-50%) scale(1.2);
  filter: brightness(1.3);
}

/* E妖精のアニメーション */
.fairy-bounce {
  animation: gentleBounce 2s ease-in-out infinite;
}

.fairy-hop {
  animation: fairyHop 0.8s ease-out;
}

@keyframes gentleBounce {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fairyHop {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-5deg);
  }
  50% {
    transform: scale(1.4) rotate(5deg);
  }
  75% {
    transform: scale(1.2) rotate(-2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 魔法エフェクト */
.magic-sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .castle-background {
    font-size: 8rem;
  }
  
  .castle-door {
    font-size: 2rem;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .fairy-bounce,
  .fairy-hop,
  .magic-sparkle {
    animation: none;
  }
}

/* タッチデバイス対応 */
@media (hover: none) {
  .galaxy-button:hover {
    transform: none;
  }
}
</style>