const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ytmp3",
  async execute(sock, m) {
    try {
      const url = m.body.split(" ")[1];
      if (!url || !url.includes("youtube.com")) return sock.sendMessage(m.key.remoteJid, { text: "❌ Tuma YouTube link sahihi. .ytmp3 [link]" });

      const info = await ytdl.getInfo(url);
      const filePath = path.join(__dirname, `temp_${Date.now()}.mp3`);
      ytdl(url, { filter: "audioonly" }).pipe(fs.createWriteStream(filePath)).on("finish", async () => {
        await sock.sendMessage(m.key.remoteJid, { audio: fs.readFileSync(filePath), mimetype: "audio/mpeg" });
        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-download mp3." });
    }
  }
};
