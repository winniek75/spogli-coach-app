<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-purple-700 mb-8 text-center">CVCワード・ファクトリー</h1>
      
      <!-- ゲームモード選択 -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-4">ゲームモード</h2>
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="mode in ['random', 'level', 'category']"
            :key="mode"
            @click="localGameMode = mode"
            class="p-4 rounded-xl text-center transition-all duration-200"
            :class="localGameMode === mode ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ modeLabels[mode] }}
          </button>
        </div>
      </div>

      <!-- レベル選択（レベルモード時） -->
      <div v-if="localGameMode === 'level'" class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-4">レベル選択</h2>
        <div class="grid grid-cols-6 gap-4">
          <button
            v-for="level in 6"
            :key="level"
            @click="localCurrentLevel = level"
            class="p-4 rounded-xl text-center transition-all duration-200 relative"
            :class="localCurrentLevel === level ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
          >
            <div>レベル {{ level }}</div>
            <div class="text-sm mt-1">{{ levelDifficultyMap[level] }}</div>
            <div class="text-xs mt-1">{{ getLevelQuestionCount(level) }}問</div>
          </button>
        </div>
      </div>

      <!-- カテゴリー選択（カテゴリーモード時） -->
      <div v-if="localGameMode === 'category'" class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-4">カテゴリー選択</h2>
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="category in categories"
            :key="category"
            @click="localSelectedCategory = category"
            class="p-4 rounded-xl text-center transition-all duration-200 relative"
            :class="localSelectedCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
          >
            <div>{{ categoryLabels[category] || category }}</div>
            <div v-if="category !== 'all'" class="text-sm mt-1">
              {{ getCategoryProgress(category).total }}問
            </div>
          </button>
        </div>

        <!-- サブカテゴリー選択 -->
        <div v-if="localSelectedCategory !== 'all'" class="mt-6">
          <h3 class="text-xl font-bold text-purple-700 mb-4">サブカテゴリー</h3>
          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="subcategory in filteredSubcategories"
              :key="subcategory"
              @click="localSelectedSubcategory = subcategory"
              class="p-4 rounded-xl text-center transition-all duration-200"
              :class="localSelectedSubcategory === subcategory ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
            >
              {{ subcategoryLabels[subcategory] || subcategory }}
            </button>
          </div>
        </div>
      </div>

      <!-- 難易度選択 -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-4">難易度</h2>
        <div class="grid grid-cols-7 gap-4">
          <button
            v-for="diff in ['all', 'easy', 'medium', 'hard', 'veryhard', 'extreme', 'expert']"
            :key="diff"
            @click="localDifficulty = diff"
            class="p-4 rounded-xl text-center transition-all duration-200"
            :class="localDifficulty === diff ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ difficultyLabels[diff] }}
          </button>
        </div>
      </div>

      <!-- 問題数選択 -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-4">問題数</h2>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="count in [5, 10, 15, 20]"
            :key="count"
            @click="localQuestionCount = count"
            class="p-4 rounded-xl text-center transition-all duration-200"
            :class="localQuestionCount === count ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ count }}問
          </button>
        </div>
      </div>

      <!-- 開始ボタン -->
      <div class="text-center">
        <button
          @click="startGame"
          class="bg-gradient-to-r from-yellow-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-200 text-xl"
        >
          ゲーム開始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameSettingsStore } from '../../stores/gameSettings'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'

const router = useRouter()
const store = useGameSettingsStore()

// ローカル状態で管理
const localGameMode = ref(store.gameMode)
const localDifficulty = ref(store.difficulty)
const localQuestionCount = ref(store.questionCount)
const localSelectedCategory = ref(store.selectedCategory)
const localSelectedSubcategory = ref(store.selectedSubcategory)
const localCurrentLevel = ref(store.currentLevel)

// ストアの状態を直接参照
const {
  categories,
  subcategories,
  getLevelProgress,
  getCategoryProgress,
  getLevelQuestionCount,
  getCategoryQuestionCount,
  levelDifficultyMap,
  difficultyLevelRange
} = store

// ラベル定義
const modeLabels = {
  random: 'ランダム',
  level: 'レベル選択',
  category: 'カテゴリー選択'
}

const categoryLabels = {
  all: 'すべて',
  animals: '動物',
  people: '人',
  things: '物',
  food: '食べ物',
  actions: '行動',
  feelings: '感情',
  colors: '色',
  body: '体の部位',
  places: '場所',
  vehicles: '乗り物',
  nature: '自然',
  clothes: '衣類',
  adjectives: '形容詞',
  numbers: '数字',
  responses: '返答',
  activities: '活動',
  activities: '活動',
  trends: '流行',
  slang: 'スラング',
  units: '単位',
  knowledge: '知識',
  currency: '通貨',
  philosophy: '哲学',
  sounds: '音',
  drinks: '飲み物',
  family: '家族',
  religion: '宗教',
  materials: '材料',
  dance: 'ダンス',
  sewing: '裁縫',
  minerals: '鉱物',
  structures: '構造物',
  mechanics: '機械',
  cooking: '料理',
  verbs: '動詞',
  navigation: 'ナビゲーション',
  containers: '容器',
  sports: 'スポーツ',
  diseases: '病気',
  voice: '声',
  titles: '称号',
  magic: '魔法',
  biology: '生物学',
  archaic: '古語',
  tools: '道具',
  limits: '限界',
  peace: '平和',
  finance: '金融',
  images: '画像',
  corn: 'トウモロコシ',
  accessories: 'アクセサリー',
  work: '仕事',
  groups: 'グループ',
  fish: '魚',
  style: 'スタイル',
  animals: '動物'
}

const subcategoryLabels = {
  all: 'すべて',
  pets: 'ペット',
  wild: '野生動物',
  family: '家族',
  jobs: '職業',
  furniture: '家具',
  toys: 'おもちゃ',
  fruits: '果物',
  vegetables: '野菜',
  happy: '嬉しい',
  sad: '悲しい',
  primary: '基本色',
  secondary: '中間色',
  face: '顔',
  limbs: '手足',
  indoor: '屋内',
  outdoor: '屋外',
  land: '陸上',
  water: '水上',
  air: '空',
  weather: '天気',
  seasons: '季節',
  tops: '上着',
  bottoms: '下着',
  accessories: 'アクセサリー'
}

const difficultyLabels = {
  all: 'すべて',
  easy: '初級 (Lv.1)',
  medium: '中級 (Lv.2)',
  hard: '上級 (Lv.3)',
  veryhard: '超上級 (Lv.4)',
  extreme: '極上級 (Lv.5)',
  expert: '達人級 (Lv.6)'
}

// コンピューテッドプロパティ
const filteredSubcategories = computed(() => {
  if (localSelectedCategory === 'all') return ['all']
  return subcategories.value.filter(sub => {
    const data = store.getQuestions()
    return data.some(item => item.subcategory === sub)
  })
})

// メソッド
const startGame = () => {
  store.gameMode = localGameMode
  store.difficulty = localDifficulty
  store.questionCount = localQuestionCount
  store.selectedCategory = localSelectedCategory
  store.selectedSubcategory = localSelectedSubcategory
  store.currentLevel = localCurrentLevel
  router.push('/games/cvc')
}
</script> 