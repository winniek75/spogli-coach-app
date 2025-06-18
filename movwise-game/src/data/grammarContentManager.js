/**
 * Grammar Content Manager - CSV データ管理システム
 * CSVファイルの読み込み、パース、エラーハンドリングを行う
 */

import Papa from 'papaparse'
import fallbackData from '@/data/fallback_data.json'
import { validateGrammarContent, validateProblemSets, validateVisualElements } from '@/data/csvSchemas.js'

class GrammarContentManager {
  constructor() {
    this.grammarContent = null
    this.problemSets = null
    this.visualElements = null
    this.isLoaded = false
    this.loadingPromise = null
    this.errorState = null
  }

  /**
   * 全CSVデータを並行読み込み
   */
  async loadAllData() {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = this._performLoad()
    return this.loadingPromise
  }

  async _performLoad() {
    try {
      console.log('🔄 Loading CSV data...')
      const startTime = performance.now()

      // JSONファイルから並行読み込み
      const [grammarContent, problemSets, visualElements] = await Promise.all([
        this._loadJSON('/data/csv/grammar_content.json'),
        this._loadJSON('/data/csv/problem_sets.json'),
        this._loadJSON('/data/csv/visual_elements.json')
      ])

      // データ検証
      const validationResults = await this._validateAllData(
        grammarContent,
        problemSets,
        visualElements
      )

      if (!validationResults.isValid) {
        throw new Error(`Data validation failed: ${validationResults.errors.join(', ')}`)
      }

      // データ設定
      this.grammarContent = grammarContent
      this.problemSets = problemSets
      this.visualElements = visualElements
      this.isLoaded = true
      this.errorState = null

      const loadTime = performance.now() - startTime
      console.log(`✅ CSV data loaded successfully in ${loadTime.toFixed(2)}ms`)
      console.log(`📊 Loaded: ${grammarContent.length} grammar items, ${problemSets.length} problem sets, ${visualElements.length} visual elements`)

      return {
        grammarContent: this.grammarContent,
        problemSets: this.problemSets,
        visualElements: this.visualElements
      }

    } catch (error) {
      console.error('❌ Failed to load CSV data:', error)
      this.errorState = error

      // フォールバックデータを使用
      return this._loadFallbackData()
    }
  }

  /**
   * JSONファイルを読み込み
   */
  async _loadJSON(filePath) {
    try {
      console.log(`[GrammarContentManager] Fetching JSON: ${filePath}`)
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} (${response.statusText})`)
      }
      const jsonData = await response.json()
      console.log(`[GrammarContentManager] Successfully loaded ${jsonData.length} items from ${filePath}`)
      console.log(`[GrammarContentManager] Sample data from ${filePath}:`, jsonData.slice(0, 2))
      return jsonData
    } catch (error) {
      console.error(`[GrammarContentManager] JSONファイルの読み込みに失敗: ${filePath}`, error)
      console.warn(`[GrammarContentManager] ファイルが存在しないか、パスが間違っている可能性があります: ${filePath}`)
      throw new Error(`Failed to load JSON ${filePath}: ${error.message}（ファイルが存在しないか、パスが間違っている可能性があります）`)
    }
  }

  /**
   * CSVファイルを読み込みパース（互換性用）
   */
  async _loadCSV(filePath) {
    try {
      console.log(`[GrammarContentManager] Fetching CSV: ${filePath}`)
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} (${response.statusText})`)
      }
      const csvText = await response.text()
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          transformHeader: (header) => header.trim(),
          transform: (value) => {
            if (typeof value === 'string') {
              return value.trim()
            }
            return value
          },
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn(`⚠️ CSV parsing warnings for ${filePath}:`, results.errors)
            }
            resolve(results.data)
          },
          error: (error) => {
            reject(new Error(`CSV parsing error for ${filePath}: ${error.message}`))
          }
        })
      })
    } catch (error) {
      console.error(`[GrammarContentManager] CSVファイルの読み込みに失敗: ${filePath}`, error)
      console.warn(`[GrammarContentManager] ファイルが存在しないか、パスが間違っている可能性があります: ${filePath}`)
      throw new Error(`Failed to load CSV ${filePath}: ${error.message}（ファイルが存在しないか、パスが間違っている可能性があります）`)
    }
  }

  /**
   * データ検証
   */
  async _validateAllData(grammarContent, problemSets, visualElements) {
    const errors = []

    try {
      const grammarValidation = validateGrammarContent(grammarContent)
      if (!grammarValidation.isValid) {
        errors.push(`Grammar content: ${grammarValidation.errors.join(', ')}`)
      }

      const problemValidation = validateProblemSets(problemSets)
      if (!problemValidation.isValid) {
        errors.push(`Problem sets: ${problemValidation.errors.join(', ')}`)
      }

      const visualValidation = validateVisualElements(visualElements)
      if (!visualValidation.isValid) {
        errors.push(`Visual elements: ${visualValidation.errors.join(', ')}`)
      }

    } catch (error) {
      errors.push(`Validation error: ${error.message}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * フォールバックデータを読み込み
   */
  async _loadFallbackData() {
    console.log('📦 Loading fallback data...')

    try {
      this.grammarContent = fallbackData.grammarContent
      this.problemSets = fallbackData.problemSets
      this.visualElements = fallbackData.visualElements
      this.isLoaded = true

      console.log('✅ Fallback data loaded successfully')
      return {
        grammarContent: this.grammarContent,
        problemSets: this.problemSets,
        visualElements: this.visualElements
      }
    } catch (error) {
      console.error('💥 Failed to load fallback data:', error)
      throw new Error('Failed to load both CSV and fallback data')
    }
  }

  /**
   * 文法要素を取得（フィルタリング可能）
   */
  getGrammarContent(filters = {}) {
    if (!this.isLoaded) {
      throw new Error('Data not loaded. Call loadAllData() first.')
    }

    let content = this.grammarContent

    // レベルフィルタ
    if (filters.level) {
      content = content.filter(item => item.level === filters.level)
    }

    // カテゴリフィルタ
    if (filters.category) {
      content = content.filter(item => item.category === filters.category)
    }

    // タイプフィルタ
    if (filters.type) {
      content = content.filter(item => item.type === filters.type)
    }

    // 色フィルタ
    if (filters.color) {
      content = content.filter(item => item.color === filters.color)
    }

    return content
  }

  /**
   * 問題セットを取得
   */
  getProblemSets(level = null) {
    if (!this.isLoaded) {
      throw new Error('Data not loaded. Call loadAllData() first.')
    }

    if (level) {
      return this.problemSets.filter(set => set.level === level)
    }

    return this.problemSets
  }

  /**
   * 視覚的要素を取得
   */
  getVisualElement(keyword) {
    if (!this.isLoaded) {
      throw new Error('Data not loaded. Call loadAllData() first.')
    }

    const element = this.visualElements.find(item =>
      item.keyword.toLowerCase() === keyword.toLowerCase()
    )

    return element || {
      keyword: keyword,
      icon_name: 'help-circle',
      background_color: '#f3f4f6',
      animation: 'none',
      description_ja: 'デフォルト'
    }
  }

  /**
   * カテゴリ別の単語数統計
   */
  getStatistics() {
    if (!this.isLoaded) {
      return null
    }

    const stats = {
      total: this.grammarContent.length,
      byLevel: {},
      byCategory: {},
      byType: {},
      byColor: {}
    }

    this.grammarContent.forEach(item => {
      // レベル別
      stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1

      // カテゴリ別
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1

      // タイプ別
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1

      // 色別
      stats.byColor[item.color] = (stats.byColor[item.color] || 0) + 1
    })

    return stats
  }

  /**
   * データリロード
   */
  async reloadData() {
    this.isLoaded = false
    this.loadingPromise = null
    this.errorState = null
    this.grammarContent = null
    this.problemSets = null
    this.visualElements = null

    return this.loadAllData()
  }

  /**
   * ヘルスチェック
   */
  getHealthStatus() {
    return {
      isLoaded: this.isLoaded,
      hasError: !!this.errorState,
      error: this.errorState?.message,
      dataCount: {
        grammarContent: this.grammarContent?.length || 0,
        problemSets: this.problemSets?.length || 0,
        visualElements: this.visualElements?.length || 0
      },
      lastLoadTime: this.loadingPromise ? new Date().toISOString() : null
    }
  }
}

// シングルトンインスタンス
export const grammarContentManager = new GrammarContentManager()

// 便利な関数をエクスポート
export const loadGrammarData = () => grammarContentManager.loadAllData()
export const getGrammarContent = (filters) => grammarContentManager.getGrammarContent(filters)
export const getProblemSets = (level) => grammarContentManager.getProblemSets(level)
export const getVisualElement = (keyword) => grammarContentManager.getVisualElement(keyword)
export const getGrammarStats = () => grammarContentManager.getStatistics()

export default grammarContentManager