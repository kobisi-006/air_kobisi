module.exports = {
  name: "prefix",
  async execute(sock, m, args, config) {
    if (!args[0]) {
      return await sock.sendMessage(m.key.remoteJid, { text: `Usage: ${config.PREFIX}prefix 😂\nCurrent prefix: ${config.PREFIX}` });
    }
    config.PREFIX = args[0]; // Change prefix globally
    await sock.sendMessage(m.key.remoteJid, { text: `✅ Prefix changed to: ${config.PREFIX}` });
  }
};
