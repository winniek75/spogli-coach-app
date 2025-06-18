<template>
  <div 
    v-if="show" 
    class="particle-effect-container"
    :class="containerClass"
  >
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :class="[`particle-${type}`, `particle-${particle.size}`]"
      :style="particle.style"
    >
      <component 
        :is="particleComponent" 
        :particle="particle"
        :color="color"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Particle Components
import StarParticle from './particles/StarParticle.vue'
import CircleParticle from './particles/CircleParticle.vue'
import ExplosionParticle from './particles/ExplosionParticle.vue'
import SparkleParticle from './particles/SparkleParticle.vue'
import RainbowParticle from './particles/RainbowParticle.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'stars',
    validator: (value) => ['stars', 'circles', 'explosion', 'sparkles', 'rainbow', 'hearts', 'lightning'].includes(value)
  },
  count: {
    type: Number,
    default: 15
  },
  color: {
    type: String,
    default: 'gold'
  },
  duration: {
    type: Number,
    default: 2000
  },
  origin: {
    type: String,
    default: 'center', // 'center', 'top', 'bottom', 'left', 'right', 'random'
  },
  spread: {
    type: Number,
    default: 360 // degrees
  },
  speed: {
    type: String,
    default: 'medium', // 'slow', 'medium', 'fast'
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large', 'random'
  },
  gravity: {
    type: Boolean,
    default: true
  },
  fade: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['complete'])

// State
const particles = ref([])
const animationFrame = ref(null)
const startTime = ref(null)

// Computed
const containerClass = computed(() => {
  return [
    'particle-container',
    `effect-${props.type}`,
    `origin-${props.origin}`,
    `speed-${props.speed}`
  ]
})

const particleComponent = computed(() => {
  const components = {
    stars: StarParticle,
    circles: CircleParticle,
    explosion: ExplosionParticle,
    sparkles: SparkleParticle,
    rainbow: RainbowParticle,
    hearts: StarParticle, // Reuse StarParticle with heart shape
    lightning: ExplosionParticle // Reuse ExplosionParticle with lightning style
  }
  return components[props.type] || StarParticle
})

// Methods
const generateParticles = () => {
  particles.value = []
  
  for (let i = 0; i < props.count; i++) {
    const particle = createParticle(i)
    particles.value.push(particle)
  }
}

const createParticle = (index) => {
  const origin = getOriginPosition()
  const velocity = getVelocity()
  const size = getParticleSize()
  
  return {
    id: `particle-${Date.now()}-${index}`,
    x: origin.x,
    y: origin.y,
    vx: velocity.x,
    vy: velocity.y,
    size: size,
    life: 1.0,
    decay: Math.random() * 0.02 + 0.01,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    scale: 1,
    opacity: 1,
    color: props.color,
    delay: Math.random() * 500, // Stagger effect
    style: {
      position: 'absolute',
      left: origin.x + '%',
      top: origin.y + '%',
      transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
      zIndex: 1000 + index,
      pointerEvents: 'none'
    }
  }
}

const getOriginPosition = () => {
  switch (props.origin) {
    case 'top':
      return { x: Math.random() * 100, y: 0 }
    case 'bottom':
      return { x: Math.random() * 100, y: 100 }
    case 'left':
      return { x: 0, y: Math.random() * 100 }
    case 'right':
      return { x: 100, y: Math.random() * 100 }
    case 'random':
      return { x: Math.random() * 100, y: Math.random() * 100 }
    case 'center':
    default:
      return { x: 50, y: 50 }
  }
}

const getVelocity = () => {
  const speedMultiplier = {
    slow: 0.5,
    medium: 1,
    fast: 1.5
  }[props.speed]

  const angle = Math.random() * props.spread * (Math.PI / 180)
  const speed = (Math.random() * 3 + 1) * speedMultiplier

  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
  }
}

const getParticleSize = () => {
  if (props.size === 'random') {
    const sizes = ['small', 'medium', 'large']
    return sizes[Math.floor(Math.random() * sizes.length)]
  }
  return props.size
}

const animateParticles = (currentTime) => {
  if (!startTime.value) {
    startTime.value = currentTime
  }

  const elapsed = currentTime - startTime.value
  const progress = elapsed / props.duration

  if (progress >= 1) {
    // Animation complete
    particles.value = []
    emit('complete')
    return
  }

  // Update each particle
  particles.value.forEach((particle) => {
    updateParticle(particle, elapsed)
  })

  // Continue animation
  animationFrame.value = requestAnimationFrame(animateParticles)
}

const updateParticle = (particle, elapsed) => {
  // Skip if particle hasn't started yet (delay)
  if (elapsed < particle.delay) return

  const deltaTime = elapsed - particle.delay
  const timeProgress = deltaTime / (props.duration - particle.delay)

  // Update position
  particle.x += particle.vx
  particle.y += particle.vy

  // Apply gravity
  if (props.gravity) {
    particle.vy += 0.1
  }

  // Update rotation
  particle.rotation += particle.rotationSpeed

  // Update life and opacity
  if (props.fade) {
    particle.life -= particle.decay
    particle.opacity = Math.max(0, particle.life)
  }

  // Update scale based on particle type
  if (props.type === 'explosion') {
    particle.scale = 1 + timeProgress * 2
  } else if (props.type === 'sparkles') {
    particle.scale = 1 + Math.sin(timeProgress * Math.PI * 4) * 0.3
  }

  // Update style
  particle.style = {
    ...particle.style,
    left: particle.x + '%',
    top: particle.y + '%',
    transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`,
    opacity: particle.opacity
  }
}

const startAnimation = () => {
  if (!props.show) return

  generateParticles()
  startTime.value = null
  
  // Start animation loop
  animationFrame.value = requestAnimationFrame(animateParticles)
}

const stopAnimation = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }
  particles.value = []
  startTime.value = null
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    startAnimation()
  } else {
    stopAnimation()
  }
})

// Lifecycle
onMounted(() => {
  if (props.show) {
    startAnimation()
  }
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.particle-effect-container {
  @apply fixed inset-0 pointer-events-none;
  z-index: 9999;
}

/* Particle base styles */
.particle {
  @apply absolute;
  transition: none;
}

/* Particle type specific styles */
.particle-stars {
  @apply text-yellow-400;
}

.particle-circles {
  @apply bg-current rounded-full;
}

.particle-explosion {
  background: radial-gradient(circle, #fb923c, #dc2626);
}

.particle-sparkles {
  @apply bg-gradient-to-r from-pink-400 to-purple-500;
}

.particle-rainbow {
  @apply bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500;
}

/* Particle sizes */
.particle-small {
  width: 4px;
  height: 4px;
}

.particle-medium {
  width: 8px;
  height: 8px;
}

.particle-large {
  width: 12px;
  height: 12px;
}

/* Speed variants */
.speed-slow .particle {
  animation-duration: 3s;
}

.speed-medium .particle {
  animation-duration: 2s;
}

.speed-fast .particle {
  animation-duration: 1s;
}

/* Origin specific effects */
.origin-center {
  transform-origin: center center;
}

.origin-top {
  transform-origin: top center;
}

.origin-bottom {
  transform-origin: bottom center;
}

.origin-left {
  transform-origin: left center;
}

.origin-right {
  transform-origin: right center;
}

/* Effect type animations */
.effect-explosion .particle {
  animation: explode ease-out forwards;
}

.effect-sparkles .particle {
  animation: sparkle ease-in-out infinite alternate;
}

.effect-stars .particle {
  animation: twinkle ease-in-out infinite;
}

.effect-rainbow .particle {
  animation: rainbow-float ease-in-out infinite;
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2) rotate(720deg);
    opacity: 0;
  }
}

@keyframes sparkle {
  0% {
    transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
    opacity: 1;
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes rainbow-float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-20px) rotate(180deg);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none !important;
    transition: opacity 0.3s ease;
  }
  
  .particle-effect-container {
    display: none;
  }
}</style>
    