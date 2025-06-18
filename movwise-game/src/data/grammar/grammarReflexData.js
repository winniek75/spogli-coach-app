/**
 * Grammar Reflex Arena Game Data
 * 
 * 高速文法判定ゲーム用のデータセット
 * 難易度別に分類された文法問題と、エラータイプ別の学習分析
 */

// エラータイプの定義
export const ERROR_TYPES = {
  SUBJECT_VERB_AGREEMENT: 'subject_verb_agreement',
  AUXILIARY_VERB: 'auxiliary_verb',
  VERB_TENSE: 'verb_tense',
  PRONOUN_CASE: 'pronoun_case',
  ARTICLE_USAGE: 'article_usage',
  PREPOSITION: 'preposition',
  PLURAL_SINGULAR: 'plural_singular',
  WORD_ORDER: 'word_order',
  SUBJUNCTIVE_MOOD: 'subjunctive_mood',
  REPORTED_SPEECH: 'reported_speech',
  RELATIVE_CLAUSE: 'relative_clause',
  CONDITIONAL: 'conditional',
  PASSIVE_VOICE: 'passive_voice',
  GERUND_INFINITIVE: 'gerund_infinitive',
  COMPARATIVE_SUPERLATIVE: 'comparative_superlative'
}

// エラータイプの説明（日本語）
export const ERROR_DESCRIPTIONS = {
  [ERROR_TYPES.SUBJECT_VERB_AGREEMENT]: '主語と動詞の一致',
  [ERROR_TYPES.AUXILIARY_VERB]: '助動詞の使い方',
  [ERROR_TYPES.VERB_TENSE]: '動詞の時制',
  [ERROR_TYPES.PRONOUN_CASE]: '代名詞の格',
  [ERROR_TYPES.ARTICLE_USAGE]: '冠詞の使い方',
  [ERROR_TYPES.PREPOSITION]: '前置詞',
  [ERROR_TYPES.PLURAL_SINGULAR]: '単数・複数',
  [ERROR_TYPES.WORD_ORDER]: '語順',
  [ERROR_TYPES.SUBJUNCTIVE_MOOD]: '仮定法',
  [ERROR_TYPES.REPORTED_SPEECH]: '間接話法',
  [ERROR_TYPES.RELATIVE_CLAUSE]: '関係詞',
  [ERROR_TYPES.CONDITIONAL]: '条件文',
  [ERROR_TYPES.PASSIVE_VOICE]: '受動態',
  [ERROR_TYPES.GERUND_INFINITIVE]: '動名詞・不定詞',
  [ERROR_TYPES.COMPARATIVE_SUPERLATIVE]: '比較級・最上級'
}

// 初級レベル（英検5級〜4級程度）
export const beginnerQuestions = [
  // Be動詞の間違い
  {
    sentence: "She are happy today",
    isCorrect: false,
    correction: "She is happy today",
    errorType: ERROR_TYPES.SUBJECT_VERB_AGREEMENT,
    explanation: "三人称単数の主語にはisを使います",
    difficulty: 1,
    timeLimit: 2000,
    category: "be_verbs"
  },
  {
    sentence: "I am studying English",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1500,
    category: "be_verbs"
  },
  {
    sentence: "They is my friends",
    isCorrect: false,
    correction: "They are my friends",
    errorType: ERROR_TYPES.SUBJECT_VERB_AGREEMENT,
    explanation: "複数の主語にはareを使います",
    difficulty: 1,
    timeLimit: 2000,
    category: "be_verbs"
  },
  {
    sentence: "We are students",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1500,
    category: "be_verbs"
  },
  {
    sentence: "He am a teacher",
    isCorrect: false,
    correction: "He is a teacher",
    errorType: ERROR_TYPES.SUBJECT_VERB_AGREEMENT,
    explanation: "三人称単数の主語にはisを使います",
    difficulty: 1,
    timeLimit: 2000,
    category: "be_verbs"
  },

  // 一般動詞の間違い
  {
    sentence: "He don't like pizza",
    isCorrect: false,
    correction: "He doesn't like pizza",
    errorType: ERROR_TYPES.AUXILIARY_VERB,
    explanation: "三人称単数にはdoesn'tを使います",
    difficulty: 1,
    timeLimit: 2000,
    category: "general_verbs"
  },
  {
    sentence: "They are playing soccer",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1500,
    category: "general_verbs"
  },
  {
    sentence: "I doesn't understand",
    isCorrect: false,
    correction: "I don't understand",
    errorType: ERROR_TYPES.AUXILIARY_VERB,
    explanation: "一人称にはdon'tを使います",
    difficulty: 1,
    timeLimit: 1800,
    category: "general_verbs"
  },
  {
    sentence: "She goes to school every day",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1500,
    category: "general_verbs"
  },
  {
    sentence: "We was at the park",
    isCorrect: false,
    correction: "We were at the park",
    errorType: ERROR_TYPES.SUBJECT_VERB_AGREEMENT,
    explanation: "複数の主語の過去形にはwereを使います",
    difficulty: 1,
    timeLimit: 1800,
    category: "past_tense"
  },

  // 疑問文の間違い
  {
    sentence: "Do you likes music?",
    isCorrect: false,
    correction: "Do you like music?",
    errorType: ERROR_TYPES.AUXILIARY_VERB,
    explanation: "Do/Doesを使う疑問文では動詞は原形です",
    difficulty: 2,
    timeLimit: 1800,
    category: "questions"
  },
  {
    sentence: "Where do you live?",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1400,
    category: "questions"
  },
  {
    sentence: "Does he likes coffee?",
    isCorrect: false,
    correction: "Does he like coffee?",
    errorType: ERROR_TYPES.AUXILIARY_VERB,
    explanation: "Doesを使う疑問文では動詞は原形です",
    difficulty: 2,
    timeLimit: 1600,
    category: "questions"
  },
  {
    sentence: "What time is it?",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1200,
    category: "questions"
  },
  {
    sentence: "How old you are?",
    isCorrect: false,
    correction: "How old are you?",
    errorType: ERROR_TYPES.WORD_ORDER,
    explanation: "疑問詞のある疑問文では be動詞が前に来ます",
    difficulty: 2,
    timeLimit: 1700,
    category: "questions"
  },

  // 現在進行形
  {
    sentence: "They isn't coming",
    isCorrect: false,
    correction: "They aren't coming",
    errorType: ERROR_TYPES.AUXILIARY_VERB,
    explanation: "複数の主語にはaren'tを使います",
    difficulty: 2,
    timeLimit: 1600,
    category: "present_continuous"
  },
  {
    sentence: "I am watching TV now",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1400,
    category: "present_continuous"
  },
  {
    sentence: "She is run in the park",
    isCorrect: false,
    correction: "She is running in the park",
    errorType: ERROR_TYPES.VERB_TENSE,
    explanation: "現在進行形では動詞にingを付けます",
    difficulty: 2,
    timeLimit: 1700,
    category: "present_continuous"
  },

  // 複数形の間違い
  {
    sentence: "I have two cats",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 1,
    timeLimit: 1300,
    category: "plurals"
  },
  {
    sentence: "There are many childs",
    isCorrect: false,
    correction: "There are many children",
    errorType: ERROR_TYPES.PLURAL_SINGULAR,
    explanation: "childの複数形はchildrenです",
    difficulty: 2,
    timeLimit: 1800,
    category: "plurals"
  }
]

// 中級レベル（英検3級〜準2級程度）
export const intermediateQuestions = [
  // 仮定法の間違い
  {
    sentence: "If I was you, I would go",
    isCorrect: false,
    correction: "If I were you, I would go",
    errorType: ERROR_TYPES.SUBJUNCTIVE_MOOD,
    explanation: "仮定法過去ではbe動詞はすべてwereを使います",
    difficulty: 3,
    timeLimit: 1000,
    category: "conditionals"
  },
  {
    sentence: "I wish I could speak French",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 3,
    timeLimit: 1200,
    category: "conditionals"
  },
  {
    sentence: "If I have time, I will come",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です（未来の条件文）",
    difficulty: 2,
    timeLimit: 1300,
    category: "conditionals"
  },
  {
    sentence: "If I will have money, I buy it",
    isCorrect: false,
    correction: "If I have money, I will buy it",
    errorType: ERROR_TYPES.CONDITIONAL,
    explanation: "条件文のif節では未来形は使いません",
    difficulty: 3,
    timeLimit: 1400,
    category: "conditionals"
  },

  // 間接話法
  {
    sentence: "She said that she can help",
    isCorrect: false,
    correction: "She said that she could help",
    errorType: ERROR_TYPES.REPORTED_SPEECH,
    explanation: "間接話法では時制を一つ過去にします",
    difficulty: 3,
    timeLimit: 1200,
    category: "reported_speech"
  },
  {
    sentence: "He told me he was busy",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 3,
    timeLimit: 1100,
    category: "reported_speech"
  },
  {
    sentence: "She asked me where do I live",
    isCorrect: false,
    correction: "She asked me where I live",
    errorType: ERROR_TYPES.WORD_ORDER,
    explanation: "間接疑問文では疑問文の語順になりません",
    difficulty: 4,
    timeLimit: 1300,
    category: "reported_speech"
  },

  // 関係代名詞
  {
    sentence: "The book which I bought is interesting",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 3,
    timeLimit: 1000,
    category: "relative_clauses"
  },
  {
    sentence: "The man who he is my teacher",
    isCorrect: false,
    correction: "The man who is my teacher",
    errorType: ERROR_TYPES.RELATIVE_CLAUSE,
    explanation: "関係代名詞が主語の場合、重複する代名詞は不要です",
    difficulty: 4,
    timeLimit: 1400,
    category: "relative_clauses"
  },
  {
    sentence: "This is the house where I was born",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 3,
    timeLimit: 1100,
    category: "relative_clauses"
  },

  // 現在完了
  {
    sentence: "I have been to Japan twice",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 2,
    timeLimit: 1200,
    category: "present_perfect"
  },
  {
    sentence: "Have you ever went to Paris?",
    isCorrect: false,
    correction: "Have you ever been to Paris?",
    errorType: ERROR_TYPES.VERB_TENSE,
    explanation: "現在完了では過去分詞を使います",
    difficulty: 3,
    timeLimit: 1300,
    category: "present_perfect"
  },
  {
    sentence: "I didn't finish my homework yet",
    isCorrect: false,
    correction: "I haven't finished my homework yet",
    errorType: ERROR_TYPES.VERB_TENSE,
    explanation: "yetがある文では現在完了を使います",
    difficulty: 3,
    timeLimit: 1400,
    category: "present_perfect"
  },

  // 受動態
  {
    sentence: "This book was written by Shakespeare",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 2,
    timeLimit: 1100,
    category: "passive_voice"
  },
  {
    sentence: "The window was broke by the ball",
    isCorrect: false,
    correction: "The window was broken by the ball",
    errorType: ERROR_TYPES.PASSIVE_VOICE,
    explanation: "受動態では過去分詞を使います",
    difficulty: 3,
    timeLimit: 1300,
    category: "passive_voice"
  }
]

// 上級レベル（英検2級〜準1級程度）
export const advancedQuestions = [
  // 分詞構文
  {
    sentence: "Having finished the work, he went home",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 5,
    timeLimit: 800,
    category: "participles"
  },
  {
    sentence: "Finished the work, he went home",
    isCorrect: false,
    correction: "Having finished the work, he went home",
    errorType: ERROR_TYPES.VERB_TENSE,
    explanation: "完了の分詞構文ではHaving + 過去分詞を使います",
    difficulty: 5,
    timeLimit: 1000,
    category: "participles"
  },
  {
    sentence: "Walking down the street, I met my friend",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 4,
    timeLimit: 900,
    category: "participles"
  },

  // 複雑な時制
  {
    sentence: "By the time I arrived, they had already left",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 4,
    timeLimit: 1000,
    category: "complex_tenses"
  },
  {
    sentence: "I will have been studying for 3 hours",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です（未来完了進行形）",
    difficulty: 5,
    timeLimit: 1100,
    category: "complex_tenses"
  },
  {
    sentence: "If I would have known, I would have come",
    isCorrect: false,
    correction: "If I had known, I would have come",
    errorType: ERROR_TYPES.CONDITIONAL,
    explanation: "仮定法過去完了のif節ではwould haveは使いません",
    difficulty: 5,
    timeLimit: 1200,
    category: "complex_tenses"
  },

  // 高度な構文
  {
    sentence: "Not only does he speak English, but also French",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 5,
    timeLimit: 900,
    category: "advanced_structures"
  },
  {
    sentence: "Hardly had I arrived when it started raining",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です（倒置構文）",
    difficulty: 6,
    timeLimit: 1000,
    category: "advanced_structures"
  },
  {
    sentence: "So beautiful the sunset was",
    isCorrect: false,
    correction: "So beautiful was the sunset",
    errorType: ERROR_TYPES.WORD_ORDER,
    explanation: "感嘆の倒置では動詞が主語の前に来ます",
    difficulty: 6,
    timeLimit: 1100,
    category: "advanced_structures"
  },

  // 動名詞・不定詞
  {
    sentence: "I enjoyed to read that book",
    isCorrect: false,
    correction: "I enjoyed reading that book",
    errorType: ERROR_TYPES.GERUND_INFINITIVE,
    explanation: "enjoyの後は動名詞を使います",
    difficulty: 4,
    timeLimit: 1000,
    category: "gerunds_infinitives"
  },
  {
    sentence: "I want to learn Spanish",
    isCorrect: true,
    errorType: null,
    explanation: "正しい文です",
    difficulty: 3,
    timeLimit: 800,
    category: "gerunds_infinitives"
  },
  {
    sentence: "I'm looking forward to meet you",
    isCorrect: false,
    correction: "I'm looking forward to meeting you",
    errorType: ERROR_TYPES.GERUND_INFINITIVE,
    explanation: "look forward toの後は動名詞を使います",
    difficulty: 4,
    timeLimit: 1100,
    category: "gerunds_infinitives"
  }
]

// 全レベル統合データ
export const allQuestions = [
  ...beginnerQuestions,
  ...intermediateQuestions,
  ...advancedQuestions
]

// レベル別設定
export const LEVEL_SETTINGS = {
  beginner: {
    name: "初級",
    description: "基本的な文法（英検5級〜4級レベル）",
    timeLimit: 2000,
    questionsCount: 15,
    passingScore: 70,
    questions: beginnerQuestions
  },
  intermediate: {
    name: "中級",
    description: "実用的な文法（英検3級〜準2級レベル）",
    timeLimit: 1200,
    questionsCount: 12,
    passingScore: 75,
    questions: intermediateQuestions
  },
  advanced: {
    name: "上級",
    description: "高度な文法（英検2級〜準1級レベル）",
    timeLimit: 1000,
    questionsCount: 10,
    passingScore: 80,
    questions: advancedQuestions
  },
  mixed: {
    name: "総合",
    description: "全レベルからランダム出題",
    timeLimit: 1500,
    questionsCount: 15,
    passingScore: 75,
    questions: allQuestions
  }
}

// ゲーム設定
export const GAME_SETTINGS = {
  DEFAULT_LIVES: 3,
  FEVER_MODE_TRIGGER: 10, // 連続正解数
  FEVER_MODE_DURATION: 10000, // ミリ秒
  FEVER_MODE_MULTIPLIER: 2,
  COMBO_MULTIPLIER_MAX: 5,
  SPEED_BONUS_THRESHOLD: 500, // ミリ秒
  SPEED_BONUS_POINTS: 50,
  BASE_POINTS: 100,
  WRONG_PENALTY: -50,
  TIMEOUT_PENALTY: -30
}

// スコア計算関数
export const calculateScore = (isCorrect, reactionTime, combo, feverMode = false) => {
  if (!isCorrect) {
    return GAME_SETTINGS.WRONG_PENALTY
  }

  let baseScore = GAME_SETTINGS.BASE_POINTS
  
  // スピードボーナス
  if (reactionTime <= GAME_SETTINGS.SPEED_BONUS_THRESHOLD) {
    baseScore += GAME_SETTINGS.SPEED_BONUS_POINTS
  }
  
  // コンボ倍率
  const comboMultiplier = Math.min(combo, GAME_SETTINGS.COMBO_MULTIPLIER_MAX)
  baseScore *= comboMultiplier
  
  // フィーバーモード倍率
  if (feverMode) {
    baseScore *= GAME_SETTINGS.FEVER_MODE_MULTIPLIER
  }
  
  return Math.round(baseScore)
}

// エラー分析用ヘルパー関数
export const analyzeErrors = (results) => {
  const errorCount = {}
  const categoryCount = {}
  
  results.forEach(result => {
    if (!result.isCorrect && result.question.errorType) {
      const errorType = result.question.errorType
      const category = result.question.category
      
      errorCount[errorType] = (errorCount[errorType] || 0) + 1
      categoryCount[category] = (categoryCount[category] || 0) + 1
    }
  })
  
  return {
    errorsByType: errorCount,
    errorsByCategory: categoryCount,
    weakestAreas: Object.entries(errorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({
        type,
        description: ERROR_DESCRIPTIONS[type],
        count
      }))
  }
}

// ランダムクイズ生成
export const generateRandomQuiz = (level = 'mixed', count = 10) => {
  const settings = LEVEL_SETTINGS[level]
  if (!settings) {
    throw new Error(`Invalid level: ${level}`)
  }
  
  const shuffled = [...settings.questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// 弱点強化クイズ生成
export const generateWeaknessQuiz = (errorTypes, count = 10) => {
  const targetQuestions = allQuestions.filter(q => 
    errorTypes.includes(q.errorType) || (q.isCorrect && Math.random() < 0.3)
  )
  
  const shuffled = [...targetQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// 難易度別フィルター
export const filterByDifficulty = (questions, minDifficulty = 1, maxDifficulty = 6) => {
  return questions.filter(q => 
    q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty
  )
}

// カテゴリ別フィルター
export const filterByCategory = (questions, categories) => {
  if (!Array.isArray(categories)) {
    categories = [categories]
  }
  return questions.filter(q => categories.includes(q.category))
}

export default {
  ERROR_TYPES,
  ERROR_DESCRIPTIONS,
  beginnerQuestions,
  intermediateQuestions,
  advancedQuestions,
  allQuestions,
  LEVEL_SETTINGS,
  GAME_SETTINGS,
  calculateScore,
  analyzeErrors,
  generateRandomQuiz,
  generateWeaknessQuiz,
  filterByDifficulty,
  filterByCategory
}
    