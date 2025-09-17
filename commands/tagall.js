module.exports = {
  name: "tagall",
  description: "Tags all members in a group with an optional message",
  category: "👥 Group",
  async execute(sock, m) {
    try {
      // Hii command ni ya group tu
      if (!m.key.remoteJid.endsWith("@g.us")) 
        return sock.sendMessage(m.key.remoteJid, { text: "❌ This command is for groups only!" });

      const groupId = m.key.remoteJid;
      const metadata = await sock.groupMetadata(groupId);

      // Custom message au default
      const args = m.body.split(" ").slice(1);
      const text = args.length > 0 ? args.join(" ") : "👋 Hello everyone!";

      // Wote participants
      const mentions = metadata.participants.map(p => p.id);

      await sock.sendMessage(groupId, { text, mentions });

    } catch (err) {
      console.error("TagAll Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while executing tagall." });
    }
  }
};
