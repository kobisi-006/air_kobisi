const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { downloadContentFromMessage, prepareWAMessageMedia, generateForwardMessageContent } = require("@whiskeysockets/baileys");

const REMOVE_BG_API_KEY = "MUBrw5bSb2jiakasY3x3QzGb";

module.exports = {
  name: "removebgsticker",
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

      const outFile = path.join(__dirname, "removed_sticker.png");
      fs.writeFileSync(outFile, res.data);

      const media = await prepareWAMessageMedia({ image: fs.readFileSync(outFile) }, { upload: sock.waUploadToServer });
      await sock.sendMessage(m.key.remoteJid, { sticker: media.image });

      fs.unlinkSync(outFile);

    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to create sticker" });
    }
  }
};
