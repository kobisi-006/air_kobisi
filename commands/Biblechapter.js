const axios = require("axios");

module.exports = {
  name: "biblechapter",
  async execute(sock, m) {
    try {
      const args = m.body.split(" ").slice(1).join(" ");
      if (!args) return sock.sendMessage(m.key.remoteJid, { text: "❌ Andika kitabu + sura. Mfano: .biblechapter John 3" });

      const match = args.match(/^([a-zA-Z ]+)\s+(\d+)$/);
      if (!match) return sock.sendMessage(m.key.remoteJid, { text: "❌ Format si sahihi. Mfano: .biblechapter John 3" });

      const [_, book, chapter] = match;
      const url = `https://bible-api.com/${encodeURIComponent(book)}%20${chapter}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data.verses) return sock.sendMessage(m.key.remoteJid, { text: "❌ Chapter haipatikani." });

      let text = `📖 *${book} ${chapter}*\n\n`;
      data.verses.forEach(v => {
        text += `${v.verse}. ${v.text}\n`;
      });

      await sock.sendMessage(m.key.remoteJid, { text });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch chapter." });
    }
  }
};
