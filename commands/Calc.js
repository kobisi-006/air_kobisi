module.exports = {
  name: "calc",
  async execute(sock, m, args) {
    const from = m.key.remoteJid;
    if (!args[0]) return sock.sendMessage(from, { text: "⚠️ Use: !calc [expression]" });

    try {
      // Only allow safe characters
      const expression = args.join(" ");
      if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
        return sock.sendMessage(from, { text: "❌ Invalid characters in expression!" });
      }
      const result = eval(expression);
      await sock.sendMessage(from, { text: `🧮 Result: ${result}` });
    } catch {
      await sock.sendMessage(from, { text: "❌ Invalid expression!" });
    }
  },
};
