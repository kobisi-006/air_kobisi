module.exports = {
  name: "warn",
  description: "⚠️ Toa onyo kwa member (mention au reply)",
  async execute(sock, m, args) {
    const from = m.key.remoteJid;
    if (!from.endsWith("@g.us")) 
      return sock.sendMessage(from, { text: "⚠️ Command hii ni ya group pekee!" });

    // Check kama admin
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    const sender = m.key.participant || m.key.remoteJid;
    const isAdmin = participants.find(p => p.id === sender)?.admin;
    if (!isAdmin) 
      return sock.sendMessage(from, { text: "🚫 Admins tu wanaweza kutoa warn." });

    // Pata target (reply au mention)
    let target;
    if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (m.message.extendedTextMessage?.contextInfo?.participant) {
      target = m.message.extendedTextMessage.contextInfo.participant;
    }

    if (!target) return sock.sendMessage(from, { text: "⚠️ Reply message au tag mtu wa kutoa warn!" });

    // React na emoji
    try {
      await sock.sendMessage(from, { react: { key: m.key, text: "⚠️" } });
    } catch (e) { console.log("Reaction Error:", e); }

    // Tuma message ya warn
    await sock.sendMessage(from, { 
      text: `⚠️ @${target.split("@")[0]} umepata ONYO!`,
      mentions: [target]
    });
  }
};
