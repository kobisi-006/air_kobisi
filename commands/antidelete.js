const fs = require("fs");
const path = require("path");

// Database kwa antidelete
const dbPath = path.join(__dirname, "../database/antidelete.json");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "antidelete",
  description: "Enable or disable anti-delete for group messages",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) 
        return sock.sendMessage(m.key.remoteJid, { text: "❌ This command is for groups only!" });

      const groupId = m.key.remoteJid;
      const args = m.body.split(" ").slice(1);
      const db = loadDB();
      db[groupId] = db[groupId] || {};

      if (!args[0]) 
        return sock.sendMessage(groupId, { text: "❌ Usage: .antidelete on/off" });

      const state = args[0].toLowerCase();
      if (state === "on") {
        db[groupId].enabled = true;
        saveDB(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-Delete is now ENABLED!" });
      } else if (state === "off") {
        db[groupId].enabled = false;
        saveDB(db);
        return sock.sendMessage(groupId, { text: "✅ Anti-Delete is now DISABLED!" });
      } else {
        return sock.sendMessage(groupId, { text: "❌ Usage: .antidelete on/off" });
      }
    } catch (err) {
      console.error("AntiDelete Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong with Anti-Delete." });
    }
  }
};

// Function triggered automatically on message deletion
module.exports.checkDeleted = async function(sock, m) {
  try {
    if (!m.key.remoteJid.endsWith("@g.us") || !m.message?.protocolMessage?.type) return;

    const groupId = m.key.remoteJid;
    const db = loadDB();
    if (!db[groupId]?.enabled) return;

    const deletedMessageKey = m.message.protocolMessage.key;
    const deletedMessage = await sock.loadMessage(deletedMessageKey.remoteJid, deletedMessageKey.id, deletedMessageKey.participant);

    if (deletedMessage) {
      const senderId = deletedMessageKey.participant || deletedMessageKey.remoteJid;
      const content = deletedMessage.message;
      await sock.sendMessage(groupId, {
        text: `⚠️ @${senderId.split("@")[0]} tried to delete a message, but Anti-Delete is ENABLED!\n\nMessage:\n${JSON.stringify(content)}`,
        mentions: [senderId]
      });
    }
  } catch (err) {
    console.error("CheckDeleted Error:", err);
  }
};
