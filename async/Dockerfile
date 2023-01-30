FROM node:16.19.0-alpine

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

RUN apk add --no-cache openssl1.1-compat
COPY package*.json yarn.lock ./

RUN yarn install --pure-lockfile

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "yarn", "start" ]
