FROM node:18-alpine AS build

WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json* ./
RUN npm install

# Copier le code source et builder
COPY . .
RUN npm run build

# Étape runtime avec Nginx
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html

# Config Nginx basique pour SPA (fallback sur index.html)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


