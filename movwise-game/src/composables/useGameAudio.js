// src/composables/useGameAudio.js - 完全版（エラー対策）
import { ref, reactive, computed, onMounted, onUnmounted, readonly } from 'vue'

export function useGameAudio() {
  // === リアクティブな状態 ===
  const isPlaying = ref(false)
  const currentVolume = ref(1.0)
  const audioError = ref(null)
  const isInitialized = ref(false)
  const contextState = ref('disabled')

  const supportedFeatures = reactive({
    speechSynthesis: false,
    webAudio: false,
    audioContext: false
  })

  // === 設定値 ===
  const soundEnabled = computed(() => true) // 音声機能を有効化
  const vibrationEnabled = computed(() => true) // バイブレーションは有効
  const autoPlayEnabled = computed(() => true) // 自動再生は有効

  // === 効果音の種類定義（ファイルパスなし） ===
  const effectSounds = {
    correct: {
      type: 'success',
      frequency: 880,
      duration: 300,
      color: '#10B981'
    },
    incorrect: {
      type: 'error',
      frequency: 220,
      duration: 500,
      color: '#EF4444'
    },
    complete: {
      type: 'celebration',
      frequency: 660,
      duration: 800,
      color: '#8B5CF6'
    },
    button: {
      type: 'interaction',
      frequency: 440,
      duration: 100,
      color: '#3B82F6'
    },
    levelUp: {
      type: 'achievement',
      frequency: 800,
      duration: 600,
      color: '#10B981'
    },
    newRecord: {
      type: 'special',
      frequency: 1000,
      duration: 1000,
      color: '#F59E0B'
    },
    countdown: {
      type: 'timer',
      frequency: 600,
      duration: 200,
      color: '#6366F1'
    },
    timeWarning: {
      type: 'warning',
      frequency: 400,
      duration: 400,
      color: '#EF4444'
    },
    gameStart: {
      type: 'start',
      frequency: 800,
      duration: 500,
      color: '#10B981'
    },
    gameEnd: {
      type: 'end',
      frequency: 500,
      duration: 700,
      color: '#6B7280'
    },
    combo: {
      type: 'combo',
      frequency: 700,
      duration: 250,
      color: '#F97316'
    },
    perfectScore: {
      type: 'perfect',
      frequency: 1200,
      duration: 1200,
      color: '#FFD700'
    }
  }

  // === バイブレーションパターンの定義 ===
  const getVibrationPattern = (effectType) => {
    try {
      const patterns = {
        correct: [50],
        incorrect: [100, 50, 100],
        complete: [200, 100, 200, 100, 200],
        levelUp: [300, 100, 100, 100, 300],
        button: [25],
        combo: [30, 30, 30],
        perfectScore: [500, 100, 200, 100, 500],
        countdown: [100],
        timeWarning: [200, 100, 200],
        gameStart: [300],
        gameEnd: [400, 200, 400],
        newRecord: [300, 100, 300, 100, 300]
      }
      return patterns[effectType] || [50]
    } catch (error) {
      console.warn('Vibration pattern error:', error)
      return [50]
    }
  }

  // === 視覚的フィードバック（メイン機能） ===
  const playVisualFeedback = (soundType) => {
    try {
      const effect = effectSounds[soundType]
      if (!effect) {
        console.warn('Unknown effect type:', soundType)
        return false
      }

      // 背景色フラッシュ
      const body = document.body
      const originalBackground = body.style.background

      body.style.background = effect.color
      setTimeout(() => {
        body.style.background = originalBackground
      }, 150)

      // バイブレーション（対応デバイスのみ）
      if (vibrationEnabled.value && 'vibrate' in navigator) {
        const pattern = getVibrationPattern(soundType)
        navigator.vibrate(pattern)
      }

      console.log(`Visual feedback: ${soundType}`)
      return true

    } catch (error) {
      console.warn('Visual feedback error:', error)
      return false
    }
  }

  // === 音声機能の初期化（簡素化） ===
  const initializeAudio = async () => {
    try {
      if (isInitialized.value) return true

      // Speech Synthesis のサポート確認のみ
      supportedFeatures.speechSynthesis = 'speechSynthesis' in window

      // Web Audio API のサポート確認
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          supportedFeatures.webAudio = true
          supportedFeatures.audioContext = true
        }
      } catch (error) {
        console.warn('Web Audio API not supported:', error)
        supportedFeatures.webAudio = false
        supportedFeatures.audioContext = false
      }

      isInitialized.value = true
      contextState.value = supportedFeatures.speechSynthesis ? 'ready' : 'limited'

      console.log('Audio system initialized with speech synthesis')
      console.log('Supported features:', supportedFeatures)

      return true

    } catch (error) {
      console.error('Audio initialization failed:', error)
      audioError.value = error.message
      return false
    }
  }

  // === メイン音声再生関数 ===
  const playSound = async (type, data, options = {}) => {
    try {
      if (type === 'effect') {
        return playVisualFeedback(data)
      }

      if (type === 'word') {
        return await playWord(data)
      }

      if (type === 'phoneme') {
        return await playPhoneme(data)
      }

      console.log(`Unknown sound type: ${type} - ${data}`)
      return playVisualFeedback('button')

    } catch (error) {
      console.error('Sound playback error:', error)
      audioError.value = error.message
      return playVisualFeedback('button')
    }
  }

  // === 音素再生（無効化） ===
  const playPhoneme = async (phoneme) => {
    try {
      console.log('Phoneme playback disabled:', phoneme)
      return playVisualFeedback('button')
    } catch (error) {
      console.warn('Phoneme playback error:', error)
      return false
    }
  }

  // === 単語再生（Speech Synthesis API使用） ===
  const playWord = async (wordObj) => {
    try {
      if (!soundEnabled.value || !supportedFeatures.speechSynthesis) {
        console.log('Word playback disabled or not supported:', wordObj?.word)
        return playVisualFeedback('button')
      }

      isPlaying.value = true
      
      const word = typeof wordObj === 'string' ? wordObj : wordObj?.word
      if (!word) {
        console.warn('No word provided for playback')
        return playVisualFeedback('button')
      }

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(word)
        
        // 音声設定
        utterance.rate = 0.8 // ゆっくりと発音
        utterance.pitch = 1.0
        utterance.volume = currentVolume.value
        utterance.lang = 'en-US' // 英語の発音

        utterance.onend = () => {
          isPlaying.value = false
          console.log('Word playback completed:', word)
          resolve(true)
        }

        utterance.onerror = (error) => {
          isPlaying.value = false
          console.warn('Word playback error:', error)
          playVisualFeedback('incorrect')
          resolve(false)
        }

        utterance.onstart = () => {
          console.log('Word playback started:', word)
        }

        // 音声再生開始
        speechSynthesis.speak(utterance)
      })

    } catch (error) {
      isPlaying.value = false
      console.warn('Word playback error:', error)
      return playVisualFeedback('button')
    }
  }

  // === 効果音再生（視覚的フィードバックのみ） ===
  const playEffectSound = async (effectType, options = {}) => {
    try {
      console.log('Effect sound (visual only):', effectType)
      return playVisualFeedback(effectType)
    } catch (error) {
      console.warn('Effect sound error:', error)
      return false
    }
  }

  // === 音声シーケンス再生 ===
  const playSequence = async (sequence, options = {}) => {
    try {
      if (!Array.isArray(sequence)) {
        console.warn('Invalid sequence format')
        return false
      }

      for (const item of sequence) {
        if (item && item.type && item.data) {
          await playSound(item.type, item.data, { ...options, ...item.options })

          if (item.delay && typeof item.delay === 'number') {
            await new Promise(resolve => setTimeout(resolve, item.delay))
          }
        }
      }
      return true
    } catch (error) {
      console.warn('Sequence playback error:', error)
      return false
    }
  }

  // === 自動再生機能（無効化） ===
  const playAutoAudio = async (phoneme, word = null) => {
    try {
      console.log('Auto audio disabled:', { phoneme, word })
      return false
    } catch (error) {
      console.warn('Auto audio error:', error)
      return false
    }
  }

  // === Be Verb Rush専用：カウントダウン音声 ===
  const playCountdown = async (number) => {
    try {
      console.log('Countdown (visual only):', number)
      return playVisualFeedback('countdown')
    } catch (error) {
      console.warn('Countdown failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：ゲーム開始音 ===
  const playGameStart = async () => {
    try {
      console.log('Game start (visual only)')
      return playVisualFeedback('gameStart')
    } catch (error) {
      console.warn('Game start failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：ゲーム終了音 ===
  const playGameEnd = async (isSuccess = true) => {
    try {
      console.log('Game end (visual only):', isSuccess)
      const effectType = isSuccess ? 'complete' : 'gameEnd'
      return playVisualFeedback(effectType)
    } catch (error) {
      console.warn('Game end failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：コンボ音 ===
  const playCombo = async (comboCount) => {
    try {
      console.log('Combo (visual only):', comboCount)
      return playVisualFeedback('combo')
    } catch (error) {
      console.warn('Combo failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：時間警告音 ===
  const playTimeWarning = async () => {
    try {
      console.log('Time warning (visual only)')
      return playVisualFeedback('timeWarning')
    } catch (error) {
      console.warn('Time warning failed:', error)
      return false
    }
  }

  // === 音量制御（無効化） ===
  const setVolume = (volume) => {
    try {
      currentVolume.value = Math.max(0, Math.min(1, volume))
      console.log('Volume set (audio disabled):', currentVolume.value)
    } catch (error) {
      console.warn('Volume setting error:', error)
    }
  }

  const increaseVolume = (step = 0.1) => {
    setVolume(currentVolume.value + step)
  }

  const decreaseVolume = (step = 0.1) => {
    setVolume(currentVolume.value - step)
  }

  // === 音声設定の切り替え（無効化） ===
  const toggleSound = () => {
    try {
      console.log('Sound toggle (disabled for stability)')
    } catch (error) {
      console.warn('Sound toggle error:', error)
    }
  }

  const toggleVibration = () => {
    try {
      console.log('Vibration toggle')
      // バイブレーション設定の切り替えは実装可能
    } catch (error) {
      console.warn('Vibration toggle error:', error)
    }
  }

  const toggleAutoPlay = () => {
    try {
      console.log('Auto play toggle (disabled)')
    } catch (error) {
      console.warn('Auto play toggle error:', error)
    }
  }

  // === 音声テスト機能 ===
  const testAudio = async () => {
    try {
      console.log('Audio test (visual feedback only)')

      const testSequence = [
        { type: 'effect', data: 'button', options: { volume: 0.5 } },
        { type: 'effect', data: 'correct', delay: 300 },
        { type: 'effect', data: 'combo', delay: 500 },
        { type: 'effect', data: 'perfectScore', delay: 500 }
      ]

      await playSequence(testSequence)
      return true
    } catch (error) {
      console.warn('Audio test failed:', error)
      return false
    }
  }

  // === 音声停止 ===
  const stopAudio = () => {
    try {
      speechSynthesis.cancel() // 進行中の音声を停止
      isPlaying.value = false
      console.log('Audio stopped')
    } catch (error) {
      console.warn('Stop audio error:', error)
    }
  }

  // === 音声キューのクリア ===
  const clearAudioQueue = () => {
    try {
      console.log('Audio queue cleared')
    } catch (error) {
      console.warn('Clear audio queue error:', error)
    }
  }

  // === エラーハンドリング ===
  const handleAudioError = (error) => {
    try {
      console.error('Audio error:', error)
      audioError.value = error.message
      isPlaying.value = false

      // エラー通知として視覚的フィードバック
      playVisualFeedback('incorrect')
    } catch (fallbackError) {
      console.warn('Error handling failed:', fallbackError)
    }
  }

  // === 音声状態の取得 ===
  const getAudioStatus = () => {
    try {
      return {
        isEnabled: soundEnabled.value,
        isInitialized: isInitialized.value,
        hasError: !!audioError.value,
        error: audioError.value,
        contextState: contextState.value,
        supportedFeatures: { ...supportedFeatures },
        visualFeedbackEnabled: true
      }
    } catch (error) {
      console.warn('Get audio status error:', error)
      return {
        isEnabled: false,
        isInitialized: false,
        hasError: true,
        error: error.message,
        contextState: 'error',
        supportedFeatures: {},
        visualFeedbackEnabled: true
      }
    }
  }

  // === ユーザー操作による音声有効化 ===
  const enableAudio = async () => {
    try {
      if (!supportedFeatures.speechSynthesis) {
        console.warn('Speech synthesis not supported')
        audioError.value = 'Speech synthesis not supported'
        return false
      }

      // ユーザーインタラクションが必要な場合の処理
      if (speechSynthesis.paused) {
        speechSynthesis.resume()
      }

      console.log('Audio enabled successfully')
      audioError.value = null
      contextState.value = 'ready'
      return true
    } catch (error) {
      console.warn('Enable audio error:', error)
      audioError.value = error.message
      return false
    }
  }

  // === 音声無効化 ===
  const disableAudio = () => {
    try {
      console.log('Audio disabled')
      speechSynthesis.cancel() // 進行中の音声を停止
      stopAudio()
      contextState.value = 'disabled'
    } catch (error) {
      console.warn('Disable audio error:', error)
    }
  }

  // === オーディオコンテキスト再開（無効化） ===
  const resumeAudioContext = async () => {
    try {
      console.log('Audio context resume (disabled)')
      return false
    } catch (error) {
      console.warn('Audio context resume error:', error)
      return false
    }
  }

  // === ライフサイクル ===
  onMounted(async () => {
    try {
      await initializeAudio()
      console.log('✅ useGameAudio mounted successfully (visual feedback mode)')
    } catch (error) {
      console.warn('Audio mount error:', error)
      handleAudioError(error)
    }
  })

  onUnmounted(() => {
    try {
      stopAudio()
      clearAudioQueue()
      console.log('✅ useGameAudio unmounted successfully')
    } catch (error) {
      console.warn('Audio unmount error:', error)
    }
  })

  // === 公開API ===
  return {
    // 状態
    isPlaying: readonly(isPlaying),
    currentVolume: readonly(currentVolume),
    audioError: readonly(audioError),
    supportedFeatures: readonly(supportedFeatures),
    soundEnabled,
    vibrationEnabled,
    autoPlayEnabled,

    // 音声再生（すべて視覚的フィードバックのみ）
    playSound,
    playPhoneme,
    playWord,
    playEffectSound,
    playSequence,
    playAutoAudio,

    // Be Verb Rush専用音声（すべて視覚的フィードバックのみ）
    playCountdown,
    playGameStart,
    playGameEnd,
    playCombo,
    playTimeWarning,

    // 制御
    setVolume,
    increaseVolume,
    decreaseVolume,
    toggleSound,
    toggleVibration,
    toggleAutoPlay,
    stopAudio,
    clearAudioQueue,
    enableAudio,
    disableAudio,

    // テスト・デバッグ
    testAudio,
    initializeAudio,
    getAudioStatus,

    // エラーハンドリング
    handleAudioError,

    // ユーティリティ
    resumeAudioContext,
    playVisualFeedback
  }
}