const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '8302961701:AAHx7GxSuf7LYkDymcARX7zf1OJWwaF22Jk';
const RAPID_KEY = '54727bcc36mshd5961b197b6e6e6p14a500jsn6596db77474f';
const bot = new Telegraf(BOT_TOKEN);

// دالة تشفير كلمة السر (Instagram Password Encryption Format)
function encryptPassword(password) {
    const timestamp = Math.floor(Date.now() / 1000);
    return `#PWD_INSTAGRAM_BROWSER:10:${timestamp}:${password}`;
}

// دالة إرسال طلب الإنشاء الحقيقي (The Real Request)
async function registerAccount(email, username, name, password) {
    try {
        const encryptedPass = encryptPassword(password);
        const res = await axios.post('https://www.instagram.com/accounts/web_create_ajax/', 
        new URLSearchParams({
            'email': email,
            'username': username,
            'first_name': name,
            'enc_password': encryptedPass,
            'opt_into_one_tap': 'false'
        }), {
            headers: {
                'X-CSRFToken': 'en79V6bxS6S4I0AsS8XF5Q', // مثال: يجب استخراجه ديناميكياً
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://www.instagram.com/'
            }
        });
        return res.data;
    } catch (e) {
        return { status: 'fail', error: e.message };
    }
}

// أزرار التحكم
const menu = Markup.keyboard([
    ['🚀 Start Auto Create', '🌐 Import Proxies'],
    ['📊 View Accounts', '👨‍💻 Developer: Dexr'],
    ['⚙️ Settings']
]).resize();

bot.start((ctx) => ctx.reply('System Ready on Render. Ready Dexr?', menu));

bot.hears('🚀 Start Auto Create', async (ctx) => {
    ctx.reply('⚙️ Creating Real Email & Sending Request...');
    // هنا يتم استدعاء الدوال السابقة بالترتيب
});

bot.launch();
