FROM node:22-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production and build dependencies
RUN npm ci

# Copy full source
COPY . .

# Build client production bundle
RUN npm run build

# Expose server port (Render / Railway / Cloud providers set $PORT)
ENV PORT=3001
EXPOSE 3001

CMD ["npx", "tsx", "server/index.ts"]
