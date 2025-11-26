# `backend/Dockerfile`
FROM node:18-bullseye-slim

WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement les manifests puis installer dans l'image
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --production; fi

# Copier le reste du projet (node_modules sera exclu par .dockerignore)
COPY . .

RUN mkdir -p /app/data

EXPOSE 4000
CMD ["npm", "start"]

# Si le problème persiste, décommentez la ligne suivante pour reconstruire sqlite3 depuis les sources
# RUN npm rebuild sqlite3 --build-from-source || true
