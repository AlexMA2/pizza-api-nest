# ─────────────────────────────────────────────────────────────────
# MULTI-STAGE DOCKERFILE FOR PRODUCTION-READY NESTJS APP
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: Build the source code ────────────────────────────────
FROM node:22-alpine AS builder

# Install pnpm globally for package management
RUN npm install -g pnpm@9

WORKDIR /usr/src/app

# Copy lockfile and package dependencies definition first to cache layer
COPY package.json pnpm-lock.yaml ./

# Build dependencies installation including development packages
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Compile application into JavaScript inside 'dist' directory
RUN pnpm run build

# ── Stage 2: Install ONLY production dependencies ─────────────────
FROM node:22-alpine AS dependencies

RUN npm install -g pnpm@9
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

# Install only the dependency packages needed for execution to limit bundle size
RUN pnpm install --prod --frozen-lockfile

# ── Stage 3: Lightweight runner image ─────────────────────────────
FROM node:22-alpine AS runner

# Set production environment variables
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Hardened security: Run container using non-root user 'node' instead of root!
USER node

# Copy built code from the build stage
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
# Copy production dependencies only from dependencies stage
COPY --chown=node:node --from=dependencies /usr/src/app/node_modules ./node_modules
# Copy config descriptors
COPY --chown=node:node --from=builder /usr/src/app/package.json ./package.json

# Expose server listener port
EXPOSE 3000

# Docker-native Health Check to monitor container lifecycle
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the compiled production NestJS server
CMD ["node", "dist/main"]
