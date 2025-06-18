import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audioStore', () => {
  const settings = ref({
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

  const audioManager = ref(null)

  function setAudioManager(manager) {
    audioManager.value = manager
  }

  function playCorrect() {
    audioManager.value?.playCorrect?.()
  }
  function playIncorrect() {
    audioManager.value?.playIncorrect?.()
  }
  function playSuccess() {
    audioManager.value?.playSuccess?.()
  }
  function playFail() {
    audioManager.value?.playFail?.()
  }
  function playClick() {
    audioManager.value?.playClick?.()
  }
  function playHover() {
    audioManager.value?.playHover?.()
  }
  function playNotification() {
    audioManager.value?.playNotification?.()
  }
  function playLevelUp() {
    audioManager.value?.playLevelUp?.()
  }
  function playStar() {
    audioManager.value?.playStar?.()
  }
  function playCountdown() {
    audioManager.value?.playCountdown?.()
  }
  function playGameStart() {
    audioManager.value?.playGameStart?.()
  }
  function playGameEnd() {
    audioManager.value?.playGameEnd?.()
  }
  function speak(text) {
    audioManager.value?.speak?.(text)
  }

  return {
    settings,
    audioManager,
    setAudioManager,
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
    speak
  }
}) 