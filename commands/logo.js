const axios = require("axios");

module.exports = {
  name: "logo",
  description: "🖌 Tengeneza logo ya AI",
  async execute(sock, m, args) {
    const from = m.key.remoteJid;
    if (!args.length) return sock.sendMessage(from, { text: "🖼 Andika jina la logo!\nMfano: #logo JKT" });

    const prompt = args.join(" ") + " logo";

    try {
      const res = await axios.post(
        "https://api.deepai.org/api/text2img",
        new URLSearchParams({ text: prompt }),
        { headers: { "Api-Key": "5bfeb575-9bb2-4847-acf4-f32d0d3d713a" } } // key ndani ya command
      );

      const imageUrl = res.data.output_url;
      if (!imageUrl) throw new Error("😔 Hakuna picha!");

      await sock.sendMessage(from, { image: { url: imageUrl }, caption: `🖼 Logo yako: *${prompt}*` });
    } catch (err) {
      console.error("Logo Error:", err.message);
      await sock.sendMessage(from, { text: `❌ Hitilafu ilitokea kutengeneza logo: ${err.message}` });
    }
  }
};
