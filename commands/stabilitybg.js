const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");

const STABILITY_API_KEY = "sk-GPrKV4TIpQ8DHxH5LNbwi5xEIxyVsu47r2SoZrcLjjZbmGuK";

module.exports = {
  name: "stabilitybg",
  async execute(sock, m, args) {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.imageMessage) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply to image to replace background" });

    try {
      const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const res = await axios.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/bg-replace",
        buffer,
        {
          headers: {
            "Authorization": `Bearer ${STABILITY_API_KEY}`,
            "Content-Type": "application/octet-stream"
          },
          responseType: "arraybuffer"
        }
      );

      const outFile = path.join(__dirname, "stability_bg.png");
      fs.writeFileSync(outFile, res.data);
      await sock.sendMessage(m.key.remoteJid, { image: { url: outFile }, caption: "🌄 Background replaced!" });
      fs.unlinkSync(outFile);

    } catch (e) {
      console.error(e);
      await sock
