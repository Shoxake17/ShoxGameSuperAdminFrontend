# 1-bosqich: Build qilish (Qurish jarayoni)
FROM node:20-alpine AS build

# Build argumentlarini e'lon qilamiz (GitHub Actions Secrets-dan keladi)
ARG VITE_BACKEND_URL
ARG VITE_SUPER_BACKEND_URL
ARG VITE_SUPER_SECRET_KEY
ARG VITE_SHOXPAY_URL

# Vite build vaqtida ushbu o'zgaruvchilarni kod ichiga joylashi uchun ENV-ga yuklaymiz
# DIQQAT: Ismlar GitHub Secrets va vite.config.js dagi bilan bir xil bo'lishi shart!
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SUPER_BACKEND_URL=$VITE_SUPER_BACKEND_URL
ENV VITE_SUPER_SECRET_KEY=$VITE_SUPER_SECRET_KEY
ENV VITE_SHOXPAY_URL=$VITE_SHOXPAY_URL

WORKDIR /app

# Keshdan samarali foydalanish uchun avval packagelarni o'rnatamiz
COPY package*.json ./
RUN npm install

# Loyiha kodini to'liq nusxalaymiz
COPY . .

# Static fayllarni (dist papkasini) hosil qilamiz
# Shu nuqtada Vite barcha ENV-larni kod ichiga "yopishtiradi"
RUN npm run build

# 2-bosqich: Nginx orqali xizmat ko'rsatish (Production)
FROM nginx:stable-alpine

# Build qilingan tayyor fayllarni Nginx papkasiga o'tkazamiz
COPY --from=build /app/dist /usr/share/nginx/html

# SPA (Single Page Application) yo'naltirishlarini to'g'rilash:
# Refresh qilinganda 404 chiqmasligi uchun index.html-dan nusxa olamiz
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/404.html

# Nginx portini ochamiz
EXPOSE 80

# Nginx-ni ishga tushirish
CMD ["nginx", "-g", "daemon off;"]