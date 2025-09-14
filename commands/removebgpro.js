const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const REMOVE_BG_API_KEY = "MUBrw5bSb2jiakasY3x3QzGb";

module.exports = {
  name: "removebgpro",
  async execute(sock, m, args) {
    try {
      let buffer;
      const originalFile = path.join(__dirname, "original_temp.png");
      const removedFile = path.join(__dirname, "removed_bg.png");

      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted && quoted.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
        buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      } else if (args[0] && args[0].startsWith("http")) {
        const res = await axios.get(args[0], { responseType: "arraybuffer" });
        buffer = Buffer.from(res.data, "binary");
      } else return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply image or provide URL" });

      fs.writeFileSync(originalFile, buffer);
      const compressed = await sharp(buffer).resize({ width: 1024, height: 1024, fit: 'inside' }).png().toBuffer();

      const res = await axios({
        method: "post",
        url: "https://api.remove.bg/v1.0/removebg",
        data: compressed,
        responseType: "arraybuffer",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          "Content-Type": "application/octet-stream"
        },
      });

      fs.writeFileSync(removedFile, res.data);
      await sock.sendMessage(m.key.remoteJid, { image: { url: removedFile }, caption: "✅ Background removed (Pro)!" });
      fs.unlinkSync(removedFile);
      fs.unlinkSync(originalFile);

    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to remove background" });
    }
  }
};
