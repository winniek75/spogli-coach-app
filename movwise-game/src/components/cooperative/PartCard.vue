<template>
  <div 
    class="part-card relative cursor-pointer transition-all duration-300 transform hover:scale-105"
    :class="getCardClass()"
    @click="onSelect"
    @mouseenter="onHighlight"
    @mouseleave="onUnhighlight"
  >
    <!-- Selection indicator -->
    <div 
      v-if="isSelected"
      class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center z-10"
    >
      <i class="fas fa-check text-white text-xs"></i>
    </div>

    <!-- Correct indicator -->
    <div 
      v-if="isCorrect && showCorrectIndicator"
      class="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center z-10"
    >
      <i class="fas fa-star text-white text-xs"></i>
    </div>

    <!-- Card content -->
    <div class="p-4 text-center">
      <!-- Part text -->
      <div class="text-white font-medium text-lg mb-2">
        {{ part.text }}
      </div>
      
      <!-- Part type -->
      <div class="text-xs text-gray-300 mb-2">
        {{ getTypeLabel(part.type) }}
      </div>
      
      <!-- Energy indicator -->
      <div class="flex justify-center">
        <div 
          class="w-12 h-1 rounded-full transition-all duration-300"
          :class="getEnergyClass()"
        ></div>
      </div>
    </div>

    <!-- Energy particles (when selected) -->
    <div 
      v-if="isSelected"
      class="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
    >
      <div 
        v-for="particle in energyParticles" 
        :key="particle.id"
        class="absolute w-1 h-1 rounded-full animate-twinkle"
        :class="particle.class"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          animationDelay: particle.delay + 's'
        }"
      ></div>
    </div>

    <!-- Hover glow effect -->
    <div 
      v-if="isHighlighted"
      class="absolute inset-0 rounded-lg pointer-events-none"
      :style="{ 
        boxShadow: `0 0 20px ${getGlowColor()}`,
        background: `radial-gradient(circle at center, ${getGlowColor()}20, transparent 70%)`
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Props
const props = defineProps({
  part: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  selectionLimit: {
    type: Number,
    default: 1
  },
  showCorrectIndicator: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['select', 'highlight'])

// Reactive data
const isHighlighted = ref(false)
const energyParticles = ref([])

// Computed
const getCardClass = () => {
  const baseClass = 'rounded-lg border-2 bg-gradient-to-br min-h-[80px] relative overflow-hidden'
  
  if (props.isSelected) {
    return `${baseClass} border-purple-400 from-purple-900/50 to-pink-900/50 shadow-lg shadow-purple-500/20`
  } else if (props.isCorrect) {
    return `${baseClass} border-green-400/50 from-slate-800/50 to-slate-700/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20`
  } else {
    return `${baseClass} border-gray-500/50 from-slate-800/50 to-slate-700/50 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10`
  }
}

const getEnergyClass = () => {
  if (props.isSelected) {
    return 'bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse'
  } else if (props.isCorrect) {
    return 'bg-gradient-to-r from-green-400 to-emerald-400'
  } else {
    return 'bg-gradient-to-r from-gray-400 to-gray-500'
  }
}

const getGlowColor = () => {
  const colors = {
    subject: '#3b82f6',      // blue
    verb: '#10b981',         // green
    auxiliary: '#f59e0b',    // amber
    article: '#ec4899',      // pink
    object: '#8b5cf6'        // purple
  }
  return colors[props.part.type] || '#6b7280'
}

const getTypeLabel = (type) => {
  const labels = {
    subject: '主語',
    verb: '動詞',
    auxiliary: '助動詞',
    article: '冠詞',
    object: '目的語'
  }
  return labels[type] || type
}

// Methods
const onSelect = () => {
  emit('select', props.part)
}

const onHighlight = () => {
  isHighlighted.value = true
  emit('highlight', props.part)
}

const onUnhighlight = () => {
  isHighlighted.value = false
}

const generateEnergyParticles = () => {
  if (props.isSelected) {
    energyParticles.value = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      class: getParticleClass(),
      delay: Math.random() * 2
    }))
  } else {
    energyParticles.value = []
  }
}

const getParticleClass = () => {
  const colors = {
    subject: 'bg-blue-400',
    verb: 'bg-green-400',
    auxiliary: 'bg-yellow-400',
    article: 'bg-pink-400',
    object: 'bg-purple-400'
  }
  return colors[props.part.type] || 'bg-gray-400'
}

// Lifecycle
onMounted(() => {
  generateEnergyParticles()
})

// Watch for selection changes
watch(() => props.isSelected, () => {
  generateEnergyParticles()
})
</script>

<style scoped>
.part-card {
  backdrop-filter: blur(10px);
  background-clip: padding-box;
}

.part-card:hover {
  transform: translateY(-2px) scale(1.02);
}

.part-card:active {
  transform: translateY(0) scale(0.98);
}

/* Energy particle animations */
@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.animate-twinkle {
  animation: twinkle 2s ease-in-out infinite;
}

/* Pulse effect for selected cards */
@keyframes selection-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
  }
}

.part-card.selected {
  animation: selection-pulse 2s infinite;
}
</style>