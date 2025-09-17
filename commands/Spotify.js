const axios = require("axios");

module.exports = {
  name: "spotify",
  async execute(sock, m) {
    try {
      const query = m.body.split(" ").slice(1).join(" ");
      if (!query) return sock.sendMessage(m.key.remoteJid, { text: "❌ Andika song or album name. .spotify Blinding Lights" });

      const res = await axios.get(`https://spotify-api-wrapper.vercel.app/spotify/search?query=${encodeURIComponent(query)}`);
      const data = res.data.tracks.items[0];
      if (!data) return sock.sendMessage(m.key.remoteJid, { text: "❌ Song haipatikani." });

      await sock.sendMessage(m.key.remoteJid, {
        image: { url: data.album.images[0].url },
        caption: `🎵 *${data.name}*\n👤 Artist: ${data.artists[0].name}\n💿 Album: ${data.album.name}\n🔗 Preview: ${data.preview_url || "Not Available"}`
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch Spotify data." });
    }
  }
};
