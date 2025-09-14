const axios = require("axios");

const PDF_API_KEY = "tlextruder@gmail.com_ZF2YdZFxCbMdJrhfb3r4HSkddQj2kWrdEsIrDRQqeH17Ujit2BVG6poy7v54GRhM";

module.exports = {
  name: "pdfSplit",
  async execute(sock, m, args) {
    if (args.length < 2) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Usage: 😂pdfsplit [pdfUrl] [pages e.g., 1-3]" });

    const pdfUrl = args[0];
    const pages = args[1];

    try {
      const res = await axios.post(
        "https://api.pdf.com/v1/pdf/split",
        { url: pdfUrl, pages },
        { headers: { "Authorization": `Bearer ${PDF_API_KEY}`, "Content-Type": "application/json" } }
      );

      await sock.sendMessage(m.key.remoteJid, { text: `✅ PDF split successfully!\nLink: ${res.data.pdfUrl}` });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to split PDF" });
    }
  }
};
