// Word dictionary for word translation stage
// Each word has: japanese (in kana), romaji, english meaning, and optionally kanji

// Base words that come with the app
export const baseWordDictionary = [
  // Greetings
  { japanese: 'こんにちは', romaji: 'konnichiwa', english: 'hello', kanji: '今日は' },
  { japanese: 'おはよう', romaji: 'ohayou', english: 'good morning', kanji: 'お早う' },
  { japanese: 'こんばんは', romaji: 'konbanwa', english: 'good evening', kanji: '今晩は' },
  { japanese: 'さようなら', romaji: 'sayounara', english: 'goodbye', kanji: '左様なら' },
  { japanese: 'ありがとう', romaji: 'arigatou', english: 'thank you', kanji: '有難う' },
  { japanese: 'すみません', romaji: 'sumimasen', english: 'excuse me', kanji: '済みません' },
  { japanese: 'ごめんなさい', romaji: 'gomennasai', english: 'sorry', kanji: '御免なさい' },
  { japanese: 'はい', romaji: 'hai', english: 'yes' },
  { japanese: 'いいえ', romaji: 'iie', english: 'no' },
  { japanese: 'おねがいします', romaji: 'onegaishimasu', english: 'please', kanji: 'お願いします' },

  // Numbers
  { japanese: 'いち', romaji: 'ichi', english: 'one', kanji: '一' },
  { japanese: 'に', romaji: 'ni', english: 'two', kanji: '二' },
  { japanese: 'さん', romaji: 'san', english: 'three', kanji: '三' },
  { japanese: 'よん', romaji: 'yon', english: 'four', kanji: '四' },
  { japanese: 'ご', romaji: 'go', english: 'five', kanji: '五' },
  { japanese: 'ろく', romaji: 'roku', english: 'six', kanji: '六' },
  { japanese: 'なな', romaji: 'nana', english: 'seven', kanji: '七' },
  { japanese: 'はち', romaji: 'hachi', english: 'eight', kanji: '八' },
  { japanese: 'きゅう', romaji: 'kyuu', english: 'nine', kanji: '九' },
  { japanese: 'じゅう', romaji: 'juu', english: 'ten', kanji: '十' },

  // Colors
  { japanese: 'あか', romaji: 'aka', english: 'red', kanji: '赤' },
  { japanese: 'あお', romaji: 'ao', english: 'blue', kanji: '青' },
  { japanese: 'きいろ', romaji: 'kiiro', english: 'yellow', kanji: '黄色' },
  { japanese: 'みどり', romaji: 'midori', english: 'green', kanji: '緑' },
  { japanese: 'しろ', romaji: 'shiro', english: 'white', kanji: '白' },
  { japanese: 'くろ', romaji: 'kuro', english: 'black', kanji: '黒' },
  { japanese: 'オレンジ', romaji: 'orenji', english: 'orange' },
  { japanese: 'むらさき', romaji: 'murasaki', english: 'purple', kanji: '紫' },
  { japanese: 'ピンク', romaji: 'pinku', english: 'pink' },
  { japanese: 'ちゃいろ', romaji: 'chairo', english: 'brown', kanji: '茶色' },

  // Animals
  { japanese: 'いぬ', romaji: 'inu', english: 'dog', kanji: '犬' },
  { japanese: 'ねこ', romaji: 'neko', english: 'cat', kanji: '猫' },
  { japanese: 'とり', romaji: 'tori', english: 'bird', kanji: '鳥' },
  { japanese: 'さかな', romaji: 'sakana', english: 'fish', kanji: '魚' },
  { japanese: 'うま', romaji: 'uma', english: 'horse', kanji: '馬' },
  { japanese: 'うし', romaji: 'ushi', english: 'cow', kanji: '牛' },
  { japanese: 'ぶた', romaji: 'buta', english: 'pig', kanji: '豚' },
  { japanese: 'うさぎ', romaji: 'usagi', english: 'rabbit', kanji: '兎' },
  { japanese: 'さる', romaji: 'saru', english: 'monkey', kanji: '猿' },
  { japanese: 'ねずみ', romaji: 'nezumi', english: 'mouse', kanji: '鼠' },

  // Food and Drink
  { japanese: 'みず', romaji: 'mizu', english: 'water', kanji: '水' },
  { japanese: 'ごはん', romaji: 'gohan', english: 'rice', kanji: 'ご飯' },
  { japanese: 'パン', romaji: 'pan', english: 'bread' },
  { japanese: 'にく', romaji: 'niku', english: 'meat', kanji: '肉' },
  { japanese: 'やさい', romaji: 'yasai', english: 'vegetable', kanji: '野菜' },
  { japanese: 'くだもの', romaji: 'kudamono', english: 'fruit', kanji: '果物' },
  { japanese: 'たまご', romaji: 'tamago', english: 'egg', kanji: '卵' },
  { japanese: 'おちゃ', romaji: 'ocha', english: 'tea', kanji: 'お茶' },
  { japanese: 'コーヒー', romaji: 'koohii', english: 'coffee' },
  { japanese: 'ぎゅうにゅう', romaji: 'gyuunyuu', english: 'milk', kanji: '牛乳' },

  // Body parts
  { japanese: 'あたま', romaji: 'atama', english: 'head', kanji: '頭' },
  { japanese: 'て', romaji: 'te', english: 'hand', kanji: '手' },
  { japanese: 'あし', romaji: 'ashi', english: 'foot', kanji: '足' },
  { japanese: 'め', romaji: 'me', english: 'eye', kanji: '目' },
  { japanese: 'みみ', romaji: 'mimi', english: 'ear', kanji: '耳' },
  { japanese: 'はな', romaji: 'hana', english: 'nose', kanji: '鼻' },
  { japanese: 'くち', romaji: 'kuchi', english: 'mouth', kanji: '口' },
  { japanese: 'かみ', romaji: 'kami', english: 'hair', kanji: '髪' },
  { japanese: 'からだ', romaji: 'karada', english: 'body', kanji: '体' },
  { japanese: 'こころ', romaji: 'kokoro', english: 'heart', kanji: '心' },

  // Nature
  { japanese: 'やま', romaji: 'yama', english: 'mountain', kanji: '山' },
  { japanese: 'かわ', romaji: 'kawa', english: 'river', kanji: '川' },
  { japanese: 'うみ', romaji: 'umi', english: 'sea', kanji: '海' },
  { japanese: 'そら', romaji: 'sora', english: 'sky', kanji: '空' },
  { japanese: 'ほし', romaji: 'hoshi', english: 'star', kanji: '星' },
  { japanese: 'つき', romaji: 'tsuki', english: 'moon', kanji: '月' },
  { japanese: 'ひ', romaji: 'hi', english: 'sun', kanji: '日' },
  { japanese: 'あめ', romaji: 'ame', english: 'rain', kanji: '雨' },
  { japanese: 'ゆき', romaji: 'yuki', english: 'snow', kanji: '雪' },
  { japanese: 'かぜ', romaji: 'kaze', english: 'wind', kanji: '風' },

  // Family
  { japanese: 'おかあさん', romaji: 'okaasan', english: 'mother', kanji: 'お母さん' },
  { japanese: 'おとうさん', romaji: 'otousan', english: 'father', kanji: 'お父さん' },
  { japanese: 'おにいさん', romaji: 'oniisan', english: 'older brother', kanji: 'お兄さん' },
  { japanese: 'おねえさん', romaji: 'oneesan', english: 'older sister', kanji: 'お姉さん' },
  { japanese: 'おとうと', romaji: 'otouto', english: 'younger brother', kanji: '弟' },
  { japanese: 'いもうと', romaji: 'imouto', english: 'younger sister', kanji: '妹' },
  { japanese: 'かぞく', romaji: 'kazoku', english: 'family', kanji: '家族' },
  { japanese: 'こども', romaji: 'kodomo', english: 'child', kanji: '子供' },
  { japanese: 'ともだち', romaji: 'tomodachi', english: 'friend', kanji: '友達' },
  { japanese: 'せんせい', romaji: 'sensei', english: 'teacher', kanji: '先生' },

  // Time
  { japanese: 'きょう', romaji: 'kyou', english: 'today', kanji: '今日' },
  { japanese: 'あした', romaji: 'ashita', english: 'tomorrow', kanji: '明日' },
  { japanese: 'きのう', romaji: 'kinou', english: 'yesterday', kanji: '昨日' },
  { japanese: 'あさ', romaji: 'asa', english: 'morning', kanji: '朝' },
  { japanese: 'よる', romaji: 'yoru', english: 'night', kanji: '夜' },
  { japanese: 'いま', romaji: 'ima', english: 'now', kanji: '今' },
  { japanese: 'まいにち', romaji: 'mainichi', english: 'every day', kanji: '毎日' },

  // Places
  { japanese: 'いえ', romaji: 'ie', english: 'house', kanji: '家' },
  { japanese: 'がっこう', romaji: 'gakkou', english: 'school', kanji: '学校' },
  { japanese: 'えき', romaji: 'eki', english: 'station', kanji: '駅' },
  { japanese: 'みせ', romaji: 'mise', english: 'shop', kanji: '店' },
  { japanese: 'まち', romaji: 'machi', english: 'town', kanji: '町' },
  { japanese: 'くに', romaji: 'kuni', english: 'country', kanji: '国' },

  // Common words
  { japanese: 'ひと', romaji: 'hito', english: 'person', kanji: '人' },
  { japanese: 'もの', romaji: 'mono', english: 'thing', kanji: '物' },
  { japanese: 'ほん', romaji: 'hon', english: 'book', kanji: '本' },
  { japanese: 'でんわ', romaji: 'denwa', english: 'telephone', kanji: '電話' },
  { japanese: 'くるま', romaji: 'kuruma', english: 'car', kanji: '車' },
  { japanese: 'おかね', romaji: 'okane', english: 'money', kanji: 'お金' },
  { japanese: 'しごと', romaji: 'shigoto', english: 'work', kanji: '仕事' },
  { japanese: 'なまえ', romaji: 'namae', english: 'name', kanji: '名前' }
];

// Get custom words from localStorage
export function getCustomWords() {
  try {
    const stored = localStorage.getItem('customWords');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// Save custom words to localStorage
export function saveCustomWords(words) {
  try {
    localStorage.setItem('customWords', JSON.stringify(words));
  } catch (e) {
    console.error('Failed to save custom words:', e);
  }
}

// Add a new custom word
export function addCustomWord(word) {
  const customWords = getCustomWords();
  customWords.push(word);
  saveCustomWords(customWords);
  return customWords;
}

// Remove a custom word by index
export function removeCustomWord(index) {
  const customWords = getCustomWords();
  customWords.splice(index, 1);
  saveCustomWords(customWords);
  return customWords;
}

// Get combined word dictionary (base + custom)
export function getWordDictionary() {
  return [...baseWordDictionary, ...getCustomWords()];
}

// For backward compatibility, also export as wordDictionary
// This will be the base dictionary; components should use getWordDictionary() for the full list
export const wordDictionary = baseWordDictionary;

