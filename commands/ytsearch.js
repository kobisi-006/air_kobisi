const play = require("play-dl");

module.exports = {
  name: "ytsearch",
  async execute(sock, m, args) {
    if (!args.length) return sock.sendMessage(m.key.remoteJid, { text: "🔍 Taja jina la video!\nMfano: 😂ytsearch Harmonize" });

    const query = args.join(" ");
    try {
      const results = await play.search(query, { limit: 3 });
      if (!results.length) return sock.sendMessage(m.key.remoteJid, { text: "❌ Hakuna matokeo!" });

      let msg = "🎬 *YouTube Search Results:*\n\n";
      results.forEach((v, i) => {
        msg += `*${i + 1}.* ${v.title}\n👤 ${v.channel?.name}\n⏱ ${v.durationRaw} sec\n\n`;
      });

      await sock.sendMessage(m.key.remoteJid, { text: msg });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching search results!" });
    }
  }
};
