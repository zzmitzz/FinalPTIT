# ========================
# Stage 1: Install deps
# ========================
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ bash git libc-dev
COPY package*.json ./
RUN npm ci

# ========================
# Stage 2: Build project
# ========================
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++ bash git libc-dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ========================
# Stage 3: Production image
# ========================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/build ./build
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/package.json ./
EXPOSE 3456
CMD ["node", "build/main.js"]
