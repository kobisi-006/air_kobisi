const warnings = {}; // Hii inaweza ku-shared na index.js au initalize hapa kama singleton

module.exports = {
  name: "antipornsticker",
  async execute(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // Hii command inafanya kazi tu kwenye group
    if (!from.endsWith("@g.us")) return;

    try {
      if (m.message.stickerMessage) {
        // Delete sticker
        await sock.sendMessage(from, { delete: m.key });

        // Update warn count
        warnings[sender] = (warnings[sender] || 0) + 1;

        // Send warn message
        await sock.sendMessage(from, {
          text: `||_________________/¶
||  WARN=
||  NAME=@${sender.split("@")[0]}
||  REASON=Sent porn sticker 🚫
||  COUNT WARN REMAINS=${3 - warnings[sender]}/3
|| Link deleted by BOSS GIRL TECH
|| Do not send porn stickers in this group
||________________/¶`,
          mentions: [sender],
        });

        // Kick user if reach 3 warns
        if (warnings[sender] >= 3) {
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          await sock.sendMessage(from, {
            text: `🚨 @${sender.split("@")[0]} has been removed (3 warnings)!`,
            mentions: [sender],
          });
          warnings[sender] = 0; // reset warn count
        }

        console.log(`✅ Porn sticker deleted and warn issued to ${sender}`);
      }
    } catch (e) {
      console.error("AntiPornSticker Error:", e.message);
    }
  },
};
