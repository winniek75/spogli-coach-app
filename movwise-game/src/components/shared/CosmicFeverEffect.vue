<template>
  <div class="fever-mode-effect">
    <!-- Main fever overlay -->
    <Transition name="fever-fade">
      <div v-if="isActive" class="fever-overlay">
        <!-- Background glow effect -->
        <div class="fever-background">
          <div class="glow-ring ring-1"></div>
          <div class="glow-ring ring-2"></div>
          <div class="glow-ring ring-3"></div>
        </div>
        
        <!-- Particle systems -->
        <div class="particle-system">
          <!-- Fire particles -->
          <div class="fire-particles">
            <div v-for="i in 20" :key="`fire-${i}`" 
                 class="fire-particle"
                 :style="getFireParticleStyle(i)">
              🔥
            </div>
          </div>
          
          <!-- Lightning particles -->
          <div class="lightning-particles">
            <div v-for="i in 8" :key="`lightning-${i}`" 
                 class="lightning-particle"
                 :style="getLightningParticleStyle(i)">
              ⚡
            </div>
          </div>
          
          <!-- Star particles -->
          <div class="star-particles">
            <div v-for="i in 15" :key="`star-${i}`" 
                 class="star-particle"
                 :style="getStarParticleStyle(i)">
              ⭐
            </div>
          </div>
        </div>
        
        <!-- Fever text notification -->
        <Transition name="fever-text-bounce">
          <div v-if="showText" class="fever-notification">
            <div class="fever-title">🔥 FEVER MODE! 🔥</div>
            <div class="fever-subtitle">Double Score Multiplier!</div>
            <div class="fever-timer">{{ remainingTime }}s remaining</div>
          </div>
        </Transition>
        
        <!-- Screen border effect -->
        <div class="fever-border">
          <div class="border-corner top-left"></div>
          <div class="border-corner top-right"></div>
          <div class="border-corner bottom-left"></div>
          <div class="border-corner bottom-right"></div>
        </div>
        
        <!-- Intensity waves -->
        <div class="intensity-waves">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
          <div class="wave wave-3"></div>
        </div>
      </div>
    </Transition>
    
    <!-- Audio controls (if needed) -->
    <audio ref="feverAudio" preload="auto" loop>
      <!-- Fever mode sound effect would go here -->
    </audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 10000 // 10 seconds in milliseconds
  },
  intensity: {
    type: Number,
    default: 1,
    validator: (value) => value >= 0.5 && value <= 2
  },
  showNotification: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['started', 'ended', 'tick'])

// Reactive state
const remainingTime = ref(0)
const showText = ref(false)
const feverAudio = ref(null)

let feverTimer = null
let tickTimer = null

// Computed
const normalizedIntensity = computed(() => {
  return Math.max(0.5, Math.min(2, props.intensity))
})

// Methods
const startFeverMode = () => {
  if (!props.isActive) return
  
  remainingTime.value = Math.ceil(props.duration / 1000)
  showText.value = props.showNotification
  
  // Hide text after 2 seconds
  if (props.showNotification) {
    setTimeout(() => {
      showText.value = false
    }, 2000)
  }
  
  // Start countdown timer
  tickTimer = setInterval(() => {
    remainingTime.value--
    emit('tick', remainingTime.value)
    
    if (remainingTime.value <= 0) {
      endFeverMode()
    }
  }, 1000)
  
  emit('started')
  
  // Play fever sound if available
  if (feverAudio.value) {
    feverAudio.value.play().catch(() => {
      // Audio play failed, continue without sound
    })
  }
}

const endFeverMode = () => {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
  
  remainingTime.value = 0
  showText.value = false
  
  // Stop fever sound
  if (feverAudio.value) {
    feverAudio.value.pause()
    feverAudio.value.currentTime = 0
  }
  
  emit('ended')
}

// Particle style generators
const getFireParticleStyle = (index) => {
  const delay = (index * 0.1) + 's'
  const left = (Math.random() * 100) + '%'
  const animationDuration = (2 + Math.random() * 2) + 's'
  
  return {
    '--left': left,
    '--delay': delay,
    '--duration': animationDuration,
    '--intensity': normalizedIntensity.value
  }
}

const getLightningParticleStyle = (index) => {
  const delay = (index * 0.3) + 's'
  const left = (Math.random() * 100) + '%'
  const top = (Math.random() * 100) + '%'
  
  return {
    '--left': left,
    '--top': top,
    '--delay': delay,
    '--intensity': normalizedIntensity.value
  }
}

const getStarParticleStyle = (index) => {
  const delay = (index * 0.2) + 's'
  const left = (Math.random() * 100) + '%'
  const animationDuration = (3 + Math.random() * 2) + 's'
  
  return {
    '--left': left,
    '--delay': delay,
    '--duration': animationDuration,
    '--intensity': normalizedIntensity.value
  }
}

// Watchers
watch(() => props.isActive, (newValue) => {
  if (newValue) {
    startFeverMode()
  } else {
    endFeverMode()
  }
})

// Lifecycle
onMounted(() => {
  if (props.isActive) {
    startFeverMode()
  }
})

onUnmounted(() => {
  endFeverMode()
})
</script>

<style scoped>
.fever-mode-effect {
  position: relative;
  pointer-events: none;
}

/* Main Fever Overlay */
.fever-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 500;
  pointer-events: none;
  overflow: hidden;
}

/* Background Glow */
.fever-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
  height: 200%;
}

.glow-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
  animation: glowPulse 2s ease-in-out infinite alternate;
}

.ring-1 {
  width: 100%;
  height: 100%;
  animation-delay: 0s;
}

.ring-2 {
  width: 150%;
  height: 150%;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 200%;
  height: 200%;
  animation-delay: 1s;
}

@keyframes glowPulse {
  0% { 
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.8);
  }
  100% { 
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* Particle Systems */
.particle-system {
  position: absolute;
  width: 100%;
  height: 100%;
}

/* Fire Particles */
.fire-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.fire-particle {
  position: absolute;
  left: var(--left);
  bottom: -20px;
  font-size: calc(1rem * var(--intensity, 1));
  animation: fireRise var(--duration, 3s) linear infinite;
  animation-delay: var(--delay, 0s);
  opacity: 0;
}

@keyframes fireRise {
  0% {
    bottom: -20px;
    opacity: 0;
    transform: translateX(0) scale(0.5);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 110vh;
    opacity: 0;
    transform: translateX(20px) scale(1.5);
  }
}

/* Lightning Particles */
.lightning-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.lightning-particle {
  position: absolute;
  left: var(--left);
  top: var(--top);
  font-size: calc(1.5rem * var(--intensity, 1));
  animation: lightningFlash 0.8s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes lightningFlash {
  0%, 80%, 100% {
    opacity: 0;
    transform: scale(0.8) rotate(0deg);
  }
  10%, 70% {
    opacity: 1;
    transform: scale(1.2) rotate(10deg);
  }
  40% {
    opacity: 0.7;
    transform: scale(1) rotate(-5deg);
  }
}

/* Star Particles */
.star-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star-particle {
  position: absolute;
  left: var(--left);
  top: -20px;
  font-size: calc(0.8rem * var(--intensity, 1));
  animation: starFall var(--duration, 4s) linear infinite;
  animation-delay: var(--delay, 0s);
  opacity: 0;
}

@keyframes starFall {
  0% {
    top: -20px;
    opacity: 0;
    transform: rotate(0deg) scale(0.5);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 110vh;
    opacity: 0;
    transform: rotate(360deg) scale(1.5);
  }
}

/* Fever Notification */
.fever-notification {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 1000;
}

.fever-title {
  font-size: 3rem;
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
  margin-bottom: 0.5rem;
  animation: feverTitlePulse 0.5s ease-in-out infinite alternate;
}

@keyframes feverTitlePulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.fever-subtitle {
  font-size: 1.5rem;
  font-weight: bold;
  color: #dc2626;
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.8);
  margin-bottom: 0.5rem;
}

.fever-timer {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f97316;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

/* Screen Border Effect */
.fever-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.border-corner {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 4px solid #f59e0b;
  animation: borderGlow 1s ease-in-out infinite alternate;
}

.top-left {
  top: 20px;
  left: 20px;
  border-bottom: none;
  border-right: none;
}

.top-right {
  top: 20px;
  right: 20px;
  border-bottom: none;
  border-left: none;
}

.bottom-left {
  bottom: 20px;
  left: 20px;
  border-top: none;
  border-right: none;
}

.bottom-right {
  bottom: 20px;
  right: 20px;
  border-top: none;
  border-left: none;
}

@keyframes borderGlow {
  0% {
    border-color: #f59e0b;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
  }
  100% {
    border-color: #fbbf24;
    box-shadow: 0 0 30px rgba(251, 191, 36, 0.8);
  }
}

/* Intensity Waves */
.intensity-waves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(245, 158, 11, 0.1), 
    transparent
  );
  animation: waveSlide 3s linear infinite;
}

.wave-1 {
  animation-delay: 0s;
}

.wave-2 {
  animation-delay: 1s;
}

.wave-3 {
  animation-delay: 2s;
}

@keyframes waveSlide {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Transitions */
.fever-fade-enter-active {
  transition: all 0.5s ease-out;
}

.fever-fade-leave-active {
  transition: all 0.3s ease-in;
}

.fever-fade-enter-from,
.fever-fade-leave-to {
  opacity: 0;
}

.fever-text-bounce-enter-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fever-text-bounce-leave-active {
  transition: all 0.3s ease-in;
}

.fever-text-bounce-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.5) translateY(-50px);
}

.fever-text-bounce-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(1.5) translateY(-50px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .fever-title {
    font-size: 2.5rem;
  }
  
  .fever-subtitle {
    font-size: 1.2rem;
  }
  
  .fever-timer {
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
  }
  
  .border-corner {
    width: 60px;
    height: 60px;
  }
  
  .fire-particle,
  .lightning-particle,
  .star-particle {
    font-size: calc(0.8rem * var(--intensity, 1));
  }
}

@media (max-width: 480px) {
  .fever-title {
    font-size: 2rem;
  }
  
  .fever-subtitle {
    font-size: 1rem;
  }
  
  .fever-timer {
    font-size: 0.9rem;
  }
  
  .border-corner {
    width: 40px;
    height: 40px;
    border-width: 2px;
  }
  
  .top-left, .top-right {
    top: 10px;
  }
  
  .bottom-left, .bottom-right {
    bottom: 10px;
  }
  
  .top-left, .bottom-left {
    left: 10px;
  }
  
  .top-right, .bottom-right {
    right: 10px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .glow-ring {
    animation: none;
  }
  
  .fire-particle,
  .lightning-particle,
  .star-particle {
    animation: none;
    opacity: 0.5;
  }
  
  .fever-title {
    animation: none;
  }
  
  .border-corner {
    animation: none;
  }
  
  .wave {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .fever-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .fever-title,
  .fever-subtitle,
  .fever-timer {
    background: #000;
    border: 2px solid #fff;
    color: #fff;
  }
  
  .border-corner {
    border-color: #fff;
  }
}
</style>