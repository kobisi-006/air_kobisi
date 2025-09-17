const axios = require("axios");

module.exports = {
  name: "bibleverse",
  async execute(sock, m) {
    try {
      // Bible API haina /random endpoint, hivyo tunatumia trick: 
      // tunachagua random chapter na verse kutoka Old na New Testament

      // List of popular books (Old + New Testament)
      const books = [
        "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel",
        "1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalm","Proverbs",
        "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel",
        "Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
        "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
        "Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon",
        "Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
      ];

      // Pick random book
      const book = books[Math.floor(Math.random() * books.length)];
      // Random chapter between 1-50 (approx, some books may have less)
      const chapter = Math.floor(Math.random() * 50) + 1;

      // Fetch chapter from Bible API
      const res = await axios.get(`https://bible-api.com/${book} ${chapter}`);
      const data = res.data;

      if (!data.text) return sock.sendMessage(m.key.remoteJid, { text: "❌ Tatizo limetokea kupata verse." });

      // Split verses by newline and pick random verse
      const verses = data.text.split("\n").filter(v => v.trim() !== "");
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      const text = `📖 *${book} ${chapter}*\n\n${randomVerse}`;
      await sock.sendMessage(m.key.remoteJid, { text });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch random verse." });
    }
  }
};
