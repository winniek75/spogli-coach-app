import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { COSMIC_RANKS, COSMIC_RANK_SETTINGS, allCosmicMissions } from '@/data/grammar/cosmicGrammarData.js'
import { LEVEL_SETTINGS, allQuestions } from '@/data/grammar/grammarReflexData.js'

export const useGrammarGalaxyStore = defineStore('grammarGalaxy', () => {
  // === 状態管理 ===
  const playerData = ref({
    level: 1,
    totalStars: 0,
    totalGamesCompleted: 0,
    currentStreak: 0,
    lastPlayDate: null,
    preferences: {
      difficulty: 'normal',
      soundEnabled: true,
      animationsEnabled: true
    }
  })

  const planetsData = ref({
    // Level 1: Foundation Solar System
    beVerb: {
      id: 'beVerb',
      name: 'Be動詞惑星',
      icon: '🪐',
      level: 1,
      unlocked: true, // 初期からアンロック
      stars: 0,
      maxStars: 3,
      gamesCompleted: 0,
      totalGames: 2,
      description: 'I am, you are, he isの基本的なBe動詞の使い方を習得します。英語の基礎となる最も重要な惑星です。',
      games: [
        {
          id: 'grammarColorCode',
          name: 'Grammar Color Code',
          icon: '🎨',
          type: 'pattern-recognition',
          unlocked: true, // 初期からアンロック
          stars: 0,
          maxStars: 3,
          bestScore: 0,
          completionTime: null,
          attempts: 0
        },
        {
          id: 'patternHunter',
          name: 'Pattern Hunter',
          icon: '🔍',
          type: 'visual-search',
          unlocked: false,
          stars: 0,
          maxStars: 3,
          bestScore: 0,
          completionTime: null,
          attempts: 0
        }
      ]
    },
    generalVerb: {
      id: 'generalVerb',
      name: '一般動詞惑星',
      icon: '🌍',
      level: 1,
      unlocked: true,
      stars: 0,
      maxStars: 3,
      gamesCompleted: 0,
      totalGames: 2,
      description: 'Do/Does疑問文とdon\'t/doesn\'t否定文をマスターします。一般動詞の活用を完全習得しましょう。',
      games: [
        {
          id: 'grammarReflexArena',
          name: 'Grammar Reflex Arena',
          icon: '⚡',
          type: 'reflex-training',
          unlocked: true,
          stars: 0,
          maxStars: 3,
          bestScore: 0,
          completionTime: null,
          attempts: 0
        },
        {
          id: 'grammarPuzzleCascade',
          name: 'Grammar Puzzle Cascade',
          icon: '🧩',
          type: 'puzzle-game',
          unlocked: false,
          stars: 0,
          maxStars: 3,
          bestScore: 0,
          completionTime: null,
          attempts: 0
        }
      ]
    },
    wordOrder: {
      id: 'wordOrder',
      name: '語順惑星',
      icon: '🌕',
      level: 1,
      unlocked: true,
      stars: 0,
      maxStars: 3,
      gamesCompleted: 0,
      totalGames: 1,
      description: '主語+動詞+目的語の基本語順を体得します。正しい英語の文構造を身に付けましょう。',
      games: [
        {
          id: 'sentenceArchitecture',
          name: 'Sentence Architecture',
          icon: '🏗️',
          type: 'construction-game',
          unlocked: false,
          stars: 0,
          maxStars: 3,
          bestScore: 0,
          completionTime: null,
          attempts: 0
        }
      ]
    }
  })

  const dailyProgress = ref({
    date: new Date().toISOString().split('T')[0],
    gamesPlayed: 0,
    starsEarned: 0,
    timeSpent: 0,
    target: {
      gamesPlayed: 3,
      starsEarned: 6,
      timeSpent: 20
    }
  })

  const achievements = ref([])

  // === 計算されたプロパティ ===
  const maxStars = computed(() => {
    return Object.values(planetsData.value).reduce((total, planet) => total + planet.maxStars, 0)
  })

  const dailyProgressPercent = computed(() => {
    const progress = dailyProgress.value
    if (!progress.target || !progress.target.gamesPlayed) return 0
    const targetProgress = (progress.gamesPlayed / progress.target.gamesPlayed) * 100
    return Math.min(Math.round(targetProgress), 100)
  })

  const recommendedActivity = computed(() => {
    // 次に推奨するアクティビティを決定するロジック
    const unlockedPlanets = Object.values(planetsData.value).filter(planet => planet.unlocked)

    if (unlockedPlanets.length === 0) {
      return {
        id: 'beVerb',
        name: 'Be動詞惑星',
        description: '英語学習の第一歩を踏み出しましょう',
        type: 'planet'
      }
    }

    // 未完了のゲームを探す
    for (const planet of unlockedPlanets) {
      for (const game of planet.games) {
        if (game.unlocked && game.stars < game.maxStars) {
          return {
            id: game.id,
            name: game.name,
            description: `${planet.name}で続きを学習`,
            type: 'game',
            planetId: planet.id
          }
        }
      }
    }

    return {
      id: 'beVerb',
      name: 'Be動詞惑星',
      description: '復習して知識を定着させましょう',
      type: 'planet'
    }
  })

  const recentAchievements = computed(() => {
    return achievements.value
      .filter(achievement => achievement.unlocked)
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
      .slice(0, 3)
  })

  // === アクション ===

  /**
   * レベルがアンロック済みかチェック
   */
  const isLevelUnlocked = (level) => {
    return level === 1 // Level 1は常時アンロック
  }

  /**
   * プラネットがアンロック済みかチェック
   */
  const isPlanetUnlocked = (planetId) => {
    const planet = planetsData.value[planetId]
    if (!planet) return false
    return planet.unlocked && isLevelUnlocked(planet.level)
  }

  /**
   * プラネットが完了済みかチェック
   */
  const isPlanetCompleted = (planetId) => {
    const planet = planetsData.value[planetId]
    if (!planet) return false
    return planet.gamesCompleted === planet.totalGames
  }

  /**
   * プラネットの星数を取得
   */
  const getPlanetStars = (planetId) => {
    const planet = planetsData.value[planetId]
    return planet ? planet.stars : 0
  }

  /**
   * ゲームの星数を取得
   */
  const getGameStars = (gameId) => {
    for (const planet of Object.values(planetsData.value)) {
      const game = planet.games.find(g => g.id === gameId)
      if (game) return game.stars
    }
    return 0
  }

  /**
   * ゲームがアンロックされているかチェック
   */
  const isGameUnlocked = (gameId) => {
    for (const planet of Object.values(planetsData.value)) {
      const game = planet.games.find(g => g.id === gameId)
      if (game) return game.unlocked
    }
    return false
  }

  /**
   * プラネットの進捗情報を取得
   */
  const getPlanetProgress = (planetId) => {
    const planet = planetsData.value[planetId]
    if (!planet) return { current: 0, total: 0 }

    return {
      current: planet.gamesCompleted,
      total: planet.totalGames
    }
  }

  /**
   * プラネット情報を取得
   */
  const getPlanetInfo = (planetId) => {
    return planetsData.value[planetId] || null
  }

  /**
   * プラネットをアンロック
   */
  const unlockPlanet = (planetId) => {
    const planet = planetsData.value[planetId]
    if (planet && !planet.unlocked) {
      planet.unlocked = true
      saveProgress()
    }
  }

  /**
   * ゲームをアンロック
   */
  const unlockGame = (planetId, gameId) => {
    const planet = planetsData.value[planetId]
    if (planet) {
      const game = planet.games.find(g => g.id === gameId)
      if (game && !game.unlocked) {
        game.unlocked = true
        saveProgress()
      }
    }
  }

  /**
   * ゲーム完了処理
   */
  const completeGame = (planetId, gameId, score, starsEarned, completionTime) => {
    const planet = planetsData.value[planetId]
    if (!planet) return

    const game = planet.games.find(g => g.id === gameId)
    if (!game) return

    // ゲーム統計を更新
    game.attempts += 1
    if (score > game.bestScore) {
      game.bestScore = score
    }
    if (!game.completionTime || completionTime < game.completionTime) {
      game.completionTime = completionTime
    }

    // 星を更新（既存の星数と比較して高い方を採用）
    const previousStars = game.stars
    if (starsEarned > game.stars) {
      game.stars = starsEarned
      planet.stars += (starsEarned - previousStars)
      playerData.value.totalStars += (starsEarned - previousStars)
    }

    // ゲーム完了チェック
    if (game.stars > 0 && game.stars === game.maxStars) {
      planet.gamesCompleted = Math.max(planet.gamesCompleted, 1)
    }

    saveProgress()
  }

  /**
   * 学習データをローカルストレージに保存
   */
  const saveProgress = () => {
    try {
      const saveData = {
        playerData: playerData.value,
        planetsData: planetsData.value,
        dailyProgress: dailyProgress.value,
        achievements: achievements.value,
        rushZoneData: rushZoneData.value,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem('grammarGalaxyProgress', JSON.stringify(saveData))
      console.log('✅ Grammar Galaxy progress saved successfully')
    } catch (error) {
      console.error('❌ Failed to save grammar galaxy progress:', error)
    }
  }

  /**
   * 学習データをローカルストレージから読み込み
   */
  const loadProgress = () => {
    try {
      const savedData = localStorage.getItem('grammarGalaxyProgress')
      if (savedData) {
        const data = JSON.parse(savedData)

        // 安全なデータマージ
        if (data.playerData && typeof data.playerData === 'object') {
          Object.assign(playerData.value, data.playerData)
        }

        if (data.planetsData && typeof data.planetsData === 'object') {
          // 既存のプラネットデータとマージ
          Object.keys(planetsData.value).forEach(planetId => {
            if (data.planetsData[planetId]) {
              Object.assign(planetsData.value[planetId], data.planetsData[planetId])
            }
          })
        }

        if (data.dailyProgress && typeof data.dailyProgress === 'object') {
          Object.assign(dailyProgress.value, data.dailyProgress)
        }

        if (Array.isArray(data.achievements)) {
          achievements.value = data.achievements
        }

        if (data.rushZoneData && typeof data.rushZoneData === 'object') {
          // 既存のRush Zoneデータとマージ
          Object.keys(rushZoneData.value).forEach(rushId => {
            if (data.rushZoneData[rushId]) {
              Object.assign(rushZoneData.value[rushId], data.rushZoneData[rushId])
            }
          })
        }

        console.log('✅ Grammar Galaxy progress loaded successfully')
        return true
      }
    } catch (error) {
      console.error('❌ Failed to load grammar galaxy progress:', error)
    }
    return false
  }

  /**
   * 進捗をリセット（開発・テスト用）
   */
  const resetProgress = () => {
    // プレイヤーデータをリセット
    Object.assign(playerData.value, {
      level: 1,
      totalStars: 0,
      totalGamesCompleted: 0,
      currentStreak: 0,
      lastPlayDate: null,
      preferences: {
        difficulty: 'normal',
        soundEnabled: true,
        animationsEnabled: true
      }
    })

    // 全プラネットとゲームをリセット
    Object.values(planetsData.value).forEach(planet => {
      planet.stars = 0
      planet.gamesCompleted = 0
      planet.games.forEach(game => {
        game.stars = 0
        game.bestScore = 0
        game.completionTime = null
        game.attempts = 0
        // 開発用に一部ゲームをアンロック状態を維持
        if ((planet.id === 'beVerb' && game.id === 'grammarColorCode') ||
            (planet.id === 'generalVerb' && game.id === 'grammarReflexArena')) {
          game.unlocked = true
        } else {
          game.unlocked = false
        }
      })
    })

    // アチーブメントをリセット
    achievements.value = []

    // Rush Zone データをリセット
    Object.values(rushZoneData.value).forEach(rush => {
      rush.mastery = 0
      rush.todaySessions = 0
      rush.bestScore = 0
      rush.totalAttempts = 0
      rush.averageAccuracy = 0
      rush.lastPlayDate = null
      // beVerbRush と verbRush は開発用にアンロック状態を維持
      if (rush.id === 'beVerbRush' || rush.id === 'verbRush') {
        rush.unlocked = true
      } else {
        rush.unlocked = false
      }
    })

    saveProgress()
    console.log('✅ Grammar Galaxy progress reset successfully')
  }


  /**
   * Rush Zone データの管理
   */
  const rushZoneData = ref({
    beVerbRush: {
      id: 'beVerbRush',
      name: 'Be Verb Rush',
      icon: '⚡',
      unlocked: true,
      mastery: 0,
      todaySessions: 0,
      bestScore: 0,
      totalAttempts: 0,
      averageAccuracy: 0,
      lastPlayDate: null
    },
    verbRush: {
      id: 'verbRush',
      name: 'Verb Rush',
      icon: '🏃‍♂️',
      unlocked: true, // 開発環境用に一時的にアンロック
      mastery: 0,
      todaySessions: 0,
      bestScore: 0,
      totalAttempts: 0,
      averageAccuracy: 0,
      lastPlayDate: null,
      unlockRequirement: 'Be動詞Rush 90%達成'
    },
    wordRush: {
      id: 'wordRush',
      name: 'Word Rush',
      icon: '🏃‍♂️',
      unlocked: false,
      mastery: 0,
      todaySessions: 0,
      bestScore: 0,
      totalAttempts: 0,
      averageAccuracy: 0,
      lastPlayDate: null,
      unlockRequirement: '基本Rush完了'
    }
  })

  /**
   * Rush Zone 統計取得
   */
  const getDailyRushSessions = () => {
    const today = new Date().toISOString().split('T')[0]
    return Object.values(rushZoneData.value).reduce((total, rush) => {
      if (rush.lastPlayDate === today) {
        return total + rush.todaySessions
      }
      return total
    }, 0)
  }

  const getAverageRushAccuracy = () => {
    const rushes = Object.values(rushZoneData.value).filter(rush => rush.totalAttempts > 0)
    if (rushes.length === 0) return 0

    const totalAccuracy = rushes.reduce((sum, rush) => sum + rush.averageAccuracy, 0)
    return Math.round(totalAccuracy / rushes.length)
  }

  const getTotalRushTime = () => {
    // 1セッション = 1分として計算
    return getDailyRushSessions()
  }

  /**
   * Be Verb Rush 結果更新
   */
  const updateBeVerbRushResult = (score, accuracy, sessionTime) => {
    const today = new Date().toISOString().split('T')[0]
    const beVerbRush = rushZoneData.value.beVerbRush

    // 最高スコア更新
    if (score > beVerbRush.bestScore) {
      beVerbRush.bestScore = score
    }

    // 今日のセッション数更新
    if (beVerbRush.lastPlayDate !== today) {
      beVerbRush.todaySessions = 1
      beVerbRush.lastPlayDate = today
    } else {
      beVerbRush.todaySessions = Math.min(beVerbRush.todaySessions + 1, 5)
    }

    // 習熟度と精度更新
    beVerbRush.totalAttempts += 1
    beVerbRush.averageAccuracy = Math.round(
      (beVerbRush.averageAccuracy * (beVerbRush.totalAttempts - 1) + accuracy) / beVerbRush.totalAttempts
    )
    beVerbRush.mastery = Math.min(beVerbRush.averageAccuracy, 100)

    // Verb Rush アンロックチェック
    if (beVerbRush.mastery >= 90 && !rushZoneData.value.verbRush.unlocked) {
      rushZoneData.value.verbRush.unlocked = true
    }

    saveProgress()
  }


  /**
   * 学習統計を取得
   */
  const getStatistics = () => {
    const totalGames = Object.values(planetsData.value).reduce((total, planet) => total + planet.totalGames, 0)
    const completedGames = Object.values(planetsData.value).reduce((total, planet) => total + planet.gamesCompleted, 0)
    const totalPossibleStars = Object.values(planetsData.value).reduce((total, planet) => total + planet.maxStars, 0)

    return {
      totalGames,
      completedGames,
      gameCompletionRate: totalGames > 0 ? (completedGames / totalGames) * 100 : 0,
      totalStars: playerData.value.totalStars,
      totalPossibleStars,
      starCollectionRate: totalPossibleStars > 0 ? (playerData.value.totalStars / totalPossibleStars) * 100 : 0
    }
  }

  // 初期化時にデータを読み込み
  loadProgress()
  
  // 開発用: Grammar Reflex Arenaを強制的にアンロック（loadProgress後に実行）
  setTimeout(() => {
    if (planetsData.value.generalVerb?.games) {
      const reflexArena = planetsData.value.generalVerb.games.find(g => g.id === 'grammarReflexArena')
      if (reflexArena) {
        reflexArena.unlocked = true
        console.log('✅ Grammar Reflex Arena force unlocked for development')
        // 変更を保存
        saveProgress()
      }
    }
  }, 100)

  return {
    // State
    playerData,
    planetsData,
    dailyProgress,
    achievements,
    rushZoneData,

    // Computed
    maxStars,
    dailyProgressPercent,
    recommendedActivity,
    recentAchievements,

    // Actions
    isLevelUnlocked,
    isPlanetUnlocked,
    isPlanetCompleted,
    getPlanetStars,
    getGameStars,
    isGameUnlocked,
    getPlanetProgress,
    getPlanetInfo,
    unlockPlanet,
    unlockGame,
    completeGame,
    saveProgress,
    loadProgress,
    resetProgress,
    
    // Rush Zone Actions
    getDailyRushSessions,
    getAverageRushAccuracy,
    getTotalRushTime,
    updateBeVerbRushResult,
    
    getStatistics: () => {
      const totalGames = Object.values(planetsData.value).reduce((total, planet) => total + planet.totalGames, 0)
      const completedGames = Object.values(planetsData.value).reduce((total, planet) => total + planet.gamesCompleted, 0)
      const totalPossibleStars = Object.values(planetsData.value).reduce((total, planet) => total + planet.maxStars, 0)

      return {
        totalGames,
        completedGames,
        gameCompletionRate: totalGames > 0 ? (completedGames / totalGames) * 100 : 0,
        totalStars: playerData.value.totalStars,
        totalPossibleStars,
        starCollectionRate: totalPossibleStars > 0 ? (playerData.value.totalStars / totalPossibleStars) * 100 : 0
      }
    }
  }
})

// 手動でストアを初期化する場合のヘルパー関数
export const initializeGrammarGalaxyStore = () => {
  try {
    const store = useGrammarGalaxyStore()
    console.log('✅ Grammar Galaxy Store initialized manually')
    return store
  } catch (error) {
    console.error('❌ Failed to initialize Grammar Galaxy Store:', error)
    return null
  }
}
