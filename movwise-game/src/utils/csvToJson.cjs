const fs = require('fs')
const path = require('path')
const parse = require('csv-parse/lib/sync')

const csvFiles = [
  'problem_sets.csv',
  'grammar_content.csv',
  'visual_elements.csv'
]

const csvDir = path.resolve(__dirname, '../data/csv')

function convertCsvToJson(csvFilePath) {
  try {
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
    // コメント行を除去
    const cleanedContent = csvContent
      .split('\n')
      .filter(line => !line.startsWith('##') && !line.startsWith('//') && line.trim() !== '')
      .join('\n')
    
    const records = parse(cleanedContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ',',
      quote: '"',
      escape: '"'
    })
    // soundsやblendsなど配列化が必要なカラムを自動判定
    const arrayFields = ['sounds', 'blends', 'non_blends', 'distractors', 'rhymes', 'non_rhymes', 'example_word_sounds', 'words_pool']
    const formattedData = records.map(record => {
      const obj = { ...record }
      for (const key of arrayFields) {
        if (obj[key]) {
          obj[key] = obj[key].split(/[|,]/).map(s => s.trim())
        }
      }
      // 数値化できるものは数値化
      if (obj.level) obj.level = parseInt(obj.level)
      if (obj.set_id) obj.set_id = parseInt(obj.set_id)
      if (obj.estimated_difficulty) obj.estimated_difficulty = parseFloat(obj.estimated_difficulty)
      if (obj.difficulty_score) obj.difficulty_score = parseFloat(obj.difficulty_score)
      if (obj.frequency) obj.frequency = parseInt(obj.frequency)
      
      // words_poolの特別な処理（problem_sets.csv用）
      if (obj.words_pool && Array.isArray(obj.words_pool)) {
        obj.words_pool = obj.words_pool.map(pair => {
          const [word, position] = pair.split(':').map(s => s.trim())
          return { word, position }
        })
      }
      
      // levelの修正（levelカラムがない場合はcategoryベースで設定）
      if (obj.level === null || obj.level === undefined) {
        if (obj.category === 'beVerb' || obj.category === 'generalVerb') {
          obj.level = 'beginner'
        } else if (obj.category === 'whQuestion' || obj.category === 'pastTense') {
          obj.level = 'intermediate'
        } else {
          obj.level = 'advanced'
        }
      }
      
      return obj
    })
    const jsonFilePath = csvFilePath.replace('.csv', '.json')
    fs.writeFileSync(jsonFilePath, JSON.stringify(formattedData, null, 2), 'utf-8')
    return { success: true, message: `変換が完了しました: ${jsonFilePath}` }
  } catch (error) {
    return { success: false, message: `エラーが発生しました: ${error.message}` }
  }
}

for (const file of csvFiles) {
  const csvPath = path.join(csvDir, file)
  const result = convertCsvToJson(csvPath)
  console.log(result.message)
} 