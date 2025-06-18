const fs = require('fs');
const path = require('path');

// 対象となる音素データファイル
const phonemeFiles = [
  path.join(__dirname, '../src/data/csv/stage1_phonemes_flat.json'),
  path.join(__dirname, '../src/data/csv/stage2_phonemes_flat.json'),
  path.join(__dirname, '../src/data/csv/stage3_groups_flat.json'),
];

// 1. 必要なファイル名リストを作成
let requiredFiles = [];
phonemeFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const phonemes = JSON.parse(fs.readFileSync(file, 'utf-8'));
    phonemes.forEach(p => {
      if (p.audioFile) requiredFiles.push(p.audioFile);
    });
  } else {
    console.warn(`音素データファイルが見つかりません: ${file}`);
  }
});

// 重複を除去
requiredFiles = Array.from(new Set(requiredFiles));

// 2. soundsディレクトリのファイル一覧を取得
const soundsDir = path.join(__dirname, '../public/sounds');
let actualFiles = [];
if (fs.existsSync(soundsDir)) {
  actualFiles = fs.readdirSync(soundsDir);
} else {
  console.error('public/sounds ディレクトリが存在しません');
  process.exit(1);
}

// 3. 存在しないファイルをリストアップ
const missingFiles = requiredFiles.filter(f => !actualFiles.includes(f));
const extraFiles = actualFiles.filter(f => !requiredFiles.includes(f));

console.log('=== 存在しないファイル（必要だが無い） ===');
console.log(missingFiles.length ? missingFiles : 'なし');

console.log('\n=== 余分なファイル（不要なもの） ===');
console.log(extraFiles.length ? extraFiles : 'なし'); 