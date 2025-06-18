import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  off,
  serverTimestamp,
  child,
  onDisconnect
} from 'firebase/database'
import { database } from './config'

// Database paths for cooperative learning structure
export const DB_PATHS = {
  COOPERATIVE_SESSIONS: 'cooperativeSessions',
  AVAILABLE_CAPTAINS: 'availableCaptains',
  GAME_TEMPLATES: 'gameTemplates',
  USERS: 'users',
  USER_PROGRESS: 'userProgress',
  COMMUNICATION: 'communication'
}

// Session states
export const SESSION_STATES = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
}

// Game types
export const GAME_TYPES = {
  SOUND_RADAR: 'soundRadar',
  GRAMMAR_CONSTRUCTION: 'grammarConstruction',
  PHONEME_HUNTER: 'phonemeHunter',
  WORD_BUILDER: 'wordBuilder'
}

// User connection status
export const CONNECTION_STATUS = {
  ONLINE: 'connected',
  OFFLINE: 'disconnected',
  AWAY: 'away'
}

// Database service for cooperative learning games
export class DatabaseService {
  constructor() {
    this.listeners = new Map()
    this.presenceRefs = new Map()
  }

  // Create a new cooperative session
  async createCooperativeSession(captainData, gameConfig) {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}`)
      
      const sessionData = {
        sessionId: sessionId,
        status: SESSION_STATES.WAITING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        captain: {
          uid: captainData.uid,
          displayName: captainData.displayName,
          status: CONNECTION_STATUS.ONLINE
        },
        coPilot: null, // Will be set when student joins
        currentGame: {
          type: gameConfig.type || GAME_TYPES.SOUND_RADAR,
          difficulty: gameConfig.difficulty || 'beginner',
          progress: {
            currentPhase: 0,
            totalPhases: gameConfig.totalPhases || 5,
            score: 0,
            captainScore: 0,
            coPilotScore: 0
          }
        },
        gameData: gameConfig.gameData || {},
        communication: {
          emergencyCall: {
            active: false,
            timestamp: null,
            resolved: false
          },
          messages: []
        },
        settings: {
          maxDuration: gameConfig.maxDuration || 30, // minutes
          allowHints: gameConfig.allowHints !== false,
          difficulty: gameConfig.difficulty || 'beginner',
          ...gameConfig.settings
        }
      }

      await set(sessionRef, sessionData)
      
      // Set up presence for captain
      await this.setupPresence(sessionId, captainData.uid, 'captain')
      
      return {
        success: true,
        sessionId: sessionId,
        sessionData: sessionData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Join cooperative session as Co-Pilot
  async joinCooperativeSession(sessionId, coPilotData) {
    try {
      const sessionRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}`)
      const snapshot = await get(sessionRef)
      
      if (!snapshot.exists()) {
        return {
          success: false,
          error: 'Session not found'
        }
      }

      const sessionData = snapshot.val()
      
      // Check if session is available
      if (sessionData.coPilot !== null) {
        return {
          success: false,
          error: 'Session already has a Co-Pilot'
        }
      }

      if (sessionData.status !== SESSION_STATES.WAITING) {
        return {
          success: false,
          error: 'Session is not accepting new participants'
        }
      }

      // Add Co-Pilot to session
      const updates = {
        coPilot: {
          uid: coPilotData.uid,
          displayName: coPilotData.displayName,
          status: CONNECTION_STATUS.ONLINE,
          joinedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      }

      await update(sessionRef, updates)
      
      // Set up presence for co-pilot
      await this.setupPresence(sessionId, coPilotData.uid, 'copilot')
      
      return {
        success: true,
        sessionData: { ...sessionData, ...updates }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Setup presence system for connection tracking
  async setupPresence(sessionId, userId, role) {
    try {
      const presenceRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/${role}/status`)
      const connectedRef = ref(database, '.info/connected')
      
      // When user connects, set them as online
      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
          // Set user as online
          set(presenceRef, CONNECTION_STATUS.ONLINE)
          
          // When user disconnects, set them as offline
          onDisconnect(presenceRef).set(CONNECTION_STATUS.OFFLINE)
        }
      })
      
      // Store reference for cleanup
      this.presenceRefs.set(`${sessionId}_${userId}`, presenceRef)
      
    } catch (error) {
      console.error('Failed to setup presence:', error)
    }
  }

  // Update session status
  async updateSessionStatus(sessionId, status) {
    try {
      const sessionRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}`)
      const updates = {
        status: status,
        updatedAt: serverTimestamp()
      }

      if (status === SESSION_STATES.ACTIVE) {
        updates.startedAt = serverTimestamp()
      } else if (status === SESSION_STATES.COMPLETED) {
        updates.completedAt = serverTimestamp()
      }

      await update(sessionRef, updates)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update game progress
  async updateGameProgress(sessionId, progressData) {
    try {
      const updates = {}
      
      // Update current phase
      if (progressData.currentPhase !== undefined) {
        updates[`currentGame/progress/currentPhase`] = progressData.currentPhase
      }
      
      // Update scores
      if (progressData.captainScore !== undefined) {
        updates[`currentGame/progress/captainScore`] = progressData.captainScore
      }
      
      if (progressData.coPilotScore !== undefined) {
        updates[`currentGame/progress/coPilotScore`] = progressData.coPilotScore
      }
      
      // Update total score
      if (progressData.score !== undefined) {
        updates[`currentGame/progress/score`] = progressData.score
      }
      
      // Update game data
      if (progressData.gameData) {
        Object.keys(progressData.gameData).forEach(key => {
          updates[`gameData/${key}`] = progressData.gameData[key]
        })
      }
      
      updates.updatedAt = serverTimestamp()

      const sessionRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}`)
      await update(sessionRef, updates)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Send emergency call
  async sendEmergencyCall(sessionId, fromRole, message = '') {
    try {
      const emergencyRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/communication/emergencyCall`)
      const emergencyData = {
        active: true,
        timestamp: serverTimestamp(),
        fromRole: fromRole,
        message: message,
        resolved: false
      }

      await set(emergencyRef, emergencyData)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Resolve emergency call
  async resolveEmergencyCall(sessionId) {
    try {
      const emergencyRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/communication/emergencyCall`)
      const updates = {
        active: false,
        resolved: true,
        resolvedAt: serverTimestamp()
      }

      await update(emergencyRef, updates)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Send communication message
  async sendMessage(sessionId, fromRole, message, messageType = 'text') {
    try {
      const messagesRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/communication/messages`)
      const newMessageRef = push(messagesRef)
      
      const messageData = {
        id: newMessageRef.key,
        fromRole: fromRole,
        message: message,
        type: messageType,
        timestamp: serverTimestamp(),
        read: false
      }

      await set(newMessageRef, messageData)
      
      return { success: true, messageId: newMessageRef.key }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Mark message as read
  async markMessageAsRead(sessionId, messageId) {
    try {
      const messageRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/communication/messages/${messageId}/read`)
      await set(messageRef, true)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Join an existing game session
  async joinGameSession(sessionId, userId, userInfo) {
    try {
      const sessionRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}`)
      const participantRef = child(sessionRef, `participants/${userId}`)
      
      const participantData = {
        ...userInfo,
        joinedAt: serverTimestamp(),
        status: 'active',
        score: 0,
        answers: {}
      }

      await set(participantRef, participantData)
      
      return {
        success: true,
        sessionId,
        participantData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get game session data
  async getGameSession(sessionId) {
    try {
      const sessionRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}`)
      const snapshot = await get(sessionRef)
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val()
        }
      } else {
        return {
          success: false,
          error: 'Session not found'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update game session
  async updateGameSession(sessionId, updates) {
    try {
      const sessionRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}`)
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      await update(sessionRef, updateData)
      
      return {
        success: true,
        updates: updateData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Submit answer for a participant
  async submitAnswer(sessionId, userId, questionId, answer) {
    try {
      const answerRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}/participants/${userId}/answers/${questionId}`)
      const answerData = {
        answer,
        submittedAt: serverTimestamp(),
        isCorrect: null // Will be evaluated by game logic
      }

      await set(answerRef, answerData)
      
      return {
        success: true,
        answerData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update participant score
  async updateParticipantScore(sessionId, userId, score, scoreIncrement = 0) {
    try {
      const updates = {}
      updates[`participants/${userId}/score`] = score
      updates[`participants/${userId}/lastUpdate`] = serverTimestamp()
      
      if (scoreIncrement > 0) {
        updates[`participants/${userId}/lastScoreIncrement`] = scoreIncrement
      }

      await this.updateGameSession(sessionId, updates)
      
      return {
        success: true,
        newScore: score
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Listen to game session changes
  listenToGameSession(sessionId, callback) {
    const sessionRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}`)
    const listenerId = `session_${sessionId}`
    
    // Remove existing listener if any
    this.removeListener(listenerId)
    
    // Add new listener
    onValue(sessionRef, callback)
    this.listeners.set(listenerId, { ref: sessionRef, callback })
    
    return listenerId
  }

  // Listen to specific participant changes
  listenToParticipant(sessionId, userId, callback) {
    const participantRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}/participants/${userId}`)
    const listenerId = `participant_${sessionId}_${userId}`
    
    // Remove existing listener if any
    this.removeListener(listenerId)
    
    // Add new listener
    onValue(participantRef, callback)
    this.listeners.set(listenerId, { ref: participantRef, callback })
    
    return listenerId
  }

  // Listen to all participants in a session
  listenToAllParticipants(sessionId, callback) {
    const participantsRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}/participants`)
    const listenerId = `all_participants_${sessionId}`
    
    // Remove existing listener if any
    this.removeListener(listenerId)
    
    // Add new listener
    onValue(participantsRef, callback)
    this.listeners.set(listenerId, { ref: participantsRef, callback })
    
    return listenerId
  }

  // Remove a specific listener
  removeListener(listenerId) {
    const listener = this.listeners.get(listenerId)
    if (listener) {
      off(listener.ref, listener.callback)
      this.listeners.delete(listenerId)
    }
  }

  // Remove all listeners
  removeAllListeners() {
    this.listeners.forEach((listener, listenerId) => {
      off(listener.ref, listener.callback)
    })
    this.listeners.clear()
  }

  // Delete a game session
  async deleteGameSession(sessionId) {
    try {
      const sessionRef = ref(database, `${DB_PATHS.GAMES}/${sessionId}`)
      await remove(sessionRef)
      
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get all active sessions (for teachers)
  async getActiveSessions() {
    try {
      const gamesRef = ref(database, DB_PATHS.GAMES)
      const snapshot = await get(gamesRef)
      
      if (snapshot.exists()) {
        const allGames = snapshot.val()
        const activeSessions = Object.entries(allGames)
          .filter(([, gameData]) => gameData.state === GAME_STATES.ACTIVE || gameData.state === GAME_STATES.WAITING)
          .map(([sessionId, gameData]) => ({ sessionId, ...gameData }))
        
        return {
          success: true,
          sessions: activeSessions
        }
      } else {
        return {
          success: true,
          sessions: []
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Real-time listeners for cooperative sessions
  listenToCooperativeSession(sessionId, callback) {
    const sessionRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}`)
    const listenerId = `cooperative_session_${sessionId}`
    
    // Remove existing listener if any
    this.removeListener(listenerId)
    
    // Add new listener
    onValue(sessionRef, callback)
    this.listeners.set(listenerId, { ref: sessionRef, callback })
    
    return listenerId
  }

  // Listen to emergency calls
  listenToEmergencyCall(sessionId, callback) {
    const emergencyRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/communication/emergencyCall`)
    const listenerId = `emergency_${sessionId}`
    
    this.removeListener(listenerId)
    
    onValue(emergencyRef, callback)
    this.listeners.set(listenerId, { ref: emergencyRef, callback })
    
    return listenerId
  }

  // Listen to communication messages
  listenToMessages(sessionId, callback) {
    const messagesRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/communication/messages`)
    const listenerId = `messages_${sessionId}`
    
    this.removeListener(listenerId)
    
    onValue(messagesRef, callback)
    this.listeners.set(listenerId, { ref: messagesRef, callback })
    
    return listenerId
  }

  // Listen to game progress
  listenToGameProgress(sessionId, callback) {
    const progressRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}/currentGame/progress`)
    const listenerId = `progress_${sessionId}`
    
    this.removeListener(listenerId)
    
    onValue(progressRef, callback)
    this.listeners.set(listenerId, { ref: progressRef, callback })
    
    return listenerId
  }

  // Listen to captain availability
  listenToAvailableCaptains(callback) {
    const captainsRef = ref(database, DB_PATHS.AVAILABLE_CAPTAINS)
    const listenerId = 'available_captains'
    
    this.removeListener(listenerId)
    
    onValue(captainsRef, callback)
    this.listeners.set(listenerId, { ref: captainsRef, callback })
    
    return listenerId
  }

  // Get cooperative session data
  async getCooperativeSession(sessionId) {
    try {
      const sessionRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}`)
      const snapshot = await get(sessionRef)
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val()
        }
      } else {
        return {
          success: false,
          error: 'Session not found'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get available captains
  async getAvailableCaptains() {
    try {
      const captainsRef = ref(database, DB_PATHS.AVAILABLE_CAPTAINS)
      const snapshot = await get(captainsRef)
      
      if (snapshot.exists()) {
        const captains = snapshot.val()
        // Filter only online captains
        const onlineCaptains = Object.values(captains).filter(
          captain => captain.status === CONNECTION_STATUS.ONLINE
        )
        
        return {
          success: true,
          captains: onlineCaptains
        }
      } else {
        return {
          success: true,
          captains: []
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get active sessions for a captain
  async getActiveSessions(captainUid) {
    try {
      const sessionsRef = ref(database, DB_PATHS.COOPERATIVE_SESSIONS)
      const snapshot = await get(sessionsRef)
      
      if (snapshot.exists()) {
        const allSessions = snapshot.val()
        const activeSessions = Object.values(allSessions).filter(session => 
          session.captain?.uid === captainUid && 
          (session.status === SESSION_STATES.WAITING || session.status === SESSION_STATES.ACTIVE)
        )
        
        return {
          success: true,
          sessions: activeSessions
        }
      } else {
        return {
          success: true,
          sessions: []
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Clean up presence when leaving session
  cleanupPresence(sessionId, userId) {
    const presenceKey = `${sessionId}_${userId}`
    const presenceRef = this.presenceRefs.get(presenceKey)
    
    if (presenceRef) {
      // Cancel the onDisconnect
      onDisconnect(presenceRef).cancel()
      this.presenceRefs.delete(presenceKey)
    }
  }

  // Leave cooperative session
  async leaveCooperativeSession(sessionId, userId, role) {
    try {
      const updates = {}
      
      if (role === 'captain') {
        // If captain leaves, end the session
        updates.status = SESSION_STATES.COMPLETED
        updates.endedAt = serverTimestamp()
        updates[`captain/status`] = CONNECTION_STATUS.OFFLINE
      } else if (role === 'copilot') {
        // If co-pilot leaves, remove them from session
        updates.coPilot = null
      }
      
      updates.updatedAt = serverTimestamp()

      const sessionRef = ref(database, `${DB_PATHS.COOPERATIVE_SESSIONS}/${sessionId}`)
      await update(sessionRef, updates)
      
      // Clean up presence
      this.cleanupPresence(sessionId, userId)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()