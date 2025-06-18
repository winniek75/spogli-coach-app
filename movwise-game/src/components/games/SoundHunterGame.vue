<template>
  <div class="min-h-screen galaxy-background p-6">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    <div class="max-w-4xl mx-auto relative z-10">
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
      
      <h1 class="text-4xl font-bold galaxy-text-primary cosmic-glow mb-8 text-center">🎯 サウンド・ハンター</h1>
      
      <!-- レベル選択モーダル -->
      <div v-if="showLevelSelect" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div class="galaxy-card p-8 text-center max-w-3xl w-full mx-4">
          <div class="text-3xl font-bold mb-6 galaxy-text-primary cosmic-glow">レベルを選択</div>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div
              v-for="level in availableLevels"
              :key="level.id"
              @click="selectLevel(level.id)"
              class="galaxy-card hover:galaxy-button-primary cursor-pointer p-4 transition-all duration-200"
            >
              <div class="text-2xl mb-2">{{ level.icon }}</div>
              <div class="text-lg font-bold galaxy-text-primary">{{ level.name }}</div>
              <div class="text-sm text-galaxy-moon-silver">{{ level.description }}</div>
              <div class="text-xs text-galaxy-moon-silver mt-2">{{ level.questionCount }}問</div>
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
      <div class="galaxy-card p-6">
        <!-- レベル情報と選択ボタン -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-center">
            <div class="text-xl font-bold galaxy-text-primary cosmic-glow">{{ currentLevelInfo.name }}</div>
            <div class="text-sm text-galaxy-moon-silver">{{ currentLevelInfo.description }}</div>
            <button
              @click="showLevelSelect = true"
              class="galaxy-button galaxy-button-secondary text-sm mt-2 px-3 py-1"
            >
              レベル変更
            </button>
          </div>
          <div class="text-center">
            <div class="text-galaxy-moon-silver text-sm">音を聞いて、正しい文字を選ぼう！</div>
          </div>
        </div>
        
        <div v-if="isGameFinished" class="text-center">
          <div class="text-5xl mb-4">🏆</div>
          <div class="text-2xl font-bold galaxy-text-primary cosmic-glow mb-2">ゲームクリア！</div>
          <div class="text-galaxy-moon-silver mb-2">スコア: {{ score }}/{{ questions.length * 100 }}</div>
          <div class="text-yellow-400 mb-6">正答率: {{ Math.round((score / 100) / questions.length * 100) }}%</div>
          <div class="flex gap-4 justify-center">
            <button @click="resetGame" class="galaxy-button galaxy-button-primary px-6 py-3 font-bold">もう一度</button>
            <button @click="showLevelSelect = true" class="galaxy-button galaxy-button-secondary px-6 py-3 font-bold">レベル変更</button>
          </div>
        </div>
        <div v-else>
          <div class="flex justify-between items-center mb-4">
            <div class="text-lg font-bold galaxy-text-primary cosmic-glow">問題 {{ currentIndex + 1 }}/{{ questions.length }}</div>
            <div class="text-lg font-bold text-yellow-400 cosmic-glow">⭐ {{ score }}</div>
          </div>
          <div class="text-center mb-8">
            <button @click="playCurrentSound" :disabled="isPlaying" class="galaxy-button galaxy-button-primary px-6 py-3 font-bold disabled:opacity-50">
              <span v-if="isPlaying">再生中...</span>
              <span v-else>音を聞く</span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <button
              v-for="(choice, index) in currentChoices"
              :key="choice"
              @click="selectChoice(choice)"
              :disabled="selectedChoice || isPlaying"
              :class="[
                'choice-button p-4 rounded-xl text-center transition-all duration-200',
                selectedChoice === choice
                  ? (isCorrect ? 'galaxy-button galaxy-button-primary cosmic-glow' : 'bg-red-500 text-white')
                  : 'galaxy-card hover:galaxy-button-secondary'
              ]"
              :style="{ animationDelay: (index * 0.1 + 0.1) + 's' }"
            >
              <div class="text-2xl font-bold mb-2 text-white">{{ choice }}</div>
            </button>
          </div>
          <div v-if="showFeedback" class="text-center mb-4">
            <div class="text-4xl mb-2 cosmic-glow">{{ isCorrect ? '🎉 正解！' : '😢 不正解...' }}</div>
            <div class="text-galaxy-moon-silver mb-2">{{ feedbackMessage }}</div>
            <div v-if="!isCorrect && currentQuestion?.explanation" class="galaxy-card p-4 mt-4 text-left">
              <div class="text-lg font-bold galaxy-text-primary cosmic-glow mb-2">💡 解説</div>
              <div class="text-galaxy-moon-silver mb-3">{{ currentQuestion.explanation }}</div>
              <div class="text-sm text-blue-300 mb-1">
                <span class="font-bold">意味：</span>{{ currentQuestion.word_meaning }}
              </div>
              <div class="text-sm text-green-300">
                <span class="font-bold">発音のコツ：</span>{{ currentQuestion.sound_tip }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameAudio } from '@/composables/useGameAudio'
import soundHunterData from '@/data/csv/sound_hunter.json'
import { NATIVE_AUDIO_MAPPING, JAPANESE_LEARNER_TIPS } from '@/data/native-phoneme-database.js'

export default {
  name: 'SoundHunterGame',
  setup() {
    const router = useRouter()
    const { playSound, isPlaying } = useGameAudio()
    const questions = ref([])
    const currentIndex = ref(0)
    const score = ref(0)
    const isGameFinished = ref(false)
    const selectedChoice = ref(null)
    const isCorrect = ref(false)
    const showFeedback = ref(false)
    const feedbackMessage = ref('')
    const showLevelSelect = ref(false)
    const currentLevel = ref(1)

    // レベル定義
    const availableLevels = ref([
      {
        id: 1,
        name: 'ビギナー',
        description: '基本的な音素（a, e, i, o, u, s, t, n）',
        icon: '🌱',
        questionCount: 8
      },
      {
        id: 2,
        name: 'エレメンタリー',
        description: '短母音と基本子音',
        icon: '🌟',
        questionCount: 10
      },
      {
        id: 3,
        name: 'インターミディエート',
        description: '長母音とダイグラフ',
        icon: '🚀',
        questionCount: 12
      },
      {
        id: 4,
        name: 'アドバンス',
        description: '複雑な音韻パターン',
        icon: '🏆',
        questionCount: 15
      },
      {
        id: 5,
        name: 'エキスパート',
        description: '全ての音素とパターン',
        icon: '👑',
        questionCount: 20
      },
      {
        id: 6,
        name: 'ランダム',
        description: 'すべてのレベルからランダム',
        icon: '🎲',
        questionCount: 10
      }
    ])

    // 問題データをシャッフルしてセット
    const shuffleArray = (array) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }

    // レベル別問題フィルタリング
    const getQuestionsForLevel = (level) => {
      let filteredData = []
      
      switch(level) {
        case 1: // ビギナー
          filteredData = soundHunterData.filter(q => 
            ['a', 'e', 'i', 'o', 'u', 's', 't', 'n', 'm', 'p'].includes(q.correct_phoneme)
          )
          break
        case 2: // エレメンタリー
          filteredData = soundHunterData.filter(q => 
            q.level <= 2 || ['b', 'd', 'g', 'h', 'k', 'l', 'r'].includes(q.correct_phoneme)
          )
          break
        case 3: // インターミディエート
          filteredData = soundHunterData.filter(q => 
            q.level <= 3 || q.correct_phoneme.length > 1
          )
          break
        case 4: // アドバンス
          filteredData = soundHunterData.filter(q => 
            q.level >= 3 && q.difficulty === 'hard'
          )
          break
        case 5: // エキスパート
          filteredData = soundHunterData.filter(q => 
            q.level >= 4 || q.difficulty === 'expert'
          )
          break
        default: // ランダム
          filteredData = soundHunterData
      }
      
      // フィルタ後のデータが少ない場合は全データを使用
      if (filteredData.length < 5) {
        filteredData = soundHunterData
      }
      
      const questionCount = availableLevels.value.find(l => l.id === level)?.questionCount || 10
      return shuffleArray(filteredData).slice(0, questionCount)
    }

    // 現在のレベル情報
    const currentLevelInfo = computed(() => 
      availableLevels.value.find(l => l.id === currentLevel.value) || availableLevels.value[0]
    )

    // レベル選択
    const selectLevel = (level) => {
      currentLevel.value = level
      questions.value = getQuestionsForLevel(level)
      resetGame()
      showLevelSelect.value = false
    }

    // 戻るボタン
    const handleBack = () => {
      router.back()
    }

    onMounted(() => {
      // 初期レベルでゲーム開始
      questions.value = getQuestionsForLevel(currentLevel.value)
      resetState()
    })

    const currentQuestion = computed(() => questions.value[currentIndex.value])
    const currentChoices = computed(() => {
      if (!currentQuestion.value) return []
      const choices = [
        currentQuestion.value.correct_phoneme,
        currentQuestion.value.distractor1,
        currentQuestion.value.distractor2,
        currentQuestion.value.distractor3
      ]
      return shuffleArray(choices)
    })

    const playCurrentSound = async () => {
      if (!currentQuestion.value) return
      await playSound('word', { word: currentQuestion.value.word })
    }

    const selectChoice = async (choice) => {
      if (selectedChoice.value) return
      selectedChoice.value = choice
      isCorrect.value = choice === currentQuestion.value.correct_phoneme
      showFeedback.value = true
      feedbackMessage.value = isCorrect.value ? '素晴らしい！' : `正解は「${currentQuestion.value.correct_phoneme}」でした。`
      if (isCorrect.value) {
        score.value += 100
        await playSound('effect', 'correct')
      } else {
        await playSound('effect', 'incorrect')
      }
      setTimeout(() => {
        nextQuestion()
      }, isCorrect.value ? 1800 : 4000) // 不正解の場合は解説を読む時間を長く
    }

    const nextQuestion = () => {
      if (currentIndex.value + 1 >= questions.value.length) {
        isGameFinished.value = true
      } else {
        currentIndex.value++
        resetState()
      }
    }

    const resetState = () => {
      selectedChoice.value = null
      isCorrect.value = false
      showFeedback.value = false
      feedbackMessage.value = ''
    }

    const resetGame = () => {
      questions.value = getQuestionsForLevel(currentLevel.value)
      currentIndex.value = 0
      score.value = 0
      isGameFinished.value = false
      resetState()
    }

    return {
      questions,
      currentIndex,
      score,
      isGameFinished,
      selectedChoice,
      isCorrect,
      showFeedback,
      feedbackMessage,
      currentChoices,
      playCurrentSound,
      selectChoice,
      resetGame,
      isPlaying,
      showLevelSelect,
      availableLevels,
      currentLevelInfo,
      selectLevel,
      handleBack,
      currentQuestion
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
  border-radius: 0.75rem;
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

/* Hover effects for galaxy cards */
.galaxy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(79, 172, 254, 0.6);
}

/* Hover effects for buttons */
.galaxy-button:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 0 25px rgba(79, 172, 254, 0.6),
    inset 0 0 25px rgba(0, 242, 254, 0.3);
}

/* Sound Hunter specific animations */
@keyframes choice-reveal {
  0% {
    opacity: 0;
    transform: scale(0.8) rotateY(90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

.choice-button {
  animation: choice-reveal 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.choice-button:nth-child(1) { animation-delay: 0.1s; }
.choice-button:nth-child(2) { animation-delay: 0.2s; }
.choice-button:nth-child(3) { animation-delay: 0.3s; }
.choice-button:nth-child(4) { animation-delay: 0.4s; }
</style> 