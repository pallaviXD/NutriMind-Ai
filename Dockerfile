FROM node:20-slim

# Install build tools needed for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install all deps and rebuild native modules for this platform
RUN npm ci

COPY . .

# Build frontend
RUN npm run build

# Rebuild native modules for production
RUN npm rebuild better-sqlite3

# Remove dev deps
RUN npm prune --production && npm rebuild better-sqlite3

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
