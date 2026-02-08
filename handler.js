const fs = require('fs');
const path = require('path');
const settings = require('./settings');
//© 𝙰𝚕𝚙𝚑𝚊 𝚅𝚒𝚜𝚒𝚘𝚗 𝙸𝚗𝚏𝚒𝚗𝚒𝚝𝚢
const color = {
    cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', 
    magenta: '\x1b[35m', reset: '\x1b[0m', bold: '\x1b[1m'
};

// Database
const dbPath = path.join(__dirname, './system/database.json');

const handler = async (Avi, chat) => {
    try {
        const m = chat.messages[0];
        if (!m.message) return;

        // 🗄️ Database Load 
        if (!fs.existsSync(dbPath)) {
            // Folder 
            if (!fs.existsSync('./system')) fs.mkdirSync('./system');
            fs.writeFileSync(dbPath, JSON.stringify({ users: {}, groups: {}, settings: {} }, null, 2));
        }
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        const from = m.key.remoteJid;
        const senderName = m.pushName || "User";
        const isGroup = from.endsWith('@g.us');
        
        // 🛡️ Anti-Delete Logic
        if (m.message.protocolMessage && m.message.protocolMessage.type === 0) {
            const key = m.message.protocolMessage.key;
            console.log(`${color.magenta}⚠️ [MESSAGE DELETED]${color.reset} Identifying deleted message...`);
            // logs showing.
        }

        if (m.key.fromMe) return; // බොට්ගේම මැසේජ් වලට ප්‍රතිචාර නොදැක්වීමට

        const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const prefix = /^[./!#]/.test(body) ? body[0] : '#';
        
        // Prefix නැතුව වැඩ කරන 'hi' වැනි වචන හඳුනාගැනීම
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : body.trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // Group Admin Checks
        let isBotAdmin = false;
        let isSenderAdmin = false;
        if (isGroup) {
            try {
                const groupMetadata = await Avi.groupMetadata(from);
                const admins = groupMetadata.participants.filter(v => v.admin !== null).map(v => v.id);
                const botNumber = Avi.user.id.split(':')[0] + '@s.whatsapp.net';
                isBotAdmin = admins.includes(botNumber);
                isSenderAdmin = admins.includes(m.key.participant || from);
            } catch (e) { /* Metadata error */ }
        }

        // Professional Console Log
        console.log(`${color.cyan}╭───────────────────────────────────────────${color.reset}`);
        console.log(`${color.green}📩 [NEW MESSAGE]${color.reset}`);
        console.log(`${color.yellow}👤 From: ${color.reset}${color.bold}${senderName}${color.reset}`);
        console.log(`${color.yellow}📍 Chat: ${color.reset}${isGroup ? 'Group' : 'Private'}`);
        console.log(`${color.yellow}💬 Msg : ${color.reset}${body || 'Media Content'}`);
        console.log(`${color.cyan}╰───────────────────────────────────────────${color.reset}`);
        
    //© 𝙰𝚕𝚙𝚑𝚊 𝚅𝚒𝚜𝚒𝚘𝚗 𝙸𝚗𝚏𝚒𝚗𝚒𝚝𝚢    
        
// --- [ Anti-Delete logic ] ---
if (!Avi.store) Avi.store = {}; // මැසේජ් තාවකාලිකව තියාගන්න තැනක්
if (!Avi.store[from]) Avi.store[from] = [];

// මැසේජ් එකක් මැකුවොත් (Protocol Message)
if (m.message.protocolMessage && m.message.protocolMessage.type === 0) {
    const key = m.message.protocolMessage.key;
    const deletedMsg = Avi.store[from].find(msg => msg.key.id === key.id);

    if (deletedMsg) {
        const sender = deletedMsg.pushName || "Unknown User";
        const textMsg = deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text || "Media Message (Image/Video/Sticker)";

        let antiDelCaption = `*── 「 ANTI DELETE DETECTED 」 ──*\n\n` +
                             `👤 *Sender:* ${sender}\n` +
                             `💬 *Message:* ${textMsg}\n` +
                             `📍 *Chat:* ${isGroup ? 'Group' : 'Private'}`;

        // forward deleted message 
        await Avi.sendMessage(from, { text: antiDelCaption }, { quoted: deletedMsg });
        await Avi.copyNForward(from, deletedMsg, false); // මැකුණු දේ ආපහු යැවීම
        console.log(`${color.red}⚠️ [ANTI-DELETE] Message from ${sender} recovered!${color.reset}`);
    }
}

// Ram Message storage
if (body) {
    Avi.store[from].push(m);
    if (Avi.store[from].length > 50) Avi.store[from].shift(); // cash delete
}



        // Pass to Switch Statement (avi.js)
        const { avi } = require('./avi');
        await avi(Avi, m, { from, isGroup, body, prefix, command, args, isBotAdmin, isSenderAdmin, db });

    } catch (err) { console.log(err); }
};

module.exports = { handler };
