const axios = require("axios");

module.exports = {
  name: "bible",
  async execute(sock, m) {
    try {
      const args = m.body.split(" ").slice(1).join(" ");
      if (!args) return sock.sendMessage(m.key.remoteJid, { text: "❌ Andika kitabu + sura:aya. Mfano: .bible John 3:16" });

      const match = args.match(/^([a-zA-Z ]+)\s+(\d+):(\d+)$/);
      if (!match) return sock.sendMessage(m.key.remoteJid, { text: "❌ Format si sahihi. Mfano: .bible John 3:16" });

      const [_, book, chapter, verse] = match;
      const url = `https://bible-api.com/${encodeURIComponent(book)}%20${chapter}:${verse}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data.text) return sock.sendMessage(m.key.remoteJid, { text: "❌ Aya haipatikani." });

      const text = `📖 *${data.reference}*\n\n${data.text}`;
      await sock.sendMessage(m.key.remoteJid, { text });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch aya ya Biblia." });
    }
  }
};
