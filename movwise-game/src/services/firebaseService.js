import { authService } from '../firebase/auth'
import { databaseService, GAME_STATES } from '../firebase/database'

// Main Firebase service that combines auth and database functionality
export class FirebaseService {
  constructor() {
    this.auth = authService
    this.db = databaseService
    this.currentSession = null
    this.userRole = null
  }

  // Initialize service
  async initialize() {
    // Set up auth state listener
    this.auth.onAuthStateChange((user) => {
      if (user) {
        this.userRole = this.auth.isTeacher() ? 'teacher' : 'student'
      } else {
        this.userRole = null
        this.currentSession = null
        this.db.removeAllListeners()
      }
    })
  }

  // Authentication methods
  async signIn(email, password) {
    return await this.auth.signIn(email, password)
  }

  async signUp(email, password, displayName, userType) {
    return await this.auth.signUp(email, password, displayName, userType)
  }

  async signOut() {
    this.db.removeAllListeners()
    this.currentSession = null
    this.userRole = null
    return await this.auth.signOutUser()
  }

  getCurrentUser() {
    return this.auth.getCurrentUser()
  }

  isAuthenticated() {
    return this.auth.isAuthenticated()
  }

  isTeacher() {
    return this.auth.isTeacher()
  }

  isStudent() {
    return this.auth.isStudent()
  }

  // Game session methods for teachers
  async createCooperativeGameSession(gameConfig) {
    if (!this.isTeacher()) {
      return {
        success: false,
        error: 'Only teachers can create game sessions'
      }
    }

    const user = this.getCurrentUser()
    const sessionData = {
      teacherId: user.uid,
      teacherName: user.displayName || user.email,
      gameType: gameConfig.gameType,
      title: gameConfig.title,
      description: gameConfig.description,
      maxParticipants: gameConfig.maxParticipants || 30,
      settings: gameConfig.settings || {},
      questions: gameConfig.questions || [],
      duration: gameConfig.duration || 30, // minutes
    }

    const result = await this.db.createGameSession(sessionData)
    if (result.success) {
      this.currentSession = result.sessionId
    }

    return result
  }

  // Game session methods for students
  async joinCooperativeGameSession(sessionId) {
    if (!this.isStudent()) {
      return {
        success: false,
        error: 'Only students can join game sessions'
      }
    }

    const user = this.getCurrentUser()
    const userInfo = {
      id: user.uid,
      name: user.displayName || user.email,
      email: user.email
    }

    const result = await this.db.joinGameSession(sessionId, user.uid, userInfo)
    if (result.success) {
      this.currentSession = sessionId
    }

    return result
  }

  // Game control methods
  async startGameSession(sessionId) {
    if (!this.isTeacher()) {
      return {
        success: false,
        error: 'Only teachers can start game sessions'
      }
    }

    return await this.db.updateGameSession(sessionId, {
      state: GAME_STATES.ACTIVE,
      startedAt: Date.now()
    })
  }

  async pauseGameSession(sessionId) {
    if (!this.isTeacher()) {
      return {
        success: false,
        error: 'Only teachers can pause game sessions'
      }
    }

    return await this.db.updateGameSession(sessionId, {
      state: GAME_STATES.PAUSED
    })
  }

  async endGameSession(sessionId) {
    if (!this.isTeacher()) {
      return {
        success: false,
        error: 'Only teachers can end game sessions'
      }
    }

    return await this.db.updateGameSession(sessionId, {
      state: GAME_STATES.COMPLETED,
      endedAt: Date.now()
    })
  }

  // Question and answer methods
  async moveToNextQuestion(sessionId, questionIndex) {
    if (!this.isTeacher()) {
      return {
        success: false,
        error: 'Only teachers can control questions'
      }
    }

    return await this.db.updateGameSession(sessionId, {
      currentQuestion: questionIndex
    })
  }

  async submitStudentAnswer(sessionId, questionId, answer) {
    if (!this.isStudent()) {
      return {
        success: false,
        error: 'Only students can submit answers'
      }
    }

    const user = this.getCurrentUser()
    return await this.db.submitAnswer(sessionId, user.uid, questionId, answer)
  }

  async updateStudentScore(sessionId, userId, score, increment = 0) {
    return await this.db.updateParticipantScore(sessionId, userId, score, increment)
  }

  // Real-time listeners
  listenToGameSession(sessionId, callback) {
    return this.db.listenToGameSession(sessionId, callback)
  }

  listenToParticipants(sessionId, callback) {
    return this.db.listenToAllParticipants(sessionId, callback)
  }

  listenToMyProgress(sessionId, callback) {
    if (!this.isStudent()) return null
    
    const user = this.getCurrentUser()
    return this.db.listenToParticipant(sessionId, user.uid, callback)
  }

  // Session management
  async getGameSession(sessionId) {
    return await this.db.getGameSession(sessionId)
  }

  async getActiveSessions() {
    if (!this.isTeacher()) {
      return {
        success: false,
        error: 'Only teachers can view active sessions'
      }
    }

    return await this.db.getActiveSessions()
  }

  async leaveSession() {
    if (this.currentSession) {
      this.db.removeAllListeners()
      this.currentSession = null
    }
  }

  // Utility methods
  getCurrentSessionId() {
    return this.currentSession
  }

  getUserRole() {
    return this.userRole
  }

  // Clean up method
  cleanup() {
    this.db.removeAllListeners()
    this.currentSession = null
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService()

// Initialize the service
firebaseService.initialize()