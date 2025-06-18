// src/main.js - Vue.jsアプリケーションのメインファイル（音声エラー対策版）
import { createApp, nextTick } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// === 音声システム完全無効化（エラー対策） ===
console.log('🔇 Initializing MovWISE in silent mode for stability')

// Pinia永続化プラグイン（条件付きインポート）
let piniaPluginPersistedstate = null
try {
  const persistedstateModule = await import('pinia-plugin-persistedstate')
  piniaPluginPersistedstate = persistedstateModule.default || persistedstateModule
} catch (error) {
  console.warn('pinia-plugin-persistedstate not installed, using memory storage only')
}

// IPA Audio Serviceは無効化（エラー回避）
console.log('🔇 IPA Audio Service disabled for stability')

// AudioManagerは無効化版を使用
let AudioManager = null
try {
  const audioManagerModule = await import('./utils/AudioManager.js')
  AudioManager = audioManagerModule.default || audioManagerModule
  console.log('🔇 AudioManager loaded in silent mode')
} catch (error) {
  console.warn('AudioManager not found, creating dummy')

  // ダミーAudioManagerを作成
  AudioManager = {
    isInitialized: true,
    isEnabled: false,
    init: () => Promise.resolve(),
    play: () => Promise.resolve(),
    playCorrect: () => Promise.resolve(),
    playIncorrect: () => Promise.resolve(),
    playClick: () => Promise.resolve(),
    playHover: () => Promise.resolve(),
    playGameStart: () => Promise.resolve(),
    playGameEnd: () => Promise.resolve(),
    playSuccess: () => Promise.resolve(),
    playFail: () => Promise.resolve(),
    playNotification: () => Promise.resolve(),
    playLevelUp: () => Promise.resolve(),
    playStar: () => Promise.resolve(),
    playCountdown: () => Promise.resolve(),
    speak: () => Promise.resolve(),
    setVolume: () => { },
    setEnabled: () => { },
    destroy: () => { }
  }
}

// Tailwind CSS（条件付きインポート）
try {
  await import('./assets/styles/main.css')
} catch (error) {
  console.warn('main.css not found, using default styles')
}

// 宇宙テーマCSS
try {
  await import('./assets/css/cosmic-theme.css')
  console.log('✨ Cosmic theme CSS loaded successfully')
} catch (error) {
  console.warn('cosmic-theme.css not found, using default theme')
}

// モーダルコンポーネントのインポート（条件付き）
let GameSelectionModal, SettingsModal, StatsModal
try {
  GameSelectionModal = (await import('@/components/games/grammar-galaxy/shared/GameSelectionModal.vue')).default
  SettingsModal = (await import('@/components/games/grammar-galaxy/shared/SettingsModal.vue')).default
  StatsModal = (await import('@/components/games/grammar-galaxy/shared/StatsModal.vue')).default
} catch (error) {
  console.warn('Modal components not found, using fallbacks')

  // ダミーコンポーネント
  const DummyModal = { template: '<div>Modal not available</div>' }
  GameSelectionModal = DummyModal
  SettingsModal = DummyModal
  StatsModal = DummyModal
}

// アプリケーション作成
const app = createApp(App)

// Pinia ストア設定
const pinia = createPinia()
if (piniaPluginPersistedstate) {
  pinia.use(piniaPluginPersistedstate)
}
app.use(pinia)

// Vue Router
app.use(router)

// === AudioManager無効化初期化（エラー対策版） ===
const initializeAudioManager = async () => {
  try {
    console.log('🔇 Initializing AudioManager in silent mode...')

    // AudioStoreを取得してダミーAudioManagerを設定
    const { useAudioStore } = await import('@/stores/audioStore.js')
    const audioStore = useAudioStore()

    // ダミーAudioManagerを設定（エラー回避）
    const dummyAudioManager = {
      play: (sound) => {
        console.log(`🔇 [Silent] ${sound}`)
        return Promise.resolve()
      },
      playCorrect: () => {
        console.log('🔇 [Silent] Correct sound')
        return Promise.resolve()
      },
      playIncorrect: () => {
        console.log('🔇 [Silent] Incorrect sound')
        return Promise.resolve()
      },
      playClick: () => {
        console.log('🔇 [Silent] Click sound')
        return Promise.resolve()
      },
      playHover: () => {
        console.log('🔇 [Silent] Hover sound')
        return Promise.resolve()
      },
      playGameStart: () => {
        console.log('🔇 [Silent] Game start sound')
        return Promise.resolve()
      },
      playGameEnd: () => {
        console.log('🔇 [Silent] Game end sound')
        return Promise.resolve()
      },
      playSuccess: () => {
        console.log('🔇 [Silent] Success sound')
        return Promise.resolve()
      },
      playFail: () => {
        console.log('🔇 [Silent] Fail sound')
        return Promise.resolve()
      },
      playNotification: () => {
        console.log('🔇 [Silent] Notification sound')
        return Promise.resolve()
      },
      playLevelUp: () => {
        console.log('🔇 [Silent] Level up sound')
        return Promise.resolve()
      },
      playStar: () => {
        console.log('🔇 [Silent] Star sound')
        return Promise.resolve()
      },
      playCountdown: () => {
        console.log('🔇 [Silent] Countdown sound')
        return Promise.resolve()
      },
      speak: (text) => {
        console.log(`🔇 [Silent] TTS: ${text}`)
        return Promise.resolve()
      },
      setVolume: (volume) => {
        console.log(`🔇 [Silent] Volume: ${volume}`)
      },
      setEnabled: (enabled) => {
        console.log(`🔇 [Silent] Enabled: ${enabled}`)
      }
    }

    audioStore.setAudioManager(dummyAudioManager)
    console.log('✅ Dummy AudioManager initialized successfully')

  } catch (error) {
    console.warn('⚠️ AudioManager initialization failed:', error)
  }
}

// ユーザージェスチャー処理は無効化（エラー回避）
const enableAudioOnUserGesture = () => {
  console.log('🔇 User gesture audio enablement disabled')
}

// グローバルプロパティ設定
app.config.globalProperties.$version = '1.0.0'
app.config.globalProperties.$appName = 'MovWISE'

// エラーハンドリング（音声関連エラーを無視）
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error handler:', err, info)

  // 音声関連のエラーは完全に無視
  if (err.message && (
    err.message.includes('AudioManager') ||
    err.message.includes('audio') ||
    err.message.includes('Audio') ||
    err.message.includes('sound') ||
    err.message.includes('Sound') ||
    err.message.includes('timeout') ||
    err.message.includes('loading')
  )) {
    console.log('🔇 Audio error ignored:', err.message)
    return // エラーを無視
  }

  // 開発環境では詳細表示
  if (import.meta.env.DEV) {
    console.error('Component instance:', instance)
  }
}

// 警告ハンドリング（開発環境のみ）
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    // 音声関連の警告も無視
    if (msg.includes('audio') || msg.includes('Audio') || msg.includes('sound')) {
      return
    }
    console.warn('Vue warning:', msg, trace)
  }
  app.config.performance = true
}

// アプリケーション情報をコンソールに表示
console.log(`
🎮 MovWISE - 身体で覚える英語学習アプリ
📱 Version: ${app.config.globalProperties.$version}
🌐 Environment: ${import.meta.env.MODE}
🔧 Vue Version: ${app.version}
🔇 Audio: Silent Mode (Error Prevention)
`)

// グローバルコンポーネント登録
if (GameSelectionModal) app.component('GameSelectionModal', GameSelectionModal)
if (SettingsModal) app.component('SettingsModal', SettingsModal)
if (StatsModal) app.component('StatsModal', StatsModal)

// DOM準備後にマウント
app.mount('#app')

// AudioManager初期化実行（アプリマウント後）
nextTick(() => {
  // AudioManager初期化（音声無効版）
  setTimeout(initializeAudioManager, 100)
})

// 開発環境用テストデータ初期化（アプリマウント後に実行）
if (import.meta.env.DEV) {
  nextTick(() => {
    setTimeout(async () => {
      try {
        const { useGrammarGalaxyStore } = await import('@/stores/grammarGalaxyStore')
        const { useSoundAdventureStore } = await import('@/stores/soundAdventureAPI')
        const grammarStore = useGrammarGalaxyStore()
        const soundStore = useSoundAdventureStore()

        if (typeof soundStore.generateTestData === 'function') {
          soundStore.generateTestData()
        }

        if (typeof grammarStore.initializeFromSoundAdventure === 'function' &&
          typeof soundStore.getCompletionData === 'function') {
          grammarStore.initializeFromSoundAdventure(soundStore.getCompletionData())
        }

        console.log('✅ Test data initialized successfully')
      } catch (error) {
        console.warn('⚠️ Could not initialize test data:', error)
      }
    }, 500)
  })

  // 開発環境用デバッグツール（音声無効版）
  setTimeout(() => {
    window.testAudio = {
      playCorrect: () => console.log('🔇 [Debug] Correct sound'),
      playIncorrect: () => console.log('🔇 [Debug] Incorrect sound'),
      playClick: () => console.log('🔇 [Debug] Click sound'),
      speak: (text) => console.log(`🔇 [Debug] TTS: ${text}`)
    }

    console.log(`
🛠️ Development Debug Tools (Silent Mode):
  window.testAudio.playCorrect() - Log correct sound
  window.testAudio.playIncorrect() - Log incorrect sound  
  window.testAudio.speak('テスト') - Log TTS
    `)
  }, 1000)
}

// Service Worker登録（PWA対応、本番環境のみ）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

export default app