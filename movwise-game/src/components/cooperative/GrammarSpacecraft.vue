<template>
  <div class="grammar-spacecraft min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 relative overflow-hidden">
    
    <!-- Deep Space Background -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Distant galaxies -->
      <div 
        v-for="galaxy in galaxies" 
        :key="galaxy.id"
        class="absolute animate-float-stars"
        :style="{
          left: galaxy.x + '%',
          top: galaxy.y + '%',
          animationDelay: galaxy.delay + 's'
        }"
      >
        <div 
          class="w-8 h-8 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-sm"
          :style="{ transform: `scale(${galaxy.scale})` }"
        ></div>
      </div>
      
      <!-- Nebula clouds -->
      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 animate-nebula-drift"></div>
    </div>

    <!-- Game Header -->
    <header class="relative z-10 p-6 text-white">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
            <i class="fas fa-rocket text-xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Grammar Construction Spacecraft
            </h1>
            <p class="text-purple-200 text-sm">文法エンジン修理ミッション</p>
          </div>
        </div>
        
        <!-- Mission Status -->
        <div class="text-right">
          <div class="text-sm text-purple-300">
            エンジン状態: {{ engineStatus }}
          </div>
          <div class="text-xs text-pink-200">
            修理進行度: {{ repairProgress }}%
          </div>
        </div>
      </div>
    </header>

    <!-- Main Game Area -->
    <main class="relative z-10 flex-1 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          <!-- Spacecraft Engine Display (2 columns) -->
          <div class="xl:col-span-2">
            <SpacecraftEngine
              :engine-status="currentEngineStatus"
              :malfunction-type="currentMalfunction"
              :repair-progress="repairProgress"
              :constructed-sentence="constructedSentence"
              :target-sentence="targetSentence"
              :user-role="userRole"
              @repair-complete="onRepairComplete"
              @engine-diagnosis="onEngineDiagnosis"
            />
          </div>

          <!-- Grammar Parts & Controls (2 columns) -->
          <div class="xl:col-span-2 space-y-6">
            
            <!-- Grammar Parts Inventory (Captain) -->
            <GrammarParts
              v-if="userRole === 'captain'"
              :available-parts="availableParts"
              :current-problem="currentProblem"
              :selected-parts="selectedParts"
              @part-selected="onPartSelected"
              @part-highlighted="onPartHighlighted"
            />

            <!-- Parts Drag & Drop Area (Co-Pilot) -->
            <PartsDragDrop
              v-if="userRole === 'copilot'"
              :provided-parts="providedParts"
              :target-slots="targetSlots"
              :constructed-sentence="constructedSentence"
              @parts-arranged="onPartsArranged"
              @slot-filled="onSlotFilled"
              @construction-complete="onConstructionComplete"
            />

            <!-- Cooperative Status Panel -->
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
              <h3 class="text-lg font-semibold text-purple-300 mb-4 flex items-center">
                <i class="fas fa-users mr-2"></i>
                協力ステータス
              </h3>
              
              <!-- Mission Briefing -->
              <div class="mb-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div class="text-sm text-purple-200 mb-2">ミッション概要</div>
                <div class="text-white">{{ missionBriefing }}</div>
              </div>

              <!-- Current Task -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-purple-300">現在のタスク</span>
                  <span class="text-xs text-pink-300">{{ currentTaskStep }}/{{ totalSteps }}</span>
                </div>
                <div class="text-white text-sm">{{ currentTask }}</div>
                
                <!-- Task progress bar -->
                <div class="mt-2 w-full bg-slate-700 rounded-full h-2">
                  <div 
                    class="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                    :style="{ width: (currentTaskStep / totalSteps) * 100 + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Team Communication -->
              <div class="space-y-2">
                <div class="text-sm text-purple-300">チーム通信</div>
                
                <!-- Communication messages -->
                <div class="max-h-32 overflow-y-auto space-y-2">
                  <div 
                    v-for="message in recentMessages" 
                    :key="message.id"
                    class="text-xs p-2 bg-slate-700/50 rounded border-l-2"
                    :class="getMessageStyle(message)"
                  >
                    <span class="font-medium">{{ message.fromRole === 'captain' ? 'Captain' : 'Co-Pilot' }}:</span>
                    {{ message.content }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Emergency Call Button (Co-Pilot) -->
            <EmergencyCallButton 
              v-if="userRole === 'copilot'"
              @emergency="handleEmergencyCall"
              :disabled="gameState.emergency?.active"
              :is-active="gameState.emergency?.active"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Repair Success Animation -->
    <RepairAnimation
      v-if="showRepairAnimation"
      :repaired-component="repairedComponent"
      :success-type="repairSuccessType"
      @animation-complete="onRepairAnimationComplete"
    />

    <!-- Mission Complete Overlay -->
    <div 
      v-if="showMissionComplete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div class="text-center text-white space-y-6 animate-system-boot">
        <!-- Success icon -->
        <div class="relative">
          <div class="text-8xl animate-success-explosion">🚀</div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-radar-ping"></div>
          </div>
        </div>

        <!-- Success title -->
        <h2 class="text-5xl font-bold neon-purple animate-achievement-glow">
          宇宙船修理完了！
        </h2>
        
        <!-- Mission results -->
        <div class="space-y-3">
          <p class="text-2xl text-purple-200">
            エンジン復旧成功
          </p>
          <p class="text-lg text-pink-300">
            {{ targetSentence.english }}
          </p>
          <p class="text-base text-purple-300">
            {{ targetSentence.japanese }}
          </p>
        </div>

        <!-- Team celebration -->
        <div class="flex justify-center space-x-8 mt-8">
          <div class="text-center animate-team-sync">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-tie text-white text-xl"></i>
            </div>
            <div class="text-purple-300 font-medium">Captain</div>
            <div class="text-white text-sm">パーツ提供!</div>
          </div>
          
          <div class="flex items-center">
            <div class="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 animate-connection-pulse"></div>
          </div>
          
          <div class="text-center animate-team-sync animate-delay-1">
            <div class="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-astronaut text-white text-xl"></i>
            </div>
            <div class="text-pink-300 font-medium">Co-Pilot</div>
            <div class="text-white text-sm">構築成功!</div>
          </div>
        </div>

        <!-- Continue button -->
        <button
          @click="nextMission"
          class="mt-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 
                 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105"
        >
          次のミッションへ
        </button>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div 
      v-if="isLoading"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div class="text-center text-white">
        <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg">{{ loadingMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCooperativeGameStore } from '@/stores/cooperativeGame'
import { useAuthStore } from '@/stores/auth'
import { cooperativeGameService } from '@/services/cooperativeGameService'
import { COSMIC_RANKS, COSMIC_ERROR_TYPES } from '@/data/grammar/cosmicGrammarData'
import SpacecraftEngine from './SpacecraftEngine.vue'
import GrammarParts from './GrammarParts.vue'
import PartsDragDrop from './PartsDragDrop.vue'
import RepairAnimation from './RepairAnimation.vue'
import EmergencyCallButton from './EmergencyCallButton.vue'

// Props
const props = defineProps({
  sessionId: {
    type: String,
    required: true
  }
})

// Stores
const gameStore = useCooperativeGameStore()
const authStore = useAuthStore()

// Reactive data
const gameState = reactive({
  status: 'waiting',
  progress: {
    currentPhase: 0,
    totalPhases: 5,
    captainScore: 0,
    coPilotScore: 0,
    score: 0
  },
  emergency: null
})

const isLoading = ref(false)
const loadingMessage = ref('')
const showRepairAnimation = ref(false)
const showMissionComplete = ref(false)
const repairedComponent = ref('')
const repairSuccessType = ref('engine')

// Game data
const currentEngineStatus = ref('malfunction')
const currentMalfunction = ref(COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION)
const repairProgress = ref(0)
const currentProblem = ref(null)
const constructedSentence = ref([])
const targetSentence = ref({})

// Grammar parts
const availableParts = ref([])
const providedParts = ref([])
const selectedParts = ref([])
const targetSlots = ref([])

// Mission tracking
const currentTaskStep = ref(0)
const totalSteps = ref(5)
const recentMessages = ref([])

// Background elements
const galaxies = ref([])

// Computed
const userRole = computed(() => authStore.currentUser?.role || authStore.userRole)

const engineStatus = computed(() => {
  const statusMap = {
    'malfunction': '故障中',
    'diagnosing': '診断中',
    'repairing': '修理中',
    'operational': '正常'
  }
  return statusMap[currentEngineStatus.value] || '不明'
})

const missionBriefing = computed(() => {
  if (userRole.value === 'captain') {
    return '宇宙船の文法エンジンが故障しました。適切な文法パーツを選択してCo-Pilotに提供してください。'
  } else {
    return 'Captainから提供されたパーツを正しい順序で配置し、文法エンジンを修理してください。'
  }
})

const currentTask = computed(() => {
  const tasks = {
    0: 'エンジン故障の診断中...',
    1: 'Captainがパーツを選択中',
    2: 'Co-Pilotがパーツを配置中',
    3: '文構造の検証中',
    4: 'エンジン修理完了チェック'
  }
  return tasks[currentTaskStep.value] || '待機中'
})

// Sample grammar problems
const grammarProblems = ref([
  {
    id: 'basic_be_verb',
    errorType: COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION,
    target: {
      english: 'I am a student.',
      japanese: '私は学生です。',
      structure: ['subject', 'verb', 'article', 'object']
    },
    parts: {
      subjects: [
        { id: 'i', text: 'I', type: 'subject', correct: true },
        { id: 'you', text: 'You', type: 'subject', correct: false },
        { id: 'he', text: 'He', type: 'subject', correct: false }
      ],
      verbs: [
        { id: 'am', text: 'am', type: 'verb', correct: true },
        { id: 'is', text: 'is', type: 'verb', correct: false },
        { id: 'are', text: 'are', type: 'verb', correct: false }
      ],
      articles: [
        { id: 'a', text: 'a', type: 'article', correct: true },
        { id: 'an', text: 'an', type: 'article', correct: false },
        { id: 'the', text: 'the', type: 'article', correct: false }
      ],
      objects: [
        { id: 'student', text: 'student', type: 'object', correct: true },
        { id: 'teacher', text: 'teacher', type: 'object', correct: false },
        { id: 'doctor', text: 'doctor', type: 'object', correct: false }
      ]
    }
  },
  {
    id: 'present_continuous',
    errorType: COSMIC_ERROR_TYPES.TEMPORAL_DISPLACEMENT,
    target: {
      english: 'She is studying English.',
      japanese: '彼女は英語を勉強しています。',
      structure: ['subject', 'auxiliary', 'verb', 'object']
    },
    parts: {
      subjects: [
        { id: 'she', text: 'She', type: 'subject', correct: true },
        { id: 'he', text: 'He', type: 'subject', correct: false },
        { id: 'they', text: 'They', type: 'subject', correct: false }
      ],
      auxiliaries: [
        { id: 'is', text: 'is', type: 'auxiliary', correct: true },
        { id: 'are', text: 'are', type: 'auxiliary', correct: false },
        { id: 'am', text: 'am', type: 'auxiliary', correct: false }
      ],
      verbs: [
        { id: 'studying', text: 'studying', type: 'verb', correct: true },
        { id: 'study', text: 'study', type: 'verb', correct: false },
        { id: 'studied', text: 'studied', type: 'verb', correct: false }
      ],
      objects: [
        { id: 'english', text: 'English', type: 'object', correct: true },
        { id: 'math', text: 'Math', type: 'object', correct: false },
        { id: 'science', text: 'Science', type: 'object', correct: false }
      ]
    }
  }
])

// Methods
const initializeGame = async () => {
  isLoading.value = true
  loadingMessage.value = '宇宙船システムを初期化中...'

  try {
    // Join or create session
    if (userRole.value === 'captain') {
      await createGameSession()
    } else {
      await joinGameSession()
    }

    // Initialize first problem
    initializeProblem()
    
    // Set up real-time listeners
    setupRealtimeListeners()
    
    // Generate background elements
    generateBackground()
    
    currentEngineStatus.value = 'malfunction'
    currentTaskStep.value = 1

  } catch (error) {
    console.error('Failed to initialize game:', error)
  } finally {
    isLoading.value = false
  }
}

const createGameSession = async () => {
  const gameConfig = {
    type: 'grammarConstruction',
    difficulty: 'beginner',
    totalPhases: 5,
    maxDuration: 30,
    gameData: {
      currentProblemIndex: 0,
      problems: grammarProblems.value
    }
  }

  const result = await cooperativeGameService.createSession(gameConfig)
  if (!result.success) {
    throw new Error(result.error)
  }
}

const joinGameSession = async () => {
  const result = await cooperativeGameService.joinSession(props.sessionId)
  if (!result.success) {
    throw new Error(result.error)
  }
}

const initializeProblem = () => {
  const problem = grammarProblems.value[0]
  currentProblem.value = problem
  targetSentence.value = problem.target

  if (userRole.value === 'captain') {
    // Prepare all available parts for captain to select from
    availableParts.value = [
      ...problem.parts.subjects,
      ...problem.parts.verbs,
      ...problem.parts.auxiliaries || [],
      ...problem.parts.articles || [],
      ...problem.parts.objects
    ]
  }

  // Initialize slots for sentence construction
  targetSlots.value = problem.target.structure.map((slotType, index) => ({
    id: `slot-${index}`,
    type: slotType,
    filled: false,
    part: null
  }))
}

const setupRealtimeListeners = () => {
  // Override service event handlers
  cooperativeGameService.onSessionUpdate = (sessionData) => {
    Object.assign(gameState, sessionData)
  }

  cooperativeGameService.onProgressUpdate = (progressData) => {
    Object.assign(gameState.progress, progressData)
  }

  cooperativeGameService.onEmergencyUpdate = (emergencyData) => {
    gameState.emergency = emergencyData
  }

  cooperativeGameService.onMessagesUpdate = (messages) => {
    recentMessages.value = messages.slice(-5)
  }
}

const generateBackground = () => {
  galaxies.value = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 5
  }))
}

// Captain methods
const onPartSelected = async (part) => {
  selectedParts.value.push(part)
  
  // Send selected part to co-pilot
  await cooperativeGameService.updateProgress({
    providedParts: selectedParts.value,
    currentStep: 'parts_provided'
  })

  await cooperativeGameService.sendMessage(
    `パーツ「${part.text}」を提供しました`,
    'part_provided'
  )

  currentTaskStep.value = 2
}

const onPartHighlighted = (part) => {
  // Visual feedback for part highlighting
}

// Co-Pilot methods
const onPartsArranged = async (arrangement) => {
  constructedSentence.value = arrangement
  
  await cooperativeGameService.updateProgress({
    constructedSentence: arrangement,
    currentStep: 'parts_arranged'
  })

  currentTaskStep.value = 3
}

const onSlotFilled = (slot, part) => {
  // Update slot with placed part
  const slotIndex = targetSlots.value.findIndex(s => s.id === slot.id)
  if (slotIndex !== -1) {
    targetSlots.value[slotIndex].filled = true
    targetSlots.value[slotIndex].part = part
  }
}

const onConstructionComplete = async () => {
  currentTaskStep.value = 4
  
  // Validate construction
  const isCorrect = validateConstruction()
  
  if (isCorrect) {
    repairProgress.value = 100
    currentEngineStatus.value = 'operational'
    showRepairSuccess()
  } else {
    // Show error feedback
    await cooperativeGameService.sendMessage(
      '構造にエラーがあります。再度確認してください。',
      'error'
    )
  }
}

const validateConstruction = () => {
  // Check if all slots are filled correctly
  return targetSlots.value.every(slot => {
    if (!slot.filled || !slot.part) return false
    
    // Find the correct part for this slot type
    const problem = currentProblem.value
    const correctParts = Object.values(problem.parts).flat().filter(part => 
      part.type === slot.type && part.correct
    )
    
    return correctParts.some(correctPart => correctPart.id === slot.part.id)
  })
}

const showRepairSuccess = () => {
  showRepairAnimation.value = true
  repairedComponent.value = 'grammar_engine'
  repairSuccessType.value = 'complete'
  
  // Update scores
  const captainScore = gameState.progress.captainScore + 100
  const coPilotScore = gameState.progress.coPilotScore + 100
  
  cooperativeGameService.updateScore('captain', captainScore)
  cooperativeGameService.updateScore('copilot', coPilotScore)
}

const onRepairAnimationComplete = () => {
  showRepairAnimation.value = false
  showMissionComplete.value = true
}

const nextMission = () => {
  showMissionComplete.value = false
  
  // Load next problem or complete game
  const nextProblemIndex = gameState.progress.currentPhase + 1
  if (nextProblemIndex < grammarProblems.value.length) {
    loadNextProblem(nextProblemIndex)
  } else {
    // Game complete
    cooperativeGameService.endSession()
  }
}

const loadNextProblem = (index) => {
  const problem = grammarProblems.value[index]
  currentProblem.value = problem
  targetSentence.value = problem.target
  
  // Reset state
  constructedSentence.value = []
  selectedParts.value = []
  providedParts.value = []
  repairProgress.value = 0
  currentEngineStatus.value = 'malfunction'
  currentTaskStep.value = 1
  
  // Update phase
  gameState.progress.currentPhase = index
  
  if (userRole.value === 'captain') {
    availableParts.value = [
      ...problem.parts.subjects,
      ...problem.parts.verbs,
      ...problem.parts.auxiliaries || [],
      ...problem.parts.articles || [],
      ...problem.parts.objects
    ]
  }
  
  targetSlots.value = problem.target.structure.map((slotType, index) => ({
    id: `slot-${index}`,
    type: slotType,
    filled: false,
    part: null
  }))
}

// Event handlers
const onRepairComplete = () => {
  currentTaskStep.value = 5
  showRepairSuccess()
}

const onEngineDiagnosis = (diagnosis) => {
  currentMalfunction.value = diagnosis.errorType
  currentTaskStep.value = 1
}

const handleEmergencyCall = async (message) => {
  await cooperativeGameService.sendEmergencyCall(message)
}

const getMessageStyle = (message) => {
  const styles = {
    part_provided: 'border-purple-500 text-purple-300',
    construction: 'border-pink-500 text-pink-300',
    success: 'border-green-500 text-green-300',
    error: 'border-red-500 text-red-300'
  }
  return styles[message.type] || 'border-gray-500 text-gray-300'
}

// Lifecycle
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  cooperativeGameService.cleanup()
})

// Watch for provided parts updates
watch(() => gameState.progress?.providedParts, (newParts) => {
  if (newParts && userRole.value === 'copilot') {
    providedParts.value = newParts
  }
})
</script>

<style scoped>
@import '@/assets/css/sound-radar-animations.css';

.grammar-spacecraft {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Component-specific animations */
.engine-malfunction {
  animation: malfunction-flicker 2s ease-in-out infinite;
}

.parts-highlight {
  animation: parts-glow 1s ease-in-out infinite;
}

@keyframes malfunction-flicker {
  0%, 100% {
    filter: hue-rotate(0deg) brightness(1);
  }
  25% {
    filter: hue-rotate(20deg) brightness(0.8);
  }
  50% {
    filter: hue-rotate(-20deg) brightness(1.2);
  }
  75% {
    filter: hue-rotate(20deg) brightness(0.9);
  }
}

@keyframes parts-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(168, 85, 247, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
  }
}
</style>