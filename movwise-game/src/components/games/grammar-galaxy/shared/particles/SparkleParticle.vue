<template>
  <div 
    class="sparkle-particle"
    :style="sparkleStyle"
  >
    <svg 
      :width="size" 
      :height="size" 
      viewBox="0 0 32 32" 
      fill="none"
      class="sparkle-svg"
    >
      <!-- Main sparkle lines -->
      <g class="sparkle-lines">
        <!-- Vertical line -->
        <line
          x1="16" y1="4"
          x2="16" y2="28"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          class="sparkle-line vertical"
        />
        <!-- Horizontal line -->
        <line
          x1="4" y1="16"
          x2="28" y2="16"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          class="sparkle-line horizontal"
        />
        <!-- Diagonal lines -->
        <line
          v-if="showDiagonals"
          x1="9" y1="9"
          x2="23" y2="23"
          :stroke="computedColor"
          :stroke-width="strokeWidth * 0.7"
          stroke-linecap="round"
          class="sparkle-line diagonal-1"
        />
        <line
          v-if="showDiagonals"
          x1="23" y1="9"
          x2="9" y2="23"
          :stroke="computedColor"
          :stroke-width="strokeWidth * 0.7"
          stroke-linecap="round"
          class="sparkle-line diagonal-2"
        />
      </g>
      
      <!-- Center dot -->
      <circle
        cx="16" cy="16" 
        :r="centerRadius"
        :fill="computedColor"
        class="sparkle-center"
      />
      
      <!-- Outer glow effect -->
      <circle
        v-if="showGlow"
        cx="16" cy="16"
        :r="glowRadius"
        :fill="glowGradientUrl"
        opacity="0.4"
        class="sparkle-glow"
      />
    </svg>
    
    <!-- SVG Gradients -->
    <svg width="0" height="0" class="hidden">
      <defs>
        <radialGradient 
          :id="`sparkle-glow-${particleId}`"
          cx="50%" cy="50%" r="50%"
        >
          <stop offset="0%" :stop-color="computedColor" stop-opacity="0.8"/>
          <stop offset="100%" :stop-color="computedColor" stop-opacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  particle: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: 'white'
  },
  variant: {
    type: String,
    default: 'classic', // 'classic', 'simple', 'complex', 'magic'
  }
})

// Generate unique ID for gradients
const particleId = ref(`sparkle-${Date.now()}-${Math.random()}`)

const size = computed(() => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  }
  return sizeMap[props.particle.size] || 24
})

const computedColor = computed(() => {
  const colorMap = {
    white: '#FFFFFF',
    gold: '#FFD700',
    silver: '#C0C0C0',
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
    cyan: '#06B6D4',
    lime: '#84CC16',
    indigo: '#6366F1',
    rainbow: '#FF6B6B' // Will be animated
  }
  return colorMap[props.color] || props.color
})

const strokeWidth = computed(() => {
  const sizeMultiplier = {
    small: 1,
    medium: 1.5,
    large: 2
  }
  return sizeMultiplier[props.particle.size] || 1.5
})

const centerRadius = computed(() => {
  const radiusMap = {
    small: 1.5,
    medium: 2,
    large: 2.5
  }
  return radiusMap[props.particle.size] || 2
})

const glowRadius = computed(() => {
  return size.value / 3
})

const showDiagonals = computed(() => {
  return ['complex', 'magic'].includes(props.variant)
})

const showGlow = computed(() => {
  return ['magic', 'complex'].includes(props.variant)
})

const glowGradientUrl = computed(() => {
  return `url(#sparkle-glow-${particleId.value})`
})

const sparkleStyle = computed(() => {
  const baseStyle = {
    filter: `drop-shadow(0 0 ${size.value / 6}px ${computedColor.value})`
  }

  // Add special effects based on variant
  if (props.variant === 'magic') {
    baseStyle.filter += ` hue-rotate(${props.particle.rotation || 0}deg)`
  }

  if (props.variant === 'rainbow') {
    baseStyle.filter += ` saturate(1.5) brightness(1.2)`
  }

  return baseStyle
})
</script>

<style scoped>
.sparkle-particle {
  @apply flex items-center justify-center;
  transition: all 0.1s ease-out;
}

.sparkle-svg {
  @apply drop-shadow-sm;
}

.sparkle-lines {
  transform-origin: center center;
}

.sparkle-line {
  transition: all 0.2s ease;
}

.sparkle-center {
  transition: all 0.2s ease;
}

.sparkle-glow {
  transform-origin: center center;
}

/* Animation variants */
.sparkle-particle.twinkling .sparkle-lines {
  animation: sparkle-twinkle 1.5s ease-in-out infinite;
}

.sparkle-particle.spinning .sparkle-lines {
  animation: sparkle-spin 2s linear infinite;
}

.sparkle-particle.pulsing .sparkle-center {
  animation: sparkle-pulse 1s ease-in-out infinite;
}

.sparkle-particle.magic .sparkle-lines {
  animation: magic-sparkle 2s ease-in-out infinite;
}

.sparkle-particle.rainbow .sparkle-lines {
  animation: rainbow-sparkle 3s linear infinite;
}

.sparkle-particle.floating {
  animation: sparkle-float 2.5s ease-in-out infinite;
}

/* Core Animations */
@keyframes sparkle-twinkle {
  0%, 100% {
    opacity: 0.6;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes sparkle-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sparkle-pulse {
  0%, 100% {
    r: 1.5;
    opacity: 1;
  }
  50% {
    r: 3;
    opacity: 0.7;
  }
}

@keyframes sparkle-float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(90deg);
  }
  50% {
    transform: translateY(-12px) rotate(180deg);
  }
  75% {
    transform: translateY(-8px) rotate(270deg);
  }
}

@keyframes magic-sparkle {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1) rotate(0deg);
    filter: hue-rotate(0deg);
  }
  25% {
    opacity: 1;
    transform: scale(1.1) rotate(90deg);
    filter: hue-rotate(90deg);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.2) rotate(180deg);
    filter: hue-rotate(180deg);
  }
  75% {
    opacity: 1;
    transform: scale(1.1) rotate(270deg);
    filter: hue-rotate(270deg);
  }
}

@keyframes rainbow-sparkle {
  0% {
    filter: hue-rotate(0deg) saturate(1.5) brightness(1.2);
  }
  100% {
    filter: hue-rotate(360deg) saturate(1.5) brightness(1.2);
  }
}

/* Size-specific adjustments */
.sparkle-particle.small .sparkle-line {
  stroke-width: 1;
}

.sparkle-particle.large .sparkle-line {
  stroke-width: 2.5;
}

/* Interactive effects */
.sparkle-particle:hover .sparkle-lines {
  animation: sparkle-hover 0.3s ease-out;
}

@keyframes sparkle-hover {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1.1);
  }
}

/* Burst effect */
.sparkle-particle.bursting {
  animation: sparkle-burst 0.8s ease-out forwards;
}

@keyframes sparkle-burst {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.5) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.5) rotate(360deg);
    opacity: 0;
  }
}

/* Trail effect */
.sparkle-particle.trailing::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  transform: translate(-50%, -50%);
  opacity: 0.3;
  animation: trail-fade 1s ease-out infinite;
}

@keyframes trail-fade {
  0% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .sparkle-particle *,
  .sparkle-particle::after {
    animation: none !important;
  }
  
  .sparkle-particle {
    opacity: 0.8;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .sparkle-line {
    stroke-width: 2;
  }
  
  .sparkle-center {
    r: 3;
  }
}
</style>