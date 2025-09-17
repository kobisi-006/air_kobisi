const fs = require("fs");
const path = require("path");

// Database kwa welcome messages na status
const welcomeDB = path.join(__dirname, "../database/welcome.json");
if (!fs.existsSync(welcomeDB)) fs.writeFileSync(welcomeDB, JSON.stringify({}));

function loadWelcome() {
  return JSON.parse(fs.readFileSync(welcomeDB, "utf-8"));
}

function saveWelcome(data) {
  fs.writeFileSync(welcomeDB, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "welcome",
  async execute(sock, m) {
    try {
      if (!m.key.remoteJid.endsWith("@g.us")) return;
      const groupId = m.key.remoteJid;
      const args = m.body.split(" ").slice(1);

      if (!args[0]) {
        return sock.sendMessage(groupId, { text: "❌ Taja action: on/off au tuma message. Mfano: .welcome on | .welcome Karibu {user}" });
      }

      const db = loadWelcome();
      const firstArg = args[0].toLowerCase();

      // Washi au Zima welcome
      if (firstArg === "on") {
        db[groupId] = db[groupId] || {};
        db[groupId].enabled = true;
        saveWelcome(db);
        return sock.sendMessage(groupId, { text: "✅ Welcome message imewashwa!" });
      }

      if (firstArg === "off") {
        db[groupId] = db[groupId] || {};
        db[groupId].enabled = false;
        saveWelcome(db);
        return sock.sendMessage(groupId, { text: "✅ Welcome message imezima!" });
      }

      // Set welcome message mpya
      const message = args.join(" ");
      db[groupId] = db[groupId] || {};
      db[groupId].message = message;
      db[groupId].enabled = true;
      saveWelcome(db);

      await sock.sendMessage(groupId, { text: `✅ Welcome message imewekwa!\n\nMessage: ${message}\n\nYou can use {user}, {group}, {memberCount}` });

    } catch (err) {
      console.error("Welcome Command Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-set welcome message." });
    }
  }
};

// Trigger function in group participant add
async function sendWelcome(sock, participant) {
  const groupId = participant.jid.split("-")[0] + "@g.us";
  const db = loadWelcome();
  if (!db[groupId] || !db[groupId].enabled) return;

  const metadata = await sock.groupMetadata(groupId);
  const user = participant.id.split("@")[0];
  const message = db[groupId].message
    .replace("{user}", `@${user}`)
    .replace("{group}", metadata.subject)
    .replace("{memberCount}", metadata.participants.length);

  await sock.sendMessage(groupId, { text: message, mentions: [participant.id] });
}

module.exports.sendWelcome = sendWelcome;
