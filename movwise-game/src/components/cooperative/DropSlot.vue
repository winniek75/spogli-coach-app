<template>
  <div class="drop-slot-container relative">
    <!-- Slot label -->
    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-300">
      {{ getSlotLabel(slot.type) }}
    </div>
    
    <!-- Main drop slot -->
    <div
      class="drop-slot relative transition-all duration-300"
      :class="getSlotClass()"
      @dragover="onDragOver"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <!-- Slot content -->
      <div v-if="slot.filled && slot.part" class="slot-content">
        <!-- Filled part -->
        <div class="text-center p-3">
          <div class="text-white font-medium mb-1">
            {{ slot.part.text }}
          </div>
          <div class="text-xs text-gray-300">
            {{ getTypeLabel(slot.part.type) }}
          </div>
        </div>
        
        <!-- Remove button -->
        <button
          @click="removePart"
          class="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-all duration-200"
        >
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Validation indicator -->
        <div 
          class="absolute bottom-0 left-0 right-0 h-1"
          :class="getValidationClass()"
        ></div>
      </div>
      
      <!-- Empty slot placeholder -->
      <div v-else class="slot-placeholder">
        <div class="text-center p-3 text-gray-400">
          <i class="fas fa-plus text-lg mb-1"></i>
          <div class="text-xs">{{ getSlotPlaceholder(slot.type) }}</div>
        </div>
      </div>
      
      <!-- Drag target indicator -->
      <div 
        v-if="isDragOver"
        class="absolute inset-0 border-2 border-dashed rounded-lg pointer-events-none"
        :class="getDragTargetClass()"
      ></div>
      
      <!-- Connection indicator to next slot -->
      <div 
        v-if="connectionActive"
        class="absolute top-1/2 -right-4 w-8 h-1 transform -translate-y-1/2"
        :class="getConnectionClass()"
      ></div>
    </div>
    
    <!-- Position indicator -->
    <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
      {{ index + 1 }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  slot: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  connectionActive: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['drop', 'dragover', 'dragleave', 'remove-part'])

// Reactive data
const isDragOver = ref(false)
const draggedPartType = ref(null)

// Methods
const getSlotClass = () => {
  const baseClass = 'w-24 h-20 rounded-lg border-2 relative transition-all duration-300 transform hover:scale-105'
  
  if (props.slot.filled) {
    if (props.isCorrect) {
      return `${baseClass} border-green-500 bg-gradient-to-br from-green-900/30 to-green-800/30 shadow-lg shadow-green-500/20`
    } else {
      return `${baseClass} border-red-500 bg-gradient-to-br from-red-900/30 to-red-800/30 shadow-lg shadow-red-500/20`
    }
  } else {
    return `${baseClass} border-purple-400 border-dashed bg-gradient-to-br from-purple-900/10 to-pink-900/10 hover:border-purple-300 hover:bg-purple-900/20`
  }
}

const getDragTargetClass = () => {
  if (draggedPartType.value === props.slot.type) {
    return 'border-green-400 bg-green-400/10'
  } else {
    return 'border-red-400 bg-red-400/10'
  }
}

const getValidationClass = () => {
  if (props.isCorrect) {
    return 'bg-gradient-to-r from-green-400 to-emerald-400'
  } else {
    return 'bg-gradient-to-r from-red-400 to-rose-400'
  }
}

const getConnectionClass = () => {
  if (props.connectionActive) {
    return 'bg-gradient-to-r from-purple-400 to-pink-400 animate-connection-pulse rounded'
  } else {
    return 'bg-gray-600 rounded'
  }
}

const getSlotLabel = (type) => {
  const labels = {
    subject: '主語',
    verb: '動詞',
    auxiliary: '助動詞',
    article: '冠詞',
    object: '目的語'
  }
  return labels[type] || type
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

const getSlotPlaceholder = (type) => {
  const placeholders = {
    subject: 'Drop Subject',
    verb: 'Drop Verb',
    auxiliary: 'Drop Auxiliary',
    article: 'Drop Article',
    object: 'Drop Object'
  }
  return placeholders[type] || 'Drop Part'
}

const onDragOver = (event) => {
  event.preventDefault()
  
  if (props.slot.filled) return
  
  // Get dragged part data
  try {
    const partData = event.dataTransfer.getData('text/plain')
    if (partData) {
      const part = JSON.parse(partData)
      draggedPartType.value = part.type
    }
  } catch (e) {
    // Fallback if data transfer fails
  }
  
  event.dataTransfer.dropEffect = 'move'
  emit('dragover', event, props.slot)
}

const onDragEnter = (event) => {
  event.preventDefault()
  if (!props.slot.filled) {
    isDragOver.value = true
  }
}

const onDragLeave = (event) => {
  event.preventDefault()
  
  // Only hide drag over if we're actually leaving the slot
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false
    draggedPartType.value = null
  }
  
  emit('dragleave', event)
}

const onDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  draggedPartType.value = null
  
  if (props.slot.filled) return
  
  emit('drop', event, props.slot, props.index)
}

const removePart = () => {
  if (props.slot.filled) {
    emit('remove-part', props.index)
  }
}
</script>

<style scoped>
.drop-slot {
  backdrop-filter: blur(5px);
  min-height: 80px;
}

.slot-content {
  height: 100%;
  width: 100%;
}

.slot-placeholder {
  height: 100%;
  width: 100%;
}

/* Drag over animation */
.drop-slot:hover {
  transform: scale(1.05);
}

/* Connection pulse animation */
@keyframes connection-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.2);
  }
}

.animate-connection-pulse {
  animation: connection-pulse 2s ease-in-out infinite;
}

/* Slot fill animation */
@keyframes slot-fill {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.slot-content {
  animation: slot-fill 0.5s ease-out;
}

/* Validation pulse */
@keyframes validation-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
}

.border-green-500 {
  animation: validation-pulse 2s infinite;
}

/* Error pulse */
@keyframes error-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

.border-red-500 {
  animation: error-pulse 2s infinite;
}
</style>