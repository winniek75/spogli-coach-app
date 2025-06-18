<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- 背景パーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div v-for="particle in backgroundParticles" :key="particle.id" 
           class="particle absolute rounded-full bg-white opacity-20"
           :style="{
             left: particle.x + '%',
             top: particle.y + '%',
             width: particle.size + 'px',
             height: particle.size + 'px',
             animationDelay: particle.delay + 's',
             animationDuration: particle.duration + 's'
           }">
      </div>
    </div>

    <!-- プロフィール画面 -->
    <div class="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div class="galaxy-card p-8 max-w-6xl w-full">
        <!-- ヘッダー -->
        <div class="text-center mb-8">
          <div class="mb-6">
            <div class="relative inline-block">
              <h1 class="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-2 tracking-tight title-glow">
                プロフィール
              </h1>
              <div class="absolute -top-2 -right-8 text-4xl floating-icon">👤</div>
            </div>
            <div class="text-center">
              <span class="text-2xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-widest">
                CAPTAIN PROFILE
              </span>
              <div class="flex justify-center items-center gap-2 mt-2">
                <div class="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
                <span class="text-lg text-white/80 font-semibold tracking-[0.2em] uppercase">Galaxy Explorer</span>
                <div class="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 全体統計 -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <div class="stat-card bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-6 shadow-xl">
            <div class="text-4xl mb-3">🏆</div>
            <div class="text-3xl font-bold mb-1">{{ globalStats.totalScore.toLocaleString() }}</div>
            <div class="text-sm opacity-90 font-semibold">総スコア</div>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-2xl p-6 shadow-xl">
            <div class="text-4xl mb-3">🌟</div>
            <div class="text-3xl font-bold mb-1">{{ globalStats.exploredPlanets }}</div>
            <div class="text-sm opacity-90 font-semibold">探索済み惑星</div>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-2xl p-6 shadow-xl">
            <div class="text-4xl mb-3">⚡</div>
            <div class="text-3xl font-bold mb-1">{{ globalStats.cosmicEnergy.toLocaleString() }}</div>
            <div class="text-sm opacity-90 font-semibold">宇宙エネルギー</div>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-2xl p-6 shadow-xl">
            <div class="text-4xl mb-3">🚀</div>
            <div class="text-3xl font-bold mb-1">{{ globalStats.navigationDays }}</div>
            <div class="text-sm opacity-90 font-semibold">航行日数</div>
          </div>
        </div>

        <!-- 詳細統計 -->
        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <!-- 学習統計 -->
          <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
            <h3 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <i class="fas fa-chart-line text-green-400"></i>
              学習統計
            </h3>
            <div class="space-y-4 text-white/90">
              <div class="flex justify-between">
                <span>総学習時間:</span>
                <span class="font-bold text-yellow-400">{{ Math.floor(globalStats.totalPlayTime / 60) }}時間{{ globalStats.totalPlayTime % 60 }}分</span>
              </div>
              <div class="flex justify-between">
                <span>完了ゲーム数:</span>
                <span class="font-bold text-green-400">{{ globalStats.completedGames }}回</span>
              </div>
              <div class="flex justify-between">
                <span>平均正答率:</span>
                <span class="font-bold text-blue-400">{{ globalStats.averageAccuracy }}%</span>
              </div>
              <div class="flex justify-between">
                <span>最長連続学習:</span>
                <span class="font-bold text-orange-400">{{ globalStats.maxStreak }}日</span>
              </div>
              <div class="flex justify-between">
                <span>習得音素数:</span>
                <span class="font-bold text-purple-400">{{ globalStats.masteredPhonemes }}/44</span>
              </div>
            </div>
          </div>

          <!-- 学習進捗 -->
          <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
            <h3 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <i class="fas fa-trophy text-yellow-400"></i>
              学習エリア進捗
            </h3>
            <div class="space-y-4">
              <div v-for="area in learningAreas" :key="area.id" class="bg-white/5 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-white font-semibold">{{ area.name }}</span>
                  <span class="text-2xl">{{ area.icon }}</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div :class="[
                    'h-3 rounded-full transition-all duration-500',
                    area.color
                  ]" :style="{ width: area.progress + '%' }"></div>
                </div>
                <div class="flex justify-between text-sm text-white/70">
                  <span>{{ area.progress }}% 完了</span>
                  <span>{{ area.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- アチーブメント -->
        <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-8">
          <h3 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <i class="fas fa-medal text-yellow-400"></i>
            アチーブメント
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="achievement in achievements" :key="achievement.id" 
                 :class="[
                   'p-4 rounded-xl text-center transition-all duration-300',
                   achievement.unlocked 
                     ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30' 
                     : 'bg-gray-700/30 border border-gray-600/30'
                 ]">
              <div :class="[
                'text-3xl mb-2',
                achievement.unlocked ? 'filter-none' : 'filter grayscale opacity-50'
              ]">
                {{ achievement.icon }}
              </div>
              <div :class="[
                'font-bold text-sm mb-1',
                achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'
              ]">
                {{ achievement.name }}
              </div>
              <div :class="[
                'text-xs',
                achievement.unlocked ? 'text-white/80' : 'text-gray-500'
              ]">
                {{ achievement.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex justify-center gap-4">
          <button @click="goHome"
                  class="galaxy-button galaxy-button-secondary flex items-center gap-3 py-4 px-8 text-lg font-bold text-white">
            <i class="fas fa-home"></i>
            ホームに戻る
          </button>
          <button @click="exportData"
                  class="galaxy-button galaxy-button-primary flex items-center gap-3 py-4 px-8 text-lg font-bold text-white">
            <i class="fas fa-download"></i>
            データをエクスポート
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()
    
    // 背景パーティクル
    const backgroundParticles = ref([])
    
    // 全体統計
    const globalStats = reactive({
      totalScore: 0,
      exploredPlanets: 0,
      cosmicEnergy: 0,
      navigationDays: 0,
      totalPlayTime: 0,
      completedGames: 0,
      averageAccuracy: 0,
      maxStreak: 0,
      masteredPhonemes: 0
    })
    
    // 学習エリア
    const learningAreas = ref([
      {
        id: 'phonics',
        name: 'フォニックス・ネビュラ',
        icon: '🎵',
        progress: 75,
        status: '33/44音素',
        color: 'bg-gradient-to-r from-pink-400 to-purple-500'
      },
      {
        id: 'grammar',
        name: 'グラマー・ギャラクシー',
        icon: '🌌',
        progress: 45,
        status: '9/20文法項目',
        color: 'bg-gradient-to-r from-indigo-400 to-purple-500'
      },
      {
        id: 'vision',
        name: 'ビジョン・トラッキング',
        icon: '👁️',
        progress: 30,
        status: '準備中',
        color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
      },
      {
        id: 'coop',
        name: 'Co-Pilot ドック',
        icon: '👥',
        progress: 15,
        status: '協力学習',
        color: 'bg-gradient-to-r from-purple-400 to-pink-500'
      }
    ])
    
    // アチーブメント
    const achievements = ref([
      {
        id: 'first_steps',
        name: '初めの一歩',
        description: '最初のゲームを完了',
        icon: '🚀',
        unlocked: true
      },
      {
        id: 'sound_explorer',
        name: '音韻探検家',
        description: '10個の音素を習得',
        icon: '🎵',
        unlocked: true
      },
      {
        id: 'galaxy_navigator',
        name: '銀河航海士',
        description: '5つの惑星を探索',
        icon: '🌟',
        unlocked: true
      },
      {
        id: 'streak_master',
        name: '継続マスター',
        description: '7日連続で学習',
        icon: '🔥',
        unlocked: false
      },
      {
        id: 'phonics_master',
        name: 'フォニックス・マスター',
        description: '全44音素を習得',
        icon: '👑',
        unlocked: false
      },
      {
        id: 'grammar_sage',
        name: '文法の賢者',
        description: '全文法項目を完了',
        icon: '🧙‍♂️',
        unlocked: false
      },
      {
        id: 'speed_reader',
        name: 'スピード・リーダー',
        description: '高速読解を達成',
        icon: '⚡',
        unlocked: false
      },
      {
        id: 'team_player',
        name: 'チーム・プレイヤー',
        description: '協力学習を完了',
        icon: '🤝',
        unlocked: false
      }
    ])
    
    // 背景パーティクルの初期化
    const initBackgroundParticles = () => {
      backgroundParticles.value = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 2,
        size: 2 + Math.random() * 3
      }))
    }
    
    // 統計データの読み込み
    const loadStats = () => {
      // ゲームストアから基本データを取得
      if (gameStore.spaceshipStatus) {
        globalStats.cosmicEnergy = gameStore.spaceshipStatus.cosmicEnergy || 0
        globalStats.exploredPlanets = gameStore.spaceshipStatus.exploredPlanets || 0
        globalStats.navigationDays = gameStore.spaceshipStatus.navigationDays || 0
      }
      
      // LocalStorageから詳細統計を読み込み
      const savedStats = localStorage.getItem('movwiseGlobalStats')
      if (savedStats) {
        try {
          const stats = JSON.parse(savedStats)
          Object.assign(globalStats, stats)
        } catch (error) {
          console.error('統計データの読み込みエラー:', error)
        }
      }
      
      // 総スコアを計算（各ゲームのスコアを合計）
      globalStats.totalScore = globalStats.cosmicEnergy + (globalStats.exploredPlanets * 1000)
    }
    
    // データエクスポート
    const exportData = () => {
      const exportData = {
        stats: globalStats,
        learningAreas: learningAreas.value,
        achievements: achievements.value,
        exportDate: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `movwise-profile-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('📊 プロフィールデータをエクスポートしました！')
    }
    
    // ホームに戻る
    const goHome = () => {
      router.push({ name: 'home' })
    }
    
    // ライフサイクル
    onMounted(() => {
      initBackgroundParticles()
      loadStats()
    })
    
    return {
      backgroundParticles,
      globalStats,
      learningAreas,
      achievements,
      exportData,
      goHome
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
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

.particle {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
    opacity: 0.6; 
  }
  25% { 
    transform: translateY(-15px) rotate(90deg); 
    opacity: 0.8; 
  }
  50% { 
    transform: translateY(-25px) rotate(180deg); 
    opacity: 1; 
  }
  75% { 
    transform: translateY(-15px) rotate(270deg); 
    opacity: 0.8; 
  }
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.05);
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.galaxy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 172, 254, 0.4);
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

.title-glow {
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }
  to {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  }
}

.floating-icon {
  animation: floatingIcon 2s ease-in-out infinite;
}

@keyframes floatingIcon {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}
</style>