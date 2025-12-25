const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

// سيرفر وهمي لضمان بقاء الخدمة Healthy على Koyeb
http.createServer((req, res) => { res.write('System Online'); res.end(); }).listen(process.env.PORT || 8080);

const BOT_TOKEN = '8302961701:AAHx7GxSuf7LYkDymcARX7zf1OJWwaF22Jk';
const RAPID_KEY = '54727bcc36mshd5961b197b6e6e6p14a500jsn6596db77474f';
const bot = new Telegraf(BOT_TOKEN);

// --- المحرك الحقيقي: دالة جلب إيميل مؤقت ---
async function getTempEmail() {
    const options = {
        method: 'GET',
        url: 'https://temp-mail44.p.rapidapi.com/api/v3/email/new',
        headers: { 'X-RapidAPI-Key': RAPID_KEY, 'X-RapidAPI-Host': 'temp-mail44.p.rapidapi.com' }
    };
    const res = await axios.request(options);
    return res.data.email;
}

// --- المحرك الحقيقي: إرسال طلب التسجيل لإنستغرام ---
async function signupInstagram(email, username, password, name) {
    const timestamp = Math.floor(Date.now() / 1000);
    const enc_password = `#PWD_INSTAGRAM_BROWSER:10:${timestamp}:${password}`;

    const headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded',
        'x-csrftoken': 'missing', // سيتم جلبها ديناميكياً في التطوير المتقدم
        'x-ig-app-id': '936619743392459',
        'x-instagram-ajax': '1',
        'x-requested-with': 'XMLHttpRequest',
        'Referer': 'https://www.instagram.com/accounts/emailsignup/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    };

    const data = new URLSearchParams({
        'email': email,
        'enc_password': enc_password,
        'username': username,
        'first_name': name,
        'client_id': 'missing',
        'seamless_login_enabled': '1',
        'opt_into_one_tap': 'false'
    });

    try {
        const response = await axios.post('https://www.instagram.com/accounts/web_create_ajax/', data, { headers });
        return response.data;
    } catch (error) {
        return error.response ? error.response.data : error.message;
    }
}

// --- واجهة المستخدم ---
bot.start((ctx) => ctx.reply('🚀 Dexr Engine V1 Ready!', Markup.keyboard([['🚀 Create Account']]).resize()));

bot.hears('🚀 Create Account', async (ctx) => {
    ctx.reply('📨 Generating Email...');
    try {
        const email = await getTempEmail();
        ctx.reply(`✅ Email Created: ${email}\n⚙️ Sending Signup Request...`);
        
        // محاكاة البيانات (يجب جعلها عشوائية في الإنتاج)
        const result = await signupInstagram(email, 'dexr_' + Math.floor(Math.random()*1000), 'Dexr@Pass123', 'Dexr Bot');
        
        if (result.account_created === false) {
            ctx.reply(`❌ Instagram rejected: ${result.errors ? JSON.stringify(result.errors) : 'Security Block'}`);
        } else {
            ctx.reply('🎉 Success! Check OTP in your Temp Mail.');
        }
    } catch (e) {
        ctx.reply('⚠️ Error: ' + e.message);
    }
});

bot.launch();
