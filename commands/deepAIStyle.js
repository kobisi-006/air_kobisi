const axios = require("axios");

const DEEP_AI_KEY = "5bfeb575-9bb2-4847-acf4-f32d0d3d713a";

module.exports = {
  name: "deepAIStyle",
  async execute(sock, m, args) {
    if (args.length < 2) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Usage: 😂deepaistyle [imageUrl] [styleUrl]" });

    const imageUrl = args[0];
    const styleUrl = args[1];

    try {
      const res = await axios.post(
        "https://api.deepai.org/api/style-transfer",
        { content: imageUrl, style: styleUrl },
        { headers: { "Api-Key": DEEP_AI_KEY } }
      );
      await sock.sendMessage(m.key.remoteJid, { image: { url: res.data.output_url }, caption: "🎨 DeepAI Style Transfer" });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to apply style" });
    }
  }
};
