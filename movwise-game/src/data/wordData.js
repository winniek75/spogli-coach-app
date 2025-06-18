export const wordData = {
  // 韻の終わりの音ゲーム用データ
  rhymeEnding: [
    // 基本的な韻
    { word: 'cat', endingSound: 'at', rhymes: ['hat', 'bat', 'rat', 'mat', 'sat'], nonRhymes: ['dog', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'dog', endingSound: 'og', rhymes: ['log', 'fog', 'jog', 'bog', 'hog'], nonRhymes: ['cat', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'fish', endingSound: 'ish', rhymes: ['wish', 'dish', 'swish', 'fish', 'squish'], nonRhymes: ['cat', 'dog', 'bird', 'sun', 'moon'] },
    { word: 'bird', endingSound: 'ird', rhymes: ['word', 'heard', 'third', 'stirred', 'curd'], nonRhymes: ['cat', 'dog', 'fish', 'sun', 'moon'] },

    // 長母音の韻
    { word: 'cake', endingSound: 'ake', rhymes: ['bake', 'make', 'take', 'wake', 'shake'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'bike', endingSound: 'ike', rhymes: ['like', 'hike', 'strike', 'spike', 'mike'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'home', endingSound: 'ome', rhymes: ['dome', 'rome', 'foam', 'comb', 'roam'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },

    // 複合音の韻
    { word: 'chair', endingSound: 'air', rhymes: ['pair', 'fair', 'hair', 'stair', 'wear'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'bear', endingSound: 'ear', rhymes: ['pear', 'wear', 'tear', 'share', 'care'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'book', endingSound: 'ook', rhymes: ['look', 'cook', 'took', 'hook', 'brook'], nonRhymes: ['chair', 'fish', 'bird', 'sun', 'moon'] },

    // 難しい韻
    { word: 'night', endingSound: 'ight', rhymes: ['light', 'bright', 'fight', 'sight', 'tight'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'moon', endingSound: 'oon', rhymes: ['spoon', 'soon', 'tune', 'noon', 'loon'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'chair'] },
    { word: 'rain', endingSound: 'ain', rhymes: ['train', 'pain', 'gain', 'main', 'chain'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },

    // 特別な韻
    { word: 'tree', endingSound: 'ee', rhymes: ['bee', 'see', 'free', 'three', 'key'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'leaf', endingSound: 'eaf', rhymes: ['beef', 'chief', 'brief', 'thief', 'belief'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'wind', endingSound: 'ind', rhymes: ['find', 'mind', 'kind', 'blind', 'grind'], nonRhymes: ['book', 'fish', 'bird', 'sun', 'moon'] }
  ],

  // 頭韻ゲーム用データ
  alliteration: [
    // 基本的な頭韻
    { word: 'cat', initialSound: 'k', alliterations: ['car', 'cup', 'king', 'kite', 'key'], nonAlliterations: ['dog', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'dog', initialSound: 'd', alliterations: ['door', 'day', 'dance', 'deep', 'dark'], nonAlliterations: ['cat', 'fish', 'bird', 'sun', 'moon'] },
    { word: 'fish', initialSound: 'f', alliterations: ['food', 'fun', 'fly', 'fast', 'fire'], nonAlliterations: ['cat', 'dog', 'bird', 'sun', 'moon'] },
    { word: 'bird', initialSound: 'b', alliterations: ['ball', 'book', 'blue', 'big', 'busy'], nonAlliterations: ['cat', 'dog', 'fish', 'sun', 'moon'] },

    // 複合音の頭韻
    { word: 'ship', initialSound: 'sh', alliterations: ['shop', 'shoe', 'sheep', 'shell', 'shine'], nonAlliterations: ['cat', 'dog', 'fish', 'sun', 'moon'] },
    { word: 'chair', initialSound: 'ch', alliterations: ['cheese', 'child', 'church', 'chicken', 'chocolate'], nonAlliterations: ['cat', 'dog', 'fish', 'sun', 'moon'] },
    { word: 'three', initialSound: 'th', alliterations: ['think', 'thank', 'thick', 'thin', 'thing'], nonAlliterations: ['cat', 'dog', 'fish', 'sun', 'moon'] },

    // 難しい頭韻
    { word: 'queen', initialSound: 'kw', alliterations: ['quick', 'quiet', 'question', 'quality', 'quarter'], nonAlliterations: ['cat', 'dog', 'fish', 'sun', 'moon'] },
    { word: 'star', initialSound: 'st', alliterations: ['stop', 'start', 'stay', 'stone', 'storm'], nonAlliterations: ['cat', 'dog', 'fish', 'sun', 'moon'] },
    { word: 'play', initialSound: 'pl', alliterations: ['place', 'plant', 'plane', 'please', 'plenty'], nonAlliterations: ['cat', 'dog', 'fish', 'sun', 'moon'] },

    // 特別な頭韻
    { word: 'sun', initialSound: 's', alliterations: ['star', 'sky', 'sea', 'sand', 'snow'], nonAlliterations: ['cat', 'dog', 'fish', 'bird', 'moon'] },
    { word: 'moon', initialSound: 'm', alliterations: ['milk', 'man', 'map', 'music', 'mountain'], nonAlliterations: ['cat', 'dog', 'fish', 'bird', 'sun'] },
    { word: 'rain', initialSound: 'r', alliterations: ['red', 'run', 'ring', 'river', 'road'], nonAlliterations: ['cat', 'dog', 'fish', 'bird', 'sun'] }
  ]
} 