const axios = require("axios");

const PDF_API_KEY = "tlextruder@gmail.com_ZF2YdZFxCbMdJrhfb3r4HSkddQj2kWrdEsIrDRQqeH17Ujit2BVG6poy7v54GRhM";

module.exports = {
  name: "pdfMerge",
  async execute(sock, m, args) {
    if (args.length < 2) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Usage: 😂pdfmerge [url1] [url2] ..." });

    try {
      const res = await axios.post(
        "https://api.pdf.com/v1/pdf/merge",
        { urls: args },
        { headers: { "Authorization": `Bearer ${PDF_API_KEY}`, "Content-Type": "application/json" } }
      );

      await sock.sendMessage(m.key.remoteJid, { text: `✅ PDFs merged successfully!\nLink: ${res.data.pdfUrl}` });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to merge PDFs" });
    }
  }
};
