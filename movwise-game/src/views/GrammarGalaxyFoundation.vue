<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 p-6">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button 
            @click="$router.push('/')"
            class="galaxy-button galaxy-button-secondary flex items-center space-x-2"
          >
            <span>←</span>
            <span>ホーム</span>
          </button>
          <h1 class="text-3xl font-bold galaxy-text-primary">
            <span class="galaxy-glow">🌌 Grammar Galaxy Foundation - 文法銀河基盤司令部</span>
          </h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="galaxy-stats-card">
            <span>⭐</span>
            <span class="font-bold">{{ totalStars }}</span>
          </div>
          <div class="galaxy-stats-card">
            <span class="text-sm">レベル {{ playerLevel }}</span>
          </div>
          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 max-w-7xl mx-auto px-6 pb-12">
      <!-- Progress Overview -->
      <div class="mb-12">
        <div class="galaxy-card p-8">
          <h2 class="text-2xl font-bold galaxy-text-primary cosmic-title mb-6">
            🚀 あなたの銀河征服作戦状況
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-4xl font-bold galaxy-text-primary">{{ unlockedPlanetsCount }}</div>
              <div class="text-galaxy-moon-silver">解禁済み惑星</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold galaxy-text-primary">{{ completionRate }}%</div>
              <div class="text-galaxy-moon-silver">総合進捗率</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold galaxy-text-primary">{{ totalGamesCompleted }}</div>
              <div class="text-galaxy-moon-silver">プレイ回数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Planet Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <PlanetCard 
          v-for="(planet, planetId) in planetsData"
          :key="planetId"
          :planet-id="planetId"
          :planet-info="planet"
          :is-unlocked="isPlanetUnlocked(planetId)"
          :is-current="false"
          :progress="planet"
          @select-planet="selectPlanet"
          @start-game="startGame"
        />
      </div>

      <!-- Quick Actions -->
      <div class="galaxy-card p-8">
        <h3 class="text-xl font-bold galaxy-text-primary cosmic-title mb-6">🎮 銀河司令部クイックコマンド</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            @click="startRecommendedGame"
            class="galaxy-button galaxy-button-primary p-6 text-left"
            :disabled="!hasRecommendedGame"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">🎯</span>
              <div>
                <div class="font-bold text-white">おすすめゲーム</div>
                <div class="text-sm text-galaxy-moon-silver opacity-80">{{ recommendedGameText }}</div>
              </div>
            </div>
          </button>
          
          <button 
            @click="continueProgress"
            class="galaxy-button galaxy-button-secondary p-6 text-left"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">📈</span>
              <div>
                <div class="font-bold text-white">進捗を続ける</div>
                <div class="text-sm text-galaxy-moon-silver opacity-80">前回の続きから</div>
              </div>
            </div>
          </button>
          
          <button 
            @click="showStats = true"
            class="galaxy-button galaxy-button-secondary p-6 text-left"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">📊</span>
              <div>
                <div class="font-bold text-white">学習統計</div>
                <div class="text-sm text-galaxy-moon-silver opacity-80">詳細なデータを確認</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Rush Zone Section -->
      <section class="mb-12">
        <div class="galaxy-card p-8 mb-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold galaxy-text-primary cosmic-title mb-2">⚡ ラッシュ・ゾーン - 高速文法訓練宇宙基地</h2>
            <p class="text-galaxy-moon-silver text-lg">文法エネルギーの集中的な充電・強化・瞬発力向上の特別訓練エリア</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="rush in rushZoneList" :key="rush.id" :class="['galaxy-card', rush.unlocked ? 'unlocked' : 'locked', 'p-6', 'transition-all', 'duration-300']">
              <div class="text-center mb-4">
                <div class="text-5xl mb-2">{{ rush.icon }}</div>
                <h3 class="text-xl font-bold galaxy-text-primary mb-2">{{ rush.name }}</h3>
              </div>
              <div v-if="rush.unlocked">
                <div class="flex justify-between text-galaxy-moon-silver mb-2">
                  <span>習熟度:</span>
                  <span>{{ rush.mastery }}%</span>
                </div>
                <div class="flex justify-between text-galaxy-moon-silver mb-2">
                  <span>今日:</span>
                  <span>{{ rush.todaySessions }}/5</span>
                </div>
                <div class="flex justify-between text-galaxy-moon-silver mb-4">
                  <span>ベスト:</span>
                  <span>{{ rush.bestScore }}</span>
                </div>
                <button class="w-full galaxy-button galaxy-button-primary py-3 rounded-xl font-bold text-white hover:shadow-lg transition-all duration-200">
                  ▶️ PLAY
                </button>
              </div>
              <div v-else class="text-galaxy-moon-silver text-center mt-4">
                <span>🔒 {{ rush.unlockRequirement }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modals -->
    <GameSelectionModal 
      :show="showGameSelection"
      :planet-id="selectedPlanetId"
      :planet-info="selectedPlanetInfo"
      :available-games="selectedPlanetGames"
      @close="showGameSelection = false"
      @start-game="onStartGame"
    />

    <SettingsModal 
      v-if="showSettings"
      @close="showSettings = false"
    />

    <StatsModal 
      v-if="showStats"
      @close="showStats = false"
    />

    <PatternHunterGame v-if="showPatternHunter" @back="handleBackToGalaxy" />
    
    <!-- Footer -->
    <CommonFooter @navigate="handleFooterNavigation" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import PlanetCard from '../components/games/grammar-galaxy/shared/PlanetCard.vue'
import GameSelectionModal from '../components/games/grammar-galaxy/shared/GameSelectionModal.vue'
import SettingsModal from '../components/games/grammar-galaxy/shared/SettingsModal.vue'
import StatsModal from '../components/games/grammar-galaxy/shared/StatsModal.vue'
import PatternHunterGame from '@/components/games/grammar-galaxy/PatternHunterGame.vue'
import CommonFooter from '@/components/CommonFooter.vue'

const props = defineProps({
  planetId: {
    type: String,
    default: 'beVerb'
  }
})

const router = useRouter()

// Store初期化（エラーハンドリング付き）
let grammarStore = null
try {
  grammarStore = useGrammarGalaxyStore()
  console.log('✅ Grammar store initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize grammar store:', error)
  // エラーが発生した場合はホームに戻る
  router.push('/')
}

// Reactive state
const showGameSelection = ref(false)
const showSettings = ref(false)
const showStats = ref(false)
const selectedPlanetId = ref(null)
const showPatternHunter = ref(false)

// Safe computed properties with fallback values
const playerLevel = computed(() => {
  try {
    return grammarStore?.playerData?.level || 1
  } catch (error) {
    console.warn('Error accessing playerData.level:', error)
    return 1
  }
})

const totalStars = computed(() => {
  try {
    return grammarStore?.playerData?.totalStars || 0
  } catch (error) {
    console.warn('Error accessing playerData.totalStars:', error)
    return 0
  }
})

const totalGamesCompleted = computed(() => {
  try {
    return grammarStore?.playerData?.totalGamesCompleted || 0
  } catch (error) {
    console.warn('Error accessing playerData.totalGamesCompleted:', error)
    return 0
  }
})

const planetsData = computed(() => {
  try {
    return grammarStore?.planetsData || {}
  } catch (error) {
    console.warn('Error accessing planetsData:', error)
    return {}
  }
})

const unlockedPlanetsCount = computed(() => {
  try {
    if (!grammarStore || !grammarStore.planetsData) return 0
    return Object.keys(grammarStore.planetsData).filter(planetId => 
      grammarStore.isPlanetUnlocked?.(planetId)
    ).length
  } catch (error) {
    console.warn('Error calculating unlocked planets:', error)
    return 0
  }
})

const completionRate = computed(() => {
  try {
    const stats = grammarStore?.getStatistics?.() || {}
    return Math.round(stats.gameCompletionRate || 0)
  } catch (error) {
    console.warn('Error calculating completion rate:', error)
    return 0
  }
})

const selectedPlanetInfo = computed(() => {
  if (!selectedPlanetId.value || !grammarStore) return null
  try {
    return grammarStore.getPlanetInfo?.(selectedPlanetId.value) || null
  } catch (error) {
    console.warn('Error getting planet info:', error)
    return null
  }
})

const selectedPlanetGames = computed(() => {
  if (!selectedPlanetInfo.value?.games) return []
  
  try {
    // ストアからのゲームデータをGameSelectionModal用の形式に変換
    return selectedPlanetInfo.value.games.map(game => ({
      id: game.id,
      title: game.name,
      description: `${game.name}で${selectedPlanetInfo.value.name}の学習を進めましょう`,
      fullDescription: `${selectedPlanetInfo.value.description}の一環として、${game.name}をプレイします。`,
      icon: game.icon === '⚡' ? 'bolt' : game.icon === '🎨' ? 'paint-brush' : game.icon === '🧩' ? 'puzzle-piece' : 'play',
      iconColor: game.icon === '⚡' ? 'text-yellow-400' : game.icon === '🎨' ? 'text-blue-400' : game.icon === '🧩' ? 'text-purple-400' : 'text-green-400',
      category: 'grammar',
      difficulty: game.maxStars || 2,
      estimatedTime: '5-10',
      objectives: [
        `${game.name}の習得`,
        '文法理解の向上',
        'スコアアップを目指す'
      ],
      isLocked: game.id === 'grammarReflexArena' ? false : !game.unlocked, // 開発用：Grammar Reflex Arenaを強制アンロック
      isNew: false,
      lockReason: (game.unlocked || game.id === 'grammarReflexArena') ? '' : '前のゲームを完了してください',
      bestScore: game.bestScore || 0,
      stars: game.stars || 0,
      playCount: game.attempts || 0
    }))
  } catch (error) {
    console.warn('Error converting planet games:', error)
    return []
  }
})

const hasRecommendedGame = computed(() => {
  try {
    const activity = grammarStore?.recommendedActivity
    return activity && activity.type === 'game'
  } catch (error) {
    console.warn('Error checking recommended game:', error)
    return false
  }
})

const recommendedGameText = computed(() => {
  try {
    const activity = grammarStore?.recommendedActivity
    if (!activity) return 'まずは惑星を解禁しましょう'
    return activity.description || activity.name
  } catch (error) {
    console.warn('Error getting recommended game text:', error)
    return 'まずは惑星を解禁しましょう'
  }
})

const rushZoneList = computed(() => {
  try {
    return grammarStore?.rushZoneData ? Object.values(grammarStore.rushZoneData) : []
  } catch (error) {
    console.warn('Error getting rush zone data:', error)
    return []
  }
})

// Safe methods with error handling
const isPlanetUnlocked = (planetId) => {
  try {
    return grammarStore?.isPlanetUnlocked?.(planetId) || false
  } catch (error) {
    console.warn('Error checking planet unlock status:', error)
    return false
  }
}

const selectPlanet = (planetId) => {
  console.log('selectPlanet called:', planetId)
  
  try {
    if (!grammarStore) {
      console.error('Grammar store not available')
      alert('エラー: データの読み込みに失敗しました')
      return
    }

    const planet = grammarStore.getPlanetInfo?.(planetId)
    const unlocked = grammarStore.isPlanetUnlocked?.(planetId)
    
    console.log('planet info:', planet)
    console.log('isPlanetUnlocked:', unlocked)
    
    if (!planet) {
      console.warn('Planet not found:', planetId)
      alert('エラー: 惑星情報が見つかりません')
      return
    }
    
    if (!unlocked) {
      console.warn('Planet is locked:', planetId)
      alert('🔒 この惑星はまだアンロックされていません')
      return
    }

    selectedPlanetId.value = planetId
    showGameSelection.value = true
    console.log('selectedPlanetId:', selectedPlanetId.value, 'showGameSelection:', showGameSelection.value)
    console.log('selectedPlanetInfo.value.games:', selectedPlanetInfo.value.games)
    selectedPlanetInfo.value.games.forEach((game, index) => {
      console.log(`Store Game ${index}:`, { id: game.id, name: game.name, unlocked: game.unlocked })
    })
    console.log('selectedPlanetGames:', selectedPlanetGames.value)
    selectedPlanetGames.value.forEach((game, index) => {
      console.log(`Game ${index}:`, { id: game.id, title: game.title, isLocked: game.isLocked })
    })
  } catch (error) {
    console.error('Error in selectPlanet:', error)
    alert('エラーが発生しました。ページを再読み込みしてください。')
  }
}

const startGame = (planetId, gameId) => {
  try {
    console.log('startGame called with:', { planetId, gameId })
    navigateToGame(planetId, gameId)
  } catch (error) {
    console.error('Error starting game:', error)
    alert('ゲームの開始に失敗しました')
  }
}

const startRecommendedGame = () => {
  try {
    if (!grammarStore) return
    
    const activity = grammarStore.recommendedActivity
    if (activity && activity.type === 'game') {
      navigateToGame(activity.planetId || 'beVerb', activity.id)
    } else if (activity && activity.type === 'planet') {
      selectPlanet(activity.id)
    }
  } catch (error) {
    console.error('Error starting recommended game:', error)
    alert('推奨ゲームの開始に失敗しました')
  }
}

const continueProgress = () => {
  try {
    if (!grammarStore) return
    
    const activity = grammarStore.recommendedActivity
    if (activity) {
      if (activity.type === 'game') {
        navigateToGame(activity.planetId || 'beVerb', activity.id)
      } else {
        selectPlanet(activity.id)
      }
    }
  } catch (error) {
    console.error('Error continuing progress:', error)
    alert('進捗の継続に失敗しました')
  }
}

const navigateToGame = (planetId, gameId) => {
  try {
    console.log('navigateToGame called with:', { planetId, gameId })
    // ゲームIDに基づいてルートを決定
    const routeMap = {
      grammarColorCode: 'grammar-color-code',
      'grammar-color-code': 'grammar-color-code',
      patternHunter: 'pattern-hunter',
      'pattern-hunter': 'pattern-hunter',
      timeZoneNavigator: 'time-zone-navigator',
      'time-zone-navigator': 'time-zone-navigator',
      grammarReflexArena: 'grammar-reflex-arena',
      'grammar-reflex-arena': 'grammar-reflex-arena',
      grammarPuzzleCascade: 'grammar-puzzle-cascade',
      'grammar-puzzle-cascade': 'grammar-puzzle-cascade',
      sentenceArchitecture: 'sentence-architecture',
      'sentence-architecture': 'sentence-architecture',
      grammarMemoryPalace: 'grammar-memory-palace',
      'grammar-memory-palace': 'grammar-memory-palace',
      grammarFlowCoordination: 'grammar-flow-coordination',
      'grammar-flow-coordination': 'grammar-flow-coordination',
      advancedPatternMatrix: 'advanced-pattern-matrix',
      'advanced-pattern-matrix': 'advanced-pattern-matrix',
      grammarRhythmSync: 'grammar-rhythm-sync',
      'grammar-rhythm-sync': 'grammar-rhythm-sync'
    }
    
    const routeName = routeMap[gameId]
    console.log('Route mapping result:', { gameId, routeName })
    
    if (routeName) {
      console.log('Navigating to route:', { name: routeName, params: { planetId } })
      
      // Grammar Reflex Arenaの場合はparamsなしで試す
      const routeConfig = gameId === 'grammarReflexArena' || gameId === 'grammar-reflex-arena' 
        ? { name: routeName }
        : { name: routeName, params: { planetId } }
      
      console.log('Final route config:', routeConfig)
      
      router.push(routeConfig).then(() => {
        console.log('Navigation successful')
      }).catch(err => {
        console.error('Navigation error:', err)
        // フォールバック: グラマーカラーコードゲームに移動
        router.push({
          name: 'grammar-color-code',
          params: { planetId: 'beVerb' }
        })
      })
    } else {
      console.warn('Unknown game ID:', gameId)
      // デフォルトはgrammar-color-code
      router.push({
        name: 'grammar-color-code',
        params: { planetId: planetId || 'beVerb' }
      }).catch(err => {
        console.error('Default navigation error:', err)
        alert('ゲームページに移動できませんでした')
      })
    }
  } catch (error) {
    console.error('Error in navigateToGame:', error)
    alert('ゲームの開始に失敗しました')
  }
}

const onStartGame = ({ game, settings }) => {
  try {
    console.log('onStartGame called with:', { game, settings })
    showGameSelection.value = false
    if (selectedPlanetId.value && game?.id) {
      navigateToGame(selectedPlanetId.value, game.id)
    } else {
      console.error('Missing planetId or game.id:', { selectedPlanetId: selectedPlanetId.value, gameId: game?.id })
      alert('ゲーム情報が不完全です')
    }
  } catch (error) {
    console.error('Error in onStartGame:', error)
    alert('ゲームの開始に失敗しました')
  }
}

const handleBackToGalaxy = (event) => {
  showPatternHunter.value = false
  if (event && event.to === 'home') {
    router.push({ name: 'home' })
  } else {
    router.push({ name: 'grammar-galaxy-hub' })
  }
}

const handleFooterNavigation = (section) => {
  console.log('Footer navigation clicked:', section)
  
  try {
    switch (section) {
      case 'sound':
        // サウンド星雲 - Sound Adventure Hub
        router.push({ name: 'SoundAdventureHub' })
        break
      case 'grammar':
        // 文法銀河 - Grammar Galaxy Hub
        router.push({ name: 'grammar-galaxy-hub' })
        break
      case 'academy':
        // バーチャル基地 - Co-Pilot Training Dock
        router.push({ name: 'CoPilotDock' })
        break
      case 'profile':
        // 船長コックピット - Teacher Dashboard または Home
        router.push({ name: 'TeacherDashboard' }).catch(() => {
          // Teacher Dashboardが利用できない場合はホームに戻る
          router.push({ name: 'home' })
        })
        break
      default:
        console.warn('Unknown navigation section:', section)
        router.push({ name: 'home' })
    }
  } catch (error) {
    console.error('Footer navigation error:', error)
    router.push({ name: 'home' })
  }
}

// Lifecycle
onMounted(() => {
  try {
    if (grammarStore && typeof grammarStore.loadProgress === 'function') {
      grammarStore.loadProgress()
      console.log('✅ Grammar store progress loaded')
    } else {
      console.warn('⚠️ Grammar store not properly initialized')
    }
  } catch (error) {
    console.error('❌ Error loading progress:', error)
  }
})
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

.galaxy-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.galaxy-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
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

.galaxy-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 0 25px rgba(79, 172, 254, 0.6),
    inset 0 0 25px rgba(0, 242, 254, 0.3);
}

.galaxy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.energy-gauge {
  background: linear-gradient(90deg, 
    #60A5FA 0%, 
    #A78BFA 50%, 
    #F472B6 100%);
  transition: width 0.5s ease;
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

/* Responsive design */
@media (max-width: 768px) {
  .galaxy-card {
    margin: 0 1rem;
  }
  
  .galaxy-stats-card {
    @apply px-2 py-1 text-xs;
  }
  
  .stars-layer-1,
  .stars-layer-2,
  .stars-layer-3 {
    background-size: 100px 50px;
  }
}
</style>