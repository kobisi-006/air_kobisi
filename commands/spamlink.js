module.exports = {
  name: "spamlink",
  async execute(sock, m, args) {
    // Angalia kama mm ndiye mmiliki
    const OWNER_NUMBER = "0654478605"; // badilisha na namba yako
    const sender = m.key.participant || m.key.remoteJid;
    if (!sender.includes(OWNER_NUMBER)) {
      return sock.sendMessage(m.key.remoteJid, { text: "❌ Huna ruhusa ya kutumia command hii!" });
    }

    // Pata link kutoka kwenye meseji
    let link = args[0]; // mm anaandika link moja baada ya command
    if (!link) {
      return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Andika linki moja!\nMfano: 😂spamlink https://example.com" });
    }

    const count = 30; // idadi ya repeats
    const delay = 1000; // 1 second kati ya kila send

    await sock.sendMessage(m.key.remoteJid, { text: `✅ Kutuma link: ${link} mara ${count}` });

    for (let i = 1; i <= count; i++) {
      await sock.sendMessage(m.key.remoteJid, { text: `${i}. ${link}` });
      await new Promise(r => setTimeout(r, delay));
    }

    await sock.sendMessage(m.key.remoteJid, { text: "✅ Kumaliza kutuma link mara 30." });
  }
};
