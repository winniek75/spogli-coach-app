<template>
  <div class="speech-recognition">
    <button 
      @click="toggleListening" 
      :class="['mic-button', { 'listening': isListening }]"
      :disabled="!isSupported"
    >
      <span class="mic-icon">🎤</span>
      {{ buttonText }}
    </button>
    <div v-if="isListening" class="listening-indicator">
      <div class="pulse"></div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SpeechRecognition',
  props: {
    language: {
      type: String,
      default: 'ja-JP'
    },
    continuous: {
      type: Boolean,
      default: false
    },
    interimResults: {
      type: Boolean,
      default: false
    }
  },
  emits: ['result', 'error', 'start', 'end'],
  setup(props, { emit }) {
    const recognition = ref(null)
    const isListening = ref(false)
    const isSupported = ref(false)
    const error = ref('')

    const buttonText = computed(() => {
      if (!isSupported.value) return '音声認識はサポートされていません'
      return isListening.value ? '停止' : '開始'
    })

    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window) {
        recognition.value = new webkitSpeechRecognition()
        recognition.value.lang = props.language
        recognition.value.continuous = props.continuous
        recognition.value.interimResults = props.interimResults

        recognition.value.onstart = () => {
          isListening.value = true
          emit('start')
        }

        recognition.value.onend = () => {
          isListening.value = false
          emit('end')
        }

        recognition.value.onresult = (event) => {
          const result = event.results[event.results.length - 1]
          const transcript = result[0].transcript
          emit('result', {
            transcript,
            isFinal: result.isFinal
          })
        }

        recognition.value.onerror = (event) => {
          error.value = `エラーが発生しました: ${event.error}`
          emit('error', event.error)
        }

        isSupported.value = true
      } else {
        error.value = 'このブラウザは音声認識をサポートしていません'
        isSupported.value = false
      }
    }

    const toggleListening = () => {
      if (!isSupported.value) return

      if (isListening.value) {
        recognition.value.stop()
      } else {
        recognition.value.start()
      }
    }

    onMounted(() => {
      initSpeechRecognition()
    })

    onUnmounted(() => {
      if (recognition.value) {
        recognition.value.stop()
      }
    })

    return {
      isListening,
      isSupported,
      error,
      buttonText,
      toggleListening
    }
  }
}
</script>

<style scoped>
.speech-recognition {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.mic-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  border: none;
  background-color: #4CAF50;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mic-button:hover:not(:disabled) {
  background-color: #45a049;
}

.mic-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.mic-button.listening {
  background-color: #f44336;
  animation: pulse 1.5s infinite;
}

.mic-icon {
  font-size: 1.2rem;
}

.listening-indicator {
  position: relative;
  width: 2rem;
  height: 2rem;
}

.pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #f44336;
  border-radius: 50%;
  opacity: 0.6;
  animation: pulse 1.5s infinite;
}

.error-message {
  color: #f44336;
  font-size: 0.9rem;
  text-align: center;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}
</style> 