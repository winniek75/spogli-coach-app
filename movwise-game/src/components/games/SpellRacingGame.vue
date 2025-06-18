<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
      <div class="nebula-clouds"></div>
    </div>

    <!-- Game Header -->
    <div class="relative z-10 p-4">
      <div class="flex items-center justify-between mb-4">
        <button 
          @click="goBack"
          class="flex items-center gap-2 galaxy-button galaxy-button-secondary px-4 py-2 rounded-full font-bold transition-all shadow-lg"
        >
          <ArrowLeft class="w-5 h-5" />
          戻る
        </button>

        <h1 class="text-3xl font-bold text-center">
          <span class="galaxy-text-primary cosmic-glow">
            🚀 スペル・レーシング
          </span>
        </h1>

        <button 
          @click="toggleSound"
          :class="[
            'p-2 rounded-full font-bold transition-all shadow-lg',
            soundEnabled 
              ? 'galaxy-button galaxy-button-primary' 
              : 'galaxy-button galaxy-button-secondary'
          ]"
        >
          <Volume2 v-if="soundEnabled" class="w-5 h-5" />
          <VolumeX v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Race Stats -->
      <div class="flex justify-center gap-4 mb-6">
        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Trophy class="w-5 h-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ score }}点</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Clock class="w-5 h-5 text-blue-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ Math.max(0, timeLeft) }}秒</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Zap class="w-5 h-5 text-purple-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ speed }}km/h</span>
          </div>
        </div>

        <div class="galaxy-card rounded-2xl px-4 py-2 shadow-lg">
          <div class="flex items-center gap-2">
            <Target class="w-5 h-5 text-green-400 cosmic-glow" />
            <span class="font-bold text-galaxy-moon-silver">{{ currentLap }}/{{ totalLaps }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Racing Area -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
      <!-- Game Start Screen -->
      <div v-if="gameState === 'start'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <div class="text-6xl mb-6">🚀</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-4">
            宇宙レース開始！
          </h2>
          <p class="text-lg text-galaxy-moon-silver mb-6">
            音声で宇宙船を操縦しよう！<br>
            正しい発音で最速タイムを目指せ！
          </p>
          
          <div class="space-y-4 mb-6">
            <div class="galaxy-card rounded-xl p-4">
              <div class="text-sm text-galaxy-moon-silver mb-2">🎮 簡単操縦法:</div>
              <div class="space-y-2 text-sm">
                <div>🎯 <span class="text-blue-400 font-bold">"LEFT"</span> → 左へ移動</div>
                <div>🎯 <span class="text-green-400 font-bold">"RIGHT"</span> → 右へ移動</div>
                <div>🎯 <span class="text-purple-400 font-bold">"UP"</span> → ジャンプ</div>
                <div>🎯 <span class="text-pink-400 font-bold">"BOOST"</span> → 加速</div>
              </div>
            </div>

            <div class="galaxy-card rounded-xl p-4">
              <div class="text-sm text-galaxy-moon-silver mb-2">🔮 Magic E操縦:</div>
              <div class="space-y-1 text-xs">
                <div><span class="text-yellow-400">bit → bite</span> (左→右)</div>
                <div><span class="text-yellow-400">cut → cute</span> (加速→ジャンプ)</div>
                <div class="text-gray-400 mt-2">※英語でも日本語でもOK！</div>
              </div>
            </div>

            <div class="galaxy-card rounded-xl p-4">
              <div class="text-sm text-galaxy-moon-silver mb-2">⚡ ゲームのコツ:</div>
              <div class="space-y-1 text-xs text-gray-300">
                <div>• 音声認識は常時ON状態</div>
                <div>• 発音後すぐに反応します</div>
                <div>• 障害物を避けて星を集めよう</div>
              </div>
            </div>
          </div>

          <button
            @click="startRace"
            class="galaxy-button galaxy-button-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            レース開始！
          </button>
        </div>
      </div>

      <!-- Racing Game -->
      <div v-else-if="gameState === 'racing'" class="w-full max-w-6xl">
        <!-- Race Track -->
        <div class="race-track relative mx-auto mb-6" :style="{ height: '400px', width: '800px' }">
          <!-- Track Background -->
          <div class="absolute inset-0 rounded-3xl overflow-hidden">
            <div class="space-track"></div>
            <!-- Track boundaries -->
            <div class="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-blue-500 to-transparent"></div>
            <div class="absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-blue-500 to-transparent"></div>
            <!-- Center line -->
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-full bg-gradient-to-b from-yellow-400 via-transparent to-yellow-400 opacity-50"></div>
          </div>

          <!-- Obstacles -->
          <div 
            v-for="(obstacle, index) in obstacles" 
            :key="index"
            class="absolute transform -translate-x-1/2 text-4xl transition-all duration-100"
            :style="{
              left: `${obstacle.x}%`,
              top: `${obstacle.y}%`,
            }"
          >
            {{ obstacle.emoji }}
          </div>

          <!-- Speed Boosts -->
          <div 
            v-for="(boost, index) in speedBoosts" 
            :key="index"
            class="absolute transform -translate-x-1/2 text-3xl transition-all duration-100 animate-pulse"
            :style="{
              left: `${boost.x}%`,
              top: `${boost.y}%`,
            }"
          >
            ⚡
          </div>

          <!-- Player Spaceship -->
          <div 
            class="absolute transform -translate-x-1/2 text-6xl transition-all duration-300 spaceship"
            :style="{
              left: `${playerX}%`,
              top: `${playerY}%`,
              transform: `translateX(-50%) ${playerJumping ? 'translateY(-20px) scale(1.2)' : ''}`
            }"
          >
            🚀
          </div>

          <!-- Finish Line -->
          <div 
            v-if="showFinishLine"
            class="absolute top-0 w-full h-8 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80 animate-pulse"
            :style="{ top: `${finishLineY}%` }"
          >
            <div class="text-center text-white font-bold text-lg leading-8">🏁 FINISH 🏁</div>
          </div>
        </div>

        <!-- Enhanced Voice Control Panel -->
        <div class="galaxy-card rounded-2xl p-6 max-w-md mx-auto">
          <div class="text-center mb-4">
            <div class="text-xl font-bold text-galaxy-moon-silver mb-4">
              🎤 音声コマンドセンター
            </div>
            
            <!-- Voice Recognition Status -->
            <div class="mb-4 p-3 rounded-xl" :class="listening ? 'bg-green-900 border border-green-400' : 'bg-gray-800 border border-gray-600'">
              <div class="flex items-center justify-center gap-2">
                <div :class="listening ? 'animate-pulse text-green-400' : 'text-gray-400'">
                  🎙️
                </div>
                <span class="font-bold" :class="listening ? 'text-green-300' : 'text-gray-400'">
                  {{ listening ? '音声認識中...' : '音声待機中' }}
                </span>
              </div>
            </div>

            <!-- Quick Command Reference -->
            <div class="mb-4 p-3 bg-blue-900 rounded-xl border border-blue-400">
              <div class="text-sm text-blue-300 mb-2">クイックコマンド:</div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="text-blue-200">LEFT → ←</div>
                <div class="text-blue-200">RIGHT → →</div>
                <div class="text-blue-200">UP → ↑</div>
                <div class="text-blue-200">BOOST → ⚡</div>
              </div>
            </div>

            <!-- Real-time Voice Recognition -->
            <div v-if="recognizedText" class="mb-4 p-3 bg-yellow-900 rounded-xl border border-yellow-400">
              <div class="text-sm text-yellow-300 mb-1">音声入力:</div>
              <div class="text-lg font-bold text-yellow-100">{{ recognizedText }}</div>
            </div>

            <!-- Last Command Executed -->
            <div v-if="lastCommand" class="mb-4 p-3 bg-green-900 rounded-xl border border-green-400 animate-pulse">
              <div class="text-sm text-green-300 mb-1">実行コマンド:</div>
              <div class="text-lg font-bold text-green-100">{{ lastCommand }}</div>
            </div>

            <!-- Manual Voice Control -->
            <div class="mb-4">
              <button
                @click="toggleListening"
                :disabled="!speechSupported"
                :class="[
                  'w-full px-6 py-3 rounded-xl font-bold text-white transition-all',
                  listening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'galaxy-button galaxy-button-primary hover:shadow-lg'
                ]"
              >
                <Mic class="w-5 h-5 inline mr-2" />
                {{ listening ? '音声認識停止' : '音声認識開始' }}
              </button>
            </div>

            <!-- Game Tips -->
            <div class="text-xs text-gray-400 mt-4">
              💡 コツ: はっきりと短く発音しましょう！
            </div>
          </div>
        </div>
      </div>

      <!-- Race Results -->
      <div v-else-if="gameState === 'finished'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-lg mx-auto">
          <div class="text-8xl mb-6">🏆</div>
          <h2 class="text-4xl font-bold galaxy-text-primary cosmic-glow mb-4">
            レース完走！
          </h2>
          
          <div class="space-y-4 mb-6">
            <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4">
              <div class="text-2xl font-bold text-yellow-700">最終スコア</div>
              <div class="text-4xl font-bold text-yellow-800">{{ score }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-blue-700">完走タイム</div>
                <div class="text-2xl font-bold text-blue-800">{{ raceTime }}秒</div>
              </div>
              <div class="bg-purple-100 rounded-2xl p-3">
                <div class="text-lg font-bold text-purple-700">最高速度</div>
                <div class="text-2xl font-bold text-purple-800">{{ maxSpeed }}km/h</div>
              </div>
            </div>

            <div class="bg-green-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-green-700 mb-2">習得コマンド</div>
              <div class="flex flex-wrap gap-2 justify-center">
                <span 
                  v-for="command in masteredCommands" 
                  :key="command"
                  class="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold"
                >
                  {{ command }}
                </span>
              </div>
            </div>

            <div class="bg-orange-100 rounded-2xl p-4">
              <div class="text-lg font-bold text-orange-700">発音精度</div>
              <div class="text-2xl font-bold text-orange-800">{{ averageAccuracy }}%</div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="restartRace"
              class="flex-1 galaxy-button galaxy-button-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              もう一度レース
            </button>
            <button
              @click="goBack"
              class="flex-1 galaxy-button galaxy-button-secondary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              戻る
            </button>
          </div>
        </div>
      </div>

      <!-- Game Over -->
      <div v-else-if="gameState === 'gameOver'" class="text-center">
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <div class="text-6xl mb-4">💥</div>
          <h2 class="text-3xl font-bold text-red-400 cosmic-glow mb-4">クラッシュ！</h2>
          <p class="text-lg text-galaxy-moon-silver mb-6">
            障害物に衝突しました。もう一度挑戦しよう！
          </p>
          
          <div class="galaxy-card rounded-2xl p-4 mb-6">
            <div class="text-lg font-bold text-galaxy-moon-silver">走行距離</div>
            <div class="text-3xl font-bold text-yellow-400 cosmic-glow">{{ Math.round(distance) }}m</div>
          </div>

          <div class="flex gap-4">
            <button
              @click="restartRace"
              class="flex-1 galaxy-button galaxy-button-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              リトライ
            </button>
            <button
              @click="goBack"
              class="flex-1 galaxy-button galaxy-button-secondary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Speed Effect -->
    <div 
      v-if="gameState === 'racing' && speed > 100"
      class="fixed inset-0 pointer-events-none z-5"
    >
      <div class="speed-lines"></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { getAllMagicEWords, getRandomMagicEPair } from '@/data/magicEWords'
import { 
  ArrowLeft, Volume2, VolumeX, Trophy, Clock, Zap, Target, Mic
} from 'lucide-vue-next'

export default {
  name: 'SpellRacingGame',
  components: {
    ArrowLeft,
    Volume2,
    VolumeX,
    Trophy,
    Clock,
    Zap,
    Target,
    Mic
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()

    // Game State
    const gameState = ref('start') // 'start', 'racing', 'finished', 'gameOver'
    const score = ref(0)
    const timeLeft = ref(120) // 2 minutes
    const speed = ref(50)
    const maxSpeed = ref(50)
    const currentLap = ref(1)
    const totalLaps = ref(3)
    const soundEnabled = ref(true)
    const raceTime = ref(0)
    const distance = ref(0)

    // Player Position
    const playerX = ref(50) // percentage
    const playerY = ref(80) // percentage from top
    const playerJumping = ref(false)

    // Game Elements
    const obstacles = ref([])
    const speedBoosts = ref([])
    const showFinishLine = ref(false)
    const finishLineY = ref(0)

    // Voice Recognition
    const listening = ref(false)
    const recognizedText = ref('')
    const lastCommand = ref('')
    const speechRecognition = ref(null)
    const speechSupported = ref(false)
    const currentChallenge = ref(null)
    const masteredCommands = ref([])
    const accuracyScores = ref([])

    // Game Logic
    let gameLoop = null
    let raceTimer = null

    // Voice Commands - 簡単で直感的なシステム
    const voiceCommands = [
      // 基本コマンド（英語 - わかりやすい）
      { word: 'left', action: '左に移動', command: 'moveLeft' },
      { word: 'right', action: '右に移動', command: 'moveRight' },
      { word: 'up', action: 'ジャンプ', command: 'jump' },
      { word: 'boost', action: '加速', command: 'boost' },
      
      // 日本語コマンド
      { word: 'ひだり', action: '左に移動', command: 'moveLeft' },
      { word: 'みぎ', action: '右に移動', command: 'moveRight' },
      { word: 'ジャンプ', action: 'ジャンプ', command: 'jump' },
      { word: 'かそく', action: '加速', command: 'boost' },
      
      // Magic E 単語ペア（基本4つ）
      { word: 'bit', action: '左に移動', command: 'moveLeft' },
      { word: 'bite', action: '右に移動', command: 'moveRight' },
      { word: 'cut', action: '加速', command: 'boost' },
      { word: 'cute', action: 'ジャンプ', command: 'jump' },
      
      // 追加Magic E
      { word: 'cap', action: '左に移動', command: 'moveLeft' },
      { word: 'cape', action: '右に移動', command: 'moveRight' },
      { word: 'tap', action: '加速', command: 'boost' },
      { word: 'tape', action: 'ジャンプ', command: 'jump' },
      
      { word: 'hop', action: '左に移動', command: 'moveLeft' },
      { word: 'hope', action: '右に移動', command: 'moveRight' },
      { word: 'not', action: '加速', command: 'boost' },
      { word: 'note', action: 'ジャンプ', command: 'jump' }
    ]

    // Computed Properties
    const averageAccuracy = computed(() => {
      if (accuracyScores.value.length === 0) return 0
      return Math.round(accuracyScores.value.reduce((a, b) => a + b, 0) / accuracyScores.value.length)
    })

    // Initialize Game
    const initGame = () => {
      gameState.value = 'start'
      score.value = 0
      timeLeft.value = 120
      speed.value = 50
      maxSpeed.value = 50
      currentLap.value = 1
      playerX.value = 50
      playerY.value = 80
      playerJumping.value = false
      distance.value = 0
      raceTime.value = 0
      obstacles.value = []
      speedBoosts.value = []
      masteredCommands.value = []
      accuracyScores.value = []
      showFinishLine.value = false
      
      initSpeechRecognition()
      generateRandomChallenge()
    }

    // Speech Recognition Setup
    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        speechRecognition.value = new SpeechRecognition()
        speechRecognition.value.continuous = false
        speechRecognition.value.interimResults = false
        speechRecognition.value.lang = 'en-US'
        
        speechRecognition.value.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase().trim()
          recognizedText.value = transcript
          processVoiceCommand(transcript)
          listening.value = false
        }

        speechRecognition.value.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          listening.value = false
        }

        speechRecognition.value.onend = () => {
          listening.value = false
        }

        speechSupported.value = true
      }
    }

    // Process voice commands
    const processVoiceCommand = (transcript) => {
      const command = voiceCommands.find(cmd => 
        transcript.includes(cmd.word) || cmd.word.includes(transcript)
      )

      if (command) {
        const accuracy = calculateAccuracy(transcript, command.word)
        accuracyScores.value.push(accuracy)
        
        if (accuracy >= 60) {
          executeCommand(command.command)
          lastCommand.value = command.action
          
          if (!masteredCommands.value.includes(command.word)) {
            masteredCommands.value.push(command.word)
            score.value += 20
          }
          
          score.value += Math.round(accuracy / 10)
          generateRandomChallenge()
        }
      }
    }

    const calculateAccuracy = (transcript, target) => {
      if (transcript === target) return 100
      if (transcript.includes(target) || target.includes(transcript)) return 80
      
      const similarity = calculateSimilarity(transcript, target)
      return Math.max(0, Math.min(75, similarity * 100))
    }

    const calculateSimilarity = (str1, str2) => {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
      
      if (longer.length === 0) return 1.0
      
      let editDistance = 0
      for (let i = 0; i < longer.length; i++) {
        if (i >= shorter.length || longer[i] !== shorter[i]) {
          editDistance++
        }
      }
      
      return (longer.length - editDistance) / longer.length
    }

    // Execute movement commands
    const executeCommand = (command) => {
      switch (command) {
        case 'moveLeft':
          playerX.value = Math.max(15, playerX.value - 20)
          break
        case 'moveRight':
          playerX.value = Math.min(85, playerX.value + 20)
          break
        case 'boost':
          speed.value = Math.min(200, speed.value + 20)
          maxSpeed.value = Math.max(maxSpeed.value, speed.value)
          setTimeout(() => {
            speed.value = Math.max(50, speed.value - 10)
          }, 2000)
          break
        case 'jump':
          if (!playerJumping.value) {
            playerJumping.value = true
            setTimeout(() => {
              playerJumping.value = false
            }, 1000)
          }
          break
      }
    }

    // Generate random challenge
    const generateRandomChallenge = () => {
      currentChallenge.value = voiceCommands[Math.floor(Math.random() * voiceCommands.length)]
    }

    // Game Loop
    const startGameLoop = () => {
      gameLoop = setInterval(() => {
        updateGame()
      }, 50) // 20 FPS

      raceTimer = setInterval(() => {
        timeLeft.value--
        raceTime.value++
        
        if (timeLeft.value <= 0) {
          endRace()
        }
      }, 1000)
    }

    const updateGame = () => {
      // Update distance
      distance.value += speed.value / 20

      // Move obstacles down
      obstacles.value.forEach(obstacle => {
        obstacle.y += speed.value / 10
      })

      // Move speed boosts down
      speedBoosts.value.forEach(boost => {
        boost.y += speed.value / 10
      })

      // Remove off-screen obstacles
      obstacles.value = obstacles.value.filter(obstacle => obstacle.y < 110)
      speedBoosts.value = speedBoosts.value.filter(boost => boost.y < 110)

      // Generate new obstacles
      if (Math.random() < 0.02) {
        obstacles.value.push({
          x: 20 + Math.random() * 60,
          y: -10,
          emoji: ['🌌', '☄️', '🛸', '👽'][Math.floor(Math.random() * 4)]
        })
      }

      // Generate speed boosts
      if (Math.random() < 0.01) {
        speedBoosts.value.push({
          x: 30 + Math.random() * 40,
          y: -10
        })
      }

      // Check collisions
      checkCollisions()

      // Check finish line
      if (distance.value >= 1000 * currentLap.value) {
        if (currentLap.value >= totalLaps.value) {
          endRace()
        } else {
          currentLap.value++
          showFinishLine.value = true
          finishLineY.value = 0
          setTimeout(() => {
            showFinishLine.value = false
          }, 2000)
        }
      }

      // Gradually decrease speed
      if (speed.value > 50) {
        speed.value = Math.max(50, speed.value - 0.5)
      }
    }

    const checkCollisions = () => {
      const playerRect = {
        x: playerX.value - 5,
        y: playerY.value - 5,
        width: 10,
        height: 10
      }

      // Check obstacle collisions
      obstacles.value.forEach((obstacle, index) => {
        const obstacleRect = {
          x: obstacle.x - 3,
          y: obstacle.y - 3,
          width: 6,
          height: 6
        }

        if (isColliding(playerRect, obstacleRect) && !playerJumping.value) {
          gameState.value = 'gameOver'
          stopGameLoop()
        }
      })

      // Check speed boost collisions
      speedBoosts.value.forEach((boost, index) => {
        const boostRect = {
          x: boost.x - 3,
          y: boost.y - 3,
          width: 6,
          height: 6
        }

        if (isColliding(playerRect, boostRect)) {
          speed.value = Math.min(200, speed.value + 15)
          score.value += 10
          speedBoosts.value.splice(index, 1)
        }
      })
    }

    const isColliding = (rect1, rect2) => {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y
    }

    const stopGameLoop = () => {
      if (gameLoop) {
        clearInterval(gameLoop)
        gameLoop = null
      }
      if (raceTimer) {
        clearInterval(raceTimer)
        raceTimer = null
      }
      if (speechRecognition.value) {
        speechRecognition.value.stop()
        listening.value = false
      }
    }

    // Game Flow
    const startRace = () => {
      gameState.value = 'racing'
      startGameLoop()
      startContinuousListening() // 常時音声認識開始
    }

    const endRace = () => {
      gameState.value = 'finished'
      stopGameLoop()
      
      // Calculate final score
      const timeBonus = Math.max(0, timeLeft.value * 2)
      const speedBonus = Math.round(maxSpeed.value)
      score.value += timeBonus + speedBonus

      // Save progress
      const gameData = {
        completed: true,
        bestScore: Math.max(gameStore.getGameProgress('spellRacing').bestScore || 0, score.value),
        lastScore: score.value,
        masteredCommands: masteredCommands.value,
        averageAccuracy: averageAccuracy.value
      }

      gameStore.updateGameProgress('spellRacing', gameData)
    }

    const restartRace = () => {
      stopGameLoop()
      initGame()
    }

    // Voice Controls
    const startContinuousListening = () => {
      if (!speechSupported.value) return
      
      speechRecognition.value.continuous = true
      speechRecognition.value.interimResults = true
      
      speechRecognition.value.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
        recognizedText.value = transcript
        
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript)
        }
      }

      speechRecognition.value.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        // エラー時は自動的に再開
        setTimeout(() => {
          if (gameState.value === 'racing') {
            startContinuousListening()
          }
        }, 1000)
      }

      speechRecognition.value.onend = () => {
        // レース中なら自動的に再開
        if (gameState.value === 'racing') {
          setTimeout(() => {
            speechRecognition.value.start()
          }, 100)
        }
      }
      
      speechRecognition.value.start()
      listening.value = true
    }

    const toggleListening = () => {
      if (!speechSupported.value) return

      if (listening.value) {
        speechRecognition.value.stop()
        listening.value = false
      } else {
        startContinuousListening()
      }
    }

    const playTargetSound = () => {
      if (!soundEnabled.value || !currentChallenge.value) return

      try {
        const utterance = new SpeechSynthesisUtterance(currentChallenge.value.word)
        utterance.lang = 'en-US'
        utterance.rate = 0.7
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('TTS error:', error)
      }
    }

    // Utility Functions
    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
    }

    const goBack = () => {
      stopGameLoop()
      router.back()
    }

    // Lifecycle
    onMounted(() => {
      console.log('🚀 Spell Racing Game started')
      initGame()
    })

    onUnmounted(() => {
      stopGameLoop()
      if (speechRecognition.value) {
        speechRecognition.value.stop()
      }
    })

    return {
      // State
      gameState,
      score,
      timeLeft,
      speed,
      maxSpeed,
      currentLap,
      totalLaps,
      soundEnabled,
      raceTime,
      distance,
      playerX,
      playerY,
      playerJumping,
      obstacles,
      speedBoosts,
      showFinishLine,
      finishLineY,
      listening,
      recognizedText,
      lastCommand,
      speechSupported,
      currentChallenge,
      masteredCommands,
      
      // Computed
      averageAccuracy,
      
      // Methods
      startRace,
      restartRace,
      toggleListening,
      playTargetSound,
      toggleSound,
      goBack
    }
  }
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

.nebula-clouds {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at 20% 50%, rgba(128, 0, 255, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%);
  animation: nebula-drift 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

@keyframes nebula-drift {
  0%, 100% { transform: rotate(0deg) scale(1); }
  33% { transform: rotate(1deg) scale(1.1); }
  66% { transform: rotate(-1deg) scale(0.9); }
}

/* Galaxy-themed components - unified */
.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.8) 50%, 
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  color: white;
  padding: 0.5rem 1rem;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan-line 2s linear infinite;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.galaxy-button-listening {
  background: linear-gradient(135deg, 
    rgba(255, 100, 100, 0.5) 0%, 
    rgba(255, 150, 100, 0.5) 100%);
  border-color: rgba(255, 100, 100, 0.8);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

/* Race Track */
.space-track {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom,
    rgba(0, 0, 50, 0.8) 0%,
    rgba(0, 0, 100, 0.6) 50%,
    rgba(0, 0, 50, 0.8) 100%);
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: track-move 1s linear infinite;
}

.spaceship {
  filter: drop-shadow(0 0 15px rgba(100, 200, 255, 0.8));
  transition: all 0.3s ease;
}

.speed-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 100%);
  background-size: 100% 20px;
  animation: speed-lines 0.1s linear infinite;
}

@keyframes track-move {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 100%; }
}

@keyframes speed-lines {
  0% { transform: translateY(-20px); }
  100% { transform: translateY(20px); }
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* CSS Custom Properties for Space Theme */
:root {
  --space-void: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a3e 25%, 
    #2d1b69 50%, 
    #1e1e3f 75%, 
    #0f0f23 100%);
}

/* Responsive design */
@media (max-width: 768px) {
  .race-track {
    width: 100% !important;
    height: 300px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>