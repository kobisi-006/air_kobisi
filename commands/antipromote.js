const fs = require("fs");
const path = require("path");

// Database kwa antipromote status
const antiPromoteDB = path.join(__dirname, "../database/antipromote.json");
if (!fs.existsSync(antiPromoteDB)) fs.writeFileSync(antiPromoteDB, JSON.stringify({}));

function loadAntiPromote() {
  return JSON.parse(fs.readFileSync(antiPromoteDB, "utf-8"));
}

function saveAntiPromote(data) {
  fs.writeFileSync(antiPromoteDB, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "antipromote",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) return;
      const groupId = m.key.remoteJid;
      const args = m.body.split(" ").slice(1);
      const db = loadAntiPromote();

      if (!args[0]) {
        return sock.sendMessage(groupId, { text: "❌ Taja action: on/off. Mfano: .antipromote on" });
      }

      const action = args[0].toLowerCase();
      db[groupId] = db[groupId] || {};

      if (action === "on") {
        db[groupId].enabled = true;
        saveAntiPromote(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-promote imewashwa!" });
      }

      if (action === "off") {
        db[groupId].enabled = false;
        saveAntiPromote(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-promote imezima!" });
      }

      return sock.sendMessage(groupId, { text: "❌ Action sio sahihi. Taja on/off tu." });

    } catch (err) {
      console.error("AntiPromote Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea." });
    }
  }
};

// Trigger function kwenye group participant promote
async function handlePromote(sock, update) {
  const groupId = update.key.remoteJid;
  const db = loadAntiPromote();
  if (!db[groupId] || !db[groupId].enabled) return;

  const userPromoted = update.participant;
  const admins = (await sock.groupMetadata(groupId)).participants.filter(p => p.admin === "superadmin" || p.admin === "admin").map(p => p.id);

  if (!admins.includes(userPromoted)) {
    // Revoke promote
    await sock.groupDemote(groupId, [userPromoted]);
    await sock.sendMessage(groupId, { text: `❌ @${userPromoted.split("@")[0]} huna ruhusa ya kupromote!`, mentions: [userPromoted] });
  }
}

module.exports.handlePromote = handlePromote;
