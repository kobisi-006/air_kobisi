module.exports = {
    name: 'sendlinks',
    description: 'Tuma link uliyoandika baada ya command mara 50 kwa sekunde 2',
    async execute(sock, m, args) {
        // Angalia kama user ameweka link
        if (!args[0]) {
            return await sock.sendMessage(m.key.remoteJid, { text: '❌ Tafadhali weka link baada ya command.\nMfano: !sendlinks https://example.com' });
        }

        const linkToSend = args[0]; // Link kutoka command
        const repeatCount = 50;      // Idadi ya kurudia
        const groupId = m.key.remoteJid;

        await sock.sendMessage(groupId, { text: `⌛ Kuanzia kutuma link uliyoandika ${repeatCount} mara kwenye group hii...` });

        for (let i = 0; i < repeatCount; i++) {
            await sock.sendMessage(groupId, { text: `${i + 1}. ${linkToSend}` });

            // Delay ya sekunde 2
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await sock.sendMessage(groupId, { text: `✅ Link imetumwa mara ${repeatCount} kwenye group hii` });
    }
};
