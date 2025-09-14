const { writeFileSync, unlinkSync } = require("fs");
const { spawn } = require("child_process");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const path = require("path");

module.exports = {
  name: "sticker",
  async execute(sock, m) {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage && !quoted?.videoMessage) {
      return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply image/video with 😂sticker" });
    }

    const mediaType = quoted.imageMessage ? "image" : "video";
    const stream = await downloadContentFromMessage(quoted[mediaType + "Message"], mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const filePath = path.join(__dirname, `temp.${mediaType === "image" ? "jpg" : "mp4"}`);
    writeFileSync(filePath, buffer);

    const outputPath = path.join(__dirname, "sticker.webp");
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i", filePath,
        "-vf", "scale=512:512:force_original_aspect_ratio=decrease",
        "-y", outputPath
      ]);
      ffmpeg.on("close", resolve);
      ffmpeg.on("error", reject);
    });

    await sock.sendMessage(m.key.remoteJid, { sticker: { url: outputPath } });
    unlinkSync(filePath);
    unlinkSync(outputPath);
  }
};
