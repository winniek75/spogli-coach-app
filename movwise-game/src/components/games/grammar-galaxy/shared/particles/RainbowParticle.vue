<template>
  <div 
    class="rainbow-particle"
    :style="rainbowStyle"
  >
    <div 
      class="rainbow-inner"
      :style="innerStyle"
    >
      <!-- Rainbow segments -->
      <div 
        v-for="(segment, index) in rainbowSegments"
        :key="index"
        class="rainbow-segment"
        :style="getSegmentStyle(segment, index)"
      ></div>
      
      <!-- Center highlight -->
      <div 
        v-if="showCenter"
        class="rainbow-center"
        :style="centerStyle"
      ></div>
      
      <!-- Shimmer effect -->
      <div 
        v-if="showShimmer"
        class="rainbow-shimmer"
        :style="shimmerStyle"
      ></div>
    </div>
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
    default: 'rainbow'
  },
  variant: {
    type: String,
    default: 'circle', // 'circle', 'stripe', 'gradient', 'segments'
  }
})

const rainbowColors = [
  '#FF0000', // Red
  '#FF7F00', // Orange  
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3'  // Violet
]

const size = computed(() => {
  const sizeMap = {
    small: 12,
    medium: 20,
    large: 28
  }
  return sizeMap[props.particle.size] || 20
})

const rainbowSegments = computed(() => {
  if (props.variant === 'segments') {
    return rainbowColors.map((color, index) => ({
      color,
      angle: (360 / rainbowColors.length) * index,
      size: 360 / rainbowColors.length
    }))
  }
  return rainbowColors
})

const showCenter = computed(() => {
  return ['circle', 'gradient'].includes(props.variant)
})

const showShimmer = computed(() => {
  return props.variant === 'shimmer' || props.particle.effect === 'shimmer'
})

const rainbowStyle = computed(() => {
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
    position: 'relative',
    borderRadius: '50%',
    overflow: 'hidden'
  }

  switch (props.variant) {
    case 'gradient':
      return {
        ...baseStyle,
        background: `conic-gradient(${rainbowColors.join(', ')})`,
        boxShadow: `0 0 ${size.value / 2}px rgba(255, 255, 255, 0.5)`
      }
    case 'stripe':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${rainbowColors.join(', ')})`
      }
    case 'circle':
      return {
        ...baseStyle,
        background: `radial-gradient(circle, ${rainbowColors.join(', ')})`
      }
    default:
      return baseStyle
  }
})

const getSegmentStyle = (segment, index) => {
  if (props.variant === 'segments') {
    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '50%',
      height: '2px',
      backgroundColor: segment.color,
      transformOrigin: 'left center',
      transform: `translate(-100%, -50%) rotate(${segment.angle}deg)`,
      boxShadow: `0 0 4px ${segment.color}`
    }
  }
  
  // For other variants, create layered effect
  const opacity = 1 - (index * 0.1)
  const scale = 1 - (index * 0.05)
  
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: segment,
    transform: `translate(-50%, -50%) scale(${scale})`,
    opacity: opacity,
    animation: `rainbow-pulse-${index} ${2 + index * 0.2}s ease-in-out infinite`
  }
}

const centerStyle = computed(() => {
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '30%',
    height: '30%',
    borderRadius: '50%',
    backgroundColor: 'white',
    transform: 'translate(-50%, -50%)',
    opacity: 0.8,
    animation: 'center-glow 1.5s ease-in-out infinite'
  }
})

const shimmerStyle = computed(() => {
  return {
    position: 'absolute',
    top: '0',
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
    animation: 'shimmer-sweep 2s ease-in-out infinite'
  }
})
</script>

<style scoped>
.rainbow-particle {
  @apply relative;
  transition: all 0.1s ease-out;
}

.rainbow-inner {
  transition: all 0.2s ease;
}

/* Animation for rainbow rotation */
.rainbow-particle.rotating .rainbow-inner {
  animation: rainbow-rotate 3s linear infinite;
}

/* Pulsing rainbow effect */
.rainbow-particle.pulsing .rainbow-inner {
  animation: rainbow-pulse 2s ease-in-out infinite;
}

/* Morphing effect */
.rainbow-particle.morphing {
  animation: rainbow-morph 4s ease-in-out infinite;
}

/* Floating effect */
.rainbow-particle.floating {
  animation: rainbow-float 3s ease-in-out infinite;
}

/* Core Animations */
@keyframes rainbow-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rainbow-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes rainbow-morph {
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

@keyframes rainbow-float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(120deg);
  }
  66% {
    transform: translateY(-5px) rotate(240deg);
  }
}

@keyframes center-glow {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3);
  }
}

@keyframes shimmer-sweep {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Individual rainbow pulse animations for layered effect */
@keyframes rainbow-pulse-0 {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes rainbow-pulse-1 {
  0%, 100% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.95); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
}

@keyframes rainbow-pulse-2 {
  0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.9); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
}

@keyframes rainbow-pulse-3 {
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.85); }
  50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.95); }
}

@keyframes rainbow-pulse-4 {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.8); }
  50% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
}

@keyframes rainbow-pulse-5 {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.75); }
  50% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.85); }
}

@keyframes rainbow-pulse-6 {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.7); }
  50% { opacity: 0.2; transform: translate(-50%, -50%) scale(0.8); }
}

/* Segment-specific animations */
.rainbow-segment {
  animation: segment-glow 2s ease-in-out infinite;
}

.rainbow-segment:nth-child(1) { animation-delay: 0s; }
.rainbow-segment:nth-child(2) { animation-delay: 0.1s; }
.rainbow-segment:nth-child(3) { animation-delay: 0.2s; }
.rainbow-segment:nth-child(4) { animation-delay: 0.3s; }
.rainbow-segment:nth-child(5) { animation-delay: 0.4s; }
.rainbow-segment:nth-child(6) { animation-delay: 0.5s; }
.rainbow-segment:nth-child(7) { animation-delay: 0.6s; }

@keyframes segment-glow {
  0%, 100% {
    opacity: 0.8;
    box-shadow: 0 0 4px currentColor;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 8px currentColor;
  }
}

/* Special effects */
.rainbow-particle.burst .rainbow-inner {
  animation: rainbow-burst 1s ease-out forwards;
}

@keyframes rainbow-burst {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.5) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(2) rotate(360deg);
    opacity: 0;
  }
}

.rainbow-particle.spiral .rainbow-inner {
  animation: rainbow-spiral 3s ease-in-out infinite;
}

@keyframes rainbow-spiral {
  0% {
    transform: scale(1) rotate(0deg);
    border-radius: 50%;
  }
  25% {
    transform: scale(0.8) rotate(90deg);
    border-radius: 40% 60% 80% 20%;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    border-radius: 50%;
  }
  75% {
    transform: scale(0.9) rotate(270deg);
    border-radius: 60% 40% 20% 80%;
  }
  100% {
    transform: scale(1) rotate(360deg);
    border-radius: 50%;
  }
}

/* Interactive hover effects */
.rainbow-particle:hover .rainbow-inner {
  animation: rainbow-hover 0.5s ease-out;
}

@keyframes rainbow-hover {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.2);
    filter: brightness(1.3);
  }
  100% {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
}

/* Size variants */
.rainbow-particle.small .rainbow-center {
  width: 25%;
  height: 25%;
}

.rainbow-particle.large .rainbow-center {
  width: 35%;
  height: 35%;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .rainbow-particle *,
  .rainbow-particle::before,
  .rainbow-particle::after {
    animation: none !important;
  }
  
  .rainbow-inner {
    background: linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3) !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .rainbow-inner {
    border: 2px solid #FFFFFF;
  }
  
  .rainbow-center {
    background-color: #000000 !important;
  }
}

/* Performance optimization for mobile */
@media (max-width: 768px) {
  .rainbow-particle {
    transform: translateZ(0); /* Enable hardware acceleration */
  }
  
  .rainbow-inner {
    backface-visibility: hidden;
  }
}</style> 