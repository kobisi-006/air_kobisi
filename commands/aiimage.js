const axios = require("axios");

// AI Image Command
module.exports = {
  name: "aiimage",
  description: "🎨 Tengeneza AI image kwa style mbalimbali (realistic, anime, cartoon, cyberpunk, 3D)",
  async execute(sock, m, prefix = ".") {
    try {
      const from = m.key.remoteJid;
      const args = m.body.split(" ").slice(1).join(" ");
      
      if (!args)
        return sock.sendMessage(from, {
          text: `✍️ Andika maelezo ya picha na style unayotaka!\n\nMfano:\n${prefix}aiimage simba mwenye taji ya dhahabu --style anime\n\n📌 Styles zinazopatikana:\n- realistic\n- anime\n- cartoon\n- cyberpunk\n- 3d`
        });

      // Tafuta style, default realistic
      let style = "realistic";
      const styleMatch = args.match(/--style\s+(\w+)/i);
      let prompt = args;
      if (styleMatch) {
        style = styleMatch[1].toLowerCase();
        prompt = args.replace(styleMatch[0], "").trim();
      }

      const apiKey = "5bfeb575-9bb2-4847-acf4-f32d0d3d713a"; // DeepAI API Key
      await sock.sendMessage(from, { text: `🎨 Inatengeneza picha yako kwa style: *${style}*...` });

      const response = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: `${prompt}, style: ${style}` },
        { headers: { "api-key": apiKey } }
      );

      const imageUrl = response.data.output_url;
      if (!imageUrl)
        return sock.sendMessage(from, { text: "❌ Samahani, haikuweza kutengeneza picha." });

      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption: `✅ *AI Image Generated!*\n\n📌 *Maelezo:* ${prompt}\n🎨 *Style:* ${style}`
      });

    } catch (err) {
      console.error("AIIMAGE Command Error:", err.message);
      sock.sendMessage(m.key.remoteJid, { text: "⚠️ Hitilafu ilitokea kutengeneza picha!" });
    }
  },
};

// ==================
// Add to your MENU
// ==================
module.exports.menu = (prefix=".") => {
  return `📌 *AI Image Generator*  
${prefix}aiimage [maelezo] --style [style]  
Mfano: ${prefix}aiimage simba mwenye taji --style anime`;
};
