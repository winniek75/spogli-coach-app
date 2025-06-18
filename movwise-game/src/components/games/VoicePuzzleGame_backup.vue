<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
      <div class="puzzle-nebula"></div>
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
            🧩 宇宙音声パズル
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

      <!-- Puzzle Stats -->
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
            <div class="w-5 h-5 text-purple-400 cosmic-glow">🧩</div>
            <span class="font-bold text-galaxy-moon-silver">{{ currentPuzzle }}/{{ totalPuzzles }}</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Target class="w-5 h-5 text-green-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ placedPieces }}/{{ totalPieces }}</span>
          </div>
        </div>
        
        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Zap class="w-5 h-5 text-orange-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ combo }}連鎖</span>
          </div>
        </div>
        
        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Star class="w-5 h-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">×{{ multiplier.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Puzzle Area -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
      <!-- Game Start Screen -->
      <div v-if="gameState === 'start'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <div class="text-6xl mb-6">🧩</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-4">
            宇宙の謎を解け！
          </h2>
          <p class="text-lg text-galaxy-moon-silver mb-6">
            音声でパズルピースを選択して<br>
            美しい宇宙の絵を完成させよう！
          </p>
          
          <div class="space-y-4 mb-6">
            <div class="galaxy-card rounded-xl p-4">
              <div class="text-sm text-galaxy-moon-silver mb-2">遊び方:</div>
              <div class="space-y-2 text-sm">
                <div>1. 単語を正しく発音</div>
                <div>2. 対応するピースが光る</div>
                <div>3. 正しい場所に配置</div>
                <div>4. 連鎖でボーナスポイント獲得</div>
                <div>5. パワーアップでスコアアップ</div>
              </div>
            </div>

            <div class="galaxy-card rounded-xl p-4">
              <div class="text-sm text-galaxy-moon-silver mb-2">難易度選択:</div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="difficulty in difficulties"
                  :key="difficulty.level"
                  @click="selectedDifficulty = difficulty"
                  :class="[
                    'p-2 rounded-lg text-xs font-bold transition-all',
                    selectedDifficulty.level === difficulty.level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  ]"
                >
                  {{ difficulty.name }}
                </button>
              </div>
            </div>
          </div>

          <button
            @click="startPuzzle"
            class="galaxy-button galaxy-button-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            パズル開始！
          </button>
        </div>
      </div>

      <!-- Puzzle Game -->
      <div v-else-if="gameState === 'playing'" class="w-full max-w-6xl">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Puzzle Board -->
          <div class="lg:col-span-3">
            <div class="galaxy-card rounded-2xl p-6">
              <h3 class="text-xl font-bold text-galaxy-moon-silver mb-4 text-center">
                {{ currentPuzzleData?.name }}
              </h3>
              
              <!-- Puzzle Grid -->
              <div 
                class="puzzle-board mx-auto relative"
                :style="{
                  width: `${selectedDifficulty.gridSize * 80}px`,
                  height: `${selectedDifficulty.gridSize * 80}px`
                }"
              >
                <!-- Background Grid -->
                <div class="absolute inset-0 grid gap-1" :style="{ gridTemplateColumns: `repeat(${selectedDifficulty.gridSize}, 1fr)` }">
                  <div 
                    v-for="i in selectedDifficulty.gridSize * selectedDifficulty.gridSize" 
                    :key="i"
                    class="puzzle-slot bg-gray-800 border border-gray-600 rounded-lg"
                  ></div>
                </div>

                <!-- Placed Pieces -->
                <div 
                  v-for="piece in placedPuzzlePieces" 
                  :key="piece.id"
                  class="absolute puzzle-piece placed-piece"
                  :style="{
                    left: `${piece.x * 80 + piece.x}px`,
                    top: `${piece.y * 80 + piece.y}px`,
                    width: '80px',
                    height: '80px',
                    backgroundImage: `url(${piece.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }"
                >
                  <div class="piece-overlay">
                    <div class="text-2xl">{{ piece.emoji }}</div>
                  </div>
                </div>

                <!-- Progress Overlay -->
                <div 
                  v-if="puzzleProgress > 0"
                  class="absolute inset-0 puzzle-reveal"
                  :style="{ 
                    opacity: puzzleProgress / 100,
                    backgroundImage: `url(${currentPuzzleData?.completeImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }"
                ></div>
              </div>

              <!-- Progress Bar -->
              <div class="mt-6">
                <div class="text-sm text-galaxy-moon-silver mb-2">完成度: {{ Math.round(puzzleProgress) }}%</div>
                <div class="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    class="h-4 rounded-full transition-all duration-1000 bg-gradient-to-r from-blue-500 to-purple-500"
                    :style="{ width: `${puzzleProgress}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Control Panel -->
          <div class="space-y-6">
            <!-- Gaming Stats -->
            <div class="galaxy-card rounded-2xl p-4">
              <h3 class="text-lg font-bold text-galaxy-moon-silver mb-3">ゲーミングステータス</h3>
              
              <!-- Energy Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-galaxy-moon-silver mb-1">
                  <span>エナジー</span>
                  <span>{{ energy }}/{{ maxEnergy }}</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    class="h-3 rounded-full transition-all duration-500"
                    :class="[
                      energy > 70 ? 'bg-green-500' : 
                      energy > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    ]"
                    :style="{ width: `${(energy / maxEnergy) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- Combo & Multiplier -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-purple-900 rounded-xl p-3 text-center">
                  <div class="text-sm text-purple-300">コンボ</div>
                  <div class="text-xl font-bold text-purple-100">{{ combo }}</div>
                  <div class="text-xs text-purple-400">最高: {{ maxCombo }}</div>
                </div>
                <div class="bg-yellow-900 rounded-xl p-3 text-center">
                  <div class="text-sm text-yellow-300">倍率</div>
                  <div class="text-xl font-bold text-yellow-100">×{{ multiplier.toFixed(1) }}</div>
                  <div class="text-xs text-yellow-400">{{ streak }}連続</div>
                </div>
              </div>

              <!-- Power-ups -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-blue-900 rounded-lg p-2 text-center text-xs">
                  <div class="text-blue-300">🧊 時間停止</div>
                  <div class="text-blue-100 font-bold">{{ powerUps.timeFreeze }}</div>
                </div>
                <div class="bg-green-900 rounded-lg p-2 text-center text-xs">
                  <div class="text-green-300">⭐ 2倍ポイント</div>
                  <div class="text-green-100 font-bold">{{ powerUps.doublePoints }}</div>
                </div>
                <div class="bg-orange-900 rounded-lg p-2 text-center text-xs">
                  <div class="text-orange-300">💡 自動ヒント</div>
                  <div class="text-orange-100 font-bold">{{ powerUps.autoHint }}</div>
                </div>
                <div class="bg-pink-900 rounded-lg p-2 text-center text-xs">
                  <div class="text-pink-300">🎯 完璧補正</div>
                  <div class="text-pink-100 font-bold">{{ powerUps.perfectBoost }}</div>
                </div>
              </div>
            </div>

            <!-- Power-up Actions -->
            <div class="galaxy-card rounded-2xl p-4">
              <h3 class="text-lg font-bold text-galaxy-moon-silver mb-3">パワーアップ</h3>
              
              <div class="space-y-2">
                <button
                  @click="activatePowerUp('timeFreeze')"
                  :disabled="powerUps.timeFreeze <= 0 || isTimeFrozen"
                  class="w-full galaxy-button galaxy-button-secondary px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                  🧊 時間停止 ({{ powerUps.timeFreeze }})
                </button>
                
                <button
                  @click="activatePowerUp('doublePoints')"
                  :disabled="powerUps.doublePoints <= 0 || isDoublePoints"
                  class="w-full galaxy-button galaxy-button-secondary px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                  ⭐ 2倍ポイント ({{ powerUps.doublePoints }})
                </button>
                
                <button
                  @click="activatePowerUp('perfectBoost')"
                  :disabled="powerUps.perfectBoost <= 0 || isPerfectBoost"
                  class="w-full galaxy-button galaxy-button-secondary px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                  🎯 完璧補正 ({{ powerUps.perfectBoost }})
                </button>
              </div>
            </div>
            <!-- Current Target -->
            <div class="galaxy-card rounded-2xl p-6">
              <h3 class="text-lg font-bold text-galaxy-moon-silver mb-4">目標ピース</h3>
              
              <div v-if="currentTargetPiece" class="text-center">
                <div class="text-4xl mb-3">{{ currentTargetPiece.emoji }}</div>
                <div class="text-lg font-bold text-yellow-400 mb-2">
                  "{{ currentTargetPiece.word }}"
                </div>
                <div class="text-sm text-galaxy-moon-silver mb-4">
                  {{ currentTargetPiece.hint }}
                </div>

                <button
                  @click="playTargetSound"
                  class="galaxy-button galaxy-button-secondary px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all mb-4 w-full"
                >
                  <Volume2 class="w-4 h-4 inline mr-2" />
                  音を聞く
                </button>

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
                  {{ listening ? '聞いています...' : '発音する' }}
                </button>

                <div v-if="recognizedText" class="mt-4">
                  <div class="text-sm text-galaxy-moon-silver mb-1">認識結果:</div>
                  <div class="text-lg font-bold text-yellow-400">{{ recognizedText }}</div>
                </div>

                <div v-if="pronunciationScore > 0" class="mt-4">
                  <div class="text-sm text-galaxy-moon-silver mb-1">発音精度:</div>
                  <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div 
                      class="h-3 rounded-full transition-all duration-1000"
                      :class="[
                        pronunciationScore >= 80 ? 'bg-green-500' : 
                        pronunciationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      ]"
                      :style="{ width: `${pronunciationScore}%` }"
                    ></div>
                  </div>
                  <div class="text-sm font-bold text-white">{{ pronunciationScore }}%</div>
                </div>
              </div>

              <div v-else class="text-center text-galaxy-moon-silver">
                パズルピースを探しています...
              </div>
            </div>

            <!-- Available Pieces -->
            <div class="galaxy-card rounded-2xl p-6">
              <h3 class="text-lg font-bold text-galaxy-moon-silver mb-4">ピース一覧</h3>
              
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div 
                  v-for="piece in availablePieces" 
                  :key="piece.id"
                  :class="[
                    'piece-item flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                    piece.activated 
                      ? 'bg-green-900 border-2 border-green-400 piece-glow' 
                      : piece.id === currentTargetPiece?.id
                        ? 'bg-blue-900 border-2 border-blue-400'
                        : 'bg-gray-800 border border-gray-600 hover:bg-gray-700'
                  ]"
                  @click="selectPieceForPlacement(piece)"
                >
                  <div class="text-2xl">{{ piece.emoji }}</div>
                  <div>
                    <div class="text-sm font-bold text-white">{{ piece.word }}</div>
                    <div class="text-xs text-gray-400">{{ piece.type }}</div>
                  </div>
                  <div v-if="piece.placed" class="ml-auto text-green-400">✅</div>
                  <div v-else-if="piece.activated" class="ml-auto text-yellow-400 animate-pulse">✨</div>
                </div>
              </div>
            </div>

            <!-- Hint System -->
            <div class="galaxy-card rounded-2xl p-4">
              <h3 class="text-lg font-bold text-galaxy-moon-silver mb-3">ヒント</h3>
              
              <button
                @click="useHint"
                :disabled="hints <= 0 && powerUps.autoHint <= 0"
                class="w-full galaxy-button galaxy-button-secondary px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              >
                <Lightbulb class="w-4 h-4 inline mr-2" />
                ヒント ({{ hints }}+{{ powerUps.autoHint }})
              </button>

              <div v-if="currentHint" class="text-sm text-yellow-400 bg-yellow-900 p-3 rounded-lg">
                {{ currentHint }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Puzzle Complete -->
      <div v-else-if="gameState === 'puzzleComplete'" class="text-center">
        <div class="galaxy-card rounded-2xl p-8 max-w-lg mx-auto">
          <div class="text-8xl mb-4 animate-bounce">🎉</div>
          <div class="text-3xl font-bold text-green-400 mb-4">パズル完成！</div>
          
          <div class="text-6xl mb-4">🏰</div>
          <div class="text-2xl font-bold text-yellow-400 mb-4">{{ currentPuzzleData?.name }}</div>
          
          <div class="space-y-3 mb-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-900 rounded-xl p-3">
                <div class="text-sm text-blue-300">完成時間</div>
                <div class="text-xl font-bold text-blue-100">{{ puzzleTime }}秒</div>
              </div>
              <div class="bg-yellow-900 rounded-xl p-3">
                <div class="text-sm text-yellow-300">獲得ポイント</div>
                <div class="text-xl font-bold text-yellow-100">{{ lastPuzzleScore }}</div>
              </div>
              <div class="bg-green-900 rounded-xl p-3">
                <div class="text-sm text-green-300">平均精度</div>
                <div class="text-xl font-bold text-green-100">{{ averageAccuracy }}%</div>
              </div>
              <div class="bg-purple-900 rounded-xl p-3">
                <div class="text-sm text-purple-300">最高コンボ</div>
                <div class="text-xl font-bold text-purple-100">{{ maxCombo }}</div>
              </div>
            </div>
            
            <!-- Achievement notifications -->
            <div v-if="newAchievements.length > 0" class="bg-gradient-to-r from-yellow-800 to-yellow-600 rounded-xl p-4">
              <div class="text-lg font-bold text-yellow-200 mb-2">🏆 新しい実績解除！</div>
              <div class="space-y-1">
                <div v-for="achievement in newAchievements" :key="achievement.id" class="text-sm text-yellow-100">
                  {{ achievement.emoji }} {{ achievement.name }}
                </div>
              </div>
            </div>
          </div>

          <button
            @click="nextPuzzle"
            class="galaxy-button galaxy-button-primary px-8 py-4 rounded-xl font-bold text-white hover:shadow-lg transition-all"
          >
            {{ currentPuzzle < totalPuzzles ? '次のパズルへ' : '結果を見る' }}
          </button>
        </div>
      </div>

      <!-- Game Results -->
      <div v-else-if="gameState === 'finished'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-lg mx-auto">
          <div class="text-8xl mb-6">🏆</div>
          <h2 class="text-4xl font-bold galaxy-text-primary cosmic-glow mb-4">
            全パズル完成！
          </h2>
          
          <div class="space-y-4 mb-6">
            <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4">
              <div class="text-2xl font-bold text-yellow-700">総合スコア</div>
              <div class="text-4xl font-bold text-yellow-800">{{ score }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-blue-700">完成パズル</div>
                <div class="text-2xl font-bold text-blue-800">{{ completedPuzzles }}</div>
              </div>
              <div class="bg-purple-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-purple-700">総プレイ時間</div>
                <div class="text-2xl font-bold text-purple-800">{{ totalPlayTime }}秒</div>
              </div>
            </div>

            <div class="bg-green-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-green-700 mb-2">習得した単語</div>
              <div class="flex flex-wrap gap-2 justify-center">
                <span 
                  v-for="word in masteredWords" 
                  :key="word"
                  class="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold"
                >
                  {{ word }}
                </span>
              </div>
            </div>

            <div class="bg-orange-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-orange-700">平均発音精度</div>
              <div class="text-2xl font-bold text-orange-800">{{ overallAccuracy }}%</div>
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

    <!-- Puzzle Completion Effect -->
    <div 
      v-if="showCompletionEffect"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div class="completion-effect">
        <div class="text-8xl animate-ping">🌟</div>
        <div class="text-4xl mt-4 animate-bounce">{{ completionEmoji }}</div>
      </div>
    </div>
    
    <!-- Combo Effect -->
    <div 
      v-if="showComboEffect"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div class="combo-effect">
        <div class="text-6xl font-bold combo-text animate-pulse">{{ comboText }}</div>
        <div class="text-2xl mt-2 animate-bounce">🔥 COMBO!</div>
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
  ArrowLeft, Volume2, VolumeX, Trophy, Clock, Target, Mic, Lightbulb, Zap, Star
} from 'lucide-vue-next'

export default {
  name: 'VoicePuzzleGame',
  components: {
    ArrowLeft,
    Volume2,
    VolumeX,
    Trophy,
    Clock,
    Target,
    Mic,
    Lightbulb,
    Zap,
    Star
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()

    // Game State
    const gameState = ref('start') // 'start', 'playing', 'puzzleComplete', 'finished'
    const score = ref(0)
    const timeLeft = ref(600) // 10 minutes
    const currentPuzzle = ref(1)
    const totalPuzzles = ref(10) // 拡張されたパズル数
    const completedPuzzles = ref(0)
    const hints = ref(3)
    
    // Enhanced Gaming Mechanics
    const combo = ref(0)
    const maxCombo = ref(0)
    const streak = ref(0)
    const powerUps = ref({
      timeFreeze: 0,
      doublePoints: 0,
      autoHint: 0,
      perfectBoost: 0
    })
    const energy = ref(100)
    const maxEnergy = ref(100)
    const achievements = ref([])
    const multiplier = ref(1.0)
    const showComboEffect = ref(false)
    const comboText = ref('')
    const isTimeFrozen = ref(false)
    const isDoublePoints = ref(false)
    const isPerfectBoost = ref(false)
    const newAchievements = ref([])
    const soundEnabled = ref(true)

    // Puzzle Data
    const placedPieces = ref(0)
    const totalPieces = computed(() => selectedDifficulty.value.gridSize * selectedDifficulty.value.gridSize)
    const puzzleProgress = computed(() => (placedPieces.value / totalPieces.value) * 100)
    const currentTargetPiece = ref(null)
    const availablePieces = ref([])
    const placedPuzzlePieces = ref([])
    const currentHint = ref('')
    const puzzleTime = ref(0)
    const lastPuzzleScore = ref(0)
    const totalPlayTime = ref(0)
    const masteredWords = ref([])
    const pronunciationScores = ref([])

    // Speech Recognition
    const listening = ref(false)
    const recognizedText = ref('')
    const pronunciationScore = ref(0)
    const speechRecognition = ref(null)
    const speechSupported = ref(false)

    // Effects
    const showCompletionEffect = ref(false)
    const completionEmoji = ref('')

    // Game Timers
    let gameTimer = null
    let puzzleStartTime = null

    // Difficulty Settings
    const difficulties = [
      { level: 1, name: '簡単', gridSize: 2, pieceCount: 4 },
      { level: 2, name: '普通', gridSize: 3, pieceCount: 9 },
      { level: 3, name: '難しい', gridSize: 4, pieceCount: 16 }
    ]

    const selectedDifficulty = ref(difficulties[0])

    // Puzzle Definitions - 拡張されたパズルデータ
    const createPuzzleData = () => {
      const magicWords = getAllMagicEWords();
      const puzzleThemes = [
        { name: '魔法の城', emojis: ['🏰', '🏯', '🌸', '🦋', '🌙', '✨', '🎪', '🎭', '🎨', '🎯'] },
        { name: '宇宙の森', emojis: ['🌲', '🍄', '🦌', '✨', '🌿', '🦋', '🐛', '🌺', '🍀', '🌳'] },
        { name: '星の海', emojis: ['🌊', '⭐', '🐚', '🎵', '🐠', '🐟', '🦈', '🐙', '🦀', '🏖️'] },
        { name: '雲の王国', emojis: ['☁️', '🌤️', '⛅', '🌦️', '🌈', '⚡', '🦅', '✈️', '🎈', '🪁'] },
        { name: '氷の神殿', emojis: ['❄️', '🧊', '⛄', '🐧', '🗻', '💎', '🔮', '👑', '🏔️', '🌨️'] },
        { name: '花の楽園', emojis: ['🌸', '🌺', '🌻', '🌷', '🌹', '🦋', '🐝', '🌈', '🧚', '🌿'] },
        { name: '機械の都市', emojis: ['🤖', '⚙️', '🔧', '💻', '📱', '🚀', '🛰️', '💡', '🔌', '🖥️'] },
        { name: '古代遺跡', emojis: ['🏛️', '🗿', '📜', '🏺', '💰', '🔍', '🗝️', '💎', '🏆', '⚱️'] },
        { name: '竜の巣穴', emojis: ['🐉', '🔥', '💎', '⚔️', '🛡️', '👑', '💰', '🏔️', '🌋', '✨'] },
        { name: '妖精の村', emojis: ['🧚', '🏠', '🍄', '🌸', '🦋', '✨', '🌙', '⭐', '🌿', '🌺'] }
      ];

      const shuffledWords = [...magicWords].sort(() => Math.random() - 0.5);
      
      return puzzleThemes.map((theme, puzzleIndex) => {
        const gridSize = selectedDifficulty.value.gridSize;
        const pieceCount = gridSize * gridSize;
        const puzzleWords = shuffledWords.slice(puzzleIndex * pieceCount, (puzzleIndex + 1) * pieceCount);
        
        const pieces = [];
        let wordIndex = 0;
        
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            if (wordIndex < puzzleWords.length) {
              const word = puzzleWords[wordIndex];
              const useShort = Math.random() > 0.5;
              
              pieces.push({
                id: puzzleIndex * pieceCount + wordIndex + 1,
                word: useShort ? word.short : word.long,
                type: useShort ? 'short' : 'long',
                emoji: theme.emojis[wordIndex % theme.emojis.length],
                hint: `${word.meaning} (${useShort ? '短音' : '長音'})`,
                x: x,
                y: y,
                meaning: word.meaning
              });
              wordIndex++;
            }
          }
        }
        
        return {
          id: puzzleIndex + 1,
          name: theme.name,
          completeImageUrl: `/images/${theme.name.toLowerCase()}.jpg`,
          pieces: pieces
        };
      });
    };

    let puzzleData = []

    const currentPuzzleData = ref(null)

    // Computed Properties
    const averageAccuracy = computed(() => {
      if (pronunciationScores.value.length === 0) return 0
      return Math.round(pronunciationScores.value.reduce((a, b) => a + b, 0) / pronunciationScores.value.length)
    })

    const overallAccuracy = computed(() => averageAccuracy.value)

    // Initialize Game
    const initGame = () => {
      gameState.value = 'start'
      score.value = 0
      timeLeft.value = 600
      currentPuzzle.value = 1
      completedPuzzles.value = 0
      hints.value = 3
      placedPieces.value = 0
      totalPlayTime.value = 0
      masteredWords.value = []
      pronunciationScores.value = []
      newAchievements.value = []
      
      // Enhanced gaming stats
      combo.value = 0
      maxCombo.value = 0
      streak.value = 0
      energy.value = maxEnergy.value
      multiplier.value = 1.0
      powerUps.value = {
        timeFreeze: 1,
        doublePoints: 1,
        autoHint: 2,
        perfectBoost: 1
      }
      achievements.value = []
      isTimeFrozen.value = false
      isDoublePoints.value = false
      isPerfectBoost.value = false
      
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
          checkVoiceMatch(transcript)
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
      if (!currentTargetPiece.value) return

      const target = currentTargetPiece.value.word.toLowerCase()
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

    // Check if voice matches target piece
    const checkVoiceMatch = (transcript) => {
      if (!currentTargetPiece.value) return

      const target = currentTargetPiece.value.word.toLowerCase()
      let threshold = 70
      
      // Perfect Boost power-up lowers threshold
      if (isPerfectBoost.value) {
        threshold = 50
      }
      
      if (pronunciationScore.value >= threshold) {
        // Activate the piece
        const piece = availablePieces.value.find(p => p.id === currentTargetPiece.value.id)
        if (piece) {
          piece.activated = true
          
          // Add to mastered words
          if (!masteredWords.value.includes(target)) {
            masteredWords.value.push(target)
          }

          // Enhanced gaming mechanics
          updateComboAndStreak(pronunciationScore.value)
          
          // Show completion effect
          showActivationEffect()
          
          // Auto-place piece after a short delay
          setTimeout(() => {
            placePieceAutomatically(piece)
          }, 1500)
        }
      } else {
        // Reset combo on failure
        resetCombo()
      }
    }

    // Game Flow Functions
    const startPuzzle = () => {
      gameState.value = 'playing'
      
      // パズルデータを動的に生成
      if (puzzleData.length === 0) {
        puzzleData = createPuzzleData()
      }
      
      currentPuzzleData.value = puzzleData[currentPuzzle.value - 1]
      
      // Setup pieces based on difficulty
      setupPuzzlePieces()
      
      puzzleStartTime = Date.now()
      
      // Start game timer
      gameTimer = setInterval(() => {
        if (!isTimeFrozen.value) {
          timeLeft.value--
        }
        totalPlayTime.value++
        
        // Gradually restore energy over time
        if (energy.value < maxEnergy.value && Math.random() < 0.1) {
          energy.value = Math.min(maxEnergy.value, energy.value + 1)
        }
        
        if (timeLeft.value <= 0) {
          endGame()
        }
      }, 1000)
      
      // Set first target
      setNextTarget()
    }

    const setupPuzzlePieces = () => {
      const puzzlePieces = currentPuzzleData.value.pieces.slice(0, totalPieces.value)
      
      availablePieces.value = puzzlePieces.map(piece => ({
        ...piece,
        activated: false,
        placed: false
      }))
      
      placedPuzzlePieces.value = []
      placedPieces.value = 0
    }

    const setNextTarget = () => {
      const unplacedPieces = availablePieces.value.filter(p => !p.placed)
      if (unplacedPieces.length > 0) {
        currentTargetPiece.value = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)]
      } else {
        currentTargetPiece.value = null
      }
      
      pronunciationScore.value = 0
      recognizedText.value = ''
    }

    const placePieceAutomatically = (piece) => {
      piece.placed = true
      piece.activated = false
      
      placedPuzzlePieces.value.push({
        ...piece,
        id: `placed-${piece.id}`
      })
      
      placedPieces.value++
      
      // Enhanced scoring with multipliers and power-ups
      let basePoints = 10 + Math.round(pronunciationScore.value / 10)
      if (isDoublePoints.value) {
        basePoints *= 2
      }
      const bonusPoints = Math.round(basePoints * multiplier.value)
      score.value += bonusPoints
      
      // Restore energy for good performance
      if (pronunciationScore.value >= 80) {
        energy.value = Math.min(maxEnergy.value, energy.value + 5)
      }
      
      // Chance to earn power-ups based on performance
      if (pronunciationScore.value >= 90 && Math.random() < 0.3) {
        earnRandomPowerUp()
      }
      
      if (placedPieces.value >= totalPieces.value) {
        completePuzzle()
      } else {
        setNextTarget()
      }
    }

    const selectPieceForPlacement = (piece) => {
      if (piece.activated && !piece.placed) {
        placePieceAutomatically(piece)
      }
    }

    const completePuzzle = () => {
      const completionTime = Math.round((Date.now() - puzzleStartTime) / 1000)
      puzzleTime.value = completionTime
      
      // Calculate bonus points
      const timeBonus = Math.max(0, Math.round((120 - completionTime) * 2))
      const accuracyBonus = Math.round(averageAccuracy.value)
      const difficultyBonus = selectedDifficulty.value.level * 50
      
      lastPuzzleScore.value = 100 + timeBonus + accuracyBonus + difficultyBonus
      score.value += lastPuzzleScore.value
      
      completedPuzzles.value++
      
      // Show completion effect
      showPuzzleCompletionEffect()
      
      gameState.value = 'puzzleComplete'
    }

    const nextPuzzle = () => {
      if (currentPuzzle.value >= totalPuzzles.value) {
        endGame()
      } else {
        currentPuzzle.value++
        startPuzzle()
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
        bestScore: Math.max(gameStore.getGameProgress('voicePuzzle').bestScore || 0, score.value),
        lastScore: score.value,
        masteredWords: masteredWords.value,
        overallAccuracy: overallAccuracy.value,
        completedPuzzles: completedPuzzles.value
      }

      gameStore.updateGameProgress('voicePuzzle', gameData)
    }

    // Enhanced Hint System
    const useHint = () => {
      if ((hints.value <= 0 && powerUps.value.autoHint <= 0) || !currentTargetPiece.value) return
      
      if (hints.value > 0) {
        hints.value--
      } else if (powerUps.value.autoHint > 0) {
        powerUps.value.autoHint--
      }
      
      currentHint.value = `"${currentTargetPiece.value.word}" - ${currentTargetPiece.value.hint}`
      
      // Reduce energy for using hints
      energy.value = Math.max(0, energy.value - 10)
      
      setTimeout(() => {
        currentHint.value = ''
      }, 7000)
    }
    
    // Enhanced Gaming Mechanics
    const updateComboAndStreak = (score) => {
      streak.value++
      
      if (score >= 90) {
        combo.value += 3
        showComboEffect.value = true
        comboText.value = 'PERFECT!'
      } else if (score >= 80) {
        combo.value += 2
        showComboEffect.value = true
        comboText.value = 'GREAT!'
      } else {
        combo.value += 1
        showComboEffect.value = true
        comboText.value = 'GOOD!'
      }
      
      if (combo.value > maxCombo.value) {
        maxCombo.value = combo.value
      }
      
      // Update multiplier based on combo
      multiplier.value = 1.0 + (combo.value * 0.1)
      
      // Hide combo effect after short time
      setTimeout(() => {
        showComboEffect.value = false
      }, 2000)
      
      // Check for achievements
      checkAchievements()
    }
    
    const resetCombo = () => {
      combo.value = 0
      streak.value = 0
      multiplier.value = 1.0
      energy.value = Math.max(0, energy.value - 15)
    }
    
    const activatePowerUp = (type) => {
      if (powerUps.value[type] <= 0) return
      
      powerUps.value[type]--
      
      switch(type) {
        case 'timeFreeze':
          isTimeFrozen.value = true
          setTimeout(() => {
            isTimeFrozen.value = false
          }, 30000) // 30 seconds
          break
          
        case 'doublePoints':
          isDoublePoints.value = true
          setTimeout(() => {
            isDoublePoints.value = false
          }, 60000) // 1 minute
          break
          
        case 'perfectBoost':
          isPerfectBoost.value = true
          setTimeout(() => {
            isPerfectBoost.value = false
          }, 45000) // 45 seconds
          break
      }
    }
    
    const earnRandomPowerUp = () => {
      const powerUpTypes = ['timeFreeze', 'doublePoints', 'autoHint', 'perfectBoost']
      const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
      powerUps.value[randomType]++
      
      // Show effect
      completionEmoji.value = '✨'
      showCompletionEffect.value = true
      setTimeout(() => {
        showCompletionEffect.value = false
      }, 1000)
    }
    
    const checkAchievements = () => {
      const newAchievementsList = []
      
      // Combo achievements
      if (combo.value >= 5 && !achievements.value.includes('combo5')) {
        achievements.value.push('combo5')
        newAchievementsList.push({ id: 'combo5', name: 'コンボマスター', emoji: '🔥' })
      }
      
      if (combo.value >= 10 && !achievements.value.includes('combo10')) {
        achievements.value.push('combo10')
        newAchievementsList.push({ id: 'combo10', name: 'コンボレジェンド', emoji: '⚡' })
      }
      
      // Accuracy achievements
      if (pronunciationScore.value >= 95 && !achievements.value.includes('perfect')) {
        achievements.value.push('perfect')
        newAchievementsList.push({ id: 'perfect', name: '完璧な発音', emoji: '🎯' })
      }
      
      // Speed achievements
      if (placedPieces.value >= totalPieces.value / 2 && puzzleTime.value <= 60 && !achievements.value.includes('speedster')) {
        achievements.value.push('speedster')
        newAchievementsList.push({ id: 'speedster', name: 'スピードスター', emoji: '🚀' })
      }
      
      newAchievements.value = newAchievementsList
    }

    // Effects
    const showActivationEffect = () => {
      completionEmoji.value = currentTargetPiece.value.emoji
      showCompletionEffect.value = true
      setTimeout(() => {
        showCompletionEffect.value = false
      }, 1500)
    }

    const showPuzzleCompletionEffect = () => {
      completionEmoji.value = '🧩'
      showCompletionEffect.value = true
      setTimeout(() => {
        showCompletionEffect.value = false
      }, 2000)
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
      if (!soundEnabled.value || !currentTargetPiece.value) return

      try {
        const utterance = new SpeechSynthesisUtterance(currentTargetPiece.value.word)
        utterance.lang = 'en-US'
        utterance.rate = 0.7
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('TTS error:', error)
      }
    }

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
      console.log('🧩 Voice Puzzle Game started')
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
      currentPuzzle,
      totalPuzzles,
      completedPuzzles,
      hints,
      soundEnabled,
      placedPieces,
      totalPieces,
      puzzleProgress,
      currentTargetPiece,
      availablePieces,
      placedPuzzlePieces,
      currentHint,
      puzzleTime,
      lastPuzzleScore,
      totalPlayTime,
      masteredWords,
      listening,
      recognizedText,
      pronunciationScore,
      speechSupported,
      showCompletionEffect,
      completionEmoji,
      difficulties,
      selectedDifficulty,
      currentPuzzleData,
      combo,
      maxCombo,
      streak,
      powerUps,
      energy,
      maxEnergy,
      achievements,
      multiplier,
      showComboEffect,
      comboText,
      isTimeFrozen,
      isDoublePoints,
      isPerfectBoost,
      newAchievements,
      
      // Computed
      averageAccuracy,
      overallAccuracy,
      
      // Methods
      startPuzzle,
      selectPieceForPlacement,
      nextPuzzle,
      useHint,
      activatePowerUp,
      toggleListening,
      playTargetSound,
      toggleSound,
      restartGame,
      goBack
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

.puzzle-nebula {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at 25% 30%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 75% 70%, rgba(30, 144, 255, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(255, 20, 147, 0.05) 0%, transparent 50%);
  animation: puzzle-drift 25s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

@keyframes puzzle-drift {
  0%, 100% { transform: rotate(0deg) scale(1); }
  33% { transform: rotate(0.8deg) scale(1.1); }
  66% { transform: rotate(-0.8deg) scale(0.9); }
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

/* Puzzle Board */
.puzzle-board {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%, 
    rgba(30, 41, 59, 0.7) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  padding: 8px;
}

.puzzle-slot {
  background: linear-gradient(135deg, 
    rgba(51, 65, 85, 0.6) 0%, 
    rgba(75, 85, 99, 0.4) 100%);
  border: 1px dashed rgba(100, 116, 139, 0.4);
  transition: all 0.3s ease;
}

.puzzle-piece {
  border-radius: 10px;
  transition: all 0.5s ease;
  overflow: hidden;
}

.placed-piece {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.3) 0%, 
    rgba(22, 163, 74, 0.2) 100%);
  border: 2px solid rgba(34, 197, 94, 0.6);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

.piece-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.puzzle-reveal {
  border-radius: 16px;
  transition: opacity 1s ease;
}

/* Piece List Items */
.piece-item {
  transition: all 0.3s ease;
}

.piece-glow {
  animation: piece-activation 2s ease-in-out infinite;
}

/* Completion Effect */
.completion-effect {
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.2) 0%, 
    rgba(138, 43, 226, 0.3) 50%, 
    transparent 100%);
  border-radius: 50%;
  padding: 3rem;
  backdrop-filter: blur(15px);
}

/* Animations */
@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes piece-activation {
  0%, 100% { 
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 25px rgba(34, 197, 94, 0.8);
    transform: scale(1.02);
  }
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
  .grid-cols-1.lg\\:grid-cols-4 {
    grid-template-columns: 1fr;
  }
  
  .lg\\:col-span-3 {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .puzzle-board {
    width: 280px !important;
    height: 280px !important;
  }
  
  .grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Enhanced Gaming Effects */
.completion-effect {
  text-align: center;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
}

.combo-effect {
  text-align: center;
  filter: drop-shadow(0 0 30px rgba(255, 165, 0, 0.9));
}

.combo-text {
  background: linear-gradient(45deg, #ff6b35, #f7931e, #ffeb3b, #4caf50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400% 400%;
  animation: combo-gradient 2s ease infinite;
}

@keyframes combo-gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.piece-glow {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
  animation: pulse-glow 1s infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
  50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.9); }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>