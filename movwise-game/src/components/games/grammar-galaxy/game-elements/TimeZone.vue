<template>
  <div 
    class="time-zone"
    :class="zoneClasses"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="handleClick"
  >
    <!-- Zone Header -->
    <div class="zone-header">
      <div class="zone-icon">
        <Icon :name="zoneIcon" class="w-6 h-6" />
      </div>
      <h3 class="zone-title">{{ zoneConfig.title }}</h3>
      <div class="zone-indicator" :class="indicatorClass">
        <div class="indicator-dot"></div>
      </div>
    </div>

    <!-- Zone Content -->
    <div class="zone-content">
      <!-- Time Indicators -->
      <div class="time-indicators">
        <span 
          v-for="indicator in zoneConfig.indicators"
          :key="indicator"
          class="time-indicator"
        >
          {{ indicator }}
        </span>
      </div>

      <!-- Grammar Examples -->
      <div class="grammar-examples">
        <div 
          v-for="(example, index) in zoneConfig.examples"
          :key="index"
          class="grammar-example"
        >
          <span class="example-text">{{ example.text }}</span>
          <span 
            v-if="example.highlight"
            class="example-highlight"
          >
            {{ example.highlight }}
          </span>
        </div>
      </div>

      <!-- Zone Pattern -->
      <div class="zone-pattern">
        <div class="pattern-title">Pattern:</div>
        <div class="pattern-text">{{ zoneConfig.pattern }}</div>
      </div>
    </div>

    <!-- Drop Target Overlay -->
    <div 
      v-if="isDragOver"
      class="drop-overlay"
    >
      <Icon name="arrow-down" class="w-8 h-8" />
      <span>Drop here!</span>
    </div>

    <!-- Cosmic Background Elements -->
    <div class="cosmic-background">
      <div 
        v-for="i in particleCount"
        :key="i"
        class="cosmic-particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>

    <!-- Zone Border Animation -->
    <div class="zone-border-animation" :class="borderAnimationClass"></div>

    <!-- Success/Error Feedback -->
    <Transition name="feedback">
      <div 
        v-if="showFeedback"
        class="feedback-overlay"
        :class="feedbackType"
      >
        <Icon 
          :name="feedbackType === 'correct' ? 'check-circle' : 'x-circle'" 
          class="w-12 h-12"
        />
        <span class="feedback-text">
          {{ feedbackType === 'correct' ? 'Correct!' : 'Try Again!' }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Icon from '@/components/shared/Icon.vue'

// Props
const props = defineProps({
  zoneType: {
    type: String,
    required: true,
    validator: (value) => ['past', 'present', 'future', 'perfect'].includes(value)
  },
  isDragOver: {
    type: Boolean,
    default: false
  },
  isCorrect: {
    type: Boolean,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    default: 'beginner'
  },
  showAdvanced: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['drop', 'click', 'hover'])

// State
const showFeedback = ref(false)
const feedbackType = ref('')
const particleCount = ref(8)
const borderAnimationClass = ref('')

// Zone Configurations
const zoneConfigs = {
  past: {
    title: 'Past',
    icon: 'arrow-left',
    indicators: ['yesterday', 'last week', 'ago', 'before'],
    examples: [
      { text: 'I ', highlight: 'ate' },
      { text: 'She ', highlight: 'was' },
      { text: 'They ', highlight: 'played' }
    ],
    pattern: 'Subject + Past Verb',
    theme: 'red',
    gradient: 'from-red-900 to-red-700'
  },
  present: {
    title: 'Present',
    icon: 'play',
    indicators: ['now', 'today', 'usually', 'always'],
    examples: [
      { text: 'I ', highlight: 'eat' },
      { text: 'She ', highlight: 'is' },
      { text: 'They ', highlight: 'play' }
    ],
    pattern: 'Subject + Present Verb',
    theme: 'green',
    gradient: 'from-green-900 to-green-700'
  },
  future: {
    title: 'Future',
    icon: 'arrow-right',
    indicators: ['tomorrow', 'next week', 'will', 'going to'],
    examples: [
      { text: 'I ', highlight: 'will eat' },
      { text: 'She ', highlight: 'will be' },
      { text: 'They ', highlight: 'will play' }
    ],
    pattern: 'Subject + will + Verb',
    theme: 'blue',
    gradient: 'from-blue-900 to-blue-700'
  },
  perfect: {
    title: 'Perfect',
    icon: 'check-circle',
    indicators: ['have/has', 'already', 'just', 'ever'],
    examples: [
      { text: 'I ', highlight: 'have eaten' },
      { text: 'She ', highlight: 'has been' },
      { text: 'They ', highlight: 'have played' }
    ],
    pattern: 'Subject + have/has + Past Participle',
    theme: 'purple',
    gradient: 'from-purple-900 to-purple-700'
  }
}

// Computed Properties
const zoneConfig = computed(() => zoneConfigs[props.zoneType])

const zoneIcon = computed(() => zoneConfig.value.icon)

const zoneClasses = computed(() => [
  `zone-${props.zoneType}`,
  `zone-${zoneConfig.value.theme}`,
  {
    'drag-over': props.isDragOver,
    'zone-correct': props.isCorrect === true,
    'zone-incorrect': props.isCorrect === false,
    'zone-active': props.isActive,
    'zone-advanced': props.showAdvanced
  }
])

const indicatorClass = computed(() => [
  'indicator',
  `indicator-${zoneConfig.value.theme}`,
  {
    'indicator-active': props.isActive,
    'indicator-correct': props.isCorrect === true,
    'indicator-incorrect': props.isCorrect === false
  }
])

// Methods
const handleDragOver = (event) => {
  event.preventDefault()
  emit('hover', props.zoneType)
}

const handleDragLeave = () => {
  // Handled by parent component
}

const handleDrop = (event) => {
  event.preventDefault()
  const data = event.dataTransfer.getData('text/plain')
  emit('drop', {
    zone: props.zoneType,
    data: data
  })
}

const handleClick = () => {
  emit('click', props.zoneType)
}

const getParticleStyle = (index) => {
  const positions = [
    { top: '15%', left: '10%' },
    { top: '25%', right: '15%' },
    { top: '35%', left: '75%' },
    { top: '55%', left: '20%' },
    { top: '65%', right: '25%' },
    { top: '75%', left: '60%' },
    { top: '45%', left: '50%' },
    { top: '85%', right: '40%' }
  ]
  
  const position = positions[index - 1] || positions[0]
  const delay = (index - 1) * 0.3
  
  return {
    ...position,
    animationDelay: `${delay}s`
  }
}

const showFeedbackEffect = (type) => {
  feedbackType.value = type
  showFeedback.value = true
  
  // Add border animation
  borderAnimationClass.value = type === 'correct' ? 'border-success' : 'border-error'
  
  setTimeout(() => {
    showFeedback.value = false
    borderAnimationClass.value = ''
  }, 2000)
}

const triggerHoverEffect = () => {
  borderAnimationClass.value = 'border-hover'
  setTimeout(() => {
    borderAnimationClass.value = ''
  }, 300)
}

// Watch for feedback changes
watch(() => props.isCorrect, (newValue) => {
  if (newValue === true) {
    showFeedbackEffect('correct')
  } else if (newValue === false) {
    showFeedbackEffect('incorrect')
  }
})

// Expose methods for parent component
defineExpose({
  showFeedbackEffect,
  triggerHoverEffect
})
</script>

<style scoped>
.time-zone {
  @apply relative rounded-xl border-2 transition-all duration-300 cursor-pointer;
  @apply min-h-[200px] p-6 overflow-hidden;
  backdrop-filter: blur(10px);
}

/* Zone Theme Colors */
.zone-red {
  @apply border-red-400 bg-gradient-to-br from-red-900 to-red-800;
  background-opacity: 0.3;
}

.zone-green {
  @apply border-green-400 bg-gradient-to-br from-green-900 to-green-800;
  background-opacity: 0.3;
}

.zone-blue {
  @apply border-blue-400 bg-gradient-to-br from-blue-900 to-blue-800;
  background-opacity: 0.3;
}

.zone-purple {
  @apply border-purple-400 bg-gradient-to-br from-purple-900 to-purple-800;
  background-opacity: 0.3;
}

/* Zone States */
.time-zone:hover {
  @apply scale-105 shadow-lg;
}

.time-zone.drag-over {
  @apply scale-105 border-opacity-100 shadow-xl;
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2);
}

.time-zone.zone-correct {
  @apply border-green-300;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
  animation: pulse-correct 1s ease-in-out;
}

.time-zone.zone-incorrect {
  @apply border-red-300;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
  animation: shake 0.5s ease-in-out;
}

.time-zone.zone-active {
  @apply border-opacity-100 shadow-lg;
  animation: gentle-glow 2s ease-in-out infinite;
}

/* Zone Header */
.zone-header {
  @apply flex items-center justify-between mb-4;
}

.zone-icon {
  @apply flex items-center justify-center w-8 h-8 rounded-full;
  @apply bg-white bg-opacity-20;
}

.zone-title {
  @apply text-xl font-bold flex-1 text-center;
}

.zone-indicator {
  @apply flex items-center justify-center w-6 h-6;
}

.indicator-dot {
  @apply w-3 h-3 rounded-full transition-all duration-300;
  @apply bg-white bg-opacity-40;
}

.indicator-active .indicator-dot {
  @apply bg-yellow-400 shadow-lg;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.indicator-correct .indicator-dot {
  @apply bg-green-400;
}

.indicator-incorrect .indicator-dot {
  @apply bg-red-400;
}

/* Zone Content */
.zone-content {
  @apply space-y-4;
}

.time-indicators {
  @apply flex flex-wrap gap-2;
}

.time-indicator {
  @apply px-2 py-1 text-xs rounded;
  @apply bg-white bg-opacity-20 text-white;
  transition: all 0.2s ease;
}

.time-indicator:hover {
  @apply bg-opacity-30 scale-105;
}

.grammar-examples {
  @apply space-y-2 text-sm;
}

.grammar-example {
  @apply flex items-center gap-1 opacity-80;
}

.example-text {
  @apply text-gray-200;
}

.example-highlight {
  @apply font-bold text-yellow-300 px-1 rounded;
  @apply bg-yellow-300 bg-opacity-20;
}

.zone-pattern {
  @apply text-xs opacity-70 pt-2 border-t border-white border-opacity-20;
}

.pattern-title {
  @apply font-semibold text-gray-300;
}

.pattern-text {
  @apply text-gray-400 mt-1;
}

/* Drop Overlay */
.drop-overlay {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  @apply bg-white bg-opacity-10 backdrop-blur-sm;
  @apply text-white font-bold text-lg;
  animation: pulse-overlay 1s ease-in-out infinite;
}

/* Cosmic Background */
.cosmic-background {
  @apply absolute inset-0 pointer-events-none;
}

.cosmic-particle {
  @apply absolute w-1 h-1 bg-white rounded-full opacity-60;
  animation: float-particle 3s ease-in-out infinite;
}

.cosmic-particle:nth-child(odd) {
  animation-delay: -1s;
}

.cosmic-particle:nth-child(even) {
  animation-delay: -2s;
}

/* Zone Border Animation */
.zone-border-animation {
  @apply absolute inset-0 rounded-xl pointer-events-none;
  transition: all 0.3s ease;
}

.zone-border-animation.border-success {
  @apply border-4 border-green-400;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
  animation: success-border 1s ease-out;
}

.zone-border-animation.border-error {
  @apply border-4 border-red-400;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
  animation: error-border 0.5s ease-out;
}

.zone-border-animation.border-hover {
  @apply border-2 border-white border-opacity-50;
  animation: hover-border 0.3s ease-out;
}

/* Feedback Overlay */
.feedback-overlay {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  @apply text-white font-bold text-xl;
  @apply backdrop-blur-sm rounded-xl;
}

.feedback-overlay.correct {
  @apply bg-green-500 bg-opacity-80;
}

.feedback-overlay.incorrect {
  @apply bg-red-500 bg-opacity-80;
}

.feedback-text {
  @apply mt-2;
}

/* Animations */
@keyframes pulse-correct {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes gentle-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.5); }
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.8; }
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-overlay {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes success-border {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.8; transform: scale(1); }
}

@keyframes error-border {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes hover-border {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Feedback Transition */
.feedback-enter-active,
.feedback-leave-active {
  transition: all 0.3s ease;
}

.feedback-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.feedback-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

/* Advanced Mode */
.time-zone.zone-advanced {
  @apply min-h-[250px];
}

.time-zone.zone-advanced .zone-content {
  @apply space-y-6;
}

.time-zone.zone-advanced .time-indicators {
  @apply grid grid-cols-2 gap-2;
}

.time-zone.zone-advanced .grammar-examples {
  @apply space-y-3;
}

/* Perfect Tense Special Layout */
.zone-purple.zone-advanced {
  @apply col-span-full;
}

/* Responsive Design */
@media (max-width: 768px) {
  .time-zone {
    @apply min-h-[180px] p-4;
  }
  
  .zone-title {
    @apply text-lg;
  }
  
  .time-indicators {
    @apply grid grid-cols-2 gap-1;
  }
  
  .time-indicator {
    @apply text-xs px-1 py-0.5;
  }
  
  .grammar-examples {
    @apply text-xs space-y-1;
  }
}

@media (max-width: 480px) {
  .time-zone {
    @apply min-h-[150px] p-3;
  }
  
  .zone-header {
    @apply flex-col gap-2 mb-3;
  }
  
  .zone-title {
    @apply text-base;
  }
  
  .time-indicators {
    @apply flex flex-wrap gap-1;
  }
}</style>