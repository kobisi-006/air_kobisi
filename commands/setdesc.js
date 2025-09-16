module.exports = {
  name: "setdesc",
  async execute(sock, m, args) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // Check if in group
    if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ This command only works in groups!" });

    if (!args[0]) return sock.sendMessage(from, { text: "⚠️ Use: !setdesc [new description]" });

    try {
      await sock.groupUpdateDescription(from, args.join(" "));
      await sock.sendMessage(from, { text: "✅ Group description updated successfully!" });
    } catch (e) {
      console.error("SetDesc Error:", e.message);
      await sock.sendMessage(from, { text: "❌ Failed to update group description." });
    }
  },
};
