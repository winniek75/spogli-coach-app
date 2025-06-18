<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    <!-- ヘッダー -->
    <header class="relative z-10 p-6">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="galaxy-button galaxy-button-secondary flex items-center space-x-2">
            <ChevronLeftIcon class="h-6 w-6 cosmic-glow" />
            <span>戻る</span>
          </button>
          <h1 class="text-3xl font-bold galaxy-text-primary cosmic-title">🌌 グラマー・ギャラクシー司令部</h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="galaxy-stats-card">
            <StarIcon class="h-5 w-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold">{{ playerData.totalStars }}</span>
          </div>
          <div class="galaxy-stats-card">
            <span class="text-sm">レベル {{ playerData.level }}</span>
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

    <!-- 宇宙マップ -->
    <main class="galaxy-map" ref="galaxyMap">
      <!-- 背景の星とパーティクル -->
      <div class="stars-background">
        <div 
          v-for="star in backgroundStars" 
          :key="star.id"
          class="background-star"
          :style="{ 
            left: star.x + '%', 
            top: star.y + '%',
            animationDelay: star.delay + 's',
            animationDuration: star.duration + 's'
          }"
        ></div>
      </div>

      <!-- Rush Zone セクション -->
      <div class="relative z-10 max-w-6xl mx-auto mb-16">
        <div class="galaxy-card p-8 mb-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold galaxy-text-primary cosmic-title mb-2">⚡ ラッシュ・ゾーン - 高速文法訓練宇宙基地</h2>
            <p class="text-galaxy-moon-silver text-lg">文法エネルギーの集中的な充電・強化・瞬発力向上の特別訓練エリア</p>
          </div>

          <!-- Rush Games Grid -->
          <div class="rush-games-grid">
            <!-- Be Verb Rush -->
            <div 
              class="galaxy-card"
              :class="{ 
                'unlocked': beVerbRushData.unlocked,
                'completed': beVerbRushData.mastery >= 90 
              }"
              @click="startBeVerbRush"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">🏃‍♂️</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">Be Verb Rush</h3>
                <div v-if="beVerbRushData.unlocked" class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">{{ beVerbRushData.mastery }}%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">{{ beVerbRushData.todaySessions }}/5</span>
                  </div>
                  <div class="best-score">
                    <span class="score-label">ベスト:</span>
                    <span class="score-value">{{ beVerbRushData.bestScore }}</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startBeVerbRush"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
                <div v-else class="rush-locked">
                  <span>🔒 要解禁</span>
                </div>
              </div>
            </div>

            <!-- Verb Rush -->
            <div 
              class="galaxy-card"
              :class="{ 
                'unlocked': verbRushData.unlocked,
                'completed': verbRushData.mastery >= 90 
              }"
              @click="startVerbRush"
            >
              <div class="rush-game-surface">
                <div class="rush-game-icon">⚡</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">Verb Rush</h3>
                <div v-if="verbRushData.unlocked" class="rush-game-stats">
                  <div class="mastery-display">
                    <span class="mastery-label">習熟度:</span>
                    <span class="mastery-value">{{ verbRushData.mastery }}%</span>
                  </div>
                  <div class="today-progress">
                    <span class="progress-label">今日:</span>
                    <span class="progress-value">{{ verbRushData.todaySessions }}/5</span>
                  </div>
                  <div class="best-score">
                    <span class="score-label">ベスト:</span>
                    <span class="score-value">{{ verbRushData.bestScore }}</span>
                  </div>
                  <button 
                    class="rush-play-button"
                    @click.stop="startVerbRush"
                  >
                    <span class="cosmic-glow">▶️</span> PLAY
                  </button>
                </div>
                <div v-else class="rush-locked">
                  <span>🔒 要解禁</span>
                </div>
              </div>
            </div>

            <!-- Word Rush -->
            <div class="galaxy-card locked">
              <div class="rush-game-surface">
                <div class="rush-game-icon opacity-50">🏃‍♂️</div>
                <div class="lightning-effect"></div>
              </div>
              <div class="rush-game-info">
                <h3 class="rush-game-name">Word Rush</h3>
                <div class="rush-locked">
                  <span>🔒 基本Rush完了で解禁</span>
                  <div class="unlock-condition">Be動詞・Verb Rush 完了後</div>
                </div>
              </div>
            </div>
          </div>
          </div>

        <!-- Rush Zone 統計 -->
        <div class="rush-zone-stats">
          <h4 class="stats-title">📊 今日のRush活動</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ dailyRushSessions }}</div>
              <div class="stat-label">セッション</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ averageAccuracy }}%</div>
              <div class="stat-label">平均正答率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalRushTime }}分</div>
              <div class="stat-label">練習時間</div>
            </div>
          </div>
        </div>
      </div>

      <!-- メイン学習パス -->
      <div class="learning-path">
        <!-- Level 1: Grammar Foundation Solar System -->
        <div class="solar-system level-1" :class="{ 'unlocked': isLevelUnlocked(1) }">
          <h2 class="system-title">🌌 Level 1: ファウンデーション・ソーラーシステム</h2>
          <p class="system-subtitle">🪐 基礎文法惑星群 - 英検5級レベルの宇宙探索</p>
          
          <div class="planets-container">
            <!-- Be動詞惑星 -->
            <div 
              class="planet be-verb-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('beVerb'),
                'completed': isPlanetCompleted('beVerb'),
                'current': currentPlanet === 'beVerb'
              }"
              @click="enterPlanet('beVerb')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🪐</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">Be動詞惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 3" 
                      :key="i"
                      :class="getStarClass('beVerb', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('beVerb') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 一般動詞惑星 -->
            <div 
              class="planet general-verb-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('generalVerb'),
                'completed': isPlanetCompleted('generalVerb'),
                'current': currentPlanet === 'generalVerb'
              }"
              @click="enterPlanet('generalVerb')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌍</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">一般動詞惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 3" 
                      :key="i"
                      :class="getStarClass('generalVerb', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('generalVerb') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 基本語順惑星 -->
            <div 
              class="planet word-order-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('wordOrder'),
                'completed': isPlanetCompleted('wordOrder'),
                'current': currentPlanet === 'wordOrder'
              }"
              @click="enterPlanet('wordOrder')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌕</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">語順惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 3" 
                      :key="i"
                      :class="getStarClass('wordOrder', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('wordOrder') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Level 2: Grammar Application Moon -->
        <div class="solar-system level-2" :class="{ 'unlocked': isLevelUnlocked(2) }">
          <h2 class="system-title">Level 2: Application Moon</h2>
          <p class="system-subtitle">英検4級レベル - 応用文法の習得</p>
          
          <div class="planets-container">
            <!-- 時制惑星 -->
            <div 
              class="planet tense-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('tense'),
                'completed': isPlanetCompleted('tense'),
                'current': currentPlanet === 'tense'
              }"
              @click="enterPlanet('tense')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌙</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">時制惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 5" 
                      :key="i"
                      :class="getStarClass('tense', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('tense') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 比較・助動詞惑星 -->
            <div 
              class="planet comparison-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('comparison'),
                'completed': isPlanetCompleted('comparison'),
                'current': currentPlanet === 'comparison'
              }"
              @click="enterPlanet('comparison')"
            >
              <div class="planet-surface">
                <div class="planet-icon">⭐</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">比較・助動詞惑星</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 5" 
                      :key="i"
                      :class="getStarClass('comparison', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('comparison') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Level 3: Grammar Mastery Galaxy -->
        <div class="solar-system level-3" :class="{ 'unlocked': isLevelUnlocked(3) }">
          <h2 class="system-title">Level 3: Mastery Galaxy</h2>
          <p class="system-subtitle">英検3級レベル - 高度文法の習得</p>
          
          <div class="planets-container">
            <!-- 複合文法惑星 -->
            <div 
              class="planet complex-planet"
              :class="{ 
                'unlocked': isPlanetUnlocked('complex'),
                'completed': isPlanetCompleted('complex'),
                'current': currentPlanet === 'complex'
              }"
              @click="enterPlanet('complex')"
            >
              <div class="planet-surface">
                <div class="planet-icon">🌌</div>
                <div class="planet-glow"></div>
              </div>
              <div class="planet-info">
                <h3 class="planet-name">複合文法銀河</h3>
                <div class="planet-progress">
                  <div class="progress-stars">
                    <StarIcon 
                      v-for="i in 7" 
                      :key="i"
                      :class="getStarClass('complex', i)"
                    />
                  </div>
                  <div class="progress-text">
                    {{ getPlanetProgress('complex') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 現在の学習状況パネル -->
      <div class="current-status-panel">
        <div class="panel-header">
          <h3>今日の学習</h3>
          <div class="daily-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: dailyProgressPercent + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ dailyProgressPercent }}%</span>
          </div>
        </div>
        
        <div class="recommended-next">
          <h4>推奨次ステップ</h4>
          <div class="next-activity" @click="goToRecommendedActivity">
            <div class="activity-icon">🎯</div>
            <div class="activity-info">
              <div class="activity-name">{{ recommendedActivity.name }}</div>
              <div class="activity-description">{{ recommendedActivity.description }}</div>
            </div>
            <ChevronRightIcon class="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div class="recent-achievements" v-if="recentAchievements.length > 0">
          <h4>最近の達成</h4>
          <div class="achievements-list">
            <div 
              v-for="achievement in recentAchievements" 
              :key="achievement.id"
              class="achievement-item"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-text">{{ achievement.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 統一フッターナビゲーション -->
    <CommonFooter 
      :active="'grammar'"
      @navigate="handleFooterNavigation"
    />

    <!-- プラネット選択モーダル -->
    <Transition name="modal">
      <div v-if="showPlanetModal" class="modal-overlay" @click="closePlanetModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedPlanetInfo.name }}</h3>
            <button @click="closePlanetModal" class="close-button">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <div class="modal-body">
            <div class="planet-detail">
              <div class="planet-icon-large">{{ selectedPlanetInfo.icon }}</div>
              <p class="planet-description">{{ selectedPlanetInfo.description }}</p>
              
              <div class="available-games">
                <h4>利用可能なゲーム</h4>
                <div class="games-grid">
                  <div 
                    v-for="game in selectedPlanetInfo.games" 
                    :key="game.id"
                    class="game-card"
                    :class="{ 'locked': !game.unlocked }"
                    @click="startGame(game)"
                  >
                    <div class="game-icon">{{ game.icon }}</div>
                    <div class="game-name">{{ game.name }}</div>
                    <div class="game-stars">
                      <StarIcon 
                        v-for="i in 3" 
                        :key="i"
                        :class="getGameStarClass(game.id, i)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="startPlanetLearning" class="start-button">
              学習開始
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'grammar-galaxy-foundation',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    StarIcon,
    XMarkIcon,
    CommonFooter
  },
  setup() {
    const router = useRouter()
    let grammarStore
    try {
      grammarStore = useGrammarGalaxyStore()
      // 初期化が成功したかチェック
      if (!grammarStore.planetsData) {
        console.warn('Grammar store not fully initialized, using fallback')
        grammarStore.loadProgress()
      }
    } catch (error) {
      console.error('Failed to initialize grammar store:', error)
      // フォールバック処理
      router.push('/')
      return
    }

    // リアクティブなデータ
    const galaxyMap = ref(null)
    const showPlanetModal = ref(false)
    const selectedPlanet = ref(null)
    const currentPlanet = ref('beVerb')
    const backgroundStars = ref([])

    // 計算されたプロパティ（安全性チェック付き）
    const playerData = computed(() => {
      return {
        level: grammarStore.playerData?.value?.level || 1,
        totalStars: grammarStore.playerData?.value?.totalStars || 0,
        totalGamesCompleted: grammarStore.playerData?.value?.totalGamesCompleted || 0,
        currentStreak: grammarStore.playerData?.value?.currentStreak || 0,
        lastPlayDate: grammarStore.playerData?.value?.lastPlayDate || null,
        preferences: grammarStore.playerData?.value?.preferences || {
          difficulty: 'normal',
          soundEnabled: true,
          animationsEnabled: true
        }
      }
    })

    const maxStars = computed(() => {
      return grammarStore.maxStars?.value || 0
    })

    const dailyProgressPercent = computed(() => {
      return grammarStore.dailyProgressPercent?.value || 0
    })

    const recommendedActivity = computed(() => {
      return grammarStore.recommendedActivity?.value || {
        id: 'beVerb',
        name: 'Be動詞惑星',
        description: '英語学習の第一歩を踏み出しましょう',
        type: 'planet'
      }
    })

    const recentAchievements = computed(() => {
      return grammarStore.recentAchievements?.value || []
    })

    const selectedPlanetInfo = computed(() => {
      if (typeof grammarStore.getPlanetInfo === 'function') {
        return grammarStore.getPlanetInfo(selectedPlanet.value)
      }
      return null
    })

    // 背景の星を生成
    const generateBackgroundStars = () => {
      const stars = []
      for (let i = 0; i < 100; i++) {
        stars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 2 + Math.random() * 3
        })
      }
      backgroundStars.value = stars
    }

    // 🆕 Rush Zone データ
    const beVerbRushData = computed(() => {
      try {
        return grammarStore.rushZoneData?.beVerbRush || {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      } catch (error) {
        return {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      }
    })

    const verbRushData = computed(() => {
      try {
        return grammarStore.rushZoneData?.verbRush || {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      } catch (error) {
        return {
          unlocked: true,
          mastery: 0,
          todaySessions: 0,
          bestScore: 0,
          totalAttempts: 0
        }
      }
    })

    const dailyRushSessions = computed(() => {
      try {
        return grammarStore.getDailyRushSessions?.() || 0
      } catch (error) {
        return 0
      }
    })

    const averageAccuracy = computed(() => {
      try {
        return grammarStore.getAverageRushAccuracy?.() || 0
      } catch (error) {
        return 0
      }
    })

    const totalRushTime = computed(() => {
      try {
        return grammarStore.getTotalRushTime?.() || 0
      } catch (error) {
        return 0
      }
    })

    // 🆕 Be Verb Rush 開始関数
    const startBeVerbRush = () => {
      console.log('startBeVerbRush called')
      
      try {
        if (!grammarStore) {
          console.error('Grammar store not available')
          alert('エラー: データの読み込みに失敗しました')
          return
        }

        // Be Verb Rush のアンロック状態チェック
        if (!beVerbRushData.value.unlocked) {
          alert('🔒 Be Verb Rush はまだアンロックされていません')
          return
        }

        // Be Verb Rush ページに遷移
        router.push({
          name: 'be-verb-rush'
        }).catch(err => {
          console.error('Navigation error:', err)
          alert('Be Verb Rush の開始に失敗しました')
        })
      } catch (error) {
        console.error('Error in startBeVerbRush:', error)
        alert('エラーが発生しました。ページを再読み込みしてください。')
      }
    }

    // 🆕 Verb Rush 開始関数
    const startVerbRush = () => {
      console.log('startVerbRush called')
      
      try {
        if (!grammarStore) {
          console.error('Grammar store not available')
          alert('エラー: データの読み込みに失敗しました')
          return
        }

        // Verb Rush のアンロック状態チェック
        if (!verbRushData.value.unlocked) {
          alert('🔒 Verb Rush はまだアンロックされていません')
          return
        }

        // Verb Rush ページに遷移
        router.push({
          name: 'verb-rush'
        }).catch(err => {
          console.error('Navigation error:', err)
          alert('Verb Rush の開始に失敗しました')
        })
      } catch (error) {
        console.error('Error in startVerbRush:', error)
        alert('エラーが発生しました。ページを再読み込みしてください。')
      }
    }

    // レベル・プラネットのアンロック状態チェック（安全性チェック付き）
    const isLevelUnlocked = (level) => {
      if (typeof grammarStore.isLevelUnlocked === 'function') {
        return grammarStore.isLevelUnlocked(level)
      }
      return level === 1 // フォールバック: レベル1のみアンロック
    }

    const isPlanetUnlocked = (planetId) => {
      if (typeof grammarStore.isPlanetUnlocked === 'function') {
        return grammarStore.isPlanetUnlocked(planetId)
      }
      return ['beVerb', 'generalVerb', 'wordOrder'].includes(planetId) // フォールバック
    }

    const isPlanetCompleted = (planetId) => {
      if (typeof grammarStore.isPlanetCompleted === 'function') {
        return grammarStore.isPlanetCompleted(planetId)
      }
      return false // フォールバック
    }

    // 星の表示クラス取得（安全性チェック付き）
    const getStarClass = (planetId, starIndex) => {
      let progress = 0
      if (typeof grammarStore.getPlanetStars === 'function') {
        progress = grammarStore.getPlanetStars(planetId)
      }
      return [
        'h-4 w-4',
        starIndex <= progress ? 'text-yellow-400 fill-current' : 'text-gray-300'
      ]
    }

    const getGameStarClass = (gameId, starIndex) => {
      let progress = 0
      if (typeof grammarStore.getGameStars === 'function') {
        progress = grammarStore.getGameStars(gameId)
      }
      return [
        'h-3 w-3',
        starIndex <= progress ? 'text-yellow-400 fill-current' : 'text-gray-300'
      ]
    }

    // プラネット進捗テキスト取得（安全性チェック付き）
    const getPlanetProgress = (planetId) => {
      if (typeof grammarStore.getPlanetProgress === 'function') {
        const progress = grammarStore.getPlanetProgress(planetId)
        return `${progress.current}/${progress.total} ゲーム完了`
      }
      return '0/0 ゲーム完了' // フォールバック
    }

    // プラネット入場
    const enterPlanet = (planetId) => {
      console.log('enterPlanet called:', planetId)
      try {
        // 安全なチェックを追加
        if (!grammarStore || typeof grammarStore.isPlanetUnlocked !== 'function') {
          console.error('Grammar store not properly initialized')
          return
        }
        if (!grammarStore.isPlanetUnlocked(planetId)) {
          alert('🔒 この惑星はまだアンロックされていません')
          return
        }
        // Router push を安全に実行
        router.push({
          name: 'grammar-galaxy-foundation',
          query: { planet: planetId }
        }).catch(err => {
          console.error('Navigation error:', err)
        })
      } catch (error) {
        console.error('Error in enterPlanet:', error)
        alert('エラーが発生しました。ページを再読み込みしてください。')
      }
    }

    const closePlanetModal = () => {
      showPlanetModal.value = false
      selectedPlanet.value = null
    }

    const startPlanetLearning = () => {
      if (selectedPlanet.value) {
        alert(`🚀 ${selectedPlanet.value}惑星の学習を開始します！\n\n（実装予定）`)
        closePlanetModal()
      }
    }

    const startGame = (game) => {
      if (!game.unlocked) {
        alert('🔒 このゲームはまだアンロックされていません')
        return
      }
      alert(`🎮 ${game.name}を開始します！\n\n（実装予定）`)
    }

    // 推奨アクティビティに移動
    const goToRecommendedActivity = () => {
      const activity = recommendedActivity.value
      if (activity.type === 'game') {
        alert(`🎯 推奨ゲーム: ${activity.name}\n\n（実装予定）`)
      } else if (activity.type === 'planet') {
        enterPlanet(activity.id)
      }
    }

    // ナビゲーション
    const goBack = () => {
      router.push('/')
    }

    // 統一フッターナビゲーションメソッド
    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure-hub')
          break
        case 'grammar':
          // 現在のページなので何もしない
          break
        case 'academy':
          alert('🏫 Virtual Academyは開発中です！')
          break
        case 'profile':
          alert('👤 プロフィール機能は開発中です！')
          break
        default:
          console.warn('Unknown navigation section:', section)
      }
    }

    // ライフサイクル
    onMounted(() => {
      generateBackgroundStars()
      
      // ストアの初期化チェック（安全に実行）
      try {
        if (typeof grammarStore.loadProgress === 'function') {
          grammarStore.loadProgress()
          console.log('✅ Grammar store progress loaded')
        }
      } catch (error) {
        console.warn('⚠️ Could not load grammar store progress:', error)
      }
    })

    return {
      // Refs
      galaxyMap,
      showPlanetModal,
      selectedPlanet,
      currentPlanet,
      backgroundStars,
      
      // Computed
      playerData,
      maxStars,
      dailyProgressPercent,
      recommendedActivity,
      recentAchievements,
      selectedPlanetInfo,

      // 🆕 Rush Zone 関連
      beVerbRushData,
      verbRushData,
      dailyRushSessions,
      averageAccuracy,
      totalRushTime,
      startBeVerbRush,
      startVerbRush,
      
      // Methods
      isLevelUnlocked,
      isPlanetUnlocked,
      isPlanetCompleted,
      getStarClass,
      getGameStarClass,
      getPlanetProgress,
      enterPlanet,
      closePlanetModal,
      startPlanetLearning,
      startGame,
      goToRecommendedActivity,
      goBack,
      handleFooterNavigation
    }
  }
}
</script>
<style scoped>
/* Galaxy background - unified with other components */
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

/* Rush Zone専用スタイル */
.rush-zone-section {
  @apply relative z-10 max-w-6xl mx-auto mb-16 p-8 rounded-3xl border;
  background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%);
  border: 2px solid rgba(99,102,241,0.4);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(99,102,241,0.2);
}

.rush-zone-header {
  @apply text-center mb-8;
}

.zone-title {
  @apply text-3xl font-bold mb-2;
  background: linear-gradient(45deg, #FBBF24, #F59E0B, #EF4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(251,191,36,0.3));
}

.zone-subtitle {
  @apply text-blue-200 text-lg;
}

/* Rush Games Grid */
.rush-games-grid {
  @apply grid gap-6 mb-8;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.galaxy-card {
  @apply relative p-6 rounded-xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid transparent;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.galaxy-card.unlocked {
  border: 2px solid rgba(251,191,36,0.5);
  background: linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(239,68,68,0.1) 100%);
}

.galaxy-card.unlocked:hover {
  @apply scale-105;
  box-shadow: 0 8px 25px rgba(251,191,36,0.3);
  border-color: rgba(251,191,36,0.7);
}

.galaxy-card.completed {
  background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(251,191,36,0.15) 100%);
  border: 2px solid rgba(34,197,94,0.6);
}

.galaxy-card.locked {
  @apply opacity-50 cursor-not-allowed;
  filter: grayscale(0.7);
}

/* Rush Game Surface */
.rush-game-surface {
  @apply relative text-center mb-4;
}

.rush-game-icon {
  @apply text-5xl mb-2 inline-block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.lightning-effect {
  @apply absolute inset-0 rounded-full opacity-60;
  background: radial-gradient(circle at center, rgba(251,191,36,0.3) 0%, transparent 70%);
  animation: lightning-pulse 2s ease-in-out infinite alternate;
}

@keyframes lightning-pulse {
  0% { 
    transform: scale(0.95); 
    opacity: 0.3; 
    background: radial-gradient(circle at center, rgba(251,191,36,0.3) 0%, transparent 70%);
  }
  100% { 
    transform: scale(1.05); 
    opacity: 0.7;
    background: radial-gradient(circle at center, rgba(239,68,68,0.4) 0%, transparent 70%);
  }
}

/* Rush Game Info */
.rush-game-info {
  @apply text-center;
}

.rush-game-name {
  @apply text-xl font-bold mb-3 text-yellow-300;
}

.rush-game-stats {
  @apply space-y-2 mb-4;
}

.mastery-display,
.today-progress,
.best-score {
  @apply flex justify-between items-center text-sm;
}

.mastery-label,
.progress-label,
.score-label {
  @apply text-gray-300;
}

.mastery-value,
.progress-value,
.score-value {
  @apply text-yellow-300 font-semibold;
}

.rush-play-button {
  @apply w-full py-3 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-400 hover:to-red-400 rounded-lg text-white font-bold transition-all duration-200 transform hover:scale-105;
  box-shadow: 0 4px 15px rgba(251,191,36,0.4);
}

.rush-locked {
  @apply text-gray-400 text-sm;
}

.unlock-condition {
  @apply text-gray-400 text-sm mt-2;
}

/* Rush Zone Stats */
.rush-zone-stats {
  @apply bg-black bg-opacity-20 rounded-xl p-6;
}

.stats-title {
  @apply text-lg font-semibold mb-4 text-blue-200;
}

.stats-grid {
  @apply grid grid-cols-3 gap-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply text-2xl font-bold text-yellow-300;
}

.stat-label {
  @apply text-sm text-gray-300 mt-1;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .rush-zone-section {
    @apply mx-4 p-4;
  }
  
  .zone-title {
    @apply text-2xl;
  }
  
  .rush-games-grid {
    @apply grid-cols-1;
  }
  
  .stats-grid {
    @apply grid-cols-1 gap-2;
  }
  
  .rush-game-icon {
    @apply text-4xl;
  }
}

@media (max-width: 480px) {
  .zone-title {
    @apply text-xl;
  }
  
  .rush-game-card {
    @apply p-4;
  }
}

/* アニメーション削減設定 */
@media (prefers-reduced-motion: reduce) {
  .lightning-effect {
    animation: none;
  }
  
  .rush-game-card:hover {
    transform: none;
  }
  
  .rush-play-button:hover {
    transform: none;
  }
}

/* ヘッダー */
.galaxy-header {
  @apply relative z-10 bg-black bg-opacity-30 backdrop-blur-md;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  @apply max-w-7xl mx-auto px-4 py-4 flex items-center justify-between;
}

.back-button {
  @apply flex items-center gap-2 px-3 py-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200;
}

.header-title {
  @apply text-center;
}

.galaxy-title {
  @apply text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent;
}

.galaxy-subtitle {
  @apply text-blue-200 text-sm mt-1;
}

.header-stats {
  @apply flex items-center gap-4;
}

.player-level {
  @apply flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-sm font-semibold text-black;
}

.total-stars {
  @apply text-right;
}

.stars-count {
  @apply text-2xl font-bold text-yellow-400;
}

.stars-max {
  @apply text-gray-400;
}

/* 宇宙マップ */
.galaxy-map {
  @apply relative flex-1 overflow-y-auto;
  padding: 2rem;
  min-height: calc(100vh - 140px);
}

/* 背景の星 */
.stars-background {
  @apply absolute inset-0 pointer-events-none;
}

.background-star {
  @apply absolute w-1 h-1 bg-white rounded-full;
  animation: twinkle 3s infinite ease-in-out;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 学習パス */
.learning-path {
  @apply relative z-10 max-w-6xl mx-auto space-y-16;
}

.solar-system {
  @apply relative p-8 rounded-3xl border transition-all duration-500;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.solar-system.unlocked {
  @apply shadow-2xl;
  background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.05) 100%);
  border: 1px solid rgba(99,102,241,0.3);
}

.solar-system:not(.unlocked) {
  @apply opacity-50 pointer-events-none;
  filter: grayscale(0.7);
}

.system-title {
  @apply text-3xl font-bold text-center mb-2;
  background: linear-gradient(45deg, #60A5FA, #C084FC);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.system-subtitle {
  @apply text-blue-200 text-center mb-8;
}

/* プラネットコンテナ */
.planets-container {
  @apply grid gap-8;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* プラネット */
.planet {
  @apply relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid transparent;
}

.planet:not(.unlocked) {
  @apply opacity-40 cursor-not-allowed;
  filter: grayscale(0.8);
}

.planet.unlocked:hover {
  @apply scale-105;
  box-shadow: 0 20px 40px rgba(99,102,241,0.3);
}

.planet.current {
  border: 2px solid #60A5FA;
  box-shadow: 0 0 30px rgba(96,165,250,0.5);
}

.planet.completed {
  background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%);
  border: 2px solid rgba(34,197,94,0.5);
}

/* Be動詞惑星 */
.be-verb-planet.unlocked {
  background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.1) 100%);
}

/* 一般動詞惑星 */
.general-verb-planet.unlocked {
  background: linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(59,130,246,0.1) 100%);
}

/* 語順惑星 */
.word-order-planet.unlocked {
  background: linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,101,101,0.1) 100%);
}

/* 時制惑星 */
.tense-planet.unlocked {
  background: linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.1) 100%);
}

/* 比較・助動詞惑星 */
.comparison-planet.unlocked {
  background: linear-gradient(135deg, rgba(245,101,101,0.15) 0%, rgba(251,191,36,0.1) 100%);
}

/* 複合文法惑星 */
.complex-planet.unlocked {
  background: linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.15) 100%);
}

/* プラネット表面 */
.planet-surface {
  @apply relative text-center mb-4;
}

.planet-icon {
  @apply text-6xl mb-2 inline-block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.planet-glow {
  @apply absolute inset-0 rounded-full opacity-60;
  background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
  animation: planet-glow 3s ease-in-out infinite alternate;
}

@keyframes planet-glow {
  0% { transform: scale(0.95); opacity: 0.4; }
  100% { transform: scale(1.05); opacity: 0.8; }
}

/* プラネット情報 */
.planet-info {
  @apply text-center;
}

.planet-name {
  @apply text-xl font-bold mb-3;
}

.planet-progress {
  @apply space-y-2;
}

.progress-stars {
  @apply flex justify-center gap-1;
}

.progress-text {
  @apply text-sm text-gray-300;
}

/* 現在の学習状況パネル */
.current-status-panel {
  @apply fixed top-1/2 right-4 transform -translate-y-1/2 w-80 bg-black bg-opacity-40 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 z-20;
}

.panel-header {
  @apply mb-6;
}

.panel-header h3 {
  @apply text-lg font-semibold mb-3;
}

.daily-progress {
  @apply flex items-center gap-3;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500;
}

.progress-text {
  @apply text-sm font-medium;
}

/* 推奨次ステップ */
.recommended-next {
  @apply mb-6;
}

.recommended-next h4 {
  @apply text-base font-semibold mb-3 text-blue-200;
}

.next-activity {
  @apply flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg cursor-pointer hover:from-blue-500 hover:to-purple-500 transition-all duration-200;
}

.activity-icon {
  @apply text-2xl;
}

.activity-info {
  @apply flex-1;
}

.activity-name {
  @apply font-semibold;
}

.activity-description {
  @apply text-sm text-blue-100;
}

/* 最近の達成 */
.recent-achievements h4 {
  @apply text-base font-semibold mb-3 text-yellow-200;
}

.achievements-list {
  @apply space-y-2;
}

.achievement-item {
  @apply flex items-center gap-3 p-2 bg-yellow-500 bg-opacity-20 rounded-lg;
}

.achievement-icon {
  @apply text-lg;
}

.achievement-text {
  @apply text-sm font-medium;
}

/* フッターナビゲーション */
.galaxy-footer {
  @apply fixed bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-md border-t border-white border-opacity-20 px-4 py-3 z-20;
}

.galaxy-footer {
  @apply flex justify-around;
}

.footer-nav-item {
  @apply flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-white;
}

.footer-nav-item.active {
  @apply text-blue-400 bg-blue-500 bg-opacity-20;
}

.footer-nav-item span {
  @apply text-xs font-medium;
}

/* モーダル */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto;
  border: 1px solid rgba(255,255,255,0.2);
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-700;
}

.modal-header h3 {
  @apply text-2xl font-bold;
}

.close-button {
  @apply p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200;
}

.modal-body {
  @apply p-6;
}

.planet-detail {
  @apply text-center;
}

.planet-icon-large {
  @apply text-8xl mb-4;
}

.planet-description {
  @apply text-gray-300 mb-6 leading-relaxed;
}

.available-games h4 {
  @apply text-lg font-semibold mb-4 text-left;
}

.games-grid {
  @apply grid grid-cols-2 gap-4;
}

.game-card {
  @apply p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-all duration-200 text-center;
  border: 2px solid transparent;
}

.game-card:hover {
  border: 2px solid rgba(99,102,241,0.5);
}

.game-card.locked {
  @apply opacity-50 cursor-not-allowed;
  filter: grayscale(0.8);
}

.game-icon {
  @apply text-3xl mb-2;
}

.game-name {
  @apply font-semibold mb-2;
}

.game-stars {
  @apply flex justify-center gap-1;
}

.modal-footer {
  @apply p-6 border-t border-gray-700;
}

.start-button {
  @apply w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105;
}

/* モーダルトランジション */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-content {
  transform: translateY(-50px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: translateY(50px);
  opacity: 0;
}

/* レスポンシブデザイン */
@media (max-width: 1280px) {
  .current-status-panel {
    @apply relative right-auto top-auto transform-none w-full mt-8;
  }
}

@media (max-width: 768px) {
  .galaxy-map {
    @apply px-4;
  }
  
  .planets-container {
    @apply grid-cols-1;
  }
  
  .header-content {
    @apply px-2;
  }
  
  .galaxy-title {
    @apply text-2xl;
  }
  
  .solar-system {
    @apply p-4;
  }
  
  .planet {
    @apply p-4;
  }
  
  .planet-icon {
    @apply text-4xl;
  }
  
  .modal-content {
    @apply mx-2;
  }
  
  .games-grid {
    @apply grid-cols-1;
  }
}

@media (max-width: 480px) {
  .header-stats {
    @apply gap-2;
  }
  
  .player-level {
    @apply px-2 text-xs;
  }
  
  .stars-count {
    @apply text-lg;
  }
  
  .footer-nav-item {
    @apply px-2;
  }
  
  .footer-nav-item span {
    @apply hidden;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .grammar-galaxy-foundation {
    /* デフォルトでダークテーマなので変更なし */
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .background-star,
  .planet-glow,
  .progress-fill {
    animation: none;
  }
  
  .planet:hover {
    transform: none;
  }
  
  .start-button:hover {
    transform: none;
  }
}

/* 高コントラスト対応 */
@media (prefers-contrast: high) {
  .solar-system {
    border: 2px solid #ffffff;
    background: rgba(0,0,0,0.8);
  }
  
  .planet {
    border: 2px solid #ffffff;
    background: rgba(0,0,0,0.9);
  }
  
  .modal-content {
    border: 2px solid #ffffff;
    background: #000000;
  }
}

/* 印刷対応 */
@media print {
  .galaxy-footer,
  .current-status-panel,
  .modal-overlay {
    @apply hidden;
  }
  
  .grammar-galaxy-foundation {
    @apply bg-white text-black;
  }
  
  .background-star {
    @apply hidden;
  }
}
</style>
