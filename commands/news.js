const axios = require("axios");
const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];
const SERPAPI_KEY = "6084018373e1103ad98c592849e59eb1f0abf4a5996841a2ba78a6c9c70c9058";

module.exports = {
  name: "news",
  description: "Get latest news from Google News",
  async execute(sock, m, args) {
    const query = args.join(" ") || "latest news";

    await sock.sendMessage(m.key.remoteJid, {
      react: { key: m.key, text: randomEmojis[Math.floor(Math.random()*randomEmojis.length)] }
    });

    try {
      const res = await axios.get("https://serpapi.com/search.json", {
        params: { q: query, tbm: "nws", api_key: SERPAPI_KEY }
      });
      const articles = res.data.news_results?.slice(0, 5);
      if (!articles?.length) return sock.sendMessage(m.key.remoteJid, { text: "❌ Hakuna habari!" });

      let text = "📰 *News Results:*\n\n";
      articles.forEach(a => {
        text += `*${a.title}*\n${a.snippet || ""}\n🌐 ${a.link}\n\n`;
      });
      await sock.sendMessage(m.key.remoteJid, { text });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Tatizo ku-fetch news!" });
    }
  }
};
