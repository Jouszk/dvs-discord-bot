FROM node:19-alpine as builder
WORKDIR /usr/bot

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY src src
COPY prisma prisma 
COPY assets assets
COPY package.json package-lock.json config.swcrc .env.prod start.sh ./
RUN chmod +x start.sh
RUN npm i -g @swc/cli @swc/core
RUN npm install && npm run build

FROM node:19-alpine
WORKDIR /usr/bot
COPY --from=builder /usr/bot/dist /usr/bot/dist
COPY --from=builder /usr/bot/prisma /usr/bot/prisma
COPY --from=builder /usr/bot/assets /usr/bot/assets
COPY --from=builder /usr/bot/package.json ./
COPY --from=builder /usr/bot/package-lock.json ./
COPY --from=builder /usr/bot/.env.prod ./
COPY --from=builder /usr/bot/start.sh ./

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake
    
RUN npm i
CMD /usr/bot/start.sh