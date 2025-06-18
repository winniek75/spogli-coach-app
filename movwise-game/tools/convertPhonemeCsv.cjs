const fs = require('fs')
const path = require('path')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/lib/sync')

// 共通変換関数
function convertGroupCsvToFlat(inputPath, outputPath, options = {}) {
  const csvContent = fs.readFileSync(inputPath, 'utf-8')
  const records = parse(csvContent, { columns: true, skip_empty_lines: true })
  const flatRows = []
  for (const row of records) {
    // phonemesカラムを分割
    const phonemeList = (row.phonemes || row.phoneme || '').split(',').map(p => p.trim().replace(/^"|"$/g, ''))
    const wordList = (row.word_examples || row.example_word || '').split(',').map(w => w.trim())
    for (let i = 0; i < phonemeList.length; i++) {
      // 記号や余分な文字を除去
      const cleanSymbol = phonemeList[i]
        .replace(/[\/-]/g, '') // スラッシュ・ハイフン除去
        .replace(/\s+/g, '')   // 空白除去
        .replace(/^"|"$/g, '') // ダブルクォート除去
      flatRows.push({
        symbol: cleanSymbol,
        ipa: phonemeList[i],
        audioFile: cleanSymbol + '.m4a',
        example_word: wordList[i] || '',
        group: row.group_name || row.group || '',
        group_type: row.group_type || '',
        group_description: row.group_description || '',
        difficulty: row.difficulty_level || row.difficulty || '',
        visual_cue: row.visual_cue || '',
        feature_tip: row.feature_tip || '',
        ...options.extraFields
      })
    }
  }
  const csvOut = stringify(flatRows, { header: true })
  fs.writeFileSync(outputPath, csvOut, 'utf-8')
  console.log('変換完了:', outputPath)
}

// Stage1
convertGroupCsvToFlat(
  path.resolve(__dirname, '../src/data/csv/stage1_phonemes.csv'),
  path.resolve(__dirname, '../src/data/csv/stage1_phonemes_flat.csv')
)
// Stage2
convertGroupCsvToFlat(
  path.resolve(__dirname, '../src/data/csv/stage2_phonemes.csv'),
  path.resolve(__dirname, '../src/data/csv/stage2_phonemes_flat.csv')
)
// Stage3
convertGroupCsvToFlat(
  path.resolve(__dirname, '../src/data/csv/stage3_groups.csv'),
  path.resolve(__dirname, '../src/data/csv/stage3_groups_flat.csv')
) 