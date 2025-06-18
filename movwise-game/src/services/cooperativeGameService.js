import { databaseService, SESSION_STATES, GAME_TYPES, CONNECTION_STATUS } from '../firebase/database'
import { authService, USER_ROLES } from '../firebase/auth'
import { accessControl } from './accessControl'

// Cooperative game service that orchestrates all game functionality
export class CooperativeGameService {
  constructor() {
    this.currentSessionId = null
    this.currentRole = null
    this.listeners = []
    this.connectionStatus = CONNECTION_STATUS.OFFLINE
    this.gameState = {
      session: null,
      progress: null,
      emergency: null,
      messages: []
    }
  }

  // Initialize the service
  async initialize() {
    try {
      // Set up access control with user role
      const userRole = authService.getUserRole()
      if (userRole) {
        accessControl.setUserRole(userRole)
        this.currentRole = userRole
      }

      // Listen for auth state changes
      authService.onAuthStateChange((user, claims) => {
        if (user) {
          const role = authService.getUserRole()
          accessControl.setUserRole(role)
          this.currentRole = role
          this.connectionStatus = CONNECTION_STATUS.ONLINE
        } else {
          this.cleanup()
          this.connectionStatus = CONNECTION_STATUS.OFFLINE
        }
      })

      console.log('Cooperative game service initialized')
    } catch (error) {
      console.error('Failed to initialize cooperative game service:', error)
    }
  }

  // Captain (Teacher) methods
  async createSession(gameConfig) {
    if (!accessControl.canCreateSession()) {
      return {
        success: false,
        error: 'セッションを作成する権限がありません'
      }
    }

    try {
      const user = authService.getCurrentUser()
      const captainData = {
        uid: user.uid,
        displayName: user.displayName || user.email
      }

      const result = await databaseService.createCooperativeSession(captainData, gameConfig)
      
      if (result.success) {
        this.currentSessionId = result.sessionId
        await this.startListening(result.sessionId)
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async startSession() {
    if (!this.currentSessionId || !accessControl.canControlGame()) {
      return {
        success: false,
        error: 'セッションを開始する権限がありません'
      }
    }

    try {
      return await databaseService.updateSessionStatus(this.currentSessionId, SESSION_STATES.ACTIVE)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async pauseSession() {
    if (!this.currentSessionId || !accessControl.canControlGame()) {
      return {
        success: false,
        error: 'セッションを一時停止する権限がありません'
      }
    }

    try {
      return await databaseService.updateSessionStatus(this.currentSessionId, SESSION_STATES.PAUSED)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async endSession() {
    if (!this.currentSessionId || !accessControl.canControlGame()) {
      return {
        success: false,
        error: 'セッションを終了する権限がありません'
      }
    }

    try {
      const result = await databaseService.updateSessionStatus(this.currentSessionId, SESSION_STATES.COMPLETED)
      
      if (result.success) {
        await this.cleanup()
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Co-Pilot (Student) methods
  async joinSession(sessionId) {
    if (!accessControl.canJoinSession()) {
      return {
        success: false,
        error: 'セッションに参加する権限がありません'
      }
    }

    try {
      const user = authService.getCurrentUser()
      const coPilotData = {
        uid: user.uid,
        displayName: user.displayName || user.email
      }

      const result = await databaseService.joinCooperativeSession(sessionId, coPilotData)
      
      if (result.success) {
        this.currentSessionId = sessionId
        await this.startListening(sessionId)
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async sendEmergencyCall(message = '') {
    if (!this.currentSessionId || !accessControl.canSendEmergencyCall()) {
      return {
        success: false,
        error: '緊急コールを送信する権限がありません'
      }
    }

    try {
      return await databaseService.sendEmergencyCall(
        this.currentSessionId,
        this.currentRole,
        message
      )
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async resolveEmergencyCall() {
    if (!this.currentSessionId || !accessControl.isCaptain()) {
      return {
        success: false,
        error: '緊急コールを解決する権限がありません'
      }
    }

    try {
      return await databaseService.resolveEmergencyCall(this.currentSessionId)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Game progress methods
  async updateProgress(progressData) {
    if (!this.currentSessionId) {
      return {
        success: false,
        error: 'アクティブなセッションがありません'
      }
    }

    try {
      return await databaseService.updateGameProgress(this.currentSessionId, progressData)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async nextPhase() {
    if (!this.currentSessionId || !accessControl.canControlGame()) {
      return {
        success: false,
        error: '次のフェーズに進む権限がありません'
      }
    }

    try {
      const currentPhase = this.gameState.progress?.currentPhase || 0
      return await this.updateProgress({
        currentPhase: currentPhase + 1
      })
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async updateScore(role, score) {
    if (!this.currentSessionId) {
      return {
        success: false,
        error: 'アクティブなセッションがありません'
      }
    }

    try {
      const progressData = {}
      
      if (role === 'captain') {
        progressData.captainScore = score
      } else if (role === 'copilot') {
        progressData.coPilotScore = score
      }

      // Calculate total score
      const currentProgress = this.gameState.progress || {}
      const captainScore = role === 'captain' ? score : (currentProgress.captainScore || 0)
      const coPilotScore = role === 'copilot' ? score : (currentProgress.coPilotScore || 0)
      progressData.score = captainScore + coPilotScore

      return await this.updateProgress(progressData)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Communication methods
  async sendMessage(message, messageType = 'text') {
    if (!this.currentSessionId) {
      return {
        success: false,
        error: 'アクティブなセッションがありません'
      }
    }

    try {
      return await databaseService.sendMessage(
        this.currentSessionId,
        this.currentRole,
        message,
        messageType
      )
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async markMessageAsRead(messageId) {
    if (!this.currentSessionId) {
      return {
        success: false,
        error: 'アクティブなセッションがありません'
      }
    }

    try {
      return await databaseService.markMessageAsRead(this.currentSessionId, messageId)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Real-time listening
  async startListening(sessionId) {
    try {
      // Listen to session changes
      const sessionListener = databaseService.listenToCooperativeSession(sessionId, (snapshot) => {
        if (snapshot.exists()) {
          this.gameState.session = snapshot.val()
          this.onSessionUpdate(snapshot.val())
        }
      })
      this.listeners.push(sessionListener)

      // Listen to game progress
      const progressListener = databaseService.listenToGameProgress(sessionId, (snapshot) => {
        if (snapshot.exists()) {
          this.gameState.progress = snapshot.val()
          this.onProgressUpdate(snapshot.val())
        }
      })
      this.listeners.push(progressListener)

      // Listen to emergency calls
      const emergencyListener = databaseService.listenToEmergencyCall(sessionId, (snapshot) => {
        if (snapshot.exists()) {
          this.gameState.emergency = snapshot.val()
          this.onEmergencyUpdate(snapshot.val())
        }
      })
      this.listeners.push(emergencyListener)

      // Listen to messages
      const messageListener = databaseService.listenToMessages(sessionId, (snapshot) => {
        if (snapshot.exists()) {
          this.gameState.messages = Object.values(snapshot.val())
          this.onMessagesUpdate(this.gameState.messages)
        }
      })
      this.listeners.push(messageListener)

    } catch (error) {
      console.error('Failed to start listening:', error)
    }
  }

  // Event handlers (to be overridden by implementing classes)
  onSessionUpdate(sessionData) {
    // Override in implementing class
    console.log('Session updated:', sessionData)
  }

  onProgressUpdate(progressData) {
    // Override in implementing class
    console.log('Progress updated:', progressData)
  }

  onEmergencyUpdate(emergencyData) {
    // Override in implementing class
    console.log('Emergency updated:', emergencyData)
  }

  onMessagesUpdate(messages) {
    // Override in implementing class
    console.log('Messages updated:', messages)
  }

  // Utility methods
  async getAvailableCaptains() {
    try {
      return await databaseService.getAvailableCaptains()
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getSessionData(sessionId = null) {
    const targetSessionId = sessionId || this.currentSessionId
    
    if (!targetSessionId) {
      return {
        success: false,
        error: 'セッションIDが指定されていません'
      }
    }

    try {
      return await databaseService.getCooperativeSession(targetSessionId)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getActiveSessions() {
    if (!accessControl.canAccessTeacherDashboard()) {
      return {
        success: false,
        error: 'アクティブセッションを表示する権限がありません'
      }
    }

    try {
      const user = authService.getCurrentUser()
      return await databaseService.getActiveSessions(user.uid)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Session management
  async leaveSession() {
    if (!this.currentSessionId) {
      return { success: true } // Already not in a session
    }

    try {
      const user = authService.getCurrentUser()
      const result = await databaseService.leaveCooperativeSession(
        this.currentSessionId,
        user.uid,
        this.currentRole
      )

      if (result.success) {
        await this.cleanup()
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Cleanup
  async cleanup() {
    // Remove all listeners
    this.listeners.forEach(listenerId => {
      databaseService.removeListener(listenerId)
    })
    this.listeners = []

    // Reset state
    this.currentSessionId = null
    this.gameState = {
      session: null,
      progress: null,
      emergency: null,
      messages: []
    }
  }

  // Getters
  getCurrentSessionId() {
    return this.currentSessionId
  }

  getCurrentRole() {
    return this.currentRole
  }

  getGameState() {
    return { ...this.gameState }
  }

  getConnectionStatus() {
    return this.connectionStatus
  }

  isInSession() {
    return !!this.currentSessionId
  }

  isCaptain() {
    return this.currentRole === USER_ROLES.CAPTAIN
  }

  isCoPilot() {
    return this.currentRole === USER_ROLES.COPILOT
  }
}

// Export singleton instance
export const cooperativeGameService = new CooperativeGameService()

// Initialize the service
cooperativeGameService.initialize()