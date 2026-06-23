# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install all deps (dev included) — skip lifecycle scripts to avoid premature build
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Compiled JS from builder
COPY --from=builder /app/dist ./dist

# tsconfig is required by tsconfig-paths/register at runtime
COPY tsconfig.json ./

# Email templates are loaded at runtime from the source tree
COPY email ./email

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]
