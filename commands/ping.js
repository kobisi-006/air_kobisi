module.exports = {
  name: "ping",
  async execute(sock, m) {
    const start = Date.now();
    await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong..." });
    const end = Date.now();
    await sock.sendMessage(m.key.remoteJid, { text: `⏱️ Speed: ${end - start}ms` });
  }
};
