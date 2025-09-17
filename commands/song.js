const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  name: "song",
  async execute(sock, m) {
    try {
      const query = m.body.split(" ").slice(1).join(" ");
      if (!query) return sock.sendMessage(m.key.remoteJid, { text: "❌ Andika song name. .song Shape of You" });

      const r = await ytSearch(query);
      const video = r.videos[0];
      if (!video) return sock.sendMessage(m.key.remoteJid, { text: "❌ Video haipatikani." });

      const filePath = path.join(__dirname, `temp_${Date.now()}.mp3`);
      const stream = ytdl(video.url, { filter: "audioonly" });
      stream.pipe(fs.createWriteStream(filePath)).on("finish", async () => {
        await sock.sendMessage(m.key.remoteJid, { audio: fs.readFileSync(filePath), mimetype: "audio/mpeg" });
        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-download song." });
    }
  }
};
