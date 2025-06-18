// src/services/advancedAudioService.js - 高度な音声実装

// オプション1: プリレコーディング音声ファイル使用
class PreRecordedAudioService {
  constructor() {
    this.audioCache = new Map()
    this.baseUrl = '/audio/phonemes/' // 音声ファイルのベースURL
    this.loadingPromises = new Map()
    this.supportedFormats = this.detectSupportedFormats()
    
    // 音声ファイルマッピング
    this.audioFiles = {
      // 母音
      '/æ/': { path: 'vowels/ae', example: 'cat' },
      '/eɪ/': { path: 'vowels/ei', example: 'cake' },
      '/ɑː/': { path: 'vowels/aa', example: 'car' },
      '/e/': { path: 'vowels/e', example: 'bed' },
      '/iː/': { path: 'vowels/ii', example: 'see' },
      '/ɪ/': { path: 'vowels/i', example: 'sit' },
      '/aɪ/': { path: 'vowels/ai', example: 'bike' },
      '/ɒ/': { path: 'vowels/o', example: 'hot' },
      '/əʊ/': { path: 'vowels/ou', example: 'home' },
      '/ʌ/': { path: 'vowels/uh', example: 'cup' },
      '/uː/': { path: 'vowels/uu', example: 'moon' },
      '/ʊ/': { path: 'vowels/u', example: 'book' },
      
      // 重母音
      '/aʊ/': { path: 'diphthongs/au', example: 'house' },
      '/ɔɪ/': { path: 'diphthongs/oi', example: 'boy' },
      '/eə/': { path: 'diphthongs/ea', example: 'hair' },
      '/ɪə/': { path: 'diphthongs/ia', example: 'near' },
      '/ʊə/': { path: 'diphthongs/ua', example: 'sure' },
      
      // 子音
      '/b/': { path: 'consonants/b', example: 'ball' },
      '/k/': { path: 'consonants/k', example: 'cat' },
      '/d/': { path: 'consonants/d', example: 'dog' },
      '/f/': { path: 'consonants/f', example: 'fish' },
      '/g/': { path: 'consonants/g', example: 'go' },
      '/h/': { path: 'consonants/h', example: 'hat' },
      '/dʒ/': { path: 'consonants/j', example: 'jump' },
      '/l/': { path: 'consonants/l', example: 'love' },
      '/m/': { path: 'consonants/m', example: 'man' },
      '/n/': { path: 'consonants/n', example: 'new' },
      '/p/': { path: 'consonants/p', example: 'pen' },
      '/r/': { path: 'consonants/r', example: 'red' },
      '/s/': { path: 'consonants/s', example: 'sun' },
      '/t/': { path: 'consonants/t', example: 'top' },
      '/v/': { path: 'consonants/v', example: 'very' },
      '/w/': { path: 'consonants/w', example: 'water' },
      '/j/': { path: 'consonants/y', example: 'yes' },
      '/z/': { path: 'consonants/z', example: 'zoo' },
      
      // ダイグラフ
      '/tʃ/': { path: 'digraphs/ch', example: 'chair' },
      '/ʃ/': { path: 'digraphs/sh', example: 'ship' },
      '/θ/': { path: 'digraphs/th_voiceless', example: 'think' },
      '/ð/': { path: 'digraphs/th_voiced', example: 'this' },
      '/hw/': { path: 'digraphs/wh', example: 'what' },
      '/ŋ/': { path: 'digraphs/ng', example: 'sing' },
      '/f/': { path: 'digraphs/ph', example: 'phone' }
    }
    
    // 品質設定
    this.qualitySettings = {
      high: { bitrate: '128k', sampleRate: 44100 },
      medium: { bitrate: '96k', sampleRate: 22050 },
      low: { bitrate: '64k', sampleRate: 16000 }
    }
    
    this.currentQuality = 'medium'
  }
  
  // サポートされている音声フォーマットの検出
  detectSupportedFormats() {
    const audio = new Audio()
    const formats = {
      mp3: audio.canPlayType('audio/mpeg'),
      ogg: audio.canPlayType('audio/ogg'),
      wav: audio.canPlayType('audio/wav'),
      m4a: audio.canPlayType('audio/mp4')
    }
    
    // 優先順位付きフォーマットリスト
    if (formats.mp3) return ['mp3', 'wav', 'ogg']
    if (formats.wav) return ['wav', 'ogg', 'mp3']
    if (formats.ogg) return ['ogg', 'wav', 'mp3']
    return ['mp3'] // フォールバック
  }
  
  // 音声ファイルのプリロード
  async preloadAudio(phonemes = [], quality = this.currentQuality) {
    const loadPromises = phonemes.map(phoneme => this.loadSingleAudio(phoneme, quality))
    const results = await Promise.allSettled(loadPromises)
    
    const loaded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`Audio preload complete: ${loaded} loaded, ${failed} failed`)
    return { loaded, failed, total: phonemes.length }
  }
  
  // 単一音声ファイルの読み込み
  async loadSingleAudio(phoneme, quality = this.currentQuality) {
    const cacheKey = `${phoneme}_${quality}`
    
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)
    }
    
    // 既に読み込み中の場合は同じプロミスを返す
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }
    
    const loadPromise = this.fetchAudioFile(phoneme, quality)
    this.loadingPromises.set(cacheKey, loadPromise)
    
    try {
      const audio = await loadPromise
      this.audioCache.set(cacheKey, audio)
      this.loadingPromises.delete(cacheKey)
      return audio
    } catch (error) {
      this.loadingPromises.delete(cacheKey)
      throw error
    }
  }
  
  // 音声ファイルの取得
  async fetchAudioFile(phoneme, quality) {
    const fileInfo = this.audioFiles[phoneme]
    if (!fileInfo) {
      throw new Error(`No audio file mapping for phoneme: ${phoneme}`)
    }
    
    // 複数フォーマットを試行
    for (const format of this.supportedFormats) {
      try {
        const url = `${this.baseUrl}${fileInfo.path}_${quality}.${format}`
        const audio = new Audio()
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'))
          }, 10000) // 10秒タイムアウト
          
          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout)
            resolve()
          }, { once: true })
          
          audio.addEventListener('error', () => {
            clearTimeout(timeout)
            reject(new Error(`Failed to load ${url}`))
          }, { once: true })
          
          audio.src = url
          audio.load()
        })
        
        return audio
      } catch (error) {
        console.warn(`Failed to load ${format} format for ${phoneme}:`, error)
        continue
      }
    }
    
    throw new Error(`All formats failed for phoneme: ${phoneme}`)
  }
  
  // 音素再生
  async playPhoneme(phoneme, options = {}) {
    try {
      const audio = await this.loadSingleAudio(phoneme, options.quality || this.currentQuality)
      
      // 音声設定
      audio.currentTime = 0
      audio.volume = Math.max(0, Math.min(1, options.volume || 1.0))
      audio.playbackRate = Math.max(0.25, Math.min(4, options.rate || 1.0))
      
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          audio.removeEventListener('ended', onEnded)
          audio.removeEventListener('error', onError)
        }
        
        const onEnded = () => {
          cleanup()
          resolve()
        }
        
        const onError = (event) => {
          cleanup()
          reject(new Error(`Audio playback error: ${event.message}`))
        }
        
        audio.addEventListener('ended', onEnded, { once: true })
        audio.addEventListener('error', onError, { once: true })
        
        audio.play().catch(reject)
      })
    } catch (error) {
      throw new Error(`Failed to play phoneme ${phoneme}: ${error.message}`)
    }
  }
  
  // バッチプリロード（カテゴリ別）
  async preloadCategory(category, quality = this.currentQuality) {
    const categoryPhonemes = Object.keys(this.audioFiles).filter(phoneme => {
      // カテゴリマッピングロジック（簡易実装）
      const fileInfo = this.audioFiles[phoneme]
      return fileInfo.path.startsWith(category)
    })
    
    return this.preloadAudio(categoryPhonemes, quality)
  }
  
  // キャッシュ管理
  clearCache() {
    this.audioCache.clear()
    this.loadingPromises.clear()
  }
  
  getCacheSize() {
    return this.audioCache.size
  }
  
  getCacheInfo() {
    const info = []
    for (const [key, audio] of this.audioCache.entries()) {
      info.push({
        key,
        duration: audio.duration,
        readyState: audio.readyState,
        src: audio.src
      })
    }
    return info
  }
}

// オプション2: Web Audio API + フォルマント合成
class WebAudioSynthesisService {
  constructor() {
    this.audioContext = null
    this.masterGain = null
    this.initAudioContext()
    
    // フォルマント周波数データベース
    this.formantDatabase = {
      // 男性話者の平均フォルマント周波数 (F1, F2, F3)
      male: {
        '/æ/': [730, 1090, 2440],
        '/eɪ/': [530, 1840, 2480],
        '/ɑː/': [730, 1090, 2440],
        '/e/': [530, 1840, 2480],
        '/iː/': [270, 2290, 3010],
        '/ɪ/': [390, 1990, 2550],
        '/aɪ/': [730, 1090, 2440],
        '/ɒ/': [570, 840, 2410],
        '/əʊ/': [500, 700, 2240],
        '/ʌ/': [640, 1190, 2390],
        '/uː/': [300, 870, 2240],
        '/ʊ/': [440, 1020, 2240]
      },
      
      // 女性話者の平均フォルマント周波数
      female: {
        '/æ/': [860, 1220, 2790],
        '/eɪ/': [610, 2330, 2990],
        '/ɑː/': [850, 1220, 2810],
        '/e/': [610, 2330, 2990],
        '/iː/': [310, 2790, 3310],
        '/ɪ/': [430, 2480, 3070],
        '/aɪ/': [850, 1220, 2810],
        '/ɒ/': [590, 920, 2710],
        '/əʊ/': [500, 1000, 2540],
        '/ʌ/': [760, 1400, 2780],
        '/uː/': [370, 950, 2670],
        '/ʊ/': [470, 1160, 2680]
      }
    }
    
    this.currentVoiceType = 'female' // デフォルト
    this.baseFrequency = 120 // 基本周波数 (F0)
  }
  
  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
      
      // マスターゲインノード作成
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.3
      
    } catch (error) {
      console.error('Web Audio API initialization failed:', error)
    }
  }
  
  // 母音合成
  async synthesizeVowel(phoneme, duration = 0.5, options = {}) {
    if (!this.audioContext) {
      throw new Error('Web Audio API not available')
    }
    
    // AudioContextの再開（必要な場合）
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    
    const voiceType = options.voiceType || this.currentVoiceType
    const formants = this.formantDatabase[voiceType]?.[phoneme]
    
    if (!formants) {
      throw new Error(`No formant data for ${phoneme} (${voiceType})`)
    }
    
    return new Promise((resolve) => {
      const startTime = this.audioContext.currentTime
      const endTime = startTime + duration
      
      // 基本周波数オシレーター（声帯振動）
      const fundamentalOsc = this.audioContext.createOscillator()
      const fundamentalGain = this.audioContext.createGain()
      
      fundamentalOsc.frequency.value = this.baseFrequency * (options.pitch || 1.0)
      fundamentalOsc.type = 'sawtooth' // より人間の声に近い波形
      
      // フォルマントフィルター作成
      const formantFilters = formants.map((frequency, index) => {
        const filter = this.audioContext.createBiquadFilter()
        const gain = this.audioContext.createGain()
        
        filter.type = 'bandpass'
        filter.frequency.value = frequency
        filter.Q.value = 10 + (index * 5) // Q値調整
        
        // フォルマントの強度設定
        const amplitude = index === 0 ? 0.8 : (index === 1 ? 0.6 : 0.4)
        gain.gain.value = amplitude * (options.volume || 1.0)
        
        return { filter, gain }
      })
      
      // 音声チェーン構築
      fundamentalOsc.connect(fundamentalGain)
      
      formantFilters.forEach(({ filter, gain }) => {
        fundamentalGain.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain)
      })
      
      // エンベロープ（ADSR）設定
      const attack = 0.05
      const decay = 0.1
      const sustain = 0.7
      const release = 0.2
      
      fundamentalGain.gain.setValueAtTime(0, startTime)
      fundamentalGain.gain.linearRampToValueAtTime(1, startTime + attack)
      fundamentalGain.gain.linearRampToValueAtTime(sustain, startTime + attack + decay)
      fundamentalGain.gain.setValueAtTime(sustain, endTime - release)
      fundamentalGain.gain.linearRampToValueAtTime(0, endTime)
      
      // オシレーター開始・停止
      fundamentalOsc.start(startTime)
      fundamentalOsc.stop(endTime)
      
      // 完了通知
      setTimeout(() => {
        resolve()
      }, duration * 1000)
    })
  }
  
  // 子音合成（ノイズベース）
  async synthesizeConsonant(phoneme, duration = 0.2, options = {}) {
    if (!this.audioContext) {
      throw new Error('Web Audio API not available')
    }
    
    const consonantTypes = {
      '/s/': { type: 'fricative', frequency: 8000, bandwidth: 2000 },
      '/f/': { type: 'fricative', frequency: 6000, bandwidth: 3000 },
      '/ʃ/': { type: 'fricative', frequency: 4000, bandwidth: 2000 },
      '/θ/': { type: 'fricative', frequency: 7000, bandwidth: 2500 },
      '/p/': { type: 'plosive', frequency: 1000, duration: 0.05 },
      '/t/': { type: 'plosive', frequency: 2000, duration: 0.05 },
      '/k/': { type: 'plosive', frequency: 3000, duration: 0.05 }
    }
    
    const consonantInfo = consonantTypes[phoneme]
    if (!consonantInfo) {
      throw new Error(`Consonant synthesis not implemented for ${phoneme}`)
    }
    
    return new Promise((resolve) => {
      const startTime = this.audioContext.currentTime
      
      if (consonantInfo.type === 'fricative') {
        // 摩擦音：ノイズ + フィルタリング
        this.createFricativeSound(consonantInfo, duration, startTime, options)
      } else if (consonantInfo.type === 'plosive') {
        // 破裂音：短いノイズバースト
        this.createPlosiveSound(consonantInfo, startTime, options)
      }
      
      setTimeout(resolve, duration * 1000)
    })
  }
  
  // 摩擦音生成
  createFricativeSound(info, duration, startTime, options) {
    // ホワイトノイズ生成
    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const channelData = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = (Math.random() * 2 - 1) * 0.5
    }
    
    const noiseSource = this.audioContext.createBufferSource()
    const filter = this.audioContext.createBiquadFilter()
    const gain = this.audioContext.createGain()
    
    noiseSource.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.value = info.frequency
    filter.Q.value = info.frequency / info.bandwidth
    
    gain.gain.value = options.volume || 0.3
    
    noiseSource.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)
    
    noiseSource.start(startTime)
  }
  
  // 破裂音生成
  createPlosiveSound(info, startTime, options) {
    const duration = info.duration
    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // 減衰するノイズバースト
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.3))
      channelData[i] = (Math.random() * 2 - 1) * decay * 0.5
    }
    
    const burstSource = this.audioContext.createBufferSource()
    const filter = this.audioContext.createBiquadFilter()
    const gain = this.audioContext.createGain()
    
    burstSource.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.value = info.frequency
    
    gain.gain.value = options.volume || 0.4
    
    burstSource.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)
    
    burstSource.start(startTime)
  }
  
  // 音素再生（統合）
  async playPhoneme(phoneme, options = {}) {
    const vowels = ['/æ/', '/eɪ/', '/ɑː/', '/e/', '/iː/', '/ɪ/', '/aɪ/', '/ɒ/', '/əʊ/', '/ʌ/', '/uː/', '/ʊ/']
    
    if (vowels.includes(phoneme)) {
      return this.synthesizeVowel(phoneme, options.duration || 0.5, options)
    } else {
      return this.synthesizeConsonant(phoneme, options.duration || 0.2, options)
    }
  }
  
  // 音声パラメータ設定
  setVoiceParameters(params) {
    if (params.voiceType) this.currentVoiceType = params.voiceType
    if (params.baseFrequency) this.baseFrequency = params.baseFrequency
    if (params.masterVolume && this.masterGain) {
      this.masterGain.gain.value = params.masterVolume
    }
  }
  
  // リソース解放
  dispose() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.masterGain = null
    }
  }
}

// オプション3: 外部音声合成API統合
class ExternalTTSService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.VUE_APP_TTS_API_KEY
    this.apiUrl = config.apiUrl || 'https://texttospeech.googleapis.com/v1/text:synthesize'
    this.voiceConfig = {
      languageCode: 'en-US',
      name: 'en-US-Standard-A',
      ssmlGender: 'FEMALE'
    }
    this.audioConfig = {
      audioEncoding: 'MP3',
      speakingRate: 0.8,
      pitch: 0.0,
      volumeGainDb: 0.0
    }
    this.audioCache = new Map()
  }
  
  // Google Cloud Text-to-Speech API使用
  async synthesizePhoneme(phoneme, options = {}) {
    const cacheKey = `${phoneme}_${JSON.stringify(options)}`
    
    if (this.audioCache.has(cacheKey)) {
      return this.playFromCache(cacheKey)
    }
    
    if (!this.apiKey) {
      throw new Error('API key not configured for external TTS service')
    }
    
    const ssmlText = this.createSSMLForPhoneme(phoneme, options)
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { ssml: ssmlText },
          voice: {
            ...this.voiceConfig,
            ...options.voice
          },
          audioConfig: {
            ...this.audioConfig,
            speakingRate: options.rate || this.audioConfig.speakingRate,
            pitch: options.pitch || this.audioConfig.pitch,
            volumeGainDb: this.calculateVolumeGain(options.volume)
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Base64音声データをキャッシュ
      this.audioCache.set(cacheKey, data.audioContent)
      
      return this.playFromCache(cacheKey)
      
    } catch (error) {
      throw new Error(`External TTS synthesis failed: ${error.message}`)
    }
  }
  
  // キャッシュから音声再生
  async playFromCache(cacheKey) {
    const audioContent = this.audioCache.get(cacheKey)
    if (!audioContent) {
      throw new Error('Audio not found in cache')
    }
    
    const audio = new Audio()
    audio.src = `data:audio/mp3;base64,${audioContent}`
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('ended', resolve, { once: true })
      audio.addEventListener('error', reject, { once: true })
      audio.play().catch(reject)
    })
  }
  
  // SSML生成
  createSSMLForPhoneme(phoneme, options = {}) {
    const cleanPhoneme = phoneme.replace(/[\/]/g, '')
    const rate = options.rate ? `<prosody rate="${options.rate * 100}%">` : ''
    const rateClose = options.rate ? '</prosody>' : ''
    
    return `
      <speak>
        ${rate}
        <phoneme alphabet="ipa" ph="${cleanPhoneme}">
          ${cleanPhoneme}
        </phoneme>
        ${rateClose}
      </speak>
    `.trim()
  }
  
  // 音量をdB単位に変換
  calculateVolumeGain(volume = 1.0) {
    if (volume <= 0) return -96 // 無音
    return 20 * Math.log10(volume) // リニア音量をdBに変換
  }
  
  // 音声設定更新
  updateVoiceConfig(config) {
    this.voiceConfig = { ...this.voiceConfig, ...config }
  }
  
  updateAudioConfig(config) {
    this.audioConfig = { ...this.audioConfig, ...config }
  }
  
  // キャッシュ管理
  clearCache() {
    this.audioCache.clear()
  }
  
  getCacheSize() {
    return this.audioCache.size
  }
}

// 統合音声サービス
class IntegratedAudioService {
  constructor(config = {}) {
// 統合音声サービス
class IntegratedAudioService {
  constructor(config = {}) {
    this.services = {
      prerecorded: new PreRecordedAudioService(),
      synthesis: new WebAudioSynthesisService(),
      external: config.externalTTS ? new ExternalTTSService(config.externalTTS) : null
    }
    
    this.preferredService = config.preferredService || 'prerecorded'
    this.fallbackOrder = config.fallbackOrder || ['prerecorded', 'synthesis', 'external']
    this.serviceStatus = {}
    
    this.initializeServices()
  }
  
  // サービス初期化と可用性チェック
  async initializeServices() {
    const availability = await this.checkAudioAvailability()
    
    // 使用可能なサービスのみフォールバック順序に含める
    this.fallbackOrder = this.fallbackOrder.filter(serviceName => 
      availability[serviceName] && this.services[serviceName]
    )
    
    if (this.fallbackOrder.length === 0) {
      console.warn('No audio services available!')
      return
    }
    
    // 優先サービスが使用できない場合は最初の利用可能サービスを使用
    if (!this.fallbackOrder.includes(this.preferredService)) {
      this.preferredService = this.fallbackOrder[0]
      console.log(`Fallback to ${this.preferredService} service`)
    }
    
    console.log('Audio services initialized:', {
      preferred: this.preferredService,
      available: this.fallbackOrder,
      status: availability
    })
  }
  
  // 最適なサービスで音素を再生
  async playPhoneme(phoneme, options = {}) {
    const servicesToTry = options.forceService ? 
      [options.forceService] : 
      this.fallbackOrder
    
    let lastError = null
    
    for (const serviceName of servicesToTry) {
      try {
        const service = this.services[serviceName]
        if (!service) continue
        
        console.log(`Attempting to play ${phoneme} with ${serviceName} service`)
        
        // サービス固有のオプション調整
        const serviceOptions = this.adjustOptionsForService(serviceName, options)
        
        await service.playPhoneme(phoneme, serviceOptions)
        
        // 成功した場合はサービス状態を更新
        this.serviceStatus[serviceName] = { 
          status: 'success', 
          lastUsed: Date.now() 
        }
        
        return { service: serviceName, success: true }
        
      } catch (error) {
        console.warn(`${serviceName} service failed for ${phoneme}:`, error.message)
        
        this.serviceStatus[serviceName] = { 
          status: 'error', 
          lastError: error.message,
          lastAttempt: Date.now() 
        }
        
        lastError = error
        continue
      }
    }
    
    throw new Error(`All audio services failed for phoneme ${phoneme}. Last error: ${lastError?.message}`)
  }
  
  // サービス別オプション調整
  adjustOptionsForService(serviceName, options) {
    const adjusted = { ...options }
    
    switch (serviceName) {
      case 'prerecorded':
        // プリレコーディング音声は品質とボリュームのみ調整
        return {
          quality: adjusted.quality || 'medium',
          volume: adjusted.volume || 1.0,
          rate: adjusted.rate || 1.0
        }
        
      case 'synthesis':
        // Web Audio API合成は詳細パラメータ対応
        return {
          duration: adjusted.duration || (this.isVowel(options.phoneme) ? 0.5 : 0.2),
          voiceType: adjusted.voiceType || 'female',
          pitch: adjusted.pitch || 1.0,
          volume: adjusted.volume || 0.8
        }
        
      case 'external':
        // 外部APIは標準的なTTSパラメータ
        return {
          rate: Math.max(0.25, Math.min(4.0, adjusted.rate || 0.8)),
          pitch: Math.max(-20, Math.min(20, adjusted.pitch || 0)),
          volume: adjusted.volume || 1.0,
          voice: adjusted.voice
        }
        
      default:
        return adjusted
    }
  }
  
  // 母音判定ヘルパー
  isVowel(phoneme) {
    const vowels = ['/æ/', '/eɪ/', '/ɑː/', '/e/', '/iː/', '/ɪ/', '/aɪ/', '/ɒ/', '/əʊ/', '/ʌ/', '/uː/', '/ʊ/']
    return vowels.includes(phoneme)
  }
  
  // バッチ音素再生（シーケンス）
  async playPhonemeSequence(phonemes, options = {}) {
    const results = []
    const delay = options.delay || 300 // デフォルト300ms間隔
    
    for (let i = 0; i < phonemes.length; i++) {
      const phoneme = phonemes[i]
      
      try {
        const result = await this.playPhoneme(phoneme, options)
        results.push({ phoneme, ...result })
        
        // 最後の音素以外は待機
        if (i < phonemes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
        
      } catch (error) {
        results.push({ 
          phoneme, 
          success: false, 
          error: error.message 
        })
      }
    }
    
    return results
  }
  
  // カテゴリ別プリロード
  async preloadCategory(category, options = {}) {
    const categoryPhonemes = this.getCategoryPhonemes(category)
    const service = this.services.prerecorded
    
    if (service && service.preloadCategory) {
      try {
        const result = await service.preloadCategory(category, options.quality)
        console.log(`Preloaded ${category} category:`, result)
        return result
      } catch (error) {
        console.warn(`Failed to preload ${category}:`, error)
        return { loaded: 0, failed: categoryPhonemes.length, total: categoryPhonemes.length }
      }
    }
    
    return { loaded: 0, failed: 0, total: 0 }
  }
  
  // カテゴリ別音素リスト取得
  getCategoryPhonemes(category) {
    const categories = {
      vowels: ['/æ/', '/eɪ/', '/ɑː/', '/e/', '/iː/', '/ɪ/', '/aɪ/', '/ɒ/', '/əʊ/', '/ʌ/', '/uː/', '/ʊ/'],
      diphthongs: ['/aɪ/', '/aʊ/', '/ɔɪ/', '/eə/', '/ɪə/', '/ʊə/'],
      consonants: ['/b/', '/k/', '/d/', '/f/', '/g/', '/h/', '/dʒ/', '/l/', '/m/', '/n/', '/p/', '/r/', '/s/', '/t/', '/v/', '/w/', '/j/', '/z/'],
      digraphs: ['/tʃ/', '/ʃ/', '/θ/', '/ð/', '/hw/', '/ŋ/']
    }
    
    return categories[category] || []
  }
  
  // 音声サービス可用性チェック
  async checkAudioAvailability() {
    const availability = {}
    
    // プリレコーディング音声サービス
    try {
      const testResult = await this.services.prerecorded.loadSingleAudio('/æ/', 'low')
      availability.prerecorded = !!testResult
    } catch (error) {
      availability.prerecorded = false
    }
    
    // Web Audio API合成サービス
    try {
      availability.synthesis = !!(this.services.synthesis.audioContext)
    } catch (error) {
      availability.synthesis = false
    }
    
    // 外部TTSサービス
    if (this.services.external) {
      try {
        availability.external = !!(this.services.external.apiKey)
      } catch (error) {
        availability.external = false
      }
    } else {
      availability.external = false
    }
    
    return availability
  }
  
  // サービス統計取得
  getServiceStats() {
    return {
      preferred: this.preferredService,
      available: this.fallbackOrder,
      status: this.serviceStatus,
      cacheInfo: {
        prerecorded: this.services.prerecorded.getCacheSize(),
        external: this.services.external?.getCacheSize() || 0
      }
    }
  }
  
  // サービス設定更新
  updateServiceConfig(serviceName, config) {
    const service = this.services[serviceName]
    if (!service) return false
    
    switch (serviceName) {
      case 'prerecorded':
        if (config.quality) service.currentQuality = config.quality
        break
        
      case 'synthesis':
        if (config.voiceParameters) {
          service.setVoiceParameters(config.voiceParameters)
        }
        break
        
      case 'external':
        if (config.voice) service.updateVoiceConfig(config.voice)
        if (config.audio) service.updateAudioConfig(config.audio)
        break
    }
    
    return true
  }
  
  // 優先サービス変更
  setPreferredService(serviceName) {
    if (this.services[serviceName] && this.fallbackOrder.includes(serviceName)) {
      this.preferredService = serviceName
      return true
    }
    return false
  }
  
  // キャッシュクリア
  clearAllCaches() {
    Object.values(this.services).forEach(service => {
      if (service && service.clearCache) {
        service.clearCache()
      }
    })
  }
  
  // リソース解放
  dispose() {
    if (this.services.synthesis) {
      this.services.synthesis.dispose()
    }
    this.clearAllCaches()
  }
  
  // デバッグ情報取得
  getDebugInfo() {
    return {
      services: Object.keys(this.services).map(name => ({
        name,
        available: !!this.services[name],
        status: this.serviceStatus[name] || 'not_used'
      })),
      config: {
        preferred: this.preferredService,
        fallbackOrder: this.fallbackOrder
      },
      caches: {
        prerecorded: this.services.prerecorded?.getCacheInfo() || [],
        external: this.services.external?.getCacheSize() || 0
      }
    }
  }
}

// Vue.js プラグインとして使用するためのラッパー
class AdvancedAudioPlugin {
  constructor(config = {}) {
    this.audioService = new IntegratedAudioService(config)
  }
  
  install(app) {
    // Vue アプリケーションにサービスを注入
    app.config.globalProperties.$advancedAudio = this.audioService
    app.provide('advancedAudio', this.audioService)
    
    // グローバルメソッド追加
    app.config.globalProperties.$playPhoneme = (phoneme, options) => {
      return this.audioService.playPhoneme(phoneme, options)
    }
    
    // アプリケーション終了時のクリーンアップ
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.audioService.dispose()
      })
    }
  }
}

// エクスポート
export {
  PreRecordedAudioService,
  WebAudioSynthesisService,
  ExternalTTSService,
  IntegratedAudioService,
  AdvancedAudioPlugin
}

// デフォルトエクスポート（プラグインとして使用）
export default AdvancedAudioPlugin

// 使用例とドキュメント
/*
使用方法:

1. Basic Usage (Vue.js プラグインとして):
   ```javascript
   import AdvancedAudioPlugin from '@/services/advancedAudioService.js'
   
   app.use(AdvancedAudioPlugin, {
     preferredService: 'prerecorded',
     fallbackOrder: ['prerecorded', 'synthesis'],
     externalTTS: {
       apiKey: 'your-api-key',
       apiUrl: 'https://your-tts-service.com/api'
     }
   })
   ```

2. Component内での使用:
   ```javascript
   import { inject } from 'vue'
   
   export default {
     setup() {
       const advancedAudio = inject('advancedAudio')
       
       const playSound = async (phoneme) => {
         try {
           await advancedAudio.playPhoneme(phoneme, {
             volume: 0.8,
             rate: 0.9
           })
         } catch (error) {
           console.error('Audio playback failed:', error)
         }
       }
       
       return { playSound }
     }
   }
   ```

3. 直接使用:
   ```javascript
   import { IntegratedAudioService } from '@/services/advancedAudioService.js'
   
   const audioService = new IntegratedAudioService({
     preferredService: 'synthesis'
   })
   
   await audioService.playPhoneme('/æ/', { volume: 0.5 })
   ```

4. カテゴリ別プリロード:
   ```javascript
   await audioService.preloadCategory('vowels', { quality: 'high' })
   ```

5. シーケンス再生:
   ```javascript
   const phonemes = ['/k/', '/æ/', '/t/']
   await audioService.playPhonemeSequence(phonemes, { delay: 200 })
   ```

設定オプション:
- preferredService: 'prerecorded' | 'synthesis' | 'external'
- fallbackOrder: サービスの優先順位配列
- externalTTS: 外部TTS APIの設定
- qualitySettings: 音質設定

音声ファイル構造 (プリレコーディング使用時):
```
public/audio/phonemes/
├── vowels/
│   ├── ae_high.mp3
│   ├── ae_medium.mp3
│   └── ae_low.mp3
├── consonants/
│   ├── b_high.mp3
│   └── ...
└── digraphs/
    ├── ch_high.mp3
    └── ...
```
*/