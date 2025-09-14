const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const REMOVE_BG_API_KEY = "MUBrw5bSb2jiakasY3x3QzGb";

module.exports = {
  name: "removebgbatch",
  async execute(sock, m, args) {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.imageMessage) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply multiple images" });

      const buffers = [];
      const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
      buffers.push(buf);

      for (let i = 0; i < buffers.length; i++) {
        const res = await axios({
          method: "post",
          url: "https://api.remove.bg/v1.0/removebg",
          data: buffers[i],
          responseType: "arraybuffer",
          headers: {
            "X-Api-Key": REMOVE_BG_API_KEY,
            "Content-Type": "application/octet-stream"
          },
        });
        const outFile = path.join(__dirname, `removed_bg_${i}.png`);
        fs.writeFileSync(outFile, res.data);
        await sock.sendMessage(m.key.remoteJid, { image: { url: outFile }, caption: `✅ Removed BG ${i + 1}` });
        fs.unlinkSync(outFile);
      }

    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to remove background(s)" });
    }
  }
};
