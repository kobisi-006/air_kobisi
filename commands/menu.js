const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  description: "Displays a modern menu with image",
  async execute(sock, m, prefix = ".") {
    try {
      const from = m.key.remoteJid;

      // Commands folder path
      const commandsPath = path.join(__dirname);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js") && file !== "menu.js");

      // Build command list
      let commandList = "";
      for (const file of commandFiles) {
        try {
          const cmd = require(path.join(commandsPath, file));
          if (cmd.name) commandList += `🔹 ${prefix}${cmd.name} - ${cmd.description || "No description"}\n`;
        } catch (err) {
          console.error(`Error loading command ${file}:`, err);
        }
      }

      const header = `╭━━━✧★ Welcome to I.R.N Tech Bot ★✧━━━\n`;
      const footer = `\n╰━━━✧★ Powered by OMMY Tech ★✧━━━`;

      // Path ya image kwenye Ommy folder
      const imagePath = path.join(__dirname, "Ommy", "FB_IMG_1755075806264.jpg");
      if (!fs.existsSync(imagePath)) {
        return sock.sendMessage(from, { text: "⚠️ Menu image not found in Ommy folder!" });
      }

      // Send menu with image
      await sock.sendMessage(from, {
        image: { url: imagePath },
        caption: `${header}\n${commandList}${footer}`
      });

    } catch (err) {
      console.error("Menu Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching the menu." });
    }
  }
};
