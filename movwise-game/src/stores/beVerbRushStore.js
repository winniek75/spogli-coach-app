// beVerbRushStore.js - 完全修正版（エラー対策）
import { defineStore } from 'pinia'

export const useBeVerbRushStore = defineStore('beVerbRush', {
  state: () => ({
    // ゲーム状態
    gameState: 'waiting', // waiting, countdown, playing, paused, finished
    currentScore: 0,
    currentLives: 3,
    timeRemaining: 60000, // 60秒
    currentCombo: 0,
    maxCombo: 0,
    currentSubject: null,

    // ゲーム設定
    maxLives: 3,
    gameDuration: 60000,

    // セッション統計
    sessionStats: {
      totalAttempts: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageReactionTime: 0,
      reactionTimes: [],
      subjectAccuracy: {},
      timeoutMisses: 0
    },

    // 永続データ
    persistentData: {
      bestScore: 0,
      totalGamesPlayed: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      mastery: 0,
      achievements: [],
      gameHistory: [],
      preferences: {
        difficulty: 'auto',
        soundEnabled: false, // 音声無効
        vibrationEnabled: true
      }
    },

    // タイマー
    gameTimer: null,
    spawnTimer: null,

    // エラー状態
    gameError: null
  }),

  getters: {
    // 安全な計算されたプロパティ
    timeRemainingSeconds: (state) => {
      try {
        return Math.max(0, Math.ceil(state.timeRemaining / 1000))
      } catch (error) {
        console.warn('Time remaining calculation error:', error)
        return 0
      }
    },

    gameProgress: (state) => {
      try {
        return Math.min(100, ((state.gameDuration - state.timeRemaining) / state.gameDuration) * 100)
      } catch (error) {
        console.warn('Game progress calculation error:', error)
        return 0
      }
    },

    accuracy: (state) => {
      try {
        if (state.sessionStats.totalAttempts === 0) return 100
        return Math.round((state.sessionStats.correctAnswers / state.sessionStats.totalAttempts) * 100)
      } catch (error) {
        console.warn('Accuracy calculation error:', error)
        return 0
      }
    },

    overallAccuracy: (state) => {
      try {
        if (state.persistentData.totalQuestions === 0) return 0
        return Math.round((state.persistentData.totalCorrectAnswers / state.persistentData.totalQuestions) * 100)
      } catch (error) {
        console.warn('Overall accuracy calculation error:', error)
        return 0
      }
    },

    scoreMultiplier: (state) => {
      try {
        return Math.max(1, Math.floor(state.currentCombo / 5) + 1)
      } catch (error) {
        console.warn('Score multiplier calculation error:', error)
        return 1
      }
    },

    canContinue: (state) => {
      try {
        return state.currentLives > 0 && state.timeRemaining > 0 && state.gameState === 'playing'
      } catch (error) {
        console.warn('Can continue calculation error:', error)
        return false
      }
    }
  },

  actions: {
    // エラーハンドリング
    handleError(error, context = 'unknown') {
      console.error(`BeVerbRush error (${context}):`, error)
      this.gameError = {
        message: error.message || 'Unknown error',
        context,
        timestamp: Date.now()
      }
    },

    // タイマークリア
    clearTimers() {
      try {
        if (this.gameTimer) {
          clearInterval(this.gameTimer)
          this.gameTimer = null
        }
        if (this.spawnTimer) {
          clearTimeout(this.spawnTimer)
          this.spawnTimer = null
        }
      } catch (error) {
        this.handleError(error, 'clearTimers')
      }
    },

    // ゲームセッションリセット
    resetGameSession() {
      try {
        this.clearTimers()

        this.currentScore = 0
        this.currentLives = this.maxLives
        this.timeRemaining = this.gameDuration
        this.currentCombo = 0
        this.maxCombo = 0
        this.currentSubject = null
        this.gameError = null

        // セッション統計リセット
        this.sessionStats = {
          totalAttempts: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          averageReactionTime: 0,
          reactionTimes: [],
          subjectAccuracy: {},
          timeoutMisses: 0
        }

        console.log('✅ Game session reset')
      } catch (error) {
        this.handleError(error, 'resetGameSession')
      }
    },

    // ゲーム開始
    startGame() {
      try {
        if (this.gameState !== 'waiting') {
          console.warn('Game already in progress')
          return
        }

        this.resetGameSession()
        this.gameState = 'countdown'

        console.log('🎮 Game starting...')
      } catch (error) {
        this.handleError(error, 'startGame')
        this.gameState = 'waiting'
      }
    },

    // ゲーム一時停止/再開
    togglePause() {
      try {
        if (this.gameState === 'playing') {
          this.gameState = 'paused'
          this.clearTimers()
        } else if (this.gameState === 'paused') {
          this.gameState = 'playing'
        }
      } catch (error) {
        this.handleError(error, 'togglePause')
      }
    },

    // ゲーム終了
    endGame() {
      try {
        this.gameState = 'finished'
        this.clearTimers()
        this.updatePersistentStats()

        if (this.currentScore > this.persistentData.bestScore) {
          this.persistentData.bestScore = this.currentScore
        }

        this.saveProgress()
        console.log('🏁 Game ended - Score:', this.currentScore)
      } catch (error) {
        this.handleError(error, 'endGame')
      }
    },

    // 回答提出
    submitAnswer(selectedBe, reactionTime = 0) {
      try {
        if (!this.currentSubject || this.gameState !== 'playing') {
          return false
        }

        const subject = this.currentSubject
        const isCorrect = selectedBe === subject.correctBe
        const validReactionTime = Math.max(0, Math.min(10000, reactionTime))

        // 統計更新
        this.sessionStats.totalAttempts++
        this.sessionStats.reactionTimes.push(validReactionTime)
        this.sessionStats.averageReactionTime =
          this.sessionStats.reactionTimes.reduce((a, b) => a + b, 0) / this.sessionStats.reactionTimes.length

        // 主語別統計
        if (!this.sessionStats.subjectAccuracy[subject.text]) {
          this.sessionStats.subjectAccuracy[subject.text] = { correct: 0, total: 0 }
        }
        this.sessionStats.subjectAccuracy[subject.text].total++

        if (isCorrect) {
          this.handleCorrectAnswer(subject, validReactionTime)
          this.sessionStats.correctAnswers++
          this.sessionStats.subjectAccuracy[subject.text].correct++
        } else {
          this.handleIncorrectAnswer(subject)
          this.sessionStats.incorrectAnswers++
        }

        this.currentSubject = null

        // ゲーム終了条件チェック
        if (!this.canContinue) {
          this.endGame()
        }

        return isCorrect
      } catch (error) {
        this.handleError(error, 'submitAnswer')
        return false
      }
    },

    // 正解処理
    handleCorrectAnswer(subject, reactionTime) {
      try {
        this.currentCombo++
        if (this.currentCombo > this.maxCombo) {
          this.maxCombo = this.currentCombo
        }

        // スコア計算
        const baseScore = (subject.difficulty || 1) * 10
        const timeBonus = reactionTime < 1000 ? 10 : reactionTime < 1500 ? 5 : 0
        const comboBonus = Math.floor(this.currentCombo / 5) * 5
        const totalScore = (baseScore + timeBonus + comboBonus) * this.scoreMultiplier

        this.currentScore += Math.max(0, totalScore)

        console.log(`✅ Correct! Score: +${totalScore}`)
      } catch (error) {
        this.handleError(error, 'handleCorrectAnswer')
      }
    },

    // 不正解処理
    handleIncorrectAnswer(subject) {
      try {
        this.currentCombo = 0
        this.currentLives = Math.max(0, this.currentLives - 1)

        console.log(`❌ Incorrect! Lives: ${this.currentLives}`)

        if (this.currentLives <= 0) {
          this.endGame()
        }
      } catch (error) {
        this.handleError(error, 'handleIncorrectAnswer')
      }
    },

    // 永続統計更新
    updatePersistentStats() {
      try {
        this.persistentData.totalGamesPlayed++
        this.persistentData.totalCorrectAnswers += this.sessionStats.correctAnswers
        this.persistentData.totalQuestions += this.sessionStats.totalAttempts

        // 習熟度計算
        const totalQuestions = Math.max(1, this.persistentData.totalQuestions)
        this.persistentData.mastery = Math.min(100, Math.round(
          (this.persistentData.totalCorrectAnswers / totalQuestions) * 100
        ))

        // ゲーム履歴追加
        const gameRecord = {
          date: new Date().toISOString(),
          score: this.currentScore,
          accuracy: this.accuracy,
          duration: this.gameDuration - this.timeRemaining,
          maxCombo: this.maxCombo,
          averageReactionTime: this.sessionStats.averageReactionTime,
          timeoutMisses: this.sessionStats.timeoutMisses
        }

        this.persistentData.gameHistory.unshift(gameRecord)
        if (this.persistentData.gameHistory.length > 50) {
          this.persistentData.gameHistory = this.persistentData.gameHistory.slice(0, 50)
        }

        this.checkAchievements()
      } catch (error) {
        this.handleError(error, 'updatePersistentStats')
      }
    },

    // アチーブメントチェック
    checkAchievements() {
      try {
        const achievements = []
        const currentAchievements = this.persistentData.achievements || []

        // スコア関連
        if (this.currentScore >= 1000 && !currentAchievements.includes('bronze_master')) {
          achievements.push('bronze_master')
        }
        if (this.currentScore >= 2000 && !currentAchievements.includes('silver_master')) {
          achievements.push('silver_master')
        }
        if (this.currentScore >= 3000 && !currentAchievements.includes('gold_master')) {
          achievements.push('gold_master')
        }

        // 精度関連
        if (this.accuracy >= 95 && this.sessionStats.totalAttempts >= 10 && !currentAchievements.includes('perfectionist')) {
          achievements.push('perfectionist')
        }

        // 速度関連
        if (this.sessionStats.averageReactionTime < 700 && this.sessionStats.reactionTimes.length >= 10 && !currentAchievements.includes('speed_demon')) {
          achievements.push('speed_demon')
        }

        // コンボ関連
        if (this.maxCombo >= 20 && !currentAchievements.includes('combo_master')) {
          achievements.push('combo_master')
        }

        // パーフェクト
        if (this.sessionStats.incorrectAnswers === 0 && this.sessionStats.totalAttempts >= 20 && !currentAchievements.includes('no_mistake')) {
          achievements.push('no_mistake')
        }

        // 新規アチーブメント追加
        achievements.forEach(achievement => {
          if (!currentAchievements.includes(achievement)) {
            this.persistentData.achievements.push(achievement)
          }
        })

        return achievements
      } catch (error) {
        this.handleError(error, 'checkAchievements')
        return []
      }
    },

    // 進捗保存
    saveProgress() {
      try {
        const saveData = {
          persistentData: this.persistentData,
          lastSaved: new Date().toISOString(),
          version: '1.0.2'
        }
        localStorage.setItem('beVerbRushProgress', JSON.stringify(saveData))
        console.log('💾 Be Verb Rush progress saved')
        return true
      } catch (error) {
        this.handleError(error, 'saveProgress')
        console.error('❌ Failed to save Be Verb Rush progress:', error)
        return false
      }
    },

    // 進捗読み込み
    loadProgress() {
      try {
        const savedData = localStorage.getItem('beVerbRushProgress')
        if (savedData) {
          const data = JSON.parse(savedData)
          if (data.persistentData) {
            // 安全にデータを復元
            Object.keys(this.persistentData).forEach(key => {
              if (data.persistentData[key] !== undefined) {
                this.persistentData[key] = data.persistentData[key]
              }
            })

            // 設定の初期化
            if (!this.persistentData.preferences) {
              this.persistentData.preferences = {
                difficulty: 'auto',
                soundEnabled: false,
                vibrationEnabled: true
              }
            }
          }
          console.log('📖 Be Verb Rush progress loaded')
          return true
        }
      } catch (error) {
        this.handleError(error, 'loadProgress')
        console.error('❌ Failed to load Be Verb Rush progress:', error)
      }
      return false
    },

    // 進捗リセット
    resetProgress() {
      try {
        this.persistentData = {
          bestScore: 0,
          totalGamesPlayed: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          mastery: 0,
          achievements: [],
          gameHistory: [],
          preferences: {
            difficulty: 'auto',
            soundEnabled: false,
            vibrationEnabled: true
          }
        }
        this.resetGameSession()
        this.saveProgress()
        console.log('🔄 Be Verb Rush progress reset')
        return true
      } catch (error) {
        this.handleError(error, 'resetProgress')
        return false
      }
    },

    // 統計取得
    getStatistics() {
      try {
        return {
          session: { ...this.sessionStats },
          persistent: { ...this.persistentData },
          current: {
            score: this.currentScore,
            lives: this.currentLives,
            timeRemaining: this.timeRemaining,
            combo: this.currentCombo,
            accuracy: this.accuracy,
            error: this.gameError
          }
        }
      } catch (error) {
        this.handleError(error, 'getStatistics')
        return {
          session: {},
          persistent: {},
          current: {}
        }
      }
    },

    // 強制停止
    forceStop() {
      try {
        this.clearTimers()
        this.gameState = 'waiting'
        this.currentSubject = null
        this.gameError = null
        console.log('🛑 Game force stopped')
      } catch (error) {
        console.error('Force stop error:', error)
      }
    }
  },

  // Pinia persist設定
  persist: {
    key: 'beVerbRushStore',
    storage: localStorage,
    paths: ['persistentData'],
    beforeRestore: (context) => {
      console.log('🔄 Restoring BeVerbRush store...')
    },
    afterRestore: (context) => {
      console.log('✅ BeVerbRush store restored')
      // 非永続化データの初期化
      context.store.gameState = 'waiting'
      context.store.currentScore = 0
      context.store.currentLives = 3
      context.store.timeRemaining = 60000
      context.store.currentCombo = 0
      context.store.maxCombo = 0
      context.store.currentSubject = null
      context.store.gameTimer = null
      context.store.spawnTimer = null
      context.store.gameError = null

      // セッション統計リセット
      context.store.sessionStats = {
        totalAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageReactionTime: 0,
        reactionTimes: [],
        subjectAccuracy: {},
        timeoutMisses: 0
      }
    }
  }
})