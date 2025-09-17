const axios = require("axios");

module.exports = {
  name: "bibleverse",
  async execute(sock, m) {
    try {
      const res = await axios.get("https://bible-api.com/random");
      const data = res.data;

      if (!data.text) return sock.sendMessage(m.key.remoteJid, { text: "❌ Tatizo limetokea kupata random verse." });

      const text = `📖 *${data.reference}*\n\n${data.text}`;
      await sock.sendMessage(m.key.remoteJid, { text });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch random verse." });
    }
  }
};
