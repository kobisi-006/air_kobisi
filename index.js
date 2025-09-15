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
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ John~wick Bot is Online"));
app.listen(port, () => console.log(`🌐 Bot Web Server running on port ${port}`));

// ==== BOT SETTINGS ====
const PREFIX = "😂";
const BOT_NAME = "John~wick";
const OWNER_NUMBER = "255760317060"; // weka namba yako hapa

let ANTI_LINK = true;
let AUTO_OPEN_VIEWONCE = true;
let BOT_MODE = "private"; // private (only owner), public (everyone)

const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];
const warnings = {};

async function startBot() {
  try {
    const authFolder = "./session";
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: "silent" }),
      markOnlineOnConnect: true,
      browser: ["John~wick", "Chrome", "1.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📱 Scan this QR to login:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") console.log("✅ WhatsApp bot connected!");
      else if (connection === "close") {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          console.log("🚪 Session logged out. Delete ./session folder to re-login.");
          process.exit(1);
        } else {
          console.log("❌ Connection closed, reconnecting...");
          startBot();
        }
      } else if (connection === "connecting") console.log("⏳ Connecting...");
    });

    // ==== COMMANDS LOADER ====
    const commands = new Map();
    const commandsPath = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

    fs.readdirSync(commandsPath)
      .filter(f => f.endsWith(".js"))
      .forEach(file => {
        try {
          const command = require(path.join(commandsPath, file));
          if (command.name) commands.set(command.name.toLowerCase(), command);
          console.log(`✅ Loaded command: ${file}`);
        } catch (err) {
          console.error(`❌ Failed to load command ${file}:`, err.message);
        }
      });

    // ==== MESSAGE HANDLER ====
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m.message) return;

      const from = m.key.remoteJid;
      const type = Object.keys(m.message)[0];
      const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
      const sender = m.key.participant || m.key.remoteJid;
      const isOwner = sender.includes(OWNER_NUMBER);

      // Auto Open ViewOnce
      if (AUTO_OPEN_VIEWONCE && type === "viewOnceMessageV2") {
        try {
          const msg = m.message.viewOnceMessageV2.message;
          await sock.sendMessage(from, { forward: msg }, { quoted: m });
        } catch (e) {
          console.error("ViewOnce Error:", e.message);
        }
      }

      // Fake recording presence
      await sock.sendPresenceUpdate("recording", from);

      // Anti-link system
      if (ANTI_LINK && /https?:\/\/|wa\.me\/|chat\.whatsapp\.com|whatsapp\.com\/channel\//i.test(text)) {
        if (from.endsWith("@g.us")) {
          await sock.sendMessage(from, { delete: m.key });
          warnings[sender] = (warnings[sender] || 0) + 1;

          if (warnings[sender] >= 3) {
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            await sock.sendMessage(from, {
              text: `🚫 @${sender.split("@")[0]} removed (3 warnings)`,
              mentions: [sender],
            });
            warnings[sender] = 0;
          } else {
            await sock.sendMessage(from, {
              text: `⚠️ Link deleted!\n@${sender.split("@")[0]} Warning: ${warnings[sender]}/3`,
              mentions: [sender],
            });
          }
        }
      }

      // ==== COMMANDS ====
      if (text.startsWith(PREFIX)) {
        const args = text.slice(PREFIX.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();

        // Private mode check
        if (BOT_MODE === "private" && !isOwner) return;

        // BOT MODE command
        if (cmdName === "mode") {
          if (!isOwner) return sock.sendMessage(from, { text: "🚫 You are not allowed to change bot mode!" });
          if (!args[0]) {
            return sock.sendMessage(from, { text: `🤖 Current Mode: *${BOT_MODE.toUpperCase()}*\nUse: ${PREFIX}mode public/private` });
          }
          if (["public","private"].includes(args[0].toLowerCase())) {
            BOT_MODE = args[0].toLowerCase();
            return sock.sendMessage(from, { text: `✅ Bot mode set to *${BOT_MODE.toUpperCase()}*` });
          } else {
            return sock.sendMessage(from, { text: `⚠️ Invalid option! Use: ${PREFIX}mode public/private` });
          }
        }

        // Antilink toggle
        if (cmdName === "antilink") {
          if (!args[0]) {
            return sock.sendMessage(from, { text: `🔗 Antilink is *${ANTI_LINK ? "ON ✅" : "OFF ❌"}*\nUse: ${PREFIX}antilink on/off` });
          }
          ANTI_LINK = args[0].toLowerCase() === "on";
          await sock.sendMessage(from, { text: ANTI_LINK ? "✅ Antilink turned ON!" : "❌ Antilink turned OFF!" });
          return;
        }

        // ViewOnce toggle
        if (cmdName === "viewonce") {
          if (!args[0]) {
            return sock.sendMessage(from, { text: `👁 ViewOnce Auto-Open is *${AUTO_OPEN_VIEWONCE ? "ON ✅" : "OFF ❌"}*\nUse: ${PREFIX}viewonce on/off` });
          }
          AUTO_OPEN_VIEWONCE = args[0].toLowerCase() === "on";
          await sock.sendMessage(from, { text: AUTO_OPEN_VIEWONCE ? "✅ Auto ViewOnce turned ON!" : "❌ Auto ViewOnce turned OFF!" });
          return;
        }

        // AI GPT Command
        if (cmdName === "gpt") {
          if (!args.length) return sock.sendMessage(from, { text: "✍️ Andika swali mfano: 😂gpt eleza kuhusu AI" }, { quoted: m });

          await sock.sendMessage(from, { text: "🤖 Inafikiria..." }, { quoted: m });
          try {
            const response = await axios.post("http://localhost:11434/api/generate", {
              model: "mistral", // badilisha model kama unataka (llama2/gemma)
              prompt: args.join(" "),
              stream: false,
            });
            await sock.sendMessage(from, { text: "🤖 *GPT:* " + response.data.response }, { quoted: m });
          } catch (error) {
            console.error("AI Error:", error.message);
            await sock.sendMessage(from, { text: "⚠️ Samahani, AI haipatikani sasa hivi." }, { quoted: m });
          }
          return;
        }

        // Load commands folder
        if (commands.has(cmdName)) {
          try {
            await commands.get(cmdName).execute(sock, m, args, { PREFIX, BOT_NAME, OWNER_NUMBER, ANTI_LINK, AUTO_OPEN_VIEWONCE });
          } catch (e) {
            console.error(`❌ Error executing command ${cmdName}:`, e.message);
          }
        }
      }

      // Auto react status
      if (from === "status@broadcast") {
        await sock.readMessages([m.key]);
        await sock.sendMessage("status@broadcast", {
          react: { key: m.key, text: randomEmojis[Math.floor(Math.random() * randomEmojis.length)] },
        });
      }
    });
  } catch (err) {
    console.error("🔥 Fatal Bot Error:", err.message);
    setTimeout(startBot, 5000);
  }
}

startBot();


