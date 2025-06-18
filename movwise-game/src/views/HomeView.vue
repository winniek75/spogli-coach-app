<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- ヒーローセクション -->
    <header class="relative z-10 px-6 py-16 text-center">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-6xl font-bold mb-4 galaxy-text-primary cosmic-title">🚀 MovWISE Galaxy Command</h1>
        <p class="text-2xl mb-3 text-galaxy-moon-silver">銀河系英語習得司令部</p>
        <p class="text-lg mb-12 text-galaxy-moon-silver max-w-2xl mx-auto">
          船長として宇宙船を操縦し、未知の言語惑星を探索する壮大な冒険
        </p>
        
        <!-- 学習統計 -->
        <div class="flex justify-center gap-8 flex-wrap">
          <div class="galaxy-stats-card">
            <span class="text-2xl cosmic-glow">⚡</span>
            <div class="text-left">
              <div class="text-2xl font-bold galaxy-text-primary">{{ userStats.totalScore }}</div>
              <div class="text-sm text-galaxy-moon-silver">宇宙エネルギー</div>
            </div>
          </div>
          <div class="galaxy-stats-card">
            <span class="text-2xl cosmic-glow">🌟</span>
            <div class="text-left">
              <div class="text-2xl font-bold galaxy-text-primary">{{ userStats.gamesPlayed }}</div>
              <div class="text-sm text-galaxy-moon-silver">探索済み惑星</div>
            </div>
          </div>
          <div class="galaxy-stats-card">
            <span class="text-2xl cosmic-glow">🚀</span>
            <div class="text-left">
              <div class="text-2xl font-bold galaxy-text-primary">{{ userStats.streak }}</div>
              <div class="text-sm text-galaxy-moon-silver">航行日数</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 今日のおすすめ -->
    <section class="relative z-10 px-6 py-12">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-8">⭐ 今日のおすすめ</h2>
        
        <div 
          class="galaxy-card p-8 flex items-center gap-6 cursor-pointer transition-all hover-lift"
          @click="handleSoundAdventure"
        >
          <div class="text-center">
            <div class="text-5xl mb-2">🎵</div>
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              フォニックス学習
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold galaxy-text-primary mb-2">フォニックス・マスター</h3>
            <p class="text-galaxy-moon-silver mb-3">44音素を段階的に習得！今日は単音素認識から始めよう</p>
            <div class="flex items-center gap-2 text-yellow-400 font-bold">
              <span class="text-2xl cosmic-glow">💎</span>
              <span>+150サウンドジェム</span>
            </div>
          </div>
          <span class="text-2xl text-galaxy-moon-silver">→</span>
        </div>
      </div>
    </section>

    <!-- デイリーミッション -->
    <section class="relative z-10 px-6 py-12">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-8">🚀 今日のミッション</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- ミッション1: 探索ミッション -->
          <div class="galaxy-card p-6">
            <div class="text-center mb-4">
              <div class="text-4xl mb-2 cosmic-glow">🌟</div>
              <h3 class="text-lg font-bold galaxy-text-primary">惑星探索ミッション</h3>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center text-galaxy-moon-silver">
                <span class="text-sm">3つの惑星を探索</span>
                <span class="text-green-400 font-bold">0/3</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="energy-gauge h-2 rounded-full" style="width: 0%"></div>
              </div>
              <div class="flex items-center justify-center gap-2 text-yellow-400">
                <span class="cosmic-glow">💎</span>
                <span class="font-bold">+200 ジェム</span>
              </div>
            </div>
          </div>

          <!-- ミッション2: 学習ミッション -->
          <div class="galaxy-card p-6">
            <div class="text-center mb-4">
              <div class="text-4xl mb-2 cosmic-glow">⚡</div>
              <h3 class="text-lg font-bold galaxy-text-primary">エネルギー収集ミッション</h3>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center text-galaxy-moon-silver">
                <span class="text-sm">500エネルギー獲得</span>
                <span class="text-green-400 font-bold">250/500</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="energy-gauge h-2 rounded-full" style="width: 50%"></div>
              </div>
              <div class="flex items-center justify-center gap-2 text-yellow-400">
                <span class="cosmic-glow">🚀</span>
                <span class="font-bold">+1 レベル</span>
              </div>
            </div>
          </div>

          <!-- ミッション3: 協力合同訓練 (NEW) -->
          <div class="galaxy-card p-6 border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
            <div class="text-center mb-4">
              <div class="text-4xl mb-2 cosmic-glow">👥</div>
              <h3 class="text-lg font-bold galaxy-text-primary">船長と副操縦士合同訓練</h3>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center text-galaxy-moon-silver">
                <span class="text-sm">協力ミッション完了</span>
                <span class="text-purple-400 font-bold">NEW!</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full animate-pulse" style="width: 100%"></div>
              </div>
              <div class="flex items-center justify-center gap-2 text-purple-400">
                <span class="cosmic-glow">🤝</span>
                <span class="font-bold">協力ボーナス</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 学習カテゴリー -->
    <section class="relative z-10 px-6 py-12">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-12">📚 学習ステージ</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <!-- サウンド・アドベンチャー -->
          <div
            class="galaxy-card p-8 cursor-pointer transition-all hover-lift"
            @click="handleSoundAdventure"
          >
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                <div class="text-5xl">🎵</div>
                <div class="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  メイン
                </div>
              </div>
              <h3 class="text-2xl font-bold galaxy-text-primary mb-3">🌌 サウンド・ネビュラ</h3>
              <p class="text-galaxy-moon-silver mb-6 leading-relaxed">音韻星雲を探索し、言語の根源となる音素エネルギーを収集する冒険。44の英語音素を段階的に習得する宇宙探索型学習プラットフォーム！</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">🪐 フォニックス惑星</span>
                <span class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">🌙 ブレンディング・ムーン</span>
              </div>
              <div class="flex gap-4 mb-6 text-sm text-galaxy-moon-silver">
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  6つのゲーム
                </span>
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  段階的習得
                </span>
              </div>
              <button class="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all galaxy-button galaxy-button-primary text-white hover:shadow-lg hover:scale-105">
                <span class="text-xl cosmic-glow">🚀</span>
                冒険を始める
              </button>
            </div>
          </div>

          <!-- Grammar Galaxy Hub -->
          <div
            class="galaxy-card p-8 cursor-pointer transition-all hover-lift"
            @click="handleGrammarGalaxy"
          >
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                <div class="text-5xl">🌌</div>
                <div class="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  文法宇宙
                </div>
              </div>
              <h3 class="text-2xl font-bold galaxy-text-primary mb-3">🚀 グラマー・ギャラクシー</h3>
              <p class="text-galaxy-moon-silver mb-6 leading-relaxed">文法銀河系を制覇し、言語構造の秘密を解き明かす宇宙征服。⚡Rush Zone + 惑星探索の統合学習で文法を瞬間習得し、銀河系を巡りながら体系的に英文法をマスター。</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">⚡ ラッシュ・ゾーン</span>
                <span class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">🪐 基礎惑星群</span>
              </div>
              <div class="flex gap-4 mb-6 text-sm text-galaxy-moon-silver">
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  高速反復練習
                </span>
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  習熟度管理
                </span>
              </div>
              <button class="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all galaxy-button galaxy-button-primary text-white hover:shadow-lg hover:scale-105">
                <span class="text-xl cosmic-glow">⚡</span>
                Rush開始
              </button>
            </div>
          </div>

          <!-- Co-Pilot Training Dock (NEW) -->
          <div
            class="galaxy-card p-8 cursor-pointer transition-all hover-lift border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-pink-900/30 relative overflow-hidden"
            @click="handleCoPilotDock"
          >
            <!-- Special glow effect for new feature -->
            <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>
            
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                <div class="text-5xl">👥</div>
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  NEW!
                </div>
              </div>
              <h3 class="text-2xl font-bold galaxy-text-primary mb-3">🚀 Co-Pilot Training Dock</h3>
              <p class="text-galaxy-moon-silver mb-6 leading-relaxed">副操縦士訓練ドックで講師と協力学習！リアルタイム協力ミッションで音韻・文法を共同習得する革新的な学習体験。</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">👨‍🏫 講師協力</span>
                <span class="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">🎯 共同ミッション</span>
              </div>
              <div class="flex gap-4 mb-6 text-sm text-galaxy-moon-silver">
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  協力学習
                </span>
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  即座サポート
                </span>
              </div>
              <button class="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white hover:shadow-lg hover:scale-105">
                <span class="text-xl cosmic-glow">🤝</span>
                協力訓練開始
              </button>
            </div>
          </div>

          <!-- ビジョン・トラッキング -->
          <div
            class="galaxy-card p-8 cursor-pointer transition-all hover-lift"
            @click="handleVisionTracking"
          >
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                <div class="text-5xl">👁️</div>
                <div class="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  視覚強化
                </div>
              </div>
              <h3 class="text-2xl font-bold galaxy-text-primary mb-3">ビジョン・トラッキング</h3>
              <p class="text-galaxy-moon-silver mb-6 leading-relaxed">視覚処理能力と英語認識を同時強化。眼球運動と単語認識のマルチモーダル学習体験！</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">👀 追跡練習</span>
                <span class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">🔍 単語探索</span>
                <span class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">⚡ 認識速度</span>
              </div>
              <div class="flex gap-4 mb-6 text-sm text-galaxy-moon-silver">
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  視覚処理
                </span>
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  速度向上
                </span>
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  認識精度
                </span>
              </div>
              <button class="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all galaxy-button galaxy-button-primary text-white hover:shadow-lg hover:scale-105">
                <span class="text-xl cosmic-glow">👁️</span>
                視覚強化開始
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 学習進捗 -->
    <section class="px-6 py-12">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl font-bold text-white text-center mb-12">📊 学習進捗</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="galaxy-card p-6">
            <div class="text-center mb-4">
              <span class="text-3xl">🎵</span>
              <h4 class="font-bold text-white mt-2">音韻学習</h4>
            </div>
            <div class="mb-3">
              <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-700" style="width: 75%"></div>
              </div>
            </div>
            <div class="flex justify-between text-sm text-galaxy-moon-silver">
              <span>75% 完了</span>
              <span>33/44音素</span>
            </div>
          </div>

          <div class="galaxy-card p-6">
            <div class="text-center mb-4">
              <span class="text-3xl">🌌</span>
              <h4 class="font-bold text-white mt-2">文法銀河</h4>
            </div>
            <div class="mb-3">
              <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700" style="width: 35%"></div>
              </div>
            </div>
            <div class="flex justify-between text-sm text-galaxy-moon-silver">
              <span>35% 完了</span>
              <span>7/20文法項目</span>
            </div>
          </div>

          <div class="galaxy-card p-6">
            <div class="text-center mb-4">
              <span class="text-3xl">👁️</span>
              <h4 class="font-bold text-white mt-2">視覚処理</h4>
            </div>
            <div class="mb-3">
              <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-700" style="width: 30%"></div>
              </div>
            </div>
            <div class="flex justify-between text-sm text-galaxy-moon-silver">
              <span>30% 完了</span>
              <span>準備中</span>
            </div>
          </div>

          <div class="galaxy-card p-6">
            <div class="text-center mb-4">
              <span class="text-3xl">👥</span>
              <h4 class="font-bold text-white mt-2">協力学習</h4>
            </div>
            <div class="mb-3">
              <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-700" style="width: 0%"></div>
              </div>
            </div>
            <div class="flex justify-between text-sm text-galaxy-moon-silver">
              <span>0% 完了</span>
              <span>Co-Pilot Dock</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- クイックアクション -->
    <section class="px-6 py-12 pb-20">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-white text-center mb-12">⚡ クイックアクション</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button 
            class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all galaxy-card hover-lift"
            @click="handleSoundAdventure"
          >
            <span class="text-3xl">🎵</span>
            <span class="text-sm font-medium text-white">音韻ゲーム</span>
          </button>

          <button 
            class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all galaxy-card hover-lift"
            @click="handleGrammarGalaxy"
          >
            <span class="text-3xl">🌌</span>
            <span class="text-sm font-medium text-white">文法銀河</span>
          </button>

          <button 
            class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all galaxy-card hover-lift"
            @click="handleVisionTracking"
          >
            <span class="text-3xl">👁️</span>
            <span class="text-sm font-medium text-white">視覚処理</span>
          </button>

          <button 
            class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all galaxy-card hover-lift border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20"
            @click="handleCoPilotDock"
          >
            <span class="text-3xl">👥</span>
            <span class="text-sm font-medium text-white">協力学習</span>
          </button>

          <button 
            class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all galaxy-card hover-lift"
            @click="handleSettings"
          >
            <span class="text-3xl">⚙️</span>
            <span class="text-sm font-medium text-white">設定</span>
          </button>

          <button 
            class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all galaxy-card hover-lift"
            @click="handleProfile"
          >
            <span class="text-3xl">👤</span>
            <span class="text-sm font-medium text-white">プロフィール</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { useGameStore } from '@/stores/gameStore'
import { computed, onMounted } from 'vue'

export default {
  name: 'HomeView',
  setup() {
    const gameStore = useGameStore()

    // 宇宙船ステータスから統計データを取得
    const userStats = computed(() => ({
      totalScore: gameStore.spaceshipStatus.cosmicEnergy?.toLocaleString() || '0',
      gamesPlayed: gameStore.spaceshipStatus.exploredPlanets || 0,
      streak: gameStore.spaceshipStatus.navigationDays || 0
    }))

    // マウント時にストリークを更新
    onMounted(() => {
      gameStore.updateStreak()
    })

    return {
      userStats
    }
  },
  methods: {
    handleSoundAdventure() {
      console.log('🎵 サウンド・アドベンチャーに遷移')
      this.$router.push({ name: 'SoundAdventureHub' })
        .catch(error => {
          console.error('ルーティングエラー:', error)
          alert('🚧 ページの読み込み中にエラーが発生しました。\nページをリロードしてもう一度お試しください。')
        })
    },
    handleGrammarGalaxy() {
      console.log('🌌 Grammar Galaxyに遷移')
      this.$router.push({ name: 'grammar-galaxy-hub' })
        .catch(error => {
          console.error('Grammar Galaxy ルーティングエラー:', error)
          // フォールバック: Grammar Galaxy Foundation に移動
          this.$router.push('/grammar-galaxy-foundation')
            .catch(error2 => {
              console.error('Grammar Galaxy Foundation ルーティングエラー:', error2)
              alert('🚧 Grammar Galaxyの読み込み中にエラーが発生しました。\nページをリロードしてもう一度お試しください。')
            })
        })
    },
    handleVisionTracking() {
      alert('👁️ ビジョン・トラッキングは開発中です！\n\n視覚処理能力と単語認識を同時に強化する学習システムをお楽しみに！\n\n📋 予定機能:\n• 眼球運動追跡練習\n• 高速単語認識トレーニング\n• 周辺視野拡大エクササイズ')
    },
    handleCoPilotDock() {
      console.log('👥 Co-Pilot Training Dockに遷移')
      this.$router.push({ name: 'CoPilotDock' })
        .catch(error => {
          console.error('Co-Pilot Dock ルーティングエラー:', error)
          alert('🚧 Co-Pilot Dockの読み込み中にエラーが発生しました。\nページをリロードしてもう一度お試しください。')
        })
    },
    handleRhythmSequencing() {
      alert('🥁 リズム・シーケンシングは開発中です！\n\n英語の韻律とアクセントパターンを体感的に習得する学習システムをお楽しみに！\n\n📋 予定機能:\n• タッピング・パターン練習\n• 韻律感覚トレーニング\n• アクセント習得ゲーム')
    },
    handleScienceOfSpeech() {
      alert('🔬 サイエンス・オブ・スピーチは開発中です！\n\n音声学に基づく科学的発音学習システムをお楽しみに！\n\n📋 予定機能:\n• 調音位置の視覚化\n• 音韻マップ学習\n• リンキングサウンド習得')
    },
    handleSettings() {
      console.log('⚙️ 設定画面に遷移')
      this.$router.push({ name: 'settings' })
        .catch(error => {
          console.error('設定画面ルーティングエラー:', error)
          alert('🚧 設定画面の読み込み中にエラーが発生しました。\nページをリロードしてもう一度お試しください。')
        })
    },
    handleProfile() {
      console.log('👤 プロフィール画面に遷移')
      this.$router.push({ name: 'profile' })
        .catch(error => {
          console.error('プロフィール画面ルーティングエラー:', error)
          alert('🚧 プロフィール画面の読み込み中にエラーが発生しました。\nページをリロードしてもう一度お試しください。')
        })
    },
    handleWordRush() {
      console.log('⚡ ワード・ラッシュ・アリーナに遷移')
      this.$router.push({ name: 'WordRushGame' })
        .catch(error => {
          console.error('ルーティングエラー:', error)
          alert('🚧 ページの読み込み中にエラーが発生しました。\nページをリロードしてもう一度お試しください。')
        })
    }
  }
}
</script>

<style scoped>
.galaxy-background {
  background: var(--space-void);
  color: white;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
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

.galaxy-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.galaxy-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
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

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.energy-gauge {
  background: linear-gradient(90deg, 
    #60A5FA 0%, 
    #A78BFA 50%, 
    #F472B6 100%);
  transition: width 0.5s ease;
}
</style>