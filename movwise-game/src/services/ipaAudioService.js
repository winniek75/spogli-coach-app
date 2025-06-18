// src/services/ipaAudioService.js
class IPAAudioService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.loadVoices();
    
    // IPA音素とカテゴリの定義
    this.phonemeData = {
      // 母音 (Vowels)
      vowels: {
        '/æ/': { letter: 'a', word: 'cat', ipa: 'æ' },
        '/eɪ/': { letter: 'a', word: 'cake', ipa: 'eɪ' },
        '/ɑː/': { letter: 'a', word: 'car', ipa: 'ɑː' },
        '/e/': { letter: 'e', word: 'bed', ipa: 'e' },
        '/iː/': { letter: 'e', word: 'see', ipa: 'iː' },
        '/ɪ/': { letter: 'i', word: 'sit', ipa: 'ɪ' },
        '/aɪ/': { letter: 'i', word: 'bike', ipa: 'aɪ' },
        '/ɒ/': { letter: 'o', word: 'hot', ipa: 'ɒ' },
        '/əʊ/': { letter: 'o', word: 'home', ipa: 'əʊ' },
        '/ʌ/': { letter: 'u', word: 'cup', ipa: 'ʌ' },
        '/uː/': { letter: 'u', word: 'moon', ipa: 'uː' },
        '/ʊ/': { letter: 'u', word: 'book', ipa: 'ʊ' }
      },
      
      // 重母音 (Diphthongs)
      diphthongs: {
        '/aɪ/': { letter: 'ai', word: 'rain', ipa: 'aɪ' },
        '/aʊ/': { letter: 'au', word: 'house', ipa: 'aʊ' },
        '/ɔɪ/': { letter: 'oy', word: 'boy', ipa: 'ɔɪ' },
        '/eə/': { letter: 'air', word: 'hair', ipa: 'eə' },
        '/ɪə/': { letter: 'ear', word: 'near', ipa: 'ɪə' },
        '/ʊə/': { letter: 'ure', word: 'sure', ipa: 'ʊə' }
      },
      
      // 子音 (Consonants)
      consonants: {
        '/b/': { letter: 'b', word: 'ball', ipa: 'b' },
        '/k/': { letter: 'c', word: 'cat', ipa: 'k' },
        '/d/': { letter: 'd', word: 'dog', ipa: 'd' },
        '/f/': { letter: 'f', word: 'fish', ipa: 'f' },
        '/g/': { letter: 'g', word: 'go', ipa: 'g' },
        '/h/': { letter: 'h', word: 'hat', ipa: 'h' },
        '/dʒ/': { letter: 'j', word: 'jump', ipa: 'dʒ' },
        '/l/': { letter: 'l', word: 'love', ipa: 'l' },
        '/m/': { letter: 'm', word: 'man', ipa: 'm' },
        '/n/': { letter: 'n', word: 'new', ipa: 'n' },
        '/p/': { letter: 'p', word: 'pen', ipa: 'p' },
        '/r/': { letter: 'r', word: 'red', ipa: 'r' },
        '/s/': { letter: 's', word: 'sun', ipa: 's' },
        '/t/': { letter: 't', word: 'top', ipa: 't' },
        '/v/': { letter: 'v', word: 'very', ipa: 'v' },
        '/w/': { letter: 'w', word: 'water', ipa: 'w' },
        '/j/': { letter: 'y', word: 'yes', ipa: 'j' },
        '/z/': { letter: 'z', word: 'zoo', ipa: 'z' }
      },
      
      // ダイグラフ (Digraphs)
      digraphs: {
        '/tʃ/': { letter: 'ch', word: 'chair', ipa: 'tʃ' },
        '/ʃ/': { letter: 'sh', word: 'ship', ipa: 'ʃ' },
        '/θ/': { letter: 'th', word: 'think', ipa: 'θ' },
        '/ð/': { letter: 'th', word: 'this', ipa: 'ð' },
        '/hw/': { letter: 'wh', word: 'what', ipa: 'hw' },
        '/ŋ/': { letter: 'ng', word: 'sing', ipa: 'ŋ' },
        '/f/': { letter: 'ph', word: 'phone', ipa: 'f' }
      }
    };
  }
  
  // 音声エンジンの初期化
  loadVoices() {
    this.voices = this.synthesis.getVoices();
    
    // 英語ネイティブ音声の優先選択
    this.preferredVoice = this.voices.find(voice => 
      voice.lang.startsWith('en-') && voice.name.includes('Google')
    ) || this.voices.find(voice => 
      voice.lang.startsWith('en-')
    ) || this.voices[0];
  }
  
  // IPA音素の再生
  playPhoneme(phoneme, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance();
      
      // IPA記号に基づく発音調整
      utterance.text = this.getPhonemeText(phoneme);
      utterance.voice = this.preferredVoice;
      utterance.rate = options.rate || 0.8; // ゆっくり
      utterance.pitch = options.pitch || 1.2; // 少し高め
      utterance.volume = options.volume || 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);
      
      this.synthesis.speak(utterance);
    });
  }
  
  // 単語全体の再生
  playWord(word, options = {}) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = word;
      utterance.voice = this.preferredVoice;
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);
      
      this.synthesis.speak(utterance);
    });
  }
  
  // IPA記号を実際の発音テキストに変換
  getPhonemeText(phoneme) {
    // より正確な発音のためのマッピング
    const phonemeMap = {
      '/æ/': 'ah',
      '/eɪ/': 'ay',
      '/ɑː/': 'ah',
      '/e/': 'eh',
      '/iː/': 'ee',
      '/ɪ/': 'ih',
      '/aɪ/': 'eye',
      '/ɒ/': 'oh',
      '/əʊ/': 'oh',
      '/ʌ/': 'uh',
      '/uː/': 'oo',
      '/ʊ/': 'oo',
      '/aʊ/': 'ow',
      '/ɔɪ/': 'oy',
      '/θ/': 'th',
      '/ð/': 'th',
      '/ʃ/': 'sh',
      '/tʃ/': 'ch',
      '/dʒ/': 'j',
      '/ŋ/': 'ng'
    };
    
    return phonemeMap[phoneme] || phoneme.replace(/[\/]/g, '');
  }
  
  // カテゴリ別音素取得
  getPhonemesByCategory(category) {
    return this.phonemeData[category] || {};
  }
  
  // 全カテゴリ取得
  getAllCategories() {
    return Object.keys(this.phonemeData);
  }
  
  // ランダム音素選択（ゲーム用）
  getRandomPhoneme(category = null) {
    if (category) {
      const categoryData = this.phonemeData[category];
      const phonemes = Object.keys(categoryData);
      const randomKey = phonemes[Math.floor(Math.random() * phonemes.length)];
      return { phoneme: randomKey, data: categoryData[randomKey] };
    } else {
      const allPhonemes = [];
      Object.values(this.phonemeData).forEach(category => {
        Object.entries(category).forEach(([phoneme, data]) => {
          allPhonemes.push({ phoneme, data });
        });
      });
      return allPhonemes[Math.floor(Math.random() * allPhonemes.length)];
    }
  }
  
  // 複数の選択肢生成（3択問題用）
  generateChoices(correctPhoneme, category = null, count = 3) {
    const choices = [correctPhoneme];
    const usedPhonemes = new Set([correctPhoneme.phoneme]);
    
    while (choices.length < count) {
      const randomPhoneme = this.getRandomPhoneme(category);
      if (!usedPhonemes.has(randomPhoneme.phoneme)) {
        choices.push(randomPhoneme);
        usedPhonemes.add(randomPhoneme.phoneme);
      }
    }
    
    // シャッフル
    return choices.sort(() => Math.random() - 0.5);
  }
}

// シングルトンパターンでエクスポート
export const ipaAudioService = new IPAAudioService();

// Vue 3 Plugin として使用する場合
export default {
  install(app) {
    app.config.globalProperties.$ipaAudio = ipaAudioService;
    app.provide('ipaAudio', ipaAudioService);
  }
};