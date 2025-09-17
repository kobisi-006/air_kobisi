const os = require("os");
module.exports = {
  name: "uptime",
  async execute(sock, m) {
    let uptime = os.uptime();
    let hours = Math.floor(uptime / 3600);
    let minutes = Math.floor((uptime % 3600) / 60);
    await sock.sendMessage(m.key.remoteJid, { text: `⏳ Uptime: ${hours}h ${minutes}m` });
  }
};
