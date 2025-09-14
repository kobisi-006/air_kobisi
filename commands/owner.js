module.exports = {
  name: "owner",
  async execute(sock, m, args, config) {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Bot Owner
TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:${config.OWNER_NUMBER}
END:VCARD`;
    await sock.sendMessage(m.key.remoteJid, {
      contacts: { displayName: "Bot Owner", contacts: [{ vcard }] }
    });
  }
};
