//  [AIR KOBISI QUANTUM EDITION]
//  >> A superposition of elegant code states
//  >> Collapsed into optimal execution
//  >> Scripted by Air Kobisi™
//  >> Version: 8.3.5-quantum.7

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const P = require("pino");
const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ John~wick Bot is Online"));
app.listen(port, () => console.log(`Bot Web Server running on port ${port}`));

const PREFIX = "😂";
const BOT_NAME = "John~wick";
const OWNER_NUMBER = "0654478605";

let ANTI_LINK = true;
let AUTO_OPEN_VIEWONCE = true;

const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];
const warnings = {};

async function startBot() {
  const authFolder = "./session";
  if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    markOnlineOnConnect: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Scan this QR to login:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") console.log("✅ Connected to WhatsApp!");
    else if (connection === "close") {
      console.log("❌ Connection closed, reconnecting...");
      startBot();
    } else if (connection === "connecting") console.log("⏳ Connecting...");
  });

  // ===== Commands Loader =====
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
  fs.readdirSync(commandsPath).filter(f => f.endsWith(".js")).forEach(file => {
    try {
      const command = require(path.join(commandsPath, file));
      if (command.name) commands.set(command.name.toLowerCase(), command);
      console.log(`✅ Loaded command: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to load command ${file}:`, err);
    }
  });

  // ===== Messages Handler =====
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    const from = m.key.remoteJid;
    const type = Object.keys(m.message)[0];
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

    // Auto ViewOnce (toggleable)
    if (AUTO_OPEN_VIEWONCE && type === "viewOnceMessageV2") {
      try {
        const msg = m.message.viewOnceMessageV2.message;
        await sock.sendMessage(from, { forward: msg }, { quoted: m });
      } catch (e) { console.error("ViewOnce Error:", e); }
    }

    // Fake Recording Presence
    await sock.sendPresenceUpdate("recording", from);

    // Antilink (toggleable)
    if (ANTI_LINK && /https?:\/\/|wa\.me\/|chat\.whatsapp\.com|whatsapp\.com\/channel\//i.test(text)) {
      if (from.endsWith("@g.us")) {
        await sock.sendMessage(from, { delete: m.key });
        const sender = m.key.participant || m.key.remoteJid;
        warnings[sender] = (warnings[sender] || 0) + 1;

        if (warnings[sender] >= 3) {
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]} removed (3 warnings)`, mentions: [sender] });
          warnings[sender] = 0;
        } else {
          await sock.sendMessage(from, { 
            text: `⚠️ Link deleted!\n@${sender.split("@")[0]} Warning: ${warnings[sender]}/3`, 
            mentions: [sender]
          });
        }
      }
    }

    // ===== Commands Handler =====
    if (text.startsWith(PREFIX)) {
      const args = text.slice(PREFIX.length).trim().split(/ +/);
      const cmdName = args.shift().toLowerCase();

      // --- Antilink Command ---
      if (cmdName === "antilink") {
        if (!args[0]) {
          await sock.sendMessage(from, { text: `🔗 Antilink is *${ANTI_LINK ? "ON ✅" : "OFF ❌"}*\nUse: ${PREFIX}antilink on/off` });
          return;
        }
        if (args[0].toLowerCase() === "on") {
          ANTI_LINK = true;
          await sock.sendMessage(from, { text: `✅ Antilink turned ON!` });
        } else if (args[0].toLowerCase() === "off") {
          ANTI_LINK = false;
          await sock.sendMessage(from, { text: `❌ Antilink turned OFF!` });
        } else {
          await sock.sendMessage(from, { text: `⚠️ Invalid option! Use: ${PREFIX}antilink on/off` });
        }
        return;
      }

      // --- ViewOnce Command ---
      if (cmdName === "viewonce") {
        if (!args[0]) {
          await sock.sendMessage(from, { text: `👁 ViewOnce Auto-Open is *${AUTO_OPEN_VIEWONCE ? "ON ✅" : "OFF ❌"}*\nUse: ${PREFIX}viewonce on/off` });
          return;
        }
        if (args[0].toLowerCase() === "on") {
          AUTO_OPEN_VIEWONCE = true;
          await sock.sendMessage(from, { text: `✅ Auto ViewOnce turned ON!` });
        } else if (args[0].toLowerCase() === "off") {
          AUTO_OPEN_VIEWONCE = false;
          await sock.sendMessage(from, { text: `❌ Auto ViewOnce turned OFF!` });
        } else {
          await sock.sendMessage(from, { text: `⚠️ Invalid option! Use: ${PREFIX}viewonce on/off` });
        }
        return;
      }

      if (commands.has(cmdName)) {
        try {
          await commands.get(cmdName).execute(sock, m, args, { PREFIX, BOT_NAME, OWNER_NUMBER, ANTI_LINK, AUTO_OPEN_VIEWONCE });
        } catch (e) {
          console.error(`❌ Error executing command ${cmdName}:`, e);
        }
      }
    }

    // Auto View Status
    if (m.key.remoteJid === "status@broadcast") {
      await sock.readMessages([m.key]);
      await sock.sendMessage("status@broadcast", {
        react: { key: m.key, text: randomEmojis[Math.floor(Math.random() * randomEmojis.length)] }
      });
    }
  });
}

startBot();
