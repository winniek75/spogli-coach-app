<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- Puzzle magic effects -->
    <div class="puzzle-magic-effect"></div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="galaxy-card rounded-3xl p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="handleBack"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5 cosmic-glow" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold galaxy-text-primary cosmic-title mb-2">
              🧩 フォニックス・パズル・クエスト
            </h1>
            <p class="text-galaxy-moon-silver text-lg">音素パズルを解いて古代の音韻の秘宝を発見しよう！</p>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- Quest Status -->
        <div class="grid grid-cols-4 gap-4">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🗝️</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ questData.keys }}</div>
            <div class="text-sm text-galaxy-moon-silver">音韻の鍵</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">💎</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ questData.gems }}</div>
            <div class="text-sm text-galaxy-moon-silver">音素の宝石</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🏆</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ questData.level }}</div>
            <div class="text-sm text-galaxy-moon-silver">探険家レベル</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">⏱️</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ formatTime(questData.totalTime) }}</div>
            <div class="text-sm text-galaxy-moon-silver">総プレイ時間</div>
          </div>
        </div>
      </div>

      <!-- Quest Map -->
      <div v-if="gameState === 'map'" class="galaxy-card rounded-3xl p-8">
        <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-8">音韻探検地図</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="quest in quests" 
            :key="quest.id"
            @click="selectQuest(quest)"
            :class="[
              'galaxy-card p-6 cursor-pointer transition-all duration-200 hover:scale-105',
              quest.locked ? 'opacity-50 cursor-not-allowed' : '',
              quest.completed ? 'border-green-400' : ''
            ]"
          >
            <div class="text-center">
              <div class="text-5xl mb-4">{{ quest.icon }}</div>
              <h3 class="text-xl font-bold galaxy-text-primary mb-2">{{ quest.name }}</h3>
              <p class="text-galaxy-moon-silver text-sm mb-4">{{ quest.description }}</p>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">パズル数:</span>
                  <span class="text-blue-400 font-bold">{{ quest.puzzleCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">難易度:</span>
                  <div class="flex gap-1">
                    <span 
                      v-for="i in 5" 
                      :key="i"
                      class="w-2 h-2 rounded-full"
                      :class="i <= quest.difficulty ? 'bg-purple-400' : 'bg-gray-600'"
                    ></span>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">報酬:</span>
                  <span class="text-yellow-400 font-bold">{{ quest.reward }}</span>
                </div>
              </div>
              
              <div v-if="quest.completed" class="mt-4 text-green-400 text-sm">
                ✅ クリア済み ({{ quest.bestTime }})
              </div>
              <div v-else-if="quest.locked" class="mt-4 text-red-400 text-sm">
                🔒 {{ quest.unlockRequirement }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Puzzle Game -->
      <div v-else-if="gameState === 'puzzle'" class="space-y-6">
        <!-- Puzzle Info -->
        <div class="galaxy-card rounded-3xl p-6">
          <div class="flex justify-between items-center">
            <div class="text-lg font-bold galaxy-text-primary">{{ currentQuest.name }}</div>
            <div class="flex items-center gap-4">
              <div class="text-lg font-bold galaxy-text-primary">パズル {{ currentPuzzleIndex + 1 }}/{{ currentQuest.puzzleCount }}</div>
              <div class="text-lg font-bold galaxy-text-primary">⏱️ {{ formatTime(puzzleTime) }}</div>
            </div>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-3 mt-2">
            <div 
              class="bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 h-3 rounded-full transition-all duration-300"
              :style="{ width: `${puzzleProgress}%` }"
            />
          </div>
        </div>

        <!-- Current Puzzle -->
        <div v-if="currentPuzzle" class="galaxy-card rounded-3xl p-8">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold galaxy-text-primary mb-4">{{ currentPuzzle.title }}</h3>
            <p class="text-galaxy-moon-silver text-lg">{{ currentPuzzle.instruction }}</p>
          </div>

          <!-- Puzzle Grid -->
          <div v-if="currentPuzzle.type === 'grid'" class="max-w-lg mx-auto">
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div
                v-for="(cell, index) in puzzleGrid"
                :key="index"
                @click="selectGridCell(index)"
                :class="[
                  'w-20 h-20 galaxy-card flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-200',
                  cell.selected ? 'ring-4 ring-yellow-400 scale-110' : 'hover:scale-105',
                  cell.correct ? 'bg-green-500' : cell.wrong ? 'bg-red-500' : ''
                ]"
              >
                {{ cell.content }}
              </div>
            </div>
          </div>

          <!-- Word Building Puzzle -->
          <div v-else-if="currentPuzzle.type === 'word'" class="max-w-2xl mx-auto">
            <div class="text-center mb-6">
              <button 
                @click="playPuzzleSound"
                :disabled="isPlaying"
                class="w-20 h-20 galaxy-button galaxy-button-primary rounded-full text-3xl font-bold text-white animate-pulse"
              >
                🔊
              </button>
              <div class="mt-4 text-lg text-galaxy-moon-silver">この音を聞いて正しい単語を組み立てよう</div>
            </div>

            <!-- Letter Pool -->
            <div class="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
              <button
                v-for="(letter, index) in letterPool"
                :key="index"
                @click="selectLetter(letter, index)"
                :class="[
                  'w-12 h-12 galaxy-card flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-200',
                  letter.used ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                ]"
                :disabled="letter.used"
              >
                {{ letter.char }}
              </button>
            </div>

            <!-- Word Builder -->
            <div class="flex justify-center items-center gap-2 mb-6">
              <div
                v-for="(slot, index) in wordSlots"
                :key="index"
                @click="removeFromSlot(index)"
                :class="[
                  'w-16 h-16 galaxy-card flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-200',
                  slot ? 'bg-blue-500 hover:bg-red-500' : 'border-dashed border-2 border-gray-500'
                ]"
              >
                {{ slot || '' }}
              </div>
            </div>
          </div>

          <!-- Pattern Matching Puzzle -->
          <div v-else-if="currentPuzzle.type === 'pattern'" class="max-w-2xl mx-auto">
            <div class="text-center mb-6">
              <div class="text-lg text-galaxy-moon-silver mb-4">このパターンに合う音素を見つけよう：</div>
              <div class="text-3xl font-bold galaxy-text-primary mb-4">{{ currentPuzzle.pattern }}</div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                v-for="(option, index) in patternOptions"
                :key="index"
                @click="selectPattern(option)"
                :class="[
                  'galaxy-card p-4 text-center cursor-pointer transition-all duration-200 hover:scale-105',
                  option.selected ? 'ring-4 ring-cyan-400 scale-105' : ''
                ]"
              >
                <div class="text-2xl mb-2">{{ option.symbol }}</div>
                <div class="text-sm text-galaxy-moon-silver">{{ option.example }}</div>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center mt-8">
            <button 
              @click="submitPuzzleAnswer"
              :disabled="!canSubmit"
              class="galaxy-button galaxy-button-primary px-8 py-3 text-lg font-bold text-white rounded-xl disabled:opacity-50"
            >
              答えを確認
            </button>
          </div>
        </div>
      </div>

      <!-- Puzzle Feedback -->
      <Transition name="puzzle-feedback">
        <div 
          v-if="showPuzzleFeedback" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            :class="[
              'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center backdrop-blur-md',
              puzzleFeedbackType === 'correct' ? 'bg-green-500/90 text-white animate-treasure' :
              'bg-red-500/90 text-white animate-shake'
            ]"
          >
            <div class="mb-2">
              {{ puzzleFeedbackType === 'correct' ? '🎉 パズル解決！' : '❌ 違うようだ...' }}
            </div>
            <div class="text-lg font-normal">{{ puzzleFeedbackDetail }}</div>
          </div>
        </div>
      </Transition>

      <!-- Quest Complete -->
      <div v-if="gameState === 'complete'" class="galaxy-card rounded-3xl p-8 text-center">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-treasure">
          <Gem class="w-16 h-16 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold galaxy-text-primary mb-4">クエスト完了！</h2>
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-yellow-400">{{ questResults.keys }}</div>
            <div class="text-sm text-galaxy-moon-silver">獲得した鍵</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-purple-400">{{ questResults.gems }}</div>
            <div class="text-sm text-galaxy-moon-silver">獲得した宝石</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-blue-400">{{ questResults.time }}</div>
            <div class="text-sm text-galaxy-moon-silver">クリア時間</div>
          </div>
        </div>
        
        <div class="mb-6">
          <div class="text-lg font-bold galaxy-text-primary mb-2">獲得した秘宝</div>
          <div class="text-6xl">{{ questResults.treasure }}</div>
        </div>
        
        <div class="flex gap-4 justify-center">
          <button 
            @click="returnToMap"
            class="galaxy-button galaxy-button-secondary px-6 py-3 text-lg font-bold text-white rounded-xl"
          >
            地図に戻る
          </button>
          <button 
            @click="nextQuest"
            v-if="hasNextQuest"
            class="galaxy-button galaxy-button-primary px-6 py-3 text-lg font-bold text-white rounded-xl"
          >
            次のクエスト
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Settings, Gem } from 'lucide-vue-next'

export default {
  name: 'PhonicsPuzzleQuest',
  components: {
    ArrowLeft,
    Settings,
    Gem
  },
  setup() {
    const router = useRouter()
    
    const gameState = ref('map') // map, puzzle, complete
    const showSettings = ref(false)
    const showPuzzleFeedback = ref(false)
    const puzzleFeedbackType = ref('')
    const puzzleFeedbackDetail = ref('')
    const isPlaying = ref(false)
    const puzzleTime = ref(0)
    const currentPuzzleIndex = ref(0)
    
    let puzzleTimer = null
    
    const questData = reactive({
      keys: 12,
      gems: 8,
      level: 5,
      totalTime: 3600 // seconds
    })
    
    const currentQuest = ref(null)
    const currentPuzzle = ref(null)
    const puzzleGrid = ref([])
    const letterPool = ref([])
    const wordSlots = ref([])
    const patternOptions = ref([])
    
    const quests = ref([
      {
        id: 1,
        name: '音の洞窟',
        description: '基本音素の謎を解く',
        icon: '🕳️',
        difficulty: 1,
        puzzleCount: 5,
        reward: '3つの音韻の鍵',
        locked: false,
        completed: false
      },
      {
        id: 2,
        name: '響きの森',
        description: '音素パターンの秘密を発見',
        icon: '🌳',
        difficulty: 3,
        puzzleCount: 7,
        reward: '5つの音素の宝石',
        locked: false,
        completed: false
      },
      {
        id: 3,
        name: '音韻の神殿',
        description: '古代音韻術の極意を習得',
        icon: '🏛️',
        difficulty: 5,
        puzzleCount: 10,
        reward: '伝説の音韻の秘宝',
        locked: true,
        unlockRequirement: '他のクエストを完了',
        completed: false
      }
    ])
    
    const questResults = reactive({
      keys: 0,
      gems: 0,
      time: '',
      treasure: ''
    })
    
    const puzzleProgress = computed(() => {
      if (!currentQuest.value) return 0
      return ((currentPuzzleIndex.value + 1) / currentQuest.value.puzzleCount) * 100
    })
    
    const canSubmit = computed(() => {
      if (!currentPuzzle.value) return false
      
      if (currentPuzzle.value.type === 'grid') {
        return puzzleGrid.value.some(cell => cell.selected)
      } else if (currentPuzzle.value.type === 'word') {
        return wordSlots.value.every(slot => slot)
      } else if (currentPuzzle.value.type === 'pattern') {
        return patternOptions.value.some(option => option.selected)
      }
      
      return false
    })
    
    const hasNextQuest = computed(() => {
      const currentIndex = quests.value.findIndex(quest => quest.id === currentQuest.value?.id)
      return currentIndex < quests.value.length - 1 && !quests.value[currentIndex + 1]?.locked
    })
    
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`
      }
    }
    
    const selectQuest = (quest) => {
      if (quest.locked) return
      
      currentQuest.value = quest
      currentPuzzleIndex.value = 0
      puzzleTime.value = 0
      
      startQuest()
    }
    
    const startQuest = () => {
      gameState.value = 'puzzle'
      loadNextPuzzle()
      startPuzzleTimer()
    }
    
    const startPuzzleTimer = () => {
      puzzleTimer = setInterval(() => {
        puzzleTime.value++
      }, 1000)
    }
    
    const loadNextPuzzle = () => {
      const puzzleTypes = ['grid', 'word', 'pattern']
      const randomType = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)]
      
      if (randomType === 'grid') {
        loadGridPuzzle()
      } else if (randomType === 'word') {
        loadWordPuzzle()
      } else {
        loadPatternPuzzle()
      }
    }
    
    const loadGridPuzzle = () => {
      currentPuzzle.value = {
        type: 'grid',
        title: '音素の方陣',
        instruction: '同じ音素グループを3つ選択しよう'
      }
      
      const phonemes = ['a', 'e', 'i', 's', 't', 'm', 'n', 'r', 'l']
      const targetGroup = ['a', 'e', 'i'] // vowels
      const shuffled = [...phonemes].sort(() => Math.random() - 0.5)
      
      puzzleGrid.value = shuffled.map(phoneme => ({
        content: phoneme,
        selected: false,
        correct: false,
        wrong: false,
        isTarget: targetGroup.includes(phoneme)
      }))
    }
    
    const loadWordPuzzle = () => {
      currentPuzzle.value = {
        type: 'word',
        title: '音から単語へ',
        instruction: '聞こえた音に対応する単語を作ろう',
        targetWord: 'cat',
        phoneme: 'a',
        sound: 'a1.m4a'
      }
      
      const letters = ['c', 'a', 't', 'b', 'r', 's', 'e', 'i']
      letterPool.value = letters.map(char => ({ char, used: false }))
      wordSlots.value = new Array(3).fill('')
    }
    
    const loadPatternPuzzle = () => {
      currentPuzzle.value = {
        type: 'pattern',
        title: '音韻パターン認識',
        instruction: 'パターンに一致する音素を選択',
        pattern: '短母音の仲間',
        correctAnswer: 'a'
      }
      
      const options = [
        { symbol: 'a', example: 'cat', selected: false },
        { symbol: 'e', example: 'tree', selected: false },
        { symbol: 's', example: 'sun', selected: false },
        { symbol: 'ai', example: 'rain', selected: false }
      ]
      
      patternOptions.value = options
    }
    
    const selectGridCell = (index) => {
      puzzleGrid.value[index].selected = !puzzleGrid.value[index].selected
    }
    
    const selectLetter = (letter, index) => {
      if (letter.used) return
      
      const emptySlot = wordSlots.value.findIndex(slot => !slot)
      if (emptySlot !== -1) {
        wordSlots.value[emptySlot] = letter.char
        letter.used = true
      }
    }
    
    const removeFromSlot = (index) => {
      if (wordSlots.value[index]) {
        const letter = letterPool.value.find(l => l.char === wordSlots.value[index] && l.used)
        if (letter) {
          letter.used = false
        }
        wordSlots.value[index] = ''
      }
    }
    
    const selectPattern = (option) => {
      patternOptions.value.forEach(opt => opt.selected = false)
      option.selected = true
    }
    
    const playPuzzleSound = async () => {
      if (isPlaying.value || !currentPuzzle.value.sound) return
      
      isPlaying.value = true
      try {
        const audio = new Audio(`/sounds/${currentPuzzle.value.sound}`)
        await audio.play()
        audio.onended = () => {
          isPlaying.value = false
        }
      } catch (error) {
        console.error('Failed to play sound:', error)
        isPlaying.value = false
      }
    }
    
    const submitPuzzleAnswer = () => {
      let isCorrect = false
      
      if (currentPuzzle.value.type === 'grid') {
        const selectedCells = puzzleGrid.value.filter(cell => cell.selected)
        isCorrect = selectedCells.length === 3 && selectedCells.every(cell => cell.isTarget)
        
        // Mark correct/wrong cells
        puzzleGrid.value.forEach(cell => {
          if (cell.selected) {
            cell.correct = cell.isTarget
            cell.wrong = !cell.isTarget
          }
        })
      } else if (currentPuzzle.value.type === 'word') {
        const builtWord = wordSlots.value.join('')
        isCorrect = builtWord === currentPuzzle.value.targetWord
      } else if (currentPuzzle.value.type === 'pattern') {
        const selected = patternOptions.value.find(option => option.selected)
        isCorrect = selected && selected.symbol === currentPuzzle.value.correctAnswer
      }
      
      processPuzzleResult(isCorrect)
    }
    
    const processPuzzleResult = (isCorrect) => {
      puzzleFeedbackType.value = isCorrect ? 'correct' : 'incorrect'
      
      if (isCorrect) {
        puzzleFeedbackDetail.value = '音韻の鍵を発見！'
        questData.keys++
        
        setTimeout(() => {
          if (currentPuzzleIndex.value >= currentQuest.value.puzzleCount - 1) {
            completeQuest()
          } else {
            currentPuzzleIndex.value++
            loadNextPuzzle()
          }
        }, 2000)
      } else {
        puzzleFeedbackDetail.value = 'もう一度考えてみよう...'
        
        // Reset puzzle state for retry
        if (currentPuzzle.value.type === 'grid') {
          puzzleGrid.value.forEach(cell => {
            cell.selected = false
            cell.correct = false
            cell.wrong = false
          })
        } else if (currentPuzzle.value.type === 'word') {
          wordSlots.value.fill('')
          letterPool.value.forEach(letter => letter.used = false)
        } else if (currentPuzzle.value.type === 'pattern') {
          patternOptions.value.forEach(option => option.selected = false)
        }
      }
      
      showPuzzleFeedback.value = true
      setTimeout(() => {
        showPuzzleFeedback.value = false
      }, 2000)
    }
    
    const completeQuest = () => {
      clearInterval(puzzleTimer)
      
      questResults.keys = currentQuest.value.puzzleCount
      questResults.gems = Math.floor(currentQuest.value.difficulty * 2)
      questResults.time = formatTime(puzzleTime.value)
      
      const treasures = ['🏆', '👑', '💎', '🔮', '⚡']
      questResults.treasure = treasures[currentQuest.value.difficulty - 1]
      
      questData.gems += questResults.gems
      questData.totalTime += puzzleTime.value
      
      currentQuest.value.completed = true
      currentQuest.value.bestTime = questResults.time
      
      // Unlock next quest
      const currentIndex = quests.value.findIndex(quest => quest.id === currentQuest.value.id)
      if (currentIndex < quests.value.length - 1) {
        quests.value[currentIndex + 1].locked = false
      }
      
      gameState.value = 'complete'
    }
    
    const returnToMap = () => {
      clearInterval(puzzleTimer)
      gameState.value = 'map'
      currentQuest.value = null
    }
    
    const nextQuest = () => {
      const currentIndex = quests.value.findIndex(quest => quest.id === currentQuest.value.id)
      if (currentIndex < quests.value.length - 1) {
        selectQuest(quests.value[currentIndex + 1])
      }
    }
    
    const handleBack = () => {
      router.back()
    }
    
    return {
      gameState,
      showSettings,
      showPuzzleFeedback,
      puzzleFeedbackType,
      puzzleFeedbackDetail,
      isPlaying,
      puzzleTime,
      currentPuzzleIndex,
      questData,
      currentQuest,
      currentPuzzle,
      puzzleGrid,
      letterPool,
      wordSlots,
      patternOptions,
      quests,
      questResults,
      puzzleProgress,
      canSubmit,
      hasNextQuest,
      formatTime,
      selectQuest,
      selectGridCell,
      selectLetter,
      removeFromSlot,
      selectPattern,
      playPuzzleSound,
      submitPuzzleAnswer,
      returnToMap,
      nextQuest,
      handleBack
    }
  }
}
</script>

<style scoped>
/* Galaxy background and puzzle magic effects */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

.puzzle-magic-effect {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 60%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 40%, rgba(255, 20, 147, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(0, 191, 255, 0.2) 0%, transparent 50%);
  animation: magic-shimmer 4s ease-in-out infinite alternate;
}

@keyframes magic-shimmer {
  0% { filter: brightness(1) saturate(1) hue-rotate(0deg); }
  100% { filter: brightness(1.2) saturate(1.3) hue-rotate(30deg); }
}

.animate-treasure {
  animation: treasure-glow 1.5s ease-out;
}

.animate-shake {
  animation: shake 0.6s ease-out;
}

@keyframes treasure-glow {
  0% { transform: scale(0.3) rotate(-45deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 0.8; filter: brightness(2); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; filter: brightness(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-10px) rotate(-2deg); }
  20% { transform: translateX(10px) rotate(2deg); }
  30% { transform: translateX(-8px) rotate(-1deg); }
  40% { transform: translateX(8px) rotate(1deg); }
  50% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
  70% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  90% { transform: translateX(-2px); }
}

.puzzle-feedback-enter-active, .puzzle-feedback-leave-active {
  transition: all 1s ease;
}

.puzzle-feedback-enter-from {
  opacity: 0;
  transform: scale(0.2) translateY(-100px) rotate(-180deg);
}

.puzzle-feedback-leave-to {
  opacity: 0;
  transform: scale(2) translateY(100px) rotate(180deg);
}

/* Inherit galaxy component styles */
.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
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

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

.galaxy-text-primary {
  background: linear-gradient(45deg, #60A5FA 0%, #A78BFA 25%, #F472B6 50%, #FBBF24 75%, #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-stats-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.galaxy-button {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4), inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.5) 0%, rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>