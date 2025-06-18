<template>
  <div class="spacecraft-engine bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur rounded-2xl p-8 border border-purple-500/30 relative overflow-hidden">
    
    <!-- Engine Header -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
          <i class="fas fa-cog text-sm" :class="{ 'animate-spin': engineStatus === 'repairing' }"></i>
        </div>
        <h2 class="text-xl font-bold text-purple-300">文法エンジン</h2>
      </div>
      
      <div class="text-right">
        <div class="text-sm" :class="getStatusColor()">
          {{ getStatusText() }}
        </div>
        <div class="text-xs text-purple-300">
          修理進行度: {{ repairProgress }}%
        </div>
      </div>
    </div>

    <!-- Main Engine Visualization -->
    <div class="relative w-full aspect-square max-w-lg mx-auto mb-6">
      
      <!-- Engine Core -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div 
          class="w-64 h-64 rounded-full border-4 transition-all duration-1000 relative overflow-hidden"
          :class="getEngineRingClass()"
        >
          <!-- Core energy pattern -->
          <div class="absolute inset-4 rounded-full overflow-hidden">
            <div 
              class="w-full h-full rounded-full transition-all duration-1000"
              :class="getCoreClass()"
            >
              <!-- Energy particles -->
              <div 
                v-for="particle in energyParticles" 
                :key="particle.id"
                class="absolute w-2 h-2 rounded-full"
                :class="particle.class"
                :style="{
                  left: particle.x + '%',
                  top: particle.y + '%',
                  animationDelay: particle.delay + 's'
                }"
              ></div>
            </div>
          </div>

          <!-- Engine segments -->
          <div class="absolute inset-8 rounded-full">
            <div 
              v-for="segment in engineSegments" 
              :key="segment.id"
              class="absolute w-8 h-8 rounded border-2 transition-all duration-500"
              :class="getSegmentClass(segment)"
              :style="{
                left: segment.x + '%',
                top: segment.y + '%',
                transform: `rotate(${segment.rotation}deg)`
              }"
            >
              <!-- Segment content -->
              <div class="w-full h-full flex items-center justify-center text-xs font-bold">
                {{ segment.symbol }}
              </div>
            </div>
          </div>

          <!-- Central processor -->
          <div class="absolute inset-20 rounded-full flex items-center justify-center">
            <div 
              class="w-16 h-16 rounded-full border-2 flex items-center justify-center text-white font-bold transition-all duration-500"
              :class="getProcessorClass()"
            >
              <i class="fas fa-microchip text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Energy beams -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
        <!-- Energy connections between segments -->
        <g v-if="engineStatus !== 'malfunction'">
          <line
            v-for="beam in energyBeams"
            :key="beam.id"
            :x1="beam.x1"
            :y1="beam.y1"
            :x2="beam.x2"
            :y2="beam.y2"
            :stroke="beam.color"
            stroke-width="2"
            class="animate-connection-pulse"
            :style="{ opacity: beam.opacity }"
          />
        </g>
        
        <!-- Error indicators -->
        <g v-if="engineStatus === 'malfunction'">
          <circle
            v-for="error in errorIndicators"
            :key="error.id"
            :cx="error.x"
            :cy="error.y"
            :r="error.size"
            fill="none"
            stroke="#ef4444"
            stroke-width="2"
            class="animate-danger-pulse"
          />
        </g>
      </svg>

      <!-- Malfunction warnings -->
      <div 
        v-if="engineStatus === 'malfunction'"
        class="absolute top-4 right-4 flex flex-col space-y-2"
      >
        <div class="bg-red-900/80 border border-red-500 rounded-lg p-2 animate-pulse">
          <div class="flex items-center space-x-2 text-red-300 text-xs">
            <i class="fas fa-exclamation-triangle"></i>
            <span>SYSTEM ERROR</span>
          </div>
        </div>
        <div class="bg-orange-900/80 border border-orange-500 rounded-lg p-2">
          <div class="text-orange-300 text-xs">
            {{ getMalfunctionDescription() }}
          </div>
        </div>
      </div>

      <!-- Repair progress indicator -->
      <div 
        v-if="repairProgress > 0 && repairProgress < 100"
        class="absolute bottom-4 left-4 right-4"
      >
        <div class="bg-slate-900/80 rounded-lg p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-purple-300">修理進行度</span>
            <span class="text-xs text-pink-300">{{ repairProgress }}%</span>
          </div>
          
          <!-- Progress bar -->
          <div class="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 transition-all duration-1000 ease-out"
              :style="{ width: repairProgress + '%' }"
            >
              <!-- Animated shimmer -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sentence Construction Area -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-purple-300 mb-4 flex items-center">
        <i class="fas fa-tools mr-2"></i>
        文構造修理エリア
      </h3>
      
      <!-- Target sentence display -->
      <div class="mb-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
        <div class="text-sm text-purple-200 mb-2">目標文構造</div>
        <div class="text-white font-medium">{{ targetSentence.english }}</div>
        <div class="text-purple-200 text-sm">{{ targetSentence.japanese }}</div>
      </div>

      <!-- Construction slots -->
      <div class="flex flex-wrap gap-3 justify-center">
        <div 
          v-for="(slot, index) in constructionSlots" 
          :key="slot.id"
          class="relative"
        >
          <!-- Slot container -->
          <div 
            class="w-24 h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-300"
            :class="getSlotClass(slot)"
          >
            <!-- Slot label -->
            <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-300">
              {{ getSlotLabel(slot.type) }}
            </div>
            
            <!-- Placed part -->
            <div v-if="slot.filled" class="text-center">
              <div class="text-white font-medium text-sm">{{ slot.part?.text }}</div>
              <div class="text-xs text-purple-200">{{ slot.part?.type }}</div>
            </div>
            
            <!-- Empty slot indicator -->
            <div v-else class="text-gray-400 text-xs">
              {{ getSlotPlaceholder(slot.type) }}
            </div>
          </div>

          <!-- Connection line -->
          <div 
            v-if="index < constructionSlots.length - 1"
            class="absolute top-1/2 -right-3 w-6 h-1 bg-gradient-to-r from-purple-400/50 to-pink-400/50 transform -translate-y-1/2"
            :class="{ 'animate-connection-pulse': slot.filled && constructionSlots[index + 1]?.filled }"
          ></div>
        </div>
      </div>

      <!-- Construction status -->
      <div class="mt-4 text-center">
        <div class="text-sm text-purple-300">
          配置済み: {{ filledSlots }}/{{ totalSlots }}
        </div>
        
        <!-- Validation feedback -->
        <div v-if="showValidation" class="mt-2">
          <div 
            v-if="isConstructionValid"
            class="text-green-400 text-sm flex items-center justify-center space-x-2"
          >
            <i class="fas fa-check-circle"></i>
            <span>文構造が正しく修理されました！</span>
          </div>
          <div 
            v-else
            class="text-red-400 text-sm flex items-center justify-center space-x-2"
          >
            <i class="fas fa-times-circle"></i>
            <span>構造にエラーがあります。確認してください。</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Engine Controls (Captain only) -->
    <div v-if="userRole === 'captain'" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <button
          @click="runDiagnosis"
          :disabled="engineStatus === 'diagnosing'"
          class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
        >
          <i class="fas fa-search mr-2" :class="{ 'animate-spin': engineStatus === 'diagnosing' }"></i>
          {{ engineStatus === 'diagnosing' ? '診断中...' : 'エンジン診断' }}
        </button>
        
        <button
          @click="initializeRepair"
          :disabled="engineStatus !== 'malfunction'"
          class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 
                 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
        >
          <i class="fas fa-wrench mr-2"></i>
          修理開始
        </button>
      </div>
    </div>

    <!-- Engine Status Panel -->
    <div class="mt-6 bg-slate-700/30 rounded-lg p-4">
      <h4 class="text-sm font-medium text-purple-300 mb-3 flex items-center">
        <i class="fas fa-chart-line mr-2"></i>
        エンジン状態
      </h4>
      
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-purple-200 mb-1">コア温度</div>
          <div class="text-white">{{ getCoreTemperature() }}°C</div>
        </div>
        
        <div>
          <div class="text-purple-200 mb-1">エネルギー出力</div>
          <div class="text-white">{{ getEnergyOutput() }}%</div>
        </div>
        
        <div>
          <div class="text-purple-200 mb-1">文法精度</div>
          <div class="text-white">{{ getGrammarAccuracy() }}%</div>
        </div>
        
        <div>
          <div class="text-purple-200 mb-1">システム安定性</div>
          <div class="text-white">{{ getSystemStability() }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { COSMIC_ERROR_TYPES } from '@/data/grammar/cosmicGrammarData'

// Props
const props = defineProps({
  engineStatus: {
    type: String,
    default: 'malfunction' // malfunction, diagnosing, repairing, operational
  },
  malfunctionType: {
    type: String,
    default: COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION
  },
  repairProgress: {
    type: Number,
    default: 0
  },
  constructedSentence: {
    type: Array,
    default: () => []
  },
  targetSentence: {
    type: Object,
    default: () => ({})
  },
  userRole: {
    type: String,
    default: 'copilot'
  }
})

// Emits
const emit = defineEmits(['repair-complete', 'engine-diagnosis'])

// Reactive data
const energyParticles = ref([])
const engineSegments = ref([])
const energyBeams = ref([])
const errorIndicators = ref([])
const showValidation = ref(false)

// Generate engine visualization data
const initializeEngine = () => {
  // Generate energy particles
  energyParticles.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    class: getParticleClass(),
    delay: Math.random() * 2
  }))

  // Generate engine segments (representing grammar components)
  const segmentPositions = [
    { x: 20, y: 30, symbol: 'S' }, // Subject
    { x: 70, y: 30, symbol: 'V' }, // Verb
    { x: 20, y: 70, symbol: 'O' }, // Object
    { x: 70, y: 70, symbol: 'A' }  // Auxiliary/Article
  ]

  engineSegments.value = segmentPositions.map((pos, i) => ({
    id: i,
    x: pos.x,
    y: pos.y,
    symbol: pos.symbol,
    rotation: i * 90,
    status: props.engineStatus === 'malfunction' ? 'error' : 'operational'
  }))

  // Generate energy beams between segments
  energyBeams.value = [
    { id: 1, x1: 100, y1: 150, x2: 280, y2: 150, color: '#a855f7', opacity: 0.6 },
    { id: 2, x1: 100, y1: 250, x2: 280, y2: 250, color: '#ec4899', opacity: 0.6 },
    { id: 3, x1: 190, y1: 100, x2: 190, y2: 300, color: '#22d3ee', opacity: 0.6 }
  ]

  // Generate error indicators for malfunction state
  if (props.engineStatus === 'malfunction') {
    errorIndicators.value = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: 150 + (Math.random() - 0.5) * 100,
      y: 150 + (Math.random() - 0.5) * 100,
      size: 15 + Math.random() * 10
    }))
  }
}

// Computed
const constructionSlots = computed(() => {
  if (!props.targetSentence.structure) return []
  
  return props.targetSentence.structure.map((slotType, index) => {
    const constructedPart = props.constructedSentence[index]
    return {
      id: `slot-${index}`,
      type: slotType,
      filled: !!constructedPart,
      part: constructedPart || null
    }
  })
})

const filledSlots = computed(() => {
  return constructionSlots.value.filter(slot => slot.filled).length
})

const totalSlots = computed(() => {
  return constructionSlots.value.length
})

const isConstructionValid = computed(() => {
  // This would contain more sophisticated validation logic
  return filledSlots.value === totalSlots.value && props.constructedSentence.length > 0
})

// Methods
const getStatusColor = () => {
  const colors = {
    malfunction: 'text-red-400',
    diagnosing: 'text-yellow-400',
    repairing: 'text-blue-400',
    operational: 'text-green-400'
  }
  return colors[props.engineStatus] || 'text-gray-400'
}

const getStatusText = () => {
  const statuses = {
    malfunction: '故障中',
    diagnosing: '診断中',
    repairing: '修理中',
    operational: '正常稼働'
  }
  return statuses[props.engineStatus] || '不明'
}

const getEngineRingClass = () => {
  const classes = {
    malfunction: 'border-red-500 animate-danger-pulse',
    diagnosing: 'border-yellow-500 animate-pulse',
    repairing: 'border-blue-500 animate-connection-pulse',
    operational: 'border-green-500 shadow-lg shadow-green-500/20'
  }
  return classes[props.engineStatus] || 'border-gray-500'
}

const getCoreClass = () => {
  const classes = {
    malfunction: 'bg-gradient-to-br from-red-900/50 to-red-700/50 animate-malfunction-flicker',
    diagnosing: 'bg-gradient-to-br from-yellow-900/50 to-yellow-700/50 animate-pulse',
    repairing: 'bg-gradient-to-br from-blue-900/50 to-blue-700/50 animate-connection-pulse',
    operational: 'bg-gradient-to-br from-green-900/50 to-green-700/50'
  }
  return classes[props.engineStatus] || 'bg-gradient-to-br from-gray-900/50 to-gray-700/50'
}

const getSegmentClass = (segment) => {
  if (props.engineStatus === 'malfunction') {
    return 'border-red-500 bg-red-900/30 text-red-300 animate-malfunction-flicker'
  } else if (props.engineStatus === 'operational') {
    return 'border-green-500 bg-green-900/30 text-green-300'
  } else {
    return 'border-purple-500 bg-purple-900/30 text-purple-300'
  }
}

const getProcessorClass = () => {
  const classes = {
    malfunction: 'border-red-500 bg-red-900/50 animate-danger-pulse',
    diagnosing: 'border-yellow-500 bg-yellow-900/50 animate-pulse',
    repairing: 'border-blue-500 bg-blue-900/50',
    operational: 'border-green-500 bg-green-900/50'
  }
  return classes[props.engineStatus] || 'border-gray-500 bg-gray-900/50'
}

const getSlotClass = (slot) => {
  if (slot.filled) {
    return 'border-green-500 bg-green-900/20'
  } else {
    return 'border-purple-400 bg-purple-900/10 hover:border-purple-300'
  }
}

const getSlotLabel = (type) => {
  const labels = {
    subject: '主語',
    verb: '動詞',
    object: '目的語',
    auxiliary: '助動詞',
    article: '冠詞'
  }
  return labels[type] || type
}

const getSlotPlaceholder = (type) => {
  const placeholders = {
    subject: 'S',
    verb: 'V',
    object: 'O',
    auxiliary: 'Aux',
    article: 'Art'
  }
  return placeholders[type] || '?'
}

const getParticleClass = () => {
  const classes = [
    'bg-purple-400 animate-twinkle',
    'bg-pink-400 animate-twinkle',
    'bg-blue-400 animate-twinkle',
    'bg-cyan-400 animate-twinkle'
  ]
  return classes[Math.floor(Math.random() * classes.length)]
}

const getMalfunctionDescription = () => {
  const descriptions = {
    [COSMIC_ERROR_TYPES.ENERGY_FLOW_DISRUPTION]: '主語-動詞エネルギー不整合',
    [COSMIC_ERROR_TYPES.AUXILIARY_SYSTEM_FAILURE]: '助動詞システム故障',
    [COSMIC_ERROR_TYPES.TEMPORAL_DISPLACEMENT]: '時制同期エラー',
    [COSMIC_ERROR_TYPES.COMMUNICATION_STATIC]: '語順通信障害'
  }
  return descriptions[props.malfunctionType] || 'システムエラー'
}

const getCoreTemperature = () => {
  const baseTemp = {
    malfunction: 850,
    diagnosing: 720,
    repairing: 650,
    operational: 580
  }
  return baseTemp[props.engineStatus] || 500
}

const getEnergyOutput = () => {
  const baseOutput = {
    malfunction: 15,
    diagnosing: 35,
    repairing: 60,
    operational: 95
  }
  return baseOutput[props.engineStatus] || 0
}

const getGrammarAccuracy = () => {
  return Math.min(95, props.repairProgress)
}

const getSystemStability = () => {
  const baseStability = {
    malfunction: 25,
    diagnosing: 45,
    repairing: 70,
    operational: 98
  }
  return baseStability[props.engineStatus] || 0
}

const runDiagnosis = () => {
  emit('engine-diagnosis', {
    errorType: props.malfunctionType,
    severity: 'high',
    components: ['grammar_core', 'sentence_processor']
  })
}

const initializeRepair = () => {
  // This would trigger the Captain to select parts
}

// Watchers
watch(() => props.repairProgress, (newProgress) => {
  if (newProgress === 100) {
    showValidation.value = true
    setTimeout(() => {
      if (isConstructionValid.value) {
        emit('repair-complete')
      }
    }, 1000)
  }
})

watch(() => props.engineStatus, () => {
  initializeEngine()
})

// Lifecycle
onMounted(() => {
  initializeEngine()
})
</script>

<style scoped>
/* Engine-specific animations */
@keyframes malfunction-flicker {
  0%, 100% {
    filter: hue-rotate(0deg) brightness(1);
    transform: scale(1);
  }
  25% {
    filter: hue-rotate(15deg) brightness(0.8);
    transform: scale(1.02);
  }
  50% {
    filter: hue-rotate(-15deg) brightness(1.2);
    transform: scale(0.98);
  }
  75% {
    filter: hue-rotate(10deg) brightness(0.9);
    transform: scale(1.01);
  }
}

.animate-malfunction-flicker {
  animation: malfunction-flicker 2s ease-in-out infinite;
}

/* Shimmer effect for progress bar */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>