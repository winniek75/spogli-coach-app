<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
    <!-- 背景装飾 -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
    <div class="absolute top-0 left-0 w-full h-full">
      <div class="absolute top-1/4 left-1/4 w-32 h-32 border border-white/10 rounded-full animate-ping"></div>
      <div class="absolute top-3/4 right-1/4 w-24 h-24 border border-white/10 rounded-full animate-ping" style="animation-delay: 1s"></div>
    </div>

    <!-- 成功パーティクル -->
    <div v-if="showParticles" class="absolute inset-0 pointer-events-none z-50">
      <div
        v-for="i in 20"
        :key="i"
        class="absolute text-3xl animate-bounce"
        :style="{
          left: `${15 + Math.random() * 70}%`,
          top: `${15 + Math.random() * 70}%`,
          animationDelay: `${Math.random() * 0.8}s`
        }"
      >
        {{ ['🎵', '🎶', '🎼', '✨', '🌟', '💫'][Math.floor(Math.random() * 6)] }}
      </div>
    </div>

    <!-- メニュー画面 -->
    <div v-if="gamePhase === 'menu'" class="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-2xl w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎵 リズム・タッパー
          </h1>
          <p class="text-gray-600 text-lg">英語のリズムパターンを体で覚えよう！</p>
        </div>

        <!-- レベル選択 -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-2xl">🎵</span>
            リズムレベルを選択
          </h3>
          <div class="grid gap-4">
            <button
              v-for="(data, level) in rhythmData"
              :key="level"
              @click="setCurrentLevel(parseInt(level))"
              :class="`p-4 rounded-2xl text-left transition-all duration-200 ${
                currentLevel === parseInt(level)
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-lg flex items-center gap-2">
                    <span>{{ level === '1' ? '🎵' : level === '2' ? '🎶' : '🎼' }}</span>
                    レベル {{ level }}: {{ data.name }}
                  </div>
                  <div class="text-sm opacity-90">{{ data.description }}</div>
                  <div class="text-sm opacity-75">
                    フレーズ数: {{ data.phrases.length }}
                  </div>
                </div>
                <div class="text-2xl">
                  <span class="text-lg">▶️</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- ゲーム開始ボタン -->
        <div class="text-center">
          <button
            @click="startGame"
            class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <span class="text-2xl">🎮</span>
            ゲーム開始
          </button>
        </div>
      </div>
    </div>

    <!-- ゲーム画面 -->
    <div v-if="gamePhase !== 'menu'" class="relative z-10 container mx-auto px-4 py-8 min-h-screen">
      <!-- ゲームヘッダー -->
      <div class="flex justify-between items-center mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="text-2xl">⭐</span>
            <span class="text-white font-bold text-xl">{{ score }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">❤️</span>
            <span class="text-white font-bold text-xl">{{ lives }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔥</span>
            <span class="text-white font-bold text-xl">{{ combo }}</span>
          </div>
        </div>
        <div class="text-white">
          <span class="text-lg">レベル {{ currentLevel }}</span>
        </div>
      </div>

      <!-- リスニング段階 -->
      <div v-if="gamePhase === 'listening'" class="text-center">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-6">🎧 リスニング段階</h2>
          
          <!-- 現在のフレーズ -->
          <div class="mb-8">
            <p class="text-2xl font-bold text-indigo-600 mb-4">
              "{{ getCurrentPhrase().text }}"
            </p>
            <p class="text-gray-600 text-lg">{{ getCurrentPhrase().meaning }}</p>
          </div>

          <!-- リズムパターン表示 -->
          <div class="mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4">リズムパターン:</h3>
            <div class="flex justify-center gap-2 mb-6">
              <div
                v-for="(beat, index) in getCurrentPhrase().rhythm"
                :key="index"
                :class="`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                  currentBeatIndex === index
                    ? 'bg-indigo-600 text-white scale-125'
                    : beat === 'strong'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-400'
                }`"
              >
                {{ beat === 'strong' ? '●' : '○' }}
              </div>
            </div>
          </div>

          <!-- 音声再生ボタン -->
          <div class="mb-8">
            <button
              @click="playPhrase"
              :disabled="isPlaying"
              class="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-3 mx-auto"
            >
              <span class="text-2xl">{{ isPlaying ? '⏸️' : '▶️' }}</span>
              {{ isPlaying ? '再生中...' : '音声を聞く' }}
            </button>
          </div>

          <!-- 進行状況バー -->
          <div v-if="isPlaying" class="mb-6">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-100"
                :style="{ width: `${playProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- タッピング段階へ -->
          <button
            @click="startTapping"
            class="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <span class="text-2xl">👆</span>
            タッピング開始
          </button>
        </div>
      </div>

      <!-- タッピング段階 -->
      <div v-if="gamePhase === 'tapping'" class="text-center">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-6">👆 タッピング段階</h2>
          
          <!-- フレーズ表示 -->
          <div class="mb-8">
            <p class="text-2xl font-bold text-indigo-600 mb-2">
              "{{ getCurrentPhrase().text }}"
            </p>
            <p class="text-gray-600">リズムに合わせてタップしてください</p>
          </div>

          <!-- タッピングエリア -->
          <div class="mb-8">
            <div class="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-8 border-4 border-dashed border-indigo-300 cursor-pointer hover:border-indigo-500 transition-all" 
                 @click="handleTap">
              <div class="text-6xl mb-4">🎯</div>
              <p class="text-xl font-bold text-indigo-600">ここをタップ！</p>
              <p class="text-gray-600">{{ userTaps.length }}/{{ getCurrentPhrase().rhythm.length }} タップ</p>
            </div>
          </div>

          <!-- ユーザーのタップパターン表示 -->
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4">あなたのタップ:</h3>
            <div class="flex justify-center gap-2">
              <div
                v-for="(tap, index) in getCurrentPhrase().rhythm"
                :key="index"
                :class="`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index < userTaps.length
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`"
              >
                {{ index < userTaps.length ? '✓' : '○' }}
              </div>
            </div>
          </div>

          <!-- 完了したらチェックボタン -->
          <button
            v-if="userTaps.length === getCurrentPhrase().rhythm.length"
            @click="checkTapping"
            class="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <span class="text-2xl">✅</span>
            チェック
          </button>
        </div>
      </div>

      <!-- 結果表示 -->
      <div v-if="gamePhase === 'result'" class="text-center">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto">
          <div class="mb-8">
            <div class="text-6xl mb-4">{{ isCorrect ? '🎉' : '😅' }}</div>
            <h2 class="text-3xl font-bold mb-4" :class="isCorrect ? 'text-green-600' : 'text-red-600'">
              {{ isCorrect ? '素晴らしい！' : 'もう一度挑戦！' }}
            </h2>
            <p class="text-xl text-gray-600">
              {{ isCorrect ? 'リズムパターンが完璧です！' : 'リズムをもう一度確認してみましょう' }}
            </p>
          </div>

          <!-- スコア情報 -->
          <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-4">
              <div class="text-2xl mb-2">⭐</div>
              <div class="font-bold text-lg">{{ score }}</div>
              <div class="text-sm text-gray-600">スコア</div>
            </div>
            <div class="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4">
              <div class="text-2xl mb-2">🔥</div>
              <div class="font-bold text-lg">{{ maxCombo }}</div>
              <div class="text-sm text-gray-600">最大コンボ</div>
            </div>
          </div>

          <!-- 次のアクション -->
          <div class="flex gap-4 justify-center">
            <button
              v-if="!isCorrect"
              @click="retryPhrase"
              class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span class="text-xl">🔄</span>
              もう一度
            </button>
            <button
              @click="nextPhrase"
              class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span class="text-xl">▶️</span>
              {{ isCorrect ? '次へ' : 'スキップ' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ゲーム終了画面 -->
      <div v-if="gamePhase === 'gameOver'" class="text-center">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto">
          <div class="mb-8">
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-3xl font-bold text-purple-600 mb-4">ゲーム完了！</h2>
            <p class="text-xl text-gray-600">お疲れさまでした！</p>
          </div>

          <!-- 最終スコア -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-4">
              <div class="text-2xl mb-2">⭐</div>
              <div class="font-bold text-lg">{{ score }}</div>
              <div class="text-sm text-gray-600">総スコア</div>
            </div>
            <div class="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4">
              <div class="text-2xl mb-2">✅</div>
              <div class="font-bold text-lg">{{ correctAnswers }}/{{ totalQuestions }}</div>
              <div class="text-sm text-gray-600">正解数</div>
            </div>
            <div class="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4">
              <div class="text-2xl mb-2">🔥</div>
              <div class="font-bold text-lg">{{ maxCombo }}</div>
              <div class="text-sm text-gray-600">最大コンボ</div>
            </div>
          </div>

          <!-- 再開ボタン -->
          <div class="flex gap-4 justify-center">
            <button
              @click="restartGame"
              class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span class="text-xl">🔄</span>
              もう一度プレイ
            </button>
            <button
              @click="goToMenu"
              class="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span class="text-xl">🏠</span>
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- フィードバック表示 -->
    <div v-if="showFeedback" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
        <div class="text-6xl mb-4">{{ isCorrect ? '🎉' : '😅' }}</div>
        <h3 class="text-2xl font-bold mb-2" :class="isCorrect ? 'text-green-600' : 'text-red-600'">
          {{ isCorrect ? '正解！' : '不正解' }}
        </h3>
        <p class="text-gray-600">
          {{ isCorrect ? 'リズムが完璧です！' : 'もう一度聞いて挑戦してみましょう' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'

export default {
  name: 'RhythmTapperGame',
  setup() {
    // ゲーム状態管理
    const gamePhase = ref('menu') // menu, listening, tapping, result, gameOver
    const currentLevel = ref(1)
    const currentPhraseIndex = ref(0)
    const score = ref(0)
    const lives = ref(3)
    const combo = ref(0)
    const maxCombo = ref(0)
    const isPlaying = ref(false)
    const currentBeatIndex = ref(-1)
    const userTaps = ref([])
    const showFeedback = ref(false)
    const isCorrect = ref(false)
    const showParticles = ref(false)
    const correctAnswers = ref(0)
    const totalQuestions = ref(8)
    const playProgress = ref(0)

    // 英語リズムパターンデータ
    const rhythmData = reactive({
      1: {
        name: "基本リズム",
        description: "シンプルな強弱パターン",
        phrases: [
          {
            text: "Hello there!",
            meaning: "こんにちは！",
            rhythm: ['strong', 'weak']
          },
          {
            text: "Good morning!",
            meaning: "おはよう！", 
            rhythm: ['strong', 'weak', 'weak']
          },
          {
            text: "How are you?",
            meaning: "元気ですか？",
            rhythm: ['strong', 'weak', 'weak']
          },
          {
            text: "Thank you very much!",
            meaning: "どうもありがとう！",
            rhythm: ['strong', 'weak', 'weak', 'weak', 'strong']
          }
        ]
      },
      2: {
        name: "中級リズム",
        description: "複雑な強弱パターン",
        phrases: [
          {
            text: "I can't believe it!",
            meaning: "信じられない！",
            rhythm: ['weak', 'strong', 'weak', 'strong', 'weak']
          },
          {
            text: "What a beautiful day!",
            meaning: "なんて美しい日だ！",
            rhythm: ['strong', 'weak', 'strong', 'weak', 'weak', 'strong']
          },
          {
            text: "Congratulations!",
            meaning: "おめでとう！",
            rhythm: ['weak', 'strong', 'weak', 'strong', 'weak', 'strong']
          }
        ]
      },
      3: {
        name: "上級リズム",
        description: "ネイティブレベルの複雑なパターン",
        phrases: [
          {
            text: "I've been thinking about it.",
            meaning: "それについて考えていました。",
            rhythm: ['weak', 'strong', 'weak', 'strong', 'weak', 'weak', 'strong', 'weak']
          },
          {
            text: "Unbelievable!",
            meaning: "信じられない！",
            rhythm: ['weak', 'weak', 'strong', 'weak', 'weak', 'strong']
          }
        ]
      }
    })

    // 計算プロパティ
    const getCurrentPhrase = () => {
      return rhythmData[currentLevel.value].phrases[currentPhraseIndex.value]
    }

    // メソッド
    const setCurrentLevel = (level) => {
      currentLevel.value = level
    }

    const startGame = () => {
      resetGameState()
      gamePhase.value = 'listening'
    }

    const resetGameState = () => {
      currentPhraseIndex.value = 0
      score.value = 0
      lives.value = 3
      combo.value = 0
      maxCombo.value = 0
      correctAnswers.value = 0
      userTaps.value = []
      showFeedback.value = false
      isCorrect.value = false
      showParticles.value = false
    }

    const playPhrase = () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      currentBeatIndex.value = -1
      playProgress.value = 0
      
      const phrase = getCurrentPhrase()
      const beatDuration = 600 // ms per beat
      
      // プログレスバーの更新
      const progressInterval = setInterval(() => {
        playProgress.value += (100 / (phrase.rhythm.length * beatDuration)) * 50
        if (playProgress.value >= 100) {
          clearInterval(progressInterval)
        }
      }, 50)
      
      // リズムパターンの視覚表示
      phrase.rhythm.forEach((beat, index) => {
        setTimeout(() => {
          currentBeatIndex.value = index
          // サウンド効果をシミュレート（実際のプロジェクトでは音声ファイルを再生）
          console.log(`Beat ${index + 1}: ${beat}`)
        }, index * beatDuration)
      })
      
      // 再生終了
      setTimeout(() => {
        isPlaying.value = false
        currentBeatIndex.value = -1
        playProgress.value = 100
      }, phrase.rhythm.length * beatDuration)
    }

    const startTapping = () => {
      gamePhase.value = 'tapping'
      userTaps.value = []
    }

    const handleTap = () => {
      const phrase = getCurrentPhrase()
      if (userTaps.value.length < phrase.rhythm.length) {
        userTaps.value.push(Date.now())
      }
    }

    const checkTapping = () => {
      const phrase = getCurrentPhrase()
      const correct = userTaps.value.length === phrase.rhythm.length
      
      isCorrect.value = correct
      
      if (correct) {
        correctAnswers.value++
        combo.value++
        maxCombo.value = Math.max(maxCombo.value, combo.value)
        score.value += 100 + (combo.value * 10)
        showParticles.value = true
        
        setTimeout(() => {
          showParticles.value = false
        }, 2000)
      } else {
        combo.value = 0
        lives.value--
      }
      
      gamePhase.value = 'result'
      
      // フィードバック表示
      showFeedback.value = true
      setTimeout(() => {
        showFeedback.value = false
      }, 2000)
    }

    const retryPhrase = () => {
      userTaps.value = []
      gamePhase.value = 'listening'
    }

    const nextPhrase = () => {
      currentPhraseIndex.value++
      
      if (currentPhraseIndex.value >= rhythmData[currentLevel.value].phrases.length || lives.value <= 0) {
        gamePhase.value = 'gameOver'
      } else {
        gamePhase.value = 'listening'
      }
    }

    const restartGame = () => {
      startGame()
    }

    const goToMenu = () => {
      gamePhase.value = 'menu'
      resetGameState()
    }

    return {
      gamePhase,
      currentLevel,
      currentPhraseIndex,
      score,
      lives,
      combo,
      maxCombo,
      isPlaying,
      currentBeatIndex,
      userTaps,
      showFeedback,
      isCorrect,
      showParticles,
      correctAnswers,
      totalQuestions,
      playProgress,
      rhythmData,
      getCurrentPhrase,
      setCurrentLevel,
      startGame,
      resetGameState,
      playPhrase,
      startTapping,
      handleTap,
      checkTapping,
      retryPhrase,
      nextPhrase,
      restartGame,
      goToMenu
    }
  }
}
</script>

<style scoped>
/* カスタムアニメーション */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* ホバーエフェクト */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* トランジション */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* グラデーションテキスト */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* カスタムスクロールバー */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>