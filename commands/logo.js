const axios = require("axios");

module.exports = {
  name: "logo",
  description: "Tengeneza logo au AI image",
  async execute(sock, m, prefix = ".") {
    try {
      const from = m.key.remoteJid;
      const args = m.body.split(" ").slice(1).join(" ");
      if (!args)
        return sock.sendMessage(from, { text: "✍️ Andika maelezo ya logo au picha unayotaka!\n\nMfano:\n.logo Simba yenye taji ya dhahabu" });

      const apiKey = "5bfeb575-9bb2-4847-acf4-f32d0d3d713a"; // DeepAI API Key

      await sock.sendMessage(from, { text: "⏳ Inazalisha logo yako, subiri kidogo..." });

      const response = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: args },
        { headers: { "api-key": apiKey } }
      );

      const imageUrl = response.data.output_url;
      if (!imageUrl) return sock.sendMessage(from, { text: "❌ Samahani, haikuweza kuzalisha picha." });

      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption: `✅ Hii hapa logo/picha yako ya AI:\n\n*Maelezo:* ${args}`
      });

    } catch (err) {
      console.error("LOGO Command Error:", err.message);
      sock.sendMessage(m.key.remoteJid, { text: "⚠️ Kulikuwa na hitilafu kutengeneza picha!" });
    }
  },
};
