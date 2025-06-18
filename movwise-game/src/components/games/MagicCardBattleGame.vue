<template>
  <div class="min-h-screen battle-background relative overflow-hidden">
    <!-- Battle Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="battle-stars-1"></div>
      <div class="battle-stars-2"></div>
      <div class="battle-field"></div>
    </div>

    <!-- Game Header -->
    <div class="relative z-10 p-4">
      <div class="flex items-center justify-between mb-4">
        <button 
          @click="goBack"
          class="flex items-center gap-2 battle-button battle-button-secondary px-4 py-2 rounded-full font-bold transition-all shadow-lg"
        >
          <ArrowLeft class="w-5 h-5" />
          戻る
        </button>

        <h1 class="text-3xl font-bold text-center">
          <span class="battle-text-primary cosmic-glow">
            🃏 魔法カードバトル
          </span>
        </h1>

        <button 
          @click="toggleSound"
          :class="[
            'p-2 rounded-full font-bold transition-all shadow-lg',
            soundEnabled 
              ? 'battle-button battle-button-primary' 
              : 'battle-button battle-button-secondary'
          ]"
        >
          <Volume2 v-if="soundEnabled" class="w-5 h-5" />
          <VolumeX v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Battle Stats -->
      <div class="flex justify-center gap-4 mb-6">
        <div class="battle-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Trophy class="w-5 h-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold text-white">{{ playerScore }}</span>
          </div>
        </div>

        <div class="battle-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Target class="w-5 h-5 text-blue-400 cosmic-glow" />
            <span class="font-bold text-white">ラウンド {{ currentRound }}/{{ maxRounds }}</span>
          </div>
        </div>

        <div class="battle-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Heart class="w-5 h-5 text-red-400 cosmic-glow" />
            <span class="font-bold text-white">{{ playerHP }}/{{ maxHP }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Battle Area -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
      <!-- Enemy Section -->
      <div class="w-full max-w-4xl mb-8">
        <div class="text-center mb-4">
          <div class="text-2xl font-bold text-red-400 mb-2">敵の魔法使い</div>
          <div class="flex justify-center items-center gap-4">
            <div class="enemy-avatar text-8xl">🧙‍♂️</div>
            <div class="battle-card rounded-xl p-4">
              <div class="text-lg font-bold text-white mb-2">{{ enemyName }}</div>
              <div class="w-32 bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  class="bg-red-500 h-3 rounded-full transition-all duration-500"
                  :style="{ width: `${(enemyHP / maxHP) * 100}%` }"
                ></div>
              </div>
              <div class="text-sm text-gray-300">HP: {{ enemyHP }}/{{ maxHP }}</div>
            </div>
          </div>
        </div>

        <!-- Enemy Card Display -->
        <div v-if="enemyCurrentCard" class="flex justify-center mb-4">
          <div class="enemy-card battle-card rounded-xl p-4 transform scale-90">
            <div class="text-center">
              <div class="text-6xl mb-2">🃏</div>
              <div class="text-xl font-bold text-red-400">{{ enemyCurrentCard.name }}</div>
              <div class="text-sm text-gray-300">攻撃力: {{ enemyCurrentCard.power }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Battle Status -->
      <div v-if="battlePhase === 'preparation'" class="text-center mb-8">
        <div class="battle-card rounded-2xl p-6 max-w-md mx-auto mb-6">
          <div class="text-2xl font-bold text-yellow-400 mb-4">バトル開始！</div>
          <p class="text-white mb-4">
            魔法カードを選んで、正しく発音してください。<br>
            発音の精度で攻撃力が決まります！
          </p>
          <button
            @click="startBattle"
            class="battle-button battle-button-primary px-8 py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all"
          >
            バトル開始！
          </button>
        </div>
      </div>

      <!-- Player Card Selection -->
      <div v-else-if="battlePhase === 'cardSelection'" class="w-full max-w-4xl">
        <div class="text-center mb-6">
          <div class="text-2xl font-bold text-blue-400 mb-2">魔法カードを選択</div>
          <p class="text-white">カードをクリックして選択し、正しく発音してください</p>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div 
            v-for="(card, index) in playerCards" 
            :key="index"
            @click="selectCard(card)"
            :class="[
              'player-card battle-card rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105',
              selectedCard?.id === card.id ? 'ring-4 ring-blue-400 bg-blue-900' : ''
            ]"
          >
            <div class="text-center">
              <div class="text-4xl mb-2">{{ card.emoji }}</div>
              <div class="text-lg font-bold text-white">{{ card.name }}</div>
              <div class="text-sm text-gray-300 mb-2">{{ card.shortWord }} → {{ card.longWord }}</div>
              <div class="text-sm text-yellow-400">攻撃力: {{ card.basePower }}</div>
            </div>
          </div>
        </div>

        <!-- Speech Recognition -->
        <div v-if="selectedCard" class="text-center">
          <div class="battle-card rounded-2xl p-6 max-w-md mx-auto">
            <div class="text-xl font-bold text-white mb-4">
              "{{ currentTarget }}" を発音してください
            </div>
            
            <div class="mb-4">
              <button
                @click="playTargetSound"
                class="battle-button battle-button-secondary px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Volume2 class="w-4 h-4 inline mr-2" />
                音を聞く
              </button>
            </div>

            <div class="mb-4">
              <button
                @click="toggleListening"
                :disabled="!speechSupported"
                :class="[
                  'px-8 py-4 rounded-xl font-bold text-white transition-all',
                  listening 
                    ? 'battle-button-listening animate-pulse' 
                    : 'battle-button battle-button-primary hover:shadow-lg'
                ]"
              >
                <Mic class="w-5 h-5 inline mr-2" />
                {{ listening ? '聞いています...' : '発音する' }}
              </button>
            </div>

            <div v-if="recognizedText" class="mb-4">
              <div class="text-sm text-gray-300 mb-1">認識された音声:</div>
              <div class="text-lg font-bold text-yellow-400">{{ recognizedText }}</div>
            </div>

            <div v-if="pronunciationScore > 0" class="mb-4">
              <div class="text-sm text-gray-300 mb-1">発音精度:</div>
              <div class="w-full bg-gray-700 rounded-full h-4 mb-2">
                <div 
                  class="h-4 rounded-full transition-all duration-1000"
                  :class="[
                    pronunciationScore >= 80 ? 'bg-green-500' : 
                    pronunciationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  ]"
                  :style="{ width: `${pronunciationScore}%` }"
                ></div>
              </div>
              <div class="text-lg font-bold text-white">{{ pronunciationScore }}%</div>
            </div>

            <button
              v-if="pronunciationScore > 0"
              @click="executeAttack"
              class="battle-button battle-button-primary px-8 py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all"
            >
              攻撃実行！
            </button>
          </div>
        </div>
      </div>

      <!-- Battle Animation -->
      <div v-else-if="battlePhase === 'attack'" class="text-center">
        <div class="battle-card rounded-2xl p-8 max-w-md mx-auto">
          <div class="text-6xl mb-4 animate-bounce">⚔️</div>
          <div class="text-2xl font-bold text-yellow-400 mb-4">攻撃中...</div>
          <div class="text-lg text-white">
            {{ selectedCard?.name }}の魔法発動！
          </div>
        </div>
      </div>

      <!-- Round Result -->
      <div v-else-if="battlePhase === 'result'" class="text-center">
        <div class="battle-card rounded-2xl p-8 max-w-md mx-auto">
          <div class="text-6xl mb-4">{{ roundResult === 'win' ? '🎉' : '😤' }}</div>
          <div class="text-2xl font-bold mb-4" :class="roundResult === 'win' ? 'text-green-400' : 'text-red-400'">
            {{ roundResult === 'win' ? 'ラウンド勝利！' : 'ラウンド敗北...' }}
          </div>
          
          <div class="space-y-2 mb-6 text-white">
            <div>あなたの攻撃力: {{ lastPlayerAttack }}</div>
            <div>敵の攻撃力: {{ lastEnemyAttack }}</div>
            <div v-if="roundResult === 'win'" class="text-green-400">+{{ roundScoreGain }}点獲得！</div>
          </div>

          <button
            @click="nextRound"
            class="battle-button battle-button-primary px-8 py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all"
          >
            {{ currentRound < maxRounds ? '次のラウンド' : '結果を見る' }}
          </button>
        </div>
      </div>

      <!-- Game Over -->
      <div v-else-if="battlePhase === 'gameOver'" class="text-center">
        <div class="battle-card rounded-2xl p-8 max-w-lg mx-auto">
          <div class="text-8xl mb-6">{{ gameResult === 'victory' ? '🏆' : '💀' }}</div>
          <div class="text-3xl font-bold mb-4" :class="gameResult === 'victory' ? 'text-gold' : 'text-red-400'">
            {{ gameResult === 'victory' ? '勝利！' : '敗北...' }}
          </div>
          
          <div class="space-y-4 mb-6">
            <div class="bg-gradient-to-r from-yellow-900 to-yellow-800 rounded-xl p-4">
              <div class="text-lg font-bold text-yellow-300">最終スコア</div>
              <div class="text-3xl font-bold text-yellow-100">{{ playerScore }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-900 rounded-xl p-3">
                <div class="text-sm font-bold text-blue-300">勝利ラウンド</div>
                <div class="text-xl font-bold text-blue-100">{{ wonRounds }}/{{ maxRounds }}</div>
              </div>
              <div class="bg-purple-900 rounded-xl p-3">
                <div class="text-sm font-bold text-purple-300">平均発音精度</div>
                <div class="text-xl font-bold text-purple-100">{{ averagePronunciation }}%</div>
              </div>
            </div>

            <div class="bg-green-900 rounded-xl p-4">
              <div class="text-lg font-bold text-green-300 mb-2">習得した魔法</div>
              <div class="flex flex-wrap gap-2 justify-center">
                <span 
                  v-for="word in masteredWords" 
                  :key="word"
                  class="bg-green-700 text-green-100 px-3 py-1 rounded-full text-sm font-bold"
                >
                  {{ word }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="restartGame"
              class="flex-1 battle-button battle-button-primary py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all"
            >
              再戦
            </button>
            <button
              @click="goBack"
              class="flex-1 battle-button battle-button-secondary py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all"
            >
              戻る
            </button>
          </div>
        </div>
      </div>

      <!-- Player Section -->
      <div class="w-full max-w-4xl mt-8">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400 mb-2">あなた</div>
          <div class="flex justify-center items-center gap-4">
            <div class="player-avatar text-8xl">🧙‍♀️</div>
            <div class="battle-card rounded-xl p-4">
              <div class="text-lg font-bold text-white mb-2">魔法使い見習い</div>
              <div class="w-32 bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  class="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  :style="{ width: `${(playerHP / maxHP) * 100}%` }"
                ></div>
              </div>
              <div class="text-sm text-gray-300">HP: {{ playerHP }}/{{ maxHP }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Battle Effects -->
    <div 
      v-if="showBattleEffect"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div class="text-8xl animate-ping">
        {{ battleEffectEmoji }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { getAllMagicEWords, getRandomMagicEPair } from '@/data/magicEWords'
import { 
  ArrowLeft, Volume2, VolumeX, Trophy, Target, Heart, Mic
} from 'lucide-vue-next'

export default {
  name: 'MagicCardBattleGame',
  components: {
    ArrowLeft,
    Volume2,
    VolumeX,
    Trophy,
    Target,
    Heart,
    Mic
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()

    // Game State
    const battlePhase = ref('preparation') // 'preparation', 'cardSelection', 'attack', 'result', 'gameOver'
    const currentRound = ref(1)
    const maxRounds = ref(5)
    const playerScore = ref(0)
    const playerHP = ref(100)
    const enemyHP = ref(100)
    const maxHP = ref(100)
    const soundEnabled = ref(true)

    // Battle Data
    const enemyName = ref('ダークウィザード')
    const selectedCard = ref(null)
    const enemyCurrentCard = ref(null)
    const roundResult = ref('')
    const gameResult = ref('')
    const lastPlayerAttack = ref(0)
    const lastEnemyAttack = ref(0)
    const roundScoreGain = ref(0)
    const wonRounds = ref(0)
    const masteredWords = ref([])
    const pronunciationScores = ref([])

    // Speech Recognition
    const listening = ref(false)
    const recognizedText = ref('')
    const pronunciationScore = ref(0)
    const currentTarget = ref('')
    const speechRecognition = ref(null)
    const speechSupported = ref(false)

    // Effects
    const showBattleEffect = ref(false)
    const battleEffectEmoji = ref('')

    // Magic Cards Data - 拡張された単語リスト
    const createMagicCards = () => {
      const magicWords = getAllMagicEWords();
      const cardEmojis = ['⚡', '💖', '🦸', '📼', '🌟', '🎵', '🪁', '👒', '🔥', '💎', '🌙', '⭐', '🎯', '🎪', '🎨', '🎭', '🌈', '🦋', '🌸', '🌺', '🍀', '🌿', '🌳', '🌊', '⛰️', '🏰', '🎠', '🎡', '🎢', '🎪'];
      
      return magicWords.map((word, index) => ({
        id: index + 1,
        name: `${word.long}カード`,
        shortWord: word.short,
        longWord: word.long,
        basePower: 10 + Math.floor(Math.random() * 15), // 10-24の範囲
        emoji: cardEmojis[index % cardEmojis.length],
        meaning: word.meaning,
        category: word.category
      }));
    };

    const allCards = createMagicCards()

    const playerCards = ref([])
    const enemyCards = ref([])

    // Computed
    const averagePronunciation = computed(() => {
      if (pronunciationScores.value.length === 0) return 0
      return Math.round(pronunciationScores.value.reduce((a, b) => a + b, 0) / pronunciationScores.value.length)
    })

    // Initialize Game
    const initGame = () => {
      battlePhase.value = 'preparation'
      currentRound.value = 1
      playerScore.value = 0
      playerHP.value = maxHP.value
      enemyHP.value = maxHP.value
      wonRounds.value = 0
      masteredWords.value = []
      pronunciationScores.value = []
      
      // Shuffle and deal cards with difficulty consideration
      const shuffled = [...allCards].sort(() => Math.random() - 0.5)
      
      // プレイヤーには初級〜中級の単語を優先配布
      const beginnerCards = shuffled.filter(card => card.basePower <= 18)
      const advancedCards = shuffled.filter(card => card.basePower > 18)
      
      playerCards.value = [
        ...beginnerCards.slice(0, 2),
        ...advancedCards.slice(0, 1)
      ].slice(0, 3)
      
      enemyCards.value = shuffled
        .filter(card => !playerCards.value.includes(card))
        .slice(0, 3)
      
      initSpeechRecognition()
    }

    // Speech Recognition Setup
    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        speechRecognition.value = new SpeechRecognition()
        speechRecognition.value.continuous = false
        speechRecognition.value.interimResults = false
        speechRecognition.value.lang = 'en-US'
        
        speechRecognition.value.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase().trim()
          recognizedText.value = transcript
          calculatePronunciationScore(transcript)
          listening.value = false
        }

        speechRecognition.value.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          listening.value = false
        }

        speechRecognition.value.onend = () => {
          listening.value = false
        }

        speechSupported.value = true
      } else {
        speechSupported.value = false
        console.warn('Speech recognition not supported')
      }
    }

    // Calculate pronunciation accuracy
    const calculatePronunciationScore = (transcript) => {
      const target = currentTarget.value.toLowerCase()
      let score = 0

      if (transcript === target) {
        score = 100
      } else if (transcript.includes(target) || target.includes(transcript)) {
        score = 80
      } else {
        // Simple phonetic similarity check
        const similarity = calculateSimilarity(transcript, target)
        score = Math.max(0, Math.min(75, similarity * 100))
      }

      pronunciationScore.value = Math.round(score)
      pronunciationScores.value.push(score)
    }

    // Simple string similarity calculation
    const calculateSimilarity = (str1, str2) => {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
      
      if (longer.length === 0) return 1.0
      
      let editDistance = 0
      for (let i = 0; i < longer.length; i++) {
        if (i >= shorter.length || longer[i] !== shorter[i]) {
          editDistance++
        }
      }
      
      return (longer.length - editDistance) / longer.length
    }

    // Game Flow Functions
    const startBattle = () => {
      battlePhase.value = 'cardSelection'
    }

    const selectCard = (card) => {
      selectedCard.value = card
      currentTarget.value = Math.random() > 0.5 ? card.shortWord : card.longWord
      pronunciationScore.value = 0
      recognizedText.value = ''
    }

    const toggleListening = () => {
      if (!speechSupported.value) return

      if (listening.value) {
        speechRecognition.value.stop()
        listening.value = false
      } else {
        recognizedText.value = ''
        pronunciationScore.value = 0
        speechRecognition.value.start()
        listening.value = true
      }
    }

    const playTargetSound = () => {
      if (!soundEnabled.value) return

      try {
        const utterance = new SpeechSynthesisUtterance(currentTarget.value)
        utterance.lang = 'en-US'
        utterance.rate = 0.7
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('TTS error:', error)
      }
    }

    const executeAttack = () => {
      battlePhase.value = 'attack'
      
      setTimeout(() => {
        // Calculate attack power based on pronunciation
        const baseAttack = selectedCard.value.basePower
        const attackMultiplier = pronunciationScore.value / 100
        lastPlayerAttack.value = Math.round(baseAttack * attackMultiplier)

        // Enemy attack (random)
        const enemyCard = enemyCards.value[Math.floor(Math.random() * enemyCards.value.length)]
        enemyCurrentCard.value = enemyCard
        lastEnemyAttack.value = Math.round(enemyCard.basePower * (0.7 + Math.random() * 0.3))

        // Apply damage
        enemyHP.value = Math.max(0, enemyHP.value - lastPlayerAttack.value)
        playerHP.value = Math.max(0, playerHP.value - lastEnemyAttack.value)

        // Determine round result
        if (lastPlayerAttack.value > lastEnemyAttack.value) {
          roundResult.value = 'win'
          wonRounds.value++
          roundScoreGain.value = Math.round(pronunciationScore.value / 2)
          playerScore.value += roundScoreGain.value
          
          // Add to mastered words
          if (!masteredWords.value.includes(currentTarget.value)) {
            masteredWords.value.push(currentTarget.value)
          }

          showEffect('⭐')
        } else {
          roundResult.value = 'lose'
          roundScoreGain.value = 0
          showEffect('💥')
        }

        battlePhase.value = 'result'
      }, 2000)
    }

    const nextRound = () => {
      if (currentRound.value >= maxRounds.value || playerHP.value <= 0 || enemyHP.value <= 0) {
        endGame()
      } else {
        currentRound.value++
        battlePhase.value = 'cardSelection'
        selectedCard.value = null
        enemyCurrentCard.value = null
      }
    }

    const endGame = () => {
      if (wonRounds.value > maxRounds.value / 2 || enemyHP.value <= 0) {
        gameResult.value = 'victory'
      } else {
        gameResult.value = 'defeat'
      }
      
      battlePhase.value = 'gameOver'
      
      // Save progress
      const gameData = {
        completed: true,
        bestScore: Math.max(gameStore.getGameProgress('magicCardBattle').bestScore || 0, playerScore.value),
        lastScore: playerScore.value,
        masteredWords: masteredWords.value,
        averagePronunciation: averagePronunciation.value
      }

      gameStore.updateGameProgress('magicCardBattle', gameData)
    }

    const showEffect = (emoji) => {
      battleEffectEmoji.value = emoji
      showBattleEffect.value = true
      setTimeout(() => {
        showBattleEffect.value = false
      }, 1000)
    }

    // Utility Functions
    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
    }

    const restartGame = () => {
      initGame()
    }

    const goBack = () => {
      router.back()
    }

    // Lifecycle
    onMounted(() => {
      console.log('🃏 Magic Card Battle Game started')
      initGame()
    })

    onUnmounted(() => {
      if (speechRecognition.value) {
        speechRecognition.value.stop()
      }
    })

    return {
      // State
      battlePhase,
      currentRound,
      maxRounds,
      playerScore,
      playerHP,
      enemyHP,
      maxHP,
      soundEnabled,
      enemyName,
      selectedCard,
      enemyCurrentCard,
      roundResult,
      gameResult,
      lastPlayerAttack,
      lastEnemyAttack,
      roundScoreGain,
      wonRounds,
      masteredWords,
      listening,
      recognizedText,
      pronunciationScore,
      currentTarget,
      speechSupported,
      showBattleEffect,
      battleEffectEmoji,
      playerCards,
      
      // Computed
      averagePronunciation,
      
      // Methods
      startBattle,
      selectCard,
      toggleListening,
      playTargetSound,
      executeAttack,
      nextRound,
      toggleSound,
      restartGame,
      goBack
    }
  }
}
</script>

<style scoped>
/* Battle background */
.battle-background {
  background: linear-gradient(135deg, 
    #1a1a2e 0%, 
    #16213e 25%, 
    #0f3460 50%, 
    #533483 75%, 
    #1a1a2e 100%);
  color: white;
}

/* Battle stars */
.battle-stars-1,
.battle-stars-2 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: sparkle 3s linear infinite;
  opacity: 0.4;
  pointer-events: none;
}

.battle-stars-2 {
  background-size: 150px 150px;
  animation-delay: 1s;
  opacity: 0.2;
}

.battle-field {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
  pointer-events: none;
}

@keyframes sparkle {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-200px); }
}

/* Battle UI components */
.battle-text-primary {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: battle-glow 3s ease-in-out infinite;
}

.battle-card {
  background: linear-gradient(135deg, 
    rgba(30, 30, 60, 0.9) 0%, 
    rgba(50, 50, 80, 0.8) 100%);
  border: 2px solid rgba(100, 150, 255, 0.3);
  backdrop-filter: blur(10px);
}

.battle-button {
  background: linear-gradient(135deg, 
    rgba(100, 150, 255, 0.3) 0%, 
    rgba(150, 100, 255, 0.3) 100%);
  border: 2px solid rgba(100, 150, 255, 0.6);
  transition: all 0.3s ease;
}

.battle-button-primary {
  background: linear-gradient(135deg, 
    rgba(100, 150, 255, 0.5) 0%, 
    rgba(150, 100, 255, 0.5) 100%);
}

.battle-button-secondary {
  background: linear-gradient(135deg, 
    rgba(100, 150, 255, 0.2) 0%, 
    rgba(150, 100, 255, 0.2) 100%);
}

.battle-button-listening {
  background: linear-gradient(135deg, 
    rgba(255, 100, 100, 0.5) 0%, 
    rgba(255, 150, 100, 0.5) 100%);
  border-color: rgba(255, 100, 100, 0.8);
}

.battle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(100, 150, 255, 0.3);
}

/* Card styles */
.player-card:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 30px rgba(100, 150, 255, 0.4);
}

.enemy-card {
  transform: scale(0.9);
  opacity: 0.8;
}

/* Character avatars */
.player-avatar,
.enemy-avatar {
  filter: drop-shadow(0 0 20px rgba(100, 150, 255, 0.5));
  animation: float 3s ease-in-out infinite;
}

.enemy-avatar {
  filter: drop-shadow(0 0 20px rgba(255, 100, 100, 0.5));
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes battle-glow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Gold text for victory */
.text-gold {
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

/* Cosmic glow effect */
.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
}

/* Responsive design */
@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .player-avatar,
  .enemy-avatar {
    font-size: 4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>