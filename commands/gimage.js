const axios = require("axios");

module.exports = {
  name: "gimage",
  async execute(sock, m, args) {
    if (!args.length) return sock.sendMessage(m.key.remoteJid, { text: "🖼 Taja kitu cha kutafuta!\nMfano: 😂gimage Ronaldo" });
    const query = args.join(" ");
    try {
      const res = await axios.get("https://serpapi.com/search.json", {
        params: {
          q: query,
          tbm: "isch",
          api_key: "6084018373e1103ad98c592849e59eb1f0abf4a5996841a2ba78a6c9c70c9058"
        }
      });

      if (!res.data.images_results?.length) return sock.sendMessage(m.key.remoteJid, { text: "😔 Hakuna picha!" });

      const img = res.data.images_results[0].original;
      await sock.sendMessage(m.key.remoteJid, { image: { url: img }, caption: `🖼 *${query}*` });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching image!" });
    }
  }
};
