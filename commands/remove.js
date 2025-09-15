module.exports = {
  name: "remove",
  description: "🚫 Ondoa member kwa reply au mention",
  async execute(sock, m) {
    const from = m.key.remoteJid;
    if (!from.endsWith("@g.us")) 
      return sock.sendMessage(from, { text: "🚫 Command hii inafanya kazi group tu!" });

    // Group info na check kama admin
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    const sender = m.key.participant || m.key.remoteJid;
    const isAdmin = participants.find(p => p.id === sender)?.admin;
    if (!isAdmin) 
      return sock.sendMessage(from, { text: "⛔ Admins tu wanaweza kutoa member!" });

    // Pata target (reply au mention)
    let target;
    if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (m.message.extendedTextMessage?.contextInfo?.participant) {
      target = m.message.extendedTextMessage.contextInfo.participant;
    }

    if (!target) return sock.sendMessage(from, { text: "⚠️ Reply au tag mtu unayetaka kumtoa!" });

    // Reaction emoji
    try {
      await sock.sendMessage(from, { react: { key: m.key, text: "🦵" } });
    } catch (e) { console.log("Reaction Error:", e); }

    // Ondoa member
    try {
      await sock.groupParticipantsUpdate(from, [target], "remove");
      await sock.sendMessage(from, { 
        text: `🚫 @${target.split("@")[0]} ameondolewa na admin.`,
        mentions: [target]
      });
    } catch (e) {
      console.log("Remove Error:", e);
      await sock.sendMessage(from, { text: "❌ Imeshindikana kumtoa member!" });
    }
  }
};
