const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const VOCABULARY_IMAGES_DIR = path.join(__dirname, '../src/assets/images/vocabulary');
const OPTIMIZED_IMAGES_DIR = path.join(__dirname, '../src/assets/images/vocabulary/optimized');

// 最適化ディレクトリの作成
if (!fs.existsSync(OPTIMIZED_IMAGES_DIR)) {
  fs.mkdirSync(OPTIMIZED_IMAGES_DIR, { recursive: true });
}

// 画像の最適化
async function optimizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toFile(outputPath);

    console.log(`✅ 最適化完了: ${path.basename(inputPath)}`);
  } catch (error) {
    console.error(`❌ エラー: ${path.basename(inputPath)}`, error);
  }
}

// メイン処理
async function main() {
  const files = fs.readdirSync(VOCABULARY_IMAGES_DIR);

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(VOCABULARY_IMAGES_DIR, file);
      const outputPath = path.join(OPTIMIZED_IMAGES_DIR, file.replace(/\.(jpg|jpeg|png)$/i, '.jpg'));

      await optimizeImage(inputPath, outputPath);
    }
  }
}

main().catch(console.error); 