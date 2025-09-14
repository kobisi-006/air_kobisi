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

// ================= CONFIG =================
const PREFIX = "😂";
const BOT_NAME = "John~wick";
const OWNER_NUMBER = "0654478605";
let ANTI_LINK = true; // default ON
const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];
const warnings = {}; // store user warnings for antilink

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    markOnlineOnConnect: false,
  });

  sock.ev.on("creds.update", saveCreds);

  // ===== Manual QR handling =====
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("📱 Scan QR code above to login.");
    }
    if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
    }
    if (connection === "close") {
      console.log("❌ Connection closed");
    }
  });

  // ===== Load Commands =====
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
  fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith(".js")) {
      const command = require(path.join(commandsPath, file));
      if (command.name) commands.set(command.name, command);
      console.log(`Loaded command: ${file}`);
    }
  });

  // ===== Messages Handler =====
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    const from = m.key.remoteJid;
    const type = Object.keys(m.message)[0];
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

    // ---- Auto ViewOnce Open ----
    if (type === "viewOnceMessageV2") {
      try {
        const msg = m.message.viewOnceMessageV2.message;
        await sock.sendMessage(from, { forward: msg }, { quoted: m });
      } catch (e) {
        console.error("Error auto-opening ViewOnce:", e);
      }
    }

    // ---- Fake Recording ----
    await sock.sendPresenceUpdate("recording", from);

    // ---- Antilink ----
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

    // ---- Commands Handler ----
    if (text.startsWith(PREFIX)) {
      const args = text.slice(PREFIX.length).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();
      if (commands.has(cmd)) {
        try {
          await commands.get(cmd).execute(sock, m, args, { PREFIX, BOT_NAME, OWNER_NUMBER, ANTI_LINK, setAntilink });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // ---- Auto View Status ----
    if (m.key.remoteJid === "status@broadcast") {
      await sock.readMessages([m.key]);
      await sock.sendMessage("status@broadcast", {
        react: { key: m.key, text: randomEmojis[Math.floor(Math.random() * randomEmojis.length)] }
      });
    }
  });

  function setAntilink(value) {
    ANTI_LINK = value;
  }
}

startBot();
