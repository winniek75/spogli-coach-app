// AudioManager.js - 無効化版（エラー対策）
class AudioManager {
  constructor() {
    this.audioContext = null
    this.soundEffects = new Map()
    this.isEnabled = false // 音声を無効化
    this.volume = 0.7
    this.isInitialized = true // 初期化済みとして扱う

    // 音声ファイルは読み込まない（エラー回避）
    this.soundFiles = {}

    console.log('🔇 AudioManager initialized in silent mode (error prevention)')
  }

  async init() {
    try {
      // 音声初期化をスキップ
      console.log('🔇 Audio initialization skipped for stability')
      this.isInitialized = true
      return Promise.resolve()
    } catch (error) {
      console.warn('AudioManager initialization failed:', error)
      this.isInitialized = false
    }
  }

  async preloadSounds() {
    // 音声読み込みをスキップ（エラー回避）
    console.log('🔇 Sound preloading skipped')
    return Promise.resolve()
  }

  createFallbackSound(key) {
    // フォールバック音声も無効化
    const dummySound = {
      play: () => {
        console.log(`🔇 [Silent] ${key} sound`)
        return Promise.resolve()
      }
    }
    this.soundEffects.set(key, dummySound)
  }

  playTone(frequency, duration) {
    // トーン再生も無効化
    console.log(`🔇 [Silent] Tone: ${frequency}Hz for ${duration}s`)
  }

  async play(soundKey) {
    // 音声再生を無効化
    console.log(`🔇 [Silent] Playing: ${soundKey}`)
    return Promise.resolve()
  }

  async playSequence(soundKeys, interval = 200) {
    // 音声シーケンス再生を無効化
    console.log(`🔇 [Silent] Playing sequence: ${soundKeys.join(', ')}`)
    return Promise.resolve()
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    console.log(`🔇 [Silent] Volume set to: ${this.volume}`)
  }

  setEnabled(enabled) {
    this.isEnabled = false // 常に無効
    console.log(`🔇 [Silent] Audio remains disabled for stability`)
  }

  async playCombo(comboCount) {
    console.log(`🔇 [Silent] Combo sound: ${comboCount}`)
    return Promise.resolve()
  }

  async playCorrect(level = 1) {
    console.log(`🔇 [Silent] Correct sound (level ${level})`)
    return Promise.resolve()
  }

  async initializeOnUserGesture() {
    console.log('🔇 [Silent] User gesture audio initialization skipped')
    return Promise.resolve()
  }

  destroy() {
    console.log('🔇 AudioManager destroyed (silent mode)')
    this.soundEffects.clear()
  }

  // 追加のメソッド（互換性のため）
  playIncorrect() {
    console.log('🔇 [Silent] Incorrect sound')
    return Promise.resolve()
  }

  playClick() {
    console.log('🔇 [Silent] Click sound')
    return Promise.resolve()
  }

  playHover() {
    console.log('🔇 [Silent] Hover sound')
    return Promise.resolve()
  }

  playGameStart() {
    console.log('🔇 [Silent] Game start sound')
    return Promise.resolve()
  }

  playGameEnd() {
    console.log('🔇 [Silent] Game end sound')
    return Promise.resolve()
  }

  playSuccess() {
    console.log('🔇 [Silent] Success sound')
    return Promise.resolve()
  }

  playFail() {
    console.log('🔇 [Silent] Fail sound')
    return Promise.resolve()
  }

  speak(text) {
    console.log(`🔇 [Silent] TTS: ${text}`)
    return Promise.resolve()
  }

  playNotification() {
    console.log('🔇 [Silent] Notification sound')
    return Promise.resolve()
  }

  playLevelUp() {
    console.log('🔇 [Silent] Level up sound')
    return Promise.resolve()
  }

  playStar() {
    console.log('🔇 [Silent] Star sound')
    return Promise.resolve()
  }

  playCountdown() {
    console.log('🔇 [Silent] Countdown sound')
    return Promise.resolve()
  }
}

// シングルトンインスタンス（無効化版）
const audioManager = new AudioManager()

export default audioManager