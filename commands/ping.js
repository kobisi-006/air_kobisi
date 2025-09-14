module.exports = {
  name: "ping",
  async execute(sock, m) {
    const start = Date.now();
    const sent = await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong..." });
    const end = Date.now();
    const speed = end - start;
    await sock.sendMessage(m.key.remoteJid, { text: `⚡ Speed: ${speed}ms` }, { quoted: sent });
  }
};
