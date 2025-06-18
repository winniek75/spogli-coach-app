import { ref, computed, watch, readonly } from 'vue'

/**
 * Pattern Hunter ゲーム用コンポーザブル
 * 文法パターン探索ゲームのロジックを管理
 */
export function usePatternHunter(options = {}) {
  // デフォルト設定
  const defaultOptions = {
    gridRows: 4,
    gridCols: 6,
    timeLimit: 60,
    maxPatterns: 5,
    difficulty: 'basic',
    enableHints: true,
    enableTimeBonus: true
  }
  
  const config = { ...defaultOptions, ...options }
  
  // 状態管理
  const gameState = ref('ready') // 'ready', 'playing', 'paused', 'finished'
  const score = ref(0)
  const timeLeft = ref(config.timeLimit)
  const currentLevel = ref(1)
  const foundPatterns = ref([])
  const selectedElements = ref([])
  const selectedCells = ref([])
  const gameGrid = ref([])
  const targetPatterns = ref([])
  const currentTarget = ref(null)
  const hintUsed = ref(false)
  const comboCount = ref(0)
  const lastPatternTime = ref(0)
  
  // 統計データ
  const stats = ref({
    totalAttempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
    averageResponseTime: 0,
    bestCombo: 0,
    hintsUsed: 0,
    totalPlayTime: 0
  })
  
  // タイマー管理
  let gameTimer = null
  let startTime = null
  
  // 計算されたプロパティ
  const gridSize = computed(() => config.gridRows * config.gridCols)
  
  const progressPercentage = computed(() => {
    if (targetPatterns.value.length === 0) return 0
    return Math.round((foundPatterns.value.length / targetPatterns.value.length) * 100)
  })
  
  const accuracy = computed(() => {
    if (stats.value.totalAttempts === 0) return 0
    return Math.round((stats.value.correctAttempts / stats.value.totalAttempts) * 100)
  })
  
  const timeBonus = computed(() => {
    if (!config.enableTimeBonus) return 0
    return Math.floor(timeLeft.value * 2)
  })
  
  const comboBonus = computed(() => {
    return comboCount.value * 50
  })
  
  const stars = computed(() => {
    const completion = foundPatterns.value.length / targetPatterns.value.length
    const timeRemaining = timeLeft.value / config.timeLimit
    const accuracyRate = accuracy.value / 100
    
    let starCount = 0
    
    // 完了率による評価
    if (completion >= 0.8) starCount += 1
    if (completion >= 0.9) starCount += 1
    
    // 時間ボーナス
    if (timeRemaining >= 0.3) starCount += 1
    
    // 精度ボーナス（最大3つ星の場合）
    if (accuracyRate >= 0.8 && starCount === 2) starCount += 1
    
    return Math.min(starCount, 3)
  })
  
  const canUseHint = computed(() => {
    return config.enableHints && !hintUsed.value && selectedElements.value.length === 0
  })
  
  // ゲーム初期化
  const initializeGame = (patterns = [], gridElements = []) => {
    // 状態リセット
    gameState.value = 'ready'
    score.value = 0
    timeLeft.value = config.timeLimit
    foundPatterns.value = []
    selectedElements.value = []
    selectedCells.value = []
    hintUsed.value = false
    comboCount.value = 0
    startTime = null
    
    // ターゲットパターン設定
    setupTargetPatterns(patterns)
    
    // グリッド初期化
    setupGameGrid(gridElements)
    
    // 最初のターゲット設定
    setNextTarget()
    
    // 統計リセット
    resetStats()
  }
  
  // ターゲットパターン設定
  const setupTargetPatterns = (patterns) => {
    const patternCount = Math.min(patterns.length, config.maxPatterns)
    targetPatterns.value = patterns.slice(0, patternCount).map((pattern, index) => ({
      id: index,
      pattern: Array.isArray(pattern.elements) ? pattern.elements.join(' ') : pattern.pattern,
      elements: Array.isArray(pattern.elements) ? pattern.elements : pattern.pattern.split(' '),
      isFound: false,
      difficulty: pattern.difficulty || config.difficulty,
      foundAt: null,
      attempts: 0
    }))
  }
  
  // ゲームグリッド設定
  const setupGameGrid = (elements) => {
    const totalSize = gridSize.value
    gameGrid.value = Array(totalSize).fill(null).map(() => ({
      element: null,
      isSelected: false,
      isFound: false,
      isCorrect: false,
      isWrong: false,
      isHighlighted: false,
      isHinted: false
    }))
    
    // 要素をグリッドに配置
    if (elements && elements.length > 0) {
      // 要素をシャッフル
      const shuffledElements = [...elements].sort(() => Math.random() - 0.5)
      
      // グリッドに配置
      shuffledElements.slice(0, totalSize).forEach((element, index) => {
        gameGrid.value[index].element = element
      })
    }
  }
  
  // ゲーム開始
  const startGame = () => {
    gameState.value = 'playing'
    startTime = Date.now()
    startTimer()
  }
  
  // ゲーム一時停止
  const pauseGame = () => {
    if (gameState.value === 'playing') {
      gameState.value = 'paused'
      stopTimer()
    }
  }
  
  // ゲーム再開
  const resumeGame = () => {
    if (gameState.value === 'paused') {
      gameState.value = 'playing'
      startTimer()
    }
  }
  
  // ゲーム終了
  const endGame = () => {
    gameState.value = 'finished'
    stopTimer()
    
    // 統計更新
    if (startTime) {
      stats.value.totalPlayTime = Math.floor((Date.now() - startTime) / 1000)
    }
    
    return {
      score: score.value,
      stars: stars.value,
      stats: stats.value,
      foundPatterns: foundPatterns.value.length,
      totalPatterns: targetPatterns.value.length
    }
  }
  
  // タイマー管理
  const startTimer = () => {
    gameTimer = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        endGame()
      }
    }, 1000)
  }
  
  const stopTimer = () => {
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
    }
  }
  
  // 次のターゲット設定
  const setNextTarget = () => {
    const remainingPatterns = targetPatterns.value.filter(p => !p.isFound)
    if (remainingPatterns.length > 0) {
      currentTarget.value = remainingPatterns[0]
    } else {
      currentTarget.value = null
    }
  }
  
  // セル選択
  const selectCell = (index) => {
    if (gameState.value !== 'playing') return false
    if (!gameGrid.value[index] || !gameGrid.value[index].element) return false
    if (gameGrid.value[index].isFound) return false
    
    const cell = gameGrid.value[index]
    
    if (cell.isSelected) {
      // 選択解除
      cell.isSelected = false
      const elementIndex = selectedElements.value.findIndex(el => el.text === cell.element.text)
      if (elementIndex !== -1) {
        selectedElements.value.splice(elementIndex, 1)
      }
      const cellIndex = selectedCells.value.indexOf(index)
      if (cellIndex !== -1) {
        selectedCells.value.splice(cellIndex, 1)
      }
    } else {
      // 選択
      cell.isSelected = true
      selectedElements.value.push(cell.element)
      selectedCells.value.push(index)
    }
    
    return true
  }
  
  // パターンチェック
  const checkPattern = () => {
    if (selectedElements.value.length < 2) return { success: false, message: 'Select at least 2 elements' }
    if (!currentTarget.value) return { success: false, message: 'No target pattern' }
    
    const selectedTexts = selectedElements.value.map(el => el.text)
    const targetElements = currentTarget.value.elements
    
    // 統計更新
    stats.value.totalAttempts++
    currentTarget.value.attempts++
    
    // パターンマッチング
    const isMatch = checkPatternMatch(selectedTexts, targetElements)
    
    if (isMatch) {
      return handleCorrectPattern()
    } else {
      return handleIncorrectPattern()
    }
  }
  
  // パターンマッチング（順序を考慮しない）
  const checkPatternMatch = (selected, target) => {
    if (selected.length !== target.length) return false
    
    const sortedSelected = [...selected].sort()
    const sortedTarget = [...target].sort()
    
    return sortedSelected.every((val, index) => val === sortedTarget[index])
  }
  
  // 正解処理
  const handleCorrectPattern = () => {
    const currentTime = Date.now()
    const timeSinceLastPattern = lastPatternTime.value ? currentTime - lastPatternTime.value : 0
    
    // コンボ計算（30秒以内なら継続）
    if (timeSinceLastPattern < 30000) {
      comboCount.value++
    } else {
      comboCount.value = 1
    }
    
    lastPatternTime.value = currentTime
    
    // スコア計算
    const baseScore = 100
    const difficultyMultiplier = getDifficultyMultiplier(currentTarget.value.difficulty)
    const timeBonus = Math.floor(timeLeft.value * 2)
    const comboBonus = comboCount.value * 50
    const elementBonus = selectedElements.value.length * 10
    
    const totalScore = (baseScore + elementBonus) * difficultyMultiplier + timeBonus + comboBonus
    score.value += totalScore
    
    // パターンを見つかったとしてマーク
    currentTarget.value.isFound = true
    currentTarget.value.foundAt = currentTime
    foundPatterns.value.push(currentTarget.value)
    
    // 統計更新
    stats.value.correctAttempts++
    stats.value.bestCombo = Math.max(stats.value.bestCombo, comboCount.value)
    
    // 選択されたセルをマーク
    selectedCells.value.forEach(cellIndex => {
      const cell = gameGrid.value[cellIndex]
      if (cell) {
        cell.isFound = true
        cell.isCorrect = true
        cell.isSelected = false
      }
    })
    
    // 選択をクリア
    clearSelection()
    
    // 次のターゲットを設定
    setNextTarget()
    
    // 全パターン完了チェック
    if (foundPatterns.value.length >= targetPatterns.value.length) {
      setTimeout(() => {
        endGame()
      }, 1000)
    }
    
    return {
      success: true,
      message: `Correct! +${totalScore} points`,
      score: totalScore,
      combo: comboCount.value,
      isComplete: foundPatterns.value.length >= targetPatterns.value.length
    }
  }
  
  // 不正解処理
  const handleIncorrectPattern = () => {
    // 統計更新
    stats.value.wrongAttempts++
    
    // コンボリセット
    comboCount.value = 0
    
    // 選択されたセルを一時的に間違いとしてマーク
    selectedCells.value.forEach(cellIndex => {
      const cell = gameGrid.value[cellIndex]
      if (cell) {
        cell.isWrong = true
      }
    })
    
    // 一定時間後に間違い状態をクリア
    setTimeout(() => {
      selectedCells.value.forEach(cellIndex => {
        const cell = gameGrid.value[cellIndex]
        if (cell) {
          cell.isWrong = false
        }
      })
      clearSelection()
    }, 1000)
    
    return {
      success: false,
      message: 'Try again!',
      score: 0,
      combo: 0,
      isComplete: false
    }
  }
  
  // 難易度倍率
  const getDifficultyMultiplier = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 1.0
      case 'basic': return 1.2
      case 'intermediate': return 1.5
      case 'advanced': return 2.0
      default: return 1.0
    }
  }
  
  // 選択クリア
  const clearSelection = () => {
    selectedElements.value = []
    selectedCells.value.forEach(cellIndex => {
      const cell = gameGrid.value[cellIndex]
      if (cell) {
        cell.isSelected = false
      }
    })
    selectedCells.value = []
  }
  
  // ヒント使用
  const useHint = () => {
    if (!canUseHint.value || !currentTarget.value) {
      return { success: false, message: 'Hint not available' }
    }
    
    const targetElements = currentTarget.value.elements
    const availableCells = gameGrid.value
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => cell.element && targetElements.includes(cell.element.text) && !cell.isFound)
    
    if (availableCells.length === 0) {
      return { success: false, message: 'No hint available' }
    }
    
    // ランダムに1つの要素をハイライト
    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)]
    randomCell.cell.isHinted = true
    
    // ハイライトを一定時間後に削除
    setTimeout(() => {
      randomCell.cell.isHinted = false
    }, 3000)
    
    hintUsed.value = true
    stats.value.hintsUsed++
    
    return {
      success: true,
      message: 'Hint: Look for the highlighted element',
      cellIndex: randomCell.index
    }
  }
  
  // パターンのハイライト
  const highlightPattern = (patternId) => {
    const pattern = targetPatterns.value.find(p => p.id === patternId)
    if (!pattern) return false
    
    // 該当する要素をハイライト
    gameGrid.value.forEach(cell => {
      if (cell.element && pattern.elements.includes(cell.element.text)) {
        cell.isHighlighted = true
      }
    })
    
    // 3秒後にハイライト解除
    setTimeout(() => {
      gameGrid.value.forEach(cell => {
        cell.isHighlighted = false
      })
    }, 3000)
    
    return true
  }
  
  // 統計リセット
  const resetStats = () => {
    stats.value = {
      totalAttempts: 0,
      correctAttempts: 0,
      wrongAttempts: 0,
      averageResponseTime: 0,
      bestCombo: 0,
      hintsUsed: 0,
      totalPlayTime: 0
    }
  }
  
  // レスポンス時間計算
  const calculateResponseTime = () => {
    if (!startTime) return 0
    return Math.floor((Date.now() - startTime) / 1000)
  }
  
  // 時間フォーマット
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // ゲーム状態チェック
  const isGameActive = computed(() => {
    return gameState.value === 'playing'
  })
  
  const isGameFinished = computed(() => {
    return gameState.value === 'finished'
  })
  
  const canSelectCells = computed(() => {
    return gameState.value === 'playing'
  })
  
  // レベルアップチェック
  const checkLevelUp = () => {
    const requiredScore = currentLevel.value * 1000
    if (score.value >= requiredScore) {
      currentLevel.value++
      return {
        levelUp: true,
        newLevel: currentLevel.value,
        bonus: 500
      }
    }
    return { levelUp: false }
  }
  
  // ゲームデータエクスポート
  const exportGameData = () => {
    return {
      gameState: gameState.value,
      score: score.value,
      timeLeft: timeLeft.value,
      currentLevel: currentLevel.value,
      foundPatterns: foundPatterns.value.length,
      totalPatterns: targetPatterns.value.length,
      stats: stats.value,
      accuracy: accuracy.value,
      stars: stars.value
    }
  }
  
  // ウォッチャー
  watch(gameState, (newState, oldState) => {
    if (newState === 'playing' && oldState !== 'playing') {
      startTimer()
    } else if (newState !== 'playing' && oldState === 'playing') {
      stopTimer()
    }
  })
  
  watch(selectedElements, (newElements) => {
    // 選択された要素が変更された時の処理
    if (newElements.length > 6) {
      // 最大6個まで選択可能
      selectedElements.value = newElements.slice(0, 6)
    }
  })
  
  // クリーンアップ
  const cleanup = () => {
    stopTimer()
    gameState.value = 'ready'
  }
  
  // 公開API
  return {
    // 状態
    gameState: readonly(gameState),
    score: readonly(score),
    timeLeft: readonly(timeLeft),
    currentLevel: readonly(currentLevel),
    foundPatterns: readonly(foundPatterns),
    selectedElements: readonly(selectedElements),
    selectedCells: readonly(selectedCells),
    gameGrid: readonly(gameGrid),
    targetPatterns: readonly(targetPatterns),
    currentTarget: readonly(currentTarget),
    stats: readonly(stats),
    
    // 計算されたプロパティ
    gridSize,
    progressPercentage,
    accuracy,
    stars,
    timeBonus,
    comboBonus,
    canUseHint,
    isGameActive,
    isGameFinished,
    canSelectCells,
    
    // メソッド
    initializeGame,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    selectCell,
    checkPattern,
    clearSelection,
    useHint,
    highlightPattern,
    checkLevelUp,
    formatTime,
    exportGameData,
    cleanup,
    
    // ユーティリティ
    calculateResponseTime,
    resetStats
  }
}

// パターンマッチングヘルパー関数
export const PatternHunterUtils = {
  // 要素タイプ判定
  getElementType(text) {
    const pronouns = ['I', 'you', 'he', 'she', 'it', 'we', 'they']
    const verbs = ['am', 'is', 'are', 'like', 'love', 'have', 'do', 'does', 'run', 'walk', 'eat', 'sleep']
    const adjectives = ['happy', 'sad', 'big', 'small', 'red', 'blue', 'green', 'yellow']
    const nouns = ['cats', 'dogs', 'books', 'cars', 'apples', 'ball', 'music']
    const questions = ['Do', 'Does', 'Are', 'Is']
    
    if (pronouns.includes(text)) return 'pronoun'
    if (verbs.includes(text)) return 'verb'
    if (adjectives.includes(text)) return 'adjective'
    if (nouns.includes(text)) return 'noun'
    if (questions.includes(text)) return 'question'
    return 'other'
  },
  
  // 要素カテゴリ判定
  getElementCategory(text) {
    if (['I', 'you', 'he', 'she', 'it', 'we', 'they'].includes(text)) return 'subject'
    if (['am', 'is', 'are', 'do', 'does'].includes(text)) return 'auxiliary'
    if (['like', 'love', 'have', 'run', 'walk', 'eat', 'sleep'].includes(text)) return 'verb'
    if (['happy', 'sad', 'big', 'small'].includes(text)) return 'adjective'
    if (['cats', 'dogs', 'books', 'cars', 'apples', 'ball', 'music'].includes(text)) return 'object'
    return 'other'
  },
  
  // グリッド要素生成
  generateGridElements(patterns) {
    const allElements = []
    
    // ターゲット要素を収集
    patterns.forEach(pattern => {
      pattern.elements.forEach(element => {
        allElements.push({
          text: element,
          type: this.getElementType(element),
          category: this.getElementCategory(element)
        })
      })
    })
    
    // ダミー要素を追加
    const dummyElements = [
      'cats', 'dogs', 'books', 'cars', 'happy', 'sad', 'big', 'small',
      'run', 'walk', 'eat', 'sleep', 'red', 'blue', 'green', 'yellow',
      'table', 'chair', 'house', 'tree', 'water', 'fire', 'sun', 'moon'
    ]
    
    while (allElements.length < 24) { // 4x6グリッド
      const dummy = dummyElements[Math.floor(Math.random() * dummyElements.length)]
      if (!allElements.find(el => el.text === dummy)) {
        allElements.push({
          text: dummy,
          type: this.getElementType(dummy),
          category: this.getElementCategory(dummy)
        })
      }
    }
    
    return allElements
  },
  
  // 難易度別パターン生成
  generatePatternsByDifficulty(difficulty, count = 5) {
    const patterns = {
      easy: [
        { elements: ['I', 'am', 'happy'], difficulty: 'easy' },
        { elements: ['You', 'are', 'sad'], difficulty: 'easy' },
        { elements: ['He', 'is', 'big'], difficulty: 'easy' },
        { elements: ['She', 'is', 'small'], difficulty: 'easy' },
        { elements: ['It', 'is', 'red'], difficulty: 'easy' }
      ],
      basic: [
        { elements: ['I', 'like', 'cats'], difficulty: 'basic' },
        { elements: ['Do', 'you', 'like', 'dogs?'], difficulty: 'basic' },
        { elements: ['He', 'loves', 'music'], difficulty: 'basic' },
        { elements: ['She', 'has', 'books'], difficulty: 'basic' },
        { elements: ['We', 'are', 'happy'], difficulty: 'basic' }
      ],
      intermediate: [
        { elements: ['I', 'have', 'been', 'happy'], difficulty: 'intermediate' },
        { elements: ['Do', 'you', 'like', 'reading', 'books?'], difficulty: 'intermediate' },
        { elements: ['She', 'is', 'very', 'beautiful'], difficulty: 'intermediate' },
        { elements: ['We', 'can', 'run', 'fast'], difficulty: 'intermediate' },
        { elements: ['They', 'will', 'come', 'tomorrow'], difficulty: 'intermediate' }
      ],
      advanced: [
        { elements: ['I', 'would', 'like', 'to', 'go'], difficulty: 'advanced' },
        { elements: ['If', 'I', 'were', 'you'], difficulty: 'advanced' },
        { elements: ['The', 'book', 'which', 'I', 'read'], difficulty: 'advanced' },
        { elements: ['Having', 'finished', 'the', 'work'], difficulty: 'advanced' },
        { elements: ['Not', 'only', 'but', 'also'], difficulty: 'advanced' }
      ]
    }
    
    const selectedPatterns = patterns[difficulty] || patterns.basic
    return selectedPatterns.slice(0, count)
  }
}