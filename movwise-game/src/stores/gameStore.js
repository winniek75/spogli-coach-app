// stores/gameStore.js - 修正版
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // プレイヤーデータ（宇宙テーマ化）
  const playerData = ref({
    captainLevel: 1,
    cosmicEnergy: 250,
    soundGems: 150,
    avatar: '🦸‍♂️',
    title: 'スペース・レンジャー',
    joinDate: Date.now(),
    lastLoginDate: Date.now(),
    loginStreak: 1,
    totalPlayTime: 0,
    lastPlayed: null,
    navigationDays: 1,
    explorationPoints: 750,
    // 後方互換性のための旧フィールド
    level: 1,
    exp: 250,
    streak: 1
  })

  // ゲーム進捗データ
  const gameProgress = ref({
    singlePhoneme: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPhonemes: [],
      progress: 0
    },
    blendingBuilder: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      progress: 0
    },
    cvcWord: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      progress: 0
    },
    rhyming: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPatterns: [],
      progress: 0
    },
    rhythmTapper: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredRhythms: [],
      progress: 0
    },
    magicCastleJump: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      progress: 0
    },
    magicCardBattle: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      averagePronunciation: 0,
      progress: 0
    },
    spellRacing: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredCommands: [],
      averageAccuracy: 0,
      progress: 0
    },
    magicCooking: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredMagic: [],
      averagePronunciation: 0,
      completedDishes: 0,
      progress: 0
    },
    voicePuzzle: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      overallAccuracy: 0,
      completedPuzzles: 0,
      progress: 0
    }
  })

  // 統計データ
  const gameStats = ref({
    totalPlayTime: 0,
    totalGamesPlayed: 0,
    totalCorrectAnswers: 0,
    totalAttempts: 0,
    dailyStats: {},
    weeklyStats: {},
    monthlyStats: {},
    wordRush: {
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      averageAccuracy: 0,
      bestStreak: 0,
      vocabularyMastery: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      },
      spatialReadiness: 0
    }
  })

  // 実績データ
  const achievements = ref({
    firstStep: { earned: false, earnedDate: null },
    streakStar: { earned: false, earnedDate: null },
    perfectPlayer: { earned: false, earnedDate: null },
    phonicsMaster: { earned: false, earnedDate: null },
    speedDemon: { earned: false, earnedDate: null },
    comboKing: { earned: false, earnedDate: null },
    wordRushChampion: { earned: false, earnedDate: null },
    speedMaster: { earned: false, earnedDate: null },
    vocabularyExpert: { earned: false, earnedDate: null },
    vrReady: { earned: false, earnedDate: null }
  })

  // ゲーム設定（音声・バイブ・自動再生など）
  const gameSettings = ref({
    soundEnabled: true,
    vibrationEnabled: true,
    autoPlayAudio: false,
    volume: 1.0
  })

  // 計算プロパティ（宇宙テーマ）
  const playerLevel = computed(() => playerData.value.captainLevel || playerData.value.level)
  const playerExp = computed(() => playerData.value.cosmicEnergy || playerData.value.exp)
  const playerSoundGems = computed(() => playerData.value.soundGems)
  const playerStreak = computed(() => playerData.value.navigationDays || playerData.value.streak)

  // 宇宙船ステータス計算
  const spaceshipStatus = computed(() => ({
    captainLevel: Math.floor((playerData.value.cosmicEnergy || playerData.value.exp) / 1000) + 1,
    exploredPlanets: Math.floor((playerData.value.explorationPoints || 0) / 500),
    navigationDays: playerData.value.navigationDays || playerData.value.streak || 0,
    energyLevel: Math.min(100, ((playerData.value.cosmicEnergy || playerData.value.exp) % 1000) / 10),
    cosmicEnergy: playerData.value.cosmicEnergy || playerData.value.exp || 0,
    explorationPoints: playerData.value.explorationPoints || 0
  }))

  // ゲーム進捗の取得
  const getGameProgress = (gameId) => {
    return gameProgress.value[gameId] || {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredItems: [],
      progress: 0
    }
  }

  // ステージ進捗の計算
  const getStageProgress = (stageId) => {
    const stageGames = {
      beginnerBeach: ['singlePhoneme'],
      blendingBay: ['blendingBuilder', 'cvcWord'],
      rhythmRidge: ['rhyming', 'rhythmTapper'],
      masterMountain: ['phonicsBoss', 'speedChallenge']
    }

    const games = stageGames[stageId] || []
    if (games.length === 0) return 0

    const totalProgress = games.reduce((sum, gameId) => {
      const progress = gameProgress.value[gameId]
      return sum + (progress ? progress.progress : 0)
    }, 0)

    return Math.round(totalProgress / games.length)
  }

  // ゲーム完了率の計算
  const getCompletionRate = () => {
    const totalGames = Object.keys(gameProgress.value).length
    const completedGames = Object.values(gameProgress.value).filter(game => game.completed).length
    return totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0
  }

  // メソッド
  const updatePlayerData = (data) => {
    playerData.value = { ...playerData.value, ...data }
    saveToLocalStorage()
  }

  const updateGameProgress = (gameId, data) => {
    if (!gameProgress.value[gameId]) {
      gameProgress.value[gameId] = {
        completed: false,
        bestScore: 0,
        attempts: 0,
        lastPlayed: null,
        masteredItems: [],
        progress: 0
      }
    }

    // 前回のベストスコアと比較
    const previousBest = gameProgress.value[gameId].bestScore
    const newScore = data.bestScore || 0

    gameProgress.value[gameId] = {
      ...gameProgress.value[gameId],
      ...data,
      lastPlayed: new Date().toISOString(),
      attempts: (gameProgress.value[gameId].attempts || 0) + 1
    }

    // ベストスコア更新時の報酬
    if (newScore > previousBest) {
      const expGain = Math.floor((newScore - previousBest) * 0.1)
      const gemGain = Math.floor(expGain / 10)

      playerData.value.exp += expGain
      playerData.value.soundGems += gemGain

      console.log(`🎉 新記録！ +${expGain}EXP, +${gemGain}ジェム`)
    }

    // レベルアップチェック
    checkLevelUp()

    // 実績チェック
    checkAchievements(gameId, data)

    saveToLocalStorage()
  }

  const updateGameStats = (gameId, stats) => {
    const today = new Date().toISOString().split('T')[0]
    const week = getWeekNumber(new Date())
    const month = new Date().toISOString().slice(0, 7) // YYYY-MM

    // 日次統計の更新
    if (!gameStats.value.dailyStats[today]) {
      gameStats.value.dailyStats[today] = {
        gamesPlayed: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        playTime: 0
      }
    }

    // 週次統計の更新
    if (!gameStats.value.weeklyStats[week]) {
      gameStats.value.weeklyStats[week] = {
        gamesPlayed: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        playTime: 0
      }
    }

    // 月次統計の更新
    if (!gameStats.value.monthlyStats[month]) {
      gameStats.value.monthlyStats[month] = {
        gamesPlayed: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        playTime: 0
      }
    }

    // 統計データの更新
    gameStats.value.totalGamesPlayed++
    gameStats.value.totalCorrectAnswers += stats.correctAnswers || 0
    gameStats.value.totalAttempts += stats.totalAttempts || 0
    gameStats.value.totalPlayTime += stats.playTime || 0

    gameStats.value.dailyStats[today].gamesPlayed++
    gameStats.value.dailyStats[today].correctAnswers += stats.correctAnswers || 0
    gameStats.value.dailyStats[today].totalAttempts += stats.totalAttempts || 0
    gameStats.value.dailyStats[today].playTime += stats.playTime || 0

    gameStats.value.weeklyStats[week].gamesPlayed++
    gameStats.value.weeklyStats[week].correctAnswers += stats.correctAnswers || 0
    gameStats.value.weeklyStats[week].totalAttempts += stats.totalAttempts || 0
    gameStats.value.weeklyStats[week].playTime += stats.playTime || 0

    gameStats.value.monthlyStats[month].gamesPlayed++
    gameStats.value.monthlyStats[month].correctAnswers += stats.correctAnswers || 0
    gameStats.value.monthlyStats[month].totalAttempts += stats.totalAttempts || 0
    gameStats.value.monthlyStats[month].playTime += stats.playTime || 0

    saveToLocalStorage()
  }

  const checkLevelUp = () => {
    const currentLevel = playerData.value.captainLevel || playerData.value.level
    const currentEnergy = playerData.value.cosmicEnergy || playerData.value.exp
    const expNeeded = currentLevel * 1000
    
    if (currentEnergy >= expNeeded) {
      const newLevel = currentLevel + 1
      playerData.value.captainLevel = newLevel
      playerData.value.level = newLevel  // 後方互換性
      
      const energyRemaining = currentEnergy - expNeeded
      playerData.value.cosmicEnergy = energyRemaining
      playerData.value.exp = energyRemaining  // 後方互換性

      // レベルアップ報酬
      const gemReward = newLevel * 50
      playerData.value.soundGems += gemReward

      console.log(`🚀 船長レベルアップ！ Lv.${newLevel} (+${gemReward}ジェム)`)

      // レベルアップ時のタイトル更新
      updatePlayerTitle(newLevel)
    }
  }

  const updatePlayerTitle = (level) => {
    const titles = {
      1: 'スペース・ルーキー',
      5: 'ギャラクシー・レンジャー',
      10: 'コズミック・マスター',
      15: 'ステラー・ヒーロー',
      20: 'ギャラクシー・レジェンド'
    }

    if (titles[level]) {
      playerData.value.title = titles[level]
      console.log(`👑 新しい称号獲得: ${titles[level]}`)
    }
  }

  const checkAchievements = (gameId, gameData) => {
    // 初回ゲームクリア
    if (!achievements.value.firstStep.earned && gameData.completed) {
      achievements.value.firstStep = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      console.log('🏆 実績獲得: ファースト・ステップ')
    }

    // パーフェクトスコア
    if (!achievements.value.perfectPlayer.earned && gameData.bestScore >= 100) {
      achievements.value.perfectPlayer = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      console.log('🏆 実績獲得: パーフェクト・プレイヤー')
    }

    // フォニックス・マスター（全音素習得）
    if (!achievements.value.phonicsMaster.earned && gameId === 'singlePhoneme') {
      const masteredPhonemes = gameData.masteredPhonemes || []
      if (masteredPhonemes.length >= 44) {
        achievements.value.phonicsMaster = {
          earned: true,
          earnedDate: new Date().toISOString()
        }
        console.log('🏆 実績獲得: フォニックス・マスター')
      }
    }
  }

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0]
    const lastPlayed = playerData.value.lastPlayed

    if (lastPlayed) {
      const lastPlayedDate = new Date(lastPlayed).toISOString().split('T')[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastPlayedDate === yesterdayStr) {
        // 昨日プレイしていた場合、航行日数継続
        playerData.value.navigationDays++
        playerData.value.streak = playerData.value.navigationDays  // 後方互換性
      } else if (lastPlayedDate !== today) {
        // 1日以上空いた場合、航行日数リセット
        playerData.value.navigationDays = 1
        playerData.value.streak = 1  // 後方互換性
      }
      // 今日既にプレイ済みの場合は何もしない
    } else {
      // 初回プレイ
      playerData.value.navigationDays = 1
      playerData.value.streak = 1  // 後方互換性
    }

    playerData.value.lastPlayed = today

    // 航行日数実績チェック
    const currentDays = playerData.value.navigationDays || playerData.value.streak
    if (currentDays >= 7 && !achievements.value.streakStar.earned) {
      achievements.value.streakStar = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      console.log('🏆 実績獲得: ギャラクシー・ナビゲーター')
    }

    saveToLocalStorage()
  }

  // デイリークエストの進捗更新
  const updateDailyQuest = (questType, progress = 1) => {
    const today = new Date().toISOString().split('T')[0]

    if (!gameStats.value.dailyQuests) {
      gameStats.value.dailyQuests = {}
    }

    if (!gameStats.value.dailyQuests[today]) {
      gameStats.value.dailyQuests[today] = {
        phonics: 0,
        blending: 0,
        perfect: 0
      }
    }

    gameStats.value.dailyQuests[today][questType] =
      Math.min((gameStats.value.dailyQuests[today][questType] || 0) + progress, 10)

    saveToLocalStorage()
  }

  // ローカルストレージ関連
  const saveToLocalStorage = () => {
    const data = {
      playerData: playerData.value,
      gameProgress: gameProgress.value,
      gameStats: gameStats.value,
      achievements: achievements.value,
      version: '1.0.0', // データバージョン管理
      lastSaved: new Date().toISOString()
    }

    try {
      localStorage.setItem('movwiseGameData', JSON.stringify(data))
      console.log('💾 データ保存完了')
    } catch (error) {
      console.error('❌ データ保存エラー:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem('movwiseGameData')
      if (data) {
        const parsed = JSON.parse(data)

        // データバージョンチェック
        if (parsed.version) {
          playerData.value = { ...playerData.value, ...parsed.playerData }
          gameProgress.value = { ...gameProgress.value, ...parsed.gameProgress }
          gameStats.value = { ...gameStats.value, ...parsed.gameStats }
          achievements.value = { ...achievements.value, ...parsed.achievements }
          console.log('📂 データ読み込み完了')
        } else {
          console.log('⚠️ 古いデータ形式のため初期化')
          saveToLocalStorage() // 新形式で保存
        }
      }
    } catch (error) {
      console.error('❌ データ読み込みエラー:', error)
      console.log('🔄 データを初期化します')
    }
  }

  // データリセット
  const resetAllData = () => {
    if (confirm('⚠️ 全てのゲームデータを削除しますか？\nこの操作は元に戻せません。')) {
      localStorage.removeItem('movwiseGameData')
      location.reload()
    }
  }

  // ユーティリティ関数
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  // Word Rush 専用の統計追跡
  const trackWordRushResults = (results) => {
    const { score, correctAnswers, maxStreak, difficulty, timeSpent } = results

    // 基本統計更新
    gameStats.value.totalGamesPlayed++
    gameStats.value.wordRush.gamesPlayed++
    gameStats.value.wordRush.totalScore += score
    gameStats.value.wordRush.bestScore = Math.max(gameStats.value.wordRush.bestScore, score)
    gameStats.value.wordRush.bestStreak = Math.max(gameStats.value.wordRush.bestStreak, maxStreak)

    // 正解率の移動平均計算
    const currentAccuracy = (correctAnswers / 10) * 100
    gameStats.value.wordRush.averageAccuracy =
      (gameStats.value.wordRush.averageAccuracy * (gameStats.value.wordRush.gamesPlayed - 1) + currentAccuracy)
      / gameStats.value.wordRush.gamesPlayed

    // 難易度別習熟度更新
    gameStats.value.wordRush.vocabularyMastery[difficulty] =
      Math.min(100, gameStats.value.wordRush.vocabularyMastery[difficulty] + (currentAccuracy / 10))

    // Spatial.io VR準備度計算
    gameStats.value.wordRush.spatialReadiness = Math.round(
      (gameStats.value.wordRush.vocabularyMastery.beginner * 0.3 +
        gameStats.value.wordRush.vocabularyMastery.intermediate * 0.5 +
        gameStats.value.wordRush.vocabularyMastery.advanced * 0.2)
    )

    // 経験値とレベル更新
    const expGained = Math.round(score / 10)
    playerData.value.exp += expGained

    // MovWISE統合分析データ更新
    updateCrossGameAnalytics('wordRush', {
      vocabularyStrength: currentAccuracy,
      learningVelocity: score / timeSpent,
      patternRecognition: maxStreak / 10
    })

    // デイリークエスト進捗更新
    updateDailyQuest('wordRush', { accuracy: currentAccuracy, streak: maxStreak })

    // 実績チェック
    checkWordRushAchievements(score, maxStreak, currentAccuracy)

    // ローカルストレージに保存
    saveToLocalStorage()
  }

  // MovWISE他ゲームとの連携分析
  const updateCrossGameAnalytics = (gameType, metrics) => {
    if (!gameStats.value.crossGameAnalytics) {
      gameStats.value.crossGameAnalytics = {}
    }
    gameStats.value.crossGameAnalytics[gameType] = metrics

    // フォニックス学習との相関分析
    if (gameType === 'wordRush' && gameStats.value.crossGameAnalytics.phonics) {
      analyzePhonicsVocabularyCorrelation()
    }

    // VR準備度総合評価
    calculateOverallVRReadiness()
  }

  // フォニックスと語彙の相関分析
  const analyzePhonicsVocabularyCorrelation = () => {
    const phonicsStrength = gameStats.value.crossGameAnalytics.phonics?.soundRecognition || 0
    const vocabularyStrength = gameStats.value.crossGameAnalytics.wordRush?.vocabularyStrength || 0

    // 相関係数計算
    if (!gameStats.value.learningInsights) {
      gameStats.value.learningInsights = {}
    }
    gameStats.value.learningInsights.phonicsVocabCorrelation = Math.round(
      (phonicsStrength + vocabularyStrength) / 2
    )

    // 学習推奨事項生成
    if (phonicsStrength > vocabularyStrength + 20) {
      gameStats.value.learningInsights.recommendation = 'vocabulary_focus'
    } else if (vocabularyStrength > phonicsStrength + 20) {
      gameStats.value.learningInsights.recommendation = 'phonics_review'
    } else {
      gameStats.value.learningInsights.recommendation = 'balanced_progress'
    }
  }

  // VR準備度総合計算
  const calculateOverallVRReadiness = () => {
    const phonicsReadiness = gameStats.value.crossGameAnalytics.phonics?.overallMastery || 0
    const vocabularyReadiness = gameStats.value.wordRush?.spatialReadiness || 0
    const grammarReadiness = gameStats.value.crossGameAnalytics.grammar?.structureUnderstanding || 0

    if (!gameStats.value.vrReadinessScore) {
      gameStats.value.vrReadinessScore = 0
    }
    gameStats.value.vrReadinessScore = Math.round(
      (phonicsReadiness * 0.3 + vocabularyReadiness * 0.4 + grammarReadiness * 0.3)
    )
  }

  // Word Rush 実績チェック
  const checkWordRushAchievements = (score, maxStreak, accuracy) => {
    // ワード・ラッシュ・チャンピオン
    if (score >= 3000 && !achievements.value.wordRushChampion.earned) {
      achievements.value.wordRushChampion = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 500
    }

    // スピード・マスター
    if (maxStreak >= 8 && !achievements.value.speedMaster.earned) {
      achievements.value.speedMaster = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 300
    }

    // ボキャブラリー・エキスパート
    if (accuracy >= 80 && !achievements.value.vocabularyExpert.earned) {
      achievements.value.vocabularyExpert = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 400
    }

    // VR準備完了
    if (gameStats.value.wordRush.spatialReadiness >= 90 && !achievements.value.vrReady.earned) {
      achievements.value.vrReady = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 600
    }
  }

  // 初期化
  loadFromLocalStorage()

  return {
    // 状態
    playerData,
    gameProgress,
    gameStats,
    achievements,
    gameSettings,

    // 計算プロパティ
    playerLevel,
    playerExp,
    playerSoundGems,
    playerStreak,
    spaceshipStatus,  // 新規追加

    // メソッド
    updatePlayerData,
    updateGameProgress,
    updateGameStats,
    getGameProgress,
    getStageProgress,
    getCompletionRate,
    updateStreak,
    updateDailyQuest,
    checkAchievements,
    resetAllData,
    trackWordRushResults,
    updateCrossGameAnalytics,
    analyzePhonicsVocabularyCorrelation,
    calculateOverallVRReadiness
  }
})