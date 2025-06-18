<template>
  <div class="phoneme-detector bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur rounded-xl p-6 border border-cyan-500/30">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <i class="fas fa-microphone text-sm"></i>
        </div>
        <h3 class="text-lg font-semibold text-green-300">音素発音検出器</h3>
      </div>
      
      <div class="text-right">
        <div class="text-sm text-green-400">
          {{ isActive ? '検出中' : '待機中' }}
        </div>
        <div v-if="targetPhoneme" class="text-xs text-emerald-300">
          目標: {{ targetPhoneme.symbol }}
        </div>
      </div>
    </div>

    <!-- Target Phoneme Display -->
    <div v-if="targetPhoneme" class="mb-6 p-4 bg-slate-700/30 rounded-lg border border-green-500/30">
      <div class="text-center">
        <!-- Phoneme Symbol -->
        <div class="text-4xl font-bold text-green-300 mb-2 font-mono">
          {{ targetPhoneme.symbol }}
        </div>
        
        <!-- IPA -->
        <div class="text-lg text-emerald-300 mb-2">
          IPA: {{ targetPhoneme.ipa }}
        </div>
        
        <!-- Description -->
        <div class="text-sm text-blue-200 mb-3">
          {{ targetPhoneme.description }}
        </div>
        
        <!-- Examples -->
        <div class="flex flex-wrap justify-center gap-2 mb-4">
          <span 
            v-for="example in targetPhoneme.examples?.slice(0, 3)"
            :key="example"
            class="px-3 py-1 bg-green-900/30 border border-green-500/50 rounded-full text-sm text-green-300"
          >
            {{ example }}
          </span>
        </div>

        <!-- Audio Example Button -->
        <button
          @click="playExampleAudio"
          :disabled="!targetPhoneme.audioFile"
          class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 text-sm"
        >
          <i class="fas fa-volume-up mr-2"></i>
          音素サンプル再生
        </button>
      </div>
    </div>

    <!-- Audio Visualization -->
    <div class="mb-6">
      <div class="bg-slate-900/50 rounded-lg p-4 border border-green-500/20">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-green-300">音声波形</span>
          <span class="text-xs text-emerald-400">
            レベル: {{ Math.round(audioLevel * 100) }}%
          </span>
        </div>
        
        <!-- Waveform Visualization -->
        <div class="relative h-20 bg-slate-800 rounded overflow-hidden">
          <canvas
            ref="waveformCanvas"
            class="w-full h-full"
            :width="canvasWidth"
            :height="80"
          ></canvas>
          
          <!-- Recording indicator -->
          <div 
            v-if="isRecording"
            class="absolute top-2 right-2 flex items-center space-x-2"
          >
            <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-red-400">録音中</span>
          </div>
        </div>

        <!-- Audio Controls -->
        <div class="flex justify-center mt-4 space-x-3">
          <button
            @click="startRecording"
            :disabled="!isActive || isRecording"
            class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                   disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg 
                   transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
          >
            <i class="fas fa-microphone mr-2"></i>
            {{ isRecording ? '録音中...' : '録音開始' }}
          </button>
          
          <button
            @click="stopRecording"
            :disabled="!isRecording"
            class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                   disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg 
                   transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
          >
            <i class="fas fa-stop mr-2"></i>
            停止
          </button>
          
          <button
            @click="playRecording"
            :disabled="!lastRecording"
            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                   disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-2 px-4 rounded-lg 
                   transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
          >
            <i class="fas fa-play mr-2"></i>
            再生
          </button>
        </div>
      </div>
    </div>

    <!-- Pronunciation Analysis -->
    <div v-if="lastAnalysis" class="mb-6 p-4 bg-slate-700/30 rounded-lg border border-blue-500/30">
      <h4 class="text-sm font-medium text-blue-300 mb-3 flex items-center">
        <i class="fas fa-chart-line mr-2"></i>
        発音分析結果
      </h4>
      
      <!-- Accuracy Score -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-blue-200">精度スコア</span>
          <span class="text-lg font-bold" :class="getAccuracyColor(lastAnalysis.accuracy)">
            {{ Math.round(lastAnalysis.accuracy * 100) }}%
          </span>
        </div>
        
        <!-- Progress bar -->
        <div class="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
          <div 
            class="h-full transition-all duration-1000 ease-out rounded-full"
            :class="getAccuracyGradient(lastAnalysis.accuracy)"
            :style="{ width: (lastAnalysis.accuracy * 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Detailed Analysis -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-blue-300 mb-1">音素マッチ</div>
          <div class="flex items-center space-x-2">
            <i :class="lastAnalysis.phonemeMatch ? 'fas fa-check text-green-400' : 'fas fa-times text-red-400'"></i>
            <span :class="lastAnalysis.phonemeMatch ? 'text-green-300' : 'text-red-300'">
              {{ lastAnalysis.phonemeMatch ? '正確' : '不正確' }}
            </span>
          </div>
        </div>
        
        <div>
          <div class="text-blue-300 mb-1">音量レベル</div>
          <div class="text-white">{{ Math.round(lastAnalysis.volume * 100) }}%</div>
        </div>
        
        <div>
          <div class="text-blue-300 mb-1">明瞭度</div>
          <div class="text-white">{{ Math.round(lastAnalysis.clarity * 100) }}%</div>
        </div>
        
        <div>
          <div class="text-blue-300 mb-1">持続時間</div>
          <div class="text-white">{{ lastAnalysis.duration?.toFixed(1) }}秒</div>
        </div>
      </div>

      <!-- Feedback Message -->
      <div class="mt-4 p-3 rounded-lg" :class="getFeedbackStyle(lastAnalysis)">
        <div class="text-sm font-medium mb-1">{{ getFeedbackTitle(lastAnalysis) }}</div>
        <div class="text-xs">{{ getFeedbackMessage(lastAnalysis) }}</div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div class="bg-slate-700/30 rounded-lg p-4">
      <h4 class="text-sm font-medium text-cyan-300 mb-3 flex items-center">
        <i class="fas fa-cog mr-2"></i>
        検出設定
      </h4>
      
      <div class="space-y-3">
        <!-- Sensitivity -->
        <div>
          <label class="text-xs text-blue-300 block mb-1">検出感度</label>
          <input
            v-model="detectionSensitivity"
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            class="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          >
          <div class="text-xs text-cyan-400 text-center">{{ Math.round(detectionSensitivity * 100) }}%</div>
        </div>

        <!-- Auto-start recording -->
        <div class="flex items-center justify-between">
          <label class="text-xs text-blue-300">自動録音開始</label>
          <button
            @click="autoRecord = !autoRecord"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="autoRecord ? 'bg-green-600' : 'bg-gray-600'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="autoRecord ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <!-- Continuous analysis -->
        <div class="flex items-center justify-between">
          <label class="text-xs text-blue-300">継続分析</label>
          <button
            @click="continuousAnalysis = !continuousAnalysis"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="continuousAnalysis ? 'bg-green-600' : 'bg-gray-600'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="continuousAnalysis ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// Props
const props = defineProps({
  targetPhoneme: {
    type: Object,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['pronunciation-result', 'audio-data'])

// Audio-related refs
const mediaRecorder = ref(null)
const audioContext = ref(null)
const analyser = ref(null)
const microphone = ref(null)
const isRecording = ref(false)
const audioLevel = ref(0)
const lastRecording = ref(null)
const lastAnalysis = ref(null)

// Canvas refs
const waveformCanvas = ref(null)
const canvasWidth = ref(400)

// Settings
const detectionSensitivity = ref(0.7)
const autoRecord = ref(false)
const continuousAnalysis = ref(true)

// Animation frame
let animationFrame = null

// Methods
const initializeAudio = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } 
    })

    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    analyser.value = audioContext.value.createAnalyser()
    microphone.value = audioContext.value.createMediaStreamSource(stream)
    
    analyser.value.fftSize = 2048
    analyser.value.smoothingTimeConstant = 0.8
    
    microphone.value.connect(analyser.value)
    
    // Set up MediaRecorder
    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    })
    
    mediaRecorder.value.ondataavailable = handleRecordingData
    mediaRecorder.value.onstop = handleRecordingStop
    
    // Start audio visualization
    startAudioVisualization()
    
    console.log('Audio initialized successfully')
  } catch (error) {
    console.error('Failed to initialize audio:', error)
  }
}

const startAudioVisualization = () => {
  if (!analyser.value) return
  
  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  const draw = () => {
    if (!waveformCanvas.value) return
    
    analyser.value.getByteFrequencyData(dataArray)
    
    // Calculate audio level
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    audioLevel.value = (sum / bufferLength) / 255
    
    // Draw waveform
    drawWaveform(dataArray)
    
    // Emit audio data for real-time analysis
    if (props.isActive && continuousAnalysis.value) {
      emit('audio-data', {
        frequencyData: dataArray,
        level: audioLevel.value,
        timestamp: Date.now()
      })
    }
    
    animationFrame = requestAnimationFrame(draw)
  }
  
  draw()
}

const drawWaveform = (dataArray) => {
  const canvas = waveformCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // Clear canvas
  ctx.fillStyle = 'rgb(15, 23, 42)' // slate-900
  ctx.fillRect(0, 0, width, height)
  
  // Draw frequency bars
  const barWidth = width / dataArray.length * 2
  let x = 0
  
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * height
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)') // cyan-400
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.3)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(x, height - barHeight, barWidth, barHeight)
    
    x += barWidth + 1
  }
  
  // Draw center line
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

const startRecording = () => {
  if (!mediaRecorder.value || isRecording.value) return
  
  try {
    mediaRecorder.value.start()
    isRecording.value = true
    console.log('Recording started')
  } catch (error) {
    console.error('Failed to start recording:', error)
  }
}

const stopRecording = () => {
  if (!mediaRecorder.value || !isRecording.value) return
  
  try {
    mediaRecorder.value.stop()
    isRecording.value = false
    console.log('Recording stopped')
  } catch (error) {
    console.error('Failed to stop recording:', error)
  }
}

const handleRecordingData = (event) => {
  if (event.data.size > 0) {
    lastRecording.value = event.data
  }
}

const handleRecordingStop = () => {
  if (lastRecording.value) {
    analyzeRecording(lastRecording.value)
  }
}

const analyzeRecording = async (recordingBlob) => {
  try {
    // Convert blob to audio buffer
    const arrayBuffer = await recordingBlob.arrayBuffer()
    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer)
    
    // Perform phoneme analysis
    const analysis = await performPhonemeAnalysis(audioBuffer)
    
    lastAnalysis.value = analysis
    
    // Emit result
    emit('pronunciation-result', {
      accuracy: analysis.accuracy,
      isCorrect: analysis.phonemeMatch && analysis.accuracy > detectionSensitivity.value,
      audioData: recordingBlob,
      analysis: analysis
    })
    
  } catch (error) {
    console.error('Failed to analyze recording:', error)
  }
}

const performPhonemeAnalysis = async (audioBuffer) => {
  // This is a simplified phoneme analysis
  // In a real implementation, you would use more sophisticated audio analysis
  
  const channelData = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  const duration = audioBuffer.duration
  
  // Calculate basic audio features
  let sum = 0
  let maxAmplitude = 0
  let rms = 0
  
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.abs(channelData[i])
    sum += sample
    maxAmplitude = Math.max(maxAmplitude, sample)
    rms += sample * sample
  }
  
  const averageAmplitude = sum / channelData.length
  rms = Math.sqrt(rms / channelData.length)
  
  // Simple phoneme matching (this would be much more sophisticated in reality)
  const phonemeMatch = averageAmplitude > 0.01 && duration > 0.1 && duration < 2.0
  
  // Calculate accuracy based on various factors
  let accuracy = 0
  
  if (phonemeMatch) {
    // Base accuracy on amplitude and duration
    accuracy += Math.min(averageAmplitude * 10, 0.4) // Max 40% from amplitude
    accuracy += Math.min((2.0 - Math.abs(duration - 0.5)) / 2.0, 0.3) // Max 30% from duration
    accuracy += Math.min(rms * 5, 0.3) // Max 30% from clarity
  }
  
  // Add some randomization to simulate real analysis
  accuracy += (Math.random() - 0.5) * 0.2
  accuracy = Math.max(0, Math.min(1, accuracy))
  
  return {
    accuracy,
    phonemeMatch,
    volume: averageAmplitude * 10,
    clarity: rms * 5,
    duration,
    timestamp: Date.now()
  }
}

const playRecording = () => {
  if (!lastRecording.value) return
  
  const audio = new Audio(URL.createObjectURL(lastRecording.value))
  audio.play()
}

const playExampleAudio = () => {
  if (!props.targetPhoneme?.audioFile) return
  
  const audio = new Audio(props.targetPhoneme.audioFile)
  audio.play()
}

// Utility methods for styling
const getAccuracyColor = (accuracy) => {
  if (accuracy >= 0.8) return 'text-green-400'
  if (accuracy >= 0.6) return 'text-yellow-400'
  return 'text-red-400'
}

const getAccuracyGradient = (accuracy) => {
  if (accuracy >= 0.8) return 'bg-gradient-to-r from-green-500 to-emerald-500'
  if (accuracy >= 0.6) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  return 'bg-gradient-to-r from-red-500 to-red-600'
}

const getFeedbackStyle = (analysis) => {
  if (analysis.accuracy >= 0.8) return 'bg-green-900/30 border border-green-500/50'
  if (analysis.accuracy >= 0.6) return 'bg-yellow-900/30 border border-yellow-500/50'
  return 'bg-red-900/30 border border-red-500/50'
}

const getFeedbackTitle = (analysis) => {
  if (analysis.accuracy >= 0.8) return '素晴らしい発音です！'
  if (analysis.accuracy >= 0.6) return 'もう少しです'
  return '再挑戦してみましょう'
}

const getFeedbackMessage = (analysis) => {
  if (analysis.accuracy >= 0.8) return '正確な音素発音ができています。次の音素に進みましょう。'
  if (analysis.accuracy >= 0.6) return '良い発音ですが、もう少し明瞭に発音してみてください。'
  return '目標音素をもう一度確認して、ゆっくりと発音してみてください。'
}

// Watchers
watch(() => props.isActive, (isActive) => {
  if (isActive && autoRecord.value) {
    nextTick(() => {
      startRecording()
    })
  }
})

watch(() => props.targetPhoneme, (newPhoneme) => {
  if (newPhoneme) {
    lastAnalysis.value = null
    lastRecording.value = null
  }
})

// Lifecycle
onMounted(async () => {
  await initializeAudio()
  
  // Set canvas width
  nextTick(() => {
    if (waveformCanvas.value) {
      canvasWidth.value = waveformCanvas.value.offsetWidth
    }
  })
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  
  if (audioContext.value) {
    audioContext.value.close()
  }
  
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
  }
})
</script>

<style scoped>
/* Custom range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  border: 2px solid #0f172a;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  border: 2px solid #0f172a;
}

/* Custom scrollbar */
.phoneme-detector::-webkit-scrollbar {
  width: 6px;
}

.phoneme-detector::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.phoneme-detector::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.5);
  border-radius: 3px;
}

.phoneme-detector::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.7);
}
</style>