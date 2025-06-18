<template>
  <div class="game-animation" :class="animationClass">
    <slot></slot>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'GameAnimation',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['bounce', 'fade', 'slide', 'scale', 'rotate'].includes(value)
    },
    duration: {
      type: Number,
      default: 500
    },
    delay: {
      type: Number,
      default: 0
    },
    trigger: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const isAnimating = ref(false)
    const animationClass = ref('')

    const startAnimation = () => {
      isAnimating.value = true
      animationClass.value = `animate-${props.type}`
      
      setTimeout(() => {
        isAnimating.value = false
        animationClass.value = ''
      }, props.duration)
    }

    watch(() => props.trigger, (newValue) => {
      if (newValue) {
        setTimeout(startAnimation, props.delay)
      }
    })

    return {
      animationClass
    }
  }
}
</script>

<style scoped>
.game-animation {
  display: inline-block;
}

.animate-bounce {
  animation: bounce 0.5s ease infinite;
}

.animate-fade {
  animation: fade 0.5s ease;
}

.animate-slide {
  animation: slide 0.5s ease;
}

.animate-scale {
  animation: scale 0.5s ease;
}

.animate-rotate {
  animation: rotate 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes scale {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 