FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

# Cloud Run injects PORT env var — don't hardcode it
EXPOSE 8080

CMD ["node", "server/index.js"]
