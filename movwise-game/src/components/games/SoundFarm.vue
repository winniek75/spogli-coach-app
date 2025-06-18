<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- Farm atmosphere effects -->
    <div class="farm-atmosphere-effect"></div>

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
              🌱 サウンド・ファーム
            </h1>
            <p class="text-galaxy-moon-silver text-lg">音素の種を育てて語彙の収穫を楽しもう！</p>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- Farm Status -->
        <div class="grid grid-cols-4 gap-4">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🌾</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ farmData.totalHarvest }}</div>
            <div class="text-sm text-galaxy-moon-silver">総収穫量</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🪙</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ farmData.coins }}</div>
            <div class="text-sm text-galaxy-moon-silver">ファームコイン</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🏆</div>
            <div class="font-bold text-lg galaxy-text-primary">Level {{ farmData.level }}</div>
            <div class="text-sm text-galaxy-moon-silver">農夫レベル</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🌟</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ farmData.exp }}/{{ farmData.nextLevelExp }}</div>
            <div class="text-sm text-galaxy-moon-silver">経験値</div>
          </div>
        </div>
      </div>

      <!-- Farm Grid -->
      <div class="galaxy-card rounded-3xl p-8 mb-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold galaxy-text-primary">音素農場</h2>
          <div class="flex gap-4">
            <button 
              @click="autoHarvest"
              :disabled="!canAutoHarvest"
              class="galaxy-button galaxy-button-primary px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50"
            >
              🤖 自動収穫
            </button>
            <button 
              @click="waterAll"
              :disabled="farmData.coins < 10"
              class="galaxy-button galaxy-button-secondary px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50"
            >
              💧 一括水やり (10🪙)
            </button>
          </div>
        </div>

        <!-- Farm Plots -->
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="(plot, index) in farmPlots"
            :key="index"
            @click="interactWithPlot(index)"
            :class="[
              'w-20 h-20 galaxy-card flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105',
              plot.needsWater ? 'ring-2 ring-blue-400' : '',
              plot.readyToHarvest ? 'ring-2 ring-yellow-400 animate-pulse' : ''
            ]"
          >
            <div class="text-2xl mb-1">{{ getPlotDisplay(plot) }}</div>
            <div class="text-xs text-galaxy-moon-silver text-center">
              {{ getPlotStatus(plot) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Shop and Seeds -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Seed Shop -->
        <div class="galaxy-card rounded-3xl p-6">
          <h3 class="text-xl font-bold galaxy-text-primary mb-4">🏪 種屋</h3>
          <div class="space-y-3">
            <div
              v-for="seed in seedShop"
              :key="seed.id"
              @click="buySeed(seed)"
              :class="[
                'galaxy-card p-4 cursor-pointer transition-all duration-200 hover:scale-102',
                farmData.coins < seed.price ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ seed.icon }}</div>
                  <div>
                    <div class="font-bold galaxy-text-primary">{{ seed.name }}</div>
                    <div class="text-sm text-galaxy-moon-silver">{{ seed.description }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-yellow-400">{{ seed.price }}🪙</div>
                  <div class="text-xs text-galaxy-moon-silver">{{ seed.growTime }}分</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory -->
        <div class="galaxy-card rounded-3xl p-6">
          <h3 class="text-xl font-bold galaxy-text-primary mb-4">🎒 インベントリ</h3>
          <div class="space-y-3">
            <div
              v-for="(item, index) in inventory"
              :key="index"
              class="galaxy-card p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ item.icon }}</div>
                  <div>
                    <div class="font-bold galaxy-text-primary">{{ item.name }}</div>
                    <div class="text-sm text-galaxy-moon-silver">{{ item.description }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-green-400">{{ item.quantity }}</div>
                  <div class="text-xs text-galaxy-moon-silver">個</div>
                </div>
              </div>
            </div>
            
            <div v-if="inventory.length === 0" class="text-center text-galaxy-moon-silver py-8">
              まだ収穫物がありません
            </div>
          </div>
        </div>
      </div>

      <!-- Learning Challenge -->
      <div v-if="currentChallenge" class="galaxy-card rounded-3xl p-8">
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold galaxy-text-primary mb-2">🌱 音素チャレンジ</h3>
          <p class="text-galaxy-moon-silver">正しい音素を選んで作物を成長させよう！</p>
        </div>

        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-6">
            <button 
              @click="playChallengeSound"
              :disabled="isPlaying"
              class="w-20 h-20 galaxy-button galaxy-button-primary rounded-full text-3xl font-bold text-white animate-pulse"
            >
              🔊
            </button>
            <div class="mt-4 text-lg text-galaxy-moon-silver">この音に対応する選択肢を選ぼう</div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              v-for="(choice, index) in challengeChoices"
              :key="index"
              @click="selectChallengeAnswer(choice)"
              :class="[
                'galaxy-card p-4 text-center cursor-pointer transition-all duration-200 hover:scale-105',
                selectedAnswer === choice ? 'ring-4 ring-green-400 scale-105' : ''
              ]"
            >
              <div class="text-2xl mb-2">{{ choice.symbol }}</div>
              <div class="text-sm text-galaxy-moon-silver">{{ choice.example }}</div>
            </button>
          </div>

          <div class="text-center">
            <button 
              @click="submitChallengeAnswer"
              :disabled="!selectedAnswer"
              class="galaxy-button galaxy-button-primary px-8 py-3 text-lg font-bold text-white rounded-xl disabled:opacity-50"
            >
              答えを確認
            </button>
          </div>
        </div>
      </div>

      <!-- Challenge Feedback -->
      <Transition name="challenge-feedback">
        <div 
          v-if="showChallengeFeedback" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            :class="[
              'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center backdrop-blur-md',
              challengeFeedbackType === 'correct' ? 'bg-green-500/90 text-white animate-grow' :
              'bg-red-500/90 text-white animate-wither'
            ]"
          >
            <div class="mb-2">
              {{ challengeFeedbackType === 'correct' ? '🌱 成長！' : '🍂 枯れた...' }}
            </div>
            <div class="text-lg font-normal">{{ challengeFeedbackDetail }}</div>
          </div>
        </div>
      </Transition>

      <!-- Harvest Celebration -->
      <Transition name="harvest-celebration">
        <div 
          v-if="showHarvestCelebration" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div class="rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center backdrop-blur-md bg-yellow-500/90 text-white animate-harvest">
            <div class="mb-2">🎉 大収穫！</div>
            <div class="text-lg font-normal">{{ harvestDetail }}</div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Settings } from 'lucide-vue-next'

export default {
  name: 'SoundFarm',
  components: {
    ArrowLeft,
    Settings
  },
  setup() {
    const router = useRouter()
    
    const showSettings = ref(false)
    const showChallengeFeedback = ref(false)
    const showHarvestCelebration = ref(false)
    const challengeFeedbackType = ref('')
    const challengeFeedbackDetail = ref('')
    const harvestDetail = ref('')
    const isPlaying = ref(false)
    const selectedAnswer = ref(null)
    const currentChallenge = ref(null)
    const challengeChoices = ref([])
    
    let farmTimer = null
    
    const farmData = reactive({
      totalHarvest: 127,
      coins: 250,
      level: 4,
      exp: 180,
      nextLevelExp: 300
    })
    
    const farmPlots = ref(Array.from({ length: 20 }, (_, index) => ({
      id: index,
      planted: false,
      seedType: null,
      plantedTime: null,
      waterLevel: 0,
      needsWater: false,
      readyToHarvest: false,
      growthStage: 0,
      maxGrowthStage: 4
    })))
    
    const seedShop = ref([
      {
        id: 1,
        name: 'A音素の種',
        description: '短母音の基本',
        icon: '🌰',
        price: 20,
        growTime: 2,
        harvestValue: 5,
        phoneme: 'a',
        sound: 'a1.m4a'
      },
      {
        id: 2,
        name: 'S音素の種',
        description: '子音の力強さ',
        icon: '🌰',
        price: 30,
        growTime: 3,
        harvestValue: 8,
        phoneme: 's',
        sound: 's.m4a'
      },
      {
        id: 3,
        name: 'T音素の種',
        description: '破裂音の鋭さ',
        icon: '🌰',
        price: 40,
        growTime: 4,
        harvestValue: 12,
        phoneme: 't',
        sound: 't.m4a'
      },
      {
        id: 4,
        name: 'M音素の種',
        description: '鼻音の響き',
        icon: '🌰',
        price: 50,
        growTime: 5,
        harvestValue: 15,
        phoneme: 'm',
        sound: 'm.m4a'
      }
    ])
    
    const inventory = ref([
      { name: 'A語彙', description: '短母音から生まれた語彙', icon: '🍎', quantity: 5 },
      { name: 'S語彙', description: '子音から生まれた語彙', icon: '🌽', quantity: 3 }
    ])
    
    const canAutoHarvest = computed(() => {
      return farmPlots.value.some(plot => plot.readyToHarvest)
    })
    
    const getPlotDisplay = (plot) => {
      if (!plot.planted) return '🟫' // empty soil
      if (plot.needsWater) return '🥵' // needs water
      if (plot.readyToHarvest) return '🌾' // ready to harvest
      
      const stages = ['🌱', '🌿', '🌾']
      return stages[Math.min(plot.growthStage, stages.length - 1)]
    }
    
    const getPlotStatus = (plot) => {
      if (!plot.planted) return '空き地'
      if (plot.needsWater) return '水不足'
      if (plot.readyToHarvest) return '収穫可能'
      return `成長中`
    }
    
    const interactWithPlot = (index) => {
      const plot = farmPlots.value[index]
      
      if (!plot.planted) {
        // Show challenge to plant seed
        showPlantingChallenge(index)
      } else if (plot.needsWater) {
        waterPlot(index)
      } else if (plot.readyToHarvest) {
        harvestPlot(index)
      }
    }
    
    const showPlantingChallenge = (plotIndex) => {
      if (inventory.value.some(item => item.quantity > 0)) {
        const randomSeed = seedShop.value[Math.floor(Math.random() * seedShop.value.length)]
        
        currentChallenge.value = {
          type: 'planting',
          plotIndex,
          targetPhoneme: randomSeed.phoneme,
          sound: randomSeed.sound,
          seed: randomSeed
        }
        
        generateChallengeChoices(randomSeed.phoneme)
      } else {
        alert('種を購入してから植えましょう！')
      }
    }
    
    const generateChallengeChoices = (correctPhoneme) => {
      const allPhonemes = [
        { symbol: 'a', example: 'cat', sound: 'a1.m4a' },
        { symbol: 's', example: 'sun', sound: 's.m4a' },
        { symbol: 't', example: 'top', sound: 't.m4a' },
        { symbol: 'm', example: 'man', sound: 'm.m4a' },
        { symbol: 'e', example: 'bed', sound: 'e1.m4a' },
        { symbol: 'i', example: 'bit', sound: 'i1.m4a' }
      ]
      
      const correct = allPhonemes.find(p => p.symbol === correctPhoneme)
      const wrong = allPhonemes.filter(p => p.symbol !== correctPhoneme)
        .sort(() => Math.random() - 0.5).slice(0, 3)
      
      challengeChoices.value = [correct, ...wrong].sort(() => Math.random() - 0.5)
      selectedAnswer.value = null
    }
    
    const playChallengeSound = async () => {
      if (isPlaying.value || !currentChallenge.value?.sound) return
      
      isPlaying.value = true
      try {
        const audio = new Audio(`/sounds/${currentChallenge.value.sound}`)
        await audio.play()
        audio.onended = () => {
          isPlaying.value = false
        }
      } catch (error) {
        console.error('Failed to play sound:', error)
        isPlaying.value = false
      }
    }
    
    const selectChallengeAnswer = (choice) => {
      selectedAnswer.value = choice
    }
    
    const submitChallengeAnswer = () => {
      if (!selectedAnswer.value || !currentChallenge.value) return
      
      const isCorrect = selectedAnswer.value.symbol === currentChallenge.value.targetPhoneme
      
      challengeFeedbackType.value = isCorrect ? 'correct' : 'incorrect'
      
      if (isCorrect) {
        challengeFeedbackDetail.value = '音素を正しく認識！種を植えました'
        
        if (currentChallenge.value.type === 'planting') {
          plantSeed(currentChallenge.value.plotIndex, currentChallenge.value.seed)
        }
        
        farmData.exp += 10
        if (farmData.exp >= farmData.nextLevelExp) {
          levelUp()
        }
      } else {
        challengeFeedbackDetail.value = `正解は "${currentChallenge.value.targetPhoneme}" でした`
      }
      
      showChallengeFeedback.value = true
      setTimeout(() => {
        showChallengeFeedback.value = false
        currentChallenge.value = null
      }, 2000)
    }
    
    const plantSeed = (plotIndex, seed) => {
      const plot = farmPlots.value[plotIndex]
      plot.planted = true
      plot.seedType = seed
      plot.plantedTime = Date.now()
      plot.growthStage = 0
      plot.waterLevel = 100
      plot.needsWater = false
      plot.readyToHarvest = false
    }
    
    const waterPlot = (plotIndex) => {
      const plot = farmPlots.value[plotIndex]
      plot.waterLevel = 100
      plot.needsWater = false
      farmData.coins -= 5
    }
    
    const waterAll = () => {
      farmPlots.value.forEach(plot => {
        if (plot.planted && plot.needsWater) {
          plot.waterLevel = 100
          plot.needsWater = false
        }
      })
      farmData.coins -= 10
    }
    
    const harvestPlot = (plotIndex) => {
      const plot = farmPlots.value[plotIndex]
      if (!plot.readyToHarvest) return
      
      const harvestValue = plot.seedType.harvestValue
      farmData.coins += harvestValue
      farmData.totalHarvest++
      farmData.exp += 20
      
      // Add to inventory
      const existingItem = inventory.value.find(item => 
        item.name === `${plot.seedType.phoneme.toUpperCase()}語彙`
      )
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        inventory.value.push({
          name: `${plot.seedType.phoneme.toUpperCase()}語彙`,
          description: `${plot.seedType.name}から生まれた語彙`,
          icon: '🌾',
          quantity: 1
        })
      }
      
      // Reset plot
      plot.planted = false
      plot.seedType = null
      plot.plantedTime = null
      plot.waterLevel = 0
      plot.needsWater = false
      plot.readyToHarvest = false
      plot.growthStage = 0
      
      harvestDetail.value = `+${harvestValue}🪙 獲得！`
      showHarvestCelebration.value = true
      setTimeout(() => {
        showHarvestCelebration.value = false
      }, 2000)
      
      if (farmData.exp >= farmData.nextLevelExp) {
        levelUp()
      }
    }
    
    const autoHarvest = () => {
      let totalHarvested = 0
      let totalCoins = 0
      
      farmPlots.value.forEach((plot, index) => {
        if (plot.readyToHarvest) {
          totalCoins += plot.seedType.harvestValue
          totalHarvested++
          harvestPlot(index)
        }
      })
      
      if (totalHarvested > 0) {
        harvestDetail.value = `${totalHarvested}個収穫！ +${totalCoins}🪙`
        showHarvestCelebration.value = true
        setTimeout(() => {
          showHarvestCelebration.value = false
        }, 2000)
      }
    }
    
    const buySeed = (seed) => {
      if (farmData.coins < seed.price) return
      
      farmData.coins -= seed.price
      
      // Add seed to inventory or use immediately
      const emptyPlot = farmPlots.value.find(plot => !plot.planted)
      if (emptyPlot) {
        showPlantingChallenge(farmPlots.value.indexOf(emptyPlot))
      }
    }
    
    const levelUp = () => {
      farmData.level++
      farmData.exp = 0
      farmData.nextLevelExp = farmData.level * 100
      
      alert(`🎉 レベルアップ！ レベル${farmData.level}になりました！`)
    }
    
    const updateFarm = () => {
      const now = Date.now()
      
      farmPlots.value.forEach(plot => {
        if (plot.planted && plot.seedType) {
          const elapsedMinutes = (now - plot.plantedTime) / (1000 * 60)
          const growthProgress = elapsedMinutes / plot.seedType.growTime
          
          // Update growth stage
          plot.growthStage = Math.min(Math.floor(growthProgress * plot.maxGrowthStage), plot.maxGrowthStage)
          
          // Check if ready to harvest
          if (growthProgress >= 1 && plot.waterLevel > 0) {
            plot.readyToHarvest = true
          }
          
          // Water consumption
          plot.waterLevel = Math.max(0, plot.waterLevel - 1)
          if (plot.waterLevel <= 20) {
            plot.needsWater = true
          }
        }
      })
    }
    
    const handleBack = () => {
      router.back()
    }
    
    onMounted(() => {
      farmTimer = setInterval(updateFarm, 5000) // Update every 5 seconds
    })
    
    onUnmounted(() => {
      if (farmTimer) {
        clearInterval(farmTimer)
      }
    })
    
    return {
      showSettings,
      showChallengeFeedback,
      showHarvestCelebration,
      challengeFeedbackType,
      challengeFeedbackDetail,
      harvestDetail,
      isPlaying,
      selectedAnswer,
      currentChallenge,
      challengeChoices,
      farmData,
      farmPlots,
      seedShop,
      inventory,
      canAutoHarvest,
      getPlotDisplay,
      getPlotStatus,
      interactWithPlot,
      playChallengeSound,
      selectChallengeAnswer,
      submitChallengeAnswer,
      waterAll,
      autoHarvest,
      buySeed,
      handleBack
    }
  }
}
</script>

<style scoped>
/* Galaxy background and farm atmosphere effects */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

.farm-atmosphere-effect {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 30% 70%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 30%, rgba(101, 163, 13, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(254, 240, 138, 0.1) 0%, transparent 50%);
  animation: farm-breeze 6s ease-in-out infinite alternate;
}

@keyframes farm-breeze {
  0% { filter: brightness(1) saturate(1); }
  100% { filter: brightness(1.1) saturate(1.2); }
}

.animate-grow {
  animation: grow-effect 1.2s ease-out;
}

.animate-wither {
  animation: wither-effect 0.8s ease-out;
}

.animate-harvest {
  animation: harvest-celebration 1.5s ease-out;
}

@keyframes grow-effect {
  0% { transform: scale(0.3) translateY(50px); opacity: 0; }
  50% { transform: scale(1.2) translateY(-10px); opacity: 0.8; filter: brightness(1.5); }
  100% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1); }
}

@keyframes wither-effect {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(0.8) rotate(-10deg); opacity: 0.6; filter: hue-rotate(60deg); }
  100% { transform: scale(0.5) rotate(-20deg); opacity: 0; filter: hue-rotate(120deg); }
}

@keyframes harvest-celebration {
  0% { transform: scale(0.5) rotate(-30deg); opacity: 0; }
  25% { transform: scale(1.2) rotate(5deg); opacity: 0.8; }
  50% { transform: scale(0.9) rotate(-5deg); opacity: 1; }
  75% { transform: scale(1.1) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.challenge-feedback-enter-active, .challenge-feedback-leave-active {
  transition: all 1s ease;
}

.challenge-feedback-enter-from {
  opacity: 0;
  transform: scale(0.3) translateY(-100px) rotate(-45deg);
}

.challenge-feedback-leave-to {
  opacity: 0;
  transform: scale(2) translateY(100px) rotate(45deg);
}

.harvest-celebration-enter-active, .harvest-celebration-leave-active {
  transition: all 1.2s ease;
}

.harvest-celebration-enter-from {
  opacity: 0;
  transform: scale(0.2) translateY(-200px);
}

.harvest-celebration-leave-to {
  opacity: 0;
  transform: scale(3) translateY(200px);
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