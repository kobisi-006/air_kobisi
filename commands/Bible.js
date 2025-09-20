const axios = require("axios");

module.exports = {
  name: "bible",
  description: "📖 Tafuta aya ya Biblia",
  async execute(sock, m, prefix = ".") {
    try {
      const from = m.key.remoteJid;
      const args = m.body.split(" ").slice(1).join(" ").trim();

      if (!args)
        return sock.sendMessage(from, {
          text: `❌ Andika kitabu + sura:aya.\n\nMfano:\n${prefix}bible John 3:16`
        });

      // Match book + chapter:verse (case-insensitive, allows spaces)
      const match = args.match(/^([\w\s]+)\s+(\d+):(\d+)$/i);
      if (!match)
        return sock.sendMessage(from, {
          text: `❌ Format si sahihi.\n\nMfano:\n${prefix}bible John 3:16`
        });

      const [, book, chapter, verse] = match;
      const url = `https://bible-api.com/${encodeURIComponent(book)}%20${chapter}:${verse}`;

      const res = await axios.get(url);
      const data = res.data;

      // Check if verse exists
      if (!data || !data.text) {
        return sock.sendMessage(from, { text: "❌ Aya haikupatikana, tafadhali hakikisha umeandika vizuri." });
      }

      // Format verse with reference
      const verseText = `📖 *${data.reference}*\n\n${data.text.trim()}`;
      await sock.sendMessage(from, { text: verseText });

    } catch (err) {
      console.error("Bible Command Error:", err.message);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Samahani, tatizo limetokea ku-fetch aya ya Biblia." });
    }
  },
};
