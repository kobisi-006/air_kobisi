module.exports = {
  name: "hidetag",
  description: "🙈 Tuma message bila kuonyesha mentions",
  async execute(sock, m, args) {
    const from = m.key.remoteJid;
    if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "Group pekee!" });

    const metadata = await sock.groupMetadata(from);
    const members = metadata.participants.map(p => p.id);
    const message = args.join(" ") || "📢 (No message)";
    await sock.sendMessage(from, { text: message, mentions: members });
  },
};
