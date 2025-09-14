const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp"); // for compressing/resizing
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const REMOVE_BG_API_KEY = "MUBrw5bSb2jiakasY3x3QzGb";

module.exports = {
  name: "removebg",
  async execute(sock, m, args) {
    try {
      let buffer;
      let originalFile = path.join(__dirname, "original_temp.png");
      let removedFile = path.join(__dirname, "removed_bg.png");

      // Case 1: reply to an image
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted && quoted.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
        buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      }
      // Case 2: URL provided as argument
      else if (args[0] && args[0].startsWith("http")) {
        const res = await axios.get(args[0], { responseType: "arraybuffer" });
        buffer = Buffer.from(res.data, "binary");
      } 
      else {
        return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply to an image or provide direct image URL: 😂removebg [url]" });
      }

      // Save original image (optional backup)
      fs.writeFileSync(originalFile, buffer);

      // Compress image before sending to remove.bg (max 2MB recommended)
      const compressed = await sharp(buffer).resize({ width: 1024, height: 1024, fit: 'inside' }).png().toBuffer();

      // Send to remove.bg API
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

      // Save removed background image
      fs.writeFileSync(removedFile, res.data);

      // Send image back
      await sock.sendMessage(m.key.remoteJid, { image: { url: removedFile }, caption: "✅ Background removed! (Pro Version)" });

      // Delete temp files
      fs.unlinkSync(removedFile);
      fs.unlinkSync(originalFile);

    } catch (error) {
      console.error(error);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to remove background. Ensure the image is valid or URL points directly to an image." });
    }
  }
};
