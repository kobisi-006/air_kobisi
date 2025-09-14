const axios = require("axios");

const PDF_API_KEY = "tlextruder@gmail.com_ZF2YdZFxCbMdJrhfb3r4HSkddQj2kWrdEsIrDRQqeH17Ujit2BVG6poy7v54GRhM";

module.exports = {
  name: "pdfConvert",
  async execute(sock, m, args) {
    if (!args[0]) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Usage: 😂pdfconvert [text]" });

    const text = args.join(" ");
    try {
      const res = await axios.post(
        "https://api.pdf.com/v1/pdf/create",
        { content: text },
        { headers: { "Authorization": `Bearer ${PDF_API_KEY}`, "Content-Type": "application/json" } }
      );

      await sock.sendMessage(m.key.remoteJid, { text: `✅ PDF generated successfully!\nLink: ${res.data.pdfUrl}` });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to generate PDF" });
    }
  }
};
