const axios = require("axios");
const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];
const SERPAPI_KEY = "6084018373e1103ad98c592849e59eb1f0abf4a5996841a2ba78a6c9c70c9058";

module.exports = {
  name: "image",
  description: "Search Google Images and return top result",
  async execute(sock, m, args) {
    if (!args.length) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Andika neno la picha!" });

    await sock.sendMessage(m.key.remoteJid, {
      react: { key: m.key, text: randomEmojis[Math.floor(Math.random()*randomEmojis.length)] }
    });

    const query = args.join(" ");
    try {
      const res = await axios.get("https://serpapi.com/search.json", {
        params: { q: query, tbm: "isch", api_key: SERPAPI_KEY }
      });
      const first = res.data.images_results?.[0];
      if (!first) return sock.sendMessage(m.key.remoteJid, { text: "❌ Hakuna picha!" });

      await sock.sendMessage(m.key.remoteJid, { image: { url: first.original }, caption: `🖼 ${query}` });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Tatizo ku-fetch image!" });
    }
  }
};
