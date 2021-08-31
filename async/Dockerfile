FROM node:12.22.3-alpine

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package*.json yarn.lock ./

RUN yarn

COPY . .

RUN npm run build

EXPOSE 4000

CMD [ "yarn", "start" ]
