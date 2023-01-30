# Install all node_modules and build the project
FROM node:16.19.0-alpine as builder
WORKDIR /app

RUN apk add --no-cache make gcc g++ python3 libtool autoconf automake openssl1.1-compat
COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . .
RUN yarn build

EXPOSE 3000
#
# If possible, run your container using `docker run --init`
# Otherwise, you can use `tini`:
# RUN apk add --no-cache tini

# ENTRYPOINT ["/sbin/tini", "--"]

CMD ["./node_modules/.bin/blitz", "start"]
