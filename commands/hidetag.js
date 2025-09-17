module.exports = {
  name: "hidetag",
  description: "Send a hidden message tagging all members in the group",
  category: "👥 Group",
  async execute(sock, m) {
    try {
      const groupId = m.key.remoteJid;
      if (!groupId.endsWith("@g.us")) {
        return sock.sendMessage(groupId, { text: "❌ Hii command ni ya group tu!" });
      }

      const metadata = await sock.groupMetadata(groupId);

      // Get message text safely
      let text = "👋 Hii ni hidden message kwa wote!";
      if (m.message?.conversation) {
        const args = m.message.conversation.split(" ").slice(1);
        if (args.length > 0) text = args.join(" ");
      } else if (m.message?.extendedTextMessage?.text) {
        const args = m.message.extendedTextMessage.text.split(" ").slice(1);
        if (args.length > 0) text = args.join(" ");
      }

      // All participants IDs
      const mentions = metadata.participants.map(p => p.id);

      // Send hidden tag message
      await sock.sendMessage(groupId, {
        text,
        contextInfo: { mentionedJid: mentions }
      });

    } catch (err) {
      console.error("Hidetag Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea wakati wa hidetag." });
    }
  }
};
