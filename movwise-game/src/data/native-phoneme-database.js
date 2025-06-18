// src/data/native-phoneme-database.js
// MovWISE Native English Pronunciation - Accurate 44 Phonemes Database (General American English)
// Specifically designed for Japanese learners to achieve native-like pronunciation

export const NATIVE_PHONEME_PROGRESSION = {
  // Stage 1A: Foundation Phonemes (Critical for Japanese Learners)
  stage1A: [
    {
      symbol: '/s/',
      ipa: 's',
      description: 'Voiceless alveolar fricative',
      examples: ['sun', 'sit', 'bass'],
      difficulty: 1,
      group: 'fricatives',
      confusingSounds: ['/z/', '/θ/', '/ʃ/'],
      masteryThreshold: 0.85,
      color: 'from-blue-400 to-blue-600',
      audioFile: 's.m4a',
      nativeTips: 'Keep tongue tip near but not touching alveolar ridge. Continuous airflow.',
      commonErrors: 'Japanese speakers often add vowel sound (su). Practice pure /s/ without vowel.',
      articulationGuide: 'Tongue tip approaches alveolar ridge, but does not touch. Air flows through narrow channel.'
    },
    {
      symbol: '/æ/',
      ipa: 'æ',
      description: 'Near-open front unrounded vowel (Standard American /æ/)',
      examples: ['cat', 'hat', 'bad'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/ʌ/', '/ɑ/', '/ɛ/'],
      masteryThreshold: 0.85,
      color: 'from-red-400 to-red-600',
      audioFile: 'a1.m4a',
      nativeTips: 'Tongue low and front, mouth much wider than Japanese /a/. Very different from Japanese /a/.',
      commonErrors: 'Japanese speakers substitute /a/ sound. Practice extreme mouth width and tongue position.',
      articulationGuide: 'Tongue body low and forward. Mouth opening wide horizontally, not vertically.'
    },
    {
      symbol: '/t/',
      ipa: 't',
      description: 'Voiceless alveolar plosive (with aspiration in initial position)',
      examples: ['top', 'cat', 'better'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/d/', '/k/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-green-400 to-green-600',
      audioFile: 't.m4a',
      nativeTips: 'Strong aspiration when word-initial. Tongue tip contacts alveolar ridge.',
      commonErrors: 'Insufficient aspiration in initial position. Practice strong puff of air.',
      articulationGuide: 'Complete closure with tongue tip against alveolar ridge. Release with strong burst of air.'
    }
  ],

  // Stage 1B: Critical Distinctions for Japanese Learners
  stage1B: [
    {
      symbol: '/ɪ/',
      ipa: 'ɪ',
      description: 'Near-close near-front unrounded vowel (lax vowel)',
      examples: ['sit', 'hit', 'bit'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/iː/', '/e/', '/ɛ/'],
      masteryThreshold: 0.85,
      color: 'from-purple-400 to-purple-600',
      audioFile: 'i1.m4a',
      nativeTips: 'Shorter and more relaxed than /iː/. Tongue position lower than Japanese /i/.',
      commonErrors: 'Japanese speakers use tense /iː/ sound. Practice relaxed, shorter vowel.',
      articulationGuide: 'Tongue high-front but relaxed. Much shorter duration than /iː/.'
    },
    {
      symbol: '/p/',
      ipa: 'p',
      description: 'Voiceless bilabial plosive (with aspiration)',
      examples: ['pen', 'cap', 'spin'],
      difficulty: 1,
      group: 'plosives',
      confusingSounds: ['/b/', '/f/', '/m/'],
      masteryThreshold: 0.85,
      color: 'from-orange-400 to-orange-600',
      audioFile: 'p.m4a',
      nativeTips: 'Strong aspiration in initial position. Complete lip closure.',
      commonErrors: 'Insufficient aspiration. Practice strong puff of air.',
      articulationGuide: 'Complete closure of both lips. Release with strong burst of air.'
    },
    {
      symbol: '/n/',
      ipa: 'n',
      description: 'Voiced alveolar nasal',
      examples: ['no', 'sun', 'pen'],
      difficulty: 1,
      group: 'nasals',
      confusingSounds: ['/m/', '/ŋ/', '/l/'],
      masteryThreshold: 0.85,
      color: 'from-teal-400 to-teal-600',
      audioFile: 'n.m4a',
      nativeTips: 'Tongue tip contacts alveolar ridge. Air flows through nose.',
      commonErrors: 'Confusion with /m/ in final position.',
      articulationGuide: 'Tongue tip against alveolar ridge. Velum lowered for nasal airflow.'
    }
  ],

  // Stage 1C: L/R Distinction (Critical for Japanese Learners)
  stage1C: [
    {
      symbol: '/l/',
      ipa: 'l',
      description: 'Voiced alveolar lateral approximant',
      examples: ['light', 'play', 'call'],
      difficulty: 4,
      group: 'liquids',
      confusingSounds: ['/r/', '/w/', '/j/'],
      masteryThreshold: 0.90,
      color: 'from-cyan-400 to-cyan-600',
      audioFile: 'l.m4a',
      nativeTips: 'Tongue tip touches alveolar ridge. Air flows around sides of tongue.',
      commonErrors: 'Japanese speakers substitute /r/ sound. Practice lateral airflow.',
      articulationGuide: 'Tongue tip firmly against alveolar ridge. Air flows laterally around tongue sides.',
      practiceWords: ['light/right', 'collect/correct', 'play/pray']
    },
    {
      symbol: '/r/',
      ipa: 'r',
      description: 'Voiced postalveolar approximant (American rhotic)',
      examples: ['red', 'tree', 'car'],
      difficulty: 5,
      group: 'liquids',
      confusingSounds: ['/l/', '/w/', '/ʋ/'],
      masteryThreshold: 0.90,
      color: 'from-rose-400 to-rose-600',
      audioFile: 'r.m4a',
      nativeTips: 'Tongue tip curled back, not touching anything. Strong lip rounding.',
      commonErrors: 'Japanese speakers substitute /l/ sound. Practice retroflexion.',
      articulationGuide: 'Tongue tip curled back (retroflex). No contact with roof of mouth. Slight lip rounding.',
      practiceWords: ['right/light', 'pray/play', 'correct/collect']
    },
    {
      symbol: '/k/',
      ipa: 'k',
      description: 'Voiceless velar plosive (with aspiration)',
      examples: ['cat', 'back', 'school'],
      difficulty: 1,
      group: 'plosives',
      confusingSounds: ['/g/', '/t/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-emerald-400 to-emerald-600',
      audioFile: 'k.m4a',
      nativeTips: 'Back of tongue contacts soft palate. Strong aspiration in initial position.',
      commonErrors: 'Insufficient aspiration in initial position.',
      articulationGuide: 'Complete closure with back of tongue against velum. Release with strong burst.'
    }
  ],

  // Stage 2A: Voiced/Voiceless Distinctions (Critical for Japanese)
  stage2A: [
    {
      symbol: '/z/',
      ipa: 'z',
      description: 'Voiced alveolar fricative',
      examples: ['zoo', 'buzz', 'maze'],
      difficulty: 2,
      group: 'fricatives',
      confusingSounds: ['/s/', '/ʒ/', '/dʒ/'],
      masteryThreshold: 0.85,
      color: 'from-violet-400 to-violet-600',
      audioFile: 'z.m4a',
      nativeTips: 'Same tongue position as /s/ but with vocal cord vibration.',
      commonErrors: 'Japanese speakers often devoice in final position. Practice maintaining voicing.',
      articulationGuide: 'Identical to /s/ but with vocal cord vibration. Feel throat buzz.',
      voicingPairs: ['/s/ - /z/']
    },
    {
      symbol: '/b/',
      ipa: 'b',
      description: 'Voiced bilabial plosive',
      examples: ['boy', 'cab', 'about'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/p/', '/v/', '/m/'],
      masteryThreshold: 0.85,
      color: 'from-amber-400 to-amber-600',
      audioFile: 'b.m4a',
      nativeTips: 'Same lip position as /p/ but with vocal cord vibration.',
      commonErrors: 'Devoicing in final position. Practice maintaining voicing throughout.',
      articulationGuide: 'Complete lip closure with vocal cord vibration. Less aspiration than /p/.',
      voicingPairs: ['/p/ - /b/']
    },
    {
      symbol: '/d/',
      ipa: 'd',
      description: 'Voiced alveolar plosive',
      examples: ['dog', 'red', 'made'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/t/', '/ð/', '/l/'],
      masteryThreshold: 0.85,
      color: 'from-lime-400 to-lime-600',
      audioFile: 'd.m4a',
      nativeTips: 'Same tongue position as /t/ but with vocal cord vibration.',
      commonErrors: 'Devoicing in final position. Practice maintaining voicing.',
      articulationGuide: 'Tongue tip against alveolar ridge with vocal cord vibration. Less aspiration than /t/.',
      voicingPairs: ['/t/ - /d/']
    }
  ],

  // Stage 2B: TH Sounds (Most Difficult for Japanese Learners)
  stage2B: [
    {
      symbol: '/θ/',
      ipa: 'θ',
      description: 'Voiceless dental fricative',
      examples: ['think', 'math', 'birthday'],
      difficulty: 5,
      group: 'fricatives',
      confusingSounds: ['/s/', '/f/', '/t/'],
      masteryThreshold: 0.90,
      color: 'from-sky-400 to-sky-600',
      audioFile: 'th1.m4a',
      nativeTips: 'Tongue tip between teeth. Air flows over tongue. No vocal cord vibration.',
      commonErrors: 'Japanese speakers substitute /s/ or /f/. Practice tongue placement between teeth.',
      articulationGuide: 'Tongue tip protruding slightly between upper and lower teeth. Voiceless airflow.',
      practiceWords: ['think/sink', 'math/mass', 'thing/sing']
    },
    {
      symbol: '/ð/',
      ipa: 'ð',
      description: 'Voiced dental fricative',
      examples: ['this', 'mother', 'breathe'],
      difficulty: 5,
      group: 'fricatives',
      confusingSounds: ['/z/', '/v/', '/d/'],
      masteryThreshold: 0.90,
      color: 'from-indigo-400 to-indigo-600',
      audioFile: 'th2.m4a',
      nativeTips: 'Same tongue position as /θ/ but with vocal cord vibration.',
      commonErrors: 'Japanese speakers substitute /z/ or /d/. Practice voicing with tongue between teeth.',
      articulationGuide: 'Tongue tip between teeth with vocal cord vibration. Feel throat buzz.',
      practiceWords: ['this/zis', 'breathe/breeze', 'that/zat'],
      voicingPairs: ['/θ/ - /ð/']
    },
    {
      symbol: '/g/',
      ipa: 'g',
      description: 'Voiced velar plosive',
      examples: ['go', 'big', 'egg'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/k/', '/ɡ/', '/ŋ/'],
      masteryThreshold: 0.85,
      color: 'from-green-500 to-green-700',
      audioFile: 'g.m4a',
      nativeTips: 'Same tongue position as /k/ but with vocal cord vibration.',
      commonErrors: 'Devoicing in final position. Practice maintaining voicing.',
      articulationGuide: 'Back of tongue against velum with vocal cord vibration.',
      voicingPairs: ['/k/ - /g/']
    }
  ],

  // Stage 2C: Additional Vowel Distinctions
  stage2C: [
    {
      symbol: '/ɛ/',
      ipa: 'ɛ',
      description: 'Open-mid front unrounded vowel',
      examples: ['bed', 'said', 'head'],
      difficulty: 2,
      group: 'short_vowels',
      confusingSounds: ['/æ/', '/ɪ/', '/eɪ/'],
      masteryThreshold: 0.85,
      color: 'from-red-500 to-red-700',
      audioFile: 'e1.m4a',
      nativeTips: 'More open than /ɪ/, more closed than /æ/. Mid-front position.',
      commonErrors: 'Confusion with /æ/ and /eɪ/. Practice distinct mid-front position.',
      articulationGuide: 'Tongue mid-front position. More open than /ɪ/, less open than /æ/.'
    },
    {
      symbol: '/ʌ/',
      ipa: 'ʌ',
      description: 'Open-mid back unrounded vowel (stressed schwa)',
      examples: ['but', 'cup', 'love'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/æ/', '/ɑ/', '/ə/'],
      masteryThreshold: 0.85,
      color: 'from-orange-500 to-orange-700',
      audioFile: 'u3.m4a',
      nativeTips: 'Central vowel, more back than /æ/. Unstressed version is schwa /ə/.',
      commonErrors: 'Japanese speakers may substitute /a/. Practice central tongue position.',
      articulationGuide: 'Tongue central-back, mid-height. Mouth moderately open.'
    },
    {
      symbol: '/ʊ/',
      ipa: 'ʊ',
      description: 'Near-close near-back rounded vowel (lax vowel)',
      examples: ['book', 'put', 'could'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/uː/', '/oʊ/', '/ɔ/'],
      masteryThreshold: 0.85,
      color: 'from-purple-500 to-purple-700',
      audioFile: 'u1.m4a',
      nativeTips: 'Shorter and more relaxed than /uː/. Slight lip rounding.',
      commonErrors: 'Japanese speakers use tense /uː/. Practice relaxed, shorter vowel.',
      articulationGuide: 'Tongue high-back but relaxed. Slight lip rounding. Short duration.'
    }
  ]
};

// Accurate IPA to Audio File Mapping for Native Pronunciation
export const NATIVE_AUDIO_MAPPING = {
  // Consonants
  '/p/': 'p.m4a',
  '/b/': 'b.m4a', 
  '/t/': 't.m4a',
  '/d/': 'd.m4a',
  '/k/': 'k.m4a',
  '/g/': 'g.m4a',
  '/f/': 'f.m4a',
  '/v/': 'v.m4a',
  '/θ/': 'th1.m4a',  // voiceless th
  '/ð/': 'th2.m4a',  // voiced th
  '/s/': 's.m4a',
  '/z/': 'z.m4a',
  '/ʃ/': 'sh.m4a',
  '/ʒ/': 'zh.m4a',
  '/h/': 'h.m4a',
  '/m/': 'm.m4a',
  '/n/': 'n.m4a',
  '/ŋ/': 'ng.m4a',
  '/l/': 'l.m4a',
  '/r/': 'r.m4a',
  '/j/': 'y.m4a',
  '/w/': 'w.m4a',
  
  // Short Vowels
  '/ɪ/': 'i1.m4a',    // bit
  '/ɛ/': 'e1.m4a',    // bet
  '/æ/': 'a1.m4a',    // bat
  '/ʌ/': 'u3.m4a',    // but
  '/ʊ/': 'u1.m4a',    // book
  '/ə/': 'schwa.m4a', // about
  
  // Long Vowels
  '/iː/': 'e2.m4a',   // beat  
  '/uː/': 'u2.m4a',   // boot
  '/ɑ/': 'a4.m4a',    // father (American)
  '/ɔ/': 'o4.m4a',    // thought
  
  // Diphthongs  
  '/eɪ/': 'eɪ.m4a',   // day
  '/aɪ/': 'aɪ.m4a',   // my
  '/ɔɪ/': 'oi.m4a',   // boy
  '/aʊ/': 'ow.m4a',   // now
  '/oʊ/': 'o1.m4a',   // go
  
  // R-colored vowels (American English)
  '/ɚ/': 'er.m4a',    // unstressed (water)
  '/ɝ/': 'er.m4a',    // stressed (bird)
  '/ɑr/': 'ar.m4a',   // car
  '/ɔr/': 'or.m4a',   // more
  '/ɪr/': 'ear.m4a',  // near
  '/ɛr/': 'air.m4a',  // care
  '/ʊr/': 'ure.m4a'   // cure
};

// Critical Pronunciation Tips for Japanese Learners
export const JAPANESE_LEARNER_TIPS = {
  commonChallenges: {
    'L_R_distinction': {
      problem: 'Japanese has only one liquid sound /r/',
      solution: 'Focus on tongue tip position: /l/ touches alveolar ridge, /r/ is retroflex',
      practiceWords: ['light/right', 'play/pray', 'collect/correct']
    },
    'voiced_voiceless': {
      problem: 'Japanese devoices consonants in final position',
      solution: 'Practice maintaining voicing to the very end of words',
      practiceWords: ['bad', 'dog', 'buzz', 'save']
    },
    'th_sounds': {
      problem: 'No dental fricatives in Japanese',
      solution: 'Tongue tip between teeth, not /s/ or /f/ substitution',
      practiceWords: ['think/sink', 'this/zis', 'math/mass']
    },
    'vowel_reduction': {
      problem: 'Japanese vowels are always full, never reduced',
      solution: 'Learn schwa /ə/ and vowel reduction in unstressed syllables',
      practiceWords: ['about', 'sofa', 'banana']
    },
    'consonant_clusters': {
      problem: 'Japanese inserts vowels between consonants',
      solution: 'Practice consonant clusters without epenthetic vowels',
      practiceWords: ['stop', 'school', 'spring', 'strong']
    }
  },
  
  masterySequence: [
    'Basic consonants (p, t, k, s)',
    'L/R distinction',
    'Voiced/voiceless pairs',
    'TH sounds',
    'Vowel quality distinctions',
    'Schwa and vowel reduction',
    'Consonant clusters',
    'Connected speech patterns'
  ]
};

// Learning Stage Dependencies
export const STAGE_DEPENDENCIES = {
  stage1B: ['stage1A'],
  stage1C: ['stage1A', 'stage1B'],
  stage2A: ['stage1A', 'stage1B', 'stage1C'],
  stage2B: ['stage2A'],
  stage2C: ['stage2A', 'stage2B']
};

// Mastery Criteria for Native Pronunciation
export const MASTERY_CRITERIA = {
  singlePhoneme: 0.90,        // Higher standard for native pronunciation
  stageCompletion: 0.85,      // Stage completion threshold
  levelAdvancement: 0.90,     // Level advancement threshold
  consecutiveCorrect: 5,      // More repetitions for native mastery
  minAttempts: 8             // More attempts for reliable assessment
};

// Adaptive Learning Settings for Native Pronunciation
export const ADAPTIVE_SETTINGS = {
  easyMode: {
    choiceCount: 2,           // Fewer choices for easier discrimination
    playSpeed: 0.6,           // Slower for better perception
    repeatAllowed: 5,         // More repetitions allowed
    feedbackDelay: 4000       // Longer feedback for learning
  },
  normalMode: {
    choiceCount: 3,
    playSpeed: 0.8,
    repeatAllowed: 3,
    feedbackDelay: 3000
  },
  hardMode: {
    choiceCount: 4,
    playSpeed: 1.0,
    repeatAllowed: 2,
    feedbackDelay: 2000
  },
  nativeMode: {
    choiceCount: 4,
    playSpeed: 1.2,           // Normal native speed
    repeatAllowed: 1,         // Challenge mode
    feedbackDelay: 1500
  }
};

// Native Pronunciation Confusion Patterns (Critical for Japanese Learners)
export const COMMON_CONFUSION_PATTERNS = {
  voicing: {
    description: 'Voiced vs Voiceless Distinctions',
    pairs: [
      ['/p/', '/b/'],
      ['/t/', '/d/'],
      ['/k/', '/g/'],
      ['/f/', '/v/'],
      ['/s/', '/z/'],
      ['/θ/', '/ð/']
    ],
    difficulty: 'high'
  },
  liquid_distinction: {
    description: 'L/R Distinction (Critical for Japanese)',
    pairs: [
      ['/l/', '/r/']
    ],
    difficulty: 'extreme',
    specialFocus: true
  },
  dental_fricatives: {
    description: 'TH Sounds (No Japanese Equivalent)',
    pairs: [
      ['/θ/', '/s/'],
      ['/ð/', '/z/'],
      ['/θ/', '/f/'],
      ['/ð/', '/d/']
    ],
    difficulty: 'extreme',
    specialFocus: true
  },
  vowel_quality: {
    description: 'Vowel Quality Distinctions',
    pairs: [
      ['/ɪ/', '/iː/'],
      ['/ɛ/', '/æ/'],
      ['/ʊ/', '/uː/'],
      ['/ʌ/', '/ɑ/']
    ],
    difficulty: 'high'
  },
  vowel_reduction: {
    description: 'Schwa vs Full Vowels',
    pairs: [
      ['/ə/', '/ʌ/'],
      ['/ə/', '/ɪ/'],
      ['/ə/', '/ɛ/']
    ],
    difficulty: 'high',
    culturalNote: 'Japanese vowels are never reduced'
  }
};

// Native Phoneme Groups for Pattern Recognition
export const PHONEME_GROUPS = {
  short_vowels: {
    name: 'Short Vowels',
    description: 'Lax vowels - shorter duration',
    members: ['/ɪ/', '/ɛ/', '/æ/', '/ʌ/', '/ʊ/', '/ə/'],
    color: 'from-red-400 to-pink-500'
  },
  long_vowels: {
    name: 'Long Vowels & Diphthongs', 
    description: 'Tense vowels and diphthongs',
    members: ['/iː/', '/uː/', '/ɑ/', '/ɔ/', '/eɪ/', '/aɪ/', '/ɔɪ/', '/aʊ/', '/oʊ/'],
    color: 'from-blue-400 to-purple-500'
  },
  voiceless_plosives: {
    name: 'Voiceless Plosives',
    description: 'Aspirated stops',
    members: ['/p/', '/t/', '/k/'],
    color: 'from-green-400 to-teal-500'
  },
  voiced_plosives: {
    name: 'Voiced Plosives',
    description: 'Unaspirated stops with voicing',
    members: ['/b/', '/d/', '/g/'],
    color: 'from-emerald-400 to-green-600'
  },
  fricatives: {
    name: 'Fricatives',
    description: 'Continuous airflow sounds',
    members: ['/f/', '/v/', '/θ/', '/ð/', '/s/', '/z/', '/ʃ/', '/ʒ/', '/h/'],
    color: 'from-yellow-400 to-orange-500'
  },
  nasals: {
    name: 'Nasals',
    description: 'Nasal airflow sounds',
    members: ['/m/', '/n/', '/ŋ/'],
    color: 'from-purple-400 to-indigo-500'
  },
  liquids: {
    name: 'Liquids (L/R)',
    description: 'Critical distinction for Japanese learners',
    members: ['/l/', '/r/'],
    color: 'from-cyan-400 to-blue-600',
    specialFocus: true
  },
  glides: {
    name: 'Glides/Approximants',
    description: 'Semi-vowel sounds',
    members: ['/w/', '/j/'],
    color: 'from-indigo-400 to-purple-600'
  }
};

// Learning Path for Native Pronunciation Mastery
export const LEARNING_PATH = [
  {
    stage: 'stage1A',
    name: 'Foundation Phonemes',
    description: 'Critical sounds for Japanese learners',
    requiredMastery: 0.90,
    estimatedTime: '2-3 weeks',
    focus: 'Basic distinctions and aspiration'
  },
  {
    stage: 'stage1B',
    name: 'Critical Distinctions',
    description: 'Key phonemic contrasts',
    requiredMastery: 0.90,
    estimatedTime: '2-3 weeks',
    focus: 'Vowel quality and consonant voicing'
  },
  {
    stage: 'stage1C',
    name: 'L/R Mastery',
    description: 'Liquid distinction training',
    requiredMastery: 0.95,
    estimatedTime: '3-4 weeks',
    focus: 'Liquid consonants and velar stops'
  },
  {
    stage: 'stage2A',
    name: 'Voicing Mastery',
    description: 'Voiced/voiceless pairs',
    requiredMastery: 0.90,
    estimatedTime: '2-3 weeks',
    focus: 'Maintaining voicing throughout'
  },
  {
    stage: 'stage2B',
    name: 'TH Sound Mastery',
    description: 'Dental fricatives',
    requiredMastery: 0.95,
    estimatedTime: '3-4 weeks',
    focus: 'Most difficult sounds for Japanese'
  },
  {
    stage: 'stage2C',
    name: 'Advanced Distinctions',
    description: 'Complex vowel patterns',
    requiredMastery: 0.90,
    estimatedTime: '2-3 weeks',
    focus: 'Vowel reduction and quality'
  }
];

// Export for backwards compatibility
export const PHONEME_PROGRESSION = NATIVE_PHONEME_PROGRESSION;
export const AUDIO_MAPPING = NATIVE_AUDIO_MAPPING;