import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import jsonData from '../data/csv/cvc_words.json'

export const useGameSettingsStore = defineStore('gameSettings', () => {
  // ゲームモード
  const gameMode = ref('random') // 'random', 'level', 'category'

  // 現在のレベル
  const currentLevel = ref(1)

  // 選択されたカテゴリー
  const selectedCategory = ref('all')

  // 選択されたサブカテゴリー
  const selectedSubcategory = ref('all')

  // 難易度設定
  const difficulty = ref('all') // 'all', 'easy', 'medium', 'hard', 'veryhard', 'extreme', 'expert'

  // 問題数
  const questionCount = ref(10)

  // レベルごとの難易度マッピング
  const levelDifficultyMap = {
    1: 'easy',
    2: 'medium',
    3: 'hard',
    4: 'veryhard',
    5: 'extreme',
    6: 'expert'
  }

  // 難易度ごとのレベル範囲
  const difficultyLevelRange = {
    easy: [1],
    medium: [2],
    hard: [3],
    veryhard: [4],
    extreme: [5],
    expert: [6]
  }

  // カテゴリー一覧
  const categories = computed(() => {
    return ['all', ...new Set(jsonData.map(item => item.category))]
  })

  // サブカテゴリー一覧
  const subcategories = computed(() => {
    return ['all', ...new Set(jsonData.map(item => item.subcategory))]
  })

  // レベルごとの問題数を取得
  const getLevelQuestionCount = (level) => {
    return jsonData.filter(item => parseInt(item.level) === level).length
  }

  // カテゴリーごとの問題数を取得
  const getCategoryQuestionCount = (category) => {
    return jsonData.filter(item => item.category === category).length
  }

  // 現在の設定に基づいて問題を取得
  const getQuestions = () => {
    let data = [...jsonData]

    // レベルでフィルタリング
    if (gameMode.value === 'level') {
      data = data.filter(item => parseInt(item.level) === currentLevel.value)
    }

    // カテゴリーでフィルタリング
    if (selectedCategory.value !== 'all') {
      data = data.filter(item => item.category === selectedCategory.value)
    }

    // サブカテゴリーでフィルタリング
    if (selectedSubcategory.value !== 'all') {
      data = data.filter(item => item.subcategory === selectedSubcategory.value)
    }

    // 難易度でフィルタリング
    if (difficulty.value !== 'all') {
      data = data.filter(item => item.difficulty === difficulty.value)
    }

    // フィルタリングされたデータをレベルとカテゴリーでグループ化
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.level}-${item.category}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    }, {})

    // 各グループからランダムに問題を選択
    const selectedQuestions = []
    const groups = Object.values(groupedData)

    // 各グループから均等に問題を選択
    while (selectedQuestions.length < questionCount.value && groups.length > 0) {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length > 0) {
          const randomIndex = Math.floor(Math.random() * groups[i].length)
          selectedQuestions.push(groups[i][randomIndex])
          groups[i].splice(randomIndex, 1)

          if (selectedQuestions.length >= questionCount.value) break
        }
      }
      // 空のグループを削除
      groups.splice(groups.findIndex(group => group.length === 0), 1)
    }

    // 選択された問題をランダムに並び替え
    return selectedQuestions.sort(() => 0.5 - Math.random())
  }

  // レベルごとの進捗状況を取得
  const getLevelProgress = (level) => {
    const levelData = jsonData.filter(item => parseInt(item.level) === level)
    return {
      total: levelData.length,
      categories: levelData.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = 0
        }
        acc[item.category]++
        return acc
      }, {})
    }
  }

  // カテゴリーごとの進捗状況を取得
  const getCategoryProgress = (category) => {
    const categoryData = jsonData.filter(item => item.category === category)
    return {
      total: categoryData.length,
      levels: categoryData.reduce((acc, item) => {
        const level = parseInt(item.level)
        if (!acc[level]) {
          acc[level] = 0
        }
        acc[level]++
        return acc
      }, {})
    }
  }

  // 設定をリセット
  const resetSettings = () => {
    gameMode.value = 'random'
    currentLevel.value = 1
    selectedCategory.value = 'all'
    selectedSubcategory.value = 'all'
    difficulty.value = 'all'
    questionCount.value = 10
  }

  return {
    gameMode,
    currentLevel,
    selectedCategory,
    selectedSubcategory,
    difficulty,
    questionCount,
    categories,
    subcategories,
    getQuestions,
    resetSettings,
    getLevelProgress,
    getCategoryProgress,
    getLevelQuestionCount,
    getCategoryQuestionCount,
    levelDifficultyMap,
    difficultyLevelRange
  }
}) 