// src/data/csvSchemas.js

/**
 * CSVファイルのスキーマ定義
 * データ検証、フォールバック、型変換に使用
 */

export const GRAMMAR_CONTENT_SCHEMA = {
  tableName: 'grammar_content',
  description: '文法学習用の基本要素データ',
  columns: {
    id: {
      type: 'string',
      required: true,
      description: 'ユニークID（文字列）',
      validation: value => value && value.toString().length > 0
    },
    level: {
      type: 'string',
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      description: '学習レベル',
      validation: value => ['beginner', 'intermediate', 'advanced'].includes(value)
    },
    category: {
      type: 'string',
      required: true,
      enum: ['be_verb', 'general_verb', 'question', 'past_tense', 'complex'],
      description: '文法カテゴリ',
      validation: value => ['be_verb', 'general_verb', 'question', 'past_tense', 'complex'].includes(value)
    },
    type: {
      type: 'string',
      required: true,
      enum: [
        'pronoun', 'be-verb', 'general', 'adjective', 'noun', 'adverb',
        'question', 'auxiliary', 'time_marker', 'modal', 'perfect',
        'participle', 'conjunction', 'comparative', 'superlative',
        'article', 'quantifier', 'phrasal', 'countable', 'uncountable'
      ],
      description: '品詞・要素タイプ'
    },
    word: {
      type: 'string',
      required: true,
      description: '英単語・フレーズ',
      validation: value => value && value.trim().length > 0
    },
    color: {
      type: 'string',
      required: true,
      enum: ['blue', 'red', 'yellow', 'green', 'purple'],
      description: 'カラーコード分類',
      validation: value => ['blue', 'red', 'yellow', 'green', 'purple'].includes(value)
    },
    position: {
      type: 'string',
      required: true,
      enum: ['subject', 'verb', 'object', 'complement', 'auxiliary', 'modifier'],
      description: '文中での位置・役割'
    },
    japanese: {
      type: 'string',
      required: true,
      description: '日本語訳',
      validation: value => value && value.trim().length > 0
    },
    hint: {
      type: 'string',
      required: false,
      description: '学習ヒント',
      default: ''
    }
  },
  indexes: ['level', 'category', 'type', 'color'],
  examples: [
    {
      id: '1',
      level: 'beginner',
      category: 'be_verb',
      type: 'pronoun',
      word: 'I',
      color: 'blue',
      position: 'subject',
      japanese: '私',
      hint: '一人称代名詞'
    }
  ]
}

export const PROBLEM_SETS_SCHEMA = {
  tableName: 'problem_sets',
  description: '問題セット定義データ',
  columns: {
    set_id: {
      type: 'string',
      required: true,
      description: '問題セットのユニークID',
      validation: value => value && value.toString().length > 0
    },
    level: {
      type: 'string',
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      description: '対象学習レベル'
    },
    category: {
      type: 'string',
      required: true,
      description: '文法カテゴリ'
    },
    target_sentence: {
      type: 'string',
      required: true,
      description: '正解となる英文',
      validation: value => value && value.trim().length > 0
    },
    hint_ja: {
      type: 'string',
      required: true,
      description: '日本語でのヒント',
      validation: value => value && value.trim().length > 0
    },
    subject_id: {
      type: 'string',
      required: false,
      description: '主語要素のID参照'
    },
    verb_id: {
      type: 'string',
      required: false,
      description: '動詞要素のID参照'
    },
    complement_id: {
      type: 'string',
      required: false,
      description: '補語要素のID参照'
    },
    visual_theme: {
      type: 'string',
      required: true,
      description: '視覚テーマキーワード',
      validation: value => value && value.trim().length > 0
    },
    difficulty_score: {
      type: 'number',
      required: true,
      min: 1,
      max: 10,
      description: '難易度スコア（1-10）',
      validation: value => Number.isInteger(value) && value >= 1 && value <= 10
    }
  },
  indexes: ['level', 'category', 'difficulty_score'],
  examples: [
    {
      set_id: '1',
      level: 'beginner',
      category: 'be_verb',
      target_sentence: 'I am happy',
      hint_ja: '私は幸せです',
      subject_id: '1',
      verb_id: '8',
      complement_id: '11',
      visual_theme: 'happiness',
      difficulty_score: 1
    }
  ]
}

export const VISUAL_ELEMENTS_SCHEMA = {
  tableName: 'visual_elements',
  description: '視覚的フィードバック要素データ',
  columns: {
    keyword: {
      type: 'string',
      required: true,
      description: 'テーマキーワード',
      validation: value => value && value.trim().length > 0
    },
    icon_name: {
      type: 'string',
      required: true,
      description: 'Lucide Iconsのアイコン名',
      validation: value => value && value.trim().length > 0
    },
    background_color: {
      type: 'string',
      required: true,
      description: 'CSS backgroundプロパティ値',
      validation: value => value && (value.includes('gradient') || value.includes('#'))
    },
    animation: {
      type: 'string',
      required: true,
      enum: [
        'bounce', 'pulse', 'shake', 'fade', 'rotate', 'slide', 'flip', 'glow',
        'fly', 'wiggle', 'spin', 'wave', 'tick', 'write', 'twinkle', 'reverse',
        'present', 'alert', 'question', 'drift', 'explore', 'complete',
        'connect', 'split', 'branch', 'discover', 'schedule', 'victory',
        'unlock', 'chat', 'warm', 'relate', 'kind', 'sparkle', 'negative',
        'recent', 'wait', 'land', 'healthy', 'cycle', 'compare', 'aim',
        'bloom', 'group', 'solve'
      ],
      description: 'アニメーション名'
    },
    description_ja: {
      type: 'string',
      required: true,
      description: '日本語での説明',
      validation: value => value && value.trim().length > 0
    }
  },
  indexes: ['keyword'],
  examples: [
    {
      keyword: 'happiness',
      icon_name: 'smile',
      background_color: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
      animation: 'bounce',
      description_ja: '幸せな気持ちを表現'
    }
  ]
}

/**
 * データ検証関数
 * @param {Object} data - 検証対象データ
 * @param {Object} schema - スキーマ定義
 * @returns {Object} 検証結果
 */
export function validateData(data, schema) {
  const errors = []
  const warnings = []
  const validatedData = {}

  Object.entries(schema.columns).forEach(([columnName, columnSchema]) => {
    const value = data[columnName]

    // 必須チェック
    if (columnSchema.required && (value === undefined || value === null || value === '')) {
      errors.push(`必須フィールド '${columnName}' が不足しています`)
      return
    }

    // デフォルト値設定
    if (value === undefined || value === null) {
      validatedData[columnName] = null
      return
    }

    // 型変換
    let convertedValue = value
    try {
      switch (columnSchema.type) {
        case 'string':
          convertedValue = String(value).trim()
          break
        case 'number':
          convertedValue = Number(value)
          if (isNaN(convertedValue)) {
            errors.push(`フィールド '${columnName}' は数値である必要があります: ${value}`)
            return
          }
          break
        case 'boolean':
          convertedValue = Boolean(value)
          break
        case 'array':
          if (typeof value === 'string') {
            convertedValue = value.split(',').map(item => item.trim())
          } else if (!Array.isArray(value)) {
            errors.push(`フィールド '${columnName}' は配列である必要があります: ${value}`)
            return
          }
          break
      }
    } catch (error) {
      errors.push(`フィールド '${columnName}' の型変換に失敗しました: ${error.message}`)
      return
    }

    // Enum チェック
    if (columnSchema.enum && !columnSchema.enum.includes(convertedValue)) {
      errors.push(`フィールド '${columnName}' の値 '${convertedValue}' は許可されていません。許可値: ${columnSchema.enum.join(', ')}`)
      return
    }

    // 範囲チェック（数値）
    if (columnSchema.type === 'number') {
      if (columnSchema.min !== undefined && convertedValue < columnSchema.min) {
        errors.push(`フィールド '${columnName}' は ${columnSchema.min} 以上である必要があります: ${convertedValue}`)
        return
      }
      if (columnSchema.max !== undefined && convertedValue > columnSchema.max) {
        errors.push(`フィールド '${columnName}' は ${columnSchema.max} 以下である必要があります: ${convertedValue}`)
        return
      }
    }

    // カスタム検証
    if (columnSchema.validation && typeof columnSchema.validation === 'function') {
      try {
        const isValid = columnSchema.validation(convertedValue)
        if (!isValid) {
          errors.push(`フィールド '${columnName}' のカスタム検証に失敗しました: ${convertedValue}`)
          return
        }
      } catch (error) {
        errors.push(`フィールド '${columnName}' のカスタム検証でエラーが発生しました: ${error.message}`)
        return
      }
    }

    validatedData[columnName] = convertedValue
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: validatedData,
    originalData: data
  }
}

/**
 * CSV行データのバッチ検証
 * @param {Array} rows - CSV行データ配列
 * @param {Object} schema - スキーマ定義
 * @returns {Object} バッチ検証結果
 */
export function validateCSVRows(rows, schema) {
  const results = {
    totalRows: rows.length,
    validRows: [],
    invalidRows: [],
    errors: [],
    warnings: [],
    statistics: {
      validCount: 0,
      invalidCount: 0,
      errorCount: 0,
      warningCount: 0
    }
  }

  rows.forEach((row, index) => {
    const validation = validateData(row, schema)

    if (validation.isValid) {
      results.validRows.push({
        index,
        data: validation.data
      })
      results.statistics.validCount++
    } else {
      results.invalidRows.push({
        index,
        data: row,
        errors: validation.errors,
        warnings: validation.warnings
      })
      results.statistics.invalidCount++
      results.errors.push(...validation.errors.map(error => `行 ${index + 1}: ${error}`))
    }

    results.warnings.push(...validation.warnings.map(warning => `行 ${index + 1}: ${warning}`))
    results.statistics.errorCount += validation.errors.length
    results.statistics.warningCount += validation.warnings.length
  })

  return results
}

/**
 * スキーマからサンプルデータを生成
 * @param {Object} schema - スキーマ定義
 * @param {number} count - 生成するサンプル数
 * @returns {Array} サンプルデータ配列
 */
export function generateSampleData(schema, count = 3) {
  const samples = []

  for (let i = 0; i < count; i++) {
    const sample = {}

    Object.entries(schema.columns).forEach(([columnName, columnSchema]) => {
      switch (columnSchema.type) {
        case 'string':
          if (columnSchema.enum) {
            sample[columnName] = columnSchema.enum[i % columnSchema.enum.length]
          } else {
            sample[columnName] = `sample_${columnName}_${i + 1}`
          }
          break
        case 'number':
          const min = columnSchema.min || 1
          const max = columnSchema.max || 10
          sample[columnName] = min + (i % (max - min + 1))
          break
        case 'boolean':
          sample[columnName] = i % 2 === 0
          break
        case 'array':
          sample[columnName] = [`item1_${i}`, `item2_${i}`]
          break
        default:
          sample[columnName] = columnSchema.default || null
      }
    })

    samples.push(sample)
  }

  return samples
}

/**
 * スキーマからCSVヘッダーを生成
 * @param {Object} schema - スキーマ定義
 * @returns {Array} CSVヘッダー配列
 */
export function generateCSVHeaders(schema) {
  return Object.keys(schema.columns)
}

/**
 * CSVファイルのドキュメントを生成
 * @param {Object} schema - スキーマ定義
 * @returns {string} Markdown形式のドキュメント
 */
export function generateSchemaDocumentation(schema) {
  let doc = `# ${schema.tableName} データ仕様\n\n`
  doc += `${schema.description}\n\n`

  doc += `## カラム定義\n\n`
  doc += `| カラム名 | 型 | 必須 | 説明 | 制約 |\n`
  doc += `|----------|------|------|------|------|\n`

  Object.entries(schema.columns).forEach(([columnName, columnSchema]) => {
    const required = columnSchema.required ? '✓' : ''
    const constraints = []

    if (columnSchema.enum) {
      constraints.push(`値: ${columnSchema.enum.join(', ')}`)
    }
    if (columnSchema.min !== undefined) {
      constraints.push(`最小: ${columnSchema.min}`)
    }
    if (columnSchema.max !== undefined) {
      constraints.push(`最大: ${columnSchema.max}`)
    }

    doc += `| ${columnName} | ${columnSchema.type} | ${required} | ${columnSchema.description} | ${constraints.join('; ')} |\n`
  })

  if (schema.examples && schema.examples.length > 0) {
    doc += `\n## サンプルデータ\n\n`
    doc += `\`\`\`json\n`
    doc += JSON.stringify(schema.examples[0], null, 2)
    doc += `\n\`\`\`\n`
  }

  if (schema.indexes && schema.indexes.length > 0) {
    doc += `\n## インデックス\n\n`
    schema.indexes.forEach(index => {
      doc += `- ${index}\n`
    })
  }

  return doc
}

/**
 * エラーメッセージを日本語でフォーマット
 * @param {Array} errors - エラー配列
 * @returns {string} フォーマット済みエラーメッセージ
 */
export function formatErrorMessages(errors) {
  if (errors.length === 0) {
    return '✅ データ検証に成功しました'
  }

  let message = `❌ ${errors.length}件のエラーが発見されました:\n\n`
  errors.forEach((error, index) => {
    message += `${index + 1}. ${error}\n`
  })

  return message
}

/**
 * データ品質レポートを生成
 * @param {Object} validationResults - 検証結果
 * @returns {Object} 品質レポート
 */
export function generateDataQualityReport(validationResults) {
  const { statistics, totalRows } = validationResults

  const qualityScore = totalRows > 0 ? Math.round((statistics.validCount / totalRows) * 100) : 0

  let qualityLevel = 'Poor'
  if (qualityScore >= 95) qualityLevel = 'Excellent'
  else if (qualityScore >= 85) qualityLevel = 'Good'
  else if (qualityScore >= 70) qualityLevel = 'Fair'

  return {
    qualityScore,
    qualityLevel,
    summary: {
      totalRows,
      validRows: statistics.validCount,
      invalidRows: statistics.invalidCount,
      errorCount: statistics.errorCount,
      warningCount: statistics.warningCount
    },
    recommendations: generateRecommendations(validationResults)
  }
}

/**
 * データ改善の推奨事項を生成
 * @param {Object} validationResults - 検証結果
 * @returns {Array} 推奨事項配列
 */
function generateRecommendations(validationResults) {
  const recommendations = []
  const { statistics, errors } = validationResults

  if (statistics.invalidCount > 0) {
    recommendations.push(`${statistics.invalidCount}行の無効なデータを修正してください`)
  }

  if (statistics.errorCount > statistics.invalidCount) {
    recommendations.push('複数のエラーがある行があります。データ形式を確認してください')
  }

  // 共通エラーパターンの検出
  const errorPatterns = {}
  errors.forEach(error => {
    const pattern = error.split(':')[1]?.trim() || error
    errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1
  })

  Object.entries(errorPatterns)
    .filter(([pattern, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .forEach(([pattern, count]) => {
      recommendations.push(`"${pattern}" エラーが${count}回発生しています。データ入力ルールを確認してください`)
    })

  if (recommendations.length === 0) {
    recommendations.push('データ品質は良好です！')
  }

  return recommendations
}

// スキーマのエクスポート
export const SCHEMAS = {
  grammar_content: GRAMMAR_CONTENT_SCHEMA,
  problem_sets: PROBLEM_SETS_SCHEMA,
  visual_elements: VISUAL_ELEMENTS_SCHEMA
}

// デバッグ用のグローバル露出（開発環境のみ）
if (import.meta.env.DEV) {
  window.csvSchemas = {
    SCHEMAS,
    validateData,
    validateCSVRows,
    generateSampleData,
    generateSchemaDocumentation,
    formatErrorMessages,
    generateDataQualityReport
  }
}

export function validateGrammarContent(data) {
  if (!Array.isArray(data)) {
    return validateData(data, GRAMMAR_CONTENT_SCHEMA)
  }
  return validateCSVRows(data, GRAMMAR_CONTENT_SCHEMA)
}

export function validateProblemSets(data) {
  if (!Array.isArray(data)) {
    return validateData(data, PROBLEM_SETS_SCHEMA)
  }
  return validateCSVRows(data, PROBLEM_SETS_SCHEMA)
}

export function validateVisualElements(data) {
  if (!Array.isArray(data)) {
    return validateData(data, VISUAL_ELEMENTS_SCHEMA)
  }
  return validateCSVRows(data, VISUAL_ELEMENTS_SCHEMA)
}