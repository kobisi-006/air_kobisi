module.exports = {
  name: "link",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) {
        return sock.sendMessage(m.key.remoteJid, { text: "❌ Hii command ni ya group tu!" });
      }

      const groupId = m.key.remoteJid;
      const metadata = await sock.groupMetadata(groupId);

      // Get invite code properly
      let inviteCode;
      try {
        inviteCode = await sock.groupInviteCode(groupId); // Baileys v6.x method
      } catch {
        return sock.sendMessage(groupId, { text: "⚠️ Siwezi kupata invite link ya group hii." });
      }

      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

      // Find owner or first admin
      const owner = metadata.owner || metadata.participants.find(p => p.admin)?.id;

      const text = `
📌 *Group Name:* ${metadata.subject}
👥 *Participants:* ${metadata.participants.length}
👑 *Owner:* @${owner.split("@")[0]}
🔗 *Invite Link:* ${inviteLink}
`;

      await sock.sendMessage(groupId, { text, mentions: [owner] });

    } catch (err) {
      console.error("Link Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea kupata link ya group." });
    }
  }
};
