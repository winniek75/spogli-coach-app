import { USER_ROLES } from '../firebase/auth'

// Permission definitions
export const PERMISSIONS = {
  // Session management
  CREATE_SESSION: 'create_session',
  JOIN_SESSION: 'join_session',
  MANAGE_SESSION: 'manage_session',
  DELETE_SESSION: 'delete_session',
  
  // Game control
  START_GAME: 'start_game',
  PAUSE_GAME: 'pause_game',
  END_GAME: 'end_game',
  CONTROL_GAME_FLOW: 'control_game_flow',
  NEXT_QUESTION: 'next_question',
  
  // Participant management
  VIEW_ALL_PARTICIPANTS: 'view_all_participants',
  MANAGE_PARTICIPANTS: 'manage_participants',
  KICK_PARTICIPANT: 'kick_participant',
  
  // Data access
  VIEW_OWN_PROGRESS: 'view_own_progress',
  VIEW_ALL_PROGRESS: 'view_all_progress',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // Communication
  SEND_MESSAGE: 'send_message',
  SEND_EMERGENCY_CALL: 'send_emergency_call',
  RECEIVE_EMERGENCY_CALL: 'receive_emergency_call',
  
  // Game actions
  SUBMIT_ANSWER: 'submit_answer',
  VIEW_CORRECT_ANSWERS: 'view_correct_answers',
  HINT_ACCESS: 'hint_access',
  
  // Administrative
  ACCESS_TEACHER_DASHBOARD: 'access_teacher_dashboard',
  MODIFY_GAME_SETTINGS: 'modify_game_settings',
  ACCESS_STUDENT_VIEW: 'access_student_view'
}

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.CAPTAIN]: [
    // Session management
    PERMISSIONS.CREATE_SESSION,
    PERMISSIONS.MANAGE_SESSION,
    PERMISSIONS.DELETE_SESSION,
    
    // Game control
    PERMISSIONS.START_GAME,
    PERMISSIONS.PAUSE_GAME,
    PERMISSIONS.END_GAME,
    PERMISSIONS.CONTROL_GAME_FLOW,
    PERMISSIONS.NEXT_QUESTION,
    
    // Participant management
    PERMISSIONS.VIEW_ALL_PARTICIPANTS,
    PERMISSIONS.MANAGE_PARTICIPANTS,
    PERMISSIONS.KICK_PARTICIPANT,
    
    // Data access
    PERMISSIONS.VIEW_OWN_PROGRESS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    
    // Communication
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.RECEIVE_EMERGENCY_CALL,
    
    // Game actions
    PERMISSIONS.VIEW_CORRECT_ANSWERS,
    PERMISSIONS.HINT_ACCESS,
    
    // Administrative
    PERMISSIONS.ACCESS_TEACHER_DASHBOARD,
    PERMISSIONS.MODIFY_GAME_SETTINGS,
    PERMISSIONS.ACCESS_STUDENT_VIEW
  ],
  
  [USER_ROLES.COPILOT]: [
    // Session management
    PERMISSIONS.JOIN_SESSION,
    
    // Data access
    PERMISSIONS.VIEW_OWN_PROGRESS,
    
    // Communication
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.SEND_EMERGENCY_CALL,
    
    // Game actions
    PERMISSIONS.SUBMIT_ANSWER,
    PERMISSIONS.HINT_ACCESS,
    
    // Student view
    PERMISSIONS.ACCESS_STUDENT_VIEW
  ]
}

// Access control service
export class AccessControlService {
  constructor() {
    this.currentUserRole = null
    this.currentPermissions = []
  }

  // Set current user role and permissions
  setUserRole(role) {
    this.currentUserRole = role
    this.currentPermissions = ROLE_PERMISSIONS[role] || []
  }

  // Check if user has specific permission
  hasPermission(permission) {
    return this.currentPermissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission))
  }

  // Check if user has all specified permissions
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission))
  }

  // Get all permissions for current role
  getPermissions() {
    return [...this.currentPermissions]
  }

  // Check if user can perform specific actions
  canCreateSession() {
    return this.hasPermission(PERMISSIONS.CREATE_SESSION)
  }

  canJoinSession() {
    return this.hasPermission(PERMISSIONS.JOIN_SESSION)
  }

  canManageSession() {
    return this.hasPermission(PERMISSIONS.MANAGE_SESSION)
  }

  canControlGame() {
    return this.hasPermission(PERMISSIONS.CONTROL_GAME_FLOW)
  }

  canViewAllParticipants() {
    return this.hasPermission(PERMISSIONS.VIEW_ALL_PARTICIPANTS)
  }

  canSubmitAnswers() {
    return this.hasPermission(PERMISSIONS.SUBMIT_ANSWER)
  }

  canSendEmergencyCall() {
    return this.hasPermission(PERMISSIONS.SEND_EMERGENCY_CALL)
  }

  canAccessTeacherDashboard() {
    return this.hasPermission(PERMISSIONS.ACCESS_TEACHER_DASHBOARD)
  }

  canViewAnalytics() {
    return this.hasPermission(PERMISSIONS.VIEW_ANALYTICS)
  }

  // Role-specific checks
  isCaptain() {
    return this.currentUserRole === USER_ROLES.CAPTAIN
  }

  isCoPilot() {
    return this.currentUserRole === USER_ROLES.COPILOT
  }

  // Validate action against permissions
  validateAction(action, context = {}) {
    const validations = {
      'create_session': () => this.canCreateSession(),
      'join_session': () => this.canJoinSession(),
      'start_game': () => this.hasPermission(PERMISSIONS.START_GAME),
      'pause_game': () => this.hasPermission(PERMISSIONS.PAUSE_GAME),
      'end_game': () => this.hasPermission(PERMISSIONS.END_GAME),
      'submit_answer': () => this.canSubmitAnswers(),
      'view_participants': () => this.canViewAllParticipants(),
      'send_emergency': () => this.canSendEmergencyCall(),
      'kick_participant': () => this.hasPermission(PERMISSIONS.KICK_PARTICIPANT),
      'modify_settings': () => this.hasPermission(PERMISSIONS.MODIFY_GAME_SETTINGS),
      'view_analytics': () => this.canViewAnalytics(),
      'export_data': () => this.hasPermission(PERMISSIONS.EXPORT_DATA)
    }

    const validator = validations[action]
    if (!validator) {
      console.warn(`Unknown action for validation: ${action}`)
      return false
    }

    return validator()
  }

  // Get restricted actions for current role
  getRestrictedActions() {
    const allActions = Object.keys(PERMISSIONS)
    return allActions.filter(action => !this.hasPermission(PERMISSIONS[action]))
  }

  // Error messages for unauthorized actions
  getUnauthorizedMessage(action) {
    const messages = {
      [PERMISSIONS.CREATE_SESSION]: 'セッションを作成する権限がありません。講師アカウントが必要です。',
      [PERMISSIONS.MANAGE_SESSION]: 'セッションを管理する権限がありません。',
      [PERMISSIONS.START_GAME]: 'ゲームを開始する権限がありません。',
      [PERMISSIONS.VIEW_ALL_PARTICIPANTS]: '全参加者を表示する権限がありません。',
      [PERMISSIONS.KICK_PARTICIPANT]: '参加者を退出させる権限がありません。',
      [PERMISSIONS.VIEW_ANALYTICS]: '分析データを表示する権限がありません。',
      [PERMISSIONS.EXPORT_DATA]: 'データをエクスポートする権限がありません。',
      [PERMISSIONS.ACCESS_TEACHER_DASHBOARD]: '講師ダッシュボードにアクセスする権限がありません。'
    }

    return messages[action] || '実行する権限がありません。'
  }

  // Check session-specific permissions
  canAccessSession(sessionData, userId) {
    if (!sessionData) return false

    // Captain can access any session they created
    if (this.isCaptain() && sessionData.captain?.uid === userId) {
      return true
    }

    // Co-Pilot can access sessions they've joined
    if (this.isCoPilot() && sessionData.coPilot?.uid === userId) {
      return true
    }

    // Check if session allows open access
    if (sessionData.settings?.openAccess && this.hasPermission(PERMISSIONS.JOIN_SESSION)) {
      return true
    }

    return false
  }

  // Check if user can perform action on specific session
  canPerformSessionAction(action, sessionData, userId) {
    if (!this.canAccessSession(sessionData, userId)) {
      return false
    }

    // Additional session-specific checks
    switch (action) {
      case 'start_game':
      case 'pause_game':
      case 'end_game':
        return this.isCaptain() && sessionData.captain?.uid === userId
      
      case 'submit_answer':
        return this.isCoPilot() && sessionData.coPilot?.uid === userId
      
      case 'send_emergency':
        return this.isCoPilot() && sessionData.coPilot?.uid === userId
      
      default:
        return this.validateAction(action)
    }
  }
}

// Export singleton instance
export const accessControl = new AccessControlService()

// Utility functions for Vue components
export const useAccessControl = () => {
  return {
    hasPermission: (permission) => accessControl.hasPermission(permission),
    canCreateSession: () => accessControl.canCreateSession(),
    canJoinSession: () => accessControl.canJoinSession(),
    canManageSession: () => accessControl.canManageSession(),
    canControlGame: () => accessControl.canControlGame(),
    canViewAllParticipants: () => accessControl.canViewAllParticipants(),
    canSubmitAnswers: () => accessControl.canSubmitAnswers(),
    canSendEmergencyCall: () => accessControl.canSendEmergencyCall(),
    canAccessTeacherDashboard: () => accessControl.canAccessTeacherDashboard(),
    canViewAnalytics: () => accessControl.canViewAnalytics(),
    isCaptain: () => accessControl.isCaptain(),
    isCoPilot: () => accessControl.isCoPilot(),
    validateAction: (action, context) => accessControl.validateAction(action, context),
    getUnauthorizedMessage: (action) => accessControl.getUnauthorizedMessage(action)
  }
}

// Vue directive for permission-based rendering
export const vPermission = {
  mounted(el, binding) {
    const permission = binding.value
    if (!accessControl.hasPermission(permission)) {
      el.style.display = 'none'
    }
  },
  updated(el, binding) {
    const permission = binding.value
    if (!accessControl.hasPermission(permission)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}