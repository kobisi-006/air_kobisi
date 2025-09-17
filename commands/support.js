module.exports = {
  name: "payment",
  async execute(sock, m) {
    await sock.sendMessage(m.key.remoteJid, { text: "💳 Payment Number: 255624236654" });
  }
};
