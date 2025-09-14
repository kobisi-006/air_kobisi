const fs = require("fs");
const path = require("path");
const axios = require("axios");

const STABILITY_API_KEY = "sk-GPrKV4TIpQ8DHxH5LNbwi5xEIxyVsu47r2SoZrcLjjZbmGuK";

module.exports = {
  name: "stabilitymeme",
  async execute(sock, m, args) {
    if (!args[0]) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Usage: 😂stabilitymeme [top text | bottom text]" });

    try {
      const [top, bottom] = args.join(" ").split("|").map(x => x.trim());

      const res = await axios.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/meme",
        { topText: top, bottomText: bottom },
        { headers: { "Authorization": `Bearer ${STABILITY_API_KEY}` } }
      );

      const imageBase64 = res.data.artifacts[0].base64;
      const buffer = Buffer.from(imageBase64, "base64");
      const outFile = path.join(__dirname, "stability_meme.png");
      fs.writeFileSync(outFile, buffer);

      await sock.sendMessage(m.key.remoteJid, { image: { url: outFile }, caption: `🤣 Meme generated!` });
      fs.unlinkSync(outFile);

    } catch (e) {
      console.error(e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to generate meme" });
    }
  }
};
