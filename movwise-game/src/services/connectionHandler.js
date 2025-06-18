import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database'
import { database } from '../firebase/config'
import { authService } from '../firebase/auth'
import { CONNECTION_STATUS } from '../firebase/database'

// Connection handling service for managing online/offline states
export class ConnectionHandler {
  constructor() {
    this.isOnline = navigator.onLine
    this.connectionCallbacks = []
    this.presenceRefs = new Map()
    this.heartbeatInterval = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000 // Start with 1 second
    this.isInitialized = false
  }

  // Initialize connection handling
  initialize() {
    if (this.isInitialized) return

    this.setupNetworkListeners()
    this.setupFirebasePresence()
    this.startHeartbeat()
    
    this.isInitialized = true
    console.log('Connection handler initialized')
  }

  // Set up network connectivity listeners
  setupNetworkListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Network connection restored')
      this.isOnline = true
      this.onConnectionChange(true)
      this.reconnectFirebase()
    })

    window.addEventListener('offline', () => {
      console.log('Network connection lost')
      this.isOnline = false
      this.onConnectionChange(false)
    })

    // Listen for visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setUserStatus(CONNECTION_STATUS.AWAY)
      } else {
        this.setUserStatus(CONNECTION_STATUS.ONLINE)
      }
    })

    // Listen for beforeunload (page closing)
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })
  }

  // Set up Firebase presence system
  setupFirebasePresence() {
    const connectedRef = ref(database, '.info/connected')
    
    onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val()
      
      if (isConnected && authService.isAuthenticated()) {
        console.log('Connected to Firebase')
        this.onFirebaseConnected()
        this.reconnectAttempts = 0
      } else {
        console.log('Disconnected from Firebase')
        this.onFirebaseDisconnected()
      }
    })
  }

  // Handle Firebase connection
  async onFirebaseConnected() {
    try {
      const user = authService.getCurrentUser()
      if (!user) return

      // Set user as online
      await this.setUserStatus(CONNECTION_STATUS.ONLINE)
      
      // Set up automatic offline status on disconnect
      this.setupDisconnectHandlers()
      
      // Notify callbacks
      this.notifyCallbacks({
        type: 'firebase_connected',
        isOnline: true,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error handling Firebase connection:', error)
    }
  }

  // Handle Firebase disconnection
  onFirebaseDisconnected() {
    this.notifyCallbacks({
      type: 'firebase_disconnected',
      isOnline: false,
      timestamp: new Date().toISOString()
    })

    // Attempt to reconnect if network is available
    if (this.isOnline && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  // Set up disconnect handlers
  setupDisconnectHandlers() {
    const user = authService.getCurrentUser()
    if (!user) return

    // Set user offline when disconnecting
    const userStatusRef = ref(database, `users/${user.uid}/status`)
    onDisconnect(userStatusRef).set(CONNECTION_STATUS.OFFLINE)

    const lastActiveRef = ref(database, `users/${user.uid}/lastActive`)
    onDisconnect(lastActiveRef).set(serverTimestamp())

    // If user is captain, update captain availability
    if (authService.isCaptain()) {
      const captainRef = ref(database, `availableCaptains/${user.uid}/status`)
      onDisconnect(captainRef).set(CONNECTION_STATUS.OFFLINE)
    }
  }

  // Set user status
  async setUserStatus(status) {
    try {
      const user = authService.getCurrentUser()
      if (!user) return

      const userStatusRef = ref(database, `users/${user.uid}/status`)
      const lastActiveRef = ref(database, `users/${user.uid}/lastActive`)
      
      await set(userStatusRef, status)
      await set(lastActiveRef, serverTimestamp())

      // Update captain availability if applicable
      if (authService.isCaptain()) {
        const captainStatusRef = ref(database, `availableCaptains/${user.uid}/status`)
        await set(captainStatusRef, status)
      }

      console.log(`User status updated to: ${status}`)

    } catch (error) {
      console.error('Error setting user status:', error)
    }
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000) // Max 30 seconds

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      this.reconnectFirebase()
    }, delay)
  }

  // Attempt to reconnect to Firebase
  async reconnectFirebase() {
    if (!this.isOnline) {
      console.log('Network is offline, skipping Firebase reconnect')
      return
    }

    try {
      // Test Firebase connection by reading a small piece of data
      const testRef = ref(database, '.info/connected')
      const snapshot = await new Promise((resolve, reject) => {
        const unsubscribe = onValue(testRef, resolve, reject)
        setTimeout(() => {
          unsubscribe()
          reject(new Error('Connection test timeout'))
        }, 5000)
      })

      if (snapshot.val()) {
        console.log('Firebase reconnection successful')
        this.reconnectAttempts = 0
      } else {
        throw new Error('Firebase connection test failed')
      }

    } catch (error) {
      console.error('Firebase reconnection failed:', error)
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      } else {
        console.error('Max reconnection attempts reached')
        this.notifyCallbacks({
          type: 'reconnect_failed',
          error: 'Maximum reconnection attempts exceeded'
        })
      }
    }
  }

  // Start heartbeat to maintain presence
  startHeartbeat() {
    if (this.heartbeatInterval) return

    this.heartbeatInterval = setInterval(async () => {
      if (authService.isAuthenticated() && this.isOnline) {
        try {
          await this.setUserStatus(CONNECTION_STATUS.ONLINE)
        } catch (error) {
          console.error('Heartbeat failed:', error)
        }
      }
    }, 30000) // Every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Network connectivity change handler
  onConnectionChange(isOnline) {
    this.notifyCallbacks({
      type: 'network_change',
      isOnline: isOnline,
      timestamp: new Date().toISOString()
    })

    if (isOnline) {
      // Network restored, attempt to reconnect
      this.reconnectFirebase()
    }
  }

  // Add connection status callback
  onConnectionStatusChange(callback) {
    this.connectionCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback)
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1)
      }
    }
  }

  // Notify all callbacks
  notifyCallbacks(event) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in connection callback:', error)
      }
    })
  }

  // Get current connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      isFirebaseConnected: authService.isAuthenticated(),
      reconnectAttempts: this.reconnectAttempts,
      timestamp: new Date().toISOString()
    }
  }

  // Check if currently connected
  isConnected() {
    return this.isOnline && authService.isAuthenticated()
  }

  // Force reconnection
  async forceReconnect() {
    console.log('Forcing reconnection...')
    this.reconnectAttempts = 0
    await this.reconnectFirebase()
  }

  // Set presence for specific session
  async setSessionPresence(sessionId, role) {
    try {
      const user = authService.getCurrentUser()
      if (!user) return

      const presenceRef = ref(database, `cooperativeSessions/${sessionId}/${role}/status`)
      await set(presenceRef, CONNECTION_STATUS.ONLINE)

      // Set up disconnect handler for this session
      onDisconnect(presenceRef).set(CONNECTION_STATUS.OFFLINE)
      
      // Store reference for cleanup
      this.presenceRefs.set(`${sessionId}_${role}`, presenceRef)

    } catch (error) {
      console.error('Error setting session presence:', error)
    }
  }

  // Clear session presence
  async clearSessionPresence(sessionId, role) {
    try {
      const presenceKey = `${sessionId}_${role}`
      const presenceRef = this.presenceRefs.get(presenceKey)
      
      if (presenceRef) {
        await set(presenceRef, CONNECTION_STATUS.OFFLINE)
        onDisconnect(presenceRef).cancel()
        this.presenceRefs.delete(presenceKey)
      }

    } catch (error) {
      console.error('Error clearing session presence:', error)
    }
  }

  // Cleanup all connections and listeners
  async cleanup() {
    console.log('Cleaning up connection handler...')

    // Stop heartbeat
    this.stopHeartbeat()

    // Set user offline
    if (authService.isAuthenticated()) {
      await this.setUserStatus(CONNECTION_STATUS.OFFLINE)
    }

    // Clear all session presence
    for (const [presenceKey, presenceRef] of this.presenceRefs) {
      try {
        await set(presenceRef, CONNECTION_STATUS.OFFLINE)
        onDisconnect(presenceRef).cancel()
      } catch (error) {
        console.error('Error cleaning up presence:', error)
      }
    }
    this.presenceRefs.clear()

    // Clear callbacks
    this.connectionCallbacks = []
  }
}

// Export singleton instance
export const connectionHandler = new ConnectionHandler()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  connectionHandler.initialize()
}