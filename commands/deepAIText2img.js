const axios = require("axios");

const DEEP_AI_KEY = "5bfeb575-9bb2-4847-acf4-f32d0d3d713a";

module.exports = {
  name: "deepAIText2Img",
  async execute(sock, m, args) {
    if (!args[0]) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Usage: 😂deepaiimg [prompt]" });

    const prompt = args.join(" ");
    try {
      const res = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: prompt },
        { headers: { "Api-Key": DEEP_AI_KEY } }
      );
      const imageUrl = res.data.output_url;
      await sock.sendMessage(m.key.remoteJid, { image: { url: imageUrl }, caption: "🖼️ DeepAI Text-to-Image" });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to generate image" });
    }
  }
};
