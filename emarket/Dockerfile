FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Dependency stage
FROM base AS dependency-stage
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

# Build stage
FROM base AS build-stage
COPY --from=dependency-stage /app/node_modules ./node_modules
COPY . .
# Provide dummy DATABASE_URL for build (Prisma needs it for type generation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm run build

# Production runner
FROM base AS runner-stage

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build-stage /app/public ./public
COPY --from=build-stage --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build-stage --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "server.js"]
