// src/components/games/grammar-galaxy/shared/problemGenerator.js

import { grammarContentManager } from '@/data/grammarContentManager.js'

/**
 * 動的問題生成システム
 * CSVデータから適切な問題を生成し、ゲームプレイを最適化
 */
export class ProblemGenerator {
  constructor() {
    this.contentData = []
    this.problemSets = []
    this.visualElements = []
    this.usedProblemIds = new Set()
    this.difficultySettings = this.createDifficultySettings()
    this.isInitialized = false
  }

  /**
   * 初期化
   * @returns {Promise<boolean>} 初期化成功フラグ
   */
  async initialize(content, problems, visuals) {
    console.log('🏁 ProblemGenerator 初期化開始')
    this.contentData = Array.isArray(content) ? content : []
    this.problemSets = Array.isArray(problems) ? problems : []
    this.visualElements = Array.isArray(visuals) ? visuals : []
    this.isInitialized = true
    
    console.log('✅ ProblemGenerator 初期化完了:', {
      contentData: this.contentData.length,
      problemSets: this.problemSets.length,
      visualElements: this.visualElements.length,
      isInitialized: this.isInitialized
    })
    
    // 問題セットの最初の数個をサンプル表示
    if (this.problemSets.length > 0) {
      console.log('📋 問題セットサンプル:', this.problemSets.slice(0, 3).map(ps => ({
        set_id: ps.set_id,
        level: ps.level,
        category: ps.category,
        target_sentence: ps.target_sentence
      })))
    }
    
    return true
  }

  /**
   * 指定条件で問題を生成
   * @param {Object} options - 生成オプション
   * @returns {Object} 生成された問題
   */
  async generateProblem(options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const {
      level = 'beginner',
      eiken_level = null,
      category = null,
      difficulty = 'normal',
      excludeUsed = true,
      targetSentenceCount = 1
    } = options

    console.log('🎯 問題生成開始:', options)
    console.log('📊 利用可能データ:', {
      problemSets: this.problemSets?.length || 0,
      contentData: this.contentData?.length || 0,
      visualElements: this.visualElements?.length || 0,
      isInitialized: this.isInitialized
    })

    try {
      // 1. 適切な問題セットを選択
      const problemSet = this.selectProblemSet({
        level,
        eiken_level,
        category,
        excludeUsed
      })

      console.log('🔍 問題セット選択結果:', problemSet)
      if (!problemSet) {
        console.error('❌ 問題セットが見つかりません。利用可能な問題セット:')
        console.log('問題セット数:', this.problemSets?.length || 0)
        if (this.problemSets?.length > 0) {
          console.log('最初の問題セット:', this.problemSets[0])
          console.log('全問題セットのレベル:', [...new Set(this.problemSets.map(ps => ps.level))])
          console.log('全問題セットのカテゴリ:', [...new Set(this.problemSets.map(ps => ps.category))])
        }
        throw new Error('適切な問題セットが見つかりません')
      }

      // 2. 問題セットから要素を生成
      console.log('🔧 要素生成開始:', problemSet.set_id, problemSet.target_sentence)
      const elements = await this.generateElementsFromProblemSet(problemSet, difficulty)
      console.log('🔧 要素生成完了:', elements.length, '個')

      // 3. 視覚的テーマを適用
      const visualTheme = this.getVisualTheme(problemSet.visual_theme)

      // 4. 使用済みとしてマーク
      if (excludeUsed) {
        this.usedProblemIds.add(problemSet.set_id)
      }

      const problem = {
        id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        problemSetId: problemSet.set_id,
        level: problemSet.level,
        eiken_level: problemSet.eiken_level,
        category: problemSet.category,
        targetSentence: problemSet.target_sentence,
        hintJapanese: problemSet.hint_ja,
        difficulty: difficulty,
        estimatedDifficulty: problemSet.estimated_difficulty || problemSet.difficulty_score,
        elements: elements,
        visualTheme: visualTheme,
        generatedAt: new Date().toISOString()
      }

      // デバッグ用：生成された要素の検証
      console.log('🎲 Generated problem validation:')
      console.log('- Target sentence:', problem.targetSentence)
      console.log('- Elements count:', problem.elements.length)
      console.log('- Position distribution:',
        problem.elements.reduce((acc, el) => {
          acc[el.position] = (acc[el.position] || 0) + 1
          return acc
        }, {})
      )

      return problem

    } catch (error) {
      console.error('❌ 問題生成エラー:', error)
      console.error('❌ エラースタック:', error.stack)
      console.error('❌ エラー発生時の状態:', {
        isInitialized: this.isInitialized,
        problemSetsCount: this.problemSets?.length || 0,
        contentDataCount: this.contentData?.length || 0,
        visualElementsCount: this.visualElements?.length || 0
      })

      // フォールバック問題を生成
      return this.generateFallbackProblem(options)
    }
  }

  /**
   * 複数の問題を一括生成
   * @param {number} count - 生成する問題数
   * @param {Object} options - 生成オプション
   * @returns {Promise<Array>} 生成された問題配列
   */
  async generateMultipleProblems(count, options = {}) {
    const problems = []
    const usedCategories = new Set()

    for (let i = 0; i < count; i++) {
      try {
        // カテゴリの多様性を確保
        let categoryOptions = { ...options }
        if (usedCategories.size > 0 && !options.category) {
          const availableCategories = this.getAvailableCategories(options.level)
          const unusedCategories = availableCategories.filter(cat => !usedCategories.has(cat))
          if (unusedCategories.length > 0) {
            categoryOptions.category = unusedCategories[Math.floor(Math.random() * unusedCategories.length)]
          }
        }

        const problem = await this.generateProblem({
          ...categoryOptions,
          excludeUsed: true
        })

        problems.push(problem)
        usedCategories.add(problem.category)

        // カテゴリリセット（全て使用した場合）
        if (usedCategories.size >= this.getAvailableCategories(options.level).length) {
          usedCategories.clear()
        }

      } catch (error) {
        console.warn(`⚠️ 問題 ${i + 1} の生成に失敗:`, error)
      }
    }

    console.log(`🎲 ${count}問中${problems.length}問生成完了`)
    return problems
  }

  /**
   * 問題セットを選択
   * @param {Object} criteria - 選択条件
   * @returns {Object|null} 選択された問題セット
   */
  selectProblemSet(criteria) {
    console.log('🔍 問題セット選択開始:', criteria)
    console.log('💾 全問題セット数:', this.problemSets?.length || 0)
    
    if (!this.problemSets || this.problemSets.length === 0) {
      console.error('❌ 問題セットが初期化されていません')
      return null
    }

    let candidates = [...this.problemSets]
    console.log('📋 初期候補数:', candidates.length)

    // レベルフィルタ
    if (criteria.level) {
      const beforeFilter = candidates.length
      candidates = candidates.filter(ps => ps.level === criteria.level)
      console.log(`🎯 レベルフィルタ後 (${criteria.level}): ${beforeFilter} → ${candidates.length}個`)
      
      // レベル一致がない場合は、レベルを無視して検索
      if (candidates.length === 0) {
        console.log(`⚠️ レベル「${criteria.level}」の問題セットが見つからないため、レベルを無視して検索`)
        candidates = [...this.problemSets]
      }
    }

    // 英検レベルフィルタ (より優先的にフィルタリング)
    if (criteria.eiken_level) {
      const beforeFilter = candidates.length
      candidates = candidates.filter(ps => ps.eiken_level === criteria.eiken_level)
      console.log(`📚 英検レベルフィルタ後 (${criteria.eiken_level}級): ${beforeFilter} → ${candidates.length}個`)
      
      // 英検レベル一致がない場合は警告
      if (candidates.length === 0) {
        console.log(`⚠️ 英検「${criteria.eiken_level}級」の問題セットが見つからないため、英検レベルを無視して検索`)
        // 英検レベルでフィルタした結果が0の場合は、レベルフィルタに戻す
        candidates = this.problemSets.filter(ps => ps.level === criteria.level)
        if (candidates.length === 0) {
          candidates = [...this.problemSets]
        }
      }
    }

    // カテゴリフィルタ  
    if (criteria.category) {
      candidates = candidates.filter(ps => ps.category === criteria.category)
      console.log(`🏷️ カテゴリフィルタ後 (${criteria.category}):`, candidates.length, '個')
    }

    // 使用済み除外
    if (criteria.excludeUsed) {
      const beforeFilter = candidates.length
      candidates = candidates.filter(ps => !this.usedProblemIds.has(ps.set_id))
      console.log(`🚫 使用済み除外後: ${beforeFilter} → ${candidates.length}個`)
    }

    // 候補がない場合は使用済みリセット
    if (candidates.length === 0 && criteria.excludeUsed) {
      console.log('🔄 使用済み問題をリセット')
      this.usedProblemIds.clear()
      return this.selectProblemSet({ ...criteria, excludeUsed: false })
    }

    // ランダム選択（難易度を考慮した重み付き）
    if (candidates.length === 0) {
      console.warn('⚠️ 条件に合う問題セットが見つかりません')
      return null
    }

    const weightedCandidates = candidates.map(ps => ({
      ...ps,
      weight: this.calculateSelectionWeight(ps)
    }))

    const selected = this.selectWeightedRandom(weightedCandidates)
    console.log('✅ 選択された問題セット:', selected?.set_id, selected?.target_sentence)
    return selected
  }

  /**
   * 問題セットから要素を生成
   * @param {Object} problemSet - 問題セット
   * @param {string} difficulty - 難易度
   * @returns {Promise<Array>} 生成された要素配列
   */
  async generateElementsFromProblemSet(problemSet, difficulty) {
    const diffSettings = this.difficultySettings[difficulty]
    const targetWords = this.parseTargetSentence(problemSet.target_sentence)

    // 正解要素を作成
    const correctElements = await this.createCorrectElements(targetWords, problemSet)

    // ダミー要素を作成
    const distractorElements = await this.createDistractorElements(
      correctElements,
      problemSet,
      diffSettings.distractorCount
    )

    // シャッフル前にpositionを検証
    const allElements = [...correctElements, ...distractorElements]
    console.log('🔧 All elements before shuffle:', allElements.map(el => ({
      word: el.word,
      position: el.position,
      isCorrect: el.isCorrect
    })))
    // シャッフルして返却、positionを保持
    return this.shuffleArray(allElements).map((element, index) => ({
      ...element,
      id: `element_${problemSet.set_id}_${index}`,
      isUsed: false,
      position: element.position
    }))
  }

  /**
   * 正解要素を作成
   * @param {Array} targetWords - ターゲット単語配列
   * @param {Object} problemSet - 問題セット
   * @returns {Promise<Array>} 正解要素配列
   */
  async createCorrectElements(targetWords, problemSet) {
    const elements = []
    
    // words_poolから直接正解要素を作成
    if (problemSet.words_pool && Array.isArray(problemSet.words_pool)) {
      console.log('🎯 Creating elements from words_pool:', problemSet.words_pool)
      
      for (const wordData of problemSet.words_pool) {
        const { word, position } = wordData
        
        // コンテンツデータから対応する要素を検索
        const contentItem = this.findContentItem(word, problemSet.level, problemSet.category)
        
        if (contentItem) {
          elements.push({
            word: contentItem.word,
            type: contentItem.type,
            color: contentItem.color,
            position: position,
            japanese: contentItem.japanese,
            hint: contentItem.hint,
            isCorrect: true,
            sourceType: 'content'
          })
        } else {
          // フォールバック要素を作成
          const fallback = this.createFallbackElement(word, problemSet, position)
          elements.push(fallback)
        }
      }
    } else {
      // フォールバック: targetWordsから作成
      const positions = ['subject', 'verb', 'object']
      console.log('🎯 Creating correct elements for words:', targetWords)
      for (let i = 0; i < Math.min(targetWords.length, 3); i++) {
        const word = targetWords[i]
        const position = positions[i]
        console.log(`📍 Processing word ${i}: "${word}" → position: "${position}"`)
        
        const contentItem = this.findContentItem(word, problemSet.level, problemSet.category)
        if (contentItem) {
          elements.push({
            word: contentItem.word,
            type: contentItem.type,
            color: contentItem.color,
            position: position,
            japanese: contentItem.japanese,
            hint: contentItem.hint,
            isCorrect: true,
            sourceType: 'content'
          })
        } else {
          const fallback = this.createFallbackElement(word, problemSet, position)
          elements.push(fallback)
        }
      }
    }
    
    console.log('[problemGenerator] createCorrectElements result:', elements.map(e => ({ word: e.word, position: e.position, type: e.type })))
    return elements
  }

  /**
   * ダミー要素を作成
   * @param {Array} correctElements - 正解要素
   * @param {Object} problemSet - 問題セット
   * @param {number} count - 作成数
   * @returns {Promise<Array>} ダミー要素配列
   */
  async createDistractorElements(correctElements, problemSet, count) {
    const distractors = []
    const usedWords = new Set(correctElements.map(e => e.word))
    // 同カテゴリの他の要素を取得
    const sameCategory = this.contentData.filter(item =>
      item.level === problemSet.level &&
      item.category === problemSet.category &&
      !usedWords.has(item.word)
    )
    // 異なるカテゴリの要素を取得
    const differentCategory = this.contentData.filter(item =>
      item.level === problemSet.level &&
      item.category !== problemSet.category &&
      !usedWords.has(item.word)
    )
    // バランス良く選択（同カテゴリ30%, 異カテゴリ70%）
    const sameCategoryCount = Math.ceil(count * 0.3)
    const differentCategoryCount = count - sameCategoryCount
    // 同カテゴリから選択（positionを必ず割り当て）
    const selectedSameCategory = this.shuffleArray(sameCategory)
      .slice(0, sameCategoryCount)
      .map(item => ({
        ...item,
        isCorrect: false,
        sourceType: 'same_category_distractor',
        position: item.position || ['subject', 'verb', 'object'][Math.floor(Math.random() * 3)]
      }))
    // 異カテゴリから選択（positionを必ず割り当て）
    const selectedDifferentCategory = this.shuffleArray(differentCategory)
      .slice(0, differentCategoryCount)
      .map(item => ({
        ...item,
        isCorrect: false,
        sourceType: 'different_category_distractor',
        position: item.position || ['subject', 'verb', 'object'][Math.floor(Math.random() * 3)]
      }))
    return [...selectedSameCategory, ...selectedDifferentCategory]
  }

  /**
   * ターゲット文を解析
   * @param {string} sentence - ターゲット文
   * @returns {Array} 単語配列
   */
  parseTargetSentence(sentence) {
    const words = sentence
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .split(' ')
      .filter(word => word.length > 0)
    console.log('📝 Parsed target sentence:', sentence, '→', words)
    // 3つの単語が確実にあることを確認
    if (words.length < 3) {
      console.warn('⚠️ Target sentence has less than 3 words:', words)
      // 必要に応じてパディングやエラー処理をここで追加可能
    }
    return words
  }

  /**
   * コンテンツアイテムを検索
   * @param {string} word - 検索単語
   * @param {string} level - レベル
   * @param {string} category - カテゴリ
   * @returns {Object|null} 見つかったアイテム
   */
  findContentItem(word, level, category) {
    // 完全一致検索
    let found = this.contentData.find(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.level === level &&
      item.category === category
    )

    if (found) return found

    // レベルを無視して検索
    found = this.contentData.find(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.category === category
    )

    if (found) return found

    // カテゴリを無視して検索
    found = this.contentData.find(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.level === level
    )

    return found
  }

  /**
   * フォールバック要素を作成
   * @param {string} word - 単語
   * @param {Object} problemSet - 問題セット
   * @param {string} position - 位置
   * @returns {Object} フォールバック要素
   */
  createFallbackElement(word, problemSet, position = 'object') {
    // 基本的な推測ロジック
    let type = 'unknown'
    let color = 'blue'
    // positionは引数で必ず受け取る
    if (['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(word.toLowerCase())) {
      type = 'pronoun'
    } else if (['am', 'is', 'are', 'was', 'were'].includes(word.toLowerCase())) {
      type = 'be-verb'
    } else if (word.endsWith('s') && !['is', 'was'].includes(word.toLowerCase())) {
      type = 'general'
      color = 'red'
    }
    const fallback = {
      word: word,
      type: type,
      color: color,
      position: position, // 必ずsubject,verb,object
      japanese: `[${word}]`,
      hint: 'フォールバック要素',
      isCorrect: true,
      sourceType: 'fallback'
    }
    // デバッグ用: フォールバック要素のpositionを出力
    console.log('[problemGenerator] createFallbackElement:', fallback)
    return fallback
  }

  /**
   * 視覚テーマを取得
   * @param {string} themeName - テーマ名
   * @returns {Object} 視覚テーマ
   */
  getVisualTheme(themeName) {
    const theme = this.visualElements.find(ve => ve.keyword === themeName)

    if (theme) {
      return {
        name: themeName,
        icon: theme.icon_name,
        backgroundColor: theme.background_color,
        animation: theme.animation,
        description: theme.description_ja,
        cssClass: theme.cssClass
      }
    }

    // デフォルトテーマ
    return {
      name: 'default',
      icon: 'circle',
      backgroundColor: 'linear-gradient(135deg, #f3f4f6, #9ca3af)',
      animation: 'fade',
      description: 'デフォルトテーマ',
      cssClass: 'visual-default'
    }
  }

  /**
   * 選択重みを計算
   * @param {Object} problemSet - 問題セット
   * @returns {number} 重み値
   */
  calculateSelectionWeight(problemSet) {
    let weight = 1

    // 難易度による重み調整（簡単な問題を優先）
    const difficulty = problemSet.estimated_difficulty || problemSet.difficulty_score || 1
    weight = Math.max(0.1, 2 - (difficulty * 0.2))

    // 使用頻度による重み調整（あまり使われていない問題を優先）
    const usageCount = this.getProblemUsageCount(problemSet.set_id)
    weight *= Math.max(0.5, 2 - (usageCount * 0.3))

    return weight
  }

  /**
   * 重み付きランダム選択
   * @param {Array} candidates - 候補配列（weightプロパティ付き）
   * @returns {Object} 選択されたアイテム
   */
  selectWeightedRandom(candidates) {
    const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    for (const candidate of candidates) {
      currentWeight += candidate.weight
      if (random <= currentWeight) {
        return candidate
      }
    }

    // フォールバック
    return candidates[candidates.length - 1]
  }

  /**
   * 配列をシャッフル
   * @param {Array} array - 対象配列
   * @returns {Array} シャッフル済み配列
   */
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 利用可能なカテゴリを取得
   * @param {string} level - レベル
   * @returns {Array} カテゴリ配列
   */
  getAvailableCategories(level) {
    const categories = [...new Set(
      this.problemSets
        .filter(ps => ps.level === level)
        .map(ps => ps.category)
    )]
    return categories
  }

  /**
   * 問題使用回数を取得（将来の統計機能用）
   * @param {string} problemSetId - 問題セットID
   * @returns {number} 使用回数
   */
  getProblemUsageCount(problemSetId) {
    // 将来的にはローカルストレージやサーバーから取得
    return 0
  }

  /**
   * フォールバック問題を生成
   * @param {Object} options - オプション
   * @returns {Object} フォールバック問題
   */
  generateFallbackProblem(options) {
    console.log('🔄 フォールバック問題を生成')

    const fallbackProblems = [
      {
        id: 'fallback_1',
        problemSetId: 'fallback_1',
        level: options.level || 'beginner',
        category: 'be_verb',
        targetSentence: 'I am happy',
        hintJapanese: '私は幸せです',
        difficulty: options.difficulty || 'normal',
        estimatedDifficulty: 1,
        elements: [
          { id: 'f1', word: 'I', type: 'pronoun', color: 'blue', position: 'subject', isCorrect: true, isUsed: false },
          { id: 'f2', word: 'am', type: 'be-verb', color: 'blue', position: 'verb', isCorrect: true, isUsed: false },
          { id: 'f3', word: 'happy', type: 'adjective', color: 'blue', position: 'object', isCorrect: true, isUsed: false },
          { id: 'f4', word: 'You', type: 'pronoun', color: 'blue', position: 'subject', isCorrect: false, isUsed: false },
          { id: 'f5', word: 'sad', type: 'adjective', color: 'blue', position: 'object', isCorrect: false, isUsed: false }
        ],
        visualTheme: {
          name: 'happiness',
          icon: 'smile',
          backgroundColor: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
          animation: 'bounce'
        },
        generatedAt: new Date().toISOString()
      }
    ]

    return fallbackProblems[0]
  }

  /**
   * 難易度設定を作成
   * @returns {Object} 難易度設定
   */
  createDifficultySettings() {
    return {
      easy: {
        distractorCount: 3,
        timeLimit: 90,
        hintEnabled: true,
        visualCues: true
      },
      normal: {
        distractorCount: 5,
        timeLimit: 60,
        hintEnabled: false,
        visualCues: true
      },
      hard: {
        distractorCount: 8,
        timeLimit: 45,
        hintEnabled: false,
        visualCues: false
      }
    }
  }

  /**
   * 使用済み問題をリセット
   */
  resetUsedProblems() {
    this.usedProblemIds.clear()
    console.log('🔄 使用済み問題をリセットしました')
  }

  /**
   * 統計情報を取得
   * @returns {Object} 統計情報
   */
  getStatistics() {
    if (!this.isInitialized) {
      return { error: '初期化されていません' }
    }

    const stats = grammarContentManager.getContentStatistics(this.contentData)

    return {
      ...stats,
      problemSets: {
        total: this.problemSets.length,
        byLevel: this.groupBy(this.problemSets, 'level'),
        byCategory: this.groupBy(this.problemSets, 'category')
      },
      visualElements: this.visualElements.length,
      usedProblems: this.usedProblemIds.size,
      initialized: this.isInitialized
    }
  }

  /**
   * 配列をキーでグループ化
   * @param {Array} array - 配列
   * @param {string} key - グループ化キー
   * @returns {Object} グループ化結果
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }
}

// シングルトンインスタンス
export const problemGenerator = new ProblemGenerator()

// デバッグ用のグローバル露出（開発環境のみ）
if (import.meta.env.DEV) {
  window.problemGenerator = problemGenerator
}

// デバッグ用：問題生成テスト
async function testProblemGeneration() {
  console.log('🧪 Testing problem generation...')
  try {
    const problem = await problemGenerator.generateProblem({
      level: 'beginner',
      difficulty: 'normal'
    })
    console.log('✅ Test results:')
    console.log('- Problem generated successfully')
    console.log('- Elements:', problem.elements.length)
    const correctElements = problem.elements.filter(el => el.isCorrect)
    console.log('- Correct elements:', correctElements.length)
    console.log('- Positions:', correctElements.map(el => `${el.word}(${el.position})`))
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// グローバル露出
if (import.meta.env.DEV) {
  window.problemGenerator = problemGenerator
  window.testProblemGeneration = testProblemGeneration
}