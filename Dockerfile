# اختيار بيئة نود خفيفة
FROM node:18-slim

# تحديد مجلد العمل داخل السيرفر
WORKDIR /app

# نسخ ملف package.json فقط أولاً
COPY package.json ./

# تثبيت المكتبات وتجاهل ملف القفل (حل مشكلتك)
RUN npm install --no-package-lock

# نسخ باقي ملفات البوت
COPY . .

# أمر تشغيل البوت النهائي
CMD ["node", "bot.js"]
