FROM node:24-alpine AS BUILDER

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* .npmrc* ./

RUN pnpm install --frozen-lockfile

COPY . .

FROM node:24-alpine

WORKDIR /app

# Install pnpm in final image
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=BUILDER /app/node_modules ./node_modules
COPY --from=BUILDER /app/package.json ./package.json
COPY --from=BUILDER /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=BUILDER /app/.npmrc* ./
COPY . .

ENV PORT=8000

EXPOSE 8000 9229

CMD [ "pnpm", "start"]
