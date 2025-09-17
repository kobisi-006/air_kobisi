const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "lyrics",
  async execute(sock, m) {
    try {
      const query = m.body.split(" ").slice(1).join(" ");
      if (!query) return sock.sendMessage(m.key.remoteJid, { text: "❌ Andika jina la wimbo. .lyrics Shape of You" });

      const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl);
      const hits = searchRes.data.response.sections[0]?.hits;
      if (!hits || hits.length === 0) return sock.sendMessage(m.key.remoteJid, { text: "❌ Lyrics hazipatikani." });

      const song = hits[0].result;
      const htmlRes = await axios.get(song.url);
      const $ = cheerio.load(htmlRes.data);
      const lyrics = $("div[data-lyrics-container='true']").map((i, el) => $(el).text()).get().join("\n");

      if (!lyrics) return sock.sendMessage(m.key.remoteJid, { text: "❌ Lyrics hazipatikani." });

      let output = lyrics.length > 4000 ? lyrics.slice(0, 4000) + "\n\n... [Lyrics zimekata]" : lyrics;

      await sock.sendMessage(m.key.remoteJid, { 
        image: { url: song.song_art_image_thumbnail_url },
        caption: `🎵 *${song.full_title}*\n👤 Artist: ${song.primary_artist.name}\n\n${output}`
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Tatizo limetokea ku-fetch lyrics." });
    }
  }
};
