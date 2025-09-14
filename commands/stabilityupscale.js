const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const STABILITY_API_KEY = "sk-GPrKV4TIpQ8DHxH5LNbwi5xEIxyVsu47r2SoZrcLjjZbmGuK";

module.exports = {
  name: "stabilityupscale",
  async execute(sock, m) {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.imageMessage) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply to an image to upscale" });

    try {
      const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const res = await axios.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/upscale-image",
        buffer,
        {
          headers: {
            "Authorization": `Bearer ${STABILITY_API_KEY}`,
            "Content-Type": "application/octet-stream"
          },
          responseType: "arraybuffer"
        }
      );

      const outFile = path.join(__dirname, "stability_upscaled.png");
      fs.writeFileSync(outFile, res.data);

      await sock.sendMessage(m.key.remoteJid, { image: { url: outFile }, caption: "✅ Image upscaled!" });
      fs.unlinkSync(outFile);

    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to upscale image" });
    }
  }
};
