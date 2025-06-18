<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- Nebula effect -->
    <div class="nebula-effect"></div>

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
              🌌 スペース・サウンド・アドベンチャー
            </h1>
            <p class="text-galaxy-moon-silver text-lg">音素エネルギーを収集して宇宙船をアップグレード！</p>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- Player Status -->
        <div class="grid grid-cols-4 gap-4">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🚀</div>
            <div class="font-bold text-lg galaxy-text-primary">Level {{ playerData.level }}</div>
            <div class="text-sm text-galaxy-moon-silver">Spacecraft</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">⚡</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ playerData.energy }}</div>
            <div class="text-sm text-galaxy-moon-silver">Energy</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🎯</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ playerData.score }}</div>
            <div class="text-sm text-galaxy-moon-silver">Score</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">💎</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ playerData.crystals }}</div>
            <div class="text-sm text-galaxy-moon-silver">Crystals</div>
          </div>
        </div>
      </div>

      <!-- Game Area -->
      <div v-if="gameState === 'menu'" class="galaxy-card rounded-3xl p-8 text-center">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-float">
          <span class="text-6xl">🌌</span>
        </div>
        
        <h2 class="text-3xl font-bold galaxy-text-primary mb-4">音素エネルギー収集ミッション</h2>
        <p class="text-galaxy-moon-silver text-lg mb-8">
          宇宙船で音素エネルギーを収集し、より強力な船にアップグレードしよう！<br>
          正確な音認識でエネルギーを最大化！
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="mission in missions" 
            :key="mission.id"
            @click="startMission(mission)"
            class="galaxy-card p-6 cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <div class="text-4xl mb-3">{{ mission.icon }}</div>
            <h3 class="text-xl font-bold galaxy-text-primary mb-2">{{ mission.name }}</h3>
            <p class="text-galaxy-moon-silver text-sm mb-4">{{ mission.description }}</p>
            <div class="text-yellow-400 font-bold">報酬: {{ mission.reward }} エネルギー</div>
          </div>
        </div>
        
        <button 
          @click="startRandomMission"
          class="galaxy-button galaxy-button-primary px-8 py-4 text-lg font-bold text-white rounded-2xl hover:shadow-xl transition-all duration-200"
        >
          🚀 ランダムミッション開始
        </button>
      </div>

      <!-- Game Playing State -->
      <div v-else-if="gameState === 'playing'" class="galaxy-card rounded-3xl p-8">
        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold galaxy-text-primary mb-2">{{ currentMission.name }}</h3>
          <div class="flex justify-center items-center gap-4 mb-4">
            <div class="text-lg text-galaxy-moon-silver">進捗:</div>
            <div class="w-64 bg-gray-700 rounded-full h-3">
              <div 
                class="energy-gauge h-3 rounded-full transition-all duration-500"
                :style="{ width: `${missionProgress}%` }"
              />
            </div>
            <div class="text-lg galaxy-text-primary font-bold">{{ collectedEnergy }}/{{ currentMission.target }}</div>
          </div>
        </div>

        <!-- Phoneme Challenge -->
        <div v-if="currentPhoneme" class="text-center">
          <div class="mb-6">
            <div class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mb-4 animate-pulse">
              <span class="text-4xl">🔊</span>
            </div>
            <button 
              @click="playPhonemeSound"
              :disabled="isPlaying"
              class="galaxy-button galaxy-button-primary px-6 py-3 text-lg font-bold text-white rounded-xl"
            >
              音を聞く
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              v-for="(choice, index) in choices"
              :key="index"
              @click="selectAnswer(choice)"
              :class="[
                'galaxy-card p-4 text-center cursor-pointer transition-all duration-200',
                selectedAnswer === choice ? 'ring-4 ring-cyan-400 scale-105' : 'hover:scale-105'
              ]"
            >
              <div class="text-2xl mb-2">{{ choice.symbol }}</div>
              <div class="text-sm text-galaxy-moon-silver">{{ choice.example }}</div>
            </button>
          </div>

          <button 
            @click="submitAnswer"
            :disabled="!selectedAnswer"
            class="galaxy-button galaxy-button-primary px-8 py-3 text-lg font-bold text-white rounded-xl disabled:opacity-50"
          >
            答えを送信
          </button>
        </div>
      </div>

      <!-- Feedback -->
      <Transition name="feedback">
        <div 
          v-if="showFeedback" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            :class="[
              'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center backdrop-blur-md',
              feedbackType === 'correct' ? 'bg-green-500/90 text-white animate-correct' : 'bg-red-500/90 text-white animate-shake'
            ]"
          >
            <div class="mb-2">
              {{ feedbackType === 'correct' ? '🎉 エネルギー収集成功!' : '❌ 収集失敗...' }}
            </div>
            <div class="text-lg font-normal">{{ feedback }}</div>
          </div>
        </div>
      </Transition>

      <!-- Mission Complete -->
      <div v-if="gameState === 'complete'" class="galaxy-card rounded-3xl p-8 text-center">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mb-6">
          <Trophy class="w-16 h-16 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold galaxy-text-primary mb-4">ミッション完了！</h2>
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-green-400">{{ missionResults.energyGained }}</div>
            <div class="text-sm text-galaxy-moon-silver">獲得エネルギー</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-blue-400">{{ missionResults.accuracy }}%</div>
            <div class="text-sm text-galaxy-moon-silver">正解率</div>
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
            @click="startRandomMission"
            class="galaxy-button galaxy-button-primary px-6 py-3 text-lg font-bold text-white rounded-xl"
          >
            次のミッション
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Settings, Trophy } from 'lucide-vue-next'

export default {
  name: 'SpaceSoundAdventure',
  components: {
    ArrowLeft,
    Settings,
    Trophy
  },
  setup() {
    const router = useRouter()
    
    const gameState = ref('menu') // menu, playing, complete
    const showSettings = ref(false)
    const showFeedback = ref(false)
    const feedbackType = ref('')
    const feedback = ref('')
    const isPlaying = ref(false)
    const selectedAnswer = ref(null)
    const collectedEnergy = ref(0)
    const currentMission = ref(null)
    const currentPhoneme = ref(null)
    const choices = ref([])
    
    const playerData = reactive({
      level: 3,
      energy: 1250,
      score: 5670,
      crystals: 42
    })
    
    const missions = ref([
      {
        id: 1,
        name: '初級エネルギー収集',
        description: '基本音素からエネルギーを収集',
        icon: '🌟',
        target: 10,
        reward: 100,
        difficulty: 'easy'
      },
      {
        id: 2,
        name: '中級音素探査',
        description: '複雑な音素パターンを発見',
        icon: '🔍',
        target: 15,
        reward: 200,
        difficulty: 'medium'
      },
      {
        id: 3,
        name: '上級宇宙任務',
        description: '高難度音素でエネルギー最大化',
        icon: '🚀',
        target: 20,
        reward: 300,
        difficulty: 'hard'
      }
    ])
    
    const missionResults = reactive({
      energyGained: 0,
      accuracy: 0
    })
    
    const missionProgress = computed(() => {
      if (!currentMission.value) return 0
      return (collectedEnergy.value / currentMission.value.target) * 100
    })
    
    const startMission = (mission) => {
      currentMission.value = mission
      collectedEnergy.value = 0
      gameState.value = 'playing'
      loadNextPhoneme()
    }
    
    const startRandomMission = () => {
      const randomMission = missions.value[Math.floor(Math.random() * missions.value.length)]
      startMission(randomMission)
    }
    
    const loadNextPhoneme = () => {
      // Mock phoneme data
      const phonemes = [
        { symbol: 'a', example: 'cat', sound: 'a.m4a' },
        { symbol: 'e', example: 'bed', sound: 'e1.m4a' },
        { symbol: 'i', example: 'bit', sound: 'i1.m4a' },
        { symbol: 'o', example: 'dog', sound: 'o1.m4a' },
        { symbol: 's', example: 'sun', sound: 's.m4a' },
        { symbol: 't', example: 'top', sound: 't.m4a' }
      ]
      
      currentPhoneme.value = phonemes[Math.floor(Math.random() * phonemes.length)]
      
      // Generate choices
      const otherPhonemes = phonemes.filter(p => p.symbol !== currentPhoneme.value.symbol)
      const wrongChoices = otherPhonemes.sort(() => Math.random() - 0.5).slice(0, 3)
      
      choices.value = [currentPhoneme.value, ...wrongChoices].sort(() => Math.random() - 0.5)
      selectedAnswer.value = null
    }
    
    const playPhonemeSound = async () => {
      if (!currentPhoneme.value || isPlaying.value) return
      
      isPlaying.value = true
      try {
        const audio = new Audio(`/sounds/${currentPhoneme.value.sound}`)
        await audio.play()
        audio.onended = () => {
          isPlaying.value = false
        }
      } catch (error) {
        console.error('Failed to play sound:', error)
        isPlaying.value = false
      }
    }
    
    const selectAnswer = (choice) => {
      selectedAnswer.value = choice
    }
    
    const submitAnswer = () => {
      if (!selectedAnswer.value) return
      
      const isCorrect = selectedAnswer.value.symbol === currentPhoneme.value.symbol
      
      showFeedback.value = true
      feedbackType.value = isCorrect ? 'correct' : 'incorrect'
      feedback.value = isCorrect 
        ? `+1 エネルギー収集！` 
        : `正解は "${currentPhoneme.value.symbol}" でした`
      
      if (isCorrect) {
        collectedEnergy.value++
        playerData.energy += 10
        playerData.score += 50
      }
      
      setTimeout(() => {
        showFeedback.value = false
        
        if (collectedEnergy.value >= currentMission.value.target) {
          completeMission()
        } else {
          loadNextPhoneme()
        }
      }, 2000)
    }
    
    const completeMission = () => {
      missionResults.energyGained = currentMission.value.reward
      missionResults.accuracy = Math.round((collectedEnergy.value / currentMission.value.target) * 100)
      
      playerData.energy += missionResults.energyGained
      playerData.crystals += Math.floor(missionResults.energyGained / 50)
      
      gameState.value = 'complete'
    }
    
    const returnToMenu = () => {
      gameState.value = 'menu'
      currentMission.value = null
    }
    
    const handleBack = () => {
      router.back()
    }
    
    return {
      gameState,
      showSettings,
      showFeedback,
      feedbackType,
      feedback,
      isPlaying,
      selectedAnswer,
      collectedEnergy,
      currentMission,
      currentPhoneme,
      choices,
      playerData,
      missions,
      missionResults,
      missionProgress,
      startMission,
      startRandomMission,
      playPhonemeSound,
      selectAnswer,
      submitAnswer,
      returnToMenu,
      handleBack
    }
  }
}
</script>

<style scoped>
/* Galaxy background styles */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

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

.galaxy-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
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

.nebula-effect {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%);
  animation: nebula-drift 20s ease-in-out infinite alternate;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-correct {
  animation: correct-bounce 0.6s ease-out;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes correct-bounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes nebula-drift {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(30deg) brightness(1.2); }
}

.feedback-enter-active, .feedback-leave-active {
  transition: all 0.5s ease;
}

.feedback-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-50px);
}

.feedback-leave-to {
  opacity: 0;
  transform: scale(1.2) translateY(50px);
}
</style>