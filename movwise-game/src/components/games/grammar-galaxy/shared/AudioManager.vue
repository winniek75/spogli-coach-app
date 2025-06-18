<template>
  <div class="audio-manager" v-show="false">
    <!-- Hidden audio elements for sound effects -->
    <audio
      v-for="(sound, key) in soundEffects"
      :key="key"
      :ref="el => setSoundRef(key, el)"
      :src="sound.src"
      :loop="sound.loop"
      :volume="sound.volume * masterVolume * effectsVolume"
      preload="auto"
      @loadeddata="onSoundLoaded(key)"
      @error="onSoundError(key)"
    ></audio>

    <!-- Background music -->
    <audio
      v-if="currentBgm"
      ref="bgmPlayer"
      :src="currentBgm.src"
      :loop="true"
      :volume="currentBgm.volume * masterVolume * musicVolume"
      preload="auto"
      @loadeddata="onBgmLoaded"
      @error="onBgmError"
    ></audio>

    <!-- TTS synthesis (will be handled programmatically) -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  settings: {
    type: Object,
    default: () => ({
      masterVolume: 0.7,
      effectsVolume: 0.8,
      musicVolume: 0.6,
      voiceVolume: 0.9,
      enableSounds: true,
      enableMusic: true,
      enableVoice: true,
      voiceLanguage: 'en-US',
      voiceRate: 1.0,
      voicePitch: 1.0
    })
  }
})

// Emits
const emit = defineEmits([
  'audio-ready',
  'sound-played',
  'sound-error',
  'tts-start',
  'tts-end',
  'tts-error'
])

// Audio State
const soundRefs = ref({})
const bgmPlayer = ref(null)
const loadedSounds = reactive(new Set())
const isReady = ref(false)
const currentBgm = ref(null)

// TTS State
const speechSynthesis = ref(null)
const currentUtterance = ref(null)
const availableVoices = ref([])

// Volume Settings
const masterVolume = computed(() => props.settings.masterVolume || 0.7)
const effectsVolume = computed(() => props.settings.effectsVolume || 0.8)
const musicVolume = computed(() => props.settings.musicVolume || 0.6)
const voiceVolume = computed(() => props.settings.voiceVolume || 0.9)

// Enable/Disable Settings
const enableSounds = computed(() => props.settings.enableSounds !== false)
const enableMusic = computed(() => props.settings.enableMusic !== false)
const enableVoice = computed(() => props.settings.enableVoice !== false)

// Sound Effects Library
const soundEffects = reactive({
  correct: {
    src: '/sounds/correct.mp3',
    volume: 0.8,
    loop: false
  },
  incorrect: {
    src: '/sounds/incorrect.mp3',
    volume: 0.7,
    loop: false
  },
  click: {
    src: '/sounds/click.mp3',
    volume: 0.5,
    loop: false
  },
  hover: {
    src: '/sounds/hover.mp3',
    volume: 0.3,
    loop: false
  },
  success: {
    src: '/sounds/success.mp3',
    volume: 0.9,
    loop: false
  },
  fail: {
    src: '/sounds/fail.mp3',
    volume: 0.8,
    loop: false
  },
  notification: {
    src: '/sounds/notification.mp3',
    volume: 0.6,
    loop: false
  },
  levelUp: {
    src: '/sounds/level-up.mp3',
    volume: 1.0,
    loop: false
  },
  star: {
    src: '/sounds/star.mp3',
    volume: 0.7,
    loop: false
  },
  countdown: {
    src: '/sounds/countdown.mp3',
    volume: 0.8,
    loop: false
  },
  gameStart: {
    src: '/sounds/game-start.mp3',
    volume: 0.9,
    loop: false
  },
  gameEnd: {
    src: '/sounds/game-end.mp3',
    volume: 0.8,
    loop: false
  }
})

// Background Music Library
const bgmTracks = reactive({
  menu: {
    src: '/music/menu-theme.mp3',
    volume: 0.4
  },
  game: {
    src: '/music/game-theme.mp3',
    volume: 0.3
  },
  victory: {
    src: '/music/victory-theme.mp3',
    volume: 0.5
  },
  space: {
    src: '/music/space-ambient.mp3',
    volume: 0.2
  }
})

// Methods
const setSoundRef = (key, el) => {
  if (el) {
    soundRefs.value[key] = el
  }
}

const onSoundLoaded = (key) => {
  loadedSounds.add(key)
  checkIfReady()
}

const onSoundError = (key) => {
  console.warn(`Failed to load sound: ${key}`)
  emit('sound-error', key)
}

const onBgmLoaded = () => {
  if (enableMusic.value && currentBgm.value) {
    bgmPlayer.value?.play()?.catch(console.warn)
  }
}

const onBgmError = () => {
  console.warn('Failed to load background music')
}

const checkIfReady = () => {
  const totalSounds = Object.keys(soundEffects).length
  if (loadedSounds.size >= totalSounds && !isReady.value) {
    isReady.value = true
    emit('audio-ready')
  }
}

// Public Methods
const playSound = (soundName, options = {}) => {
  if (!enableSounds.value || !soundRefs.value[soundName]) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    try {
      const audio = soundRefs.value[soundName]
      const volume = (options.volume || soundEffects[soundName]?.volume || 0.5)
      
      audio.volume = volume * masterVolume.value * effectsVolume.value
      audio.currentTime = 0
      
      const playPromise = audio.play()
      
      if (playPromise) {
        playPromise
          .then(() => {
            emit('sound-played', soundName)
            resolve()
          })
          .catch(reject)
      } else {
        emit('sound-played', soundName)
        resolve()
      }
    } catch (error) {
      reject(error)
    }
  })
}

const stopSound = (soundName) => {
  if (soundRefs.value[soundName]) {
    soundRefs.value[soundName].pause()
    soundRefs.value[soundName].currentTime = 0
  }
}

const playBgm = (trackName) => {
  if (!enableMusic.value || !bgmTracks[trackName]) {
    return
  }

  // Stop current BGM
  if (bgmPlayer.value) {
    bgmPlayer.value.pause()
    bgmPlayer.value.currentTime = 0
  }

  currentBgm.value = bgmTracks[trackName]
  
  // Will trigger onBgmLoaded when ready
}

const stopBgm = () => {
  if (bgmPlayer.value) {
    bgmPlayer.value.pause()
    bgmPlayer.value.currentTime = 0
  }
  currentBgm.value = null
}

const setBgmVolume = (volume) => {
  if (bgmPlayer.value) {
    bgmPlayer.value.volume = volume * masterVolume.value * musicVolume.value
  }
}

// Text-to-Speech Methods
const initializeTTS = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.value = window.speechSynthesis
    
    // Load voices
    const loadVoices = () => {
      availableVoices.value = speechSynthesis.value.getVoices()
    }
    
    loadVoices()
    speechSynthesis.value.addEventListener('voiceschanged', loadVoices)
  }
}

const speak = (text, options = {}) => {
  if (!enableVoice.value || !speechSynthesis.value || !text) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    try {
      // Cancel any ongoing speech
      speechSynthesis.value.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set voice options
      utterance.volume = (options.volume || 1) * masterVolume.value * voiceVolume.value
      utterance.rate = options.rate || props.settings.voiceRate || 1.0
      utterance.pitch = options.pitch || props.settings.voicePitch || 1.0
      
      // Select voice
      const language = options.language || props.settings.voiceLanguage || 'en-US'
      const voice = availableVoices.value.find(v => v.lang.startsWith(language))
      if (voice) {
        utterance.voice = voice
      }
      
      // Event handlers
      utterance.onstart = () => {
        currentUtterance.value = utterance
        emit('tts-start', text)
      }
      
      utterance.onend = () => {
        currentUtterance.value = null
        emit('tts-end', text)
        resolve()
      }
      
      utterance.onerror = (event) => {
        currentUtterance.value = null
        emit('tts-error', event.error)
        reject(new Error(event.error))
      }
      
      // Speak
      speechSynthesis.value.speak(utterance)
      
    } catch (error) {
      reject(error)
    }
  })
}

const stopSpeech = () => {
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel()
    currentUtterance.value = null
  }
}

const isSpeaking = () => {
  return speechSynthesis.value?.speaking || false
}

// Convenience Methods
const playCorrect = () => playSound('correct')
const playIncorrect = () => playSound('incorrect')
const playSuccess = () => playSound('success')
const playFail = () => playSound('fail')
const playClick = () => playSound('click')
const playHover = () => playSound('hover')
const playNotification = () => playSound('notification')
const playLevelUp = () => playSound('levelUp')
const playStar = () => playSound('star')
const playCountdown = () => playSound('countdown')
const playGameStart = () => playSound('gameStart')
const playGameEnd = () => playSound('gameEnd')

// Audio Context Management (for better mobile support)
const audioContext = ref(null)
const unlockAudio = () => {
  if (!audioContext.value) {
    try {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.warn('AudioContext not supported')
    }
  }
  
  if (audioContext.value?.state === 'suspended') {
    audioContext.value.resume()
  }
}

// Volume Management
const updateAllVolumes = () => {
  // Update sound effects volume
  Object.keys(soundRefs.value).forEach(key => {
    const audio = soundRefs.value[key]
    if (audio && soundEffects[key]) {
      audio.volume = soundEffects[key].volume * masterVolume.value * effectsVolume.value
    }
  })
  
  // Update BGM volume
  if (bgmPlayer.value && currentBgm.value) {
    bgmPlayer.value.volume = currentBgm.value.volume * masterVolume.value * musicVolume.value
  }
}

// Watchers
watch([masterVolume, effectsVolume, musicVolume], updateAllVolumes)

watch(enableMusic, (newValue) => {
  if (!newValue && bgmPlayer.value) {
    bgmPlayer.value.pause()
  } else if (newValue && currentBgm.value && bgmPlayer.value) {
    bgmPlayer.value.play().catch(console.warn)
  }
})

// User Interaction Handler (for mobile audio unlock)
const handleUserInteraction = () => {
  unlockAudio()
  document.removeEventListener('touchstart', handleUserInteraction)
  document.removeEventListener('click', handleUserInteraction)
}

// Lifecycle
onMounted(() => {
  initializeTTS()
  
  // Mobile audio unlock
  document.addEventListener('touchstart', handleUserInteraction)
  document.addEventListener('click', handleUserInteraction)
})

onUnmounted(() => {
  stopBgm()
  stopSpeech()
  
  // Cleanup
  document.removeEventListener('touchstart', handleUserInteraction)
  document.removeEventListener('click', handleUserInteraction)
  
  if (speechSynthesis.value) {
    speechSynthesis.value.removeEventListener('voiceschanged', () => {})
  }
})

// Expose methods to parent components
defineExpose({
  // Sound Effects
  playSound,
  stopSound,
  playCorrect,
  playIncorrect,
  playSuccess,
  playFail,
  playClick,
  playHover,
  playNotification,
  playLevelUp,
  playStar,
  playCountdown,
  playGameStart,
  playGameEnd,
  
  // Background Music
  playBgm,
  stopBgm,
  setBgmVolume,
  
  // Text-to-Speech
  speak,
  stopSpeech,
  isSpeaking,
  
  // State
  isReady,
  availableVoices,
  
  // Utility
  unlockAudio
})
</script>

<style scoped>
.audio-manager {
  @apply hidden;
}
</style>