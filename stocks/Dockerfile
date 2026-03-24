# --- Stage 1: Builder ---
FROM node:25.8.1-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- Stage 2: Production Runner ---
FROM node:25.8.1-alpine AS runner

USER node
WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# --- Stage 3: Run Application ---
EXPOSE 3000

CMD ["node", "dist/server.js"]