<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
      <div class="cosmic-kitchen-bg"></div>
    </div>

    <!-- Game Header -->
    <div class="relative z-10 p-4">
      <div class="flex items-center justify-between mb-4">
        <button 
          @click="goBack"
          class="flex items-center gap-2 galaxy-button galaxy-button-secondary px-4 py-2 rounded-full font-bold transition-all shadow-lg"
        >
          <ArrowLeft class="w-5 h-5" />
          戻る
        </button>

        <h1 class="text-3xl font-bold text-center">
          <span class="galaxy-text-primary cosmic-glow">
            👨‍🍳 宇宙魔法クッキング
          </span>
        </h1>

        <button 
          @click="toggleSound"
          :class="[
            'p-2 rounded-full font-bold transition-all shadow-lg',
            soundEnabled 
              ? 'galaxy-button galaxy-button-primary' 
              : 'galaxy-button galaxy-button-secondary'
          ]"
        >
          <Volume2 v-if="soundEnabled" class="w-5 h-5" />
          <VolumeX v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Cooking Stats -->
      <div class="flex justify-center gap-4 mb-6">
        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Trophy class="w-5 h-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ score }}点</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Clock class="w-5 h-5 text-blue-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ Math.max(0, timeLeft) }}秒</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Target class="w-5 h-5 text-green-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ completedDishes }}/{{ targetDishes }}</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Star class="w-5 h-5 text-purple-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ chefRank }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Cooking Area -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
      <!-- Game Start Screen -->
      <div v-if="gameState === 'start'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <div class="text-6xl mb-6">👨‍🍳</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-4">
            宇宙レストラン開店！
          </h2>
          <p class="text-lg text-galaxy-moon-silver mb-6">
            魔法の力で材料を変身させて<br>
            美味しい宇宙料理を作ろう！
          </p>
          
          <div class="space-y-4 mb-6">
            <div class="galaxy-card rounded-xl p-4">
              <div class="text-sm text-galaxy-moon-silver mb-2">料理方法:</div>
              <div class="space-y-2 text-sm">
                <div>1. レシピを確認</div>
                <div>2. 材料を正しく発音</div>
                <div>3. 魔法で材料を変身</div>
                <div>4. 料理完成でポイント獲得</div>
              </div>
            </div>
          </div>

          <button
            @click="startCooking"
            class="galaxy-button galaxy-button-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            料理開始！
          </button>
        </div>
      </div>

      <!-- Cooking Game -->
      <div v-else-if="gameState === 'cooking'" class="w-full max-w-6xl">
        <!-- Current Recipe -->
        <div class="text-center mb-8">
          <div class="galaxy-card rounded-2xl p-6 max-w-md mx-auto">
            <div class="text-2xl font-bold text-yellow-400 mb-4">
              {{ currentRecipe?.name }}
            </div>
            <div class="text-6xl mb-4">{{ currentRecipe?.emoji }}</div>
            <div class="text-lg text-galaxy-moon-silver mb-4">
              {{ currentRecipe?.description }}
            </div>
            
            <!-- Recipe Steps -->
            <div class="space-y-2">
              <div 
                v-for="(step, index) in currentRecipe?.steps" 
                :key="index"
                :class="[
                  'text-sm p-2 rounded-lg transition-all',
                  step.completed 
                    ? 'bg-green-900 text-green-200' 
                    : index === currentStep 
                      ? 'bg-blue-900 text-blue-200 ring-2 ring-blue-400'
                      : 'bg-gray-800 text-gray-400'
                ]"
              >
                <span class="font-bold">{{ index + 1 }}.</span>
                {{ step.instruction }}
                {{ step.completed ? '✅' : index === currentStep ? '👈' : '' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Kitchen Workspace -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Enhanced Ingredients Panel -->
          <div class="galaxy-card rounded-2xl p-6">
            <h3 class="text-xl font-bold text-galaxy-moon-silver mb-4">🧪 魔法材料庫</h3>
            
            <!-- Energy Bar -->
            <div class="mb-4">
              <div class="text-sm text-galaxy-moon-silver mb-2">魔法エネルギー: {{ magicEnergy }}/100</div>
              <div class="w-full bg-gray-700 rounded-full h-3">
                <div 
                  class="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-pink-500"
                  :style="{ width: `${magicEnergy}%` }"
                ></div>
              </div>
            </div>

            <!-- Quick Transform Mode Toggle -->
            <div class="mb-4">
              <button
                @click="toggleQuickMode"
                :class="[
                  'w-full py-2 px-4 rounded-xl font-bold transition-all',
                  quickTransformMode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                {{ quickTransformMode ? '⚡ クイック変身ON' : '🔄 通常モード' }}
              </button>
            </div>

            <div class="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              <div 
                v-for="ingredient in availableIngredients" 
                :key="ingredient.id"
                @click="selectIngredient(ingredient)"
                :class="[
                  'ingredient-card p-3 rounded-xl cursor-pointer transition-all duration-300 relative',
                  selectedIngredient?.id === ingredient.id 
                    ? 'ring-2 ring-yellow-400 bg-yellow-900 scale-105' 
                    : ingredient.transformed
                      ? 'bg-green-800 border-2 border-green-400'
                      : getRarityClass(ingredient.rarity)
                ]"
              >
                <div class="text-center">
                  <div class="text-2xl mb-1">{{ ingredient.emoji }}</div>
                  <div class="text-xs font-bold text-white">{{ ingredient.name }}</div>
                  <div class="text-xs text-gray-300">{{ ingredient.shortWord }}</div>
                  
                  <!-- Rarity indicator -->
                  <div class="text-xs mt-1" :class="getRarityTextClass(ingredient.rarity)">
                    {{ getRarityLabel(ingredient.rarity) }}
                  </div>
                  
                  <!-- Transform counter -->
                  <div v-if="ingredient.transformCount > 0" class="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {{ ingredient.transformCount }}
                  </div>
                  
                  <!-- Energy level -->
                  <div v-if="ingredient.energyLevel > 0" class="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div 
                      class="bg-purple-400 h-1 rounded-full transition-all"
                      :style="{ width: `${ingredient.energyLevel}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Material Collection Status -->
            <div class="mt-4 pt-4 border-t border-gray-600">
              <div class="text-sm text-galaxy-moon-silver mb-2">コレクション進度:</div>
              <div class="flex gap-1">
                <div 
                  v-for="ingredient in availableIngredients" 
                  :key="`collection-${ingredient.id}`"
                  :class="[
                    'w-3 h-3 rounded-full',
                    ingredient.transformed ? 'bg-green-400' : 'bg-gray-600'
                  ]"
                ></div>
              </div>
            </div>
          </div>

          <!-- Magic Transformation -->
          <div class="galaxy-card rounded-2xl p-6">
            <h3 class="text-xl font-bold text-galaxy-moon-silver mb-4">魔法変身</h3>
            
            <div v-if="selectedIngredient" class="text-center">
              <div class="mb-4">
                <div class="text-lg text-galaxy-moon-silver mb-2">選択した材料:</div>
                <div class="text-4xl mb-2">{{ selectedIngredient.emoji }}</div>
                <div class="text-lg font-bold text-white">{{ selectedIngredient.name }}</div>
              </div>

              <div class="mb-4">
                <div class="text-lg text-galaxy-moon-silver mb-2">目標の発音:</div>
                <div class="text-2xl font-bold text-yellow-400">{{ transformTarget }}</div>
                <div class="text-sm text-gray-400">
                  {{ transformTarget === selectedIngredient.shortWord ? '短い音' : '長い音' }}
                </div>
              </div>

              <button
                @click="playTargetSound"
                class="galaxy-button galaxy-button-secondary px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all mb-4"
              >
                <Volume2 class="w-4 h-4 inline mr-2" />
                音を聞く
              </button>

              <div class="mb-4">
                <button
                  @click="toggleListening"
                  :disabled="!speechSupported"
                  :class="[
                    'px-6 py-3 rounded-xl font-bold text-white transition-all w-full',
                    listening 
                      ? 'galaxy-button-listening animate-pulse' 
                      : 'galaxy-button galaxy-button-primary hover:shadow-lg'
                  ]"
                >
                  <Mic class="w-5 h-5 inline mr-2" />
                  {{ listening ? '魔法詠唱中...' : '魔法を唱える' }}
                </button>
              </div>

              <div v-if="recognizedText" class="mb-4">
                <div class="text-sm text-galaxy-moon-silver mb-1">詠唱結果:</div>
                <div class="text-lg font-bold text-yellow-400">{{ recognizedText }}</div>
              </div>

              <div v-if="pronunciationScore > 0" class="mb-4">
                <div class="text-sm text-galaxy-moon-silver mb-1">魔法精度:</div>
                <div class="w-full bg-gray-700 rounded-full h-4 mb-2">
                  <div 
                    class="h-4 rounded-full transition-all duration-1000"
                    :class="[
                      pronunciationScore >= 80 ? 'bg-green-500' : 
                      pronunciationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    ]"
                    :style="{ width: `${pronunciationScore}%` }"
                  ></div>
                </div>
                <div class="text-lg font-bold text-white">{{ pronunciationScore }}%</div>
              </div>

              <button
                v-if="pronunciationScore >= 60"
                @click="performTransformation"
                class="galaxy-button galaxy-button-primary px-6 py-3 rounded-xl font-bold text-white hover:shadow-lg transition-all w-full"
              >
                材料を変身させる！
              </button>
            </div>

            <div v-else class="text-center text-galaxy-moon-silver">
              左の材料庫から材料を選択してください
            </div>
          </div>

          <!-- Completed Ingredients -->
          <div class="galaxy-card rounded-2xl p-6">
            <h3 class="text-xl font-bold text-galaxy-moon-silver mb-4">完成した材料</h3>
            <div class="space-y-3">
              <div 
                v-for="item in completedIngredients" 
                :key="item.id"
                class="completed-ingredient flex items-center gap-3 p-3 rounded-xl bg-green-900"
              >
                <div class="text-3xl">{{ item.emoji }}</div>
                <div>
                  <div class="font-bold text-green-200">{{ item.name }}</div>
                  <div class="text-sm text-green-400">{{ item.transformation }}</div>
                </div>
                <div class="ml-auto text-green-400">✨</div>
              </div>
            </div>

            <div v-if="canCompleteRecipe" class="mt-6">
              <button
                @click="completeRecipe"
                class="galaxy-button galaxy-button-primary px-6 py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all w-full text-lg"
              >
                🍽️ 料理完成！
              </button>
            </div>
          </div>
        </div>

        <!-- Transformation Effect -->
        <div 
          v-if="showTransformEffect"
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div class="transformation-effect">
            <div class="text-8xl animate-spin">✨</div>
            <div class="text-4xl mt-4 animate-bounce">{{ transformationEmoji }}</div>
          </div>
        </div>
      </div>

      <!-- Recipe Complete -->
      <div v-else-if="gameState === 'recipeComplete'" class="text-center">
        <div class="galaxy-card rounded-2xl p-8 max-w-md mx-auto">
          <div class="text-8xl mb-4 animate-bounce">🎉</div>
          <div class="text-3xl font-bold text-green-400 mb-4">料理完成！</div>
          
          <div class="text-6xl mb-4">{{ lastCompletedRecipe?.emoji }}</div>
          <div class="text-2xl font-bold text-yellow-400 mb-4">{{ lastCompletedRecipe?.name }}</div>
          
          <div class="space-y-2 mb-6">
            <div class="text-lg text-galaxy-moon-silver">
              獲得ポイント: <span class="text-yellow-400 font-bold">+{{ lastRecipeScore }}点</span>
            </div>
            <div class="text-lg text-galaxy-moon-silver">
              料理時間: <span class="text-blue-400 font-bold">{{ lastRecipeTime }}秒</span>
            </div>
          </div>

          <button
            @click="nextRecipe"
            class="galaxy-button galaxy-button-primary px-8 py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all"
          >
            {{ completedDishes < targetDishes ? '次の料理へ' : '結果を見る' }}
          </button>
        </div>
      </div>

      <!-- Game Results -->
      <div v-else-if="gameState === 'finished'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-lg mx-auto">
          <div class="text-8xl mb-6">👨‍🍳</div>
          <h2 class="text-4xl font-bold galaxy-text-primary cosmic-glow mb-4">
            料理完了！
          </h2>
          
          <div class="space-y-4 mb-6">
            <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4">
              <div class="text-2xl font-bold text-yellow-700">総合スコア</div>
              <div class="text-4xl font-bold text-yellow-800">{{ score }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-blue-700">完成料理</div>
                <div class="text-2xl font-bold text-blue-800">{{ completedDishes }}</div>
              </div>
              <div class="bg-purple-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-purple-700">シェフランク</div>
                <div class="text-2xl font-bold text-purple-800">{{ chefRank }}</div>
              </div>
            </div>

            <div class="bg-green-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-green-700 mb-2">習得した魔法</div>
              <div class="flex flex-wrap gap-2 justify-center">
                <span 
                  v-for="magic in masteredMagic" 
                  :key="magic"
                  class="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold"
                >
                  {{ magic }}
                </span>
              </div>
            </div>

            <div class="bg-orange-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-orange-700">平均魔法精度</div>
              <div class="text-2xl font-bold text-orange-800">{{ averagePronunciation }}%</div>
            </div>

            <!-- Completed Recipes Gallery -->
            <div class="bg-indigo-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-indigo-700 mb-2">完成した料理</div>
              <div class="flex flex-wrap gap-2 justify-center">
                <div 
                  v-for="recipe in completedRecipes" 
                  :key="recipe.id"
                  class="bg-indigo-200 text-indigo-800 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <span class="text-lg">{{ recipe.emoji }}</span>
                  <span>{{ recipe.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="restartGame"
              class="flex-1 galaxy-button galaxy-button-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              もう一度プレイ
            </button>
            <button
              @click="goBack"
              class="flex-1 galaxy-button galaxy-button-secondary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { getAllMagicEWords, getMagicEPairsByCategory } from '@/data/magicEWords'
import { 
  ArrowLeft, Volume2, VolumeX, Trophy, Clock, Target, Star, Mic
} from 'lucide-vue-next'

export default {
  name: 'MagicCookingGame',
  components: {
    ArrowLeft,
    Volume2,
    VolumeX,
    Trophy,
    Clock,
    Target,
    Star,
    Mic
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()

    // Game State
    const gameState = ref('start') // 'start', 'cooking', 'recipeComplete', 'finished'
    const score = ref(0)
    const timeLeft = ref(300) // 5 minutes
    const completedDishes = ref(0)
    const targetDishes = ref(5)
    const currentStep = ref(0)
    const soundEnabled = ref(true)

    // Cooking Data
    const selectedIngredient = ref(null)
    const transformTarget = ref('')
    const completedIngredients = ref([])
    const lastCompletedRecipe = ref(null)
    const lastRecipeScore = ref(0)
    const lastRecipeTime = ref(0)
    const completedRecipes = ref([])
    const masteredMagic = ref([])
    const pronunciationScores = ref([])

    // Gaming Elements
    const magicEnergy = ref(50) // 魔法エネルギー
    const quickTransformMode = ref(false) // クイック変身モード
    const comboCount = ref(0) // 連続変身カウント
    const maxCombo = ref(0) // 最大コンボ

    // Speech Recognition
    const listening = ref(false)
    const recognizedText = ref('')
    const pronunciationScore = ref(0)
    const speechRecognition = ref(null)
    const speechSupported = ref(false)

    // Effects
    const showTransformEffect = ref(false)
    const transformationEmoji = ref('')

    // Game Timers
    let gameTimer = null
    let recipeStartTime = null

    // Ingredients Data - ゲーミング要素強化版
    const createGameIngredients = () => {
      // 厳選された12種類の材料のみ（分かりやすく、覚えやすい）
      const coreIngredients = [
        { short: 'bit', long: 'bite', name: 'ビット豆', emoji: '🫘', rarity: 'common' },
        { short: 'cut', long: 'cute', name: 'カット野菜', emoji: '🥬', rarity: 'common' },
        { short: 'cap', long: 'cape', name: 'キャップ茸', emoji: '🍄', rarity: 'common' },
        { short: 'tap', long: 'tape', name: 'タップ水', emoji: '💧', rarity: 'common' },
        { short: 'hop', long: 'hope', name: 'ホープ草', emoji: '🌿', rarity: 'rare' },
        { short: 'not', long: 'note', name: 'ノート塩', emoji: '🧂', rarity: 'common' },
        { short: 'kit', long: 'kite', name: 'キット香辛料', emoji: '🧄', rarity: 'rare' },
        { short: 'hat', long: 'hate', name: 'ハット果実', emoji: '🍎', rarity: 'common' },
        { short: 'mad', long: 'made', name: 'マッド肉', emoji: '🥩', rarity: 'epic' },
        { short: 'win', long: 'wine', name: 'ウィン酒', emoji: '🍷', rarity: 'rare' },
        { short: 'dim', long: 'dime', name: 'ディム粉', emoji: '🌾', rarity: 'rare' },
        { short: 'fin', long: 'fine', name: 'フィン魚', emoji: '🐟', rarity: 'epic' }
      ];

      return coreIngredients.map((ingredient, index) => ({
        id: index + 1,
        name: ingredient.name,
        shortWord: ingredient.short,
        longWord: ingredient.long,
        emoji: ingredient.emoji,
        rarity: ingredient.rarity,
        energyLevel: 0, // 変身エネルギー
        transformed: false,
        transformCount: 0 // 変身回数追跡
      }));
    };

    const ingredients = createGameIngredients()

    const availableIngredients = ref([...ingredients])

    // Recipes Data - 拡張されたレシピリスト
    const createRecipes = () => {
      const magicWords = getAllMagicEWords();
      const recipeTypes = [
        { name: '宇宙サラダ', emoji: '🥗', description: '新鮮な宇宙野菜のサラダ' },
        { name: '魔法スープ', emoji: '🍲', description: '温かい魔法のスープ' },
        { name: '星空パスタ', emoji: '🍝', description: '星の輝くパスタ' },
        { name: '希望のケーキ', emoji: '🎂', description: '希望に満ちたデザート' },
        { name: 'コズミックピザ', emoji: '🍕', description: '宇宙風味のピザ' },
        { name: 'ネビュラカレー', emoji: '🍛', description: '星雲のようなカレー' },
        { name: 'ギャラクシーバーガー', emoji: '🍔', description: '銀河系バーガー' },
        { name: 'クォンタムラーメン', emoji: '🍜', description: '量子ラーメン' },
        { name: 'オーロラスムージー', emoji: '🥤', description: 'オーロラ色のスムージー' },
        { name: 'スターダストアイス', emoji: '🍦', description: '星屑アイスクリーム' }
      ];

      const shuffledWords = [...magicWords].sort(() => Math.random() - 0.5);
      
      return recipeTypes.map((recipeType, index) => {
        const stepCount = 2 + (index % 3); // 2-4ステップ
        const recipeWords = shuffledWords.slice(index * 4, index * 4 + stepCount);
        
        return {
          id: index + 1,
          name: recipeType.name,
          emoji: recipeType.emoji,
          description: recipeType.description,
          steps: recipeWords.map(word => ({
            instruction: `${word.short}材料を "${word.long}" に変身`,
            ingredient: word.short,
            target: word.long,
            completed: false
          })),
          baseScore: 80 + (stepCount * 30)
        };
      });
    };

    const recipes = createRecipes()

    const currentRecipe = ref(null)

    // Computed Properties
    const chefRank = computed(() => {
      if (score.value >= 500) return 'マスターシェフ'
      if (score.value >= 300) return 'エキスパート'
      if (score.value >= 200) return 'ベテラン'
      if (score.value >= 100) return '見習い'
      return '新米'
    })

    const canCompleteRecipe = computed(() => {
      if (!currentRecipe.value) return false
      return currentRecipe.value.steps.every(step => step.completed)
    })

    const averagePronunciation = computed(() => {
      if (pronunciationScores.value.length === 0) return 0
      return Math.round(pronunciationScores.value.reduce((a, b) => a + b, 0) / pronunciationScores.value.length)
    })

    // Initialize Game
    const initGame = () => {
      gameState.value = 'start'
      score.value = 0
      timeLeft.value = 300
      completedDishes.value = 0
      currentStep.value = 0
      completedIngredients.value = []
      completedRecipes.value = []
      masteredMagic.value = []
      pronunciationScores.value = []
      
      // Reset recipes
      recipes.forEach(recipe => {
        recipe.steps.forEach(step => {
          step.completed = false
        })
      })
      
      initSpeechRecognition()
    }

    // Speech Recognition Setup
    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        speechRecognition.value = new SpeechRecognition()
        speechRecognition.value.continuous = false
        speechRecognition.value.interimResults = false
        speechRecognition.value.lang = 'en-US'
        
        speechRecognition.value.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase().trim()
          recognizedText.value = transcript
          calculatePronunciationScore(transcript)
          listening.value = false
        }

        speechRecognition.value.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          listening.value = false
        }

        speechRecognition.value.onend = () => {
          listening.value = false
        }

        speechSupported.value = true
      }
    }

    // Calculate pronunciation accuracy
    const calculatePronunciationScore = (transcript) => {
      const target = transformTarget.value.toLowerCase()
      let score = 0

      if (transcript === target) {
        score = 100
      } else if (transcript.includes(target) || target.includes(transcript)) {
        score = 80
      } else {
        const similarity = calculateSimilarity(transcript, target)
        score = Math.max(0, Math.min(75, similarity * 100))
      }

      pronunciationScore.value = Math.round(score)
      pronunciationScores.value.push(score)
    }

    const calculateSimilarity = (str1, str2) => {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
      
      if (longer.length === 0) return 1.0
      
      let editDistance = 0
      for (let i = 0; i < longer.length; i++) {
        if (i >= shorter.length || longer[i] !== shorter[i]) {
          editDistance++
        }
      }
      
      return (longer.length - editDistance) / longer.length
    }

    // Game Flow Functions
    const startCooking = () => {
      gameState.value = 'cooking'
      currentRecipe.value = { ...recipes[completedDishes.value] }
      recipeStartTime = Date.now()
      
      // Start game timer
      gameTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          endGame()
        }
      }, 1000)
    }

    const selectIngredient = (ingredient) => {
      selectedIngredient.value = ingredient
      
      // Find current step requirement
      const currentStepData = currentRecipe.value.steps[currentStep.value]
      if (currentStepData && ingredient.shortWord === currentStepData.ingredient) {
        transformTarget.value = currentStepData.target
      } else {
        // Random target for practice
        transformTarget.value = Math.random() > 0.5 ? ingredient.shortWord : ingredient.longWord
      }
      
      pronunciationScore.value = 0
      recognizedText.value = ''
    }

    const performTransformation = () => {
      if (pronunciationScore.value < 60) {
        resetCombo();
        return;
      }

      const transformedName = transformTarget.value === selectedIngredient.value.longWord 
        ? selectedIngredient.value.name.replace(/ット|プ/, 'ート').replace('カット', 'キュート').replace('ビット', 'バイト')
        : selectedIngredient.value.name

      const completedItem = {
        id: Date.now(),
        name: transformedName,
        emoji: selectedIngredient.value.emoji,
        transformation: `${selectedIngredient.value.shortWord} → ${transformTarget.value}`,
        accuracy: pronunciationScore.value,
        rarity: selectedIngredient.value.rarity
      }

      completedIngredients.value.push(completedItem)
      
      // Update ingredient status
      const ingredient = availableIngredients.value.find(ing => ing.id === selectedIngredient.value.id);
      if (ingredient) {
        ingredient.transformed = true;
        ingredient.transformCount++;
        ingredient.energyLevel = Math.min(100, ingredient.energyLevel + 20);
      }

      // Gaming mechanics
      updateCombo();
      addMagicEnergy(5 + Math.floor(pronunciationScore.value / 20));
      
      // Rarity bonus
      const rarityBonus = {
        'common': 5,
        'rare': 15,
        'epic': 30
      };
      score.value += rarityBonus[selectedIngredient.value.rarity] || 5;

      // Add to mastered magic
      if (!masteredMagic.value.includes(transformTarget.value)) {
        masteredMagic.value.push(transformTarget.value);
        addMagicEnergy(10); // New word bonus
      }

      // Check if this completes a recipe step
      const stepIndex = currentRecipe.value.steps.findIndex(step => 
        step.ingredient === selectedIngredient.value.shortWord && 
        step.target === transformTarget.value &&
        !step.completed
      )

      if (stepIndex !== -1) {
        currentRecipe.value.steps[stepIndex].completed = true
        currentStep.value = Math.min(currentStep.value + 1, currentRecipe.value.steps.length - 1)
      }

      // Show transformation effect
      showTransformationEffect()
      
      // Quick mode auto-selection
      if (quickTransformMode.value && magicEnergy.value >= 10) {
        magicEnergy.value -= 10;
        setTimeout(() => {
          autoSelectNextIngredient();
        }, 1000);
      } else {
        // Reset selection
        selectedIngredient.value = null
        transformTarget.value = ''
        pronunciationScore.value = 0
        recognizedText.value = ''
      }
    }

    const autoSelectNextIngredient = () => {
      const uncompletedSteps = currentRecipe.value.steps.filter(step => !step.completed);
      if (uncompletedSteps.length > 0) {
        const nextStep = uncompletedSteps[0];
        const nextIngredient = availableIngredients.value.find(ing => 
          ing.shortWord === nextStep.ingredient
        );
        if (nextIngredient) {
          selectIngredient(nextIngredient);
        }
      }
    }

    const showTransformationEffect = () => {
      transformationEmoji.value = selectedIngredient.value.emoji
      showTransformEffect.value = true
      setTimeout(() => {
        showTransformEffect.value = false
      }, 2000)
    }

    const completeRecipe = () => {
      const recipeTime = Math.round((Date.now() - recipeStartTime) / 1000)
      const timeBonus = Math.max(0, Math.round((60 - recipeTime) * 2))
      const accuracyBonus = Math.round(averagePronunciation.value)
      
      lastRecipeScore.value = currentRecipe.value.baseScore + timeBonus + accuracyBonus
      lastRecipeTime.value = recipeTime
      score.value += lastRecipeScore.value
      
      lastCompletedRecipe.value = { ...currentRecipe.value }
      completedRecipes.value.push({ ...currentRecipe.value })
      completedDishes.value++
      
      // Reset for next recipe
      completedIngredients.value = []
      currentStep.value = 0
      
      gameState.value = 'recipeComplete'
    }

    const nextRecipe = () => {
      if (completedDishes.value >= targetDishes.value) {
        endGame()
      } else {
        startCooking()
      }
    }

    const endGame = () => {
      gameState.value = 'finished'
      
      if (gameTimer) {
        clearInterval(gameTimer)
        gameTimer = null
      }

      // Save progress
      const gameData = {
        completed: true,
        bestScore: Math.max(gameStore.getGameProgress('magicCooking').bestScore || 0, score.value),
        lastScore: score.value,
        masteredMagic: masteredMagic.value,
        averagePronunciation: averagePronunciation.value,
        completedDishes: completedDishes.value
      }

      gameStore.updateGameProgress('magicCooking', gameData)
    }

    // Voice Controls
    const toggleListening = () => {
      if (!speechSupported.value) return

      if (listening.value) {
        speechRecognition.value.stop()
        listening.value = false
      } else {
        recognizedText.value = ''
        pronunciationScore.value = 0
        speechRecognition.value.start()
        listening.value = true
      }
    }

    const playTargetSound = () => {
      if (!soundEnabled.value || !transformTarget.value) return

      try {
        const utterance = new SpeechSynthesisUtterance(transformTarget.value)
        utterance.lang = 'en-US'
        utterance.rate = 0.7
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('TTS error:', error)
      }
    }

    // Gaming Functions
    const getRarityClass = (rarity) => {
      const classes = {
        'common': 'bg-gray-800 hover:bg-gray-700 border border-gray-600',
        'rare': 'bg-blue-800 hover:bg-blue-700 border border-blue-500',
        'epic': 'bg-purple-800 hover:bg-purple-700 border border-purple-500'
      };
      return classes[rarity] || classes.common;
    };

    const getRarityTextClass = (rarity) => {
      const classes = {
        'common': 'text-gray-400',
        'rare': 'text-blue-400',
        'epic': 'text-purple-400'
      };
      return classes[rarity] || classes.common;
    };

    const getRarityLabel = (rarity) => {
      const labels = {
        'common': '★',
        'rare': '★★',
        'epic': '★★★'
      };
      return labels[rarity] || labels.common;
    };

    const toggleQuickMode = () => {
      if (magicEnergy.value >= 20) {
        quickTransformMode.value = !quickTransformMode.value;
        if (quickTransformMode.value) {
          magicEnergy.value -= 20;
        }
      }
    };

    const addMagicEnergy = (amount) => {
      magicEnergy.value = Math.min(100, magicEnergy.value + amount);
    };

    const updateCombo = () => {
      comboCount.value++;
      maxCombo.value = Math.max(maxCombo.value, comboCount.value);
      
      // コンボボーナス
      if (comboCount.value >= 3) {
        addMagicEnergy(10);
        score.value += comboCount.value * 5;
      }
    };

    const resetCombo = () => {
      comboCount.value = 0;
    };

    // Utility Functions
    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
    }

    const restartGame = () => {
      if (gameTimer) {
        clearInterval(gameTimer)
      }
      initGame()
    }

    const goBack = () => {
      if (gameTimer) {
        clearInterval(gameTimer)
      }
      router.back()
    }

    // Lifecycle
    onMounted(() => {
      console.log('👨‍🍳 Magic Cooking Game started')
      initGame()
    })

    onUnmounted(() => {
      if (gameTimer) {
        clearInterval(gameTimer)
      }
      if (speechRecognition.value) {
        speechRecognition.value.stop()
      }
    })

    return {
      // State
      gameState,
      score,
      timeLeft,
      completedDishes,
      targetDishes,
      currentStep,
      soundEnabled,
      selectedIngredient,
      transformTarget,
      completedIngredients,
      lastCompletedRecipe,
      lastRecipeScore,
      lastRecipeTime,
      completedRecipes,
      masteredMagic,
      listening,
      recognizedText,
      pronunciationScore,
      speechSupported,
      showTransformEffect,
      transformationEmoji,
      availableIngredients,
      currentRecipe,
      magicEnergy,
      quickTransformMode,
      comboCount,
      maxCombo,
      
      // Computed
      chefRank,
      canCompleteRecipe,
      averagePronunciation,
      
      // Methods
      startCooking,
      selectIngredient,
      performTransformation,
      completeRecipe,
      nextRecipe,
      toggleListening,
      playTargetSound,
      toggleSound,
      restartGame,
      goBack,
      
      // Gaming Methods
      getRarityClass,
      getRarityTextClass,
      getRarityLabel,
      toggleQuickMode
    }
  }
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

.cosmic-kitchen-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at 30% 40%, rgba(255, 165, 0, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(255, 192, 203, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 20%, rgba(173, 216, 230, 0.05) 0%, transparent 50%);
  animation: kitchen-atmosphere 15s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

@keyframes kitchen-atmosphere {
  0%, 100% { transform: rotate(0deg) scale(1); }
  33% { transform: rotate(0.5deg) scale(1.05); }
  66% { transform: rotate(-0.5deg) scale(0.95); }
}

/* Galaxy-themed components - unified */
.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.8) 50%, 
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  color: white;
  padding: 0.5rem 1rem;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan-line 2s linear infinite;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.galaxy-button-listening {
  background: linear-gradient(135deg, 
    rgba(255, 100, 100, 0.5) 0%, 
    rgba(255, 150, 100, 0.5) 100%);
  border-color: rgba(255, 100, 100, 0.8);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

/* Ingredient Cards */
.ingredient-card {
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.8) 0%, 
    rgba(51, 65, 85, 0.6) 100%);
  border: 1px solid rgba(100, 116, 139, 0.3);
  transition: all 0.3s ease;
}

.ingredient-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Completed Ingredients */
.completed-ingredient {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.3) 0%, 
    rgba(22, 163, 74, 0.2) 100%);
  border: 1px solid rgba(34, 197, 94, 0.4);
  animation: completion-glow 2s ease-in-out infinite alternate;
}

/* Transformation Effect */
.transformation-effect {
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.2) 0%, 
    rgba(59, 130, 246, 0.3) 50%, 
    transparent 100%);
  border-radius: 50%;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

/* Animations */
@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes completion-glow {
  0% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.3); }
  100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
}

@keyframes scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* CSS Custom Properties for Space Theme */
:root {
  --space-void: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a3e 25%, 
    #2d1b69 50%, 
    #1e1e3f 75%, 
    #0f0f23 100%);
}

/* Responsive design */
@media (max-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>