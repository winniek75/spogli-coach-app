// Level 2 Word Database for Pure Sound Lab
// Words categorized by phonemes for native English pronunciation training

export const LEVEL2_WORD_DATABASE = {
  // Stage 1A Foundation Words
  '/s/': {
    contains: ['sun', 'sit', 'bus', 'pass', 'west', 'smile', 'snake', 'star'],
    notContains: ['cat', 'dog', 'pen', 'big', 'red', 'top', 'fun', 'milk']
  },
  '/æ/': {
    contains: ['cat', 'hat', 'bad', 'man', 'apple', 'black', 'hand', 'happy'],
    notContains: ['sun', 'dog', 'pen', 'big', 'red', 'cup', 'book', 'moon']
  },
  '/t/': {
    contains: ['top', 'cat', 'sit', 'put', 'water', 'better', 'little', 'great'],
    notContains: ['sun', 'pen', 'big', 'red', 'dog', 'fun', 'milk', 'happy']
  },
  
  // Stage 1B Critical Distinctions
  '/ɪ/': {
    contains: ['sit', 'big', 'hit', 'milk', 'pink', 'simple', 'winter', 'little'],
    notContains: ['cat', 'sun', 'dog', 'pen', 'red', 'cup', 'book', 'moon']
  },
  '/p/': {
    contains: ['pen', 'top', 'cup', 'apple', 'happy', 'simple', 'open', 'purple'],
    notContains: ['cat', 'sun', 'dog', 'big', 'red', 'milk', 'book', 'moon']
  },
  '/n/': {
    contains: ['sun', 'pen', 'win', 'man', 'moon', 'green', 'winter', 'open'],
    notContains: ['cat', 'dog', 'big', 'red', 'cup', 'book', 'happy', 'purple']
  },
  
  // Stage 1C L/R Distinction (Critical for Japanese learners)
  '/l/': {
    contains: ['light', 'play', 'blue', 'little', 'apple', 'simple', 'milk', 'smile'],
    notContains: ['right', 'red', 'run', 'green', 'tree', 'three', 'brown', 'friend']
  },
  '/r/': {
    contains: ['red', 'run', 'tree', 'green', 'brown', 'friend', 'three', 'right'],
    notContains: ['light', 'play', 'blue', 'little', 'apple', 'simple', 'milk', 'smile']
  },
  '/k/': {
    contains: ['cat', 'cup', 'book', 'black', 'quick', 'school', 'back', 'pick'],
    notContains: ['sun', 'pen', 'dog', 'big', 'red', 'fun', 'milk', 'happy']
  },
  
  // Stage 2A Voiced/Voiceless Pairs
  '/z/': {
    contains: ['zoo', 'buzz', 'maze', 'zero', 'prize', 'music', 'surprise', 'please'],
    notContains: ['sun', 'cat', 'pen', 'big', 'top', 'cup', 'book', 'happy']
  },
  '/b/': {
    contains: ['boy', 'book', 'blue', 'big', 'brown', 'umber', 'rabbit', 'bubble'],
    notContains: ['cat', 'sun', 'pen', 'top', 'cup', 'milk', 'happy', 'purple']
  },
  '/d/': {
    contains: ['dog', 'red', 'good', 'hand', 'under', 'middle', 'garden', 'window'],
    notContains: ['cat', 'sun', 'pen', 'big', 'top', 'cup', 'book', 'happy']
  },
  
  // Stage 2B TH Sounds (Most difficult for Japanese)
  '/θ/': {
    contains: ['think', 'three', 'math', 'earth', 'month', 'nothing', 'birthday', 'something'],
    notContains: ['sun', 'cat', 'pen', 'big', 'red', 'dog', 'book', 'happy']
  },
  '/ð/': {
    contains: ['this', 'that', 'mother', 'father', 'brother', 'weather', 'another', 'together'],
    notContains: ['sun', 'cat', 'pen', 'big', 'red', 'dog', 'book', 'happy']
  },
  '/g/': {
    contains: ['go', 'big', 'dog', 'green', 'good', 'garden', 'together', 'bigger'],
    notContains: ['cat', 'sun', 'pen', 'top', 'cup', 'book', 'happy', 'purple']
  },
  
  // Stage 2C Vowel Distinctions
  '/ɛ/': {
    contains: ['red', 'pen', 'ten', 'best', 'help', 'yellow', 'seven', 'friend'],
    notContains: ['cat', 'sun', 'dog', 'big', 'top', 'cup', 'book', 'happy']
  },
  '/ʌ/': {
    contains: ['cup', 'fun', 'sun', 'run', 'love', 'mother', 'under', 'number'],
    notContains: ['cat', 'pen', 'dog', 'big', 'red', 'top', 'book', 'happy']
  },
  '/ʊ/': {
    contains: ['book', 'look', 'good', 'put', 'could', 'would', 'sugar', 'woman'],
    notContains: ['cat', 'sun', 'pen', 'big', 'red', 'dog', 'happy', 'purple']
  }
};

// Helper function to get random words for a phoneme
export function getWordsForPhoneme(phoneme, includeTarget = true, count = 3) {
  const phonemeData = LEVEL2_WORD_DATABASE[phoneme];
  if (!phonemeData) {
    console.warn('No word data found for phoneme:', phoneme);
    return [];
  }
  
  const words = [];
  
  if (includeTarget) {
    // Add words that contain the target phoneme
    const containsWords = [...phonemeData.contains];
    for (let i = 0; i < Math.min(count, containsWords.length); i++) {
      const randomIndex = Math.floor(Math.random() * containsWords.length);
      words.push({
        word: containsWords.splice(randomIndex, 1)[0],
        containsTarget: true
      });
    }
  }
  
  // Fill remaining slots with words that don't contain the target
  const notContainsWords = [...phonemeData.notContains];
  while (words.length < count && notContainsWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * notContainsWords.length);
    words.push({
      word: notContainsWords.splice(randomIndex, 1)[0],
      containsTarget: false
    });
  }
  
  return words;
}

// Generate Level 2 question format
export function generateLevel2Question(targetPhoneme) {
  // Get 3 words: 1-2 that contain the phoneme, 1-2 that don't
  const correctCount = Math.random() > 0.5 ? 1 : 2; // Randomly choose 1 or 2 correct answers
  
  const containingWords = getWordsForPhoneme(targetPhoneme, true, correctCount);
  const nonContainingWords = getWordsForPhoneme(targetPhoneme, false, 3 - correctCount);
  
  // Combine and shuffle
  const allWords = [...containingWords, ...nonContainingWords];
  const shuffledWords = allWords.sort(() => Math.random() - 0.5);
  
  return {
    targetPhoneme,
    words: shuffledWords,
    correctAnswers: shuffledWords.filter(w => w.containsTarget).map(w => w.word)
  };
}

// Level 2 Instructions for Japanese learners
export const LEVEL2_INSTRUCTIONS = {
  title: 'Level 2: 音素探索ミッション',
  subtitle: 'Find the Target Sound in Words',
  description: 'ターゲットの音素が含まれている英単語を見つけよう！',
  instructions: [
    '1. ターゲット音素を確認',
    '2. 3つの英単語を聞く',
    '3. ターゲット音素が含まれている単語をクリック',
    '4. 複数の正解がある場合もあります'
  ],
  tips: [
    '💡 単語全体をよく聞いて、音素を探そう',
    '🔊 各単語は何度でも再生できます',
    '🎯 ネイティブ発音に集中しよう'
  ]
};