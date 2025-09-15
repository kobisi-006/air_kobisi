module.exports = {
  name: "antimentionstatus",
  alias: ["antisdelete", "antimention"],
  description: "⚡ Auto-delete status yenye mention kwa bot/owner na report ya kila action",
  category: "admin",
  async run(m, { conn }) {
    try {
      const ownerNumber = "255654478605"; // bot owner
      const activeChats = new Set(); // track chats already notified

      m.reply("⚡ Anti-Mention Status Delete imewasha! Bot itafuta status zenye mention na kuripoti kila action.");

      // Listen for status updates
      conn.ev.on("presence.update", async (update) => {
        try {
          if (!update || !update.hasOwnProperty("statuses")) return;
          const statuses = update.statuses;

          for (const [jid, status] of Object.entries(statuses)) {
            const mentions = status.captionMentions || [];
            const isMentioned = mentions.some((num) => num.includes(ownerNumber));

            if (isMentioned) {
              console.log(`[ANTIMENTIONSTATUS] Deleting status from ${jid} with mentions`);
              
              // Delete status
              await conn.statusUpdate({ delete: [status.id] });

              // Prepare report message
              const reportMsg = `✅ Auto-deleted status kutoka ${jid}\nCaption: ${status.text || "No caption"}\nMentions: ${mentions.join(", ")}`;

              // Notify owner
              await conn.sendMessage(
                ownerNumber + "@s.whatsapp.net",
                { text: reportMsg }
              );

              // Optionally notify group / chat once
              if (!activeChats.has(jid)) {
                await conn.sendMessage(
                  jid,
                  { text: `⚡ Status yenye mention imefuta automagically!` }
                );
                activeChats.add(jid);
              }
            }
          }
        } catch (err) {
          console.error("[ANTIMENTIONSTATUS] Listener Error:", err);
        }
      });

    } catch (err) {
      console.error("[ANTIMENTIONSTATUS] Command Error:", err);
      m.reply("❌ Hitilafu wakati wa activating Anti-Mention Status Delete: " + err.message);
    }
  }
};
