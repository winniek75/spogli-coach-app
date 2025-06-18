<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- Battle arena effects -->
    <div class="battle-arena-effect"></div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="galaxy-card rounded-3xl p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="handleBack"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5 cosmic-glow" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold galaxy-text-primary cosmic-title mb-2">
              ⚔️ サウンド・バトル・アリーナ
            </h1>
            <p class="text-galaxy-moon-silver text-lg">音素の力で相手を倒せ！連続バトルで音韻マスターを目指そう</p>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- Battle Status -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">⚔️</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ battleData.wins }}</div>
            <div class="text-sm text-galaxy-moon-silver">勝利数</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🏆</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ battleData.streak }}</div>
            <div class="text-sm text-galaxy-moon-silver">連勝記録</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">💪</div>
            <div class="font-bold text-lg galaxy-text-primary">Level {{ battleData.level }}</div>
            <div class="text-sm text-galaxy-moon-silver">戦士レベル</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">⚡</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ battleData.power }}</div>
            <div class="text-sm text-galaxy-moon-silver">戦闘力</div>
          </div>
        </div>
      </div>

      <!-- Arena Selection -->
      <div v-if="gameState === 'menu'" class="galaxy-card rounded-3xl p-8">
        <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-8">アリーナを選択</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="arena in arenas" 
            :key="arena.id"
            @click="selectArena(arena)"
            :class="[
              'galaxy-card p-6 cursor-pointer transition-all duration-200 hover:scale-105',
              arena.locked ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <div class="text-center">
              <div class="text-5xl mb-4">{{ arena.icon }}</div>
              <h3 class="text-xl font-bold galaxy-text-primary mb-2">{{ arena.name }}</h3>
              <p class="text-galaxy-moon-silver text-sm mb-4">{{ arena.description }}</p>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">難易度:</span>
                  <div class="flex gap-1">
                    <span 
                      v-for="i in 5" 
                      :key="i"
                      class="w-2 h-2 rounded-full"
                      :class="i <= arena.difficulty ? 'bg-red-400' : 'bg-gray-600'"
                    ></span>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">対戦相手:</span>
                  <span class="text-yellow-400 font-bold">{{ arena.opponents }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">報酬:</span>
                  <span class="text-green-400 font-bold">{{ arena.reward }}</span>
                </div>
              </div>
              
              <div v-if="arena.locked" class="mt-4 text-red-400 text-sm">
                🔒 {{ arena.unlockRequirement }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Battle Screen -->
      <div v-else-if="gameState === 'battle'" class="space-y-6">
        <!-- Battle Info -->
        <div class="galaxy-card rounded-3xl p-6">
          <div class="flex justify-between items-center">
            <div class="text-center">
              <div class="text-lg font-bold galaxy-text-primary">プレイヤー</div>
              <div class="flex justify-center mt-2">
                <Heart 
                  v-for="i in playerHealth" 
                  :key="i"
                  class="w-6 h-6 text-red-500 fill-current"
                />
              </div>
            </div>
            
            <div class="text-center">
              <div class="text-2xl font-bold galaxy-text-primary">VS</div>
              <div class="text-sm text-galaxy-moon-silver">Round {{ currentRound }}/{{ currentArena.opponents }}</div>
            </div>
            
            <div class="text-center">
              <div class="text-lg font-bold galaxy-text-primary">{{ currentOpponent.name }}</div>
              <div class="flex justify-center mt-2">
                <Heart 
                  v-for="i in opponentHealth" 
                  :key="i"
                  class="w-6 h-6 text-blue-500 fill-current"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Battle Arena -->
        <div class="galaxy-card rounded-3xl p-8 text-center">
          <div class="mb-6">
            <div class="text-2xl font-bold galaxy-text-primary mb-4">{{ currentOpponent.challenge }}</div>
            <button 
              @click="playBattleSound"
              :disabled="isPlaying"
              class="w-20 h-20 galaxy-button galaxy-button-primary rounded-full text-3xl font-bold text-white animate-pulse"
            >
              🔊
            </button>
          </div>

          <!-- Battle Choices -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              v-for="(choice, index) in battleChoices"
              :key="index"
              @click="attack(choice)"
              :class="[
                'galaxy-card p-4 text-center cursor-pointer transition-all duration-200 hover:scale-105',
                attackResult && attackResult.choice === choice ? 
                  (attackResult.correct ? 'ring-4 ring-green-400' : 'ring-4 ring-red-400') : ''
              ]"
            >
              <div class="text-2xl mb-2">{{ choice.symbol }}</div>
              <div class="text-sm text-galaxy-moon-silver">{{ choice.example }}</div>
            </button>
          </div>

          <!-- Battle Timer -->
          <div class="mb-4">
            <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div 
                class="bg-gradient-to-r from-yellow-400 to-red-500 h-3 rounded-full transition-all duration-1000"
                :style="{ width: `${(timeLeft / maxTime) * 100}%` }"
              />
            </div>
            <div class="text-lg font-bold galaxy-text-primary">{{ timeLeft }}秒</div>
          </div>
        </div>
      </div>

      <!-- Battle Result -->
      <Transition name="battle-result">
        <div 
          v-if="showBattleResult" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            :class="[
              'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center backdrop-blur-md',
              battleResultType === 'win' ? 'bg-green-500/90 text-white animate-victory' : 
              battleResultType === 'lose' ? 'bg-red-500/90 text-white animate-defeat' : 
              'bg-yellow-500/90 text-white animate-damage'
            ]"
          >
            <div class="mb-2">
              {{ battleResultMessages[battleResultType] }}
            </div>
            <div class="text-lg font-normal">{{ battleResultDetail }}</div>
          </div>
        </div>
      </Transition>

      <!-- Victory Screen -->
      <div v-if="gameState === 'victory'" class="galaxy-card rounded-3xl p-8 text-center">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-victory">
          <Crown class="w-16 h-16 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold galaxy-text-primary mb-4">アリーナ制覇！</h2>
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-yellow-400">{{ victoryData.exp }}</div>
            <div class="text-sm text-galaxy-moon-silver">獲得経験値</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-green-400">{{ victoryData.reward }}</div>
            <div class="text-sm text-galaxy-moon-silver">報酬</div>
          </div>
        </div>
        
        <div class="flex gap-4 justify-center">
          <button 
            @click="returnToMenu"
            class="galaxy-button galaxy-button-secondary px-6 py-3 text-lg font-bold text-white rounded-xl"
          >
            メニューに戻る
          </button>
          <button 
            @click="nextArena"
            v-if="hasNextArena"
            class="galaxy-button galaxy-button-primary px-6 py-3 text-lg font-bold text-white rounded-xl"
          >
            次のアリーナ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Settings, Heart, Crown } from 'lucide-vue-next'

export default {
  name: 'SoundBattleArena',
  components: {
    ArrowLeft,
    Settings,
    Heart,
    Crown
  },
  setup() {
    const router = useRouter()
    
    const gameState = ref('menu') // menu, battle, victory
    const showSettings = ref(false)
    const showBattleResult = ref(false)
    const battleResultType = ref('')
    const battleResultDetail = ref('')
    const isPlaying = ref(false)
    const timeLeft = ref(10)
    const maxTime = ref(10)
    const currentRound = ref(1)
    const playerHealth = ref(3)
    const opponentHealth = ref(3)
    let battleTimer = null
    
    const battleData = reactive({
      wins: 15,
      streak: 3,
      level: 7,
      power: 850
    })
    
    const currentArena = ref(null)
    const currentOpponent = ref(null)
    const battleChoices = ref([])
    const attackResult = ref(null)
    
    const arenas = ref([
      {
        id: 1,
        name: '初心者の道場',
        description: '基本音素での戦闘訓練',
        icon: '🥋',
        difficulty: 1,
        opponents: 3,
        reward: '100 EXP',
        locked: false
      },
      {
        id: 2,
        name: '音素の竜宮城',
        description: '水中音素バトル',
        icon: '🌊',
        difficulty: 3,
        opponents: 5,
        reward: '250 EXP',
        locked: false
      },
      {
        id: 3,
        name: '炎の発音地獄',
        description: '高難度音素の連続戦',
        icon: '🔥',
        difficulty: 5,
        opponents: 7,
        reward: '500 EXP',
        locked: true,
        unlockRequirement: 'Level 10で解放'
      }
    ])
    
    const opponents = [
      { name: 'スラッシュ・S', challenge: 'この音は何？', phoneme: 's', sound: 's.m4a' },
      { name: 'アタック・A', challenge: '短母音を選べ！', phoneme: 'a', sound: 'a1.m4a' },
      { name: 'テラー・T', challenge: '破裂音はどれ？', phoneme: 't', sound: 't.m4a' },
      { name: 'ブレード・B', challenge: '有声音を見つけよ', phoneme: 'b', sound: 'b.m4a' },
      { name: 'マスター・M', challenge: '鼻音の力！', phoneme: 'm', sound: 'm.m4a' }
    ]
    
    const victoryData = reactive({
      exp: 0,
      reward: ''
    })
    
    const battleResultMessages = {
      win: '🎉 勝利！',
      lose: '💀 敗北...',
      damage: '💥 ダメージ！'
    }
    
    const hasNextArena = computed(() => {
      const currentIndex = arenas.value.findIndex(arena => arena.id === currentArena.value?.id)
      return currentIndex < arenas.value.length - 1 && !arenas.value[currentIndex + 1]?.locked
    })
    
    const selectArena = (arena) => {
      if (arena.locked) return
      
      currentArena.value = arena
      currentRound.value = 1
      playerHealth.value = 3
      startBattle()
    }
    
    const startBattle = () => {
      gameState.value = 'battle'
      loadOpponent()
      resetBattleTimer()
    }
    
    const loadOpponent = () => {
      currentOpponent.value = opponents[Math.floor(Math.random() * opponents.length)]
      opponentHealth.value = 3
      generateBattleChoices()
      attackResult.value = null
    }
    
    const generateBattleChoices = () => {
      const phonemes = [
        { symbol: 'a', example: 'cat', sound: 'a1.m4a' },
        { symbol: 'e', example: 'bed', sound: 'e1.m4a' },
        { symbol: 's', example: 'sun', sound: 's.m4a' },
        { symbol: 't', example: 'top', sound: 't.m4a' },
        { symbol: 'b', example: 'boy', sound: 'b.m4a' },
        { symbol: 'm', example: 'man', sound: 'm.m4a' }
      ]
      
      const correct = phonemes.find(p => p.symbol === currentOpponent.value.phoneme)
      const wrong = phonemes.filter(p => p.symbol !== currentOpponent.value.phoneme)
        .sort(() => Math.random() - 0.5).slice(0, 3)
      
      battleChoices.value = [correct, ...wrong].sort(() => Math.random() - 0.5)
    }
    
    const playBattleSound = async () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      try {
        const audio = new Audio(`/sounds/${currentOpponent.value.sound}`)
        await audio.play()
        audio.onended = () => {
          isPlaying.value = false
        }
      } catch (error) {
        console.error('Failed to play sound:', error)
        isPlaying.value = false
      }
    }
    
    const attack = (choice) => {
      if (attackResult.value) return
      
      const isCorrect = choice.symbol === currentOpponent.value.phoneme
      attackResult.value = { choice, correct: isCorrect }
      
      clearInterval(battleTimer)
      
      if (isCorrect) {
        opponentHealth.value--
        battleResultType.value = 'win'
        battleResultDetail.value = `${currentOpponent.value.name}にダメージ！`
        
        if (opponentHealth.value <= 0) {
          setTimeout(() => {
            if (currentRound.value >= currentArena.value.opponents) {
              completeArena()
            } else {
              currentRound.value++
              loadOpponent()
              resetBattleTimer()
            }
          }, 2000)
        } else {
          setTimeout(() => {
            resetBattleTimer()
            attackResult.value = null
          }, 2000)
        }
      } else {
        playerHealth.value--
        battleResultType.value = 'damage'
        battleResultDetail.value = `正解は "${currentOpponent.value.phoneme}" でした`
        
        if (playerHealth.value <= 0) {
          battleResultType.value = 'lose'
          battleResultDetail.value = '体力が尽きました...'
          setTimeout(() => {
            returnToMenu()
          }, 3000)
        } else {
          setTimeout(() => {
            resetBattleTimer()
            attackResult.value = null
          }, 2000)
        }
      }
      
      showBattleResult.value = true
      setTimeout(() => {
        showBattleResult.value = false
      }, 2000)
    }
    
    const resetBattleTimer = () => {
      timeLeft.value = maxTime.value
      battleTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          // Time up - player loses health
          playerHealth.value--
          battleResultType.value = 'damage'
          battleResultDetail.value = 'タイムアップ！'
          
          showBattleResult.value = true
          setTimeout(() => {
            showBattleResult.value = false
            if (playerHealth.value <= 0) {
              returnToMenu()
            } else {
              resetBattleTimer()
              attackResult.value = null
            }
          }, 2000)
        }
      }, 1000)
    }
    
    const completeArena = () => {
      clearInterval(battleTimer)
      
      victoryData.exp = currentArena.value.opponents * 50
      victoryData.reward = currentArena.value.reward
      
      battleData.wins++
      battleData.streak++
      battleData.power += 50
      
      gameState.value = 'victory'
    }
    
    const returnToMenu = () => {
      clearInterval(battleTimer)
      gameState.value = 'menu'
      currentArena.value = null
    }
    
    const nextArena = () => {
      const currentIndex = arenas.value.findIndex(arena => arena.id === currentArena.value.id)
      if (currentIndex < arenas.value.length - 1) {
        selectArena(arenas.value[currentIndex + 1])
      }
    }
    
    const handleBack = () => {
      router.back()
    }
    
    onUnmounted(() => {
      if (battleTimer) {
        clearInterval(battleTimer)
      }
    })
    
    return {
      gameState,
      showSettings,
      showBattleResult,
      battleResultType,
      battleResultDetail,
      isPlaying,
      timeLeft,
      maxTime,
      currentRound,
      playerHealth,
      opponentHealth,
      battleData,
      currentArena,
      currentOpponent,
      battleChoices,
      attackResult,
      arenas,
      victoryData,
      battleResultMessages,
      hasNextArena,
      selectArena,
      playBattleSound,
      attack,
      returnToMenu,
      nextArena,
      handleBack
    }
  }
}
</script>

<style scoped>
/* Inherit all galaxy styles and add battle-specific effects */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

.battle-arena-effect {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 30% 70%, rgba(255, 0, 0, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 30%, rgba(255, 100, 0, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(255, 200, 0, 0.1) 0%, transparent 50%);
  animation: battle-pulse 3s ease-in-out infinite alternate;
}

@keyframes battle-pulse {
  0% { filter: brightness(1) contrast(1); }
  100% { filter: brightness(1.2) contrast(1.1); }
}

.animate-victory {
  animation: victory-dance 1s ease-out;
}

.animate-defeat {
  animation: defeat-shake 0.8s ease-out;
}

.animate-damage {
  animation: damage-flash 0.5s ease-out;
}

@keyframes victory-dance {
  0% { transform: scale(0.5) rotate(-10deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes defeat-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-10px) rotate(-2deg); }
  20% { transform: translateX(10px) rotate(2deg); }
  30% { transform: translateX(-8px) rotate(-1deg); }
  40% { transform: translateX(8px) rotate(1deg); }
  50% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
  70% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  90% { transform: translateX(-2px); }
}

@keyframes damage-flash {
  0%, 100% { background-color: rgba(255, 255, 0, 0.9); }
  50% { background-color: rgba(255, 100, 0, 0.9); }
}

.battle-result-enter-active, .battle-result-leave-active {
  transition: all 0.8s ease;
}

.battle-result-enter-from {
  opacity: 0;
  transform: scale(0.3) translateY(-100px);
}

.battle-result-leave-to {
  opacity: 0;
  transform: scale(1.5) translateY(100px);
}

/* Inherit galaxy component styles */
.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
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

.galaxy-text-primary {
  background: linear-gradient(45deg, #60A5FA 0%, #A78BFA 25%, #F472B6 50%, #FBBF24 75%, #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-stats-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.galaxy-button {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4), inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.5) 0%, rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>