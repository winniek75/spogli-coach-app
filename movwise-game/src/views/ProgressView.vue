<!-- src/views/ProgressView.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-indigo-600 hover:text-indigo-700">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">学習進捗</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              総学習時間: {{ formatTime(totalStudyTime) }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 概要統計 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- 総スコア -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">総スコア</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalScore.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- 完了したゲーム数 -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">完了ゲーム</p>
              <p class="text-2xl font-bold text-gray-900">{{ completedGames }}</p>
            </div>
          </div>
        </div>

        <!-- 連続学習日数 -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">連続学習</p>
              <p class="text-2xl font-bold text-gray-900">{{ streakDays }}日</p>
            </div>
          </div>
        </div>

        <!-- 平均正答率 -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">平均正答率</p>
              <p class="text-2xl font-bold text-gray-900">{{ Math.round(averageAccuracy) }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ゲーム別進捗 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 各ゲームの進捗 -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">ゲーム別進捗</h2>
          <div class="space-y-4">
            <div v-for="game in gameProgress" :key="game.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="game.bgColor">
                  <component :is="game.icon" class="w-5 h-5" :class="game.textColor" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ game.name }}</p>
                  <p class="text-sm text-gray-600">{{ game.completedLevels }}/{{ game.totalLevels }} レベル</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="game.progressColor"
                    :style="{ width: `${(game.completedLevels / game.totalLevels) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-700">
                  {{ Math.round((game.completedLevels / game.totalLevels) * 100) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近のスコア履歴 -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">最近のスコア履歴</h2>
          <div class="space-y-3">
            <div v-for="record in recentScores" :key="record.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="getGameColor(record.gameType)">
                  <span class="text-xs font-bold text-white">{{ record.gameType.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ getGameName(record.gameType) }}</p>
                  <p class="text-sm text-gray-600">{{ formatDate(record.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-lg" :class="getScoreColor(record.score)">{{ record.score }}</p>
                <p class="text-sm text-gray-600">{{ record.accuracy }}% 正答</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学習カレンダー -->
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">学習カレンダー</h2>
        <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-2">
          <div>日</div>
          <div>月</div>
          <div>火</div>
          <div>水</div>
          <div>木</div>
          <div>金</div>
          <div>土</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div 
            v-for="day in calendarDays" 
            :key="day.date"
            class="aspect-square flex items-center justify-center text-sm rounded cursor-pointer transition-colors"
            :class="getCalendarDayClass(day)"
            @click="showDayDetails(day)"
          >
            {{ day.day }}
          </div>
        </div>
        <div class="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-green-200 rounded"></div>
            <span>学習済み</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-blue-200 rounded"></div>
            <span>今日</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-gray-100 rounded"></div>
            <span>未学習</span>
          </div>
        </div>
      </div>

      <!-- 達成度バッジ -->
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">達成バッジ</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div 
            v-for="badge in badges" 
            :key="badge.id"
            class="flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:shadow-md"
            :class="badge.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'"
          >
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200"
              :class="badge.earned ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'"
            >
              <component :is="badge.icon" class="w-6 h-6" />
            </div>
            <h3 class="font-medium text-sm text-center" :class="badge.earned ? 'text-gray-900' : 'text-gray-500'">
              {{ badge.title }}
            </h3>
            <p class="text-xs text-center mt-1" :class="badge.earned ? 'text-gray-600' : 'text-gray-400'">
              {{ badge.description }}
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- 日別詳細モーダル -->
    <div v-if="selectedDay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click="selectedDay = null">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ formatDate(selectedDay.date) }}の学習記録</h3>
          <button @click="selectedDay = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div v-if="selectedDay.activities && selectedDay.activities.length > 0" class="space-y-3">
          <div v-for="activity in selectedDay.activities" :key="activity.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">{{ getGameName(activity.gameType) }}</p>
              <p class="text-sm text-gray-600">{{ activity.time }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-lg text-indigo-600">{{ activity.score }}</p>
              <p class="text-sm text-gray-600">{{ activity.accuracy }}% 正答</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-gray-500">この日は学習記録がありません</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProgressStore } from '@/stores/progress'

// Heroiconsのアイコンコンポーネント
const StarIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
}

const SpeakerWaveIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.75a.75.75 0 00-1.264-.546L5.203 6H2.667a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.536l3.533 2.796A.75.75 0 0010 16.25V3.75zM11.95 5.95a.75.75 0 011.06 0 4.5 4.5 0 010 6.364.75.75 0 11-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.061z"/><path d="M13.364 2.636a.75.75 0 011.06 0 8.5 8.5 0 010 12.021.75.75 0 11-1.06-1.06 7 7 0 000-9.9.75.75 0 010-1.061z"/></svg>`
}

const BookOpenIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.048.28.546.153 1.152-.055 1.152-.663v-9.031c0-.425-.282-.816-.687-.98A6.97 6.97 0 0015 4.5c-1.33 0-2.58.36-3.65.992V16.82z"/><path d="M9.25 4.992C8.18 4.36 6.93 4 5.5 4a6.97 6.97 0 00-2.513.596c-.405.164-.687.555-.687.98v9.031c0 .608.606.816 1.152.663A7.462 7.462 0 015.5 15.5c1.71 0 3.307.47 4.75 1.32V4.992z"/></svg>`
}

const PuzzlePieceIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clip-rule="evenodd"/></svg>`
}

const TrophyIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767L6.5 12.814a2.5 2.5 0 001.767.732H8.5V15.5a2.5 2.5 0 002.5 2.5h4a2.5 2.5 0 002.5-2.5v-1.954a2.5 2.5 0 00.732-1.767L17 5.5A2.5 2.5 0 0014.5 3h-9zM5 5.5A.5.5 0 015.5 5h9a.5.5 0 01.5.5v2.879a.5.5 0 01-.146.353L12.5 11.086a.5.5 0 01-.354.146H7.854a.5.5 0 01-.354-.146L5.146 8.732A.5.5 0 015 8.379V5.5z" clip-rule="evenodd"/></svg>`
}

const FireIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M13.5 4.938a7 7 0 11-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.268.707.493 1.11.681.402.188.84.331 1.296.445a7.001 7.001 0 014.864-3.856zM3.5 11.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z" clip-rule="evenodd"/></svg>`
}

const AcademicCapIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.899-.438-1.85-.694-2.847a.75.75 0 00-.566-.669zM14 11.459a29.928 29.928 0 012.455-1.158 41.029 41.029 0 01.39 3.114.75.75 0 01-.419.74c-.528.256-1.046.53-1.554.82.21-.899.438-1.85.694-2.847a.75.75 0 01.566-.669z" clip-rule="evenodd"/></svg>`
}

// ストア
const progressStore = useProgressStore()

// リアクティブデータ
const selectedDay = ref(null)

// コンピューテッドプロパティ
const totalScore = computed(() => progressStore.getTotalScore())
const completedGames = computed(() => progressStore.getCompletedGamesCount())
const streakDays = computed(() => progressStore.getStreakDays())
const averageAccuracy = computed(() => progressStore.getAverageAccuracy())
const totalStudyTime = computed(() => progressStore.getTotalStudyTime())

const gameProgress = computed(() => [
  {
    id: 'sound-master',
    name: 'サウンドマスター',
    icon: SpeakerWaveIcon,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
    completedLevels: progressStore.getGameProgress('sound-master'),
    totalLevels: 20
  },
  {
    id: 'word-rush',
    name: 'ワードラッシュ',
    icon: BookOpenIcon,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    progressColor: 'bg-green-500',
    completedLevels: progressStore.getGameProgress('word-rush'),
    totalLevels: 25
  },
  {
    id: 'pattern-builder',
    name: 'パターンビルダー',
    icon: PuzzlePieceIcon,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    progressColor: 'bg-purple-500',
    completedLevels: progressStore.getGameProgress('pattern-builder'),
    totalLevels: 15
  }
])

const recentScores = computed(() => progressStore.getRecentScores(10))

const badges = computed(() => [
  {
    id: 'first-game',
    title: '初回プレイ',
    description: '最初のゲームをクリア',
    icon: StarIcon,
    earned: progressStore.hasBadge('first-game')
  },
  {
    id: 'high-scorer',
    title: 'ハイスコアラー',
    description: '1000点以上を獲得',
    icon: TrophyIcon,
    earned: progressStore.hasBadge('high-scorer')
  },
  {
    id: 'streak-week',
    title: '継続は力なり',
    description: '7日連続で学習',
    icon: FireIcon,
    earned: progressStore.hasBadge('streak-week')
  },
  {
    id: 'perfect-score',
    title: 'パーフェクト',
    description: '100%の正答率を達成',
    icon: AcademicCapIcon,
    earned: progressStore.hasBadge('perfect-score')
  },
  {
    id: 'game-master',
    title: 'ゲームマスター',
    description: '全ゲームをクリア',
    icon: AcademicCapIcon,
    earned: progressStore.hasBadge('game-master')
  },
  {
    id: 'speed-runner',
    title: 'スピードランナー',
    description: '素早く正解を連発',
    icon: FireIcon,
    earned: progressStore.hasBadge('speed-runner')
  }
])

const calendarDays = computed(() => {
  const days = []
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // 今月の1日を取得
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  
  // 月の最初の週の空白日を埋める
  const startPadding = firstDay.getDay()
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth, -i)
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      isCurrentMonth: false,
      hasActivity: false,
      isToday: false
    })
  }
  
  // 今月の日付を追加
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dateString = date.toISOString().split('T')[0]
    const isToday = dateString === today.toISOString().split('T')[0]
    
    days.push({
      date: dateString,
      day: day,
      isCurrentMonth: true,
      hasActivity: progressStore.hasActivityOnDate(dateString),
      isToday: isToday,
      activities: progressStore.getActivitiesOnDate(dateString)
    })
  }
  
  // 月の最後の週の空白日を埋める
  const endPadding = 42 - days.length // 6週間 × 7日
  for (let i = 1; i <= endPadding; i++) {
    const date = new Date(currentYear, currentMonth + 1, i)
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      isCurrentMonth: false,
      hasActivity: false,
      isToday: false
    })
  }
  
  return days
})

// メソッド
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}

const getGameName = (gameType) => {
  const gameNames = {
    'sound-master': 'サウンドマスター',
    'word-rush': 'ワードラッシュ',
    'pattern-builder': 'パターンビルダー'
  }
  return gameNames[gameType] || gameType
}

const getGameColor = (gameType) => {
  const colors = {
    'sound-master': 'bg-blue-500',
    'word-rush': 'bg-green-500',
    'pattern-builder': 'bg-purple-500'
  }
  return colors[gameType] || 'bg-gray-500'
}

const getScoreColor = (score) => {
  if (score >= 800) return 'text-green-600'
  if (score >= 500) return 'text-yellow-600'
  return 'text-gray-600'
}

const getCalendarDayClass = (day) => {
  const classes = []
  
  if (!day.isCurrentMonth) {
    classes.push('text-gray-300')
  } else if (day.isToday) {
    classes.push('bg-blue-200', 'text-blue-800', 'font-bold')
  } else if (day.hasActivity) {
    classes.push('bg-green-200', 'text-green-800', 'font-medium')
  } else {
    classes.push('text-gray-700', 'hover:bg-gray-100')
  }
  
  return classes.join(' ')
}

const showDayDetails = (day) => {
  if (day.isCurrentMonth) {
    selectedDay.value = day
  }
}

// ライフサイクル
onMounted(() => {
  progressStore.loadProgress()
})
</script>