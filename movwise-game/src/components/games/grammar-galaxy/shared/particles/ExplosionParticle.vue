<template>
  <div 
    class="explosion-particle"
    :style="explosionStyle"
  >
    <div 
      class="explosion-core"
      :style="coreStyle"
    >
      <div 
        v-for="fragment in fragments"
        :key="fragment.id"
        class="explosion-fragment"
        :style="fragment.style"
      ></div>
    </div>
    
    <!-- Shockwave effect -->
    <div 
      v-if="showShockwave"
      class="explosion-shockwave"
      :style="shockwaveStyle"
    ></div>
    
    <!-- Lightning bolts for special effects -->
    <div 
      v-if="variant === 'lightning'"
      class="lightning-container"
    >
      <svg 
        :width="size * 2" 
        :height="size * 2" 
        class="lightning-svg"
        viewBox="0 0 100 100"
      >
        <path
          v-for="bolt in lightningBolts"
          :key="bolt.id"
          :d="bolt.path"
          :stroke="lightningColor"
          :stroke-width="bolt.width"
          fill="none"
          class="lightning-bolt"
          :style="{ animationDelay: bolt.delay }"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  particle: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: 'orange'
  },
  variant: {
    type: String,
    default: 'fire', // 'fire', 'lightning', 'smoke', 'energy'
  },
  intensity: {
    type: String,
    default: 'medium' // 'low', 'medium', 'high'
  }
})

const fragments = ref([])
const lightningBolts = ref([])

const size = computed(() => {
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48
  }
  return sizeMap[props.particle.size] || 32
})

const intensityMultiplier = computed(() => {
  const intensityMap = {
    low: 0.6,
    medium: 1,
    high: 1.4
  }
  return intensityMap[props.intensity] || 1
})

const computedColor = computed(() => {
  const colorMap = {
    orange: '#F97316',
    red: '#EF4444',
    yellow: '#EAB308',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    green: '#10B981',
    white: '#FFFFFF',
    gold: '#FFD700'
  }
  return colorMap[props.color] || props.color
})

const secondaryColor = computed(() => {
  const colorMap = {
    orange: '#EA580C',
    red: '#DC2626',
    yellow: '#CA8A04',
    blue: '#2563EB',
    purple: '#7C3AED',
    green: '#059669',
    white: '#E5E7EB',
    gold: '#DAA520'
  }
  return colorMap[props.color] || props.color
})

const lightningColor = computed(() => {
  return props.variant === 'lightning' ? '#FFFFFF' : computedColor.value
})

const showShockwave = computed(() => {
  return ['fire', 'energy'].includes(props.variant)
})

const explosionStyle = computed(() => {
  return {
    width: `${size.value}px`,
    height: `${size.value}px`,
    transform: `scale(${props.particle.scale || 1})`
  }
})

const coreStyle = computed(() => {
  const gradient = getGradientForVariant()
  
  return {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: gradient,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 0 ${size.value / 2}px ${computedColor.value}`
  }
})

const shockwaveStyle = computed(() => {
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${size.value * 2}px`,
    height: `${size.value * 2}px`,
    border: `2px solid ${computedColor.value}40`,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: `shockwave-expand 1s ease-out infinite`
  }
})

const getGradientForVariant = () => {
  switch (props.variant) {
    case 'fire':
      return `radial-gradient(circle, ${computedColor.value} 0%, ${secondaryColor.value} 50%, #B91C1C 100%)`
    case 'lightning':
      return `radial-gradient(circle, #FFFFFF 0%, #3B82F6 50%, #1E40AF 100%)`
    case 'smoke':
      return `radial-gradient(circle, #6B7280 0%, #4B5563 50%, #374151 100%)`
    case 'energy':
      return `radial-gradient(circle, ${computedColor.value} 0%, #8B5CF6 50%, #6366F1 100%)`
    default:
      return `radial-gradient(circle, ${computedColor.value} 0%, ${secondaryColor.value} 100%)`
  }
}

const generateFragments = () => {
  const fragmentCount = Math.floor(8 * intensityMultiplier.value)
  fragments.value = []
  
  for (let i = 0; i < fragmentCount; i++) {
    const angle = (360 / fragmentCount) * i
    const distance = Math.random() * 20 + 10
    const fragmentSize = Math.random() * 4 + 2
    
    fragments.value.push({
      id: `fragment-${i}`,
      style: {
        position: 'absolute',
        width: `${fragmentSize}px`,
        height: `${fragmentSize}px`,
        backgroundColor: i % 2 ? computedColor.value : secondaryColor.value,
        borderRadius: '50%',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
        animation: `fragment-fly 1s ease-out forwards`,
        animationDelay: `${Math.random() * 0.3}s`
      }
    })
  }
}

const generateLightningBolts = () => {
  if (props.variant !== 'lightning') return
  
  const boltCount = 3
  lightningBolts.value = []
  
  for (let i = 0; i < boltCount; i++) {
    const startX = 50 + (Math.random() - 0.5) * 20
    const startY = 50 + (Math.random() - 0.5) * 20
    const endX = Math.random() * 100
    const endY = Math.random() * 100
    
    // Create zigzag lightning path
    const path = generateZigzagPath(startX, startY, endX, endY)
    
    lightningBolts.value.push({
      id: `bolt-${i}`,
      path: path,
      width: Math.random() * 2 + 1,
      delay: `${Math.random() * 0.5}s`
    })
  }
}

const generateZigzagPath = (startX, startY, endX, endY) => {
  const segments = 4
  let path = `M ${startX} ${startY}`
  
  for (let i = 1; i <= segments; i++) {
    const progress = i / segments
    const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 20
    const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 20
    path += ` L ${x} ${y}`
  }
  
  return path
}

// Initialize fragments and effects on mount
onMounted(() => {
  generateFragments()
  generateLightningBolts()
})
</script>

<style scoped>
.explosion-particle {
  @apply relative;
  transition: none;
}

.explosion-core {
  animation: explosion-core 1.5s ease-out forwards;
}

.lightning-container {
  @apply absolute inset-0 flex items-center justify-center;
}

.lightning-svg {
  @apply absolute;
}

.lightning-bolt {
  filter: drop-shadow(0 0 3px currentColor);
  animation: lightning-flash 0.3s ease-in-out infinite;
}

/* Core explosion animation */
@keyframes explosion-core {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Fragment animations */
@keyframes fragment-fly {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(0px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(-30px) scale(0);
    opacity: 0;
  }
}

/* Shockwave animation */
@keyframes shockwave-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

/* Lightning flash animation */
@keyframes lightning-flash {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* Fire variant specific */
.explosion-particle.fire .explosion-core {
  animation: fire-explosion 2s ease-out forwards;
}

@keyframes fire-explosion {
  0% {
    transform: scale(0);
    opacity: 1;
    filter: brightness(2) hue-rotate(0deg);
  }
  30% {
    transform: scale(1);
    opacity: 0.9;
    filter: brightness(1.5) hue-rotate(10deg);
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
    filter: brightness(0.5) hue-rotate(30deg);
  }
}

/* Energy variant specific */
.explosion-particle.energy .explosion-core {
  animation: energy-explosion 1.8s ease-out forwards;
}

@keyframes energy-explosion {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
    filter: brightness(3);
  }
  50% {
    transform: scale(1.5) rotate(180deg);
    opacity: 0.8;
    filter: brightness(2);
  }
  100% {
    transform: scale(3) rotate(360deg);
    opacity: 0;
    filter: brightness(0.5);
  }
}

/* Smoke variant specific */
.explosion-particle.smoke .explosion-core {
  animation: smoke-explosion 3s ease-out forwards;
}

@keyframes smoke-explosion {
  0% {
    transform: scale(0);
    opacity: 0.8;
    filter: blur(0px);
  }
  50% {
    transform: scale(1.5);
    opacity: 0.6;
    filter: blur(2px);
  }
  100% {
    transform: scale(4);
    opacity: 0;
    filter: blur(5px);
  }
}

/* Lightning variant specific */
.explosion-particle.lightning .explosion-core {
  animation: lightning-explosion 1s ease-out forwards;
}

@keyframes lightning-explosion {
  0% {
    transform: scale(0);
    opacity: 1;
    filter: brightness(5);
  }
  20% {
    transform: scale(0.8);
    opacity: 1;
    filter: brightness(3);
  }
  100% {
    transform: scale(2);
    opacity: 0;
    filter: brightness(1);
  }
}

/* Intensity variants */
.explosion-particle.high-intensity .explosion-core {
  animation-duration: 2.5s;
  box-shadow: 0 0 40px currentColor;
}

.explosion-particle.low-intensity .explosion-core {
  animation-duration: 1s;
  box-shadow: 0 0 10px currentColor;
}

/* Fragment size variants */
.explosion-fragment.large {
  width: 6px !important;
  height: 6px !important;
}

.explosion-fragment.small {
  width: 2px !important;
  height: 2px !important;
}

/* Special effects for mobile performance */
@media (max-width: 768px) {
  .explosion-core {
    animation-duration: 1s;
  }
  
  .explosion-fragment {
    animation-duration: 0.8s;
  }
  
  .lightning-bolt {
    animation-duration: 0.2s;
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .explosion-core,
  .explosion-fragment,
  .lightning-bolt {
    animation: none !important;
  }
  
  .explosion-particle {
    opacity: 0.5;
    transition: opacity 0.5s ease;
  }
}</style> 