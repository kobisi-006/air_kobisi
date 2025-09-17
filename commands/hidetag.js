module.exports = {
  name: "hidetag",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) 
        return sock.sendMessage(m.key.remoteJid, { text: "❌ Hii command ni ya group tu!" });

      const groupId = m.key.remoteJid;
      const metadata = await sock.groupMetadata(groupId);

      // Custom message au default
      const args = m.body.split(" ").slice(1);
      const text = args.length > 0 ? args.join(" ") : "👋 Hii ni hidden message kwa wote!";

      // Wote participants
      const mentions = metadata.participants.map(p => p.id);

      // Message inatumwa bila kuonekana na mentions
      await sock.sendMessage(groupId, { text, mentions });

    } catch (err) {
      console.error("Hidetag Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea wakati wa hidetag." });
    }
  }
};
