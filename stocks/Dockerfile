FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:22-alpine AS runner

# Best Practice: Run as a non-root user for security
USER node
WORKDIR /app

ENV NODE_ENV=production

# Only copy production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JS files from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start the server using the compiled JS
CMD ["node", "dist/server.js"]