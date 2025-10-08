// [BEN WHITTAKER PRIVATE AI EDITION]
// WhatsApp Bot - Powered by Gemini AI
// Version: 9.0.2-private-ai (STRICT ANTILINK + COMMAND LOADER)

require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const P = require("pino");
const express = require("express");
const qrcode = require("qrcode-terminal");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys");

// ===== BASIC CONFIG =====
const OWNER_NUMBER = "255654478605@s.whatsapp.net";
const PREFIX = "#";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let ANTI_LINK = true;
let AUTO_VIEW_STATUS = true;
let AUTO_LIKE_STATUS = true;

const randomEmojis = ["🔥","😂","😎","❤️","🤩","💯","💀","👌","🎯","🥶"];
const featureToggles = { antilink: ANTI_LINK, autoview: AUTO_VIEW_STATUS };
const warnings = {};
const store = {};

const app = express();
const port = process.env.PORT || 3000;
app.get("/", (_, res) => res.send("✅ Ben Whittaker AI Bot is Online"));
app.listen(port, () => console.log(`🌐 Server active on port ${port}`));

// ===== GEMINI FUNCTION =====
async function askGemini(prompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    const res = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Hakuna jibu kutoka Gemini.";
  } catch (err) {
    return `❌ Gemini AI Error: ${err.response?.data?.error?.message || err.message}`;
  }
}

// ===== START BOT =====
async function startBot() {
  try {
    const authDir = "./session";
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir);
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: "silent" }),
      browser: ["Ben Whittaker AI", "Chrome", "10.0"],
      printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) qrcode.generate(qr, { small: true });
      if (connection === "open") console.log("✅ Connected to WhatsApp!");
      else if (connection === "close") {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          console.log("🔴 Logged out. Delete ./session and scan again.");
          process.exit(1);
        } else {
          console.log("♻️ Reconnecting...");
          setTimeout(startBot, 5000);
        }
      }
    });

    // ===== COMMAND LOADER =====
    const commands = new Map();
    const commandsPath = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
    fs.readdirSync(commandsPath)
      .filter(f => f.endsWith(".js"))
      .forEach(file => {
        try {
          const cmd = require(path.join(commandsPath, file));
          if (cmd.name && typeof cmd.run === "function") {
            commands.set(cmd.name.toLowerCase(), cmd);
            console.log(`✅ Loaded command: ${cmd.name}`);
          }
        } catch (e) {
          console.log(`⚠️ Error loading ${file}:`, e.message);
        }
      });

    // ===== MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m.message) return;
      const from = m.key.remoteJid;
      const sender = m.key.fromMe ? OWNER_NUMBER : (m.key.participant || m.key.remoteJid);
      const text = m.message.conversation || m.message?.extendedTextMessage?.text || "";

      // OWNER-ONLY COMMANDS
      if (sender !== OWNER_NUMBER && text.startsWith(PREFIX)) {
        await sock.sendMessage(from, { text: "🚫 Huna ruhusa kutumia bot hii ya Ben Whittaker." }, { quoted: m });
        return;
      }

      // AUTO STATUS VIEW + LIKE
      if (from === "status@broadcast" && AUTO_VIEW_STATUS) {
        setTimeout(async () => {
          try {
            await sock.readMessages([m.key]);
            if (AUTO_LIKE_STATUS) {
              const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
              await sock.sendMessage("status@broadcast", { react: { key: m.key, text: emoji } });
            }
          } catch {}
        }, 500);
      }

      // STORE MESSAGES FOR ANTIDELETE
      if (!store[from]) store[from] = {};
      store[from][m.key.id] = m;

      // ===== STRICT ANTILINK =====
      if (featureToggles.antilink && from.endsWith("@g.us")) {
        try {
          const linkPattern = /(https?:\/\/[^\s]+|wa\.me\/\d+|chat\.whatsapp\.com\/[A-Za-z0-9]+|t\.me\/|instagram\.com|facebook\.com|youtube\.com|youtu\.be|tiktok\.com)/i;
          if (linkPattern.test(text)) {
            const metadata = await sock.groupMetadata(from);
            const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            const botAdmin = metadata.participants.find(p => p.id === botNumber && p.admin);
            const senderData = metadata.participants.find(p => p.id === sender);
            const senderIsAdmin = senderData?.admin;

            if (!botAdmin) return console.log("⚠️ Bot sio admin.");

            if (senderIsAdmin || sender === OWNER_NUMBER) return; // ignore admin/owner

            await sock.sendMessage(from, { delete: m.key });
            await sock.sendMessage(from, {
              text: `🚫 *LINK DETECTED!*\n@${sender.split("@")[0]} ametuma link na kufukuzwa mara moja ⚔️`,
              mentions: [sender],
            });
            await sock.groupParticipantsUpdate(from, [sender], "remove");

            await sock.sendMessage(OWNER_NUMBER, {
              text: `🚨 *STRICT ANTILINK ALERT*\n👤 Mtumaji: @${sender.split("@")[0]}\n👥 Group: ${metadata.subject}\n📎 Link imegunduliwa na kufutwa.\n⚔️ Mtumaji amefukuzwa.`,
              mentions: [sender],
            });
          }
        } catch (err) {
          console.log("❌ AntiLink Error:", err.message);
        }
      }

      // ===== COMMANDS =====
      if (text.startsWith(PREFIX)) {
        const args = text.slice(PREFIX.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        // built-in
        if (cmd === "ping") {
          await sock.sendMessage(from, { text: "🥊 Pong! Ben Whittaker AI Bot is online ✅" });
        } else if (cmd === "ai") {
          const prompt = args.join(" ");
          if (!prompt) return sock.sendMessage(from, { text: "💡 Usage: #ai <swali>" });
          const reply = await askGemini(prompt);
          await sock.sendMessage(from, { text: `🤖 *Gemini AI Reply:*\n${reply}` });
        } else if (cmd === "set") {
          const feature = (args[0] || "").toLowerCase();
          const state = (args[1] || "").toLowerCase();
          if (!featureToggles.hasOwnProperty(feature))
            return sock.sendMessage(from, { text: "⚙️ Feature haipo. Mfano: #set antilink on" });
          featureToggles[feature] = state === "on";
          await sock.sendMessage(from, { text: `✅ ${feature} imewekwa *${state.toUpperCase()}*` });
        } else if (commands.has(cmd)) {
          // loaded command from folder
          try {
            await commands.get(cmd).run(sock, m, args, from, sender);
          } catch (e) {
            await sock.sendMessage(from, { text: `❌ Error: ${e.message}` });
          }
        }
      }
    });

    // ===== ANTIDELETE =====
    sock.ev.on("messages.delete", async ({ keys }) => {
      for (const key of keys) {
        const chatId = key.remoteJid;
        const msg = store[chatId]?.[key.id];
        if (msg) {
          await sock.sendMessage(chatId, {
            text: `♻️ *Anti-Delete:* @${msg.key.participant.split("@")[0]} alijaribu kufuta:\n${msg.message.conversation || "[Unsupported]"}`,
            mentions: [msg.key.participant],
          });
        }
      }
    });

  } catch (err) {
    console.error("🔥 Fatal Error:", err.message);
    setTimeout(startBot, 5000);
  }
}

startBot();
