/**
 * MovWISE Cosmic Grammar Data - Unified Level System
 * 
 * 宇宙テーマ統一デザインによるレベル別文法学習データ
 * Space Cadet → Galaxy Ranger → Star Commander → Cosmic Master
 */

// 宇宙ランクシステム定義
export const COSMIC_RANKS = {
  SPACE_CADET: 'space_cadet',
  GALAXY_RANGER: 'galaxy_ranger', 
  STAR_COMMANDER: 'star_commander',
  COSMIC_MASTER: 'cosmic_master'
}

// 宇宙エラータイプ分類
export const COSMIC_ERROR_TYPES = {
  // 基礎エラー (Space Cadet Level)
  ENERGY_FLOW_DISRUPTION: 'energy_flow_disruption', // Subject-verb agreement
  AUXILIARY_SYSTEM_FAILURE: 'auxiliary_system_failure', // Auxiliary verb errors
  TEMPORAL_DISPLACEMENT: 'temporal_displacement', // Verb tense errors
  COMMUNICATION_STATIC: 'communication_static', // Basic word order
  
  // 中級エラー (Galaxy Ranger Level)
  WARP_FIELD_INSTABILITY: 'warp_field_instability', // Subjunctive mood
  TRANSMISSION_DELAY: 'transmission_delay', // Reported speech
  QUANTUM_ENTANGLEMENT: 'quantum_entanglement', // Relative clauses
  PHASE_VARIANCE: 'phase_variance', // Present perfect
  
  // 上級エラー (Star Commander Level)
  DIMENSIONAL_RIFT: 'dimensional_rift', // Participles
  COSMIC_INTERFERENCE: 'cosmic_interference', // Complex conditionals
  STELLAR_CONVERGENCE: 'stellar_convergence', // Advanced structures
  NEBULA_DISTORTION: 'nebula_distortion', // Passive voice mastery
  
  // マスターレベル (Cosmic Master Level)
  UNIVERSAL_HARMONY: 'universal_harmony', // Perfect integration
  GALACTIC_SYNTHESIS: 'galactic_synthesis', // Multi-layered complexity
  COSMIC_TRANSCENDENCE: 'cosmic_transcendence' // Near-native mastery
}

// エラータイプの説明（日本語）
export const COSMIC_ERROR_DESCRIPTIONS = {
  [COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION]: '主語と動詞のエネルギー同調',
  [COSMIC_ERROR_TYPES.AUXILIARY_SYSTEM_FAILURE]: '補助システムの稼働異常',
  [COSMIC_ERROR_TYPES.TEMPORAL_DISPLACEMENT]: '時間軸のずれ',
  [COSMIC_ERROR_TYPES.COMMUNICATION_STATIC]: '通信順序の混乱',
  [COSMIC_ERROR_TYPES.WARP_FIELD_INSTABILITY]: 'ワープフィールドの不安定',
  [COSMIC_ERROR_TYPES.TRANSMISSION_DELAY]: '伝送信号の遅延',
  [COSMIC_ERROR_TYPES.QUANTUM_ENTANGLEMENT]: '量子もつれ構造',
  [COSMIC_ERROR_TYPES.PHASE_VARIANCE]: '位相変動',
  [COSMIC_ERROR_TYPES.DIMENSIONAL_RIFT]: '次元の裂け目',
  [COSMIC_ERROR_TYPES.COSMIC_INTERFERENCE]: '宇宙干渉波',
  [COSMIC_ERROR_TYPES.STELLAR_CONVERGENCE]: '恒星収束現象',
  [COSMIC_ERROR_TYPES.NEBULA_DISTORTION]: '星雲歪曲場',
  [COSMIC_ERROR_TYPES.UNIVERSAL_HARMONY]: '宇宙調和の乱れ',
  [COSMIC_ERROR_TYPES.GALACTIC_SYNTHESIS]: '銀河統合システム',
  [COSMIC_ERROR_TYPES.COSMIC_TRANSCENDENCE]: '宇宙超越原理'
}

// Space Cadet Level（英検5級〜4級レベル）
export const spaceCadetMissions = [
  // Energy Flow Disruption (主語・動詞一致)
  {
    missionId: 'SC001',
    sentence: "The alien ship are approaching Earth",
    isCorrect: false,
    correction: "The alien ship is approaching Earth",
    errorType: COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION,
    explanation: "単数主語には単数動詞でエネルギー同調させます",
    difficulty: 1,
    timeLimit: 2500,
    category: "energy_systems",
    cosmicContext: "敵宇宙船の接近を正確に報告する必要があります",
    rewardPoints: 100
  },
  {
    missionId: 'SC002',
    sentence: "Our crew members is ready for departure",
    isCorrect: false,
    correction: "Our crew members are ready for departure",
    errorType: COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION,
    explanation: "複数主語には複数動詞でエネルギー調和させます",
    difficulty: 1,
    timeLimit: 2300,
    category: "energy_systems",
    cosmicContext: "クルーの準備状況を正確に伝達しましょう",
    rewardPoints: 100
  },
  {
    missionId: 'SC003',
    sentence: "The space station has three docking bays",
    isCorrect: true,
    errorType: null,
    explanation: "完璧なエネルギー同調です！",
    difficulty: 1,
    timeLimit: 2000,
    category: "energy_systems",
    cosmicContext: "宇宙ステーションの情報を正確に識別しました",
    rewardPoints: 120
  },

  // Auxiliary System Failure (助動詞)
  {
    missionId: 'SC004',
    sentence: "He don't have clearance for landing",
    isCorrect: false,
    correction: "He doesn't have clearance for landing",
    errorType: COSMIC_ERROR_TYPES.AUXILIARY_SYSTEM_FAILURE,
    explanation: "三人称単数には doesn't で補助システムを調整",
    difficulty: 1,
    timeLimit: 2200,
    category: "auxiliary_systems",
    cosmicContext: "着陸許可システムの正確な操作が必要です",
    rewardPoints: 110
  },
  {
    missionId: 'SC005',
    sentence: "I doesn't understand the alien language",
    isCorrect: false,
    correction: "I don't understand the alien language",
    errorType: COSMIC_ERROR_TYPES.AUXILIARY_SYSTEM_FAILURE,
    explanation: "一人称には don't で補助システムを設定",
    difficulty: 1,
    timeLimit: 2400,
    category: "auxiliary_systems",
    cosmicContext: "異星人言語の翻訳システムを正しく運用しましょう",
    rewardPoints: 110
  },

  // Temporal Displacement (時制)
  {
    missionId: 'SC006',
    sentence: "Yesterday we was exploring the asteroid field",
    isCorrect: false,
    correction: "Yesterday we were exploring the asteroid field",
    errorType: COSMIC_ERROR_TYPES.TEMPORAL_DISPLACEMENT,
    explanation: "過去の時間軸では were で複数主語を調整",
    difficulty: 2,
    timeLimit: 2100,
    category: "temporal_navigation",
    cosmicContext: "時間記録の正確性は宇宙航行で最重要です",
    rewardPoints: 130
  },
  {
    missionId: 'SC007',
    sentence: "The captain is giving orders right now",
    isCorrect: true,
    errorType: null,
    explanation: "現在進行形の時間軸が完璧に調整されています",
    difficulty: 1,
    timeLimit: 1900,
    category: "temporal_navigation",
    cosmicContext: "現在の指令状況を正確に把握しました",
    rewardPoints: 140
  },

  // Communication Static (語順)
  {
    missionId: 'SC008',
    sentence: "Can you the coordinates calculate?",
    isCorrect: false,
    correction: "Can you calculate the coordinates?",
    errorType: COSMIC_ERROR_TYPES.COMMUNICATION_STATIC,
    explanation: "疑問文の通信順序を正しく調整する必要があります",
    difficulty: 2,
    timeLimit: 2000,
    category: "communication",
    cosmicContext: "座標計算の指示が通信ノイズで混乱しています",
    rewardPoints: 120
  },
  {
    missionId: 'SC009',
    sentence: "The new planet we discovered is beautiful",
    isCorrect: true,
    errorType: null,
    explanation: "通信チャンネルがクリアです！",
    difficulty: 1,
    timeLimit: 1800,
    category: "communication",
    cosmicContext: "新惑星の美しさが正確に伝達されました",
    rewardPoints: 150
  },

  // 追加のSpace Cadetミッション
  {
    missionId: 'SC010',
    sentence: "There is many stars in this galaxy",
    isCorrect: false,
    correction: "There are many stars in this galaxy",
    errorType: COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION,
    explanation: "複数の stars には are でエネルギー調和",
    difficulty: 2,
    timeLimit: 2300,
    category: "energy_systems",
    cosmicContext: "銀河の星の数を正確にカウントしています",
    rewardPoints: 130
  }
]

// Galaxy Ranger Level（英検3級〜準2級レベル）
export const galaxyRangerMissions = [
  // Warp Field Instability (仮定法)
  {
    missionId: 'GR001',
    sentence: "If I was the captain, I would explore that nebula",
    isCorrect: false,
    correction: "If I were the captain, I would explore that nebula",
    errorType: COSMIC_ERROR_TYPES.WARP_FIELD_INSTABILITY,
    explanation: "仮定法ワープフィールドでは were で安定化",
    difficulty: 3,
    timeLimit: 1500,
    category: "warp_mechanics",
    cosmicContext: "仮想シナリオでの星雲探査計画を立案中",
    rewardPoints: 200
  },
  {
    missionId: 'GR002',
    sentence: "I wish I could speak the Martian language",
    isCorrect: true,
    errorType: null,
    explanation: "ワープフィールドが完璧に安定しています",
    difficulty: 3,
    timeLimit: 1300,
    category: "warp_mechanics",
    cosmicContext: "火星言語への願望が正確に表現されました",
    rewardPoints: 250
  },

  // Transmission Delay (間接話法)
  {
    missionId: 'GR003',
    sentence: "The alien said that he can help us",
    isCorrect: false,
    correction: "The alien said that he could help us",
    errorType: COSMIC_ERROR_TYPES.TRANSMISSION_DELAY,
    explanation: "過去の伝送では時制を一段階過去にシフト",
    difficulty: 3,
    timeLimit: 1400,
    category: "communication_relay",
    cosmicContext: "異星人からの支援提案を正確に中継しています",
    rewardPoints: 220
  },
  {
    missionId: 'GR004',
    sentence: "She told me she had visited Earth before",
    isCorrect: true,
    errorType: null,
    explanation: "伝送遅延が完璧に補正されています",
    difficulty: 3,
    timeLimit: 1200,
    category: "communication_relay",
    cosmicContext: "地球訪問歴の情報が正確に伝達されました",
    rewardPoints: 270
  },

  // Quantum Entanglement (関係代名詞)
  {
    missionId: 'GR005',
    sentence: "The spacecraft which we built yesterday is fast",
    isCorrect: true,
    errorType: null,
    explanation: "量子もつれ構造が完璧に形成されています",
    difficulty: 3,
    timeLimit: 1100,
    category: "quantum_mechanics",
    cosmicContext: "新造宇宙船の性能データが正確に関連付けられました",
    rewardPoints: 280
  },
  {
    missionId: 'GR006',
    sentence: "The planet that it has two moons is mysterious",
    isCorrect: false,
    correction: "The planet that has two moons is mysterious",
    errorType: COSMIC_ERROR_TYPES.QUANTUM_ENTANGLEMENT,
    explanation: "関係代名詞の量子もつれで重複を除去",
    difficulty: 4,
    timeLimit: 1300,
    category: "quantum_mechanics",
    cosmicContext: "二重月惑星の神秘性を正確に表現する必要があります",
    rewardPoints: 240
  },

  // Phase Variance (現在完了)
  {
    missionId: 'GR007',
    sentence: "We have been to Mars three times",
    isCorrect: true,
    errorType: null,
    explanation: "位相変動が正常範囲内です",
    difficulty: 3,
    timeLimit: 1200,
    category: "phase_navigation",
    cosmicContext: "火星への訪問履歴が正確に記録されています",
    rewardPoints: 260
  },
  {
    missionId: 'GR008',
    sentence: "Have you ever went to the space station?",
    isCorrect: false,
    correction: "Have you ever been to the space station?",
    errorType: COSMIC_ERROR_TYPES.PHASE_VARIANCE,
    explanation: "現在完了の位相では been で調整",
    difficulty: 3,
    timeLimit: 1400,
    category: "phase_navigation",
    cosmicContext: "宇宙ステーション訪問歴の確認中",
    rewardPoints: 230
  }
]

// Star Commander Level（英検2級〜準1級レベル）
export const starCommanderMissions = [
  // Dimensional Rift (分詞構文)
  {
    missionId: 'SC001',
    sentence: "Having received the signal, the fleet changed course",
    isCorrect: true,
    errorType: null,
    explanation: "次元の裂け目が完璧に封印されています",
    difficulty: 5,
    timeLimit: 900,
    category: "dimensional_physics",
    cosmicContext: "艦隊の進路変更が完璧にコーディネートされました",
    rewardPoints: 400
  },
  {
    missionId: 'SC002',
    sentence: "Finished the repairs, the ship departed",
    isCorrect: false,
    correction: "Having finished the repairs, the ship departed",
    errorType: COSMIC_ERROR_TYPES.DIMENSIONAL_RIFT,
    explanation: "完了分詞の次元裂け目を Having で修復",
    difficulty: 5,
    timeLimit: 1100,
    category: "dimensional_physics",
    cosmicContext: "修理完了後の出発手順に次元的歪みがあります",
    rewardPoints: 350
  },

  // Cosmic Interference (複雑な条件文)
  {
    missionId: 'SC003',
    sentence: "If we had left earlier, we would have avoided the meteor storm",
    isCorrect: true,
    errorType: null,
    explanation: "宇宙干渉波が完全に中和されています",
    difficulty: 5,
    timeLimit: 1000,
    category: "cosmic_interference",
    cosmicContext: "隕石嵐回避の仮想シナリオが完璧に構築されました",
    rewardPoints: 450
  },
  {
    missionId: 'SC004',
    sentence: "If I would have known, I would have warned them",
    isCorrect: false,
    correction: "If I had known, I would have warned them",
    errorType: COSMIC_ERROR_TYPES.COSMIC_INTERFERENCE,
    explanation: "仮定法過去完了の条件節で would have は干渉波を生成",
    difficulty: 6,
    timeLimit: 1200,
    category: "cosmic_interference",
    cosmicContext: "警告システムの仮想分析に干渉が検出されています",
    rewardPoints: 380
  },

  // Stellar Convergence (高度な構文)
  {
    missionId: 'SC005',
    sentence: "Not only does the planet have water, but also life",
    isCorrect: true,
    errorType: null,
    explanation: "恒星収束現象が完璧にコントロールされています",
    difficulty: 6,
    timeLimit: 800,
    category: "stellar_mechanics",
    cosmicContext: "惑星の生命存在可能性が高精度で分析されました",
    rewardPoints: 500
  },
  {
    missionId: 'SC006',
    sentence: "Hardly had we arrived when the attack began",
    isCorrect: true,
    errorType: null,
    explanation: "倒置構文の恒星収束が完璧です",
    difficulty: 6,
    timeLimit: 900,
    category: "stellar_mechanics",
    cosmicContext: "攻撃開始のタイミングが正確に記録されました",
    rewardPoints: 480
  },

  // Nebula Distortion (受動態の高度な使用)
  {
    missionId: 'SC007',
    sentence: "The new technology is being developed by our engineers",
    isCorrect: true,
    errorType: null,
    explanation: "星雲歪曲場が安定しています",
    difficulty: 4,
    timeLimit: 1000,
    category: "nebula_navigation",
    cosmicContext: "新技術開発の進捗が正確にトラッキングされています",
    rewardPoints: 420
  },
  {
    missionId: 'SC008',
    sentence: "The message was send to all ships",
    isCorrect: false,
    correction: "The message was sent to all ships",
    errorType: COSMIC_ERROR_TYPES.NEBULA_DISTORTION,
    explanation: "受動態の星雲歪曲で sent の過去分詞形を使用",
    difficulty: 4,
    timeLimit: 1100,
    category: "nebula_navigation",
    cosmicContext: "全艦隊への緊急通信に歪曲が発生しています",
    rewardPoints: 380
  }
]

// Cosmic Master Level（英検準1級〜1級レベル）
export const cosmicMasterMissions = [
  // Universal Harmony (完璧な統合)
  {
    missionId: 'CM001',
    sentence: "Were it not for the gravitational field, the ship would drift away",
    isCorrect: true,
    errorType: null,
    explanation: "宇宙調和が完璧に維持されています",
    difficulty: 8,
    timeLimit: 600,
    category: "universal_harmony",
    cosmicContext: "重力場効果の仮想分析が最高精度で実行されました",
    rewardPoints: 800
  },
  {
    missionId: 'CM002',
    sentence: "Such was the beauty of the nebula that words failed us",
    isCorrect: true,
    errorType: null,
    explanation: "宇宙の美しさを表現する最高レベルの調和です",
    difficulty: 8,
    timeLimit: 700,
    category: "universal_harmony",
    cosmicContext: "星雲の圧倒的美しさが言語の限界を超越しました",
    rewardPoints: 850
  },

  // Galactic Synthesis (多層複雑性)
  {
    missionId: 'CM003',
    sentence: "The technology, having been developed over centuries, revolutionized space travel",
    isCorrect: true,
    errorType: null,
    explanation: "銀河統合システムが完璧に機能しています",
    difficulty: 9,
    timeLimit: 800,
    category: "galactic_synthesis",
    cosmicContext: "宇宙技術の歴史的発展が完璧に統合されました",
    rewardPoints: 900
  },
  {
    missionId: 'CM004',
    sentence: "It is imperative that the mission be completed successfully",
    isCorrect: true,
    errorType: null,
    explanation: "銀河規模での重要性が正確に表現されています",
    difficulty: 8,
    timeLimit: 750,
    category: "galactic_synthesis",
    cosmicContext: "ミッション成功の絶対的重要性が確認されました",
    rewardPoints: 880
  },

  // Cosmic Transcendence (宇宙超越)
  {
    missionId: 'CM005',
    sentence: "Little did we know that this discovery would change everything",
    isCorrect: true,
    errorType: null,
    explanation: "宇宙超越原理に到達しました！",
    difficulty: 10,
    timeLimit: 500,
    category: "cosmic_transcendence",
    cosmicContext: "宇宙の真理を変える発見の重要性を完璧に理解しました",
    rewardPoints: 1000
  }
]

// 全ミッション統合
export const allCosmicMissions = [
  ...spaceCadetMissions,
  ...galaxyRangerMissions,
  ...starCommanderMissions,
  ...cosmicMasterMissions
]

// 宇宙ランク設定
export const COSMIC_RANK_SETTINGS = {
  [COSMIC_RANKS.SPACE_CADET]: {
    name: "Space Cadet",
    description: "宇宙士官候補生（英検5級〜4級レベル）",
    icon: "🌟",
    timeLimit: 2500,
    questionsCount: 12,
    passingScore: 70,
    missions: spaceCadetMissions,
    unlockRequirement: null,
    colors: {
      primary: "#3b82f6",
      secondary: "#1d4ed8",
      accent: "#60a5fa"
    }
  },
  [COSMIC_RANKS.GALAXY_RANGER]: {
    name: "Galaxy Ranger",
    description: "銀河レンジャー（英検3級〜準2級レベル）",
    icon: "🚀", 
    timeLimit: 1800,
    questionsCount: 10,
    passingScore: 75,
    missions: galaxyRangerMissions,
    unlockRequirement: "space_cadet_80_percent",
    colors: {
      primary: "#10b981",
      secondary: "#047857", 
      accent: "#34d399"
    }
  },
  [COSMIC_RANKS.STAR_COMMANDER]: {
    name: "Star Commander",
    description: "星系指揮官（英検2級〜準1級レベル）",
    icon: "⭐",
    timeLimit: 1200,
    questionsCount: 8,
    passingScore: 80,
    missions: starCommanderMissions,
    unlockRequirement: "galaxy_ranger_85_percent",
    colors: {
      primary: "#f59e0b",
      secondary: "#d97706",
      accent: "#fbbf24"
    }
  },
  [COSMIC_RANKS.COSMIC_MASTER]: {
    name: "Cosmic Master", 
    description: "宇宙マスター（英検準1級〜1級レベル）",
    icon: "👑",
    timeLimit: 800,
    questionsCount: 6,
    passingScore: 90,
    missions: cosmicMasterMissions,
    unlockRequirement: "star_commander_90_percent",
    colors: {
      primary: "#8b5cf6",
      secondary: "#7c3aed",
      accent: "#a78bfa"
    }
  }
}

// 宇宙ゲーム設定
export const COSMIC_GAME_SETTINGS = {
  DEFAULT_ENERGY_CORES: 3,
  COSMIC_FURY_TRIGGER: 10, // 連続正解数
  COSMIC_FURY_DURATION: 12000, // ミリ秒
  COSMIC_FURY_MULTIPLIER: 2.5,
  COMBO_MULTIPLIER_MAX: 8,
  LIGHTNING_SPEED_THRESHOLD: 400, // ミリ秒
  LIGHTNING_SPEED_BONUS: 100,
  BASE_GALAXY_POINTS: 120,
  WRONG_ENERGY_DRAIN: -60,
  TIMEOUT_PENALTY: -40,
  PERFECT_MISSION_BONUS: 300
}

// 宇宙スコア計算
export const calculateCosmicScore = (isCorrect, reactionTime, combo, feverMode = false, difficulty = 1) => {
  if (!isCorrect) {
    return COSMIC_GAME_SETTINGS.WRONG_ENERGY_DRAIN
  }

  let baseScore = COSMIC_GAME_SETTINGS.BASE_GALAXY_POINTS * difficulty
  
  // ライトニングスピードボーナス
  if (reactionTime <= COSMIC_GAME_SETTINGS.LIGHTNING_SPEED_THRESHOLD) {
    baseScore += COSMIC_GAME_SETTINGS.LIGHTNING_SPEED_BONUS
  }
  
  // コンボ倍率
  const comboMultiplier = Math.min(combo, COSMIC_GAME_SETTINGS.COMBO_MULTIPLIER_MAX)
  baseScore *= comboMultiplier
  
  // コズミック・フューリーモード倍率
  if (feverMode) {
    baseScore *= COSMIC_GAME_SETTINGS.COSMIC_FURY_MULTIPLIER
  }
  
  return Math.round(baseScore)
}

// 宇宙エラー分析
export const analyzeCosmicErrors = (results) => {
  const errorCount = {}
  const categoryCount = {}
  const rankPerformance = {}
  
  results.forEach(result => {
    if (!result.isCorrect && result.mission.errorType) {
      const errorType = result.mission.errorType
      const category = result.mission.category
      
      errorCount[errorType] = (errorCount[errorType] || 0) + 1
      categoryCount[category] = (categoryCount[category] || 0) + 1
    }
  })
  
  return {
    errorsByType: errorCount,
    errorsByCategory: categoryCount,
    cosmicWeaknesses: Object.entries(errorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({
        type,
        description: COSMIC_ERROR_DESCRIPTIONS[type],
        count,
        recommendedTraining: getRecommendedTraining(type)
      }))
  }
}

// 推奨トレーニング取得
const getRecommendedTraining = (errorType) => {
  const trainingMap = {
    [COSMIC_ERROR_TYPES.TRANSMISSION_DELAY]: "伝送システム最適化プログラム",
    [COSMIC_ERROR_TYPES.QUANTUM_ENTANGLEMENT]: "量子もつれ構造制御訓練",
    [COSMIC_ERROR_TYPES.PHASE_VARIANCE]: "位相安定化アドバンス",
    [COSMIC_ERROR_TYPES.DIMENSIONAL_RIFT]: "次元裂け目修復マスタークラス",
    [COSMIC_ERROR_TYPES.COSMIC_INTERFERENCE]: "宇宙干渉波中和技術",
    [COSMIC_ERROR_TYPES.STELLAR_CONVERGENCE]: "恒星収束現象制御法",
    [COSMIC_ERROR_TYPES.NEBULA_DISTORTION]: "星雲歪曲場補正システム",
    [COSMIC_ERROR_TYPES.UNIVERSAL_HARMONY]: "宇宙調和統合マスタリー",
    [COSMIC_ERROR_TYPES.GALACTIC_SYNTHESIS]: "銀河統合システム極意",
    [COSMIC_ERROR_TYPES.COSMIC_TRANSCENDENCE]: "宇宙超越原理習得"
  }
  
  return trainingMap[errorType] || "基礎宇宙文法強化プログラム"
}

// ランダムミッション生成
export const generateCosmicMission = (rank = COSMIC_RANKS.SPACE_CADET, count = 10) => {
  const settings = COSMIC_RANK_SETTINGS[rank]
  if (!settings) {
    throw new Error(`Invalid cosmic rank: ${rank}`)
  }
  
  const shuffled = [...settings.missions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// 弱点強化ミッション生成
export const generateWeaknessCosmicMission = (errorTypes, count = 8) => {
  const targetMissions = allCosmicMissions.filter(mission => 
    errorTypes.includes(mission.errorType) || (mission.isCorrect && Math.random() < 0.25)
  )
  
  const shuffled = [...targetMissions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// 難易度別フィルター
export const filterByDifficulty = (missions, minDifficulty = 1, maxDifficulty = 10) => {
  return missions.filter(mission => 
    mission.difficulty >= minDifficulty && mission.difficulty <= maxDifficulty
  )
}

// カテゴリ別フィルター
export const filterByCategory = (missions, categories) => {
  if (!Array.isArray(categories)) {
    categories = [categories]
  }
  return missions.filter(mission => categories.includes(mission.category))
}

// ランク別フィルター
export const filterByRank = (missions, rank) => {
  const settings = COSMIC_RANK_SETTINGS[rank]
  return settings ? settings.missions : []
}

// コズミック・アチーブメント定義
export const COSMIC_ACHIEVEMENTS = {
  // Space Cadet アチーブメント
  FIRST_CONTACT: {
    id: 'first_contact',
    name: 'First Contact',
    description: '最初のミッションを完了',
    icon: '🛸',
    rank: COSMIC_RANKS.SPACE_CADET,
    requirement: 'complete_first_mission'
  },
  ENERGY_HARMONIZER: {
    id: 'energy_harmonizer', 
    name: 'Energy Harmonizer',
    description: 'エネルギー同調ミッション10回連続成功',
    icon: '⚡',
    rank: COSMIC_RANKS.SPACE_CADET,
    requirement: 'energy_flow_streak_10'
  },
  COMMUNICATION_SPECIALIST: {
    id: 'communication_specialist',
    name: 'Communication Specialist', 
    description: '通信システムマスター',
    icon: '📡',
    rank: COSMIC_RANKS.SPACE_CADET,
    requirement: 'communication_mastery_90'
  },

  // Galaxy Ranger アチーブメント
  WARP_NAVIGATOR: {
    id: 'warp_navigator',
    name: 'Warp Navigator',
    description: 'ワープフィールド制御をマスター',
    icon: '🌀',
    rank: COSMIC_RANKS.GALAXY_RANGER,
    requirement: 'warp_field_mastery'
  },
  QUANTUM_ENGINEER: {
    id: 'quantum_engineer',
    name: 'Quantum Engineer',
    description: '量子もつれ構造を完璧に理解',
    icon: '🔬',
    rank: COSMIC_RANKS.GALAXY_RANGER,
    requirement: 'quantum_mastery_95'
  },
  GALACTIC_EXPLORER: {
    id: 'galactic_explorer',
    name: 'Galactic Explorer',
    description: '銀河系全域の探索完了',
    icon: '🌌',
    rank: COSMIC_RANKS.GALAXY_RANGER,
    requirement: 'complete_all_ranger_missions'
  },

  // Star Commander アチーブメント
  DIMENSIONAL_MASTER: {
    id: 'dimensional_master',
    name: 'Dimensional Master',
    description: '次元操作技術の極意習得',
    icon: '🌪️',
    rank: COSMIC_RANKS.STAR_COMMANDER,
    requirement: 'dimensional_mastery'
  },
  STELLAR_ARCHITECT: {
    id: 'stellar_architect',
    name: 'Stellar Architect',
    description: '恒星収束現象の完全制御',
    icon: '⭐',
    rank: COSMIC_RANKS.STAR_COMMANDER,
    requirement: 'stellar_convergence_perfect'
  },
  COSMIC_STRATEGIST: {
    id: 'cosmic_strategist',
    name: 'Cosmic Strategist',
    description: '宇宙戦略の最高峰到達',
    icon: '🎯',
    rank: COSMIC_RANKS.STAR_COMMANDER,
    requirement: 'strategic_mastery_100'
  },

  // Cosmic Master アチーブメント
  UNIVERSAL_SAGE: {
    id: 'universal_sage',
    name: 'Universal Sage',
    description: '宇宙の叡智を体得',
    icon: '🧙‍♂️',
    rank: COSMIC_RANKS.COSMIC_MASTER,
    requirement: 'universal_wisdom'
  },
  GALACTIC_EMPEROR: {
    id: 'galactic_emperor',
    name: 'Galactic Emperor',
    description: '銀河系の絶対的支配者',
    icon: '👑',
    rank: COSMIC_RANKS.COSMIC_MASTER,
    requirement: 'galactic_dominance'
  },
  COSMIC_TRANSCENDENT: {
    id: 'cosmic_transcendent',
    name: 'Cosmic Transcendent',
    description: '宇宙の真理を超越',
    icon: '✨',
    rank: COSMIC_RANKS.COSMIC_MASTER,
    requirement: 'cosmic_transcendence'
  },

  // 特別アチーブメント
  LIGHTNING_REFLEXES: {
    id: 'lightning_reflexes',
    name: 'Lightning Reflexes',
    description: '平均反応速度200ms以下',
    icon: '⚡',
    rank: 'special',
    requirement: 'average_reaction_200ms'
  },
  PERFECT_HARMONY: {
    id: 'perfect_harmony',
    name: 'Perfect Harmony',
    description: '50回連続パーフェクト',
    icon: '🎵',
    rank: 'special',
    requirement: 'perfect_streak_50'
  },
  COSMIC_FURY_MASTER: {
    id: 'cosmic_fury_master',
    name: 'Cosmic Fury Master',
    description: 'フューリーモード100回発動',
    icon: '🔥',
    rank: 'special',
    requirement: 'fury_mode_100_times'
  }
}

// レベル進行システム
export const COSMIC_PROGRESSION = {
  calculateRankProgress: (currentRank, stats) => {
    const settings = COSMIC_RANK_SETTINGS[currentRank]
    if (!settings) return { progress: 0, nextRank: null }

    const ranks = Object.keys(COSMIC_RANK_SETTINGS)
    const currentIndex = ranks.indexOf(currentRank)
    const nextRank = currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null

    if (!nextRank) {
      return { progress: 100, nextRank: null, mastered: true }
    }

    const nextSettings = COSMIC_RANK_SETTINGS[nextRank]
    const requirement = nextSettings.unlockRequirement

    let progress = 0
    switch (requirement) {
      case 'space_cadet_80_percent':
        progress = Math.min(100, (stats.accuracy || 0))
        break
      case 'galaxy_ranger_85_percent':
        progress = Math.min(100, (stats.accuracy || 0))
        break
      case 'star_commander_90_percent':
        progress = Math.min(100, (stats.accuracy || 0))
        break
      default:
        progress = 0
    }

    return {
      progress,
      nextRank,
      unlockThreshold: parseInt(requirement.match(/\d+/)?.[0] || '80'),
      canPromote: progress >= parseInt(requirement.match(/\d+/)?.[0] || '80')
    }
  },

  calculateOverallMastery: (stats) => {
    const weights = {
      accuracy: 0.4,
      averageReactionTime: 0.2, // 反転: 早いほど高得点
      streakRecord: 0.2,
      missionsCompleted: 0.2
    }

    const normalizedAccuracy = Math.min(100, stats.accuracy || 0) / 100
    const normalizedReactionTime = Math.max(0, 1 - (stats.averageReactionTime || 2000) / 2000)
    const normalizedStreak = Math.min(100, (stats.streakRecord || 0) / 50)
    const normalizedMissions = Math.min(100, (stats.missionsCompleted || 0) / 100)

    const mastery = (
      normalizedAccuracy * weights.accuracy +
      normalizedReactionTime * weights.averageReactionTime +
      normalizedStreak * weights.streakRecord +
      normalizedMissions * weights.missionsCompleted
    ) * 100

    return {
      overall: Math.round(mastery),
      breakdown: {
        accuracy: Math.round(normalizedAccuracy * 100),
        speed: Math.round(normalizedReactionTime * 100),
        consistency: Math.round(normalizedStreak * 100),
        experience: Math.round(normalizedMissions * 100)
      }
    }
  }
}

// 宇宙ランク昇格チェック
export const checkRankPromotion = (currentRank, stats) => {
  const progression = COSMIC_PROGRESSION.calculateRankProgress(currentRank, stats)
  
  if (progression.canPromote && progression.nextRank) {
    return {
      canPromote: true,
      newRank: progression.nextRank,
      ceremony: generatePromotionCeremony(currentRank, progression.nextRank)
    }
  }
  
  return { canPromote: false }
}

// 昇格セレモニー生成
const generatePromotionCeremony = (oldRank, newRank) => {
  const ceremonies = {
    [`${COSMIC_RANKS.SPACE_CADET}_${COSMIC_RANKS.GALAXY_RANGER}`]: {
      title: "Galaxy Ranger Promotion Ceremony",
      message: "宇宙の基礎を修了し、銀河レンジャーの資格を獲得しました！",
      animation: "galaxy_promotion",
      rewards: ["ranger_badge", "galaxy_map", "warp_drive_access"]
    },
    [`${COSMIC_RANKS.GALAXY_RANGER}_${COSMIC_RANKS.STAR_COMMANDER}`]: {
      title: "Star Commander Promotion Ceremony", 
      message: "銀河系を制覇し、星系指揮官の地位に昇格しました！",
      animation: "star_promotion",
      rewards: ["commander_insignia", "stellar_chart", "dimensional_key"]
    },
    [`${COSMIC_RANKS.STAR_COMMANDER}_${COSMIC_RANKS.COSMIC_MASTER}`]: {
      title: "Cosmic Master Ascension Ceremony",
      message: "宇宙の真理に到達し、コズミック・マスターとして覚醒しました！",
      animation: "cosmic_ascension",
      rewards: ["master_crown", "universal_codex", "transcendence_crystal"]
    }
  }
  
  return ceremonies[`${oldRank}_${newRank}`] || {
    title: "Rank Promotion",
    message: "新しいランクに昇格しました！",
    animation: "default_promotion",
    rewards: ["promotion_badge"]
  }
}

// エクスポート用デフォルト
export default {
  COSMIC_RANKS,
  COSMIC_ERROR_TYPES,
  COSMIC_ERROR_DESCRIPTIONS,
  spaceCadetMissions,
  galaxyRangerMissions,
  starCommanderMissions,
  cosmicMasterMissions,
  allCosmicMissions,
  COSMIC_RANK_SETTINGS,
  COSMIC_GAME_SETTINGS,
  COSMIC_ACHIEVEMENTS,
  COSMIC_PROGRESSION,
  calculateCosmicScore,
  analyzeCosmicErrors,
  generateCosmicMission,
  generateWeaknessCosmicMission,
  filterByDifficulty,
  filterByCategory,
  filterByRank,
  checkRankPromotion
}