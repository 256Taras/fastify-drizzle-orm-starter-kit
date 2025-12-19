FROM node:25-alpine AS builder

WORKDIR /app

# Install pnpm with fixed version
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml .npmrc* ./

RUN pnpm install --frozen-lockfile

# Copy source code
COPY src ./src
COPY configs ./configs
COPY infra/database ./infra/database
COPY tsconfig.json ./

FROM node:25-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy only what's needed from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/configs ./configs
COPY --from=builder /app/infra/database ./infra/database
COPY --from=builder /app/tsconfig.json ./

ENV PORT=8000

EXPOSE 8000 9229

CMD ["pnpm", "start"]
