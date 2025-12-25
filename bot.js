const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const http = require('http');

// سيرفر لبقاء البوت حياً
http.createServer((req, res) => { res.end('Engine Running'); }).listen(process.env.PORT || 8080);

const BOT_TOKEN = '8302961701:AAHx7GxSuf7LYkDymcARX7zf1OJWwaF22Jk';
const bot = new Telegraf(BOT_TOKEN);

let proxyList = [];
let workingProxies = [];

// --- 1. دوال إنستغرام الحقيقية ---

async function getInstagramSession(agent) {
    try {
        const response = await axios.get('https://www.instagram.com/accounts/emailsignup/', {
            httpAgent: agent, httpsAgent: agent,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0' }
        });
        const csrf = response.headers['set-cookie'].find(c => c.includes('csrftoken')).split('csrftoken=')[1].split(';')[0];
        return csrf;
    } catch (e) { return null; }
}

async function createIG(email, user, pass, name, proxy) {
    const agent = new HttpsProxyAgent(`http://${proxy}`);
    const csrf = await getInstagramSession(agent);
    
    if (!csrf) return { success: false, msg: "Failed to get CSRF" };

    const data = new URLSearchParams({
        'email': email, 'enc_password': `#PWD_INSTAGRAM_BROWSER:10:${Math.floor(Date.now()/1000)}:${pass}`,
        'username': user, 'first_name': name, 'client_id': '', 'seamless_login_enabled': '1'
    });

    try {
        const res = await axios.post('https://www.instagram.com/accounts/web_create_ajax/', data, {
            httpAgent: agent, httpsAgent: agent,
            headers: {
                'x-csrftoken': csrf,
                'x-ig-app-id': '936619743392459',
                'Referer': 'https://www.instagram.com/accounts/emailsignup/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0'
            }
        });
        return { success: true, data: res.data };
    } catch (e) {
        return { success: false, msg: e.response ? JSON.stringify(e.response.data) : e.message };
    }
}

// --- 2. لوحة التحكم ---

bot.start((ctx) => {
    ctx.reply(`🚀 Dexr Engine Loaded!\nProxies: ${workingProxies.length}`, Markup.keyboard([
        ['🚀 Create Account', '🌐 Proxy Settings'],
        ['📊 Status', '🧹 Reset List']
    ]).resize());
});

bot.hears('🌐 Proxy Settings', (ctx) => {
    ctx.reply('Send your proxy list (IP:PORT) or use buttons:', Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Check Proxies', 'check')],
        [Markup.button.callback('📋 View Working', 'view')]
    ]));
});

// استقبال البروكسيات
bot.on('text', async (ctx, next) => {
    if (ctx.message.text.includes(':')) {
        const list = ctx.message.text.split('\n').filter(i => i.includes(':'));
        proxyList = [...new Set([...proxyList, ...list])];
        return ctx.reply(`✅ Received ${list.length} proxies.`);
    }
    return next();
});

bot.action('check', async (ctx) => {
    ctx.answerCbQuery('Checking...');
    ctx.reply('🔍 Testing proxies against Instagram...');
    workingProxies = [];
    for (let p of proxyList) {
        try {
            const agent = new HttpsProxyAgent(`http://${p}`);
            await axios.get('https://www.instagram.com', { httpAgent: agent, httpsAgent: agent, timeout: 3000 });
            workingProxies.push(p);
        } catch {}
    }
    ctx.reply(`✅ Done! Working: ${workingProxies.length}`);
});

bot.hears('🚀 Create Account', async (ctx) => {
    if (workingProxies.length === 0) return ctx.reply('❌ No working proxies! Add and check first.');
    
    const p = workingProxies[Math.floor(Math.random() * workingProxies.length)];
    ctx.reply(`⚙️ Using Proxy: ${p}\nAttempting to create account...`);
    
    // بيانات تجريبية (يجب جعلها عشوائية)
    const res = await createIG(`dexr${Math.random()}@gmail.com`, `dexr_${Date.now()}`, 'Pass@12345', 'Dexr Bot', p);
    ctx.reply(res.success ? '🎉 Account Created!' : `❌ Error: ${res.msg}`);
});

bot.launch();
