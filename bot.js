const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');

// إعدادات البوت والـ API
const BOT_TOKEN = '8302961701:AAHx7GxSuf7LYkDymcARX7zf1OJWwaF22Jk';
const RAPID_API_KEY = '54727bcc36mshd5961b197b6e6e6p14a500jsn6596db77474f';
const bot = new Telegraf(BOT_TOKEN);

// دالة جلب إيميل حقيقي وتلقي الكود (تلقائياً)
async function createAndVerifyEmail() {
    try {
        // 1. طلب إيميل جديد
        const res = await axios.post('https://temp-mail44.p.rapidapi.com/api/v3/email/new', 
        { key1: 'value' }, 
        { headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'temp-mail44.p.rapidapi.com' } });
        
        return res.data.email;
    } catch (e) { return null; }
}

// قائمة الأزرار الرئيسية باللغة الإنجليزية
const mainMenu = Markup.keyboard([
    ['🚀 Start Auto Create', '🌐 Import Proxies'],
    ['📊 View Accounts', '👨‍💻 Developer: Dexr'],
    ['⚙️ Settings']
]).resize();

bot.start((ctx) => ctx.reply('Welcome Dexr! System is Ready to mass create.', mainMenu));

// 1. خيار الإنشاء التلقائي (العملية الكاملة)
bot.hears('🚀 Start Auto Create', async (ctx) => {
    ctx.reply('🔄 Initializing Request Engine...');
    const email = await createAndVerifyEmail();
    if (!email) return ctx.reply('❌ Mail API Error!');

    ctx.reply(`📧 Email Generated: ${email}\n⏳ Waiting for Instagram OTP...`);
    
    // هنا نضع دالة الـ Request التي ترسل البيانات لإنستغرام مباشرة
    // بمجرد وصول الكود، سيتم حفظ الحساب في accounts.txt
});

// 2. خيار البروكسيات
bot.hears('🌐 Import Proxies', (ctx) => {
    ctx.reply('Please send your proxy list in format: IP:PORT:USER:PASS');
});

// 3. عرض الحسابات المحفوظة
bot.hears('📊 View Accounts', (ctx) => {
    if (fs.existsSync('accounts.txt')) {
        const data = fs.readFileSync('accounts.txt', 'utf8');
        ctx.reply(`✅ Created Accounts:\n\n${data}`);
    } else {
        ctx.reply('📭 No accounts created yet.');
    }
});

// 4. المطور
bot.hears('👨‍💻 Developer: Dexr', (ctx) => ctx.reply('This Bot was developed by: Dexr'));

bot.launch();
console.log("Bot is running...");