const fs = require("fs");
const path = require("path");

// Database kwa antidemote status
const antiDemoteDB = path.join(__dirname, "../database/antidemote.json");
if (!fs.existsSync(antiDemoteDB)) fs.writeFileSync(antiDemoteDB, JSON.stringify({}));

function loadAntiDemote() {
  return JSON.parse(fs.readFileSync(antiDemoteDB, "utf-8"));
}

function saveAntiDemote(data) {
  fs.writeFileSync(antiDemoteDB, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "antidemote",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) return;
      const groupId = m.key.remoteJid;
      const args = m.body.split(" ").slice(1);
      const db = loadAntiDemote();

      if (!args[0]) {
        return sock.sendMessage(groupId, { text: "❌ Taja action: on/off. Mfano: .antidemote on" });
      }

      const action = args[0].toLowerCase();
      db[groupId] = db[groupId] || {};

      if (action === "on") {
        db[groupId].enabled = true;
        saveAntiDemote(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-demote imewashwa!" });
      }

      if (action === "off") {
        db[groupId].enabled = false;
        saveAntiDemote(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-demote imezima!" });
      }

      return sock.sendMessage(groupId, { text: "❌ Action sio sahihi. Taja on/off tu." });

    } catch (err) {
      console.error("AntiDemote Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea." });
    }
  }
};

// Trigger function kwenye group participant demote
async function handleDemote(sock, update) {
  const groupId = update.key.remoteJid;
  const db = loadAntiDemote();
  if (!db[groupId] || !db[groupId].enabled) return;

  const userDemoted = update.participant;
  const admins = (await sock.groupMetadata(groupId)).participants.filter(p => p.admin === "superadmin" || p.admin === "admin").map(p => p.id);

  if (!admins.includes(userDemoted)) {
    // Revoke demote
    await sock.groupPromote(groupId, [userDemoted]);
    await sock.sendMessage(groupId, { text: `❌ @${userDemoted.split("@")[0]} huna ruhusa ya kudemote!`, mentions: [userDemoted] });
  }
}

module.exports.handleDemote = handleDemote;
