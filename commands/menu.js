const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  description: "💎 Modern & stylish interactive menu (auto-loads commands)",
  async execute(sock, m, prefix = ".") {
    try {
      const from = m.key.remoteJid;

      // === Auto-load all commands from folder ===
      const commandsPath = path.join(__dirname);
      const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js") && file !== "menu.js");

      // === Organize by category ===
      const categories = {};
      for (const file of commandFiles) {
        try {
          const cmd = require(path.join(commandsPath, file));
          if (cmd.name) {
            const cat = cmd.category || "Others 💾";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push({
              title: `✨ ${prefix}${cmd.name}`,
              description: cmd.description || "No description"
            });
          }
        } catch (err) {
          console.error(`Error loading command ${file}:`, err.message);
        }
      }

      // === Build interactive sections ===
      const sections = Object.entries(categories).map(([catName, cmds]) => ({
        title: `💠 ${catName}`,
        rows: cmds
      }));

      const buttonMessage = {
        text: "💎 *I.R.N TECH BOT Menu* 💎\n\nSelect a command or category below:",
        footer: "⚡ Powered by Irene Tech",
        title: "👑 Interactive Command Menu",
        buttonText: "View Commands",
        sections
      };

      await sock.sendMessage(from, buttonMessage);

    } catch (err) {
      console.error("Menu Command Error:", err.message);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Hitilafu imetokea kuonyesha menu." });
    }
  }
};
