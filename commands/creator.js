module.exports = {
  name: "creator",
  async execute(sock, m, args, config) {
    await sock.sendMessage(m.key.remoteJid, { text: `👑 Bot Creator: ${config.OWNER_NUMBER}` });
  }
};
