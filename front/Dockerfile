FROM node:18.18.0
WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]