// Badala ya:
// const ytpl = require('ytpl');

// Tumia:
const ytpl = require('@distube/ytpl');

module.exports = {
  name: "playlist",
  async execute(sock, m) {
    try {
      const query = m.body.split(" ").slice(1).join(" ");
      if (!query) return sock.sendMessage(m.key.remoteJid, { text: "❌ Andika YouTube playlist link or name. .playlist [link]" });

      const playlist = await ytpl(query, { limit: 10 }).catch(() => null);
      if (!playlist) return sock.sendMessage(m.key.remoteJid, { text: "❌ Playlist haipatikani." });

      let text = `🎵 *Playlist:* ${playlist.title}\n\n`;
      playlist.items.forEach((i, idx) => text += `• ${idx + 1}. ${i.title}\n`);

      await sock.sendMessage(m.key.remoteJid, { text });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch playlist." });
    }
  }
};
