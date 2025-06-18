<template>
  <teleport to="body">
    <div
      v-if="show"
      class="game-selection-modal-overlay"
      @click="handleOverlayClick"
    >
      <div 
        class="game-selection-modal"
        :class="modalClasses"
        @click.stop
      >
        <!-- モーダルヘッダー -->
        <div class="modal-header">
          <div class="header-content">
            <div class="modal-title">
              <Icon name="star" class="w-6 h-6 text-yellow-400" />
              <h2>Grammar Galaxy Games</h2>
              <Icon name="star" class="w-6 h-6 text-yellow-400" />
            </div>
            <p class="modal-subtitle">Choose your learning adventure!</p>
          </div>
          <button
            @click="closeModal"
            class="close-button"
            :disabled="loading"
          >
            <Icon name="x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- ゲーム一覧 -->
        <div class="modal-body">
          <!-- フィルター -->
          <div class="game-filters">
            <div class="filter-group">
              <label class="filter-label">Difficulty:</label>
              <select v-model="selectedDifficulty" class="filter-select">
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Category:</label>
              <select v-model="selectedCategory" class="filter-select">
                <option value="all">All Categories</option>
                <option value="phonics">Phonics</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="pattern">Pattern Recognition</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Status:</label>
              <select v-model="selectedStatus" class="filter-select">
                <option value="all">All Games</option>
                <option value="unlocked">Unlocked</option>
                <option value="completed">Completed</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>

          <!-- ゲームグリッド -->
          <div class="games-grid">
            <div
              v-for="game in filteredGames"
              :key="game.id"
              class="game-card"
              :class="getGameCardClasses(game)"
              @click="selectGame(game)"
            >
              <!-- ゲームアイコン -->
              <div class="game-icon">
                <Icon 
                  :name="game.icon" 
                  class="w-8 h-8"
                  :class="game.iconColor"
                />
                <!-- ロック状態 -->
                <div v-if="game.isLocked" class="lock-overlay">
                  <Icon name="lock-closed" class="w-6 h-6 text-gray-400" />
                </div>
                <!-- 新作バッジ -->
                <div v-if="game.isNew && !game.isLocked" class="new-badge">
                  NEW!
                </div>
              </div>

              <!-- ゲーム情報 -->
              <div class="game-info">
                <h3 class="game-title">{{ game.title }}</h3>
                <p class="game-description">{{ game.description }}</p>
                
                <!-- 難易度表示 -->
                <div class="game-difficulty">
                  <span class="difficulty-label">{{ getDifficultyLabel(game.difficulty) }}</span>
                  <div class="difficulty-stars">
                    <Icon
                      v-for="i in 3"
                      :key="i"
                      name="star"
                      class="w-3 h-3"
                      :class="i <= game.difficulty ? 'text-yellow-400' : 'text-gray-400'"
                    />
                  </div>
                </div>

                <!-- 進捗情報 -->
                <div v-if="!game.isLocked" class="game-progress">
                  <div class="progress-info">
                    <span class="progress-label">Best Score:</span>
                    <span class="progress-value">{{ game.bestScore || 0 }}</span>
                  </div>
                  <div class="progress-info">
                    <span class="progress-label">Stars:</span>
                    <div class="stars-display">
                      <Icon
                        v-for="i in 3"
                        :key="i"
                        name="star"
                        class="w-4 h-4"
                        :class="i <= (game.stars || 0) ? 'text-yellow-400' : 'text-gray-400'"
                      />
                    </div>
                  </div>
                </div>

                <!-- ロック理由 -->
                <div v-if="game.isLocked" class="lock-reason">
                  <Icon name="information-circle" class="w-4 h-4 text-blue-400" />
                  <span>{{ game.lockReason }}</span>
                </div>
              </div>

              <!-- 選択インジケーター -->
              <div v-if="selectedGame?.id === game.id" class="selection-indicator">
                <Icon name="check-circle" class="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <!-- ゲーム情報詳細 -->
          <div v-if="selectedGame" class="game-details">
            <div class="details-header">
              <Icon :name="selectedGame.icon" class="w-6 h-6" :class="selectedGame.iconColor" />
              <h3>{{ selectedGame.title }}</h3>
            </div>
            
            <div class="details-content">
              <p class="game-description-full">{{ selectedGame.fullDescription }}</p>
              
              <!-- 学習目標 -->
              <div class="learning-objectives">
                <h4>Learning Objectives:</h4>
                <ul>
                  <li v-for="objective in selectedGame.objectives" :key="objective">
                    {{ objective }}
                  </li>
                </ul>
              </div>

              <!-- ゲーム設定 -->
              <div v-if="!selectedGame.isLocked" class="game-settings">
                <h4>Game Settings:</h4>
                <div class="settings-grid">
                  <div class="setting-item">
                    <label>Difficulty Level:</label>
                    <select v-model="gameSettings.difficulty" class="setting-select">
                      <option value="easy">Easy</option>
                      <option value="basic">Basic</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div class="setting-item">
                    <label>Time Limit:</label>
                    <select v-model="gameSettings.timeLimit" class="setting-select">
                      <option :value="30">30 seconds</option>
                      <option :value="60">1 minute</option>
                      <option :value="90">90 seconds</option>
                      <option :value="120">2 minutes</option>
                    </select>
                  </div>

                  <div class="setting-item">
                    <label>Enable Hints:</label>
                    <input 
                      v-model="gameSettings.enableHints" 
                      type="checkbox" 
                      class="setting-checkbox"
                    />
                  </div>

                  <div class="setting-item">
                    <label>Sound Effects:</label>
                    <input 
                      v-model="gameSettings.soundEffects" 
                      type="checkbox" 
                      class="setting-checkbox"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- モーダルフッター -->
        <div class="modal-footer">
          <div class="footer-info">
            <div v-if="selectedGame && !selectedGame.isLocked" class="game-stats">
              <div class="stat-item">
                <Icon name="clock" class="w-4 h-4 text-blue-400" />
                <span>Est. {{ selectedGame.estimatedTime || '5-10' }} min</span>
              </div>
              <div class="stat-item">
                <Icon name="users" class="w-4 h-4 text-green-400" />
                <span>{{ selectedGame.playCount || 0 }} plays</span>
              </div>
            </div>
          </div>
          
          <div class="footer-actions">
            <button
              @click="closeModal"
              class="cancel-button"
              :disabled="loading"
            >
              Cancel
            </button>
            <button
              @click="startSelectedGame"
              :disabled="!selectedGame || selectedGame.isLocked || loading"
              class="start-button"
            >
              <Icon v-if="loading" name="arrow-path" class="w-5 h-5 animate-spin" />
              <Icon v-else name="play" class="w-5 h-5" />
              {{ loading ? 'Starting...' : 'Start Game' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import Icon from '@/components/shared/Icon.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentPlanet: {
    type: String,
    default: 'beginner'
  },
  planetId: {
    type: String,
    default: ''
  },
  planetInfo: {
    type: Object,
    default: () => null
  },
  availableGames: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'game-selected', 'start-game'])

// Store
const store = useGrammarGalaxyStore()

// リアクティブデータ
const selectedGame = ref(null)
const selectedDifficulty = ref('all')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const loading = ref(false)

// ゲーム設定
const gameSettings = ref({
  difficulty: 'basic',
  timeLimit: 60,
  enableHints: true,
  soundEffects: true
})

// モーダルクラス
const modalClasses = computed(() => ({
  'modal-loading': loading.value,
  'modal-game-selected': selectedGame.value !== null
}))

// デフォルトゲーム一覧
const defaultGames = ref([
  {
    id: 'grammar-color-code',
    title: 'Grammar Color Code',
    description: 'Learn grammar patterns through color coding',
    fullDescription: 'Master grammar structures by understanding color-coded patterns. Each grammar type has its own color family to help you recognize patterns intuitively.',
    icon: 'paint-brush',
    iconColor: 'text-blue-400',
    category: 'grammar',
    difficulty: 1,
    estimatedTime: '5-8',
    objectives: [
      'Understand basic grammar color coding',
      'Recognize subject-verb-object patterns',
      'Improve visual pattern recognition'
    ],
    isLocked: false,
    isNew: false,
    bestScore: store.grammarProgress?.grammarColorCode?.bestScore || 0,
    stars: store.grammarProgress?.grammarColorCode?.stars || 0,
    playCount: store.grammarProgress?.grammarColorCode?.timesPlayed || 0
  },
  {
    id: 'pattern-hunter',
    title: 'Pattern Hunter',
    description: 'Find grammar patterns hidden in the grid',
    fullDescription: 'Sharpen your visual scanning skills while hunting for correct grammar patterns. Find and connect the right elements to complete sentences.',
    icon: 'magnifying-glass',
    iconColor: 'text-purple-400',
    category: 'pattern',
    difficulty: 2,
    estimatedTime: '8-12',
    objectives: [
      'Develop rapid pattern recognition',
      'Practice sentence construction',
      'Improve visual scanning speed'
    ],
    isLocked: false,
    isNew: true,
    bestScore: store.grammarProgress?.patternHunter?.bestScore || 0,
    stars: store.grammarProgress?.patternHunter?.stars || 0,
    playCount: store.grammarProgress?.patternHunter?.timesPlayed || 0
  },
  {
    id: 'time-zone-navigator',
    title: 'Time Zone Navigator',
    description: 'Navigate through different time zones to learn tenses',
    fullDescription: 'Travel through past, present, and future zones while mastering English tenses. Use coordinate movements to understand temporal relationships.',
    icon: 'clock',
    iconColor: 'text-green-400',
    category: 'grammar',
    difficulty: 2,
    estimatedTime: '10-15',
    objectives: [
      'Master present, past, and future tenses',
      'Understand temporal relationships',
      'Practice coordinated learning'
    ],
    isLocked: !store.isGameUnlocked('timeZoneNavigator'),
    isNew: false,
    lockReason: store.isGameUnlocked('timeZoneNavigator') ? '' : 'Complete Pattern Hunter with 2+ stars',
    bestScore: store.grammarProgress?.timeZoneNavigator?.bestScore || 0,
    stars: store.grammarProgress?.timeZoneNavigator?.stars || 0,
    playCount: store.grammarProgress?.timeZoneNavigator?.timesPlayed || 0
  },
  {
    id: 'grammar-reflex-arena',
    title: 'Grammar Reflex Arena',
    description: 'Test your grammar reflexes in high-speed challenges',
    fullDescription: 'Challenge your instant grammar recognition skills in this fast-paced reflex game. Make split-second decisions about grammar correctness.',
    icon: 'bolt',
    iconColor: 'text-yellow-400',
    category: 'grammar',
    difficulty: 3,
    estimatedTime: '5-8',
    objectives: [
      'Develop instant grammar recognition',
      'Improve reaction time',
      'Build grammar confidence'
    ],
    isLocked: false, // 開発用に強制アンロック
    isNew: false,
    lockReason: '', // アンロック済みのため空文字列
    bestScore: store.grammarProgress?.grammarReflexArena?.bestScore || 0,
    stars: store.grammarProgress?.grammarReflexArena?.stars || 0,
    playCount: store.grammarProgress?.grammarReflexArena?.timesPlayed || 0
  },
  {
    id: 'sentence-architecture',
    title: 'Sentence Architecture',
    description: 'Build perfect sentences like constructing buildings',
    fullDescription: 'Become a sentence architect! Construct grammatically correct sentences by placing elements in the right order, just like building a stable structure.',
    icon: 'building-office',
    iconColor: 'text-orange-400',
    category: 'grammar',
    difficulty: 2,
    estimatedTime: '10-15',
    objectives: [
      'Master sentence word order',
      'Understand sentence structure',
      'Practice construction logic'
    ],
    isLocked: !store.isGameUnlocked('sentenceArchitecture'),
    isNew: false,
    lockReason: store.isGameUnlocked('sentenceArchitecture') ? '' : 'Complete Grammar Color Code with 3 stars',
    bestScore: store.grammarProgress?.sentenceArchitecture?.bestScore || 0,
    stars: store.grammarProgress?.sentenceArchitecture?.stars || 0,
    playCount: store.grammarProgress?.sentenceArchitecture?.timesPlayed || 0
  },
  {
    id: 'grammar-puzzle-cascade',
    title: 'Grammar Puzzle Cascade',
    description: 'Tetris-style grammar puzzle with falling blocks',
    fullDescription: 'Experience grammar learning in a whole new way! Match falling grammar blocks to create complete sentences and clear the board.',
    icon: 'puzzle-piece',
    iconColor: 'text-pink-400',
    category: 'pattern',
    difficulty: 3,
    estimatedTime: '8-12',
    objectives: [
      'Practice rapid grammar matching',
      'Develop spatial reasoning',
      'Master multi-tasking skills'
    ],
    isLocked: !store.isGameUnlocked('grammarPuzzleCascade'),
    isNew: false,
    lockReason: store.isGameUnlocked('grammarPuzzleCascade') ? '' : 'Complete Grammar Reflex Arena with 2+ stars',
    bestScore: store.grammarProgress?.grammarPuzzleCascade?.bestScore || 0,
    stars: store.grammarProgress?.grammarPuzzleCascade?.stars || 0,
    playCount: store.grammarProgress?.grammarPuzzleCascade?.timesPlayed || 0
  }
])

// 利用可能なゲーム（プロップスまたはデフォルト）
const availableGames = computed(() => {
  console.log('GameSelectionModal - props.availableGames:', props.availableGames)
  console.log('GameSelectionModal - defaultGames:', defaultGames.value.length, 'items')
  const result = props.availableGames.length > 0 ? props.availableGames : defaultGames.value
  console.log('GameSelectionModal - using games:', result.length, 'items', result.map(g => ({ id: g.id, title: g.title, isLocked: g.isLocked })))
  return result
})

// フィルタリングされたゲーム
const filteredGames = computed(() => {
  let games = availableGames.value

  // 難易度フィルター
  if (selectedDifficulty.value !== 'all') {
    const difficultyMap = { easy: 1, basic: 2, intermediate: 3, advanced: 4 }
    const targetDifficulty = difficultyMap[selectedDifficulty.value]
    games = games.filter(game => game.difficulty === targetDifficulty)
  }

  // カテゴリフィルター
  if (selectedCategory.value !== 'all') {
    games = games.filter(game => game.category === selectedCategory.value)
  }

  // ステータスフィルター
  if (selectedStatus.value !== 'all') {
    switch (selectedStatus.value) {
      case 'unlocked':
        games = games.filter(game => !game.isLocked)
        break
      case 'completed':
        games = games.filter(game => (game.stars || 0) > 0)
        break
      case 'new':
        games = games.filter(game => game.isNew)
        break
    }
  }

  return games
})

// メソッド
const selectGame = (game) => {
  console.log('selectGame called with:', game)
  console.log('game.isLocked:', game.isLocked, 'game.id:', game.id)
  
  // Grammar Reflex Arenaは強制的にアンロック
  if (game.id === 'grammarReflexArena') {
    console.log('Grammar Reflex Arena - forcing unlock for development')
  } else if (game.isLocked) {
    console.log('Game is locked, returning')
    return
  }
  
  selectedGame.value = game
  console.log('selectedGame set to:', selectedGame.value)
  
  // ゲーム設定をリセット
  gameSettings.value = {
    difficulty: getDifficultyKey(game.difficulty),
    timeLimit: 60,
    enableHints: true,
    soundEffects: true
  }
  
  emit('game-selected', game)
  console.log('game-selected event emitted')
}

const startSelectedGame = async () => {
  console.log('startSelectedGame called, selectedGame:', selectedGame.value)
  if (!selectedGame.value) {
    console.log('Cannot start game - no selected game')
    return
  }
  
  // Grammar Reflex Arenaは強制的にアンロック
  if (selectedGame.value.isLocked && selectedGame.value.id !== 'grammarReflexArena') {
    console.log('Cannot start game - game is locked')
    return
  }
  
  loading.value = true
  console.log('Starting game:', selectedGame.value.id)
  
  try {
    // ゲーム開始イベントを発火
    await emit('start-game', {
      game: selectedGame.value,
      settings: gameSettings.value
    })
    console.log('start-game event emitted successfully')
    
    // モーダルを閉じる
    closeModal()
  } catch (error) {
    console.error('Failed to start game:', error)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  selectedGame.value = null
  emit('close')
}

const handleOverlayClick = () => {
  if (!loading.value) {
    closeModal()
  }
}

const getGameCardClasses = (game) => ({
  'game-locked': game.isLocked,
  'game-completed': (game.stars || 0) > 0,
  'game-new': game.isNew,
  'game-selected': selectedGame.value?.id === game.id
})

const getDifficultyLabel = (difficulty) => {
  const labels = {
    1: 'Easy',
    2: 'Basic', 
    3: 'Intermediate',
    4: 'Advanced'
  }
  return labels[difficulty] || 'Unknown'
}

const getDifficultyKey = (difficulty) => {
  const keys = {
    1: 'easy',
    2: 'basic',
    3: 'intermediate', 
    4: 'advanced'
  }
  return keys[difficulty] || 'basic'
}

// ライフサイクル
onMounted(() => {
  // 最初のアンロックされたゲームを自動選択
  const firstUnlockedGame = availableGames.value.find(game => !game.isLocked)
  if (firstUnlockedGame) {
    selectedGame.value = firstUnlockedGame
  }
})

// ウォッチャー
watch(() => props.show, (newShow) => {
  if (newShow) {
    // モーダルが開かれた時の処理
    selectedGame.value = null
  }
})
</script>

<style scoped>
.game-selection-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.game-selection-modal {
  background: linear-gradient(135deg, #1a1a3a 0%, #2a2a4a 50%, #3a3a5a 100%);
  border-radius: 1.5rem;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-loading {
  pointer-events: none;
  opacity: 0.8;
}

/* ヘッダー */
.modal-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  text-align: center;
  flex: 1;
}

.modal-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ボディ */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

/* フィルター */
.game-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.75rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

/* ゲームグリッド */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.game-card:hover:not(.game-locked) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(147, 51, 234, 0.5);
  transform: translateY(-2px);
}

.game-selected {
  border-color: #9333ea !important;
  background: rgba(147, 51, 234, 0.2) !important;
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
}

.game-locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-completed {
  border-color: rgba(34, 197, 94, 0.3);
}

.game-new::after {
  content: '';
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* ゲームアイコン */
.game-icon {
  position: relative;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  transform: rotate(15deg);
}

/* ゲーム情報 */
.game-info {
  flex: 1;
}

.game-title {
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.game-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.game-difficulty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.difficulty-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty-stars {
  display: flex;
  gap: 0.1rem;
}

.game-progress {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.progress-value {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.stars-display {
  display: flex;
  gap: 0.1rem;
}

.lock-reason {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-style: italic;
}

.selection-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

/* ゲーム詳細 */
.game-details {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.details-header h3 {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.details-content {
  space-y: 1rem;
}

.game-description-full {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.learning-objectives h4,
.game-settings h4 {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.learning-objectives ul {
  list-style: none;
  padding: 0;
}

.learning-objectives li {
  color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.learning-objectives li::before {
  content: '•';
  color: #9333ea;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.setting-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  font-size: 0.9rem;
}

.setting-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #9333ea;
}

/* フッター */
.modal-footer {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  flex: 1;
}

.game-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

.cancel-button,
.start-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.start-button {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  border: none;
  color: white;
}

.start-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* アニメーション */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .game-selection-modal {
    max-width: 100%;
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .game-filters {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .footer-actions {
    width: 100%;
  }
  
  .cancel-button,
  .start-button {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.2rem;
  }
  
  .game-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>