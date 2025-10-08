const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  description: "💎 Stylish plain text menu showing all commands",
  async execute(sock, m, prefix = ".") {
    try {
      const from = m.key.remoteJid;

      // === Load all command files except menu.js ===
      const commandsPath = path.join(__dirname);
      const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js") && file !== "menu.js");

      // === Prepare stylish menu text ===
      let menuText = "💎 *I.R.N TECH BOT Menu* 💎\n\n";
      commandFiles.forEach(file => {
        try {
          const cmd = require(path.join(commandsPath, file));
          if (cmd.name) {
            menuText += `✨ ${prefix}${cmd.name}\n`;
            menuText += `   📝 ${cmd.description || "No description"}\n\n`;
          }
        } catch (err) {
          console.error(`Error loading command ${file}:`, err.message);
        }
      });

      menuText += "⚡ Powered by Irene Tech";

      // === Send plain text menu ===
      await sock.sendMessage(from, { text: menuText });

    } catch (err) {
      console.error("Menu Command Error:", err.message);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Hitilafu imetokea kuonyesha menu." });
    }
  }
};
