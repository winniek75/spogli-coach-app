import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Pixabay APIの設定
const PIXABAY_API_KEY = '50617826-cb68158e0399e45f362aa9eee'
const PIXABAY_API_URL = 'https://pixabay.com/api/'
const API_RETRY_DELAY = 1000 // 1秒
const MAX_RETRIES = 3

const VOCABULARY_IMAGES_DIR = path.join(__dirname, '../src/assets/images/vocabulary')

// 画像ディレクトリの作成
if (!fs.existsSync(VOCABULARY_IMAGES_DIR)) {
  fs.mkdirSync(VOCABULARY_IMAGES_DIR, { recursive: true })
}

// 既存の画像をチェック
const existingImages = new Set(fs.readdirSync(VOCABULARY_IMAGES_DIR))

// 語彙データベース
const vocabularyDatabase = {
  beginner: [
    {
      english: 'apple',
      japanese: 'りんご',
      category: 'food',
      distractors: ['orange', 'banana', 'grape']
    },
    {
      english: 'book',
      japanese: '本',
      category: 'object',
      distractors: ['pen', 'pencil', 'notebook']
    },
    {
      english: 'cat',
      japanese: '猫',
      category: 'animal',
      distractors: ['dog', 'bird', 'fish']
    },
    {
      english: 'house',
      japanese: '家',
      category: 'building',
      distractors: ['school', 'hospital', 'store']
    },
    {
      english: 'car',
      japanese: '車',
      category: 'vehicle',
      distractors: ['bus', 'train', 'plane']
    },
    {
      english: 'sun',
      japanese: '太陽',
      category: 'nature',
      distractors: ['moon', 'star', 'cloud']
    },
    {
      english: 'water',
      japanese: '水',
      category: 'drink',
      distractors: ['milk', 'juice', 'coffee']
    },
    {
      english: 'tree',
      japanese: '木',
      category: 'nature',
      distractors: ['flower', 'grass', 'leaf']
    },
    {
      english: 'happy',
      japanese: '嬉しい',
      category: 'emotion',
      distractors: ['sad', 'angry', 'tired']
    },
    {
      english: 'ball',
      japanese: 'ボール',
      category: 'toy',
      distractors: ['doll', 'game', 'puzzle']
    }
  ],
  intermediate: [
    {
      english: 'beautiful',
      japanese: '美しい',
      category: 'adjective',
      distractors: ['pretty', 'lovely', 'wonderful']
    },
    {
      english: 'restaurant',
      japanese: 'レストラン',
      category: 'place',
      distractors: ['cafe', 'hotel', 'market']
    },
    {
      english: 'computer',
      japanese: 'コンピュータ',
      category: 'technology',
      distractors: ['phone', 'tablet', 'camera']
    },
    {
      english: 'medicine',
      japanese: '薬',
      category: 'health',
      distractors: ['doctor', 'hospital', 'nurse']
    },
    {
      english: 'vacation',
      japanese: '休暇',
      category: 'activity',
      distractors: ['holiday', 'weekend', 'break']
    }
  ],
  advanced: [
    {
      english: 'philosophy',
      japanese: '哲学',
      category: 'academic',
      distractors: ['psychology', 'sociology', 'anthropology']
    },
    {
      english: 'sustainability',
      japanese: '持続可能性',
      category: 'concept',
      distractors: ['reliability', 'responsibility', 'accountability']
    },
    {
      english: 'entrepreneur',
      japanese: '起業家',
      category: 'business',
      distractors: ['manager', 'executive', 'consultant']
    }
  ]
}

// 検索クエリの生成
function generateSearchQuery(word, category) {
  // カテゴリに基づいて検索クエリを生成
  const categoryQueries = {
    'nature': `${word} nature`,
    'animal': `${word} animal`,
    'food': `${word} food`,
    'object': `${word} object`,
    'building': `${word} building`,
    'vehicle': `${word} vehicle`,
    'drink': `${word} drink`,
    'emotion': `${word} emotion`,
    'toy': `${word} toy`,
    'adjective': `${word} beautiful`,
    'place': `${word} place`,
    'technology': `${word} technology`,
    'health': `${word} health`,
    'activity': `${word} activity`,
    'academic': `${word} academic`,
    'concept': `${word} concept`,
    'business': `${word} business`,
    'art': `${word} art`
  };

  return categoryQueries[category] || `${word} photo`;
}

// 画像のダウンロード
async function downloadImage(word, category, retryCount = 0) {
  const imagePath = path.join(VOCABULARY_IMAGES_DIR, `${word}.jpg`)

  // 既存の画像をスキップ
  if (existingImages.has(`${word}.jpg`)) {
    console.log(`✅ 既存の画像をスキップ: ${word}`)
    return imagePath
  }

  try {
    const query = generateSearchQuery(word, category)
    console.log(`🔍 検索クエリ: ${query}`)

    // APIリクエストの間隔を増やす
    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = await fetch(`${PIXABAY_API_URL}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=1&safesearch=true`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.hits && data.hits.length > 0) {
      const imageUrl = data.hits[0].webformatURL
      const imageResponse = await fetch(imageUrl)

      if (!imageResponse.ok) {
        throw new Error(`Image download error: ${imageResponse.status} ${imageResponse.statusText}`)
      }

      const imageBuffer = await imageResponse.buffer()

      // 画像の最適化
      await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toFile(imagePath)

      console.log(`✅ 画像をダウンロード: ${word}`)
      return imagePath
    } else {
      console.warn(`⚠️ 画像が見つかりません: ${word}`)
      return null
    }
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`⚠️ リトライ中 (${retryCount + 1}/${MAX_RETRIES}): ${word}`)
      // リトライ間隔を増やす
      await new Promise(resolve => setTimeout(resolve, API_RETRY_DELAY * (retryCount + 1)))
      return downloadImage(word, category, retryCount + 1)
    }
    console.error(`❌ エラー: ${word}`, error.message)
    return null
  }
}

// メイン処理
async function main() {
  console.log('🚀 画像のダウンロードを開始...')

  const vocabularyData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/vocabulary.json'), 'utf8'))
  const totalWords = { ...vocabularyData.metadata.totalWords }

  for (const [categoryKey, category] of Object.entries(vocabularyData.categories)) {
    console.log(`\n📚 ${category.name}の単語を処理中...`)

    for (const [levelKey, words] of Object.entries(category.levels)) {
      if (words.length > 0) {
        console.log(`\n  📖 ${levelKey}レベルの単語を処理中...`)

        for (const word of words) {
          const imagePath = await downloadImage(word.english, word.category)
          if (imagePath) {
            word.image = `/src/assets/images/vocabulary/${word.english}.jpg`
            totalWords[categoryKey][levelKey]++
          }
        }
      }
    }
  }

  // メタデータの更新
  vocabularyData.metadata.lastUpdated = new Date().toISOString().split('T')[0]
  vocabularyData.metadata.totalWords = totalWords

  // データベースの保存
  const databasePath = path.join(__dirname, '../src/data/vocabulary.json')
  fs.writeFileSync(databasePath, JSON.stringify(vocabularyData, null, 2))

  console.log('\n✨ 完了！')
}

main().catch(console.error) 