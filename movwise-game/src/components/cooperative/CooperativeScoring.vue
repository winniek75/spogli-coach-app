<template>
  <div class="cooperative-scoring bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
          <i class="fas fa-trophy text-sm"></i>
        </div>
        <h3 class="text-lg font-semibold text-purple-300">協力スコア</h3>
      </div>
      
      <div class="text-right">
        <div class="text-sm text-purple-400">
          Phase {{ currentPhase + 1 }} / {{ totalPhases }}
        </div>
        <div class="text-xs text-pink-300">
          Cooperative Mission
        </div>
      </div>
    </div>

    <!-- Mission Progress -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-purple-300">ミッション進行度</span>
        <span class="text-sm text-pink-300">
          {{ Math.round((currentPhase / totalPhases) * 100) }}%
        </span>
      </div>
      
      <div class="relative w-full bg-slate-700 rounded-full h-4 overflow-hidden">
        <!-- Background gradient -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-900/50"></div>
        
        <!-- Progress bar -->
        <div 
          class="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
          :style="{ width: Math.max(5, (currentPhase / totalPhases) * 100) + '%' }"
        >
          <!-- Animated shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>

        <!-- Phase markers -->
        <div class="absolute inset-0 flex justify-between items-center px-1">
          <div 
            v-for="phase in totalPhases" 
            :key="phase"
            class="w-2 h-2 rounded-full border-2 transition-all duration-500"
            :class="phase <= currentPhase + 1 ? 'bg-white border-purple-300' : 'bg-slate-600 border-slate-500'"
          ></div>
        </div>
      </div>
    </div>

    <!-- Team Scores -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      
      <!-- Captain Score -->
      <div class="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-500/30 relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-bl-full"></div>
        
        <div class="relative">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <i class="fas fa-user-tie text-cyan-400"></i>
              <span class="text-sm font-medium text-cyan-300">Captain</span>
            </div>
            <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
          
          <div class="text-2xl font-bold text-white mb-1">
            {{ captainScore.toLocaleString() }}
          </div>
          
          <div class="text-xs text-cyan-200">
            発見ボーナス & 指導力
          </div>

          <!-- Recent score change animation -->
          <div 
            v-if="recentCaptainIncrease > 0"
            class="absolute -top-2 right-0 text-green-400 font-bold animate-bounce-up"
            :key="'captain-' + captainScore"
          >
            +{{ recentCaptainIncrease }}
          </div>
        </div>
      </div>

      <!-- Co-Pilot Score -->
      <div class="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30 relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-400/10 to-transparent rounded-bl-full"></div>
        
        <div class="relative">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <i class="fas fa-user-astronaut text-green-400"></i>
              <span class="text-sm font-medium text-green-300">Co-Pilot</span>
            </div>
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div class="text-2xl font-bold text-white mb-1">
            {{ copilotScore.toLocaleString() }}
          </div>
          
          <div class="text-xs text-green-200">
            発音精度 & 学習力
          </div>

          <!-- Recent score change animation -->
          <div 
            v-if="recentCopilotIncrease > 0"
            class="absolute -top-2 right-0 text-green-400 font-bold animate-bounce-up"
            :key="'copilot-' + copilotScore"
          >
            +{{ recentCopilotIncrease }}
          </div>
        </div>
      </div>
    </div>

    <!-- Total Team Score -->
    <div class="mb-6 p-4 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 rounded-lg border border-purple-400/50 relative overflow-hidden">
      <!-- Animated background -->
      <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-gradient-shift"></div>
      
      <div class="relative text-center">
        <div class="text-sm text-purple-300 mb-2">チーム総合スコア</div>
        <div class="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2">
          {{ totalScore.toLocaleString() }}
        </div>
        <div class="text-xs text-pink-200">
          Captain ({{ Math.round((captainScore / Math.max(totalScore, 1)) * 100) }}%) + 
          Co-Pilot ({{ Math.round((copilotScore / Math.max(totalScore, 1)) * 100) }}%)
        </div>

        <!-- Score breakdown bar -->
        <div class="mt-3 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div class="h-full flex">
            <div 
              class="bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
              :style="{ width: (captainScore / Math.max(totalScore, 1)) * 100 + '%' }"
            ></div>
            <div 
              class="bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
              :style="{ width: (copilotScore / Math.max(totalScore, 1)) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Success Banner -->
    <div 
      v-if="recentSuccess"
      class="mb-6 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-400/50 animate-pulse-glow"
    >
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <i class="fas fa-star text-white text-sm"></i>
        </div>
        <div>
          <div class="text-yellow-300 font-medium">協力成功！</div>
          <div class="text-orange-200 text-sm">
            音素 {{ recentSuccess.phoneme }} - {{ getSuccessMessage() }}
          </div>
        </div>
        <div class="ml-auto text-right">
          <div class="text-yellow-400 font-bold">+{{ recentSuccess.bonusPoints || 100 }}</div>
          <div class="text-orange-300 text-xs">チームボーナス</div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      
      <!-- Accuracy Rate -->
      <div class="text-center p-3 bg-slate-700/30 rounded-lg border border-blue-500/20">
        <div class="text-2xl font-bold text-blue-300 mb-1">
          {{ accuracyRate }}%
        </div>
        <div class="text-xs text-blue-200">正確率</div>
      </div>

      <!-- Cooperation Level -->
      <div class="text-center p-3 bg-slate-700/30 rounded-lg border border-purple-500/20">
        <div class="text-2xl font-bold text-purple-300 mb-1">
          {{ cooperationLevel }}
        </div>
        <div class="text-xs text-purple-200">協力度</div>
      </div>

      <!-- Speed Bonus -->
      <div class="text-center p-3 bg-slate-700/30 rounded-lg border border-green-500/20">
        <div class="text-2xl font-bold text-green-300 mb-1">
          x{{ speedMultiplier.toFixed(1) }}
        </div>
        <div class="text-xs text-green-200">速度倍率</div>
      </div>
    </div>

    <!-- Achievement Badges -->
    <div v-if="achievements.length > 0" class="mb-6">
      <div class="text-sm text-purple-300 mb-3 flex items-center">
        <i class="fas fa-medal mr-2"></i>
        獲得実績
      </div>
      
      <div class="flex flex-wrap gap-2">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="px-3 py-1 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 rounded-full text-xs text-yellow-300 flex items-center space-x-1"
        >
          <i :class="achievement.icon"></i>
          <span>{{ achievement.name }}</span>
        </div>
      </div>
    </div>

    <!-- Mission Objectives -->
    <div class="bg-slate-700/30 rounded-lg p-4">
      <h4 class="text-sm font-medium text-purple-300 mb-3 flex items-center">
        <i class="fas fa-bullseye mr-2"></i>
        ミッション目標
      </h4>
      
      <div class="space-y-2">
        <div 
          v-for="objective in missionObjectives" 
          :key="objective.id"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center space-x-2">
            <i 
              :class="objective.completed ? 'fas fa-check-circle text-green-400' : 'far fa-circle text-gray-400'"
            ></i>
            <span :class="objective.completed ? 'text-green-300' : 'text-gray-300'">
              {{ objective.description }}
            </span>
          </div>
          <div v-if="objective.progress !== undefined" class="text-xs text-purple-300">
            {{ objective.progress }}{{ objective.unit || '' }}
          </div>
        </div>
      </div>

      <!-- Next milestone -->
      <div v-if="nextMilestone" class="mt-4 pt-3 border-t border-slate-600">
        <div class="text-xs text-purple-400 mb-1">次のマイルストーン</div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-white">{{ nextMilestone.description }}</span>
          <span class="text-xs text-purple-300">{{ nextMilestone.requirement }}</span>
        </div>
        
        <!-- Progress to next milestone -->
        <div class="mt-2 w-full bg-slate-600 rounded-full h-1">
          <div 
            class="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
            :style="{ width: nextMilestone.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  captainScore: {
    type: Number,
    default: 0
  },
  copilotScore: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  currentPhase: {
    type: Number,
    default: 0
  },
  totalPhases: {
    type: Number,
    default: 5
  },
  recentSuccess: {
    type: Object,
    default: null
  }
})

// Reactive data
const recentCaptainIncrease = ref(0)
const recentCopilotIncrease = ref(0)
const previousCaptainScore = ref(0)
const previousCopilotScore = ref(0)

// Computed properties
const accuracyRate = computed(() => {
  // Calculate based on successful phoneme detections
  const totalAttempts = Math.max(props.currentPhase, 1)
  const successfulAttempts = props.currentPhase
  return Math.round((successfulAttempts / totalAttempts) * 100)
})

const cooperationLevel = computed(() => {
  // Calculate cooperation level based on score balance
  const balanceRatio = Math.min(props.captainScore, props.copilotScore) / Math.max(props.captainScore, props.copilotScore, 1)
  return Math.round(balanceRatio * 100)
})

const speedMultiplier = computed(() => {
  // Calculate speed bonus based on phase completion rate
  const expectedTime = props.totalPhases * 60 // 1 minute per phase expected
  const actualTime = props.currentPhase * 45 // Assume 45 seconds per completed phase
  return Math.min(2.0, Math.max(1.0, expectedTime / Math.max(actualTime, 1)))
})

const achievements = computed(() => {
  const earned = []
  
  // Perfect cooperation
  if (cooperationLevel.value >= 90) {
    earned.push({
      id: 'perfect_cooperation',
      name: 'Perfect Teamwork',
      icon: 'fas fa-handshake'
    })
  }
  
  // High accuracy
  if (accuracyRate.value >= 95) {
    earned.push({
      id: 'high_accuracy',
      name: 'Precision Master',
      icon: 'fas fa-bullseye'
    })
  }
  
  // Speed demon
  if (speedMultiplier.value >= 1.5) {
    earned.push({
      id: 'speed_demon',
      name: 'Lightning Fast',
      icon: 'fas fa-bolt'
    })
  }
  
  // Score milestone
  if (props.totalScore >= 1000) {
    earned.push({
      id: 'score_milestone',
      name: '1K Club',
      icon: 'fas fa-trophy'
    })
  }
  
  return earned
})

const missionObjectives = computed(() => {
  return [
    {
      id: 'complete_phases',
      description: `${props.totalPhases}つの音素フェーズを完了`,
      completed: props.currentPhase >= props.totalPhases,
      progress: `${props.currentPhase}/${props.totalPhases}`
    },
    {
      id: 'maintain_accuracy',
      description: '90%以上の正確率を維持',
      completed: accuracyRate.value >= 90,
      progress: accuracyRate.value,
      unit: '%'
    },
    {
      id: 'team_balance',
      description: 'チームバランスを80%以上に保つ',
      completed: cooperationLevel.value >= 80,
      progress: cooperationLevel.value,
      unit: '%'
    },
    {
      id: 'score_target',
      description: '2000ポイント以上を獲得',
      completed: props.totalScore >= 2000,
      progress: props.totalScore
    }
  ]
})

const nextMilestone = computed(() => {
  // Find next uncompleted objective
  const incomplete = missionObjectives.value.find(obj => !obj.completed)
  
  if (!incomplete) return null
  
  let progress = 0
  let requirement = ''
  
  switch (incomplete.id) {
    case 'complete_phases':
      progress = (props.currentPhase / props.totalPhases) * 100
      requirement = `${props.totalPhases - props.currentPhase}フェーズ残り`
      break
    case 'maintain_accuracy':
      progress = Math.min(100, (accuracyRate.value / 90) * 100)
      requirement = `${90 - accuracyRate.value}%改善必要`
      break
    case 'team_balance':
      progress = Math.min(100, (cooperationLevel.value / 80) * 100)
      requirement = `${80 - cooperationLevel.value}%改善必要`
      break
    case 'score_target':
      progress = Math.min(100, (props.totalScore / 2000) * 100)
      requirement = `${2000 - props.totalScore}ポイント残り`
      break
  }
  
  return {
    description: incomplete.description,
    progress: Math.max(0, progress),
    requirement
  }
})

// Methods
const getSuccessMessage = () => {
  const messages = [
    '完璧な連携です！',
    '素晴らしいチームワーク！',
    '音素マスター認定！',
    '協力の勝利！',
    '見事な発音！'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

// Watchers for score animations
watch(() => props.captainScore, (newScore, oldScore) => {
  const increase = newScore - oldScore
  if (increase > 0) {
    recentCaptainIncrease.value = increase
    setTimeout(() => {
      recentCaptainIncrease.value = 0
    }, 2000)
  }
  previousCaptainScore.value = oldScore
})

watch(() => props.copilotScore, (newScore, oldScore) => {
  const increase = newScore - oldScore
  if (increase > 0) {
    recentCopilotIncrease.value = increase
    setTimeout(() => {
      recentCopilotIncrease.value = 0
    }, 2000)
  }
  previousCopilotScore.value = oldScore
})
</script>

<style scoped>
/* Custom animations */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes bounce-up {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-40px) scale(0.8);
    opacity: 0;
  }
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-bounce-up {
  animation: bounce-up 2s ease-out forwards;
}

.animate-gradient-shift {
  background-size: 400% 400%;
  animation: gradient-shift 3s ease infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Custom scrollbar */
.cooperative-scoring::-webkit-scrollbar {
  width: 6px;
}

.cooperative-scoring::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.cooperative-scoring::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.5);
  border-radius: 3px;
}

.cooperative-scoring::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
}
</style>