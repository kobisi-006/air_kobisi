// vv.js
require("dotenv").config();
let VV_FEATURE = process.env.VIEW_ONCE_UNLOCK || "on"; // default "on"

module.exports = {
  name: "vv",
  async execute(sock, m) {
    if (VV_FEATURE === "off") {
      return sock.sendMessage(m.key.remoteJid, { text: "⚠️ View-Once Unlock imezimwa na owner!" });
    }
    if (!m.message.viewOnceMessageV2) {
      return sock.sendMessage(m.key.remoteJid, { text: "❌ Hakuna View-Once message hapa!" });
    }
    await sock.sendMessage(m.key.remoteJid, m.message.viewOnceMessageV2.message);
  }
};

// Command ya kuwasha/kuzima
module.exports.config = {
  name: "vv-switch",
  async execute(sock, m) {
    const args = m.body.split(" ")[1]; // mfano: .vv-switch on / off
    if (!args || !["on","off"].includes(args.toLowerCase())) {
      return sock.sendMessage(m.key.remoteJid, { text: "🔧 Usage: .vv-switch on / off" });
    }
    VV_FEATURE = args.toLowerCase();
    process.env.VIEW_ONCE_UNLOCK = VV_FEATURE;
    await sock.sendMessage(m.key.remoteJid, { text: `✅ View-Once Unlock imewekwa: *${VV_FEATURE.toUpperCase()}*` });
  }
};
