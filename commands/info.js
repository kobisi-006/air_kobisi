module.exports = {
  name: "info",
  async execute(sock, m, args, config) {
    const text = `
📌 *Bot Info*
Name: ${config.BOT_NAME}
Prefix: ${config.PREFIX}
Owner: ${config.OWNER_NUMBER}
`;
    await sock.sendMessage(m.key.remoteJid, { text });
  }
};
