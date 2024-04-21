FROM node:18.11-alpine AS BUILDER

WORKDIR /user/src/app

COPY . .

RUN yarn install --prod

FROM node:18.11-alpine

WORKDIR /user/src/app

COPY --from=BUILDER /user/src/app .

ENV DB_HOST=db

ENV PORT=8000
EXPOSE 8000

CMD [ "yarn", "start"]