module.exports = {
  name: "unmute",
  description: "🔊 Fungua group (kila mtu anaweza message)",
  async execute(sock, m) {
    const from = m.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    await sock.groupSettingUpdate(from, "not_announcement");
    await sock.sendMessage(from, { text: "🔊 Group limefunguliwa (Wote wanaweza message)" });
  },
};
