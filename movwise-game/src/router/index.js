// src/router/index.js - 科学的学習順序対応版
import { createRouter, createWebHistory } from 'vue-router'
import { useGameSettingsStore } from '../stores/gameSettings'
import { useGameStore } from '../stores/gameStore'

// ゲームコンポーネントの動的インポート
const RhymingGame = () => import('@/components/games/RhymingGame.vue')
const RhythmTapperGame = () => import('@/components/games/RhythmTapperGame.vue')
const SinglePhonemeGame = () => import('@/components/games/SinglePhonemeGame.vue')
const BlendingBuilderGame = () => import('@/components/games/BlendingBuilderGame.vue')
const CvcWordGame = () => import('@/components/games/CvcWordGame.vue')
const SoundHunterGame = () => import('@/components/games/SoundHunterGame.vue')
const MagicCastleJumpGame = () => import('@/components/games/MagicCastleJumpGame.vue')
const SightWordMaster = () => import('@/components/games/SightWordMaster.vue')
const WordRushGame = () => import('@/components/games/WordRushGame.vue')
const BeVerbRushGame = () => import('@/components/games/BeVerbRush.vue')

// サウンドアドベンチャーハブ
const SoundAdventureHub = () => import('../views/SoundAdventureHub.vue')

// 文法ゲームの動的インポート
const GrammarGalaxyFoundation = () => import('@/views/GrammarGalaxyFoundation.vue')
const GrammarGalaxyHub = () => import('@/views/GrammarGalaxyHub.vue')
const GrammarColorCodeGame = () => import('@/components/games/grammar-galaxy/GrammarColorCodeGame.vue')
const PatternHunterGame = () => import('@/components/games/grammar-galaxy/PatternHunterGame.vue')
const GrammarReflexArena = () => import('@/components/games/grammar-galaxy/GrammarReflexArena.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ホーム
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: 'MovWISE - 身体で覚える英語学習'
      }
    },

    // プロフィール
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        title: 'プロフィール - MovWISE Galaxy'
      }
    },

    // 設定
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        title: '設定 - MovWISE Galaxy'
      }
    },

    // サウンド・マスタリー・アーキペラゴ メインハブ
    {
      path: '/sound-adventure',
      name: 'SoundAdventureHub',
      component: () => import('../views/SoundAdventureHub.vue'),
      meta: {
        title: 'サウンド・マスタリー・アーキペラゴ',
        requiresAuth: false
      }
    },

    // === Stage 1: サウンド・ファウンデーション島 ===
    // 純粋な音認識から開始（最重要基礎）
    {
      path: '/games/pure-sound-lab',
      name: 'pure-sound-lab',
      component: () => import('@/components/games/PureSoundLab.vue'),
      meta: {
        title: 'ピュア・サウンド・ラボ',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'pureSoundLab',
        icon: '🔬',
        description: '文字を見ずに音だけで44音素を段階的に学習',
        learningObjective: '音素認識能力の基礎構築',
        unlockRequirement: '常時アンロック（学習の出発点）'
      }
    },
    {
      path: '/games/sound-to-symbol',
      name: 'sound-to-symbol',
      component: SoundHunterGame, // 既存ゲームを音文字結合用に改修
      meta: {
        title: 'サウンド→シンボル・マッチング',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'soundToSymbolMatch',
        icon: '🎯',
        description: '音を聞いて対応する文字を選択する音文字結合',
        learningObjective: '聴覚と視覚の音韻情報結合',
        unlockRequirement: 'Pure Sound Lab 50%完了'
      }
    },
    {
      path: '/games/phoneme-pattern-lab',
      name: 'phoneme-pattern-lab',
      component: SinglePhonemeGame, // 既存ゲームをパターン学習用に改修
      meta: {
        title: 'フォニックス・パターン・ラボ',
        stage: 'soundFoundation',
        stageOrder: 1,
        difficulty: 'beginner',
        gameId: 'phonemePatternLab',
        icon: '⚗️',
        description: '同音素グループの体系的学習（短母音、長母音等）',
        learningObjective: '音素グループのパターン認識',
        unlockRequirement: 'Sound→Symbol Matching 60%完了'
      }
    },

    // === Stage 2: サウンド・ルールズ島 ===
    // 音韻変化とルール学習
    {
      path: '/games/magic-e-castle',
      name: 'magic-e-castle',
      component: () => import('@/components/games/MagicCastleJumpGame.vue'), // 既存ゲームを活用
      meta: {
        title: 'マジック・E・キャッスル',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'magicECastle',
        icon: '🏰',
        description: '長母音変化の魔法をマスター（can→cane, bit→bite）',
        learningObjective: 'Magic Eルールの習得',
        unlockRequirement: 'サウンド・ファウンデーション島 70%完了'
      }
    },
    {
      path: '/games/magic-card-battle',
      name: 'magic-card-battle',
      component: () => import('@/components/games/MagicCardBattleGame.vue'),
      meta: {
        title: '魔法カードバトル',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'magicCardBattle',
        icon: '🃏',
        description: '音声でカードを発動！魔法のバトルゲーム',
        learningObjective: 'Magic E音声練習',
        unlockRequirement: 'Magic E Castle 30%完了'
      }
    },
    {
      path: '/games/spell-racing',
      name: 'spell-racing',
      component: () => import('@/components/games/SpellRacingGame.vue'),
      meta: {
        title: 'スペル・レーシング',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'spellRacing',
        icon: '🚀',
        description: '音声で宇宙船を操縦！高速レースゲーム',
        learningObjective: '音声コントロール技術',
        unlockRequirement: 'Magic E Castle 50%完了'
      }
    },
    {
      path: '/games/magic-cooking',
      name: 'magic-cooking',
      component: () => import('@/components/games/MagicCookingGame.vue'),
      meta: {
        title: '宇宙魔法クッキング',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'magicCooking',
        icon: '👨‍🍳',
        description: '魔法で材料を変身させて料理を作ろう',
        learningObjective: '材料変身魔法練習',
        unlockRequirement: 'Magic E Castle 70%完了'
      }
    },
    {
      path: '/games/voice-puzzle',
      name: 'voice-puzzle',
      component: () => import('@/components/games/VoicePuzzleGame.vue'),
      meta: {
        title: '宇宙音声パズル',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'advanced',
        gameId: 'voicePuzzle',
        icon: '🧩',
        description: '音声でパズルピースを選択して美しい絵を完成',
        learningObjective: '高度な音声認識練習',
        unlockRequirement: 'Magic Cooking 60%完了'
      }
    },
    {
      path: '/games/silent-letter-detective',
      name: 'silent-letter-detective',
      component: () => import('@/components/games/SilentLetterDetectiveGame.vue'), // 新規開発必要
      meta: {
        title: 'サイレント・レター探偵',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'silentLetterDetective',
        icon: '🕵️',
        description: '無音文字のパターンを発見（knife, knee, write等）',
        learningObjective: '無音文字パターンの認識',
        unlockRequirement: 'Voice Puzzle 50%完了'
      }
    },
    {
      path: '/games/double-letter-lab',
      name: 'double-letter-lab',
      component: () => import('@/components/games/DoubleLetterLabGame.vue'), // 新規開発必要
      meta: {
        title: 'ダブル・レター・ラボ',
        stage: 'soundRules',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'doubleLetterLab',
        icon: '👥',
        description: 'ff, ll, ssなどの重子音ルールを学習',
        learningObjective: '重子音パターンの理解',
        unlockRequirement: 'Silent Letter Detective 40%完了'
      }
    },

    // === Stage 3: ブレンディング・マスタリー島 ===
    // 音素合成とCVC構造学習
    {
      path: '/games/sequential-blending',
      name: 'sequential-blending',
      component: () => import('@/components/games/SequentialBlendingGame.vue'), // 新規開発必要
      meta: {
        title: 'シーケンシャル・ブレンディング',
        stage: 'blendingMastery',
        stageOrder: 3,
        difficulty: 'intermediate',
        gameId: 'sequentialBlending',
        icon: '📈',
        description: 'c-a-t → catの段階的音素合成を視覚化',
        learningObjective: '音素から単語への変換技術',
        unlockRequirement: 'サウンド・ルールズ島 60%完了'
      }
    },
    {
      path: '/games/cvc-word-factory',
      name: 'cvc-word-factory',
      component: CvcWordGame, // 既存ゲームを活用
      meta: {
        title: 'CVC ワード・ファクトリー',
        stage: 'blendingMastery',
        stageOrder: 3,
        difficulty: 'intermediate',
        gameId: 'cvcWordFactory',
        icon: '🏭',
        description: '子音-母音-子音パターンの体系的学習',
        learningObjective: 'CVC構造の完全理解',
        unlockRequirement: 'Sequential Blending 60%完了'
      }
    },
    {
      path: '/games/word-family-tree',
      name: 'word-family-tree',
      component: () => import('@/components/games/WordFamilyTreeGame.vue'), // 新規開発必要
      meta: {
        title: 'ワード・ファミリー・ツリー',
        stage: 'blendingMastery',
        stageOrder: 3,
        difficulty: 'intermediate',
        gameId: 'wordFamilyTree',
        icon: '🌳',
        description: '-at family（cat, hat, bat）等の音韻パターン学習',
        learningObjective: '語族パターンの認識と応用',
        unlockRequirement: 'CVC Word Factory 50%完了'
      }
    },

    // === Stage 4: ワード・ビルディング島 ===
    // 語彙拡張と単語認識（SightWordはここに配置）
    {
      path: '/games/sight-word-master',
      name: 'sight-word-master',
      component: SightWordMaster, // 既存ゲーム（配置修正）
      meta: {
        title: 'サイトワード・マスター',
        stage: 'wordBuilding',
        stageOrder: 4, // レベル1から4に変更！
        difficulty: 'advanced',
        gameId: 'sightWordMaster',
        icon: '👁️',
        description: '重要なサイトワード200語の瞬間認識',
        learningObjective: '高頻度語の自動認識',
        unlockRequirement: 'ブレンディング・マスタリー島 70%完了'
      }
    },
    {
      path: '/games/digraph-master',
      name: 'digraph-master',
      component: () => import('@/components/games/DigraphMasterGame.vue'), // 新規開発必要
      meta: {
        title: 'ダイグラフ・マスター',
        stage: 'wordBuilding',
        stageOrder: 4,
        difficulty: 'advanced',
        gameId: 'digraphMaster',
        icon: '👯',
        description: 'ch, sh, th, wh, phの二文字一音パターン',
        learningObjective: 'ダイグラフパターンの習得',
        unlockRequirement: 'Sight Word Master 40%完了'
      }
    },
    {
      path: '/games/r-controlled-vowels',
      name: 'r-controlled-vowels',
      component: () => import('@/components/games/RControlledVowelsGame.vue'), // 新規開発必要
      meta: {
        title: 'Rコントロール・ボウルティックス',
        stage: 'wordBuilding',
        stageOrder: 4,
        difficulty: 'advanced',
        gameId: 'rControlledVowels',
        icon: '🎪',
        description: 'ar, er, ir, or, urの音変化をマスター',
        learningObjective: 'R制御母音の理解',
        unlockRequirement: 'Digraph Master 50%完了'
      }
    },
    {
      path: '/games/word-rush',
      name: 'WordRushGame',
      component: WordRushGame,
      meta: {
        title: 'ワード・ラッシュ・アリーナ',
        stage: 'wordBuilding',
        stageOrder: 4,
        difficulty: 'dynamic',
        gameId: 'wordRushArena',
        icon: '⚡',
        description: 'タイムプレッシャーの中で語彙認識速度を極限まで向上！画像・音声・定義から瞬時に英単語を識別する高速語彙習得ゲーム',
        learningObjective: '語彙認識速度の向上と応用',
        unlockRequirement: 'ブレンディング・マスタリー島 70%完了'
      }
    },

    // === Stage 5: リズム・アンド・プロソディ島 ===
    // 韻律とリズムパターン学習
    {
      path: '/games/stress-pattern-master',
      name: 'stress-pattern-master',
      component: () => import('@/components/games/StressPatternMasterGame.vue'), // 新規開発必要
      meta: {
        title: 'ストレス・パターン・マスター',
        stage: 'rhythmProsody',
        stageOrder: 5,
        difficulty: 'advanced',
        gameId: 'stressPatternMaster',
        icon: '🥁',
        description: '単語アクセント学習（PREsent vs preSENT）',
        learningObjective: '英語のストレスパターン習得',
        unlockRequirement: 'ワード・ビルディング島 70%完了'
      }
    },
    {
      path: '/games/intonation-wave',
      name: 'intonation-wave',
      component: () => import('@/components/games/IntonationWaveGame.vue'), // 新規開発必要
      meta: {
        title: 'イントネーション・ウェーブ',
        stage: 'rhythmProsody',
        stageOrder: 5,
        difficulty: 'advanced',
        gameId: 'intonationWave',
        icon: '🌊',
        description: '文の音調変化（疑問文、平叙文の違い）',
        learningObjective: '英語のイントネーション習得',
        unlockRequirement: 'Stress Pattern Master 50%完了'
      }
    },
    {
      path: '/games/rhyming-rush',
      name: 'rhyming-rush',
      component: RhymingGame, // 既存ゲームを活用
      meta: {
        title: 'ライミング・ラッシュ',
        stage: 'rhythmProsody',
        stageOrder: 5,
        difficulty: 'advanced',
        gameId: 'rhymingRush',
        icon: '🎪',
        description: '韻を踏む単語をスピードキャッチ',
        learningObjective: '英語の韻律感覚習得',
        unlockRequirement: 'Intonation Wave 40%完了'
      }
    },

    // === Stage 6: アドバンスド・フォニックス島 ===
    // 最終統合学習
    {
      path: '/games/complex-phoneme-patterns',
      name: 'complex-phoneme-patterns',
      component: () => import('@/components/games/ComplexPhonemePatternsGame.vue'), // 新規開発必要
      meta: {
        title: 'コンプレックス・フォニーム・パターンズ',
        stage: 'advancedPhonics',
        stageOrder: 6,
        difficulty: 'expert',
        gameId: 'complexPhonemePatterns',
        icon: '🧬',
        description: '上級音韻パターンの総合学習',
        learningObjective: '複雑音韻パターンの統合理解',
        unlockRequirement: 'リズム・アンド・プロソディ島 80%完了'
      }
    },
    {
      path: '/games/phonics-boss-challenge',
      name: 'phonics-boss-challenge',
      component: () => import('@/components/games/PhonicsBossChallengeGame.vue'), // 新規開発必要
      meta: {
        title: 'フォニックス・ボス・チャレンジ',
        stage: 'advancedPhonics',
        stageOrder: 6,
        difficulty: 'expert',
        gameId: 'phonicsBossChallenge',
        icon: '👑',
        description: 'すべての知識を駆使した最終バトル',
        learningObjective: '全フォニックス知識の総合統合',
        unlockRequirement: 'Complex Phoneme Patterns 70%完了'
      }
    },

    // === 既存ゲームの互換性維持 ===
    // 古いルート名での互換性
    {
      path: '/games/single-phoneme',
      redirect: '/games/phoneme-pattern-lab'
    },
    {
      path: '/games/sound-hunter',
      redirect: '/games/sound-to-symbol'
    },
    {
      path: '/games/blending-builder',
      redirect: '/games/sequential-blending'
    },
    {
      path: '/games/cvc',
      redirect: '/games/cvc-word-factory'
    },
    {
      path: '/games/magic-castle-jump',
      redirect: '/games/magic-e-castle'
    },
    {
      path: '/games/rhyming',
      redirect: '/games/rhyming-rush'
    },

    // CVC設定ページ（既存機能維持）
    {
      path: '/games/cvc/settings',
      name: 'cvc-settings',
      component: () => import('../components/games/CvcGameSettings.vue'),
      meta: {
        title: 'CVC設定',
        stage: 'blendingMastery'
      }
    },

    // 旧ルートのリダイレクト
    {
      path: '/sound-master',
      redirect: '/sound-adventure'
    },

    // 削除されたゲームのリダイレクト（適切な代替ルートに誘導）
    {
      path: '/games/medial-sound',
      redirect: '/games/phoneme-pattern-lab'
    },
    {
      path: '/games/pattern-builder',
      redirect: '/games/word-family-tree'
    },
    {
      path: '/games/alliteration',
      redirect: '/games/rhyming-rush'
    },
    {
      path: '/games/rhythm-tapper',
      redirect: '/games/stress-pattern-master'
    },
    {
      path: '/games/grammar-motion',
      redirect: '/grammar-galaxy'
    },

    // 新しいルート追加
    {
      path: '/grammar-galaxy',
      name: 'grammar-galaxy-hub',
      component: GrammarGalaxyHub,
      meta: {
        title: 'Grammar Galaxy Hub',
        requiresAuth: false
      }
    },

    // === 文法ゲーム ===
    {
      path: '/grammar-galaxy/foundation',
      name: 'grammar-galaxy-foundation',
      component: GrammarGalaxyFoundation,
      props: (route) => ({ planetId: route.query.planet || 'beVerb' }),
      meta: {
        title: 'Grammar Galaxy Foundation',
        requiresAuth: false
      }
    },
    {
      path: '/grammar-galaxy/color-code/:planetId',
      name: 'grammar-color-code',
      component: GrammarColorCodeGame,
      props: true,
      meta: {
        title: '文法カラーコードゲーム',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'grammarColorCode',
        icon: '🎨',
        description: '色分けで文法要素を視覚的に理解',
        learningObjective: '文法要素の視覚的認識',
        unlockRequirement: '文法ギャラクシー基礎編 50%完了'
      }
    },
    {
      path: '/grammar-galaxy/pattern-hunter',
      name: 'pattern-hunter',
      component: PatternHunterGame,
      meta: {
        title: 'Pattern Hunter Game',
        requiresAuth: false
      }
    },
    {
      path: '/grammar-galaxy/be-verb-rush',
      name: 'be-verb-rush',
      component: BeVerbRushGame,
      meta: {
        title: 'Be Verb Rush',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'beVerbRush',
        icon: '⚡',
        description: '高速Be動詞判定ゲーム',
        learningObjective: 'Be動詞の正しい使い方の習得',
        unlockRequirement: '文法ギャラクシー基礎編 40%完了'
      }
    },
    {
      path: '/grammar-galaxy/verb-rush',
      name: 'verb-rush',
      component: () => import('@/components/games/verbRushGame.vue'),
      meta: {
        title: 'Verb Rush',
        stage: 'rushZone',
        stageOrder: 1,
        difficulty: 'advanced',
        gameId: 'verbRush',
        icon: '⚡',
        description: '高速一般動詞判定ゲーム',
        learningObjective: '一般動詞の正しい使い方の習得',
        unlockRequirement: 'Rush Zone 解放'
      }
    },
    {
      path: '/grammar-galaxy/grammar-reflex-arena',
      name: 'grammar-reflex-arena',
      component: GrammarReflexArena,
      props: true,
      meta: {
        title: 'Grammar Reflex Arena',
        stage: 'grammarFoundation',
        stageOrder: 2,
        difficulty: 'intermediate',
        gameId: 'grammarReflexArena',
        icon: '⚡',
        description: '宇宙の反射神経で文法をマスター',
        learningObjective: '文法パターンの瞬間認識力習得',
        unlockRequirement: '文法ギャラクシー基礎編 30%完了'
      },
      beforeEnter: (to, from, next) => {
        // back イベントのハンドリング用にfromルート情報を保存
        to.meta.previousRoute = from
        next()
      }
    },

    // === NEW: サウンド・アドベンチャー・ゾーン ===
    // 新しい体験型音素学習ゲーム群
    {
      path: '/games/space-sound-adventure',
      name: 'space-sound-adventure',
      component: () => import('@/components/games/SpaceSoundAdventure.vue'),
      meta: {
        title: 'スペース・サウンド・アドベンチャー',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'intermediate',
        gameId: 'spaceSoundAdventure',
        icon: '🌌',
        description: '音素エネルギーを収集して宇宙船をアップグレード！',
        learningObjective: '冒険ゲーミフィケーションで音素習得',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/sound-battle-arena',
      name: 'sound-battle-arena',
      component: () => import('@/components/games/SoundBattleArena.vue'),
      meta: {
        title: 'サウンド・バトル・アリーナ',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'advanced',
        gameId: 'soundBattleArena',
        icon: '⚔️',
        description: '音素の力で相手を倒せ！連続バトルで音韻マスター',
        learningObjective: 'バトル要素で集中的音素練習',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/rhythm-phonics-dance',
      name: 'rhythm-phonics-dance',
      component: () => import('@/components/games/RhythmPhonicsDance.vue'),
      meta: {
        title: 'リズム・フォニックス・ダンス',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'intermediate',
        gameId: 'rhythmPhonicsDance',
        icon: '🎵',
        description: '音楽のリズムに合わせて正確な音素を選択',
        learningObjective: '音楽要素で音韻感覚向上',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/phonics-puzzle-quest',
      name: 'phonics-puzzle-quest',
      component: () => import('@/components/games/PhonicsPuzzleQuest.vue'),
      meta: {
        title: 'フォニックス・パズル・クエスト',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'advanced',
        gameId: 'phonicsPuzzleQuest',
        icon: '🧩',
        description: '音素パズルを解いて古代の音韻の秘宝を発見',
        learningObjective: 'パズル要素で論理的音素理解',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },
    {
      path: '/games/sound-farm',
      name: 'sound-farm',
      component: () => import('@/components/games/SoundFarm.vue'),
      meta: {
        title: 'サウンド・ファーム',
        stage: 'soundAdventureZone',
        stageOrder: 7,
        difficulty: 'beginner',
        gameId: 'soundFarm',
        icon: '🌱',
        description: '音素の種を育てて語彙の収穫を楽しもう',
        learningObjective: '育成要素で継続的学習促進',
        unlockRequirement: '常時アンロック（特別ゾーン）'
      }
    },

    // === Grammar Galaxy Foundation ===
    {
      path: '/grammar-galaxy-foundation',
      name: 'GrammarGalaxyFoundation',
      component: () => import('@/views/GrammarGalaxyFoundation.vue'),
      meta: {
        title: 'Grammar Galaxy Foundation',
        requiresAuth: false,
        stage: 'grammarGalaxy',
        stageOrder: 5,
        difficulty: 'intermediate',
        gameId: 'grammarGalaxyFoundation',
        icon: '🌌',
        description: '文法の基礎を宇宙の冒険で学ぶ',
        learningObjective: '基本的な文法要素の理解と応用',
        unlockRequirement: 'Word Building Island 60%完了'
      }
    },

    // === Co-Pilot Training Dock ===
    {
      path: '/co-pilot-dock',
      name: 'CoPilotDock',
      component: () => import('@/views/CoPilotDock.vue'),
      meta: {
        title: 'Co-Pilot Training Dock - 協力学習司令部',
        requiresAuth: false,
        stage: 'cooperativeLearning',
        stageOrder: 7,
        difficulty: 'collaborative',
        gameId: 'coPilotDock',
        icon: '👥',
        description: '講師と協力してリアルタイム学習ミッションを実行',
        learningObjective: '協力学習による効率的な言語習得',
        unlockRequirement: '基礎学習完了または講師の推奨'
      }
    },

    // === Teacher Dashboard ===
    {
      path: '/teacher',
      name: 'TeacherDashboard',
      component: () => import('@/views/teacher/TeacherDashboard.vue'),
      meta: {
        title: 'MovWISE 講師ダッシュボード',
        requiresAuth: true,
        role: 'teacher',
        description: 'リアルタイム協力学習管理センター',
        layout: 'teacher'
      }
    },

    {
      path: '/teacher/dashboard',
      redirect: '/teacher'
    },

    // Alternative teacher dashboard path
    {
      path: '/teacher-dashboard',
      name: 'teacher-dashboard',
      component: () => import('@/views/teacher/TeacherDashboard.vue'),
      meta: {
        title: 'MovWISE 講師ダッシュボード',
        requiresAuth: false, // 開発用に一時的に認証不要に設定
        role: 'teacher',
        description: 'リアルタイム協力学習管理センター',
        layout: 'teacher'
      }
    },

    // Student session route
    {
      path: '/student-session',
      name: 'student-session',
      component: () => import('@/views/student/StudentSession.vue'),
      meta: {
        title: '生徒セッション - 協力学習',
        requiresAuth: false,
        description: '講師との協力学習セッション'
      }
    },

    // Join session with invite code
    {
      path: '/join-session/:inviteCode',
      name: 'join-session',
      component: () => import('@/views/student/StudentSession.vue'),
      meta: {
        title: 'セッション参加 - 協力学習',
        requiresAuth: false,
        description: '招待コードでセッションに参加'
      },
      props: true
    },

    // 404対応
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ]
})

// ステージ順序とアンロック条件の定義
const STAGE_ORDER = {
  'soundFoundation': 1,
  'soundRules': 2,
  'blendingMastery': 3,
  'wordBuilding': 4,
  'rhythmProsody': 5,
  'advancedPhonics': 6
}

const STAGE_UNLOCK_REQUIREMENTS = {
  'soundFoundation': { requirement: null, threshold: 0 }, // 常時アンロック
  'soundRules': { requirement: 'soundFoundation', threshold: 70 },
  'blendingMastery': { requirement: 'soundRules', threshold: 60 },
  'wordBuilding': { requirement: 'blendingMastery', threshold: 70 },
  'rhythmProsody': { requirement: 'wordBuilding', threshold: 70 },
  'advancedPhonics': { requirement: 'rhythmProsody', threshold: 80 }
}

// アンロック条件チェック関数（科学的学習順序対応）
function checkGameUnlock(gameId, stageName) {
  console.log(`🔓 アンロック条件チェック: ${gameId} (Stage: ${stageName})`)

  // 開発中は一部のゲームのみチェック
  if (import.meta.env.DEV) {
    // pureSoundLabだけは常時アンロック
    if (gameId === 'pureSoundLab') {
      return true;
    }
    // 開発環境では基本的にアンロック（デバッグ用）
    const restrictedGames = [
      'pureSoundLab', 'silentLetterDetective', 'doubleLetterLab',
      'sequentialBlending', 'wordFamilyTree', 'digraphMaster',
      'rControlledVowels', 'stressPatternMaster', 'intonationWave',
      'complexPhonemePatterns', 'phonicsBossChallenge'
    ]

    if (restrictedGames.includes(gameId)) {
      console.warn(`⚠️ 開発中のゲーム: ${gameId}`)
      return true // 開発環境では警告のみでアクセス可能に
    }

    return true
  }

  // 本番環境での厳密なアンロック条件チェック
  const gameStore = useGameStore()
  const stageRequirement = STAGE_UNLOCK_REQUIREMENTS[stageName]

  if (!stageRequirement) {
    console.warn(`⚠️ 未定義のステージ: ${stageName}`)
    return false
  }

  // ステージ自体のアンロック条件チェック
  if (stageRequirement.requirement) {
    const requiredStageProgress = gameStore.getStageProgress(stageRequirement.requirement)
    if (requiredStageProgress < stageRequirement.threshold) {
      console.log(`🔒 ${stageName}ステージ未アンロック: ${stageRequirement.requirement}を${stageRequirement.threshold}%完了する必要があります`)
      return false
    }
  }

  // ゲーム個別のアンロック条件（将来拡張用）
  return true
}

// 学習進捗に基づく次のおすすめゲーム取得
function getRecommendedNextGame() {
  const gameStore = useGameStore()

  // Stage順序で進捗をチェック
  for (const [stageName, order] of Object.entries(STAGE_ORDER)) {
    const stageProgress = gameStore.getStageProgress(stageName)

    if (stageProgress < 80) { // 80%未満のステージがあれば、そこを推奨
      return {
        stage: stageName,
        progress: stageProgress,
        message: `${stageName}ステージを続けることをお勧めします`
      }
    }
  }

  return {
    stage: 'advancedPhonics',
    progress: 100,
    message: '全ステージクリア！上級チャレンジに挑戦しましょう'
  }
}

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  console.log(`🚀 Router: ${from.path} → ${to.path}`)

  // タイトル設定
  const title = to.meta?.title
    ? `${to.meta.title} - MovWISE`
    : 'MovWISE - 身体で覚える英語学習'
  document.title = title

  // ゲームアクセス制御
  if (to.meta?.stage && to.meta?.gameId) {
    const isUnlocked = checkGameUnlock(to.meta.gameId, to.meta.stage)

    if (!isUnlocked) {
      const unlockReq = to.meta.unlockRequirement || '前のステージを完了'
      alert(`🔒 このゲームはまだアンロックされていません！\n\n必要条件: ${unlockReq}`)
      next({ name: 'SoundAdventureHub' })
      return
    }

    // 学習段階の妥当性チェック
    const currentStageOrder = STAGE_ORDER[to.meta.stage]
    const gameStore = useGameStore()

    // あまりにも高いレベルのゲームに直接アクセスしようとした場合の警告
    if (currentStageOrder > 3) {
      const foundationProgress = gameStore.getStageProgress('soundFoundation')
      if (foundationProgress < 50) {
        const confirmed = confirm(
          `⚠️ 基礎学習が不十分です\n\n` +
          `サウンド・ファウンデーション島: ${foundationProgress}%\n\n` +
          `基礎をしっかり固めてからの方が効果的です。\n` +
          `それでも続けますか？`
        )

        if (!confirmed) {
          next({ name: 'SoundAdventureHub' })
          return
        }
      }
    }
  }

  // ゲームページの場合、ステージ情報をコンソールに出力
  if (to.meta?.stage) {
    console.log(`🎮 ゲーム開始: ${to.meta.title} (Stage ${to.meta.stageOrder}: ${to.meta.stage})`)
    console.log(`📚 学習目標: ${to.meta.learningObjective}`)
  }

  next()
})

// ルート後の処理
router.afterEach((to, from) => {
  console.log(`✅ Router: 遷移完了 ${to.path}`)

  // ゲーム統計の更新
  if (to.meta?.gameId) {
    console.log(`📊 ゲーム統計更新: ${to.meta.gameId}`)

    // 学習分析用ログ
    if (to.meta.stage && to.meta.stageOrder) {
      console.log(`📈 学習進捗: Stage ${to.meta.stageOrder} - ${to.meta.stage}`)

      // 推奨学習パスとの比較
      const recommended = getRecommendedNextGame()
      if (recommended.stage !== to.meta.stage) {
        console.info(`💡 推奨: ${recommended.message}`)
      }
    }
  }

  // 学習継続のためのエンゲージメント
  if (to.name === 'SoundAdventureHub') {
    setTimeout(() => {
      const recommended = getRecommendedNextGame()
      if (recommended.progress < 100) {
        console.log(`🎯 次におすすめ: ${recommended.message}`)
      }
    }, 2000)
  }
})



// エラーハンドリング
router.onError((error) => {
  console.error('❌ Router error:', error)

  // エラーの詳細情報を表示
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    alert(
      '🚧 ゲームの読み込み中にエラーが発生しました。\n\n' +
      'このゲームは開発中の可能性があります。\n' +
      'ページをリロードするか、他のゲームをお試しください。'
    )
  } else {
    alert('⚠️ ページの読み込み中にエラーが発生しました。\nホーム画面に戻ります。')
    router.push('/')
  }
})

// 開発環境でのデバッグ情報とルート検証
if (import.meta.env.DEV) {
  console.log('🏗️ MovWISE Router initialized with Scientific Learning Order')
  console.log('📍 Available routes by stage:')

  // ステージ別ルート表示
  const routesByStage = {}
  router.getRoutes().forEach(route => {
    if (route.meta?.stage) {
      if (!routesByStage[route.meta.stage]) {
        routesByStage[route.meta.stage] = []
      }
      routesByStage[route.meta.stage].push({
        path: route.path,
        name: route.name,
        title: route.meta.title,
        order: route.meta.stageOrder
      })
    }
  })

  // ステージ順序でソートして表示
  Object.entries(routesByStage)
    .sort(([, a], [, b]) => (a[0]?.order || 0) - (b[0]?.order || 0))
    .forEach(([stageName, routes]) => {
      console.log(`  Stage ${routes[0]?.order}: ${stageName}`)
      routes.forEach(route => {
        console.log(`    - ${route.path} (${route.title})`)
      })
    })

  // 学習順序の検証
  console.log('🧪 Learning Order Validation:')
  console.log('  ✅ Stage 1: Pure Sound Recognition (Foundation)')
  console.log('  ✅ Stage 2: Sound Rules (Magic E, Silent Letters)')
  console.log('  ✅ Stage 3: Blending Mastery (CVC, Word Families)')
  console.log('  ✅ Stage 4: Word Building (Sight Words moved here!)')
  console.log('  ✅ Stage 5: Rhythm & Prosody')
  console.log('  ✅ Stage 6: Advanced Phonics')
}

// 存在しないゲームの処理を修正
const startGame = (gameId) => {
  console.log(`🎮 ゲーム開始: ${gameId}`)
  // 実装済みゲームのマッピング
  const gameRoutes = {
    'pureSoundLab': 'pure-sound-lab',
    'soundToSymbolMatch': 'sound-to-symbol',
    'phonemePatternLab': 'phoneme-pattern-lab',
    'magicECastle': 'magic-e-castle',
    'cvcWordFactory': 'cvc-word-factory',
    'sightWordMaster': 'sight-word-master',
    'wordRushArena': 'word-rush',
    'rhymingRush': 'rhyming-rush',
    'grammarColorCode': 'grammar-color-code',
    'patternHunter': 'pattern-hunter',
    'beVerbRush': 'be-verb-rush'
  }

  const routeName = gameRoutes[gameId]
  if (!routeName) {
    console.error(`❌ 未実装のゲーム: ${gameId}`)
    return false
  }

  router.push({ name: routeName })
  return true
}

export default router