const fs = require("fs");
const path = require("path");

// Database kwa goodbye messages na status
const goodbyeDB = path.join(__dirname, "../database/goodbye.json");
if (!fs.existsSync(goodbyeDB)) fs.writeFileSync(goodbyeDB, JSON.stringify({}));

function loadGoodbye() {
  return JSON.parse(fs.readFileSync(goodbyeDB, "utf-8"));
}

function saveGoodbye(data) {
  fs.writeFileSync(goodbyeDB, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "goodbye",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) return;
      const groupId = m.key.remoteJid;
      const args = m.body.split(" ").slice(1);

      if (!args[0]) {
        return sock.sendMessage(groupId, { text: "❌ Taja action: on/off au tuma message. Mfano: .goodbye on | .goodbye Kwaheri {user}" });
      }

      const db = loadGoodbye();
      const firstArg = args[0].toLowerCase();

      // Washi au Zima goodbye
      if (firstArg === "on") {
        db[groupId] = db[groupId] || {};
        db[groupId].enabled = true;
        saveGoodbye(db);
        return sock.sendMessage(groupId, { text: "✅ Goodbye message imewashwa!" });
      }

      if (firstArg === "off") {
        db[groupId] = db[groupId] || {};
        db[groupId].enabled = false;
        saveGoodbye(db);
        return sock.sendMessage(groupId, { text: "✅ Goodbye message imezima!" });
      }

      // Set goodbye message mpya
      const message = args.join(" ");
      db[groupId] = db[groupId] || {};
      db[groupId].message = message;
      db[groupId].enabled = true;
      saveGoodbye(db);

      await sock.sendMessage(groupId, { text: `✅ Goodbye message imewekwa!\n\nMessage: ${message}\n\nYou can use {user}, {group}, {memberCount}` });

    } catch (err) {
      console.error("Goodbye Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-set goodbye message." });
    }
  }
};

// Trigger function in group participant remove
async function sendGoodbye(sock, participant) {
  const groupId = participant.jid.split("-")[0] + "@g.us";
  const db = loadGoodbye();
  if (!db[groupId] || !db[groupId].enabled) return;

  const metadata = await sock.groupMetadata(groupId);
  const user = participant.id.split("@")[0];
  const message = db[groupId].message
    .replace("{user}", `@${user}`)
    .replace("{group}", metadata.subject)
    .replace("{memberCount}", metadata.participants.length);

  await sock.sendMessage(groupId, { text: message, mentions: [participant.id] });
}

module.exports.sendGoodbye = sendGoodbye;
