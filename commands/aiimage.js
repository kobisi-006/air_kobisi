const axios = require("axios");

module.exports = {
  name: "aiimage",
  description: "🎨 Tengeneza AI image au logo",
  async execute(sock, m, args) {
    const from = m.key.remoteJid;

    if (!args.length) return sock.sendMessage(from, {
      text: "🖼 Andika kitu cha kutengeneza!\nMfano: #aiimage simba amevaa miwani"
    });

    const prompt = args.join(" ");

    try {
      const res = await axios.post(
        "https://api.deepai.org/api/text2img",
        new URLSearchParams({ text: prompt }),
        { headers: { "Api-Key": "5bfeb575-9bb2-4847-acf4-f32d0d3d713a" } } // key ndani ya command
      );

      const imageUrl = res.data.output_url;
      if (!imageUrl) throw new Error("😔 Hakuna picha!");

      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption: `🖼 *${prompt}*`
      });

    } catch (err) {
      console.error("AI Image Error:", err.message);
      await sock.sendMessage(from, { text: `❌ Hitilafu ilitokea kutengeneza picha: ${err.message}` });
    }
  }
};
