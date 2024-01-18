FROM node:19-alpine as builder

WORKDIR /usr/bot

COPY src src
COPY prisma prisma 
COPY data data
COPY package.json package-lock.json config.swcrc .env start.sh ./
RUN chmod +x start.sh
RUN npm i -g @swc/cli @swc/core
RUN npm install && npm run build

FROM node:19-alpine

WORKDIR /usr/bot
COPY --from=builder /usr/bot/dist /usr/bot/dist
COPY --from=builder /usr/bot/prisma /usr/bot/prisma
COPY --from=builder /usr/bot/data /usr/bot/data
COPY --from=builder /usr/bot/package.json ./
COPY --from=builder /usr/bot/package-lock.json ./
COPY --from=builder /usr/bot/.env ./
COPY --from=builder /usr/bot/start.sh ./
    
RUN npm i
CMD /usr/bot/start.sh