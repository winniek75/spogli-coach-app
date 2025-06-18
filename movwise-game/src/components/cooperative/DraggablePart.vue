<template>
  <div
    class="draggable-part relative cursor-move transition-all duration-300"
    :class="getPartClass()"
    :draggable="!isUsed"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- Drag handle -->
    <div class="absolute top-1 right-1 text-gray-400 text-xs">
      <i class="fas fa-grip-vertical"></i>
    </div>

    <!-- Part content -->
    <div class="p-3 text-center">
      <!-- Part text -->
      <div class="text-white font-medium mb-1">
        {{ part.text }}
      </div>
      
      <!-- Part type -->
      <div class="text-xs text-gray-300">
        {{ getTypeLabel(part.type) }}
      </div>
    </div>

    <!-- Energy indicator -->
    <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg">
      <div 
        class="h-full rounded-b-lg transition-all duration-300"
        :class="getEnergyClass()"
      ></div>
    </div>

    <!-- Drag preview ghost -->
    <div 
      v-if="isDragging"
      class="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg border-2 border-purple-400 animate-pulse"
    ></div>

    <!-- Used overlay -->
    <div 
      v-if="isUsed"
      class="absolute inset-0 bg-gray-900/70 rounded-lg flex items-center justify-center"
    >
      <div class="text-gray-400 text-sm">
        <i class="fas fa-check mr-1"></i>
        Used
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  part: {
    type: Object,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['dragstart', 'dragend'])

// Reactive data
const isDragging = ref(false)

// Methods
const getPartClass = () => {
  const baseClass = 'rounded-lg border-2 min-h-[60px] relative overflow-hidden transform'
  
  if (props.isUsed) {
    return `${baseClass} border-gray-600 bg-gradient-to-br from-gray-800/50 to-gray-700/50 opacity-50 cursor-not-allowed`
  } else {
    const typeColors = {
      subject: 'border-blue-400/50 bg-gradient-to-br from-blue-900/30 to-blue-800/30 hover:border-blue-400 hover:scale-105',
      verb: 'border-green-400/50 bg-gradient-to-br from-green-900/30 to-green-800/30 hover:border-green-400 hover:scale-105',
      auxiliary: 'border-yellow-400/50 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 hover:border-yellow-400 hover:scale-105',
      article: 'border-pink-400/50 bg-gradient-to-br from-pink-900/30 to-pink-800/30 hover:border-pink-400 hover:scale-105',
      object: 'border-purple-400/50 bg-gradient-to-br from-purple-900/30 to-purple-800/30 hover:border-purple-400 hover:scale-105'
    }
    return `${baseClass} ${typeColors[props.part.type] || 'border-gray-400/50 bg-gradient-to-br from-gray-900/30 to-gray-800/30'}`
  }
}

const getEnergyClass = () => {
  if (props.isUsed) {
    return 'bg-gray-500'
  }
  
  const typeColors = {
    subject: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    verb: 'bg-gradient-to-r from-green-400 to-emerald-400',
    auxiliary: 'bg-gradient-to-r from-yellow-400 to-amber-400',
    article: 'bg-gradient-to-r from-pink-400 to-rose-400',
    object: 'bg-gradient-to-r from-purple-400 to-indigo-400'
  }
  
  return typeColors[props.part.type] || 'bg-gradient-to-r from-gray-400 to-gray-500'
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

const onDragStart = (event) => {
  if (props.isUsed) {
    event.preventDefault()
    return
  }
  
  isDragging.value = true
  
  // Set drag data
  event.dataTransfer.setData('text/plain', JSON.stringify(props.part))
  event.dataTransfer.effectAllowed = 'move'
  
  // Set drag image (optional: could create a custom drag image)
  const dragImage = event.target.cloneNode(true)
  dragImage.style.transform = 'rotate(5deg) scale(0.9)'
  dragImage.style.opacity = '0.8'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 30, 30)
  
  // Clean up drag image after a brief delay
  setTimeout(() => {
    document.body.removeChild(dragImage)
  }, 0)
  
  emit('dragstart', props.part)
}

const onDragEnd = (event) => {
  isDragging.value = false
  emit('dragend', props.part)
}
</script>

<style scoped>
.draggable-part {
  backdrop-filter: blur(5px);
  user-select: none;
}

.draggable-part:not(.cursor-not-allowed):hover {
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.draggable-part:not(.cursor-not-allowed):active {
  transform: scale(0.95);
}

/* Drag feedback animations */
.draggable-part.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

/* Disable selection during drag */
.draggable-part::selection {
  background: transparent;
}

.draggable-part::-moz-selection {
  background: transparent;
}

/* Custom drag cursor */
.cursor-move:hover {
  cursor: grab;
}

.cursor-move:active {
  cursor: grabbing;
}

/* Pulse animation for available parts */
@keyframes part-available {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.3);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(168, 85, 247, 0);
  }
}

.draggable-part:not(.opacity-50):hover {
  animation: part-available 2s ease-in-out infinite;
}
</style>