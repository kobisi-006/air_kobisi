// commands/say-en.js
const fetch = require("node-fetch");

module.exports = {
  name: "say-en",
  alias: ["say", "read"],
  description: "🎙 Reply to a message and convert to English voice",
  category: "voice",
  async run(m, { conn, text }) {
    try {
      let q = m.quoted ? m.quoted.text : text;
      if (!q) return m.reply("🎙 Reply kwa meseji au andika maneno!");

      const url = `https://api.voicerss.org/?key=${process.env.VOICE_RSS_KEY || "faa289184bed4a4aacb37620ca74c49a"}&hl=en-gb&src=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`VoiceRSS error: ${res.statusText}`);
      const buffer = await res.buffer();

      await conn.sendMessage(m.chat, { 
        audio: buffer, 
        mimetype: "audio/mpeg", 
        ptt: false 
      }, { quoted: m });

    } catch (err) {
      console.error("Say-EN Error:", err);
      m.reply("❌ Error: " + err.message);
    }
  }
};
