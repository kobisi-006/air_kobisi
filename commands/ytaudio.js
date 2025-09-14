const play = require("play-dl");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ytaudio",
  async execute(sock, m, args) {
    if (!args.length) {
      return sock.sendMessage(m.key.remoteJid, { 
        text: "🎶 Taja jina la wimbo!\nMfano: 😂ytaudio Harmonize Single Again"
      });
    }

    const query = args.join(" ");
    try {
      // Search video/audio
      const search = await play.search(query, { limit: 1 });
      if (!search.length) {
        return sock.sendMessage(m.key.remoteJid, { text: "😔 Hakuna matokeo!" });
      }

      const vid = search[0];

      // Tuma Info Kwanza
      let infoMsg = `*john.wick.👌-TECH SONG PLAYER*\n\n`;
      infoMsg += `╭───────────────◆\n`;
      infoMsg += `│⿻ *Title:* ${vid.title}\n`;
      infoMsg += `│⿻ *Duration:* ${vid.durationRaw}\n`;
      infoMsg += `│⿻ *Views:* ${vid.views.toLocaleString()}\n`;
      infoMsg += `│⿻ *Uploaded:* ${vid.uploadedAt}\n`;
      infoMsg += `│⿻ *Channel:* ${vid.channel?.name || "Unknown"}\n`;
      infoMsg += `╰────────────────◆\n`;

      await sock.sendMessage(m.key.remoteJid, {
        image: { url: vid.thumbnails[0].url },
        caption: infoMsg
      });

      // Download audio
      const stream = await play.stream(vid.url);
      const filePath = path.join(__dirname, `${Date.now()}.mp3`);
      const file = fs.createWriteStream(filePath);
      stream.stream.pipe(file);

      file.on("finish", async () => {
        await sock.sendMessage(m.key.remoteJid, {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
          ptt: true, // weka true kama unataka ije kama voice note
        });
        fs.unlinkSync(filePath); // futa file baada ya kutuma
      });

      file.on("error", async (err) => {
        console.error("File Error:", err);
        await sock.sendMessage(m.key.remoteJid, { text: "❌ Error downloading audio!" });
      });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching or downloading audio!" });
    }
  }
};
