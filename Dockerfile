FROM node:20-alpine

RUN mkdir /app

WORKDIR /app

COPY . /app

RUN npm ci

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
