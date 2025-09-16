const warnings = {};

module.exports = {
  name: "antibugbot",
  async execute(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    if (!from.endsWith("@g.us")) return;

    try {
      await sock.sendMessage(from, { delete: m.key });

      warnings[sender] = (warnings[sender] || 0) + 1;

      await sock.sendMessage(from, {
        text: `||_________________/¶
||  WARN=
||  NAME=@${sender.split("@")[0]}
||  REASON=Sent bug/crash message 🚫
||  COUNT WARN REMAINS=${3 - warnings[sender]}/3
|| Message deleted by BOSS GIRL TECH
|| Do not send bug messages in this group
||________________/¶`,
        mentions: [sender],
      });

      if (warnings[sender] >= 3) {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        await sock.sendMessage(from, {
          text: `🚨 @${sender.split("@")[0]} has been removed (3 warnings)!`,
          mentions: [sender],
        });
        warnings[sender] = 0;
      }

      console.log(`✅ Bug message deleted and warn issued to ${sender}`);
    } catch (e) {
      console.error("AntiBugBot Error:", e.message);
    }
  },
};
