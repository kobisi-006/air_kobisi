const fs = require("fs");
const path = require("path");

// Database path
const dbPath = path.join(__dirname, "../database/antimentionstatus.json");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "antimentionstatus",
  description: "Turn ON/OFF automatic deletion of status mentions",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) 
        return sock.sendMessage(m.key.remoteJid, { text: "❌ This command is for groups only!" });

      const groupId = m.key.remoteJid;
      const args = m.body.split(" ").slice(1);
      const db = loadDB();
      db[groupId] = db[groupId] || {};

      if (!args[0]) 
        return sock.sendMessage(groupId, { text: "❌ Usage: .antimentionstatus on/off" });

      const state = args[0].toLowerCase();
      if (state === "on") {
        db[groupId].enabled = true;
        saveDB(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-Mention Status is now ENABLED!" });
      } else if (state === "off") {
        db[groupId].enabled = false;
        saveDB(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-Mention Status is now DISABLED!" });
      } else {
        return sock.sendMessage(groupId, { text: "❌ Usage: .antimentionstatus on/off" });
      }
    } catch (err) {
      console.error("AntiMentionStatus Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong with Anti-Mention Status." });
    }
  }
};

// Automatic check for status mentions
module.exports.checkStatusMentions = async function(sock, m) {
  try {
    if (!m.key.remoteJid.endsWith("@status")) return;

    const sender = m.key.participant;
    const db = loadDB();
    const groupId = m.key.remoteJid.split("-")[0] + "@g.us";

    if (!db[groupId]?.enabled) return;

    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentioned?.length > 0) {
      // Notify sender and delete status
      await sock.sendMessage(sender, { text: "⚠️ Your status containing mentions has been deleted because Anti-Mention Status is ENABLED!" });
      await sock.sendMessage(m.key.remoteJid, { delete: m.key });
    }
  } catch (err) {
    console.error("CheckStatusMentions Error:", err);
  }
};
