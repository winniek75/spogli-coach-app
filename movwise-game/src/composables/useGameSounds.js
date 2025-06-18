// src/composables/useGameSounds.js - 完全自動生成版音響システム
import { ref, onMounted, onUnmounted } from 'vue'

export function useGameSounds() {
  const isEnabled = ref(true)
  const volume = ref(0.7)
  const audioContext = ref(null)
  const isInitialized = ref(false)
  const bgmAudio = ref(null)
  const bgmOscillators = ref([])

  // 音響パラメータ定義（すべて自動生成）
  const soundDefinitions = {
    // 効果音
    whoosh: {
      type: 'sweep',
      startFreq: 200,
      endFreq: 800,
      duration: 600,
      waveType: 'sawtooth',
      description: '単語飛来音 "ヒュー"'
    },
    correct: {
      type: 'chord',
      frequencies: [523, 659, 784], // C-E-G
      duration: 400,
      waveType: 'sine',
      description: '正解音（和音）'
    },
    incorrect: {
      type: 'buzz',
      frequency: 150,
      duration: 600,
      waveType: 'square',
      description: '不正解音（ブザー）'
    },
    click: {
      type: 'pop',
      frequency: 800,
      duration: 80,
      waveType: 'sine',
      description: 'ボタンクリック音'
    },
    countdown: {
      type: 'beep',
      frequency: 880,
      duration: 150,
      waveType: 'square',
      description: 'カウントダウン音'
    },
    gameStart: {
      type: 'fanfare',
      frequencies: [523, 659, 784, 1047], // C-E-G-C
      duration: 800,
      waveType: 'triangle',
      description: 'ゲーム開始ファンファーレ'
    },
    gameEnd: {
      type: 'descend',
      startFreq: 800,
      endFreq: 200,
      duration: 1000,
      waveType: 'sine',
      description: 'ゲーム終了音'
    },
    combo: {
      type: 'sparkle',
      frequencies: [1047, 1319, 1568], // C-E-G（高音）
      duration: 250,
      waveType: 'sine',
      description: 'コンボ音（キラキラ）'
    },
    levelUp: {
      type: 'achievement',
      frequencies: [523, 659, 784, 1047, 1319], // 上昇音階
      duration: 600,
      waveType: 'triangle',
      description: 'レベルアップ音'
    },
    newRecord: {
      type: 'victory',
      frequencies: [1047, 1047, 1047, 1319], // 勝利音
      duration: 1200,
      waveType: 'sine',
      description: '新記録音'
    }
  }

  // BGM用の和音進行（自動生成）
  const bgmChordProgression = [
    [261, 329, 392], // C major
    [294, 369, 440], // D minor
    [330, 392, 494], // F major
    [392, 494, 587]  // G major
  ]

  // Web Audio API初期化
  const initializeAudio = async () => {
    try {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      isInitialized.value = true
      console.log('🎵 Web Audio API initialized (full auto-generation mode)')
      return true
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      return false
    }
  }

  // 基本トーン生成
  const createTone = (frequency, duration, type = 'sine', volumeMultiplier = 1) => {
    if (!audioContext.value) return Promise.resolve()

    return new Promise((resolve) => {
      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.value.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.value.currentTime)
      oscillator.type = type

      const finalVolume = volume.value * volumeMultiplier

      gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
      gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.value.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + duration / 1000)

      oscillator.start(audioContext.value.currentTime)
      oscillator.stop(audioContext.value.currentTime + duration / 1000)

      setTimeout(resolve, duration)
    })
  }

  // 周波数スイープ（ヒュー音用）
  const createSweep = (startFreq, endFreq, duration, waveType = 'sawtooth') => {
    if (!audioContext.value) return Promise.resolve()

    return new Promise((resolve) => {
      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.value.destination)

      oscillator.type = waveType
      oscillator.frequency.setValueAtTime(startFreq, audioContext.value.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.value.currentTime + duration / 1000)

      gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume.value * 0.3, audioContext.value.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + duration / 1000)

      oscillator.start(audioContext.value.currentTime)
      oscillator.stop(audioContext.value.currentTime + duration / 1000)

      setTimeout(resolve, duration)
    })
  }

  // 和音生成
  const createChord = (frequencies, duration, waveType = 'sine', volumeMultiplier = 0.6) => {
    if (!audioContext.value || !frequencies.length) return Promise.resolve()

    const promises = frequencies.map((freq, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          createTone(freq, duration, waveType, volumeMultiplier / frequencies.length)
          resolve()
        }, index * 50) // 少しずつずらして豊かな響きに
      })
    })

    return Promise.all(promises)
  }

  // 音階シーケンス生成
  const createSequence = (frequencies, noteDuration, waveType = 'sine') => {
    if (!audioContext.value) return Promise.resolve()

    return frequencies.reduce((promise, freq, index) => {
      return promise.then(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            createTone(freq, noteDuration, waveType, 0.5)
            resolve()
          }, index * (noteDuration * 0.8)) // 少し重ねる
        })
      })
    }, Promise.resolve())
  }

  // BGM生成（和音進行のループ）
  const generateBGM = () => {
    if (!audioContext.value || !isEnabled.value) return

    const playChord = (chordFreqs, duration) => {
      const oscillators = chordFreqs.map(freq => {
        const oscillator = audioContext.value.createOscillator()
        const gainNode = audioContext.value.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.value.destination)

        oscillator.frequency.setValueAtTime(freq, audioContext.value.currentTime)
        oscillator.type = 'triangle'

        gainNode.gain.setValueAtTime(volume.value * 0.1, audioContext.value.currentTime) // BGMは控えめ

        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + duration / 1000)

        return oscillator
      })

      return oscillators
    }

    const playBGMLoop = () => {
      if (!isEnabled.value) return

      bgmChordProgression.forEach((chord, index) => {
        setTimeout(() => {
          if (isEnabled.value) {
            const oscillators = playChord(chord, 2000) // 2秒間隔
            bgmOscillators.value.push(...oscillators)
          }
        }, index * 2000)
      })

      // 8秒後にループ
      setTimeout(() => {
        if (isEnabled.value) {
          playBGMLoop()
        }
      }, 8000)
    }

    playBGMLoop()
  }

  // BGM停止
  const stopBGM = () => {
    bgmOscillators.value.forEach(oscillator => {
      try {
        oscillator.stop()
      } catch (error) {
        // 既に停止済みの場合は無視
      }
    })
    bgmOscillators.value = []
  }

  // メイン音声再生関数
  const playSound = async (soundKey, options = {}) => {
    if (!isEnabled.value || !isInitialized.value) return

    const soundDef = soundDefinitions[soundKey]
    if (!soundDef) {
      console.warn(`Unknown sound: ${soundKey}`)
      return
    }

    try {
      switch (soundDef.type) {
        case 'sweep':
          await createSweep(soundDef.startFreq, soundDef.endFreq, soundDef.duration, soundDef.waveType)
          break

        case 'chord':
          await createChord(soundDef.frequencies, soundDef.duration, soundDef.waveType)
          break

        case 'buzz':
          await createTone(soundDef.frequency, soundDef.duration, soundDef.waveType, 0.4)
          break

        case 'pop':
          await createTone(soundDef.frequency, soundDef.duration, soundDef.waveType, 0.6)
          break

        case 'beep':
          await createTone(soundDef.frequency, soundDef.duration, soundDef.waveType, 0.5)
          break

        case 'fanfare':
          await createSequence(soundDef.frequencies, soundDef.duration / soundDef.frequencies.length, soundDef.waveType)
          break

        case 'descend':
          await createSweep(soundDef.startFreq, soundDef.endFreq, soundDef.duration, soundDef.waveType)
          break

        case 'sparkle':
          await createChord(soundDef.frequencies, soundDef.duration, soundDef.waveType, 0.4)
          break

        case 'achievement':
          await createSequence(soundDef.frequencies, soundDef.duration / soundDef.frequencies.length, soundDef.waveType)
          break

        case 'victory':
          // 勝利音は特別に豪華に
          await createChord([soundDef.frequencies[0]], 300, soundDef.waveType)
          setTimeout(() => createChord(soundDef.frequencies, soundDef.duration - 300, soundDef.waveType), 300)
          break

        default:
          await createTone(soundDef.frequency || 440, soundDef.duration || 200, soundDef.waveType || 'sine')
      }
    } catch (error) {
      console.warn(`Failed to play sound: ${soundKey}`, error)
    }
  }

  // BGM制御
  const playBGM = async () => {
    if (!isEnabled.value || !isInitialized.value) return
    stopBGM() // 既存のBGMを停止
    generateBGM()
  }

  const pauseBGM = () => stopBGM()

  // 特定ゲーム用の効果音
  const playWhoosh = () => playSound('whoosh')
  const playCorrect = () => playSound('correct')
  const playIncorrect = () => playSound('incorrect')
  const playClick = () => playSound('click')
  const playCountdown = () => playSound('countdown')
  const playGameStart = () => playSound('gameStart')
  const playGameEnd = () => playSound('gameEnd')
  const playCombo = () => playSound('combo')
  const playLevelUp = () => playSound('levelUp')
  const playNewRecord = () => playSound('newRecord')

  // 複合音効果
  const playCorrectCombo = async (comboCount) => {
    await playCorrect()
    if (comboCount >= 5) {
      setTimeout(() => playCombo(), 200)
    }
    if (comboCount >= 10) {
      setTimeout(() => playLevelUp(), 400)
    }
    if (comboCount >= 20) {
      setTimeout(() => playNewRecord(), 600)
    }
  }

  // 動的音効果（単語の難易度によって音を変える）
  const playWordAppear = (difficulty = 1) => {
    const difficultySettings = {
      1: { startFreq: 200, endFreq: 600 },  // 簡単：低い音
      2: { startFreq: 300, endFreq: 800 },  // 普通：中くらいの音
      3: { startFreq: 400, endFreq: 1000 }  // 難しい：高い音
    }

    const setting = difficultySettings[difficulty] || difficultySettings[2]
    createSweep(setting.startFreq, setting.endFreq, 600, 'sawtooth')
  }

  // 音量制御
  const setVolume = (newVolume) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
  }

  const toggleSound = () => {
    isEnabled.value = !isEnabled.value
    if (!isEnabled.value) {
      stopBGM()
    }
  }

  // ユーザージェスチャー後の初期化
  const enableAudioOnUserGesture = async () => {
    if (!isInitialized.value) {
      await initializeAudio()
    }

    if (audioContext.value && audioContext.value.state === 'suspended') {
      await audioContext.value.resume()
    }
  }

  // テスト用サウンドプレビュー
  const testAllSounds = async () => {
    console.log('🎵 Testing all generated sounds...')

    for (const [soundKey, soundDef] of Object.entries(soundDefinitions)) {
      console.log(`🔊 Playing: ${soundKey} - ${soundDef.description}`)
      await playSound(soundKey)
      await new Promise(resolve => setTimeout(resolve, 800)) // 間隔を空ける
    }

    console.log('✅ Sound test completed')
  }

  // サウンド一覧取得
  const getSoundList = () => {
    return Object.entries(soundDefinitions).map(([key, def]) => ({
      key,
      description: def.description,
      type: def.type
    }))
  }

  // ライフサイクル
  onMounted(() => {
    // ユーザーの最初のクリックで音声を有効化
    const enableAudio = () => {
      enableAudioOnUserGesture()
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }

    document.addEventListener('click', enableAudio, { once: true })
    document.addEventListener('touchstart', enableAudio, { once: true })
  })

  onUnmounted(() => {
    stopBGM()
    if (audioContext.value) {
      audioContext.value.close()
    }
  })

  return {
    // 状態
    isEnabled,
    volume,
    isInitialized,

    // 制御
    initializeAudio,
    enableAudioOnUserGesture,
    setVolume,
    toggleSound,

    // BGM
    playBGM,
    pauseBGM,
    stopBGM,

    // 効果音
    playSound,
    playWhoosh,
    playCorrect,
    playIncorrect,
    playClick,
    playCountdown,
    playGameStart,
    playGameEnd,
    playCombo,
    playLevelUp,
    playNewRecord,

    // 特殊効果
    playCorrectCombo,
    playWordAppear,

    // 開発・テスト用
    testAllSounds,
    getSoundList,
    createTone,
    createSweep,
    createChord
  }
}