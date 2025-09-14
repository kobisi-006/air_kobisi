module.exports = {
  name: "react4",
  async execute(sock, m) {
    await sock.sendMessage(m.key.remoteJid, {
      react: { key: m.key, text: "😎" }
    });
  }
};
