<template>
  <div 
    class="grammar-element"
    :class="[
      getElementClass(),
      {
        'draggable': isDraggable && !element.isUsed,
        'used': element.isUsed,
        'dropped': isDropped,
        'animate-correct': showCorrectAnimation,
        'animate-incorrect': showIncorrectAnimation
      }
    ]"
    :draggable="isDraggable && !element.isUsed"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
  >
    <!-- Element Content -->
    <div class="element-content">
      <!-- Color Indicator -->
      <div v-if="showColorIndicator" class="color-indicator">
        {{ getColorEmoji(element.color || element.colorFamily) }}
      </div>
      
      <!-- Word/Text -->
      <div class="element-word" :class="getWordClass()">
        {{ element.word }}
      </div>
      
      <!-- Japanese Hint (for kids mode) -->
      <div v-if="showJapaneseHint && element.japanese" class="japanese-hint">
        {{ element.japanese }}
      </div>
      
      <!-- Type Badge (only for dropped elements) -->
      <div v-if="isDropped" class="element-type" :class="getBadgeClass()">
        {{ getTypeLabel(element.type) }}
      </div>
    </div>
    
    <!-- Remove Button (for dropped elements) -->
    <button 
      v-if="isDropped && showRemoveButton"
      @click.stop="handleRemove"
      class="remove-button"
      title="取り除く"
      :aria-label="`${element.word}を取り除く`"
    >
      ×
    </button>
    
    <!-- Visual Feedback Effects -->
    <div v-if="showVisualFeedback" class="visual-feedback" :class="feedbackType">
      <div class="feedback-icon">
        <span v-if="feedbackType === 'success'">✓</span>
        <span v-if="feedbackType === 'error'">×</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  isDraggable: {
    type: Boolean,
    default: false
  },
  isDropped: {
    type: Boolean,
    default: false
  },
  showRemoveButton: {
    type: Boolean,
    default: true
  },
  showJapaneseHint: {
    type: Boolean,
    default: false
  },
  validationState: {
    type: String,
    default: null,
    validator: value => [null, 'correct', 'incorrect'].includes(value)
  },
  kidsMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['drag-start', 'drag-end', 'remove', 'click'])

// Animation states
const showCorrectAnimation = ref(false)
const showIncorrectAnimation = ref(false)
const showVisualFeedback = ref(false)
const feedbackType = ref('success')

// Color indicator visibility
const showColorIndicator = computed(() => {
  const type = props.element.type
  return ['be-verb', 'general', 'general-verb', 'question', 'auxiliary'].includes(type)
})

// Element styling classes
const getElementClass = () => {
  const baseClasses = []
  
  // Card vs label styling
  if (props.isDropped) {
    baseClasses.push('element-label')
  } else {
    baseClasses.push('element-card')
  }
  
  // Color family
  const colorFamily = props.element.color || props.element.colorFamily || getColorFromType(props.element.type)
  baseClasses.push(`element-${colorFamily}`)
  
  // Kids mode
  if (props.kidsMode) {
    baseClasses.push('kids-mode')
  }
  
  return baseClasses
}

const getWordClass = () => {
  const colorFamily = props.element.color || props.element.colorFamily || getColorFromType(props.element.type)
  const classes = [`word-${colorFamily}`]
  
  if (props.kidsMode) {
    classes.push('word-kids')
  }
  
  return classes
}

const getBadgeClass = () => {
  const colorFamily = props.element.color || props.element.colorFamily || getColorFromType(props.element.type)
  return `badge-${colorFamily}`
}

// Helper functions
const getColorFromType = (type) => {
  const typeColorMap = {
    'be-verb': 'blue',
    'general': 'red',
    'general-verb': 'red',
    'question': 'yellow',
    'auxiliary': 'green',
    'pronoun': 'blue',
    'adjective': 'purple',
    'noun': 'orange',
    'adverb': 'green'
  }
  return typeColorMap[type] || 'gray'
}

const getColorEmoji = (color) => {
  const colorEmojis = {
    blue: '🔵',
    red: '🔴',
    green: '🟢',
    yellow: '🟡',
    purple: '🟣',
    orange: '🟠',
    gray: '⚪'
  }
  return colorEmojis[color] || '⚪'
}

const getTypeLabel = (type) => {
  const typeLabels = {
    pronoun: '代名',
    'be-verb': 'Be動',
    'general-verb': '動詞',
    general: '動詞',
    adjective: '形容',
    noun: '名詞',
    adverb: '副詞',
    auxiliary: '助動',
    negation: '否定',
    preposition: '前置',
    article: '冠詞',
    conjunction: '接続',
    countable: '名詞',
    uncountable: '名詞',
    question: '疑問'
  }
  return typeLabels[type] || type
}

// Event handlers
const handleDragStart = (event) => {
  if (!props.isDraggable || props.element.isUsed) {
    event.preventDefault()
    return
  }
  
  if (!event.dataTransfer) return
  
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(props.element))
  
  emit('drag-start', props.element)
}

const handleDragEnd = () => {
  emit('drag-end')
}

const handleRemove = () => {
  emit('remove')
}

const handleClick = () => {
  // For kids mode or touch devices
  if (props.kidsMode || !props.isDraggable) {
    emit('click', props.element)
  }
}

// Animation methods
const triggerCorrectAnimation = () => {
  showCorrectAnimation.value = true
  showVisualFeedback.value = true
  feedbackType.value = 'success'
  
  setTimeout(() => {
    showCorrectAnimation.value = false
    showVisualFeedback.value = false
  }, 1200)
}

const triggerIncorrectAnimation = () => {
  showIncorrectAnimation.value = true
  showVisualFeedback.value = true
  feedbackType.value = 'error'
  
  setTimeout(() => {
    showIncorrectAnimation.value = false
    showVisualFeedback.value = false
  }, 800)
}

// Watch for validation state changes
watch(() => props.validationState, (newState) => {
  if (newState === 'correct') {
    triggerCorrectAnimation()
  } else if (newState === 'incorrect') {
    triggerIncorrectAnimation()
  }
})

// Expose methods for parent components
defineExpose({
  triggerCorrectAnimation,
  triggerIncorrectAnimation
})
</script>

<style scoped>
.grammar-element {
  @apply relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center;
  touch-action: manipulation;
}

/* Card Style (draggable elements) */
.element-card {
  @apply border-2 rounded-xl p-3 shadow-lg;
  min-height: 80px;
  min-width: 90px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.element-card.draggable:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Label Style (dropped elements) */
.element-label {
  @apply border rounded-lg px-3 py-2 shadow-sm;
  min-height: 60px;
  min-width: 80px;
  background: linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* Kids Mode Styling */
.kids-mode {
  min-height: 100px;
  min-width: 120px;
  @apply rounded-2xl p-4;
}

.kids-mode .element-word {
  @apply text-3xl font-black;
}

.kids-mode .color-indicator {
  @apply text-4xl mb-3;
}

/* Color Variants */
.element-blue { 
  border-color: #2563eb;
  --shadow-color: rgba(37, 99, 235, 0.2);
}
.element-red { 
  border-color: #dc2626;
  --shadow-color: rgba(220, 38, 38, 0.2);
}
.element-yellow { 
  border-color: #eab308;
  --shadow-color: rgba(234, 179, 8, 0.2);
}
.element-green { 
  border-color: #059669;
  --shadow-color: rgba(5, 150, 105, 0.2);
}
.element-purple { 
  border-color: #a21caf;
  --shadow-color: rgba(162, 28, 175, 0.2);
}
.element-orange { 
  border-color: #ea580c;
  --shadow-color: rgba(234, 88, 12, 0.2);
}
.element-gray { 
  border-color: #6b7280;
  --shadow-color: rgba(107, 114, 128, 0.2);
}

/* Color text */
.word-blue { color: #1d4ed8; }
.word-red { color: #b91c1c; }
.word-yellow { color: #a16207; }
.word-green { color: #047857; }
.word-purple { color: #86198f; }
.word-orange { color: #c2410c; }
.word-gray { color: #374151; }

/* Color badges */
.badge-blue { @apply bg-blue-600 text-white; }
.badge-red { @apply bg-red-600 text-white; }
.badge-yellow { @apply bg-yellow-600 text-white; }
.badge-green { @apply bg-green-600 text-white; }
.badge-purple { @apply bg-purple-600 text-white; }
.badge-orange { @apply bg-orange-600 text-white; }
.badge-gray { @apply bg-gray-600 text-white; }

/* Content styling */
.element-content {
  @apply flex flex-col items-center justify-center h-full text-center w-full;
}

.color-indicator {
  @apply text-2xl mb-2 drop-shadow-sm;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.element-word {
  @apply font-bold text-lg mb-1 tracking-wide leading-tight;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.word-kids {
  @apply text-2xl font-black;
}

.japanese-hint {
  @apply text-xs text-gray-500 mt-1;
}

.element-type {
  @apply font-medium text-xs px-2 py-1 rounded-full shadow-sm mt-1;
  letter-spacing: 0.025em;
}

/* Remove button */
.remove-button {
  @apply absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg z-20;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  transform: scale(1);
}

.remove-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.remove-button:active {
  transform: scale(0.95);
}

/* Used state */
.used {
  @apply relative;
  opacity: 0.6;
  filter: grayscale(0.8) brightness(0.7);
  cursor: not-allowed;
  pointer-events: none;
  transition: all 0.3s ease-out;
}

.used::before {
  content: '';
  @apply absolute inset-0 bg-gray-900 opacity-20 rounded-lg;
  z-index: 5;
}

.used::after {
  content: '✕';
  @apply absolute inset-0 flex items-center justify-center text-6xl font-bold;
  color: #dc2626;
  z-index: 10;
  text-shadow: 
    0 0 8px rgba(255, 255, 255, 0.9),
    0 0 16px rgba(255, 255, 255, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.5);
  transform: scale(1.2);
  animation: crossFadeIn 0.3s ease-out;
}

@keyframes crossFadeIn {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: scale(1.2) rotate(0deg);
  }
}

/* Visual Feedback */
.visual-feedback {
  @apply absolute inset-0 flex items-center justify-center pointer-events-none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: inherit;
}

.visual-feedback.success {
  @apply bg-green-100;
  color: #059669;
}

.visual-feedback.error {
  @apply bg-red-100;
  color: #dc2626;
}

.feedback-icon {
  @apply p-2 rounded-full flex items-center justify-center;
  background: currentColor;
  width: 3rem;
  height: 3rem;
}

.feedback-icon span {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

/* Animations */
.animate-correct {
  animation: correctPulse 1.2s ease-in-out;
}

.animate-incorrect {
  animation: incorrectShake 0.8s ease-in-out;
}

@keyframes correctPulse {
  0%, 100% { 
    transform: scale(1);
  }
  25% { 
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.3);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 16px rgba(16, 185, 129, 0.1);
  }
  75% { 
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.2);
  }
}

@keyframes incorrectShake {
  0%, 100% { 
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% { 
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% { 
    transform: translateX(4px);
  }
}

/* Focus styles for accessibility */
.grammar-element:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive Design */
@media (max-width: 640px) {
  .element-card {
    min-width: 70px;
    min-height: 70px;
    @apply p-2;
  }
  
  .element-label {
    min-width: 60px;
    min-height: 50px;
    @apply px-2 py-1;
  }
  
  .element-word {
    @apply text-base;
  }
  
  .color-indicator {
    @apply text-xl mb-1;
  }
  
  .element-type {
    @apply text-xs px-1 py-0.5;
  }
  
  .kids-mode {
    min-height: 90px;
    min-width: 100px;
    @apply p-3;
  }
  
  .kids-mode .element-word {
    @apply text-2xl;
  }
  
  .kids-mode .color-indicator {
    @apply text-3xl mb-2;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .element-card {
    border-width: 3px;
  }
  
  .element-label {
    border-width: 2px;
  }
  
  .element-word {
    font-weight: 900;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .grammar-element {
    transition: none;
  }
  
  .element-card.draggable:hover {
    transform: none;
  }
  
  .animate-correct,
  .animate-incorrect {
    animation: none;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .element-card {
    background: linear-gradient(145deg, #374151 0%, #1f2937 100%);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .element-label {
    background: linear-gradient(145deg, #374151 0%, #4b5563 100%);
  }
  
  .element-word {
    color: #f9fafb;
  }
  
  .japanese-hint {
    color: #9ca3af;
  }
}

/* Print styles */
@media print {
  .remove-button,
  .visual-feedback {
    display: none !important;
  }
  
  .grammar-element {
    @apply border-black bg-white;
    box-shadow: none !important;
  }
}</style>