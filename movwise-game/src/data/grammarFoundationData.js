// data/grammarFoundationData.js

// 惑星情報定義
export const planetInfo = {
  beVerb: {
    id: 'beVerb',
    name: 'Be動詞惑星',
    icon: '🪐',
    color: '#3B82F6',
    description: 'am/is/are の基本をマスターしよう',
    difficulty: 1,
    estimatedTime: '15-20分',
    learningGoals: [
      'am/is/are の使い分け',
      'Be動詞の疑問文・否定文',
      '基本的な補語の理解'
    ]
  },
  generalVerb: {
    id: 'generalVerb',
    name: '一般動詞惑星',
    icon: '🌍',
    color: '#10B981',
    description: 'do/does を使った文を覚えよう',
    difficulty: 2,
    estimatedTime: '20-25分',
    learningGoals: [
      '一般動詞の基本形',
      'do/does の疑問文',
      "don't/doesn't の否定文"
    ]
  },
  basicOrder: {
    id: 'basicOrder',
    name: '基本語順惑星',
    icon: '🌕',
    color: '#8B5CF6',
    description: '主語+動詞+目的語の順序をマスター',
    difficulty: 2,
    estimatedTime: '20-30分',
    learningGoals: [
      '基本語順 SVO',
      '疑問詞の位置',
      '修飾語の配置'
    ]
  },
  timeCoordination: {
    id: 'timeCoordination',
    name: '時制調整惑星',
    icon: '⭐',
    color: '#F59E0B',
    description: '過去・現在・未来を自在に操ろう',
    difficulty: 3,
    estimatedTime: '25-35分',
    learningGoals: [
      '基本時制の理解',
      '時制マーカーの認識',
      '適切な時制選択'
    ]
  }
}

// 文法カラーコード定義
export const grammarColorCodes = {
  beVerbs: {
    family: 'blue',
    primaryColor: '#4A90E2',
    lightColor: '#E3F2FD',
    darkColor: '#1976D2'
  },
  generalVerbs: {
    family: 'red',
    primaryColor: '#FF6B6B',
    lightColor: '#FFEBEE',
    darkColor: '#D32F2F'
  },
  questionWords: {
    family: 'yellow',
    primaryColor: '#FFD700',
    lightColor: '#FFFDE7',
    darkColor: '#F57F17'
  },
  subjects: {
    family: 'green',
    primaryColor: '#10B981',
    lightColor: '#E8F5E8',
    darkColor: '#047857'
  },
  objects: {
    family: 'purple',
    primaryColor: '#8B5CF6',
    lightColor: '#F3E8FF',
    darkColor: '#6D28D9'
  }
}

// Be動詞学習データ
export const beVerbData = {
  subjects: [
    { word: 'I', verb: 'am', color: 'blue', type: 'pronoun' },
    { word: 'You', verb: 'are', color: 'blue', type: 'pronoun' },
    { word: 'He', verb: 'is', color: 'blue', type: 'pronoun' },
    { word: 'She', verb: 'is', color: 'blue', type: 'pronoun' },
    { word: 'It', verb: 'is', color: 'blue', type: 'pronoun' },
    { word: 'We', verb: 'are', color: 'blue', type: 'pronoun' },
    { word: 'They', verb: 'are', color: 'blue', type: 'pronoun' }
  ],
  verbs: [
    { word: 'am', subjects: ['I'], color: 'blue', type: 'be_verb' },
    { word: 'is', subjects: ['He', 'She', 'It'], color: 'blue', type: 'be_verb' },
    { word: 'are', subjects: ['You', 'We', 'They'], color: 'blue', type: 'be_verb' }
  ],
  complements: [
    { word: 'happy', type: 'adjective', color: 'blue' },
    { word: 'a student', type: 'noun', color: 'blue' },
    { word: 'here', type: 'adverb', color: 'blue' },
    { word: 'tired', type: 'adjective', color: 'blue' },
    { word: 'a teacher', type: 'noun', color: 'blue' },
    { word: 'hungry', type: 'adjective', color: 'blue' },
    { word: 'at home', type: 'adverb', color: 'blue' },
    { word: 'busy', type: 'adjective', color: 'blue' }
  ],
  correctCombinations: [
    ['I', 'am', 'happy'],
    ['You', 'are', 'a student'],
    ['He', 'is', 'here'],
    ['She', 'is', 'tired'],
    ['It', 'is', 'a book'],
    ['We', 'are', 'hungry'],
    ['They', 'are', 'at home']
  ]
}

// 一般動詞学習データ
export const generalVerbData = {
  subjects: [
    { word: 'I', auxiliary: 'do', color: 'green', type: 'pronoun' },
    { word: 'You', auxiliary: 'do', color: 'green', type: 'pronoun' },
    { word: 'He', auxiliary: 'does', color: 'green', type: 'pronoun' },
    { word: 'She', auxiliary: 'does', color: 'green', type: 'pronoun' },
    { word: 'It', auxiliary: 'does', color: 'green', type: 'pronoun' },
    { word: 'We', auxiliary: 'do', color: 'green', type: 'pronoun' },
    { word: 'They', auxiliary: 'do', color: 'green', type: 'pronoun' }
  ],
  verbs: [
    { word: 'like', type: 'general_verb', color: 'red' },
    { word: 'eat', type: 'general_verb', color: 'red' },
    { word: 'play', type: 'general_verb', color: 'red' },
    { word: 'study', type: 'general_verb', color: 'red' },
    { word: 'watch', type: 'general_verb', color: 'red' },
    { word: 'read', type: 'general_verb', color: 'red' },
    { word: 'write', type: 'general_verb', color: 'red' },
    { word: 'listen', type: 'general_verb', color: 'red' }
  ],
  objects: [
    { word: 'apples', type: 'countable', color: 'purple' },
    { word: 'lunch', type: 'uncountable', color: 'purple' },
    { word: 'soccer', type: 'uncountable', color: 'purple' },
    { word: 'English', type: 'uncountable', color: 'purple' },
    { word: 'TV', type: 'uncountable', color: 'purple' },
    { word: 'books', type: 'countable', color: 'purple' },
    { word: 'music', type: 'uncountable', color: 'purple' },
    { word: 'homework', type: 'uncountable', color: 'purple' }
  ],
  correctCombinations: [
    ['I', 'like', 'apples'],
    ['You', 'eat', 'lunch'],
    ['He', 'plays', 'soccer'],
    ['She', 'studies', 'English'],
    ['We', 'watch', 'TV'],
    ['They', 'read', 'books']
  ]
}

// 疑問詞学習データ
export const questionWordData = {
  questionWords: [
    { word: 'What', meaning: 'What', color: 'yellow' },
    { word: 'When', meaning: 'When', color: 'yellow' },
    { word: 'Where', meaning: 'Where', color: 'yellow' },
    { word: 'Who', meaning: 'Who', color: 'yellow' },
    { word: 'Why', meaning: 'Why', color: 'yellow' },
    { word: 'How', meaning: 'How', color: 'yellow' }
  ],
  auxiliaries: [
    { word: 'do', subjects: ['I', 'you', 'we', 'they'], color: 'yellow' },
    { word: 'does', subjects: ['he', 'she', 'it'], color: 'yellow' },
    { word: 'is', subjects: ['he', 'she', 'it'], color: 'yellow' },
    { word: 'are', subjects: ['you', 'we', 'they'], color: 'yellow' }
  ],
  questionPatterns: [
    ['What', 'do', 'you', 'like?'],
    ['Where', 'is', 'the', 'book?'],
    ['When', 'does', 'he', 'study?'],
    ['Who', 'are', 'you?'],
    ['Why', 'do', 'they', 'play?'],
    ['How', 'is', 'she?']
  ]
}

// 時制学習データ
export const tenseData = {
  past: {
    timeMarkers: [
      { word: 'yesterday', color: 'past' },
      { word: 'last week', color: 'past' },
      { word: 'ago', color: 'past' },
      { word: 'before', color: 'past' },
      { word: 'last year', color: 'past' },
      { word: 'last month', color: 'past' }
    ],
    verbs: [
      { base: 'play', past: 'played', type: 'regular' },
      { base: 'study', past: 'studied', type: 'regular' },
      { base: 'go', past: 'went', type: 'irregular' },
      { base: 'have', past: 'had', type: 'irregular' },
      { base: 'be', past: 'was/were', type: 'irregular' },
      { base: 'do', past: 'did', type: 'irregular' }
    ],
    zone: 'left',
    color: '#8B5A2B'
  },
  present: {
    timeMarkers: [
      { word: 'now', color: 'present' },
      { word: 'today', color: 'present' },
      { word: 'usually', color: 'present' },
      { word: 'always', color: 'present' },
      { word: 'sometimes', color: 'present' },
      { word: 'often', color: 'present' }
    ],
    verbs: [
      { base: 'play', present: 'play/plays', type: 'regular' },
      { base: 'study', present: 'study/studies', type: 'regular' },
      { base: 'go', present: 'go/goes', type: 'irregular' },
      { base: 'have', present: 'have/has', type: 'irregular' },
      { base: 'be', present: 'am/is/are', type: 'irregular' },
      { base: 'do', present: 'do/does', type: 'irregular' }
    ],
    zone: 'center',
    color: '#10B981'
  },
  future: {
    timeMarkers: [
      { word: 'tomorrow', color: 'future' },
      { word: 'next week', color: 'future' },
      { word: 'soon', color: 'future' },
      { word: 'later', color: 'future' },
      { word: 'next year', color: 'future' },
      { word: 'next month', color: 'future' }
    ],
    verbs: [
      { base: 'play', future: 'will play', type: 'will' },
      { base: 'study', future: 'will study', type: 'will' },
      { base: 'go', future: 'will go', type: 'will' },
      { base: 'have', future: 'will have', type: 'will' },
      { base: 'be', future: 'will be', type: 'will' },
      { base: 'do', future: 'will do', type: 'will' }
    ],
    zone: 'right',
    color: '#3B82F6'
  }
}

// パターンハンター用データ
export const patternHunterData = {
  targetPatterns: [
    {
      id: 'pattern_01',
      elements: ['I', 'am', 'happy'],
      englishElements: ['I', 'am', 'happy'],
      type: 'be_verb',
      difficulty: 1,
      points: 10,
      meaning: '私は幸せです',
      pattern: 'I am happy',
      explanation: 'Be動詞を使った基本的な文'
    },
    {
      id: 'pattern_02',
      elements: ['You', 'are', 'a', 'student'],
      englishElements: ['You', 'are', 'a', 'student'],
      type: 'be_verb',
      difficulty: 1,
      points: 10,
      meaning: 'あなたは学生です',
      pattern: 'You are a student',
      explanation: 'Be動詞の肯定文'
    },
    {
      id: 'pattern_03',
      elements: ['He', 'likes', 'apples'],
      englishElements: ['He', 'likes', 'apples'],
      type: 'general_verb',
      difficulty: 2,
      points: 15,
      meaning: '彼はりんごが好きです',
      pattern: 'He likes apples',
      explanation: '一般動詞を使った文'
    },
    {
      id: 'pattern_04',
      elements: ['She', 'plays', 'soccer'],
      englishElements: ['She', 'plays', 'soccer'],
      type: 'general_verb',
      difficulty: 2,
      points: 15,
      meaning: '彼女はサッカーをします',
      pattern: 'She plays soccer',
      explanation: '一般動詞の活用'
    },
    {
      id: 'pattern_05',
      elements: ['Do', 'you', 'like', 'cats'],
      englishElements: ['Do', 'you', 'like', 'cats'],
      type: 'question',
      difficulty: 3,
      points: 20,
      meaning: 'あなたは猫が好きですか？',
      pattern: 'Do you like cats',
      explanation: 'Do疑問文'
    },
    {
      id: 'pattern_06',
      elements: ['Where', 'is', 'the', 'book'],
      englishElements: ['Where', 'is', 'the', 'book'],
      type: 'wh_question',
      difficulty: 3,
      points: 20,
      meaning: '本はどこにありますか？',
      pattern: 'Where is the book',
      explanation: '疑問詞を使った疑問文'
    },
    {
      id: 'pattern_07',
      elements: ['We', "don't", 'like', 'fish'],
      englishElements: ['We', "don't", 'like', 'fish'],
      type: 'negative',
      difficulty: 3,
      points: 20,
      meaning: '私たちは魚が好きではありません',
      pattern: "We don't like fish",
      explanation: '一般動詞の否定文'
    },
    {
      id: 'pattern_08',
      elements: ['They', "aren't", 'here'],
      englishElements: ['They', "aren't", 'here'],
      type: 'be_negative',
      difficulty: 2,
      points: 15,
      meaning: '彼らはここにいません',
      pattern: "They aren't here",
      explanation: 'Be動詞の否定文'
    },
    // 英検5級追加パターン
    {
      id: 'pattern_09',
      elements: ['She', 'is', 'a', 'teacher'],
      englishElements: ['She', 'is', 'a', 'teacher'],
      type: 'be_verb',
      difficulty: 1,
      points: 10,
      meaning: '彼女は先生です',
      pattern: 'She is a teacher',
      explanation: 'Be動詞の基本形'
    },
    {
      id: 'pattern_10',
      elements: ['It', 'is', 'red'],
      englishElements: ['It', 'is', 'red'],
      type: 'be_verb',
      difficulty: 1,
      points: 10,
      meaning: 'それは赤いです',
      pattern: 'It is red',
      explanation: 'Be動詞＋形容詞'
    },
    {
      id: 'pattern_11',
      elements: ['We', 'are', 'friends'],
      englishElements: ['We', 'are', 'friends'],
      type: 'be_verb',
      difficulty: 1,
      points: 10,
      meaning: '私たちは友達です',
      pattern: 'We are friends',
      explanation: 'Be動詞の複数形'
    },
    {
      id: 'pattern_12',
      elements: ['They', 'have', 'books'],
      englishElements: ['They', 'have', 'books'],
      type: 'general_verb',
      difficulty: 2,
      points: 15,
      meaning: '彼らは本を持っています',
      pattern: 'They have books',
      explanation: '一般動詞have'
    },
    {
      id: 'pattern_13',
      elements: ['I', 'go', 'to', 'school'],
      englishElements: ['I', 'go', 'to', 'school'],
      type: 'general_verb',
      difficulty: 2,
      points: 15,
      meaning: '私は学校に行きます',
      pattern: 'I go to school',
      explanation: '一般動詞go'
    },
    {
      id: 'pattern_14',
      elements: ['You', 'eat', 'lunch'],
      englishElements: ['You', 'eat', 'lunch'],
      type: 'general_verb',
      difficulty: 2,
      points: 15,
      meaning: 'あなたは昼食を食べます',
      pattern: 'You eat lunch',
      explanation: '一般動詞eat'
    },
    {
      id: 'pattern_15',
      elements: ['He', 'runs', 'fast'],
      englishElements: ['He', 'runs', 'fast'],
      type: 'general_verb',
      difficulty: 2,
      points: 15,
      meaning: '彼は速く走ります',
      pattern: 'He runs fast',
      explanation: '一般動詞の三人称単数'
    },
    {
      id: 'pattern_16',
      elements: ['She', 'watches', 'TV'],
      englishElements: ['She', 'watches', 'TV'],
      type: 'general_verb',
      difficulty: 2,
      points: 15,
      meaning: '彼女はテレビを見ます',
      pattern: 'She watches TV',
      explanation: '一般動詞の三人称単数'
    },
    // 英検4級追加パターン（疑問文）
    {
      id: 'pattern_17',
      elements: ['Are', 'you', 'busy'],
      englishElements: ['Are', 'you', 'busy'],
      type: 'question',
      difficulty: 3,
      points: 20,
      meaning: 'あなたは忙しいですか？',
      pattern: 'Are you busy',
      explanation: 'Be動詞の疑問文'
    },
    {
      id: 'pattern_18',
      elements: ['Is', 'he', 'tall'],
      englishElements: ['Is', 'he', 'tall'],
      type: 'question',
      difficulty: 3,
      points: 20,
      meaning: '彼は背が高いですか？',
      pattern: 'Is he tall',
      explanation: 'Be動詞の疑問文'
    },
    {
      id: 'pattern_19',
      elements: ['Does', 'she', 'study', 'English'],
      englishElements: ['Does', 'she', 'study', 'English'],
      type: 'question',
      difficulty: 3,
      points: 20,
      meaning: '彼女は英語を勉強しますか？',
      pattern: 'Does she study English',
      explanation: 'Does疑問文'
    },
    {
      id: 'pattern_20',
      elements: ['Can', 'you', 'swim'],
      englishElements: ['Can', 'you', 'swim'],
      type: 'question',
      difficulty: 3,
      points: 20,
      meaning: 'あなたは泳げますか？',
      pattern: 'Can you swim',
      explanation: 'Can疑問文'
    },
    {
      id: 'pattern_21',
      elements: ['What', 'time', 'is', 'it'],
      englishElements: ['What', 'time', 'is', 'it'],
      type: 'wh_question',
      difficulty: 3,
      points: 20,
      meaning: '何時ですか？',
      pattern: 'What time is it',
      explanation: '疑問詞what'
    },
    {
      id: 'pattern_22',
      elements: ['How', 'are', 'you'],
      englishElements: ['How', 'are', 'you'],
      type: 'wh_question',
      difficulty: 3,
      points: 20,
      meaning: '元気ですか？',
      pattern: 'How are you',
      explanation: '疑問詞how'
    },
    {
      id: 'pattern_23',
      elements: ['Who', 'is', 'that'],
      englishElements: ['Who', 'is', 'that'],
      type: 'wh_question',
      difficulty: 3,
      points: 20,
      meaning: 'あれは誰ですか？',
      pattern: 'Who is that',
      explanation: '疑問詞who'
    },
    // 英検3級追加パターン（否定文・複雑な文）
    {
      id: 'pattern_24',
      elements: ['I', "don't", 'have', 'time'],
      englishElements: ['I', "don't", 'have', 'time'],
      type: 'negative',
      difficulty: 3,
      points: 20,
      meaning: '私は時間がありません',
      pattern: "I don't have time",
      explanation: '一般動詞の否定文'
    },
    {
      id: 'pattern_25',
      elements: ['She', "doesn't", 'like', 'coffee'],
      englishElements: ['She', "doesn't", 'like', 'coffee'],
      type: 'negative',
      difficulty: 3,
      points: 20,
      meaning: '彼女はコーヒーが好きではありません',
      pattern: "She doesn't like coffee",
      explanation: 'doesn\'tの否定文'
    },
    {
      id: 'pattern_26',
      elements: ['We', "can't", 'come', 'today'],
      englishElements: ['We', "can't", 'come', 'today'],
      type: 'negative',
      difficulty: 4,
      points: 25,
      meaning: '私たちは今日来ることができません',
      pattern: "We can't come today",
      explanation: 'can\'tの否定文'
    },
    {
      id: 'pattern_27',
      elements: ['There', 'is', 'a', 'cat'],
      englishElements: ['There', 'is', 'a', 'cat'],
      type: 'there_be',
      difficulty: 4,
      points: 25,
      meaning: '猫がいます',
      pattern: 'There is a cat',
      explanation: 'There is構文'
    },
    {
      id: 'pattern_28',
      elements: ['There', 'are', 'many', 'students'],
      englishElements: ['There', 'are', 'many', 'students'],
      type: 'there_be',
      difficulty: 4,
      points: 25,
      meaning: '多くの学生がいます',
      pattern: 'There are many students',
      explanation: 'There are構文'
    },
    {
      id: 'pattern_29',
      elements: ['I', 'want', 'to', 'go'],
      englishElements: ['I', 'want', 'to', 'go'],
      type: 'infinitive',
      difficulty: 4,
      points: 25,
      meaning: '私は行きたいです',
      pattern: 'I want to go',
      explanation: '不定詞to go'
    },
    {
      id: 'pattern_30',
      elements: ['She', 'likes', 'to', 'read'],
      englishElements: ['She', 'likes', 'to', 'read'],
      type: 'infinitive',
      difficulty: 4,
      points: 25,
      meaning: '彼女は読むことが好きです',
      pattern: 'She likes to read',
      explanation: '不定詞to read'
    }
  ],
  distractorWords: [
    'it', 'this', 'that', 'my', 'your', 'his', 'her',
    'but', 'and', 'or', 'because', 'when', 'if', 'very', 'really',
    'cat', 'dog', 'house', 'car', 'tree', 'water', 'food', 'time', 'beautiful', 'big', 'small',
    'the', 'an', 'some', 'many', 'much', 'little', 'few', 'all', 'every', 'each',
    'good', 'bad', 'new', 'old', 'young', 'hot', 'cold', 'long', 'short', 'fast', 'slow',
    'work', 'play', 'live', 'come', 'see', 'know', 'think', 'feel', 'say', 'tell',
    'music', 'movie', 'game', 'sport', 'park', 'store', 'room', 'door', 'window', 'table',
    'friend', 'family', 'mother', 'father', 'brother', 'sister', 'doctor', 'nurse',
    'morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday',
    'always', 'sometimes', 'never', 'usually', 'often', 'now', 'then', 'here', 'there'
  ]
}

// 難易度設定
export const difficultySettings = {
  easy: {
    timeLimit: 90, // 秒
    patterns: 3,
    distractors: 6,
    hintDelay: 10, // 秒後にヒント表示
    pointsMultiplier: 0.8
  },
  normal: {
    timeLimit: 60,
    patterns: 4,
    distractors: 8,
    hintDelay: 15,
    pointsMultiplier: 1.0
  },
  hard: {
    timeLimit: 45,
    patterns: 5,
    distractors: 12,
    hintDelay: 20,
    pointsMultiplier: 1.5
  }
}

// 成果データ
export const achievementData = {
  planet_unlock: {
    title: '新惑星発見！',
    description: '新しい惑星を解禁しました',
    icon: '🌟'
  },
  perfect_score: {
    title: 'パーフェクト！',
    description: '100%の正確率を達成しました',
    icon: '🎯'
  },
  speed_master: {
    title: 'スピードマスター',
    description: '制限時間の半分で完了しました',
    icon: '⚡'
  },
  grammar_expert: {
    title: '文法エキスパート',
    description: '全ての基本文法をマスターしました',
    icon: '🎓'
  },
  streak_champion: {
    title: '連続チャンピオン',
    description: '7日連続で学習しました',
    icon: '🔥'
  }
}

// 音声フィードバック用テキスト
export const audioFeedback = {
  correct: [
    'Great job!',
    'Excellent!',
    'Perfect!',
    'Well done!',
    'Fantastic!'
  ],
  incorrect: [
    'Try again!',
    'Almost there!',
    'Keep trying!',
    'You can do it!',
    'Good effort!'
  ],
  encouragement: [
    'You\'re doing great!',
    'Keep it up!',
    'Nice progress!',
    'You\'re learning fast!',
    'Excellent work!'
  ]
}

export const timeZoneNavigatorData = {
  beginner: [
    {
      text: "I eat apples",
      correctZone: "present",
      difficulty: 1,
      explanation: "現在の習慣を表す現在形"
    },
    {
      text: "I ate apples yesterday",
      correctZone: "past",
      difficulty: 1,
      explanation: "過去の出来事を表す過去形"
    },
    {
      text: "I will eat apples tomorrow",
      correctZone: "future",
      difficulty: 1,
      explanation: "未来の予定を表す未来形"
    }
    // 追加問題はここに...
  ],
  intermediate: [
    // 中級問題...
  ],
  advanced: [
    // 上級問題（現在完了含む）...
  ]
}