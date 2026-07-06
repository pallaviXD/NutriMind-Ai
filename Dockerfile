FROM node:20-slim

WORKDIR /app

COPY package*.json ./

# Install all deps (devDeps needed for Vite build)
RUN npm ci

COPY . .

# Build the React frontend
RUN npm run build

# Drop devDeps after build — no native modules so no rebuild needed
RUN npm prune --production

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
