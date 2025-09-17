const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  description: "Displays a categorized modern menu with image",
  async execute(sock, m, prefix = ".") {
    try {
      const from = m.key.remoteJid;

      // Image path
      const imagePath = path.join(__dirname, "Ommy", "FB_IMG_1755075806264.jpg");
      if (!fs.existsSync(imagePath)) {
        return sock.sendMessage(from, { text: "⚠️ Menu image not found in Ommy folder!" });
      }

      // Commands folder
      const commandsPath = path.join(__dirname);
      const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js") && file !== "menu.js");

      // Categories object
      const categories = {
        "🖥️ General": [],
        "🔍 Search": [],
        "🎵 Music": [],
        "👥 Group": [],
        "🎮 Games": [],
        "⚙️ Settings": [],
        "🛠️ Tools": [],
        "🎨 Fun": [],
        "💾 Utility": [],
        "📁 Others": []
      };

      // Populate categories
      for (const file of commandFiles) {
        try {
          const cmd = require(path.join(commandsPath, file));
          if (cmd.name) {
            // Assign category (if cmd.category exists) or Others
            const cat = cmd.category && categories[cmd.category] ? cmd.category : "📁 Others";
            categories[cat].push(`🔹 ${prefix}${cmd.name} - ${cmd.description || "No description"}`);
          }
        } catch (err) {
          console.error(`Error loading command ${file}:`, err);
        }
      }

      // Build message
      let menuText = `╭━━━✧★ Welcome to I.R.N Tech Bot ★✧━━━\n`;
      for (const [catName, cmds] of Object.entries(categories)) {
        if (cmds.length > 0) {
          menuText += `\n╭━━━❂ ${catName} ❂━━━\n`;
          menuText += cmds.join("\n");
          menuText += `\n╰━━━━━━━━━━━━\n`;
        }
      }
      menuText += `\n╰━━━✧★ Powered by Irene Tech ★✧━━━`;

      // Send menu with image
      await sock.sendMessage(from, {
        image: { url: imagePath },
        caption: menuText
      });

    } catch (err) {
      console.error("Menu Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching the menu." });
    }
  }
};
