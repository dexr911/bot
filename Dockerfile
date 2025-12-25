# استخدام نسخة Node المستقرة
FROM node:18-slim

# إنشاء مجلد العمل
WORKDIR /usr/src/app

# نسخ ملفات التوصيف أولاً لتسريع البناء
COPY package*.json ./

# تثبيت المكتبات وتجاهل ملف القفل
RUN npm install --no-package-lock

# نسخ باقي ملفات المشروع
COPY . .

# تشغيل البوت
CMD [ "node", "bot.js" ]
