const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const REMOVE_BG_API_KEY = "MUBrw5bSb2jiakasY3x3QzGb";

module.exports = {
  name: "removebgoverlay",
  async execute(sock, m, args) {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.imageMessage) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply to an image" });

      const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const res = await axios({
        method: "post",
        url: "https://api.remove.bg/v1.0/removebg",
        data: buffer,
        responseType: "arraybuffer",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          "Content-Type": "application/octet-stream"
        },
      });

      // Overlay custom background (example: red background)
      const overlayBuffer = await sharp(res.data)
        .composite([{ input: Buffer.from([255, 0, 0, 255]), raw: { width: 1, height: 1, channels: 4 }, tile: true }])
        .png()
        .toBuffer();

      const outFile = path.join(__dirname, "removed_overlay.png");
      fs.writeFileSync(outFile, overlayBuffer);

      await sock.sendMessage(m.key.remoteJid, { image: { url: outFile }, caption: "✅ BG removed & overlay applied!" });
      fs.unlinkSync(outFile);

    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to remove & overlay background" });
    }
  }
};
