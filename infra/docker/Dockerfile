FROM node:18.11-alpine AS BUILDER

WORKDIR /user/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* .npmrc* ./

RUN pnpm install --prod --frozen-lockfile

COPY . .

FROM node:18.11-alpine

WORKDIR /user/src/app

# Install pnpm in final image
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=BUILDER /user/src/app .

ENV DB_HOST=db

ENV PORT=8000
EXPOSE 8000

CMD [ "pnpm", "start"]