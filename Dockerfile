FROM node:20-slim

# Install build tools needed for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install all deps (including devDeps needed for Vite build)
RUN npm ci

COPY . .

# Build the React frontend
RUN npm run build

# Strip dev dependencies, then rebuild native modules for the production runtime
RUN npm prune --production && npm rebuild better-sqlite3

# PORT is set by the platform (Render: 10000, Cloud Run: 8080, local: 3001)
EXPOSE ${PORT:-8080}

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
