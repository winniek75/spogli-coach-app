import fs from 'fs'
import { parse } from 'csv-parse/sync'

function fixSoundHunter() {
  const file = 'src/data/csv/sound_hunter.csv'
  const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/)
  // 9カラムのヘッダーに修正
  const header = 'level,word,sounds,correct_phoneme,distractor1,distractor2,distractor3,category,difficulty'
  const fixed = [header]
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cols = lines[i].split(',')
    // soundsカラム（3番目）をダブルクォートで囲む
    cols[2] = '"' + cols[2].replace(/"/g, '').replace(/\|/g, '|') + '"'
    // distractorsを3カラムに分割
    let distractors = [cols[4], cols[5], cols[6]]
    distractors = distractors.map(d => '"' + d.replace(/"/g, '').replace(/\|/g, '|') + '"')
    // 新しいカラム構成に再構成
    const newCols = [cols[0], cols[1], cols[2], cols[3], ...distractors, cols[7], cols[8]]
    fixed.push(newCols.join(','))
  }
  fs.writeFileSync(file, fixed.join('\n'), 'utf-8')
}

function fixRhymingWords() {
  const file = 'src/data/csv/rhyming_words.csv'
  const content = fs.readFileSync(file, 'utf-8')
  const records = parse(content, { columns: false, skip_empty_lines: true })
  const fixed = []
  fixed.push(records[0].join(',')) // header
  for (let i = 1; i < records.length; i++) {
    const cols = records[i]
    if (!cols.length) continue
    // rhymes, non_rhymesカラム（4,5番目）をダブルクォートで囲む
    cols[3] = '"' + cols[3].replace(/"/g, '').replace(/\|/g, '|') + '"'
    cols[4] = '"' + cols[4].replace(/"/g, '').replace(/\|/g, '|') + '"'
    fixed.push(cols.join(','))
  }
  fs.writeFileSync(file, fixed.join('\n'), 'utf-8')
}

fixSoundHunter()
fixRhymingWords()
console.log('修正完了') 