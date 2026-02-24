# Dockerfile per deploy con Poppler (PDF→Immagini)
# Usa con: Railway, Render, Fly.io

FROM node:20-slim

# Installa Poppler per pdf-poppler
RUN apt-get update && apt-get install -y poppler-utils && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
