const fetch = require("node-fetch");

module.exports = {
  name: "say",
  alias: ["soma", "speak"],
  description: "🎙 Soma text au reply meseji kwa sauti dynamically via Google TTS URL",
  category: "voice",
  async run(m, { conn, text }) {
    try {
      let msg = m.quoted ? m.quoted.text : text;
      if (!msg) return m.reply("🎙 Andika kitu au reply meseji ili nisome!");

      // Split language code na message
      let [lang, ...words] = msg.split(" ");
      let messageToSpeak;
      const availableLangs = ["en","sw","fr","es","hi","ja","de","ru","pt","it","zh"];

      if (availableLangs.includes(lang.toLowerCase()) && words.length) {
        messageToSpeak = words.join(" ");
      } else {
        lang = "en"; // default
        messageToSpeak = msg;
      }

      // Encode URL
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(messageToSpeak)}&tl=${lang}&client=tw-ob`;

      // Fetch audio
      const res = await fetch(ttsUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(`TTS fetch failed: ${res.statusText}`);
      const buffer = await res.buffer();

      // Send audio
      await conn.sendMessage(
        m.chat,
        { audio: buffer, mimetype: "audio/mpeg", ptt: true },
        { quoted: m }
      );

    } catch (err) {
      console.error("[SAY COMMAND] Error:", err);
      m.reply("❌ Imeshindikana kusoma message: " + err.message);
    }
  }
};
