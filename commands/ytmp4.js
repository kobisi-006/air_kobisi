const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ytmp4",
  async execute(sock, m) {
    try {
      const url = m.body.split(" ")[1];
      if (!url || !url.includes("youtube.com")) return sock.sendMessage(m.key.remoteJid, { text: "❌ Tuma YouTube link sahihi. .ytmp4 [link]" });

      const filePath = path.join(__dirname, `temp_${Date.now()}.mp4`);
      ytdl(url, { quality: "highest" }).pipe(fs.createWriteStream(filePath)).on("finish", async () => {
        await sock.sendMessage(m.key.remoteJid, { video: fs.readFileSync(filePath) });
        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-download mp4." });
    }
  }
};
