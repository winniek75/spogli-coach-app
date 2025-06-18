<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background with animated stars -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- 宇宙パーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="particle in particles"
        :key="particle.id"
        :class="[
          'absolute rounded-full',
          particle.type === 'comet' ? 'comet-trail bg-gradient-to-r from-yellow-400 to-transparent' : 'star-particle'
        ]"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          opacity: particle.opacity,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`
        }"
      />
    </div>
    
    <!-- ネビュラ効果 -->
    <div class="nebula-effect"></div>

    <!-- VRモード切替ボタン -->
    <button
      @click="toggleVR"
      :class="[
        'fixed top-4 right-4 z-50 px-4 py-2 rounded-full font-bold transition-all duration-300',
        vrMode 
          ? 'galaxy-button galaxy-button-primary text-white shadow-2xl transform scale-110' 
          : 'galaxy-button galaxy-button-secondary text-white shadow-lg hover:shadow-xl hover:scale-105'
      ]"
    >
      <div class="flex items-center gap-2">
        <span class="text-lg cosmic-glow">🥽</span>
        <span>{{ vrMode ? 'VR終了' : 'VRモード' }}</span>
      </div>
    </button>

    <!-- メインコンテンツ -->
    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- ヘッダー -->
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
              🌌 サウンド・ネビュラ航行マップ
            </h1>
            <p class="text-galaxy-moon-silver text-lg">音韻星雲の惑星を段階的に探索し、英語音素エネルギーをマスターする宇宙冒険</p>
          </div>

          <button class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200">
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- プレイヤー情報 -->
        <div class="flex items-center justify-center mb-6">
          <div class="text-center">
            <button
              @click="showAvatarModal = true"
              class="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-4xl shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 mb-3"
            >
              {{ playerData.avatar }}
            </button>
            <div class="font-bold text-xl galaxy-text-primary">{{ playerData.title }}</div>
            <div class="text-galaxy-moon-silver">レベル {{ playerData.level }}</div>
          </div>
        </div>

        <!-- ステータス -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🏆</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ playerData.totalScore.toLocaleString() }}</div>
            <div class="text-sm text-galaxy-moon-silver">総スコア</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">⚡</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ playerData.soundGems.toLocaleString() }}</div>
            <div class="text-sm text-galaxy-moon-silver">音素エネルギー</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🚀</div>
            <div class="font-bold text-lg galaxy-text-primary">船長Lv.{{ playerData.level }}</div>
            <div class="w-full bg-white/30 rounded-full h-2 mt-2">
              <div 
                class="energy-gauge h-2 rounded-full transition-all duration-500"
                :style="{ width: `${getLevelProgress()}%` }"
              />
            </div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🌌</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ playerData.streak }}日</div>
            <div class="text-sm text-galaxy-moon-silver">航行日数</div>
          </div>
        </div>
      </div>

      <!-- 学習パス説明 -->
      <div class="galaxy-card rounded-3xl p-6 mb-6 shadow-2xl">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-4 flex items-center gap-2">
          <Map class="w-6 h-6 cosmic-glow" />
          🗺️ 宇宙航行ルート
        </h2>
        <div class="text-galaxy-moon-silver text-sm leading-relaxed">
          <p class="mb-2">
            <strong class="cosmic-glow">🎯 科学的学習順序:</strong> 音素エネルギー → 音韻ルール → 音声変換 → 英単語 → 文法銀河 → 構文宇宙 → パターン習得
          </p>
          <p>
            各惑星は前の惑星を一定レベル完了することでアンロックされます。基礎をしっかり固めてから次のステップに進みましょう！
          </p>
        </div>
      </div>

      <!-- デイリークエスト -->
      <div class="galaxy-card rounded-3xl p-6 mb-6 shadow-2xl">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-4 flex items-center gap-2">
          <Trophy class="w-6 h-6 cosmic-glow" />
          🌟 今日のミッション
        </h2>
        <div class="grid gap-4">
          <div 
            v-for="quest in dailyQuests"
            :key="quest.id"
            :class="[
              'galaxy-card p-4 rounded-2xl transition-all duration-200',
              quest.progress >= quest.target 
                ? 'quest-completed' 
                : 'quest-pending'
            ]"
          >
            <div class="flex items-center gap-4">
              <div class="text-3xl cosmic-glow">{{ quest.icon }}</div>
              <div>
                <div class="font-bold galaxy-text-primary">{{ quest.name }}</div>
                <div class="text-galaxy-moon-silver text-sm">{{ quest.description }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg">
                <span v-if="quest.progress >= quest.target" class="text-green-400 cosmic-glow">完了！</span>
                <span v-else class="text-galaxy-moon-silver">{{ quest.progress }}/{{ quest.target }}</span>
              </div>
              <div class="flex items-center gap-1 text-yellow-400">
                <Gem class="w-4 h-4 cosmic-glow" />
                <span class="font-bold">{{ quest.reward }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- サウンド・マスタリー諸島 -->
      <div class="space-y-8">
        <div 
          v-for="island in Object.values(soundMasteryIslands)"
          :key="island.id"
          :class="[
            'galaxy-card backdrop-blur-sm rounded-3xl p-6 shadow-2xl transition-all duration-300',
            island.unlocked 
              ? 'island-unlocked' 
              : 'island-locked'
          ]"
        >
          <!-- 島ヘッダー -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="text-4xl cosmic-glow">{{ island.name.split(' ')[0] }}</div>
              <div>
                <h3 class="text-2xl font-bold galaxy-text-primary cosmic-title">{{ island.name }}</h3>
                <p class="text-galaxy-moon-silver">{{ island.description }}</p>
                <div class="text-sm text-yellow-400 font-semibold mt-1 cosmic-glow">{{ island.learningFocus }}</div>
              </div>
            </div>
            
            <div class="text-right">
              <template v-if="island.unlocked">
                <div>
                  <div class="text-2xl font-bold text-green-400 cosmic-glow">{{ island.progress }}%</div>
                  <div class="text-sm text-galaxy-moon-silver">完了</div>
                  <div class="w-24 bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      class="energy-gauge h-2 rounded-full transition-all duration-500"
                      :style="{ width: `${island.progress}%` }"
                    />
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-center">
                  <div class="text-2xl text-galaxy-moon-silver">🔒</div>
                  <div class="text-sm text-galaxy-moon-silver max-w-32">{{ island.unlockRequirement }}</div>
                </div>
              </template>
            </div>
          </div>

          <!-- ゲーム一覧 -->
          <div class="grid md:grid-cols-2 gap-6">
            <div
              v-for="game in island.games"
              :key="game.id"
              :class="[
                'galaxy-card group relative p-6 rounded-2xl border-2 transition-all duration-300',
                game.unlocked && island.unlocked
                  ? 'game-unlocked cursor-pointer transform hover:scale-105'
                  : 'game-locked cursor-not-allowed'
              ]"
              @click="(game.unlocked && island.unlocked) && startGame(game.id)"
            >
              <!-- 新規/おすすめバッジ -->
              <div
                v-if="game.isNew && game.unlocked && island.unlocked"
                class="absolute -top-2 -right-2 bg-gradient-to-r from-red-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
              >
                NEW!
              </div>
              <div
                v-else-if="game.featured && game.unlocked && island.unlocked"
                class="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
              >
                おすすめ
              </div>

              <div class="flex items-start gap-4">
                <div :class="['w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br', getDifficultyColor(game.difficulty)]">
                  {{ (game.unlocked && island.unlocked) ? game.icon : '🔒' }}
                </div>
                
                <div class="flex-1">
                  <h4 class="text-xl font-bold galaxy-text-primary mb-2">{{ game.name }}</h4>
                  <p class="text-galaxy-moon-silver text-sm mb-4">{{ game.description }}</p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-galaxy-moon-silver">難易度:</span>
                      <div class="flex gap-1">
                        <span 
                          v-for="i in 3" 
                          :key="i"
                          class="w-2 h-2 rounded-full"
                          :class="i <= game.difficulty ? 'bg-yellow-400' : 'bg-gray-600'"
                        ></span>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                      <span class="text-yellow-400 cosmic-glow">💎</span>
                      <span class="font-bold text-galaxy-moon-silver">{{ game.reward }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- アバター選択モーダル -->
    <div v-if="showAvatarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">アバターを選択</h3>
        <div class="grid grid-cols-4 gap-4 mb-6">
          <button
            v-for="avatar in avatarOptions"
            :key="avatar"
            @click="changeAvatar(avatar)"
            :class="[
              'w-16 h-16 rounded-full text-2xl flex items-center justify-center transition-all duration-200',
              playerData.avatar === avatar
                ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200'
            ]"
          >
            {{ avatar }}
          </button>
        </div>
        <button
          @click="showAvatarModal = false"
          class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-xl font-bold transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>

    <!-- ゲーム統計モーダル -->
    <div v-if="showStatsModal && selectedGame" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full mx-4">
        <div class="flex items-center gap-4 mb-6">
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br', getDifficultyColor(selectedGame.difficulty)]">
            {{ selectedGame.icon }}
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ selectedGame.name }}</h3>
            <p class="text-gray-600">{{ selectedGame.description }}</p>
          </div>
        </div>
        
        <div class="space-y-4 mb-6">
          <div class="flex justify-between">
            <span class="text-gray-600">ベストスコア</span>
            <span class="font-bold text-yellow-600">{{ selectedGame.bestScore.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">進捗</span>
            <span class="font-bold text-purple-600">{{ selectedGame.progress }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">難易度</span>
            <span class="font-bold">{{ ['', '初級', '中級', '上級', '最上級'][selectedGame.difficulty] || '不明' }}</span>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button
            @click="() => {
              showStatsModal = false;
              startGame(selectedGame.id);
            }"
            class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
          >
            プレイ開始
          </button>
          <button
            @click="showStatsModal = false"
            class="bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-xl font-bold transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
    <!-- フッターナビゲーション（追加） -->
    <CommonFooter :active="'sound'" @navigate="handleFooterNav" />
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Volume2, Play, Star, Trophy, Target, Zap, Heart, ChevronRight, 
  RotateCcw, CheckCircle, XCircle, Award, Crown, Flame, Gem,
  ArrowLeft, Settings, User, Map, Book, Headphones,
  Music,
  Globe,
  Building2,
  UserIcon
} from 'lucide-vue-next'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'SoundAdventureHub',
  components: {
    Volume2, Play, Star, Trophy, Target, Zap, Heart, ChevronRight,
    RotateCcw, CheckCircle, XCircle, Award, Crown, Flame, Gem,
    ArrowLeft, Settings, User, Map, Book, Headphones,
    Music,
    Globe,
    Building2,
    UserIcon,
    CommonFooter
  },
  setup() {
    const router = useRouter()

    // ゲーム状態管理
    const playerData = reactive({
      level: 12,
      exp: 2850,
      soundGems: 1245,
      avatar: '🦸‍♂️',
      title: 'サウンド・レンジャー',
      streak: 7,
      totalScore: 45670
    })

    const showAvatarModal = ref(false)
    const showStatsModal = ref(false)
    const selectedGame = ref(null)
    const vrMode = ref(false)

    // デイリークエスト（修正版）
    const dailyQuests = ref([
      {
        id: 1,
        name: 'ピュア・サウンド・マスター',
        description: 'Pure Sound Labで15音素認識',
        icon: '🔬',
        progress: 12,
        target: 15,
        reward: 200,
        type: 'pureSounds'
      },
      {
        id: 2,
        name: 'サウンド・パターン探偵',
        description: '音韻ルールを5つ発見',
        icon: '🕵️',
        progress: 3,
        target: 5,
        reward: 150,
        type: 'phonemeRules'
      },
      {
        id: 3,
        name: 'ブレンディング・チャンピオン',
        description: '音素合成で10語完成',
        icon: '🎵',
        progress: 7,
        target: 10,
        reward: 180,
        type: 'blending'
      },
      {
        id: 4,
        name: 'パーフェクト・パフォーマー',
        description: '任意のゲームで100%スコア',
        icon: '💯',
        progress: 0,
        target: 1,
        reward: 300,
        type: 'perfect'
      },
      {
        id: 5,
        name: 'ワード・ラッシュ・マスター',
        description: 'Word Rushで80%以上の正解率達成',
        icon: '⚡',
        progress: 0,
        target: 1,
        reward: 250,
        type: 'wordRush'
      },
      {
        id: 6,
        name: 'スピード・ボキャブラリスト',
        description: 'Word Rushで5連続正解達成',
        icon: '🔥',
        progress: 0,
        target: 1,
        reward: 200,
        type: 'wordRushStreak'
      }
    ])

    // サウンド・マスタリー諸島（科学的学習順序に基づく）
    const soundMasteryIslands = reactive({
      // Stage 1: サウンド・ファウンデーション（音の基礎）
      soundFoundation: {
        id: 'soundFoundation',
        name: '🎵 サウンド・ファウンデーション',
        description: '純粋な音認識からスタート。英語の44音素をマスターしよう！',
        learningFocus: 'Stage 1: 音の基礎 → 音素認識能力を身につける',
        unlocked: true,
        progress: 65,
        games: [
          {
            id: 'pureSoundLab',
            name: 'ピュア・サウンド・ラボ',
            description: '文字を見ずに音だけで44音素を段階的に学習',
            icon: '🔬',
            difficulty: 1,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: true,
            isNew: false,
            routeName: 'pure-sound-lab'
          },
          {
            id: 'soundToSymbolMatch',
            name: 'サウンド→シンボル・マッチング',
            description: '音を聞いて対応する文字を選択する音文字結合',
            icon: '🎯',
            difficulty: 1,
            bestScore: 1800,
            progress: 75,
            unlocked: true,
            featured: false
          },
          {
            id: 'phonemePatternLab',
            name: 'フォニックス・パターン・ラボ',
            description: '同音素グループの体系的学習（短母音、長母音等）',
            icon: '⚗️',
            difficulty: 1,
            bestScore: 2100,
            progress: 55,
            unlocked: true,
            featured: false
          }
        ]
      },

      // Stage 2: ブレンディング・ベーシック（音素合成）
      blendingBasic: {
        id: 'blendingBasic',
        name: '⭐ ブレンディング・ベーシック',
        description: '音素を組み合わせて単語を作成！基本的な音声変換をマスター',
        learningFocus: 'Stage 2: 音素合成 → 音を組み合わせて単語を作る',
        unlocked: true,
        progress: 40,
        unlockRequirement: 'Stage 1を70%完了',
        games: [
          {
            id: 'sequentialBlending',
            name: 'シーケンシャル・ブレンディング',
            description: 'c-a-t → catの段階的音素合成を視覚化',
            icon: '📈',
            difficulty: 2,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: true,
            isNew: true
          },
          {
            id: 'cvcWordFactory',
            name: 'CVC ワード・ファクトリー',
            description: '子音-母音-子音パターンの体系的学習',
            icon: '🏭',
            difficulty: 2,
            bestScore: 2100,
            progress: 0,
            unlocked: true,
            featured: false
          },
          {
            id: 'wordFamilyTree',
            name: 'ワード・ファミリー・ツリー',
            description: '-at family（cat, hat, bat）等の音韻パターン学習',
            icon: '🌳',
            difficulty: 2,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: false,
            isNew: true
          }
        ]
      },

      // Stage 3: ディクテーション＆スペリング（音声を文字へ）
      dictationSpelling: {
        id: 'dictationSpelling',
        name: '✍️ ディクテーション＆スペリング',
        description: '聞いた音を正確に文字化！スペリング能力を強化',
        learningFocus: 'Stage 3: 音声→文字 → 聞いた音を正確に書き取る',
        unlocked: false,
        progress: 0,
        unlockRequirement: 'Stage 2を60%完了',
        games: [
          {
            id: 'voiceDictation',
            name: '音声ディクテーション',
            description: '聞いた単語を正確にタイピング',
            icon: '🎧',
            difficulty: 2,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: true,
            isNew: true
          },
          {
            id: 'spellChallenge',
            name: 'スペル・チャレンジ',
            description: '正確な綴りを段階的に学習',
            icon: '✏️',
            difficulty: 2,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          },
          {
            id: 'phonemeDecomposition',
            name: '音素分解ゲーム',
            description: '単語を聞いて音素に分解',
            icon: '🧩',
            difficulty: 3,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          }
        ]
      },

      // Stage 4: スペシャル・サウンド・ルール（特殊音韻ルール）
      specialSoundRules: {
        id: 'specialSoundRules',
        name: '🌙 スペシャル・サウンド・ルール',
        description: '特殊な音韻ルールをマスター！英語の音の秘密を解き明かそう',
        learningFocus: 'Stage 4: 特殊ルール → 音韻変化パターンを習得',
        unlocked: false,
        progress: 0,
        unlockRequirement: 'Stage 3を70%完了',
        games: [
          {
            id: 'digraphMaster',
            name: 'ダイグラフ・マスター',
            description: 'ch, sh, th, wh, phの二文字一音パターン',
            icon: '👯',
            difficulty: 3,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: true,
            isNew: true
          },
          {
            id: 'magicECastle',
            name: 'マジック・E・キャッスル',
            description: '長母音変化の魔法をマスター（can→cane, bit→bite）',
            icon: '🏰',
            difficulty: 3,
            bestScore: 1200,
            progress: 60,
            unlocked: false,
            featured: true,
            routeName: 'magic-e-castle'
          },
          {
            id: 'silentLetterDetective',
            name: 'サイレント・レター探偵',
            description: '無音文字のパターンを発見（knife, knee, write等）',
            icon: '🕵️',
            difficulty: 3,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          },
          {
            id: 'doubleLetterLab',
            name: 'ダブル・レター・ラボ',
            description: 'ff, ll, ssなどの重子音ルールを学習',
            icon: '👥',
            difficulty: 3,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          }
        ]
      },

      // Stage 5: アドバンスド・フォニックス（上級音韻）
      advancedPhonics: {
        id: 'advancedPhonics',
        name: '🚀 アドバンスド・フォニックス',
        description: '複雑な音韻パターンに挑戦！上級レベルへの道',
        learningFocus: 'Stage 5: 上級音韻 → 複雑なパターンを習得',
        unlocked: false,
        progress: 0,
        unlockRequirement: 'Stage 4を70%完了',
        games: [
          {
            id: 'homophoneChallenge',
            name: '同音異綴チャレンジ',
            description: 'to/too/two, their/there等の使い分け',
            icon: '🎭',
            difficulty: 4,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: true,
            isNew: true
          },
          {
            id: 'rControlledVowels',
            name: 'Rコントロール・ボウルティックス',
            description: 'ar, er, ir, or, urの音変化をマスター',
            icon: '🎪',
            difficulty: 4,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          },
          {
            id: 'complexPhonemePatterns',
            name: 'コンプレックス・フォニーム・パターンズ',
            description: 'ough, tion, sion等の複雑パターン',
            icon: '🧬',
            difficulty: 4,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          }
        ]
      },

      // Stage 6: プロソディ＆フルーエンシー（韻律と流暢さ）
      prosodyFluency: {
        id: 'prosodyFluency',
        name: '🎭 プロソディ＆フルーエンシー',
        description: '英語の音楽性を習得！自然な英語のリズムをマスター',
        learningFocus: 'Stage 6: 韻律 → 自然な英語の音楽性を身につける',
        unlocked: false,
        progress: 0,
        unlockRequirement: 'Stage 5を80%完了',
        games: [
          {
            id: 'stressPatternMaster',
            name: 'ストレス・パターン・マスター',
            description: '単語アクセント学習（PREsent vs preSENT）',
            icon: '🥁',
            difficulty: 4,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: true,
            isNew: true
          },
          {
            id: 'intonationWave',
            name: 'イントネーション・ウェーブ',
            description: '文の音調変化（疑問文、平叙文の違い）',
            icon: '🌊',
            difficulty: 4,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          },
          {
            id: 'rhythmAndFlow',
            name: 'リズム・アンド・フロー',
            description: '英語の自然なリズムとフレージング',
            icon: '🎵',
            difficulty: 4,
            bestScore: 0,
            progress: 0,
            unlocked: false,
            featured: false,
            isNew: true
          }
        ]
      },

      // NEW: サウンド・アドベンチャー・ゾーン（特別な体験型学習）
      soundAdventureZone: {
        id: 'soundAdventureZone',
        name: '🌌 サウンド・アドベンチャー・ゾーン',
        description: '特別な体験型音素学習！冒険、バトル、パズル、音楽、育成要素で音韻マスター',
        learningFocus: 'Special Zone: 体験型学習 → ゲーミフィケーションで音素を完全習得',
        unlocked: true,
        progress: 0,
        games: [
          {
            id: 'spaceSoundAdventure',
            name: 'スペース・サウンド・アドベンチャー',
            description: '音素エネルギーを収集して宇宙船をアップグレード！',
            icon: '🌌',
            difficulty: 2,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: true,
            isNew: true,
            routeName: 'space-sound-adventure'
          },
          {
            id: 'soundBattleArena',
            name: 'サウンド・バトル・アリーナ',
            description: '音素の力で相手を倒せ！連続バトルで音韻マスター',
            icon: '⚔️',
            difficulty: 3,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: true,
            isNew: true,
            routeName: 'sound-battle-arena'
          },
          {
            id: 'rhythmPhonicsDance',
            name: 'リズム・フォニックス・ダンス',
            description: '音楽のリズムに合わせて正確な音素を選択',
            icon: '🎵',
            difficulty: 2,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: false,
            isNew: true,
            routeName: 'rhythm-phonics-dance'
          },
          {
            id: 'phonicsPuzzleQuest',
            name: 'フォニックス・パズル・クエスト',
            description: '音素パズルを解いて古代の音韻の秘宝を発見',
            icon: '🧩',
            difficulty: 3,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: false,
            isNew: true,
            routeName: 'phonics-puzzle-quest'
          },
          {
            id: 'soundFarm',
            name: 'サウンド・ファーム',
            description: '音素の種を育てて語彙の収穫を楽しもう',
            icon: '🌱',
            difficulty: 1,
            bestScore: 0,
            progress: 0,
            unlocked: true,
            featured: false,
            isNew: true,
            routeName: 'sound-farm'
          }
        ]
      }
    })

    // パーティクル効果用の配列（星型に強化）
    const particles = ref(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
      size: 2 + Math.random() * 4,
      type: Math.random() > 0.8 ? 'comet' : 'star', // 20%の確率で流れ星
      opacity: 0.3 + Math.random() * 0.7
    })))

    // アバター選択肢
    const avatarOptions = ['🦸‍♂️', '🧙‍♂️', '👨‍🚀', '🤖', '🦸‍♀️', '🧙‍♀️', '👩‍🚀', '🐱', '🐶', '🐸', '🦉', '🐙']

    // 実績バッジ（更新版）
    const achievements = ref([
      {
        id: 1,
        name: 'サウンド・パイオニア',
        description: '初回音認識完了',
        icon: '🎯',
        earned: true,
        rarity: 'common'
      },
      {
        id: 2,
        name: 'ストリーク・スター',
        description: '7日連続プレイ',
        icon: '🔥',
        earned: true,
        rarity: 'rare'
      },
      {
        id: 3,
        name: 'ピュア・サウンド・マスター',
        description: '44音素すべて認識達成',
        icon: '🔬',
        earned: false,
        rarity: 'epic'
      },
      {
        id: 4,
        name: 'フォニックス・レジェンド',
        description: '全島をマスター',
        icon: '👑',
        earned: false,
        rarity: 'legendary'
      },
      {
        id: 5,
        name: 'スピード・デーモン',
        description: '制限時間の半分でクリア',
        icon: '⚡',
        earned: false,
        rarity: 'epic'
      },
      {
        id: 6,
        name: 'パターン・ディテクティブ',
        description: '音韻ルール20パターン発見',
        icon: '🕵️',
        earned: false,
        rarity: 'rare'
      },
      {
        id: 7,
        name: 'ブレンディング・アーティスト',
        description: '音素合成100語達成',
        icon: '🎨',
        earned: false,
        rarity: 'epic'
      },
      {
        id: 8,
        name: 'サウンド・アーキテクト',
        description: '完璧な学習ルート完走',
        icon: '🏛️',
        earned: false,
        rarity: 'legendary'
      }
    ])

    // ゲーム開始
    const startGame = (gameId) => {
      console.log(`🎮 ゲーム開始: ${gameId}`)
      // 実装済みゲームのチェック
      const implementedGames = [
        'pureSoundLab',
        'soundToSymbolMatch',
        'phonemePatternLab',
        'magicECastle',
        'magicCardBattle',
        'spellRacing',
        'magicCooking',
        'voicePuzzle',
        'cvcWordFactory',
        'wordFamilyTree',
        'sightWordMaster',
        'wordRushArena',
        'digraphMaster',
        'rControlledVowels',
        'stressPatternMaster',
        'intonationWave',
        'rhymingRush',
        'complexPhonemePatterns',
        'phonicsBossChallenge',
        'spaceSoundAdventure',
        'soundBattleArena',
        'rhythmPhonicsDance',
        'phonicsPuzzleQuest',
        'soundFarm'
      ]
      if (!implementedGames.includes(gameId)) {
        alert('🚧 このゲームは開発中です！\n\n近日公開予定ですので、もう少しお待ちください。')
        return
      }
      // ルート名をrouter/index.jsのnameに合わせる
      const routes = {
        'pureSoundLab': 'pure-sound-lab',
        'soundToSymbolMatch': 'sound-to-symbol',
        'phonemePatternLab': 'phoneme-pattern-lab',
        'magicECastle': 'magic-e-castle',
        'magicCardBattle': 'magic-card-battle',
        'spellRacing': 'spell-racing',
        'magicCooking': 'magic-cooking',
        'voicePuzzle': 'voice-puzzle',
        'cvcWordFactory': 'cvc-word-factory',
        'wordFamilyTree': 'word-family-tree',
        'sightWordMaster': 'sight-word-master',
        'wordRushArena': 'WordRushGame',
        'digraphMaster': 'digraph-master',
        'rControlledVowels': 'r-controlled-vowels',
        'stressPatternMaster': 'stress-pattern-master',
        'intonationWave': 'intonation-wave',
        'rhymingRush': 'rhyming-rush',
        'complexPhonemePatterns': 'complex-phoneme-patterns',
        'phonicsBossChallenge': 'phonics-boss-challenge',
        'spaceSoundAdventure': 'space-sound-adventure',
        'soundBattleArena': 'sound-battle-arena',
        'rhythmPhonicsDance': 'rhythm-phonics-dance',
        'phonicsPuzzleQuest': 'phonics-puzzle-quest',
        'soundFarm': 'sound-farm'
      }
      if (routes[gameId]) {
        router.push({ name: routes[gameId] })
          .catch(error => {
            console.error('ナビゲーションエラー:', error)
            alert('🚧 ページの読み込み中にエラーが発生しました。')
          })
      }
    }

    // ゲーム統計表示
    const showGameStats = (game) => {
      selectedGame.value = game
      showStatsModal.value = true
    }

    // アバター変更
    const changeAvatar = (newAvatar) => {
      playerData.avatar = newAvatar
      showAvatarModal.value = false
    }

    // VRモード切替
    const toggleVR = () => {
      vrMode.value = !vrMode.value
    }

    // レベル進捗計算
    const getLevelProgress = () => {
      return ((playerData.exp % 1000) / 1000) * 100
    }

    // 難易度色の取得
    const getDifficultyColor = (difficulty) => {
      const colors = {
        1: 'from-green-400 to-green-600',
        2: 'from-blue-400 to-blue-600', 
        3: 'from-purple-400 to-purple-600',
        4: 'from-red-400 to-red-600'
      }
      return colors[difficulty] || 'from-gray-400 to-gray-600'
    }

    // レアリティ色の取得
    const getRarityColor = (rarity) => {
      const colors = {
        common: 'from-gray-400 to-gray-600',
        rare: 'from-blue-400 to-blue-600',
        epic: 'from-purple-400 to-purple-600',
        legendary: 'from-yellow-400 to-yellow-600'
      }
      return colors[rarity] || 'from-gray-400 to-gray-600'
    }

    // 戻るボタンの処理
    const handleBack = () => {
      router.back()
    }

    function handleFooterNav(target) {
      if (target === 'sound') router.push('/sound-adventure')
      if (target === 'grammar') router.push('/grammar-galaxy')
      if (target === 'academy') router.push('/virtual-academy')
      if (target === 'profile') router.push('/profile')
    }

    return {
      playerData,
      showAvatarModal,
      showStatsModal,
      selectedGame,
      vrMode,
      dailyQuests,
      soundMasteryIslands,
      achievements,
      particles,
      avatarOptions,
      startGame,
      showGameStats,
      changeAvatar,
      toggleVR,
      getLevelProgress,
      getDifficultyColor,
      getRarityColor,
      handleBack,
      handleFooterNav
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

.comet-trail {
  position: absolute;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), transparent);
  animation: comet-move 3s linear infinite;
}

.star-particle {
  background: white;
  box-shadow: 0 0 10px white;
  animation: star-twinkle 2s ease-in-out infinite;
}

@keyframes comet-move {
  0% {
    transform: translateX(-100%) translateY(0) rotate(45deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(200%) translateY(200%) rotate(45deg);
    opacity: 0;
  }
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.nebula-effect {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%);
  animation: nebula-drift 20s ease-in-out infinite alternate;
}

@keyframes nebula-drift {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(30deg) brightness(1.2); }
}

.island-unlocked {
  border-color: rgba(59, 130, 246, 0.4);
}

.island-locked {
  border-color: rgba(75, 85, 99, 0.4);
  opacity: 0.7;
}

.game-unlocked {
  border-color: rgba(59, 130, 246, 0.4);
}

.game-locked {
  border-color: rgba(75, 85, 99, 0.4);
  opacity: 0.7;
}

.quest-completed {
  border-color: rgba(34, 197, 94, 0.4);
}

.quest-pending {
  border-color: rgba(59, 130, 246, 0.4);
}
</style>