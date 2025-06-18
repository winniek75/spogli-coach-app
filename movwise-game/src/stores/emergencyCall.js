import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, push, set, onValue, off, update, serverTimestamp } from 'firebase/database'
import { useAuthStore } from './auth'

export const useEmergencyCallStore = defineStore('emergencyCall', () => {
  // State
  const activeCall = ref(null)
  const callHistory = ref([])
  const encouragementMessages = ref([])
  const isListening = ref(false)
  const difficultyAdjustments = ref({})
  
  // Listeners storage
  const listeners = ref(new Map())
  
  // Event handlers (can be overridden by components)
  let onCallCreated = null
  let onCallResolved = null
  let onEncouragementReceived = null
  let onDifficultyAdjusted = null

  // Computed
  const hasActiveCall = computed(() => !!activeCall.value)
  
  const currentCallDuration = computed(() => {
    if (!activeCall.value) return 0
    return Date.now() - activeCall.value.timestamp
  })

  // Emergency call creation
  const createEmergencyCall = async (callData) => {
    try {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.uid || authStore.userId

      const emergencyCallData = {
        sessionId: callData.sessionId,
        studentId: userId,
        studentName: authStore.currentUser?.displayName || '生徒',
        reason: callData.reason,
        reasonText: callData.reasonText,
        timestamp: serverTimestamp(),
        resolved: false,
        urgent: callData.urgent || false,
        autoDetected: callData.autoDetected || false,
        difficultyAdjustment: callData.difficultyAdjustment || 0,
        metadata: {
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          timestamp: new Date().toISOString()
        }
      }

      // Create emergency call in Firebase
      const emergencyRef = dbRef(database, `sessions/${callData.sessionId}/communication/emergencyCall`)
      await set(emergencyRef, emergencyCallData)

      // Update local state
      activeCall.value = emergencyCallData

      // Add to history
      callHistory.value.unshift(emergencyCallData)

      // Auto-apply difficulty adjustment if specified
      if (callData.difficultyAdjustment !== 0) {
        await applyDifficultyAdjustment(callData.sessionId, callData.difficultyAdjustment)
      }

      // Auto-send encouragement message
      await sendAutoEncouragement(callData.sessionId, callData.reason)

      // Trigger callback
      if (onCallCreated) {
        onCallCreated(emergencyCallData)
      }

      return { success: true, callId: emergencyRef.key }
    } catch (error) {
      console.error('Failed to create emergency call:', error)
      return { success: false, error: error.message }
    }
  }

  // Resolve emergency call
  const resolveEmergencyCall = async (sessionId) => {
    try {
      if (!activeCall.value) return { success: false, error: 'No active call' }

      const emergencyRef = dbRef(database, `sessions/${sessionId}/communication/emergencyCall`)
      await update(emergencyRef, {
        resolved: true,
        resolvedAt: serverTimestamp(),
        resolvedBy: 'captain'
      })

      // Update local state
      if (activeCall.value) {
        activeCall.value.resolved = true
        activeCall.value.resolvedAt = Date.now()
      }

      // Send resolution confirmation message
      await sendEncouragementMessage(sessionId, {
        text: '先生が確認しました！一緒に頑張りましょう！',
        type: 'resolution_confirmation',
        autoSent: true
      })

      // Trigger callback
      if (onCallResolved) {
        onCallResolved(activeCall.value)
      }

      activeCall.value = null

      return { success: true }
    } catch (error) {
      console.error('Failed to resolve emergency call:', error)
      return { success: false, error: error.message }
    }
  }

  // Send encouragement message
  const sendEncouragementMessage = async (sessionId, messageData) => {
    try {
      const authStore = useAuthStore()
      const messageRef = push(dbRef(database, `sessions/${sessionId}/communication/encouragement`))
      
      const message = {
        id: messageRef.key,
        text: messageData.text,
        type: messageData.type || 'encouragement',
        fromRole: 'captain',
        fromName: authStore.currentUser?.displayName || 'Captain',
        timestamp: serverTimestamp(),
        autoSent: messageData.autoSent || false,
        relatedToCall: activeCall.value?.timestamp || null
      }

      await set(messageRef, message)

      // Add to local messages
      encouragementMessages.value.push(message)

      return { success: true, messageId: messageRef.key }
    } catch (error) {
      console.error('Failed to send encouragement message:', error)
      return { success: false, error: error.message }
    }
  }

  // Auto-send encouragement based on reason
  const sendAutoEncouragement = async (sessionId, reason) => {
    const encouragementMap = {
      'too_difficult': '大丈夫！少しずつ一緒に覚えていこう！😊',
      'too_fast': 'ゆっくりで大丈夫だよ。あなたのペースで進めましょう！🐌',
      'dont_understand': '分からない時は恥ずかしがらずに聞いてね！先生がいるよ！👩‍🏫',
      'technical_issue': '技術的な問題ですね。すぐに確認します！🔧',
      'need_explanation': 'もう一度説明しますね。一緒に頑張りましょう！💡',
      'urgent_help': '大丈夫！先生がすぐに助けるからね！❤️'
    }

    const message = encouragementMap[reason] || '先生がサポートするから安心してね！✨'
    
    return await sendEncouragementMessage(sessionId, {
      text: message,
      type: 'auto_encouragement',
      autoSent: true
    })
  }

  // Apply difficulty adjustment
  const applyDifficultyAdjustment = async (sessionId, adjustment) => {
    try {
      const gameRef = dbRef(database, `sessions/${sessionId}/gameConfig`)
      const currentDifficulty = difficultyAdjustments.value[sessionId] || 'intermediate'
      
      const difficultyLevels = ['very_easy', 'easy', 'beginner', 'intermediate', 'advanced', 'expert']
      const currentIndex = difficultyLevels.indexOf(currentDifficulty)
      const newIndex = Math.max(0, Math.min(difficultyLevels.length - 1, currentIndex + adjustment))
      const newDifficulty = difficultyLevels[newIndex]

      await update(gameRef, {
        difficulty: newDifficulty,
        difficultyAdjustedAt: serverTimestamp(),
        difficultyAdjustedBy: 'emergency_system',
        previousDifficulty: currentDifficulty
      })

      // Update local state
      difficultyAdjustments.value[sessionId] = newDifficulty

      // Log the adjustment
      const adjustmentRef = push(dbRef(database, `sessions/${sessionId}/communication/difficultyAdjustments`))
      await set(adjustmentRef, {
        from: currentDifficulty,
        to: newDifficulty,
        adjustment: adjustment,
        reason: 'emergency_call',
        timestamp: serverTimestamp()
      })

      // Send notification message
      const difficultyNames = {
        'very_easy': 'とても簡単',
        'easy': '簡単',
        'beginner': '初級',
        'intermediate': '中級',
        'advanced': '上級',
        'expert': '専門級'
      }

      await sendEncouragementMessage(sessionId, {
        text: `難易度を「${difficultyNames[newDifficulty]}」に調整しました！`,
        type: 'difficulty_adjustment',
        autoSent: true
      })

      // Trigger callback
      if (onDifficultyAdjusted) {
        onDifficultyAdjusted({
          from: currentDifficulty,
          to: newDifficulty,
          adjustment
        })
      }

      return { success: true, newDifficulty }
    } catch (error) {
      console.error('Failed to apply difficulty adjustment:', error)
      return { success: false, error: error.message }
    }
  }

  // Setup real-time listeners
  const setupListeners = (sessionId) => {
    if (isListening.value) return

    try {
      // Listen for emergency calls
      const emergencyRef = dbRef(database, `sessions/${sessionId}/communication/emergencyCall`)
      const emergencyListener = onValue(emergencyRef, (snapshot) => {
        const data = snapshot.val()
        if (data && !data.resolved) {
          activeCall.value = data
        } else {
          activeCall.value = null
        }
      })
      listeners.value.set('emergency', emergencyListener)

      // Listen for encouragement messages
      const encouragementRef = dbRef(database, `sessions/${sessionId}/communication/encouragement`)
      const encouragementListener = onValue(encouragementRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const messages = Object.values(data).sort((a, b) => b.timestamp - a.timestamp)
          encouragementMessages.value = messages

          // Trigger callback for new messages
          const authStore = useAuthStore()
          const userRole = authStore.currentUser?.role || authStore.userRole
          
          if (userRole === 'copilot') {
            const latestMessage = messages[0]
            if (latestMessage && latestMessage.fromRole === 'captain' && onEncouragementReceived) {
              onEncouragementReceived(latestMessage)
            }
          }
        }
      })
      listeners.value.set('encouragement', encouragementListener)

      // Listen for difficulty changes
      const difficultyRef = dbRef(database, `sessions/${sessionId}/gameConfig/difficulty`)
      const difficultyListener = onValue(difficultyRef, (snapshot) => {
        const difficulty = snapshot.val()
        if (difficulty) {
          difficultyAdjustments.value[sessionId] = difficulty
        }
      })
      listeners.value.set('difficulty', difficultyListener)

      isListening.value = true
    } catch (error) {
      console.error('Failed to setup emergency call listeners:', error)
    }
  }

  // Auto-detect emergency situations
  const detectEmergencyConditions = async (sessionId, gameMetrics) => {
    try {
      // Detect patterns that might indicate need for help
      const {
        consecutiveFailures = 0,
        timeStuckOnProblem = 0,
        accuracyDropRate = 0,
        inactivityTime = 0
      } = gameMetrics

      let shouldTriggerEmergency = false
      let reason = null
      let difficultyAdjustment = 0

      // Check for consecutive failures
      if (consecutiveFailures >= 5) {
        shouldTriggerEmergency = true
        reason = 'too_difficult'
        difficultyAdjustment = -1
      }
      // Check for extended time on single problem
      else if (timeStuckOnProblem > 300000) { // 5 minutes
        shouldTriggerEmergency = true
        reason = 'need_explanation'
        difficultyAdjustment = 0
      }
      // Check for accuracy drop
      else if (accuracyDropRate > 0.3) { // 30% drop
        shouldTriggerEmergency = true
        reason = 'too_fast'
        difficultyAdjustment = -1
      }
      // Check for inactivity
      else if (inactivityTime > 120000) { // 2 minutes
        shouldTriggerEmergency = true
        reason = 'dont_understand'
        difficultyAdjustment = 0
      }

      if (shouldTriggerEmergency && !hasActiveCall.value) {
        return await createEmergencyCall({
          sessionId,
          reason,
          reasonText: 'システムが自動検出',
          difficultyAdjustment,
          autoDetected: true
        })
      }

      return { success: true, triggered: false }
    } catch (error) {
      console.error('Failed to detect emergency conditions:', error)
      return { success: false, error: error.message }
    }
  }

  // Get call history
  const getCallHistory = (sessionId) => {
    return callHistory.value.filter(call => call.sessionId === sessionId)
  }

  // Cleanup listeners
  const cleanup = () => {
    listeners.value.forEach((listener, key) => {
      off(dbRef(database), 'value', listener)
    })
    listeners.value.clear()
    isListening.value = false
  }

  // Reset store state
  const resetState = () => {
    activeCall.value = null
    callHistory.value = []
    encouragementMessages.value = []
    difficultyAdjustments.value = {}
    cleanup()
  }

  return {
    // State
    activeCall,
    callHistory,
    encouragementMessages,
    hasActiveCall,
    currentCallDuration,
    isListening,
    difficultyAdjustments,

    // Actions
    createEmergencyCall,
    resolveEmergencyCall,
    sendEncouragementMessage,
    applyDifficultyAdjustment,
    detectEmergencyConditions,
    setupListeners,
    getCallHistory,
    cleanup,
    resetState,

    // Event handlers (to be set by components)
    onCallCreated: (callback) => { onCallCreated = callback },
    onCallResolved: (callback) => { onCallResolved = callback },
    onEncouragementReceived: (callback) => { onEncouragementReceived = callback },
    onDifficultyAdjusted: (callback) => { onDifficultyAdjusted = callback }
  }
})