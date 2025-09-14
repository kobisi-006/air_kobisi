const play = require("play-dl");

module.exports = {
  name: "ytvideo",
  async execute(sock, m, args) {
    if (!args.length) return sock.sendMessage(m.key.remoteJid, { text: "🎬 Taja jina la video!\nMfano: 😂ytvideo Harmonize" });
    
    const query = args.join(" ");
    try {
      const results = await play.search(query, { limit: 1 });
      if (!results.length) return sock.sendMessage(m.key.remoteJid, { text: "❌ Hakuna matokeo!" });
      
      const video = results[0];
      const streamInfo = await play.stream(video.url);

      await sock.sendMessage(m.key.remoteJid, {
        video: streamInfo.stream,
        mimetype: "video/mp4",
        fileName: `${video.title}.mp4`,
        caption: `🎬 *${video.title}*\n👤 ${video.channel?.name}\n⏱ ${video.durationRaw} sec`
      });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching or downloading video!" });
    }
  }
};
