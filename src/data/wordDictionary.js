// Word dictionary for word translation stage
// Each word has: japanese (in kana), romaji, and english meaning
export const wordDictionary = [
  // Greetings
  { japanese: 'こんにちは', romaji: 'konnichiwa', english: 'hello' },
  { japanese: 'おはよう', romaji: 'ohayou', english: 'good morning' },
  { japanese: 'こんばんは', romaji: 'konbanwa', english: 'good evening' },
  { japanese: 'さようなら', romaji: 'sayounara', english: 'goodbye' },
  { japanese: 'ありがとう', romaji: 'arigatou', english: 'thank you' },
  { japanese: 'すみません', romaji: 'sumimasen', english: 'excuse me' },
  { japanese: 'ごめんなさい', romaji: 'gomennasai', english: 'sorry' },
  { japanese: 'はい', romaji: 'hai', english: 'yes' },
  { japanese: 'いいえ', romaji: 'iie', english: 'no' },
  { japanese: 'おねがいします', romaji: 'onegaishimasu', english: 'please' },

  // Numbers
  { japanese: 'いち', romaji: 'ichi', english: 'one' },
  { japanese: 'に', romaji: 'ni', english: 'two' },
  { japanese: 'さん', romaji: 'san', english: 'three' },
  { japanese: 'よん', romaji: 'yon', english: 'four' },
  { japanese: 'ご', romaji: 'go', english: 'five' },
  { japanese: 'ろく', romaji: 'roku', english: 'six' },
  { japanese: 'なな', romaji: 'nana', english: 'seven' },
  { japanese: 'はち', romaji: 'hachi', english: 'eight' },
  { japanese: 'きゅう', romaji: 'kyuu', english: 'nine' },
  { japanese: 'じゅう', romaji: 'juu', english: 'ten' },

  // Colors
  { japanese: 'あか', romaji: 'aka', english: 'red' },
  { japanese: 'あお', romaji: 'ao', english: 'blue' },
  { japanese: 'きいろ', romaji: 'kiiro', english: 'yellow' },
  { japanese: 'みどり', romaji: 'midori', english: 'green' },
  { japanese: 'しろ', romaji: 'shiro', english: 'white' },
  { japanese: 'くろ', romaji: 'kuro', english: 'black' },
  { japanese: 'オレンジ', romaji: 'orenji', english: 'orange' },
  { japanese: 'むらさき', romaji: 'murasaki', english: 'purple' },
  { japanese: 'ピンク', romaji: 'pinku', english: 'pink' },
  { japanese: 'ちゃいろ', romaji: 'chairo', english: 'brown' },

  // Animals
  { japanese: 'いぬ', romaji: 'inu', english: 'dog' },
  { japanese: 'ねこ', romaji: 'neko', english: 'cat' },
  { japanese: 'とり', romaji: 'tori', english: 'bird' },
  { japanese: 'さかな', romaji: 'sakana', english: 'fish' },
  { japanese: 'うま', romaji: 'uma', english: 'horse' },
  { japanese: 'うし', romaji: 'ushi', english: 'cow' },
  { japanese: 'ぶた', romaji: 'buta', english: 'pig' },
  { japanese: 'うさぎ', romaji: 'usagi', english: 'rabbit' },
  { japanese: 'さる', romaji: 'saru', english: 'monkey' },
  { japanese: 'ねずみ', romaji: 'nezumi', english: 'mouse' },

  // Food and Drink
  { japanese: 'みず', romaji: 'mizu', english: 'water' },
  { japanese: 'ごはん', romaji: 'gohan', english: 'rice' },
  { japanese: 'パン', romaji: 'pan', english: 'bread' },
  { japanese: 'にく', romaji: 'niku', english: 'meat' },
  { japanese: 'やさい', romaji: 'yasai', english: 'vegetable' },
  { japanese: 'くだもの', romaji: 'kudamono', english: 'fruit' },
  { japanese: 'たまご', romaji: 'tamago', english: 'egg' },
  { japanese: 'おちゃ', romaji: 'ocha', english: 'tea' },
  { japanese: 'コーヒー', romaji: 'koohii', english: 'coffee' },
  { japanese: 'ぎゅうにゅう', romaji: 'gyuunyuu', english: 'milk' },

  // Body parts
  { japanese: 'あたま', romaji: 'atama', english: 'head' },
  { japanese: 'て', romaji: 'te', english: 'hand' },
  { japanese: 'あし', romaji: 'ashi', english: 'foot' },
  { japanese: 'め', romaji: 'me', english: 'eye' },
  { japanese: 'みみ', romaji: 'mimi', english: 'ear' },
  { japanese: 'はな', romaji: 'hana', english: 'nose' },
  { japanese: 'くち', romaji: 'kuchi', english: 'mouth' },
  { japanese: 'かみ', romaji: 'kami', english: 'hair' },
  { japanese: 'からだ', romaji: 'karada', english: 'body' },
  { japanese: 'こころ', romaji: 'kokoro', english: 'heart' },

  // Nature
  { japanese: 'やま', romaji: 'yama', english: 'mountain' },
  { japanese: 'かわ', romaji: 'kawa', english: 'river' },
  { japanese: 'うみ', romaji: 'umi', english: 'sea' },
  { japanese: 'そら', romaji: 'sora', english: 'sky' },
  { japanese: 'ほし', romaji: 'hoshi', english: 'star' },
  { japanese: 'つき', romaji: 'tsuki', english: 'moon' },
  { japanese: 'ひ', romaji: 'hi', english: 'sun' },
  { japanese: 'あめ', romaji: 'ame', english: 'rain' },
  { japanese: 'ゆき', romaji: 'yuki', english: 'snow' },
  { japanese: 'かぜ', romaji: 'kaze', english: 'wind' },

  // Family
  { japanese: 'おかあさん', romaji: 'okaasan', english: 'mother' },
  { japanese: 'おとうさん', romaji: 'otousan', english: 'father' },
  { japanese: 'おにいさん', romaji: 'oniisan', english: 'older brother' },
  { japanese: 'おねえさん', romaji: 'oneesan', english: 'older sister' },
  { japanese: 'おとうと', romaji: 'otouto', english: 'younger brother' },
  { japanese: 'いもうと', romaji: 'imouto', english: 'younger sister' },
  { japanese: 'かぞく', romaji: 'kazoku', english: 'family' },
  { japanese: 'こども', romaji: 'kodomo', english: 'child' },
  { japanese: 'ともだち', romaji: 'tomodachi', english: 'friend' },
  { japanese: 'せんせい', romaji: 'sensei', english: 'teacher' },

  // Time
  { japanese: 'きょう', romaji: 'kyou', english: 'today' },
  { japanese: 'あした', romaji: 'ashita', english: 'tomorrow' },
  { japanese: 'きのう', romaji: 'kinou', english: 'yesterday' },
  { japanese: 'あさ', romaji: 'asa', english: 'morning' },
  { japanese: 'よる', romaji: 'yoru', english: 'night' },
  { japanese: 'いま', romaji: 'ima', english: 'now' },
  { japanese: 'まいにち', romaji: 'mainichi', english: 'every day' },

  // Places
  { japanese: 'いえ', romaji: 'ie', english: 'house' },
  { japanese: 'がっこう', romaji: 'gakkou', english: 'school' },
  { japanese: 'えき', romaji: 'eki', english: 'station' },
  { japanese: 'みせ', romaji: 'mise', english: 'shop' },
  { japanese: 'まち', romaji: 'machi', english: 'town' },
  { japanese: 'くに', romaji: 'kuni', english: 'country' },

  // Common words
  { japanese: 'ひと', romaji: 'hito', english: 'person' },
  { japanese: 'もの', romaji: 'mono', english: 'thing' },
  { japanese: 'ほん', romaji: 'hon', english: 'book' },
  { japanese: 'でんわ', romaji: 'denwa', english: 'telephone' },
  { japanese: 'くるま', romaji: 'kuruma', english: 'car' },
  { japanese: 'おかね', romaji: 'okane', english: 'money' },
  { japanese: 'しごと', romaji: 'shigoto', english: 'work' },
  { japanese: 'なまえ', romaji: 'namae', english: 'name' }
];

