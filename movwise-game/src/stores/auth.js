import { defineStore } from 'pinia'
import { authService, USER_ROLES, USER_TYPES } from '../firebase/auth'
import { useProgressStore } from './progress'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Local authentication (existing Dexie.js based)
    localUser: null,
    localUserProfile: null,
    
    // Firebase authentication (new cooperative learning)
    firebaseUser: null,
    firebaseUserProfile: null,
    userClaims: null,
    
    // Current authentication mode
    isOnlineMode: false,
    authMode: 'local', // 'local' | 'firebase' | 'hybrid'
    
    // User role and permissions
    userRole: null, // 'captain' | 'copilot'
    permissions: [],
    
    // Authentication state
    isAuthenticated: false,
    isLoading: false,
    error: null,
    
    // Connection status
    connectionStatus: 'offline', // 'online' | 'offline' | 'connecting'
    lastSyncTime: null,
    
    // Session information
    currentSchoolId: null,
    sessionToken: null
  }),

  getters: {
    // Role checks
    isCaptain: (state) => state.userRole === USER_ROLES.CAPTAIN,
    isCoPilot: (state) => state.userRole === USER_ROLES.COPILOT,
    
    // Legacy compatibility
    isTeacher: (state) => state.userRole === USER_ROLES.CAPTAIN,
    isStudent: (state) => state.userRole === USER_ROLES.COPILOT,
    
    // Current user info
    currentUser: (state) => {
      if (state.isOnlineMode && state.firebaseUser) {
        return {
          uid: state.firebaseUser.uid,
          email: state.firebaseUser.email,
          displayName: state.firebaseUser.displayName,
          role: state.userRole,
          profile: state.firebaseUserProfile,
          isOnline: true
        }
      } else if (state.localUser) {
        return {
          uid: state.localUser.id || 'local_user',
          email: state.localUser.email || 'local@movwise.app',
          displayName: state.localUser.name || 'ローカルユーザー',
          role: state.userRole,
          profile: state.localUserProfile,
          isOnline: false
        }
      }
      return null
    },
    
    // User display name
    displayName: (state) => {
      if (state.isOnlineMode && state.firebaseUser) {
        return state.firebaseUser.displayName || state.firebaseUser.email
      } else if (state.localUser) {
        return state.localUser.name || 'ローカルユーザー'
      }
      return '未認証'
    },
    
    // Permission checks
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },
    
    // Can access cooperative features
    canAccessCooperativeFeatures: (state) => {
      return state.isOnlineMode && state.firebaseUser && state.connectionStatus === 'online'
    },
    
    // Authentication status
    isFullyAuthenticated: (state) => {
      return state.isAuthenticated && (state.firebaseUser || state.localUser)
    }
  },

  actions: {
    // Initialize authentication
    async initialize() {
      this.isLoading = true
      this.error = null

      try {
        // Load local user data
        await this.loadLocalUser()
        
        // Set up Firebase auth state listener
        authService.onAuthStateChange(async (user, claims) => {
          await this.handleFirebaseAuthChange(user, claims)
        })
        
        // Check if user prefers online mode
        const savedMode = localStorage.getItem('movwise-auth-mode')
        if (savedMode === 'firebase' && authService.isAuthenticated()) {
          await this.switchToOnlineMode()
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Auth initialization failed:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Firebase authentication methods
    async signInWithFirebase(email, password) {
      this.isLoading = true
      this.error = null
      
      try {
        const result = await authService.signIn(email, password)
        
        if (result.success) {
          await this.switchToOnlineMode()
          await authService.updateUserStatus('online')
          this.connectionStatus = 'online'
          
          return { success: true }
        } else {
          this.error = result.error
          return result
        }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async signUpWithFirebase(email, password, displayName, role = USER_ROLES.COPILOT, schoolId = null) {
      this.isLoading = true
      this.error = null
      
      try {
        const result = await authService.signUp(email, password, displayName, role, schoolId)
        
        if (result.success) {
          await this.switchToOnlineMode()
          await authService.updateUserStatus('online')
          this.connectionStatus = 'online'
          this.currentSchoolId = schoolId
          
          return { success: true, user: result.user }
        } else {
          this.error = result.error
          return result
        }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    // Local authentication methods
    async signInLocal(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        // Simulate local authentication
        this.localUser = {
          id: userData.id || 'local_' + Date.now(),
          name: userData.name || 'ローカルユーザー',
          email: userData.email || 'local@movwise.app',
          createdAt: new Date().toISOString()
        }
        
        this.localUserProfile = {
          preferences: userData.preferences || {},
          gameProgress: userData.gameProgress || {},
          lastActiveDate: new Date().toISOString()
        }
        
        this.userRole = userData.role || USER_ROLES.COPILOT
        this.isAuthenticated = true
        this.authMode = 'local'
        this.isOnlineMode = false
        
        // Save to localStorage
        this.saveLocalUser()
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    // Sign out
    async signOut() {
      this.isLoading = true
      
      try {
        // Sign out from Firebase if online
        if (this.isOnlineMode && this.firebaseUser) {
          await authService.updateUserStatus('offline')
          await authService.signOutUser()
        }
        
        // Clear all auth state
        this.resetAuthState()
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    // Switch authentication modes
    async switchToOnlineMode() {
      if (!authService.isAuthenticated()) {
        throw new Error('Firebase authentication required for online mode')
      }
      
      this.isOnlineMode = true
      this.authMode = 'firebase'
      this.firebaseUser = authService.getCurrentUser()
      this.userClaims = authService.getUserClaims()
      this.userRole = authService.getUserRole()
      this.isAuthenticated = true
      this.connectionStatus = 'online'
      
      // Set permissions based on role
      this.setRolePermissions()
      
      // Save preference
      localStorage.setItem('movwise-auth-mode', 'firebase')
      
      // Sync with local progress if needed
      await this.syncWithLocalProgress()
    },

    async switchToLocalMode() {
      // Update Firebase status to offline if connected
      if (this.isOnlineMode && this.firebaseUser) {
        await authService.updateUserStatus('offline')
      }
      
      this.isOnlineMode = false
      this.authMode = 'local'
      this.connectionStatus = 'offline'
      
      // Keep local user if available
      if (!this.localUser) {
        await this.loadLocalUser()
      }
      
      // Save preference
      localStorage.setItem('movwise-auth-mode', 'local')
    },

    // Firebase auth state change handler
    async handleFirebaseAuthChange(user, claims) {
      this.firebaseUser = user
      this.userClaims = claims
      
      if (user) {
        this.userRole = authService.getUserRole()
        this.setRolePermissions()
        
        // Load user profile from database if needed
        // This would typically involve fetching from Realtime Database
        
        if (this.isOnlineMode) {
          this.isAuthenticated = true
          this.connectionStatus = 'online'
        }
      } else {
        if (this.isOnlineMode) {
          // Firebase user signed out, switch to local mode if possible
          if (this.localUser) {
            await this.switchToLocalMode()
          } else {
            this.resetAuthState()
          }
        }
      }
    },

    // Set role-based permissions
    setRolePermissions() {
      this.permissions = []
      
      if (this.userRole === USER_ROLES.CAPTAIN) {
        this.permissions = [
          'create_session',
          'manage_session',
          'view_all_participants',
          'control_game_flow',
          'access_teacher_dashboard',
          'view_analytics'
        ]
      } else if (this.userRole === USER_ROLES.COPILOT) {
        this.permissions = [
          'join_session',
          'submit_answers',
          'view_own_progress',
          'send_emergency_call'
        ]
      }
    },

    // Local user management
    async loadLocalUser() {
      try {
        const savedUser = localStorage.getItem('movwise-local-user')
        const savedProfile = localStorage.getItem('movwise-local-profile')
        
        if (savedUser) {
          this.localUser = JSON.parse(savedUser)
          this.localUserProfile = savedProfile ? JSON.parse(savedProfile) : null
          
          if (!this.isOnlineMode) {
            this.isAuthenticated = true
            this.authMode = 'local'
            this.userRole = this.localUser.role || USER_ROLES.COPILOT
            this.setRolePermissions()
          }
        }
      } catch (error) {
        console.error('Failed to load local user:', error)
      }
    },

    saveLocalUser() {
      try {
        if (this.localUser) {
          localStorage.setItem('movwise-local-user', JSON.stringify(this.localUser))
        }
        if (this.localUserProfile) {
          localStorage.setItem('movwise-local-profile', JSON.stringify(this.localUserProfile))
        }
      } catch (error) {
        console.error('Failed to save local user:', error)
      }
    },

    // Sync local progress with Firebase
    async syncWithLocalProgress() {
      if (!this.canAccessCooperativeFeatures) return
      
      try {
        const progressStore = useProgressStore()
        
        // This would sync local progress data with Firebase
        // Implementation depends on your sync strategy
        
        this.lastSyncTime = new Date().toISOString()
      } catch (error) {
        console.error('Failed to sync with local progress:', error)
      }
    },

    // Reset authentication state
    resetAuthState() {
      this.firebaseUser = null
      this.firebaseUserProfile = null
      this.userClaims = null
      this.userRole = null
      this.permissions = []
      this.isAuthenticated = false
      this.isOnlineMode = false
      this.authMode = 'local'
      this.connectionStatus = 'offline'
      this.currentSchoolId = null
      this.sessionToken = null
      this.error = null
    },

    // Update connection status
    updateConnectionStatus(status) {
      this.connectionStatus = status
      
      if (status === 'online' && this.firebaseUser) {
        authService.updateUserStatus('online')
      } else if (status === 'offline' && this.firebaseUser) {
        authService.updateUserStatus('offline')
      }
    },

    // Clear error
    clearError() {
      this.error = null
    },

    // Update user profile
    async updateProfile(updates) {
      this.isLoading = true
      
      try {
        if (this.isOnlineMode && this.firebaseUser) {
          // Update Firebase profile
          // This would involve updating the user profile in Realtime Database
          this.firebaseUserProfile = { ...this.firebaseUserProfile, ...updates }
        } else if (this.localUser) {
          // Update local profile
          this.localUserProfile = { ...this.localUserProfile, ...updates }
          this.saveLocalUser()
        }
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    }
  },

  // Persist important auth state
  persist: {
    paths: [
      'localUser', 
      'localUserProfile', 
      'authMode', 
      'currentSchoolId',
      'lastSyncTime'
    ]
  }
})