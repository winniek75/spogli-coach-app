<template>
  <div 
    v-if="isVisible"
    class="repair-animation fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <!-- Starfield background -->
    <div class="absolute inset-0 overflow-hidden">
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="absolute bg-white rounded-full animate-twinkle"
        :style="{
          left: star.x + '%',
          top: star.y + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          animationDelay: star.delay + 's'
        }"
      ></div>
    </div>

    <!-- Main animation container -->
    <div class="relative text-center text-white space-y-8 animate-system-boot">
      
      <!-- Phase 1: Engine Diagnosis -->
      <div v-if="currentPhase === 'diagnosis'" class="space-y-6">
        <div class="text-6xl animate-spin">🔧</div>
        <h2 class="text-4xl font-bold neon-purple">Engine Diagnosis</h2>
        <p class="text-purple-200">Analyzing grammar engine components...</p>
        
        <!-- Diagnostic scanner -->
        <div class="relative w-64 h-4 mx-auto bg-slate-700 rounded-full overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 animate-scanner"></div>
        </div>
      </div>

      <!-- Phase 2: Component Assembly -->
      <div v-if="currentPhase === 'assembly'" class="space-y-6">
        <div class="relative">
          <!-- Spacecraft icon with rotating parts -->
          <div class="text-8xl relative">
            🚀
            <!-- Orbiting parts -->
            <div 
              v-for="(part, index) in assemblyParts" 
              :key="part.id"
              class="absolute w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-orbit"
              :style="{
                '--orbit-radius': '60px',
                '--orbit-duration': (2 + index * 0.5) + 's',
                '--orbit-delay': (index * 0.3) + 's'
              }"
            >
              {{ part.symbol }}
            </div>
          </div>
        </div>
        
        <h2 class="text-4xl font-bold neon-green">Component Assembly</h2>
        <p class="text-green-200">Grammar parts aligning into formation...</p>
        
        <!-- Assembly progress -->
        <div class="flex justify-center space-x-4">
          <div 
            v-for="(part, index) in assemblyParts"
            :key="part.id"
            class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold animate-part-slot"
            :style="{ animationDelay: (index * 0.2) + 's' }"
          >
            {{ part.symbol }}
          </div>
        </div>
      </div>

      <!-- Phase 3: Energy Fusion -->
      <div v-if="currentPhase === 'fusion'" class="space-y-6">
        <div class="relative">
          <!-- Energy core with fusion effect -->
          <div class="text-8xl animate-fusion-core">⚡</div>
          
          <!-- Energy rings -->
          <div 
            v-for="ring in energyRings" 
            :key="ring.id"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div 
              class="border-4 rounded-full animate-energy-ring"
              :class="ring.class"
              :style="{
                width: ring.size + 'px',
                height: ring.size + 'px',
                animationDelay: ring.delay + 's'
              }"
            ></div>
          </div>
        </div>
        
        <h2 class="text-4xl font-bold neon-cyan">Energy Fusion</h2>
        <p class="text-cyan-200">Grammar patterns synchronizing...</p>
        
        <!-- Fusion meter -->
        <div class="relative w-48 h-6 mx-auto bg-slate-700 rounded-full overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-fusion-progress"></div>
          <!-- Energy sparks -->
          <div 
            v-for="spark in energySparks" 
            :key="spark.id"
            class="absolute w-2 h-2 bg-white rounded-full animate-spark"
            :style="{
              left: spark.x + '%',
              top: spark.y + '%',
              animationDelay: spark.delay + 's'
            }"
          ></div>
        </div>
      </div>

      <!-- Phase 4: System Revival -->
      <div v-if="currentPhase === 'revival'" class="space-y-6">
        <div class="relative">
          <!-- Revived spacecraft with burst effect -->
          <div class="text-8xl animate-revival-burst">🌟</div>
          
          <!-- Radial burst lines -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div 
              v-for="line in burstLines" 
              :key="line.id"
              class="absolute w-1 bg-gradient-to-t from-purple-400 to-transparent animate-burst-line"
              :style="{
                height: line.length + 'px',
                transform: `rotate(${line.angle}deg)`,
                transformOrigin: 'bottom',
                animationDelay: line.delay + 's'
              }"
            ></div>
          </div>
        </div>
        
        <h2 class="text-5xl font-bold neon-purple animate-achievement-glow">
          Engine Revival Complete!
        </h2>
        <p class="text-purple-200">Spacecraft grammar systems fully operational!</p>
        
        <!-- Success indicators -->
        <div class="flex justify-center space-x-8">
          <div class="text-center animate-team-sync">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-tie text-white text-xl"></i>
            </div>
            <div class="text-purple-300 font-medium">Captain</div>
            <div class="text-white text-sm">Parts Provided!</div>
          </div>
          
          <div class="flex items-center">
            <div class="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 animate-connection-pulse"></div>
          </div>
          
          <div class="text-center animate-team-sync animate-delay-1">
            <div class="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-astronaut text-white text-xl"></i>
            </div>
            <div class="text-pink-300 font-medium">Co-Pilot</div>
            <div class="text-white text-sm">Assembly Success!</div>
          </div>
        </div>
      </div>

      <!-- Completion Message -->
      <div v-if="currentPhase === 'complete'" class="space-y-6">
        <div class="text-8xl animate-success-explosion">🎉</div>
        <h2 class="text-5xl font-bold neon-green">Mission Accomplished!</h2>
        <p class="text-2xl text-green-200">{{ repairedComponent }} fully restored</p>
        <p class="text-lg text-purple-300">Ready for next mission</p>
        
        <!-- Continue button -->
        <button
          @click="completeAnimation"
          class="mt-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 
                 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105"
        >
          Continue Mission
        </button>
      </div>
    </div>

    <!-- Particle effects overlay -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="absolute w-2 h-2 rounded-full animate-particle-float"
        :class="particle.class"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          animationDelay: particle.delay + 's',
          animationDuration: particle.duration + 's'
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'

// Props
const props = defineProps({
  repairedComponent: {
    type: String,
    default: 'Grammar Engine'
  },
  successType: {
    type: String,
    default: 'complete' // complete, partial, critical
  }
})

// Emits
const emit = defineEmits(['animation-complete'])

// Reactive data
const isVisible = ref(true)
const currentPhase = ref('diagnosis')
const stars = ref([])
const particles = ref([])

// Animation elements
const assemblyParts = reactive([
  { id: 1, symbol: 'S', type: 'subject' },
  { id: 2, symbol: 'V', type: 'verb' },
  { id: 3, symbol: 'O', type: 'object' },
  { id: 4, symbol: 'A', type: 'auxiliary' }
])

const energyRings = reactive([
  { id: 1, size: 100, class: 'border-purple-400', delay: 0 },
  { id: 2, size: 150, class: 'border-pink-400', delay: 0.3 },
  { id: 3, size: 200, class: 'border-cyan-400', delay: 0.6 }
])

const energySparks = ref([])
const burstLines = ref([])

// Methods
const initializeAnimation = () => {
  generateStars()
  generateParticles()
  generateEnergyEffects()
  generateBurstEffects()
  startAnimationSequence()
}

const generateStars = () => {
  stars.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3
  }))
}

const generateParticles = () => {
  const colors = ['bg-purple-400', 'bg-pink-400', 'bg-cyan-400', 'bg-green-400']
  particles.value = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    class: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 2
  }))
}

const generateEnergyEffects = () => {
  energySparks.value = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2
  }))
}

const generateBurstEffects = () => {
  burstLines.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) + Math.random() * 15,
    length: 80 + Math.random() * 40,
    delay: Math.random() * 0.5
  }))
}

const startAnimationSequence = () => {
  const phases = ['diagnosis', 'assembly', 'fusion', 'revival', 'complete']
  let phaseIndex = 0
  
  const nextPhase = () => {
    if (phaseIndex < phases.length) {
      currentPhase.value = phases[phaseIndex]
      phaseIndex++
      
      // Determine timing for each phase
      const phaseDurations = {
        diagnosis: 2500,
        assembly: 3000,
        fusion: 3500,
        revival: 3000,
        complete: 0 // Manual completion
      }
      
      if (currentPhase.value !== 'complete') {
        setTimeout(nextPhase, phaseDurations[currentPhase.value])
      }
    }
  }
  
  nextPhase()
}

const completeAnimation = () => {
  isVisible.value = false
  emit('animation-complete', {
    component: props.repairedComponent,
    type: props.successType
  })
}

// Lifecycle
onMounted(() => {
  initializeAnimation()
})

// Watch for prop changes
watch(() => props.successType, () => {
  // Could modify animation based on success type
})
</script>

<style scoped>
@import '@/assets/css/sound-radar-animations.css';

/* Custom animations for repair sequence */
@keyframes scanner {
  0% {
    transform: translateX(-100%);
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0.8;
  }
}

.animate-scanner {
  animation: scanner 2s ease-in-out infinite;
}

@keyframes orbit {
  from {
    transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg);
  }
}

.animate-orbit {
  animation: orbit var(--orbit-duration) linear infinite;
  animation-delay: var(--orbit-delay);
}

@keyframes part-slot {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.animate-part-slot {
  animation: part-slot 1s ease-out forwards;
}

@keyframes fusion-core {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1) hue-rotate(0deg);
  }
  25% {
    transform: scale(1.1);
    filter: brightness(1.3) hue-rotate(90deg);
  }
  50% {
    transform: scale(1.2);
    filter: brightness(1.5) hue-rotate(180deg);
  }
  75% {
    transform: scale(1.1);
    filter: brightness(1.3) hue-rotate(270deg);
  }
}

.animate-fusion-core {
  animation: fusion-core 2s ease-in-out infinite;
}

@keyframes energy-ring {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-energy-ring {
  animation: energy-ring 2s ease-out infinite;
}

@keyframes fusion-progress {
  0% {
    width: 0%;
    opacity: 0.6;
  }
  100% {
    width: 100%;
    opacity: 1;
  }
}

.animate-fusion-progress {
  animation: fusion-progress 3s ease-out forwards;
}

@keyframes spark {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

.animate-spark {
  animation: spark 1s ease-in-out infinite;
}

@keyframes revival-burst {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  30% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-revival-burst {
  animation: revival-burst 1.5s ease-out forwards;
}

@keyframes burst-line {
  0% {
    height: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    height: var(--line-length, 100px);
    opacity: 0;
  }
}

.animate-burst-line {
  animation: burst-line 1s ease-out forwards;
}

@keyframes particle-float {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-50px) rotate(360deg);
    opacity: 0;
  }
}

.animate-particle-float {
  animation: particle-float var(--duration, 3s) ease-out infinite;
}

/* Neon effects */
.neon-purple {
  color: #a855f7;
  text-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7;
}

.neon-green {
  color: #22c55e;
  text-shadow: 0 0 5px #22c55e, 0 0 10px #22c55e, 0 0 15px #22c55e;
}

.neon-cyan {
  color: #22d3ee;
  text-shadow: 0 0 5px #22d3ee, 0 0 10px #22d3ee, 0 0 15px #22d3ee;
}
</style>