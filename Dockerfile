FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production --no-package-lock
COPY . .
CMD ["node", "bot.js"]
