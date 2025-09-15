module.exports = {
  name: "mute",
  description: "🔇 Funga group (admins only can message)",
  async execute(sock, m) {
    const from = m.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    await sock.groupSettingUpdate(from, "announcement");
    await sock.sendMessage(from, { text: "🔇 Group limefungwa (Admins only)" });
  },
};
