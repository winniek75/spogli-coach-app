<template>
  <div 
    class="star-particle"
    :style="starStyle"
  >
    <svg 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      fill="none"
      class="star-svg"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        :fill="computedColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        class="star-path"
      />
    </svg>
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
    default: 'gold'
  }
})

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
    gold: '#FFD700',
    silver: '#C0C0C0',
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
    white: '#FFFFFF'
  }
  return colorMap[props.color] || props.color
})

const strokeColor = computed(() => {
  // Slightly darker version of fill color for stroke
  const colorMap = {
    gold: '#DAA520',
    silver: '#A0A0A0',
    blue: '#2563EB',
    green: '#059669',
    red: '#DC2626',
    purple: '#7C3AED',
    pink: '#DB2777',
    orange: '#EA580C',
    white: '#E5E7EB'
  }
  return colorMap[props.color] || '#000000'
})

const strokeWidth = computed(() => {
  return props.particle.size === 'small' ? 0.5 : 1
})

const starStyle = computed(() => {
  return {
    filter: `drop-shadow(0 0 ${size.value / 4}px ${computedColor.value}40)`,
    transform: `rotate(${props.particle.rotation || 0}deg)`
  }
})
</script>

<style scoped>
.star-particle {
  @apply flex items-center justify-center;
  transition: all 0.1s ease-out;
}

.star-svg {
  @apply drop-shadow-lg;
}

.star-path {
  filter: brightness(1.1);
  transition: all 0.2s ease;
}

.star-particle:hover .star-path {
  filter: brightness(1.3) saturate(1.2);
}

/* Pulsing animation for special effects */
.star-particle.pulsing {
  animation: star-pulse 1s ease-in-out infinite;
}

@keyframes star-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* Twinkling effect */
.star-particle.twinkling {
  animation: star-twinkle 2s ease-in-out infinite;
}

@keyframes star-twinkle {
  0%, 100% {
    opacity: 0.6;
    filter: brightness(0.8);
  }
  50% {
    opacity: 1;
    filter: brightness(1.4);
  }
}

/* Shooting star effect */
.star-particle.shooting {
  animation: shooting-star 1.5s ease-out forwards;
}

@keyframes shooting-star {
  0% {
    transform: translateX(-100px) translateY(-100px) scale(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translateX(-50px) translateY(-50px) scale(1);
  }
  100% {
    transform: translateX(100px) translateY(100px) scale(0.5);
    opacity: 0;
  }
}
</style>