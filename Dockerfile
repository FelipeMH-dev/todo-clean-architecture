FROM node:20-alpine

WORKDIR /app


RUN corepack enable && apk add --no-cache netcat-openbsd


COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY . .


RUN yarn build

COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

CMD ["sh", "start.sh"]