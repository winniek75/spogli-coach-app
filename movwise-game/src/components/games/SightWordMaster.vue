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
      
      <!-- 追加の背景エフェクト -->
      <div class="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse"></div>
      <div class="absolute bottom-20 right-20 w-24 h-24 border border-white/10 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/4 w-16 h-16 border border-white/10 rounded-full animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- 成功パーティクル -->
    <div v-if="showParticles" class="absolute inset-0 pointer-events-none z-50">
      <div v-for="(particle, index) in successParticles" :key="index"
           class="success-particle absolute text-3xl"
           :style="{
             left: particle.x + '%',
             top: particle.y + '%',
             animationDelay: particle.delay + 's'
           }">
        {{ particle.emoji }}
      </div>
    </div>

    <!-- メニュー画面 -->
    <div v-if="gamePhase === 'menu'" class="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div class="galaxy-card p-8 max-w-4xl w-full">
        <div class="text-center mb-8">
          <div class="mb-6">
            <div class="relative inline-block">
              <h1 class="text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight title-glow">
                サイトワード
              </h1>
              <div class="absolute -top-2 -right-8 text-4xl floating-icon">👁️</div>
            </div>
            <div class="text-center">
              <span class="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-widest">
                MASTER
              </span>
              <div class="flex justify-center items-center gap-2 mt-2">
                <div class="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
                <span class="text-lg text-white/80 font-semibold tracking-[0.2em] uppercase">Sight Word</span>
                <div class="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
              </div>
            </div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p class="text-white text-xl font-semibold mb-2">瞬間認識で重要単語をマスターしよう！</p>
            <p class="text-white/90 text-sm">Dolch Sight Words 準拠 - 読解力の基礎を築く最重要単語</p>
          </div>
        </div>

        <!-- レベル選択 -->
        <div class="mb-8">
          <h3 class="text-2xl font-bold text-white cosmic-glow mb-6 flex items-center gap-3">
            <i class="fas fa-layer-group cosmic-glow"></i>
            学習レベルを選択
          </h3>
          <div class="grid gap-6">
            <button v-for="(level, key) in sightWordsData" :key="key"
                    @click="currentLevel = parseInt(key)"
                    :class="[
                      'galaxy-card p-6 text-left transition-all duration-300',
                      currentLevel === parseInt(key)
                        ? 'galaxy-button-primary transform scale-105 cosmic-glow'
                        : 'hover:galaxy-button-secondary'
                    ]">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="font-bold text-xl flex items-center gap-3 mb-2">
                    <span class="text-3xl cosmic-glow">{{ key === '1' ? '🌱' : key === '2' ? '🌳' : '👑' }}</span>
                    <span class="text-white">レベル {{ key }}: {{ level.name }}</span>
                  </div>
                  <div class="text-white/90 text-base mb-3">{{ level.description }}</div>
                  <div class="flex flex-wrap gap-3 text-sm text-white/80">
                    <div class="flex items-center gap-1">
                      <i class="fas fa-book text-white/70"></i>
                      <span>{{ level.words.length }}単語</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <i class="fas fa-eye text-white/70"></i>
                      <span>表示: {{ level.displayTime / 1000 }}秒</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <i class="fas fa-clock text-white/70"></i>
                      <span>回答: {{ level.answerTime }}秒</span>
                    </div>
                  </div>
                </div>
                <div class="text-4xl ml-4">
                  {{ key === '1' ? '📖' : key === '2' ? '📚' : '🏆' }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- ゲームモード選択 -->
        <div class="mb-8">
          <h3 class="text-2xl font-bold text-white cosmic-glow mb-6 flex items-center gap-3">
            <i class="fas fa-gamepad cosmic-glow"></i>
            ゲームモードを選択
          </h3>
          <div class="grid md:grid-cols-3 gap-6">
            <button v-for="mode in gameModes" :key="mode.id"
                    @click="gameMode = mode.id"
                    :class="[
                      'galaxy-card p-6 text-center transition-all duration-300',
                      gameMode === mode.id
                        ? 'galaxy-button-primary transform scale-105 cosmic-glow'
                        : 'hover:galaxy-button-secondary'
                    ]">
              <div class="text-4xl mb-4 cosmic-glow">{{ mode.icon }}</div>
              <div class="font-bold text-lg mb-2 text-white">{{ mode.name }}</div>
              <div class="text-sm text-white/90 mb-3">{{ mode.description }}</div>
              <div class="text-xs text-white/80">{{ mode.detail }}</div>
            </button>
          </div>
        </div>

        <!-- 問題数設定 -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-white cosmic-glow mb-4 flex items-center gap-2">
            <i class="fas fa-list-ol cosmic-glow"></i>
            問題数を設定
          </h3>
          <div class="flex flex-wrap gap-4">
            <button v-for="num in [5, 10, 15, 20, 25]" :key="num"
                    @click="totalQuestions = num"
                    :class="[
                      'galaxy-button px-6 py-3 font-bold transition-all duration-200 text-white',
                      totalQuestions === num
                        ? 'galaxy-button-primary cosmic-glow'
                        : 'galaxy-button-secondary'
                    ]">
              {{ num }}問
            </button>
          </div>
        </div>


        <!-- スタートボタン -->
        <button @click="startGame"
                class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-6 px-8 rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-center gap-4">
            <i class="fas fa-rocket text-3xl"></i>
            <span>サイトワード学習開始！</span>
          </div>
        </button>
      </div>
    </div>

    <!-- ゲーム画面 -->
    <div v-else-if="gamePhase === 'playing'" class="relative z-10 container mx-auto px-4 py-6">
      <!-- ゲームヘッダー -->
      <div class="galaxy-card p-4 mb-6">
        <div class="flex justify-between items-center mb-4">
          <button 
            @click="resetToMenu"
            class="galaxy-button galaxy-button-secondary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-3xl font-bold galaxy-text-primary cosmic-glow">👁️ サイトワード・マスター</h1>
          </div>

          <div class="flex items-center gap-2">
            <!-- 音響ON/OFF切り替えボタン -->
            <button 
              class="galaxy-button galaxy-button-secondary"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343A8 8 0 006.343 17.657l4.95-4.95a2 2 0 002.828 0l4.95 4.95z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ゲーム統計バー -->
      <div class="galaxy-card p-4 mb-6">
        <div class="flex justify-center items-center gap-6">
          <div class="flex items-center gap-2 text-galaxy-moon-silver">
            <svg class="w-4 h-4 cosmic-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span class="font-bold text-white">レベル {{ currentLevel }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <svg 
              v-for="n in 3" 
              :key="n"
              class="w-5 h-5"
              :class="n <= lives ? 'text-red-500 cosmic-glow' : 'text-gray-400'"
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          
          <div class="flex items-center gap-2 text-galaxy-moon-silver">
            <span>問題:</span>
            <span class="font-bold text-yellow-400 cosmic-glow">{{ currentWordIndex + 1 }}/{{ Math.min(totalQuestions, currentLevelData.words.length) }}</span>
          </div>
          
          <div class="flex items-center gap-2 text-galaxy-moon-silver">
            <span>スコア:</span>
            <span class="font-bold text-yellow-400 cosmic-glow">{{ score.toLocaleString() }}</span>
          </div>
          
          <div v-if="combo > 1" class="flex items-center gap-2 text-galaxy-moon-silver">
            <span>コンボ:</span>
            <span class="font-bold text-orange-400 cosmic-glow">x{{ combo }}</span>
          </div>
        </div>

      </div>

      <!-- メインゲームエリア -->
      <div class="galaxy-card p-8">
        <!-- タイマー -->
        <div v-if="isTimerActive" class="mb-8">
          <div class="text-center mb-4">
            <div :class="[
              'text-4xl font-black inline-flex items-center gap-3',
              timeLeft <= 3 ? 'timer-warning' : 'text-indigo-600'
            ]">
              <i :class="[
                'fas fa-clock',
                timeLeft <= 3 ? 'countdown-circle' : ''
              ]"></i>
              {{ timeLeft }}
            </div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div :class="[
              'h-4 rounded-full transition-all duration-1000 relative',
              timeLeft <= 3 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
              timeLeft <= 6 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
              'bg-gradient-to-r from-green-500 to-green-600'
            ]" :style="{ width: (timeLeft / currentLevelData.answerTime) * 100 + '%' }">
              <div class="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- フラッシュモード: 単語表示 -->
        <div v-if="showWord && gameMode === 'flash'" class="text-center mb-8">
          <div class="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-12 mb-8 shadow-inner">
            <div class="sight-word-flash text-9xl font-black text-indigo-800 mb-6 word-pulse">
              {{ currentWord.word }}
            </div>
            <div class="word-meaning-reveal text-2xl text-purple-600 mb-4 font-semibold">
              「{{ currentWord.meaning }}」
            </div>
            <div class="flex justify-center mb-4">
              <div :class="['frequency-badge inline-block', getFrequencyClass(currentWord.frequency)]">
                {{ getFrequencyText(currentWord.frequency) }}
              </div>
            </div>
            <div class="text-gray-600 text-lg">
              カテゴリ: {{ getCategoryText(currentWord.category) }}
            </div>
          </div>
          
          <!-- フラッシュカウントダウン表示 -->
          <div class="flex justify-center">
            <div class="flash-countdown px-6 py-3 rounded-full text-white font-bold shadow-lg">
              <i class="fas fa-eye mr-2"></i>
              この単語をしっかり覚えてください...
            </div>
          </div>
        </div>

        <!-- フラッシュモード: 入力エリア -->
        <div v-if="!showWord && gameMode === 'flash'" class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-8">
            <i class="fas fa-keyboard mr-3 text-indigo-500"></i>
            今見た単語を入力してください！
          </h2>
          <div class="max-w-md mx-auto">
            <div class="relative">
              <input ref="inputRef" v-model="userInput" @keyup.enter="checkAnswer"
                     class="word-input w-full p-6 text-3xl text-center rounded-2xl font-bold shadow-lg"
                     placeholder="単語を入力..." autofocus>
              <div v-if="!userInput" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl typing-cursor">|</div>
            </div>
            <button @click="checkAnswer" :disabled="!userInput.trim()"
                    class="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg">
              <i class="fas fa-check mr-3"></i>
              答えを確認
            </button>
          </div>
        </div>

        <!-- 選択肢モード -->
        <div v-if="gameMode === 'multiple'" class="text-center mb-8">
          <div class="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-10 mb-8 shadow-inner">
            <div class="text-7xl font-black text-indigo-800 mb-6 word-pulse">
              {{ currentWord.word }}
            </div>
            <div class="text-xl text-gray-700 mb-4 font-semibold">
              <i class="fas fa-question-circle mr-2 text-indigo-500"></i>
              この単語の意味を選んでください
            </div>
            <div :class="['frequency-badge inline-block', getFrequencyClass(currentWord.frequency)]">
              {{ getFrequencyText(currentWord.frequency) }}
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
            <button v-for="choice in choices" :key="choice"
                    @click="selectChoice(choice)"
                    :disabled="selectedChoice !== ''"
                    :class="[
                      'choice-button p-8 rounded-2xl font-bold text-xl transition-all duration-300 border-2 shadow-lg',
                      getChoiceClass(choice)
                    ]">
              <div class="text-2xl mb-2">{{ choice }}</div>
            </button>
          </div>
        </div>

        <!-- タイピングモード -->
        <div v-if="gameMode === 'typing'" class="text-center mb-8">
          <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-10 mb-8 shadow-inner">
            <div class="text-6xl font-black text-purple-800 mb-6">
              「{{ currentWord.meaning }}」
            </div>
            <div class="text-xl text-gray-700 mb-4 font-semibold">
              <i class="fas fa-language mr-2 text-purple-500"></i>
              この意味の英単語を入力してください
            </div>
            <div class="text-gray-600 text-lg mb-4">
              カテゴリ: {{ getCategoryText(currentWord.category) }}
            </div>
            <div :class="['frequency-badge inline-block', getFrequencyClass(currentWord.frequency)]">
              {{ getFrequencyText(currentWord.frequency) }}
            </div>
          </div>
          
          <div class="max-w-md mx-auto">
            <div class="relative">
              <input ref="inputRef" v-model="userInput" @keyup.enter="checkAnswer"
                     @input="validateEnglishInput"
                     class="word-input w-full p-6 text-3xl text-center rounded-2xl font-bold shadow-lg"
                     placeholder="英単語を入力..." autofocus>
              <div v-if="!userInput" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl typing-cursor">|</div>
            </div>
            <button @click="checkAnswer" :disabled="!userInput.trim()"
                    class="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg">
              <i class="fas fa-check mr-3"></i>
              答えを確認
            </button>
          </div>
        </div>

        <!-- フィードバック -->
        <div v-if="showFeedback" :class="[
          'text-center p-8 rounded-3xl mb-8 shadow-2xl',
          isCorrect ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
        ]">
          <div class="text-white">
            <div class="text-5xl font-black mb-4">
              {{ isCorrect ? '🎉 完璧！' : '😅 惜しい...' }}
            </div>
            <div class="text-2xl mb-6 font-bold">
              {{ isCorrect 
                ? `素晴らしい！"${currentWord.word}"（${currentWord.meaning}）を正しく認識しました！`
                : `正解は "${currentWord.word}"（${currentWord.meaning}）でした`
              }}
            </div>
            
            <div v-if="isCorrect && combo > 1" class="bg-white/20 rounded-2xl p-4 mb-6">
              <div class="text-yellow-200 font-bold text-xl flex items-center justify-center gap-3">
                <i class="fas fa-bolt text-2xl"></i>
                {{ combo }}連続正解！ボーナス: +{{ combo * 25 }}点
              </div>
            </div>
            
            <!-- 単語詳細情報 -->
            <div class="bg-white/20 rounded-2xl p-6">
              <div class="grid md:grid-cols-3 gap-4 text-white/90">
                <div class="text-center">
                  <div class="text-sm font-semibold mb-1">カテゴリ</div>
                  <div class="font-bold">{{ getCategoryText(currentWord.category) }}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-semibold mb-1">重要度</div>
                  <div class="font-bold">{{ getFrequencyText(currentWord.frequency) }}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-semibold mb-1">習得状況</div>
                  <div class="font-bold">{{ correctAnswers }}/{{ currentWordIndex + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- コントロールボタン -->
        <div class="flex justify-center gap-4">
          <button @click="resetToMenu"
                  class="galaxy-button galaxy-button-secondary flex items-center gap-3 px-8 py-4 text-white font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            メニューに戻る
          </button>
          
          <button v-if="(gameMode === 'flash' && !showWord && userInput) || (gameMode === 'typing' && userInput)"
                  @click="clearInput"
                  class="galaxy-button galaxy-button-secondary flex items-center gap-3 px-8 py-4 text-white font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            入力クリア
          </button>
          
          <button v-if="showFeedback"
                  @click="nextWord"
                  class="galaxy-button galaxy-button-primary flex items-center gap-3 px-8 py-4 text-white font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
            次の単語
          </button>
        </div>
      </div>
    </div>

    <!-- 結果画面 -->
    <div v-else-if="gamePhase === 'result'" class="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div class="galaxy-card p-8 max-w-4xl w-full">
        <div class="text-center">
          <!-- グレード表示 -->
          <div class="mb-8">
            <div :class="[
              'result-grade text-8xl font-black bg-gradient-to-br bg-clip-text text-transparent mb-6',
              resultGrade.color
            ]">
              {{ resultGrade.grade }}
            </div>
            <h2 class="text-4xl font-bold text-white cosmic-glow mb-4 flex items-center justify-center gap-3">
              <svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
              </svg>
              サイトワード学習完了！
            </h2>
            <p class="text-2xl text-white/90 font-semibold">{{ resultGrade.message }}</p>
          </div>

          <!-- 詳細結果 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div class="stat-card bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-6 shadow-xl">
              <div class="text-4xl mb-3">🏆</div>
              <div class="text-3xl font-bold mb-1">{{ score.toLocaleString() }}</div>
              <div class="text-sm opacity-90 font-semibold">総スコア</div>
            </div>
            
            <div class="stat-card bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-2xl p-6 shadow-xl">
              <div class="text-4xl mb-3">✅</div>
              <div class="text-3xl font-bold mb-1">{{ correctAnswers }}</div>
              <div class="text-sm opacity-90 font-semibold">正解数</div>
            </div>
            
            <div class="stat-card bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-2xl p-6 shadow-xl">
              <div class="text-4xl mb-3">⚡</div>
              <div class="text-3xl font-bold mb-1">{{ maxCombo }}</div>
              <div class="text-sm opacity-90 font-semibold">最大連続</div>
            </div>
            
            <div class="stat-card bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-2xl p-6 shadow-xl">
              <div class="text-4xl mb-3">📊</div>
              <div class="text-3xl font-bold mb-1">
                {{ Math.round((correctAnswers / Math.min(totalQuestions, currentWordIndex + 1)) * 100) }}%
              </div>
              <div class="text-sm opacity-90 font-semibold">正答率</div>
            </div>
          </div>

          <!-- レベル評価 -->
          <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-8">
            <h3 class="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <i class="fas fa-award text-yellow-400"></i>
              サイトワード習得評価
            </h3>
            <div class="text-white/90 text-lg space-y-2">
              <div><strong>学習レベル:</strong> {{ currentLevel }} - {{ currentLevelData.name }}</div>
              <div><strong>習得モード:</strong> {{ getCurrentModeText() }}</div>
              <div><strong>学習単語数:</strong> {{ Math.min(totalQuestions, currentWordIndex + 1) }}語</div>
              <div class="pt-4 text-xl font-semibold" :class="correctAnswers >= Math.min(totalQuestions, currentWordIndex + 1) * 0.8 ? 'text-green-300' : 'text-blue-300'">
                {{ correctAnswers >= Math.min(totalQuestions, currentWordIndex + 1) * 0.8 
                  ? '🌟 優秀！重要なサイトワードがしっかり身についています！読解力の基礎が固まりました！' 
                  : '📚 良い調子です！もう少し練習して、サイトワードを完全に自動認識できるようにしましょう！'
                }}
              </div>
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="flex flex-wrap justify-center gap-4 mb-8">
            <button @click="startGame"
                    class="galaxy-button galaxy-button-primary flex items-center gap-3 py-4 px-8 text-lg font-bold text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              再挑戦
            </button>
            
            <button @click="changeMode"
                    class="galaxy-button galaxy-button-secondary flex items-center gap-3 py-4 px-8 text-lg font-bold text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              モード変更
            </button>
            
            <button @click="resetToMenu"
                    class="galaxy-button galaxy-button-secondary flex items-center gap-3 py-4 px-8 text-lg font-bold text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              メニューに戻る
            </button>
          </div>

          <!-- 次のレベルへのチャレンジ -->
          <div v-if="currentLevel < 3 && correctAnswers >= Math.min(totalQuestions, currentWordIndex + 1) * 0.75" class="mt-8">
            <button @click="levelUp"
                    class="galaxy-button galaxy-button-primary py-5 px-10 text-xl font-bold text-white cosmic-glow">
              <div class="flex items-center justify-center gap-3">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>レベル {{ currentLevel + 1 }} に挑戦！</span>
              </div>
            </button>
          </div>

          <!-- 完全習得メッセージ -->
          <div v-if="currentLevel === 3 && correctAnswers >= Math.min(totalQuestions, currentWordIndex + 1) * 0.9" class="mt-8 p-6 bg-gradient-to-r from-gold-400 to-yellow-500 rounded-3xl text-white shadow-2xl">
            <div class="text-3xl font-bold mb-2">
              🎊 おめでとうございます！ 🎊
            </div>
            <div class="text-lg">
              あなたは真のサイトワード・マスターです！<br>
              重要な英単語の瞬間認識能力を完全に習得しました！
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'

export default {
  name: 'SightWordMaster',
  setup() {
    // ゲーム状態
    const gamePhase = ref('menu') // menu, playing, result
    const currentLevel = ref(1)
    const currentWordIndex = ref(0)
    const score = ref(0)
    const lives = ref(3)
    const combo = ref(0)
    const maxCombo = ref(0)
    const timeLeft = ref(8)
    const isTimerActive = ref(false)
    const showWord = ref(true)
    const userInput = ref('')
    const showFeedback = ref(false)
    const isCorrect = ref(false)
    const showParticles = ref(false)
    const correctAnswers = ref(0)
    const totalQuestions = ref(10)
    const gameMode = ref('flash') // flash, multiple, typing
    const choices = ref([])
    const selectedChoice = ref('')
    const currentStreak = ref(0)
    const timerInterval = ref(null)

    // UI状態
    const backgroundParticles = ref([])
    const successParticles = ref([])
    const inputRef = ref(null)


    // ゲームモード設定
    const gameModes = [
      { 
        id: 'flash', 
        name: 'フラッシュ', 
        description: '瞬間記憶', 
        detail: '単語を一瞬見て記憶し、後で入力',
        icon: '⚡' 
      },
      { 
        id: 'multiple', 
        name: '選択肢', 
        description: '意味選択', 
        detail: '表示された単語の意味を4択から選ぶ',
        icon: '📝' 
      },
      { 
        id: 'typing', 
        name: 'タイピング', 
        description: '綴り入力', 
        detail: '意味から英単語のスペルを入力',
        icon: '⌨️' 
      }
    ]

    // サイトワードデータ（Dolch Sight Words準拠）
    const sightWordsData = {
      1: {
        name: "プリプライマー",
        description: "最も重要な基本40単語をマスターしよう！",
        displayTime: 2500,
        answerTime: 15,
        words: [
          { word: 'a', meaning: 'ひとつの', frequency: 'very_high', category: 'article' },
          { word: 'and', meaning: 'そして', frequency: 'very_high', category: 'conjunction' },
          { word: 'away', meaning: '離れて', frequency: 'high', category: 'adverb' },
          { word: 'big', meaning: '大きい', frequency: 'high', category: 'adjective' },
          { word: 'blue', meaning: '青い', frequency: 'high', category: 'adjective' },
          { word: 'can', meaning: 'できる', frequency: 'very_high', category: 'modal' },
          { word: 'come', meaning: '来る', frequency: 'very_high', category: 'verb' },
          { word: 'down', meaning: '下に', frequency: 'high', category: 'adverb' },
          { word: 'find', meaning: '見つける', frequency: 'high', category: 'verb' },
          { word: 'for', meaning: 'のために', frequency: 'very_high', category: 'preposition' },
          { word: 'funny', meaning: '面白い', frequency: 'medium', category: 'adjective' },
          { word: 'go', meaning: '行く', frequency: 'very_high', category: 'verb' },
          { word: 'help', meaning: '助ける', frequency: 'high', category: 'verb' },
          { word: 'here', meaning: 'ここに', frequency: 'very_high', category: 'adverb' },
          { word: 'I', meaning: '私', frequency: 'very_high', category: 'pronoun' },
          { word: 'in', meaning: '中に', frequency: 'very_high', category: 'preposition' },
          { word: 'is', meaning: 'です', frequency: 'very_high', category: 'verb' },
          { word: 'it', meaning: 'それ', frequency: 'very_high', category: 'pronoun' },
          { word: 'jump', meaning: '跳ぶ', frequency: 'medium', category: 'verb' },
          { word: 'little', meaning: '小さい', frequency: 'high', category: 'adjective' },
          { word: 'look', meaning: '見る', frequency: 'very_high', category: 'verb' },
          { word: 'make', meaning: '作る', frequency: 'high', category: 'verb' },
          { word: 'me', meaning: '私を', frequency: 'very_high', category: 'pronoun' },
          { word: 'my', meaning: '私の', frequency: 'very_high', category: 'possessive' },
          { word: 'not', meaning: 'ない', frequency: 'very_high', category: 'adverb' },
          { word: 'one', meaning: 'ひとつ', frequency: 'very_high', category: 'number' },
          { word: 'play', meaning: '遊ぶ', frequency: 'high', category: 'verb' },
          { word: 'red', meaning: '赤い', frequency: 'high', category: 'adjective' },
          { word: 'run', meaning: '走る', frequency: 'high', category: 'verb' },
          { word: 'said', meaning: '言った', frequency: 'very_high', category: 'verb' },
          { word: 'see', meaning: '見る', frequency: 'very_high', category: 'verb' },
          { word: 'the', meaning: 'その', frequency: 'very_high', category: 'article' },
          { word: 'three', meaning: '3つ', frequency: 'high', category: 'number' },
          { word: 'to', meaning: 'に', frequency: 'very_high', category: 'preposition' },
          { word: 'two', meaning: '2つ', frequency: 'high', category: 'number' },
          { word: 'up', meaning: '上に', frequency: 'high', category: 'adverb' },
          { word: 'we', meaning: '私たち', frequency: 'very_high', category: 'pronoun' },
          { word: 'where', meaning: 'どこ', frequency: 'high', category: 'adverb' },
          { word: 'yellow', meaning: '黄色い', frequency: 'medium', category: 'adjective' },
          { word: 'you', meaning: 'あなた', frequency: 'very_high', category: 'pronoun' }
        ]
      },
      2: {
        name: "プライマー",
        description: "読解力向上のための重要52単語！",
        displayTime: 2000,
        answerTime: 12,
        words: [
          { word: 'all', meaning: 'すべて', frequency: 'very_high', category: 'determiner' },
          { word: 'am', meaning: 'です', frequency: 'very_high', category: 'verb' },
          { word: 'are', meaning: 'です', frequency: 'very_high', category: 'verb' },
          { word: 'at', meaning: 'で', frequency: 'very_high', category: 'preposition' },
          { word: 'ate', meaning: '食べた', frequency: 'medium', category: 'verb' },
          { word: 'be', meaning: 'である', frequency: 'very_high', category: 'verb' },
          { word: 'black', meaning: '黒い', frequency: 'high', category: 'adjective' },
          { word: 'brown', meaning: '茶色い', frequency: 'medium', category: 'adjective' },
          { word: 'but', meaning: 'でも', frequency: 'very_high', category: 'conjunction' },
          { word: 'came', meaning: '来た', frequency: 'high', category: 'verb' },
          { word: 'did', meaning: 'した', frequency: 'very_high', category: 'verb' },
          { word: 'do', meaning: 'する', frequency: 'very_high', category: 'verb' },
          { word: 'eat', meaning: '食べる', frequency: 'high', category: 'verb' },
          { word: 'four', meaning: '4つ', frequency: 'high', category: 'number' },
          { word: 'get', meaning: '得る', frequency: 'very_high', category: 'verb' },
          { word: 'good', meaning: '良い', frequency: 'very_high', category: 'adjective' },
          { word: 'have', meaning: '持つ', frequency: 'very_high', category: 'verb' },
          { word: 'he', meaning: '彼', frequency: 'very_high', category: 'pronoun' },
          { word: 'into', meaning: '中へ', frequency: 'high', category: 'preposition' },
          { word: 'like', meaning: '好き', frequency: 'very_high', category: 'verb' },
          { word: 'must', meaning: 'しなければならない', frequency: 'high', category: 'modal' },
          { word: 'new', meaning: '新しい', frequency: 'very_high', category: 'adjective' },
          { word: 'no', meaning: 'いいえ', frequency: 'very_high', category: 'determiner' },
          { word: 'now', meaning: '今', frequency: 'very_high', category: 'adverb' },
          { word: 'on', meaning: '上に', frequency: 'very_high', category: 'preposition' },
          { word: 'our', meaning: '私たちの', frequency: 'high', category: 'possessive' },
          { word: 'out', meaning: '外に', frequency: 'high', category: 'adverb' },
          { word: 'please', meaning: 'お願いします', frequency: 'medium', category: 'interjection' },
          { word: 'pretty', meaning: 'きれいな', frequency: 'medium', category: 'adjective' },
          { word: 'ran', meaning: '走った', frequency: 'medium', category: 'verb' },
          { word: 'ride', meaning: '乗る', frequency: 'medium', category: 'verb' },
          { word: 'saw', meaning: '見た', frequency: 'high', category: 'verb' },
          { word: 'say', meaning: '言う', frequency: 'very_high', category: 'verb' },
          { word: 'she', meaning: '彼女', frequency: 'very_high', category: 'pronoun' },
          { word: 'so', meaning: 'とても', frequency: 'very_high', category: 'adverb' },
          { word: 'soon', meaning: 'すぐに', frequency: 'high', category: 'adverb' },
          { word: 'that', meaning: 'それ', frequency: 'very_high', category: 'pronoun' },
          { word: 'there', meaning: 'そこに', frequency: 'very_high', category: 'adverb' },
          { word: 'they', meaning: '彼ら', frequency: 'very_high', category: 'pronoun' },
          { word: 'this', meaning: 'これ', frequency: 'very_high', category: 'pronoun' },
          { word: 'too', meaning: 'も', frequency: 'high', category: 'adverb' },
          { word: 'under', meaning: '下に', frequency: 'medium', category: 'preposition' },
          { word: 'want', meaning: '欲しい', frequency: 'very_high', category: 'verb' },
          { word: 'was', meaning: 'だった', frequency: 'very_high', category: 'verb' },
          { word: 'well', meaning: 'よく', frequency: 'high', category: 'adverb' },
          { word: 'went', meaning: '行った', frequency: 'high', category: 'verb' },
          { word: 'were', meaning: 'だった', frequency: 'very_high', category: 'verb' },
          { word: 'what', meaning: '何', frequency: 'very_high', category: 'pronoun' },
          { word: 'white', meaning: '白い', frequency: 'high', category: 'adjective' },
          { word: 'who', meaning: '誰', frequency: 'high', category: 'pronoun' },
          { word: 'will', meaning: 'でしょう', frequency: 'very_high', category: 'modal' },
          { word: 'with', meaning: 'と一緒に', frequency: 'very_high', category: 'preposition' },
          { word: 'yes', meaning: 'はい', frequency: 'high', category: 'interjection' }
        ]
      },
      3: {
        name: "1年生レベル",
        description: "読書力を飛躍的に向上させる上級41単語！",
        displayTime: 1500,
        answerTime: 10,
        words: [
          { word: 'after', meaning: '後で', frequency: 'very_high', category: 'preposition' },
          { word: 'again', meaning: '再び', frequency: 'high', category: 'adverb' },
          { word: 'an', meaning: 'ひとつの', frequency: 'very_high', category: 'article' },
          { word: 'any', meaning: 'どんな', frequency: 'very_high', category: 'determiner' },
          { word: 'as', meaning: 'として', frequency: 'very_high', category: 'conjunction' },
          { word: 'ask', meaning: '尋ねる', frequency: 'high', category: 'verb' },
          { word: 'by', meaning: 'によって', frequency: 'very_high', category: 'preposition' },
          { word: 'could', meaning: 'できた', frequency: 'very_high', category: 'modal' },
          { word: 'every', meaning: 'すべての', frequency: 'high', category: 'determiner' },
          { word: 'fly', meaning: '飛ぶ', frequency: 'medium', category: 'verb' },
          { word: 'from', meaning: 'から', frequency: 'very_high', category: 'preposition' },
          { word: 'give', meaning: '与える', frequency: 'very_high', category: 'verb' },
          { word: 'going', meaning: '行っている', frequency: 'high', category: 'verb' },
          { word: 'had', meaning: '持っていた', frequency: 'very_high', category: 'verb' },
          { word: 'has', meaning: '持っている', frequency: 'very_high', category: 'verb' },
          { word: 'her', meaning: '彼女の', frequency: 'very_high', category: 'possessive' },
          { word: 'him', meaning: '彼を', frequency: 'high', category: 'pronoun' },
          { word: 'his', meaning: '彼の', frequency: 'very_high', category: 'possessive' },
          { word: 'how', meaning: 'どのように', frequency: 'very_high', category: 'adverb' },
          { word: 'just', meaning: 'ちょうど', frequency: 'very_high', category: 'adverb' },
          { word: 'know', meaning: '知る', frequency: 'very_high', category: 'verb' },
          { word: 'let', meaning: 'させる', frequency: 'high', category: 'verb' },
          { word: 'live', meaning: '住む', frequency: 'high', category: 'verb' },
          { word: 'may', meaning: 'かもしれない', frequency: 'high', category: 'modal' },
          { word: 'of', meaning: 'の', frequency: 'very_high', category: 'preposition' },
          { word: 'old', meaning: '古い', frequency: 'high', category: 'adjective' },
          { word: 'once', meaning: '一度', frequency: 'high', category: 'adverb' },
          { word: 'open', meaning: '開く', frequency: 'high', category: 'verb' },
          { word: 'over', meaning: '上に', frequency: 'very_high', category: 'preposition' },
          { word: 'put', meaning: '置く', frequency: 'very_high', category: 'verb' },
          { word: 'round', meaning: '丸い', frequency: 'medium', category: 'adjective' },
          { word: 'some', meaning: 'いくつかの', frequency: 'very_high', category: 'determiner' },
          { word: 'stop', meaning: '止まる', frequency: 'high', category: 'verb' },
          { word: 'take', meaning: '取る', frequency: 'very_high', category: 'verb' },
          { word: 'thank', meaning: 'ありがとう', frequency: 'medium', category: 'verb' },
          { word: 'them', meaning: '彼らを', frequency: 'very_high', category: 'pronoun' },
          { word: 'think', meaning: '考える', frequency: 'very_high', category: 'verb' },
          { word: 'walk', meaning: '歩く', frequency: 'high', category: 'verb' },
          { word: 'were', meaning: 'だった', frequency: 'very_high', category: 'verb' },
          { word: 'when', meaning: 'いつ', frequency: 'very_high', category: 'adverb' },
          { word: 'work', meaning: '働く', frequency: 'very_high', category: 'verb' }
        ]
      }
    }

    // Computed properties
    const currentLevelData = computed(() => sightWordsData[currentLevel.value])
    const currentWord = computed(() => {
      if (currentLevelData.value && currentWordIndex.value < currentLevelData.value.words.length) {
        return currentLevelData.value.words[currentWordIndex.value]
      }
      return { word: '', meaning: '', frequency: 'medium', category: 'unknown' }
    })

    const resultGrade = computed(() => {
      const percentage = (correctAnswers.value / Math.min(totalQuestions.value, currentWordIndex.value + 1)) * 100
      if (percentage >= 95) {
        return { grade: 'S+', message: '完璧！サイトワード・レジェンド！', color: 'from-yellow-400 to-orange-500' }
      } else if (percentage >= 90) {
        return { grade: 'S', message: '素晴らしい！サイトワード・マスター！', color: 'from-purple-400 to-pink-500' }
      } else if (percentage >= 85) {
        return { grade: 'A+', message: '優秀！読解力が大幅向上！', color: 'from-blue-400 to-indigo-500' }
      } else if (percentage >= 80) {
        return { grade: 'A', message: '良好！基礎が固まってきました！', color: 'from-green-400 to-teal-500' }
      } else if (percentage >= 70) {
        return { grade: 'B', message: '順調！継続して学習しましょう！', color: 'from-yellow-400 to-yellow-600' }
      } else {
        return { grade: 'C', message: '練習あるのみ！もう一度挑戦！', color: 'from-gray-400 to-gray-600' }
      }
    })

    // Methods
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

    const createSuccessParticles = () => {
      const emojis = ['🎉', '⭐', '✨', '🌟', '💫', '🎊', '🔥', '💎']
      successParticles.value = Array.from({ length: 12 }, (_, i) => ({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        delay: Math.random() * 0.5,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      }))
      
      showParticles.value = true
      setTimeout(() => {
        showParticles.value = false
      }, 2500)
    }

    const shuffleArray = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    const getCurrentModeText = () => {
      const mode = gameModes.find(m => m.id === gameMode.value)
      return mode ? mode.name : 'フラッシュ'
    }

    const getFrequencyText = (frequency) => {
      const texts = {
        very_high: '最重要',
        high: '重要',
        medium: '標準'
      }
      return texts[frequency] || '標準'
    }

    const getFrequencyClass = (frequency) => {
      const classes = {
        very_high: 'freq-very-high',
        high: 'freq-high',
        medium: 'freq-medium'
      }
      return classes[frequency] || 'freq-medium'
    }

    const getCategoryText = (category) => {
      const texts = {
        article: '冠詞',
        conjunction: '接続詞',
        adverb: '副詞',
        adjective: '形容詞',
        modal: '助動詞',
        verb: '動詞',
        preposition: '前置詞',
        pronoun: '代名詞',
        possessive: '所有格',
        number: '数詞',
        determiner: '限定詞',
        interjection: '感嘆詞',
        unknown: '不明'
      }
      return texts[category] || '不明'
    }

    const getChoiceClass = (choice) => {
      if (selectedChoice.value === '') return 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300'
      
      if (choice === currentWord.value.meaning) {
        return 'choice-correct'
      } else if (choice === selectedChoice.value) {
        return 'choice-incorrect'
      } else {
        return 'choice-unselected'
      }
    }

    const startGame = () => {
      // ゲーム状態をリセット
      gamePhase.value = 'playing'
      currentWordIndex.value = 0
      score.value = 0
      lives.value = 3
      combo.value = 0
      maxCombo.value = 0
      correctAnswers.value = 0
      showFeedback.value = false
      userInput.value = ''
      selectedChoice.value = ''
      
      // 単語配列をシャッフル
      const shuffledWords = shuffleArray(currentLevelData.value.words)
      sightWordsData[currentLevel.value].words = shuffledWords.slice(0, totalQuestions.value)
      
      nextWord()
    }

    const nextWord = () => {
      if (currentWordIndex.value >= Math.min(totalQuestions.value, currentLevelData.value.words.length)) {
        endGame()
        return
      }

      // リセット
      showFeedback.value = false
      userInput.value = ''
      selectedChoice.value = ''
      isCorrect.value = false
      
      if (gameMode.value === 'flash') {
        // フラッシュモード: 単語を表示
        showWord.value = true
        setTimeout(() => {
          showWord.value = false
          startTimer()
          nextTick(() => {
            if (inputRef.value) {
              inputRef.value.focus()
            }
          })
        }, currentLevelData.value.displayTime)
      } else if (gameMode.value === 'multiple') {
        // 選択肢モード: 選択肢を生成
        generateChoices()
        startTimer()
      } else if (gameMode.value === 'typing') {
        // タイピングモード: すぐに入力開始
        startTimer()
        nextTick(() => {
          if (inputRef.value) {
            inputRef.value.focus()
          }
        })
      }
    }

    const generateChoices = () => {
      const correct = currentWord.value.meaning
      const allMeanings = currentLevelData.value.words
        .map(w => w.meaning)
        .filter(m => m !== correct)
      
      const wrongChoices = shuffleArray(allMeanings).slice(0, 3)
      choices.value = shuffleArray([correct, ...wrongChoices])
    }

    const startTimer = () => {
      timeLeft.value = currentLevelData.value.answerTime
      isTimerActive.value = true
      
      timerInterval.value = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          clearInterval(timerInterval.value)
          isTimerActive.value = false
          
          if (!showFeedback.value) {
            // 時間切れ
            checkAnswer(true)
          }
        }
      }, 1000)
    }

    const stopTimer = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
      }
      isTimerActive.value = false
    }

    const checkAnswer = (timeOut = false) => {
      if (showFeedback.value) return
      
      stopTimer()
      
      let correct = false
      
      if (timeOut) {
        correct = false
      } else if (gameMode.value === 'multiple') {
        correct = selectedChoice.value === currentWord.value.meaning
      } else {
        // flash または typing モード
        const userAnswer = userInput.value.trim().toLowerCase()
        const correctAnswer = currentWord.value.word.toLowerCase()
        correct = userAnswer === correctAnswer
      }
      
      isCorrect.value = correct
      showFeedback.value = true
      
      if (correct) {
        correctAnswers.value++
        combo.value++
        maxCombo.value = Math.max(maxCombo.value, combo.value)
        
        // スコア計算
        let points = 100
        if (combo.value > 1) {
          points += combo.value * 25 // コンボボーナス
        }
        if (timeLeft.value > currentLevelData.value.answerTime * 0.7) {
          points += 50 // 時間ボーナス
        }
        score.value += points
        
        createSuccessParticles()
      } else {
        combo.value = 0
        lives.value--
        
        if (lives.value <= 0) {
          endGame()
          return
        }
      }
      
      // 自動的に次の問題へ（2秒後）
      setTimeout(() => {
        currentWordIndex.value++
        nextWord()
      }, 2500)
    }

    const selectChoice = (choice) => {
      if (selectedChoice.value !== '') return
      selectedChoice.value = choice
      checkAnswer()
    }

    const clearInput = () => {
      userInput.value = ''
      if (inputRef.value) {
        inputRef.value.focus()
      }
    }

    const endGame = () => {
      stopTimer()
      updateStats()
      gamePhase.value = 'result'
    }

    const resetToMenu = () => {
      stopTimer()
      gamePhase.value = 'menu'
      
      // 状態をリセット
      currentWordIndex.value = 0
      score.value = 0
      lives.value = 3
      combo.value = 0
      correctAnswers.value = 0
      showFeedback.value = false
      userInput.value = ''
      selectedChoice.value = ''
    }

    const changeMode = () => {
      resetToMenu()
    }

    const levelUp = () => {
      if (currentLevel.value < 3) {
        currentLevel.value++
        resetToMenu()
      }
    }

    const validateEnglishInput = (event) => {
      // 英字とスペースのみを許可
      const value = event.target.value
      const englishOnly = value.replace(/[^a-zA-Z\s]/g, '')
      if (value !== englishOnly) {
        userInput.value = englishOnly
      }
    }


    // Lifecycle
    onMounted(() => {
      initBackgroundParticles()
    })

    // Cleanup
    const cleanup = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
    }

    // Watch for component unmount
    watch(() => gamePhase.value, (newPhase) => {
      if (newPhase === 'menu') {
        cleanup()
      }
    })

    return {
      // State
      gamePhase,
      currentLevel,
      currentWordIndex,
      score,
      lives,
      combo,
      maxCombo,
      timeLeft,
      isTimerActive,
      showWord,
      userInput,
      showFeedback,
      isCorrect,
      showParticles,
      correctAnswers,
      totalQuestions,
      gameMode,
      choices,
      selectedChoice,
      backgroundParticles,
      successParticles,
      inputRef,

      // Data
      gameModes,
      sightWordsData,

      // Computed
      currentLevelData,
      currentWord,
      resultGrade,

      // Methods
      startGame,
      nextWord,
      checkAnswer,
      selectChoice,
      clearInput,
      resetToMenu,
      changeMode,
      levelUp,
      getCurrentModeText,
      getFrequencyText,
      getFrequencyClass,
      getCategoryText,
      getChoiceClass,
      validateEnglishInput,

    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.sight-word-master {
  font-family: 'Nunito', sans-serif;
}

.sight-word-flash {
  animation: flashIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes flashIn {
  0% { 
    opacity: 0; 
    transform: scale(0.3) rotate(-10deg); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.1) rotate(5deg); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1) rotate(0deg); 
  }
}

.word-fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.1; transform: scale(0.9); filter: blur(4px); }
}

.particle {
  position: absolute;
  pointer-events: none;
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

.success-particle {
  animation: successFloat 2.5s ease-out forwards;
}

@keyframes successFloat {
  0% { 
    transform: scale(0) rotate(0deg); 
    opacity: 1; 
  }
  20% { 
    transform: scale(1.2) rotate(72deg); 
    opacity: 1; 
  }
  100% { 
    transform: scale(0.8) rotate(360deg) translateY(-100px); 
    opacity: 0; 
  }
}

.word-input {
  border: 3px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
}

.word-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  background: #fff;
  transform: scale(1.02);
}

.choice-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  position: relative;
  overflow: hidden;
}

.choice-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s;
}

.choice-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.choice-button:hover::before {
  left: 100%;
}

.choice-button:active {
  transform: translateY(-2px);
}

.choice-correct {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: white !important;
  transform: scale(1.05) !important;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.5) !important;
}

.choice-incorrect {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: white !important;
  transform: scale(0.95) !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.4) !important;
}

.choice-unselected {
  opacity: 0.4 !important;
  transform: scale(0.95) !important;
  filter: grayscale(50%) !important;
}

.choice-selected {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  color: white !important;
  transform: scale(1.03) !important;
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.4) !important;
}

.frequency-badge {
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 2px solid transparent;
}

.freq-very-high {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-color: #fca5a5;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.freq-high {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border-color: #fcd34d;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.freq-medium {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: #93c5fd;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.timer-warning {
  animation: timerPulse 1s infinite;
}

@keyframes timerPulse {
  0%, 100% { 
    transform: scale(1); 
    color: #ef4444; 
  }
  50% { 
    transform: scale(1.15); 
    color: #dc2626; 
    text-shadow: 0 0 20px rgba(239, 68, 68, 0.6); 
  }
}

.game-mode-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.game-mode-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.6s;
  opacity: 0;
}

.game-mode-card:hover::before {
  opacity: 1;
  transform: rotate(45deg) translate(50%, 50%);
}

.level-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.level-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.word-meaning-reveal {
  animation: meaningReveal 0.6s ease-out;
}

@keyframes meaningReveal {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.9); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

.countdown-circle {
  animation: countdown 1s linear infinite;
}

@keyframes countdown {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.typing-cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.result-grade {
  animation: gradeReveal 1s ease-out;
}

@keyframes gradeReveal {
  0% { 
    opacity: 0; 
    transform: scale(0.5) rotate(-180deg); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2) rotate(0deg); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1) rotate(0deg); 
  }
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.05);
}

.word-pulse {
  animation: wordPulse 2s ease-in-out infinite;
}

@keyframes wordPulse {
  0%, 100% { 
    transform: scale(1); 
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.3); 
  }
  50% { 
    transform: scale(1.05); 
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.6); 
  }
}

.flash-countdown {
  animation: flashCountdown 3s linear;
}

@keyframes flashCountdown {
  0% { 
    background: linear-gradient(135deg, #10b981, #059669); 
  }
  50% { 
    background: linear-gradient(135deg, #f59e0b, #d97706); 
  }
  100% { 
    background: linear-gradient(135deg, #ef4444, #dc2626); 
  }
}

/* タイトルアニメーション */
.title-glow {
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 
                 0 0 30px rgba(255, 255, 255, 0.3),
                 0 0 40px rgba(255, 255, 255, 0.2);
  }
  to {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 
                 0 0 40px rgba(255, 255, 255, 0.5),
                 0 0 50px rgba(255, 255, 255, 0.3);
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