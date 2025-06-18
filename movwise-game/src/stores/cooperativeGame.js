import { defineStore } from 'pinia'
import { firebaseService } from '../services/firebaseService'
import { GAME_STATES } from '../firebase/database'

export const useCooperativeGameStore = defineStore('cooperativeGame', {
  state: () => ({
    // Authentication state
    user: null,
    isAuthenticated: false,
    userRole: null, // 'teacher' or 'student'
    
    // Game session state
    currentSession: null,
    sessionId: null,
    gameState: GAME_STATES.WAITING,
    
    // Participants and progress
    participants: {},
    myProgress: null,
    
    // Game data
    currentQuestion: 0,
    questions: [],
    gameSettings: {},
    
    // Real-time listeners
    listeners: [],
    
    // UI state
    isLoading: false,
    error: null,
    
    // Teacher-specific state
    activeSessions: [],
    
    // Game statistics
    totalScore: 0,
    correctAnswers: 0,
    totalAnswers: 0
  }),

  getters: {
    isTeacher: (state) => state.userRole === 'teacher',
    isStudent: (state) => state.userRole === 'student',
    isGameActive: (state) => state.gameState === GAME_STATES.ACTIVE,
    isGameWaiting: (state) => state.gameState === GAME_STATES.WAITING,
    isGameCompleted: (state) => state.gameState === GAME_STATES.COMPLETED,
    
    participantCount: (state) => Object.keys(state.participants || {}).length,
    
    currentQuestionData: (state) => {
      return state.questions[state.currentQuestion] || null
    },
    
    leaderboard: (state) => {
      return Object.values(state.participants || {})
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10)
    },
    
    myRank: (state) => {
      if (!state.myProgress || !state.participants) return null
      
      const sortedParticipants = Object.values(state.participants)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
      
      return sortedParticipants.findIndex(p => p.id === state.user?.uid) + 1
    },
    
    averageScore: (state) => {
      const participants = Object.values(state.participants || {})
      if (participants.length === 0) return 0
      
      const totalScore = participants.reduce((sum, p) => sum + (p.score || 0), 0)
      return Math.round(totalScore / participants.length)
    }
  },

  actions: {
    // Authentication actions
    async signIn(email, password) {
      this.isLoading = true
      this.error = null
      
      try {
        const result = await firebaseService.signIn(email, password)
        
        if (result.success) {
          this.user = result.user
          this.isAuthenticated = true
          this.userRole = firebaseService.getUserRole()
        } else {
          this.error = result.error
        }
        
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async signUp(email, password, displayName, userType) {
      this.isLoading = true
      this.error = null
      
      try {
        const result = await firebaseService.signUp(email, password, displayName, userType)
        
        if (result.success) {
          this.user = result.user
          this.isAuthenticated = true
          this.userRole = userType
        } else {
          this.error = result.error
        }
        
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async signOut() {
      try {
        await this.leaveSession()
        await firebaseService.signOut()
        this.$reset()
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    // Teacher actions
    async createGameSession(gameConfig) {
      if (!this.isTeacher) {
        this.error = 'Only teachers can create game sessions'
        return { success: false, error: this.error }
      }

      this.isLoading = true
      this.error = null

      try {
        const result = await firebaseService.createCooperativeGameSession(gameConfig)
        
        if (result.success) {
          this.sessionId = result.sessionId
          this.currentSession = result.sessionData
          this.questions = gameConfig.questions || []
          this.gameSettings = gameConfig.settings || {}
          
          // Start listening to session changes
          this.startListeningToSession(result.sessionId)
        } else {
          this.error = result.error
        }
        
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async startGame() {
      if (!this.isTeacher || !this.sessionId) return { success: false, error: 'Invalid session' }

      try {
        const result = await firebaseService.startGameSession(this.sessionId)
        if (result.success) {
          this.gameState = GAME_STATES.ACTIVE
        }
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async pauseGame() {
      if (!this.isTeacher || !this.sessionId) return { success: false, error: 'Invalid session' }

      try {
        const result = await firebaseService.pauseGameSession(this.sessionId)
        if (result.success) {
          this.gameState = GAME_STATES.PAUSED
        }
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async endGame() {
      if (!this.isTeacher || !this.sessionId) return { success: false, error: 'Invalid session' }

      try {
        const result = await firebaseService.endGameSession(this.sessionId)
        if (result.success) {
          this.gameState = GAME_STATES.COMPLETED
        }
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async nextQuestion() {
      if (!this.isTeacher || !this.sessionId) return { success: false, error: 'Invalid session' }

      const nextIndex = this.currentQuestion + 1
      if (nextIndex >= this.questions.length) {
        return await this.endGame()
      }

      try {
        const result = await firebaseService.moveToNextQuestion(this.sessionId, nextIndex)
        if (result.success) {
          this.currentQuestion = nextIndex
        }
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    // Student actions
    async joinGameSession(sessionId) {
      if (!this.isStudent) {
        this.error = 'Only students can join game sessions'
        return { success: false, error: this.error }
      }

      this.isLoading = true
      this.error = null

      try {
        const result = await firebaseService.joinCooperativeGameSession(sessionId)
        
        if (result.success) {
          this.sessionId = sessionId
          this.myProgress = result.participantData
          
          // Start listening to session changes
          this.startListeningToSession(sessionId)
          this.startListeningToMyProgress(sessionId)
        } else {
          this.error = result.error
        }
        
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async submitAnswer(questionId, answer) {
      if (!this.isStudent || !this.sessionId) {
        return { success: false, error: 'Invalid session' }
      }

      try {
        const result = await firebaseService.submitStudentAnswer(this.sessionId, questionId, answer)
        
        if (result.success) {
          this.totalAnswers++
          // Score will be updated via real-time listener
        }
        
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    // Real-time listeners
    startListeningToSession(sessionId) {
      const listenerId = firebaseService.listenToGameSession(sessionId, (snapshot) => {
        if (snapshot.exists()) {
          const sessionData = snapshot.val()
          this.currentSession = sessionData
          this.gameState = sessionData.state
          this.currentQuestion = sessionData.currentQuestion || 0
          this.questions = sessionData.questions || []
          this.gameSettings = sessionData.settings || {}
        }
      })
      
      this.listeners.push(listenerId)
    },

    startListeningToParticipants(sessionId) {
      const listenerId = firebaseService.listenToParticipants(sessionId, (snapshot) => {
        if (snapshot.exists()) {
          this.participants = snapshot.val()
        }
      })
      
      this.listeners.push(listenerId)
    },

    startListeningToMyProgress(sessionId) {
      if (!this.isStudent) return

      const listenerId = firebaseService.listenToMyProgress(sessionId, (snapshot) => {
        if (snapshot.exists()) {
          const progressData = snapshot.val()
          this.myProgress = progressData
          this.totalScore = progressData.score || 0
          
          // Update statistics
          if (progressData.answers) {
            const answers = Object.values(progressData.answers)
            this.totalAnswers = answers.length
            this.correctAnswers = answers.filter(a => a.isCorrect).length
          }
        }
      })
      
      this.listeners.push(listenerId)
    },

    // Session management
    async leaveSession() {
      // Stop all listeners
      this.listeners.forEach(listenerId => {
        firebaseService.db.removeListener(listenerId)
      })
      this.listeners = []
      
      // Clear session data
      this.sessionId = null
      this.currentSession = null
      this.participants = {}
      this.myProgress = null
      this.gameState = GAME_STATES.WAITING
      this.currentQuestion = 0
      this.questions = []
      this.gameSettings = {}
      
      await firebaseService.leaveSession()
    },

    // Utility actions
    clearError() {
      this.error = null
    },

    async loadActiveSessions() {
      if (!this.isTeacher) return { success: false, error: 'Only teachers can view active sessions' }

      try {
        const result = await firebaseService.getActiveSessions()
        if (result.success) {
          this.activeSessions = result.sessions
        }
        return result
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    }
  },

  // Persist authentication state
  persist: {
    paths: ['user', 'isAuthenticated', 'userRole']
  }
})