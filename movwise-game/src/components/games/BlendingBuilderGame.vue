<template>
  <div class="min-h-screen galaxy-background p-6">
    <!-- Animated Stars Layers -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>
    
    <div class="max-w-4xl mx-auto relative z-10">
      <!-- 戻るボタン -->
      <button
        @click="handleBack"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary px-4 py-2 rounded-2xl font-bold transition-all duration-200"
      >
        ← 戻る
      </button>
      <h1 class="text-4xl font-bold galaxy-text-primary mb-8 text-center cosmic-glow">🏗️ ブレンド・ビルダー</h1>
      <!-- ゲーム情報 -->
      <div class="galaxy-card rounded-3xl p-6 shadow-2xl mb-6 cosmic-glow">
        <div class="flex justify-between items-center mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold galaxy-text-primary">レベル {{ currentLevel }}</div>
            <div class="text-galaxy-moon-silver">{{ wordData[currentLevel].name }}</div>
          </div>
          <div class="flex gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-400">⭐ {{ score }}</div>
              <div class="text-galaxy-moon-silver">スコア</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-400">❤️ {{ lives }}</div>
              <div class="text-galaxy-moon-silver">ライフ</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-400">🔥 {{ combo }}</div>
              <div class="text-galaxy-moon-silver">コンボ</div>
            </div>
          </div>
        </div>
        <!-- タイマー -->
        <div class="w-full bg-galaxy-space-blue/30 rounded-full h-2 mb-6">
          <div 
            class="bg-gradient-to-r from-green-400 to-yellow-400 rounded-full h-2 transition-all duration-1000 cosmic-glow"
            :style="{ width: `${(timeLeft / 30) * 100}%` }"
          ></div>
        </div>
      </div>
      <!-- メインゲームエリア -->
      <div class="galaxy-card rounded-3xl p-6 shadow-2xl cosmic-glow">
        <!-- ヒントと絵は削除 -->
        <!-- 選択した音素 -->
        <div v-if="currentWord" class="flex justify-center gap-2 mb-6">
          <button
            v-for="(sound, idx) in selectedSounds"
            :key="'selected-' + idx"
            @click="removeSound(idx)"
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg bg-gradient-to-br hover:scale-110 transition-transform duration-200 cosmic-glow"
            :style="{ background: getSoundColor(sound) }"
          >
            {{ sound }}
          </button>
        </div>
        <!-- 音素選択肢 -->
        <div v-if="currentWord" class="grid grid-cols-4 gap-4 mb-6">
          <button
            v-for="sound in availableSounds"
            :key="'avail-' + sound"
            @click="selectSound(sound)"
            :disabled="selectedSounds.length >= currentWord.sounds.length"
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg bg-gradient-to-br hover:scale-110 transition-transform duration-200 cosmic-glow disabled:opacity-50"
            :style="{ background: getSoundColor(sound) }"
          >
            {{ sound }}
          </button>
        </div>
        <!-- チェックボタン -->
        <div v-if="currentWord" class="flex justify-center">
          <button
            @click="checkAnswer()"
            :disabled="selectedSounds.length !== currentWord.sounds.length"
            class="galaxy-button galaxy-button-primary px-8 py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50"
          >
            <CheckCircle class="w-5 h-5 inline-block mr-2" /> チェック
          </button>
        </div>
      </div>
      <!-- フィードバック -->
      <div v-if="showFeedback" class="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div class="galaxy-card rounded-3xl p-8 text-center cosmic-glow">
          <div class="text-6xl mb-4">{{ isCorrect ? '🎉' : '😢' }}</div>
          <div class="text-2xl font-bold galaxy-text-primary mb-2">{{ isCorrect ? '正解！' : '不正解...' }}</div>
          <div class="text-galaxy-moon-silver">{{ isCorrect ? '素晴らしい！' : 'もう一度挑戦しよう！' }}</div>
        </div>
      </div>
      <!-- 終了モーダル -->
      <div v-if="isGameFinished" class="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <div class="galaxy-card rounded-3xl p-8 text-center max-w-md w-full mx-4 cosmic-glow">
          <div class="text-6xl mb-4">🏆</div>
          <div class="text-2xl font-bold galaxy-text-primary mb-2">全レベルクリア！</div>
          <div class="text-galaxy-moon-silver mb-6">おめでとうございます！ブレンド・ビルダーを達成しました。</div>
          <button
            @click="goToHub"
            class="w-full galaxy-button galaxy-button-primary py-3 rounded-xl font-bold transition-all duration-200 mb-2"
          >
            ハブに戻る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Volume2, CheckCircle } from 'lucide-vue-next'

export default {
  name: 'BlendingBuilderGame',
  components: {
    Volume2,
    CheckCircle
  },
  setup() {
    const router = useRouter()
    // ゲーム状態管理
    const currentLevel = ref(1);
    const currentWordIndex = ref(0);
    const score = ref(0);
    const lives = ref(3);
    const combo = ref(0);
    const selectedSounds = ref([]);
    const availableSounds = ref([]);
    const gamePhase = ref('instruction'); // instruction, building, checking, feedback
    const showFeedback = ref(false);
    const isCorrect = ref(false);
    const streak = ref(0);
    const showParticles = ref(false);
    const timeLeft = ref(30);
    const isTimerActive = ref(false);
    const isPlaying = ref(false);
    const playingIndex = ref(-1);
    const isGameFinished = ref(false)
    
    // 参照
    let timerRef = null;

    // 段階的な単語学習データ
    const wordData = reactive({
    1: { // レベル1: 2音素組み合わせ
      name: "2つの音を合わせよう",
      description: "簡単な音の組み合わせから始めよう！", 
      words: [
        { word: 'at', sounds: ['a', 't'], emoji: '🎯', hint: 'どこかを指す時に使う' },
        { word: 'it', sounds: ['i', 't'], emoji: '👆', hint: 'それ' },
        { word: 'an', sounds: ['a', 'n'], emoji: '1️⃣', hint: 'ひとつの' },
        { word: 'in', sounds: ['i', 'n'], emoji: '📦', hint: '中に' },
        { word: 'on', sounds: ['o', 'n'], emoji: '🔛', hint: '上に' },
        { word: 'up', sounds: ['u', 'p'], emoji: '⬆️', hint: '上へ' },
      ]
    },
    2: { // レベル2: CVC基本パターン
      name: "CVC単語を作ろう",
      description: "子音-母音-子音の基本パターンをマスター！",
      words: [
        { word: 'cat', sounds: ['c', 'a', 't'], emoji: '🐱', hint: 'ニャーと鳴く動物' },
        { word: 'dog', sounds: ['d', 'o', 'g'], emoji: '🐕', hint: 'ワンワンと鳴く動物' },
        { word: 'sun', sounds: ['s', 'u', 'n'], emoji: '☀️', hint: '昼間に空にある明るいもの' },
        { word: 'hat', sounds: ['h', 'a', 't'], emoji: '🎩', hint: '頭にかぶるもの' },
        { word: 'pen', sounds: ['p', 'e', 'n'], emoji: '🖊️', hint: '字を書く道具' },
        { word: 'cup', sounds: ['c', 'u', 'p'], emoji: '☕', hint: '飲み物を入れる容器' },
      ]
    },
    3: { // レベル3: 4音素の単語
      name: "長い単語に挑戦",
      description: "4つの音を組み合わせて単語を作ろう！",
      words: [
        { word: 'stop', sounds: ['s', 't', 'o', 'p'], emoji: '🛑', hint: '止まれの意味' },
        { word: 'frog', sounds: ['f', 'r', 'o', 'g'], emoji: '🐸', hint: 'ケロケロ鳴く生き物' },
        { word: 'drop', sounds: ['d', 'r', 'o', 'p'], emoji: '💧', hint: '落とす' },
        { word: 'jump', sounds: ['j', 'u', 'm', 'p'], emoji: '🦘', hint: '跳ぶ' },
        { word: 'hand', sounds: ['h', 'a', 'n', 'd'], emoji: '✋', hint: '手' },
        { word: 'help', sounds: ['h', 'e', 'l', 'p'], emoji: '🆘', hint: '助ける' },
      ]
    }
    });

    // 修正: computedでリアクティブに
    const currentWords = computed(() => wordData[currentLevel.value].words)
    const currentWord = computed(() => currentWords.value[currentWordIndex.value])

    // 音素の色分け
    const soundColors = {
      'a': '#FF6B6B', 'e': '#4ECDC4', 'i': '#45B7D1', 'o': '#96CEB4', 'u': '#FECA57',
      'b': '#FF9FF3', 'c': '#54A0FF', 'd': '#5F27CD', 'f': '#00D2D3', 'g': '#FF9F43',
      'h': '#10AC84', 'j': '#EE5A24', 'k': '#0984E3', 'l': '#A29BFE', 'm': '#FD79A8',
      'n': '#FDCB6E', 'p': '#6C5CE7', 'r': '#74B9FF', 's': '#00B894', 't': '#E17055'
    }
    // getSoundColor関数を定義
    const getSoundColor = (sound) => {
      return `linear-gradient(135deg, ${soundColors[sound] || '#ccc'}, #fff 80%)`
    }

    // 利用可能な音素を生成（正解 + ダミー）
    const generateAvailableSounds = () => {
      const correctSounds = [...currentWord.value.sounds];
      const allSounds = Object.keys(soundColors);
      const dummySounds = allSounds.filter(sound => !correctSounds.includes(sound));
      const numDummies = Math.min(6, dummySounds.length);
      const selectedDummies = [];
      for (let i = 0; i < numDummies; i++) {
        const randomIndex = Math.floor(Math.random() * dummySounds.length);
        selectedDummies.push(dummySounds.splice(randomIndex, 1)[0]);
      }
      return shuffleArray([...correctSounds, ...selectedDummies]);
    };

    const shuffleArray = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    // 音声再生
    const playWordSound = () => {
      if (!currentWord.value) return;
      if (isPlaying.value) return;
      isPlaying.value = true;
      const utterance = new SpeechSynthesisUtterance(currentWord.value.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onend = () => {
        isPlaying.value = false;
      };
      speechSynthesis.speak(utterance);
    };

    // 個別音素再生
    const playSoundAtIndex = async (index) => {
      if (playingIndex !== -1) return;
      
      playingIndex.value = index;
      const sound = selectedSounds.value[index];
      const utterance = new SpeechSynthesisUtterance(sound);
      utterance.lang = 'en-US';
      utterance.rate = 0.6;
      utterance.pitch = 1.2;
      
      utterance.onend = () => {
        playingIndex.value = -1;
      };
      
      speechSynthesis.speak(utterance);
    };

    // タイマー管理
    const startTimer = () => {
      timeLeft.value = 30;
      isTimerActive.value = true;
      timerRef = setInterval(() => {
        timeLeft.value = Math.max(0, timeLeft.value - 1);
        if (timeLeft.value === 0) {
          handleTimeUp();
        }
      }, 1000);
    };

    const stopTimer = () => {
      isTimerActive.value = false;
      if (timerRef) {
        clearInterval(timerRef);
      }
    };

    const handleTimeUp = () => {
      stopTimer();
      lives.value--;
      combo.value = 0;
      showFeedback.value = true;
      isCorrect.value = false;
      
      setTimeout(() => {
        if (lives.value > 0) {
          nextWord();
        } else {
          alert('Game Over! もう一度挑戦しよう！');
          resetGame();
        }
      }, 2000);
    };

    // 音素選択
    const selectSound = (sound) => {
      if (!currentWord.value) return;
      if (selectedSounds.value.length >= currentWord.value.sounds.length) return;
      const newSelectedSounds = [...selectedSounds.value, sound];
      selectedSounds.value = newSelectedSounds;
      if (newSelectedSounds.length === currentWord.value.sounds.length) {
        setTimeout(() => {
          checkAnswer(newSelectedSounds);
        }, 500);
      }
    };

    // 音素削除
    const removeSound = (index) => {
      const newSelectedSounds = selectedSounds.value.filter((_, i) => i !== index);
      selectedSounds.value = newSelectedSounds;
    };

    // 答えチェック
    const checkAnswer = (soundsToCheck = selectedSounds.value) => {
      if (!currentWord.value) return;
      stopTimer();
      gamePhase.value = 'feedback';
      const isWordCorrect = soundsToCheck.length === currentWord.value.sounds.length &&
        soundsToCheck.every((sound, index) => sound === currentWord.value.sounds[index]);
      isCorrect.value = isWordCorrect;
      showFeedback.value = true;
      if (isWordCorrect) {
        const baseScore = 100;
        const comboBonus = combo.value * 30;
        const timeBonus = Math.max(0, (timeLeft.value - 10) * 5);
        const lengthBonus = currentWord.value.sounds.length * 20;
        const totalScore = baseScore + comboBonus + timeBonus + lengthBonus;
        score.value += totalScore;
        combo.value++;
        streak.value++;
        showParticles.value = true;
        setTimeout(() => showParticles.value = false, 2000);
      } else {
        lives.value--;
        combo.value = 0;
      }
      setTimeout(() => {
        if (!isWordCorrect && lives.value <= 0) {
          alert('Game Over! もう一度挑戦しよう！');
          resetGame();
        } else {
          nextWord();
        }
      }, 3000);
    };

    // 次の単語へ
    const nextWord = () => {
      const nextIndex = currentWordIndex.value + 1;
      if (nextIndex >= currentWords.value.length) {
        if (currentLevel.value < 3) {
          currentLevel.value++;
          currentWordIndex.value = 0;
        } else {
          isGameFinished.value = true;
          stopTimer();
          return;
        }
      } else {
        currentWordIndex.value = nextIndex;
      }
      selectedSounds.value = [];
      showFeedback.value = false;
      gamePhase.value = 'instruction';
      availableSounds.value = generateAvailableSounds();
    }

    // ゲーム開始
    const startBuilding = () => {
      gamePhase.value = 'building';
      startTimer();
    };

    // ゲームリセット
    const resetGame = () => {
      currentLevel.value = 1;
      currentWordIndex.value = 0;
      score.value = 0;
      lives.value = 3;
      combo.value = 0;
      streak.value = 0;
      selectedSounds.value = [];
      showFeedback.value = false;
      gamePhase.value = 'instruction';
      stopTimer();
      availableSounds.value = generateAvailableSounds();
    };

    // 戻るボタン
    const handleBack = () => {
      router.back()
    }

    // ハブに戻る
    const goToHub = () => {
      router.push('/sound-adventure')
    }

    // エフェクト
    onMounted(() => {
      availableSounds.value = generateAvailableSounds();
    });

    onUnmounted(() => {
      stopTimer();
    });

    return {
      currentLevel,
      currentWordIndex,
      score,
      lives,
      combo,
      selectedSounds,
      availableSounds,
      gamePhase,
      showFeedback,
      isCorrect,
      streak,
      showParticles,
      timeLeft,
      isTimerActive,
      isPlaying,
      playingIndex,
      wordData,
      currentWords,
      currentWord,
      soundColors,
      generateAvailableSounds,
      shuffleArray,
      playWordSound,
      playSoundAtIndex,
      startTimer,
      stopTimer,
      handleTimeUp,
      selectSound,
      removeSound,
      checkAnswer,
      nextWord,
      startBuilding,
      resetGame,
      getSoundColor,
      isGameFinished,
      handleBack,
      goToHub
    };
  }
};
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

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
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

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

.bg-galaxy-space-blue {
  background-color: rgba(30, 41, 59, 0.8);
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

/* Sound button hover effects */
.sound-button {
  transition: all 0.3s ease;
}

.sound-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

/* Enhanced sound selection buttons */
.sound-selection button {
  position: relative;
  overflow: hidden;
}

.sound-selection button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sound-selection button:hover::after {
  opacity: 1;
  animation: shimmer 1s ease-in-out;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>