# Install all node_modules and build the project
FROM node:12.22.3-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN apk add --no-cache make gcc g++ python3 libtool autoconf automake
RUN yarn install --pure-lockfile

COPY . .
RUN yarn build

EXPOSE 3000

CMD ["./node_modules/.bin/blitz", "start"]
