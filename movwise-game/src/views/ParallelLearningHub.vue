<template>
  <div class="parallel-hub">
    <div class="header">
      <h1>パラレル・ラーニング・ハブ</h1>
      <p class="subtitle">常に利用可能な補助学習トラック</p>
    </div>

    <!-- 語彙マスター・トラック -->
    <div class="track-section">
      <div class="track-header">
        <h2>📖 語彙マスター・トラック</h2>
        <p>実用的な英単語を効率的に習得！</p>
      </div>
      <div class="games-grid">
        <div
          v-for="game in vocabularyTrack.games"
          :key="game.id"
          class="game-card"
          :class="{ locked: !game.unlocked }"
          @click="navigateToGame(game)"
        >
          <div class="game-icon">{{ game.icon }}</div>
          <h3>{{ game.name }}</h3>
          <p>{{ game.description }}</p>
          <div class="game-meta">
            <span class="difficulty">難易度: {{ '⭐'.repeat(game.difficulty) }}</span>
            <span v-if="game.isNew" class="new-badge">NEW!</span>
          </div>
        </div>
      </div>
    </div>

    <!-- リズム＆ライム・トラック -->
    <div class="track-section">
      <div class="track-header">
        <h2>🎪 リズム＆ライム・トラック</h2>
        <p>楽しみながら英語のリズムを体得！</p>
      </div>
      <div class="games-grid">
        <div
          v-for="game in rhythmTrack.games"
          :key="game.id"
          class="game-card"
          :class="{ locked: !game.unlocked }"
          @click="navigateToGame(game)"
        >
          <div class="game-icon">{{ game.icon }}</div>
          <h3>{{ game.name }}</h3>
          <p>{{ game.description }}</p>
          <div class="game-meta">
            <span class="difficulty">難易度: {{ '⭐'.repeat(game.difficulty) }}</span>
            <span v-if="game.isNew" class="new-badge">NEW!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 語彙マスター・トラック
const vocabularyTrack = reactive({
  games: [
    {
      id: 'sightWordMaster',
      name: 'サイトワード・マスター',
      description: '頻出単語200語の瞬間認識',
      icon: '👁️',
      difficulty: 2,
      unlocked: true,
      routeName: 'sight-word-master',
      isNew: false
    },
    {
      id: 'wordRushArena',
      name: 'ワード・ラッシュ・アリーナ',
      description: '60秒で10問！画像・音声・定義から瞬時に英単語を認識',
      icon: '⚡',
      difficulty: 3,
      unlocked: true,
      routeName: 'WordRushGame',
      isNew: true
    },
    {
      id: 'themeVocabulary',
      name: 'テーマ別語彙チャレンジ',
      description: 'カテゴリー別に語彙を効率学習',
      icon: '🎯',
      difficulty: 3,
      unlocked: true,
      routeName: 'theme-vocabulary',
      isNew: true
    }
  ]
})

// リズム＆ライム・トラック
const rhythmTrack = reactive({
  games: [
    {
      id: 'rhymingRush',
      name: 'ライミング・ラッシュ',
      description: '韻を踏む単語をスピードキャッチ',
      icon: '🎪',
      difficulty: 2,
      unlocked: true,
      routeName: 'rhyming-rush',
      isNew: false
    },
    {
      id: 'magicCardBattle',
      name: '魔法カードバトル',
      description: '音声でカードを発動！魔法のバトルゲーム',
      icon: '🃏',
      difficulty: 2,
      unlocked: true,
      routeName: 'magic-card-battle',
      isNew: true
    },
    {
      id: 'spellRacing',
      name: 'スペル・レーシング',
      description: '音声で宇宙船を操縦！高速レースゲーム',
      icon: '🚀',
      difficulty: 3,
      unlocked: true,
      routeName: 'spell-racing',
      isNew: true
    }
  ]
})

// ゲームへナビゲート
const navigateToGame = (game) => {
  if (game.unlocked && game.routeName) {
    router.push({ name: game.routeName })
  }
}
</script>

<style scoped>
.parallel-hub {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  color: #a0a0a0;
}

.track-section {
  margin-bottom: 3rem;
}

.track-header {
  margin-bottom: 2rem;
}

.track-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.track-header p {
  color: #a0a0a0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.game-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.game-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.game-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.game-card p {
  font-size: 0.9rem;
  color: #a0a0a0;
  margin-bottom: 1rem;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.difficulty {
  color: #ffd700;
}

.new-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  font-size: 0.75rem;
}
</style>