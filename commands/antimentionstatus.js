const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../database/antimentionstatus.json");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const MAX_WARNINGS = 3; // Baada ya warnings 3, user anafutwa au block

module.exports = {
  name: "antimentionstatus",
  description: "Enable/Disable automatic deletion of mentions in group with smart warnings",
  async execute(sock, m, OWNER_NUMBER) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us"))
        return sock.sendMessage(m.key.remoteJid, { text: "❌ Command hii ni ya magroup tu!" });

      const groupId = m.key.remoteJid;
      const args = m.body.split(" ").slice(1);
      const db = loadDB();
      db[groupId] = db[groupId] || { enabled: false, warnings: {} };

      if (!args[0])
        return sock.sendMessage(groupId, { text: "❌ Usage: #antimentionstatus on/off" });

      const state = args[0].toLowerCase();
      if (state === "on") {
        db[groupId].enabled = true;
        saveDB(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-Mention Status imewashwa kwa group hii!" });
      } else if (state === "off") {
        db[groupId].enabled = false;
        saveDB(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-Mention Status imezimwa kwa group hii!" });
      } else {
        return sock.sendMessage(groupId, { text: "❌ Usage: #antimentionstatus on/off" });
      }
    } catch (err) {
      console.error("AntiMentionStatus Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limejitokeza." });
    }
  }
};

// ==== Automatic delete mentions in group with warnings ====
module.exports.checkGroupMentions = async function(sock, m, OWNER_NUMBER) {
  try {
    if (!m.key.remoteJid.endsWith("@g.us")) return;

    const from = m.key.remoteJid;
    const sender = m.key.participant;
    const db = loadDB();
    if (!db[from]?.enabled) return;

    // Get group metadata
    const metadata = await sock.groupMetadata(from);
    const participant = metadata.participants.find(p => p.id === sender);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

    // Skip if sender is admin or owner
    if (isAdmin || sender.includes(OWNER_NUMBER)) return;

    // Check mentions
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentioned?.length > 0) {
      db[from].warnings[sender] = (db[from].warnings[sender] || 0) + 1;
      const userWarnings = db[from].warnings[sender];
      const remaining = MAX_WARNINGS - userWarnings;

      // Delete message
      await sock.sendMessage(from, { delete: m.key });

      // Send warning
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split("@")[0]} umejaribu kutaja mtu!\n📝 Warning: ${userWarnings}/${MAX_WARNINGS}\n⏳ Remaining before removal: ${remaining}`,
        mentions: [sender]
      });

      // Remove user after reaching max warnings
      if (userWarnings >= MAX_WARNINGS) {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        await sock.sendMessage(from, {
          text: `❌ @${sender.split("@")[0]} amefutwa kutoka group (warnings ${MAX_WARNINGS})`,
          mentions: [sender]
        });
        db[from].warnings[sender] = 0; // reset after removal
      }

      saveDB(db);
    }
  } catch (err) {
    console.error("checkGroupMentions Error:", err);
  }
};
