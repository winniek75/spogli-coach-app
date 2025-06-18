<template>
  <div class="parts-drag-drop bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-pink-500/30">
    <h3 class="text-lg font-semibold text-pink-300 mb-6 flex items-center">
      <i class="fas fa-hand-rock mr-2"></i>
      Grammar Construction Area
      <span class="ml-2 text-sm text-purple-300">(Co-Pilot Controls)</span>
    </h3>

    <!-- Target Sentence Display -->
    <div class="mb-6 p-4 bg-pink-900/30 rounded-lg border border-pink-500/30">
      <div class="text-sm text-pink-200 mb-2">Target Construction</div>
      <div class="text-white font-medium">{{ targetSlots.map(slot => slot.type).join(' + ') }}</div>
      <div class="text-pink-200 text-sm mt-1">Drag parts into the correct positions to repair the engine</div>
    </div>

    <!-- Provided Parts Pool -->
    <div class="mb-6">
      <h4 class="text-pink-300 font-medium mb-3 flex items-center">
        <i class="fas fa-box mr-2"></i>
        Available Parts
        <span class="ml-2 text-xs text-gray-400">{{ providedParts.length }} parts provided</span>
      </h4>
      
      <div 
        v-if="providedParts.length === 0"
        class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg"
      >
        <i class="fas fa-clock text-2xl mb-2"></i>
        <div>Waiting for Captain to provide parts...</div>
      </div>
      
      <div 
        v-else
        class="grid grid-cols-3 gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
      >
        <DraggablePart
          v-for="part in availableProvidedParts"
          :key="part.id"
          :part="part"
          :is-used="isPartUsed(part)"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        />
      </div>
    </div>

    <!-- Construction Slots -->
    <div class="mb-6">
      <h4 class="text-pink-300 font-medium mb-3 flex items-center">
        <i class="fas fa-puzzle-piece mr-2"></i>
        Construction Sequence
        <span class="ml-2 text-xs text-gray-400">{{ filledSlotsCount }}/{{ targetSlots.length }} filled</span>
      </h4>
      
      <div class="flex flex-wrap gap-4 justify-center">
        <DropSlot
          v-for="(slot, index) in targetSlots"
          :key="slot.id"
          :slot="slot"
          :index="index"
          :is-correct="validateSlot(slot)"
          :connection-active="index < targetSlots.length - 1 && slot.filled && targetSlots[index + 1]?.filled"
          @drop="onDrop"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @remove-part="onRemovePart"
        />
      </div>
    </div>

    <!-- Construction Status -->
    <div class="mb-6 p-4 bg-slate-700/30 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-pink-300">Construction Progress</div>
        <div class="text-xs text-purple-300">{{ Math.round((filledSlotsCount / targetSlots.length) * 100) }}%</div>
      </div>
      
      <!-- Progress bar -->
      <div class="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 transition-all duration-500 relative"
          :style="{ width: (filledSlotsCount / targetSlots.length) * 100 + '%' }"
        >
          <!-- Animated shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
      
      <!-- Status message -->
      <div class="mt-3 text-sm">
        <div v-if="allSlotsFilled && isConstructionValid" class="text-green-400 flex items-center">
          <i class="fas fa-check-circle mr-2"></i>
          Construction complete! Engine repair ready.
        </div>
        <div v-else-if="allSlotsFilled && !isConstructionValid" class="text-red-400 flex items-center">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Construction error detected. Check part placement.
        </div>
        <div v-else class="text-pink-300 flex items-center">
          <i class="fas fa-tools mr-2"></i>
          Continue placing parts to complete construction...
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-6 border-t border-pink-500/30">
      <div class="flex justify-between items-center">
        <button
          @click="clearConstruction"
          :disabled="filledSlotsCount === 0"
          class="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
                 disabled:from-gray-700 disabled:to-gray-800 text-white text-sm rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
        >
          <i class="fas fa-undo mr-2"></i>
          Reset
        </button>
        
        <button
          @click="validateAndSubmit"
          :disabled="!allSlotsFilled"
          class="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 
                 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
        >
          <i class="fas fa-rocket mr-2"></i>
          Initiate Repair
        </button>
      </div>
      
      <!-- Help text -->
      <div class="mt-3 text-xs text-pink-200">
        <i class="fas fa-info-circle mr-1"></i>
        Drag grammar parts from the pool above into the construction slots. Order matters for proper engine function!
      </div>
    </div>

    <!-- Success Animation Container -->
    <div 
      v-if="showConstructionSuccess"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="text-center text-white space-y-6 animate-system-boot">
        <div class="text-6xl animate-success-explosion">⚡</div>
        <h2 class="text-4xl font-bold neon-purple">Construction Success!</h2>
        <p class="text-pink-300">Grammar engine components aligned perfectly!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DraggablePart from './DraggablePart.vue'
import DropSlot from './DropSlot.vue'

// Props
const props = defineProps({
  providedParts: {
    type: Array,
    default: () => []
  },
  targetSlots: {
    type: Array,
    default: () => []
  },
  constructedSentence: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['parts-arranged', 'slot-filled', 'construction-complete'])

// Reactive data
const draggedPart = ref(null)
const showConstructionSuccess = ref(false)
const localTargetSlots = ref([...props.targetSlots])

// Computed
const availableProvidedParts = computed(() => {
  return props.providedParts.filter(part => !isPartUsed(part))
})

const filledSlotsCount = computed(() => {
  return localTargetSlots.value.filter(slot => slot.filled).length
})

const allSlotsFilled = computed(() => {
  return filledSlotsCount.value === localTargetSlots.value.length && localTargetSlots.value.length > 0
})

const isConstructionValid = computed(() => {
  return localTargetSlots.value.every(slot => validateSlot(slot))
})

const constructedSentence = computed(() => {
  return localTargetSlots.value.map(slot => slot.part).filter(Boolean)
})

// Methods
const isPartUsed = (part) => {
  return localTargetSlots.value.some(slot => slot.part?.id === part.id)
}

const validateSlot = (slot) => {
  if (!slot.filled || !slot.part) return false
  
  // Basic validation: check if part type matches slot type
  return slot.part.type === slot.type
}

const onDragStart = (part) => {
  draggedPart.value = part
}

const onDragEnd = () => {
  draggedPart.value = null
}

const onDragOver = (event, slot) => {
  event.preventDefault()
  if (draggedPart.value && !slot.filled) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDragLeave = (event) => {
  event.preventDefault()
}

const onDrop = (event, slot, slotIndex) => {
  event.preventDefault()
  
  if (!draggedPart.value || slot.filled) return
  
  // Check if the part type matches the slot type
  if (draggedPart.value.type !== slot.type) {
    // Show error feedback
    console.warn('Part type mismatch:', draggedPart.value.type, 'vs', slot.type)
    return
  }
  
  // Fill the slot
  localTargetSlots.value[slotIndex] = {
    ...slot,
    filled: true,
    part: draggedPart.value
  }
  
  // Emit slot filled event
  emit('slot-filled', slot, draggedPart.value)
  
  // Check if construction is complete
  if (allSlotsFilled.value) {
    setTimeout(() => {
      checkConstructionCompletion()
    }, 500)
  }
  
  draggedPart.value = null
}

const onRemovePart = (slotIndex) => {
  const slot = localTargetSlots.value[slotIndex]
  if (slot.filled) {
    localTargetSlots.value[slotIndex] = {
      ...slot,
      filled: false,
      part: null
    }
  }
}

const clearConstruction = () => {
  localTargetSlots.value = localTargetSlots.value.map(slot => ({
    ...slot,
    filled: false,
    part: null
  }))
}

const validateAndSubmit = () => {
  if (!allSlotsFilled.value) return
  
  if (isConstructionValid.value) {
    showConstructionSuccess.value = true
    
    setTimeout(() => {
      showConstructionSuccess.value = false
      emit('construction-complete', constructedSentence.value)
    }, 2000)
  } else {
    // Show validation error
    console.warn('Construction validation failed')
  }
}

const checkConstructionCompletion = () => {
  if (allSlotsFilled.value && isConstructionValid.value) {
    emit('parts-arranged', constructedSentence.value)
  }
}

// Watchers
watch(() => props.targetSlots, (newSlots) => {
  localTargetSlots.value = [...newSlots]
}, { deep: true })

watch(constructedSentence, (newSentence) => {
  emit('parts-arranged', newSentence)
}, { deep: true })
</script>

<style scoped>
/* Drag and drop visual feedback */
.drag-over {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
  transform: scale(1.05);
}

.drag-valid {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.drag-invalid {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Shimmer animation for progress bar */
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

/* Connection animation between slots */
@keyframes connection-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.connection-active {
  background: linear-gradient(90deg, #a855f7, #ec4899, #a855f7);
  background-size: 200% 100%;
  animation: connection-flow 2s linear infinite;
}

/* Pulse effect for filled slots */
@keyframes slot-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
  }
}

.slot-filled {
  animation: slot-pulse 2s infinite;
}

/* Success animation imports */
@import '@/assets/css/sound-radar-animations.css';
</style>