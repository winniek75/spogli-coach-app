<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- Music wave effects -->
    <div class="music-wave-effect"></div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="galaxy-card rounded-3xl p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="handleBack"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5 cosmic-glow" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold galaxy-text-primary cosmic-title mb-2">
              🎵 リズム・フォニックス・ダンス
            </h1>
            <p class="text-galaxy-moon-silver text-lg">音楽のリズムに合わせて正確な音素を選択しよう！</p>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- Dance Status -->
        <div class="grid grid-cols-4 gap-4">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🎵</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ danceData.combo }}</div>
            <div class="text-sm text-galaxy-moon-silver">コンボ</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">⭐</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ danceData.score }}</div>
            <div class="text-sm text-galaxy-moon-silver">スコア</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🔥</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ danceData.streak }}</div>
            <div class="text-sm text-galaxy-moon-silver">連続成功</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🎶</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ currentBPM }}</div>
            <div class="text-sm text-galaxy-moon-silver">BPM</div>
          </div>
        </div>
      </div>

      <!-- Song Selection -->
      <div v-if="gameState === 'menu'" class="galaxy-card rounded-3xl p-8">
        <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-8">楽曲を選択</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="song in songs" 
            :key="song.id"
            @click="selectSong(song)"
            :class="[
              'galaxy-card p-6 cursor-pointer transition-all duration-200 hover:scale-105',
              song.locked ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <div class="text-center">
              <div class="text-5xl mb-4 animate-pulse">{{ song.icon }}</div>
              <h3 class="text-xl font-bold galaxy-text-primary mb-2">{{ song.name }}</h3>
              <p class="text-galaxy-moon-silver text-sm mb-4">{{ song.description }}</p>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">BPM:</span>
                  <span class="text-blue-400 font-bold">{{ song.bpm }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">難易度:</span>
                  <div class="flex gap-1">
                    <span 
                      v-for="i in 5" 
                      :key="i"
                      class="w-2 h-2 rounded-full"
                      :class="i <= song.difficulty ? 'bg-pink-400' : 'bg-gray-600'"
                    ></span>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-galaxy-moon-silver">長さ:</span>
                  <span class="text-green-400 font-bold">{{ song.duration }}</span>
                </div>
              </div>
              
              <div v-if="song.locked" class="mt-4 text-red-400 text-sm">
                🔒 {{ song.unlockRequirement }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dance Game -->
      <div v-else-if="gameState === 'dancing'" class="space-y-6">
        <!-- Progress and Timer -->
        <div class="galaxy-card rounded-3xl p-6">
          <div class="flex justify-between items-center mb-4">
            <div class="text-lg font-bold galaxy-text-primary">{{ currentSong.name }}</div>
            <div class="text-lg font-bold galaxy-text-primary">{{ Math.ceil(timeRemaining) }}秒</div>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 h-3 rounded-full transition-all duration-200"
              :style="{ width: `${songProgress}%` }"
            />
          </div>
        </div>

        <!-- Beat Indicator -->
        <div class="text-center">
          <div 
            :class="[
              'w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl shadow-2xl transition-all duration-150',
              beatActive ? 'scale-125 bg-gradient-to-br from-pink-400 to-purple-500' : 'scale-100 bg-gradient-to-br from-gray-600 to-gray-800'
            ]"
          >
            {{ beatActive ? '🎵' : '🎶' }}
          </div>
          <div class="mt-4 text-2xl font-bold galaxy-text-primary">
            {{ beatCount }}/4
          </div>
        </div>

        <!-- Current Challenge -->
        <div v-if="currentChallenge" class="galaxy-card rounded-3xl p-8 text-center">
          <div class="mb-6">
            <div class="text-2xl font-bold galaxy-text-primary mb-4">{{ currentChallenge.instruction }}</div>
            <button 
              @click="playDanceSound"
              :disabled="isPlaying"
              class="w-20 h-20 galaxy-button galaxy-button-primary rounded-full text-3xl font-bold text-white animate-pulse"
            >
              🔊
            </button>
          </div>

          <!-- Dance Choices (appear on beat) -->
          <Transition name="dance-choices">
            <div v-if="showChoices" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                v-for="(choice, index) in danceChoices"
                :key="index"
                @click="danceMove(choice)"
                :class="[
                  'galaxy-card p-4 text-center cursor-pointer transition-all duration-200 transform hover:scale-110',
                  choice.symbol === selectedMove ? 'ring-4 ring-pink-400 scale-110' : '',
                  'animate-dance-choice'
                ]"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="text-3xl mb-2">{{ choice.symbol }}</div>
                <div class="text-sm text-galaxy-moon-silver">{{ choice.example }}</div>
              </button>
            </div>
          </Transition>
        </div>

        <!-- Combo Display -->
        <div v-if="danceData.combo > 0" class="text-center">
          <div 
            :class="[
              'inline-block px-6 py-3 rounded-full text-2xl font-bold',
              danceData.combo >= 10 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              danceData.combo >= 5 ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
              'bg-gradient-to-r from-blue-400 to-cyan-500'
            ]"
          >
            {{ danceData.combo }} COMBO!
          </div>
        </div>
      </div>

      <!-- Dance Result -->
      <Transition name="dance-feedback">
        <div 
          v-if="showDanceFeedback" 
          class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            :class="[
              'rounded-3xl px-12 py-10 text-4xl font-bold shadow-2xl flex flex-col items-center backdrop-blur-md',
              danceFeedbackType === 'perfect' ? 'bg-yellow-500/90 text-white animate-perfect' :
              danceFeedbackType === 'good' ? 'bg-green-500/90 text-white animate-good' :
              'bg-red-500/90 text-white animate-miss'
            ]"
          >
            <div class="mb-2">
              {{ danceFeedbackMessages[danceFeedbackType] }}
            </div>
            <div class="text-lg font-normal">{{ danceFeedbackDetail }}</div>
          </div>
        </div>
      </Transition>

      <!-- Song Complete -->
      <div v-if="gameState === 'complete'" class="galaxy-card rounded-3xl p-8 text-center">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-spin">
          <Music class="w-16 h-16 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold galaxy-text-primary mb-4">パフォーマンス完了！</h2>
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-yellow-400">{{ performanceData.finalScore }}</div>
            <div class="text-sm text-galaxy-moon-silver">最終スコア</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-pink-400">{{ performanceData.maxCombo }}</div>
            <div class="text-sm text-galaxy-moon-silver">最大コンボ</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl font-bold text-blue-400">{{ performanceData.accuracy }}%</div>
            <div class="text-sm text-galaxy-moon-silver">正確性</div>
          </div>
        </div>
        
        <div class="mb-6">
          <div class="text-lg font-bold galaxy-text-primary mb-2">ランク</div>
          <div class="text-6xl">{{ performanceRank }}</div>
        </div>
        
        <div class="flex gap-4 justify-center">
          <button 
            @click="returnToMenu"
            class="galaxy-button galaxy-button-secondary px-6 py-3 text-lg font-bold text-white rounded-xl"
          >
            楽曲選択に戻る
          </button>
          <button 
            @click="playAgain"
            class="galaxy-button galaxy-button-primary px-6 py-3 text-lg font-bold text-white rounded-xl"
          >
            もう一度踊る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Settings, Music } from 'lucide-vue-next'

export default {
  name: 'RhythmPhonicsDance',
  components: {
    ArrowLeft,
    Settings,
    Music
  },
  setup() {
    const router = useRouter()
    
    const gameState = ref('menu') // menu, dancing, complete
    const showSettings = ref(false)
    const showDanceFeedback = ref(false)
    const danceFeedbackType = ref('')
    const danceFeedbackDetail = ref('')
    const isPlaying = ref(false)
    const beatActive = ref(false)
    const beatCount = ref(0)
    const showChoices = ref(false)
    const selectedMove = ref('')
    const timeRemaining = ref(0)
    
    let beatTimer = null
    let songTimer = null
    
    const danceData = reactive({
      combo: 0,
      score: 0,
      streak: 0
    })
    
    const currentSong = ref(null)
    const currentChallenge = ref(null)
    const danceChoices = ref([])
    const currentBPM = ref(120)
    
    const songs = ref([
      {
        id: 1,
        name: 'フォニックス・ファンダンゴ',
        description: '基本音素でゆっくりダンス',
        icon: '💃',
        bpm: 100,
        difficulty: 1,
        duration: '2分',
        locked: false,
        totalBeats: 32
      },
      {
        id: 2,
        name: 'サンバ・サウンド',
        description: '情熱的なリズムで音素習得',
        icon: '🕺',
        bpm: 140,
        difficulty: 3,
        duration: '3分',
        locked: false,
        totalBeats: 48
      },
      {
        id: 3,
        name: 'エレクトロ・フォニックス',
        description: '未来的電子音楽でハードコア学習',
        icon: '🤖',
        bpm: 180,
        difficulty: 5,
        duration: '4分',
        locked: true,
        unlockRequirement: 'コンボ50達成で解放',
        totalBeats: 64
      }
    ])
    
    const performanceData = reactive({
      finalScore: 0,
      maxCombo: 0,
      accuracy: 0
    })
    
    const danceFeedbackMessages = {
      perfect: '🌟 PERFECT!',
      good: '👍 GOOD!',
      miss: '❌ MISS...'
    }
    
    const songProgress = computed(() => {
      if (!currentSong.value) return 0
      const totalTime = (currentSong.value.totalBeats * 60) / currentBPM.value
      return ((totalTime - timeRemaining.value) / totalTime) * 100
    })
    
    const performanceRank = computed(() => {
      const accuracy = performanceData.accuracy
      if (accuracy >= 95) return '🏆'
      if (accuracy >= 85) return '🥇'
      if (accuracy >= 75) return '🥈'
      if (accuracy >= 65) return '🥉'
      return '💪'
    })
    
    const selectSong = (song) => {
      if (song.locked) return
      
      currentSong.value = song
      currentBPM.value = song.bpm
      timeRemaining.value = (song.totalBeats * 60) / song.bpm
      
      danceData.combo = 0
      danceData.score = 0
      danceData.streak = 0
      
      startDancing()
    }
    
    const startDancing = () => {
      gameState.value = 'dancing'
      beatCount.value = 0
      loadNextChallenge()
      startBeatTimer()
      startSongTimer()
    }
    
    const startBeatTimer = () => {
      const beatInterval = (60 / currentBPM.value) * 1000 // ms per beat
      
      beatTimer = setInterval(() => {
        beatActive.value = true
        beatCount.value = (beatCount.value % 4) + 1
        
        // Show choices on beat 1
        if (beatCount.value === 1) {
          showChoices.value = true
          loadNextChallenge()
        }
        
        setTimeout(() => {
          beatActive.value = false
        }, 150)
        
        // Hide choices after beat 4
        if (beatCount.value === 4) {
          setTimeout(() => {
            showChoices.value = false
            if (selectedMove.value) {
              checkDanceMove()
            } else {
              // Miss - no move selected
              processDanceResult('miss')
            }
            selectedMove.value = ''
          }, beatInterval - 200)
        }
      }, beatInterval)
    }
    
    const startSongTimer = () => {
      songTimer = setInterval(() => {
        timeRemaining.value -= 0.1
        if (timeRemaining.value <= 0) {
          completeSong()
        }
      }, 100)
    }
    
    const loadNextChallenge = () => {
      const challenges = [
        { instruction: '短母音を選択！', phoneme: 'a', sound: 'a1.m4a' },
        { instruction: '子音を見つけよう！', phoneme: 's', sound: 's.m4a' },
        { instruction: '鼻音はどれ？', phoneme: 'm', sound: 'm.m4a' },
        { instruction: '破裂音を選択！', phoneme: 't', sound: 't.m4a' },
        { instruction: '長母音はどれ？', phoneme: 'e', sound: 'e1.m4a' }
      ]
      
      currentChallenge.value = challenges[Math.floor(Math.random() * challenges.length)]
      generateDanceChoices()
    }
    
    const generateDanceChoices = () => {
      const phonemes = [
        { symbol: 'a', example: 'cat', sound: 'a1.m4a' },
        { symbol: 'e', example: 'bed', sound: 'e1.m4a' },
        { symbol: 's', example: 'sun', sound: 's.m4a' },
        { symbol: 't', example: 'top', sound: 't.m4a' },
        { symbol: 'm', example: 'man', sound: 'm.m4a' },
        { symbol: 'i', example: 'bit', sound: 'i1.m4a' }
      ]
      
      const correct = phonemes.find(p => p.symbol === currentChallenge.value.phoneme)
      const wrong = phonemes.filter(p => p.symbol !== currentChallenge.value.phoneme)
        .sort(() => Math.random() - 0.5).slice(0, 3)
      
      danceChoices.value = [correct, ...wrong].sort(() => Math.random() - 0.5)
    }
    
    const playDanceSound = async () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      try {
        const audio = new Audio(`/sounds/${currentChallenge.value.sound}`)
        await audio.play()
        audio.onended = () => {
          isPlaying.value = false
        }
      } catch (error) {
        console.error('Failed to play sound:', error)
        isPlaying.value = false
      }
    }
    
    const danceMove = (choice) => {
      selectedMove.value = choice.symbol
    }
    
    const checkDanceMove = () => {
      const isCorrect = selectedMove.value === currentChallenge.value.phoneme
      const timing = beatCount.value === 4 ? 'perfect' : 'good'
      
      if (isCorrect) {
        processDanceResult(timing)
      } else {
        processDanceResult('miss')
      }
    }
    
    const processDanceResult = (result) => {
      danceFeedbackType.value = result
      
      if (result === 'perfect') {
        danceData.combo++
        danceData.streak++
        danceData.score += 100 + (danceData.combo * 10)
        danceFeedbackDetail.value = `+${100 + (danceData.combo * 10)} pts`
      } else if (result === 'good') {
        danceData.combo++
        danceData.streak++
        danceData.score += 50 + (danceData.combo * 5)
        danceFeedbackDetail.value = `+${50 + (danceData.combo * 5)} pts`
      } else {
        danceData.combo = 0
        danceData.streak = 0
        danceFeedbackDetail.value = 'コンボ切れ...'
      }
      
      showDanceFeedback.value = true
      setTimeout(() => {
        showDanceFeedback.value = false
      }, 800)
    }
    
    const completeSong = () => {
      clearInterval(beatTimer)
      clearInterval(songTimer)
      
      performanceData.finalScore = danceData.score
      performanceData.maxCombo = Math.max(performanceData.maxCombo, danceData.combo)
      performanceData.accuracy = Math.round((danceData.streak / (currentSong.value.totalBeats / 4)) * 100)
      
      gameState.value = 'complete'
    }
    
    const returnToMenu = () => {
      clearInterval(beatTimer)
      clearInterval(songTimer)
      gameState.value = 'menu'
      currentSong.value = null
    }
    
    const playAgain = () => {
      if (currentSong.value) {
        selectSong(currentSong.value)
      }
    }
    
    const handleBack = () => {
      router.back()
    }
    
    onUnmounted(() => {
      if (beatTimer) clearInterval(beatTimer)
      if (songTimer) clearInterval(songTimer)
    })
    
    return {
      gameState,
      showSettings,
      showDanceFeedback,
      danceFeedbackType,
      danceFeedbackDetail,
      isPlaying,
      beatActive,
      beatCount,
      showChoices,
      selectedMove,
      timeRemaining,
      danceData,
      currentSong,
      currentChallenge,
      danceChoices,
      currentBPM,
      songs,
      performanceData,
      danceFeedbackMessages,
      songProgress,
      performanceRank,
      selectSong,
      playDanceSound,
      danceMove,
      returnToMenu,
      playAgain,
      handleBack
    }
  }
}
</script>

<style scoped>
/* Galaxy background and music effects */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

.music-wave-effect {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 25% 75%, rgba(255, 20, 147, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 25%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(0, 191, 255, 0.2) 0%, transparent 50%);
  animation: music-pulse 2s ease-in-out infinite alternate;
}

@keyframes music-pulse {
  0% { filter: brightness(1) saturate(1); }
  100% { filter: brightness(1.3) saturate(1.2); }
}

.animate-dance-choice {
  animation: dance-bounce 0.6s ease-out;
}

.animate-perfect {
  animation: perfect-spin 1s ease-out;
}

.animate-good {
  animation: good-bounce 0.8s ease-out;
}

.animate-miss {
  animation: miss-shake 0.6s ease-out;
}

@keyframes dance-bounce {
  0% { transform: scale(0.3) translateY(50px); opacity: 0; }
  50% { transform: scale(1.1) translateY(-10px); opacity: 0.8; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes perfect-spin {
  0% { transform: scale(0.5) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes good-bounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes miss-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px) rotate(-5deg); }
  75% { transform: translateX(10px) rotate(5deg); }
}

.dance-choices-enter-active, .dance-choices-leave-active {
  transition: all 0.5s ease;
}

.dance-choices-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.8);
}

.dance-choices-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(1.2);
}

.dance-feedback-enter-active, .dance-feedback-leave-active {
  transition: all 0.8s ease;
}

.dance-feedback-enter-from {
  opacity: 0;
  transform: scale(0.3) rotate(-45deg);
}

.dance-feedback-leave-to {
  opacity: 0;
  transform: scale(2) rotate(45deg);
}

/* Inherit galaxy component styles */
.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
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

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

.galaxy-text-primary {
  background: linear-gradient(45deg, #60A5FA 0%, #A78BFA 25%, #F472B6 50%, #FBBF24 75%, #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-stats-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.galaxy-button {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4), inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.5) 0%, rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>