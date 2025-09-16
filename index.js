//  [AIR KOBISI QUANTUM EDITION]
//  >> Clean WhatsApp Bot
//  >> Version: 8.3.5-quantum.7

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const P = require("pino");
const express = require("express");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const { getLinkPreview } = require('link-preview-js');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
} = require("@whiskeysockets/baileys");

const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Bot is Online"));
app.listen(port, () => console.log(`🌐 Web Server running on port ${port}`));

// ==== BOT SETTINGS ====
const PREFIX = process.env.PREFIX || "!";
const BOT_NAME = "John~wick";
const OWNER_NUMBER = process.env.OWNER_NUMBER || "255654478605";

let ANTI_LINK = true;
let AUTO_OPEN_VIEWONCE = true;
let BOT_MODE = "private";
const warnings = {};
const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];

// ==== START BOT ====
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
            browser: [BOT_NAME, "Chrome", "1.0"],
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

        // ==== LOAD COMMANDS ====
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

            // ==== AUTO OPEN VIEWONCE ====
            if (AUTO_OPEN_VIEWONCE && type === "viewOnceMessageV2") {
                try {
                    const msg = m.message.viewOnceMessageV2.message;
                    await sock.sendMessage(from, { forward: msg }, { quoted: m });
                } catch (e) {
                    console.error("ViewOnce Error:", e.message);
                }
            }

            // ==== AUTO VIEW STATUS ====
            try {
                if (from === "status@broadcast" || from.endsWith("@g.us")) {
                    await sock.readMessages([m.key]);
                    if (randomEmojis.length > 0) {
                        await sock.sendMessage("status@broadcast", {
                            react: { key: m.key, text: randomEmojis[Math.floor(Math.random() * randomEmojis.length)] },
                        });
                    }
                }
            } catch (e) {
                console.error("Status AutoView Error:", e.message);
            }

            // ==== ANTI-LINK SYSTEM WITH PREVIEW ====
            if (ANTI_LINK && from.endsWith("@g.us")) {
                const linkPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/|chat\.whatsapp\.com|facebook\.com\/|fb\.com\/|instagram\.com\/|youtu\.be\/|youtube\.com\/|tiktok\.com\/)/i;
                const foundLinks = text.match(linkPattern);

                if (foundLinks) {
                    await sock.sendMessage(from, { delete: m.key });

                    // Try get preview
                    let previewText = '';
                    try {
                        const preview = await getLinkPreview(foundLinks[0]);
                        const imgUrl = preview.images && preview.images[0] ? preview.images[0] : null;
                        previewText = `🔗 Link Preview:\nTitle: ${preview.title || 'N/A'}\nDescription: ${preview.description || 'N/A'}\nURL: ${preview.url || foundLinks[0]}`;
                        if (imgUrl) {
                            await sock.sendMessage(from, { image: { url: imgUrl }, caption: previewText });
                        } else {
                            await sock.sendMessage(from, { text: previewText });
                        }
                    } catch (e) {
                        previewText = `🔗 Link detected: ${foundLinks[0]}`;
                        await sock.sendMessage(from, { text: previewText });
                    }

                    // Update warnings
                    warnings[sender] = (warnings[sender] || 0) + 1;
                    const remaining = 3 - warnings[sender];

                    const warnMsg = `
||_________________/¶
||  WARN = ${warnings[sender]}
||  NAME = @${sender.split("@")[0]}
||  REASON = Link sent in group
||  COUNT WARN REMAINS = ${remaining}
||  link deleted by irenloven tech
||  do not send Links in this group
||by BOSS GIRL TECH
||________________/¶
                    `.trim();

                    await sock.sendMessage(from, { text: warnMsg, mentions: [sender] });

                    if (warnings[sender] >= 3) {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        await sock.sendMessage(from, {
                            text: `🚫 @${sender.split("@")[0]} removed (3 warnings)`,
                            mentions: [sender],
                        });
                        warnings[sender] = 0;
                    }
                }
            }

            // ==== COMMANDS ====
            if (text.startsWith(PREFIX)) {
                const args = text.slice(PREFIX.length).trim().split(/ +/);
                const cmdName = args.shift().toLowerCase();

                if (BOT_MODE === "private" && !isOwner) return;

                // Built-in ping
                if (cmdName === "ping") {
                    const start = new Date().getTime();
                    await sock.sendMessage(from, { text: "⏳ Pinging..." }, { quoted: m });
                    const end = new Date().getTime();
                    return sock.sendMessage(from, { text: `🥊 Pong! Response time: *${end - start}ms* ✅` }, { quoted: m });
                }

                // BOT MODE toggle
                if (cmdName === "mode") {
                    if (!isOwner) return sock.sendMessage(from, { text: "🚫 You cannot change bot mode!" });
                    if (!args[0]) return sock.sendMessage(from, { text: `🤖 Current Mode: *${BOT_MODE.toUpperCase()}*\nUse: ${PREFIX}mode public/private` });
                    if (["public","private"].includes(args[0].toLowerCase())) {
                        BOT_MODE = args[0].toLowerCase();
                        return sock.sendMessage(from, { text: `✅ Bot mode set to *${BOT_MODE.toUpperCase()}*` });
                    } else {
                        return sock.sendMessage(from, { text: `⚠️ Invalid option! Use: ${PREFIX}mode public/private` });
                    }
                }

                // ANTI LINK toggle
                if (cmdName === "antilink") {
                    if (!args[0]) return sock.sendMessage(from, { text: `🔗 Antilink is *${ANTI_LINK ? "ON ✅" : "OFF ❌"}*\nUse: ${PREFIX}antilink on/off` });
                    ANTI_LINK = args[0].toLowerCase() === "on";
                    await sock.sendMessage(from, { text: ANTI_LINK ? "✅ Antilink turned ON!" : "❌ Antilink turned OFF!" });
                    return;
                }

                // Load commands from folder
                if (commands.has(cmdName)) {
                    try {
                        await commands.get(cmdName).execute(sock, m, args, { PREFIX, BOT_NAME, OWNER_NUMBER, ANTI_LINK, AUTO_OPEN_VIEWONCE });
                    } catch (e) {
                        console.error(`❌ Error executing command ${cmdName}:`, e.message);
                    }
                }
            }
        });
    } catch (err) {
        console.error("🔥 Fatal Bot Error:", err.message);
        setTimeout(startBot, 5000);
    }
}

startBot();
