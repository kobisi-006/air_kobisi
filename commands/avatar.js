module.exports = {
  name: "avatar",
  async execute(sock, m) {
    try {
      const jid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.key.remoteJid;
      const url = await sock.profilePictureUrl(jid);
      await sock.sendMessage(m.key.remoteJid, { image: { url }, caption: "📸 Profile Picture" });
    } catch {
      await sock.sendMessage(m.key.remoteJid, { text: "❌ No profile picture found" });
    }
  }
};
