/**
 * CoPilot Training Dock Store
 * 個人/複数講師モード対応とドック拡張管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDockStore = defineStore('dock', () => {
  // === Core Settings ===
  const dockSettings = ref({
    mode: 'individual', // 'individual' | 'multi' | 'expanding'
    maxCaptains: 1, // 個人教室は1、複数講師は任意
    expansionPlanned: true, // 将来拡張予定かどうか
    dockName: 'エリート・トレーニング・ドック',
    establishedDate: '2024-08-01',
    missionCode: 'ETD-2024-A1'
  })

  // === Main Captain Data ===
  const mainCaptain = ref({
    id: 'captain-001',
    name: '船長 サトウ・ケンジ',
    rank: 'ベテラン司令官',
    avatar: '👨‍🚀',
    specialties: ['音韻学習', '文法構造', '実戦英会話'],
    experience: {
      years: 12,
      totalStudents: 840,
      successRate: 96
    },
    status: 'active',
    lastActive: new Date().toISOString(),
    achievements: [
      { icon: '🏆', title: '優秀指導官', year: 2023 },
      { icon: '⭐', title: '生徒満足度No.1', year: 2024 },
      { icon: '🎯', title: '目標達成率95%超', year: 2024 }
    ],
    currentMissions: [
      { type: 'sound', title: 'サウンド星雲探索', progress: 75 },
      { type: 'grammar', title: '文法銀河征服', progress: 60 },
      { type: 'conversation', title: '実戦対話訓練', progress: 85 }
    ]
  })

  // === Expansion Plans ===
  const expansionPlans = ref({
    phase1: {
      title: '副船長着任計画',
      targetDate: '2024-12-01',
      status: 'planning', // 'planning' | 'recruiting' | 'completed'
      requirements: ['英語指導経験3年以上', '宇宙教育学位', 'VR操縦技能'],
      benefits: ['協力ミッション解禁', '大型クラス対応', '24時間サポート体制']
    },
    phase2: {
      title: 'ドック施設拡張',
      targetDate: '2025-03-01',
      status: 'planned',
      upgrades: ['VRルーム増設', 'AI補助システム', '高度シミュレーター'],
      capacity: '同時接続数 50名 → 100名'
    },
    phase3: {
      title: '専門講師チーム編成',
      targetDate: '2025-06-01',
      status: 'conceptual',
      specializations: ['幼児教育専門', 'ビジネス英語', '試験対策', '発音矯正'],
      expectedImpact: '専門分野別最適化学習'
    }
  })

  // === Additional Captains (Multi Mode) ===
  const additionalCaptains = ref([
    {
      id: 'captain-002',
      name: '副船長 タナカ・ユキ',
      rank: '熟練操縦士',
      avatar: '👩‍🚀',
      specialties: ['発音訓練', 'リスニング強化'],
      status: 'expedition', // 'active' | 'expedition' | 'scheduled'
      returnDate: '2024-09-15',
      currentMission: '深宇宙探査任務'
    },
    {
      id: 'captain-003',
      name: '技術士官 ヤマダ・ヒロシ',
      rank: '技術専門官',
      avatar: '👨‍💻',
      specialties: ['AI学習システム', 'データ分析'],
      status: 'scheduled',
      joinDate: '2024-10-01',
      preparationPhase: 'システム統合テスト中'
    }
  ])

  // === Dock Statistics ===
  const dockStats = ref({
    totalSessions: 156,
    activeStudents: 28,
    completionRate: 94,
    averageScore: 87,
    monthlyGrowth: 15,
    studentSatisfaction: 4.8,
    weeklyStats: [
      { day: '月', sessions: 8, students: 12 },
      { day: '火', sessions: 12, students: 18 },
      { day: '水', sessions: 10, students: 15 },
      { day: '木', sessions: 14, students: 22 },
      { day: '金', sessions: 16, students: 25 },
      { day: '土', sessions: 6, students: 8 },
      { day: '日', sessions: 4, students: 6 }
    ]
  })

  // === Computed Properties ===
  const isIndividualMode = computed(() => dockSettings.value.mode === 'individual')
  const isMultiMode = computed(() => dockSettings.value.mode === 'multi')
  const isExpandingMode = computed(() => dockSettings.value.mode === 'expanding')

  const availableCaptains = computed(() => {
    if (isIndividualMode.value) {
      return [mainCaptain.value]
    } else if (isMultiMode.value) {
      return [mainCaptain.value, ...additionalCaptains.value.filter(c => c.status === 'active')]
    } else {
      // Expanding mode: show main + planned captains
      return [mainCaptain.value, ...additionalCaptains.value]
    }
  })

  const nextExpansionMilestone = computed(() => {
    const phases = Object.values(expansionPlans.value)
    return phases.find(phase => phase.status === 'planning' || phase.status === 'recruiting')
  })

  const dockCapacityUtilization = computed(() => {
    const maxCapacity = dockSettings.value.maxCaptains * 30 // 1講師あたり30名想定
    return Math.round((dockStats.value.activeStudents / maxCapacity) * 100)
  })

  // === Actions ===
  
  /**
   * ドックモードの切り替え
   */
  const setDockMode = (mode) => {
    const validModes = ['individual', 'multi', 'expanding']
    if (!validModes.includes(mode)) {
      console.warn(`Invalid dock mode: ${mode}`)
      return
    }

    dockSettings.value.mode = mode
    
    // モードに応じた設定調整
    switch (mode) {
      case 'individual':
        dockSettings.value.maxCaptains = 1
        dockSettings.value.expansionPlanned = true
        break
      case 'multi':
        dockSettings.value.maxCaptains = 5
        dockSettings.value.expansionPlanned = false
        break
      case 'expanding':
        dockSettings.value.maxCaptains = 3
        dockSettings.value.expansionPlanned = true
        break
    }

    console.log(`🚀 Dock mode changed to: ${mode}`)
  }

  /**
   * 拡張計画の更新
   */
  const updateExpansionPlan = (phase, updates) => {
    if (expansionPlans.value[phase]) {
      expansionPlans.value[phase] = {
        ...expansionPlans.value[phase],
        ...updates
      }
      console.log(`📋 Expansion plan ${phase} updated`)
    }
  }

  /**
   * 船長の追加
   */
  const addCaptain = (captainData) => {
    const newCaptain = {
      id: `captain-${Date.now()}`,
      status: 'active',
      joinDate: new Date().toISOString(),
      ...captainData
    }
    
    additionalCaptains.value.push(newCaptain)
    
    // マルチモードに自動切り替え
    if (additionalCaptains.value.filter(c => c.status === 'active').length > 0) {
      setDockMode('multi')
    }
    
    console.log(`👨‍🚀 New captain added: ${newCaptain.name}`)
  }

  /**
   * 船長のステータス更新
   */
  const updateCaptainStatus = (captainId, status, additionalData = {}) => {
    if (captainId === mainCaptain.value.id) {
      mainCaptain.value.status = status
      Object.assign(mainCaptain.value, additionalData)
    } else {
      const captain = additionalCaptains.value.find(c => c.id === captainId)
      if (captain) {
        captain.status = status
        Object.assign(captain, additionalData)
      }
    }
  }

  /**
   * ドック統計の更新
   */
  const updateStats = (newStats) => {
    dockStats.value = {
      ...dockStats.value,
      ...newStats,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * 拡張プロセスの開始
   */
  const startExpansionProcess = () => {
    if (isIndividualMode.value) {
      setDockMode('expanding')
      updateExpansionPlan('phase1', { status: 'recruiting' })
      
      console.log('🚀 Dock expansion process initiated!')
      return {
        success: true,
        message: 'ドック拡張プロセスが開始されました！副船長の募集を開始します。',
        nextSteps: [
          '募集要項の公開',
          '候補者スクリーニング',
          '面接・技能試験',
          '着任準備'
        ]
      }
    } else {
      return {
        success: false,
        message: '拡張プロセスは個人モードでのみ開始できます。'
      }
    }
  }

  /**
   * デモ用データリセット
   */
  const resetToDemo = () => {
    dockSettings.value.mode = 'individual'
    dockSettings.value.maxCaptains = 1
    dockSettings.value.expansionPlanned = true
    
    // 追加船長のステータスをリセット
    additionalCaptains.value.forEach(captain => {
      if (captain.id === 'captain-002') {
        captain.status = 'expedition'
      } else {
        captain.status = 'scheduled'
      }
    })
    
    console.log('🔄 Dock reset to demo configuration')
  }

  // === Initialization ===
  const initializeDock = () => {
    // 設定の復元（localStorage から）
    const savedSettings = localStorage.getItem('movwise_dock_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        Object.assign(dockSettings.value, parsed)
      } catch (error) {
        console.warn('Failed to load dock settings:', error)
      }
    }

    console.log('🚀 CoPilot Training Dock initialized')
    console.log(`Mode: ${dockSettings.value.mode}`)
    console.log(`Available Captains: ${availableCaptains.value.length}`)
  }

  // === Watchers for Persistence ===
  // 設定変更時の自動保存
  const saveDockSettings = () => {
    localStorage.setItem('movwise_dock_settings', JSON.stringify(dockSettings.value))
  }

  return {
    // State
    dockSettings,
    mainCaptain,
    expansionPlans,
    additionalCaptains,
    dockStats,
    
    // Computed
    isIndividualMode,
    isMultiMode,
    isExpandingMode,
    availableCaptains,
    nextExpansionMilestone,
    dockCapacityUtilization,
    
    // Actions
    setDockMode,
    updateExpansionPlan,
    addCaptain,
    updateCaptainStatus,
    updateStats,
    startExpansionProcess,
    resetToDemo,
    initializeDock,
    saveDockSettings
  }
})

export default useDockStore