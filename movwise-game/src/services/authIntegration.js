import Dexie from 'dexie'
import { useProgressStore } from '../stores/progress'
import { authService } from '../firebase/auth'

// Local database schema for user data integration
class MovWiseLocalDB extends Dexie {
  constructor() {
    super('MovWiseLocalDB')
    
    this.version(1).stores({
      users: '++id, email, name, role, createdAt, lastSyncAt',
      userProfiles: '++id, userId, preferences, gameProgress, achievements',
      gameHistory: '++id, userId, gameType, score, date, syncStatus',
      syncQueue: '++id, action, data, timestamp, synced'
    })
  }
}

// Initialize local database
const localDB = new MovWiseLocalDB()

// Integration service for Firebase + Dexie.js
export class AuthIntegrationService {
  constructor() {
    this.progressStore = null
    this.syncInProgress = false
    this.syncQueue = []
  }

  // Initialize the integration service
  async initialize() {
    try {
      await localDB.open()
      this.progressStore = useProgressStore()
      console.log('Auth integration service initialized')
    } catch (error) {
      console.error('Failed to initialize auth integration:', error)
    }
  }

  // Create or update local user profile
  async createLocalUserProfile(userData) {
    try {
      const existingUser = await localDB.users.where('email').equals(userData.email).first()
      
      if (existingUser) {
        // Update existing user
        await localDB.users.update(existingUser.id, {
          name: userData.name || existingUser.name,
          role: userData.role || existingUser.role,
          lastSyncAt: new Date().toISOString()
        })
        return existingUser.id
      } else {
        // Create new user
        const userId = await localDB.users.add({
          email: userData.email,
          name: userData.name || 'ローカルユーザー',
          role: userData.role || 'copilot',
          createdAt: new Date().toISOString(),
          lastSyncAt: new Date().toISOString()
        })
        
        // Create default profile
        await localDB.userProfiles.add({
          userId: userId,
          preferences: userData.preferences || {
            soundEnabled: true,
            difficulty: 'normal',
            theme: 'light'
          },
          gameProgress: userData.gameProgress || {},
          achievements: userData.achievements || []
        })
        
        return userId
      }
    } catch (error) {
      console.error('Failed to create local user profile:', error)
      throw error
    }
  }

  // Get local user profile
  async getLocalUserProfile(userId) {
    try {
      const user = await localDB.users.get(userId)
      const profile = await localDB.userProfiles.where('userId').equals(userId).first()
      
      return {
        user: user,
        profile: profile
      }
    } catch (error) {
      console.error('Failed to get local user profile:', error)
      return null
    }
  }

  // Sync local progress with Firebase
  async syncProgressWithFirebase(firebaseUser) {
    if (this.syncInProgress) {
      console.log('Sync already in progress')
      return { success: false, message: 'Sync already in progress' }
    }

    this.syncInProgress = true

    try {
      // Get local user data
      const localUser = await localDB.users.where('email').equals(firebaseUser.email).first()
      
      if (!localUser) {
        console.log('No local user found for sync')
        return { success: true, message: 'No local data to sync' }
      }

      // Get local progress data
      const localProfile = await localDB.userProfiles.where('userId').equals(localUser.id).first()
      const localGameHistory = await localDB.gameHistory.where('userId').equals(localUser.id).toArray()

      // Prepare sync data
      const syncData = {
        userProfile: localProfile,
        gameHistory: localGameHistory,
        progressData: this.progressStore.getStatistics(),
        lastSyncAt: new Date().toISOString()
      }

      // Add to sync queue
      await this.addToSyncQueue('SYNC_PROGRESS', syncData)

      // Process sync queue (in a real implementation, this would sync with Firebase)
      await this.processSyncQueue()

      // Update local sync timestamp
      await localDB.users.update(localUser.id, {
        lastSyncAt: new Date().toISOString()
      })

      return { 
        success: true, 
        message: 'Progress synced successfully',
        syncedItems: localGameHistory.length
      }

    } catch (error) {
      console.error('Failed to sync progress with Firebase:', error)
      return { 
        success: false, 
        error: error.message 
      }
    } finally {
      this.syncInProgress = false
    }
  }

  // Sync Firebase data to local storage
  async syncFirebaseToLocal(firebaseUser, firebaseData) {
    try {
      // Create or update local user
      const userId = await this.createLocalUserProfile({
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        role: authService.getUserRole()
      })

      // Update local profile with Firebase data
      if (firebaseData.profile) {
        await localDB.userProfiles.where('userId').equals(userId).modify(firebaseData.profile)
      }

      // Sync game history
      if (firebaseData.gameHistory && firebaseData.gameHistory.length > 0) {
        for (const gameRecord of firebaseData.gameHistory) {
          await localDB.gameHistory.add({
            userId: userId,
            ...gameRecord,
            syncStatus: 'synced'
          })
        }
      }

      return { success: true, message: 'Firebase data synced to local' }

    } catch (error) {
      console.error('Failed to sync Firebase data to local:', error)
      return { success: false, error: error.message }
    }
  }

  // Add action to sync queue
  async addToSyncQueue(action, data) {
    try {
      await localDB.syncQueue.add({
        action: action,
        data: data,
        timestamp: new Date().toISOString(),
        synced: false
      })
    } catch (error) {
      console.error('Failed to add to sync queue:', error)
    }
  }

  // Process sync queue
  async processSyncQueue() {
    try {
      const queueItems = await localDB.syncQueue.where('synced').equals(false).toArray()
      
      for (const item of queueItems) {
        try {
          // In a real implementation, this would send data to Firebase
          console.log(`Processing sync item: ${item.action}`, item.data)
          
          // Mark as synced
          await localDB.syncQueue.update(item.id, { synced: true })
          
        } catch (error) {
          console.error(`Failed to process sync item ${item.id}:`, error)
        }
      }

      return { success: true, processedItems: queueItems.length }

    } catch (error) {
      console.error('Failed to process sync queue:', error)
      return { success: false, error: error.message }
    }
  }

  // Record game data locally
  async recordGameLocally(gameData, userId) {
    try {
      await localDB.gameHistory.add({
        userId: userId,
        gameType: gameData.gameType,
        score: gameData.score,
        accuracy: gameData.accuracy,
        timeSpent: gameData.timeSpent,
        level: gameData.level,
        date: new Date().toISOString(),
        syncStatus: 'pending'
      })

      // Add to sync queue if user is online
      if (authService.isAuthenticated()) {
        await this.addToSyncQueue('RECORD_GAME', gameData)
      }

      return { success: true }

    } catch (error) {
      console.error('Failed to record game locally:', error)
      return { success: false, error: error.message }
    }
  }

  // Get local game history
  async getLocalGameHistory(userId, limit = 50) {
    try {
      const history = await localDB.gameHistory
        .where('userId')
        .equals(userId)
        .orderBy('date')
        .reverse()
        .limit(limit)
        .toArray()

      return { success: true, data: history }

    } catch (error) {
      console.error('Failed to get local game history:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user preferences locally
  async updatePreferencesLocally(userId, preferences) {
    try {
      await localDB.userProfiles.where('userId').equals(userId).modify({
        preferences: preferences
      })

      // Add to sync queue
      await this.addToSyncQueue('UPDATE_PREFERENCES', { userId, preferences })

      return { success: true }

    } catch (error) {
      console.error('Failed to update preferences locally:', error)
      return { success: false, error: error.message }
    }
  }

  // Clean up old local data
  async cleanupOldData(daysToKeep = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      const cutoffISO = cutoffDate.toISOString()

      // Clean up old game history
      await localDB.gameHistory.where('date').below(cutoffISO).delete()

      // Clean up old sync queue items
      await localDB.syncQueue.where('timestamp').below(cutoffISO).and(item => item.synced).delete()

      return { success: true, message: `Cleaned up data older than ${daysToKeep} days` }

    } catch (error) {
      console.error('Failed to cleanup old data:', error)
      return { success: false, error: error.message }
    }
  }

  // Export local data
  async exportLocalData(userId) {
    try {
      const userData = await this.getLocalUserProfile(userId)
      const gameHistory = await this.getLocalGameHistory(userId, 1000)
      
      const exportData = {
        user: userData.user,
        profile: userData.profile,
        gameHistory: gameHistory.data,
        exportedAt: new Date().toISOString()
      }

      return { success: true, data: exportData }

    } catch (error) {
      console.error('Failed to export local data:', error)
      return { success: false, error: error.message }
    }
  }

  // Import data from export
  async importLocalData(importData, overwrite = false) {
    try {
      if (overwrite) {
        // Clear existing data
        await localDB.users.clear()
        await localDB.userProfiles.clear()
        await localDB.gameHistory.clear()
      }

      // Import user data
      if (importData.user) {
        await localDB.users.add(importData.user)
      }

      // Import profile data
      if (importData.profile) {
        await localDB.userProfiles.add(importData.profile)
      }

      // Import game history
      if (importData.gameHistory && importData.gameHistory.length > 0) {
        await localDB.gameHistory.bulkAdd(importData.gameHistory)
      }

      return { 
        success: true, 
        message: 'Data imported successfully',
        importedGames: importData.gameHistory?.length || 0
      }

    } catch (error) {
      console.error('Failed to import local data:', error)
      return { success: false, error: error.message }
    }
  }

  // Get sync status
  async getSyncStatus() {
    try {
      const pendingItems = await localDB.syncQueue.where('synced').equals(false).count()
      const lastSyncItems = await localDB.users.orderBy('lastSyncAt').reverse().limit(1).toArray()
      
      return {
        pendingItems: pendingItems,
        lastSyncAt: lastSyncItems.length > 0 ? lastSyncItems[0].lastSyncAt : null,
        isOnline: authService.isAuthenticated(),
        syncInProgress: this.syncInProgress
      }

    } catch (error) {
      console.error('Failed to get sync status:', error)
      return {
        pendingItems: 0,
        lastSyncAt: null,
        isOnline: false,
        syncInProgress: false
      }
    }
  }
}

// Export singleton instance
export const authIntegration = new AuthIntegrationService()

// Initialize on import
authIntegration.initialize()