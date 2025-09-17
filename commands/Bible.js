const axios = require("axios");

module.exports = {
  name: "bible",
  async execute(sock, m) {
    try {
      // Extract arguments (remove command name)
      const args = m.body.split(" ").slice(1).join(" ").trim();
      if (!args) {
        return sock.sendMessage(m.key.remoteJid, { text: "❌ Andika kitabu + sura:aya. Mfano: .bible John 3:16" });
      }

      // Match format: Book Chapter:Verse
      const match = args.match(/^([a-zA-Z ]+)\s+(\d+):(\d+)$/);
      if (!match) {
        return sock.sendMessage(m.key.remoteJid, { text: "❌ Format si sahihi. Mfano: .bible John 3:16" });
      }

      const [_, book, chapter, verse] = match;

      // Construct URL
      const url = `https://bible-api.com/${encodeURIComponent(book)}%20${chapter}:${verse}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data.text) {
        return sock.sendMessage(m.key.remoteJid, { text: "❌ Aya haipatikani." });
      }

      // Send verse
      const text = `📖 *${data.reference}*\n\n${data.text}`;
      await sock.sendMessage(m.key.remoteJid, { text });

    } catch (err) {
      console.error("Bible command error:", err.message);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch aya ya Biblia." });
    }
  }
};
