<template>
  <div 
    class="circle-particle"
    :style="circleStyle"
  >
    <div 
      class="circle-inner"
      :style="innerStyle"
    >
      <div 
        v-if="showGlow"
        class="circle-glow"
        :style="glowStyle"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  particle: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: 'blue'
  },
  variant: {
    type: String,
    default: 'solid', // 'solid', 'gradient', 'outline', 'glow'
  }
})

const size = computed(() => {
  const sizeMap = {
    small: 8,
    medium: 16,
    large: 24
  }
  return sizeMap[props.particle.size] || 16
})

const computedColor = computed(() => {
  const colorMap = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
    white: '#FFFFFF',
    cyan: '#06B6D4',
    lime: '#84CC16',
    indigo: '#6366F1'
  }
  return colorMap[props.color] || props.color
})

const gradientColor = computed(() => {
  const gradientMap = {
    gold: 'linear-gradient(45deg, #FFD700, #FFA500)',
    silver: 'linear-gradient(45deg, #C0C0C0, #808080)',
    blue: 'linear-gradient(45deg, #3B82F6, #1D4ED8)',
    green: 'linear-gradient(45deg, #10B981, #047857)',
    red: 'linear-gradient(45deg, #EF4444, #DC2626)',
    purple: 'linear-gradient(45deg, #8B5CF6, #7C3AED)',
    pink: 'linear-gradient(45deg, #EC4899, #DB2777)',
    orange: 'linear-gradient(45deg, #F97316, #EA580C)',
    white: 'linear-gradient(45deg, #FFFFFF, #E5E7EB)',
    cyan: 'linear-gradient(45deg, #06B6D4, #0891B2)',
    lime: 'linear-gradient(45deg, #84CC16, #65A30D)',
    indigo: 'linear-gradient(45deg, #6366F1, #4F46E5)'
  }
  return gradientMap[props.color] || `linear-gradient(45deg, ${computedColor.value}, ${computedColor.value})`
})

const showGlow = computed(() => {
  return props.variant === 'glow' || props.particle.effect === 'glow'
})

const circleStyle = computed(() => {
  return {
    width: `${size.value}px`,
    height: `${size.value}px`,
    transform: `rotate(${props.particle.rotation || 0}deg) scale(${props.particle.scale || 1})`
  }
})

const innerStyle = computed(() => {
  const baseStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    position: 'relative'
  }

  switch (props.variant) {
    case 'gradient':
      return {
        ...baseStyle,
        background: gradientColor.value,
        boxShadow: `0 0 ${size.value / 2}px ${computedColor.value}40`
      }
    case 'outline':
      return {
        ...baseStyle,
        border: `2px solid ${computedColor.value}`,
        background: 'transparent'
      }
    case 'glow':
      return {
        ...baseStyle,
        background: computedColor.value,
        boxShadow: `0 0 ${size.value}px ${computedColor.value}`
      }
    case 'solid':
    default:
      return {
        ...baseStyle,
        backgroundColor: computedColor.value,
        boxShadow: `0 0 ${size.value / 4}px ${computedColor.value}60`
      }
  }
})

const glowStyle = computed(() => {
  if (!showGlow.value) return {}
  
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${size.value * 1.5}px`,
    height: `${size.value * 1.5}px`,
    background: `radial-gradient(circle, ${computedColor.value}30 0%, transparent 70%)`,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: -1,
    animation: 'glow-pulse 2s ease-in-out infinite'
  }
})
</script>

<style scoped>
.circle-particle {
  @apply relative;
  transition: all 0.1s ease-out;
}

.circle-inner {
  transition: all 0.2s ease;
}

/* Bubble floating effect */
.circle-particle.floating {
  animation: bubble-float 3s ease-in-out infinite;
}

@keyframes bubble-float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.1);
  }
}

/* Bouncing effect */
.circle-particle.bouncing {
  animation: circle-bounce 1s ease-in-out infinite;
}

@keyframes circle-bounce {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Spinning effect */
.circle-particle.spinning {
  animation: circle-spin 2s linear infinite;
}

@keyframes circle-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Pulsing effect */
.circle-particle.pulsing {
  animation: circle-pulse 1.5s ease-in-out infinite;
}

@keyframes circle-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

/* Glow pulse animation */
@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* Ripple effect */
.circle-particle.ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border: 2px solid currentColor;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple-expand 1.5s ease-out infinite;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* Morphing effect */
.circle-particle.morphing {
  animation: circle-morph 2s ease-in-out infinite;
}

@keyframes circle-morph {
  0%, 100% {
    border-radius: 50%;
    transform: rotate(0deg);
  }
  25% {
    border-radius: 20% 80% 60% 40%;
    transform: rotate(90deg);
  }
  50% {
    border-radius: 80% 20% 40% 60%;
    transform: rotate(180deg);
  }
  75% {
    border-radius: 40% 60% 80% 20%;
    transform: rotate(270deg);
  }
}
</style>