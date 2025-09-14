const axios = require("axios");
const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];
const SERPAPI_KEY = "6084018373e1103ad98c592849e59eb1f0abf4a5996841a2ba78a6c9c70c9058";

module.exports = {
  name: "weather",
  description: "Get current weather for a location",
  async execute(sock, m, args) {
    if (!args.length) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Andika jiji!" });

    await sock.sendMessage(m.key.remoteJid, {
      react: { key: m.key, text: randomEmojis[Math.floor(Math.random()*randomEmojis.length)] }
    });

    const location = args.join(" ");
    try {
      const res = await axios.get("https://serpapi.com/search.json", {
        params: { q: `weather in ${location}`, api_key: SERPAPI_KEY }
      });
      const info = res.data.weather;
      if (!info) return sock.sendMessage(m.key.remoteJid, { text: "❌ Hakuna info ya weather!" });

      const text = `☁️ Weather in ${location}:\n🌡 Temp: ${info.temperature}\n💧 Humidity: ${info.humidity}\n🌬 Wind: ${info.wind}`;
      await sock.sendMessage(m.key.remoteJid, { text });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Tatizo ku-fetch weather!" });
    }
  }
};
