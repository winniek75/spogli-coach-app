// src/stores/progress.js
import { defineStore } from 'pinia'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    // ゲーム進捗データ
    gameScores: [],
    gameProgress: {
      'sound-master': 0,
      'word-rush': 0,
      'pattern-builder': 0
    },
    totalStudyTime: 0,
    dailyActivities: {},
    streakData: {
      current: 0,
      longest: 0,
      lastActivityDate: null
    },
    badges: [],
    preferences: {
      soundEnabled: true,
      difficulty: 'normal',
      theme: 'light'
    }
  }),

  getters: {
    getTotalScore() {
      return this.gameScores.reduce((total, score) => total + score.score, 0)
    },

    getCompletedGamesCount() {
      return this.gameScores.length
    },

    getStreakDays() {
      return this.streakData.current
    },

    getAverageAccuracy() {
      if (this.gameScores.length === 0) return 0
      const totalAccuracy = this.gameScores.reduce((total, score) => total + (score.accuracy || 0), 0)
      return totalAccuracy / this.gameScores.length
    },

    getTotalStudyTime() {
      return this.totalStudyTime
    },

    getHighScore() {
      return this.gameScores.length > 0
        ? Math.max(...this.gameScores.map(score => score.score))
        : 0
    },

    getRecentScores() {
      return (limit = 10) => {
        return [...this.gameScores]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit)
      }
    },

    getGameProgress() {
      return (gameType) => this.gameProgress[gameType] || 0
    },

    hasBadge() {
      return (badgeId) => this.badges.includes(badgeId)
    },

    hasActivityOnDate() {
      return (dateString) => {
        return this.dailyActivities[dateString] && this.dailyActivities[dateString].length > 0
      }
    },

    getActivitiesOnDate() {
      return (dateString) => {
        return this.dailyActivities[dateString] || []
      }
    }
  },

  actions: {
    // ゲームスコアを記録
    recordGameScore(gameData) {
      const scoreRecord = {
        id: Date.now(),
        gameType: gameData.gameType,
        score: gameData.score,
        accuracy: gameData.accuracy,
        timeSpent: gameData.timeSpent || 0,
        level: gameData.level || 1,
        date: new Date().toISOString(),
        correctAnswers: gameData.correctAnswers || 0,
        totalQuestions: gameData.totalQuestions || 0
      }

      this.gameScores.push(scoreRecord)

      // 学習時間を更新
      this.totalStudyTime += scoreRecord.timeSpent

      // ゲーム進捗を更新
      if (gameData.levelCompleted) {
        this.gameProgress[gameData.gameType] = Math.max(
          this.gameProgress[gameData.gameType],
          gameData.level
        )
      }

      // 日別アクティビティを記録
      this.recordDailyActivity(scoreRecord)

      // 連続学習日数を更新
      this.updateStreak()

      // バッジをチェック
      this.checkAndAwardBadges()

      // データを永続化
      this.saveProgress()
    },

    // 日別アクティビティを記録
    recordDailyActivity(scoreRecord) {
      const dateKey = scoreRecord.date.split('T')[0]

      if (!this.dailyActivities[dateKey]) {
        this.dailyActivities[dateKey] = []
      }

      this.dailyActivities[dateKey].push({
        id: scoreRecord.id,
        gameType: scoreRecord.gameType,
        score: scoreRecord.score,
        accuracy: scoreRecord.accuracy,
        time: new Date(scoreRecord.date).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit'
        })
      })
    },

    // 連続学習日数を更新
    updateStreak() {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (!this.streakData.lastActivityDate) {
        // 初回学習
        this.streakData.current = 1
        this.streakData.lastActivityDate = today
      } else if (this.streakData.lastActivityDate === today) {
        // 今日はすでに学習済み（何もしない）
        return
      } else if (this.streakData.lastActivityDate === yesterday) {
        // 連続学習
        this.streakData.current += 1
        this.streakData.lastActivityDate = today
      } else {
        // 連続が途切れた
        this.streakData.current = 1
        this.streakData.lastActivityDate = today
      }

      // 最長連続記録を更新
      this.streakData.longest = Math.max(
        this.streakData.longest,
        this.streakData.current
      )
    },

    // バッジの獲得をチェック
    checkAndAwardBadges() {
      const newBadges = []

      // 初回プレイバッジ
      if (!this.hasBadge('first-game') && this.gameScores.length >= 1) {
        newBadges.push('first-game')
      }

      // ハイスコアラーバッジ
      if (!this.hasBadge('high-scorer') && this.getHighScore >= 1000) {
        newBadges.push('high-scorer')
      }

      // 連続学習バッジ
      if (!this.hasBadge('streak-week') && this.streakData.current >= 7) {
        newBadges.push('streak-week')
      }

      // パーフェクトスコアバッジ
      if (!this.hasBadge('perfect-score') &&
        this.gameScores.some(score => score.accuracy === 100)) {
        newBadges.push('perfect-score')
      }

      // ゲームマスターバッジ
      if (!this.hasBadge('game-master') &&
        Object.values(this.gameProgress).every(progress => progress >= 10)) {
        newBadges.push('game-master')
      }

      // スピードランナーバッジ
      if (!this.hasBadge('speed-runner') &&
        this.gameScores.some(score => score.timeSpent < 60 && score.accuracy >= 90)) {
        newBadges.push('speed-runner')
      }

      // 新しいバッジを追加
      newBadges.forEach(badge => {
        if (!this.badges.includes(badge)) {
          this.badges.push(badge)
        }
      })

      return newBadges
    },

    // レベル完了を記録
    completeLevel(gameType, level) {
      this.gameProgress[gameType] = Math.max(this.gameProgress[gameType], level)
      this.saveProgress()
    },

    // 設定を更新
    updatePreferences(newPreferences) {
      this.preferences = { ...this.preferences, ...newPreferences }
      this.saveProgress()
    },

    // データをローカルストレージに保存
    saveProgress() {
      try {
        const progressData = {
          gameScores: this.gameScores,
          gameProgress: this.gameProgress,
          totalStudyTime: this.totalStudyTime,
          dailyActivities: this.dailyActivities,
          streakData: this.streakData,
          badges: this.badges,
          preferences: this.preferences
        }
        localStorage.setItem('movwise-progress', JSON.stringify(progressData))
      } catch (error) {
        console.error('進捗データの保存に失敗しました:', error)
      }
    },

    // データをローカルストレージから読み込み
    loadProgress() {
      try {
        const savedData = localStorage.getItem('movwise-progress')
        if (savedData) {
          const progressData = JSON.parse(savedData)

          this.gameScores = progressData.gameScores || []
          this.gameProgress = { ...this.gameProgress, ...progressData.gameProgress }
          this.totalStudyTime = progressData.totalStudyTime || 0
          this.dailyActivities = progressData.dailyActivities || {}
          this.streakData = { ...this.streakData, ...progressData.streakData }
          this.badges = progressData.badges || []
          this.preferences = { ...this.preferences, ...progressData.preferences }
        }
      } catch (error) {
        console.error('進捗データの読み込みに失敗しました:', error)
      }
    },

    // データをリセット
    resetProgress() {
      this.gameScores = []
      this.gameProgress = {
        'sound-master': 0,
        'word-rush': 0,
        'pattern-builder': 0
      }
      this.totalStudyTime = 0
      this.dailyActivities = {}
      this.streakData = {
        current: 0,
        longest: 0,
        lastActivityDate: null
      }
      this.badges = []

      localStorage.removeItem('movwise-progress')
    },

    // 統計データを取得
    getStatistics() {
      const stats = {
        totalGames: this.gameScores.length,
        totalScore: this.getTotalScore,
        averageScore: this.gameScores.length > 0
          ? Math.round(this.getTotalScore / this.gameScores.length)
          : 0,
        highScore: this.getHighScore,
        averageAccuracy: Math.round(this.getAverageAccuracy),
        totalStudyTime: this.totalStudyTime,
        currentStreak: this.streakData.current,
        longestStreak: this.streakData.longest,
        badgeCount: this.badges.length,
        gamesThisWeek: this.getGamesThisWeek(),
        favoriteGame: this.getFavoriteGame()
      }

      return stats
    },

    // 今週のゲーム数を取得
    getGamesThisWeek() {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return this.gameScores.filter(score =>
        new Date(score.date) >= oneWeekAgo
      ).length
    },

    // お気に入りゲームを取得
    getFavoriteGame() {
      if (this.gameScores.length === 0) return null

      const gameCount = {}
      this.gameScores.forEach(score => {
        gameCount[score.gameType] = (gameCount[score.gameType] || 0) + 1
      })

      const mostPlayedGame = Object.keys(gameCount).reduce((a, b) =>
        gameCount[a] > gameCount[b] ? a : b
      )

      const gameNames = {
        'sound-master': 'サウンドマスター',
        'word-rush': 'ワードラッシュ',
        'pattern-builder': 'パターンビルダー'
      }

      return gameNames[mostPlayedGame] || mostPlayedGame
    }
  }
})