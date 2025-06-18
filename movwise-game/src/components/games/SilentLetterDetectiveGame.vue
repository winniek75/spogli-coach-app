<template>
  <div class="silent-letter-detective min-h-screen bg-detective-dark relative overflow-hidden">
    <!-- ノワール風背景エフェクト -->
    <div class="film-grain absolute inset-0 opacity-20 pointer-events-none"></div>
    <div class="spotlight absolute top-10 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-200/30 to-transparent rounded-full blur-3xl"></div>
    
    <!-- ゲームヘッダー -->
    <header class="relative z-10 p-6 border-b border-gray-600/50">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="text-4xl">🕵️</div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-detective-gold font-serif">
              Detective's Office
            </h1>
            <p class="text-gray-300 text-sm">Silent Letter Investigation Bureau</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="text-detective-gold text-lg font-bold">
            🔍 Case #{{ currentCaseNumber.toString().padStart(3, '0') }}
          </div>
          <button @click="toggleSettings" class="text-gray-300 hover:text-detective-gold transition-colors">
            ⚙️
          </button>
        </div>
      </div>
    </header>

    <!-- メインゲームエリア -->
    <main class="relative z-10 p-6">
      <div class="max-w-4xl mx-auto">
        
        <!-- 進捗表示 -->
        <div class="mb-8 bg-gray-800/80 rounded-lg p-4 border border-gray-600/50">
          <div class="flex justify-between items-center mb-2">
            <span class="text-detective-gold font-bold">Investigation Progress</span>
            <span class="text-gray-300">{{ Math.round(progress) }}% Complete</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <!-- ゲーム状態別表示 -->
        <div v-if="gameState === 'loading'" class="text-center py-12">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-gray-300 text-lg">Preparing case files...</p>
        </div>

        <div v-else-if="gameState === 'playing'" class="space-y-8">
          
          <!-- 事件ファイル -->
          <div class="case-file bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-8 shadow-lg border-4 border-amber-800 relative">
            <!-- 事件ファイルの装飾 -->
            <div class="absolute top-4 right-4 text-red-600 font-bold text-lg transform -rotate-12">
              CONFIDENTIAL
            </div>
            <div class="absolute top-6 left-6 w-8 h-8 bg-red-600 rounded-full opacity-80"></div>
            
            <h2 class="text-2xl font-bold text-amber-900 mb-4 font-serif text-center">
              📋 Case File #{{ currentCaseNumber.toString().padStart(3, '0') }}
            </h2>
            
            <div class="bg-white/70 p-6 rounded border-l-4 border-amber-800">
              <h3 class="text-xl font-bold text-amber-900 mb-3">
                "The Case of the {{ currentWord.silentLetterType.toUpperCase() }}"
              </h3>
              
              <div class="grid md:grid-cols-2 gap-6">
                <!-- 証拠リスト -->
                <div>
                  <h4 class="font-bold text-amber-800 mb-3 flex items-center">
                    🔍 Evidence Found:
                  </h4>
                  <div class="space-y-2">
                    <div v-for="evidence in currentWord.examples" :key="evidence" 
                         class="flex items-center space-x-2 text-amber-900">
                      <span class="text-green-600">✓</span>
                      <span class="font-mono bg-white px-2 py-1 rounded border">{{ evidence }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 現在の調査対象 -->
                <div>
                  <h4 class="font-bold text-amber-800 mb-3 flex items-center">
                    🎯 Current Investigation:
                  </h4>
                  <div class="bg-white p-4 rounded border-2 border-dashed border-amber-600">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-amber-900 mb-2 font-mono">
                        {{ currentWord.word }}
                      </div>
                      <button @click="playWordAudio" 
                              class="audio-button detective-audio"
                              :disabled="isPlayingAudio">
                        <span v-if="isPlayingAudio">🔊</span>
                        <span v-else>🎵</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 推理メモ -->
            <div class="mt-6 bg-yellow-100 p-4 rounded border-l-4 border-yellow-500">
              <p class="text-amber-900 font-semibold">
                🤔 Detective's Question: Which letter is silent in "{{ currentWord.word }}"?
              </p>
              <p class="text-amber-700 text-sm mt-2">
                Listen carefully and find the letter that makes no sound!
              </p>
            </div>
          </div>

          <!-- 証拠ボタン（文字選択） -->
          <div class="evidence-board bg-gray-800/90 rounded-lg p-8 border border-gray-600/50">
            <h3 class="text-xl font-bold text-detective-gold mb-6 text-center flex items-center justify-center">
              🔍 Select the Silent Letter Evidence:
            </h3>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button v-for="(letter, index) in currentWord.letters" 
                      :key="index"
                      @click="selectLetter(letter)"
                      :disabled="selectedLetter !== null"
                      :class="getLetterButtonClass(letter)"
                      class="evidence-button">
                <div class="letter-display">{{ letter }}</div>
                <div class="evidence-number">#{{ index + 1 }}</div>
              </button>
            </div>
          </div>

          <!-- フィードバック表示 -->
          <div v-if="showFeedback" class="feedback-container">
            <div :class="feedbackClass" class="feedback-card p-6 rounded-lg border-2">
              <div class="text-center">
                <div class="text-4xl mb-4">{{ feedbackEmoji }}</div>
                <h3 class="text-xl font-bold mb-2">{{ feedbackTitle }}</h3>
                <p class="mb-4">{{ feedbackMessage }}</p>
                
                <!-- 正解時の詳細説明 -->
                <div v-if="isCorrect" class="bg-green-100 p-4 rounded mt-4">
                  <p class="text-green-800 font-semibold">
                    🎯 Correct! The letter "{{ currentWord.silentLetter }}" is silent in "{{ currentWord.word }}".
                  </p>
                  <p class="text-green-700 text-sm mt-2">
                    {{ currentWord.explanation }}
                  </p>
                </div>
                
                <button @click="nextCase" 
                        class="mt-6 bg-detective-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                  {{ isCorrect ? 'Next Case 📁' : 'Try Again 🔍' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ゲーム完了 -->
        <div v-else-if="gameState === 'completed'" class="text-center py-12">
          <div class="case-solved-animation mb-8">
            <div class="text-6xl mb-4">🕵️‍♂️</div>
            <h2 class="text-3xl font-bold text-detective-gold mb-4">
              Case Closed!
            </h2>
            <div class="text-xl text-gray-300 mb-6">
              Detective Badge Earned: Silent Letter Specialist
            </div>
          </div>
          
          <div class="stats-board bg-gray-800/80 rounded-lg p-6 mb-8">
            <h3 class="text-xl font-bold text-detective-gold mb-4">Investigation Report</h3>
            <div class="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-green-400">{{ stats.correct }}</div>
                <div class="text-gray-300">Cases Solved</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-red-400">{{ stats.incorrect }}</div>
                <div class="text-gray-300">Mistakes Made</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-detective-gold">{{ Math.round(stats.accuracy) }}%</div>
                <div class="text-gray-300">Accuracy Rate</div>
              </div>
            </div>
          </div>
          
          <button @click="restartGame" 
                  class="bg-detective-gold text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">
            Start New Investigation 🔍
          </button>
        </div>

      </div>
    </main>

    <!-- 設定モーダル -->
    <div v-if="showSettings" class="modal-backdrop" @click="toggleSettings">
      <div class="modal-content" @click.stop>
        <h3 class="text-xl font-bold mb-4">Detective Settings</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Sound Volume</label>
            <input v-model="settings.volume" type="range" min="0" max="100" 
                   class="w-full accent-detective-gold">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Difficulty Level</label>
            <select v-model="settings.difficulty" class="w-full p-2 border rounded">
              <option value="easy">Easy (3 letters)</option>
              <option value="medium">Medium (4-5 letters)</option>
              <option value="hard">Hard (6+ letters)</option>
            </select>
          </div>
          <div class="flex justify-end space-x-4">
            <button @click="toggleSettings" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Cancel
            </button>
            <button @click="saveSettings" class="px-4 py-2 bg-detective-gold text-gray-900 rounded hover:bg-yellow-500">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ゲーム状態
const gameState = ref('loading') // 'loading', 'playing', 'completed'
const currentCaseNumber = ref(1)
const selectedLetter = ref(null)
const showFeedback = ref(false)
const isCorrect = ref(false)
const showSettings = ref(false)
const isPlayingAudio = ref(false)

// 設定
const settings = ref({
  volume: 70,
  difficulty: 'medium'
})

// ゲーム統計
const stats = ref({
  correct: 0,
  incorrect: 0,
  totalCases: 0
})

// 無音文字データ
const silentLetterWords = [
  // Silent B
  {
    word: 'lamb',
    letters: ['l', 'a', 'm', 'b'],
    silentLetter: 'b',
    silentLetterType: 'Silent B',
    examples: ['thumb', 'comb', 'climb'],
    explanation: 'The letter B is often silent when it comes after M at the end of a word.'
  },
  {
    word: 'thumb',
    letters: ['t', 'h', 'u', 'm', 'b'],
    silentLetter: 'b',
    silentLetterType: 'Silent B',
    examples: ['lamb', 'bomb', 'tomb'],
    explanation: 'The letter B is silent after M in many English words.'
  },
  
  // Silent K
  {
    word: 'knife',
    letters: ['k', 'n', 'i', 'f', 'e'],
    silentLetter: 'k',
    silentLetterType: 'Silent K',
    examples: ['knee', 'know', 'knock'],
    explanation: 'The letter K is silent when it comes before N at the beginning of a word.'
  },
  {
    word: 'know',
    letters: ['k', 'n', 'o', 'w'],
    silentLetter: 'k',
    silentLetterType: 'Silent K',
    examples: ['knee', 'knife', 'knight'],
    explanation: 'K before N is always silent in English words.'
  },
  
  // Silent L
  {
    word: 'half',
    letters: ['h', 'a', 'l', 'f'],
    silentLetter: 'l',
    silentLetterType: 'Silent L',
    examples: ['walk', 'talk', 'calm'],
    explanation: 'The letter L is often silent before consonants like F, K, and M.'
  },
  {
    word: 'walk',
    letters: ['w', 'a', 'l', 'k'],
    silentLetter: 'l',
    silentLetterType: 'Silent L',
    examples: ['talk', 'chalk', 'stalk'],
    explanation: 'L is silent before K in most English words.'
  },
  
  // Silent W
  {
    word: 'write',
    letters: ['w', 'r', 'i', 't', 'e'],
    silentLetter: 'w',
    silentLetterType: 'Silent W',
    examples: ['wrong', 'wrist', 'wrap'],
    explanation: 'The letter W is silent when it comes before R.'
  },
  {
    word: 'wrong',
    letters: ['w', 'r', 'o', 'n', 'g'],
    silentLetter: 'w',
    silentLetterType: 'Silent W',
    examples: ['write', 'wrist', 'wreck'],
    explanation: 'W before R is always silent in English.'
  },
  
  // Silent H
  {
    word: 'hour',
    letters: ['h', 'o', 'u', 'r'],
    silentLetter: 'h',
    silentLetterType: 'Silent H',
    examples: ['honest', 'heir', 'honor'],
    explanation: 'The letter H is silent in some words borrowed from French.'
  },
  
  // Silent T
  {
    word: 'castle',
    letters: ['c', 'a', 's', 't', 'l', 'e'],
    silentLetter: 't',
    silentLetterType: 'Silent T',
    examples: ['listen', 'whistle', 'christmas'],
    explanation: 'The letter T is often silent in the combinations STL and STN.'
  }
]

// 現在の問題
const currentWord = ref({})
const availableWords = ref([...silentLetterWords])

// 計算プロパティ
const progress = computed(() => {
  if (stats.value.totalCases === 0) return 0
  return (currentCaseNumber.value - 1) / silentLetterWords.length * 100
})

const accuracy = computed(() => {
  if (stats.value.totalCases === 0) return 0
  return (stats.value.correct / stats.value.totalCases) * 100
})

const feedbackClass = computed(() => {
  return isCorrect.value 
    ? 'bg-green-100 border-green-500 text-green-800'
    : 'bg-red-100 border-red-500 text-red-800'
})

const feedbackEmoji = computed(() => {
  return isCorrect.value ? '🎯' : '🔍'
})

const feedbackTitle = computed(() => {
  return isCorrect.value ? 'Case Solved!' : 'Keep Investigating!'
})

const feedbackMessage = computed(() => {
  return isCorrect.value 
    ? 'Excellent detective work! You found the silent letter.'
    : 'Not quite right. Listen again and try another letter.'
})

// メソッド
const initializeGame = () => {
  gameState.value = 'loading'
  
  setTimeout(() => {
    loadNextCase()
    gameState.value = 'playing'
  }, 1500)
}

const loadNextCase = () => {
  if (availableWords.value.length === 0) {
    gameState.value = 'completed'
    return
  }
  
  const randomIndex = Math.floor(Math.random() * availableWords.value.length)
  currentWord.value = availableWords.value[randomIndex]
  availableWords.value.splice(randomIndex, 1)
  
  selectedLetter.value = null
  showFeedback.value = false
  isCorrect.value = false
}

const selectLetter = (letter) => {
  if (selectedLetter.value !== null) return
  
  selectedLetter.value = letter
  isCorrect.value = letter === currentWord.value.silentLetter
  showFeedback.value = true
  
  stats.value.totalCases++
  if (isCorrect.value) {
    stats.value.correct++
    playSuccessSound()
  } else {
    stats.value.incorrect++
    playErrorSound()
  }
}

const getLetterButtonClass = (letter) => {
  const baseClass = 'evidence-button relative bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg border-2 border-gray-500 transition-all duration-300 transform hover:scale-105'
  
  if (selectedLetter.value === null) {
    return baseClass + ' hover:border-detective-gold hover:shadow-lg hover:shadow-detective-gold/50'
  }
  
  if (letter === selectedLetter.value) {
    if (isCorrect.value) {
      return baseClass + ' bg-green-600 border-green-400 shadow-lg shadow-green-400/50 animate-pulse'
    } else {
      return baseClass + ' bg-red-600 border-red-400 shadow-lg shadow-red-400/50 animate-bounce'
    }
  }
  
  if (letter === currentWord.value.silentLetter && selectedLetter.value !== null) {
    return baseClass + ' bg-green-600 border-green-400 shadow-lg shadow-green-400/50'
  }
  
  return baseClass + ' opacity-50'
}

const nextCase = () => {
  if (isCorrect.value) {
    currentCaseNumber.value++
    loadNextCase()
  } else {
    selectedLetter.value = null
    showFeedback.value = false
  }
}

const playWordAudio = () => {
  if (isPlayingAudio.value) return
  
  isPlayingAudio.value = true
  
  // Web Speech API を使用
  const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
  utterance.rate = 0.8
  utterance.volume = settings.value.volume / 100
  
  utterance.onend = () => {
    isPlayingAudio.value = false
  }
  
  speechSynthesis.speak(utterance)
}

const playSuccessSound = () => {
  // 成功音の効果音（実装時はAudio APIを使用）
  console.log('Success sound played')
}

const playErrorSound = () => {
  // エラー音の効果音（実装時はAudio APIを使用）
  console.log('Error sound played')
}

const restartGame = () => {
  availableWords.value = [...silentLetterWords]
  currentCaseNumber.value = 1
  stats.value = { correct: 0, incorrect: 0, totalCases: 0 }
  initializeGame()
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const saveSettings = () => {
  // 設定をローカルストレージに保存
  localStorage.setItem('silentDetectiveSettings', JSON.stringify(settings.value))
  showSettings.value = false
}

const loadSettings = () => {
  const saved = localStorage.getItem('silentDetectiveSettings')
  if (saved) {
    settings.value = { ...settings.value, ...JSON.parse(saved) }
  }
}

// ライフサイクル
onMounted(() => {
  loadSettings()
  initializeGame()
})

onUnmounted(() => {
  // 音声再生を停止
  speechSynthesis.cancel()
})
</script>

<style scoped>
/* 探偵テーマのカスタムスタイル */
.silent-letter-detective {
  --detective-dark: #1a1a1a;
  --detective-gold: #ffd700;
  --detective-shadow: #000000cc;
  
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  font-family: 'Georgia', serif;
}

/* フィルムグレインエフェクト */
.film-grain {
  background-image: 
    radial-gradient(circle, transparent 20%, rgba(255,255,255,0.3) 21%, transparent 21%),
    linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.03) 50%);
  background-size: 4px 4px, 2px 2px;
  animation: grain 8s steps(10) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0) }
  10% { transform: translate(-5%, -10%) }
  20% { transform: translate(-15%, 5%) }
  30% { transform: translate(7%, -25%) }
  40% { transform: translate(-5%, 25%) }
  50% { transform: translate(-15%, 10%) }
  60% { transform: translate(15%, 0%) }
  70% { transform: translate(0%, 15%) }
  80% { transform: translate(3%, 35%) }
  90% { transform: translate(-10%, 10%) }
}

/* 進捗バー */
.progress-container {
  width: 100%;
  height: 12px;
  background: #374151;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e, #facc15);
  border-radius: 6px;
  transition: width 0.8s ease-in-out;
  position: relative;
}

.progress-bar::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255,255,255,0.4), 
    transparent
  );
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ケースファイル */
.case-file {
  position: relative;
  box-shadow: 
    0 10px 25px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transform: perspective(1000px) rotateX(2deg);
}

.case-file::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 20px;
  width: 30px;
  height: 20px;
  background: #8b5a2b;
  border-radius: 50%;
  box-shadow: 0 5px 10px rgba(0,0,0,0.3);
}

/* 証拠ボード */
.evidence-board {
  background: 
    linear-gradient(45deg, #1f2937 25%, transparent 25%),
    linear-gradient(-45deg, #1f2937 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1f2937 75%),
    linear-gradient(-45deg, transparent 75%, #1f2937 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
}

/* 証拠ボタン */
.evidence-button {
  position: relative;
  min-height: 80px;
  background: linear-gradient(145deg, #374151, #1f2937);
  box-shadow: 
    0 4px 15px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

.evidence-button:not(:disabled):hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(255,215,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.letter-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

.evidence-number {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 0.75rem;
  color: #9ca3af;
  background: rgba(0,0,0,0.5);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 音声ボタン */
.detective-audio {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

.detective-audio:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
}

.detective-audio:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* フィードバックカード */
.feedback-card {
  animation: feedback-appear 0.5s ease-out;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

@keyframes feedback-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ケース解決アニメーション */
.case-solved-animation {
  animation: case-solved 1s ease-out;
}

@keyframes case-solved {
  0% {
    transform: scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 統計ボード */
.stats-board {
  background: linear-gradient(145deg, #1f2937, #111827);
  box-shadow: 
    0 10px 25px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

/* ローディングスピナー */
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #374151;
  border-top: 4px solid #ffd700;
  border-radius: 50%;
  animation: loading-spin 1s linear infinite;
}

@keyframes loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* モーダル */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: linear-gradient(145deg, #ffffff, #f3f4f6);
  border-radius: 15px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: modal-appear 0.3s ease-out;
  color: #1f2937;
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .case-file {
    padding: 1.5rem;
    transform: none;
  }
  
  .evidence-button {
    min-height: 70px;
    font-size: 0.9rem;
  }
  
  .letter-display {
    font-size: 1.25rem;
  }
  
  .detective-audio {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .evidence-board .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .case-file h2 {
    font-size: 1.5rem;
  }
  
  .case-file .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* アニメーション効果の強化 */
.evidence-button.animate-bounce {
  animation: detective-wrong 0.5s ease-in-out;
}

@keyframes detective-wrong {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

.evidence-button.animate-pulse {
  animation: detective-correct 0.8s ease-in-out;
}

@keyframes detective-correct {
  0% { 
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
  }
  50% { 
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.6);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
  }
}

/* タイプライター効果 */
.typewriter {
  overflow: hidden;
  border-right: 2px solid #ffd700;
  white-space: nowrap;
  animation: 
    typing 2s steps(40, end),
    blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: #ffd700; }
}

/* 追加のビジュアルエフェクト */
.spotlight {
  animation: spotlight-move 10s infinite ease-in-out;
}

@keyframes spotlight-move {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(100px, -50px); }
  50% { transform: translate(-50px, 100px); }
  75% { transform: translate(150px, 50px); }
}

/* カスタムスクロールバー */
.silent-letter-detective ::-webkit-scrollbar {
  width: 8px;
}

.silent-letter-detective ::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

.silent-letter-detective ::-webkit-scrollbar-thumb {
  background: #ffd700;
  border-radius: 4px;
}

.silent-letter-detective ::-webkit-scrollbar-thumb:hover {
  background: #facc15;
}
</style>