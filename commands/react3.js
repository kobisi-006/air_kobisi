module.exports = {
  name: "react3",
  async execute(sock, m) {
    await sock.sendMessage(m.key.remoteJid, {
      react: { key: m.key, text: "❤️" }
    });
  }
};
