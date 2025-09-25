//  [AIR KOBISI QUANTUM EDITION]
//  >> Clean WhatsApp Bot
//  >> Version: 8.3.5-quantum.9

require("dotenv").config();
const fs = require("fs");
const os = require("os");
const axios = require("axios");
const path = require("path");
const P = require("pino");
const express = require("express");
const qrcode = require("qrcode-terminal");

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
const PREFIX = process.env.PREFIX || "#";
const BOT_NAME = "John~wick";
const OWNER_NUMBER = "255654478605";

let ANTI_LINK = true;
let ANTI_DELETE = true;
let ANTI_MENTION = true;
let AUTO_OPEN_VIEWONCE = true;
let BOT_MODE = "public";

const warnings = {};
const randomEmojis = ["🔥","😂","😎","🤩","❤️","👌","🎯","💀","🥵","👀"];
const store = {}; // Store messages for anti-delete

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

        // ==== CONNECTION HANDLER ====
        sock.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) qrcode.generate(qr, { small: true });
            if (connection === "open") console.log("✅ WhatsApp bot connected!");
            else if (connection === "close") {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    console.log("🚪 Session logged out. Delete ./session folder to re-login.");
                    process.exit(1);
                } else {
                    console.log("❌ Connection closed, reconnecting in 5s...");
                    setTimeout(startBot, 5000);
                }
            } else if (connection === "connecting") console.log("⏳ Connecting...");
        });

        // ==== KEEP ALIVE PING ====
        setInterval(async () => {
            try { await sock.sendPresenceUpdate('available'); } catch(e){};
        }, 60000);

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

        // ==== FAKE RECORDING / TYPING ====
        async function fakeAction(chatId) {
            try {
                await sock.sendPresenceUpdate("recording", chatId);
                await new Promise(r => setTimeout(r, 3000));
                await sock.sendPresenceUpdate("paused", chatId);
                await sock.sendPresenceUpdate("composing", chatId);
                await new Promise(r => setTimeout(r, 3000));
                await sock.sendPresenceUpdate("paused", chatId);
            } catch (e) { console.error("FakeAction Error:", e.message); }
        }

        // ==== MESSAGE HANDLER ====
        sock.ev.on("messages.upsert", async ({ messages }) => {
            const m = messages[0];
            if (!m.message) return;

            const from = m.key.remoteJid;
            const type = Object.keys(m.message)[0];
            const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            const sender = m.key.participant || m.key.remoteJid;
            const senderNumber = sender.replace(/[^0-9]/g, "");
            const isOwner = senderNumber === OWNER_NUMBER;

            // Store messages for anti-delete
            if (!store[from]) store[from] = {};
            store[from][m.key.id] = m;

            // ==== AUTO OPEN VIEWONCE ====
            if (AUTO_OPEN_VIEWONCE && type === "viewOnceMessageV2") {
                try {
                    const msg = m.message.viewOnceMessageV2.message;
                    await sock.sendMessage(from, { forward: msg }, { quoted: m });
                } catch (e) { console.error("ViewOnce Error:", e.message); }
            }

            // ==== AUTO VIEW STATUS ====
            if (from === "status@broadcast") {
                setTimeout(async () => {
                    try {
                        await sock.readMessages([m.key]);
                        if (randomEmojis.length > 0) {
                            await sock.sendMessage("status@broadcast", {
                                react: { key: m.key, text: randomEmojis[Math.floor(Math.random() * randomEmojis.length)] },
                            });
                        }
                    } catch (e) { console.error("Status AutoView Error:", e.message); }
                }, 500);
            }

            // ==== FAKE TYPING/RECORDING FOR EVERYONE ====
            await fakeAction(from);

            // ==== ANTI-LINK SYSTEM ====
            if (ANTI_LINK && from.endsWith("@g.us")) {
                const linkPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/|chat\.whatsapp\.com|facebook\.com\/|fb\.com\/|instagram\.com\/|youtu\.be\/|youtube\.com\/|tiktok\.com\/)/i;
                const foundLinks = text.match(linkPattern);

                if (foundLinks) {
                    setTimeout(async () => {
                        try {
                            const metadata = await sock.groupMetadata(from);
                            const participant = metadata.participants.find((p) => p.id === sender);
                            const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

                            const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                            const botParticipant = metadata.participants.find((p) => p.id === botNumber);
                            const isBotAdmin = botParticipant?.admin === "admin" || botParticipant?.admin === "superadmin";

                            if (!isBotAdmin) return sock.sendMessage(from, { text: "⚠️ I am not admin, cannot delete links." });
                            if (isOwner || isAdmin) return;

                            await sock.sendMessage(from, { delete: m.key });

                            warnings[sender] = (warnings[sender] || 0) + 1;
                            const remaining = 3 - warnings[sender];

                            const warnMsg = `
🚨 *ANTI-LINK WARNING* 🚨
👤 User: @${sender.split("@")[0]}
⚠️ Reason: Sent prohibited link
📝 Warnings: ${warnings[sender]} / 3
⏳ Remaining before removal: ${remaining}
🔗 Deleted by: *${BOT_NAME}*
                            `.trim();

                            await sock.sendMessage(from, { text: warnMsg, mentions: [sender] });

                            if (warnings[sender] >= 3) {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                warnings[sender] = 0;
                            }
                        } catch (e) { console.error("Anti-Link Error:", e.message); }
                    }, 500);
                }
            }

            // ==== ANTI-MENTION ====
            if (ANTI_MENTION && from.endsWith("@g.us") && text.includes(OWNER_NUMBER) && !isOwner) {
                await sock.sendMessage(from, {
                    text: `🚫 Do not mention my owner! @${sender.split("@")[0]}`,
                    mentions: [sender]
                });
                await sock.sendMessage(from, { delete: m.key });
            }

            // ==== COMMAND HANDLER (OWNER ONLY) ====
            if (text.startsWith(PREFIX)) {
                if (!isOwner) return sock.sendMessage(from, { text: "🚫 This bot is private. Only my owner can use commands!" }, { quoted: m });

                const args = text.slice(PREFIX.length).trim().split(/ +/);
                const cmdName = args.shift().toLowerCase();

                if (commands.has(cmdName)) {
                    try {
                        await commands.get(cmdName).execute(sock, m, args, { PREFIX, BOT_NAME, OWNER_NUMBER, ANTI_LINK, AUTO_OPEN_VIEWONCE });
                    } catch (e) {
                        console.error(`❌ Error executing command ${cmdName}:`, e.message);
                    }
                }

                // Example built-in ping command
                if (cmdName === "ping") {
                    const start = new Date().getTime();
                    await sock.sendMessage(from, { text: "⏳ Pinging..." }, { quoted: m });
                    const end = new Date().getTime();
                    await sock.sendMessage(from, { text: `🥊 Pong! Response time: *${end - start}ms* ✅` }, { quoted: m });
                }
            }
        });

        // ==== ANTI-DELETE LISTENER ====
        sock.ev.on("messages.delete", async ({ keys }) => {
            if (!ANTI_DELETE) return;
            for (const key of keys) {
                const chatId = key.remoteJid;
                const msgId = key.id;
                const deletedMsg = store[chatId]?.[msgId];
                if (deletedMsg) {
                    await sock.sendMessage(chatId, {
                        text: `♻️ *ANTI-DELETE*\n@${deletedMsg.key.participant.split("@")[0]} tried to delete:\n\n${deletedMsg.message.conversation || "[Unsupported Message]"}`,
                        mentions: [deletedMsg.key.participant]
                    });
                }
            }
        });

    } catch (err) {
        console.error("🔥 Fatal Bot Error:", err.message);
        setTimeout(startBot, 5000);
    }
}

startBot();
