<template>
  <div class="radar-display bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur rounded-2xl p-8 border border-cyan-500/30 relative overflow-hidden">
    
    <!-- Radar Header -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
          <i class="fas fa-satellite-dish text-sm"></i>
        </div>
        <h2 class="text-xl font-bold text-cyan-300">宇宙音素レーダー</h2>
      </div>
      
      <div class="text-right">
        <div class="text-sm text-cyan-400">
          {{ scanning ? 'スキャン中...' : phonemeDetected ? '音素発見!' : '待機中' }}
        </div>
        <div v-if="currentPhoneme" class="text-xs text-blue-300">
          目標: {{ currentPhoneme.symbol }} ({{ currentPhoneme.ipa }})
        </div>
      </div>
    </div>

    <!-- Main Radar Circle -->
    <div class="relative w-full aspect-square max-w-md mx-auto">
      
      <!-- Radar Background Grid -->
      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <!-- Concentric circles -->
        <circle 
          v-for="ring in 4" 
          :key="'ring-' + ring"
          cx="200" 
          cy="200" 
          :r="ring * 45"
          fill="none" 
          stroke="rgba(34, 211, 238, 0.2)"
          stroke-width="1"
          :class="{ 'animate-pulse': scanning }"
        />
        
        <!-- Cross lines -->
        <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(34, 211, 238, 0.2)" stroke-width="1" />
        <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(34, 211, 238, 0.2)" stroke-width="1" />
        
        <!-- Diagonal lines -->
        <line x1="73" y1="73" x2="327" y2="327" stroke="rgba(34, 211, 238, 0.1)" stroke-width="1" />
        <line x1="327" y1="73" x2="73" y2="327" stroke="rgba(34, 211, 238, 0.1)" stroke-width="1" />

        <!-- Radar Sweep -->
        <g v-if="scanning">
          <defs>
            <radialGradient id="radarSweep" cx="0%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:rgba(34, 211, 238, 0.8);stop-opacity:1" />
              <stop offset="50%" style="stop-color:rgba(34, 211, 238, 0.3);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(34, 211, 238, 0);stop-opacity:0" />
            </radialGradient>
          </defs>
          
          <path
            :d="getSweepPath()"
            fill="url(#radarSweep)"
            :style="{ transformOrigin: '200px 200px' }"
            class="animate-spin"
            style="animation-duration: 3s;"
          />
          
          <!-- Sweep line -->
          <line
            x1="200"
            y1="200"
            x2="200"
            y2="20"
            stroke="rgba(34, 211, 238, 1)"
            stroke-width="2"
            :style="{ transformOrigin: '200px 200px' }"
            class="animate-spin"
            style="animation-duration: 3s;"
          />
        </g>

        <!-- Phoneme Signals -->
        <g v-for="signal in radarData.foundSignals" :key="signal.timestamp">
          <circle
            :cx="getSignalX(signal)"
            :cy="getSignalY(signal)"
            :r="signal.radius || 8"
            :fill="currentPhoneme?.color ? getGradientColor(currentPhoneme.color) : '#22d3ee'"
            :class="{ 'phoneme-pulse': phonemeDetected }"
            @click="onSignalClick(signal)"
          />
          
          <!-- Signal rings -->
          <circle
            :cx="getSignalX(signal)"
            :cy="getSignalY(signal)"
            :r="signal.radius ? signal.radius + 10 : 18"
            fill="none"
            :stroke="currentPhoneme?.color ? getGradientColor(currentPhoneme.color) : '#22d3ee'"
            stroke-width="1"
            opacity="0.5"
            class="animate-ping"
          />
          
          <!-- Phoneme symbol -->
          <text
            :x="getSignalX(signal)"
            :y="getSignalY(signal) + 5"
            text-anchor="middle"
            class="text-xs font-bold fill-white"
            style="font-family: monospace;"
          >
            {{ signal.phoneme?.symbol }}
          </text>
        </g>

        <!-- Scanning blips -->
        <g v-if="scanning">
          <circle
            v-for="blip in scanningBlips"
            :key="blip.id"
            :cx="blip.x"
            :cy="blip.y"
            :r="blip.size"
            fill="rgba(34, 211, 238, 0.6)"
            class="animate-ping"
          />
        </g>
      </svg>

      <!-- Center Hub -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full 
                  flex items-center justify-center shadow-lg border-2 border-cyan-300">
        <div class="w-8 h-8 bg-gradient-to-br from-white to-cyan-200 rounded-full 
                   flex items-center justify-center">
          <i class="fas fa-crosshairs text-cyan-800 text-sm"></i>
        </div>
      </div>

      <!-- Radar Status Indicators -->
      <div class="absolute top-4 right-4 space-y-2">
        <!-- Power indicator -->
        <div class="flex items-center space-x-2 text-xs">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-green-400">POWER</span>
        </div>
        
        <!-- Signal strength -->
        <div class="flex items-center space-x-2 text-xs">
          <div class="flex space-x-1">
            <div v-for="bar in 5" :key="bar" 
                 class="w-1 h-3 bg-gradient-to-t from-cyan-600 to-cyan-400"
                 :class="{ 'opacity-30': bar > signalStrength }">
            </div>
          </div>
          <span class="text-cyan-400">SIGNAL</span>
        </div>
      </div>

      <!-- Detection Zone Highlight -->
      <div 
        v-if="phonemeDetected"
        class="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse"
        style="animation-duration: 1.5s;"
      ></div>
    </div>

    <!-- Radar Controls (Captain only) -->
    <div v-if="userRole === 'captain'" class="mt-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <button
          @click="startScan"
          :disabled="scanning"
          class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 
                 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 text-sm"
        >
          <i class="fas fa-play mr-2"></i>
          {{ scanning ? 'スキャン中...' : 'スキャン開始' }}
        </button>
        
        <button
          @click="resetRadar"
          :disabled="scanning"
          class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 
                 disabled:from-gray-700 disabled:to-gray-800 text-white font-medium py-2 px-4 rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 text-sm"
        >
          <i class="fas fa-redo mr-2"></i>
          リセット
        </button>
      </div>

      <!-- Radar Configuration -->
      <div class="bg-slate-700/30 rounded-lg p-4 space-y-3">
        <h4 class="text-sm font-medium text-cyan-300">レーダー設定</h4>
        
        <!-- Sensitivity -->
        <div class="space-y-2">
          <label class="text-xs text-blue-300">感度</label>
          <input
            v-model="radarSensitivity"
            type="range"
            min="1"
            max="10"
            class="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            :style="{ background: `linear-gradient(to right, #22d3ee ${radarSensitivity * 10}%, #475569 ${radarSensitivity * 10}%)` }"
          >
          <div class="text-xs text-cyan-400">{{ radarSensitivity }}/10</div>
        </div>

        <!-- Scan Speed -->
        <div class="space-y-2">
          <label class="text-xs text-blue-300">スキャン速度</label>
          <input
            v-model="scanSpeed"
            type="range"
            min="1"
            max="5"
            class="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            :style="{ background: `linear-gradient(to right, #22d3ee ${scanSpeed * 20}%, #475569 ${scanSpeed * 20}%)` }"
          >
          <div class="text-xs text-cyan-400">{{ ['最低速', '低速', '標準', '高速', '最高速'][scanSpeed - 1] }}</div>
        </div>
      </div>
    </div>

    <!-- Signal Information Panel -->
    <div v-if="selectedSignal" class="mt-6 bg-slate-700/30 rounded-lg p-4">
      <h4 class="text-sm font-medium text-cyan-300 mb-3 flex items-center">
        <i class="fas fa-info-circle mr-2"></i>
        信号情報
      </h4>
      
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-blue-300">音素:</span>
          <span class="text-white font-mono">{{ selectedSignal.phoneme?.symbol }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-blue-300">IPA:</span>
          <span class="text-white font-mono">{{ selectedSignal.phoneme?.ipa }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-blue-300">距離:</span>
          <span class="text-white">{{ Math.round(selectedSignal.distance * 100) }}%</span>
        </div>
        <div class="flex justify-between">
          <span class="text-blue-300">方位:</span>
          <span class="text-white">{{ Math.round(selectedSignal.angle) }}°</span>
        </div>
      </div>

      <!-- Examples -->
      <div v-if="selectedSignal.phoneme?.examples" class="mt-3 pt-3 border-t border-slate-600">
        <div class="text-xs text-blue-300 mb-2">使用例:</div>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="example in selectedSignal.phoneme.examples.slice(0, 3)"
            :key="example"
            class="px-2 py-1 bg-slate-600 rounded text-xs text-white"
          >
            {{ example }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  currentPhoneme: {
    type: Object,
    default: null
  },
  scanning: {
    type: Boolean,
    default: false
  },
  phonemeDetected: {
    type: Boolean,
    default: false
  },
  userRole: {
    type: String,
    default: 'copilot'
  },
  radarData: {
    type: Object,
    default: () => ({
      signals: [],
      scanAngle: 0,
      foundSignals: []
    })
  }
})

// Emits
const emit = defineEmits(['start-scan', 'phoneme-found'])

// Reactive data
const radarSensitivity = ref(5)
const scanSpeed = ref(3)
const selectedSignal = ref(null)
const scanningBlips = ref([])

// Computed
const signalStrength = computed(() => {
  return Math.min(5, Math.max(1, radarSensitivity.value + (props.phonemeDetected ? 2 : 0)))
})

// Methods
const getSweepPath = () => {
  // Create a 60-degree sweep arc
  const centerX = 200
  const centerY = 200
  const radius = 180
  const startAngle = -30 * Math.PI / 180
  const endAngle = 30 * Math.PI / 180
  
  const x1 = centerX + radius * Math.cos(startAngle)
  const y1 = centerY + radius * Math.sin(startAngle)
  const x2 = centerX + radius * Math.cos(endAngle)
  const y2 = centerY + radius * Math.sin(endAngle)
  
  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`
}

const getSignalX = (signal) => {
  const centerX = 200
  const maxRadius = 180
  const x = centerX + (signal.distance * maxRadius * Math.cos(signal.angle * Math.PI / 180))
  return Math.max(20, Math.min(380, x))
}

const getSignalY = (signal) => {
  const centerY = 200
  const maxRadius = 180
  const y = centerY + (signal.distance * maxRadius * Math.sin(signal.angle * Math.PI / 180))
  return Math.max(20, Math.min(380, y))
}

const getGradientColor = (colorClass) => {
  const colorMap = {
    'from-blue-400 to-blue-600': '#3b82f6',
    'from-red-400 to-red-600': '#ef4444',
    'from-green-400 to-green-600': '#22c55e',
    'from-yellow-400 to-yellow-600': '#eab308',
    'from-purple-400 to-purple-600': '#a855f7',
    'from-cyan-400 to-cyan-600': '#22d3ee'
  }
  return colorMap[colorClass] || '#22d3ee'
}

const startScan = () => {
  if (props.scanning) return
  emit('start-scan')
  generateScanningBlips()
}

const resetRadar = () => {
  selectedSignal.value = null
  scanningBlips.value = []
}

const onSignalClick = (signal) => {
  selectedSignal.value = signal
  if (!props.phonemeDetected && signal.phoneme?.symbol === props.currentPhoneme?.symbol) {
    emit('phoneme-found')
  }
}

const generateScanningBlips = () => {
  scanningBlips.value = []
  
  const blipCount = radarSensitivity.value
  for (let i = 0; i < blipCount; i++) {
    setTimeout(() => {
      const angle = Math.random() * 360
      const distance = Math.random() * 0.8 + 0.1
      const centerX = 200
      const centerY = 200
      const maxRadius = 180
      
      const blip = {
        id: Date.now() + i,
        x: centerX + (distance * maxRadius * Math.cos(angle * Math.PI / 180)),
        y: centerY + (distance * maxRadius * Math.sin(angle * Math.PI / 180)),
        size: Math.random() * 3 + 2
      }
      
      scanningBlips.value.push(blip)
      
      // Remove blip after animation
      setTimeout(() => {
        const index = scanningBlips.value.findIndex(b => b.id === blip.id)
        if (index > -1) {
          scanningBlips.value.splice(index, 1)
        }
      }, 2000)
      
    }, i * 500)
  }
}

// Watch for scanning changes
watch(() => props.scanning, (isScanning) => {
  if (isScanning) {
    generateScanningBlips()
  }
})

// Initialize
onMounted(() => {
  // Any initialization logic
})
</script>

<style scoped>
/* Custom radar animations */
@keyframes radar-sweep {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes phoneme-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.phoneme-pulse {
  animation: phoneme-pulse 2s ease-in-out infinite;
}

/* Custom scrollbar */
.radar-display::-webkit-scrollbar {
  width: 6px;
}

.radar-display::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.radar-display::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.5);
  border-radius: 3px;
}

.radar-display::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.7);
}

/* Range slider custom styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  border: 2px solid #0f172a;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  border: 2px solid #0f172a;
}
</style>