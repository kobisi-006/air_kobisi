const warnings = {};

module.exports = {
  name: "antimentionstatus",
  async execute(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    if (from === "status@broadcast") {
      try {
        await sock.sendMessage("status@broadcast", { delete: m.key });

        warnings[sender] = (warnings[sender] || 0) + 1;

        await sock.sendMessage("status@broadcast", {
          text: `||_________________/¶
||  WARN=
||  NAME=@${sender.split("@")[0]}
||  REASON=Mention in status 🚫
||  COUNT WARN REMAINS=${3 - warnings[sender]}/3
|| Status mention deleted by BOSS GIRL TECH
|| Do not mention in status
||________________/¶`,
          mentions: [sender],
        });

        console.log(`✅ Status mention deleted and warn issued to ${sender}`);
      } catch (e) {
        console.error("AntiMentionStatus Error:", e.message);
      }
    }
  },
};
