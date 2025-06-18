<template>
  <div class="grammar-parts bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
    <h3 class="text-lg font-semibold text-purple-300 mb-6 flex items-center">
      <i class="fas fa-toolbox mr-2"></i>
      Grammar Parts Inventory
      <span class="ml-2 text-sm text-pink-300">(Captain Controls)</span>
    </h3>

    <!-- Current Problem Overview -->
    <div class="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
      <div class="text-sm text-purple-200 mb-2">Target Sentence</div>
      <div class="text-white font-medium">{{ currentProblem?.target?.english }}</div>
      <div class="text-purple-200 text-sm">{{ currentProblem?.target?.japanese }}</div>
      <div class="mt-2 flex flex-wrap gap-2">
        <div 
          v-for="structureType in currentProblem?.target?.structure || []"
          :key="structureType"
          class="px-2 py-1 bg-purple-600/30 text-purple-200 text-xs rounded border border-purple-400/50"
        >
          {{ getStructureLabel(structureType) }}
        </div>
      </div>
    </div>

    <!-- Parts Categories -->
    <div class="space-y-6">
      <!-- Subjects -->
      <div v-if="partCategories.subjects.length > 0" class="parts-category">
        <div class="flex items-center mb-3">
          <div class="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded mr-2"></div>
          <h4 class="text-blue-300 font-medium">Subjects (主語)</h4>
          <div class="ml-2 text-xs text-gray-400">{{ selectedCounts.subjects }}/{{ partCategories.subjects.length }}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <PartCard
            v-for="part in partCategories.subjects"
            :key="part.id"
            :part="part"
            :is-selected="isPartSelected(part)"
            :is-correct="part.correct"
            :selection-limit="1"
            @select="onPartSelect"
            @highlight="onPartHighlight"
          />
        </div>
      </div>

      <!-- Verbs -->
      <div v-if="partCategories.verbs.length > 0" class="parts-category">
        <div class="flex items-center mb-3">
          <div class="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded mr-2"></div>
          <h4 class="text-green-300 font-medium">Verbs (動詞)</h4>
          <div class="ml-2 text-xs text-gray-400">{{ selectedCounts.verbs }}/{{ partCategories.verbs.length }}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <PartCard
            v-for="part in partCategories.verbs"
            :key="part.id"
            :part="part"
            :is-selected="isPartSelected(part)"
            :is-correct="part.correct"
            :selection-limit="1"
            @select="onPartSelect"
            @highlight="onPartHighlight"
          />
        </div>
      </div>

      <!-- Auxiliaries -->
      <div v-if="partCategories.auxiliaries.length > 0" class="parts-category">
        <div class="flex items-center mb-3">
          <div class="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded mr-2"></div>
          <h4 class="text-yellow-300 font-medium">Auxiliaries (助動詞)</h4>
          <div class="ml-2 text-xs text-gray-400">{{ selectedCounts.auxiliaries }}/{{ partCategories.auxiliaries.length }}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <PartCard
            v-for="part in partCategories.auxiliaries"
            :key="part.id"
            :part="part"
            :is-selected="isPartSelected(part)"
            :is-correct="part.correct"
            :selection-limit="1"
            @select="onPartSelect"
            @highlight="onPartHighlight"
          />
        </div>
      </div>

      <!-- Articles -->
      <div v-if="partCategories.articles.length > 0" class="parts-category">
        <div class="flex items-center mb-3">
          <div class="w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-500 rounded mr-2"></div>
          <h4 class="text-pink-300 font-medium">Articles (冠詞)</h4>
          <div class="ml-2 text-xs text-gray-400">{{ selectedCounts.articles }}/{{ partCategories.articles.length }}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <PartCard
            v-for="part in partCategories.articles"
            :key="part.id"
            :part="part"
            :is-selected="isPartSelected(part)"
            :is-correct="part.correct"
            :selection-limit="1"
            @select="onPartSelect"
            @highlight="onPartHighlight"
          />
        </div>
      </div>

      <!-- Objects -->
      <div v-if="partCategories.objects.length > 0" class="parts-category">
        <div class="flex items-center mb-3">
          <div class="w-4 h-4 bg-gradient-to-r from-purple-400 to-indigo-500 rounded mr-2"></div>
          <h4 class="text-purple-300 font-medium">Objects (目的語)</h4>
          <div class="ml-2 text-xs text-gray-400">{{ selectedCounts.objects }}/{{ partCategories.objects.length }}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <PartCard
            v-for="part in partCategories.objects"
            :key="part.id"
            :part="part"
            :is-selected="isPartSelected(part)"
            :is-correct="part.correct"
            :selection-limit="1"
            @select="onPartSelect"
            @highlight="onPartHighlight"
          />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-6 pt-6 border-t border-purple-500/30">
      <div class="flex justify-between items-center">
        <div class="text-sm text-purple-300">
          Selected: {{ totalSelectedParts }}/{{ requiredParts }}
        </div>
        
        <div class="space-x-3">
          <button
            @click="clearAllSelections"
            :disabled="totalSelectedParts === 0"
            class="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
                   disabled:from-gray-700 disabled:to-gray-800 text-white text-sm rounded-lg 
                   transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
          >
            <i class="fas fa-times mr-2"></i>
            Clear All
          </button>
          
          <button
            @click="provideParts"
            :disabled="!canProvideParts"
            class="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 
                   disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg 
                   transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
          >
            <i class="fas fa-paper-plane mr-2"></i>
            Provide Parts
          </button>
        </div>
      </div>
      
      <!-- Help text -->
      <div class="mt-3 text-xs text-purple-200">
        <i class="fas fa-info-circle mr-1"></i>
        Select the correct grammar parts for the Co-Pilot to arrange. Green indicators show correct parts.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PartCard from './PartCard.vue'

// Props
const props = defineProps({
  availableParts: {
    type: Array,
    default: () => []
  },
  currentProblem: {
    type: Object,
    default: () => ({})
  },
  selectedParts: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['part-selected', 'part-highlighted'])

// Reactive data
const localSelectedParts = ref([...props.selectedParts])

// Computed
const partCategories = computed(() => {
  if (!props.currentProblem?.parts) {
    return {
      subjects: [],
      verbs: [],
      auxiliaries: [],
      articles: [],
      objects: []
    }
  }

  return {
    subjects: props.currentProblem.parts.subjects || [],
    verbs: props.currentProblem.parts.verbs || [],
    auxiliaries: props.currentProblem.parts.auxiliaries || [],
    articles: props.currentProblem.parts.articles || [],
    objects: props.currentProblem.parts.objects || []
  }
})

const selectedCounts = computed(() => {
  return {
    subjects: localSelectedParts.value.filter(p => p.type === 'subject').length,
    verbs: localSelectedParts.value.filter(p => p.type === 'verb').length,
    auxiliaries: localSelectedParts.value.filter(p => p.type === 'auxiliary').length,
    articles: localSelectedParts.value.filter(p => p.type === 'article').length,
    objects: localSelectedParts.value.filter(p => p.type === 'object').length
  }
})

const totalSelectedParts = computed(() => {
  return localSelectedParts.value.length
})

const requiredParts = computed(() => {
  return props.currentProblem?.target?.structure?.length || 0
})

const canProvideParts = computed(() => {
  if (!props.currentProblem?.target?.structure) return false
  
  // Check if we have selected at least one part for each required structure type
  const requiredTypes = props.currentProblem.target.structure
  return requiredTypes.every(type => {
    return localSelectedParts.value.some(part => part.type === type)
  })
})

// Methods
const isPartSelected = (part) => {
  return localSelectedParts.value.some(selected => selected.id === part.id)
}

const onPartSelect = (part) => {
  const isCurrentlySelected = isPartSelected(part)
  
  if (isCurrentlySelected) {
    // Deselect part
    localSelectedParts.value = localSelectedParts.value.filter(p => p.id !== part.id)
  } else {
    // Select part - but only allow one of each type as per the structure
    const existingOfSameType = localSelectedParts.value.filter(p => p.type === part.type)
    
    // Remove existing parts of the same type (only allow one selection per type)
    localSelectedParts.value = localSelectedParts.value.filter(p => p.type !== part.type)
    
    // Add the new selection
    localSelectedParts.value.push(part)
  }
  
  emit('part-selected', part)
}

const onPartHighlight = (part) => {
  emit('part-highlighted', part)
}

const clearAllSelections = () => {
  localSelectedParts.value = []
  emit('part-selected', null) // Signal that selections were cleared
}

const provideParts = () => {
  if (!canProvideParts.value) return
  
  // Emit all selected parts to parent
  localSelectedParts.value.forEach(part => {
    emit('part-selected', part)
  })
}

const getStructureLabel = (type) => {
  const labels = {
    subject: '主語',
    verb: '動詞',
    auxiliary: '助動詞',
    article: '冠詞',
    object: '目的語'
  }
  return labels[type] || type
}

// Watchers
watch(() => props.selectedParts, (newSelectedParts) => {
  localSelectedParts.value = [...newSelectedParts]
}, { deep: true })
</script>

<style scoped>
.parts-category {
  transition: all 0.3s ease;
}

.parts-category:hover {
  transform: translateY(-2px);
}

/* Custom scrollbar for overflow areas */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(100, 116, 139, 0.1);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}
</style>