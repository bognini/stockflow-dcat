FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Étape 1: Étape de dépendances
FROM base AS dependency-stage
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

# Étape 2: Étape de construction
FROM base AS build-stage
COPY --from=dependency-stage /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Étape 3: Étape de migration Prisma
FROM base AS migration-stage
COPY --from=dependency-stage /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

# Étape 4: Étape d'exécution de production
FROM base AS runner-stage

# Créer un utilisateur et un groupe non-root
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build-stage /app/public ./public
COPY --from=build-stage --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build-stage --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
