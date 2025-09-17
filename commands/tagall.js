module.exports = {
  name: "tagall",
  description: "Tags all members in a group with an optional message",
  category: "👥 Group",
  async execute(sock, m) {
    try {
      // Check if message is from a group
      const groupId = m.key.remoteJid;
      if (!groupId.endsWith("@g.us")) {
        return sock.sendMessage(groupId, { text: "❌ This command is for groups only!" });
      }

      const metadata = await sock.groupMetadata(groupId);

      // Get message text from m.message
      let text = "👋 Hello everyone!";
      if (m.message?.conversation) {
        const args = m.message.conversation.split(" ").slice(1);
        if (args.length > 0) text = args.join(" ");
      } else if (m.message?.extendedTextMessage?.text) {
        const args = m.message.extendedTextMessage.text.split(" ").slice(1);
        if (args.length > 0) text = args.join(" ");
      }

      // Get all participant IDs
      const mentions = metadata.participants.map(p => p.id);

      // Send message with mentions
      await sock.sendMessage(groupId, { text, mentions });

    } catch (err) {
      console.error("TagAll Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while executing tagall." });
    }
  }
};
