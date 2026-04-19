FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all deps (including devDeps for build)
RUN npm ci

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Remove devDeps after build
RUN npm prune --production

EXPOSE 3001

# Serve both: Express serves the built frontend + API
CMD ["node", "server/index.js"]
