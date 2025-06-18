import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  getIdTokenResult
} from 'firebase/auth'
import { auth } from './config'
import { ref, set } from 'firebase/database'
import { database } from './config'

// User roles for cooperative learning
export const USER_ROLES = {
  CAPTAIN: 'captain',    // 講師 (Teacher)
  COPILOT: 'copilot'     // 生徒 (Student)
}

// Legacy user types for backward compatibility
export const USER_TYPES = {
  TEACHER: 'teacher',
  STUDENT: 'student'
}

// Authentication service
export class AuthService {
  constructor() {
    this.currentUser = null
    this.userClaims = null
    this.authStateCallbacks = []
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user
      
      if (user) {
        // Get user custom claims
        try {
          const idTokenResult = await getIdTokenResult(user)
          this.userClaims = idTokenResult.claims
        } catch (error) {
          console.error('Failed to get user claims:', error)
          this.userClaims = null
        }
      } else {
        this.userClaims = null
      }
      
      this.authStateCallbacks.forEach(callback => callback(user, this.userClaims))
    })
  }

  // Sign in user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return {
        success: true,
        user: userCredential.user
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Create new user account with role-based registration
  async signUp(email, password, displayName, role = USER_ROLES.COPILOT, schoolId = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update user profile
      await updateProfile(user, {
        displayName: displayName
      })

      // Create user profile in Realtime Database
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role,
        schoolId: schoolId,
        verified: false,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'offline'
      }

      // Save user profile to database
      await set(ref(database, `users/${user.uid}`), userProfile)

      // Add to role-specific lists
      if (role === USER_ROLES.CAPTAIN) {
        await set(ref(database, `availableCaptains/${user.uid}`), {
          uid: user.uid,
          displayName: displayName,
          schoolId: schoolId,
          status: 'offline',
          lastActive: new Date().toISOString()
        })
      }

      return {
        success: true,
        user: user,
        role: role,
        userProfile: userProfile
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Legacy signUp method for backward compatibility
  async signUpLegacy(email, password, displayName, userType = USER_TYPES.STUDENT) {
    const role = userType === USER_TYPES.TEACHER ? USER_ROLES.CAPTAIN : USER_ROLES.COPILOT
    return await this.signUp(email, password, displayName, role)
  }

  // Sign out user
  async signOutUser() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    this.authStateCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback)
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1)
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser
  }

  // Check if user is Captain (Teacher)
  isCaptain() {
    if (!this.currentUser) return false
    
    // Check custom claims first
    if (this.userClaims && this.userClaims.role) {
      return this.userClaims.role === USER_ROLES.CAPTAIN
    }
    
    // Fallback to email pattern check
    return this.currentUser.email?.includes('teacher') || 
           this.currentUser.email?.includes('captain') ||
           this.currentUser.email?.includes('admin')
  }

  // Check if user is Co-Pilot (Student)
  isCoPilot() {
    if (!this.currentUser) return false
    
    // Check custom claims first
    if (this.userClaims && this.userClaims.role) {
      return this.userClaims.role === USER_ROLES.COPILOT
    }
    
    // Default to Co-Pilot if authenticated but not Captain
    return this.isAuthenticated() && !this.isCaptain()
  }

  // Legacy methods for backward compatibility
  isTeacher() {
    return this.isCaptain()
  }

  isStudent() {
    return this.isCoPilot()
  }

  // Get user role
  getUserRole() {
    if (!this.currentUser) return null
    
    if (this.userClaims && this.userClaims.role) {
      return this.userClaims.role
    }
    
    return this.isCaptain() ? USER_ROLES.CAPTAIN : USER_ROLES.COPILOT
  }

  // Get user claims
  getUserClaims() {
    return this.userClaims
  }

  // Update user status (online/offline)
  async updateUserStatus(status = 'online') {
    if (!this.currentUser) return { success: false, error: 'Not authenticated' }

    try {
      const updates = {
        status: status,
        lastActive: new Date().toISOString()
      }

      // Update user profile
      await set(ref(database, `users/${this.currentUser.uid}`), {
        ...updates
      })

      // Update Captain status if applicable
      if (this.isCaptain()) {
        await set(ref(database, `availableCaptains/${this.currentUser.uid}/status`), status)
        await set(ref(database, `availableCaptains/${this.currentUser.uid}/lastActive`), updates.lastActive)
      }

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
export const authService = new AuthService()