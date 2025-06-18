import { ref } from 'vue'

export function useParticleEffects() {
  const showParticles = ref(false)
  const particleType = ref('stars')
  const particleColor = ref('gold')
  const particleCount = ref(15)

  const triggerSuccessEffect = () => {
    showParticles.value = true
    particleType.value = 'stars'
    particleColor.value = 'gold'
    particleCount.value = 20
  }

  const triggerErrorEffect = () => {
    showParticles.value = true
    particleType.value = 'explosion'
    particleColor.value = 'red'
    particleCount.value = 10
  }

  const triggerSpecialEffect = (type = 'sparkles', color = 'rainbow') => {
    showParticles.value = true
    particleType.value = type
    particleColor.value = color
    particleCount.value = 25
  }

  const stopParticles = () => {
    showParticles.value = false
  }

  return {
    showParticles,
    particleType,
    particleColor,
    particleCount,
    triggerSuccessEffect,
    triggerErrorEffect,
    triggerSpecialEffect,
    stopParticles
  }
} 