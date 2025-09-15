module.exports = {
  name: "tagall",
  description: "📢 Tag kila mtu kwa message moja",
  async execute(sock, m) {
    const from = m.key.remoteJid;
    if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "Group pekee!" });

    const metadata = await sock.groupMetadata(from);
    const members = metadata.participants.map(p => p.id);
    const text = `📢 *Tagging All Members (${members.length})*\n\n` +
                 members.map(m => `@${m.split("@")[0]}`).join(" ");

    await sock.sendMessage(from, { text, mentions: members });
  },
};
